import React, { useState, useEffect, useCallback, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { TransactionTypeSelect } from "@/app/components/create-transactions/TransactionType"
import { PaymentMethodSelect } from "@/app/components/create-transactions/PaymentMethod"
import { CardSelect } from "@/app/components/create-transactions/CardSelect"
import { CreditPaymentTypeSelect } from "@/app/components/create-transactions/CreditPaymentType"
import { DatePicker } from "@/app/components/create-transactions/DatePicker"
import { CurrencyInput } from "@/app/components/create-transactions/CurrencyInput"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Button } from "@/app/components/ui/button"
import { parseCurrencyToFloat } from "@/utils/moneyFormatter"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog"
import { parseCookies } from "nookies"
import { toast } from "sonner"
import { useNameInput } from "@/utils/nameFormatter"
import { transactionSchema, TransactionFormData } from "@/lib/validation"
import { useRouter } from "next/navigation"
import { format, addMonths } from "date-fns"

const ERROR_MESSAGES = {
  MIN_VALUE: "O valor mínimo é R$ 1,00",
  CREATE_TRANSACTION: "Erro ao criar transação. Por favor, tente novamente.",
}

const ENDPOINTS = {
  CREATE_PARCELS: "/api/transactions/create-parcels",
  CREATE_TRANSACTIONS: "/api/transactions/create-transactions",
  GET_CARDS: "/api/cards/get-card",
}

interface Card {
  cardId: string
  nomeCartao: string
  bandeira: string
  tipoCartao: "credito" | "debito"
  vencimento: number
}

