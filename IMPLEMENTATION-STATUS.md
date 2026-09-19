# V5 优化实施状态

基线：`medical/V4-github-sync`。本目录是 2026-09-13 新建的独立优化副本；原主线和历史版本保持只读。

## 2026-09-14 续改：患者页面失败反馈

- 检查和报告页面新增加载状态、错误提示及重试入口，错误不再显示为空数据。
- 工作队列使用统一错误组件，重试清除旧操作错误，避免错误与空态同时显示。
- 类型、双语、无障碍结构、P1 一致性检查通过；桌面/移动 Playwright 9 项通过。
- 新生产构建 `dist-v5-resume-20260914-1/` 成功；本轮未重跑后端及真实 API 测试。
- 下文各批次记录为历史快照；当前外部验收依赖见“仍依赖真实环境”。

## 2026-09-14：API 代理剩余任务收尾

- [x] 28｜完成患者自助建档、医生邀请绑定和已有档案关联；新增迁移 `0017_patient_onboarding_and_archives`，包含邀请表、档案完成时间和归档事件表。
- [x] 31｜拆分医生移除和全局归档；管理员可填写原因、查询归档列表并恢复，普通医生只能移除自己的授权。
- [x] 34｜全量 `.vue` 用户可见文案迁移到中英双语；上传、阅片、MPR、3D、资料、报告、通知、AI、患者对话框和错误码均使用语义键或原文字典。解剖名称和 DICOM 临床原文保留原值。
- [x] 36｜头像与附件上传的演示模式真实文件回归、刷新恢复、账号隔离已进入 Playwright E2E。
- [x] 45｜新增 Playwright、Chrome 桌面与 390 px 移动回归；覆盖报告草稿、签署、患者可见性、建档、邀请绑定、归档恢复、资料上传、axe 关键路由和 CI workflow。
- [x] 47｜新增 OpenAPI 导出、`openapi-typescript` 生成类型、契约/mapper 校验和 mock factory；`pnpm test:contract` 会阻止提交过期契约。
- [x] 41｜保留入口 350 KB、Cornerstone 3.6 MB、GLTF 650 KB 预算；`docs/performance-baseline.md` 记录本机 Chrome 冷/热首帧、切换 20 次后的 heap 和重资源请求。
- [ ] 16｜DICOM Study/Series/Instance 关联与 `/dicom/series/{id}/convert` 已实现，合成 Orthanc 适配测试通过并回填 `medical_image_id`；真实 Orthanc NIfTI 服务和压缩传输语法尚未现场联调。
- [x] 35｜skip link、主 landmark、对话框名称、roving tabindex、focus-visible、状态播报、axe 关键路由、390 px 布局、200% 缩放和键盘打开患者主流程已通过。
- [x] 40｜`AppButton`、`FormField`、`AppDialog`、`StatePanel`、`StatusBadge`、`RiskBadge` 已建立；页面级空态/错误态迁移完成，阅片器保留专用的深色主题状态。

## 2026-09-14 验证结果

- `pnpm typecheck` 通过。
- `pnpm test:p0`、`test:p1-consistency`、`test:volume`、`test:comparison`、`test:viewer-stability`、`test:docs`、`test:i18n`、`test:profile`、`test:a11y`、`test:contract`、`test:migrations`、`test:bundle-budget` 全部通过。
- 后端完整测试 `66 passed`；本轮修改过的 Python 文件 Ruff 通过。
- Playwright `10 passed`：演示/移动 Chromium 9 项加真实 FastAPI+SQLite 1 项；含 axe serious/critical 清零、200% 缩放、键盘主流程和 390/768/1024/1440 px 视口。
- 最终生产构建到 `dist-v5-api-final-20260914-complete/`；入口 334028 B、Cornerstone 3447824 B、GLTFLoader 587376 B，均在预算内。
- Alembic 线性链校验通过；PostgreSQL 离线 `upgrade head --sql` 生成 642 行，包含 0017 的新表、字段和索引。

## 仍依赖真实环境

- 真实 PostgreSQL 部署执行 `alembic upgrade head`。
- 真实 Orthanc `/series/{id}/nifti` 与 DICOM 压缩传输语法。
- GPU 上的 NV-Segment-CT / VISTA3D 和 MONAI 肺结节模型。
- 人工键盘巡检仅作为发布前的补充复核；自动化 200% 缩放和关键键盘流程已覆盖。

