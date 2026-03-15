# MD3 升级与配置导入导出功能开发计划

此计划旨在将项目升级至原生 Material Design 3 风格，优化代码实现，并增加完整的配置导出/导入功能。

## 1. 技术栈变更
- **UI 组件库**: [@material/web](https://github.com/material-components/material-web) (Google 官方 MD3 Web Components)
- **图标**: Material Symbols
- **字体**: Roboto
- **状态管理**: 优化现有的 Zustand Store，增加导入导出 Action

## 2. 代码审计与优化
- **Store 优化**:
  - 增加 `importState` 和 `exportState` 方法。
  - 改进 `addElement` 逻辑，支持图片文件读取。
- **组件重构**:
  - `DraggableElement`: 优化性能，减少重渲染。
  - `TableEditor`: 简化复杂的表格操作逻辑。
  - `PropertyPanel`: 使用 MD3 组件重构，提升交互体验。

## 3. MD3 风格集成方案
- **自定义元素支持**: 在 Vite 配置中排除 `md-` 开头的标签，避免 React 报错。
- **主题化**: 使用 CSS Custom Properties 设置 MD3 调色板（Primary, Secondary, Surface 等）。
- **组件替换**:
  - `button` -> `md-filled-button` / `md-outlined-button` / `md-elevated-button`
  - `select` -> `md-filled-select`
  - `input` -> `md-outlined-text-field`
  - `header` -> `md-elevation` + 自定义布局
  - `aside` -> Navigation Rail 或标准的 MD3 侧边栏布局

## 4. 导入导出功能实现
### 4.1 导出 (Export)
- 序列化 Store 中的 `elements` 和 `canvasSettings`。
- 确保所有图片元素的内容为 Base64 编码的字符串。
- 生成 `.json` 文件并触发下载。

### 4.2 导入 (Import)
- 使用 `showOpenFilePicker` 或 `<input type="file">` 读取 JSON。
- 验证 JSON 格式。
- 将状态应用到 Zustand Store，触发 UI 重绘，完全还原编辑现场。

## 5. 任务分解 (TODO)

### 第一阶段：环境准备
- [ ] 安装 `@material/web` 依赖。
- [ ] 配置 `vite.config.ts` 以支持自定义元素。
- [ ] 在 `index.html` 中引入 Roboto 字体和 Material Symbols。

### 第二阶段：核心逻辑增强
- [ ] 优化 `src/store/useStore.ts`。
- [ ] 实现图片转 Base64 的工具函数。
- [ ] 实现导入导出的核心 Action。

### 第三阶段：UI 重构 (MD3)
- [ ] 重构 `App.tsx` 布局与顶部栏。
- [ ] 重构左侧添加元素面板。
- [ ] 重构右侧属性编辑面板。
- [ ] 优化画布与参考线的视觉效果。

### 第四阶段：功能完善与审计
- [ ] 审计并优化表格编辑器的交互逻辑。
- [ ] 确保导出/导入功能的稳定性。
- [ ] 进行视觉回归测试，确保符合 MD3 规范。
