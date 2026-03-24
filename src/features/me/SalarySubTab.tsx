/**
 * SalarySubTab — 工资相关子Tab（Sprint 8）
 * 从"我的"Tab入口进入，包含员工管理/发工资/工资条
 */
import { useState } from 'react'
import { ArrowLeft, Users, CreditCard, FileText } from 'lucide-react'
import EmployeesTab from '@/features/salary/EmployeesTab'
import PayrollTab from '@/features/salary/PayrollTab'

interface Props {
  tab: 'employees' | 'salary' | 'slips'
  onBack: () => void
}

const TAB_META = {
  employees: { label: '员工管理', icon: Users },
  salary:    { label: '发工资',   icon: CreditCard },
  slips:     { label: '工资条',   icon: FileText },
}

export default function SalarySubTab({ tab, onBack }: Props) {
  const [activeSalaryTab, setActiveSalaryTab] = useState<'employees' | 'payroll' | 'slips'>(
    tab === 'employees' ? 'employees' : tab === 'salary' ? 'payroll' : 'slips'
  )

  return (
    <div className="max-w-md mx-auto min-h-screen pb-24" style={{ background: '#F1F5F9' }}>
      {/* 顶部栏 */}
      <div
        className="px-4 pt-10 pb-4 flex items-center gap-3 relative"
        style={{ background: 'linear-gradient(135deg, #4F7DF3 0%, #2563EB 100%)' }}
      >
        <button
          onClick={onBack}
          className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="text-white font-bold text-base">
          {TAB_META[tab].label}
        </div>
      </div>

      {/* 子Tab切换（发工资/工资条时显示） */}
      {tab !== 'employees' && (
        <div className="px-4 py-3 flex gap-2">
          {[
            { key: 'payroll' as const, label: '💸 发工资' },
            { key: 'slips' as const, label: '📋 工资条' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setActiveSalaryTab(t.key)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95"
              style={
                activeSalaryTab === t.key
                  ? { background: '#4F7DF3', color: '#fff', boxShadow: '0 2px 8px rgba(79,125,243,0.3)' }
                  : { background: '#fff', color: '#64748B' }
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* 内容区 */}
      <div className="px-4 py-3">
        {activeSalaryTab === 'employees' && <EmployeesTab onRefresh={() => {}} />}
        {activeSalaryTab === 'payroll' && <PayrollTab onRefresh={() => {}} />}
        {activeSalaryTab === 'slips' && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📋</div>
            <div className="text-base font-bold text-gray-700 mb-1">工资条</div>
            <div className="text-sm text-gray-400">工资条功能开发中，即将上线</div>
          </div>
        )}
      </div>
    </div>
  )
}