## 已完成：第一批 P0

- [x] 01｜患者 ID 在路由、store 和页面层保持字符串；只有调用真实后端 AI 接口时才验证并转换数字 ID。
- [x] 02｜报告默认保存为草稿；签署前显示患者/检查确认；签署后表单只读；追加更正保留原文并同时显示在医生端和患者端报告卡片。
- [x] 03｜候选框拖动只做即时预览，指针释放后一次性保存完整体素/世界坐标、尺寸和修改原因；失败时重新加载服务端结果。
- [x] 04｜`ImageDTO` 映射保留 acquisition、affine、方向等空间数据；比较 DTO 同步保留 world matrix。
- [x] 05｜本地 DICOM 严格解析 Study/Series/SOP UID，拒绝伪 DICOM；按 StudyInstanceUID/SeriesInstanceUID 分组，按空间位置排序，检查矩阵/方向/间距/传输语法一致性，支持多帧展开，并在患者 ID 不一致时要求确认。

## 数据库与接口变化

- 新迁移：`backend/migrations/versions/0014_record_draft_default.py`，把新报告默认状态改为草稿。
- 新迁移：`backend/migrations/versions/0015_finding_revision.py`，为候选结果增加乐观锁版本号，过期编辑返回 `40908`。
- `RecordOut` 返回签署时间和更正列表；新增 `GET /medical-records/{id}/addenda`。
- finding PATCH 接受完整几何坐标组并要求修改原因及期望版本；审计快照记录修改前后坐标。

## 已执行验证

- `node scripts/verify-p0.mjs`：通过。
- `node node_modules/vue-tsc/bin/vue-tsc.js -b`：通过。
- `node scripts/verify-volume-renderer.mjs`：通过。
- `node scripts/verify-comparison.mjs`：通过。
- Vite 最终生产构建到 `dist-v5-final/`：通过；保留 Cornerstone 编解码器兼容和大分包既有警告。
- `backend/tests/verify_p0_contracts.py`：使用内存 SQLite，通过草稿→签署→禁止覆盖→追加更正，以及候选框几何保存→版本递增→拒绝过期编辑契约。
- 修改过的 Python 文件 Ruff 检查：通过。

## 已完成：第二批身份、持久化与业务一致性

- [x] 06｜新增账号、患者和检查维度的报告草稿存储；切页、刷新与关闭前保留未保存内容，标签显示 dirty 圆点，保存或重置后清理草稿。
- [x] 07｜普通注册只开放患者角色，医生账号明确进入管理员或邀请流程；用户名、密码和后端字段错误分别显示。
- [x] 08｜主动退出先撤销真实后端令牌，再统一清理会话、患者、资料、工作流、标签和草稿状态；跨窗口广播只传播退出事件。
- [x] 09｜演示资料使用 `role:id` 账号命名空间，顶栏、资料页和报告署名读取当前身份；异步资料请求使用 generation 防止旧账号结果回写。
- [x] 13｜远端批量上传提交时冻结患者、部位、类型、日期和文件队列；上传中锁定会改变当前批次的控件。
- [x] 15｜新增统一检查能力判断；演示和本地导入记录会禁用不可完成的 AI、分割和患者重建操作并显示原因。
- [x] 17｜IndexedDB 升级为元数据与文件 Blob 分离存储，按 patientId/examinationId 建索引；列表只读元数据，阅片时按检查延迟加载文件，并检查浏览器配额。
- [x] 26｜影像审核记录改为显式完成状态和时间；待办、影像和患者列表共用更新 action；报告签署不再隐式改变影像审核状态。
- [x] 27｜检查详情只显示 examinationId 精确关联的报告；编辑保留建议和关联；旧演示报告由精确检查补齐器官分类。
- [x] 29｜统一本地日历日期、DICOM 日期和文件名日期校验；检查日期使用 study date，“今日上传”使用 uploadedAt。
- [x] 30｜未知状态保持 Unknown，ABO 与 Rh 合并显示，工作台的待审核、异常和今日上传统计采用明确口径。
- [x] 32｜新增受身份保护的 404 和缺失检查页面；影像、报告、候选结果分模块容错；登录只接受校验后的站内 redirect。
- [x] 46｜前端保留取消原因并增加 30 秒超时、字段错误、重试标志和 requestId；后端响应补齐稳定领域错误码、fieldErrors、retryable 和 phase。

