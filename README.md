# VMRB 医疗平台

病历数据中心 + 医学影像分割服务 + 器官病历接口 + 医疗 AI 问答。

已整合 `medical-platform/Medical` 的 Vue3、TypeScript、Pinia、Vite 前端，保留 PulmoLink 界面并接入真实后端。后端使用 Python、FastAPI、Uvicorn、SQLAlchemy、Alembic 和 PostgreSQL；部署提供 Docker Compose 和 nginx。分割模型保持独立、不作改动。22 个业务接口统一使用 `/api/v1`、JWT Bearer 和 `{code, message, data}`。图片和 GLB 文件返回二进制。

## 查看前后端效果（Windows）

当前电脑已安装依赖。在项目根目录执行：

```powershell
.\scripts\start-preview.ps1
# 停止前端、后端和独立预览数据库，保留演示数据：
.\scripts\stop-preview.ps1
```

打开 [前端预览](http://127.0.0.1:4173) 或 [后端 API 文档](http://127.0.0.1:8000/docs)。登录页的 Doctor Portal / Patient Portal 按钮会使用以下演示账号进行真实登录：

| 角色 | 用户名 | 密码 |
| --- | --- | --- |
| 医生 | `demo_doctor` | `DemoDoctor123!` |
| 患者 | `demo_patient` | `DemoPatient123!` |

预览使用独立 PostgreSQL 数据库 `vmrb_preview`（本机端口 55440），文件、数据库和日志均在忽略提交的 `.cache/preview/`；不会覆盖 `backend/.env`。三个演示患者、病历、NIfTI 影像和默认器官 GLB 均为合成样例，GLB 只是几何示意。演示账号只由受限的 `app.demo` 脚本建立，正式 Docker 启动不创建这些账号。前端快捷登录按钮只在 `VITE_PREVIEW=true` 时显示。

医生可查看授权患者、用姓名和身份证核验查询、增改/软删除病历、上传 CT/MRI NIfTI、查看切片、发起分割和读取任务进度。患者可查看自己的病历、影像、器官模型并发起辅助问答。病历与影像分别读取，器官页显示真实分割模型或默认模型来源。原有 mock 数据文件保留在前端源码中，但运行页面不再读取它们。

AI 服务和真实模型需要按下文配置。未配置时接口返回明确的 503 提示，不生成模拟 AI 回答或分割结果。当前预览可直接使用合成影像查看切片、默认 GLB 和数据库读写效果。

首次在其他机器安装：先按后端说明执行 `uv sync --locked` 和 `init-config`，再在 `medical-platform/Medical` 执行 `pnpm install --frozen-lockfile`。Windows 预览脚本默认使用 PostgreSQL 18 的标准安装位置。手动启动前端可运行 `pnpm dev --host 127.0.0.1 --port 4173`；Vite 将 `/api` 代理到本机 8000 端口，支持用 `VMRB_BACKEND_URL` 覆盖。生产构建命令为 `pnpm build`。

## 本地启动

需要 Python 3.11–3.14、uv 和 PostgreSQL。推荐 Python 3.12；GPU 推理的依赖另行安装。

```powershell
cd backend
uv sync --locked
uv run python -m app.cli init-config
# 编辑 .env 中 DATABASE_URL，指定已创建的 PostgreSQL 数据库
uv run alembic upgrade head
uv run uvicorn app.main:create_app --factory --host 127.0.0.1 --port 8000 --workers 1 --no-access-log
```

`init-config` 生成独立随机的 JWT、身份证加密和 HMAC 密钥，拒绝覆盖已存在的 `.env`。本次开发已在本地生成 `backend/.env`，之后直接编辑即可。模板为 [backend/.env.example](backend/.env.example)，其中 AI 配置留空。不要将 `.env` 提交到 Git。数据库不会在应用启动时自动建表，先执行 Alembic 迁移。

- Swagger：`http://127.0.0.1:8000/docs`
- OpenAPI：`http://127.0.0.1:8000/openapi.json`
- 健康检查：`http://127.0.0.1:8000/health`

Swagger 的 Authorize 填入登录返回的 access token。用户名 3–64 个字符，允许字母、数字、中文、下划线、点和连字符；密码 8–128 字符。角色只允许 `doctor` 和 `patient`。注册患者时建立空的患者档案，后续由可信操作员核实身份后补全。

## Docker 启动

1. 将根目录 `.env.example` 复制为 `.env`，填写 `POSTGRES_PASSWORD`。使用随机的 URL 安全密码（字母、数字、`-`、`_`），避免数据库 URL 转义问题。
2. 按上一步创建并编辑 `backend/.env`。Compose 会覆盖其中的数据库地址和文件目录，AI 配置仍从此文件读取。
3. 在根目录执行：

```sh
docker compose up --build -d
```

访问 `http://127.0.0.1:8080` 查看前端，`http://127.0.0.1:8080/docs` 查看 API。nginx 镜像构建 Vue 静态资源，并在同一地址代理 FastAPI，支持前端路由刷新。PostgreSQL 和后端不发布宿主机端口；nginx 默认仅绑定本机。对外服务时配置域名、HTTPS 和明确的 CORS 来源。文件保存在 `medical-data` volume，数据库保存在 `postgres-data` volume。备份时应同时备份数据库、影像/模型 volume 和加密密钥。

当前任务调度只有一个 API 进程、一条推理执行线程，不增加 Redis/Celery。PostgreSQL advisory lock 会拒绝启动第二个使用相同数据库的 API 进程，避免后台任务重复执行或被另一进程误判中断。不要使用多 worker；需要扩容时应将任务执行移到独立 worker。

## 录入患者和授予医生访问权

业务 API 不允许用户自报身份证后认领已有病历，也不允许医生自行获得患者授权。第一版通过可信操作员 CLI 补齐这两个必要入口，之后可接入院内身份核验/授权流程。

先通过注册 API 建立医生 `doctor_a` 和患者 `patient_a`，再在 `backend` 目录执行：

```sh
uv run python -m app.cli provision-patient --username patient_a --name 张三 --birth-date 1980-01-01 --gender male --height 175 --weight 70 --blood-type A
# 在隐藏输入提示中填写身份证号；命令会输出 patient_id
uv run python -m app.cli grant-access --doctor doctor_a --patient-id 1
uv run python -m app.cli revoke-access --doctor doctor_a --patient-id 1
```

Docker 中使用 `docker compose exec backend python -m app.cli ...`。身份证只存 Fernet 密文和带独立密钥的 HMAC-SHA256 查询索引。身份证不会出现在响应或 URL；nginx access log 不包含请求体、查询字符串和认证头。密码使用 Argon2id。授权撤销后，每次后续请求都会重新检查数据库授权。

医生仅能查阅、创建、修改已授权患者的数据；患者仅能查看自己的数据和发起辅助问答。病历创建、修改、软删除、患者核验、授权变更、影像上传、分割和 AI 调用会写入 `audit_events`。病历修改和删除保留前后快照；此表仅供可信操作员访问，没有公开的审计读取接口。

## 22 个业务 API

| 方法 | 路径（均有 `/api/v1` 前缀） | 功能 |
| --- | --- | --- |
| POST | `/auth/register` | 注册，201 |
| POST | `/auth/login` | 登录 |
| GET | `/auth/me` | 当前用户 |
| POST | `/doctor/patients/resolve` | 姓名 + 身份证查找已授权患者 |
| GET | `/patients` | 分页列出授权患者；患者账号只返回本人 |
| GET | `/patients/{patient_id}/medical-images` | 分页列出患者影像 |
| GET | `/patients/{patient_id}/medical-records` | 分页列出患者未删除病历 |
| GET | `/patients/{patient_id}/overview` | 概览、器官病历/影像标记 |
| GET | `/patients/{patient_id}/organs/{organ_id}` | 器官、模型选择、最近 20 条病历 |
| GET | `/patients/{patient_id}/organs/{organ_id}/records` | 分页病史、日期筛选 |
| GET | `/medical-records/{record_id}` | 单条病历 |
| POST | `/patients/{patient_id}/medical-records` | 新增病历，201 |
| PATCH | `/medical-records/{record_id}` | 修改病历 |
| DELETE | `/medical-records/{record_id}` | 软删除，200 + data:null |
| POST | `/patients/{patient_id}/medical-images` | multipart 影像上传，201 |
| GET | `/medical-images/{image_id}` | 影像元数据 |
| GET | `/medical-images/{image_id}/slice/{slice_index}` | PNG 切片 |
| POST | `/medical-images/{image_id}/segmentation` | 创建分割任务，201 |
| GET | `/segmentation/tasks/{task_id}` | 任务状态和模型 ID |
| GET | `/organ-models/{model_id}` | GLB 元数据和受保护 URL |
| GET | `/organ-models/{model_id}/file` | 下载 GLB |
| POST | `/ai/chat` | 有引用的医疗辅助问答 |

分页参数：`page >= 1`、`1 <= page_size <= 100`（默认 20）、`start_date`、`end_date`（包含边界）。日期采用 ISO `YYYY-MM-DD`，开始日期不能晚于结束日期。分页返回 `items/page/page_size/total`；器官详情的记录数组有 `records_total`，完整历史从分页接口获取。

业务成功 JSON（包括 `/auth/me`）统一封装：

```json
{"code":0,"message":"success","data":{}}
```

错误返回标准 HTTP 状态和 `data:null`，不会回显密码、身份证、SQL 参数、文件路径或 AI 密钥。除了约定的 400/401/403/404/409/422/500，还使用 413（文件过大）、429（nginx 限流）、502（AI 返回无效结果或上游失败）、503（未配置服务）。

## 影像和切片

上传字段：`file`、`organ_id`、`image_type=CT|MRI`。首版支持 `.nii`、`.nii.gz` 三维标量 NIfTI，这与 NV-Segment-CT 的输入一致。DICOM 序列应先经可信工具转换为 NIfTI；当前接口明确拒绝 DICOM/ZIP、4D、无效/截断文件和超限体积。限制可通过 `.env` 调整，gzip 的解压体积也受限。原始文件名不入库，不作为磁盘路径。

切片索引从 0 开始，按 canonical RAS 的轴向由下向上。元数据里的 `shape/spacing/slice_count` 对应这套切片坐标；模型接收保留原始空间信息的文件。可以同时传入 `window_center` 和正数 `window_width` 调整窗宽窗位；不传时使用当前切片 1%–99% 灰度范围。PNG 是查看预览，不带姓名等信息。每次切片请求均做权限校验，原始 NIfTI 路径不会暴露。

## NV-Segment-CT 接入

模型链接：[NVIDIA NV-Segment-CT](https://huggingface.co/nvidia/NV-Segment-CT)。适配器调用其原始 `HuggingFacePipelineHelper`，使用官方器官类别 ID，将输出的目标器官标签转成二值 mask，再进行三维重建。不修改、训练或微调模型。

模型本身和权重未下载到本项目。请将完整仓库快照放到本地目录（包括 `hugging_face_pipeline.py`、`scripts/`、`metadata.json`、`vista3d_pretrained_model/` 和权重）。GPU 环境安装 [backend/requirements-nv.txt](backend/requirements-nv.txt)，根据设备选择匹配驱动的 PyTorch/CUDA 运行时，在 `backend/.env` 填写：

```dotenv
NV_SEGMENT_CT_DIR=/absolute/path/to/NV-Segment-CT
NV_SEGMENT_DEVICE=cuda:0
```

这些可选 GPU 依赖提供起始配置，真实权重推理仍需在目标 GPU 上验证。当前自动化测试使用明确标记的合成 mask，只验证任务和数据处理链路，不证明模型分割质量。

Docker GPU 运行需要 Linux NVIDIA Container Toolkit（或配置好的 WSL2 GPU 支持）。在根目录 `.env` 填入 `NV_SEGMENT_CT_HOST_DIR`，然后：

```sh
docker compose -f compose.yaml -f compose.gpu.yaml up --build -d
```

GPU 版本会挂载模型目录为只读；API 请求期间不自动下载模型。NV-Segment-CT 仅用于 CT 推理，MRI 可存储和浏览，发起 MRI 分割返回 400。官方将该模型定位于研究用途，不能将本项目测试或生成结果视为临床有效性验证。

若使用现有 Python 推理函数，设置 `SEGMENTATION_CALLABLE=your_module:infer`，它优先于 NVIDIA 适配器。函数签名：

```python
def infer(*, image_path: Path, organ_id: str, output_dir: Path, progress) -> Path:
    # 调用已有模型；progress(65) 可报告阶段进度。
    # 输出必须在 output_dir 内，为非空的二值 NIfTI mask（0/1）。
    # shape 和 affine 必须与原始 image_path 一致。
    return output_dir / "mask.nii.gz"
```

自定义函数可通过 `image_types = {"CT", "MRI"}` 属性或 `SEGMENTATION_IMAGE_TYPES` 明确声明支持范围。代码只从操作员配置的模块导入，客户端不能指定模块、命令或任意路径。

任务状态为 `queued/running/completed/failed`；进度是处理阶段进度，官方模型未提供细粒度百分比，因此推理期间可能停留在一个值。同一影像/器官不能同时创建两个活动任务，数据库唯一索引保证这一点。重启后重排 queued 任务，将遗留 running 任务标记失败，允许重新提交。成功保存 mask、GLB 和数据库关联；失败信息不包含模型异常中的敏感路径。第一版不提供强制终止 GPU 推理或自动无限重试。

GLB 使用 marching cubes，保留原始 affine 和体素尺寸，将空间单位转换为米，并将 RAS 转成 glTF 的 Y-up 坐标。NIfTI 未声明空间单位时按毫米处理，GLB 元数据记录此假设。客户端需要保持这一坐标变换以便叠加。

## 默认器官模型

没有真实分割结果时返回 `source:default` 和 `default_{organ_id}`。项目未附带解剖 GLB 资产，未安装时额外返回 `available:false`、模型元数据 `url:null`，下载接口返回 404，客户端据此显示资源未配置状态。

将已有的自包含解剖 GLB 导入：

```sh
uv run python -m app.cli install-default --organ lung --file /path/to/lung.glb
```

导入后使用同一个模型 API。默认资产要求缓冲区和贴图内嵌，无外部 URL。默认模型可供所有登录用户获取，患者分割模型只向本人及授权医生开放。

## AI 配置

在 `backend/.env` 填写：

```dotenv
AI_BASE_URL=https://your-provider.example/v1
AI_MODEL=your-model-name
AI_API_KEY=your-api-key
```

这里的地址需要兼容 `POST {AI_BASE_URL}/chat/completions` 和 `response_format:json_object`。没有预设服务地址或密钥；未填写返回 503。后端先检查授权，再获取该器官未删除病历、基本年龄/性别及影像/分割状态；不发送身份证字段、姓名字段、文件路径或原始影像。病历正文可能仍含人工录入的身份信息，因此应选择有权接收这些资料的服务，并按实际要求处理文本脱敏。

医生/患者使用不同的回答说明；都要求信息整理与辅助支持，患者模式明确限制新诊断和用药决策。模型必须返回实际引用的 `used_record_ids`，后端验证它们全部属于本次上下文后生成 `references:[{record_id,date}]`；无效引用或缺失必要引用返回 502，不保存失败对话。引用校验验证来源 ID，不能证明自然语言内容正确。上下文默认最多 30 条病历、30000 字符和 20 个影像，截断时返回 `context_truncated:true`。AI 请求结束后再次检查访问权。

首版只开放单轮 `/ai/chat`；会话和消息已经入库，连续会话的三个接口按你的范围暂不开放。

## 测试

```sh
cd backend
uv run ruff check .
uv run ruff format --check .
uv run pytest -q
```

默认用每个测试独立的 SQLite 文件验证业务。设置 `TEST_DATABASE_URL=postgresql+psycopg://...` 后，同一套测试改用 PostgreSQL，每个测试创建并删除专用随机 schema，不操作公共业务表；测试账户需要创建 schema 权限。不要将测试连接设置为生产环境。CI 配置还执行 PostgreSQL migration upgrade/check/downgrade/upgrade。

主要验证：JWT/角色/唯一用户名、身份证加密查询、跨患者与跨医生权限、授权撤销、病历日期分页和软删除审计、NIfTI 校验与切片、非阻塞任务与唯一约束、重启恢复、GLB 尺寸及文件权限、AI 上下文隔离、伪造引用和响应格式。

本次后端 31 项自动化测试通过（包括新增集合接口权限测试），前端 TypeScript 检查和生产构建通过。此前使用 Python 3.12.14 和独立 PostgreSQL 18.4 实例验证了原有 28 项测试，以及 Alembic 升级、一致性检查、回退和重建。当前浏览器预览连接真实 PostgreSQL，验证登录、病历写入、切片读取和默认 GLB 展示。Ruff 检查通过；普通/GPU 两套 Compose 配置解析通过。当前 Docker daemon 未启动，尚未实际构建/启动容器。真实 GPU 权重推理和外部 AI 服务尚未联调。第三方库目前有弃用提示，不影响这些测试结果。

## 文件结构

```text
backend/
  app/
    main.py                应用、错误封装、上传限制、生命周期
    config.py              配置与密钥校验
    models.py              PostgreSQL 数据模型
    security.py / deps.py   JWT、密码、身份证、统一访问校验
    cli.py                 可信操作员的档案/授权/默认模型入口
    routers/               22 个业务路由
    services/              文件、影像、任务和 AI 服务
    adapters/              原模型推理适配器
  migrations/              固定版本 Alembic 迁移
  tests/                   权限和业务集成测试
  .env.example             后端配置模板
medical-platform/Medical/  Vue 前端、同源 API 客户端和真实影像/GLB 组件
scripts/                   Windows 预览启动和停止脚本
deploy/                    前端构建镜像与 nginx 配置
compose.yaml / compose.gpu.yaml
```
