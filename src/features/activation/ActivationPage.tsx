/**
 * ActivationPage.tsx — 企业激活完成引导页
 * 设计规范：UI设计规范 V1.0
 */
import { Sparkles, ArrowRight, Check, Zap } from 'lucide-react'

interface Props {
  onComplete?: () => void
}

const EXAMPLES = [
  '收了王总公司3万设计费',
  '帮我发这个月工资',
  'Q1所得税怎么申报',
]

export default function ActivationPage({ onComplete }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 顶部成功区 */}
      <div
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #4F7DF3 0%, #2563EB 100%)', borderRadius: '0 0 40px 40px', padding: '48px 20px 64px' }}
      >
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'rgba(201,150,58,.12)' }} />
        <div className="absolute -bottom-5 -left-5 w-20 h-20 rounded-full" style={{ background: 'rgba(201,150,58,.08)' }} />

        <div className="relative text-center">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)', boxShadow: '0 8px 32px rgba(16,185,129,.4)' }}
          >
            <Sparkles size={28} className="text-slate-900" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">DeepCFO 已就绪！</h1>
          <p className="text-sm text-white/60 mt-2">企业已激活，开始你的财税管理之旅</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="px-5 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">数据概览</span>
          </div>
          <div className="px-4 py-4 grid grid-cols-3 gap-4">
            {[
              { label: '识别交易', value: '48', unit: '笔', color: 'text-slate-800' },
              { label: '凭证草稿', value: '36', unit: '份', color: 'text-amber-500' },
              { label: '待确认', value: '5', unit: '项', color: 'text-red-500' },
            ].map(item => (
              <div key={item.label} className="text-center">
                <div className="flex items-baseline justify-center gap-0.5">
                  <span className={`text-3xl font-bold ${item.color}`} style={{ fontFamily: 'Georgia, serif' }}>
                    {item.value}
                  </span>
                  <span className="text-xs text-slate-400 ml-0.5">{item.unit}</span>
                </div>
                <div className="text-xs text-slate-400 mt-1.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 提示 */}
      <div className="px-5 mt-2">
        <div className="bg-slate-100/60 rounded-xl px-3 py-2 flex items-center gap-2">
          <Zap size={13} className="text-amber-500 flex-shrink-0" />
          <p className="text-xs text-slate-500 leading-relaxed">
            交易数据由 DeepCFO AI 智能分析，<span className="text-slate-700 font-medium">待确认项</span>需要你逐一核实
          </p>
        </div>
      </div>

      {/* 示例气泡 */}
      <div className="flex-1 px-5 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          <span className="text-sm font-semibold text-slate-600">你可以这样说</span>
        </div>
        <div className="flex flex-col gap-3">
          {EXAMPLES.map(text => (
            <div key={text} className="flex items-center gap-3">
              <div
                className="flex-1 rounded-2xl rounded-tl-sm px-4 py-3"
                style={{ background: '#0D1B2A', boxShadow: '0 4px 12px rgba(13,27,42,.15)' }}
              >
                <span className="text-sm text-slate-200 leading-relaxed">{text}</span>
              </div>
              <ArrowRight size={14} className="text-amber-400 flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* 进入按钮 */}
      <div className="px-5 pb-10">
        <button
          onClick={onComplete}
          className="w-full py-4 rounded-2xl font-bold text-base text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #4F7DF3 0%, #2563EB 100%)', boxShadow: '0 4px 16px rgba(79,125,243,.3)' }}
        >
          <span>进入 DeepCFO</span>
          <ArrowRight size={18} />
        </button>
        <div className="flex justify-center gap-6 mt-4">
          {['AI自动记账', '智能报税', '合规预警'].map(item => (
            <div key={item} className="flex items-center gap-1 text-emerald-500">
              <Check size={10} />
              <span className="text-xs font-medium">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