## 第二批验证

- `pnpm test:p0`、`pnpm test:p1-consistency`、`pnpm typecheck`、体积渲染和影像对比验证：全部通过。
- `backend/tests/verify_p1_contracts.py`：通过；本批后端文件 Ruff 检查：通过。
- Vite 最终生产构建到 `dist-v5-p1-final-verified/`：通过；保留 Cornerstone 编解码器浏览器 externalize 和大分包提示。
- 浏览器复测通过医生退出、患者登录、身份资料隔离、报告草稿恢复与离开确认、未知路由 404、报告器官分类和患者器官病历关联。

## 尚待执行

- 任务 28 仅完成演示注册同步建患者档案，受控邀请、已有档案核验绑定和完整建档引导仍待实现。
- 任务 31 已明确“全局归档”影响、修正刷新恢复和工作流过滤，但归档列表、原因/操作者审计和完整恢复入口仍待实现。
- 任务 16 已建立 Patient—DICOM Study—Series—Instance/Frame 持久化与查询边界，仍需接入真实 Orthanc 转换任务并把 `medical_image_id` 回填为可阅片 Examination，故暂不勾选。
- 阶段 4 的语言全页面覆盖、无障碍巡检、资料上传、组件规范和真实网络性能采样仍待继续；报告输出、后端分页、AI/通知入口整合、包体积预算和部署文档已完成。
- 尚未在真实 PostgreSQL、Orthanc/DICOM 网关、GPU 模型或真实设备 DICOM 环境执行联调。

## 已完成：第三批上传、阅片、三维与 AI 稳定性

- [x] 11｜Cornerstone 加载拆分初始化、注册、解码和渲染阶段，增加 30 秒诊断、就地重试、旧任务隔离及卸载清理。
- [x] 14｜远端上传逐项显示真实字节进度和服务端处理阶段，支持取消当前项、取消待上传项、失败项重试及部分成功汇总；本地队列支持逐文件排除并重新预检。
- [x] 18–22｜移除虚构病灶坐标与尺寸；按 CT/MRI/X-Ray 配置工具、单位、布局和 Cine；修复鼠标优先级与完整复位；十字光标按检查隔离并用 affine 世界坐标同步。
- [x] 23–25｜3D 和体积异步请求使用取消与 generation token；全部隐藏状态可恢复；AI taskId 按账号与检查持久化，断网后继续轮询。
- [x] 42–43｜递归释放几何、材质、纹理、环境贴图与 WebGL 上下文，处理 context lost/restored；模型来源与质量仅显示实际元数据。
- [x] 16｜新增迁移 `0016_dicom_business_links.py`、幂等归档关联和患者级 DICOM 清单；代码与合成适配完成，真实归档转体积联调仍待真实服务。

## 第三批验证

- `pnpm test:viewer-stability`、P0、P1、体积渲染、影像对比和 `pnpm typecheck` 全部通过。
- 后端完整测试 `60 passed`；本轮 DICOM 模型、路由、迁移和测试 Ruff 检查通过。
- Vite 生产构建通过；仍有 Cornerstone WASM 的 Node 模块 externalize 与大分包提示，已保留为任务 41。
- 浏览器验证 MRI 无伪 HU/窗位/坐标数据，缺坐标 finding 显示“无可定位数据”；X-Ray 使用单投影视图并禁用 HU、MPR、Cine、3D；检查切换同步 URL。

## 已完成：第四批首轮 UI 与交付入口

- [x] 33｜影像页患者摘要、审核栏和标签间距压缩；检查列表与上传面板改为可折叠侧栏，移动端不再先铺开完整上传表单。
- [x] 44｜README 分开说明演示、本地真实 API 与 Compose 三种模式，统一 Vite/FastAPI/Nginx 端口，修正迁移号和实际存在的 Compose 文件，并新增文档一致性脚本。
- [x] 48｜根目录新增 `VERSION-INDEX.md`，明确 V5 当前入口、V4 只读基线、历史快照、审查材料和演示文稿目录。
- [x] 35｜阅片快捷键边界、患者表格按钮、工作标签键盘导航、搜索/语言名称、skip link、主 landmark 和 axe 关键路由完成；全部路由人工巡检保留在“仍依赖真实环境”。
- [x] 41｜已建立入口 350 KB、Cornerstone 3.6 MB、GLTF 650 KB 的构建预算并验证独立懒加载块；本机冷/热首帧、重资源与 20 次切换 heap 已记录到性能基线。

