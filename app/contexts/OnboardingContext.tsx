"use client"
import { createContext, useContext, useState, useEffect } from "react"
import { parseCookies } from "nookies"
import { saveOnboardingProgress, getOnboardingProgress } from "@/utils/onboarding/progress"

const TOTAL_STEPS = 6

interface OnboardingContextType {
  hasCompletedTutorial: boolean
  shouldShowTutorial: boolean
  completeStep: (step: string) => void
  resetTutorial: () => void
  skipTutorial: () => void
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

export function OnboardingProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const [shouldShowTutorial, setShouldShowTutorial] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const { userId } = parseCookies()
    if (userId) {
      const progress = getOnboardingProgress(userId)
      setShouldShowTutorial(progress === 'pending')
      setIsInitialized(true)
    }
  }, [])

  const completeStep = (step: string) => {
    const cookies = parseCookies()
    const userId = cookies.userId

    if (!userId) return

    setCompletedSteps((prev) => {
      const newSet = new Set([...prev, step])
      if (newSet.size === TOTAL_STEPS) {
        saveOnboardingProgress(userId, 'completed')
        setShouldShowTutorial(false)
      }
      return newSet
    })
  }

  const skipTutorial = () => {
    const cookies = parseCookies()
    const userId = cookies.userId

    if (userId) {
      saveOnboardingProgress(userId, 'completed')
      setShouldShowTutorial(false)
    }
  }

  const resetTutorial = () => {
    const cookies = parseCookies()
    const userId = cookies.userId

    if (userId) {
      saveOnboardingProgress(userId, 'pending')
      setCompletedSteps(new Set())
      setShouldShowTutorial(true)
    }
  }

  if (!isInitialized) {
    return null
  }

  return (
    <OnboardingContext.Provider
      value={{
        hasCompletedTutorial: completedSteps.size === TOTAL_STEPS,
        shouldShowTutorial,
        completeStep,
        resetTutorial,
        skipTutorial,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error("useOnboarding deve ser usado dentro de OnboardingProvider")
  }
  return context
}
