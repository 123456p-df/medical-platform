# VMRB 医疗平台（Windows / macOS / Linux）

## 直接运行

`pnpm start` 现在是全栈启动入口：Windows 会启动本机 PostgreSQL、FastAPI 和前端，
macOS/Linux 会通过 Docker Compose 启动 PostgreSQL 与 FastAPI，再启动前端。首次运行需要
Node.js 20+、pnpm 和 uv；Windows 需安装 PostgreSQL，macOS/Linux 需启动 Docker。
在项目根目录执行：

```sh
pnpm install --frozen-lockfile
pnpm start
```

然后打开 <http://127.0.0.1:4173>。首次启动会自动生成本机 `.env` 密钥、安装后端依赖并执行数据库迁移。
Windows 中按 `Ctrl+C` 会一并停止前端、FastAPI 和本地 PostgreSQL，数据和上传文件会保留。

如果只需要不依赖数据库的浏览器合成演示，使用：

```sh
pnpm start:demo
```

macOS 也可以双击 `start.command`；脚本会自动检查依赖并打开浏览器。若系统提示权限，可在终端执行一次：

```sh
chmod +x start.command
```

Windows 的等价底层命令为：

```powershell
.\scripts\start-preview.ps1
```

脚本会从 `PATH` 或常见安装目录查找 PostgreSQL，不绑定特定版本。非标准安装可先设置
`VMRB_POSTGRES_BIN`。如需载入两份演示影像，再把 `VMRB_DEMO_SCAN_DIR` 指向包含
`0.nii`、`1.nii` 的目录；未设置时会启动空数据库并允许注册新账号。

演示环境只预置以下四个账号，密码统一为 `123456`：

| 账号 | 角色 |
|---|---|
| `admin` | 管理员 |
| `demo_doctor` | 医生 |
| `demo_patient` | 演示患者 |
| `test_patient` | 测试患者 |

演示患者也仅为 `demo_patient` 和 `test_patient`。可审查的数据库结构、迁移和合成种子数据随代码入库；
账号清单在 `backend/fixtures/demo_database.fixture.json`。真实数据库文件、`.env`、密钥和患者数据不应上传。
需要清理旧演示账号时，在确认已指向演示数据库后运行：

```powershell
$env:VMRB_DEMO_RESET = '1'
backend\.venv\Scripts\python.exe scripts\reset-demo-data.py
```

## NV-Segment-CTMR 三维模型

本机 Windows 启动脚本会自动识别 `D:\NV-Segment-CTMR`，验证
`hugging_face_pipeline.py` 和 `vista3d_pretrained_model/model.pt`，并在首次启动时安装
`backend/requirements-nv.txt` 中的推理依赖。其他路径可传入：

```powershell
.\scripts\start-preview.ps1 -NvSegmentDir 'D:\NV-Segment-CTMR'
```

macOS/Linux 或手动启动后端时设置 `NV_SEGMENT_CT_DIR`即可使用同一适配器。推理产生标签体积和 GLB，
前端在当前标签页的 3D 查看器中直接预览，按 `Esc` 返回患者页。模型权重保留在本机，不会上传到 GitHub。
仅在 CPU 环境中调试其他功能时，可临时设置 `VMRB_SKIP_NV_SEGMENT_SETUP=1` 跳过模型运行时安装。

## 构建并预览

```sh
pnpm build
pnpm serve
```

当前构建预算以路由懒加载为前提：入口脚本不超过 360 KB，Cornerstone 独立块不超过 3.6 MB，GLTF 加载块不超过 650 KB。构建后运行 `pnpm test:bundle-budget` 可复核；首次 DICOM 解码仍需下载对应 Worker/WASM，生产发布前应在目标网络记录冷启动和热启动首帧时间。

## 三种运行模式

| 模式 | 启动方式 | 数据与上传能力 |
|---|---|---|
| 合成演示 | `pnpm start:demo`，或 macOS 双击 `start.command` | 自动进入医生工作台；使用明确标注的演示档案；本地导入支持 DICOM、PNG/JPEG/WebP/BMP，仅保存在当前浏览器。 |
| 本地真实 API | `pnpm start` | 同时启动 PostgreSQL、FastAPI 和前端；登录后使用 PostgreSQL 数据；NIfTI 上传进入患者档案。 |
| Compose 生产栈 | `docker compose -f compose.yaml up -d --build` | Nginx 监听 `http://127.0.0.1:8080`，后端和 PostgreSQL 位于内部网络；按需叠加基础设施或 GPU 配置。 |

