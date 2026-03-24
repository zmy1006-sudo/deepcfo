/**
 * AIFloatingButton — AI浮动按钮（Sprint 8: 青色科技风）
 * 位置：固定右下角，距底部TabBar上方，距右边缘16px
 */
import { MessageCircle } from 'lucide-react'

interface Props {
  onClick: () => void
}

export default function AIFloatingButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="
        fixed bottom-24 right-6
        w-14 h-14
        primary-gradient text-white
        rounded-full
        shadow-[0_8px_32px_rgba(0,105,111,0.35)]
        active:scale-90 transition-all z-50
        flex items-center justify-center
        hover:shadow-[0_12px_40px_rgba(0,242,255,0.4)]
        hover:scale-105
        transition-all duration-200
      "
      aria-label="打开AI助手"
    >
      <MessageCircle size={26} className="text-white" />
    </button>
  )
}
