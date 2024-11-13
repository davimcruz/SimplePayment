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
import { toast } from "sonner"
import { useUserData } from "../hooks/useUserData"

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
  visa: "/cards/visa.svg",
  mastercard: "/cards/mastercard.svg",
  elo: "/cards/elo.svg",
  "american express": "/cards/amex.svg",
  hipercard: "/cards/hipercard.svg",
} as const

const CardsView = () => {
  const [cards, setCards] = useState<CardType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateCard, setShowCreateCard] = useState(false)
  const [showManageCards, setShowManageCards] = useState(false)
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null)
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const router = useRouter()

  const cookies = parseCookies()
  const userId = cookies.userId

  const { user, loading, error } = useUserData()

  useEffect(() => {
    const fetchCards = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/cards/get-card?userId=${userId}`)
        const data = await response.json()

        if (Array.isArray(data.cartoes)) {
          const sortedCards = data.cartoes.sort((a: CardType, b: CardType) => {
            const limiteA = a.limite ? parseFloat(a.limite) : 0
            const limiteB = b.limite ? parseFloat(b.limite) : 0
            return limiteB - limiteA
          })
          setCards(sortedCards)
        }
      } catch (error) {
      } finally {
        setIsLoading(false)
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
    setDeletingCardId(null)
    
    try {
      await toast.promise(
        (async () => {
          const response = await fetch(`/api/cards/delete-cards`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ cardId, userId: Number(userId) }),
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || "Erro ao excluir cartão")
          }

          setCards(cards => cards.filter(card => card.cardId !== cardId))
        })(),
        {
          loading: 'Excluindo cartão...',
          success: 'Cartão excluído com sucesso!',
          error: (error) => error instanceof Error ? error.message : "Erro ao excluir cartão",
          duration: 4000,
        }
      )
    } catch (error) {
      console.error("Erro ao excluir cartão:", error)
    }
  }

  const handleEditCard = (cardId: string) => {
    setEditingCardId(cardId)
  }

  const handleCancelEdit = () => {
    setEditingCardId(null)
  }

  const handleCreateSuccess = async () => {
    setShowCreateCard(false)
    const response = await fetch(`/api/cards/get-card?userId=${userId}`)
    const data = await response.json()
    if (Array.isArray(data.cartoes)) {
      const sortedCards = data.cartoes.sort((a: CardType, b: CardType) => {
        const limiteA = a.limite ? parseFloat(a.limite) : 0
        const limiteB = b.limite ? parseFloat(b.limite) : 0
        return limiteB - limiteA
      })
      setCards(sortedCards)
    }
  }

  const handleAddCard = () => {
    if (loading) {
      toast.error("Aguarde, verificando suas permissões...")
      return
    }

    if (error || !user) {
      toast.error("Erro ao verificar suas permissões. Tente novamente.")
      return
    }

    if (!user.permissao) {
      toast.error("Não foi possível verificar seu tipo de conta.")
      return
    }

    const maxCards = user.permissao === "pro" ? 10 : 3
    
    if (creditCards.length >= maxCards) {
      if (user.permissao === "pro") {
        toast.error("Você atingiu o limite máximo de 10 cartões permitidos para usuários Pro.", {
          duration: 5000
        })
      } else {
        toast.error(
          "Você atingiu o limite de 3 cartões.", 
          {
            description: "Faça upgrade para Membro PRO e adicione até 10 cartões!",
            duration: 5000,
            // action: {
            //   label: "Fazer Upgrade",
            //   onClick: () => router.push("/dashboard/settings/billing")
            // }
          }
        )
      }
      return
    }

    setShowCreateCard(true)
  }

  const handleUpdateSuccess = async () => {
    setEditingCardId(null)
    const response = await fetch(`/api/cards/get-card?userId=${userId}`)
    const data = await response.json()
    if (Array.isArray(data.cartoes)) {
      setCards(data.cartoes)
    }
  }

  if (showCreateCard) {
    return (
      <CreateCreditCard 
        onCancel={() => setShowCreateCard(false)}
        onSuccess={handleCreateSuccess}
      />
    )
  }

  if (editingCardId) {
    return (
      <UpdateCard 
        cardId={editingCardId} 
        onCancel={() => setEditingCardId(null)}
        onSuccess={handleUpdateSuccess}
      />
    )
  }

  const CardItem = ({ card }: { card: CardType }) => {
    const brandIcon = cardBrands[card.bandeira.toLowerCase() as keyof typeof cardBrands]

    return (
      <Card
        className={`
          group relative overflow-hidden
          aspect-[1.6/1]
          bg-gradient-to-br from-zinc-950 to-background
          hover:shadow-xl hover:shadow-zinc-500/5
          transition-all duration-300 cursor-pointer
          border border-white/10
          transform hover:scale-[1.02]
        `}
        onClick={() => handleCardClick(card.cardId)}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <CardHeader className="p-6 relative">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-lg font-medium text-white/90">
                {card.nomeCartao}
              </CardTitle>
              <CardDescription className="text-sm text-white/60">
                {card.instituicao}
              </CardDescription>
            </div>

            <div className="flex items-center gap-3">
              {brandIcon && (
                <img
                  src={brandIcon}
                  alt={`${card.bandeira} logo`}
                  className="h-10 w-16 object-contain opacity-90"
                />
              )}
              {showManageCards && (
                <div className="flex gap-2 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-white/10"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditCard(card.cardId)
                    }}
                  >
                    <PencilLine className="h-4 w-4 text-white/80" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-white/10"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeletingCardId(card.cardId)
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        {!showManageCards && (
          <CardContent className="absolute bottom-0 w-full p-6">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-xs text-white/60 mb-1">Limite Total</span>
                <span className="text-lg font-medium text-white/90">
                  {formatCurrency(card.limite)}
                </span>
              </div>
              {card.vencimento && (
                <div className="flex flex-col items-end">
                  <span className="text-xs text-white/60 mb-1">Vencimento</span>
                  <span className="text-sm text-white/90">
                    Dia {card.vencimento}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        )}

        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-32 h-32 opacity-5">
          <div className="grid grid-cols-8 gap-2">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-white" />
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 md:py-6">
      <Card className="w-full max-w-[1200px] mx-auto bg-gradient-to-t from-background/10 to-primary/[5%]">
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
                onClick={handleAddCard}
                className="gap-2 flex-1 md:flex-none bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold"
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

          {isLoading ? (
            <div className="flex justify-center items-center h-[40vh] md:h-[50vh]">
              <LottieAnimation animationPath="/utilities/loading.json" />
            </div>
          ) : creditCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[40vh] md:h-[50vh] text-center px-4">
              <p className="text-lg md:text-xl font-medium mb-4">Nenhum cartão cadastrado</p>
              <p className="text-muted-foreground mb-8">
                Adicione seu primeiro cartão de crédito para começar
              </p>
              <Button onClick={handleAddCard}>
                Adicionar Cartão
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mx-auto">
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
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingCardId && handleDeleteCard(deletingCardId)}
            >
              Excluir Cartão
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default CardsView
