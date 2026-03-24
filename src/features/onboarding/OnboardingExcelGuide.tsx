/**
 * OnboardingExcelGuide.tsx — Excel导入引导页
 * @author 一休 @2026-03-24
 */
import { useState, useRef } from 'react'
import { Download, Upload, FileSpreadsheet, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'

interface Props { onComplete: () => void }

type Phase = 'guide' | 'uploading' | 'preview' | 'done'

// Mock解析结果
const mockResult = {
  success: 48,
  errors: 3,
  rows: [
    { date: '2024-01-05', desc: '王总公司设计费', amount: '+30,000', type: '收入' },
    { date: '2024-01-08', desc: '办公室租金', amount: '-5,000', type: '支出' },
    { date: '2024-01-12', desc: '员工李四工资', amount: '-8,500', type: '支出' },
  ],
}

export default function OnboardingExcelGuide({ onComplete }: Props) {
  const [phase, setPhase] = useState<Phase>('guide')
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) return
    setPhase('uploading')
    setTimeout(() => setPhase('preview'), 2500)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleConfirm = () => {
    setPhase('done')
    setTimeout(onComplete, 1200)
  }

  return (
    <div style={{ padding: '24px 20px' }}>
      {phase !== 'guide' && (
        <button
          onClick={() => setPhase('guide')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#1B3F5C', fontSize: 13, fontWeight: 500, marginBottom: 16,
          }}
        >
          <ArrowLeft size={16} /> 返回
        </button>
      )}

      {/* 指南阶段 */}
      {phase === 'guide' && (
        <>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 16 }}>
              📥 Excel导入步骤
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { step: '1', text: '下载 DeepCFO 专用Excel模板' },
                { step: '2', text: '按模板格式填写历史账务数据' },
                { step: '3', text: '上传填写完成的Excel文件' },
              ].map((s) => (
                <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', background: '#1B3F5C',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: 'white', flexShrink: 0,
                  }}>{s.step}</div>
                  <span style={{ fontSize: 13, color: '#4B5563' }}>{s.text}</span>
                </div>
              ))}
            </div>
            <button
              className="btn-primary"
              style={{ width: '100%', marginTop: 20 }}
              onClick={() => { /* 下载模板 */ }}
            >
              <Download size={16} /> 下载Excel模板
            </button>
          </div>

          {/* 上传区域 */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${dragging ? '#1B3F5C' : '#D1D5DB'}`,
              borderRadius: 16, padding: '40px 20px', textAlign: 'center',
              background: dragging ? '#EFF6FF' : '#FAFAFA',
              cursor: 'pointer', transition: 'all 200ms ease',
            }}
          >
            <Upload size={32} color={dragging ? '#1B3F5C' : '#9CA3AF'} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>
              点击或拖拽上传Excel
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>
              支持 .xlsx / .xls 格式
            </div>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls"
            style={{ display: 'none' }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
          />
        </>
      )}

      {/* 上传中 */}
      {phase === 'uploading' && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            border: '4px solid #E5E7EB', borderTopColor: '#C9963A',
            margin: '0 auto 20px', animation: 'spin 1s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>正在解析Excel...</div>
          <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 8 }}>识别凭证和交易记录中</div>
        </div>
      )}

      {/* 预览 */}
      {phase === 'preview' && (
        <>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
            <div className="card-income" style={{ flex: 1, textAlign: 'center', padding: '12px' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1A7A4A' }}>
                {mockResult.success}
              </div>
              <div style={{ fontSize: 11, color: '#1A7A4A', marginTop: 4 }}>条成功</div>
            </div>
            <div className="card-danger" style={{ flex: 1, textAlign: 'center', padding: '12px' }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#DC2626' }}>
                {mockResult.errors}
              </div>
              <div style={{ fontSize: 11, color: '#DC2626', marginTop: 4 }}>条格式错误</div>
            </div>
          </div>

          {/* 预览列表 */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', background: '#F7F8FA', borderBottom: '1px solid #E5E7EB' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>数据预览（前3条）</span>
            </div>
            {mockResult.rows.map((row, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', borderBottom: i < mockResult.rows.length - 1 ? '1px solid #F3F4F6' : 'none',
              }}>
                <FileSpreadsheet size={16} color="#9CA3AF" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{row.desc}</div>
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{row.date} · {row.type}</div>
                </div>
                <span style={{
                  fontFamily: 'Noto Serif SC, serif', fontSize: 14, fontWeight: 700,
                  color: row.amount.startsWith('+') ? '#1A7A4A' : '#B91C1C',
                }}>{row.amount}</span>
              </div>
            ))}
          </div>

          {mockResult.errors > 0 && (
            <div style={{
              marginTop: 12, padding: '12px 16px',
              background: '#FFFBEB', border: '1px solid #FDE68A',
              borderRadius: 12, fontSize: 12, color: '#B45309',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <AlertCircle size={14} /> 有 {mockResult.errors} 条数据格式有误，将被忽略
            </div>
          )}

          <button
            className="btn-primary btn-lg"
            style={{ width: '100%', marginTop: 20 }}
            onClick={handleConfirm}
          >
            确认导入 {mockResult.success} 条数据
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
