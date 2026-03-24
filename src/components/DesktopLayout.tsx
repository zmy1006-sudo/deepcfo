/**
 * DesktopLayout — 电脑端侧边栏布局（Sprint 8: 青色科技风）
 * 仅在 md 及以上屏幕显示
 */
import { Home, FileCheck, Wallet, User, MessageCircle } from 'lucide-react'

const DESKTOP_TABS = [
  { key: 'home',    icon: Home,        label: '首页' },
  { key: 'tax',     icon: FileCheck,   label: '报税' },
  { key: 'finance', icon: Wallet,      label: '财务' },
  { key: 'me',      icon: User,        label: '我的' },
] as const

interface Props {
  currentTab: string
  onNavigate: (tab: string) => void
  children: React.ReactNode
}

export default function DesktopLayout({ currentTab, onNavigate, children }: Props) {
  return (
    <div className="hidden md:flex" style={{ minHeight: '100vh' }}>
      {/* 侧边栏 */}
      <aside className="w-52 bg-white border-r border-slate-100 flex flex-col flex-shrink-0 shadow-[2px_0_12px_rgba(0,105,111,0.04)]">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00696f, #00f2ff)' }}>
              <span className="text-white font-bold text-sm font-['Space_Grotesk']">CF</span>
            </div>
            <span className="font-['Space_Grotesk'] font-bold text-base tracking-tight" style={{ color: '#191c1e' }}>DeepCFO</span>
          </div>
        </div>

        {/* 导航 */}
        <nav className="flex-1 py-4">
          {DESKTOP_TABS.map(({ key, icon: Icon, label }) => {
            const active = currentTab === key
            return (
              <button
                key={key}
                onClick={() => onNavigate(key)}
                className={`w-full px-5 py-2.5 flex items-center gap-3 text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary/10 text-primary font-semibold border-r-2 border-primary'
                    : 'text-slate-400 hover:text-primary hover:bg-slate-50'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            )
          })}
        </nav>

        {/* AI助手入口 */}
        <div className="border-t border-slate-100 p-4">
          <div className="text-xs font-semibold mb-1 px-1 uppercase tracking-wide" style={{ color: '#b9cacb' }}>快捷入口</div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer group"
            style={{ color: '#3a494b' }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(0,105,111,0.06)'; (e.currentTarget as HTMLDivElement).style.color = '#00696f' }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; (e.currentTarget as HTMLDivElement).style.color = '#3a494b' }}
          >
            <div className="w-6 h-6 rounded-md primary-gradient flex items-center justify-center">
              <MessageCircle size={13} className="text-white" />
            </div>
            <span className="font-medium">AI助手</span>
          </div>
        </div>

        {/* 版本 */}
        <div className="px-5 py-3 border-t border-slate-100">
          <div className="text-xs" style={{ color: '#b9cacb' }}>v1.0.0 · Sprint 8</div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-y-auto" style={{ background: '#f7f9fb' }}>
        {children}
      </main>
    </div>
  )
}
