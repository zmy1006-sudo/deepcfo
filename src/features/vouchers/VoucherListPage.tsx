/**
 * VoucherListPage — 凭证管理页面
 * Sprint 1: 凭证历史列表 + Tab筛选 + 凭证详情弹窗
 */
import { useState } from 'react'
import { ChevronLeft, Check, FileText, AlertCircle, TrendingUp, X, Printer } from 'lucide-react'

// ============== 类型 ==============

type VoucherStatus = 'draft' | 'pending' | 'recorded' | 'reported'

interface VoucherEntry {
  account: string
  dc: 'D' | 'C'
  amount: number
}

interface Voucher {
  id: string
  voucherNo: string
  date: string
  description: string
  entries: VoucherEntry[]
  status: VoucherStatus
  recordedAt?: string
}

// ============== Mock数据 ==============

const MOCK_VOUCHERS: Voucher[] = [
  {
    id: 'v-1',
    voucherNo: '202603-记-0043',
    date: '2026-03-24',
    description: '收到王总公司设计费 30,000元',
    entries: [
      { account: '银行存款',    dc: 'D', amount: 30000 },
      { account: '主营业务收入', dc: 'C', amount: 30000 },
    ],
    status: 'pending',
  },
  {
    id: 'v-2',
    voucherNo: '202603-记-0042',
    date: '2026-03-23',
    description: '支付京东电商货款 2,680元',
    entries: [
      { account: '管理费用-办公费', dc: 'D', amount: 2680 },
      { account: '银行存款',        dc: 'C', amount: 2680 },
    ],
    status: 'recorded',
    recordedAt: '2026-03-23 14:30',
  },
  {
    id: 'v-3',
    voucherNo: '202603-记-0041',
    date: '2026-03-20',
    description: 'Q1企业所得税季度预缴 8,420元',
    entries: [
      { account: '所得税费用', dc: 'D', amount: 8420 },
      { account: '银行存款',   dc: 'C', amount: 8420 },
    ],
    status: 'reported',
    recordedAt: '2026-03-20 09:15',
  },
  {
    id: 'v-4',
    voucherNo: '202603-记-0040',
    date: '2026-03-18',
    description: '员工王五3月工资发放 8,500元',
    entries: [
      { account: '应付职工薪酬', dc: 'D', amount: 8500 },
      { account: '银行存款',    dc: 'C', amount: 8500 },
    ],
    status: 'recorded',
    recordedAt: '2026-03-18 17:00',
  },
]

// ============== 常量 ==============

type FilterTab = 'all' | 'pending' | 'recorded' | 'reported'

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: 'all',      label: '全部' },
  { key: 'pending',  label: '待确认' },
  { key: 'recorded', label: '已入账' },
  { key: 'reported', label: '已申报' },
]

const STATUS_META: Record<VoucherStatus, { bg: string; text: string; dot: string; label: string; Icon: any }> = {
  draft:    { bg: 'bg-gray-100',   text: 'text-gray-500',   dot: 'bg-gray-400',   label: '草稿',   Icon: FileText },
  pending:  { bg: 'bg-amber-100', text: 'text-amber-600',  dot: 'bg-amber-400',  label: '待确认', Icon: AlertCircle },
  recorded: { bg: 'bg-emerald-100',text: 'text-emerald-600',dot: 'bg-emerald-400',label: '已入账', Icon: Check },
  reported: { bg: 'bg-blue-100',   text: 'text-blue-600',   dot: 'bg-blue-400',   label: '已申报', Icon: TrendingUp },
}

// ============== 凭证项 ==============

function VoucherItem({ voucher, onClick }: { voucher: Voucher; onClick: () => void }) {
  const meta = STATUS_META[voucher.status]
  const total = voucher.entries.reduce((s, e) => s + e.amount, 0)
  const { Icon } = meta

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md flex items-start gap-3 active:scale-[0.98] transition-all text-left"
    >
      <div className="w-10 h-10 bg-slate-800/8 rounded-xl flex items-center justify-center flex-shrink-0">
        <Icon size={18} className="text-slate-700" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-gray-800">{voucher.voucherNo}</span>
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${meta.bg} ${meta.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
            {meta.label}
          </span>
        </div>
        <div className="text-xs text-gray-400 mt-0.5">{voucher.date}</div>
        <div className="text-xs text-gray-600 mt-1 leading-relaxed">{voucher.description}</div>
        <div className="mt-2 flex flex-wrap gap-1">
          {voucher.entries.map((e, i) => (
            <span key={i} className="text-[11px] bg-gray-50 text-gray-500 px-1.5 py-0.5 rounded border border-gray-100">
              {e.dc === 'D' ? '借' : '贷'} {e.account} ¥{e.amount.toLocaleString()}
            </span>
          ))}
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        <div className="text-sm font-bold text-gray-800">¥{total.toLocaleString()}</div>
      </div>
    </button>
  )
}

// ============== 凭证详情弹窗 ==============

