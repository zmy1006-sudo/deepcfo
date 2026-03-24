/**
 * EmployeesTab — 员工管理子Tab
 */
import { useState, useEffect } from 'react'
import { Plus, TrendingUp, UserMinus, X, Check } from 'lucide-react'
import type { Employee, Department } from './types'
import { loadEmployees, saveEmployees, maskedIdCard, fmtYuan, loadAdjustments, saveAdjustments, genId, calcNetSalary, calcSocialInsurance, calcHousingFund } from './utils'

const DEPARTMENTS: Department[] = ['研发', '产品', '销售', '运营', '行政']

interface Props {
  onRefresh: () => void
}

export default function EmployeesTab({ onRefresh }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [showDetail, setShowDetail] = useState<Employee | null>(null)
  const [showAdjustment, setShowAdjustment] = useState<Employee | null>(null)
  const [adjustNewSalary, setAdjustNewSalary] = useState('')
  const [adjustMonth, setAdjustMonth] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })

  useEffect(() => {
    setEmployees(loadEmployees())
  }, [])

  const refresh = () => {
    setEmployees(loadEmployees())
    onRefresh()
  }

  const handleResign = (emp: Employee) => {
    const updated = employees.map(e =>
      e.id === emp.id ? { ...e, status: 'inactive' as const } : e
    )
    saveEmployees(updated)
    setEmployees(updated)
    setShowDetail(null)
  }

  const handleAdjustment = () => {
    if (!showAdjustment || !adjustNewSalary) return
    const newSalary = parseFloat(adjustNewSalary)
    if (newSalary <= 0) return

    // 保存调薪记录
    const adj = {
      id: genId(),
      employeeId: showAdjustment.id,
      oldSalary: showAdjustment.baseSalary,
      newSalary,
      effectiveMonth: adjustMonth,
      createdAt: new Date().toISOString(),
    }
    const adjList = [...loadAdjustments(), adj]
    saveAdjustments(adjList)

    // 更新员工
    const updated = employees.map(e =>
      e.id === showAdjustment.id
        ? {
            ...e,
            baseSalary: newSalary,
            socialInsuranceBase: newSalary,
            socialInsurancePersonal: calcSocialInsurance(newSalary),
            housingFundBase: newSalary,
            housingFundPersonal: calcHousingFund(newSalary),
          }
        : e
    )
    saveEmployees(updated)
    setEmployees(updated)
    setShowAdjustment(null)
    setAdjustNewSalary('')
  }

  const activeEmployees = employees.filter(e => e.status === 'active')
  const inactiveEmployees = employees.filter(e => e.status === 'inactive')

  const renderEmployee = (emp: Employee) => {
    const net = calcNetSalary(emp.baseSalary, emp.otherSubsidy, emp.socialInsurancePersonal, emp.housingFundPersonal)
    return (
      <button
        key={emp.id}
        onClick={() => setShowDetail(emp)}
        className="w-full text-left bg-white rounded-xl border border-gray-100 p-4 mb-2 hover:border-blue-200 transition-colors shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
            style={{ background: emp.status === 'inactive' ? '#9CA3AF' : '#4F7DF3' }}>
            {emp.name.slice(0, 1)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-800">{emp.name}</span>
              <span className="text-xs text-gray-400">{emp.department}</span>
              {emp.status === 'inactive' && (
                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-400 rounded">已离职</span>
              )}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              身份证：{emp.idCard}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-sm font-bold" style={{ color: '#2563EB' }}>
              ¥{fmtYuan(emp.baseSalary)}
            </div>
            <div className="text-xs text-emerald-500">实发约¥{fmtYuan(net)}</div>
          </div>
        </div>
        <div className="flex gap-3 mt-2 pl-12">
          <span className="text-[10px] text-gray-400">参保：</span>
          <span className="text-[10px] text-emerald-500">社保✓</span>
          <span className="text-[10px] text-emerald-500">公积金✓</span>
        </div>
      </button>
    )
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-800">👥 员工</h2>
          <p className="text-xs text-gray-400">{activeEmployees.length}人在职</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdjustment(employees[0] || null)}
            className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <TrendingUp size={12} />
            调薪
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-white transition-colors"
            style={{ background: '#4F7DF3' }}
          >
            <Plus size={12} />
            添加
          </button>
        </div>
      </div>

      {/* 员工列表 */}
      {employees.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">👥</div>
          <p className="text-sm">暂无员工</p>
          <p className="text-xs mt-1">点击右上角「添加」添加第一位员工</p>
        </div>
      ) : (
        <>
          {activeEmployees.map(renderEmployee)}
          {inactiveEmployees.length > 0 && (
            <>
              <div className="text-xs text-gray-400 mt-4 mb-2">已离职</div>
              {inactiveEmployees.map(renderEmployee)}
            </>
          )}
        </>
      )}

      {/* 添加员工弹窗 */}
      {showAdd && (
        <AddEmployeeModal
          onClose={() => setShowAdd(false)}
          onAdd={(emp) => {
            const list = [...employees, emp]
            saveEmployees(list)
            setEmployees(list)
            setShowAdd(false)
            onRefresh()
          }}
        />
      )}

      {/* 员工详情弹窗 */}
      {showDetail && (
        <EmployeeDetailModal
          employee={showDetail}
          onClose={() => setShowDetail(null)}
          onResign={() => handleResign(showDetail)}
          onAdjust={() => {
            setAdjustNewSalary(String(showDetail.baseSalary))
            setShowAdjustment(showDetail)
            setShowDetail(null)
          }}
        />
      )}

      {/* 调薪弹窗 */}
      {showAdjustment && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden">
            <div className="px-5 pt-5 pb-3 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">💰 调整工资</h3>
              <button onClick={() => setShowAdjustment(null)} className="p-1 text-gray-400">
                <X size={18} />
              </button>
            </div>
            <div className="px-5 pb-5 space-y-4">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#4F7DF3' }}>
                  {showAdjustment.name.slice(0, 1)}
                </div>
                <div>
                  <div className="text-sm font-semibold">{showAdjustment.name}</div>
                  <div className="text-xs text-gray-400">当前基本工资 ¥{fmtYuan(showAdjustment.baseSalary)}</div>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">新基本工资（元）</label>
                <input
                  type="number"
                  value={adjustNewSalary}
                  onChange={e => setAdjustNewSalary(e.target.value)}
                  placeholder="请输入新基本工资"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">生效月份</label>
                <input
                  type="month"
                  value={adjustMonth}
                  onChange={e => setAdjustMonth(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                />
              </div>
              <button
                onClick={handleAdjustment}
                disabled={!adjustNewSalary || parseFloat(adjustNewSalary) <= 0}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: '#4F7DF3' }}
              >
                保存调薪记录
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 添加员工弹窗
function AddEmployeeModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (emp: Employee) => void
}) {
  const [name, setName] = useState('')
  const [dept, setDept] = useState<Department>('研发')
  const [position, setPosition] = useState('')
  const [idCard, setIdCard] = useState('')
  const [baseSalary, setBaseSalary] = useState('')
  const [otherSubsidy, setOtherSubsidy] = useState('')

  const handleSave = () => {
    if (!name.trim() || !idCard.trim() || !baseSalary) return
    const base = parseFloat(baseSalary)
    if (base <= 0) return

    const social = Math.round(base * 0.08 * 100) / 100
    const housing = Math.round(base * 0.12 * 100) / 100

    onAdd({
      id: genId(),
      name: name.trim(),
      department: dept,
      position: position.trim(),
      idCard: maskedIdCard(idCard.trim()),
      baseSalary: base,
      socialInsuranceBase: base,
      socialInsurancePersonal: social,
      housingFundBase: base,
      housingFundPersonal: housing,
      otherSubsidy: parseFloat(otherSubsidy) || 0,
      status: 'active',
      createdAt: new Date().toISOString(),
    })
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">➕ 添加员工</h3>
          <button onClick={onClose} className="p-1 text-gray-400"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">姓名 <span className="text-red-400">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="请输入姓名"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">部门 <span className="text-red-400">*</span></label>
            <select value={dept} onChange={e => setDept(e.target.value as Department)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:border-blue-400">
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">职位（选填）</label>
            <input value={position} onChange={e => setPosition(e.target.value)} placeholder="如：产品经理"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">身份证号 <span className="text-red-400">*</span></label>
            <input value={idCard} onChange={e => setIdCard(e.target.value)} placeholder="请输入身份证号"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">基本工资（元）<span className="text-red-400">*</span></label>
            <input type="number" value={baseSalary} onChange={e => setBaseSalary(e.target.value)} placeholder="请输入月基本工资"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">其他补贴（元）</label>
            <input type="number" value={otherSubsidy} onChange={e => setOtherSubsidy(e.target.value)} placeholder="选填"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
          </div>
        </div>
        <div className="px-5 pb-5 pt-2">
          <button
            onClick={handleSave}
            disabled={!name.trim() || !idCard.trim() || !baseSalary || parseFloat(baseSalary) <= 0}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: '#4F7DF3' }}
          >
            保存员工
          </button>
        </div>
      </div>
    </div>
  )
}

