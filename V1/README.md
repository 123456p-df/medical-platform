# PulmoLink 本地网页版

这个目录是把 `medical-platform-main` 的前端整理成的浏览器可运行版本。它不依赖 Python、PostgreSQL 或 GPU，所有患者、影像和报告都使用本地合成数据，方便在 macOS、Windows 和 Linux 上直接体验医生门户与患者门户。

## 快速开始

首次安装依赖（当前 Mac 已安装，可跳过）：

```bash
pnpm install
```

如果没有 `pnpm`，先安装 Node.js 20+，然后使用：

```bash
npm install
npm run dev
```

启动开发服务器：

```bash
pnpm dev
```

打开浏览器访问：

```text
http://localhost:4173
```

同一局域网内的其他设备可以通过 `http://<你的电脑局域网IP>:4173` 访问。

## 登录入口

登录页提供两个演示入口，点击即可进入，无需账号密码：

- Doctor Portal：医生工作台，包括患者队列、影像浏览、AI 结果和报告。
- Patient Portal：患者门户，包括健康概览、检查记录、报告和数字人体。

## 生产构建

```bash
pnpm build
pnpm serve
```

`pnpm build` 会生成 `dist/`，`pnpm serve` 会在 `http://localhost:4173` 提供构建后的静态网页。`pnpm check` 会同时运行类型检查和生产构建。

## 兼容性说明

项目使用 Vite、Vue 3 和 TypeScript，启动命令对 macOS、Windows PowerShell 和 Linux 相同。使用 `pnpm` 时 Windows 会自动解析为 `pnpm.cmd`；使用 `npm` 时命令也完全一致。

原始的 `medical-platform-main` 完整后端仓库仍在 Downloads 目录中，未被修改。本目录只保留前端和本地演示数据。
# 2026-09-08 交互修订

- 顶部与登录页可切换中文 / English；语言偏好保留。界面文案、状态与示例报告提供双语，医生自行输入的内容按原文保存。
- 通知铃铛支持展开、查看待审核任务、全部已读、跳转报告。
- 血型使用 ABO（A / B / AB / O）与 Rh(D) 阳性 / 阴性分开展示。
- AI 发现支持确认、编辑标题 / 描述 / 风险、忽略与撤销忽略；操作结果保留在当前浏览器。
- Doctor Review 采用文稿布局与实时预览，支持新建报告、保存草稿、完成审核并签署；重置恢复上次保存内容，无已存报告时清空草稿。签署后患者端可见。
- 上传 DICOM、PNG、JPEG、WebP、BMP；DICOM 优先读取 Modality，未知类型需手动选择，不默认猜成 CT。混合类型需分次导入；压缩包先解压，NIfTI / NRRD 暂不作为可导入格式。
- 患者有上传记录后，影像及检查列表仅展示实际上传记录。原始示例记录仍保留。初始示例只展示当前检查，历史通过明确按钮展开。
- 上传文件保存在浏览器 IndexedDB，切换检查、取消上传、切换页面和刷新后保留。数据仅在同一浏览器、同一站点地址下共享；当前版本没有后台 AI 推理与服务器存储。
- DICOM 本地文件使用当前 Cornerstone 的 dataset-backed metadata provider；已修复开发环境 Worker / CommonJS 依赖加载及画布高度问题。

验证：`pnpm build`；`node scripts/verify-modalities.mjs`。测试样本位于 `test-fixtures/`，均为合成图像。构建设置保留已有产物，不删除历史文件。