function VoucherModal({ voucher, onClose }: { voucher: Voucher; onClose: () => void }) {
  const meta = STATUS_META[voucher.status]
  const total = voucher.entries.reduce((s, e) => s + e.amount, 0)
  const { Icon } = meta

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/40" />

      {/* 弹窗 */}
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="sticky top-0 bg-white rounded-t-3xl sm:rounded-t-2xl border-b border-gray-100 px-5 py-4 flex items-center gap-3 z-10">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-gray-400 active:scale-90 transition-all rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
          <div className="flex-1">
            <div className="text-sm font-bold text-gray-800">凭证详情</div>
            <div className="text-xs text-gray-400">{voucher.voucherNo}</div>
          </div>
          <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.bg} ${meta.text}`}>
            <Icon size={11} />
            {meta.label}
          </span>
        </div>

        {/* 内容 */}
        <div className="px-5 py-4 space-y-4">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '凭证字号', value: voucher.voucherNo },
              { label: '凭证日期', value: voucher.date },
              { label: '制单人', value: 'DeepCFO AI' },
              { label: '金额合计', value: `¥${total.toLocaleString()}`, highlight: true },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl px-3 py-2.5">
                <div className="text-xs text-gray-400">{item.label}</div>
                <div className={`text-sm font-bold mt-0.5 ${item.highlight ? 'text-slate-800' : 'text-gray-700'}`}>{item.value}</div>
              </div>
            ))}
          </div>

          {/* 摘要 */}
          <div className="bg-gray-50 rounded-xl px-4 py-3">
            <div className="text-xs text-gray-400 mb-1">业务摘要</div>
            <div className="text-sm text-gray-700 leading-relaxed">{voucher.description}</div>
          </div>

          {/* 分录 */}
          <div>
            <div className="text-xs text-gray-400 mb-2 font-medium">会计分录</div>
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              {/* 表头 */}
              <div className="grid grid-cols-4 bg-gray-50 px-4 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                <span>方向</span>
                <span className="col-span-2">科目</span>
                <span className="text-right">金额</span>
              </div>
              {/* 借贷方 */}
              {voucher.entries.map((e, i) => (
                <div key={i} className="grid grid-cols-4 px-4 py-3 border-t border-gray-50 text-sm">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded self-center w-fit ${e.dc === 'D' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                    {e.dc === 'D' ? '借' : '贷'}
                  </span>
                  <span className="col-span-2 text-gray-700 font-medium text-xs">{e.account}</span>
                  <span className="text-right font-bold text-gray-800 text-xs" style={{ fontFamily: 'Georgia, serif' }}>
                    ¥{e.amount.toLocaleString()}
                  </span>
                </div>
              ))}
              {/* 合计行 */}
              <div className="grid grid-cols-4 px-4 py-2.5 border-t border-gray-200 bg-gray-100 text-xs font-bold text-gray-700">
                <span>合计</span>
                <span className="col-span-2" />
                <span className="text-right" style={{ color: '#2563EB', fontFamily: 'Georgia, serif' }}>
                  ¥{total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <Printer size={15} /> 打印
            </button>
            <button
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white active:scale-[0.98] transition-all"
              style={{ background: voucher.status === 'pending' ? '#1B3F5C' : '#94A3B8' }}
              disabled={voucher.status !== 'pending'}
            >
              {voucher.status === 'pending' ? '确认入账' : meta.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============== 主组件 ==============

export default function VoucherListPage({ onBack }: { onBack: () => void }) {
  const [filter, setFilter] = useState<FilterTab>('all')
  const [selected, setSelected] = useState<Voucher | null>(null)

  const filtered = MOCK_VOUCHERS.filter((v) => {
    if (filter === 'all') return true
    return v.status === filter
  })

  const counts: Record<FilterTab, number> = {
    all: MOCK_VOUCHERS.length,
    pending:  MOCK_VOUCHERS.filter((v) => v.status === 'pending').length,
    recorded: MOCK_VOUCHERS.filter((v) => v.status === 'recorded').length,
    reported: MOCK_VOUCHERS.filter((v) => v.status === 'reported').length,
  }

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {/* 顶部标题栏 */}
      <div
        className="px-4 pt-10 pb-3 flex items-center gap-3"
        style={{ background: 'linear-gradient(135deg, #4F7DF3 0%, #2563EB 100%)' }}
      >
        <button onClick={onBack} className="w-8 h-8 flex items-center justify-center text-white/70 active:scale-90 transition-all rounded-lg hover:bg-white/10">
          <ChevronLeft size={20} />
        </button>
        <div className="text-white font-bold text-base">凭证管理</div>
        <div className="ml-auto text-xs text-white/50">{MOCK_VOUCHERS.length} 张凭证</div>
      </div>

      {/* Tab筛选 */}
      <div className="bg-white px-4 py-3 flex gap-2 border-b border-gray-100 shadow-sm">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all text-center ${
              filter === tab.key
                ? 'text-white shadow'
                : 'bg-gray-100 text-gray-500'
            }`}
            style={filter === tab.key ? { background: '#1B3F5C' } : {}}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className={`ml-1 text-[10px] ${filter === tab.key ? 'text-white/60' : 'text-gray-400'}`}>
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 列表 */}
      <div className="px-4 py-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-4">
              <FileText size={36} className="text-gray-300" />
            </div>
            <div className="text-gray-500 text-sm font-medium">暂无凭证记录</div>
            <div className="text-gray-400 text-xs mt-1">在AI助手对话中确认凭证后会自动显示在这里</div>
          </div>
        ) : (
          filtered.map((v) => (
            <VoucherItem key={v.id} voucher={v} onClick={() => setSelected(v)} />
          ))
        )}
      </div>

      {/* 详情弹窗 */}
      {selected && <VoucherModal voucher={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
