/**
 * 工资模块数据类型
 */

// 部门枚举
export type Department = '研发' | '产品' | '销售' | '运营' | '行政'

// 员工状态
export type EmployeeStatus = 'active' | 'inactive'

// 员工
export interface Employee {
  id: string
  name: string
  department: Department
  position: string         // 职位（选填）
  idCard: string           // 身份证号（脱敏存储：仅存后4位）
  baseSalary: number      // 基本工资
  socialInsuranceBase: number  // 社保基数
  socialInsurancePersonal: number  // 社保个人部分
  housingFundBase: number      // 公积金基数
  housingFundPersonal: number  // 公积金个人部分
  otherSubsidy: number        // 其他补贴
  status: EmployeeStatus
  bankCard?: string        // 银行卡号（选填）
  bankName?: string        // 开户行（选填）
  createdAt: string
}

// 调薪记录
export interface SalaryAdjustment {
  id: string
  employeeId: string
  oldSalary: number
  newSalary: number
  effectiveMonth: string  // 'YYYY-MM'
  createdAt: string
}

// 工资条
export interface SalarySlip {
  id: string
  employeeId: string
  month: string           // 'YYYY-MM'
  baseSalary: number
  bonus: number
  socialInsurance: number  // 社保个人部分
  housingFund: number      // 公积金个人部分
  tax: number              // 个税预扣
  netSalary: number        // 实发金额
  paidDate?: string        // 发薪日期
  voucherId?: string       // 凭证编号
  status: 'pending' | 'paid'
  createdAt: string
}

// 向导第1步：员工基本信息
export interface EmployeeDraft {
  name: string
  department: Department
  position: string
  idCard: string
}

// 向导第2步：员工工资标准
export interface SalaryDraft {
  baseSalary: string
  otherSubsidy: string
}
