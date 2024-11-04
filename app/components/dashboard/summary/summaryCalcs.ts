import { GetServerSideProps } from "next"
import { useEffect } from "react"

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export const fetchSummaryData = async () => {
  try {
    const response = await fetch(
      `/api/transactions/get-summary`
    )

    if (!response.ok) {
      throw new Error("Erro ao buscar dados da API")
    }

    const data = await response.json()

    return {
      monthlyIncome: formatCurrency(parseFloat(data.monthlyIncome) ?? 0),
      monthlyIncomeMessage: data.monthlyIncomeMessage ?? '',
      monthlyExpense: formatCurrency(parseFloat(data.monthlyExpense) ?? 0),
      monthlyExpenseMessage: data.monthlyExpenseMessage ?? '',
      annualIncome: formatCurrency(parseFloat(data.annualIncome) ?? 0),
      annualIncomeMessage: data.annualIncomeMessage ?? '',
      annualExpense: formatCurrency(parseFloat(data.annualExpense) ?? 0),
      annualExpenseMessage: data.annualExpenseMessage ?? '',
      annualBalance: formatCurrency(parseFloat(data.annualBalance) ?? 0),
      annualBalanceMessage: data.annualBalanceMessage ?? '',
    }
  } catch (error) {
    console.error("Erro ao buscar o resumo anual:", error)
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().toLocaleString('default', { month: 'long' })
    return {
      monthlyIncome: formatCurrency(0),
      monthlyIncomeMessage: `Total de receitas para o mês de ${currentMonth}`,
      monthlyExpense: formatCurrency(0),
      monthlyExpenseMessage: `Total de despesas para o mês de ${currentMonth}`,
      annualIncome: formatCurrency(0),
      annualIncomeMessage: `Total de receitas para o ano de ${currentYear}`,
      annualExpense: formatCurrency(0),
      annualExpenseMessage: `Total de despesas para o ano de ${currentYear}`,
      annualBalance: formatCurrency(0),
      annualBalanceMessage: `Saldo total para o ano de ${currentYear}`,
    }
  }
}

export const getServerSideProps: GetServerSideProps = async () => {
  const initialData = await fetchSummaryData()

  return {
    props: { initialData },
  }
}

// Adicionar um hook para ouvir o evento de atualização
export const useSummaryUpdate = (
  setSummaryData: (data: ReturnType<typeof fetchSummaryData> extends Promise<infer T> ? T : never) => void
) => {
  useEffect(() => {
    const handleTransactionUpdate = async () => {
      const newData = await fetchSummaryData()
      setSummaryData(newData)
    }

    window.addEventListener('updateTransactions', handleTransactionUpdate)

    return () => {
      window.removeEventListener('updateTransactions', handleTransactionUpdate)
    }
  }, [setSummaryData])
}
