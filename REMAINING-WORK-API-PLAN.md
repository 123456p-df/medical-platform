# V5 剩余修改任务与 API 代理执行计划

> 工作副本：`medical/V5-optimization-workcopy-20260913`  
> 只读基线：`medical/V4-github-sync`  
> 盘点日期：2026-09-14  
> 规则：只修改工作副本；不删除文件；每完成一项同时更新 `IMPLEMENTATION-STATUS.md`、根目录任务清单和 `cleaning-log.md`。

> 执行结果：2026-09-14 已完成任务 28、31、34、35、36、41、45、47；任务 16 的代码与合成联调完成，
> 仅真实 Orthanc 服务联调保留；任务 40 页面级状态组件迁移完成，2026-09-14 续改补齐患者检查、报告错误重试与工作队列错误状态。
> 下文完成度、缺口与步骤为实施前交接快照，当前完成情况及外部验收依赖以 `IMPLEMENTATION-STATUS.md` 为准。

## 一、剩余任务总览

| 顺序 | 任务 | 当前完成度 | 剩余工作的核心 | 建议投入 |
|---|---|---:|---|---:|
| 1 | 36 个人资料上传 | 约 95% | 真实文件手工回归、服务端模式验证、更新清单 | 0.5 天 |
| 2 | 28 注册与档案关联 | 约 30% | 建档向导、邀请绑定、医生关联既有档案 | 2–3 天 |
| 3 | 31 归档与恢复 | 约 40% | 区分解除关联和全局归档、归档列表、原因、恢复 UI | 2 天 |
| 4 | 34 国际化 | 约 65% | 上传、阅片、资料页硬编码；错误码和日期格式 | 1.5–2 天 |
| 5 | 35 无障碍 | 约 45% | 全流程键盘巡检、对话框焦点、状态播报、控件语义 | 1.5–2 天 |
| 6 | 40 UI 规范 | 约 40% | 统一按钮/字段/弹层/状态组件并迁移剩余页面 | 2–3 天 |
| 7 | 47 契约统一 | 约 20% | OpenAPI 生成 DTO、mapper 契约、统一模拟数据工厂 | 2–3 天 |
| 8 | 45 端到端测试 | 约 15% | Playwright、双角色/双模式流程、前端 CI | 3–4 天 |
| 9 | 41 性能 | 约 55% | 真实网络首帧、长期内存、Worker/模型加载策略 | 1–2 天 |
| 10 | 16 DICOM 业务链路 | 约 45% | Orthanc 转换任务、MedicalImage 回填、跨浏览器阅片 | 3–5 天，依赖真实服务 |

任务 36 的代码已经实现，不应重新开发。任务 16、28、31、34、35、40、41 是部分完成；任务 45、47 尚未形成完整工程闭环。

## 二、推荐执行顺序

1. 先验证并关闭任务 36，避免重复改动已完成模块。
2. 完成任务 28 和 31，固定账号、患者、医生授权和归档语义。
3. 完成任务 47，让后续前端和 E2E 使用稳定契约。
4. 完成任务 34、35、40，集中处理页面文案、交互和组件迁移。
5. 完成任务 45，把上述业务流程纳入浏览器回归和 CI。
6. 完成任务 41，采集稳定基线后再调整分包和预加载。
7. 最后在真实 Orthanc/PostgreSQL 环境完成任务 16，并执行最终发布检查。

## 三、逐项修改计划

### Task 36｜个人头像与附件上传：只需收尾验证

**已有实现**

- `src/components/profile/AvatarEditor.vue` 已支持居中裁剪、缩放、±90° 旋转和圆形预览。
- `src/stores/profile.ts` 已支持账号隔离的本地存储、服务端 XHR 进度、附件上限和重试所需状态。
- `src/views/ProfileView.vue` 已支持图片预览、类型/大小、保存快照、保存时锁定及离开提示。
- `scripts/verify-profile-upload.mjs` 和 `pnpm test:profile` 已存在且通过。

**剩余步骤**

