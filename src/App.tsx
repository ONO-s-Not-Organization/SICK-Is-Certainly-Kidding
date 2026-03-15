import { useRef } from 'react'
import { 
  Download, 
  Trash2, 
  Image as ImageIcon, 
  Type, 
  Table as TableIcon, 
  Magnet, 
  Upload,
  Settings,
  FileJson
} from 'lucide-react'
import { useStore } from './store/useStore'
import { DraggableElement } from './components/DraggableElement'
import { PropertyPanel } from './components/PropertyPanel'
import { GuideLines } from './components/GuideLines'
import { toPng } from 'html-to-image'

// Import Material Web Components
import '@material/web/button/filled-button.js'
import '@material/web/button/outlined-button.js'
import '@material/web/button/text-button.js'
import '@material/web/button/elevated-button.js'
import '@material/web/iconbutton/icon-button.js'
import '@material/web/icon/icon.js'
import '@material/web/divider/divider.js'
import '@material/web/select/filled-select.js'
import '@material/web/select/select-option.js'
import '@material/web/textfield/outlined-text-field.js'
import '@material/web/switch/switch.js'
import '@material/web/elevation/elevation.js'

function App() {
  const { 
    elements, 
    addElement, 
    setSelectedElement, 
    setGuides, 
    canvasSettings, 
    updateCanvasSettings, 
    applyCanvasSettingsToAll,
    snapEnabled,
    setSnapEnabled,
    exportConfig,
    importConfig
  } = useStore()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const configInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      addElement('image', file)
    }
    e.target.value = ''
  }

  const handleConfigImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      importConfig(file)
    }
    e.target.value = ''
  }

  const exportImage = async () => {
    const canvas = document.getElementById('certificate-canvas')
    if (!canvas) return

    setSelectedElement(null)
    setGuides([])
    
    await new Promise(resolve => setTimeout(resolve, 150));

    if ((document as any).fonts) {
      await (document as any).fonts.ready;
    }

    try {
      const dataUrl = await toPng(canvas, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        filter: (node) => {
          if (node instanceof HTMLElement) {
            if (node.tagName === 'BUTTON' && node.classList.contains('bg-red-500')) return false;
            if (node.classList.contains('guide-line')) return false;
            if (node.classList.contains('react-resizable-handle')) return false;
            if (node.classList.contains('ring-2')) return false;
          }
          return true;
        }
      });
      
      const link = document.createElement('a')
      link.download = `诊断证明_${new Date().getTime()}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('导出图片失败:', error)
    }
  }

  return (
    <div 
      className="min-h-screen flex flex-col overflow-hidden" 
      style={{ backgroundColor: 'var(--md-sys-color-surface)' }}
      onClick={() => setSelectedElement(null)}
    >
      {/* 顶部工具栏 - MD3 Style */}
      <header className="h-16 flex items-center justify-between px-6 z-10 relative" style={{ backgroundColor: 'var(--md-sys-color-surface)', borderBottom: '1px solid var(--md-sys-color-outline-variant)' }}>
        <md-elevation></md-elevation>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-container rounded-lg text-primary">
            <Settings size={24} />
          </div>
          <h1 className="text-xl font-medium" style={{ color: 'var(--md-sys-color-on-surface)' }}>诊断证明生成工具</h1>
        </div>
        
        <div className="flex gap-3">
          <md-outlined-button onClick={exportConfig}>
            <md-icon slot="icon"><FileJson size={18}/></md-icon>
            导出配置
          </md-outlined-button>
          
          <md-outlined-button onClick={() => configInputRef.current?.click()}>
            <md-icon slot="icon"><Upload size={18}/></md-icon>
            导入配置
          </md-outlined-button>
          
          <md-filled-button onClick={exportImage}>
            <md-icon slot="icon"><Download size={18}/></md-icon>
            导出图片
          </md-filled-button>

          <md-text-button 
            onClick={() => {
              if (confirm('确定要清空所有内容吗？')) {
                useStore.setState({ elements: [], selectedElementId: null })
              }
            }}
            style={{ '--md-text-button-label-text-color': 'var(--md-sys-color-error)' }}
          >
            <md-icon slot="icon"><Trash2 size={18}/></md-icon>
            清空
          </md-text-button>
        </div>
      </header>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={configInputRef} 
        onChange={handleConfigImport} 
        accept=".json" 
        className="hidden" 
      />

      {/* 主界面 */}
      <main className="flex-1 flex overflow-hidden">
        {/* 左侧侧边栏 - MD3 Style */}
        <aside className="w-72 p-6 flex flex-col gap-6 overflow-y-auto" style={{ borderRight: '1px solid var(--md-sys-color-outline-variant)' }}>
          <div>
            <div className="text-xs font-bold mb-4 px-2" style={{ color: 'var(--md-sys-color-secondary)' }}>添加元素</div>
            <div className="grid grid-cols-1 gap-2">
              <md-elevated-button onClick={(e: any) => { e.stopPropagation(); addElement('text'); }}>
                <md-icon slot="icon"><Type size={18}/></md-icon>
                文本块
              </md-elevated-button>
              
              <md-elevated-button onClick={(e: any) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                <md-icon slot="icon"><ImageIcon size={18}/></md-icon>
                图片元素
              </md-elevated-button>
              
              <md-elevated-button onClick={(e: any) => { e.stopPropagation(); addElement('table'); }}>
                <md-icon slot="icon"><TableIcon size={18}/></md-icon>
                数据表格
              </md-elevated-button>
            </div>
          </div>

          <md-divider></md-divider>

          <div>
            <div className="text-xs font-bold mb-4 px-2" style={{ color: 'var(--md-sys-color-secondary)' }}>画布辅助</div>
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-variant/30">
              <div className="flex items-center gap-3">
                <Magnet size={18} />
                <span className="text-sm">吸附对齐</span>
              </div>
              <md-switch 
                selected={snapEnabled} 
                onInput={(e: any) => setSnapEnabled(e.target.selected)}
              ></md-switch>
            </div>
          </div>

          <md-divider></md-divider>

          <div>
            <div className="text-xs font-bold mb-4 px-2" style={{ color: 'var(--md-sys-color-secondary)' }}>默认字体样式</div>
            <div className="flex flex-col gap-4 p-4 rounded-2xl" style={{ backgroundColor: 'var(--md-sys-color-surface-container-low)' }}>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold ml-1" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>字体家族</label>
                <md-filled-select 
                  value={canvasSettings.fontFamily}
                  onInput={(e: any) => updateCanvasSettings({ fontFamily: e.target.value })}
                >
                  <md-select-option value="sans-serif">系统默认</md-select-option>
                  <md-select-option value="'FangSong', '仿宋', 'STFangsong'">仿宋</md-select-option>
                  <md-select-option value="'SimSun', '宋体'">宋体</md-select-option>
                  <md-select-option value="'KaiTi', '楷体', 'STKaiti'">楷体</md-select-option>
                  <md-select-option value="'SimHei', '黑体'">黑体</md-select-option>
                  <md-select-option value="'Microsoft YaHei', '微软雅黑'">微软雅黑</md-select-option>
                </md-filled-select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold ml-1" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>默认字号 (px)</label>
                <md-outlined-text-field 
                  type="number" 
                  value={canvasSettings.fontSize.toString()}
                  onInput={(e: any) => updateCanvasSettings({ fontSize: parseInt(e.target.value) || 12 })}
                ></md-outlined-text-field>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold ml-1" style={{ color: 'var(--md-sys-color-on-surface-variant)' }}>默认颜色</label>
                <div className="flex gap-2 items-center">
                  <input 
                    type="color" 
                    value={canvasSettings.color}
                    onChange={(e) => updateCanvasSettings({ color: e.target.value })}
                    className="flex-1 h-10 rounded-md border-0 p-0 overflow-hidden cursor-pointer"
                  />
                  <div className="text-xs font-mono uppercase">{canvasSettings.color}</div>
                </div>
              </div>

              <md-filled-button 
                className="mt-2"
                style={{ '--md-filled-button-container-color': 'var(--md-sys-color-secondary)' }}
                onClick={(e: any) => {
                  e.stopPropagation()
                  if (confirm('确定要将全局字体样式应用到所有现有元素吗？这将清除个别元素的字体覆盖。')) {
                    applyCanvasSettingsToAll()
                  }
                }}
              >
                应用到所有元素
              </md-filled-button>
            </div>
          </div>
        </aside>

        {/* 编辑区域 */}
        <div className="flex-1 overflow-auto p-12 flex justify-center bg-gray-200/50">
          <div 
            id="certificate-canvas"
            className="bg-white shadow-2xl relative"
            style={{ 
              width: '210mm', 
              minHeight: '297mm', 
              height: 'fit-content',
              fontFamily: canvasSettings.fontFamily,
              fontSize: `${canvasSettings.fontSize}px`,
              color: canvasSettings.color,
              fontWeight: canvasSettings.fontWeight
            }}
          >
            <div className="relative w-full h-full min-h-[297mm]">
               <GuideLines />
               {elements.map((el) => (
                 <DraggableElement key={el.id} element={el} />
               ))}
               {elements.length === 0 && (
                 <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none flex-col gap-4">
                    <md-icon style={{ fontSize: '48px', width: '48px', height: '48px' }}>add_circle_outline</md-icon>
                    <span className="text-lg">从左侧点击按钮添加内容</span>
                 </div>
               )}
            </div>
          </div>
        </div>

        {/* 右侧属性栏 */}
        <PropertyPanel />
      </main>
    </div>
  )
}

export default App
