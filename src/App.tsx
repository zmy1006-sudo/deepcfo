/**
 * App.tsx — DeepCFO 主入口（Sprint 8）
 * - 4Tab导航（首页/报税/财务/我的）
 * - AI浮动按钮 + 浮窗面板
 * - 电脑端侧边栏布局
 */
import { useState, useEffect } from 'react'
import TabBar from '@/components/TabBar'
import AIFloatingButton from '@/components/AIFloatingButton'
import AIPanel from '@/components/AIPanel'
import DesktopLayout from '@/components/DesktopLayout'
import HomePage from '@/features/home/HomePage'
import TaxPage from '@/features/tax/TaxPage'
import FinancePage from '@/features/finance/FinancePage'
import MePage from '@/features/me/MePage'
import RegisterPage from '@/features/register/RegisterPage'
import OnboardingPage from '@/features/onboarding/OnboardingPage'
import ActivationPage from '@/features/activation/ActivationPage'
import VoucherListPage from '@/features/vouchers/VoucherListPage'
import SalarySubTab from '@/features/me/SalarySubTab'

const LS_STEP = 'deepcfo_step'

export type AppStep = 'register' | 'data-init' | 'activation' | 'main'

export type SubPage =
  | 'home' | 'tax' | 'finance' | 'me'
  | 'employees' | 'salary' | 'slips'
  | 'vouchers' | 'contracts'

function loadStep(): AppStep {
  try {
    const s = localStorage.getItem(LS_STEP) as AppStep | null
    return s || 'register'
  } catch {
    return 'register'
  }
}

export default function App() {
  // === 所有 Hooks 必须放在条件判断之前 ===
  const [step, setStepState] = useState<AppStep>('register')
  const [subPage, setSubPage] = useState<SubPage>('home')
  const [aiPanelOpen, setAiPanelOpen] = useState(false)

  const [isDesktop, setIsDesktop] = useState(false)

  // 启动：从localStorage恢复 step
  useEffect(() => {
    setStepState(loadStep())
  }, [])

  // 检测桌面端
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768)
    handler()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  const saveStep = (s: AppStep) => {
    try { localStorage.setItem(LS_STEP, s) } catch {}
    setStepState(s)
  }

  const handleNavigate = (tab: string) => {
    setSubPage(tab as SubPage)
  }

  // === 步骤路由（Hook 调用之后） ===

  if (step === 'register') {
    return <RegisterPage onComplete={() => saveStep('data-init')} />
  }

  if (step === 'data-init') {
    return <OnboardingPage onComplete={() => saveStep('activation')} />
  }

  if (step === 'activation') {
    return <ActivationPage onComplete={() => saveStep('main')} />
  }

  // ===== main: 主应用 =====

  // ==== 凭证管理独立页面 ====
  if (subPage === 'vouchers') {
    const content = (
      <>
        <VoucherListPage onBack={() => setSubPage('me')} />
        <TabBar currentTab="me" onNavigate={handleNavigate} />
        {!isDesktop && <AIFloatingButton onClick={() => setAiPanelOpen(true)} />}
        {aiPanelOpen && <AIPanel onClose={() => setAiPanelOpen(false)} onNavigate={handleNavigate} />}
      </>
    )
    return isDesktop ? (
      <DesktopLayout currentTab="me" onNavigate={handleNavigate}>{content}</DesktopLayout>
    ) : content
  }

  // ==== 主Tab内容 ====
  let PageContent: React.ReactNode = null

  if (subPage === 'home') {
    PageContent = <HomePage onNavigate={handleNavigate} />
  } else if (subPage === 'tax') {
    PageContent = <TaxPage onNavigate={handleNavigate} />
  } else if (subPage === 'finance') {
    PageContent = <FinancePage onNavigate={handleNavigate} />
  } else if (subPage === 'me') {
    PageContent = <MePage onNavigate={handleNavigate} />
  } else if (subPage === 'employees') {
    PageContent = <SalarySubTab tab="employees" onBack={() => setSubPage('me')} />
  } else if (subPage === 'salary') {
    PageContent = <SalarySubTab tab="salary" onBack={() => setSubPage('me')} />
  } else if (subPage === 'slips') {
    PageContent = <SalarySubTab tab="slips" onBack={() => setSubPage('me')} />
  } else {
    PageContent = <HomePage onNavigate={handleNavigate} />
  }

  const mainContent = (
    <>
      {PageContent}
      <TabBar currentTab={subPage as string} onNavigate={handleNavigate} />
      {!isDesktop && <AIFloatingButton onClick={() => setAiPanelOpen(true)} />}
      {aiPanelOpen && <AIPanel onClose={() => setAiPanelOpen(false)} onNavigate={handleNavigate} />}
    </>
  )

  return isDesktop ? (
    <DesktopLayout currentTab={subPage as string} onNavigate={handleNavigate}>
      {mainContent}
    </DesktopLayout>
  ) : mainContent
}
