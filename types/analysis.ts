export interface Flow {
  nome: string
  ano: number
  mes: number
  saldoOrcado: number
  saldoRealizado: number
  gapMoney: number
  gapPercentage: number
  status: string
}

export interface AnalysisResultData {
  flows: Flow[]
} 