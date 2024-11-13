import React, { useEffect, useState } from "react"
import { parseCookies } from "nookies"
import CreateCards from "./CreateCards"
import CardsView from "./CardsView"
import CreateCreditCard from "./CreateCards"

interface CardType {
  nomeCartao: string
  bandeira: string
  limite?: string
  vencimento?: string
  tipoCartao: "credito" 
}

const CardsManager = () => {
  const [cards, setCards] = useState<CardType[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateCard, setShowCreateCard] = useState(false)

  const cookies = parseCookies()
  const userId = cookies.userId

  const fetchCards = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `/api/cards/get-card?userId=${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      const data = await response.json()
      if (Array.isArray(data.cartoes)) {
        const sortedCards = data.cartoes.sort((a: { limite: string }, b: { limite: string }) => {
          const limiteA = a.limite ? parseFloat(a.limite) : 0
          const limiteB = b.limite ? parseFloat(b.limite) : 0
          return limiteB - limiteA
        })
        setCards(sortedCards)
      } 
    } catch (error) {
      console.error("Erro ao buscar cartões:", error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCards()
  }, [userId])

  if (loading) {
    return null 
  }

  if (cards.length === 0) {
    return (
      <CreateCards 
        onCancel={() => setCards([])} 
        onSuccess={() => {
          setShowCreateCard(false)
          fetchCards()
        }}
      />
    )
  }

  if (showCreateCard) {
    return (
      <CreateCreditCard 
        onCancel={() => setShowCreateCard(false)} 
        onSuccess={() => {
          setShowCreateCard(false)
          fetchCards()
        }}
      />
    )
  }

  return (
    <div className="flex justify-center items-start w-full h-[calc(100vh-8rem)] pb-4">
      <CardsView />
    </div>
  )
}

export default CardsManager
