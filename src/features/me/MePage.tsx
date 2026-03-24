/**
 * MePage — 我的TAB（Sprint 8: 青色科技风）
 * 新增：工资相关快捷入口（员工管理/发工资/工资条/凭证管理）
 */
import { FileText, ChevronRight, Settings, Bell, Building2, CreditCard, FileCheck2, Shield, Users, Banknote, ScrollText } from 'lucide-react'

const MENU_ITEMS = [
  { icon: Settings,   label: '账号与安全', sub: '登录密码、支付密码',     action: 'security' },
  { icon: Building2, label: '公司信息',   sub: '企业实名认证',          action: 'company'  },
  { icon: CreditCard, label: '银行账户',   sub: '管理对公账户',          action: 'bank'     },
  { icon: FileCheck2, label: '发票管理',   sub: '发票抬头、开票记录',     action: 'invoice'  },
  { icon: Bell,       label: '消息通知',   sub: '3条未读消息',            action: 'notice'   },
  { icon: Shield,     label: '隐私设置',   sub: '数据授权管理',            action: 'privacy'  },
]

// Sprint 8: 工资快捷入口
const QUICK_ACTIONS = [
  { icon: Users,      label: '员工管理', tab: 'employees' },
  { icon: Banknote,   label: '发工资',   tab: 'salary'     },
  { icon: ScrollText, label: '工资条',   tab: 'slips'      },
  { icon: FileText,   label: '凭证管理', tab: 'vouchers'   },
]

interface Props {
  onNavigate: (tab: string) => void
}

export default function MePage({ onNavigate }: Props) {
  return (
    <div className="max-w-md mx-auto min-h-screen pb-20" style={{ background: '#f7f9fb' }}>
      {/* 头部 */}
      <div
        className="px-5 pt-10 pb-5 rounded-b-3xl relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #00696f 0%, #00f2ff 100%)' }}
      >
        {/* 装饰 */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />

        <div className="relative flex items-center gap-4">
          {/* 头像 */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 font-['Space_Grotesk']"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}
          >
            赵
          </div>
          <div>
            <div className="text-white text-lg font-bold font-['Space_Grotesk']">赵铭远</div>
            <div className="text-white/60 text-sm mt-0.5">138****8888</div>
            <div className="text-xs mt-1 font-semibold px-2.5 py-0.5 rounded-full inline-block" style={{ background: 'rgba(0,105,71,0.3)', color: '#6ee7b7' }}>
              DeepCFO 企业版
            </div>
          </div>
        </div>

        {/* 统计 */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[{ v: '12', l: '本月凭证' }, { v: '5', l: '关联员工' }, { v: '3', l: '待处理' }].map((s, i) => (
            <div key={i} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
              <div className="text-white text-lg font-bold font-['Space_Grotesk']" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{s.v}</div>
              <div className="text-white/60 text-xs mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sprint 8: 快捷操作入口 */}
      <div className="px-5 -mt-4 relative z-10">
        <div
          className="w-full bg-white rounded-2xl p-4"
          style={{ boxShadow: '0 4px 16px rgba(0,105,111,0.1)', border: '1px solid rgba(185,202,203,0.3)' }}
        >
          <div className="text-xs font-bold mb-3" style={{ color: '#3a494b' }}>💼 工资与财务</div>
          <div className="grid grid-cols-4 gap-2">
            {QUICK_ACTIONS.map(({ icon: Icon, label, tab }) => (
              <button
                key={tab}
                onClick={() => onNavigate(tab)}
                className="flex flex-col items-center gap-1.5 py-2 rounded-xl active:scale-95 transition-transform"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(0,105,111,0.08)' }}
                >
                  <Icon size={18} style={{ color: '#00696f' }} />
                </div>
                <span className="text-xs font-medium" style={{ color: '#191c1e' }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 菜单列表 */}
      <div className="px-5 py-4 space-y-2">
        {MENU_ITEMS.map(({ icon: Icon, label, sub }, i) => (
          <button
            key={i}
            className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 active:scale-[0.99] transition-all text-left"
            style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)', border: '1px solid rgba(185,202,203,0.2)' }}
          >
            <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon size={17} style={{ color: '#3a494b' }} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold" style={{ color: '#191c1e' }}>{label}</div>
              <div className="text-xs mt-0.5" style={{ color: '#b9cacb' }}>{sub}</div>
            </div>
            <ChevronRight size={15} style={{ color: '#b9cacb' }} />
          </button>
        ))}
      </div>

      {/* 版本 */}
      <div className="text-center text-xs pb-6" style={{ color: '#b9cacb' }}>DeepCFO v1.0.0 · Sprint 8</div>
    </div>
  )
}
