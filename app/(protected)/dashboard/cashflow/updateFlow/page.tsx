"use client"
import UpdateFlow from "@/app/components/cashflow/UpdateFlow"

const CashFlow = () => {

  return (
      <div className="flex flex-col">
        <div className="flex min-h-[80vh] flex-col items-center justify-center p-6">
          <main className="flex flex-col items-center justify-center flex-1 gap-8 px-4 py-16 lg:px-0">
            <UpdateFlow />
          </main>
        </div>
      </div>
  )
}

export default CashFlow
