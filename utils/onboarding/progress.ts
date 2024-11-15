const ONBOARDING_KEY = 'financeapp_onboarding'

export const saveOnboardingProgress = (userId: string, status: 'completed' | 'pending') => {
  if (typeof window === 'undefined') return
  
  try {
    const progress = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '{}')
    progress[userId] = status
    localStorage.setItem(ONBOARDING_KEY, JSON.stringify(progress))
  } catch (error) {
    console.error('Erro ao salvar progresso do onboarding:', error)
  }
}

export const getOnboardingProgress = (userId: string): 'completed' | 'pending' => {
  if (typeof window === 'undefined') return 'pending'
  
  try {
    const progress = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '{}')
    return progress[userId] || 'pending'
  } catch (error) {
    console.error('Erro ao recuperar progresso do onboarding:', error)
    return 'pending'
  }
} 