1. 演示模式分别上传 JPG、PNG，执行缩放、旋转、保存；刷新页面和切换账号后检查隔离。
2. 上传合法 PDF/图片附件，检查进度、预览、刷新恢复、达到数量上限时提示。
3. 在真实 API 模式验证 `POST /auth/profile/avatar` 和 `POST /auth/profile/files`，模拟 413、415、网络中断并确认待上传文件仍保留。
4. 检查浏览器返回/离开页面时 dirty 提示只在内容实际变化时出现。
5. 通过后把根任务清单 Task 36 改为 `[x]`，在 `IMPLEMENTATION-STATUS.md` 写入验证记录。

**验收命令**

```bash
pnpm test:profile
pnpm typecheck
```

### Task 28｜自助注册、医生建档与患者关联引导

**当前缺口**

- 后端注册会创建空 `Patient`，但没有“是否完成建档”状态和建档接口。
- 演示注册会创建 roster 记录，但注册后直接进首页，没有最小档案向导。
- `POST /doctor/patients/resolve` 只允许医生查找已经有权限的患者，不能完成受控关联。
- 医生新建的无账号患者与患者自助注册后的空档案可能重复。

**后端修改**

1. 新增迁移，给患者档案增加 `profile_completed_at`；新增 `patient_link_invitations`：`id`、`patient_id`、`created_by_user_id`、`token_hash`、`expires_at`、`used_at`、`revoked_at`。
2. `GET /auth/me` 增加 `patient_id`、`profile_completed`、`account_role`。前端保留原始 `admin/doctor/patient` 角色，不再只把 admin 压成 doctor。
3. 新增 `PATCH /patient/onboarding`，仅允许当前患者补齐姓名、出生日期、性别、身份标识、身高、体重、血型；身份标识继续哈希与加密存储。
4. 新增医生接口 `POST /doctor/patients/{patient_id}/invitations`，生成单次、短时有效的随机码；数据库只存哈希。
5. 新增患者接口 `POST /patient/link`，提交邀请代码和必要身份核验。事务内锁定邀请、校验未过期/未使用，将账号绑定到目标 Patient，并处理注册时产生的空档案。
6. 新增医生接口 `POST /doctor/patients/link-existing`，用身份核验找到患者后创建或恢复 `DoctorPatientAccess`。不允许仅凭姓名直接关联。
7. 所有创建、邀请、使用邀请、关联、失败尝试写审计事件；重复请求保持幂等。

**前端修改**

1. 新建 `src/views/patient/PatientOnboardingView.vue`，路由 `/patient/onboarding`。
2. 路由守卫读取 `profile_completed`：未完成建档的患者只能访问建档、资料和退出入口。
3. 建档页提供两个明确入口：“创建新档案”和“关联医院已有档案”。邀请代码输入失败要显示稳定错误码对应文案。
4. `PatientCreateDialog.vue` 增加“新建患者/关联已有患者”模式；关联成功后刷新患者列表并打开同一 patientId。
5. 演示模式实现等价邀请对象，存储必须按账号命名空间隔离。
6. 工作流队列找不到姓名时显示“未完成建档”，不回退固定演示患者名。

**必须增加的测试**

- 新账号注册后进入 onboarding，完成后才能进入患者首页。
- 医生建档→生成邀请→患者绑定→双方看到同一 patientId。
- 过期、重复使用、错误身份、其他账号使用邀请均失败。
- 同一医生重复关联幂等；不同医生之间授权互不污染。
- 绑定事务失败时不留下半绑定账号或孤立访问关系。

### Task 31｜解除医生关联、全局归档与恢复

**当前缺口**

- `DELETE /patients/{id}` 实际执行全局软归档，但普通医生也能触发。
- 没有“只从当前医生工作台移除”的接口。
- 没有归档列表、归档原因、操作者、恢复 API 和正常 UI；只有本地模式的“恢复最后一位”。

**数据与权限设计**

1. 新增 Patient 字段或独立 `patient_archives` 事件表，记录 `reason`、`archived_by_user_id`、`archived_at`、`restored_by_user_id`、`restored_at`。
2. 普通医生只能停用自己的 `DoctorPatientAccess`；全局归档和恢复要求 admin/档案管理员权限。
3. 保留病历、影像、报告和审计数据；归档患者在普通查询中统一不可见。

**接口修改**

