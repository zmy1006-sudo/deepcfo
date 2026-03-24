/**
 * 财务报表计算引擎 — Sprint 4
 * 三张核心报表的计算函数，输入为账务数据（Mock），输出为报表行项目
 */

// ============== 报表接口 ==============

export interface IncomeStatement {
  /** 利润表 */
  revenue: number          // 营业收入
  costOfSales: number      // 营业成本
  grossProfit: number      // 毛利
  sellingExpense: number    // 销售费用
  adminExpense: number      // 管理费用
  operatingProfit: number  // 营业利润
  profitBeforeTax: number   // 利润总额
  netProfit: number        // 净利润
  qoqChange?: number        // 环比变化（%）
  yoyChange?: number        // 同比变化（%）
}

export interface BalanceSheet {
  /** 资产负债表 */
  totalAssets: number           // 资产总计
  currentAssets: number         // 流动资产
  nonCurrentAssets: number      // 非流动资产
  totalLiabilities: number     // 负债合计
  currentLiabilities: number   // 流动负债
  nonCurrentLiabilities: number // 非流动负债
  totalEquity: number          // 所有者权益
  debtRatio: number            // 资产负债率（%）
}

export interface CashFlow {
  /** 现金流量表 */
  operatingCashFlow: number    // 经营活动现金净流量
  investingCashFlow: number    // 投资活动现金净流量
  financingCashFlow: number   // 筹资活动现金净流量
  netCashFlow: number         // 现金净增加额
  endingCash: number          // 期末现金
}

// ============== Mock 账务数据 ==============

export const MOCK_FINANCE_DATA = {
  /** 2026年3月利润表 */
  incomeStatement: {
    revenue: 127400,
    costOfSales: 83200,
    grossProfit: 44200,
    sellingExpense: 8200,
    adminExpense: 12000,
    operatingProfit: 38600,
    profitBeforeTax: 35200,
    netProfit: 35200,
    qoqChange: 12.1,    // 环比上月净利润 +12.1%
    yoyChange: 35.0,    // 同比去年净利润 +35.0%
  } as IncomeStatement,

  /** 2026年3月资产负债表 */
  balanceSheet: {
    totalAssets: 500000,
    currentAssets: 185000,
    nonCurrentAssets: 315000,
    totalLiabilities: 180000,
    currentLiabilities: 95000,
    nonCurrentLiabilities: 85000,
    totalEquity: 320000,
    debtRatio: 36.0,
  } as BalanceSheet,

  /** 2026年3月现金流量表 */
  cashFlow: {
    operatingCashFlow: 38500,
    investingCashFlow: -12000,
    financingCashFlow: 5000,
    netCashFlow: 31500,
    endingCash: 186500,
  } as CashFlow,

  /** 月度趋势（环比/同比） */
  trends: {
    revenueQoq: 8.3,     // 收入环比 +8.3%
    revenueYoy: 28.0,    // 收入同比 +28%
    costQoq: 5.1,         // 成本环比 +5.1%
    profitMargin: 27.6,   // 净利润率 27.6%
  },
}

// ============== 计算工具函数 ==============

/** 格式化金额为 ¥xxx,xxx */
export function formatMoney(amount: number): string {
  return `¥${amount.toLocaleString('zh-CN')}`
}

/** 格式化百分比 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

/** 计算毛利率 */
export function calcGrossMargin(revenue: number, cost: number): number {
  if (revenue === 0) return 0
  return ((revenue - cost) / revenue) * 100
}

/** 计算净利润率 */
export function calcNetMargin(revenue: number, netProfit: number): number {
  if (revenue === 0) return 0
  return (netProfit / revenue) * 100
}

// ============== 报表行项目类型 ==============

export interface ReportRow {
  label: string
  value: string
  change?: string    // 变化率，如 "+8.3%" 或 "-3.2%"
  highlight?: boolean // 是否高亮（净利润等关键行）
  positive?: boolean  // 变化正向（绿色）还是负向（红色）
  isSection?: boolean // 是否为分隔线后新段落
}

