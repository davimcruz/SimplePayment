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
      <div className="md:p-6 p-2">
        <div className="w-full overflow-x-auto overflow-y-hidden">
          <BillsTable cardId={cardId as string} />
        </div>
      </div>
    </div>
  )
}

export default CardDetailsPage
