import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import BarChartComponent from "./charts/bar-chart"
import { Skeleton } from "../../ui/skeleton"
import CreateTransaction from "../create-transactions/CreateTransactions"

const FinancesGraph = () => {
  const [loading, setLoading] = useState(true)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [key, setKey] = useState(0)

  function getCurrentYear() {
    return new Date().getFullYear()
  }

  const year = getCurrentYear()

  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [])

  useEffect(() => {
    const handleTransactionUpdate = () => {
      setLoading(true)
      setKey(prev => prev + 1)
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }

    window.addEventListener('updateTransactions', handleTransactionUpdate)

    return () => {
      window.removeEventListener('updateTransactions', handleTransactionUpdate)
    }
  }, [])

  return (
    <Card className="bg-gradient-to-t from-background/10 to-primary/[5%]">
      <CardHeader>
        <CardTitle>Resumo Gráfico Comparativo ({year})</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col justify-center items-center">
        {loading ? (
          <Skeleton className="h-[300px] w-full md:h-[400px]" />
        ) : (
          <div className="w-full h-[300px] md:h-[400px] relative">
            <BarChartComponent key={key} />
            <CreateTransaction 
              isOpen={isTransactionDialogOpen}
              onOpenChange={setIsTransactionDialogOpen}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default FinancesGraph
