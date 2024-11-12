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
import { createFlowSchema } from "@/lib/validation"
import {
  parseCurrencyToFloat,
  handleCurrencyInput,
} from "@/utils/moneyFormatter"
import { toast } from "sonner"

const CreateFlow = () => {
  const [monthlyValues, setMonthlyValues] = useState<{
    [key: number]: { receitaOrcada: string; despesaOrcada: string }
  }>({})
  const [budgetError, setBudgetError] = useState<string | null>(null)
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
    
    if (!userIdCookie) {
      toast.error("Usuário não identificado", {
        description: "Por favor, faça login novamente."
      })
      router.push("/signin")
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
        if (response.status === 409 && errorData.code === "EXISTING_FLOW") {
          toast.error(`Já existe um fluxo de caixa para o ano ${errorData.year}`, {
            id: toastId,
            description: "Você pode editar o fluxo existente ou criar um novo.",
            action: {
              label: "Editar existente",
              onClick: () => router.push("/dashboard/cashflow/updateFlow")
            }
          })
          setBudgetError(
            `Já existe um fluxo de caixa para o ano ${errorData.year}. Deseja editar o fluxo existente?`
          )
          return
        }
        throw new Error(errorData.message || "Erro ao criar fluxo de caixa.")
      }

      toast.success("Fluxo de caixa criado com sucesso!", {
        id: toastId,
        description: "Você será redirecionado para o dashboard."
      })

      setTimeout(() => {
        router.push("/dashboard")
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
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRedirect = () => {
    toast.info("Pulando criação do fluxo de caixa...", {
      description: "Você pode criar o fluxo de caixa mais tarde no dashboard."
    })
    setTimeout(() => {
      router.push("/dashboard")
    }, 1000)
  }

  return (
    <Card
      className={`
      w-[95vw] 
      ${availableMonths.length <= 2 ? "md:w-[600px]" : "md:w-[90vw]"} 
      ${availableMonths.length <= 2 ? "lg:w-[600px]" : "lg:w-[800px]"}
      bg-gradient-to-t from-background/10 to-primary/[5%]
    `}
    >
      <div className="p-4 md:p-6">
        <CardTitle className="text-xl md:text-2xl font-bold tracking-tight">
          Criar Fluxo de Caixa
        </CardTitle>
        <CardDescription className="mt-2 text-sm md:text-base text-muted-foreground">
          Preencha os campos com os valores que você espera ganhar e gastar nos
          próximos meses
        </CardDescription>
      </div>

      <Separator />

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
                  className="p-3 md:p-4 bg-card/50 transition-all duration-200 hover:shadow-md"
                >
                  <CardTitle className="text-base font-medium text-center mb-4">
                    {monthNames[month - 1]}
                  </CardTitle>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor={`receita-${month}`}
                        className="text-sm font-medium text-muted-foreground"
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
                        className="bg-background/50 text-sm md:text-base h-8 md:h-10"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor={`despesa-${month}`}
                        className="text-sm font-medium text-muted-foreground"
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
                        className="bg-background/50 text-sm md:text-base h-8 md:h-10"
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {budgetError && (
              <div className="text-sm text-red-500 text-center space-y-2">
                <p>{budgetError}</p>
                {budgetError.includes("Já existe um fluxo de caixa") && (
                  <Button
                    variant="link"
                    className="text-primary hover:text-primary/80"
                    onClick={() =>
                      router.push("/dashboard/cashflow/updateFlow")
                    }
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
                className="w-full md:w-auto md:min-w-[180px] h-10 font-semibold bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600"
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

export default CreateFlow
