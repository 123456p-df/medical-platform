# PulmoLink UI 状态与组件规范

## 设计令牌

- 间距使用 `--space-1` 至 `--space-6`，对应 4、8、12、16、20、24 px。
- 控件高度使用 `--control-sm`、`--control-md`；移动端主要触控入口使用 `--control-touch`。
- 卡片与弹层使用 `--radius`、`--radius-lg`，层级使用 `--layer-header`、`--layer-overlay`、`--layer-dialog`。
- 错误、警告、成功状态同时使用背景、边框、图标和文字，不依赖颜色单独表达。

## 异步状态

`StatePanel.vue` 是页面级加载、空数据、错误、部分成功和成功反馈的统一入口。加载状态设置 `aria-busy`；错误使用 `role="alert"`；其余变化通过礼貌状态播报。恢复动作放入 `actions` 插槽。

## 操作层级

每个卡片区域只保留一个 `.btn-primary`。浏览、筛选和返回使用 `.btn-secondary`，破坏性操作使用 `.btn-danger` 并与主要动作分开。图标按钮必须有可访问名称，执行中按钮应禁用并保留原操作上下文。

## 基础组件

- `AppButton.vue`：统一主按钮、次按钮、危险按钮和文字按钮的高度、禁用与加载状态。
- `FormField.vue`：统一标签、必填标记、提示文本和字段错误的可访问关系。
- `AppDialog.vue`：原生 `dialog` 封装，自动生成标题 ID，打开后聚焦首个表单控件。
- `StatusBadge.vue` / `RiskBadge.vue`：状态和风险不以颜色作为唯一语义。
- `StatePanel.vue`：页面与模块级 loading / empty / error / partial / success。

## 文案和数据

固定界面文案使用 `ui.*` 语义键；诊断、描述、患者姓名等临床原文不翻译。日期显示通过当前 locale 格式化，提交给接口的日期仍保持 ISO 格式。