1. `DELETE /doctor/patients/{id}/access`：解除当前医生关系，写 `doctor_patient_access.remove` 审计。
2. `POST /admin/patients/{id}/archive`：body 必须含原因；重复归档幂等。
3. `GET /admin/patients/archived?page=&search=`：返回原因、操作者、时间和可恢复状态。
4. `POST /admin/patients/{id}/restore`：恢复并写审计；明确是否自动恢复历史医生关联，建议默认不自动恢复。
5. 逐一检查 catalog、workflow、records、images、AI、DICOM、报告接口均复用同一 active-patient 条件。

**前端修改**

1. 普通医生按钮改为“从我的工作台移除”，说明只影响本人。
2. admin 增加“归档患者”和归档管理页面，表格展示原因、操作者、时间及恢复按钮。
3. 归档/解除关联后关闭该患者的工作标签、清空 store 上下文、刷新 workflow。
4. 访问已归档或权限已撤销页面时显示明确 403/404 状态并提供返回入口。
5. 演示模式归档列表不能只保存最后一位；刷新和切换账号后仍可查询。

**测试**

- 医生 A 解除关联不影响医生 B。
- 普通医生不能全局归档和恢复。
- 全局归档后所有业务接口拒绝访问；管理员仍能在归档列表查询。
- 恢复后 catalog、workflow、患者详情表现一致，审计记录包含原因和双方操作者。

### Task 34｜完成全页面国际化

**当前缺口**

- 基础导航、登录、报告、通知、AI、资料页静态界面已经迁移。
- 上传、Cornerstone 阅片、MPR、3D、部分个人资料交互结果仍有硬编码中文/英文。
- 后端英文 message 仍可能直接显示，缺少按稳定错误码映射的本地文案。

**执行步骤**

1. 扩展 `scripts/verify-i18n.mjs`，扫描 `.vue` 模板文本、`title`、`aria-label`、placeholder 及用户可见的 TS 字符串；维护临床原文白名单。
2. 优先迁移：
   - `src/components/medical/MultiStudyUpload.vue`
   - `src/components/medical/CornerstoneViewer.vue`
   - `src/components/medical/MPRViewer.vue`
   - `src/components/medical/UploadedStudyViewer.vue`
   - `src/views/viewer/StudyViewerWindow.vue`
   - `src/views/ProfileView.vue` 中保存/上传后的动态消息
   - 三个 3D Viewer 的加载、空态和错误文案
3. 所有 key 使用语义分组：`upload.*`、`viewer.*`、`profile.*`、`errors.*`、`common.*`；禁止把整句中文当 key。
4. API 错误按 `code` 映射到 `errors.<code>`；只有未知错误才显示经过转义的服务端 message。
5. 日期、时间、数字、文件大小统一走 locale formatter；DICOM 原始标签和临床原文保持原始内容。
6. 在 390、768、1440 px 下分别切换中英文，验证语言按钮、长错误、表格列和对话框不溢出。

**验收**

- `pnpm test:i18n` 能在新增硬编码 UI 文案时失败。
- 登录、医生工作台、上传、2D/MPR/3D、报告、患者端、个人资料两种语言无意外混排。

### Task 35｜键盘与无障碍完整回归

**已有实现**

- 阅片快捷键已限制在活动工作区；输入框、IME 和 Tab 导航有边界。
- 患者表格内部按钮不会冒泡打开行。
- 工作标签已有左右键、Home/End；搜索和语言按钮已有名称。

**剩余步骤**

1. 所有 icon-only 按钮补 `aria-label`；切换类工具使用 `aria-pressed`；滑块补可读名称、最小值、最大值和当前值。
2. 所有异步区域使用 `aria-busy`；成功/错误/部分成功用合适的 `role=status` 或 `role=alert`，避免重复播报。
3. 对话框打开后聚焦标题或首个字段，关闭后把焦点还给触发按钮；失败时聚焦错误摘要并通过 `aria-describedby` 关联字段。
4. `WorkspaceTabs.vue` 完成 roving tabindex，并验证关闭当前、第一、最后标签后的焦点位置。
5. 上传队列必须能用键盘选择文件、排除项目、取消、重试；阅片工具栏可进入、操作、退出，不劫持浏览器快捷键。
6. 增加 Skip link、主内容 landmark、唯一页面标题和可见 `:focus-visible` 样式。
7. 使用 Playwright 键盘脚本覆盖“搜索→打开患者→上传队列→切片→保存草稿”，再运行 axe 检查关键路由。

