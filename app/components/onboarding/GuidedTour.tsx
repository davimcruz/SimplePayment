"use client"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/app/components/ui/dialog"
import { motion, AnimatePresence } from "framer-motion"
import { useOnboarding } from "@/app/contexts/OnboardingContext"
import { Rocket, ArrowRight } from "lucide-react"

interface Position {
  x: number
  y: number
  width: number
  height: number
}

interface TourStep {
  id: string
  target: string
  title: string
  description: string
  highlight: boolean
  direction: string
}

const tourSteps: TourStep[] = [
  {
    id: "dashboard",
    target: '[data-sidebar-menu="dashboard"]',
    title: "Dashboard",
    description: "Visualize um resumo completo das suas finanças, gráficos e análises detalhadas",
    highlight: true,
    direction: "right",
  },
  {
    id: "transactions",
    target: '[data-sidebar-menu="transactions"]',
    title: "Suas Transações",
    description:
      "Registre suas receitas e despesas aqui de forma rápida e organizada",
    highlight: true,
    direction: "right",
  },
  {
    id: "cashflow",
    target: '[data-sidebar-menu="cashflow"]',
    title: "Fluxo de Caixa",
    description: "Planeje seus gastos futuros e acompanhe seu orçamento mensal",
    highlight: true,
    direction: "right",
  },
  {
    id: "costs",
    target: '[data-sidebar-menu="costs"]',
    title: "Despesas Fixas",
    description:
      "Gerencie suas despesas recorrentes e tenha controle total dos gastos mensais",
    highlight: true,
    direction: "right",
  },
  {
    id: "cards",
    target: '[data-sidebar-menu="cards"]',
    title: "Cartões de Crédito",
    description: "Organize seus cartões e acompanhe faturas e limites",
    highlight: true,
    direction: "right",
  },
  {
    id: "plans",
    target: '[data-sidebar-menu="plans"]',
    title: "Planos",
    description: "Conheça nossos planos e aproveite recursos exclusivos",
    highlight: true,
    direction: "right",
  },
]

export function GuidedTour() {
  const [currentStep, setCurrentStep] = useState(-1)
  const [showWelcome, setShowWelcome] = useState(false)
  const [elementPosition, setElementPosition] = useState<Position | null>(null)
  const { shouldShowTutorial, completeStep, skipTutorial } = useOnboarding()

  const handleStartTour = () => {
    setShowWelcome(false)
    setCurrentStep(0)
  }

  const handleFinishTour = () => {
    if (currentStep >= 0 && currentStep < tourSteps.length) {
      completeStep(tourSteps[currentStep].id)
    }
    skipTutorial()
    setCurrentStep(-1)
  }

  const handleNext = () => {
    if (currentStep === -1) {
      setCurrentStep(0)
      return
    }

    if (currentStep === tourSteps.length - 1) {
      handleFinishTour()
      return
    }

    if (currentStep >= 0 && currentStep < tourSteps.length - 1) {
      completeStep(tourSteps[currentStep].id)
      setCurrentStep(prev => prev + 1)
    }
  }

  useEffect(() => {
    if (shouldShowTutorial) {
      const hasStartedTutorial = localStorage.getItem("tutorial_started")
      if (!hasStartedTutorial) {
        setShowWelcome(true)
      }
    }
  }, [shouldShowTutorial])

  useEffect(() => {
    if (currentStep >= 0 && currentStep < tourSteps.length) {
      const updatePosition = () => {
        const element = document.querySelector(tourSteps[currentStep].target)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
          const rect = element.getBoundingClientRect()
          setElementPosition({
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
          })
        }
      }

      const timer = setTimeout(updatePosition, 100)
      window.addEventListener('resize', updatePosition)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [currentStep])

  if (!shouldShowTutorial) return null

  return (
    <>
      <Dialog
        open={showWelcome}
        onOpenChange={(open) => {
          if (!open) {
            handleStartTour()
          }
          setShowWelcome(open)
        }}
      >
        <DialogContent className="sm:max-w-md bg-gradient-to-br from-zinc-950 to-background border border-white/10">
          <div className="flex flex-col items-center text-center px-2">
            <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-600/20 to-emerald-500/10 flex items-center justify-center mb-4 ring-1 ring-emerald-500/20">
              <svg
                className="h-8 w-8 text-emerald-500"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            
            <DialogTitle className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 text-transparent bg-clip-text">
              Bem-vindo ao SimpleFinance!
            </DialogTitle>
            
            <DialogDescription className="text-base mb-6 text-white/60">
              Vamos fazer um tour rápido para você conhecer todas as funcionalidades 
              que preparamos para ajudar no controle das suas finanças.
            </DialogDescription>

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-between">
              <button
                onClick={() => {
                  skipTutorial()
                  setShowWelcome(false)
                }}
                className="w-full sm:w-auto px-4 py-2 text-sm text-white/60 hover:text-white border border-white/10 rounded-md hover:bg-white/5 transition-all duration-200"
              >
                Pular Tour
              </button>
              
              <button
                onClick={handleStartTour}
                className="w-full sm:w-auto px-6 py-2 text-sm text-white bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-md hover:from-emerald-700 hover:to-emerald-500 transition-all duration-300 flex items-center justify-center gap-2 group font-medium"
              >
                Começar Tour
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {currentStep >= 0 && currentStep < tourSteps.length && elementPosition && (
          <motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50"
            >
              <div className="absolute inset-0 pointer-events-none">
                <div
                  className="absolute bg-background/80 backdrop-blur-sm"
                  style={{
                    top: 0,
                    left: 0,
                    right: 0,
                    height: elementPosition.y,
                  }}
                />
                <div
                  className="absolute bg-background/80 backdrop-blur-sm"
                  style={{
                    top: elementPosition.y,
                    left: 0,
                    width: elementPosition.x,
                    height: elementPosition.height,
                  }}
                />
                <div
                  className="absolute bg-background/80 backdrop-blur-sm"
                  style={{
                    top: elementPosition.y,
                    left: elementPosition.x + elementPosition.width,
                    right: 0,
                    height: elementPosition.height,
                  }}
                />
                <div
                  className="absolute bg-background/80 backdrop-blur-sm"
                  style={{
                    top: elementPosition.y + elementPosition.height,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                />
              </div>

              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="absolute z-[60]"
                style={{
                  left: elementPosition.x,
                  top: elementPosition.y,
                  width: elementPosition.width,
                  height: elementPosition.height,
                }}
              >
                <div className="absolute inset-0 bg-emerald-500/20 rounded-lg ring-2 ring-emerald-500" />

                <div
                  className={`absolute pointer-events-auto ${
                    tourSteps[currentStep].direction === "right"
                      ? "left-full ml-4"
                      : "top-full mt-4"
                  } bg-background p-4 rounded-lg shadow-lg w-64`}
                >
                  <h3 className="font-semibold text-lg">
                    {tourSteps[currentStep].title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tourSteps[currentStep].description}
                  </p>

                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => {
                        setCurrentStep(prev => prev - 1)
                      }}
                      disabled={currentStep === 0}
                      className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={handleNext}
                      className="px-3 py-1 text-sm text-white bg-gradient-to-r from-emerald-800 to-emerald-600 rounded-md hover:from-emerald-900 hover:to-emerald-700"
                    >
                      {currentStep === tourSteps.length - 1 ? "Finalizar" : "Próximo"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
