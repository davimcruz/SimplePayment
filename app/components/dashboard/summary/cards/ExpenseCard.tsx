import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { MoveDownRight } from "lucide-react"

interface ExpenseCardProps {
  monthlyExpense: string
  monthlyExpenseMessage: string
  annualExpense: string
  annualExpenseMessage: string
}

const ExpenseCard: React.FC<ExpenseCardProps> = ({
  monthlyExpense,
  monthlyExpenseMessage,
  annualExpense,
  annualExpenseMessage,
}) => {
  return (
    <Card className="bg-gradient-to-br from-background/10 to-primary/10">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Despesas</CardTitle>
        <MoveDownRight className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{monthlyExpense}</div>
        <p className="text-xs text-muted-foreground">{monthlyExpenseMessage}</p>
        {/* <div className="mt-2 text-sm font-semibold">{annualExpense}</div>
        <p className="text-xs text-muted-foreground">
          {annualExpenseMessage}
        </p> */}
      </CardContent>
    </Card>
  )
}

export default ExpenseCard
