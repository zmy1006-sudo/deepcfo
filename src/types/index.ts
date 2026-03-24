/**
 * DeepCFO 全局类型定义
 * @see PRD: /workspace/projects/deepcfo/PRD.md
 * @see 品味不变量清单: memory/品味不变量清单.md
 */

// ============== 全局枚举/常量 ==============

export type Tab = 'home' | 'tax' | 'finance' | 'me'
export type SubTab = 'salary' | 'contract' | 'report' | 'warn'

// ============== 消息类型 ==============

export interface VoucherData {
  title: string
  rows: Array<{ label: string; value: string; color?: string }>
}

export interface PublicOption {
  icon: string
  label: string
  sub: string
  selected?: boolean
}

export interface Message {
  id: number
  role: 'ai' | 'user'
  text: string
  voucher?: boolean
  voucherData?: VoucherData
  publicUse?: boolean
  publicOptions?: PublicOption[]
}

export type SendMessageHandler = (text?: string) => void

// ============== 税务类型 ==============

export type TaxStatus = 'urgent' | 'soon' | 'done' | 'normal'

export interface TaxItem {
  name: string
  date: string
  amount: string
  status: TaxStatus
  progress: number
  type: string
}

// ============== 财务类型 ==============

export interface Staff {
  name: string
  base: number
  tax: number
}

// ============== 合同类型（Sprint 6）==============

export type ContractType = 'sale' | 'purchase' | 'service' | 'other'
export type ContractStatus = 'active' | 'completed' | 'cancelled'
export type MilestoneStatus = 'pending' | 'paid' | 'overdue'

export interface PaymentMilestone {
  id: string
  name: string          // 首付/验收/尾款
  percent: number       // 占比%
  amount: number        // 金额
  dueDate: string      // 到期日
  paidDate?: string     // 实际付款日
  status: MilestoneStatus
}

export interface Contract {
  id: string
  name: string          // 合同名称
  partyA: string        // 甲方
  partyB: string        // 乙方
  type: ContractType
  totalAmount: number   // 合同总金额
  startDate: string
  endDate: string
  paymentMethod: 'once' | 'installment' | 'monthly'
  estimatedMargin: number   // 预估毛利率%（默认20）
  milestones: PaymentMilestone[]
  status: ContractStatus
  voucherIds: string[]      // 关联凭证ID列表
  createdAt: string
}

// ============== 员工/工资类型 ==============

export type EmployeeStatus = 'pending' | 'paid'

export interface Employee {
  id: string
  name: string
  idCard: string          // 身份证号（脱敏显示）
  department: string       // 部门
  position: string        // 职位
  baseSalary: number      // 基本工资
  socialInsurance: number // 社保个人部分
  housingFund: number     // 公积金个人部分
  tax: number            // 个税预扣
  status: EmployeeStatus
}

export interface ReportItem {
  label: string
  value: string
  change: string
  color: string
  bg: string
}

export interface WarnItem {
  level: 'high' | 'mid' | 'low'
  text: string
  action: string
}

// ============== 企业注册类型 ==============

export type TaxType = 'small' | 'general'

export interface EnterpriseInfo {
  creditCode: string
  name: string
  legalPerson: string
  registeredCapital: string
  establishDate: string
  address: string
  businessScope: string
  taxType: TaxType | null
}

export type OnboardingStep =
  | 'none'
  | 'credit-code'
  | 'info-confirm'
  | 'tax-type'
  | 'region'
  | 'data-init'
  | 'activation'

// ============== 首页类型 ==============

export interface QuickAction {
  icon: React.ReactNode
  label: string
  color: string
  tab: Tab
  sub?: SubTab
}

export interface KPICard {
  label: string
  value: string
  change: string
  bg: string
  textColor: string
  changeColor: string
}
