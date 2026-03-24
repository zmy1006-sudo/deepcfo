/**
 * TaxReportPreview — 申报草稿内嵌预览组件
 *
 * 在弹窗内直接渲染报告内容（浏览器原生中文）
 * html2canvas 截图 → 可保存图片 / 分享
 * 不依赖 window.open / blob URL / 外部字体
 */
import { useState, useRef } from 'react'
import { X, Download, Share2, Copy, Check } from 'lucide-react'
import type { TaxItem } from '@/lib/taxEngine'

interface EnterpriseInfo {
  name: string
  creditCode: string
  region: string
  taxType: string
}

interface Props {
  items: TaxItem[]
  enterprise: EnterpriseInfo
  onClose: () => void
  onConfirm: () => void
  onNavigate?: (tab: string) => void
}

// ── HTML 样式（与 report 一致）─────────────────────────────
function ReportHTML({ items, enterprise, total, generatedAt }: {
  items: TaxItem[]; enterprise: EnterpriseInfo; total: number; generatedAt: string
}) {
  const rows = items.map((item, i) => `
    <tr class="${i % 2 === 1 ? 'alt' : ''}">
      <td>${item.name}</td>
      <td style="text-align:right">—</td>
      <td style="text-align:center">${item.rate || '—'}</td>
      <td style="text-align:right">¥ ${item.amount.toLocaleString()}</td>
    </tr>`).join('')

  return `
<div style="font-family:'PingFang SC','Microsoft YaHei','Noto Sans SC',sans-serif;color:#1F2937;font-size:13px;background:#fff;width:100%;min-height:400px;padding:20px 24px;box-sizing:border-box">
  <!-- 标题栏 -->
  <div style="background:#1B3F5C;color:#fff;padding:20px 0 16px;margin:-20px -24px 20px;border-radius:0">
    <div style="font-size:18px;font-weight:700;padding:0 24px">DeepCFO 税务申报草稿</div>
    <div style="font-size:10px;opacity:.6;padding:4px 24px 0">AI财税助手 · deepcfo.com · 本草稿仅供参考</div>
  </div>
  <!-- 企业信息 -->
  <div style="background:#F8FAFC;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;margin-bottom:16px">
    <div style="display:flex">
      <div style="width:3px;background:#C9963A;flex-shrink:0"></div>
      <div style="flex:1;padding:12px 14px">
        <div style="display:flex;gap:16px;flex-wrap:wrap">
          <div><div style="font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:.5px">纳税人名称</div><div style="font-size:12px;font-weight:600;margin-top:2px">${enterprise.name}</div></div>
          <div><div style="font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:.5px">信用代码</div><div style="font-size:12px;font-weight:600;margin-top:2px">${enterprise.creditCode}</div></div>
          <div><div style="font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:.5px">税款所属期</div><div style="font-size:12px;font-weight:600;margin-top:2px">2026年第1季度</div></div>
          <div><div style="font-size:10px;color:#9CA3AF;text-transform:uppercase;letter-spacing:.5px">申报截止</div><div style="font-size:12px;font-weight:700;margin-top:2px;color:#EF4444">2026-03-31</div></div>
        </div>
      </div>
    </div>
  </div>
  <!-- 金额 -->
  <div style="background:#EFF6FF;border-radius:8px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
    <div>
      <div style="font-size:11px;color:#6B7280">本期应纳税总额</div>
      <div style="font-size:11px;color:#9CA3AF;margin-top:2px">单位：人民币（元）</div>
    </div>
    <div style="font-size:24px;font-weight:700;color:#C9963A;font-family:Georgia,serif">¥ ${total.toLocaleString()}</div>
  </div>
  <!-- 表格 -->
  <table style="width:100%;border-collapse:collapse;font-size:12px;margin-bottom:14px">
    <thead>
      <tr style="background:#F3F4F6">
        <th style="padding:8px 10px;text-align:left;font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #D1D5DB;font-weight:600">税种</th>
        <th style="padding:8px 10px;text-align:right;font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #D1D5DB;font-weight:600">计税依据</th>
        <th style="padding:8px 10px;text-align:center;font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #D1D5DB;font-weight:600">税率</th>
        <th style="padding:8px 10px;text-align:right;font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:.5px;border-bottom:1px solid #D1D5DB;font-weight:600">应纳税额</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr style="background:#EBF2FF;font-weight:700;color:#1B3F5C;border-top:2px solid #D1D5DB">
        <td style="padding:9px 10px" colspan="3">合计</td>
        <td style="padding:9px 10px;text-align:right;color:#C9963A;font-size:14px">¥ ${total.toLocaleString()}</td>
      </tr>
    </tbody>
  </table>
  <!-- 凭证 -->
  <div style="background:#EFF6FF;border-radius:8px;padding:10px 14px;font-size:11px;color:#3B82F6;display:flex;gap:16px;flex-wrap:wrap">
    <span>📋 JY-2026-03-0001</span>
    <span>🕐 ${generatedAt}</span>
    <span>📌 DeepCFO AI财税助手</span>
  </div>
  <!-- 声明 -->
  <div style="margin-top:14px;padding-top:12px;border-top:1px solid #F3F4F6;font-size:10px;color:#9CA3AF;text-align:center;line-height:1.8">
    小规模纳税人增值税按1%征收 · DeepCFO AI财税助手 · 400-XXX-XXXX
  </div>
</div>`
}

