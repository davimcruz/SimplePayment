interface Flow {
  nome: string
  ano: number
  mes: number
  saldoOrcado: number
  saldoRealizado: number
  gapMoney: number
  gapPercentage: number
  status: string
}

interface AnalysisResultProps {
  data: Flow[]
  aiAnalysis: string
}

const AnalysisResult = ({ data, aiAnalysis }: AnalysisResultProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  const extractAnalysisParts = (analysis: string) => {
    const parts = {
      situacao: '',
      pontos: '',
      recomendacoes: ''
    }

    try {
      const analiseMatch = analysis.match(/\[ANÁLISE\]([\s\S]*?)(?=\[PONTOS FORTES E FRACOS\]|$)/)
      parts.situacao = analiseMatch ? analiseMatch[1].trim() : 'Análise não disponível'

      const pontosMatch = analysis.match(/\[PONTOS FORTES E FRACOS\]([\s\S]*?)(?=\[RECOMENDAÇÕES\]|$)/)
      parts.pontos = pontosMatch ? pontosMatch[1].trim() : 'Análise não disponível'

      const recomendacoesMatch = analysis.match(/\[RECOMENDAÇÕES\]([\s\S]*?)$/)
      parts.recomendacoes = recomendacoesMatch ? recomendacoesMatch[1].trim() : 'Análise não disponível'

    } catch (error) {
      console.error('Erro ao extrair partes da análise:', error)
      return {
        situacao: 'Análise não disponível',
        pontos: 'Análise não disponível',
        recomendacoes: 'Análise não disponível'
      }
    }

    return parts
  }

  const analysisParts = extractAnalysisParts(aiAnalysis)

  if (!data || data.length === 0) {
    return (
      <div className="p-4 bg-black/40 rounded-lg border border-emerald-500/20">
        <p className="text-emerald-400">
          Não há dados financeiros suficientes para análise. O usuário precisa ter pelo menos um mês de dados orçados e realizados.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Tabela de Comparação de Saldos */}
      <div className="bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-emerald-500/20">
        <h3 className="text-xl font-semibold mb-4 text-emerald-400">
          Comparativo de Saldos
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-emerald-400/80 text-sm">
                <th className="text-left py-2">Mês/Ano</th>
                <th className="text-left py-2">Saldo Orçado</th>
                <th className="text-left py-2">Saldo Realizado</th>
                <th className="text-left py-2">Gap (R$)</th>
                <th className="text-left py-2">Gap (%)</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {data
                .sort((a, b) => a.ano !== b.ano ? a.ano - b.ano : a.mes - b.mes)
                .map((flow, index) => (
                <tr key={index} className="border-t border-emerald-500/20">
                  <td className="py-3 text-white/80">{flow.nome}/{flow.ano}</td>
                  <td className="py-3 text-white/80">{formatCurrency(flow.saldoOrcado)}</td>
                  <td className="py-3 text-white/80">{formatCurrency(flow.saldoRealizado)}</td>
                  <td className="py-3 text-white/80">{formatCurrency(flow.gapMoney)}</td>
                  <td className="py-3 text-white/80">{formatPercentage(flow.gapPercentage)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      flow.status === 'excedente' ? 'bg-emerald-500/20 text-emerald-400' :
                      flow.status === 'deficit' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {flow.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Análise da IA */}
      <div className="bg-black/40 backdrop-blur-sm p-6 rounded-xl border border-emerald-500/20">
        <h3 className="text-xl font-semibold mb-6 text-emerald-400">
          Análise Detalhada (IA)
        </h3>
        <div className="space-y-6">
          <div className="p-4 bg-black/40 rounded-lg border border-emerald-500/20">
            <h4 className="text-emerald-400 font-medium mb-2">Situação Atual e Tendências</h4>
            <p className="text-white/80 leading-relaxed whitespace-pre-line">
              {analysisParts.situacao || 'Análise não disponível'}
            </p>
          </div>

          <div className="p-4 bg-black/40 rounded-lg border border-emerald-500/20">
            <h4 className="text-emerald-400 font-medium mb-2">Pontos Fortes e Fracos</h4>
            <p className="text-white/80 leading-relaxed whitespace-pre-line">
              {analysisParts.pontos || 'Análise não disponível'}
            </p>
          </div>

          <div className="p-4 bg-black/40 rounded-lg border border-emerald-500/20">
            <h4 className="text-emerald-400 font-medium mb-2">Recomendações</h4>
            <p className="text-white/80 leading-relaxed whitespace-pre-line">
              {analysisParts.recomendacoes || 'Análise não disponível'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalysisResult
