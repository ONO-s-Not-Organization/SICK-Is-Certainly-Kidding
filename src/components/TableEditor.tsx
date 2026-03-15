import React, { useState, useEffect, useRef } from 'react'
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Merge, Trash2 } from 'lucide-react'
import { useStore, TableData } from '../store/useStore'
import { getColumnLabel } from '../utils/tableUtils'

// Import MD3 buttons for the floating toolbar
import '@material/web/iconbutton/icon-button.js'
import '@material/web/icon/icon.js'
import '@material/web/elevation/elevation.js'

interface TableEditorProps {
  content: TableData
  onChange: (newContent: TableData) => void
}

export const TableEditor: React.FC<TableEditorProps> = ({ content, onChange }) => {
  const { rows, cols, data, colWidths, rowHeights } = content
  const { tableSelection, setTableSelection, selectedElementId } = useStore()
  const [editingCell, setEditingCell] = useState<{ r: number; c: number } | null>(null)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const [resizingCol, setResizingCol] = useState<{ index: number; startX: number; startWidth: number } | null>(null)
  const [resizingRow, setResizingRow] = useState<{ index: number; startY: number; startHeight: number } | null>(null)

  const handleCellMouseDown = (r: number, c: number, shiftKey: boolean) => {
    setIsMouseDown(true)
    if (shiftKey && tableSelection) {
      setTableSelection({ start: tableSelection.start, end: { r, c } })
    } else {
      setTableSelection({ start: { r, c }, end: { r, c } })
    }
    setEditingCell(null)
  }

  const handleCellMouseEnter = (r: number, c: number) => {
    if (isMouseDown && tableSelection) {
      setTableSelection({ ...tableSelection, end: { r, c } })
    }
  }

  const handleMouseUp = () => {
    setIsMouseDown(false)
    setResizingCol(null)
    setResizingRow(null)
  }

  const handleColResizeStart = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    setResizingCol({
      index,
      startX: e.clientX,
      startWidth: colWidths?.[index] || 80
    })
  }

  const handleRowResizeStart = (e: React.MouseEvent, index: number) => {
    e.stopPropagation()
    setResizingRow({
      index,
      startY: e.clientY,
      startHeight: rowHeights?.[index] || 30
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizingCol) {
        const diff = e.clientX - resizingCol.startX
        const newWidths = colWidths ? [...colWidths] : Array(cols).fill(80)
        newWidths[resizingCol.index] = Math.max(20, resizingCol.startWidth + diff)
        onChange({ ...content, colWidths: newWidths })
      }
      if (resizingRow) {
        const diff = e.clientY - resizingRow.startY
        const newHeights = rowHeights ? [...rowHeights] : Array(rows).fill(30)
        newHeights[resizingRow.index] = Math.max(20, resizingRow.startHeight + diff)
        onChange({ ...content, rowHeights: newHeights })
      }
    }

    if (resizingCol || resizingRow) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [resizingCol, resizingRow, colWidths, rowHeights, cols, rows, onChange, content])

  const handleCellDoubleClick = (r: number, c: number) => {
    setEditingCell({ r, c })
  }

  const isCellSelected = (r: number, c: number) => {
    if (!tableSelection) return false
    const { start, end } = tableSelection
    const minR = Math.min(start.r, end.r)
    const maxR = Math.max(start.r, end.r)
    const minC = Math.min(start.c, end.c)
    const maxC = Math.max(start.c, end.c)
    return r >= minR && r <= maxR && c >= minC && c <= maxC
  }

  const isCellActive = (r: number, c: number) => {
    return tableSelection?.start.r === r && tableSelection?.start.c === c
  }

  const updateCell = (r: number, c: number, text: string) => {
    const newData = [...data.map(row => [...row])]
    newData[r][c] = { ...newData[r][c], text }
    onChange({ ...content, data: newData })
  }

  const deleteRow = (r: number) => {
    if (rows <= 1) return
    const newData = data.map(row => [...row])
    
    // 检查是否有跨行单元格穿过这一行
    for (let i = 0; i < r; i++) {
      for (let j = 0; j < cols; j++) {
        const cell = newData[i][j]
        if (cell.rowSpan && cell.rowSpan > 1) {
          if (i + cell.rowSpan > r) {
            // 穿过被删除的行，跨度减 1
            newData[i][j] = { ...cell, rowSpan: cell.rowSpan - 1 }
          }
        }
      }
    }

    // 处理被删除行本身就是跨度起点的情况
    for (let j = 0; j < cols; j++) {
      const cell = newData[r][j]
      if (cell.rowSpan && cell.rowSpan > 1) {
        // 将跨度属性转移到下一行的对应位置
        if (r + 1 < rows) {
          newData[r + 1][j] = { 
            ...cell, 
            rowSpan: cell.rowSpan - 1,
            hidden: false 
          }
        }
      }
    }

    const finalData = newData.filter((_, i) => i !== r)
    const newHeights = rowHeights?.filter((_, i) => i !== r)
    onChange({ ...content, data: finalData, rows: rows - 1, rowHeights: newHeights })
    setTableSelection(null)
  }

  const deleteCol = (c: number) => {
    if (cols <= 1) return
    const newData = data.map(row => [...row])

    // 检查是否有跨列单元格穿过这一列
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < c; j++) {
        const cell = newData[i][j]
        if (cell.colSpan && cell.colSpan > 1) {
          if (j + cell.colSpan > c) {
            newData[i][j] = { ...cell, colSpan: cell.colSpan - 1 }
          }
        }
      }
    }

    // 处理被删除列本身就是跨度起点的情况
    for (let i = 0; i < rows; i++) {
      const cell = newData[i][c]
      if (cell.colSpan && cell.colSpan > 1) {
        if (c + 1 < cols) {
          newData[i][c + 1] = { 
            ...cell, 
            colSpan: cell.colSpan - 1,
            hidden: false 
          }
        }
      }
    }

    const finalData = newData.map(row => row.filter((_, i) => i !== c))
    const newWidths = colWidths?.filter((_, i) => i !== c)
    onChange({ ...content, data: finalData, cols: cols - 1, colWidths: newWidths })
    setTableSelection(null)
  }

  const insertRow = (r: number, offset: number) => {
    const target = r + offset
    const newData = data.map(row => [...row])

    // 检查是否有跨行单元格穿过插入点
    for (let i = 0; i < (offset === 0 ? target : target - 1); i++) {
        for (let j = 0; j < cols; j++) {
            const cell = newData[i][j]
            if (cell.rowSpan && i + cell.rowSpan > (offset === 0 ? target - 1 : target - 1)) {
                // 仅当插入点在跨度中间时才增加跨度
                if (i + cell.rowSpan > target) {
                  newData[i][j] = { ...cell, rowSpan: cell.rowSpan + 1 }
                }
            }
        }
    }

    const newRow = Array.from({ length: cols }).map((_, j) => {
        // 如果插入点在某个跨行单元格中间，新行对应的位置应该是 hidden
        for (let i = 0; i < target; i++) {
            const cell = newData[i][j]
            if (cell.rowSpan && i + cell.rowSpan > target) {
                return { text: '', hidden: true }
            }
        }
        return { text: '' }
    })

    newData.splice(target, 0, newRow)
    const newHeights = rowHeights ? [...rowHeights] : Array(rows).fill(30)
    newHeights.splice(target, 0, 30)
    onChange({ ...content, data: newData, rows: rows + 1, rowHeights: newHeights })
  }

  const insertCol = (c: number, offset: number) => {
    const target = c + offset
    const newData = data.map(row => [...row])

    // 检查是否有跨列单元格穿过插入点
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < (offset === 0 ? target : target - 1); j++) {
            const cell = newData[i][j]
            if (cell.colSpan && j + cell.colSpan > target) {
                newData[i][j] = { ...cell, colSpan: cell.colSpan + 1 }
            }
        }
    }

    const finalData = newData.map((row) => {
        const newRow = [...row]
        let isHidden = false
        for (let j = 0; j < target; j++) {
            const cell = row[j]
            if (cell.colSpan && j + cell.colSpan > target) {
                isHidden = true
                break
            }
        }
        newRow.splice(target, 0, { text: '', hidden: isHidden })
        return newRow
    })

    const newWidths = colWidths ? [...colWidths] : Array(cols).fill(80)
    newWidths.splice(target, 0, 80)
    onChange({ ...content, data: finalData, cols: cols + 1, colWidths: newWidths })
  }

  const mergeCells = () => {
    if (!tableSelection) return
    const { start, end } = tableSelection
    const minR = Math.min(start.r, end.r)
    const maxR = Math.max(start.r, end.r)
    const minC = Math.min(start.c, end.c)
    const maxC = Math.max(start.c, end.c)

    if (minR === maxR && minC === maxC) return

    const newData = [...data.map(row => [...row])]
    const firstCell = newData[minR][minC]
    
    // 计算新的跨度
    const newRowSpan = (maxR - minR + 1)
    const newColSpan = (maxC - minC + 1)

    // 合并内容
    let mergedText = firstCell.text
    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (r === minR && c === minC) continue
        if (newData[r][c].text) {
          mergedText += (mergedText ? ' ' : '') + newData[r][c].text
        }
        newData[r][c] = { ...newData[r][c], hidden: true, text: '' }
      }
    }

    newData[minR][minC] = {
      ...firstCell,
      text: mergedText,
      rowSpan: newRowSpan,
      colSpan: newColSpan,
      hidden: false
    }

    onChange({ ...content, data: newData })
    setTableSelection({ start: { r: minR, c: minC }, end: { r: minR, c: minC } })
  }

  const splitCell = () => {
    if (!tableSelection) return
    const { r, c } = tableSelection.start
    const currentCell = data[r][c]
    if (!currentCell.colSpan && !currentCell.rowSpan) return

    const newData = [...data.map(row => [...row])]
    const rs = currentCell.rowSpan || 1
    const cs = currentCell.colSpan || 1

    for (let i = 0; i < rs; i++) {
      for (let j = 0; j < cs; j++) {
        newData[r + i][c + j] = { text: i === 0 && j === 0 ? currentCell.text : '', hidden: false, colSpan: 1, rowSpan: 1 }
      }
    }
    
    onChange({ ...content, data: newData })
  }

  return (
    <div className="flex flex-col group/table" ref={containerRef}>
      {/* MD3 Floating Toolbar */}
      {tableSelection && (
         <div className="flex gap-1 p-2 bg-surface shadow-lg rounded-2xl mb-2 z-30 absolute -top-16 left-0 border border-outline-variant items-center" style={{ backgroundColor: 'var(--md-sys-color-surface)' }}>
            <md-elevation></md-elevation>
            <div className="flex gap-1 border-r pr-1 mr-1 border-outline-variant">
              <md-icon-button onClick={() => insertRow(tableSelection.start.r, 0)} title="上方插入行">
                <md-icon><ArrowUp size={18} /></md-icon>
              </md-icon-button>
              <md-icon-button onClick={() => insertRow(tableSelection.start.r, 1)} title="下方插入行">
                <md-icon><ArrowDown size={18} /></md-icon>
              </md-icon-button>
              <md-icon-button onClick={() => deleteRow(tableSelection.start.r)} title="删除行">
                <md-icon><Trash2 size={18} style={{ color: 'var(--md-sys-color-error)' }}/></md-icon>
              </md-icon-button>
            </div>
            <div className="flex gap-1 border-r pr-1 mr-1 border-outline-variant">
              <md-icon-button onClick={() => insertCol(tableSelection.start.c, 0)} title="左侧插入列">
                <md-icon><ArrowLeft size={18} /></md-icon>
              </md-icon-button>
              <md-icon-button onClick={() => insertCol(tableSelection.start.c, 1)} title="右侧插入列">
                <md-icon><ArrowRight size={18} /></md-icon>
              </md-icon-button>
              <md-icon-button onClick={() => deleteCol(tableSelection.start.c)} title="删除列">
                <md-icon><Trash2 size={18} className="rotate-90" style={{ color: 'var(--md-sys-color-error)' }}/></md-icon>
              </md-icon-button>
            </div>
            <div className="flex gap-1">
              <md-icon-button onClick={mergeCells} title="合并单元格">
                <md-icon><Merge size={18} /></md-icon>
              </md-icon-button>
              <md-icon-button onClick={splitCell} title="拆分单元格">
                <md-icon><Merge size={18} className="rotate-180" /></md-icon>
              </md-icon-button>
            </div>
         </div>
      )}

      <div 
        className="grid border-2 border-black bg-white shadow-sm"
        style={{
          gridTemplateColumns: colWidths ? colWidths.map(w => `${w}px`).join(' ') : `repeat(${cols}, 1fr)`,
          width: colWidths ? colWidths.reduce((a, b) => a + b, 0) : '100%'
        }}
      >
        {data.map((row, r) => (
          row.map((cell, c) => {
            if (cell.hidden) return null
            
            const isSelected = isCellSelected(r, c)
            const isActive = isCellActive(r, c)
            const isEditing = editingCell?.r === r && editingCell?.c === c

            const cellStyle = cell.style || {}
            const textAlign = cellStyle.textAlign || 'center'
            const alignItems = cellStyle.alignItems || 'center'
            const justifyContent = textAlign === 'left' ? 'flex-start' : textAlign === 'right' ? 'flex-end' : 'center'

            return (
              <div
                key={`${r}-${c}`}
                className={`
                  relative border-black transition-colors
                  ${(c + (cell.colSpan || 1)) < cols ? 'border-r' : ''}
                  ${(r + (cell.rowSpan || 1)) < rows ? 'border-b' : ''}
                  ${isSelected ? 'bg-primary-container/30' : 'bg-white'}
                  ${isActive ? 'ring-2 ring-inset ring-primary z-10' : ''}
                `}
                style={{ 
                  gridColumn: `span ${cell.colSpan || 1}`,
                  gridRow: `span ${cell.rowSpan || 1}`,
                  height: rowHeights && rowHeights[r] ? (cell.rowSpan ? Array.from({length: cell.rowSpan}).reduce((acc: number, _, idx) => acc + (rowHeights[r+idx] || 30), 0) : rowHeights[r]) : 'auto',
                  minHeight: '32px',
                  display: 'flex',
                  alignItems: alignItems as any,
                  justifyContent: justifyContent,
                  '--tw-ring-color': 'var(--md-sys-color-primary)',
                  backgroundColor: isSelected ? 'var(--md-sys-color-primary-container)' : 'white',
                  opacity: isSelected ? 0.7 : 1,
                  ...cellStyle
                } as any}
                onMouseDown={(e) => handleCellMouseDown(r, c, e.shiftKey)}
                onMouseEnter={() => handleCellMouseEnter(r, c)}
                onDoubleClick={() => handleCellDoubleClick(r, c)}
              >
                {isEditing ? (
                  <input
                    autoFocus
                    className="w-full outline-none bg-white p-1 m-0"
                    style={{ 
                      textAlign: textAlign as any,
                      fontSize: cellStyle.fontSize,
                      fontWeight: cellStyle.fontWeight
                    }}
                    value={cell.text}
                    onChange={(e) => updateCell(r, c, e.target.value)}
                    onBlur={() => setEditingCell(null)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') setEditingCell(null)
                    }}
                  />
                ) : (
                  <div 
                    className="w-full px-1 break-all"
                    style={{ 
                      textAlign: textAlign as any,
                      fontSize: cellStyle.fontSize,
                      fontWeight: cellStyle.fontWeight
                    }}
                  >
                    {cell.text}
                  </div>
                )}
              </div>
            )
          })
        ))}
      </div>

      {selectedElementId && (
        <>
          <div className="absolute -left-8 top-0 flex flex-col opacity-0 group-hover/table:opacity-100 transition-opacity">
            <div className="h-0.5 w-8" />
            {Array.from({ length: rows }).map((_, i) => (
              <div 
                key={i} 
                style={{ height: rowHeights?.[i] || 30 }}
                className="w-8 flex items-center justify-center text-[10px] text-secondary font-mono relative border-r border-outline-variant"
              >
                {i + 1}
                <div 
                  className="absolute bottom-0 left-0 w-full h-1 cursor-ns-resize hover:bg-primary z-10"
                  onMouseDown={(e) => handleRowResizeStart(e, i)}
                />
              </div>
            ))}
          </div>
          <div className="absolute -top-8 left-0 flex opacity-0 group-hover/table:opacity-100 transition-opacity">
            {Array.from({ length: cols }).map((_, i) => (
              <div 
                key={i} 
                style={{ width: `calc(100% / ${cols})` }}
                className="h-8 flex items-center justify-center text-[10px] text-secondary font-mono relative border-b border-outline-variant"
              >
                {getColumnLabel(i)}
                <div 
                  className="absolute top-0 right-0 h-full w-1 cursor-ew-resize hover:bg-primary z-10"
                  onMouseDown={(e) => handleColResizeStart(e, i)}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