**验收**

- 全程只用键盘完成主流程；焦点不会丢失或陷入弹层。
- 200% 缩放和 390 px 宽度仍能访问所有主操作。
- axe 关键路由无 serious/critical 问题。

### Task 40｜UI 组件与状态规范迁移

**已有实现**

- `src/style.css` 已有一批间距、控件、圆角、语义状态和层级 token。
- `src/components/ui/StatePanel.vue` 已实现 loading/empty/error/partial/success。
- `docs/ui-system.md` 已建立初版规范；患者列表、报告、患者首页和资料页已部分接入。

**剩余步骤**

1. 冻结 token 命名，补齐字体层级、阴影、焦点环、危险操作、移动端密度和暗色阅片区语义。
2. 建立或统一 `AppButton`、`FormField`、`AppDialog`、`StatePanel`、`StatusBadge`、`RiskBadge`，减少页面直接复制按钮和弹层 CSS。
3. 迁移上传、患者详情、检查列表、AI、2D/MPR/3D、404 页面中的旧 `.empty-state`、`.error`、`.loading`。
4. 每个区域只保留一个主按钮；归档、解除关联、更正等管理动作归入次要操作或菜单。
5. 状态不只靠颜色表达，必须包含文本或图标加可访问名称。
6. 为 390、768、1024、1440 px 建立视觉回归截图，检查按钮高度、间距、弹层层级和错误布局。

**验收**

- 同一语义操作跨页面使用同一组件和名称。
- 不再出现多个不兼容的空态/错误态实现。
- 低对比文字、10px 以下关键文字、弹层遮挡和 z-index 冲突全部清零。

### Task 47｜前后端 schema、DTO、mapper 与模拟数据统一

**当前缺口**

- 后端 Pydantic schema、前端手写 DTO、业务类型和 mock 数据分别维护。
- 已有 mapper，但新增服务端字段仍可能静默丢失。
- 没有 CI 校验生成契约是否与当前 OpenAPI 一致。

**执行步骤**

1. 后端增加可重复生成 OpenAPI 文件的脚本，例如 `backend/scripts/export_openapi.py`，输出到 `contracts/openapi.json`。
2. 前端增加 `openapi-typescript`，生成 `src/api/generated/schema.ts`；生成文件只由脚本更新。
3. `src/api/*.ts` 的传输类型改为 generated types；`src/types/index.ts` 只保留 UI 业务模型。
4. 每个 mapper 建立显式字段覆盖测试，至少覆盖 Patient、Image、Finding、Report、Profile、DICOM Study；未知枚举映射到 `Unknown`，不能丢失原值。
5. 把 `mockData.ts` 改为调用 `src/data/factories/*`，factory 参数和默认状态遵守同一业务模型；补齐 organIds、examinationId、来源、上传时间、签署时间和 addenda。
6. 增加 `pnpm test:contract`：先生成临时 schema，再与提交版本比较；有差异时失败并提示更新命令。
7. 在 `docs/feature-matrix.md` 维护演示、本地导入、真实 API 三种模式的来源、持久化、AI、3D、报告能力。

**验收**

- 修改后端响应字段但未更新客户端时 CI 失败。
- 同一页面切换演示/真实模式时收到相同业务形状。
- mapper 的每个关键字段都有契约断言。

### Task 45｜跨页面 E2E 与前端 CI

**当前缺口**

- 当前 `scripts/verify-*.mjs` 多数是源码/结构检查，不是真实浏览器端到端测试。
- CI 只有后端 workflow，未覆盖前端 typecheck、build、契约和关键浏览器流程。

**测试基础设施**

1. 安装并配置 Playwright；新增 `playwright.config.ts`、`e2e/fixtures`、`e2e/pages`、`e2e/specs`。
2. 演示模式测试使用固定 localStorage 初始化；真实 API 测试启动 FastAPI 测试库并运行 seed fixture。
3. 合成影像夹具包含 CT 单帧/多帧、MR、DX/CR、损坏文件和空间坐标明确的小体积；测试数据不得依赖个人本机路径。
4. 每个测试结束清理测试数据库和浏览器状态；不删除项目文件。