/** 利润表明细行 */
export function getIncomeStatementRows(): ReportRow[] {
  const d = MOCK_FINANCE_DATA.incomeStatement
  const t = MOCK_FINANCE_DATA.trends
  const grossMargin = calcGrossMargin(d.revenue, d.costOfSales)
  const netMargin = calcNetMargin(d.revenue, d.netProfit)

  return [
    { label: '营业收入', value: formatMoney(d.revenue), change: `+${t.revenueQoq}%`, positive: true },
    { label: '营业成本', value: formatMoney(d.costOfSales), change: `+${t.costQoq}%`, positive: true },
    { label: '──────', value: '──────', isSection: true },
    { label: '毛利', value: formatMoney(d.grossProfit), change: `+${((d.grossProfit / (d.revenue - (d.revenue / (1 + t.revenueQoq / 100))) - 1) * 100).toFixed(1)}%`, positive: true },
    { label: '毛利率', value: formatPercent(grossMargin) },
    { label: '──────', value: '──────', isSection: true },
    { label: '销售费用', value: formatMoney(d.sellingExpense) },
    { label: '管理费用', value: formatMoney(d.adminExpense) },
    { label: '──────', value: '──────', isSection: true },
    { label: '营业利润', value: formatMoney(d.operatingProfit), highlight: false },
    { label: '──────', value: '──────', isSection: true },
    { label: '利润总额', value: formatMoney(d.profitBeforeTax) },
    { label: '──────', value: '──────', isSection: true },
    { label: '净利润', value: formatMoney(d.netProfit), change: `+${d.qoqChange}%`, highlight: true, positive: true },
    { label: '净利润率', value: formatPercent(netMargin) },
  ]
}

/** 资产负债表明细行 */
export function getBalanceSheetRows(): ReportRow[] {
  const b = MOCK_FINANCE_DATA.balanceSheet

  return [
    { label: '────── 资产', value: '──────', isSection: true },
    { label: '流动资产', value: formatMoney(b.currentAssets) },
    { label: '非流动资产', value: formatMoney(b.nonCurrentAssets) },
    { label: '资产总计', value: formatMoney(b.totalAssets), highlight: true },
    { label: '────── 负债', value: '──────', isSection: true },
    { label: '流动负债', value: formatMoney(b.currentLiabilities) },
    { label: '非流动负债', value: formatMoney(b.nonCurrentLiabilities) },
    { label: '负债合计', value: formatMoney(b.totalLiabilities) },
    { label: '────── 所有者权益', value: '──────', isSection: true },
    { label: '所有者权益', value: formatMoney(b.totalEquity) },
    { label: '────── 财务比率', value: '──────', isSection: true },
    { label: '资产负债率', value: formatPercent(b.debtRatio), highlight: true },
  ]
}

/** 现金流量表明细行 */
export function getCashFlowRows(): ReportRow[] {
  const c = MOCK_FINANCE_DATA.cashFlow

  return [
    { label: '────── 三大流向', value: '──────', isSection: true },
    { label: '经营活动现金净流量', value: formatMoney(c.operatingCashFlow), highlight: true, positive: c.operatingCashFlow > 0 },
    { label: '投资活动现金净流量', value: formatMoney(c.investingCashFlow), positive: c.investingCashFlow > 0 },
    { label: '筹资活动现金净流量', value: formatMoney(c.financingCashFlow), positive: c.financingCashFlow > 0 },
    { label: '──────', value: '──────', isSection: true },
    { label: '现金净增加额', value: formatMoney(c.netCashFlow), change: '净流入', positive: c.netCashFlow > 0 },
    { label: '期末现金余额', value: formatMoney(c.endingCash), highlight: true },
  ]
}

// ============== AI 财务解读 ==============

export const AI_FINANCE_INSIGHT = `本月净利润3.52万，环比增长12.1%，表现良好。
毛利率34.7%，在行业中处于中上水平。
建议关注销售费用占比，控制在8%以内可进一步提升利润空间。`

export function buildFinanceReportReply(): string {
  const d = MOCK_FINANCE_DATA.incomeStatement
  const t = MOCK_FINANCE_DATA.trends
  const grossMargin = calcGrossMargin(d.revenue, d.costOfSales)
  const netMargin = calcNetMargin(d.revenue, d.netProfit)

  return `📊 2026年3月财务概览

营业收入  ¥${d.revenue.toLocaleString()}  ↑${t.revenueQoq}%
营业成本  ¥${d.costOfSales.toLocaleString()}   ↑${t.costQoq}%
━━━━━━━━━━━━━━━━━━━━
毛利      ¥${d.grossProfit.toLocaleString()}   ↑14.2%
净利润    ¥${d.netProfit.toLocaleString()}   ↑${d.qoqChange}%
净利润率  ${netMargin.toFixed(1)}%

💡 DeepCFO 分析：
净利润环比增长${d.qoqChange}%，表现良好。
毛利率${grossMargin.toFixed(1)}%，在行业中处于中上水平。
建议关注销售费用占比，控制在8%以内可进一步提升利润空间。`
}
