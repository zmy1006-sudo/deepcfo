/**
 * TaxPage — 报税中心（Sprint 2 重构）
 * 税务申报闭环：概览 → AI生成草稿 → 一键申报
 */
import { useState, useCallback, useEffect } from 'react'

// ============== CSS动画 ==============
const ANIMATIONS = `
@keyframes drawRing { to { stroke-dashoffset: 0; } }
@keyframes popIn { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
@keyframes fadeUp { 0% { transform: translateY(8px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
`
import { ArrowLeft, Check, AlertTriangle, Clock, X, Download } from 'lucide-react'
import { calcTaxSummary, calcTotalTax, getNearestDue, type TaxItem } from '@/lib/taxEngine'
import TaxReportPreview from './TaxReportPreview'

// ============== 配色常量 ==============

const C = {
  primary: '#4F7DF3',    // 深藏蓝
  accent: '#10B981',     // 古铜金
  urgent: '#EF4444',     // 红色
  warning: '#F59E0B',    // 橙色
  success: '#10B981',    // 绿色
  bg: '#F8FAFC',         // 极浅灰白
  card: '#FFFFFF',
}

// ============== 月份数据 ==============

const MONTHS = [
  { label: '1月', value: '2026-01' },
  { label: '2月', value: '2026-02' },
  { label: '3月', value: '2026-03', current: true },
  { label: '4月', value: '2026-04' },
  { label: '5月', value: '2026-05' },
  { label: '6月', value: '2026-06' },
]

// Mock企业信息（从 store 或 onboarding 获取）
const MOCK_ENTERPRISE = { taxType: 'small' as const, region: '上海' }

// ============== 环形进度组件 ==============

function ProgressRing({ status, label, size = 56, stroke = 5 }: { status: TaxItem['status']; label: string; size?: number; stroke?: number }) {
  const r = (size - stroke * 2) / 2
  const circumference = 2 * Math.PI * r

  let color = '#E5E7EB'
  let icon = ''
  let bgColor = 'bg-gray-50'

  if (status === 'overdue') {
    color = C.urgent; icon = '!'; bgColor = 'bg-red-50'
  } else if (status === 'filed') {
    color = C.success; icon = '✓'; bgColor = 'bg-emerald-50'
  } else if (status === 'paid') {
    color = C.success; icon = '✓'; bgColor = 'bg-emerald-50'
  }

  return (
    <div className="relative inline-flex flex-col items-center gap-1.5">
      <div
        className={`relative flex items-center justify-center rounded-full ${bgColor} ${status === 'overdue' ? 'ring-2 ring-red-200 animate-pulse' : ''}`}
        style={{ width: size + 12, height: size + 12 }}
      >
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F1F5F9" strokeWidth={stroke} />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            stroke={color} strokeWidth={stroke} strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            className={status === 'overdue' ? 'animate-pulse' : ''}
            style={{
              strokeDashoffset: status === 'pending' ? circumference : 0,
              transition: 'stroke-dashoffset 1s ease, stroke 0.4s',
            }}
          />
        </svg>
        <span className="absolute text-sm font-black" style={{ color, fontSize: label.length > 2 ? '9px' : '13px' }}>
          {icon || label}
        </span>
      </div>
      <span className="text-[10px] text-gray-400 font-medium text-center leading-tight">{label}</span>
    </div>
  )
}

// ============== 倒计时组件 ==============

function DueCountdown({ dueDate }: { dueDate: string }) {
  const days = Math.ceil((new Date(dueDate).getTime() - new Date('2026-03-24').getTime()) / (1000 * 60 * 60 * 24))

  if (days < 0) {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: C.urgent }}>
        <AlertTriangle size={11} /> 已过期{Math.abs(days)}天
      </span>
    )
  }
  if (days <= 7) {
    return (
      <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: C.warning }}>
        <Clock size={11} /> 还剩{days}天
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-gray-400">
      <Clock size={11} /> 还剩{days}天
    </span>
  )
}

