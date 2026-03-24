/**
 * AI对话引擎（DeepCFO Sprint 1 Mock版）
 *
 * 架构说明（真实版Sprint 3接入DeepSeek API）：
 * 输入：用户口语
 * 输出：{ text, voucher?, voucherData?, confidence }
 *
 * Sprint 1使用规则匹配+关键词映射，验证核心交互流程
 */

export type Intent =
  | 'income'      // 收入记账
  | 'expense'     // 支出记账
  | 'salary'      // 工资相关
  | 'tax'         // 报税相关
  | 'query'       // 查询
  | 'confirm'     // 凭证确认
  | 'greeting'    // 问候闲聊
  | 'unknown'     // 无法识别

export interface VoucherData {
  title: string
  rows: Array<{ label: string; value: string; color?: string }>
}

export interface AIResponse {
  text: string
  intent: Intent
  confidence: number  // 0~1
  voucher?: boolean
  voucherData?: VoucherData
}

/** 收入记账关键词 */
const INCOME_KEYWORDS = ['收', '到账', '入账', '货款', '收入', '款到', '万', '设计费', '咨询费', '服务费']

/** 支出记账关键词 */
const EXPENSE_KEYWORDS = ['付', '支', '买', '花了', '付了', '货款', '采购', '办公费', '租金', '水电']

/** 工资关键词 */
const SALARY_KEYWORDS = ['工资', '发工资', '发薪', '月薪', '薪资', '奖金', '提成']

/** 报税关键词 */
const TAX_KEYWORDS = ['税', '申报', '报税', '缴税', '所得税', '增值税', '个税', '季度预缴']

/** 从文字中提取金额（元）*/
function extractMoney(text: string): number | null {
  const wanMatch = text.match(/([\d,，.]+)万/)
  if (wanMatch) return parseFloat(wanMatch[1].replace(/[,，]/g, '')) * 10000

  const yuanMatch = text.match(/([\d,，.]+)元/)
  if (yuanMatch) return parseFloat(yuanMatch[1].replace(/[,，]/g, ''))

  const numMatch = text.match(/([\d,，.]+)/)
  if (numMatch) return parseFloat(numMatch[1].replace(/[,，]/g, ''))

  return null
}

/** 提取对方名称（简化版）*/
function extractParty(text: string): string {
  const patterns = [
    /给(.+?公司)/,
    /(.+?公司)的/,
    /从(.+?)收/,
    /(.+?)欠/,
    /支付(.+?公司)/,
  ]
  for (const p of patterns) {
    const m = text.match(p)
    if (m) return m[1]
  }
  return '对方'
}

export function analyzeIntent(text: string): Intent {
  const t = text
  if (SALARY_KEYWORDS.some((k) => t.includes(k))) return 'salary'
  if (TAX_KEYWORDS.some((k) => t.includes(k))) return 'tax'
  if (INCOME_KEYWORDS.some((k) => t.includes(k))) return 'income'
  if (EXPENSE_KEYWORDS.some((k) => t.includes(k))) return 'expense'
  if (['确认', '同意', '好', '好的'].some((k) => t.includes(k))) return 'confirm'
  if (['你好', 'hi', 'hello', '在吗', '嗨', '早上好', '下午好'].some((k) => t.includes(k))) return 'greeting'
  return 'unknown'
}

/** 核心引擎：生成AI回复 */
export function generateResponse(
  userText: string,
  _context: {
    recentVouchers: Array<{ id: number; description: string; amount: number }>
  }
): AIResponse {
  const intent = analyzeIntent(userText)
  const amount = extractMoney(userText)
  const party = extractParty(userText)
  const fmtAmt = (n: number | null) =>
    n ? `¥${n.toLocaleString('zh-CN')}` : '¥???,???'

  switch (intent) {
    case 'income': {
      const amt = fmtAmt(amount)
      return {
        text: '好的，这笔收入已记录，正在生成凭证…',
        intent,
        confidence: amount !== null ? 0.95 : 0.7,
        voucher: true,
        voucherData: {
          title: '📝 记账凭证（待确认）',
          rows: [
            { label: '摘要', value: `收到${party}款项` },
            { label: '借方', value: `银行存款 ${amt}`, color: 'text-emerald-600' },
            { label: '贷方', value: `主营业务收入 ${amt}`, color: 'text-slate-700' },
          ],
        },
      }
    }

    case 'expense': {
      const amt = fmtAmt(amount)
      return {
        text: '好的，正在生成付款凭证…',
        intent,
        confidence: amount !== null ? 0.95 : 0.7,
        voucher: true,
        voucherData: {
          title: '📝 记账凭证（待确认）',
          rows: [
            { label: '摘要', value: `支付${party}款项` },
            { label: '借方', value: `管理费用-办公费 ${amt}`, color: 'text-red-500' },
            { label: '贷方', value: `银行存款 ${amt}`, color: 'text-emerald-600' },
          ],
        },
      }
    }

    case 'salary':
      return {
        text: '好的，正在计算本月工资单…请稍等，我可以帮你生成工资表并核算个税。请问本月有哪些员工需要发放工资？',
        intent,
        confidence: 0.92,
      }

    case 'tax':
      return {
        text: '企业所得税季度预缴截止 <strong>3月31日</strong>，还剩 <strong style="color:#DC2626">8天</strong>，应缴约 <strong style="color:#1B3F5C">¥8,420</strong>（小微企业5%优惠税率）。我可以帮你生成申报草稿，要现在生成吗？',
        intent,
        confidence: 0.88,
      }

    case 'greeting':
      return {
        text: '你好！我是 DeepCFO，你的AI财税助手。有什么需要帮忙的？可以直接告诉我收付款、工资或者税务相关的事情。',
        intent,
        confidence: 1.0,
      }

    case 'confirm':
      return {
        text: '✓ 已收到！请在<strong>3月31日</strong>前完成缴款。如有其他问题随时告诉我。',
        intent,
        confidence: 1.0,
      }

    default:
      return {
        text: '收到！我帮你记录。能把具体情况说得详细一些吗？比如金额、对方名称，这样我能更准确地生成凭证。',
        intent,
        confidence: 0.4,
      }
  }
}
