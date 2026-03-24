/**
 * TaxPDFGenerator — 申报草稿 PDF 生成器
 *
 * 方案：纯 HTML Blob 下载
 * - 生成 styled HTML（含中文），Blob URL 直接下载
 * - 桌面浏览器：下载 .html 文件，用户打印为 PDF
 * - 手机浏览器：打开 HTML 预览，可直接打印/分享/另存
 * - 无需字体嵌入，浏览器原生渲染中文
 *
 * 手机分享：Web Share API（优先）+ 降级为 blob 下载
 */
import type { TaxItem } from './taxEngine'

interface EnterpriseInfo {
  name: string
  creditCode: string
  region: string
  taxType: string
}

const TOTAL = (items: TaxItem[]) => items.reduce((s, i) => s + i.amount, 0)

// ── HTML 样式模板（支持中文，浏览器原生渲染）─────────────
function buildHTML(
  items: TaxItem[],
  enterprise: EnterpriseInfo,
  total: number,
  generatedAt: string,
): string {
  const rows = items.map((item, i) => `
    <tr class="${i % 2 === 1 ? 'alt' : ''}">
      <td>${item.name}</td>
      <td class="num">—</td>
      <td class="cen">${item.rate || '—'}</td>
      <td class="num">¥ ${item.amount.toLocaleString()}</td>
    </tr>`).join('')

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>DeepCFO 税务申报草稿 ${new Date().toISOString().slice(0,10)}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: "PingFang SC","Microsoft YaHei","Noto Sans SC",sans-serif; color:#1F2937; font-size:13px; background:#fff; }
  @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }

  /* 顶部标题栏 */
  .header { background:#1B3F5C; color:#fff; padding:28px 36px 20px; }
  .header h1 { font-size:22px; font-weight:700; letter-spacing:1px; }
  .header p  { font-size:11px; opacity:.65; margin-top:4px; }

  /* 主体 */
  .body { padding:24px 36px; }

  /* 信息卡片 */
  .info-card {
    border:1px solid #E5E7EB; border-radius:8px; overflow:hidden; margin-bottom:20px;
    background:#F8FAFC;
  }
  .info-row { display:flex; border-bottom:1px solid #E5E7EB; }
  .info-row:last-child { border-bottom:none; }
  .info-cell { padding:10px 14px; flex:1; }
  .info-label { font-size:10px; color:#9CA3AF; text-transform:uppercase; letter-spacing:.5px; }
  .info-val   { font-size:12px; color:#1F2937; margin-top:2px; font-weight:600; }
  .accent-bar { width:3px; background:#C9963A; }

  /* 金额横幅 */
  .amount-banner {
    background:#EFF6FF; border-radius:8px; padding:16px 20px;
    display:flex; align-items:center; justify-content:space-between;
    margin-bottom:20px;
  }
  .amount-label { font-size:12px; color:#6B7280; }
  .amount-value { font-size:28px; font-weight:700; color:#C9963A; font-family:"Georgia",serif; }
  .amount-unit  { font-size:11px; color:#9CA3AF; margin-top:2px; }

  /* 表格 */
  table { width:100%; border-collapse:collapse; margin-bottom:20px; font-size:12px; }
  th { background:#F3F4F6; padding:10px 12px; text-align:left;
       font-size:10px; color:#6B7280; text-transform:uppercase; letter-spacing:.5px;
       border-bottom:1px solid #D1D5DB; }
  td { padding:10px 12px; border-bottom:1px solid #F3F4F6; color:#374151; }
  tr.alt td { background:#F9FAFB; }
  th:not(:first-child), td:not(:first-child) { text-align:right; }
  td:nth-child(3) { text-align:center; }
  .total-row td { background:#EBF2FF; font-weight:700; color:#1B3F5C; font-size:13px; border-bottom:none; }
  .total-row td:last-child { color:#C9963A; font-size:15px; }

  /* 凭证信息 */
  .voucher-box {
    background:#EFF6FF; border-radius:8px; padding:12px 16px;
    display:flex; gap:24px; font-size:11px; color:#3B82F6;
    margin-bottom:20px;
  }

  /* 底部声明 */
  .footer {
    background:#F8FAFC; padding:16px 36px;
    border-top:1px solid #F3F4F6;
    font-size:10px; color:#9CA3AF; text-align:center; line-height:1.8;
  }

  /* 打印按钮（仅屏幕显示） */
  .print-btn {
    display:none;
    position:fixed; bottom:24px; right:24px;
    background:#1B3F5C; color:#fff; border:none;
    padding:12px 24px; border-radius:8px; font-size:14px;
    cursor:pointer; box-shadow:0 4px 12px rgba(27,63,92,.3);
  }
  @media print { .print-btn { display:none !important; } }
</style>
</head>
<body>

<!-- 标题 -->
<div class="header">
  <h1>DeepCFO 税务申报草稿</h1>
  <p>AI财税助手 · deepcfo.com · 本草稿仅供参考，以电子税务局申报数据为准</p>
</div>

<!-- 主体 -->
<div class="body">

  <!-- 企业信息 -->
  <div class="info-card">
    <div style="display:flex">
      <div class="accent-bar"></div>
      <div style="flex:1">
        <div class="info-row">
          <div class="info-cell">
            <div class="info-label">纳税人名称</div>
            <div class="info-val">${enterprise.name}</div>
          </div>
          <div class="info-cell">
            <div class="info-label">统一社会信用代码</div>
            <div class="info-val">${enterprise.creditCode}</div>
          </div>
        </div>
        <div class="info-row">
          <div class="info-cell">
            <div class="info-label">税款所属期</div>
            <div class="info-val">2026年第1季度（1月—3月）</div>
          </div>
          <div class="info-cell">
            <div class="info-label">申报截止日期</div>
            <div class="info-val" style="color:#EF4444;font-weight:700">2026年3月31日</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 金额横幅 -->
  <div class="amount-banner">
    <div>
      <div class="amount-label">本期应纳税总额</div>
      <div style="font-size:11px;color:#9CA3AF">单位：人民币（元）</div>
    </div>
    <div style="text-align:right">
      <div class="amount-value">¥ ${total.toLocaleString()}</div>
    </div>
  </div>

  <!-- 税种明细表 -->
  <table>
    <thead>
      <tr>
        <th>税种</th>
        <th style="text-align:right">计税依据</th>
        <th style="text-align:center">税率</th>
        <th style="text-align:right">本期应纳税额</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
      <tr class="total-row">
        <td>合计</td>
        <td></td>
        <td></td>
        <td>¥ ${total.toLocaleString()}</td>
      </tr>
    </tbody>
  </table>

  <!-- 凭证信息 -->
  <div class="voucher-box">
    <span>📋 凭证编号：JY-2026-03-0001</span>
    <span>🕐 生成时间：${generatedAt}</span>
    <span>📌 DeepCFO AI财税助手</span>
  </div>

</div>

<!-- 底部声明 -->
<div class="footer">
  根据《财政部 税务总局关于实施小微企业普惠性税收减免政策的通知》，小规模纳税人增值税按1%征收<br>
  DeepCFO AI财税助手 · 服务热线 400-XXX-XXXX · deepcfo.com
</div>

<!-- 打印按钮（屏幕可见，打印时隐藏） -->
<button class="print-btn" onclick="window.print()">🖨 打印 / 另存为 PDF</button>

</body>
</html>`
}

// ── 触发下载 ─────────────────────────────────────────

function isMobile(): boolean {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

// ── 公开 API ─────────────────────────────────────────

/**
 * 生成税务申报草稿文件（HTML 格式）
 * 桌面：下载 .html 文件 → 用户打开 → Ctrl+P 打印为 PDF
 * 手机：打开 HTML 预览 → 用户在浏览器菜单选"打印/分享/另存"
 */
export async function downloadTaxPDF(
  items: TaxItem[],
  enterprise: EnterpriseInfo,
): Promise<void> {
  const total = TOTAL(items)
  const generatedAt = new Date().toLocaleString('zh-CN')
  const html = buildHTML(items, enterprise, total, generatedAt)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const ts = new Date().toISOString().slice(0, 10)
  const filename = `DeepCFO_申报草稿_${ts}.html`

  if (isMobile()) {
    // 手机：打开 HTML 预览（浏览器自带打印/分享菜单）
    const url = URL.createObjectURL(blob)
    const win = window.open(url, '_blank')
    if (!win) {
      // 被屏蔽时降级为直接下载
      downloadBlob(blob, filename)
    }
  } else {
    // 桌面：直接下载 HTML 文件
    downloadBlob(blob, filename)
  }
}
