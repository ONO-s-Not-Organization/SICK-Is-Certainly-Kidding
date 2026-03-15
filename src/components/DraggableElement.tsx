import React, { useRef } from 'react'
import { Rnd } from 'react-rnd'
import { useStore, Element } from '../store/useStore'
import { X } from 'lucide-react'
import { TableEditor } from './TableEditor'

interface DraggableElementProps {
  element: Element
}

export const DraggableElement: React.FC<DraggableElementProps> = ({ element }) => {
  const { elements, updateElement, selectedElementId, setSelectedElement, removeElement, setGuides, snapEnabled } = useStore()
  const isSelected = selectedElementId === element.id
  
  const cachedTargets = useRef<{ x: number[]; y: number[] }>({ x: [], y: [] })
  const elementSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 })
  const snapStatus = useRef<{ x: number | null; y: number | null }>({ x: null, y: null })

  const prepareSnapTargets = () => {
    const el = document.querySelector(`[data-id="${element.id}"]`) as HTMLElement
    elementSize.current = { w: el?.offsetWidth || 0, h: el?.offsetHeight || 0 }

    const canvas = document.getElementById('certificate-canvas')
    const cw = canvas?.offsetWidth || 0
    const ch = canvas?.offsetHeight || 0

    const targetX: number[] = [0, cw / 2, cw, cw * 0.25, cw * 0.75]
    const targetY: number[] = [0, ch / 2, ch, ch * 0.25, ch * 0.75]

    elements.forEach((other) => {
      if (other.id === element.id) return
      const otherEl = document.querySelector(`[data-id="${other.id}"]`) as HTMLElement
      const ow = otherEl?.offsetWidth || 0
      const oh = otherEl?.offsetHeight || 0
      targetX.push(other.x, other.x + ow / 2, other.x + ow)
      targetY.push(other.y, other.y + oh / 2, other.y + oh)
    })

    cachedTargets.current = { x: targetX, y: targetY }
  }

  const handleDrag = (d: { x: number; y: number }) => {
    if (!snapEnabled) return d

    const snapThreshold = 6 
    const breakThreshold = 24 
    const guides: { x?: number; y?: number }[] = []
    
    let resultX = d.x
    let resultY = d.y

    const elW = elementSize.current.w
    const elH = elementSize.current.h

    // 计算当前元素的所有对齐点 (左, 中, 右, 上, 中, 下)
    const myX = [d.x, d.x + elW / 2, d.x + elW]
    const myY = [d.y, d.y + elH / 2, d.y + elH]

    const { x: targetX, y: targetY } = cachedTargets.current

    // --- 水平吸附逻辑 (X轴) ---
    let bestX: number | null = null
    let minDiffX = snapThreshold

    myX.forEach((mx, i) => {
      targetX.forEach((tx) => {
        const diff = Math.abs(mx - tx)
        if (diff < minDiffX) {
          minDiffX = diff
          bestX = tx - (i * elW) / 2
          guides.push({ x: tx })
        }
      })
    })

    // 实现粘滞感：如果之前已经吸附，且当前移动距离未达到突破阈值，则保持吸附
    if (snapStatus.current.x !== null) {
      if (Math.abs(d.x - snapStatus.current.x) < breakThreshold) {
        resultX = snapStatus.current.x
        // 重新添加参考线
        const lastGuideX = guides.find(g => g.x !== undefined)
        if (!lastGuideX) {
            // 尝试找回对应的参考线
            [0, 1, 2].forEach((i) => {
                targetX.forEach(tx => {
                    if (Math.abs(tx - (snapStatus.current.x! + (i * elW) / 2)) < 1) guides.push({x: tx})
                })
            })
        }
      } else {
        snapStatus.current.x = null // 突破吸附
      }
    } else if (bestX !== null) {
      resultX = bestX
      snapStatus.current.x = bestX
    }

    // --- 垂直吸附逻辑 (Y轴) ---
    let bestY: number | null = null
    let minDiffY = snapThreshold

    myY.forEach((my, i) => {
      targetY.forEach((ty) => {
        const diff = Math.abs(my - ty)
        if (diff < minDiffY) {
          minDiffY = diff
          bestY = ty - (i * elH) / 2
          guides.push({ y: ty })
        }
      })
    })

    if (snapStatus.current.y !== null) {
      if (Math.abs(d.y - snapStatus.current.y) < breakThreshold) {
        resultY = snapStatus.current.y
        const lastGuideY = guides.find(g => g.y !== undefined)
        if (!lastGuideY) {
            [0, 1, 2].forEach((i) => {
                targetY.forEach(ty => {
                    if (Math.abs(ty - (snapStatus.current.y! + (i * elH) / 2)) < 1) guides.push({y: ty})
                })
            })
        }
      } else {
        snapStatus.current.y = null
      }
    } else if (bestY !== null) {
      resultY = bestY
      snapStatus.current.y = bestY
    }

    setGuides(guides)
    return { x: resultX, y: resultY }
  }

  const renderContent = () => {
    switch (element.type) {
      case 'text':
        return (
          <div
            contentEditable
            suppressContentEditableWarning
            className="w-full h-full outline-none p-1"
            style={element.style}
            onBlur={(e) => updateElement(element.id, { content: e.currentTarget.innerText })}
          >
            {element.content as string}
          </div>
        )
      case 'image':
        return (
          <div className="w-full h-full relative" style={element.style}>
            <img
              src={element.content as string}
              alt="element"
              className="w-full h-full object-contain pointer-events-none border border-transparent group-hover:border-gray-300"
            />
          </div>
        )
      case 'table':
        return (
          <TableEditor 
            content={element.content as any} 
            onChange={(newContent) => updateElement(element.id, { content: newContent })}
          />
        )
      default:
        return null
    }
  }

  return (
    <Rnd
      size={{ width: element.width, height: element.height }}
      position={{ x: element.x, y: element.y }}
      data-id={element.id}
      lockAspectRatio={element.type === 'image'}
      onDragStart={() => {
        prepareSnapTargets()
      }}
      onDrag={(_, d) => {
        const snapped = handleDrag(d)
        updateElement(element.id, { x: snapped.x, y: snapped.y })
      }}
      onDragStop={() => {
        setGuides([])
        snapStatus.current = { x: null, y: null }
      }}
      onResizeStop={(_, __, ref, ___, position) => {
        updateElement(element.id, {
          width: ref.offsetWidth,
          height: ref.offsetHeight,
          ...position,
        })
      }}
      bounds="parent"
      className={`group transition-shadow ${isSelected ? 'shadow-lg ring-2' : 'hover:ring-1 hover:ring-outline-variant'}`}
      style={{ 
        zIndex: element.zIndex || 0,
        overflow: 'visible',
        '--tw-ring-color': isSelected ? 'var(--md-sys-color-primary)' : 'var(--md-sys-color-outline-variant)'
      } as any}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedElement(element.id)
      }}
    >
      <div className="relative w-full h-full">
        {isSelected && (
          <button
            className="absolute -top-3 -right-3 w-6 h-6 flex items-center justify-center rounded-full shadow-md z-10 transition-transform hover:scale-110 active:scale-90"
            style={{ backgroundColor: 'var(--md-sys-color-error)', color: 'var(--md-sys-color-on-error)' }}
            onClick={(e) => {
              e.stopPropagation()
              removeElement(element.id)
            }}
          >
            <X size={14} />
          </button>
        )}
        {renderContent()}
      </div>
    </Rnd>
  )
}
