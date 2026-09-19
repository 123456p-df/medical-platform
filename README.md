# VMRB 医疗平台前端（macOS）

## 直接运行

首次运行需要 Node.js 20+ 和 pnpm。在此目录执行：

```sh
pnpm install
pnpm start
```

然后打开 <http://127.0.0.1:4173>。也可以双击 `start.command` 启动；脚本会自动检查依赖并打开浏览器。macOS 若提示权限，可在终端执行一次：

```sh
chmod +x start.command
```

## 构建并预览

```sh
pnpm build
pnpm serve
```

当前构建预算以路由懒加载为前提：入口脚本不超过 350 KB，Cornerstone 独立块不超过 3.6 MB，GLTF 加载块不超过 650 KB。构建后运行 `pnpm test:bundle-budget` 可复核；首次 DICOM 解码仍需下载对应 Worker/WASM，生产发布前应在目标网络记录冷启动和热启动首帧时间。

## 三种运行模式

| 模式 | 启动方式 | 数据与上传能力 |
|---|---|---|
| 合成演示 | 双击 `start.command` | 自动进入医生工作台；使用明确标注的演示档案；本地导入支持 DICOM、PNG/JPEG/WebP/BMP，仅保存在当前浏览器。 |
| 本地真实 API | 先启动 FastAPI，再执行 `pnpm start` | 登录后使用 PostgreSQL 数据；NIfTI 上传进入患者档案；配置 Orthanc 后可使用受认证 DICOM 归档接口。 |
| Compose 生产栈 | `docker compose -f compose.yaml up -d --build` | Nginx 监听 `http://127.0.0.1:8080`，后端和 PostgreSQL 位于内部网络；按需叠加基础设施或 GPU 配置。 |

Vite 开发服务器位于 `http://127.0.0.1:4173`，会把 `/api` 和 `/health` 转发到 `VMRB_BACKEND_URL`，默认值是 `http://127.0.0.1:8080`。若直接在主机启动 FastAPI 的 8000 端口，请同时执行：

```sh
VMRB_BACKEND_URL=http://127.0.0.1:8000 pnpm start
```

真实 API 首次启动前，在 `backend/` 中生成配置、填写数据库密钥并升级到最新迁移：

```sh
cd backend
python -m app.cli init-config
uv run alembic upgrade head
uv run uvicorn app.main:create_app --factory --host 127.0.0.1 --port 8000
```

启动后用 `curl -fsS http://127.0.0.1:8000/health` 验证数据库连接。更新前先备份数据库与存储目录；回滚时使用与目标应用版本匹配的数据库备份和镜像，不直接覆盖患者文件。

发布前本地可复核 `pnpm test:deployment`，完整外部环境验收项见 [`docs/release-checklist.md`](docs/release-checklist.md)。

## 肺结节辅助检测

网站现已提供肺部 CT 肺结节候选检测任务、结果查询和医生审核接口。模型服务的请求/响应格式、环境变量和联调步骤见 [`docs/lung-nodule-model-api.md`](docs/lung-nodule-model-api.md)。3D Viewer 不属于本次模型接入范围。

## 多期 CT 同屏比较

医生的患者影像页和患者端“My Examinations”均支持多个时期的 CT 同屏比较。可切换单屏、二分屏、四分屏，并选择同步滚动或各窗口独立滚动。同步滚动使用各序列的相对切片位置，因此不同切片数量也可以联动。

上传框支持一次选择多份 `.nii` / `.nii.gz`，每份文件可单独填写检查日期。患者只能上传到自己的档案；真实上传和比较需要使用后端模式并执行最新数据库迁移：

```sh
cd backend
uv run alembic upgrade head
```

## 报告同步与工作区标签

医生报告支持草稿、提交审核、退回草稿、签署和取消；草稿只对医生可见，签署后患者才可见。报告投递字段来自 `0008_report_delivery`，草稿默认值来自 `0014_record_draft_default`；DICOM 业务关联来自 `0016_dicom_business_links`；患者建档邀请、账号绑定和全局归档审计来自 `0017_patient_onboarding_and_archives`；AI 会话检查作用域来自 `0018_ai_conversation_examination`；报告任务、版本与流程事件来自 `0019_report_workflow`；候选框范围与临床测量分离来自 `0020_finding_measurement_provenance`；多厂商 AI 配置、Invocation 与 Attempt 审计来自 `0021_ai_providers_and_invocations`。本地演示模式使用按账号隔离的浏览器持久化存储。

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
