import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ElementType = 'text' | 'image' | 'table'

export interface CellData {
  text: string
  colSpan?: number
  rowSpan?: number
  hidden?: boolean
  style?: React.CSSProperties
}

export interface TableData {
  rows: number
  cols: number
  data: CellData[][]
  colWidths?: number[]
  rowHeights?: number[]
}

export interface Element {
  id: string
  type: ElementType
  x: number
  y: number
  width: number | string
  height: number | string
  content: string | TableData
  style?: React.CSSProperties
  zIndex?: number
}

export interface CanvasSettings {
  fontFamily: string
  fontSize: number
  color: string
  fontWeight: string | number
}

interface EditorState {
  elements: Element[]
  selectedElementId: string | null
  tableSelection: { start: { r: number; c: number }; end: { r: number; c: number } } | null
  guides: { x?: number; y?: number }[]
  canvasSettings: CanvasSettings
  snapEnabled: boolean
  addElement: (type: ElementType, file?: File) => Promise<void>
  removeElement: (id: string) => void
  updateElement: (id: string, updates: Partial<Element>) => void
  setSelectedElement: (id: string | null) => void
  setTableSelection: (selection: { start: { r: number; c: number }; end: { r: number; c: number } } | null) => void
  setGuides: (guides: { x?: number; y?: number }[]) => void
  setSnapEnabled: (enabled: boolean) => void
  updateCanvasSettings: (updates: Partial<CanvasSettings>) => void
  applyCanvasSettingsToAll: () => void
  moveElement: (id: string, direction: 'forward' | 'backward' | 'front' | 'back') => void
  exportConfig: () => void
  importConfig: (file: File) => Promise<void>
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

export const useStore = create<EditorState>()(
  persist(
    (set, get) => ({
      elements: [],
      selectedElementId: null,
      tableSelection: null,
      guides: [],
      canvasSettings: {
        fontFamily: 'sans-serif',
        fontSize: 16,
        color: '#000000',
        fontWeight: 'normal'
      },
      snapEnabled: true,

      addElement: async (type, file) => {
        const id = crypto.randomUUID()
        const state = get()
        const maxZIndex = state.elements.reduce((max, el) => Math.max(max, el.zIndex || 0), 0)
        
        let newElement: Element = {
          id,
          type,
          x: 50,
          y: 50,
          width: type === 'table' ? 400 : 'auto',
          height: 'auto',
          content: '',
          style: {
            textAlign: 'left'
          },
          zIndex: maxZIndex + 1
        }

        if (type === 'text') {
          newElement.content = '请输入文字'
          newElement.style = {
            textAlign: 'left',
            fontWeight: 'normal'
          }
        } else if (type === 'table') {
          newElement.content = {
            rows: 3,
            cols: 3,
            data: [
              [{ text: '项' }, { text: '内容' }, { text: '备注' }],
              [{ text: '' }, { text: '' }, { text: '' }],
              [{ text: '' }, { text: '' }, { text: '' }]
            ],
            colWidths: [100, 200, 100],
            rowHeights: [40, 40, 40]
          }
        } else if (type === 'image') {
          if (file) {
            try {
              newElement.content = await fileToBase64(file)
            } catch (e) {
              newElement.content = 'https://via.placeholder.com/150'
            }
          } else {
            newElement.content = 'https://via.placeholder.com/150'
          }
          newElement.width = 150
          newElement.height = 150
        }

        set((state) => ({
          elements: [...state.elements, newElement],
          selectedElementId: id
        }))
      },

      removeElement: (id) => set((state) => ({
        elements: state.elements.filter((el) => el.id !== id),
        selectedElementId: state.selectedElementId === id ? null : state.selectedElementId
      })),

      updateElement: (id, updates) => set((state) => ({
        elements: state.elements.map((el) => el.id === id ? { ...el, ...updates } : el)
      })),

      setSelectedElement: (id) => set((state) => ({ 
        selectedElementId: id,
        tableSelection: state.selectedElementId !== id ? null : state.tableSelection 
      })),

      setTableSelection: (selection) => set({ tableSelection: selection }),

      setGuides: (guides) => set({ guides }),

      setSnapEnabled: (enabled) => set({ snapEnabled: enabled }),

      updateCanvasSettings: (updates) => set((state) => ({
        canvasSettings: { ...state.canvasSettings, ...updates }
      })),

      applyCanvasSettingsToAll: () => set((state) => ({
        elements: state.elements.map((el) => {
          if (el.type === 'text' || el.type === 'table') {
            const newStyle = { ...el.style }
            delete newStyle.fontFamily
            delete newStyle.fontSize
            delete newStyle.color
            delete newStyle.fontWeight
            return { ...el, style: newStyle }
          }
          return el
        })
      })),

      moveElement: (id, direction) => set((state) => {
        const index = state.elements.findIndex(el => el.id === id)
        if (index === -1) return state

        const newElements = [...state.elements]
        const element = newElements[index]
        const sortedByZ = [...state.elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
        const currentZ = element.zIndex || 0
        const currentIndexInZ = sortedByZ.findIndex(el => el.id === id)

        let targetZ = currentZ

        switch (direction) {
          case 'forward':
            if (currentIndexInZ < sortedByZ.length - 1) {
              const nextEl = sortedByZ[currentIndexInZ + 1]
              targetZ = (nextEl.zIndex || 0) + 1
            }
            break
          case 'backward':
            if (currentIndexInZ > 0) {
              const prevEl = sortedByZ[currentIndexInZ - 1]
              targetZ = Math.max(0, (prevEl.zIndex || 0) - 1)
            }
            break
          case 'front':
            const maxZ = Math.max(...state.elements.map(el => el.zIndex || 0))
            targetZ = maxZ + 1
            break
          case 'back':
            const minZ = Math.min(...state.elements.map(el => el.zIndex || 0))
            targetZ = Math.max(0, minZ - 1)
            break
        }

        return {
          elements: state.elements.map(el => el.id === id ? { ...el, zIndex: targetZ } : el)
        }
      }),

      exportConfig: () => {
        const state = get()
        const config = {
          elements: state.elements,
          canvasSettings: state.canvasSettings,
          version: '1.1.0',
          exportedAt: new Date().toISOString()
        }
        const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `诊断证明配置_${new Date().getTime()}.json`
        a.click()
        URL.revokeObjectURL(url)
      },

      importConfig: async (file) => {
        try {
          const text = await file.text()
          const config = JSON.parse(text)
          
          // 简单的结构验证
          if (config.elements && Array.isArray(config.elements) && config.canvasSettings) {
            // 确保每个元素都有 zIndex 和 ID
            const validatedElements = config.elements.map((el: any) => ({
              ...el,
              id: el.id || crypto.randomUUID(),
              zIndex: el.zIndex || 0
            }))

            set({
              elements: validatedElements,
              canvasSettings: config.canvasSettings,
              selectedElementId: null
            })
          } else {
            alert('无效的配置文件：缺少必要字段')
          }
        } catch (error) {
          console.error('导入配置失败:', error)
          alert('读取配置文件失败，请确保文件格式正确')
        }
      }
    }),
    {
      name: 'diagnostic-tool-storage',
      partialize: (state) => ({ 
        elements: state.elements,
        canvasSettings: state.canvasSettings,
        snapEnabled: state.snapEnabled
      }),
    }
  )
)
