# 整理日志

## 2026-09-08 交互与双语修订

- 接通通知展开、已读、报告跳转；AI 确认、编辑、忽略、撤销与刷新保存；报告新建、草稿、审核签署、重置及患者端查看。
- 血型改为 ABO 与 Rh(D) 分开显示。Doctor Review 改为文稿布局和实时预览。全站加入中文 / English 切换。
- 上传使用实际文件类型，优先 DICOM 元数据；未知类型手选；有上传记录时只显示上传检查，不混入示例。文件存入 IndexedDB，支持刷新、取消导入和页面切换后保留。
- 修复 Cornerstone Worker 与解码器依赖加载、metadata provider 和画布实际高度，已在浏览器确认 DICOM 像素正常显示。
- 验证通过：`pnpm build`，模态回归脚本 8 项，浏览器通知 / AI / 报告 / 双语 / DICOM / 普通图片 / 患者端联动。
- 原版本备份于工作项目的 `medical/V1-before-interaction-fixes-20260908/`。无文件删除，已有构建产物保留。
- 已知限制：浏览器本地演示，无服务器存储与后台 AI 推理；支持 DICOM、PNG、JPEG、WebP、BMP，压缩包先解压，NIfTI / NRRD 尚未实现。
- 待确认项：无。下一轮建议：使用实际检查样本验证压缩格式与多帧序列。

## 2026-09-07

### 本次操作摘要

- 只读检查了 `/Users/123456p/Downloads/medical-platform-main/` 源仓库结构。
- 确认当前工作目录已有一份同源的 PulmoLink 前端工程。
- 将本地前端整理为无后端依赖的浏览器演示版。
- 补充了 `README.md` 和 `cleaning-log.md`。
- 调整了 `package.json` 启动脚本和 `vite.config.ts` 的预览监听地址，使其兼容 macOS、Windows 和 Linux。
- 执行了 `pnpm build`，生产构建成功。
- 在本地浏览器中验证了登录页、医生门户和患者门户；数字人体和肺部 3D 画布均正常创建，窄屏布局可正常访问。

### 待确认项

- 无。

### 遇到的问题或异常

- 构建时 Cornerstone 的 WASM 依赖出现 Node 模块外部化提示，属于浏览器打包正常提示，不影响运行。

### 下一轮建议

- 如需要连接真实后端，可以在此基础上把 API 客户端从 mock 数据切换回 `/api/v1` 服务。
- 如需要部署到局域网或服务器，可使用 `pnpm build && pnpm serve`，或在 `dist/` 前配置支持 SPA 路由的静态服务器。

## 2026-09-07 补充

### 本次操作摘要

- 按用户要求，在当前项目内新建了 `medical/V1/`。
- 将前端源码、Vite 配置、包管理文件、README 和整理日志复制到 `medical/V1/`。
- 在 `medical/V1/` 内执行了 `pnpm install` 和 `pnpm build`，均成功。
- 原始根目录文件保持只读，未删除或移动。

### 待确认项

- 无。

### 遇到的问题或异常

- 无。

### 下一轮建议

- 后续可以只维护 `medical/V1/`，根目录的同源文件是否保留由用户决定。

## 2026-09-07 第二次补充

### 本次操作摘要

- 用户确认目标目录是 `/Users/123456p/Desktop/Medical/`。
- 已将 `medical/V1/` 中的网页源码和配置复制到 `/Users/123456p/Desktop/Medical/V1/`。
- 在目标目录内执行了 `pnpm install` 和 `pnpm build`，均成功。
- 当前开发服务器已切换到 `/Users/123456p/Desktop/Medical/V1/`。

### 待确认项

- 无。

### 遇到的问题或异常

- 无。

### 下一轮建议

- 后续以 `/Users/123456p/Desktop/Medical/V1/` 为准。
