/**
 * 工资模块工具函数
 */
import type { Employee, SalarySlip } from './types'

const LS_EMPLOYEES = 'deepcfo_employees'
const LS_ADJUSTMENTS = 'deepcfo_salary_adjustments'
const LS_SLIPS = 'deepcfo_salary_slips'

// ---- 员工 CRUD ----

export function loadEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(LS_EMPLOYEES)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveEmployees(employees: Employee[]) {
  localStorage.setItem(LS_EMPLOYEES, JSON.stringify(employees))
}

// 脱敏存储：只保存身份证后4位
export function maskIdCard(idCard: string): string {
  if (idCard.length >= 4) return idCard.slice(-4)
  return idCard
}

export function maskedIdCard(idCard: string): string {
  if (idCard.length <= 4) return idCard
  return idCard.slice(0, 3) + '***********' + idCard.slice(-4)
}

// ---- 社保/公积金计算 ----

export function calcSocialInsurance(base: number): number {
  return Math.round(base * 0.08 * 100) / 100
}

export function calcHousingFund(base: number): number {
  return Math.round(base * 0.12 * 100) / 100
}

// 估算实发工资（简单个税估算）
export function calcNetSalary(base: number, otherSubsidy: number, social: number, housing: number): number {
  const gross = base + otherSubsidy
  // 三险一金合计
  const totalDeduct = social + housing
  // 应纳税所得额（简化估算，假设无其他专项扣除）
  const taxableIncome = gross - totalDeduct - 5000
  if (taxableIncome <= 0) return gross - totalDeduct
  // 简化累进税率（3%档）
  const tax = Math.max(0, taxableIncome * 0.03)
  return Math.round((gross - totalDeduct - tax) * 100) / 100
}

// ---- 调薪记录 ----

export function loadAdjustments() {
  try {
    const raw = localStorage.getItem(LS_ADJUSTMENTS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveAdjustments(list: unknown[]) {
  localStorage.setItem(LS_ADJUSTMENTS, JSON.stringify(list))
}

// ---- 工资条 ----

export function loadSlips(): SalarySlip[] {
  try {
    const raw = localStorage.getItem(LS_SLIPS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveSlips(slips: SalarySlip[]) {
  localStorage.setItem(LS_SLIPS, JSON.stringify(slips))
}

// 获取当前月份字符串
export function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// 获取月份显示文本
export function monthLabel(month: string): string {
  const [year, m] = month.split('-')
  return `${year}年${parseInt(m)}月`
}

// 格式化金额
export function fmtYuan(n: number): string {
  return n.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
}

// 生成ID
export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}

// 生成凭证编号
export function genVoucherNo(): string {
  const now = new Date()
  const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const slips = loadSlips()
  const count = slips.filter(s => s.voucherId?.startsWith(`GZ-${ym}`)).length + 1
  return `GZ-${ym}-${String(count).padStart(4, '0')}`
}
