/**
 * OnboardingBankGuide.tsx — 银行流水导入引导页
 * @author 一休 @2026-03-24
 */
import { useState } from 'react'
import { ArrowLeft, CheckCircle, RefreshCw } from 'lucide-react'

interface Props { onComplete: () => void }
type Phase = 'auth' | 'loading' | 'preview' | 'done'

// Mock流水数据
const mockFlows = [
  { date: '2024-01-05', desc: '王总公司*设计费', amount: '+30,000', category: '营业收入' },
  { date: '2024-01-08', desc: '支付宝*办公用品', amount: '-856', category: '办公费用' },
  { date: '2024-01-12', desc: '转账*员工工资', amount: '-25,000', category: '工资支出' },
  { date: '2024-01-15', desc: '客户回款*咨询费', amount: '+15,000', category: '营业收入' },
  { date: '2024-01-20', desc: '水电费*自动扣款', amount: '-680', category: '水电费' },
]

export default function OnboardingBankGuide({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('auth')
  const [selected, setSelected] = useState<Set<number>>(new Set())

  const handleAuth = (type: 'wechat' | 'alipay') => {
    setPhase('loading')
    setTimeout(() => setPhase('preview'), 2800)
  }

  const toggleRow = (i: number) => {
    const s = new Set(selected)
    s.has(i) ? s.delete(i) : s.add(i)
    setSelected(s)
  }

  const handleConfirm = () => {
    setPhase('done')
    setTimeout(onComplete, 1200)
  }

  return (
    <div style={{ padding: '24px 20px' }}>
      {phase !== 'auth' && (
        <button
          onClick={() => setPhase('auth')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#1B3F5C', fontSize: 13, fontWeight: 500, marginBottom: 16,
          }}
        >
          <ArrowLeft size={16} /> 返回
        </button>
      )}

      {/* 授权阶段 */}
      {phase === 'auth' && (
        <>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
            选择授权方式
          </div>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 20 }}>
            授权后 DeepCFO 将自动拉取近12个月的交易流水，智能分类入账。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* 微信支付 */}
            <button
              onClick={() => handleAuth('wechat')}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px',
                background: 'white', border: '1.5px solid #E5E7EB',
                borderRadius: 16, cursor: 'pointer', width: '100%',
                boxShadow: '0 1px 3px rgba(27,63,92,.08)',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: '#07C160', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M8.5 11.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 8a1 1 0 1 0 0 2 1 1 0 0 0 0-2zM20 8a6 6 0 0 0-6 6c0 2.5-1.5 4.5-3 6l-1 1v3h-2l-1-1c-1.5-1.5-3-3.5-3-6a6 6 0 0 1 6-6c1 0 2 .3 2.8.7L12 5l1.2 2.7A5.9 5.9 0 0 1 20 8z"/>
                </svg>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>微信支付</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>授权拉取微信支付流水</div>
              </div>
            </button>

            {/* 支付宝 */}
            <button
              onClick={() => handleAuth('alipay')}
              style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '18px 20px',
                background: 'white', border: '1.5px solid #E5E7EB',
                borderRadius: 16, cursor: 'pointer', width: '100%',
                boxShadow: '0 1px 3px rgba(27,63,92,.08)',
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: '#1677FF', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: 'white', fontSize: 20, fontWeight: 800 }}>支</span>
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>支付宝</div>
                <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>授权拉取支付宝交易流水</div>
              </div>
            </button>
          </div>
        </>
      )}

      {/* 拉取中 */}
      {phase === 'loading' && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            border: '4px solid #E5E7EB', borderTopColor: '#1B3F5C',
            margin: '0 auto 20px', animation: 'spin 1s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>正在拉取流水...</div>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <RefreshCw size={14} /> 请稍候，约需2-3分钟
          </div>
        </div>
      )}

      {/* 预览 */}
      {phase === 'preview' && (
        <>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 4 }}>
            流水预览（共5笔）
          </div>
          <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>
            请逐笔确认，系统已自动分类
          </p>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {mockFlows.map((flow, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px',
                borderBottom: i < mockFlows.length - 1 ? '1px solid #F3F4F6' : 'none',
                background: selected.has(i) ? '#EFF6FF' : 'transparent',
                cursor: 'pointer',
                transition: 'background 150ms ease',
              }} onClick={() => toggleRow(i)}>
                <div style={{
                  width: 20, height: 20, borderRadius: 6,
                  border: `2px solid ${selected.has(i) ? '#1B3F5C' : '#D1D5DB'}`,
                  background: selected.has(i) ? '#1B3F5C' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {selected.has(i) && <CheckCircle size={12} color="white" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{flow.desc}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{flow.date}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontFamily: 'Noto Serif SC, serif', fontSize: 14, fontWeight: 700,
                    color: flow.amount.startsWith('+') ? '#1A7A4A' : '#B91C1C',
                  }}>{flow.amount}</div>
                  <span style={{
                    fontSize: 10, padding: '1px 6px', borderRadius: 9999,
                    background: flow.amount.startsWith('+') ? '#ECFDF3' : '#FEF2F2',
                    color: flow.amount.startsWith('+') ? '#1A7A4A' : '#B91C1C',
                  }}>{flow.category}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            className="btn-primary btn-lg"
            style={{ width: '100%', marginTop: 20 }}
            onClick={handleConfirm}
          >
            确认导入 {mockFlows.length} 笔流水
          </button>
        </>
      )}

      {/* 完成 */}
      {phase === 'done' && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <CheckCircle size={48} color="#1A7A4A" style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>导入成功！</div>
        </div>
      )}
    </div>
  )
}
