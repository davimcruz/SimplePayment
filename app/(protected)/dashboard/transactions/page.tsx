"use client"
import TransactionsFull from "@/app/components/transactions/TransactionsFull"
import { YearProvider } from "@/app/contexts/YearContext"

const Transactions = () => {
  return (
    <YearProvider>
      <TransactionsFull />
    </YearProvider>
  )
}

export default Transactions
