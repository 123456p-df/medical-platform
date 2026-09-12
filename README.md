# VMRB 医学影像与报告平台

这是 Vue 3 + FastAPI + PostgreSQL 的双语医学影像工作台。医生端、管理员端和患者端共用同一套后端身份、患者、影像与报告数据，不再把浏览器 `localStorage` 当作正式数据源。

## 固定账号

预览数据库只开放以下四个账号，密码均为 `123456`：

| 账号 | 用途 |
| --- | --- |
| `admin` | 管理全部演示患者与工作流 |
| `demo_doctor` | 影像审核与报告签署 |
| `demo_patient_full` | 查看真实 CT 示例和已签署报告 |
| `demo_patient_test` | 验证医生新签报告的患者可见性 |

注册默认关闭。旧演示账号不会通过登录白名单，旧浏览器会话也会在前端升级时清理。

## 启动完整预览

Windows 环境先安装前后端依赖，然后运行：

```powershell
pnpm start
```

Windows 下该入口会启动 PostgreSQL、FastAPI 和前端，并在数据库及 API 健康检查通过后报告就绪。首次启动会写入四个固定账号和真实 CT，之后保留已有资料；重复执行会复用本项目的健康进程，并修复只启动了前端的情况。默认地址是 <http://127.0.0.1:4173>，后端端口为 `8000`。

也可以直接运行 `powershell -ExecutionPolicy Bypass -File scripts/start-preview.ps1`，通过 `-FrontendPort`、`-BackendPort`、`-DatabasePort` 指定端口。停止服务使用 `scripts/stop-preview.ps1`，数据会保留。

`pnpm dev` 只启动前端，需要后端已运行；默认代理到 `http://127.0.0.1:8000`。使用 Docker 的 `8080` 入口时，设置 `VMRB_BACKEND_URL=http://127.0.0.1:8080`。macOS/Linux 的 `pnpm start` 会先检查配置的后端（默认 Docker `8080` 入口），健康后启动前端。

如缺少真实样本，先运行：

```powershell
backend\.venv\Scripts\python.exe scripts\real-imaging-samples.py
```

示例使用 3D Slicer 官方公开的去标识化 `CT-chest` 数据，下载地址、固定 SHA-256 和 NRRD→NIfTI 转换逻辑均记录在 `scripts/real-imaging-samples.py`。该影像仅用于技术演示，不能用于医疗诊断。

## 数据与报告目录

数据库继续负责账号、权限、查询索引、报告状态和审计；影像与可供 Agent 阅读的报告正文统一放在 `STORAGE_ROOT`（默认 `dataset`）下：

```text
dataset/
  patient/{patient_id}/
    report/{record_id}/{revision}-{sha256}.md
    imaging/{image_id}.nii.gz
    imaging/{image_id}.nii.gz.slices.npy
    segmentation/{image_id}/{task_id}/...
  account/{user_id}/profile/...
```

报告 Markdown 使用不可变版本文件。数据库保存当前版本的相对路径、SHA-256、大小和版本号；读取报告时会校验文件，旧数据库正文仅作为尚未迁移记录的兼容来源。`0009_report_documents` 迁移会加入这些索引字段，服务启动后分批补齐历史报告文件。

## CT 连续浏览缓存

NIfTI 首次导入时解压并生成 canonical `.slices.npy`。后端后续通过 `numpy.memmap` 读取，不再为每张切片重复解压。浏览器端还会按影像 ID 复用已下载的体积和 Web Worker，因此在 A→B→A 检查之间切换时可直接复用缓存。缓存有总内存上限，并在退出登录或权限失效时清理。

## 开发与验证

```powershell
pnpm typecheck
pnpm build
backend\.venv\Scripts\python.exe -m pytest backend\tests -q
pnpm test:modalities
pnpm test:volume
pnpm test:comparison
```

肺结节模型服务的接口、环境变量和联调说明见 `docs/lung-nodule-model-api.md`。
