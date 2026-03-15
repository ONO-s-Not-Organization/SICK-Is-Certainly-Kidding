# 进阶功能开发方案：智能吸附与表格尺寸自定义

## 1. 智能吸附系统 (Smart Snapping)

### 核心逻辑
- **吸附阈值**: 5px。
- **触发源**: 拖拽元素的 6 个点（左、中、右、上、中、下）。
- **目标源**: 
  - 画布 (Canvas) 的边缘和中心。
  - 其他所有元素的边缘和中心。
- **视觉反馈**: 在 `App.tsx` 中增加一个全屏的 SVG 图层，当触发吸附时显示水平或垂直的红色虚线。

### 技术实现
- 在 `useStore` 中增加 `guides` 状态，用于存储当前显示的参考线坐标。
- 在 `DraggableElement` 的 `onDrag` 回调中计算位移，判断是否进入吸附范围。
- 强制更新 `react-rnd` 的位置属性以实现“磁力”效果。

## 2. 表格行列尺寸自定义

### 数据结构更新
```typescript
interface TableData {
  rows: number;
  cols: number;
  data: string[][];
  rowHeights?: number[]; // 每行的高度 (px)
  colWidths?: number[];  // 每列的宽度 (px)
}
```

### 功能实现
- **TableEditor**: 
  - 渲染时读取 `colWidths` 和 `rowHeights`。
  - 单元格 `td` 的 `style` 动态绑定这些数值。
- **PropertyPanel**: 
  - 当选中表格时，增加“行列管理”板块。
  - 列出当前所有行/列，提供输入框实时修改像素值。

## 3. 进度安排
1. **第一步**: 升级 `useStore` 的数据模型，支持表格尺寸数据。
2. **第二步**: 实现吸附算法逻辑，并集成到 `DraggableElement`。
3. **第三步**: 编写 `GuideLines` 视觉反馈组件。
4. **第四步**: 在 `PropertyPanel` 中增加表格尺寸编辑 UI。