interface CreateTransactionProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const CreateTransaction: React.FC<CreateTransactionProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
}) => {
  const [cards, setCards] = useState<Card[]>([])
  const router = useRouter()

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      nome: "",
      fonte: "",
      creditPaymentType: "a-vista",
      parcelas: "",
      detalhesFonte: "",
    },
  })

  const tipo = watch("tipo")
  const fonte = watch("fonte")
  const creditPaymentType = watch("creditPaymentType")
  const selectedCardId = watch("cardId")

  const fetchCards = useCallback(async () => {
    try {
      const { userId } = parseCookies()
      if (!userId) {
        console.warn("Usuário não autenticado")
        return
      }

      const response = await fetch(`${ENDPOINTS.GET_CARDS}?userId=${userId}`)
      if (!response.ok) {
        if (response.status !== 404) {
          throw new Error("Falha ao buscar cartões")
        }
        setCards([])
        return
      }

      const data = await response.json()
      setCards(data.cartoes)
    } catch (error) {
      setCards([])
    }
  }, [])

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  useEffect(() => {
    if (selectedCardId && fonte === "cartao-credito") {
      const selectedCard = cards.find((card) => card.cardId === selectedCardId)
      if (selectedCard) {
        const nextDueDate = calculateNextDueDate(selectedCard.vencimento)
        const formattedDate = format(nextDueDate, "dd-MM-yyyy")
        console.log("Próxima data de vencimento calculada:", formattedDate)
        setValue("data", formattedDate)
      }
    }
  }, [selectedCardId, fonte, cards, setValue])

  const onSubmit = useCallback(
    async (data: TransactionFormData) => {
      if (parseCurrencyToFloat(data.valor) < 1) {
        toast.error(ERROR_MESSAGES.MIN_VALUE)
        return
      }

      const { email: emailFromCookie } = parseCookies()
      const isCardTransaction = data.fonte === "cartao-credito"
      const endpoint = isCardTransaction
        ? ENDPOINTS.CREATE_PARCELS
        : ENDPOINTS.CREATE_TRANSACTIONS

      const formattedData = {
        email: emailFromCookie ? decodeURIComponent(emailFromCookie) : "",
        nome: data.nome,
        tipo: data.tipo,
        data: data.data,
        valor: parseCurrencyToFloat(data.valor),
        ...(isCardTransaction
          ? {
              fonte: "cartao-credito" as const,
              cardId: data.cardId,
              numeroParcelas:
                data.creditPaymentType === "a-prazo"
                  ? parseInt(data.parcelas || "1", 10)
                  : 1,
            }
          : {
              fonte: data.fonte,
              detalhesFonte: data.detalhesFonte,
            }),
      }

      onOpenChange(false)

      try {
        await toast.promise(
          (async () => {
            const response = await fetch(endpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(formattedData),
            })

            if (!response.ok) {
              const error = await response.json()
              throw new Error(
                error.message || "Não foi possível criar a transação."
              )
            }

            reset()
            window.dispatchEvent(new Event("updateTransactions"))
            onSuccess?.()
          })(),
          {
            loading: "Criando transação...",
            success: "Transação criada com sucesso!",
            error: (error: Error) =>
              error.message || "Erro ao criar a transação",
            duration: 4000,
          }
        )
      } catch (error) {
        console.error("Erro ao criar transação:", error)
      }
    },
    [reset, onOpenChange, onSuccess]
  )

  const showDetalhesFonte = useMemo(
    () => fonte && fonte !== "cartao-credito",
    [fonte]
  )

  const { handleNameChange } = useNameInput()

  const calculateNextDueDate = (vencimento: number) => {
    const today = new Date()
    const thisMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      vencimento
    )

    if (today > thisMonth) {
      return addMonths(thisMonth, 1)
    }

    return thisMonth
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[425px] max-w-[100vw]
        md:h-auto
        h-screen max-h-screen w-screen
        md:rounded-lg rounded-none
        flex flex-col"
      >
        <DialogHeader>
          <DialogTitle className="text-center md:text-start">
            Criar Nova Transação
          </DialogTitle>
          <DialogDescription className="text-center md:text-start">
            Preencha os detalhes abaixo corretamente
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="grid gap-4">
            <Controller
              name="nome"
              control={control}
              render={({ field }) => (
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome</Label>
                  <Input
                    id="nome"
                    placeholder="Ex: Salário, Aluguel, etc"
                    {...field}
                    onChange={(e) => handleNameChange(e, field)}
                  />
                  {errors.nome && (
                    <span className="text-red-500 text-sm">
                      {errors.nome.message}
                    </span>
                  )}
                </div>
              )}
            />

            <Controller
              name="tipo"
              control={control}
              render={({ field }) => (
                <TransactionTypeSelect
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.tipo?.message}
                />
              )}
            />

            {tipo && (
              <Controller
                name="fonte"
                control={control}
                render={({ field }) => (
                  <PaymentMethodSelect
                    value={field.value || ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.fonte?.message}
                    transactionType={tipo}
                  />
                )}
              />
            )}
          </div>

          {fonte === "cartao-credito" && (
            <div className="grid gap-4">
              <Controller
                name="cardId"
                control={control}
                render={({ field }) => (
                  <CardSelect
                    value={field.value || ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.cardId?.message}
                    cards={cards}
                    onCloseDialog={() => onOpenChange(false)}
                  />
                )}
              />

              <Controller
                name="creditPaymentType"
                control={control}
                render={({ field }) => (
                  <CreditPaymentTypeSelect
                    paymentType={field.value || "a-vista"}
                    onPaymentTypeChange={field.onChange}
                    installments={watch("parcelas") || ""}
                    onInstallmentsChange={(e) =>
                      setValue("parcelas", e.target.value)
                    }
                    onBlur={field.onBlur}
                    error={{
                      paymentType: errors.creditPaymentType?.message,
                      installments: errors.parcelas?.message,
                    }}
                  />
                )}
              />
            </div>
          )}

          {showDetalhesFonte && (
            <Controller
              name="detalhesFonte"
              control={control}
              render={({ field }) => (
                <div className="grid gap-2">
                  <Label htmlFor="detalhesFonte">Detalhes da Origem</Label>
                  <Input
                    {...field}
                    id="detalhesFonte"
                    placeholder="Detalhes adicionais sobre a origem da transação"
                  />
                  {errors.detalhesFonte && (
                    <span className="text-red-500 text-sm">
                      {errors.detalhesFonte.message}
                    </span>
                  )}
                </div>
              )}
            />
          )}

          <div className="grid gap-4">
            <Controller
              name="data"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.data?.message}
                  disabled={fonte === "cartao-credito"}
                />
              )}
            />

            <Controller
              name="valor"
              control={control}
              render={({ field }) => (
                <CurrencyInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.valor?.message}
                  label={
                    creditPaymentType === "a-prazo" ? "Valor Total" : "Valor"
                  }
                  placeholder={
                    creditPaymentType === "a-prazo"
                      ? "Exemplo: 499,90"
                      : "Exemplo: 199,90"
                  }
                />
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-emerald-800 text-white hover:bg-emerald-700 font-semibold"
          >
            Criar Transação
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateTransaction
