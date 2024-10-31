"use client"
import { useParams } from "next/navigation"
import BillsTable from "@/app/components/cards/cardsTable.tsx/Bills/BillsTable"

const CardDetailsPage = () => {
  const { cardId } = useParams<{ cardId: string }>() || {}

  if (!cardId) {
    console.log("CardId inválido")
  }

  return (
      <div className="flex flex-col">
        <div className="p-6">
          <BillsTable cardId={cardId as string} />
        </div>
      </div>
  )
}

export default CardDetailsPage