// ============== 申报草稿弹窗 ==============

type DraftPhase = 'preview' | 'downloading' | 'submitted'

// ============== 打印内容组件（隐藏，仅在打印时可见）==============


interface Props { onNavigate?: (tab: string) => void }
export default function TaxPage({ onNavigate }: Props) {
  const [selectedMonth] = useState('2026-03')
  const [taxItems, setTaxItems] = useState<TaxItem[]>(() => calcTaxSummary(MOCK_ENTERPRISE))
  const [isGenerating, setIsGenerating] = useState(false)
  const [showDraftContent, setShowDraftContent] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [filedItems, setFiledItems] = useState<Set<string>>(new Set())

  const totalTax = calcTotalTax(taxItems)
  const nearestDue = getNearestDue(taxItems)

  // AI生成申报草稿
  const handleGenerateDraft = useCallback(() => {
    setIsGenerating(true)
    setShowDraftContent(false)
  }, [])

  const handleGenerateDone = useCallback(() => {
    setIsGenerating(false)
    setShowDraftContent(true)
  }, [])

  // 自动触发生成完成动画
  useEffect(() => {
    if (isGenerating) {
      const timer = setTimeout(() => handleGenerateDone(), 1800)
      return () => clearTimeout(timer)
    }
  }, [isGenerating, handleGenerateDone])

  // 确认申报 → 更新进度环
  const handleConfirmFiling = useCallback(() => {
    setShowPreview(false)
    setFiledItems(prev => {
      const next = new Set(prev)
      taxItems.forEach(item => next.add(item.name))
      return next
    })
    // 更新 status 为 filed
    setTaxItems(prev => prev.map(item => ({ ...item, status: 'filed' as const })))
  }, [taxItems])

  // 带状态的税种（已申报的覆盖Mock状态）
  const effectiveItems = taxItems.map(item => ({
    ...item,
    status: filedItems.has(item.name) ? 'filed' as const : item.status,
  }))

  // 颜色辅助
  const urgencyColor = nearestDue && nearestDue.days <= 7 ? C.urgent : nearestDue && nearestDue.days <= 15 ? C.warning : C.success

  return (
    <div className="min-h-screen pb-6" style={{ background: C.bg }}>
      {/* 顶部渐变标题栏 */}
      <div
        className="px-5 pt-10 pb-5"
        style={{ background: `linear-gradient(135deg, ${C.primary} 0%, #2563EB 100%)` }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => onNavigate?.('home')}
            className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white active:scale-90 transition-transform"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-white font-bold text-xl">报税中心</h1>
        </div>

        {/* 快捷摘要 */}
        <div className="flex gap-2 mt-3">
          <div className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-center">
            <div className="text-white/70 text-xs">待申报</div>
            <div className="text-white font-bold text-sm mt-0.5">{effectiveItems.filter(i => i.status === 'pending' || i.status === 'overdue').length}项</div>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-center">
            <div className="text-white/70 text-xs">应纳总额</div>
            <div className="font-bold text-sm mt-0.5" style={{ color: C.accent }}>¥{totalTax.toLocaleString()}</div>
          </div>
          <div className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-center">
            <div className="text-white/70 text-xs">最紧急</div>
            <div className="font-bold text-sm mt-0.5" style={{ color: urgencyColor }}>
              {nearestDue ? `${Math.abs(nearestDue.days)}天` : '-'}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* 月份选择器 */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {MONTHS.map(m => (
            <button
              key={m.value}
              className="flex-shrink-0 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: selectedMonth === m.value ? C.primary : '#fff',
                color: selectedMonth === m.value ? '#fff' : '#6B7280',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* 税务概览大卡片 */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          {/* 总额 */}
          <div className="text-center mb-5">
            <div className="text-xs text-gray-400 font-medium mb-1">本期应纳税总额</div>
            <div className="text-4xl font-bold tracking-tight" style={{ color: C.accent }}>
              ¥{totalTax.toLocaleString()}
            </div>
            {nearestDue && (
              <DueCountdown dueDate={nearestDue.date} />
            )}
          </div>

          {/* 分割线 */}
          <div className="border-t border-gray-100 my-4" />

          {/* 税种分解 */}
          <div className="space-y-3">
            {effectiveItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ProgressRing status={item.status} label={item.name.replace(/[^税]/g, '').slice(0, 2) || '税'} />
                  <div>
                    <div className="text-sm font-semibold text-gray-800 leading-tight">{item.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{item.type}{item.quarter ? ` · ${item.quarter}` : ''}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold" style={{ color: item.status === 'overdue' ? C.urgent : C.primary }}>
                    ¥{item.amount.toLocaleString()}
                  </div>
                  <DueCountdown dueDate={item.dueDate} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI生成申报草稿 */}
        {isGenerating ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
            <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: '#EFF6FF' }}>
              <span className="text-2xl animate-pulse">🤖</span>
            </div>
            <div className="text-sm font-semibold text-gray-800 mb-1">DeepCFO 正在分析税务数据…</div>
            <div className="text-xs text-gray-400">这可能需要几秒钟</div>
            <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: '60%', background: 'linear-gradient(90deg, #10B981, #4F7DF3)', animation: 'taxGenProgress 1.5s ease-in-out infinite alternate' }} />
            </div>
            <style>{`@keyframes taxGenProgress { from { width: 20%; } to { width: 90%; } }`}</style>
          </div>
        ) : showDraftContent ? (
          // 申报草稿展示区
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#EFF6FF' }}>
                <span className="text-sm">🤖</span>
              </div>
              <div className="font-bold text-sm text-gray-800">AI申报草稿已就绪</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-2 mb-4">
              {effectiveItems.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-500">{item.name}</span>
                  <span className="font-semibold text-gray-800">¥{item.amount.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold">
                <span className="text-gray-700">合计</span>
                <span style={{ color: C.accent }}>¥{totalTax.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsGenerating(true)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-500 active:scale-95 transition-transform"
              >
                重新生成
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform shadow-md"
                style={{ background: `linear-gradient(135deg, ${C.accent} 0%, ${C.primary} 100%)` }}
              >
                确认申报 →
              </button>
            </div>
          </div>
        ) : (
          // AI生成按钮
          <button
            onClick={handleGenerateDraft}
            className="w-full py-4 rounded-2xl text-sm font-bold text-white shadow-lg active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            style={{ background: `linear-gradient(135deg, ${C.accent} 0%, ${C.primary} 100%)` }}
          >
            <span className="text-base">🤖</span>
            AI生成申报草稿
          </button>
        )}

        {/* 下月预告 */}
        <div className="bg-sky-50 rounded-2xl p-4 border border-sky-200">
          <div className="text-sm font-bold text-sky-700 mb-2">💡 近期申报预告</div>
          {[
            { m: '4月', t: '增值税及附加（月报）', d: '4月15日' },
            { m: '4月', t: '个人所得税（月报）', d: '4月20日' },
            { m: '5月', t: '企业所得税年度汇算清缴', d: '5月31日' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-sky-100 last:border-0">
              <div>
                <span className="text-xs font-semibold text-sky-700 mr-2">{item.m}</span>
                <span className="text-xs text-sky-600">{item.t}</span>
              </div>
              <span className="text-xs text-sky-400">{item.d}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 申报草稿弹窗 */}
      {showPreview && (
        <TaxReportPreview
          items={effectiveItems}
          enterprise={{
            name: '北京深度财税科技有限公司',
            creditCode: '91110000XXXXXXXXXX',
            region: '北京市',
            taxType: '小规模纳税人',
          }}
          onClose={() => setShowPreview(false)}
          onConfirm={handleConfirmFiling}
          onNavigate={onNavigate}
        />
      )}
    </div>
  )
}
