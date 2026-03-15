# 项目清理与瘦身方案 (Cleanup & Optimization Plan)

该方案旨在清除项目中的冗余代码、无用文件及未使用的依赖项，提升项目的可维护性和整洁度。

## 1. 冗余文件清理 (File Cleanup)
- **删除** 根目录下的误触文件：`npm run dev` (空文件)。
- **迁移** `UpDateLog.txt` 到新建的 `docs/` 目录，并重命名为 `update_log.txt`。
- **整理** `plans/` 目录：
  - 新建 `plans/archive/` 目录。
  - 将所有已经实施或过时的 `.md` 计划文件移入 `archive/`。

## 2. 源代码优化 (Code Optimization)
- **清理死代码**：
  - 扫描 `src/` 下所有文件，移除大段的注释代码。
  - 移除 `TableEditor.tsx`、`App.tsx` 等文件中的临时调试打印（console.log）和未使用变量。
- **优化导入**：
  - 移除未使用的 `import` 语句。

## 3. 依赖项审计 (Dependency Audit)
- **识别未使用的包**：
  - `clsx`: 项目中未使用，建议移除。
  - `idb-keyval`: 项目中未使用（目前使用 zustand persist 默认存储），建议移除。
  - `tailwind-merge`: 项目中未使用，建议移除。
- **移除步骤**：
  - 确认代码中确实没有隐式引用。
  - 使用 `npm uninstall` 移除。

## 4. 任务清单 (TODO List)
- [ ] 删除根目录 `npm run dev` 文件。
- [ ] 创建 `docs/` 并迁移 `UpDateLog.txt`。
- [ ] 创建 `plans/archive/` 并迁移旧计划文件。
- [ ] 扫描并移除 `src/` 中的死代码和未使用导入。
- [ ] 卸载未使用的依赖项 (`clsx`, `idb-keyval`, `tailwind-merge`)。
- [ ] 运行 `npm run build` 确保清理后项目构建正常。

---
您是否同意该方案？如果同意，我将切换到 Code 模式开始执行。
