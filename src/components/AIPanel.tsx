/**
 * AIPanel — AI浮窗面板（Sprint 8）
 * 从底部滑出，包含简化版对话内容
 */
import { useState, useRef, useEffect } from 'react'
import { X, Send, Camera, Mic } from 'lucide-react'

const AI_WELCOME = `您好！我是 DeepCFO AI 财税助手 👋

我能帮您：
• 📊 智能记账 — 语音/文字描述即可生成凭证
• 💰 工资管理 — 一键发工资、生成工资条
• 📋 发票识别 — 拍照上传，自动识别票面信息
• 📈 财务分析 — 解读报表、预警税务风险
• 💡 税务咨询 — 解答各类财税问题

有什么可以帮您的？`

interface Props {
  onClose: () => void
  onNavigate?: (tab: string) => void
}

export default function AIPanel({ onClose, onNavigate }: Props) {
  const [messages, setMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: AI_WELCOME }
  ])
  const [input, setInput] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    const text = input.trim()
    setMessages(prev => [...prev, { role: 'user', text }])
    setInput('')
    setTimeout(() => {
      const reply = getAIReply(text)
      setMessages(prev => [...prev, { role: 'ai', text: reply }])
    }, 800)
  }

  return (
    <>
      {/* 遮罩 */}
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={onClose}
      />
      {/* 面板 */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 animate-[slide-up_0.3s_ease-out] rounded-t-3xl overflow-hidden"
        style={{
          background: '#fff',
          maxWidth: '448px',
          margin: '0 auto',
          height: '60vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 标题栏 */}
        <div
          className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #4F7DF3 0%, #2563EB 100%)' }}
        >
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <span className="text-white text-xs font-bold">CF</span>
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">DeepCFO AI 助手</div>
            <div className="text-white/60 text-xs">财税助手 · 在线</div>
          </div>
          <button
            onClick={onClose}
            className="ml-auto w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'ai' && (
                <div className="w-7 h-7 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-[10px] font-bold">CF</span>
                </div>
              )}
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'ai'
                    ? 'bg-white text-gray-800 shadow-sm border border-gray-100'
                    : 'text-white shadow-md'
                }`}
                style={msg.role === 'ai' ? {} : { background: 'linear-gradient(135deg, #4F7DF3 0%, #2563EB 100%)' }}
              >
                {msg.text}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-[10px] font-bold">我</span>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* 输入栏 */}
        <div className="bg-white border-t border-gray-100 px-4 py-3 flex gap-2 items-end flex-shrink-0 shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
          <button className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 flex-shrink-0 active:scale-90 transition-transform">
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
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder-gray-400"
          />
          <button className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 flex-shrink-0 active:scale-90 transition-transform">
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
      </div>
    </>
  )
}

// 简单规则回复
function getAIReply(text: string): string {
  const t = text.toLowerCase()
  if (t.includes('工资') || t.includes('发钱') || t.includes('发薪')) {
    return `💰 我来帮您发工资！\n\n请告诉我：\n• 本月哪些员工需要发放？\n• 是否有需要调整的金额？\n\n或者直接去「我的 → 发工资」，可以批量确认发放。`
  }
  if (t.includes('发票') || t.includes('票') || t.includes('报销')) {
    return `📄 发票管理已接入！\n\n支持：\n• 拍照识别 — 自动提取票面信息\n• 电子发票 — 自动归档到「发票管理」\n\n需要上传发票吗？`
  }
  if (t.includes('报表') || t.includes('利润') || t.includes('财务')) {
    return `📊 正在为您生成财务分析…\n\n您可以：\n• 点击「财务」Tab 查看三大报表\n• 利润表 / 资产负债表 / 现金流量表\n\n需要我针对哪个报表进行深度分析？`
  }
  if (t.includes('税') || t.includes('申报') || t.includes('报税')) {
    return `📋 我已准备好您的税务申报资料！\n\n本月需要关注：\n• 企业所得税季度预缴（截止3月31日）\n• 增值税申报\n• 个税代扣代缴\n\n去「报税」Tab 可以查看完整申报进度和草稿。`
  }
  if (t.includes('凭证') || t.includes('记账') || t.includes('账')) {
    return `🧾 凭证管理已就绪！\n\n支持：\n• 快速记账 — 描述业务，系统自动生成借贷分录\n• 历史凭证 — 查看、修改、删除\n\n请描述这笔业务的收支情况，我来帮您生成凭证。`
  }
  if (t.includes('员工') || t.includes('人员') || t.includes('入职')) {
    return `👥 员工管理功能已就绪！\n\n您可以：\n• 添加/编辑员工信息\n• 维护社保公积金基数\n• 查看员工工资明细\n\n去「我的 → 员工管理」可以新增员工。`
  }
  if (t.includes('合同') || t.includes('协议')) {
    return `📝 合同管理功能已上线！\n\n支持：\n• 录入采购/销售合同\n• 跟踪付款节点进度\n• 到期前自动提醒\n\n去「财务 → 合同」查看和管理您的合同。`
  }
  return `收到！我来帮您处理。\n\n如需更专业的服务，您可以：\n• 📊 「财务」— 查看报表、合同管理\n• 💰 「我的 → 发工资」— 工资发放\n• 📄 「报税」— 税务申报\n\n或者直接告诉我您想做什么，我来引导您！`
}
