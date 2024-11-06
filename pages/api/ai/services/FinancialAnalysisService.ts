import Anthropic from '@anthropic-ai/sdk'
import CashflowService from "../../cashflow/services/CashflowService"
import prisma from "@/lib/prisma"

/**
 * Serviço responsável pela análise financeira usando IA (Claude 3.5)
 */
export class FinancialAnalysisService {
  private model: Anthropic

  constructor() {
    this.model = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })
  }

  /**
   * Analisa as finanças do usuário usando dados de orçamentos e transações
   * @param userId - ID do usuário para análise
   * @returns Objeto contendo a análise e os fluxos financeiros
   */
  async analyzeUserFinances(userId: string | number) {
    try {
      // Validação do ID do usuário
      const userIdNumber = Number(userId)
      if (isNaN(userIdNumber)) {
        throw new Error("ID do usuário inválido")
      }

      // Busca orçamentos do usuário
      const orcamentos = await prisma.orcamento.findMany({
        where: { userId: userIdNumber },
        orderBy: { mes: "asc" },
      })

      // Validação de orçamentos
      if (orcamentos.length === 0) {
        throw new Error(
          "Nenhum orçamento encontrado. Para realizar a análise IA, é necessário ter fluxos de caixa cadastrados."
        )
      }

      // Busca transações do usuário
      const transacoes = await prisma.transacoes.findMany({
        where: { userId: userIdNumber },
      })

      // Validação de transações
      if (transacoes.length === 0) {
        throw new Error(
          "Nenhuma transação encontrada. Para realizar a analise IA, é necessário ter transações cadastradas."
        )
      }

      // Obtém fluxos de caixa processados
      const response = await CashflowService.getFlow(userIdNumber)
      let flows: any[] = []

      // Normaliza o formato dos fluxos
      if (Array.isArray(response)) {
        flows = response
      } else if (typeof response === "object" && response !== null) {
        flows = Object.values(response)
      } else {
        throw new Error("Formato de resposta inválido")
      }

      // Validação dos fluxos
      if (flows.length === 0) {
        throw new Error(
          "Não há fluxos de caixa cadastrados. Para realizar a análise, é necessário ter fluxos de caixa criados."
        )
      }

      try {
        // Chamada à API do Claude 3.5
        console.log("4. Chamando Claude 3.5...")
        const message = await this.model.messages.create({
          model: "claude-3-sonnet-20240229",
          max_tokens: 1000,
          temperature: 0.1,
          messages: [{
            role: "user",
            // Prompt estruturado para análise detalhada
            content: `Analise estes dados financeiros mensais:

${flows.sort((a, b) => a.mes - b.mes).map(flow => `
${flow.nome}/${flow.ano}:
Receitas: Orçado R$ ${flow.receitaOrcada.toFixed(2)} | Realizado R$ ${flow.receitaRealizada.toFixed(2)}
Despesas: Orçado R$ ${flow.despesaOrcada.toFixed(2)} | Realizado R$ ${flow.despesaRealizada.toFixed(2)}
Saldo Final: R$ ${flow.saldoRealizado.toFixed(2)} (${flow.status} de R$ ${flow.gapMoney.toFixed(2)})`).join('\n\n')}

Forneça uma análise financeira detalhada no seguinte formato:

[ANÁLISE]
Outubro/2024:
- Análise da receita (compare orçado vs realizado)
- Análise da despesa (compare orçado vs realizado)
- Impacto no saldo final

(Repetir mesmo formato para Novembro e Dezembro)

[PONTOS FORTES E FRACOS]
Pontos Fortes:
- 3 pontos fortes específicos analisando receitas, despesas e saldos

Pontos Fracos:
- 3 pontos fracos específicos analisando receitas, despesas e saldos

[RECOMENDAÇÕES]
1. Recomendação sobre gestão de receitas
2. Recomendação sobre controle de despesas
3. Recomendação sobre planejamento orçamentário
4. Recomendação sobre gestão de saldo
5. Recomendação geral para melhoria`
          }]
        })

        // Validação da resposta do Claude
        if (!message.content[0] || message.content[0].type !== 'text') {
          throw new Error('Resposta inválida do Claude')
        }

        // Retorna análise completa
        return {
          analysis: message.content[0].text,
          flows: flows,
        }

      } catch (error) {
        // Fallback para análise básica em caso de erro
        console.log("7. Erro na geração do texto:", error)
        return {
          analysis: await this.generateBasicAnalysis(flows),
          flows: flows,
        }
      }
    } catch (error: any) {
      // Tratamento de erros específicos do Prisma
      console.error("Erro durante a análise:", error)
      if (error?.name === "PrismaClientValidationError") {
        throw new Error("Dados inválidos fornecidos para a análise")
      }
      if (error?.name === "PrismaClientKnownRequestError") {
        throw new Error("Erro ao acessar o banco de dados")
      }
      throw error
    }
  }

  /**
   * Gera uma análise básica em caso de falha na análise principal
   * @param flows - Array de fluxos financeiros
   * @returns String contendo análise básica
   */
  private async generateBasicAnalysis(flows: any[]): Promise<string> {
    try {
      // Identifica melhor e pior mês baseado no gap
      const melhorMes = flows.reduce((a, b) => a.gapMoney > b.gapMoney ? a : b)
      const piorMes = flows.reduce((a, b) => a.gapMoney < b.gapMoney ? a : b)

      // Gera análise simplificada
      const message = await this.model.messages.create({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        temperature: 0.1,
        messages: [{
          role: "user",
          content: `Analise estes resultados financeiros:

Melhor mês: ${melhorMes.nome} (saldo: R$ ${melhorMes.saldoRealizado.toFixed(2)})
Pior mês: ${piorMes.nome} (saldo: R$ ${piorMes.saldoRealizado.toFixed(2)})

Forneça uma análise resumida com pontos fortes, fracos e recomendações.`
        }]
      })

      // Retorna texto da análise ou mensagem de erro
      return message.content[0].type === 'text' 
        ? (message.content[0] as { type: 'text', text: string }).text
        : 'Não foi possível gerar a análise.'

    } catch (error) {
      console.error("Erro na análise básica:", error)
      return "Não foi possível gerar a análise. Por favor, tente novamente."
    }
  }
}
