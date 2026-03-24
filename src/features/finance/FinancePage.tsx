/**
 * FinancePage — 财务中心（Sprint 4：财务报表 + 工资管理）
 * Sprint 6：新增合同管理（ContractsTab）
 */
import { useState } from 'react'
import { ArrowLeft, TrendingUp, TrendingDown, FileSignature, ChevronDown, ChevronUp, Plus, X, Check } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import type { Employee, EmployeeStatus, Contract, ContractType, PaymentMilestone } from '@/types'
import {
  CONTRACTS,
  CONTRACT_TYPE_LABELS,
} from '@/constants'
import {
  MOCK_FINANCE_DATA,
  calcNetMargin,
  getIncomeStatementRows,
  getBalanceSheetRows,
  getCashFlowRows,
  AI_FINANCE_INSIGHT,
  type ReportRow,
} from '@/lib/financeReport'

// ============== 报表类型枚举 ==============

type ReportType = 'income' | 'balance' | 'cashflow'

const REPORT_TABS: { key: ReportType; label: string }[] = [
  { key: 'income', label: '利润表' },
  { key: 'balance', label: '资产负债表' },
  { key: 'cashflow', label: '现金流量' },
]

// ============== 报表表格组件 ==============

function ReportTable({ rows }: { rows: ReportRow[] }) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
      {rows.map((row, i) => {
        if (row.isSection) {
          return (
            <div key={i} className="px-4 py-2 bg-gray-50">
              <div className="text-xs font-bold" style={{ color: '#00696f' }}>{row.label}</div>
            </div>
          )
        }
        const isHighlight = row.highlight
        const isPositive = row.positive
        return (
          <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-2">
              {row.change && (
                isPositive !== false
                  ? <TrendingUp size={13} className="text-emerald-500 flex-shrink-0" />
                  : <TrendingDown size={13} className="text-red-500 flex-shrink-0" />
              )}
              <span className={`text-sm ${isHighlight ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>{row.label}</span>
            </div>
            <div className="flex items-center gap-2">
              {row.change && (
                <span className={`text-xs font-medium ${isPositive !== false ? 'text-emerald-500' : 'text-red-500'}`}>{row.change}</span>
              )}
              <span
                className={`text-sm font-semibold ${isHighlight ? 'font-bold' : 'font-medium'} ${
                  isHighlight ? 'text-gray-900'
                    : row.positive === true ? 'text-emerald-600'
                    : row.positive === false ? 'text-red-500'
                    : 'text-gray-800'
                }`}
                style={isHighlight ? { fontFamily: 'Georgia, serif', fontSize: 15 } : {}}
              >
                {row.value}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ============== 报表Tab主视图 ==============

function ReportsTab({ onNavigate }: { onNavigate?: () => void }) {
  const [activeReport, setActiveReport] = useState<ReportType>('income')
  const [showAI, setShowAI] = useState(false)
  const d = MOCK_FINANCE_DATA.incomeStatement
  const netMargin = calcNetMargin(d.revenue, d.netProfit)
  const rows = activeReport === 'income' ? getIncomeStatementRows()
    : activeReport === 'balance' ? getBalanceSheetRows()
    : getCashFlowRows()
  const reportTitle = activeReport === 'income' ? '利润表'
    : activeReport === 'balance' ? '资产负债表'
    : '现金流量表'

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="flex">
          <div className="w-1.5 flex-shrink-0" style={{ background: 'linear-gradient(180deg, #00696f, #00f2ff)' }} />
          <div className="flex-1 px-5 py-4">
            <div className="text-xs text-gray-400 font-medium mb-1">净利润</div>
            <div className="text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#006947', lineHeight: 1 }}>
              ¥{d.netProfit.toLocaleString()}
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <TrendingUp size={13} className="text-emerald-500" />
                <span className="text-xs text-emerald-600 font-semibold">环比 +{d.qoqChange}%</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp size={13} className="text-emerald-500" />
                <span className="text-xs text-emerald-600 font-semibold">同比 +{d.yoyChange}%</span>
              </div>
              <div className="ml-auto text-xs text-gray-400">
                利润率 <span className="font-semibold text-gray-600">{netMargin.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-1 flex shadow-sm">
        {REPORT_TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveReport(tab.key)}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
            style={activeReport === tab.key ? { background: '#00696f', color: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,105,111,0.3)' } : { background: 'transparent', color: '#6B7280' }}>
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2 px-1">{reportTitle} · 2026年3月</div>
        <ReportTable rows={rows} />
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: '#0D1B2A' }}>
        <div className="px-4 py-3 flex items-center gap-2" style={{ background: '#1A2D42' }}>
          <span className="text-sm">🤖</span>
          <span className="text-sm font-semibold" style={{ color: '#60A5FA' }}>DeepCFO 财务分析</span>
        </div>
        <div className="px-4 py-4">
          <p className="text-sm leading-relaxed" style={{ color: '#E2E8F0', whiteSpace: 'pre-line' }}>
            {showAI ? AI_FINANCE_INSIGHT : `"${AI_FINANCE_INSIGHT.slice(0, 30)}…"`}
          </p>
          <button onClick={() => setShowAI(!showAI)}
            className="mt-3 text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
            style={{ background: '#1A2D42', color: '#60A5FA', border: '1px solid rgba(96,165,250,0.3)' }}>
            {showAI ? '收起解读 ↑' : '查看更多解读 ↓'}
          </button>
          {showAI && (
            <button onClick={onNavigate}
              className="mt-2 ml-2 text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
              style={{ background: 'rgba(0,242,255,0.1)', color: '#00f2ff', border: '1px solid rgba(0,242,255,0.2)' }}>
              💬 继续追问
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============== 员工Mock数据 ==============

const EMPLOYEES: Employee[] = [
  { id: 'e1', name: '张三', idCard: '310***********1234', department: '产品部', position: '产品经理', baseSalary: 8500, socialInsurance: 680, housingFund: 425, tax: 295, status: 'paid' },
  { id: 'e2', name: '李四', idCard: '320***********5678', department: '研发部', position: '高级工程师', baseSalary: 9200, socialInsurance: 736, housingFund: 460, tax: 380, status: 'paid' },
  { id: 'e3', name: '王五', idCard: '330***********9012', department: '销售部', position: '销售主管', baseSalary: 7800, socialInsurance: 624, housingFund: 390, tax: 240, status: 'pending' },
  { id: 'e4', name: '赵六', idCard: '340***********3456', department: '运营部', position: '运营专员', baseSalary: 8500, socialInsurance: 680, housingFund: 425, tax: 295, status: 'pending' },
  { id: 'e5', name: '孙七', idCard: '350***********7890', department: '设计部', position: 'UI设计师', baseSalary: 8500, socialInsurance: 680, housingFund: 425, tax: 295, status: 'paid' },
]

function calcNetSalary(emp: Employee): number {
  return emp.baseSalary - emp.socialInsurance - emp.housingFund - emp.tax
}

// ============== 工资弹窗 ==============

function SalaryModal({ employees, onClose, onConfirmed }: {
  employees: Employee[]
  onClose: () => void
  onConfirmed: (ids: string[]) => void
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(employees.map(e => e.id)))
  const [submitted, setSubmitted] = useState(false)
  const [selectAll, setSelectAll] = useState(true)

  const toggleEmp = (id: string) => {
    setSelectAll(false)
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    if (selectAll) { setSelected(new Set()); setSelectAll(false) }
    else { setSelected(new Set(employees.map(e => e.id))); setSelectAll(true) }
  }

  const selectedEmps = employees.filter(e => selected.has(e.id))
  const totalNet = selectedEmps.reduce((s, e) => s + calcNetSalary(e), 0)
  const totalBase = selectedEmps.reduce((s, e) => s + e.baseSalary, 0)

  const handleConfirm = () => {
    if (selected.size === 0) return
    setSubmitted(true)
    setTimeout(() => { onConfirmed(Array.from(selected)); onClose() }, 2200)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(0,105,71,0.08)' }}>
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="none" stroke="#006947" strokeWidth="3" strokeDasharray="113" strokeDashoffset="0" style={{ animation: 'salaryDrawCircle 0.6s ease forwards' }} />
                <path d="M12 20l6 6 10-12" fill="none" stroke="#006947" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'salaryDrawCheck 0.4s 0.5s ease forwards' }} />
              </svg>
            </div>
            <div className="text-base font-bold text-gray-800">工资发放成功！</div>
            <div className="text-sm text-gray-500 mt-1">实发 ¥{totalNet.toLocaleString()} 已提交网银转账</div>
            <div className="text-xs text-gray-400 mt-1">次月1日前到账</div>
          </div>
        ) : (
          <>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #00696f 0%, #00f2ff 100%)' }}>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm">💰</span>
                <span className="text-white font-bold text-sm">确认发放工资</span>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white text-sm leading-none">✕</span>
              </button>
            </div>
            <div className="px-5 py-4 space-y-3 max-h-[55vh] overflow-y-auto">
              <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">选择员工</span>
                <button onClick={toggleAll}
                  className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${selectAll ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                  {selectAll ? '✓ 全选' : '全部选择'}
                </button>
              </div>
              {employees.map(emp => {
                const net = calcNetSalary(emp)
                const isSel = selected.has(emp.id)
                return (
                  <div key={emp.id} onClick={() => toggleEmp(emp.id)}
                    className={`rounded-xl p-3 border transition-all cursor-pointer ${isSel ? 'border-emerald-300 bg-emerald-50' : 'border-gray-100 bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSel ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                          {isSel && <span className="text-white text-[10px] font-bold">✓</span>}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{emp.name}</div>
                          <div className="text-xs text-gray-400">{emp.department} · {emp.position}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-800">¥{net.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">实发</div>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-4 gap-1 text-[10px] text-gray-400">
                      <span>基本 ¥{emp.baseSalary.toLocaleString()}</span>
                      <span>社保 ¥{emp.socialInsurance}</span>
                      <span>公积金 ¥{emp.housingFund}</span>
                      <span>个税 ¥{emp.tax}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="px-5 py-4 border-t border-gray-100 space-y-3">
              <div className="bg-slate-800 rounded-xl p-3 flex justify-between items-center">
                <div>
                  <div className="text-xs text-slate-400">本月工资总额</div>
                  <div className="text-xs text-slate-400 mt-1">已选 {selected.size} 人 · 基准 ¥{totalBase.toLocaleString()}</div>
                </div>
                <div className="text-xl font-bold text-amber-400">¥{totalNet.toLocaleString()}</div>
              </div>
              <div className="bg-amber-50 rounded-xl px-3 py-2 border border-amber-200">
                <div className="text-xs text-amber-700 font-medium">💡 次月1日前到账，自动生成记账凭证</div>
              </div>
              <div className="flex gap-3">
                <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-500 active:scale-95 transition-transform">取消</button>
                <button onClick={handleConfirm} disabled={selected.size === 0}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform shadow-md disabled:opacity-40"
                  style={{ background: selected.size === 0 ? '#ccc' : 'linear-gradient(135deg, #00696f, #00f2ff)' }}>
                  ✓ 确认发放
                </button>
              </div>
            </div>
          </>
        )}
      </div>
      <style>{`
        @keyframes salaryDrawCircle { from { stroke-dashoffset: 113; } to { stroke-dashoffset: 0; } }
        @keyframes salaryDrawCheck { from { stroke-dashoffset: 30; opacity: 0; } to { stroke-dashoffset: 0; opacity: 1; } }
      `}</style>
    </div>
  )
}

// ============== 合同工具函数 ==============

function fmtMoney(n: number) { return n >= 10000 ? `¥${(n / 10000).toFixed(1)}万` : `¥${n.toLocaleString()}` }

function getStatusEmoji(c: Contract): string {
  const today = new Date()
  if (c.status === 'completed') return '🟢'
  const hasOverdue = c.milestones.some(m => m.status === 'overdue')
  if (hasOverdue) return '🔴'
  const soon = c.milestones.find(m => m.status === 'pending') as PaymentMilestone | undefined
  if (soon) {
    const due = new Date(soon.dueDate)
    const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    if (diff < 7) return '🟡'
  }
  return '🟡'
}

function getTotalPaidAmount(c: Contract): number {
  return c.milestones.filter(m => m.status === 'paid').reduce((s, m) => s + m.amount, 0)
}

function getOverdueMilestone(c: Contract): PaymentMilestone | undefined {
  return c.milestones.find(m => m.status === 'overdue')
}

function getNextPendingMilestone(c: Contract): PaymentMilestone | undefined {
  return c.milestones.find(m => m.status === 'pending')
}

function getMonthDay(d: string): string {
  const dt = new Date(d)
  return `${dt.getMonth() + 1}月${dt.getDate()}日`
}

// ============== ContractCard 组件 ==============

function ContractCard({ contract, onDetail }: { contract: Contract; onDetail: (c: Contract) => void }) {
  const [expanded, setExpanded] = useState(false)
  const emoji = getStatusEmoji(contract)
  const totalPaid = getTotalPaidAmount(contract)
  const overdue = getOverdueMilestone(contract)
  const nextPending = getNextPendingMilestone(contract)
  const grossProfit = Math.round(contract.totalAmount * contract.estimatedMargin / 100)
  const isCompleted = contract.status === 'completed'
  const isPurchase = contract.type === 'purchase'

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* 卡片头部 */}
      <div className="px-4 py-3 cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-base flex-shrink-0">{emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 leading-snug">{contract.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{CONTRACT_TYPE_LABELS[contract.type]} | {contract.startDate}~{contract.endDate}</div>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-3 text-xs">
              <span className="text-gray-500">总额 <span className="font-bold text-gray-800">{fmtMoney(contract.totalAmount)}</span></span>
              <span className="text-gray-500">已{isPurchase ? '付' : '收'} <span className="font-bold text-emerald-600">{fmtMoney(totalPaid)}</span></span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </div>
        </div>
        {/* 状态标签 */}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          {isCompleted ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-medium">
              🟢 合同完结 利润率{contract.estimatedMargin}%
            </span>
          ) : overdue ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium">
              🔴 {overdue.name}{fmtMoney(overdue.amount)} 已逾期
            </span>
          ) : nextPending ? (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">
              🟡 {nextPending.name}{fmtMoney(nextPending.amount)} {getMonthDay(nextPending.dueDate)}到期
            </span>
          ) : null}
          {!isCompleted && (
            <span className="text-xs text-gray-400">利润率 {contract.estimatedMargin}% 毛利 {fmtMoney(grossProfit)}</span>
          )}
        </div>
      </div>

      {/* 展开内容 */}
      {expanded && (
        <div className="px-4 pb-3 border-t border-gray-50 pt-2">
          <div className="space-y-2">
            {contract.milestones.map(m => (
              <div key={m.id} className="flex items-center gap-2 text-xs">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] ${
                  m.status === 'paid' ? 'bg-emerald-500 text-white' :
                  m.status === 'overdue' ? 'bg-red-500 text-white' :
                  'bg-gray-200 text-gray-500'
                }`}>
                  {m.status === 'paid' ? '✓' : m.status === 'overdue' ? '!' : '○'}
                </div>
                <span className={m.status === 'overdue' ? 'text-red-500 font-medium' : m.status === 'paid' ? 'text-emerald-600' : 'text-gray-500'}>
                  {m.name} {m.percent}% {fmtMoney(m.amount)}
                </span>
                <span className="text-gray-400">{m.paidDate || m.dueDate}</span>
                {m.status === 'overdue' && <span className="text-red-500 font-medium ml-auto">已逾期</span>}
                {m.status === 'pending' && <span className="text-amber-500 ml-auto">待付款</span>}
              </div>
            ))}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDetail(contract) }}
            className="mt-3 w-full py-2 rounded-xl text-xs font-semibold text-white transition-all active:scale-95"
            style={{ background: '#00696f' }}>
            查看详情
          </button>
        </div>
      )}
    </div>
  )
}

// ============== ContractDetailModal 组件 ==============

function ContractDetailModal({
  contract,
  onClose,
  onMarkPaid,
}: {
  contract: Contract
  onClose: () => void
  onMarkPaid: (contractId: string, milestoneId: string) => void
}) {
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoiceAmount, setInvoiceAmount] = useState('')
  const [invoiceSuccess, setInvoiceSuccess] = useState(false)
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false)
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null)

  const grossProfit = Math.round(contract.totalAmount * contract.estimatedMargin / 100)
  const totalPaid = getTotalPaidAmount(contract)
  const confirmedRevenue = totalPaid
  const unconfirmedRevenue = contract.totalAmount - totalPaid

  const milestoneIcon = (m: PaymentMilestone) => {
    if (m.status === 'paid') return '✅'
    if (m.status === 'overdue') return '🔴'
    return '🟡'
  }

  const handleConfirmPayment = (milestoneId: string) => {
    setSelectedMilestoneId(milestoneId)
    setShowPaymentConfirm(true)
  }

  const handlePaymentConfirmed = () => {
    if (selectedMilestoneId) {
      onMarkPaid(contract.id, selectedMilestoneId)
      setShowPaymentConfirm(false)
      onClose()
    }
  }

  const handleInvoice = () => {
    if (!invoiceAmount || isNaN(Number(invoiceAmount))) return
    setInvoiceSuccess(true)
    setTimeout(() => { setInvoiceSuccess(false); setShowInvoiceModal(false); setInvoiceAmount('') }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* 标题栏 */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0" style={{ background: 'linear-gradient(135deg, #00696f 0%, #00f2ff 100%)' }}>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">📝</span>
            <span className="text-white font-bold text-sm">合同详情</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="text-xs text-white/80 bg-white/20 px-3 py-1 rounded-full">编辑</button>
            <button className="text-xs text-red-300 bg-red-500/20 px-3 py-1 rounded-full">删除</button>
            <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center ml-1">
              <X size={14} className="text-white" />
            </button>
          </div>
        </div>

        {/* 滚动内容 */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* 基本信息 */}
          <div>
            <div className="text-base font-bold text-gray-800">{contract.name}</div>
            <div className="text-xs text-gray-400 mt-1">
              {CONTRACT_TYPE_LABELS[contract.type]} | {contract.startDate}~{contract.endDate}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">甲方：{contract.partyA} | 乙方：{contract.partyB}</div>
          </div>

          {/* 收益测算 */}
          <div className="rounded-2xl p-4" style={{ background: '#0D1B2A' }}>
            <div className="text-xs font-semibold mb-3" style={{ color: '#60A5FA' }}>💰 收益测算</div>
            <div className="space-y-2">
              {[
                { label: '合同总额', value: `¥${contract.totalAmount.toLocaleString()}`, highlight: true },
                { label: '预估毛利', value: `¥${grossProfit.toLocaleString()}（${contract.estimatedMargin}%）` },
                { label: '已确认收入', value: `¥${confirmedRevenue.toLocaleString()}`, color: 'text-emerald-400' },
                { label: '未确认收入', value: `¥${unconfirmedRevenue.toLocaleString()}`, color: 'text-amber-400' },
              ].map((r, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">{r.label}</span>
                  <span className={`text-sm font-semibold ${r.color || (r.highlight ? 'text-white' : 'text-slate-200')}`}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 付款进度 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="text-xs font-semibold mb-3" style={{ color: '#00696f' }}>💰 付款进度</div>
            <div className="space-y-3">
              {contract.milestones.map(m => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="text-base flex-shrink-0">{milestoneIcon(m)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${m.status === 'overdue' ? 'text-red-500' : m.status === 'paid' ? 'text-emerald-600' : 'text-gray-700'}`}>
                        {m.name} {m.percent}%
                      </span>
                      {m.status === 'overdue' && <span className="text-xs text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full font-medium">已逾期</span>}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">¥{m.amount.toLocaleString()} | {m.paidDate || m.dueDate}</div>
                  </div>
                  {m.status !== 'paid' && (
                    <button
                      onClick={() => handleConfirmPayment(m.id)}
                      className="text-xs text-white px-3 py-1.5 rounded-full font-medium active:scale-95 transition-transform flex-shrink-0"
                      style={{ background: m.status === 'overdue' ? '#ba1a1a' : '#00696f' }}>
                      确认付款
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 提醒设置 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="text-xs font-semibold mb-3" style={{ color: '#00696f' }}>🔔 提醒设置</div>
            {[
              '付款到期提醒（7天前）',
              '开票提醒',
              '合同到期提醒（30天前）',
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5">
                <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <Check size={11} className="text-white" />
                </div>
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>

          {/* 关联凭证 */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="text-xs font-semibold mb-3" style={{ color: '#00696f' }}>📋 关联凭证</div>
            {contract.voucherIds.length > 0 ? (
              contract.voucherIds.map(vid => (
                <div key={vid} className="flex items-center gap-3 py-1.5">
                  <span className="text-xs text-gray-400">2026-01-15</span>
                  <span className="text-xs text-emerald-600 font-medium">收:¥90,000</span>
                  <span className="text-xs text-gray-400">记-{vid}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 py-2">暂无关联凭证</div>
            )}
          </div>
        </div>

        {/* 底部操作 */}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button onClick={() => setShowInvoiceModal(true)}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform"
            style={{ background: '#00696f' }}>
            📄 开票
          </button>
          <button
            onClick={() => {
              const next = getNextPendingMilestone(contract)
              if (next) handleConfirmPayment(next.id)
            }}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform"
            style={{ background: 'linear-gradient(135deg, #00696f, #00f2ff)' }}>
            💰 确认付款
          </button>
        </div>
      </div>

      {/* 确认付款子弹窗 */}
      {showPaymentConfirm && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center" onClick={() => setShowPaymentConfirm(false)}>
          <div className="bg-white rounded-2xl mx-4 w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-5">
              <div className="text-base font-bold text-gray-800 mb-4">确认收款/付款？</div>
              <div className="bg-emerald-50 rounded-xl p-3 mb-4">
                <div className="text-xs text-emerald-600 font-medium">💡 确认后将自动生成记账凭证</div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowPaymentConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-500 active:scale-95 transition-transform">
                  取消
                </button>
                <button onClick={handlePaymentConfirmed}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform"
                  style={{ background: '#00696f' }}>
                  ✓ 确认
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 开票弹窗 */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center" onClick={() => !invoiceSuccess && setShowInvoiceModal(false)}>
          <div className="bg-white rounded-2xl mx-4 w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
            {invoiceSuccess ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="text-4xl mb-3">✅</div>
                <div className="text-base font-bold text-gray-800">开票成功！</div>
                <div className="text-xs text-gray-400 mt-1">发票记录已保存</div>
              </div>
            ) : (
              <>
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between" style={{ background: '#00696f' }}>
                  <span className="text-white font-bold text-sm">📄 开具发票</span>
                  <button onClick={() => setShowInvoiceModal(false)}><X size={16} className="text-white" /></button>
                </div>
                <div className="px-5 py-4 space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 font-medium mb-1 block">发票金额（元）</label>
                    <input type="number" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)}
                      placeholder="请输入开票金额"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400" />
                  </div>
                  <div className="bg-gray-50 rounded-xl px-3 py-2">
                    <div className="text-xs text-gray-400">合同余额</div>
                    <div className="text-sm font-bold text-gray-800">¥{contract.totalAmount.toLocaleString()}</div>
                  </div>
                  <button onClick={handleInvoice} disabled={!invoiceAmount}
                    className="w-full py-3 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform disabled:opacity-40"
                    style={{ background: invoiceAmount ? '#00696f' : '#ccc' }}>
                    确认开票
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ============== AddContractModal 组件 ==============

function AddContractModal({ onClose, onAdd }: { onClose: () => void; onAdd: (c: Contract) => void }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', partyA: '', partyB: '',
    type: 'service' as ContractType,
    totalAmount: '',
    startDate: '',
    endDate: '',
    paymentMethod: 'installment' as 'once' | 'installment' | 'monthly',
    estimatedMargin: '20',
  })
  const [milestones, setMilestones] = useState([
    { name: '首付', percent: '30', amount: '', dueDate: '' },
    { name: '验收', percent: '60', amount: '', dueDate: '' },
    { name: '尾款', percent: '10', amount: '', dueDate: '' },
  ])
  const [submitting, setSubmitting] = useState(false)

  const setField = (k: keyof typeof form, v: string | number) => setForm(prev => ({ ...prev, [k]: v }))

  const updateMilestone = (i: number, k: string, v: string) => {
    setMilestones(prev => {
      const next = [...prev]
      next[i] = { ...next[i], [k]: v }
      if (k === 'percent') {
        const amt = Math.round(Number(form.totalAmount || 0) * Number(v) / 100)
        next[i].amount = String(amt)
      }
      return next
    })
  }

  const grossProfit = Math.round(Number(form.totalAmount || 0) * Number(form.estimatedMargin || 0) / 100)

  const canNext = () => {
    if (step === 1) return form.name && form.partyA && form.partyB && form.totalAmount && form.startDate && form.endDate
    if (step === 2) return milestones.every(m => m.percent && m.dueDate)
    return true
  }

  const handleSubmit = () => {
    setSubmitting(true)
    setTimeout(() => {
      const newContract: Contract = {
        id: `c-${Date.now()}`,
        name: form.name, partyA: form.partyA, partyB: form.partyB,
        type: form.type, totalAmount: Number(form.totalAmount),
        startDate: form.startDate, endDate: form.endDate,
        paymentMethod: form.paymentMethod,
        estimatedMargin: Number(form.estimatedMargin),
        milestones: milestones.map((m, i) => ({
          id: `m-new-${i}`, name: m.name, percent: Number(m.percent),
          amount: Number(m.amount), dueDate: m.dueDate,
          status: 'pending' as const,
        })),
        status: 'active', voucherIds: [],
        createdAt: new Date().toISOString().split('T')[0],
      }
      onAdd(newContract); onClose()
    }, 1500)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0" style={{ background: 'linear-gradient(135deg, #00696f 0%, #00f2ff 100%)' }}>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">📝</span>
            <span className="text-white font-bold text-sm">新增合同</span>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <X size={14} className="text-white" />
          </button>
        </div>
        <div className="px-5 py-3 flex items-center gap-2 flex-shrink-0 border-b border-gray-50">
          {[1, 2, 3].map(s => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {step > s ? <Check size={12} /> : s}
              </div>
              <span className={`text-xs font-medium ${step >= s ? 'text-gray-700' : 'text-gray-400'}`}>
                {s === 1 ? '基本信息' : s === 2 ? '付款节点' : '确认'}
              </span>
              {s < 3 && <div className={`flex-1 h-0.5 mx-1 ${step > s ? 'bg-blue-400' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>
        {step === 1 && (
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
            {[
              { label: '合同名称', key: 'name', placeholder: '请输入合同名称', required: true },
              { label: '甲方', key: 'partyA', placeholder: '请输入甲方名称', required: true },
              { label: '乙方', key: 'partyB', placeholder: '请输入乙方名称', required: true },
              { label: '合同金额（元）', key: 'totalAmount', placeholder: '请输入金额', required: true, type: 'number' },
              { label: '签约日期', key: 'startDate', required: true, type: 'date' },
              { label: '到期日期', key: 'endDate', required: true, type: 'date' },
              { label: '预估毛利率（%）', key: 'estimatedMargin', placeholder: '20', type: 'number' },
            ].map(field => (
              <div key={field.key}>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                  {field.label}{field.required && <span className="text-red-400 ml-0.5">*</span>}
                </label>
                <input type={field.type || 'text'} value={(form as any)[field.key]}
                  onChange={e => setField(field.key as any, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-white" />
              </div>
            ))}
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">合同类型</label>
              <div className="flex gap-2 flex-wrap">
                {(['service', 'sale', 'purchase', 'other'] as ContractType[]).map(t => (
                  <button key={t} onClick={() => setField('type', t)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${form.type === t ? 'text-white' : 'bg-gray-100 text-gray-500'}`}
                    style={form.type === t ? { background: '#00696f' } : {}}>
                    {CONTRACT_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium mb-1.5 block">付款方式</label>
              <div className="flex gap-2 flex-wrap">
                {[{ key: 'once', label: '一次性' }, { key: 'installment', label: '分期付款' }, { key: 'monthly', label: '按月' }].map(opt => (
                  <button key={opt.key} onClick={() => setField('paymentMethod', opt.key)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${form.paymentMethod === opt.key ? 'text-white' : 'bg-gray-100 text-gray-500'}`}
                    style={form.paymentMethod === opt.key ? { background: '#00696f' } : {}}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
            <div className="text-sm font-semibold" style={{ color: '#00696f' }}>付款节点（共{milestones.length}个节点）</div>
            {milestones.map((m, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <div className="text-xs font-semibold text-gray-500">节点 {i + 1}</div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">节点名称</label>
                  <input value={m.name} onChange={e => updateMilestone(i, 'name', e.target.value)} placeholder="如：首付/验收/尾款"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">占比（%）</label>
                    <input type="number" value={m.percent} onChange={e => updateMilestone(i, 'percent', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-white" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">到期日</label>
                    <input type="date" value={m.dueDate} onChange={e => updateMilestone(i, 'dueDate', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-blue-400 bg-white" />
                  </div>
                </div>
                <div className="text-xs text-gray-400">金额：¥{Number(m.amount).toLocaleString()}（自动计算）</div>
              </div>
            ))}
            <button onClick={() => setMilestones(prev => [...prev, { name: '节点', percent: '', amount: '', dueDate: '' }])}
              className="w-full py-2.5 rounded-xl text-sm font-medium border border-dashed border-gray-300 text-gray-400 active:scale-95 transition-transform">
              + 添加节点
            </button>
          </div>
        )}
        {step === 3 && (
          <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
            <div className="rounded-2xl overflow-hidden" style={{ background: '#0D1B2A' }}>
              <div className="px-4 py-3" style={{ background: '#1A2D42' }}>
                <div className="text-xs font-semibold text-white">📋 合同摘要</div>
              </div>
              <div className="px-4 py-4 space-y-2">
                {[
                  { label: '合同名称', value: form.name },
                  { label: '甲方 / 乙方', value: `${form.partyA} / ${form.partyB}` },
                  { label: '合同类型', value: CONTRACT_TYPE_LABELS[form.type] },
                  { label: '合同金额', value: `¥${Number(form.totalAmount).toLocaleString()}` },
                  { label: '预估毛利', value: `¥${grossProfit.toLocaleString()}（${form.estimatedMargin}%）` },
                  { label: '签约日期', value: form.startDate },
                  { label: '到期日期', value: form.endDate },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">{r.label}</span>
                    <span className="text-xs font-semibold text-slate-200">{r.value || '-'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="text-xs font-semibold mb-3" style={{ color: '#00696f' }}>💰 付款节点</div>
              {milestones.map((m, i) => (
                <div key={i} className="flex items-center gap-2 py-1.5">
                  <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[9px]">{i + 1}</span>
                  </div>
                  <span className="text-sm text-gray-700 flex-1">{m.name} {m.percent}%</span>
                  <span className="text-sm font-semibold text-gray-800">¥{Number(m.amount).toLocaleString()}</span>
                  <span className="text-xs text-gray-400">{m.dueDate}</span>
                </div>
              ))}
              <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between">
                <span className="text-xs text-gray-400">合计</span>
                <span className="text-sm font-bold" style={{ color: '#00696f' }}>
                  ¥{milestones.reduce((s, m) => s + Number(m.amount), 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
        <div className="px-5 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
          {step > 1 && (
            <button onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-500 active:scale-95 transition-transform">上一步</button>
          )}
          {step < 3 ? (
            <button onClick={() => setStep(s => s + 1)} disabled={!canNext()}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform disabled:opacity-40"
              style={{ background: canNext() ? '#00696f' : '#ccc' }}>下一步</button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg, #00696f, #00f2ff)' }}>
              {submitting ? '保存中...' : '✓ 确认创建'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============== ContractsTab 组件 ==============

function ContractsTab({ contracts, onDetail, onAdd, onMarkPaid }: {
  contracts: Contract[]
  onDetail: (c: Contract) => void
  onAdd: (c: Contract) => void
  onMarkPaid: (contractId: string, milestoneId: string) => void
}) {
  const [filter, setFilter] = useState<ContractType | 'all'>('all')
  const filtered = filter === 'all' ? contracts : contracts.filter(c => c.type === filter)
  const filterChips: { key: ContractType | 'all'; label: string }[] = [
    { key: 'all', label: '全部' }, { key: 'service', label: '服务' },
    { key: 'sale', label: '销售' }, { key: 'purchase', label: '采购' }, { key: 'other', label: '其他' },
  ]
  return (
    <div className="space-y-3">
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {filterChips.map(chip => (
          <button key={chip.key} onClick={() => setFilter(chip.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all ${filter === chip.key ? 'text-white' : 'bg-white text-gray-500'}`}
            style={filter === chip.key ? { background: '#00696f' } : { boxShadow: '0 1px 3px rgba(0,105,111,0.1)' }}>
            {chip.label}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📝</div>
          <div className="text-sm text-gray-400">暂无合同</div>
        </div>
      ) : filtered.map(c => <ContractCard key={c.id} contract={c} onDetail={onDetail} />)}
    </div>
  )
}

// ============== 子Tab类型（Sprint 8: 简化版）==============

type FinanceSubTab = 'reports' | 'transactions' | 'vouchers' | 'contracts'

const SUB_TABS: { key: FinanceSubTab; label: string; icon?: React.ReactNode }[] = [
  { key: 'reports',     label: '📊 报表' },
  { key: 'transactions', label: '💰 收支' },
  { key: 'vouchers',     label: '🧾 凭证' },
  { key: 'contracts',    label: '📝 合同', icon: <FileSignature size={14} /> },
]

const PURCHASE_CONTRACTS = [
  { name: '北京京东电商有限公司', amount: '¥52,000', date: '2026-03-10', status: '待付款' },
  { name: '阿里云信息技术有限公司', amount: '¥12,000/年', date: '2026-02-28', status: '履约中' },
  { name: '顺丰速运有限公司', amount: '¥3,200/月', date: '2026-03-01', status: '履约中' },
]

const SALES_CONTRACTS = [
  { name: '王总（个人工作室）', amount: '¥30,000', date: '2026-03-20', status: '已收款' },
  { name: '深圳创新科技有限公司', amount: '¥85,000', date: '2026-02-15', status: '履约中' },
]

const WARN_ITEMS = [
  { level: 'high', text: '有3笔支出缺少发票，可能无法税前扣除', action: '补充发票' },
  { level: 'mid', text: '本月进项税额偏低，建议关注成本结构', action: '查看分析' },
]

// ============== 主组件 ==============

export default function FinancePage({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { setTab } = useAppStore()
  const [activeSub, setActiveSub] = useState<FinanceSubTab>('reports')
  const [contracts, setContracts] = useState<Contract[]>(CONTRACTS)
  const [detailContract, setDetailContract] = useState<Contract | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  const handleAddContract = (c: Contract) => setContracts(prev => [c, ...prev])

  const handleMarkPaid = (contractId: string, milestoneId: string) => {
    setContracts(prev => prev.map(c => {
      if (c.id !== contractId) return c
      const today = new Date().toISOString().split('T')[0]
      const updatedMilestones = c.milestones.map(m =>
        m.id === milestoneId ? { ...m, status: 'paid' as const, paidDate: today } : m
      )
      const allPaid = updatedMilestones.every(m => m.status === 'paid')
      return { ...c, milestones: updatedMilestones, status: allPaid ? 'completed' as const : c.status }
    }))
  }

  return (
    <div className="min-h-screen pb-6" style={{ background: '#f7f9fb' }}>
      <div className="px-5 pt-10 pb-4" style={{ background: 'linear-gradient(135deg, #00696f 0%, #00f2ff 100%)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate?.('home')} className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white">
            <ArrowLeft size={16} />
          </button>
          <div className="text-white font-bold text-lg">
            {activeSub === 'reports' ? '📊 财务报表' : activeSub === 'contracts' ? '📝 合同管理' : '财务中心'}
          </div>
          {activeSub === 'contracts' && (
            <button onClick={() => setShowAddModal(true)}
              className="ml-auto flex items-center gap-1 text-xs text-white bg-white/20 px-3 py-1.5 rounded-full">
              <Plus size={13} /> 新增
            </button>
          )}
        </div>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-1 px-1">
          {SUB_TABS.map((t) => (
            <button key={t.key} onClick={() => setActiveSub(t.key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 ${activeSub === t.key ? 'bg-white' : 'bg-white/20'}`}
              style={activeSub === t.key ? { color: '#00696f' } : { color: 'rgba(255,255,255,0.8)' }}>
              {t.icon && <span>{t.icon}</span>}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 space-y-3">
        {activeSub === 'reports' && <ReportsTab onNavigate={() => onNavigate?.('ai')} />}

        {activeSub === 'contracts' && (
          <ContractsTab contracts={contracts} onDetail={setDetailContract} onAdd={handleAddContract} onMarkPaid={handleMarkPaid} />
        )}

        {activeSub === 'vouchers' && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(0,105,111,0.08)' }}>
                <span className="text-2xl">🧾</span>
              </div>
              <div className="text-sm font-bold" style={{ color: '#1E293B' }}>凭证管理</div>
              <div className="text-xs text-gray-400 mt-1 mb-3">查看已入账凭证历史</div>
              <button
                onClick={() => onNavigate?.('vouchers')}
                className="text-sm font-semibold px-4 py-2 rounded-xl text-white active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg, #00696f, #00f2ff)', boxShadow: '0 2px 8px rgba(0,105,111,0.3)' }}
              >
                进入凭证管理 →
              </button>
            </div>
          </div>
        )}

        {activeSub === 'transactions' && (
          <div className="space-y-4">
            <div>
              <div className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">采购合同 ↓ 向供应商付款</div>
              {PURCHASE_CONTRACTS.map((c, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm mb-2 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div><div className="text-sm font-semibold text-gray-800">{c.name}</div><div className="text-xs text-gray-400 mt-0.5">采购合同 · {c.date}</div></div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.status === '待付款' ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600'}`}>{c.status}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-sm font-bold text-gray-800">{c.amount}</div>
                    {c.status === '待付款' && <button onClick={() => onNavigate?.('ai')} className="text-xs px-3 py-1 rounded-full font-medium" style={{ background: '#EEF2FF', color: '#00696f' }}>💬 AI帮我付款</button>}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className="text-xs text-gray-400 font-semibold mb-2 uppercase tracking-wider">销售合同 ↑ 向客户收款</div>
              {SALES_CONTRACTS.map((c, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm mb-2 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <div><div className="text-sm font-semibold text-gray-800">{c.name}</div><div className="text-xs text-gray-400 mt-0.5">销售合同 · {c.date}</div></div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.status === '已收款' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>{c.status}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className={`text-sm font-bold ${c.status === '已收款' ? 'text-emerald-600' : 'text-gray-800'}`}>{c.amount}</div>
                    <button className="text-xs text-blue-600 font-medium bg-blue-50 px-3 py-1 rounded-full">查看详情</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {detailContract && (
        <ContractDetailModal
          contract={detailContract}
          onClose={() => setDetailContract(null)}
          onMarkPaid={handleMarkPaid}
        />
      )}

      {showAddModal && (
        <AddContractModal onClose={() => setShowAddModal(false)} onAdd={handleAddContract} />
      )}
    </div>
  )
}