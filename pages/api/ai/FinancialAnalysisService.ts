import { HfInference } from "@huggingface/inference"
import CashflowService from "../cashflow/services/CashflowService"
import prisma from "@/lib/prisma"

export class FinancialAnalysisService {
  private model: HfInference

  constructor() {
    this.model = new HfInference(process.env.HUGGINGFACE_API_KEY)
  }

  async analyzeUserFinances(userId: string | number) {
    try {
      const userIdNumber = Number(userId)
      if (isNaN(userIdNumber)) {
        throw new Error('ID do usuário inválido')
      }

      const orcamentos = await prisma.orcamento.findMany({
        where: { userId: userIdNumber },
        orderBy: { mes: 'asc' }
      })

      if (orcamentos.length === 0) {
        throw new Error('Nenhum orçamento encontrado. Para realizar a análise IA, é necessário ter fluxos de caixa cadastrados.')
      }

      const transacoes = await prisma.transacoes.findMany({
        where: { userId: userIdNumber }
      })

      if (transacoes.length === 0) {
        throw new Error('Nenhuma transação encontrada. Para realizar a análise IA, é necessário ter transações cadastradas.')
      }

      const response = await CashflowService.getFlow(userIdNumber)
      let flows: any[] = []

      if (Array.isArray(response)) {
        flows = response
      } else if (typeof response === 'object' && response !== null) {
        flows = Object.values(response)
      } else {
        throw new Error('Formato de resposta inválido. Esperado um array ou objeto.')
      }

      if (flows.length === 0) {
        throw new Error('Não há fluxos de caixa cadastrados. Para realizar a análise, é necessário ter fluxos de caixa criados.')
      }

      const prompt = this.generateAnalysisPrompt(flows)
      //t5 gratuito mas ao escalar vou usar o claude
      try {
        const analysis = await this.model.textGeneration({
          model: "google/flan-t5-large",
          inputs: prompt,
          parameters: {
            max_new_tokens: 250,
            temperature: 0.7,
            top_p: 0.9,
            do_sample: true,
            num_return_sequences: 1,
            repetition_penalty: 1.1
          }
        })

        // Se a resposta for muito curta ou incompleta vai usar a análise básica
        if (!analysis.generated_text || analysis.generated_text.length < 100) {
          return {
            analysis: this.generateBasicAnalysis(flows),
            flows: flows
          }
        }

        return {
          analysis: analysis.generated_text,
          flows: flows
        }
      } catch (error) {
        console.log('Erro na geração do texto:', error)
        return {
          analysis: this.generateBasicAnalysis(flows),
          flows: flows
        }
      }
    } catch (error: any) {
      console.error('Erro durante a análise:', error)
      if (error?.name === 'PrismaClientValidationError') {
        throw new Error('Dados inválidos fornecidos para a análise')
      }
      if (error?.name === 'PrismaClientKnownRequestError') {
        throw new Error('Erro ao acessar o banco de dados')
      }
      throw error
    }
  }

