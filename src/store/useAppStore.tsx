/**
 * DeepCFO 全局状态管理（React Context）
 * @description 用 React Context + useReducer 替代 Zustand，零新增依赖
 * @see HE实践：状态结构必须清晰可预测，代理能建模
 */
import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { Tab, SubTab, Message, EnterpriseInfo, OnboardingStep } from '@/types'

// ============== Voucher类型 ==============

export type VoucherStatus = 'draft' | 'pending' | 'recorded' | 'reported'

export interface VoucherEntry {
  account: string
  dc: 'D' | 'C'
  amount: number
}

export interface Voucher {
  id: string
  voucherNo: string  // YYYYMM-类型-流水号，如 202603-记-0001
  date: string
  description: string
  entries: VoucherEntry[]
  status: VoucherStatus
  createdAt: string
  recordedAt?: string
  msgId?: number  // 关联的消息ID
}

export interface VoucherDraft {
  msgId: number
  description: string
  entries: VoucherEntry[]
}

// ============== 初始模拟数据 ==============

const today = new Date()

const initMsgs: Message[] = [
  { id: 1, role: 'ai', text: `${today.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}，有几件事提醒你：` },
  { id: 2, role: 'ai', text: '企业所得税季度预缴截止 <strong>3月31日</strong>，还剩 <strong style="color:#DC2626">8天</strong>，应缴约 <strong style="color:#1B3F5C">¥8,420</strong>（小微企业5%优惠税率）。' },
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
    },
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
    },
  },
  {
    id: 7, role: 'ai', text: '检测到一笔 <strong>需要确认的交易</strong> 🔍',
    publicUse: true,
    publicOptions: [
      { icon: '💸', label: '私人还款', sub: '我私人账户还给公司' },
      { icon: '💰', label: '视同分红', sub: '自动代扣20%个税 · 约 ¥2,560' },
      { icon: '🏢', label: '补充说明用途', sub: '告诉我是公司业务支出' },
    ],
  },
]

// ============== State & Action ==============

interface AppState {
  tab: Tab
  subPage: string | null
  subTab: SubTab
  messages: Message[]
  confirmed: number[]
  showVoice: boolean
  voiceIdx: number
  // 企业注册状态
  enterprise: EnterpriseInfo | null
  onboardingStep: OnboardingStep
  isActivated: boolean
  // 凭证管理
  vouchers: Voucher[]
  currentVoucherDraft: VoucherDraft | null
}

type Action =
  | { type: 'SET_TAB'; tab: Tab }
  | { type: 'SET_SUB_TAB'; subTab: SubTab }
  | { type: 'ADD_MSG'; msg: Message }
  | { type: 'UPDATE_MSG'; id: number; patch: Partial<Message> }
  | { type: 'CONFIRM'; id: number }
  | { type: 'SET_VOICE'; showVoice: boolean }
  | { type: 'SET_VOICE_IDX'; voiceIdx: number }
  | { type: 'SET_ENTERPRISE'; enterprise: EnterpriseInfo }
  | { type: 'SET_ONBOARDING_STEP'; step: OnboardingStep }
  | { type: 'ACTIVATE_ENTERPRISE' }
  | { type: 'SET_SUB_PAGE'; page: string | null }
  | { type: 'ADD_VOUCHER'; voucher: Voucher }
  | { type: 'UPDATE_VOUCHER'; id: string; patch: Partial<Voucher> }
  | { type: 'SET_VOUCHER_DRAFT'; draft: VoucherDraft | null }

const initState: AppState = {
  tab: 'home',
  subPage: null,
  subTab: 'salary',
  messages: initMsgs,
  confirmed: [],
  showVoice: false,
  voiceIdx: 0,
  enterprise: null,
  onboardingStep: 'none',
  isActivated: false,
  vouchers: [],
  currentVoucherDraft: null,
}

/** 生成凭证编号：YYYYMM-记-序号 */
function genVoucherNo(vouchers: Voucher[]): string {
  const ym = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit' }).replace('/', '')
  const count = vouchers.filter((v) => v.voucherNo.startsWith(ym)).length + 1
  return `${ym}-记-${String(count).padStart(4, '0')}`
}