// 员工详情弹窗
function EmployeeDetailModal({
  employee: emp,
  onClose,
  onResign,
  onAdjust,
}: {
  employee: Employee
  onClose: () => void
  onResign: () => void
  onAdjust: () => void
}) {
  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-sm rounded-t-2xl sm:rounded-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ background: '#4F7DF3' }}>
              {emp.name.slice(0, 1)}
            </div>
            <div>
              <h3 className="font-bold text-gray-800">{emp.name}</h3>
              <p className="text-xs text-gray-400">{emp.department} {emp.position ? `· ${emp.position}` : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400"><X size={18} /></button>
        </div>
        <div className="px-5 pb-5 space-y-3">
          <DetailRow label="基本工资" value={`¥${fmtYuan(emp.baseSalary)}`} />
          <DetailRow label="社保个人（8%）" value={`-¥${fmtYuan(emp.socialInsurancePersonal)}`} color="text-red-500" />
          <DetailRow label="公积金个人（12%）" value={`-¥${fmtYuan(emp.housingFundPersonal)}`} color="text-red-500" />
          {emp.otherSubsidy > 0 && <DetailRow label="其他补贴" value={`+¥${fmtYuan(emp.otherSubsidy)}`} color="text-emerald-500" />}
          <DetailRow label="身份证" value={emp.idCard} />
          <div className="flex gap-2 mt-4">
            <button
              onClick={onAdjust}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 flex items-center justify-center gap-1 hover:bg-gray-50"
            >
              <TrendingUp size={14} />
              调薪
            </button>
            <button
              onClick={onResign}
              className="flex-1 py-2.5 rounded-xl border border-red-100 text-sm text-red-500 flex items-center justify-center gap-1 hover:bg-red-50"
            >
              <UserMinus size={14} />
              离职
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DetailRow({ label, value, color = 'text-gray-800' }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-sm font-medium ${color}`}>{value}</span>
    </div>
  )
}
