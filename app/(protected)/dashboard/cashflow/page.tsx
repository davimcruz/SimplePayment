"use client"
import { useUserData } from "@/app/components/hooks/useUserData"
import BudgetTables from "@/app/components/cashflow/RenderTables"

const Budgets = () => {
  const { user } = useUserData()

  return (
    <div className="flex-col">
      <BudgetTables isPro={user?.permissao === 'pro'} />
    </div>
  )
}

export default Budgets
