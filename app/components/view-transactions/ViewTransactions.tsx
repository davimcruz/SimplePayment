import React, { useState, useCallback, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { TransactionTypeSelect } from "./TransactionType"
import { PaymentMethodSelect } from "./PaymentMethod"
import { CardSelect } from "./CardSelect"
import { DatePicker } from "./DatePicker"
import { CurrencyInput } from "./CurrencyInput"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/app/components/ui/label"
import { Button } from "@/app/components/ui/button"
import { parseCurrencyToFloat, formatToCurrency } from "@/utils/moneyFormatter"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/app/components/ui/dialog"
import { parseCookies } from "nookies"
import LottieAnimation from "@/app/components/ui/loadingAnimation"
import { viewTransactionSchema, type ViewTransactionFormData } from "@/lib/validation"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

const ENDPOINTS = {
  VIEW_TRANSACTION: "/api/transactions/view-transactions",
  UPDATE_TRANSACTION: "/api/transactions/update-transactions",
  DELETE_TRANSACTION: "/api/transactions/delete-transactions",
  GET_CARDS: "/api/cards/get-card",
}

interface ViewTransactionProps {
  transactionId: string
}

const ViewTransaction: React.FC<ViewTransactionProps> = ({ transactionId }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [cards, setCards] = useState<any[]>([])
  const [apiError, setApiError] = useState<string | null>(null)
  const router = useRouter()

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm<ViewTransactionFormData>({
    resolver: zodResolver(viewTransactionSchema),
    defaultValues: {
      nome: "",
      tipo: "despesa",
      fonte: "",
      detalhesFonte: "",
      data: "",
      valor: "",
      cardId: "",
    },
  })

  const tipo = watch("tipo")
  const fonte = watch("fonte")

  const fetchCards = useCallback(async () => {
    try {
      const { userId } = parseCookies()
      const response = await fetch(`${ENDPOINTS.GET_CARDS}?userId=${userId}`)
      if (!response.ok) {
        throw new Error("Falha ao buscar cartões")
      }
      const data = await response.json()
      setCards(data)
    } catch (error) {
      console.error("Erro ao buscar cartões:", error)
      setCards([])
    }
  }, [])

  const fetchTransactionDetails = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch(ENDPOINTS.VIEW_TRANSACTION, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId }),
      })

      if (!response.ok) {
        throw new Error("Erro ao carregar detalhes da transação")
      }

      const data = await response.json()

      const formattedData = {
        nome: data.nome,
        tipo: data.tipo,
        fonte: data.fonte,
        detalhesFonte: data.detalhesFonte || "",
        data: data.data,
        valor: formatToCurrency(data.valor),
        cardId: data.cartao?.cardId || "",
      }

      reset(formattedData)
    } catch (error) {
      setApiError(
        "Erro ao carregar detalhes da transação. Por favor, tente novamente."
      )
    } finally {
      setIsLoading(false)
    }
  }, [transactionId, reset])

  const openDialog = useCallback(() => {
    setIsOpen(true)
    fetchTransactionDetails()
    fetchCards()
  }, [fetchTransactionDetails, fetchCards])

  const submitForm = async () => {
    console.log("1. submitForm iniciado")
    setIsSubmitting(true)
    setApiError(null)

    try {
      const formData = getValues()
      console.log("2. Dados do formulário:", formData)

      const validationResult = viewTransactionSchema.safeParse(formData)
      console.log("3. Resultado da validação:", validationResult)

      if (!validationResult.success) {
        console.log("4. Validação falhou")
        setApiError(
          "Por favor, preencha todos os campos obrigatórios corretamente."
        )
        return
      }

      const updatedData = {
        transactionId,
        nome: formData.nome,
        data: formData.data,
        valor: parseCurrencyToFloat(formData.valor),
        detalhesFonte: formData.detalhesFonte,
      }
      console.log("5. Dados formatados para envio:", updatedData)

      toast.promise(
        fetch(ENDPOINTS.UPDATE_TRANSACTION, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }).then(async (response) => {
          console.log("6. Resposta da API:", response)
          if (!response.ok) {
            throw new Error(`Erro na resposta da API: ${response.status}`)
          }

          const result = await response.json()
          console.log("7. Resultado da API:", result)

          if (result.success) {
            setIsOpen(false)
            if (window.location.pathname === "/dashboard/transactions") {
              window.location.reload()
            } else {
              router.push("/dashboard/transactions")
            }
          } else {
            throw new Error(
              result.error || "Erro desconhecido ao atualizar a transação"
            )
          }
        }),
        {
          loading: "Atualizando transação...",
          success: "Transação atualizada com sucesso!",
          error: "Erro ao atualizar a transação",
          duration: 4000,
        }
      )
    } catch (error) {
      console.error("8. Erro capturado:", error)
      setApiError("Erro ao atualizar a transação. Por favor, tente novamente.")
    } finally {
      console.log("9. Finalizando submitForm")
      setIsSubmitting(false)
    }
  }

  const handleSubmitClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    console.log("1. Início do submit")
    
    const formData = getValues()
    
    const cleanedData = {
      ...formData,
      cardId: formData.cardId === "" ? undefined : formData.cardId
    }
    
    console.log("2. Dados do form limpos:", cleanedData)

    const validationResult = viewTransactionSchema.safeParse(cleanedData)
    if (!validationResult.success) {
      console.log("4. Erros específicos:", validationResult.error.errors)
      setApiError("Por favor, preencha todos os campos obrigatórios corretamente.")
      return
    }

    setIsSubmitting(true)
    
    try {
      const updatedData = {
        transactionId,
        nome: cleanedData.nome,
        data: cleanedData.data,
        valor: parseCurrencyToFloat(cleanedData.valor),
        detalhesFonte: cleanedData.detalhesFonte,
        cardId: cleanedData.cardId
      }

      toast.promise(
        fetch(ENDPOINTS.UPDATE_TRANSACTION, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }).then(async (response) => {
          console.log("6. Resposta da API:", response)
          if (!response.ok) {
            throw new Error(`Erro na resposta da API: ${response.status}`)
          }

          const result = await response.json()
          console.log("7. Resultado da API:", result)

          if (result.success) {
            setIsOpen(false)
            if (window.location.pathname === "/dashboard/transactions") {
              window.location.reload()
            } else {
              router.push("/dashboard/transactions")
            }
          } else {
            throw new Error(
              result.error || "Erro desconhecido ao atualizar a transação"
            )
          }
        }),
        {
          loading: "Atualizando transação...",
          success: "Transação atualizada com sucesso!",
          error: "Erro ao atualizar a transação",
          duration: 4000,
        }
      )
    } catch (error) {
      console.error("8. Erro capturado:", error)
      setApiError("Erro ao atualizar a transação. Por favor, tente novamente.")
    } finally {
      console.log("9. Finalizando submitForm")
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = async () => {
    setIsDeleting(true)
    setApiError(null)

    try {
      await toast.promise(
        (async () => {
          const response = await fetch(ENDPOINTS.DELETE_TRANSACTION, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactionId }),
          })

          if (!response.ok) {
            throw new Error(`Erro na resposta da API: ${response.status}`)
          }

          const result = await response.json()

          if (!result.success) {
            throw new Error(
              result.error || "Erro desconhecido ao excluir a transação"
            )
          }

          setIsOpen(false)
          if (window.location.pathname === "/dashboard/transactions") {
            window.location.reload()
          } else {
            router.push("/dashboard/transactions")
          }
        })(),
        {
          loading: "Excluindo transação...",
          success: "Transação excluída com sucesso!",
          error: "Erro ao excluir a transação",
          duration: 4000,
        }
      )
    } catch (error) {
      console.error("Erro ao excluir transação:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const disabledStyle = { pointerEvents: "none" as const, opacity: 0.6 }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="ml-auto lg:ml-4 gap-1"
        onClick={openDialog}
      >
        Detalhes
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="sm:max-w-[425px] max-w-[100vw]
      md:h-auto
      h-screen max-h-screen w-screen
      md:rounded-lg rounded-none
      flex flex-col"
        >
          {isSubmitting ? (
            <>
              <DialogHeader>
                <DialogTitle>Editando transação...</DialogTitle>
              </DialogHeader>
              <div className="flex justify-center items-center h-[400px]">
                <LottieAnimation animationPath="/loadingAnimation.json" />
              </div>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Editar Transação</DialogTitle>
                <DialogDescription>
                  Preencha as informações que deseja editar
                </DialogDescription>
              </DialogHeader>
              {isLoading ? (
                <div className="flex justify-center items-center h-[400px]">
                  <LottieAnimation animationPath="/loadingAnimation.json" />
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(submitForm)}
                  className="space-y-6 mt-4"
                >
                  <Controller
                    name="nome"
                    control={control}
                    render={({ field }) => (
                      <div className="grid gap-2">
                        <Label htmlFor="nome">Nome da Transação</Label>
                        <Input
                          {...field}
                          id="nome"
                          placeholder="Nome da transação"
                        />
                        {errors.nome && (
                          <span className="text-red-500 text-sm">
                            {errors.nome.message}
                          </span>
                        )}
                      </div>
                    )}
                  />

                  <div style={disabledStyle}>
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
                  </div>

                  <div style={disabledStyle}>
                    <Controller
                      name="fonte"
                      control={control}
                      render={({ field }) => (
                        <PaymentMethodSelect
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          error={errors.fonte?.message}
                          transactionType={tipo}
                        />
                      )}
                    />
                  </div>

                  {fonte === "cartao-credito" && (
                    <div style={disabledStyle}>
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
                            onCloseDialog={() => setIsOpen(false)}
                          />
                        )}
                      />
                    </div>
                  )}

                  {fonte !== "cartao-credito" && (
                    <Controller
                      name="detalhesFonte"
                      control={control}
                      render={({ field }) => (
                        <div className="grid gap-2">
                          <Label htmlFor="detalhesFonte">
                            Detalhes da Origem
                          </Label>
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

                  <Controller
                    name="data"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={errors.data?.message}
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
                        label="Valor"
                        placeholder="Exemplo: 199,90"
                      />
                    )}
                  />

                  {apiError && <div className="text-red-500">{apiError}</div>}

                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full shadow-sm"
                      disabled={isSubmitting || isDeleting}
                      onClick={handleDeleteClick}
                    >
                      {isDeleting ? "Excluindo..." : "Excluir Transação"}
                    </Button>
                    <Button
                      type="button"
                      className="w-full"
                      disabled={isSubmitting}
                      onClick={(e) => {
                        console.log("0. Botão clicado")
                        handleSubmitClick(e)
                      }}
                    >
                      Atualizar Transação
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ViewTransaction
