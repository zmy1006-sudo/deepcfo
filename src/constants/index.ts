/**
 * DeepCFO 全局常量配置
 * 包含：配色/导航/初始数据
 * @see 设计规范: /workspace/deepcfo/deepcfo-design-spec.md
 */

// ============== 配色规范（来自V4设计规范）==============

export const COLORS = {
  primary: '#2563EB',     // 主色（蓝）
  accent: '#DC2626',     // 收入/紧急/增长（中国特色语义：红=正向）
  success: '#059669',    // 仅"已完成"状态
  warning: '#D97706',    // 即将到期
  background: '#F8FAFC', // 极浅灰白
  surface: '#FFFFFF',    // 纯白卡片
  expense: '#1D4ED8',    // 支出（蓝=负向）
} as const

// ============== 导航配置 ==============

import { Home, AlertCircle, FileCheck, Wallet, Scale } from 'lucide-react'
import type { Tab } from '@/types'

export const NAV_ITEMS = [
  { key: 'home' as Tab, icon: Home, label: '首页' },
  { key: 'chat' as Tab, icon: AlertCircle, label: 'AI助手' },
  { key: 'tax' as Tab, icon: FileCheck, label: '报税' },
  { key: 'finance' as Tab, icon: Wallet, label: '财务' },
  { key: 'me' as Tab, icon: Scale, label: '我的' },
]

// ============== 税务状态工具函数 ==============

export const dotColor = (s: string) =>
  s === 'urgent' ? 'bg-red-500' : s === 'soon' ? 'bg-amber-500' : s === 'done' ? 'bg-emerald-500' : 'bg-gray-300'

export const tagClass = (s: string) =>
  s === 'urgent'
    ? 'bg-red-100 text-red-600'
    : s === 'soon'
    ? 'bg-amber-100 text-amber-600'
    : s === 'done'
    ? 'bg-emerald-100 text-emerald-600'
    : 'bg-gray-100 text-gray-500'

export const tagText = (s: string) =>
  s === 'urgent' ? '🔴 紧急' : s === 'soon' ? '⚡ 即将到期' : s === 'done' ? '✓ 已完成' : ''

// ============== 合同 Mock 数据 ==============

import type { Contract, PaymentMilestone } from '@/types'

export const CONTRACTS: Contract[] = [
  {
    id: 'c-1',
    name: '王总公司-产品设计合同',
    partyA: '王总公司',
    partyB: '北京深度财税科技有限公司',
    type: 'service',
    totalAmount: 300000,
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    paymentMethod: 'installment',
    estimatedMargin: 25,
    status: 'active',
    milestones: [
      { id: 'm1', name: '首付30%', percent: 30, amount: 90000, dueDate: '2026-01-15', paidDate: '2026-01-15', status: 'paid' },
      { id: 'm2', name: '验收60%', percent: 60, amount: 180000, dueDate: '2026-03-31', status: 'overdue' },
      { id: 'm3', name: '尾款10%', percent: 10, amount: 30000, dueDate: '2026-06-30', status: 'pending' },
    ],
    voucherIds: ['v-1'],
    createdAt: '2026-01-01',
  },
  {
    id: 'c-2',
    name: '李四公司-技术服务合同',
    partyA: '李四公司',
    partyB: '北京深度财税科技有限公司',
    type: 'service',
    totalAmount: 120000,
    startDate: '2026-01-01',
    endDate: '2026-04-30',
    paymentMethod: 'once',
    estimatedMargin: 28,
    status: 'completed',
    milestones: [
      { id: 'm4', name: '一次性付款', percent: 100, amount: 120000, dueDate: '2026-02-28', paidDate: '2026-02-25', status: 'paid' },
    ],
    voucherIds: [],
    createdAt: '2026-01-01',
  },
  {
    id: 'c-3',
    name: '赵五公司-软件采购合同',
    partyA: '北京深度财税科技有限公司',
    partyB: '赵五公司',
    type: 'purchase',
    totalAmount: 80000,
    startDate: '2026-02-01',
    endDate: '2026-08-01',
    paymentMethod: 'installment',
    estimatedMargin: 15,
    status: 'active',
    milestones: [
      { id: 'm5', name: '首付50%', percent: 50, amount: 40000, dueDate: '2026-02-15', paidDate: '2026-02-15', status: 'paid' },
      { id: 'm6', name: '验收50%', percent: 50, amount: 40000, dueDate: '2026-05-01', status: 'pending' },
    ],
    voucherIds: [],
    createdAt: '2026-02-01',
  },
]

export const CONTRACT_TYPE_LABELS: Record<string, string> = {
  sale: '销售合同',
  purchase: '采购合同',
  service: '服务合同',
  other: '其他',
}

export const formatMoney = (n: number) =>
  n >= 10000 ? `¥${(n / 10000).toFixed(1)}万` : `¥${n.toLocaleString()}`

export const getContractStatus = (c: Contract) => {
  const today = new Date()
  if (c.status === 'completed') return '🟢'
  const hasOverdue = c.milestones.some(m => m.status === 'overdue')
  if (hasOverdue) return '🔴'
  const soon = c.milestones.find(m => m.status === 'pending' && m.dueDate) as PaymentMilestone | undefined
  if (soon) {
    const due = new Date(soon.dueDate)
    const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    if (diff < 7) return '🟡'
  }
  return '🟡'
}

export const getTotalPaid = (c: Contract) =>
  c.milestones.filter(m => m.status === 'paid').reduce((s, m) => s + m.amount, 0)
