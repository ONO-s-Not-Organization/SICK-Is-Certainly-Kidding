import React from 'react'
import { useStore, TableData } from '../store/useStore'
import { getColumnLabel } from '../utils/tableUtils'
import { 
  Trash2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Bold, 
  MousePointer2,
  Table as TableIcon,
  ImageIcon as LucideImageIcon,
  Type as TypeIcon,
  Layers,
  ChevronUp,
  ChevronDown,
  ArrowUpToLine,
  ArrowDownToLine
} from 'lucide-react'

// MD3 components
import '@material/web/textfield/outlined-text-field.js'
import '@material/web/select/filled-select.js'
import '@material/web/select/select-option.js'
import '@material/web/button/filled-button.js'
import '@material/web/button/outlined-button.js'
import '@material/web/button/text-button.js'
import '@material/web/iconbutton/icon-button.js'
import '@material/web/divider/divider.js'
import '@material/web/slider/slider.js'

export const PropertyPanel: React.FC = () => {
  const { 
    elements, 
    selectedElementId, 
    updateElement, 
    removeElement, 
    canvasSettings,
    tableSelection,
    setTableSelection,
    moveElement
  } = useStore()
  
  const selectedElement = elements.find((el) => el.id === selectedElementId)

  if (!selectedElement) {
    return (
      <aside 
        className="w-80 p-6 flex flex-col items-center justify-center text-center gap-4"
        style={{ borderLeft: '1px solid var(--md-sys-color-outline-variant)', backgroundColor: 'var(--md-sys-color-surface)' }}
      >
        <div className="w-16 h-16 rounded-full bg-surface-variant flex items-center justify-center text-secondary">
          <MousePointer2 size={32} />
        </div>
        <div>
          <h3 className="text-lg font-medium" style={{ color: 'var(--md-sys-color-on-surface)' }}>未选择元素</h3>
          <p className="text-sm" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>点击画布上的元素进行编辑</p>
        </div>
      </aside>
    )
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result
        if (typeof result === 'string') {
          updateElement(selectedElement.id, { content: result })
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const tableData = selectedElement.type === 'table' ? selectedElement.content as TableData : null

  return (
    <aside 
      className="w-80 p-6 flex flex-col gap-6 overflow-y-auto"
      style={{ borderLeft: '1px solid var(--md-sys-color-outline-variant)', backgroundColor: 'var(--md-sys-color-surface)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            {selectedElement.type === 'text' && <TypeIcon size={20} className="text-primary"/>}
            {selectedElement.type === 'image' && <LucideImageIcon size={20} className="text-primary"/>}
            {selectedElement.type === 'table' && <TableIcon size={20} className="text-primary"/>}
            <h2 className="text-lg font-medium" style={{ color: 'var(--md-sys-color-on-surface)' }}>属性设置</h2>
        </div>
        <md-icon-button onClick={() => removeElement(selectedElement.id)}>
          <md-icon><Trash2 size={20} style={{ color: 'var(--md-sys-color-error)' }}/></md-icon>
        </md-icon-button>
      </div>

      <md-divider></md-divider>

      {/* 文本属性 */}
      {selectedElement.type === 'text' && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold" style={{ color: 'var(--md-sys-color-secondary)' }}>字体家族</label>
              {selectedElement.style?.fontFamily && (
                <md-text-button 
                  onClick={() => {
                    const newStyle = { ...selectedElement.style }
                    delete newStyle.fontFamily
                    updateElement(selectedElement.id, { style: newStyle })
                  }}
                  style={{ '--md-text-button-label-text-size': '10px' }}
                >重置</md-text-button>
              )}
            </div>
            <md-filled-select 
              value={selectedElement.style?.fontFamily as string || ''}
              onInput={(e: any) => updateElement(selectedElement.id, { 
                style: { ...selectedElement.style, fontFamily: e.target.value } 
              })}
            >
              <md-select-option value="">
                <div slot="headline">跟随全局</div>
              </md-select-option>
              <md-select-option value="'FangSong', '仿宋', 'STFangsong'">
                <div slot="headline">仿宋</div>
              </md-select-option>
              <md-select-option value="'SimSun', '宋体'">
                <div slot="headline">宋体</div>
              </md-select-option>
              <md-select-option value="'KaiTi', '楷体', 'STKaiti'">
                <div slot="headline">楷体</div>
              </md-select-option>
              <md-select-option value="'SimHei', '黑体'">
                <div slot="headline">黑体</div>
              </md-select-option>
              <md-select-option value="'Microsoft YaHei', '微软雅黑'">
                <div slot="headline">微软雅黑</div>
              </md-select-option>
            </md-filled-select>
          </div>

          <div className="flex flex-col gap-2">
             <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold" style={{ color: 'var(--md-sys-color-secondary)' }}>字体大小 (px)</label>
              {selectedElement.style?.fontSize && (
                <md-text-button 
                  onClick={() => {
                    const newStyle = { ...selectedElement.style }
                    delete newStyle.fontSize
                    updateElement(selectedElement.id, { style: newStyle })
                  }}
                  style={{ '--md-text-button-label-text-size': '10px' }}
                >重置</md-text-button>
              )}
            </div>
            <md-outlined-text-field 
              type="number" 
              value={(selectedElement.style?.fontSize ? parseInt(selectedElement.style.fontSize as string) : canvasSettings.fontSize).toString()}
              onInput={(e: any) => updateElement(selectedElement.id, { 
                style: { ...selectedElement.style, fontSize: `${e.target.value}px` } 
              })}
            ></md-outlined-text-field>
          </div>

          <div className="flex flex-col gap-2">
             <div className="flex items-center justify-between px-1">
              <label className="text-xs font-bold" style={{ color: 'var(--md-sys-color-secondary)' }}>字体颜色</label>
              {selectedElement.style?.color && (
                <md-text-button 
                  onClick={() => {
                    const newStyle = { ...selectedElement.style }
                    delete newStyle.color
                    updateElement(selectedElement.id, { style: newStyle })
                  }}
                  style={{ '--md-text-button-label-text-size': '10px' }}
                >重置</md-text-button>
              )}
            </div>
            <div className="flex gap-3 items-center p-3 rounded-xl" style={{ backgroundColor: 'var(--md-sys-color-surface-container-highest)' }}>
              <input 
                type="color" 
                value={selectedElement.style?.color as string || canvasSettings.color}
                onChange={(e) => updateElement(selectedElement.id, { 
                  style: { ...selectedElement.style, color: e.target.value } 
                })}
                className="w-10 h-10 rounded-full border-0 p-0 overflow-hidden cursor-pointer"
              />
              <div className="flex-1 text-sm font-mono uppercase font-bold">{selectedElement.style?.color as string || canvasSettings.color}</div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold px-1" style={{ color: 'var(--md-sys-color-secondary)' }}>样式与对齐</label>
            <div className="flex gap-2 flex-wrap">
              <md-outlined-button
                onClick={() => {
                  const currentWeight = selectedElement.style?.fontWeight;
                  const newWeight = (currentWeight === 'bold' || currentWeight === 700) ? 'normal' : 'bold';
                  updateElement(selectedElement.id, { 
                    style: { ...selectedElement.style, fontWeight: newWeight } 
                  });
                }}
                className={ (selectedElement.style?.fontWeight === 'bold' || selectedElement.style?.fontWeight === 700) ? 'bg-secondary-container' : ''}
              >
                <md-icon slot="icon"><Bold size={16} /></md-icon>
                加粗
              </md-outlined-button>
              
              <div className="flex bg-surface-container-high rounded-full p-1 gap-1">
                {[
                  { icon: AlignLeft, value: 'left' },
                  { icon: AlignCenter, value: 'center' },
                  { icon: AlignRight, value: 'right' }
                ].map((item) => (
                  <md-icon-button
                    key={item.value}
                    onClick={() => updateElement(selectedElement.id, { 
                      style: { ...selectedElement.style, textAlign: item.value as any } 
                    })}
                    style={selectedElement.style?.textAlign === item.value ? { backgroundColor: 'var(--md-sys-color-primary-container)', color: 'var(--md-sys-color-on-primary-container)' } : {}}
                  >
                    <md-icon><item.icon size={18} /></md-icon>
                  </md-icon-button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 图片属性 */}
      {selectedElement.type === 'image' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold px-1" style={{ color: 'var(--md-sys-color-secondary)' }}>透明度</label>
            <div className="flex items-center gap-4 px-2">
              <md-slider 
                min="0" 
                max="100" 
                value={(selectedElement.style?.opacity !== undefined ? Number(selectedElement.style.opacity) : 1) * 100}
                onInput={(e: any) => updateElement(selectedElement.id, { 
                  style: { ...selectedElement.style, opacity: Number(e.target.value) / 100 } 
                })}
              ></md-slider>
              <span className="text-sm font-bold w-10 text-right">
                {Math.round((selectedElement.style?.opacity !== undefined ? Number(selectedElement.style.opacity) : 1) * 100)}%
              </span>
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold px-1" style={{ color: 'var(--md-sys-color-secondary)' }}>更换图片</label>
            <md-filled-button onClick={() => document.getElementById('prop-image-upload')?.click()}>
              <md-icon slot="icon"><LucideImageIcon size={18}/></md-icon>
              选择文件
            </md-filled-button>
            <input 
              id="prop-image-upload"
              type="file" 
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>
      )}

      {/* 表格属性 */}
      {selectedElement.type === 'table' && tableData && (
        <div className="flex flex-col gap-6">
          {tableSelection && (
            <div className="flex flex-col gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'var(--md-sys-color-secondary-container)', color: 'var(--md-sys-color-on-secondary-container)' }}>
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  选定区域
                </div>
                <md-text-button 
                  onClick={() => setTableSelection(null)}
                  style={{ '--md-text-button-label-text-size': '10px' }}
                >取消</md-text-button>
              </div>
              
              <div className="flex flex-col gap-2">
                <md-outlined-text-field 
                  label="单元格内容"
                  type="textarea"
                  rows={2}
                  value={tableData.data[tableSelection.start.r][tableSelection.start.c].text}
                  onInput={(e: any) => {
                    const newData = [...tableData.data.map((row) => [...row])]
                    newData[tableSelection.start.r][tableSelection.start.c] = { 
                      ...newData[tableSelection.start.r][tableSelection.start.c], 
                      text: e.target.value 
                    }
                    updateElement(selectedElement.id, { 
                      content: { ...tableData, data: newData } 
                    })
                  }}
                ></md-outlined-text-field>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <md-outlined-button 
                    onClick={() => {
                        const { start, end } = tableSelection
                        const minR = Math.min(start.r, end.r); const maxR = Math.max(start.r, end.r)
                        const minC = Math.min(start.c, end.c); const maxC = Math.max(start.c, end.c)
                        const newData = [...tableData.data.map((row) => [...row])]
                        const firstCell = tableData.data[minR][minC];
                        const newWeight = (firstCell.style?.fontWeight === 'bold' || firstCell.style?.fontWeight === 700) ? 'normal' : 'bold';
                        for (let r = minR; r <= maxR; r++) { for (let c = minC; c <= maxC; c++) { newData[r][c] = { ...newData[r][c], style: { ...newData[r][c].style, fontWeight: newWeight } } } }
                        updateElement(selectedElement.id, { content: { ...tableData, data: newData } })
                    }}
                    style={{ '--md-outlined-button-container-shape': '8px' }}
                  >
                    <md-icon slot="icon"><Bold size={14}/></md-icon>
                    粗体
                  </md-outlined-button>

                  <div className="flex bg-surface-container-high rounded-lg p-1 gap-0.5">
                    {[
                      { icon: AlignLeft, value: 'left' },
                      { icon: AlignCenter, value: 'center' },
                      { icon: AlignRight, value: 'right' }
                    ].map((item) => (
                      <md-icon-button
                        key={item.value}
                        onClick={() => {
                          const { start, end } = tableSelection
                          const minR = Math.min(start.r, end.r); const maxR = Math.max(start.r, end.r)
                          const minC = Math.min(start.c, end.c); const maxC = Math.max(start.c, end.c)
                          const newData = [...tableData.data.map((row) => [...row])]
                          for (let r = minR; r <= maxR; r++) { for (let c = minC; c <= maxC; c++) { newData[r][c] = { ...newData[r][c], style: { ...newData[r][c].style, textAlign: item.value as any } } } }
                          updateElement(selectedElement.id, { content: { ...tableData, data: newData } })
                        }}
                      >
                        <md-icon><item.icon size={16}/></md-icon>
                      </md-icon-button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <label className="text-xs font-bold px-1" style={{ color: 'var(--md-sys-color-secondary)' }}>行列调整</label>
            <div className="flex flex-col gap-3 p-4 rounded-2xl bg-surface-container-low">
                <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-on-surface-variant">列宽 (px)</span>
                    <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                        {tableData.colWidths?.map((width: number, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="text-[10px] w-6 font-mono">{getColumnLabel(i)}</span>
                                <md-outlined-text-field 
                                    type="number"
                                    value={width.toString()}
                                    onInput={(e: any) => {
                                        const newWidths = [...(tableData.colWidths || [])]
                                        newWidths[i] = parseInt(e.target.value) || 0
                                        updateElement(selectedElement.id, { content: { ...tableData, colWidths: newWidths } })
                                    }}
                                    style={{ '--md-outlined-text-field-container-shape': '4px', flex: 1 }}
                                ></md-outlined-text-field>
                            </div>
                        ))}
                    </div>
                </div>
                <md-divider></md-divider>
                <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-bold text-on-surface-variant">行高 (px)</span>
                    <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
                        {tableData.rowHeights?.map((height: number, i: number) => (
                            <div key={i} className="flex items-center gap-2">
                                <span className="text-[10px] w-6 font-mono">{i+1}</span>
                                <md-outlined-text-field 
                                    type="number"
                                    value={height.toString()}
                                    onInput={(e: any) => {
                                        const newHeights = [...(tableData.rowHeights || [])]
                                        newHeights[i] = parseInt(e.target.value) || 0
                                        updateElement(selectedElement.id, { content: { ...tableData, rowHeights: newHeights } })
                                    }}
                                    style={{ '--md-outlined-text-field-container-shape': '4px', flex: 1 }}
                                ></md-outlined-text-field>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto pt-6 border-t" style={{ borderTopColor: 'var(--md-sys-color-outline-variant)' }}>
        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-3 flex items-center gap-2">
            <Layers size={12} />
            图层管理
        </div>
        <div className="flex justify-between items-center mb-6 bg-surface-container-low p-2 rounded-2xl">
            <md-icon-button onClick={() => moveElement(selectedElement.id, 'front')} title="置于顶层">
                <md-icon><ArrowUpToLine size={18}/></md-icon>
            </md-icon-button>
            <md-icon-button onClick={() => moveElement(selectedElement.id, 'forward')} title="上移一层">
                <md-icon><ChevronUp size={18}/></md-icon>
            </md-icon-button>
            <md-icon-button onClick={() => moveElement(selectedElement.id, 'backward')} title="下移一层">
                <md-icon><ChevronDown size={18}/></md-icon>
            </md-icon-button>
            <md-icon-button onClick={() => moveElement(selectedElement.id, 'back')} title="置于底层">
                <md-icon><ArrowDownToLine size={18}/></md-icon>
            </md-icon-button>
        </div>

        <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-3">元素元数据</div>
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-surface-container-lowest text-[11px] font-mono" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
          <div className="flex justify-between"><span>ID</span><span className="text-secondary">{selectedElement.id}</span></div>
          <div className="flex justify-between"><span>坐标</span><span className="text-secondary">{Math.round(selectedElement.x)}, {Math.round(selectedElement.y)}</span></div>
          <div className="flex justify-between"><span>尺寸</span><span className="text-secondary">{typeof selectedElement.width === 'number' ? Math.round(selectedElement.width) : selectedElement.width} x {typeof selectedElement.height === 'number' ? Math.round(selectedElement.height) : selectedElement.height}</span></div>
        </div>
      </div>
    </aside>
  )
}
