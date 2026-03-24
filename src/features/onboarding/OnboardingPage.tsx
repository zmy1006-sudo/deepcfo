/**
 * OnboardingPage.tsx — 数据初始化三选一页面
 */
import { useState } from 'react'
import { Table2, Landmark, Plus, ChevronRight, Check } from 'lucide-react'
import OnboardingExcelGuide from './OnboardingExcelGuide'
import OnboardingBankGuide from './OnboardingBankGuide'

type Phase = 'select' | 'excel' | 'bank' | 'done'

interface Props {
  onComplete?: () => void
}

export default function OnboardingPage({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('select')

  const handleSelectStart = () => {
    setPhase('done')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 顶部 */}
      <div className="px-5 pt-12 pb-8" style={{ background: 'linear-gradient(160deg, #4F7DF3 0%, #2563EB 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Plus size={20} className="text-amber-400" />
          </div>
          <div>
            <div className="text-white font-bold text-lg">初始化企业数据</div>
            <div className="text-white/50 text-xs mt-0.5">选择最适合你的方式</div>
          </div>
        </div>
      </div>

      {/* 步骤条 */}
      <div className="px-5 -mt-3">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-4 py-3 flex items-center gap-3">
          {[1, 2, 3].map((n, i) => (
            <div key={n} className="flex items-center flex-1 last:flex-none">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {i === 0 ? <Check size={12} /> : n}
              </div>
              <span className={`ml-2 text-xs font-medium ${i === 0 ? 'text-slate-700' : 'text-slate-300'}`}>
                {n === 1 ? '入驻' : n === 2 ? '初始化' : '激活'}
              </span>
              {i < 2 && <div className={`flex-1 h-px mx-3 ${i === 0 ? 'bg-slate-200' : 'bg-slate-100'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* 内容 */}
      {phase === 'select' && (
        <div className="flex-1 px-5 py-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-sm font-semibold text-slate-600">选择导入方式</span>
          </div>
          <div className="flex flex-col gap-4">
            {/* 从Excel导入 */}
            <button
              onClick={() => setPhase('excel')}
              className="w-full text-left bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 active:scale-[0.99] transition-all duration-200 flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #4F7DF3 0%, #2563EB 100%)' }}>
                <div className="text-amber-400"><Table2 size={22} /></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">从 Excel 导入</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-semibold">推荐</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">下载专用模板，填写后一键上传，适合有历史账务的企业</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {['支持历史账务', '批量导入', '模板下载'].map(t => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-medium">{t}</span>
                  ))}
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 flex-shrink-0 mt-1" />
            </button>

            {/* 从银行流水导入 */}
            <button
              onClick={() => setPhase('bank')}
              className="w-full text-left bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 active:scale-[0.99] transition-all duration-200 flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #4F7DF3 0%, #2563EB 100%)' }}>
                <div className="text-amber-400"><Landmark size={22} /></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">从银行流水导入</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">授权微信/支付宝，自动拉取近12个月流水，智能识别收支</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {['自动拉取', '智能分类', '无需填写'].map(t => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-medium">{t}</span>
                  ))}
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 flex-shrink-0 mt-1" />
            </button>

            {/* 从零开始 */}
            <button
              onClick={handleSelectStart}
              className="w-full text-left bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 active:scale-[0.99] transition-all duration-200 flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #4F7DF3 0%, #2563EB 100%)' }}>
                <div className="text-amber-400"><Plus size={22} /></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-slate-900">从零开始</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold">全新企业</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">无需导入历史数据，直接进入日常记账模式</p>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {['即时开始', '无历史负担', '轻装上阵'].map(t => (
                    <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-medium">{t}</span>
                  ))}
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 flex-shrink-0 mt-1" />
            </button>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="flex-1 px-5 py-16 text-center">
          <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', boxShadow: '0 8px 32px rgba(5,150,105,.25)' }}>
            <Check size={40} className="text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">数据初始化完成</h2>
          <p className="text-sm text-slate-400 mt-2">DeepCFO 已准备好为你服务</p>
          <button
            onClick={onComplete}
            className="mt-8 w-full max-w-xs mx-auto py-3.5 rounded-xl font-semibold text-sm text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #4F7DF3 0%, #2563EB 100%)' }}
          >
            激活 DeepCFO <ChevronRight size={16} />
          </button>
        </div>
      )}

      {phase === 'excel' && <OnboardingExcelGuide onComplete={handleSelectStart} />}
      {phase === 'bank' && <OnboardingBankGuide onComplete={handleSelectStart} />}
    </div>
  )
}
