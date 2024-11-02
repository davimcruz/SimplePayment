import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { parseCookies } from "nookies"
import LottieAnimation from "../ui/loadingAnimation"
import { Button } from "../ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"
import { Trash2, PencilLine, Plus, Settings2 } from "lucide-react"
import CreateCreditCard from "./CreateCards"
import UpdateCard from "./UpdateCards"

interface CardType {
  cardId: string
  nomeCartao: string
  bandeira: string
  limite?: string
  vencimento?: string
  tipoCartao: "credito"
  instituicao: string
}

const cardBrands = {
  visa: "/visa.svg",
  mastercard: "/mastercard.svg",
  elo: "/elo.svg",
  "american express": "/amex.svg",
  amex: "/amex.svg",
  hipercard: "/hipercard.svg",
} as const

const CardsView = () => {
  const [cards, setCards] = useState<CardType[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateCard, setShowCreateCard] = useState(false)
  const [showManageCards, setShowManageCards] = useState(false)
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const router = useRouter()

  const cookies = parseCookies()
  const userId = cookies.userId

  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/cards/get-card?userId=${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()

        if (Array.isArray(data.cartoes)) {
          const sortedCards = data.cartoes.sort((a: CardType, b: CardType) => {
            const limiteA = a.limite ? parseFloat(a.limite) : 0
            const limiteB = b.limite ? parseFloat(b.limite) : 0
            return limiteB - limiteA
          })
          setCards(sortedCards)
        } else {
          console.error("A resposta da API não é um array.")
        }
      } catch (error) {
        console.error("Erro ao buscar cartões:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [userId])

  const creditCards = cards.filter((card) => card.tipoCartao === "credito")

  const formatCurrency = (value: string | undefined) => {
    if (!value) return ""
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(value))
  }

  const handleCardClick = (cardId: string) => {
    router.push(`/dashboard/cards/${cardId}`)
  }

  const handleDeleteCard = async (cardId: string) => {
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/cards/delete-cards`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cardId, userId: Number(userId) }),
      })

      const data = await response.json()
      if (response.ok) {
        const updatedCards = cards.filter(card => card.cardId !== cardId)
        setCards(updatedCards)
        setDeletingCardId(null)
      } else {
        console.error("Erro ao deletar cartão:", data.error)
      }
    } catch (error) {
      console.error("Erro ao deletar cartão:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditCard = (cardId: string) => {
    setEditingCardId(cardId)
  }

  const handleCancelEdit = () => {
    setEditingCardId(null)
  }

  if (showCreateCard) {
    return <CreateCreditCard onCancel={() => setShowCreateCard(false)} />
  }

  if (editingCardId) {
    return <UpdateCard cardId={editingCardId} onCancel={handleCancelEdit} />
  }

  const CardItem = ({ card }: { card: CardType }) => {
    const brandIcon = cardBrands[card.bandeira.toLowerCase() as keyof typeof cardBrands]

    return (
      <Card
        className="group hover:shadow-lg transition-all duration-300 cursor-pointer w-full bg-gradient-to-br from-background/10 to-primary/[5%]"
        onClick={() => handleCardClick(card.cardId)}
      >
        <CardHeader className="p-4 md:p-6">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base md:text-lg">{card.nomeCartao}</CardTitle>
              <CardDescription className="text-sm md:text-base">{card.instituicao}</CardDescription>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              {brandIcon && (
                <img 
                  src={brandIcon} 
                  alt={`${card.bandeira} logo`} 
                  className="h-8 w-12 md:h-10 md:w-16 object-contain"
                />
              )}
              {showManageCards && (
                <div className="flex gap-1 md:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditCard(card.cardId)
                    }}
                  >
                    <PencilLine className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeletingCardId(card.cardId)
                    }}
                  >
                    <Trash2 className="h-4 w-4 md:h-5 md:w-5 text-destructive" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        {!showManageCards && (
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="flex justify-end items-center">
              <span className="text-sm md:text-base font-medium">
                {formatCurrency(card.limite)}
              </span>
            </div>
          </CardContent>
        )}
      </Card>
    )
  }

  return (
    <div className="px-4 md:px-12 py-4 md:py-6">
      <Card className="w-[90vw] md:w-[900px] bg-gradient-to-t from-background/10 to-primary/[5%]">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-2xl font-bold">Cartões de Crédito</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Clique no cartão para ver detalhes	
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Button 
                onClick={() => setShowCreateCard(true)} 
                className="gap-2 flex-1 md:flex-none"
              >
                <Plus className="h-4 w-4" />
                Novo Cartão
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowManageCards((prev) => !prev)}
                className="gap-2 flex-1 md:flex-none"
              >
                <Settings2 className="h-4 w-4" />
                {showManageCards ? "Concluir" : "Gerenciar"}
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-[40vh] md:h-[50vh]">
              <LottieAnimation animationPath="/loading.json" />
            </div>
          ) : creditCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[40vh] md:h-[50vh] text-center px-4">
              <p className="text-lg md:text-xl font-medium mb-4">Nenhum cartão cadastrado</p>
              <p className="text-muted-foreground mb-8">
                Adicione seu primeiro cartão de crédito para começar
              </p>
              <Button onClick={() => setShowCreateCard(true)}>
                Adicionar Cartão
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mx-auto md:px-12">
              {creditCards.map((card) => (
                <CardItem key={card.cardId} card={card} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deletingCardId}
        onOpenChange={(isOpen) => !isOpen && setDeletingCardId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <p className="text-muted-foreground">
              Tem certeza que deseja excluir este cartão? Todas as transações, 
              parcelas e faturas vinculadas a ele também serão excluídas.
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingCardId(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingCardId && handleDeleteCard(deletingCardId)}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir Cartão"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isDeleting && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <LottieAnimation animationPath="./loading.json" />
        </div>
      )}
    </div>
  )
}

export default CardsView
