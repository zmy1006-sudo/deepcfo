/**
 * SalaryPage — 工资Tab主容器
 * 下设3个子Tab：员工 / 发工资 / 工资条
 * 首次进入强制引导员工设置
 */
import { useState, useEffect, useRef } from 'react'
import type { Employee } from './types'
import { loadEmployees } from './utils'
import EmployeeSetupWizard from './EmployeeSetupWizard'
import EmployeesTab from './EmployeesTab'
import PayrollTab from './PayrollTab'

const SALARY_TABS = [
  { key: 'employees', label: '👥 员工' },
  { key: 'payroll',   label: '💸 发工资' },
  { key: 'slips',     label: '📋 工资条' },
] as const

type SalaryTabKey = typeof SALARY_TABS[number]['key']

interface Props {
  onNavigate: (tab: string) => void
}

export default function SalaryPage({ onNavigate }: Props) {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [currentSubTab, setCurrentSubTab] = useState<SalaryTabKey>('employees')
  const [showWizard, setShowWizard] = useState(false)
  const [wizardKey, setWizardKey] = useState(0) // 用于重新渲染向导
  const initialized = useRef(false)

  // 初始化：检查是否有员工数据
  useEffect(() => {
    if (initialized.current) return
    initialized.current = true
    const emps = loadEmployees()
    setEmployees(emps)
    // 如果没有员工，弹出向导
    if (emps.length === 0) {
      setShowWizard(true)
    }
  }, [])

  // 切换子Tab时的首次进入检测
  const handleTabChange = (tab: SalaryTabKey) => {
    setCurrentSubTab(tab)
    const emps = loadEmployees()
    if (emps.length === 0 && !showWizard) {
      setShowWizard(true)
    }
  }

  const handleWizardComplete = (newEmployees: Employee[]) => {
    setEmployees(newEmployees)
    setShowWizard(false)
    setWizardKey(k => k + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* 顶部安全区 */}
      <div className="h-11 bg-white" />

      {/* 页面标题 */}
      <div className="bg-white px-5 pb-3 pt-2 border-b border-gray-100">
        <h1 className="text-lg font-bold" style={{ color: '#2563EB' }}>💰 工资管理</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          {employees.length > 0 ? `${employees.filter(e => e.status === 'active').length}名在职员工` : '点击下方设置员工信息'}
        </p>
      </div>

      {/* 子Tab切换 */}
      <div className="bg-white px-5 py-2.5 flex gap-1">
        {SALARY_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-all"
            style={{
              background: currentSubTab === tab.key ? '#4F7DF3' : '#F3F4F6',
              color: currentSubTab === tab.key ? '#FFFFFF' : '#9CA3AF',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 子Tab内容 */}
      <div className="px-4 py-4">
        {currentSubTab === 'employees' && (
          <EmployeesTab onRefresh={() => setEmployees(loadEmployees())} />
        )}
        {(currentSubTab === 'payroll' || currentSubTab === 'slips') && (
          <PayrollTab onRefresh={() => setEmployees(loadEmployees())} />
        )}
      </div>

      {/* 首次设置向导 */}
      {showWizard && (
        <EmployeeSetupWizard
          key={wizardKey}
          onComplete={handleWizardComplete}
          onSkip={() => {
            const emps = loadEmployees()
            if (emps.length === 0) {
              // 没有员工时禁止关闭
              setShowWizard(true)
            } else {
              setShowWizard(false)
            }
          }}
        />
      )}
    </div>
  )
}
