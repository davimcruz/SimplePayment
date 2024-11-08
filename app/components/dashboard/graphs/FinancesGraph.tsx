import { useState, useEffect } from "react"
import BarChartComponent from "./charts/bar-chart"
import { Skeleton } from "../../ui/skeleton"

const FinancesGraph = () => {
  const [loading, setLoading] = useState(true)
  const [key, setKey] = useState(0)

  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [])

  useEffect(() => {
    const handleTransactionUpdate = () => {
      setLoading(true)
      setKey((prev) => prev + 1)
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }

    window.addEventListener("updateTransactions", handleTransactionUpdate)
    return () => {
      window.removeEventListener("updateTransactions", handleTransactionUpdate)
    }
  }, [])

  return (
    <div className="h-full flex flex-col">
      {loading ? (
        <Skeleton className="h-full w-full" />
      ) : (
        <div className="flex-1 flex flex-col pb-12 md:pb-0">
          <BarChartComponent key={key} />
        </div>
      )}
    </div>
  )
}

export default FinancesGraph
