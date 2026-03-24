/**
 * EmployeeSetupWizard — 首次进入强制员工设置向导（3步）
 */
import { useState } from 'react'
import { X, Plus, Check } from 'lucide-react'
import type { Employee, EmployeeDraft, SalaryDraft, Department } from './types'
import {
  saveEmployees,
  calcSocialInsurance,
  calcHousingFund,
  calcNetSalary,
  maskedIdCard,
  genId,
} from './utils'

interface Props {
  onComplete: (employees: Employee[]) => void
  onSkip?: () => void
}

const DEPARTMENTS: Department[] = ['研发', '产品', '销售', '运营', '行政']

// Step 1 类型
interface Step1Employee extends EmployeeDraft {
  key: string
}

function genKey() {
  return Math.random().toString(36).slice(2)
}

const STEP_LABELS = ['Step 1', 'Step 2', 'Step 3']

export default function EmployeeSetupWizard({ onComplete, onSkip }: Props) {
  const [step, setStep] = useState(0)
  const [step1Employees, setStep1Employees] = useState<Step1Employee[]>([
    { key: genKey(), name: '', department: '研发', position: '', idCard: '' },
  ])
  const [step2Salaries, setStep2Salaries] = useState<Record<string, SalaryDraft>>({})

  const currentKey = step1Employees[0]?.key || ''

  // Step 1 操作
  const addEmployee = () => {
    setStep1Employees(prev => [
      ...prev,
      { key: genKey(), name: '', department: '研发', position: '', idCard: '' },
    ])
  }

  const removeEmployee = (key: string) => {
    setStep1Employees(prev => prev.filter(e => e.key !== key))
  }

  const updateEmployee = (key: string, field: keyof Step1Employee, value: string) => {
    setStep1Employees(prev =>
      prev.map(e => (e.key === key ? { ...e, [field]: value } : e))
    )
  }

  // Step 2 操作
  const updateSalary = (key: string, field: keyof SalaryDraft, value: string) => {
    setStep2Salaries(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))
  }

  const getSalaryDraft = (key: string): SalaryDraft =>
    step2Salaries[key] || { baseSalary: '', otherSubsidy: '' }

  const getBase = (key: string): number => {
    const draft = getSalaryDraft(key)
    return parseFloat(draft.baseSalary) || 0
  }

  // 验证
  const isStep1Valid = () =>
    step1Employees.every(e => e.name.trim() && e.idCard.trim().length >= 4)

  const isStep2Valid = () =>
    step1Employees.every(e => {
      const base = parseFloat(getSalaryDraft(e.key).baseSalary)
      return base > 0
    })

  const handleComplete = () => {
    const now = new Date().toISOString()
    const toSave: Employee[] = step1Employees.map(e => {
      const draft = getSalaryDraft(e.key)
      const base = parseFloat(draft.baseSalary) || 0
      const other = parseFloat(draft.otherSubsidy) || 0
      const social = calcSocialInsurance(base)
      const housing = calcHousingFund(base)
      return {
        id: genId(),
        name: e.name.trim(),
        department: e.department,
        position: e.position.trim(),
        idCard: maskedIdCard(e.idCard.trim()),
        baseSalary: base,
        socialInsuranceBase: base,
        socialInsurancePersonal: social,
        housingFundBase: base,
        housingFundPersonal: housing,
        otherSubsidy: other,
        status: 'active' as const,
        createdAt: now,
      }
    })
    saveEmployees(toSave)
    onComplete(toSave)
  }

  const progressWidth = `${((step + 1) / 3) * 100}%`

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900" style={{ color: '#2563EB' }}>
              {step === 0 && '添加员工'}
              {step === 1 && '设置工资标准'}
              {step === 2 && '员工档案已就绪'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {step === 0 && '先添加至少1名员工基本信息'}
              {step === 1 && '为每名员工设定每月工资结构'}
              {step === 2 && '确认以下信息无误'}
            </p>
          </div>
          <button
            onClick={onSkip}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-5 pb-3">
          <div className="flex items-center gap-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="flex items-center flex-1">
                <div
                  className="h-1.5 flex-1 rounded-full transition-all duration-300"
                  style={{ background: i <= step ? '#4F7DF3' : '#E5E7EB' }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px]" style={{ color: step >= 0 ? '#2563EB' : '#D1D5DB' }}>
              {STEP_LABELS[0]}
            </span>
            <span className="text-[10px]" style={{ color: step >= 1 ? '#2563EB' : '#D1D5DB' }}>
              {STEP_LABELS[1]}
            </span>
            <span className="text-[10px]" style={{ color: step >= 2 ? '#2563EB' : '#D1D5DB' }}>
              {STEP_LABELS[2]}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3">

          {/* Step 1: 添加员工 */}
          {step === 0 && (
            <>
              {step1Employees.map((emp, idx) => (
                <div key={emp.key} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">员工 {idx + 1}</span>
                    {step1Employees.length > 1 && (
                      <button
                        onClick={() => removeEmployee(emp.key)}
                        className="text-xs text-red-400 hover:text-red-500"
                      >
                        删除
                      </button>
                    )}
                  </div>
                  <InputField
                    label="员工姓名"
                    value={emp.name}
                    onChange={v => updateEmployee(emp.key, 'name', v)}
                    placeholder="请输入姓名"
                    required
                  />
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">所在部门 <span className="text-red-400">*</span></label>
                    <select
                      value={emp.department}
                      onChange={e => updateEmployee(emp.key, 'department', e.target.value as Department)}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-400"
                    >
                      {DEPARTMENTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <InputField
                    label="职位"
                    value={emp.position}
                    onChange={v => updateEmployee(emp.key, 'position', v)}
                    placeholder="选填，如：产品经理"
                    required={false}
                  />
                  <InputField
                    label="身份证号"
                    value={emp.idCard}
                    onChange={v => updateEmployee(emp.key, 'idCard', v)}
                    placeholder="请输入身份证号"
                    required
                  />
                </div>
              ))}
              <button
                onClick={addEmployee}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-blue-200 rounded-xl text-sm text-blue-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
              >
                <Plus size={16} />
                添加更多员工
              </button>
            </>
          )}

          {/* Step 2: 设置工资标准 */}
          {step === 1 && (
            <>
              {step1Employees.map((emp, idx) => {
                const draft = getSalaryDraft(emp.key)
                const base = parseFloat(draft.baseSalary) || 0
                const other = parseFloat(draft.otherSubsidy) || 0
                const social = calcSocialInsurance(base)
                const housing = calcHousingFund(base)
                const net = calcNetSalary(base, other, social, housing)

                return (
                  <div key={emp.key} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#4F7DF3' }}>
                        {emp.name.slice(0, 1)}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800">{emp.name}</span>
                        <span className="text-xs text-gray-400 ml-2">{emp.department}</span>
                      </div>
                    </div>
                    <InputField
                      label="基本工资（元）"
                      value={draft.baseSalary}
                      onChange={v => updateSalary(emp.key, 'baseSalary', v)}
                      placeholder="请输入月基本工资"
                      required
                      type="number"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">社保基数</label>
                        <div className="px-3 py-2 text-sm bg-gray-100 rounded-lg text-gray-500">自动 = 基本工资</div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">社保个人（8%）</label>
                        <div className="px-3 py-2 text-sm bg-blue-50 rounded-lg text-blue-600 font-medium">
                          ¥{social.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">公积金基数</label>
                        <div className="px-3 py-2 text-sm bg-gray-100 rounded-lg text-gray-500">自动 = 基本工资</div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">公积金个人（12%）</label>
                        <div className="px-3 py-2 text-sm bg-blue-50 rounded-lg text-blue-600 font-medium">
                          ¥{housing.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <InputField
                      label="其他补贴（元）"
                      value={draft.otherSubsidy}
                      onChange={v => updateSalary(emp.key, 'otherSubsidy', v)}
                      placeholder="选填，如：餐补、交通补贴"
                      required={false}
                      type="number"
                    />
                    {base > 0 && (
                      <div className="bg-emerald-50 rounded-lg px-4 py-2.5 flex items-center justify-between">
                        <span className="text-xs text-emerald-600">估算实发约</span>
                        <span className="text-sm font-bold text-emerald-600">¥{net.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}

          {/* Step 3: 确认保存 */}
          {step === 2 && (
            <>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                {step1Employees.map(emp => {
                  const draft = getSalaryDraft(emp.key)
                  const base = parseFloat(draft.baseSalary) || 0
                  const other = parseFloat(draft.otherSubsidy) || 0
                  const social = calcSocialInsurance(base)
                  const housing = calcHousingFund(base)
                  const net = calcNetSalary(base, other, social, housing)
                  return (
                    <div key={emp.key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: '#4F7DF3' }}>
                          {emp.name.slice(0, 1)}
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-gray-800">{emp.name}</span>
                          <span className="text-xs text-gray-400 ml-2">{emp.department}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">基本¥{base.toLocaleString()}</div>
                        <div className="text-sm font-semibold text-emerald-600">实发约¥{net.toLocaleString()}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3">
                <div>
                  <div className="text-xs text-gray-500">本月工资总额</div>
                  <div className="text-base font-bold text-blue-700">
                    ¥{step1Employees.reduce((sum, emp) => {
                      const base = parseFloat(getSalaryDraft(emp.key).baseSalary) || 0
                      const other = parseFloat(getSalaryDraft(emp.key).otherSubsidy) || 0
                      return sum + base + other
                    }, 0).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">参保人数</div>
                  <div className="text-base font-bold" style={{ color: '#2563EB' }}>{step1Employees.length}人</div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer buttons */}
        <div className="px-5 pb-5 pt-2 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >
              上一步
            </button>
          )}
          {step < 2 && (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 0 ? !isStep1Valid() : !isStep2Valid()}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
              style={{ background: '#4F7DF3' }}
            >
              下一步
            </button>
          )}
          {step === 2 && (
            <button
              onClick={handleComplete}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: '#4F7DF3' }}
            >
              <Check size={16} />
              确认保存
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// 小型输入组件
function InputField({
  label,
  value,
  onChange,
  placeholder,
  required,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  required?: boolean
  type?: string
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 transition-colors"
      />
    </div>
  )
}