**必须覆盖的场景**

1. 医生登录→搜索患者→打开检查→AI→报告→返回影像，patientId/examinationId 不串号。
2. 报告草稿刷新恢复、离开提示、签署后只读、追加更正可见。
3. 医生退出→患者登录，profile、通知、AI 会话、工作标签和草稿不串号。
4. DICOM 有效/损坏/混合批次，检测不会卡死；上传取消、重试和部分成功可恢复。
5. 2D/MPR/3D 同一 finding 世界坐标一致；修改后刷新仍存在。
6. 切换检查时旧 AI/3D 异步结果不能覆盖新检查。
7. 归档、解除关联、权限撤销、404 和部分 API 失败状态正确。
8. 键盘主流程与中英文 390 px 布局回归。

**CI 修改**

1. 新增前端 workflow，依次运行 install、typecheck、全部 verify、contract、build。
2. Playwright 至少跑 Chromium；失败上传 trace、截图和控制台日志。
3. PostgreSQL 契约测试与 SQLite 单元测试分开显示；GPU/Orthanc 真实联调作为独立 job，不把缺少外部服务当单元测试通过。

**验收命令建议**

```bash
pnpm typecheck
pnpm test:p0
pnpm test:p1-consistency
pnpm test:volume
pnpm test:comparison
pnpm test:viewer-stability
pnpm test:docs
pnpm test:i18n
pnpm test:profile
pnpm test:contract
pnpm exec playwright test
pnpm build --outDir dist-v5-api-final-20260914
```

### Task 41｜包体积、首帧与内存性能

**已有实现**

- 路由和 2D/3D 大组件已经异步加载。
- 已设入口 350 KB、Cornerstone 3.6 MB、GLTF 650 KB 的产物预算。
- 最近一次构建约为入口 259,904 B、Cornerstone 3,447,827 B、GLTF 587,376 B，均在当前预算内。

**剩余步骤**

1. 用 Chrome Performance/Lighthouse 或 Playwright trace 记录：登录首页、首次打开 DICOM、再次打开同一 DICOM、首次 3D、再次 3D。
2. 每个场景记录请求瀑布、JS 下载/解析时间、首个可见切片时间、3D 首帧、峰值 JS heap、切换 20 次检查后的残留内存。
3. 确认登录和列表页面不会请求 Cornerstone、DICOM decoder、Three/GLTF 或 GLB。
4. 将 decoder Worker 初始化移动到首次进入阅片路由；进入患者检查页后可按空闲时段预加载 Worker，但不得下载完整模型。
5. GLB 使用服务端 Cache-Control、ETag 和内容哈希；UI 显示真实字节进度并允许取消。
6. 连续切检查后 WebGL renderer、texture、geometry、worker 和 object URL 数量回落到稳定基线。
7. 把性能数据写入 `docs/performance-baseline.md`，保留设备、浏览器、网络、样本大小和测试日期。

**验收目标**

- 登录/列表不下载阅片和 3D 包。
- 冷/热首帧均有可重复数据，热启动明确受缓存改善。
- 20 次切换后 heap 不持续线性增长，context/worker/object URL 无累积。
- `pnpm test:bundle-budget <新构建目录>` 通过。

### Task 16｜Orthanc DICOM 到业务 Examination 的正式链路

**已有实现**

- 迁移 `0016_dicom_business_links.py` 已建立 Patient→Study→Series→Instance/Frame。
- `backend/app/routers/dicom.py` 已支持带 patientId 上传、幂等关联和患者 Study 查询。
- `backend/tests/test_dicom_association.py` 已覆盖基本关联和防止跨患者重绑。

**当前缺口**

- Study/Series 状态停留在 `archived`，没有正式转换任务。
- `DicomSeries.medical_image_id` 没有回填，因此 catalog/Examination/AI/报告仍看不到该序列。
- 尚未在真实 Orthanc、压缩传输语法和跨浏览器场景联调。

**后端实现步骤**

