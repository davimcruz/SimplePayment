"use client"
import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/app/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form"
import { Input } from "@/app/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/app/components/ui/card"
import { Separator } from "@/app/components/ui/separator"
import { Plus, Trash2, Check } from "lucide-react"
import LottieAnimation from "@/app/components/ui/loadingAnimation"
import { handleCurrencyInput, parseCurrencyToFloat } from "@/utils/moneyFormatter"
import { CardSelect } from "@/app/components/create-transactions/CardSelect"
import { parseCookies } from 'nookies'
import { useRouter, usePathname } from "next/navigation"

const fixedCostSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  valor: z
    .string()
    .min(1, "Valor é obrigatório"),
  diaVencimento: z.string().refine((val) => {
    const num = Number(val)
    return !isNaN(num) && num >= 1 && num <= 31
  }, "Dia deve estar entre 1 e 31"),
  formaPagamento: z.enum(["pix", "debito", "credito", "boleto"] as const),
  categoria: z.string().min(3, "Categoria deve ter no mínimo 3 caracteres"),
  cardId: z.string().optional(),
})

type FixedCostFormData = z.infer<typeof fixedCostSchema>

interface CreateFixedCostsProps {
  onComplete: () => void
  onBack: () => void
}

export default function CreateFixedCosts({
  onComplete,
  onBack,
}: CreateFixedCostsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [costs, setCosts] = useState<FixedCostFormData[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cards, setCards] = useState<any>(null)
  const [isLoadingCards, setIsLoadingCards] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const form = useForm<FixedCostFormData>({
    resolver: zodResolver(fixedCostSchema),
    defaultValues: {
      nome: "",
      valor: "R$ 0,00",
      diaVencimento: "",
      formaPagamento: "pix",
      categoria: "",
      cardId: undefined,
    },
  })

  useEffect(() => {
    const fetchCards = async () => {
      setIsLoadingCards(true)
      try {
        const cookies = parseCookies()
        const userId = cookies.userId

        if (!userId) {
          toast.error("Usuário não autenticado")
          return
        }

        const response = await fetch(`/api/cards/get-card?userId=${userId}`)
        if (response.ok) {
          const data = await response.json()
          setCards(data)
        }
      } catch (error) {
        console.error("Erro ao carregar cartões:", error)
        toast.error("Erro ao carregar cartões")
      } finally {
        setIsLoadingCards(false)
      }
    }

    fetchCards()
  }, [])

  const onSubmit = async (data: FixedCostFormData) => {
    if (pathname === '/dashboard/setup') {
      console.log('Valor original:', data.valor)
      console.log('Valor após parseCurrencyToFloat:', parseCurrencyToFloat(data.valor))
    }
    
    setCosts((prev) => [...prev, data])
    form.reset()
    setTimeout(() => {
      toast.success("Despesa fixa adicionada com sucesso!")
    }, 0)
  }

  const handleComplete = async () => {
    if (costs.length === 0) {
      toast.error("Adicione pelo menos uma despesa fixa")
      return
    }

    setIsSubmitting(true)
    try {
      await toast.promise(
        (async () => {
          const costsFormatted = costs.map(cost => {
            const valorOriginal = parseCurrencyToFloat(cost.valor)
            return {
              ...cost,
              valor: valorOriginal,
            }
          })

          const response = await fetch("/api/costs/batch", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ costs: costsFormatted }),
          })

          if (!response.ok) throw new Error("Falha ao salvar despesas")

          if (pathname === '/dashboard/setup') {
            router.push('/dashboard')
          } else if (onComplete) {
            onComplete()
          }
        })(),
        {
          loading: 'Salvando suas despesas fixas...',
          success: pathname === '/dashboard/setup' 
            ? 'Despesas salvas! Redirecionando...'
            : 'Despesas fixas salvas com sucesso!',
          error: 'Erro ao salvar despesas fixas',
          duration: 2000,
        }
      )
    } catch (error) {
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const removeCost = (index: number) => {
    setCosts((prev) => prev.filter((_, i) => i !== index))
    setTimeout(() => {
      toast.success("Despesa fixa removida com sucesso!")
    }, 0)
  }

  if (!isMounted) {
    return null
  }

  return (
    <Card className="w-full bg-gradient-to-t from-background/10 to-primary/[5%] border-border">
      <div className="p-4 md:p-6">
        <CardTitle className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          Adicionar Despesas Fixas
        </CardTitle>
        <CardDescription className="mt-2 text-sm md:text-base">
          Cadastre suas despesas fixas mensais para melhor controle financeiro
        </CardDescription>
      </div>

      <Separator className="bg-border" />

      <CardContent className="p-4 md:p-6">
        {isSubmitting ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <LottieAnimation animationPath="/utilities/loading.json" />
            <p className="mt-4 text-center text-sm md:text-base text-muted-foreground">
              Salvando despesas fixas...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Despesa</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Aluguel"
                            {...field}
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="valor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="R$ 0,00"
                            value={field.value}
                            onChange={(e) => {
                              const formattedValue = handleCurrencyInput(
                                e.target.value
                              )
                              field.onChange(formattedValue)
                            }}
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="diaVencimento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dia do Vencimento</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: 5"
                            type="number"
                            min={1}
                            max={31}
                            {...field}
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="formaPagamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forma de Pagamento</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value)
                            if (value !== "credito") {
                              form.setValue("cardId", undefined)
                            }
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pix">PIX</SelectItem>
                            <SelectItem value="debito">Débito</SelectItem>
                            <SelectItem value="credito">Crédito</SelectItem>
                            <SelectItem value="boleto">Boleto</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("formaPagamento") === "credito" && (
                    <FormField
                      control={form.control}
                      name="cardId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cartão de Crédito</FormLabel>
                          <FormControl>
                            {isLoadingCards ? (
                              <div>Carregando...</div>
                            ) : (
                              <CardSelect
                                value={field.value || ""}
                                onChange={field.onChange}
                                onBlur={field.onBlur}
                                error={form.formState.errors.cardId?.message}
                                cards={cards || []}
                                showLabel={false}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="categoria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Moradia"
                            {...field}
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={onBack}
                    className="min-w-[100px]"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    className="min-w-[180px] bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Despesa à Lista
                  </Button>
                </div>
              </form>
            </Form>

            {Array.isArray(costs) && costs.map((cost, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-br from-background/10 to-primary/10"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <p className="font-medium text-foreground">
                      {cost.nome}
                    </p>
                    <span className="text-sm text-muted-foreground">
                      ({cost.categoria})
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <span>{cost.valor}</span>
                    <span className="mx-2">•</span>
                    <span>Vence dia {cost.diaVencimento}</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">
                      {cost.formaPagamento}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCost(index)}
                  className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {costs.length > 0 && (
              <div className="flex flex-col-reverse md:flex-row justify-end gap-3 md:gap-4 pt-4">
                <Button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="w-full md:w-auto min-w-[180px] bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <span className="animate-spin">⚪</span>
                      Salvando...
                    </div>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Finalizar Cadastro
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
