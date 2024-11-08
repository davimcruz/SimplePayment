"use client"
import UpdateFlow from "@/app/components/cashflow/UpdateFlow"

const CashFlow = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex flex-col items-center justify-center p-2 md:p-4 lg:p-6">
        <main className="flex flex-col items-center justify-center w-full py-4 md:py-8 lg:py-12">
          <UpdateFlow />
        </main>
      </div>
    </div>
  )
}

export default CashFlow
