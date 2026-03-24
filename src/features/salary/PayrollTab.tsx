/**
 * PayrollTab — 发工资 + 工资条 子Tab（合并为一个文件，通过 subTab 区分）
 */
import { useState, useEffect } from 'react'
import { Check, X, Download, ChevronDown, ChevronUp } from 'lucide-react'
import type { Employee, SalarySlip } from './types'
import {
  loadEmployees,
  loadSlips,
  saveSlips,
  calcNetSalary,
  calcSocialInsurance,
  calcHousingFund,
  fmtYuan,
  genId,
  genVoucherNo,
  monthLabel,
  currentMonth,
} from './utils'

interface Props {
  onRefresh: () => void
}

export default function PayrollTab({ onRefresh }: Props) {
  const [subTab, setSubTab] = useState<'payroll' | 'slips'>('payroll')
  return (
    <div>
      {/* 子Tab切换 */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-4">
        <button
          onClick={() => setSubTab('payroll')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${subTab === 'payroll' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
        >
          💸 发工资
        </button>
        <button
          onClick={() => setSubTab('slips')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${subTab === 'slips' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-400'}`}
        >
          📋 工资条
        </button>
      </div>
      {subTab === 'payroll' ? (
        <PayrollContent onRefresh={onRefresh} />
      ) : (
        <SlipsContent onRefresh={onRefresh} />
      )}
    </div>
  )
}

// ===== 发工资内容 =====
function PayrollContent({ onRefresh }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [currentM] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    setEmployees(loadEmployees())
  }, [])

  const activeEmployees = employees.filter(e => e.status === 'active')

  // 加载已有工资条确定已发状态
  const slips = loadSlips()
  const paidIds = new Set(
    slips.filter(s => s.month === currentM && s.status === 'paid').map(s => s.employeeId)
  )

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selected.size === activeEmployees.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(activeEmployees.map(e => e.id)))
    }
  }

  const totalSalary = activeEmployees.reduce((s, e) => s + e.baseSalary + e.otherSubsidy, 0)
  const selectedTotal = activeEmployees
    .filter(e => selected.has(e.id))
    .reduce((s, e) => s + e.baseSalary + e.otherSubsidy, 0)
  const selectedSocial = activeEmployees
    .filter(e => selected.has(e.id))
    .reduce((s, e) => s + e.socialInsurancePersonal + e.housingFundPersonal, 0)

  const handlePay = () => {
    if (selected.size === 0) return
    const now = new Date().toISOString().slice(0, 10)
    const newSlips: SalarySlip[] = activeEmployees
      .filter(e => selected.has(e.id))
      .map(e => {
        const net = calcNetSalary(e.baseSalary, e.otherSubsidy, e.socialInsurancePersonal, e.housingFundPersonal)
        const gross = e.baseSalary + e.otherSubsidy
        // 简化个税
        const taxable = gross - e.socialInsurancePersonal - e.housingFundPersonal - 5000
        const tax = Math.max(0, taxable * 0.03)
        return {
          id: genId(),
          employeeId: e.id,
          month: currentM,
          baseSalary: e.baseSalary,
          bonus: e.otherSubsidy,
          socialInsurance: e.socialInsurancePersonal,
          housingFund: e.housingFundPersonal,
          tax: Math.round(tax),
          netSalary: Math.round(net - Math.round(tax)),
          paidDate: now,
          voucherId: genVoucherNo(),
          status: 'paid' as const,
          createdAt: now,
        }
      })

    // 合并保存
    const existing = loadSlips()
    const others = existing.filter(s => !(s.month === currentM && selected.has(s.employeeId)))
    saveSlips([...others, ...newSlips])
    setSelected(new Set())
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2500)
    onRefresh()
  }

  return (
    <div className="pb-20">
      {/* 月份标题 */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-gray-800">💸 {monthLabel(currentM)}工资</h2>
        </div>
        <button
          onClick={selectAll}
          className="text-xs text-blue-500 hover:text-blue-600"
        >
          {selected.size === activeEmployees.length ? '取消全选' : '全选'}
        </button>
      </div>

      {/* 员工列表 */}
      <div className="space-y-2 mb-4">
        {activeEmployees.map(emp => {
          const isPaid = paidIds.has(emp.id)
          const isSelected = selected.has(emp.id)
          return (
            <div
              key={emp.id}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-100 bg-white'}`}
              onClick={() => !isPaid && toggle(emp.id)}
            >
              <div className={`w-5 h-5 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors ${isPaid ? 'border-emerald-300 bg-emerald-50' : isSelected ? 'border-blue-400 bg-blue-400' : 'border-gray-200'}`}>
                {(isSelected || isPaid) && <Check size={12} className={isPaid ? 'text-emerald-400' : 'text-white'} />}
              </div>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#4F7DF3' }}>
                {emp.name.slice(0, 1)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800">{emp.name}</div>
                <div className="text-xs text-gray-400">{emp.department}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold" style={{ color: '#1B3F5C' }}>
                  ¥{fmtYuan(emp.baseSalary + emp.otherSubsidy)}
                </div>
                <div className={`text-[10px] px-1.5 py-0.5 rounded-full inline-block ${isPaid ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                  {isPaid ? '✓已发' : '待发'}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* 汇总 */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>本月工资总额</span>
          <span className="font-semibold">¥{fmtYuan(totalSalary)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>选中发放</span>
          <span className="font-semibold text-blue-600">¥{fmtYuan(selectedTotal)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>社保公积金合计</span>
          <span className="font-semibold text-red-400">-¥{fmtYuan(selectedSocial)}</span>
        </div>
      </div>

      {/* 发放按钮 */}
      <button
        onClick={handlePay}
        disabled={selected.size === 0}
        className="w-full py-3.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
        style={{ background: '#4F7DF3' }}
      >
        💸 确认发放{selected.size > 0 ? `（${selected.size}人）` : ''}
      </button>

      {/* 成功提示 */}
      {showSuccess && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[300] bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-pulse">
          ✅ 工资发放成功！凭证已生成
        </div>
      )}
    </div>
  )
}

// ===== 工资条内容 =====
function SlipsContent({ onRefresh }: Props) {
  const [slips, setSlips] = useState<SalarySlip[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedSlip, setSelectedSlip] = useState<SalarySlip | null>(null)

  useEffect(() => {
    setSlips(loadSlips())
    setEmployees(loadEmployees())
  }, [])

  // 按月份分组
  const grouped: Record<string, SalarySlip[]> = {}
  slips.forEach(s => {
    if (!grouped[s.month]) grouped[s.month] = []
    grouped[s.month].push(s)
  })
  const months = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  const getEmployeeName = (id: string) => employees.find(e => e.id === id)?.name || '未知'
  const getEmployeeBank = (id: string) => employees.find(e => e.id === id)

  return (
    <div className="pb-20">
      <h2 className="text-base font-bold text-gray-800 mb-4">📋 工资条</h2>

      {months.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm">暂无工资条</p>
          <p className="text-xs mt-1">请先在「发工资」中发放本月工资</p>
        </div>
      ) : (
        months.map(month => (
          <div key={month} className="mb-4">
            <div className="text-xs text-gray-500 font-medium mb-2 px-1">{monthLabel(month)}</div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {grouped[month].map(slip => (
                <button
                  key={slip.id}
                  onClick={() => setSelectedSlip(slip)}
                  className="w-full flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#4F7DF3' }}>
                      {getEmployeeName(slip.employeeId).slice(0, 1)}
                    </div>
                    <span className="text-sm text-gray-800">{getEmployeeName(slip.employeeId)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-emerald-600">¥{fmtYuan(slip.netSalary)}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${slip.status === 'paid' ? 'bg-emerald-50 text-emerald-500' : 'bg-amber-50 text-amber-500'}`}>
                      {slip.status === 'paid' ? '✓已发' : '待发'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))
      )}

      {/* 工资条详情弹窗 */}
      {selectedSlip && (
        <SlipDetailModal
          slip={selectedSlip}
          employee={getEmployeeBank(selectedSlip.employeeId)}
          onClose={() => setSelectedSlip(null)}
        />
      )}
    </div>
  )
}

function SlipDetailModal({ slip, employee, onClose }: { slip: SalarySlip; employee?: Employee; onClose: () => void }) {
  const empName = employee?.name || '未知'
  const gross = slip.baseSalary + slip.bonus
  const { monthLabel: ml } = { monthLabel: (m: string) => monthLabel(m) }

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800">{empName} · {monthLabel(slip.month)}工资</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2">
          {/* 收入 */}
          <div className="bg-emerald-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">基本工资</span><span className="font-medium">¥{fmtYuan(slip.baseSalary)}</span></div>
            {slip.bonus > 0 && <div className="flex justify-between text-sm"><span className="text-gray-500">绩效奖金</span><span className="font-medium">¥{fmtYuan(slip.bonus)}</span></div>}
            <div className="flex justify-between text-sm border-t border-emerald-100 pt-2 mt-1"><span className="text-gray-600 font-medium">应发合计</span><span className="font-bold text-emerald-700">¥{fmtYuan(gross)}</span></div>
          </div>

          {/* 扣除 */}
          <div className="bg-red-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-gray-500">社保个人</span><span className="font-medium text-red-500">-¥{fmtYuan(slip.socialInsurance)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">公积金</span><span className="font-medium text-red-500">-¥{fmtYuan(slip.housingFund)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-gray-500">个税预扣</span><span className="font-medium text-red-500">-¥{fmtYuan(slip.tax)}</span></div>
            <div className="flex justify-between text-sm border-t border-red-100 pt-2 mt-1"><span className="text-gray-600 font-medium">实发金额</span><span className="font-bold text-red-700">¥{fmtYuan(slip.netSalary)}</span></div>
          </div>

          {/* 附加信息 */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-1.5">
            {slip.paidDate && <div className="flex justify-between text-xs"><span className="text-gray-400">发薪日期</span><span className="text-gray-600">{slip.paidDate}</span></div>}
            {slip.voucherId && <div className="flex justify-between text-xs"><span className="text-gray-400">凭证编号</span><span className="text-gray-600 font-mono">{slip.voucherId}</span></div>}
          </div>

          {/* 保存按钮 */}
          <button className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
            <Download size={14} />
            保存到相册
          </button>
        </div>
      </div>
    </div>
  )
}
