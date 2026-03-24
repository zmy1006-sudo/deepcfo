/**
 * RegisterPage.tsx — 企业注册主页
 * 3步引导：输入代码 → 确认信息 → 选择纳税人类型（注册地自动识别）
 */
import { useState } from 'react'
import { QrCode, Check, ChevronRight, Building2, Loader2 } from 'lucide-react'
import { queryEnterpriseByCreditCode } from '@/lib/enterpriseApi'
import type { EnterpriseInfo, TaxType } from '@/types'

interface RegisterPageProps {
  onComplete: (enterprise: { name: string; creditCode: string; taxType: string; region: string }) => void
}

const PROVINCES = [
  '北京市', '天津市', '上海市', '重庆市',
  '河北省', '山西省', '辽宁省', '吉林省', '黑龙江省',
  '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省',
  '河南省', '湖北省', '湖南省', '广东省', '海南省',
  '四川省', '贵州省', '云南省', '陕西省', '甘肃省', '青海省', '台湾省',
  '内蒙古自治区', '广西壮族自治区', '西藏自治区', '宁夏回族自治区', '新疆维吾尔自治区',
]

type Step = 1 | 2 | 3

function StepIndicator({ step }: { step: Step }) {
  const labels = ['输入代码', '确认信息', '选择类型']
  return (
    <div className="px-5 pt-10 pb-6" style={{ background: 'linear-gradient(160deg, #4F7DF3 0%, #2563EB 100%)' }}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <Building2 size={20} className="text-amber-400" />
        </div>
        <div>
          <div className="text-white font-bold text-lg">企业入驻</div>
          <div className="text-white/50 text-xs mt-0.5">3分钟完成，快速开始</div>
        </div>
      </div>
      <div className="flex items-center">
        {labels.map((label, i) => {
          const num = (i + 1) as Step
          const done = step > num
          const active = step === num
          return (
            <div key={num} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                  ${done ? 'bg-amber-400 text-slate-900' : active ? 'bg-amber-400 text-slate-900 ring-4 ring-amber-400/30' : 'bg-white/20 text-white/50'}`}>
                  {done ? <Check size={14} /> : num}
                </div>
                <span className={`text-xs font-medium ${active ? 'text-amber-300' : 'text-white/40'}`} style={{ fontSize: 10 }}>{label}</span>
              </div>
              {i < 3 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 rounded-full transition-all duration-300 ${done ? 'bg-amber-400' : 'bg-white/20'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function InfoCard({ info }: { info: EnterpriseInfo }) {
  const rows = [
    { label: '企业名称',     value: info.name },
    { label: '法定代表人',   value: info.legalPerson },
    { label: '注册资本',   value: info.registeredCapital },
    { label: '成立日期',   value: info.establishDate },
    { label: '注册地址',   value: info.address },
    { label: '经营范围',   value: info.businessScope },
  ]
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="px-4 py-3 bg-slate-50 border-b border-gray-100 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">企业信息确认</span>
      </div>
      {rows.map(({ label, value }, i) => (
        <div key={label} className={`flex justify-between px-4 py-3 ${i < rows.length - 1 ? 'border-b border-slate-50' : ''}`}>
          <span className="text-xs text-slate-400 flex-shrink-0 mr-3">{label}</span>
          <span className="text-sm text-slate-800 font-medium text-right leading-relaxed">{value}</span>
        </div>
      ))}
    </div>
  )
}

function TaxTypeCard({ type, title, desc, features, selected, onSelect }: {
  type: TaxType; title: string; desc: string; features: string[]; selected: boolean; onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left rounded-2xl p-5 border-2 transition-all duration-200 active:scale-[0.99]
        ${selected ? 'border-primary-dark shadow-lg' : 'border-gray-100 shadow-sm hover:border-gray-300'}`}
      style={{ background: selected ? 'linear-gradient(135deg, #1B3F5C 0%, #234E6E 100%)' : 'white' }}
    >
      <div className="flex justify-between items-start">
        <div>
          <div className={`text-base font-bold ${selected ? 'text-white' : 'text-slate-900'}`}>{title}</div>
          <div className={`text-xs mt-1 ${selected ? 'text-amber-300/80' : 'text-slate-400'}`}>{desc}</div>
        </div>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${selected ? 'bg-accent' : 'border border-gray-200'}`}>
          {selected && <Check size={12} className="text-white" />}
        </div>
      </div>
      <div className="flex gap-2 mt-3 flex-wrap">
        {features.map((f) => (
          <span key={f} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${selected ? 'bg-amber-400/20 text-amber-300' : 'bg-slate-100 text-slate-500'}`}>
            {f}
          </span>
        ))}
      </div>
    </button>
  )
}

