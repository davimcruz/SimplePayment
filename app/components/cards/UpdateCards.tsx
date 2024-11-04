import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardTitle } from "../ui/card"
import { Separator } from "../ui/separator"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Calendar as CalendarIcon } from "lucide-react"
import {
  useCurrencyInput,
  parseCurrencyToFloat,
  formatToCurrency,
} from "@/utils/moneyFormatter"
import { useNameInput } from "@/utils/nameFormatter"
import { updateCardSchema } from "@/lib/validation"
import { z } from "zod"
import { parseCookies } from "nookies"
import { toast } from "sonner"

type ErrorType = Partial<
  Record<keyof z.infer<typeof updateCardSchema>, string>
> & { general?: string }

interface UpdateCardProps {
  cardId: string
  onCancel: () => void
  onSuccess: () => void
}

const UpdateCard: React.FC<UpdateCardProps> = ({ cardId, onCancel, onSuccess }) => {
  const [nome, setNome] = useState<string>("")
  const [bandeira, setBandeira] = useState<string>("")
  const [instituicao, setInstituicao] = useState<string>("")
  const [vencimento, setVencimento] = useState<string>("")
  const [limite, setLimite] = useState<string>("R$ 0,00")
  const [errors, setErrors] = useState<ErrorType>({})

  const { handleChange, handleFocus, handleBlur } = useCurrencyInput()
  const { handleNameChange } = useNameInput()

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const cookies = parseCookies()
        const userId = cookies.userId

        if (!userId) {
          toast.error("Usuário não autenticado")
          return
        }

        const response = await fetch(`/api/cards/get-card?userId=${userId}`)
        const data = await response.json()
        if (response.ok && data.cartoes) {
          const card = data.cartoes.find((c: any) => c.cardId === cardId)
          if (card) {
            setNome(card.nomeCartao)
            setBandeira(card.bandeira)
            setInstituicao(card.instituicao)
            setVencimento(card.vencimento?.toString() || "")
            setLimite(formatToCurrency(card.limite))
          } else {
            toast.error("Cartão não encontrado")
          }
        }
      } catch (error) {
        toast.error("Erro ao buscar dados do cartão")
      }
    }
    fetchCardData()
  }, [cardId])

  const validateForm = (): boolean => {
    try {
      updateCardSchema.parse({
        cardId,
        nome,
        bandeira,
        instituicao,
        vencimento: parseInt(vencimento),
        limite: parseCurrencyToFloat(limite),
      })
      setErrors({})
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ErrorType = {}
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0] as keyof z.infer<typeof updateCardSchema>] = err.message
          }
        })
        setErrors(newErrors)
      }
      return false
    }
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    const updatedCardData = {
      cardId,
      nome,
      bandeira,
      instituicao,
      vencimento: vencimento ? parseInt(vencimento) : undefined,
      limite: parseCurrencyToFloat(limite),
    }

    onCancel()

    try {
      await toast.promise(
        (async () => {
          const response = await fetch("/api/cards/update-cards", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedCardData),
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || "Não foi possível atualizar o cartão.")
          }

          onSuccess()
        })(),
        {
          loading: 'Atualizando cartão...',
          success: 'Cartão atualizado com sucesso!',
          error: (error) => error instanceof Error ? error.message : "Erro ao atualizar o cartão",
          duration: 4000,
        }
      )
    } catch (error) {
      console.error("Erro ao atualizar o cartão:", error)
    }
  }

  const handleVencimentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === "" || (parseInt(value) >= 1 && parseInt(value) <= 31)) {
      setVencimento(value)
      setErrors((prev) => ({ ...prev, vencimento: "" }))
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[100vh] md:min-h-[90vh]">
      <Card
        className="sm:w-[400px] max-w-[100vw]
        md:h-auto md:max-h-[85vh]
        md:rounded-lg rounded-none
        flex flex-col
        pt-6 md:pt-0
        overflow-hidden"
      >
        <CardTitle className="px-6 pt-6">Atualizar Cartão</CardTitle>
        <CardDescription className="px-6 mt-2">
          Atualize as informações do seu cartão de crédito
        </CardDescription>
        <Separator className="w-full my-6" />
        <CardContent className="flex-col gap-4 overflow-y-auto">
          <div className="mb-4">
            <Label htmlFor="card-name">Nome do Cartão</Label>
            <Input
              id="card-name"
              placeholder="Ex: Cartão Inter"
              value={nome}
              onChange={(e) => handleNameChange(e, { onChange: setNome })}
              className="w-full"
            />
            {errors.nome && (
              <span className="text-red-500 text-sm">{errors.nome}</span>
            )}
          </div>

          <div className="mb-4">
            <Label htmlFor="card-bandeira">Bandeira</Label>
            <Select
              value={bandeira}
              onValueChange={(value) => {
                setBandeira(value)
                setErrors((prev) => ({ ...prev, bandeira: "" }))
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a bandeira do cartão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Mastercard">Mastercard</SelectItem>
                <SelectItem value="Visa">Visa</SelectItem>
                <SelectItem value="Elo">Elo</SelectItem>
                <SelectItem value="American Express">American Express</SelectItem>
                <SelectItem value="Hipercard">Hipercard</SelectItem>
              </SelectContent>
            </Select>
            {errors.bandeira && (
              <span className="text-red-500 text-sm">{errors.bandeira}</span>
            )}
          </div>

          <div className="mb-4">
            <Label htmlFor="card-instituicao">Instituição</Label>
            <Input
              id="card-instituicao"
              placeholder="Ex: Banco Inter"
              value={instituicao}
              onChange={(e) => handleNameChange(e, { onChange: setInstituicao })}
              className="w-full"
            />
            {errors.instituicao && (
              <span className="text-red-500 text-sm">{errors.instituicao}</span>
            )}
          </div>

          <div className="mb-4">
            <Label htmlFor="card-limite">Limite do Cartão</Label>
            <Input
              id="card-limite"
              placeholder="Ex: R$ 5.000,00"
              value={limite}
              onChange={(e) => {
                setLimite(handleChange(e))
                setErrors((prev) => ({ ...prev, limite: "" }))
              }}
              onFocus={(e) => setLimite(handleFocus(limite))}
              onBlur={() => setLimite(handleBlur(limite))}
              className="w-full"
            />
            {errors.limite && (
              <span className="text-red-500 text-sm">{errors.limite}</span>
            )}
          </div>

          <div className="mb-4">
            <Label htmlFor="card-vencimento">Vencimento da Fatura (Dia)</Label>
            <div className="relative">
              <Input
                id="card-vencimento"
                type="number"
                placeholder="Ex: 15"
                value={vencimento}
                onChange={handleVencimentoChange}
                className="pl-10"
                min={1}
                max={31}
              />
              <CalendarIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>
            {errors.vencimento && (
              <span className="text-red-500 text-sm">{errors.vencimento}</span>
            )}
          </div>

          <div className="p-6 mt-auto bg-background border-t">
            <Button onClick={handleSubmit} className="w-full mb-2">
              Atualizar Cartão de Crédito
            </Button>
            <Button onClick={onCancel} className="w-full" variant="outline">
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default UpdateCard
