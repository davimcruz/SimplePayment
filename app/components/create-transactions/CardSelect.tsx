import React from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { Label } from "@/app/components/ui/label"
import { Button } from "@/app/components/ui/button"
import Link from "next/link"

interface Card {
  cardId: string
  nomeCartao: string
  bandeira: string
  tipoCartao: "credito" | "debito"
}

interface CardSelectProps {
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
  cards: Card[] | { cartoes: Card[] } | null
  onCloseDialog?: () => void
  showLabel?: boolean
}

export const CardSelect: React.FC<CardSelectProps> = ({
  value,
  onChange,
  onBlur,
  error,
  cards,
  onCloseDialog,
  showLabel = true,
}) => {
  const cardsArray = Array.isArray(cards) ? cards : cards?.cartoes || []
  const hasCards = cardsArray.length > 0

  const handleCardRegister = () => {
    onCloseDialog?.()
  }

  return (
    <div className="grid gap-2">
      {hasCards ? (
        <Select value={value} onValueChange={onChange} onOpenChange={onBlur}>
          {showLabel && <Label htmlFor="card-select">Selecione o Cartão</Label>}
          <SelectTrigger id="card-select">
            <SelectValue placeholder="Selecione um cartão" />
          </SelectTrigger>
          <SelectContent>
            {cardsArray.map((card) => (
              <SelectItem key={card.cardId} value={card.cardId}>
                {card.nomeCartao}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <div className="mt-2">
          <p className="text-sm text-gray-500 mb-2 text-center">
            Você ainda não possui cartões cadastrados
          </p>
          <Link href="/dashboard/cards" passHref>
            <Button 
              variant="outline" 
              className="w-full mb-4"
              onClick={handleCardRegister}
            >
              Cadastrar Novo Cartão
            </Button>
          </Link>
        </div>
      )}
      {error && <span className="text-red-500 text-sm">{error}</span>}
    </div>
  )
}
