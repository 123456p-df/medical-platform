# VMRB 医疗平台（macOS / Linux）

这是一个使用 Vue 3、FastAPI 和 PostgreSQL 构建的医学影像工作台，医生端、管理员端和患者端共用后端的身份、患者、影像与报告数据。

## 启动完整本地服务

首次运行需要 Node.js 20+、pnpm，以及已经启动的 Docker Desktop；Linux 可以使用 Docker Engine 与 Docker Compose。在项目目录执行：

```bash
pnpm install --frozen-lockfile
pnpm start
```

`pnpm start` 不会调用 PowerShell。它会补齐本地缺失的空白密钥，通过 Docker Compose 启动 PostgreSQL、FastAPI 和 Nginx，确认后端健康后再启动 Vite：

- 前端：<http://127.0.0.1:4173>
- Docker 后端：<http://127.0.0.1:8080>

启动过程不会重置数据库或写入演示账号。首次使用可在登录页注册；已有数据库与上传资料会继续保留。也可以在 macOS 中双击 `start.command`。若系统提示权限不足，在终端执行一次：

```bash
chmod +x start.command
```

只启动后端服务可运行：

```bash
bash scripts/start-services.sh
```

停止 Docker 预览服务可运行：

```bash
bash scripts/stop-services.sh
```

停止操作会保留 Docker 数据卷。若后端已经单独运行，或由其他机器提供，可指定地址并跳过本机 Docker 启动：

```bash
VMRB_BACKEND_URL=http://server.example:8080 pnpm start
```

Windows 不再依赖已删除的 `.ps1` 启动脚本；未指定后端时，`pnpm start` 会保留原有的前端演示模式。要连接真实服务，请先启动后端并设置 `VMRB_BACKEND_URL`。

> macOS 可以运行网页、数据库和普通 FastAPI 功能，但 NV-Segment-CTMR 原模型依赖 NVIDIA CUDA，不能直接使用 Apple GPU 推理。真实分割模型应部署在带 NVIDIA GPU 的 Linux 机器上。

## 仅运行前端演示

```bash
pnpm dev
```

这会使用浏览器内的合成演示数据，不连接真实后端。要验证真实登录、患者、影像和报告流程，请使用上面的 `pnpm start`。

构建与预览前端：

```bash
pnpm build
pnpm serve
```

## 公开影像样本

下载经过 SHA-256 校验的 3D Slicer 公开 CT/MRI 样本：

Windows：

```powershell
backend\.venv\Scripts\python.exe scripts\real-imaging-samples.py
```

macOS / Linux：

```bash
backend/.venv/bin/python scripts/real-imaging-samples.py
```

下载地址、固定校验值和 NRRD→NIfTI 转换逻辑均记录在 `scripts/real-imaging-samples.py`。这些影像仅用于软件验证，不能用于医疗诊断。

## 肺结节辅助检测

网站提供肺部 CT 肺结节候选检测任务、结果查询和医生审核接口。模型服务的请求/响应格式、环境变量和联调步骤见 [`docs/lung-nodule-model-api.md`](docs/lung-nodule-model-api.md)。肺结节检测仍然只支持 CT。

## MRI 与 DICOM

MRI 与 CT 共用上传、MPR、同屏比较和器官分割。身体 MRI 走 `MRI_BODY`；脑 T1 走 `MRI_BRAIN`（需要 SynthStrip 去颅）。序列可从文件名或 DICOM 标签识别，也可以手动选择。生产浏览使用转换后的 NIfTI，细节见 [`docs/mri-support.md`](docs/mri-support.md)。

上传框支持 `.nii`、`.nii.gz`，以及包含一个 DICOM 序列的 `.zip` 或 `.dcm` 文件。每份文件可单独填写检查日期；患者只能上传到自己的档案。

## 多期同模态比较

医生的患者影像页和患者端 “My Examinations” 支持多个时期的 CT–CT 或 MRI–MRI 同屏比较。可以切换单屏、二分屏、四分屏，并选择同步滚动或各窗口独立滚动。同步滚动使用各序列的相对切片位置，因此不同切片数量也可以联动。

## 报告同步与工作区标签

医生报告支持保存草稿和签署。草稿只对医生可见；签署后，患者可在“我的报告”、健康首页和对应检查详情中查看同一份报告。真实后端使用 `0008_report_delivery` 数据库迁移保存关联检查、建议、签署状态和签署时间。

医生侧栏按“患者管理 / 临床工作流”组织为可展开树。打开患者后，可从树中进入概览、影像、AI 辅助诊断和报告；3D/MPR 查看器在独立窗口打开，工作区标签可以快速切换或单独关闭。

## 可选基础设施

默认栈继续通过 8080 端口提供服务，GPU 分割任务在 API 进程内运行。可选的 Redis、Celery worker、MinIO 和 Orthanc 需要先配置相应密钥与模型目录，再运行：

```bash
docker compose -f compose.yaml -f compose.override.yaml -f compose.infra.yaml --profile infra up -d
```

使用 DICOM 网关前，在 `backend/.env` 中设置 `ORTHANC_URL`、`ORTHANC_USERNAME` 和 `ORTHANC_PASSWORD`。只有重新构建 Celery worker 镜像且 Redis 已就绪后，才应启用 `TASK_QUEUE_ENABLED`。

## 开发与验证

```bash
pnpm typecheck
pnpm build
pnpm test:volume
pnpm test:comparison
cd backend
uv run pytest -q
```
