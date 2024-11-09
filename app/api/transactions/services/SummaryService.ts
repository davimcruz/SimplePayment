import prisma from "@/lib/prisma"
import redis from "@/lib/cache/redis"

interface SummaryData {
  annualIncome: string
  annualIncomeMessage: string
  annualExpense: string
  annualExpenseMessage: string
  annualBalance: string
  annualBalanceMessage: string
  monthlyIncome: string
  monthlyIncomeMessage: string
  monthlyExpense: string
  monthlyExpenseMessage: string
  monthlyBalance: string
  monthlyBalanceMessage: string
}

class SummaryService {
  private readonly CACHE_TTL = 3600
  private readonly monthNames = [
    "janeiro", "fevereiro", "março", "abril",
    "maio", "junho", "julho", "agosto",
    "setembro", "outubro", "novembro", "dezembro"
  ]

  async getSummary(userId: number): Promise<SummaryData> {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1

    const cacheKey = `summary:${userId}:${currentYear}`
    const cachedData = await redis.get(cacheKey)

    if (cachedData) {
      return JSON.parse(cachedData)
    }

    const transactions = await prisma.transacoes.findMany({
      where: {
        userId,
        data: {
          endsWith: `-${currentYear}`,
        },
      },
      select: {
        data: true,
        valor: true,
        tipo: true,
      },
    })

    let annualIncome = 0
    let annualExpense = 0
    let monthlyIncome = 0
    let monthlyExpense = 0

    transactions.forEach((transaction) => {
      const value = parseFloat(transaction.valor.toString())
      if (isNaN(value)) {
        console.warn(`Valor inválido encontrado: ${transaction.valor}`)
        return
      }

      if (transaction.data) {
        const [day, month, year] = transaction.data.split("-")
        
        if (transaction.tipo === "receita") {
          annualIncome += value
          if (parseInt(month) === currentMonth && parseInt(year) === currentYear) {
            monthlyIncome += value
          }
        } else if (transaction.tipo === "despesa") {
          annualExpense += value
          if (parseInt(month) === currentMonth && parseInt(year) === currentYear) {
            monthlyExpense += value
          }
        }
      }
    })

    const annualBalance = annualIncome - annualExpense
    const monthlyBalance = monthlyIncome - monthlyExpense
    const currentMonthName = this.monthNames[currentMonth - 1]

    const summaryData: SummaryData = {
      annualIncome: annualIncome.toFixed(2),
      annualIncomeMessage: `Total de receitas para o ano de ${currentYear}`,
      annualExpense: annualExpense.toFixed(2),
      annualExpenseMessage: `Total de despesas para o ano de ${currentYear}`,
      annualBalance: annualBalance.toFixed(2),
      annualBalanceMessage: `Saldo total para o ano de ${currentYear}`,
      monthlyIncome: monthlyIncome.toFixed(2),
      monthlyIncomeMessage: `Total de receitas para o mês de ${currentMonthName}`,
      monthlyExpense: monthlyExpense.toFixed(2),
      monthlyExpenseMessage: `Total de despesas para o mês de ${currentMonthName}`,
      monthlyBalance: monthlyBalance.toFixed(2),
      monthlyBalanceMessage: `Saldo total para o mês de ${currentMonthName}`,
    }

    await redis.set(cacheKey, JSON.stringify(summaryData), "EX", this.CACHE_TTL)

    return summaryData
  }
}

export default new SummaryService()