export default function RegisterPage({ onComplete }: RegisterPageProps) {
  const [step, setStep] = useState<Step>(1)
  const [creditCode, setCreditCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [enterpriseInfo, setEnterpriseInfo] = useState<EnterpriseInfo | null>(null)
  const [taxType, setTaxType] = useState<TaxType | null>(null)

  const handleQuery = async () => {
    const code = creditCode.trim().toUpperCase()
    if (code.length !== 18) { setError('请输入正确的18位统一社会信用代码'); return }
    setError(''); setLoading(true)
    try {
      const info = await queryEnterpriseByCreditCode(code)
      setEnterpriseInfo(info); setStep(2)
    } catch { setError('查询失败，请检查代码是否正确') }
    finally { setLoading(false) }
  }

  // 快速体验 Demo
  const handleDemo = async () => {
    setCreditCode('91110000XXXXXXXXXX'); setError(''); setLoading(true)
    try {
      const info = await queryEnterpriseByCreditCode('91110000XXXXXXXXXX')
      setEnterpriseInfo(info); setStep(2)
    } catch { setError('查询失败') }
    finally { setLoading(false) }
  }

  // 从企业地址自动识别省份
  const detectProvince = (): string => {
    if (!enterpriseInfo?.address) return '北京市'
    for (const p of PROVINCES) { if (enterpriseInfo.address.startsWith(p)) return p }
    return '北京市'
  }

  // Step3 → 直接完成（跳过独立注册地步骤）
  const handleRegisterComplete = () => {
    if (!enterpriseInfo || !taxType) return
    onComplete({
      name: enterpriseInfo.name,
      creditCode: enterpriseInfo.creditCode,
      taxType: taxType as string,
      region: detectProvince(),
    })
  }

  const STEP_TITLES = [
    { title: '输入统一社会信用代码', sub: '18位编码，营业执照上可找到' },
    { title: '确认企业信息', sub: '请核对以下信息是否准确无误' },
    { title: '选择纳税人类型', sub: '这将决定您的申报周期和税率体系' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <StepIndicator step={step} />

      <div className="flex-1 px-5 -mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">{STEP_TITLES[step - 1].title}</h2>
            <p className="text-xs text-slate-400 mt-1">{STEP_TITLES[step - 1].sub}</p>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <div>
              <div className="relative">
                <input
                  type="text"
                  value={creditCode}
                  onChange={(e) => { setCreditCode(e.target.value.toUpperCase()); if (error) setError('') }}
                  maxLength={18}
                  placeholder="91110000XXXXXXXXXX"
                  className="w-full px-4 py-3.5 pr-14 rounded-xl border border-gray-200 text-sm font-mono tracking-widest
                    placeholder:text-gray-300 focus:outline-none focus:border-primary-dark transition-colors bg-white"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <QrCode size={20} />
                </button>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-slate-400">{creditCode.length}/18 位</span>
                {creditCode.length === 18 && <span className="text-xs text-emerald-500 font-medium animate-pulse">✅ 长度正确</span>}
              </div>
              {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 leading-relaxed">
                  💡 统一社会信用代码是营业执照上的<span className="text-slate-600 font-medium">18位编码</span>，
                  通常以 <span className="font-mono text-slate-600">911</span> 开头
                </p>
              </div>

              <button
                type="button"
                onClick={handleDemo}
                className="mt-3 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] border-2"
                style={{ borderColor: '#10B981', color: '#10B981', background: 'rgba(201,150,58,.06)' }}
              >
                🚀 快速体验 Demo（自动填入测试企业）
              </button>

              <button
                onClick={handleQuery}
                disabled={loading || creditCode.length !== 18}
                className="mt-5 w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-200
                  flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #1B3F5C 0%, #1E4A6E 100%)' }}
              >
                {loading ? <><Loader2 size={16} className="animate-spin" /><span>正在查询...</span></> : <><span>查询企业信息</span><ChevronRight size={16} /></>}
              </button>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && enterpriseInfo && (
            <div>
              <InfoCard info={enterpriseInfo} />
              <button
                onClick={() => setStep(3)}
                className="mt-5 w-full py-3.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                style={{ background: 'linear-gradient(135deg, #1B3F5C 0%, #1E4A6E 100%)' }}
              >
                <span>信息确认无误，继续</span><ChevronRight size={16} />
              </button>
              <button onClick={() => setStep(1)} className="mt-2 w-full py-2.5 text-sm text-slate-400 hover:text-slate-600 transition-colors">
                ← 信息有误，重新输入代码
              </button>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && enterpriseInfo && (
            <div>
              <div className="space-y-3">
                <TaxTypeCard
                  type="small"
                  title="小规模纳税人"
                  desc="适合年营收 < 500万的企业"
                  features={['增值税 1% 优惠税率', '季度30万内免征', '申报周期：季度']}
                  selected={taxType === 'small'}
                  onSelect={() => setTaxType('small')}
                />
                <TaxTypeCard
                  type="general"
                  title="一般纳税人"
                  desc="适合年营收 ≥ 500万或有进项抵扣需求"
                  features={['可抵扣进项增值税', '13%/9%/6%三档税率', '申报周期：月度']}
                  selected={taxType === 'general'}
                  onSelect={() => setTaxType('general')}
                />
              </div>

              {/* 注册地自动识别提示 */}
              <div className="mt-3 px-3 py-2.5 rounded-xl border border-emerald-100 bg-emerald-50/60 flex items-center gap-2">
                <Check size={13} className="text-emerald-500 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-emerald-700">注册地已自动获取</div>
                  <div className="text-xs text-emerald-600/70">来自企业信息：{detectProvince()}，系统将自动应用当地税务优惠</div>
                </div>
              </div>

              <button
                onClick={handleRegisterComplete}
                disabled={!taxType}
                className="mt-4 w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #1B3F5C 0%, #1E4A6E 100%)' }}
              >
                完成注册，创建企业 <ChevronRight size={16} />
              </button>
            </div>
          )}

        </div>
      </div>

      <div className="px-5 py-4 text-center">
        <p className="text-xs text-slate-300">登录即表示同意<span className="text-slate-400">《服务协议》</span>和<span className="text-slate-400">《隐私政策》</span></p>
      </div>
    </div>
  )
}
