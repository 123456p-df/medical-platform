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

## 后端说明

双击 `start.command` 会以本地预览模式自动进入医生工作台，使用项目内的合成演示数据，不需要输入密码，也不连接外部服务。手动执行 `pnpm start` 时仍是正常登录模式。

真实后端模式连接同仓库中的 FastAPI 后端 `/api/v1`，Vite 会把 `/api` 和 `/health` 转发到 `127.0.0.1:8000`；要登录真实患者数据，需要同时启动后端和 PostgreSQL，具体步骤见上级项目 README。

## 肺结节辅助检测

网站现已提供肺部 CT 肺结节候选检测任务、结果查询和医生审核接口。模型服务的请求/响应格式、环境变量和联调步骤见 [`docs/lung-nodule-model-api.md`](docs/lung-nodule-model-api.md)。3D Viewer 不属于本次模型接入范围。

## 多期 CT 同屏比较

医生的患者影像页和患者端“My Examinations”均支持多个时期的 CT 同屏比较。可切换单屏、二分屏、四分屏，并选择同步滚动或各窗口独立滚动。同步滚动使用各序列的相对切片位置，因此不同切片数量也可以联动。

上传框支持一次选择多份 `.nii` / `.nii.gz`，每份文件可单独填写检查日期。患者只能上传到自己的档案；真实上传和比较需要使用后端模式并执行最新数据库迁移：

```sh
cd backend
uv run alembic upgrade head
```
