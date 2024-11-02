import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import BarChartComponent from "./charts/bar-chart"
import { Skeleton } from "../../ui/skeleton"
import { Button } from "@/app/components/ui/button"
import { PlusCircle } from "lucide-react"
import CreateTransaction from "@/app/components/sidebar/CreateTransactions"

const FinancesGraph = () => {
  const [loading, setLoading] = useState(true)
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)

  function getCurrentYear() {
    return new Date().getFullYear()
  }

  const year = getCurrentYear()

  useEffect(() => {
    // Simular um tempo de carregamento mínimo
    setTimeout(() => {
      setLoading(false)
    }, 500)
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
            <BarChartComponent />
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