function reducer(s: AppState, a: Action): AppState {
  switch (a.type) {
    case 'SET_TAB':
      return { ...s, tab: a.tab }
    case 'SET_SUB_TAB':
      return { ...s, subTab: a.subTab }
    case 'ADD_MSG':
      return { ...s, messages: [...s.messages, a.msg] }
    case 'UPDATE_MSG':
      return { ...s, messages: s.messages.map((m) => m.id === a.id ? { ...m, ...a.patch } : m) }
    case 'CONFIRM':
      return { ...s, confirmed: [...s.confirmed, a.id] }
    case 'SET_VOICE':
      return { ...s, showVoice: a.showVoice }
    case 'SET_VOICE_IDX':
      return { ...s, voiceIdx: a.voiceIdx }
    case 'SET_ENTERPRISE':
      return { ...s, enterprise: a.enterprise, onboardingStep: 'info-confirm' }
    case 'SET_ONBOARDING_STEP':
      return { ...s, onboardingStep: a.step }
    case 'ACTIVATE_ENTERPRISE':
      return { ...s, isActivated: true, onboardingStep: 'activation' }
    case 'SET_SUB_PAGE':
      return { ...s, subPage: a.page }
    case 'ADD_VOUCHER':
      return { ...s, vouchers: [...s.vouchers, a.voucher] }
    case 'UPDATE_VOUCHER':
      return {
        ...s,
        vouchers: s.vouchers.map((v) => v.id === a.id ? { ...v, ...a.patch } : v),
      }
    case 'SET_VOUCHER_DRAFT':
      return { ...s, currentVoucherDraft: a.draft }
    default:
      return s
  }
}

// ============== Context ==============

interface AppStoreValue {
  state: AppState
  setTab: (t: Tab) => void
  setSubTab: (s: SubTab) => void
  addMessage: (msg: Message) => void
  updateMessage: (id: number, patch: Partial<Message>) => void
  confirmVoucher: (id: number) => void
  setShowVoice: (v: boolean) => void
  setVoiceIdx: (i: number) => void
  setEnterprise: (e: EnterpriseInfo) => void
  setOnboardingStep: (step: OnboardingStep) => void
  activateEnterprise: () => void
  setSubPage: (page: string | null) => void
  // 凭证Action
  addVoucher: (voucher: Voucher) => void
  updateVoucher: (id: string, patch: Partial<Voucher>) => void
  setVoucherDraft: (draft: VoucherDraft | null) => void
  genVoucherNo: () => string
}

const AppContext = createContext<AppStoreValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initState)
  const value: AppStoreValue = {
    state,
    setTab: (tab) => dispatch({ type: 'SET_TAB', tab }),
    setSubTab: (subTab) => dispatch({ type: 'SET_SUB_TAB', subTab }),
    addMessage: (msg) => dispatch({ type: 'ADD_MSG', msg }),
    updateMessage: (id, patch) => dispatch({ type: 'UPDATE_MSG', id, patch }),
    confirmVoucher: (id) => dispatch({ type: 'CONFIRM', id }),
    setShowVoice: (v) => dispatch({ type: 'SET_VOICE', showVoice: v }),
    setVoiceIdx: (i) => dispatch({ type: 'SET_VOICE_IDX', voiceIdx: i }),
    setEnterprise: (e) => dispatch({ type: 'SET_ENTERPRISE', enterprise: e }),
    setOnboardingStep: (step) => dispatch({ type: 'SET_ONBOARDING_STEP', step }),
    activateEnterprise: () => dispatch({ type: 'ACTIVATE_ENTERPRISE' }),
    setSubPage: (page) => dispatch({ type: 'SET_SUB_PAGE', page }),
    addVoucher: (voucher) => dispatch({ type: 'ADD_VOUCHER', voucher }),
    updateVoucher: (id, patch) => dispatch({ type: 'UPDATE_VOUCHER', id, patch }),
    setVoucherDraft: (draft) => dispatch({ type: 'SET_VOUCHER_DRAFT', draft }),
    genVoucherNo: () => genVoucherNo(state.vouchers),
  }
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useStore() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('[DeepCFO] useStore() must be inside <AppProvider>')
  return ctx
}

/** 兼容旧接口（useAppStore）— 返回解构后的值 */
export function useAppStore() {
  const { state, ...actions } = useStore()
  return { ...state, ...actions }
}
