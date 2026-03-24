/**
 * ChatPage — DeepCFO AI对话界面（Sprint 3 增强版）
 * 新增：税务意图识别 + 申报草稿弹窗 + 工资发放AI对话
 */
import { useState, useRef, useEffect, useCallback } from 'react'
import { Camera, Mic, Send, Check, Edit2, X, FileText } from 'lucide-react'
import { calcTaxSummary, calcTotalTax, getNearestDue, formatTaxSummaryForChat, type TaxItem } from '@/lib/taxEngine'
import { buildFinanceReportReply, MOCK_FINANCE_DATA } from '@/lib/financeReport'
import { useAppStore } from '@/store/useAppStore'

// ============== 员工/工资类型 ==============

export type EmployeeStatus = 'pending' | 'paid'

export interface Employee {
  id: string
  name: string
  idCard: string
  department: string
  position: string
  baseSalary: number
  socialInsurance: number
  housingFund: number
  tax: number
  status: EmployeeStatus
}

const EMPLOYEES: Employee[] = [
  { id: 'e1', name: '张三', idCard: '310***********1234', department: '产品部', position: '产品经理', baseSalary: 8500, socialInsurance: 680, housingFund: 425, tax: 295, status: 'paid' },
  { id: 'e2', name: '李四', idCard: '320***********5678', department: '研发部', position: '高级工程师', baseSalary: 9200, socialInsurance: 736, housingFund: 460, tax: 380, status: 'paid' },
  { id: 'e3', name: '王五', idCard: '330***********9012', department: '销售部', position: '销售主管', baseSalary: 7800, socialInsurance: 624, housingFund: 390, tax: 240, status: 'pending' },
  { id: 'e4', name: '赵六', idCard: '340***********3456', department: '运营部', position: '运营专员', baseSalary: 8500, socialInsurance: 680, housingFund: 425, tax: 295, status: 'pending' },
  { id: 'e5', name: '孙七', idCard: '350***********7890', department: '设计部', position: 'UI设计师', baseSalary: 8500, socialInsurance: 680, housingFund: 425, tax: 295, status: 'paid' },
]

function calcNetSalary(emp: Employee): number {
  return emp.baseSalary - emp.socialInsurance - emp.housingFund - emp.tax
}

// ============== 类型定义 ==============

interface VoucherRow {
  label: string
  value: string
  color?: string
}

interface VoucherData {
  title: string
  rows: VoucherRow[]
}

export interface ChatMsg {
  id: number
  role: 'ai' | 'user'
  text: string
  voucher?: boolean
  voucherData?: VoucherData
  taxDraft?: boolean
  taxItems?: TaxItem[]
  publicUse?: boolean
  salaryDraft?: boolean
  salaryEmp?: Employee
  salaryConfirmed?: boolean
  financeReport?: boolean  // Sprint 4: 财务报表消息
}

// ============== Mock企业信息 ==============

const MOCK_ENTERPRISE = { taxType: 'small' as const, region: '上海' }

// ============== 税务申报弹窗 ==============