1. 新增 `dicom_import_tasks`，字段至少含 study/series、status、phase、progress、attempt、error_code、error_message、started_at、finished_at；对同一 series 的活动任务加唯一约束。
2. 新增 `POST /dicom/series/{series_id}/convert` 和 `GET /dicom/import-tasks/{task_id}`；接口幂等，重复点击返回现有任务。
3. 抽象 `DicomConversionAdapter`，生产实现从 Orthanc 获取序列实例并按 ImagePositionPatient、ImageOrientationPatient、InstanceNumber 排序；校验 spacing、方向、尺寸、FrameOfReferenceUID 和传输语法。
4. CT/MR 转成服务端体积衍生文件，保留 affine、spacing、shape、study date、modality、source UIDs；普通 DX/CR 走二维序列模型，不能伪装成具有 HU/三维几何的 CT。
5. 转换成功时在同一事务创建 `MedicalImage`，回填 `DicomSeries.medical_image_id`，Study 状态在全部序列完成后变为 `ready`；失败变为 `failed` 并保留可重试错误。
6. 原始实例始终由 Orthanc 管理，衍生体积按现有 image storage 管理；审计中记录任务、Study、Series、MedicalImage 的关联。
7. 前端上传队列显示 archive→convert→ready 阶段；ready 后刷新患者检查列表并使用同一 examination/image ID 打开阅片、AI 和报告。

**真实样本矩阵**

- CT：单帧、多帧、无序实例、缺片、不同 spacing、压缩传输语法。
- MR：多序列、不同方向、不同 FrameOfReference。
- DX/CR：二维图像，明确不提供 MPR/3D/HU 工具。
- 损坏实例和混合患者 ID：部分失败可重试，不能错误归属。

**验收**

- 同一 CT 的上传队列、Study、Series、MedicalImage、Examination、AI task 和报告引用能追踪到一致 ID。
- 在另一浏览器登录后可查看服务端检查，不依赖 IndexedDB。
- 重复上传 SOPInstanceUID、重复点击转换和任务重试都不会产生重复 MedicalImage。

## 四、阶段门槛与最终发布检查

以下不是单独开发功能，但在对应任务完成后仍要逐项验证：

- 阶段 0：AI 串号、草稿丢失、资料串号、无效 DICOM、检测状态卡死均有自动回归。
- 阶段 1：概览→AI→报告→影像切换不丢患者；报告刷新不丢；2D/MPR/3D 落点一致。
- 阶段 2：切换医生/患者账号无残留；刷新状态一致；归档、签署和权限变化可追溯。
- 阶段 3：有效 DICOM 首帧可见；损坏/部分失败可恢复；连续切换无旧结果覆盖和显著内存增长。
- 阶段 4：390、768、1024、1440 四个视口通过；键盘能完成主流程；语言、状态和按钮反馈一致。
- 医生和患者两角色在演示、本地导入、真实 API 三种模式完成核心流程。
- PostgreSQL、Orthanc/DICOM 网关、GPU 模型均留下真实联调记录。
- CT、MR、DX/CR、单帧、多帧、压缩和损坏样本均记录结果。
- 构建、类型、单元、契约、浏览器测试全部通过。
- 报告签署、患者可见性和候选框空间位置由产品/临床负责人验收。
- README、版本索引、功能矩阵、回滚说明和已知限制更新完成。

## 五、给 API 编程代理的主提示词

```text
只修改以下工作副本：
/Users/123456p/Documents/ChatGPT/Medical Web Project/medical/V5-optimization-workcopy-20260913

不要修改只读基线 medical/V4-github-sync，不删除任何文件。读取 REMAINING-WORK-API-PLAN.md，按“推荐执行顺序”一次只完成一个 Task。开始前检查当前实现，避免重做已完成内容；修改后补充必要测试并运行该任务的验收命令。每个 Task 完成后更新 IMPLEMENTATION-STATUS.md、根目录 audit-2026-09-12/修改任务清单.md 和 cleaning-log.md，记录实际改动、测试结果、未解决依赖。不要因为外部 Orthanc/GPU 不可用而伪造通过记录；把外部联调单独列为待验证。构建输出到新的 dist-* 目录，不覆盖旧产物。
```
