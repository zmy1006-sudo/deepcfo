/**
 * TabBar — 底部导航栏（Sprint 8: 青色科技风）
 */
import { Home, FileCheck, Wallet, User } from 'lucide-react'

const TABS = [
  { key: 'home',    icon: Home,     label: '首页' },
  { key: 'tax',     icon: FileCheck, label: '报税' },
  { key: 'finance', icon: Wallet,   label: '财务' },
  { key: 'me',      icon: User,     label: '我的' },
] as const

type TabKey = typeof TABS[number]['key']

interface TabBarProps {
  currentTab?: string
  onNavigate?: (tab: TabKey) => void
}

export default function TabBar({ currentTab = 'home', onNavigate }: TabBarProps) {
  return (
    <nav className="
      md:hidden
      fixed bottom-0 left-0 w-full
      flex justify-around items-center
      px-4 pb-6 pt-3
      bg-white/80 backdrop-blur-2xl
      z-50
      rounded-t-[2rem]
      shadow-[0_-8px_30px_rgba(0,242,255,0.08)]
      border-t border-slate-200/30
    ">
      {TABS.map(({ key, icon: Icon, label }) => {
        const active = currentTab === key
        return (
          <button
            key={key}
            onClick={() => onNavigate?.(key)}
            className={`
              flex flex-col items-center gap-0.5 px-4 py-1
              ${active ? 'text-primary' : 'text-slate-400'}
              ${active ? 'bg-primary/10 rounded-2xl' : ''}
              transition-all active:scale-90 duration-150
            `}
          >
            <Icon size={22} />
            <span className="font-['Inter'] text-[11px] font-semibold uppercase tracking-wide">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
