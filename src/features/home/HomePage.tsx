/**
 * HomePage — 首页Tab（Sprint 8: 青色科技风）
 */
import { FileCheck, Users, FileText, AlertTriangle, BarChart2, Bell, Camera } from 'lucide-react'

const QUICK_ACTIONS = [
  { icon: '📋', label: '报税',    color: 'bg-teal-50',       textColor: 'text-teal-600',  tab: 'tax' },
  { icon: '📷', label: '拍发票',  color: 'bg-cyan-50',       textColor: 'text-cyan-600',  tab: 'chat' },
  { icon: '💰', label: '发工资',  color: 'bg-primary/10',    textColor: 'text-primary',   tab: 'finance' },
  { icon: '📝', label: '签合同',  color: 'bg-violet-50',     textColor: 'text-violet-600', tab: 'finance' },
  { icon: '⚠️', label: '合规预警', color: 'bg-red-50',        textColor: 'text-red-500',   tab: 'finance' },
  { icon: '📊', label: '财务报表', color: 'bg-sky-50',        textColor: 'text-sky-600',   tab: 'finance' },
]

const KPI = [
  { label: '收入',    value: '¥127,400', change: '↑18.3%', bg: 'bg-success-light', tc: 'text-success' },
  { label: '支出',    value: '¥83,200',  change: '↑5.1%',  bg: 'bg-danger-light',   tc: 'text-danger'   },
  { label: '净利润',  value: '¥44,200',  change: '↑34.7%', bg: 'bg-teal-50',        tc: 'text-primary'  },
]

interface Props {
  onNavigate: (tab: string) => void
}

export default function HomePage({ onNavigate }: Props) {
  const today = new Date()
  const hour = today.getHours()
  const greet = hour < 12 ? '上午好' : hour < 18 ? '下午好' : '晚上好'
  const dateStr = today.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })

  return (
    <div className="max-w-md mx-auto min-h-screen pb-20" style={{ background: '#f7f9fb' }}>
      {/* 顶部品牌区 */}
      <div
        className="px-5 pt-10 pb-5 rounded-b-3xl relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #00696f 0%, #00f2ff 100%)' }}
      >
        {/* 装饰圆 */}
        <div className="absolute -top-6 -right-6 w-40 h-40 rounded-full" style={{ background: 'rgba(0,242,255,0.12)' }} />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full" style={{ background: 'rgba(0,242,255,0.08)' }} />

        <div className="relative flex items-start justify-between">
          <div>
            <div className="font-['Space_Grotesk'] text-white text-2xl font-bold tracking-tight">DeepCFO</div>
            <div className="text-white/60 text-xs mt-0.5">你的AI财税助手</div>
          </div>
          <button
            onClick={() => onNavigate('tax')}
            className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center text-white relative"
          >
            <Bell size={18} />
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-400 rounded-full text-white text-[10px] font-bold flex items-center justify-center">3</span>
          </button>
        </div>

        <div className="mt-6">
          <div className="text-white text-xl font-bold">{greet}，赵总 👋</div>
          <div className="text-white/60 text-sm mt-1">{dateStr}</div>
        </div>
      </div>

      {/* 余额卡片 */}
      <div className="px-5 -mt-4 relative z-10">
        <div
          className="bg-white rounded-2xl p-5"
          style={{ boxShadow: '0 2px 12px rgba(0,105,111,0.08), 0 4px 24px rgba(0,105,111,0.04)', border: '1px solid rgba(185,202,203,0.3)' }}
        >
          <div className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: '#b9cacb' }}>本月可用余额</div>
          <div className="font-['Space_Grotesk'] text-3xl font-bold tracking-tight" style={{ color: '#006947' }}>
            ¥201,580
          </div>
          <div className="text-xs mt-1" style={{ color: '#b9cacb' }}>银行账户 · 微信 · 支付宝</div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {KPI.map((s) => (
              <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                <div className="text-xs" style={{ color: '#3a494b' }}>{s.label}</div>
                <div className={`text-sm font-bold mt-0.5 font-['Space_Grotesk'] ${s.tc}`}>{s.value}</div>
                <div className="text-xs mt-0.5" style={{ color: '#b9cacb' }}>{s.change}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="px-5 mt-5">
        <div className="font-['Space_Grotesk'] text-sm font-bold mb-3" style={{ color: '#191c1e' }}>快捷操作</div>
        <div className="grid grid-cols-3 gap-2.5">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              onClick={() => onNavigate(a.tab)}
              className={`bg-white ${a.textColor} rounded-2xl p-4 flex flex-col items-center gap-2 active:scale-95 transition-all shadow-sm hover:shadow-md`}
              style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid rgba(185,202,203,0.3)' }}
            >
              <span className="text-xl">{a.icon}</span>
              <span className="text-xs font-semibold">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI助手入口 */}
      <div className="px-5 mt-5 pb-6">
        <div className="font-['Space_Grotesk'] text-sm font-bold mb-3" style={{ color: '#191c1e' }}>DeepCFO 智能助手</div>
        <div
          className="rounded-2xl p-4"
          style={{ background: '#0D1B2A', border: '1px solid rgba(0,242,255,0.15)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold font-['Space_Grotesk']"
              style={{ background: 'linear-gradient(135deg, #00696f, #00f2ff)', color: '#fff' }}
            >
              CF
            </div>
            <span className="text-sm font-bold text-white font-['Space_Grotesk']">DeepCFO</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(0,242,255,0.12)', color: '#00f2ff' }}>AI</span>
          </div>
          <div className="text-sm leading-relaxed" style={{ color: '#cbd5e1' }}>
            <p>企业所得税季度预缴截止 <strong style={{ color: '#fca5a5' }}>3月31日</strong>，还剩 <strong style={{ color: '#fde68a' }}>8天</strong>，应缴约 <strong style={{ color: '#6ee7b7' }}>¥8,420</strong>（小微企业5%优惠税率）。</p>
            <p className="mt-2 text-xs" style={{ color: 'rgba(0,242,255,0.5)' }}>💡 点击「报税」或直接对我说，我来帮你生成申报草稿。</p>
          </div>
          <button
            onClick={() => onNavigate('tax')}
            className="mt-3 w-full py-2.5 rounded-xl text-sm font-semibold text-white active:scale-95 transition-all primary-gradient"
          >
            🤖 立即生成申报草稿
          </button>
        </div>
      </div>
    </div>
  )
}
