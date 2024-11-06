import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/app/components/ui/card"
import { Separator } from "@/app/components/ui/separator"
import { Label } from "@/app/components/ui/label"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { parseCookies } from "nookies"
import LottieAnimation from "@/app/components/ui/loadingAnimation"
import { monthNames } from "@/utils/monthNames"
import { updateFlowSchema } from "@/lib/validation"
import {
  formatToCurrency,
  parseCurrencyToFloat,
  handleCurrencyInput,
} from "@/utils/moneyFormatter"
import { toast } from "sonner"

const UpdateFlow = () => {
  const [monthlyValues, setMonthlyValues] = useState<{
    [key: number]: { receitaOrcada: string; despesaOrcada: string }
  }>({})
  const [budgetError, setBudgetError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)
  const router = useRouter()

  const currentMonth = new Date().getMonth() + 1
  const availableMonths = Array.from(
    { length: 12 - currentMonth + 1 },
    (_, i) => currentMonth + i
  )

  useEffect(() => {
    const cookies = parseCookies()
    const userIdCookie = cookies.userId ? parseInt(cookies.userId) : null
    setUserId(userIdCookie)

    if (userIdCookie) {
      fetchBudgets(userIdCookie)
    }
  }, [])

  const fetchBudgets = async (userId: number) => {
    try {
      const response = await fetch(`/api/cashflow/get-flow?userId=${userId}`)
      if (!response.ok) {
        throw new Error("Falha ao buscar fluxo de caixa")
      }
      const data = await response.json()
      const budgets: {
        [key: number]: { receitaOrcada: string; despesaOrcada: string }
      } = {}
      data.flows.forEach(
        (item: {
          mes: number
          receitaOrcada: number
          despesaOrcada: number
        }) => {
          if (item.mes >= currentMonth) {
            budgets[item.mes] = {
              receitaOrcada: formatToCurrency(item.receitaOrcada),
              despesaOrcada: formatToCurrency(item.despesaOrcada),
            }
          }
        }
      )
      setMonthlyValues(budgets)
    } catch (error) {
      console.error("Erro ao buscar fluxo de caixa:", error)
      toast.error("Erro ao carregar fluxo de caixa existente")
      setBudgetError("Erro ao carregar fluxo de caixa existente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (
    month: number,
    type: "receitaOrcada" | "despesaOrcada",
    value: string
  ) => {
    let formattedValue =
      value.trim() === "" ? "R$ 0,00" : handleCurrencyInput(value)

    setMonthlyValues((prev) => ({
      ...prev,
      [month]: {
        ...prev[month],
        [type]: formattedValue,
      },
    }))
  }

  const handleUpdateBudget = async () => {
    if (userId === null) {
      toast.error("Usuário não autenticado")
      setBudgetError("Usuário não autenticado.")
      return
    }

    setBudgetError(null)
    setIsSubmitting(true)
    
    const toastId = toast.loading("Atualizando fluxo de caixa...")

    try {
      const flow = Object.entries(monthlyValues).reduce(
        (acc, [month, values]) => {
          acc[month] = {
            receitaOrcada: parseCurrencyToFloat(values.receitaOrcada),
            despesaOrcada: parseCurrencyToFloat(values.despesaOrcada),
          }
          return acc
        },
        {} as {
          [key: string]: { receitaOrcada: number; despesaOrcada: number }
        }
      )

      const data = { userId, flow }
      updateFlowSchema.parse(data)

      const response = await fetch("/api/cashflow/update-flow", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Erro ao atualizar fluxo de caixa.")
      }

      toast.success("Fluxo de caixa atualizado com sucesso!", {
        id: toastId,
        description: "Você será redirecionado para a página de fluxo de caixa."
      })

      setTimeout(() => {
        router.push("/dashboard/cashflow")
      }, 1000)

    } catch (error: any) {
      if (error.errors) {
        const errorMessage = error.errors.map((e: any) => e.message).join(", ")
        toast.error(errorMessage, { id: toastId })
        setBudgetError(errorMessage)
      } else {
        toast.error(error.message, { id: toastId })
        setBudgetError(error.message)
      }
      setIsSubmitting(false)
    }
  }

  const handleRedirect = () => {
    toast.info("Redirecionando para fluxo de caixa...", {
      description: "As alterações não serão salvas."
    })
    setTimeout(() => {
      router.push("/dashboard/cashflow")
    }, 1000)
  }

  const getGridColumns = (monthCount: number) => {
    return 1
  }

  return (
    <Card className={`
      w-[95vw] 
      ${availableMonths.length <= 2 ? 'md:w-[600px]' : 'md:w-[90vw]'} 
      ${availableMonths.length <= 2 ? 'lg:w-[600px]' : 'lg:w-[800px]'}
      bg-gradient-to-t from-background/10 to-primary/[5%]
    `}>
      <div className="p-4 md:p-6">
        <CardTitle className="text-xl md:text-2xl font-bold tracking-tight">
          Atualizar Fluxo de Caixa
        </CardTitle>
        <CardDescription className="mt-2 text-sm md:text-base text-muted-foreground">
          Planeje seus próximos meses atualizando suas receitas e despesas previstas
        </CardDescription>
      </div>
      
      <Separator />
      
      <CardContent className="p-4 md:p-6">
        {isLoading || isSubmitting ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px]">
            <LottieAnimation animationPath="/loadingAnimation.json" />
            <p className="mt-4 text-center text-sm md:text-base text-muted-foreground">
              {isLoading ? "Carregando fluxo de caixa..." : "Atualizando fluxo de caixa..."}
            </p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            <div className={`
              grid gap-4 md:gap-6
              ${availableMonths.length === 1 ? 'grid-cols-1' : ''}
              ${availableMonths.length === 2 ? 'grid-cols-1 md:grid-cols-2' : ''}
              ${availableMonths.length > 2 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : ''}
            `}>
              {availableMonths.map((month) => (
                <Card 
                  key={month} 
                  className="p-3 md:p-4 bg-card/50 transition-all duration-200 hover:shadow-md"
                >
                  <CardTitle className="text-base font-medium text-center mb-3 md:mb-4">
                    {monthNames[month - 1]}
                  </CardTitle>
                  
                  <div className="space-y-3 md:space-y-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label 
                        htmlFor={`receita-${month}`}
                        className="text-xs md:text-sm font-medium text-muted-foreground"
                      >
                        Receita Prevista
                      </Label>
                      <Input
                        type="text"
                        id={`receita-${month}`}
                        value={monthlyValues[month]?.receitaOrcada || "R$ 0,00"}
                        onChange={(e) => handleInputChange(month, "receitaOrcada", e.target.value)}
                        className="bg-background/50 text-sm md:text-base h-8 md:h-10"
                      />
                    </div>

                    <div className="space-y-1.5 md:space-y-2">
                      <Label 
                        htmlFor={`despesa-${month}`}
                        className="text-xs md:text-sm font-medium text-muted-foreground"
                      >
                        Despesa Prevista
                      </Label>
                      <Input
                        type="text"
                        id={`despesa-${month}`}
                        value={monthlyValues[month]?.despesaOrcada || "R$ 0,00"}
                        onChange={(e) => handleInputChange(month, "despesaOrcada", e.target.value)}
                        className="bg-background/50 text-sm md:text-base h-8 md:h-10"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {budgetError && (
              <p className="text-xs md:text-sm text-red-500 text-center">
                {budgetError}
              </p>
            )}

            <div className="flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-4 pt-2 md:pt-4">
              <Button
                variant="outline"
                onClick={handleRedirect}
                disabled={isSubmitting}
                className="w-full md:w-auto md:min-w-[120px] h-10"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUpdateBudget}
                disabled={isSubmitting}
                className="w-full md:w-auto md:min-w-[180px] h-10 font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
              >
                Atualizar Fluxo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default UpdateFlow
