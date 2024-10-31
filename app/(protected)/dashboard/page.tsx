"use client"
import Summary from "@/app/components/dashboard/summary/Summary"
import TransactionsTable from "@/app/components/dashboard/table/TransactionsTable"
import FinancesGraph from "@/app/components/dashboard/graphs/FinancesGraph"

const DashboardPage = () => {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <Summary initialData={null} />
      <div className="grid lg:max-h-96 gap-4 md:gap-8 xl:grid-cols-3">
        <TransactionsTable />
        <FinancesGraph />
      </div>
    </div>
  )
}

export default DashboardPage
