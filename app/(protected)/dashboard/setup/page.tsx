"use client"
import { useState } from "react"
import CreateFlow from "@/app/components/setup/CreateFlow"
import CreateFixedCosts from "@/app/components/setup/CreateFixedCosts"
import { motion, AnimatePresence } from "framer-motion"
import { Check } from "lucide-react"

export default function SetupPage() {
  const [step, setStep] = useState(1)
  const totalSteps = 2

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps))
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1))

  const steps = [
    { number: 1, title: "Fluxo de Caixa" },
    { number: 2, title: "Despesas Fixas" }
  ]

  return (
    <div className="flex flex-col items-center justify-start p-4 md:p-6 bg-background/50 h-[calc(100vh-8rem)]">
      <div className="w-full max-w-2xl mb-12 mt-8">
        <div className="flex items-center justify-center gap-4">
          {steps.map((s, idx) => (
            <div key={idx} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`
                  relative w-12 h-12 rounded-full 
                  flex items-center justify-center 
                  transition-all duration-300 
                  ${step > s.number 
                    ? 'bg-emerald-700 ring-2 ring-emerald-300 ring-offset-2 dark:ring-offset-background -pl-2' 
                    : step === s.number 
                    ? 'bg-transparent ring-2 ring-emerald-500 dark:ring-emerald-400'
                    : 'bg-muted'}
                `}>
                  {step > s.number ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="text-white font-bold"
                    >
                      <Check className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <span className={`
                      text-lg font-semibold
                      ${step === s.number 
                        ? 'text-emerald-500 dark:text-emerald-500'
                        : 'text-muted-foreground'}
                    `}>
                      {s.number}
                    </span>
                  )}
                  {step === s.number && (
                    <motion.div
                      className="absolute -inset-1 rounded-full border-2 border-emerald-500 dark:border-emerald-400"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [1, 0.5, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </div>
                <span className={`
                  mt-2 text-sm font-medium transition-colors duration-200
                  ${step >= s.number ? 'text-foreground' : 'text-muted-foreground'}
                `}>
                  {s.title}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className={`
                    h-1 w-24 rounded-full transition-all duration-300
                    ${step > s.number 
                      ? 'bg-emerald-500' 
                      : 'bg-muted'}
                  `} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <main className="w-full max-w-4xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center space-y-6"
          >
            {step === 1 && (
              <div className="w-full space-y-6">
                <CreateFlow onComplete={nextStep} />
              </div>
            )}

            {step === 2 && (
              <div className="w-full space-y-6">
                <CreateFixedCosts onComplete={nextStep} onBack={prevStep} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