function TaxDraftModal({ items, onConfirm, onClose }: {
  items: TaxItem[]
  onConfirm: () => void
  onClose: () => void
}) {
  const [submitted, setSubmitted] = useState(false)
  const total = calcTotalTax(items)

  const handleConfirm = () => {
    setSubmitted(true)
    setTimeout(() => {
      onConfirm()
      onClose()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

        {submitted ? (
          <div className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ background: '#ECFDF5' }}>
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="none" stroke="#10B981" strokeWidth="3" strokeDasharray="113" strokeDashoffset="0" style={{ animation: 'chatDrawCircle 0.6s ease forwards' }} />
                <path d="M12 20l6 6 10-12" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'chatDrawCheck 0.4s 0.5s ease forwards' }} />
              </svg>
            </div>
            <div className="text-base font-bold text-gray-800">税务申报提交成功！</div>
            <div className="text-sm text-gray-500 mt-1">各税种申报数据已提交，请及时缴款</div>
          </div>
        ) : (
          <>
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #4F7DF3 0%, #2563EB 100%)' }}>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm">📋</span>
                <span className="text-white font-bold text-sm">税务申报草稿</span>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                <X size={13} className="text-white" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
              <div className="rounded-xl p-4 text-center" style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' }}>
                <div className="text-xs text-amber-700 mb-1 font-medium">本期应纳税总额</div>
                <div className="text-2xl font-bold" style={{ color: '#10B981' }}>¥{total.toLocaleString()}</div>
              </div>

              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-semibold text-gray-800">{item.name}</div>
                        {item.quarter && <span className="text-xs text-gray-400">{item.quarter} · {item.rate}</span>}
                        {item.status === 'overdue' && (
                          <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">已过期</span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-gray-800">¥{item.amount.toLocaleString()}</div>
                    </div>
                    {item.remarks && (
                      <div className="mt-1 text-xs text-gray-400">{item.remarks.slice(0, 2).join(' · ')}</div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 rounded-xl px-3 py-2.5 border border-amber-200">
                <div className="text-xs text-amber-700 font-medium">
                  ⚠️ 数据为Mock演示，实际申报请以税务局系统为准
                </div>
              </div>
            </div>

            <div className="px-5 py-4 flex gap-3">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl text-sm font-semibold bg-gray-100 text-gray-500 active:scale-95 transition-transform">
                取消
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform shadow-md"
                style={{ background: 'linear-gradient(135deg, #10B981 0%, #4F7DF3 100%)' }}
              >
                ✓ 确认申报
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes chatDrawCircle { from { stroke-dashoffset: 113; } to { stroke-dashoffset: 0; } }
        @keyframes chatDrawCheck { from { stroke-dashoffset: 30; opacity: 0; } to { stroke-dashoffset: 0; opacity: 1; } }
      `}</style>
    </div>
  )
}

// ============== 税务草稿预览按钮（嵌入消息中）==============

function TaxDraftButton({ items, onConfirm }: {
  items: TaxItem[]
  onConfirm: () => void
}) {
  const total = calcTotalTax(items)
  const nearest = getNearestDue(items)
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="mt-3 w-full py-3 rounded-xl text-sm font-semibold text-white active:scale-95 transition-transform flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #C9963A 0%, #1B3F5C 100%)', boxShadow: '0 2px 8px rgba(201,150,58,0.3)' }}
      >
        <FileText size={14} />
        查看申报草稿（¥{total.toLocaleString()})
        {nearest && <span className="text-xs opacity-75 ml-1">截止{nearest.days}天后</span>}
      </button>
      {showModal && (
        <TaxDraftModal
          items={items}
          onConfirm={onConfirm}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

// ============== 凭证卡片组件 ==============

function VoucherCard({ data, confirmed, voucherNo, onConfirm, onEdit }: {
  data: VoucherData
  confirmed: boolean
  voucherNo?: string
  onConfirm: () => void
  onEdit: () => void
}) {
  if (confirmed) {
    return (
      <div className="mt-2 bg-emerald-50 rounded-xl p-3 border border-emerald-200">
        <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
          <Check size={13} />
          <span>已入账{voucherNo ? ` · 凭证号 ${voucherNo}` : ''}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-2 bg-gray-50 rounded-xl p-3 border border-gray-200">
      <div className="text-xs font-bold text-slate-700 mb-2">{data.title}</div>
      {data.rows.map((row, i) => (
        <div key={i} className={`flex justify-between py-1.5 text-sm ${i < data.rows.length - 1 ? 'border-b border-gray-200' : ''}`}>
          <span className="text-gray-500">{row.label}</span>
          <span className={`font-semibold ${row.color || 'text-gray-800'}`}>{row.value}</span>
        </div>
      ))}
      <div className="flex gap-2 mt-3">
        <button onClick={onConfirm} className="flex-1 py-2 rounded-xl text-sm font-semibold text-white bg-slate-800 active:scale-95 transition-all">
          ✓ 确认提交
        </button>
        <button onClick={onEdit} className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-200 text-gray-500 flex items-center gap-1 active:scale-95 transition-all">
          <Edit2 size={12} /> 修改
        </button>
      </div>
    </div>
  )
}

// ============== 税务摘要卡片（嵌入AI消息中）==============

function TaxSummaryCard({ items }: { items: TaxItem[] }) {
  const total = calcTotalTax(items)
  const nearest = getNearestDue(items)

  return (
    <div className="mt-2 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className="text-xs font-bold text-gray-500 mb-3 flex items-center gap-1">
        <span>📋</span> 本期税务概览
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'overdue' ? 'bg-red-500' : item.status === 'filed' ? 'bg-emerald-500' : 'bg-gray-300'}`} />
              <span className="text-xs text-gray-600">{item.name}</span>
            </div>
            <span className="text-xs font-semibold text-gray-800">¥{item.amount.toLocaleString()}</span>
          </div>
        ))}
        <div className="border-t border-gray-200 pt-2 flex justify-between">
          <span className="text-xs font-bold text-gray-700">合计</span>
          <span className="text-xs font-bold" style={{ color: '#10B981' }}>¥{total.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}


// ============== 工资发放确认卡片 ==============

function SalaryDraftCard({ emp, onConfirm }: { emp: Employee; onConfirm: () => void }) {
  const net = calcNetSalary(emp)
  const [showDetail, setShowDetail] = useState(false)

  return (
    <div className="mt-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* 头部 */}
      <div className="px-4 py-3" style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' }}>
        <div className="text-sm font-bold" style={{ color: '#92400E' }}>💰 工资发放确认</div>
        <div className="text-xs text-amber-700 mt-0.5">{emp.name} · {emp.department} · {emp.position}</div>
      </div>
      {/* 明细 */}
      <div className="px-4 py-3 space-y-1.5">
        {[
          { label: '基本工资', value: `¥${emp.baseSalary.toLocaleString()}`, color: 'text-gray-800' },
          { label: '社保个人', value: `-¥${emp.socialInsurance}`, color: 'text-red-400' },
          { label: '公积金', value: `-¥${emp.housingFund}`, color: 'text-red-400' },
          { label: '个税预扣', value: `-¥${emp.tax}`, color: 'text-red-400' },
        ].map((r, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-gray-500">{r.label}</span>
            <span className={`font-medium ${r.color}`}>{r.value}</span>
          </div>
        ))}
        <div className="border-t border-gray-200 pt-1.5 mt-1.5 flex justify-between">
          <span className="text-xs font-bold text-gray-700">实发金额</span>
          <span className="text-sm font-bold" style={{ color: '#10B981' }}>¥{net.toLocaleString()}</span>
        </div>
        <div className="text-[10px] text-gray-400 text-center">次月1日前到账</div>
      </div>
      {/* 操作 */}
      <div className="px-4 pb-3 flex gap-2">
        <button
          onClick={() => setShowDetail(!showDetail)}
          className="flex-1 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-500 active:scale-95 transition-transform"
        >
          📋 查看工资条
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-2 rounded-xl text-xs font-semibold text-white active:scale-95 transition-transform shadow-sm"
          style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
        >
          ✓ 确认发放
        </button>
      </div>
      {showDetail && (
        <div className="px-4 pb-3">
          <div className="bg-gray-50 rounded-xl p-3 text-[10px] text-gray-500 space-y-1">
            <div>身份证：{emp.idCard}</div>
            <div>社保个人缴费率：8% · 公积金缴存率：5%</div>
            <div>代扣代缴个人所得税 ¥{emp.tax}，已计入税务申报</div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============== AI引擎 ==============

function extractMoney(text: string): string {
  const wan = text.match(/([\d,，.]+)万/)
  if (wan) return `¥${parseFloat(wan[1].replace(/[,，]/g, '')).toLocaleString()}`
  const yuan = text.match(/([\d,，.]+)[元块]/)
  if (yuan) return `¥${parseFloat(yuan[1].replace(/[,，]/g, '')).toLocaleString()}`
  return '¥?,???,???'
}

function extractParty(text: string): string {
  const m = text.match(/给(.+?公司)/) || text.match(/(.+?公司)的/) || text.match(/从(.+?)收/)
  return m ? m[1] : '对方'
}

// 税务意图关键词
const TAX_KEYWORDS = [
  '要交多少税', '这个月税', '本期税款', '本期应交',
  'q1所得税', '企业所得税', '增值税',
  '怎么申报', '帮我报税', '生成申报草稿', '申报草稿',
  '个税', '个人所得税', '报税', '交税',
  '残保金', '残疾人', '附加税',
]

function isTaxIntent(text: string): boolean {
  const lower = text.toLowerCase()
  return TAX_KEYWORDS.some(kw => lower.includes(kw))
}

// 工资意图关键词
const SALARY_KEYWORDS = [
  '发工资', '工资条', '生成工资条', '本月工资',
  '的工资', '工资多少', '工资多少', '帮', '发',
  '工资发放', '发薪', '薪资',
]

function isSalaryIntent(text: string): boolean {
  return SALARY_KEYWORDS.some(kw => text.includes(kw))
}

// 财务报表意图关键词（Sprint 4）
const FINANCE_REPORT_KEYWORDS = [
  '财务报表', '利润表', '资产负债表', '现金流量表',
  '净利润', '毛利润', '赚了多少钱', '赚了多少',
  '收入多少', '成本多少', '利润率',
  '现金流', '资金情况', '还有多少钱',
  '本月财务', '本月报表', '财务概览', '财务状况',
]

function isFinanceReportIntent(text: string): boolean {
  const lower = text.toLowerCase()
  return FINANCE_REPORT_KEYWORDS.some(kw => lower.includes(kw))
}

function findEmployee(text: string): Employee | null {
  const name = EMPLOYEES.find(e => text.includes(e.name))
  return name || null
}

function buildAIReply(userText: string): ChatMsg {
  const t = userText
  const amt = extractMoney(t)
  const party = extractParty(t)

  // === 财务报表意图（Sprint 4）===
  if (isFinanceReportIntent(t)) {
    const d = MOCK_FINANCE_DATA.incomeStatement
    return {
      id: 0, role: 'ai',
      text: buildFinanceReportReply(),
      financeReport: true,
    }
  }

  // === 税务意图 ===
  if (isTaxIntent(t)) {
    const taxItems = calcTaxSummary(MOCK_ENTERPRISE)
    const total = calcTotalTax(taxItems)
    const nearest = getNearestDue(taxItems)

    const dueDateStr = nearest
      ? new Date(nearest.date).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
      : '已全部申报'

    return {
      id: 0, role: 'ai',
      text: formatTaxSummaryForChat(taxItems),
      taxDraft: true,
      taxItems,
    }
  }

  // === 工资意图 ===
  if (isSalaryIntent(t)) {
    const emp = findEmployee(t)
    if (emp) {
      const net = calcNetSalary(emp)
      if (emp.status === 'paid') {
        return {
          id: 0, role: 'ai',
          text: `✅ ${emp.name}（${emp.department}）本月工资已于 ${new Date().toLocaleDateString('zh-CN', { month: 'long' })} 发放，实发 ¥${net.toLocaleString()}。如需调整，请告诉我。`,
        }
      }
      return {
        id: 0, role: 'ai',
        text: `💰 工资发放确认\n\n员工：${emp.name}（${emp.department}）\n基本工资：¥${emp.baseSalary.toLocaleString()}\n社保个人：¥${emp.socialInsurance}\n公积金：¥${emp.housingFund}\n个税预扣：¥${emp.tax}\n─────────────────────────────────\n实发金额：¥${net.toLocaleString()}\n（次月1日前到账）`,
        salaryDraft: true,
        salaryEmp: emp,
      }
    }
    const pendingEmps = EMPLOYEES.filter(e => e.status === 'pending')
    if (pendingEmps.length > 0) {
      const total = pendingEmps.reduce((s, e) => s + calcNetSalary(e), 0)
      const list = pendingEmps.map(e => `• ${e.name}（${e.department}）：¥${calcNetSalary(e).toLocaleString()}`).join('\n')
      return {
        id: 0, role: 'ai',
        text: `📋 本月待发工资（${pendingEmps.length}人）\n\n${list}\n─────────────────────────────────\n合计实发：¥${total.toLocaleString()}\n\n请问要给哪位员工发放？或者直接说"帮所有人发工资"？`,
      }
    }
    return {
      id: 0, role: 'ai',
      text: '本月所有员工工资均已发放完毕 ✓ 如需查看历史工资单，请告诉我。'
    }
  }

  // === 收款意图 ===
  if (t.includes('收') || t.includes('到账') || t.includes('万') || t.includes('收入')) {
    return {
      id: 0, role: 'ai', text: '好的，这笔收入已记录，正在生成凭证…',
      voucher: true,
      voucherData: {
        title: '📝 记账凭证（待确认）',
        rows: [
          { label: '摘要', value: `收到${party}款项` },
          { label: '借方', value: `${amt}`, color: 'text-emerald-600' },
          { label: '贷方', value: `主营业务收入`, color: 'text-slate-700' },
        ],
      },
    }
  }

  // === 付款意图 ===
  if (t.includes('付') || t.includes('花了') || t.includes('买') || t.includes('支')) {
    return {
      id: 0, role: 'ai', text: '好的，正在生成付款凭证…',
      voucher: true,
      voucherData: {
        title: '📝 记账凭证（待确认）',
        rows: [
          { label: '摘要', value: `支付${party}款项` },
          { label: '借方', value: `管理费用 ${amt}`, color: 'text-red-500' },
          { label: '贷方', value: `银行存款 ${amt}`, color: 'text-emerald-600' },
        ],
      },
    }
  }

  // === 默认回复 ===
  return {
    id: 0, role: 'ai',
    text: '收到！我帮你记录。能把具体情况说得详细一些吗？比如金额、对方名称，这样我能更准确地生成凭证。'
  }
}

// ============== 初始消息 ==============

const today = new Date()
const DATE_STR = today.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })

const INITIAL_MSGS: ChatMsg[] = [
  { id: 1, role: 'ai', text: `${DATE_STR}，有几件事提醒你：` },
  {
    id: 2, role: 'ai',
    text: '企业所得税季度预缴截止 <strong style="color:#DC2626">3月31日</strong>，还剩 <strong style="color:#DC2626">8天</strong>，应缴约 <strong style="color:#1B3F5C">¥8,420</strong>（小微企业5%优惠税率）。'
  },
  { id: 3, role: 'user', text: '收了王总公司设计费3万' },
  {
    id: 4, role: 'ai', text: '好的，这笔收入已记录，正在生成凭证…',
    voucher: true,
    voucherData: {
      title: '📝 记账凭证（待确认）',
      rows: [
        { label: '摘要', value: '收到王总公司设计费收入' },
        { label: '借方', value: '银行存款 ¥30,000', color: 'text-emerald-600' },
        { label: '贷方', value: '主营业务收入 ¥30,000', color: 'text-slate-700' },
      ],
    }
  },
  { id: 5, role: 'user', text: '付了京东货款2680元' },
  {
    id: 6, role: 'ai', text: '好的，正在生成付款凭证…',
    voucher: true,
    voucherData: {
      title: '📝 记账凭证（待确认）',
      rows: [
        { label: '摘要', value: '支付京东电商货款' },
        { label: '借方', value: '管理费用-办公费 ¥2,680', color: 'text-red-500' },
        { label: '贷方', value: '银行存款 ¥2,680', color: 'text-emerald-600' },
      ],
    }
  },
  { id: 7, role: 'user', text: '这个月要交多少税？' },
  {
    id: 8, role: 'ai',
    text: formatTaxSummaryForChat(calcTaxSummary(MOCK_ENTERPRISE)),
    taxDraft: true,
    taxItems: calcTaxSummary(MOCK_ENTERPRISE),
  },
]

// ============== 主组件 ==============

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMsg[]>(INITIAL_MSGS)
  const [input, setInput] = useState('')
  const [confirmed, setConfirmed] = useState<Set<number>>(new Set())
  const [salaryConfirmed, setSalaryConfirmed] = useState<Set<number>>(new Set())
  const [voucherNos] = useState<Record<number, string>>({})
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  // taxConfirmCallback — 申报成功后切换到税务页面刷新进度
  const { setTab } = useAppStore()

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, confirmed])

  const makeVoucherNo = (id: number) => {
    const now = new Date()
    const ym = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
    return `${ym}-记-${String(id).padStart(4, '0')}`
  }

  const handleSend = () => {
    const text = input.trim()
    if (!text) return

    const userMsg: ChatMsg = { id: Date.now(), role: 'user', text }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    setTimeout(() => {
      const reply = buildAIReply(text)
      reply.id = Date.now() + 1
      setMessages(prev => [...prev, reply])
    }, 1200)
  }

  const handleConfirm = (msgId: number) => {
    const no = makeVoucherNo(msgId)
    setConfirmed(prev => new Set([...prev, msgId]))
    ;(voucherNos as any)[msgId] = no

    setTimeout(() => {
      const reply: ChatMsg = {
        id: Date.now() + 2, role: 'ai',
        text: `✓ 已收到！凭证编号 <strong>${no}</strong> 已入账，请记得在<strong>3月31日</strong>前完成最终缴款。`
      }
      setMessages(prev => [...prev, reply])
    }, 600)
  }

  const handleTaxConfirm = useCallback(() => {
    // 申报成功后自动跳转到报税页面
    setTimeout(() => setTab('tax'), 500)
  }, [setTab])

  const handleSalaryConfirm = useCallback((msgId: number, emp: Employee) => {
    setSalaryConfirmed(prev => new Set([...prev, msgId]))
    const net = calcNetSalary(emp)
    const voucherNo = makeVoucherNo(msgId)
    setTimeout(() => {
      const reply: ChatMsg = {
        id: Date.now() + 3, role: 'ai',
        text: `✅ ${emp.name} 工资 ¥${net.toLocaleString()} 已确认发放！\n\n已自动生成记账凭证：\n借：应付职工薪酬 ¥${net.toLocaleString()}\n贷：银行存款 ¥${net.toLocaleString()}\n凭证号：${voucherNo}`,
      }
      setMessages(prev => [...prev, reply])
    }, 800)
  }, [])

  const handleEdit = (msgId: number) => {
    const msg = messages.find(m => m.id === msgId)
    if (!msg?.voucherData) return
    setEditText(msg.voucherData.rows[0]?.value || '')
    setEditingId(msgId)
  }

  const handleSaveEdit = () => {
    if (!editingId) return
    setMessages(prev => prev.map(m => {
      if (m.id !== editingId || !m.voucherData) return m
      return {
        ...m,
        voucherData: {
          ...m.voucherData,
          rows: [{ label: '摘要', value: editText }, ...m.voucherData.rows.slice(1)]
        }
      }
    }))
    setEditingId(null)
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: '#F8FAFC' }}>
      {/* 标题栏 */}
      <div className="px-4 pt-12 pb-4 flex items-center gap-3 shadow-md" style={{ background: 'linear-gradient(135deg, #4F7DF3 0%, #2563EB 100%)' }}>
        <div className="w-9 h-9 bg-amber-500/20 rounded-xl flex items-center justify-center">
          <span className="text-amber-400 text-sm font-bold">CF</span>
        </div>
        <div>
          <div className="text-white font-bold text-base leading-tight">DeepCFO 智能助手</div>
          <div className="text-white/50 text-xs">财税助手 · 在线</div>
        </div>
        <span className="ml-auto text-xs px-2.5 py-0.5 rounded-full font-medium" style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B' }}>AI</span>
      </div>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map(msg => {
          const isConfirmed = confirmed.has(msg.id)
          const voucherNo = (voucherNos as any)[msg.id]

          if (msg.role === 'ai') {
            return (
              <div key={msg.id} className="flex gap-2.5">
                <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-400 text-[10px] font-bold">CF</span>
                </div>
                <div className="flex-1 min-w-0">
                  {/* 税务草稿卡片 */}
                  {msg.taxDraft && msg.taxItems && (
                    <TaxSummaryCard items={msg.taxItems} />
                  )}
                  <div
                    className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-800 leading-relaxed shadow-sm border border-gray-100"
                    dangerouslySetInnerHTML={{ __html: msg.text }}
                    style={{ whiteSpace: 'pre-line' }}
                  />
                  {msg.taxDraft && msg.taxItems && (
                    <TaxDraftButton items={msg.taxItems} onConfirm={handleTaxConfirm} />
                  )}
                  {/* 财务报表快捷按钮（Sprint 4） */}
                  {msg.financeReport && (
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => setTab('finance')}
                        className="flex-1 py-2 rounded-xl text-xs font-semibold text-white active:scale-95 transition-transform flex items-center justify-center gap-1"
                        style={{ background: '#4F7DF3' }}
                      >
                        📊 查看完整利润表
                      </button>
                    </div>
                  )}
                  {msg.salaryDraft && msg.salaryEmp && !salaryConfirmed.has(msg.id) && (
                    <SalaryDraftCard
                      emp={msg.salaryEmp}
                      onConfirm={() => handleSalaryConfirm(msg.id, msg.salaryEmp!)}
                    />
                  )}
                  {msg.salaryDraft && salaryConfirmed.has(msg.id) && (
                    <div className="mt-2 bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                      <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
                        <Check size={13} />
                        <span>工资已发放确认 · 已生成记账凭证</span>
                      </div>
                    </div>
                  )}
                  {msg.voucher && msg.voucherData && (
                    <VoucherCard
                      data={msg.voucherData}
                      confirmed={isConfirmed}
                      voucherNo={voucherNo}
                      onConfirm={() => handleConfirm(msg.id)}
                      onEdit={() => handleEdit(msg.id)}
                    />
                  )}
                </div>
              </div>
            )
          }

          return (
            <div key={msg.id} className="flex gap-2.5 justify-end">
              <div className="bg-gradient-to-br from-slate-800 to-slate-700 text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed max-w-[75%] shadow-md">
                {msg.text}
              </div>
              <div className="w-7 h-7 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-amber-400 text-[10px] font-bold">我</span>
              </div>
            </div>
          )
        })}
        <div ref={chatEndRef} />
      </div>

      {/* 输入栏 */}
      <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-2 items-end shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
        <button className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 active:scale-90 transition-transform flex-shrink-0">
          <Camera size={18} />
        </button>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="说句话，我帮你记账…"
          rows={1}
          className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-slate-700/20 transition-all placeholder-gray-400"
        />
        <button className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 flex-shrink-0 active:scale-90 transition-transform">
          <Mic size={18} />
        </button>
        <button
          onClick={handleSend}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 active:scale-90 transition-transform shadow-md"
          style={{ background: '#4F7DF3' }}
        >
          <Send size={16} />
        </button>
      </div>

      {/* 修改摘要弹窗 */}
      {editingId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-end z-50" onClick={() => setEditingId(null)}>
          <div className="w-full bg-white rounded-t-3xl p-5 pb-8" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-gray-800">修改摘要</span>
              <button onClick={() => setEditingId(null)} className="text-gray-400 text-sm">取消</button>
            </div>
            <textarea
              value={editText}
              onChange={e => setEditText(e.target.value)}
              className="w-full bg-gray-100 rounded-xl px-4 py-3 text-sm resize-none outline-none focus:ring-2 focus:ring-slate-700/20"
              rows={3}
              autoFocus
            />
            <div className="flex gap-3 mt-3">
              <button onClick={() => setEditingId(null)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-500 font-semibold text-sm">取消</button>
              <button onClick={handleSaveEdit} className="flex-1 py-3 rounded-xl text-white font-semibold text-sm" style={{ background: '#4F7DF3' }}>
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
