import { useState, useEffect } from "react"
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
import { createFlowSchema } from "@/lib/validation"
import {
  parseCurrencyToFloat,
  handleCurrencyInput,
} from "@/utils/moneyFormatter"
import { toast } from "sonner"

interface CreateFlowProps {
  onComplete?: () => void;
}

export default function CreateFlow({ onComplete }: CreateFlowProps) {
  const [monthlyValues, setMonthlyValues] = useState<{
    [key: number]: { receitaOrcada: string; despesaOrcada: string }
  }>({})
  const [budgetError, setBudgetError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userId, setUserId] = useState<number | null>(null)

  const currentMonth = new Date().getMonth() + 1
  const availableMonths = Array.from(
    { length: 12 - currentMonth + 1 },
    (_, i) => currentMonth + i
  )

  useEffect(() => {
    const cookies = parseCookies()
    const userIdCookie = cookies.userId ? parseInt(cookies.userId) : null
    
    if (!userIdCookie) {
      toast.error("Usuário não identificado", {
        description: "Por favor, faça login novamente."
      })
      return
    }
    
    setUserId(userIdCookie)
    initializeMonthlyValues()
  }, [])

  const initializeMonthlyValues = () => {
    const initialValues: {
      [key: number]: { receitaOrcada: string; despesaOrcada: string }
    } = {}
    for (let month = currentMonth; month <= 12; month++) {
      initialValues[month] = {
        receitaOrcada: "R$ 0,00",
        despesaOrcada: "R$ 0,00",
      }
    }
    setMonthlyValues(initialValues)
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

  const handleCreateBudget = async () => {
    if (userId === null) {
      toast.error("Usuário não autenticado")
      setBudgetError("Usuário não autenticado.")
      return
    }

    setBudgetError(null)
    setIsSubmitting(true)
    
    const toastId = toast.loading("Criando fluxo de caixa...")

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
      createFlowSchema.parse(data)

      const response = await fetch("/api/cashflow/create-flow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erro ao criar fluxo de caixa.")
      }

      toast.success("Fluxo de caixa criado com sucesso!", {
        id: toastId,
      })

      if (onComplete) {
        onComplete()
      }

    } catch (error: any) {
      if (error.errors) {
        const errorMessage = error.errors.map((e: any) => e.message).join(", ")
        toast.error(errorMessage, { id: toastId })
        setBudgetError(errorMessage)
      } else {
        toast.error(error.message, { id: toastId })
        setBudgetError(error.message)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRedirect = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <Card
      className={`
      w-full max-w-[95vw] mx-auto
      ${availableMonths.length <= 2 ? "md:max-w-[600px]" : "md:max-w-[90vw]"} 
      ${availableMonths.length <= 2 ? "lg:max-w-[600px]" : "lg:max-w-[800px]"}
      bg-gradient-to-t from-background/10 to-primary/[5%]
      border-border
    `}
    >
      <div className="p-4 md:p-6">
        <CardTitle className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          Criar Fluxo de Caixa
        </CardTitle>
        <CardDescription className="mt-2 text-sm md:text-base">
          Preencha os campos com os valores que você espera ganhar e gastar nos
          próximos meses
        </CardDescription>
      </div>

      <Separator className="bg-border" />

      <CardContent className="p-4 md:p-6">
        {isSubmitting ? (
          <div className="flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px]">
            <LottieAnimation animationPath="/utilities/loading.json" />
            <p className="mt-4 text-center text-sm md:text-base text-muted-foreground">
              Criando fluxo de caixa...
            </p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            <div
              className={`
              grid gap-4 md:gap-6
              ${availableMonths.length === 1 ? "grid-cols-1" : ""}
              ${
                availableMonths.length === 2 ? "grid-cols-1 md:grid-cols-2" : ""
              }
              ${
                availableMonths.length > 2
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : ""
              }
            `}
            >
              {availableMonths.map((month) => (
                <Card
                  key={month}
                  className="p-3 md:p-4 bg-card border-border transition-all duration-200 hover:shadow-md dark:hover:shadow-primary/5"
                >
                  <CardTitle className="text-base font-medium text-center mb-4 text-foreground">
                    {monthNames[month - 1]}
                  </CardTitle>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor={`receita-${month}`}
                        className="text-sm font-medium"
                      >
                        Receita Prevista
                      </Label>
                      <Input
                        type="text"
                        id={`receita-${month}`}
                        value={monthlyValues[month]?.receitaOrcada || "R$ 0,00"}
                        onChange={(e) =>
                          handleInputChange(
                            month,
                            "receitaOrcada",
                            e.target.value
                          )
                        }
                        className="bg-background text-sm md:text-base h-8 md:h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor={`despesa-${month}`}
                        className="text-sm font-medium"
                      >
                        Despesa Prevista
                      </Label>
                      <Input
                        type="text"
                        id={`despesa-${month}`}
                        value={monthlyValues[month]?.despesaOrcada || "R$ 0,00"}
                        onChange={(e) =>
                          handleInputChange(
                            month,
                            "despesaOrcada",
                            e.target.value
                          )
                        }
                        className="bg-background text-sm md:text-base h-8 md:h-10"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {budgetError && (
              <div className="text-sm text-destructive text-center space-y-2">
                <p>{budgetError}</p>
                {budgetError.includes("Já existe um fluxo de caixa") && (
                  <Button
                    variant="link"
                    className="text-primary hover:text-primary/80"
                  >
                    Editar fluxo existente
                  </Button>
                )}
              </div>
            )}

            <div className="flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-4 pt-2 md:pt-4">
              <Button
                variant="outline"
                onClick={handleRedirect}
                disabled={isSubmitting}
                className="w-full md:w-auto md:min-w-[120px] h-10"
              >
                Pular Etapa
              </Button>
              <Button
                onClick={handleCreateBudget}
                disabled={isSubmitting}
                className="min-w-[180px] bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold"
              >
                Criar Fluxo
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
