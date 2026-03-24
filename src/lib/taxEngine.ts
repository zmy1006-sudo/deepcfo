/**
 * TaxEngine — 税务计算引擎（Mock实现）
 * 根据企业类型 + 地区 + 月度收入计算应纳税额
 */

// ============== 类型定义 ==============

export type TaxItemStatus = 'pending' | 'overdue' | 'filed' | 'paid'
export type TaxCategory = '增值税' | '企业所得税' | '个人所得税' | '附加税' | '残保金'

export interface TaxItem {
  name: string           // 税种名称
  type: TaxCategory      // 税种分类
  amount: number         // 应纳金额（元）
  dueDate: string        // 申报截止日（YYYY-MM-DD）
  status: TaxItemStatus
  quarter?: string       // 季度（如 "2026Q1"）
  rate?: string          // 税率说明
  remarks?: string[]     // 备注说明
}

export interface EnterpriseProfile {
  taxType: 'small' | 'general'   // 小规模/一般纳税人
  region: string                   // 注册地
  monthlyRevenue?: number         // 本月收入（Mock数据）
}

// ============== Mock企业数据（2026年3月）==============

// 假设 Mock 月度收入
const MOCK_MONTHLY_REVENUE = 280000   // 28万/月
const MOCK_QUARTER_REVENUE = 840000   // 28万 × 3 = 84万/季度
const MOCK_PROFIT = 84000             // 季度利润约10%

// ============== 工具函数 ==============

/**
 * 计算距离今天到截止日的天数
 * 返回负数表示已过期
 */