  private generateBasicAnalysis(flows: any[]): string {
    try {
      const melhorMes = flows.reduce((a, b) =>
        a.gapMoney > b.gapMoney ? a : b
      )
      const piorMes = flows.reduce((a, b) => (a.gapMoney < b.gapMoney ? a : b))

      const analisesMensais = flows
        .sort((a, b) => a.mes - b.mes)
        .map(
          (mes) =>
            `- ${mes.nome}/2024: Saldo realizado R$ ${mes.saldoRealizado.toFixed(
              2
            )} vs orçado R$ ${mes.saldoOrcado.toFixed(2)} (${
              mes.status
            } de ${mes.gapMoney.toFixed(2)})`
        )
        .join("\n")

      // Análise dos status dos meses
      const statusMeses = flows.map(f => f.status)
      const todosExcedentes = statusMeses.every(s => s === 'Excedente')
      const todosDéficit = statusMeses.every(s => s === 'Déficit')
      const statusMisto = !todosExcedentes && !todosDéficit

      // Análise de tendências
      const tendenciaGap = flows
        .sort((a, b) => a.mes - b.mes)
        .map(f => f.gapMoney)
      const tendenciaRedução = tendenciaGap.every((gap, i) => 
        i === 0 || gap <= tendenciaGap[i - 1]
      )

      return `[ANÁLISE]
${analisesMensais}

Destaques:
- Melhor desempenho: ${melhorMes.nome}/2024 com saldo realizado de R$ ${melhorMes.saldoRealizado.toFixed(
        2
      )} vs orçado R$ ${melhorMes.saldoOrcado.toFixed(2)}
- Desempenho mais desafiador: ${piorMes.nome}/2024 com saldo realizado de R$ ${piorMes.saldoRealizado.toFixed(
        2
      )} vs orçado R$ ${piorMes.saldoOrcado.toFixed(2)}

[PONTOS FORTES E FRACOS]
Pontos Fortes:
${todosExcedentes ? '- Todos os meses apresentaram status excedente' : 
  statusMisto ? '- Alguns meses apresentaram resultados positivos' :
  '- Oportunidade de melhoria na gestão financeira'}
${melhorMes.gapMoney > 0 ? '- Boa performance na realização de receitas no melhor mês' : ''}
${flows.some(f => f.saldoRealizado > f.saldoOrcado) ? '- Alguns meses superaram as expectativas orçadas' : ''}

Pontos Fracos:
${todosDéficit ? '- Todos os meses apresentaram déficit' :
  statusMisto ? '- Resultados inconsistentes entre os meses' : ''}
- Variação significativa entre valores orçados e realizados
- Necessidade de melhor previsibilidade
${tendenciaRedução ? '- Tendência de redução no gap ao longo dos meses' : ''}

[RECOMENDAÇÕES]
1. Revisar metodologia de orçamentação para maior precisão
2. Manter controle sobre despesas realizadas
3. Estabelecer metas mais realistas para receitas e despesas
4. Investigar razões da variação entre orçado e realizado
5. Implementar sistema de acompanhamento mensal mais detalhado`
    } catch (error) {
      return "Não foi possível gerar a análise. Por favor, tente novamente."
    }
  }

  private extractAnalysisFromResponse(response: string): string {
    const analysisStart = response.indexOf("[ANÁLISE]")
    if (analysisStart === -1) {
      return response
    }
    return response.slice(analysisStart)
  }

  private generateAnalysisPrompt(flows: any[]): string {
    const monthlyAnalysis = flows
      .sort((a, b) => (a.ano !== b.ano ? a.ano - b.ano : a.mes - b.mes))
      .map(
        (flow) => `
Mês: ${flow.nome}/${flow.ano}
Orçado: Receita R$ ${flow.receitaOrcada.toFixed(
          2
        )} | Despesa R$ ${flow.despesaOrcada.toFixed(
          2
        )} | Saldo R$ ${flow.saldoOrcado.toFixed(2)}
Realizado: Receita R$ ${flow.receitaRealizada.toFixed(
          2
        )} | Despesa R$ ${flow.despesaRealizada.toFixed(
          2
        )} | Saldo R$ ${flow.saldoRealizado.toFixed(2)}
Comparativo: Diferença R$ ${flow.gapMoney.toFixed(2)} (${(
          flow.gapPercentage * 100
        ).toFixed(2)}%) | Status: ${flow.status}

`
      )
      .join("\n\n")

    return `Você é um analista financeiro experiente. Analise os seguintes dados financeiros mensais:

${monthlyAnalysis}

Responda em português do Brasil, seguindo estritamente este formato:

[ANÁLISE]
- Analise cada mês individualmente
- Compare os saldos realizados com os orçados
- Identifique os meses com melhor e pior desempenho

[PONTOS FORTES E FRACOS]
- Liste os principais pontos fortes encontrados
- Liste os principais pontos fracos identificados
- Descreva as tendências observadas no período

[RECOMENDAÇÕES]
1. Estratégias para manter/melhorar os resultados positivos
2. Ações para corrigir os pontos negativos
3. Sugestões para melhorar o planejamento futuro`
  }
}
