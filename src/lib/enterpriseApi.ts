/**
 * enterpriseApi.ts — 企业信息查询API（企查查/天眼查接口）
 * MVP阶段使用mock数据，结构对标真实API返回格式
 * @author 一休 @2026-03-24
 */

/**
 * 企业信息类型
 */
export interface EnterpriseInfo {
  creditCode: string
  name: string
  legalPerson: string
  registeredCapital: string
  establishDate: string
  address: string
  businessScope: string
  taxType: 'small' | 'general' | null
}

/**
 * 企业信息查询（企查查/天眼查接口）
 * @param code 统一社会信用代码（18位）
 * @returns EnterpriseInfo 企业基本信息
 */
export async function queryEnterpriseByCreditCode(code: string): Promise<EnterpriseInfo> {
  // 模拟1秒延迟
  await new Promise<void>((resolve) => setTimeout(resolve, 1000))

  // Mock数据（真实接入时替换此函数）
  return {
    creditCode: code,
    name: '北京深度财税科技有限公司',
    legalPerson: '张三',
    registeredCapital: '100万元人民币',
    establishDate: '2023-05-15',
    address: '北京市海淀区中关村大街1号',
    businessScope: '技术开发、技术咨询、软件开发、企业管理咨询',
    taxType: null,
  }
}