function daysUntil(dateStr: string): number {
  const today = new Date('2026-03-24')  // Mock当前日期
  const target = new Date(dateStr)
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

/**
 * 判断申报状态（Mock，基于日期）
 * 今天：2026-03-24
 * - 3月15日个税截止 → 已过期
 * - 3月31日季度税截止 → pending
 * - 6月30日残保金截止 → pending
 */
function calcStatus(dueDate: string): TaxItemStatus {
  const days = daysUntil(dueDate)
  if (days < 0) return 'overdue'
  return 'pending'
}

// ============== 核心计算函数 ==============

/**
 * calcTaxSummary — 根据企业画像计算应纳税额
 * @param enterprise 企业信息
 * @returns TaxItem[] 应申报税种列表
 */
export function calcTaxSummary(enterprise: EnterpriseProfile): TaxItem[] {
  const { taxType, monthlyRevenue = MOCK_MONTHLY_REVENUE } = enterprise
  const quarterRevenue = monthlyRevenue * 3

  // ---- 1. 增值税 ----
  let vatRate: number
  let vatRemarks: string[]

  if (taxType === 'small') {
    // 小规模纳税人：3%减按1%（2023年后优惠）
    vatRate = 0.01
    vatRemarks = ['小规模纳税人', '3%征收率减按1%', '无进项抵扣']
  } else {
    // 一般纳税人：Mock 假设适用6%税率（现代服务业）
    vatRate = 0.06
    vatRemarks = ['一般纳税人', '税率6%（现代服务业）', '可抵扣进项税']
  }

  // 增值税 = 销售额 / (1+税率) × 税率
  // 小规模按简易计税：销售额 × 1%
  const vatBase = taxType === 'small'
    ? quarterRevenue * vatRate          // 84万 × 1% = 8,400
    : (quarterRevenue / 1.06) * vatRate  // (84万/1.06) × 6% ≈ 47,547
  const vat = Math.round(vatBase)

  // ---- 2. 附加税 = 增值税 × 12% ----
  // （城建7% + 教育3% + 地方教育2%）
  const surTax = Math.round(vat * 0.12)

  // ---- 3. 企业所得税（季度预缴）----
  // 小微企业：利润总额×5%（应税所得额<100万减半）
  // 一般纳税人（非小微）：利润总额×25%
  let citRate = 0.05
  let citRemarks: string[]

  if (taxType === 'small') {
    // 小微企业，季度利润 < 100万，减半
    citRate = 0.05  // 实际 = 25% × 50% = 12.5%，但 Mock 为 5% 便于演示
    citRemarks = ['小微企业', '企业所得税5%', '季度预缴', '应税所得额<100万减半']
  } else {
    citRate = 0.25
    citRemarks = ['一般纳税人', '企业所得税25%', '季度预缴']
  }

  const cit = Math.round(MOCK_PROFIT * citRate)

  // ---- 4. 个人所得税（工资薪金，月度申报）----
  // Mock: 5人团队，月工资合计约85,000元
  const monthlyWageTotal = 85000
  // 个税速算（简化Mock）：约1,100元/月
  const personalIncomeTax = 1100
  const personalTaxRemarks = [
    '工资薪金所得',
    '7级超额累进税率（月度）',
    '专项附加扣除已录入',
  ]

  // ---- 5. 残疾人就业保障金（年度）----
  // 应税工资薪金 × 1.5%（未超比例则减半）
  const disabledFund = Math.round(monthlyWageTotal * 12 * 0.018)
  const disabledFundRemarks = [
    '年度申报',
    '职工人数<30人可减半',
    '截止6月30日',
  ]

  // ============== 组装 TaxItem 列表 ==============

  const items: TaxItem[] = [
    {
      name: '增值税及附加税费申报',
      type: '增值税',
      amount: vat + surTax,
      dueDate: '2026-03-31',
      status: calcStatus('2026-03-31'),
      quarter: '2026Q1',
      rate: taxType === 'small' ? '1%' : '6%',
      remarks: [
        ...vatRemarks,
        `附加税（城建7%+教育3%+地方2%）=${surTax.toLocaleString()}元`,
        `增值税=${vat.toLocaleString()}元 + 附加税=${surTax.toLocaleString()}元`,
      ],
    },
    {
      name: '企业所得税季度预缴',
      type: '企业所得税',
      amount: cit,
      dueDate: '2026-03-31',
      status: calcStatus('2026-03-31'),
      quarter: '2026Q1',
      rate: `${(citRate * 100).toFixed(0)}%`,
      remarks: [
        ...citRemarks,
        `利润总额=${MOCK_PROFIT.toLocaleString()}元`,
        `应纳税所得额=${MOCK_PROFIT.toLocaleString()}元（Mock）`,
      ],
    },
    {
      name: '个人所得税（工资薪金）',
      type: '个人所得税',
      amount: personalIncomeTax,
      dueDate: '2026-03-15',
      status: calcStatus('2026-03-15'),
      rate: '超额累进',
      remarks: personalTaxRemarks,
    },
    {
      name: '残疾人就业保障金',
      type: '残保金',
      amount: disabledFund,
      dueDate: '2026-06-30',
      status: calcStatus('2026-06-30'),
      rate: '1.8%（1.5%减半）',
      remarks: disabledFundRemarks,
    },
  ]

  return items
}

/**
 * 计算总应纳税额
 */
export function calcTotalTax(items: TaxItem[]): number {
  return items.reduce((sum, item) => sum + item.amount, 0)
}

/**
 * 获取最紧急的截止日期
 */
export function getNearestDue(items: TaxItem[]): { date: string; days: number } | null {
  const pending = items.filter(i => i.status === 'pending' || i.status === 'overdue')
  if (pending.length === 0) return null

  let nearest = pending[0]
  let nearestDays = daysUntil(nearest.dueDate)

  for (const item of pending) {
    const days = daysUntil(item.dueDate)
    if (days < nearestDays) {
      nearest = item
      nearestDays = days
    }
  }

  return { date: nearest.dueDate, days: nearestDays }
}

/**
 * 生成税务摘要文本（用于Chat回复）
 */
export function formatTaxSummaryForChat(items: TaxItem[]): string {
  const total = calcTotalTax(items)
  const nearest = getNearestDue(items)

  const vatItem = items.find(i => i.type === '增值税')
  const citItem = items.find(i => i.type === '企业所得税')
  const pITItem = items.find(i => i.type === '个人所得税')

  const vatAmount = vatItem ? vatItem.amount.toLocaleString() : '0'
  const citAmount = citItem ? citItem.amount.toLocaleString() : '0'
  const pITAmount = pITItem ? pITItem.amount.toLocaleString() : '0'

  const dueDateStr = nearest
    ? `${new Date(nearest.date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}`
    : '已全部申报'

  return [
    '📋 本期税务概览',
    '',
    `💰 应纳税总额：¥${total.toLocaleString()}`,
    `├── 增值税及附加：¥${vatAmount}`,
    `├── 企业所得税：¥${citAmount}${citItem?.quarter ? `（${citItem.quarter}预缴）` : ''}`,
    `├── 个人所得税：¥${pITAmount}`,
    `└── 截止日期：${dueDateStr}${nearest ? `（还剩${Math.abs(nearest.days)}天）` : ''}`,
  ].join('\n')
}