// ── 主组件 ─────────────────────────────────────────────
export default function TaxReportPreview({ items, enterprise, onClose, onConfirm, onNavigate }: Props) {
  const [phase, setPhase] = useState<'preview' | 'saved' | 'copied' | 'submitted'>('preview')
  const [saving, setSaving] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const total = items.reduce((s, i) => s + i.amount, 0)
  const generatedAt = new Date().toLocaleString('zh-CN')

  // html2canvas 截图 → 保存图片
  const handleSaveImage = async () => {
    if (!previewRef.current) return
    setSaving(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `DeepCFO_申报草稿_${new Date().toISOString().slice(0,10)}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      setPhase('saved')
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  // Web Share API（手机）
  const handleShare = async () => {
    if (!previewRef.current) return
    setSaving(true)
    try {
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false })
      const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'))
      const file = new File([blob], `DeepCFO_申报草稿_${new Date().toISOString().slice(0,10)}.png`, { type: 'image/png' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: 'DeepCFO 税务申报草稿', files: [file] })
        setPhase('saved')
      } else {
        // 不支持分享文件，降级为保存图片
        const link = document.createElement('a')
        link.download = `DeepCFO_申报草稿_${new Date().toISOString().slice(0,10)}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        setPhase('saved')
      }
    } catch (e) {
      // 用户取消分享不算错
    } finally {
      setSaving(false)
    }
  }

  // 复制报告文本到剪贴板
  const handleCopy = async () => {
    const text = items.map(i => `${i.name}  ¥${i.amount.toLocaleString()}`).join('\n')
    const full = `DeepCFO 税务申报草稿\n纳税人：${enterprise.name}\n税款所属期：2026年第1季度\n合计：¥${total.toLocaleString()}\n\n${text}`
    try {
      await navigator.clipboard.writeText(full)
      setPhase('copied')
      setTimeout(() => setPhase('preview'), 2000)
    } catch {}
  }

  // 确认提交
  const handleConfirm = () => {
    setPhase('submitted')
    setTimeout(() => {
      onConfirm()
      onClose()
      onNavigate?.('home')
    }, 1800)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>

        {/* 顶部 */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 active:scale-90 transition-all">
            <X size={18} />
          </button>
          <div className="flex-1">
            <div className="text-sm font-bold text-gray-800">申报草稿预览</div>
            <div className="text-xs text-gray-400">长按图片可保存 · 截图分享</div>
          </div>
          {phase === 'saved' && (
            <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
              <Check size={13} /> 已保存
            </span>
          )}
          {phase === 'copied' && (
            <span className="text-xs text-blue-500 font-semibold flex items-center gap-1">
              <Check size={13} /> 已复制
            </span>
          )}
        </div>

        {/* 预览区（可截图） */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-3">
          <div
            ref={previewRef}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
            dangerouslySetInnerHTML={{ __html: ReportHTML({ items, enterprise, total, generatedAt }) }}
          />
        </div>

        {/* 操作按钮 */}
        <div className="px-4 py-4 border-t border-gray-100 flex-shrink-0 space-y-2">

          {/* 相册/分享按钮（移动端友好） */}
          <div className="flex gap-2">
            <button
              onClick={handleSaveImage}
              disabled={saving}
              className="flex-1 py-3 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: '#1B3F5C', color: '#fff' }}
            >
              {saving ? (
                <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> 保存中…</>
              ) : (
                <><Download size={15} /> 📷 保存图片</>
              )}
            </button>

            {typeof navigator.share !== 'undefined' && (
              <button
                onClick={handleShare}
                disabled={saving}
                className="py-3 px-4 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1"
                style={{ background: '#C9963A', color: '#fff' }}
              >
                <Share2 size={15} /> 分享
              </button>
            )}

            <button
              onClick={handleCopy}
              className="py-3 px-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-600 transition-all active:scale-[0.98] flex items-center justify-center"
            >
              <Copy size={15} />
            </button>
          </div>

          {/* 提示 */}
          <p className="text-xs text-gray-400 text-center">
            💡 点「保存图片」→ 相册查看 → 可微信发送或打印
          </p>

          {/* 确认提交 */}
          {phase !== 'submitted' && (
            <button
              onClick={handleConfirm}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #C9963A 0%, #E8B96A 100%)', color: '#1B3F5C' }}
            >
              ✓ 确认提交（Mock）
            </button>
          )}

          {phase === 'submitted' && (
            <div className="flex flex-col items-center py-4 gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <div className="text-sm font-bold text-gray-800">申报已提交</div>
              <div className="text-xs text-gray-400">凭证编号：JY-2026-03-0001</div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