Vite 开发服务器位于 `http://127.0.0.1:4173`，会把 `/api` 和 `/health` 转发到 `VMRB_BACKEND_URL`。
若要连接已经在运行的外部 FastAPI，可设置该变量后再执行 `pnpm start`：

macOS / Linux：

```sh
VMRB_BACKEND_URL=http://127.0.0.1:8000 VITE_LOCAL_PREVIEW=false pnpm start
```

Windows PowerShell：

```powershell
$env:VMRB_BACKEND_URL = 'http://127.0.0.1:8000'
$env:VITE_LOCAL_PREVIEW = 'false'
pnpm start
```

真实 API 首次启动前，在 `backend/` 中生成配置、填写数据库密钥并升级到最新迁移：

```sh
cd backend
uv run python -m app.cli init-config
uv run alembic upgrade head
uv run uvicorn app.main:create_app --factory --host 127.0.0.1 --port 8000
```

启动后用 `curl -fsS http://127.0.0.1:8000/health` 验证数据库连接。更新前先备份数据库与存储目录；回滚时使用与目标应用版本匹配的数据库备份和镜像，不直接覆盖患者文件。

## 肺结节辅助检测

网站现已提供肺部 CT 肺结节候选检测任务、结果查询和医生审核接口。模型服务的请求/响应格式、环境变量和联调步骤见 [`docs/lung-nodule-model-api.md`](docs/lung-nodule-model-api.md)。肺结节候选检测与 NV-Segment-CTMR 器官分割是两个独立模型流程。

## 多期 CT 同屏比较

医生的患者影像页和患者端“My Examinations”均支持多个时期的 CT 同屏比较。可切换单屏、二分屏、四分屏，并选择同步滚动或各窗口独立滚动。同步滚动使用各序列的相对切片位置，因此不同切片数量也可以联动。

上传框支持一次选择多份 `.nii` / `.nii.gz`，每份文件可单独填写检查日期。患者只能上传到自己的档案；真实上传和比较需要使用后端模式并执行最新数据库迁移：

```sh
cd backend
uv run alembic upgrade head
```

## 报告同步与工作区标签

医生报告支持保存草稿和签署。草稿只对医生可见；签署后，患者可在“我的报告”、健康首页和对应检查详情中查看同一份报告。报告投递字段来自 `0008_report_delivery`，草稿默认值来自 `0014_record_draft_default`；DICOM 业务关联来自 `0016_dicom_business_links`；患者建档邀请、账号绑定和全局归档审计来自 `0017_patient_onboarding_and_archives`。`0018_merge_mri_and_v5` 安全汇合 MRI 与 V5 两条既有迁移分支，`0019_reconcile_access_control` 修复旧版本可能缺失的账号状态与 JWT 撤销表。`0020_structured_reporting` 增加结构化报告模板，并在报告中保存结构化字段。`0021_admin_console` 增加账号状态、强制下线、模板历史版本和运营统计支持。本地演示模式使用按账号隔离的浏览器持久化存储。

医生侧栏按“患者管理 / 临床工作流”组织为可展开树。打开患者后，可从树中进入概览、影像、AI 辅助诊断、报告和 3D 影像；这些页面会作为工作区标签保留，可快速切换或单独关闭。

## Staged production hardening

The default stack exposes Nginx on port 8080 and runs the API on its internal port 8000.
API documentation is disabled in that environment. Optional Redis, MinIO, and Orthanc
services use the files that are present in this directory:

    docker compose -f compose.yaml -f compose.infra.yaml --profile infra up -d --build

GPU segmentation uses:

    docker compose -f compose.yaml -f compose.gpu.yaml up -d --build

Set `ORTHANC_URL`, `ORTHANC_USERNAME`, and `ORTHANC_PASSWORD` in `backend/.env` before
using authenticated DICOM endpoints. `TASK_QUEUE_ENABLED` remains false until a worker
implementation is deployed and verified. The DICOM boundary stores patient, Study, Series,
Instance and frame metadata. `POST /api/v1/dicom/series/{series_id}/convert` turns an
enabled Orthanc NIfTI series into a viewable `MedicalImage` and backfills the series link;
see `docs/dicom-conversion.md` for the real-service verification boundary.
