# V5 W01–W06 发布与真实环境验收清单

日期：2026-09-16。本文只列验收动作；真实 PostgreSQL、Orthanc、GPU、模型和匿名样本结果必须在对应环境记录，不能以本地合成测试代替。

## 1. 代码与契约

- [x] `pnpm typecheck`
- [x] `pnpm test:p0`
- [x] `pnpm test:p1-consistency`
- [x] `pnpm test:navigation`
- [x] `pnpm test:workspace-tabs`
- [x] `pnpm test:viewer-stability`
- [x] `pnpm test:volume`
- [x] `pnpm test:comparison`
- [x] `pnpm test:docs`
- [x] `pnpm test:i18n`
- [x] `pnpm test:profile`
- [x] `pnpm test:a11y`
- [x] `pnpm test:contract`
- [x] `pnpm test:migrations`
- [x] `pnpm test:deployment`
- [x] `pnpm exec playwright test`
- [x] `pnpm exec vite build --outDir dist-v5-<build-id>`
- [x] `node scripts/verify-bundle-budget.mjs dist-v5-<build-id>`
- [x] 后端完整测试，当前为 70 项。

## 2. 数据库迁移演练

- [ ] 在数据库副本执行 `alembic upgrade head`，记录前后数量。
- [ ] 核对 0021 后：
  - 报告 status/revision/签署人正确。
  - report_tasks 与检查一一对应。
  - ai_invocations/attempts 仅由真实请求产生。
  - findings 的 box_extent/measurement/side_evidence 区分正确。
- [ ] 回滚演练只验证“停用新写路径 + 前向修复”，不执行降级删表。

## 3. 真实服务联调

- [ ] PostgreSQL：启动 Compose db，健康检查通过。
- [ ] Orthanc：DICOM 上传、查询、转 NIfTI 和 `medical_image_id` 回填。
- [ ] GPU：NV-Segment-CT 或等价分割模型加载、批处理 manifest、失败恢复。
- [ ] 肺结节：HTTP 适配器返回 RAS/cccwhd，检测框与人工测量区分。
- [ ] 文本 AI：固定匿名样本完成协议、业务、质量和运行层验收。

## 4. 演示脚本

1. 医生打开患者，侧栏只有影像高亮。
2. 同检查重复打开只产生一个标签；切换心脏 CT 标签名称可区分。
3. 同一工作页切换 2D/3D，浏览器标签数不增加。
4. 医生起草、提交审核、退回、签署；患者仅在签署后看到报告。
5. AI 候选生成期间医生继续编辑，候选不覆盖新文字。
6. 检测结果点击定位，测量来源与侧别证据明确。
7. 取消未保存标签，页面和标签同时保留。
8. 断网/失败时手写报告和已有资料仍可用。

## 5. 发布后

- [ ] 记录实际构建号、后端版本、端口、缓存策略。
- [ ] 记录 P50/P95 时延、并发、队列恢复和资源使用。
- [ ] 保存匿名化演示证据，密钥与真实身份数据不进入构建产物。
