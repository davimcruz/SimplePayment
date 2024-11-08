"use client"
import Summary from "@/app/components/dashboard/summary/Summary"
import TransactionsTable from "@/app/components/dashboard/table/TransactionsTable"
import FinancesGraph from "@/app/components/dashboard/graphs/FinancesGraph"
import { YearProvider } from "@/app/contexts/YearContext"

const DashboardPage = () => {
  return (
    <YearProvider>
      <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Summary initialData={null} />
      <div className="grid gap-4 md:gap-8 grid-cols-1 2xl:grid-cols-3">
        <div className="xl:col-span-2">
          <TransactionsTable />
        </div>
        <div className="">
          <FinancesGraph />
        </div>
        </div>
      </div>
    </YearProvider>
  )
}

export default DashboardPage