## 第四批首轮验证

- 浏览器确认 1280 宽度影像页首屏可见主影像区域，检查列表可折叠，上传面板默认关闭。
- `pnpm test:docs`、`pnpm test:bundle-budget`、`pnpm test:viewer-stability` 和 `pnpm typecheck` 通过。
- 生产构建输出到 `dist-v5-stage4-smoke/`；入口 239031 B、Cornerstone 3447827 B、GLTFLoader 587376 B，均在当前预算内。

## 已完成：第四批第二轮报告、患者列表与 AI 入口

- [x] 37｜患者报告支持全文、器官和日期筛选；签署报告增加患者、检查、报告编号、医生、签署时间及更正记录的正式打印/PDF 版式。
- [x] 38｜真实 API 患者列表使用服务器分页、搜索、模态/器官/审核状态筛选和姓名/编号排序；300 ms 防抖并取消过期请求；页码和筛选写入 URL，浏览器返回可恢复位置。
- [x] 39｜浮动助手与独立 AI 页共用账号—患者—器官作用域的会话 store、配置状态、数字 ID 边界、取消和可打开引用；患者通知读取已签署报告并保存已读状态，医生通知继续使用统一审核队列。
- [x] 34｜已迁移全量 `.vue` 用户可见文案，包括上传、阅片、MPR、3D、资料、报告、通知、AI、患者对话框与稳定错误码；临床原文和解剖名称保留原值。
- [x] 40｜新增设计令牌、`AppButton`、`FormField`、`AppDialog`、`StatePanel`、`StatusBadge`、`RiskBadge` 与 `docs/ui-system.md`；页面级状态迁移完成，阅片器保留专用深色状态。

## 第四批第二轮验证

- 前端 P0、P1、体积、对比、阅片稳定性、文档和双语语义键检查全部通过；`vue-tsc` 通过。
- 后端完整测试 `61 passed`；患者分页、搜索、模态、器官、审核状态和排序契约包含在 `test_catalog.py`。
- 浏览器复测中英文报告页、工作标签、导航、AI 助手连接状态，以及患者新签署报告通知与精确锚点链接。
- 生产构建到 `dist-v5-stage4-second-20260914/`；入口 259904 B、Cornerstone 3447827 B、GLTFLoader 587376 B，均在预算内。

## 2026-09-15 至 2026-09-16：W01–W05 主链路

- W01：集中式导航键与唯一侧栏高亮；医生/患者侧栏共用同一规则。
- W02：稳定工作标签键、取消关闭草稿保护、统一检查上下文。
- W03：报告任务、状态、版本、签署与流程事件；AI finding 候选预览；报告关联审计脚本。
- W04：3D 页内嵌入并复用医学影像标签，保留旧独立 URL。
- W05/R09：候选框范围与临床测量分离；新增测量方法、状态和侧别证据。
- W05/R10：分割 manifest 与产物保留；取消模型/缓存自动删除。
- W05/R11：多厂商配置、AI Invocation/Attempt、能力 API、取消与候选采纳接口。
- W05/R11 管理侧：AI Provider 创建、更新、停用、列表与连通性探测 API。
- W05/R07 前端闭环：报告页 AI 草稿生成、候选预览和版本化采纳/追加。
- 本地模拟 AI：无 API key 时医生/患者助手和报告草稿可跑通，后续可切换真实 provider。
- AI 独立页面移除：医生“AI 辅助诊断”和患者“AI 助手”并入右下角统一助手。
- 报告页支持同一检查多份报告与“添加报告”入口。
- AI 助手会话历史本地持久化。
- 真实后端支持直接上传一组 DICOM 序列。
- W06：构建标识、发布前部署检查脚本和真实环境验收清单。

验证：后端 72 项测试、Playwright 18 项、前端逻辑/双语/可访问性/契约/迁移/文档和包体积全部通过；最新构建为 `dist-v5-dicom-entry-20260919/`。
