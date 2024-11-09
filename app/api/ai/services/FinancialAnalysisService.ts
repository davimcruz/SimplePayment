import Anthropic from "@anthropic-ai/sdk"
import CashflowService from "@/app/api/cashflow/services/CashflowService"
import prisma from "@/lib/prisma"

/**
 * Serviço responsável pela análise financeira usando IA (Claude 3.5)
 */
export class FinancialAnalysisService {
  private model: Anthropic
  private readonly MAX_MONTHS = 6 // Limita análise aos últimos 3 meses

  constructor() {
    this.model = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  /**
   * Analisa as finanças do usuário usando dados de orçamentos e transações
   * @param userId - ID do usuário para análise
   * @returns Objeto contendo a análise e os fluxos financeiros
   */
  async analyzeUserFinances(userId: string | number) {
    console.time("Total Analysis Time")
    try {
      console.time("1. User ID Validation")
      const userIdNumber = Number(userId)
      if (isNaN(userIdNumber)) {
        throw new Error("ID do usuário inválido")
      }
      console.timeEnd("1. User ID Validation")

      console.time("2. Date Calculation")
      const today = new Date()
      const threeMonthsAgo = new Date(
        today.getFullYear(),
        today.getMonth() - this.MAX_MONTHS,
        today.getDate()
      )
      const dateLimit = `${String(threeMonthsAgo.getDate()).padStart(
        2,
        "0"
      )}-${String(threeMonthsAgo.getMonth() + 1).padStart(
        2,
        "0"
      )}-${threeMonthsAgo.getFullYear()}`
      console.timeEnd("2. Date Calculation")

      console.time("3. Database Queries")
      const [orcamentos, transacoes] = await Promise.all([
        prisma.orcamento.findMany({
          where: {
            userId: userIdNumber,
            mes: {
              gte: new Date().getMonth() - this.MAX_MONTHS + 1,
            },
          },
          orderBy: { mes: "asc" },
          take: this.MAX_MONTHS,
        }),
        prisma.transacoes.findMany({
          where: {
            userId: userIdNumber,
            data: {
              gte: dateLimit,
            },
          },
          take: 100,
          orderBy: {
            data: "desc",
          },
        }),
      ])
      console.timeEnd("3. Database Queries")

      if (!orcamentos.length || !transacoes.length) {
        throw new Error("Dados insuficientes para análise")
      }

      console.time("4. Get Flows")
      const flows = await CashflowService.getFlow(userIdNumber)
      if (!flows || !Array.isArray(flows) || !flows.length) {
        throw new Error("Fluxos de caixa não encontrados")
      }
      console.timeEnd("4. Get Flows")

      console.time("5. Process Recent Flows")
      const recentFlows = flows
        .sort((a, b) => a.mes - b.mes)
        .slice(0, this.MAX_MONTHS)
      console.timeEnd("5. Process Recent Flows")

      try {
        console.time("6. Claude API Call")
        const message = await this.model.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 1000,
          temperature: 0.1,
          messages: [
            {
              role: "user",
              content: this.generatePrompt(recentFlows),
            },
          ],
        })
        console.timeEnd("6. Claude API Call")

        if (!message.content[0] || message.content[0].type !== "text") {
          throw new Error("Resposta inválida")
        }

        console.timeEnd("Total Analysis Time")
        return {
          analysis: (message.content[0] as { type: "text"; text: string }).text,
          flows: recentFlows,
        }
      } catch (error) {
        console.log("Erro na geração do texto:", error)
        console.time("7. Fallback Analysis")
        const result = {
          analysis: await this.generateBasicAnalysis(recentFlows),
          flows: recentFlows,
        }
        console.timeEnd("7. Fallback Analysis")
        return result
      }
    } catch (error: any) {
      console.error("Erro durante a análise:", error)
      throw error
    } finally {
      console.timeEnd("Total Analysis Time")
    }
  }

  /**
   * Gera uma análise básica em caso de falha na análise principal
   * @param flows - Array de fluxos financeiros
   * @returns String contendo análise básica
   */
  private async generateBasicAnalysis(flows: any[]): Promise<string> {
    try {
      const message = await this.model.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 500,
        temperature: 0.1,
        messages: [
          {
            role: "user",
            content: `Análise resumida dos últimos ${flows.length} meses:
${flows
  .map((f) => `${f.nome}: Saldo R$ ${f.saldoRealizado.toFixed(2)}`)
  .join("\n")}
Forneça 3 pontos fortes, 3 fracos e 3 recomendações.`,
          },
        ],
      })

      if (!message.content[0] || message.content[0].type !== "text") {
        return "Análise indisponível."
      }

      return (message.content[0] as { type: "text"; text: string }).text
    } catch (error) {
      return "Não foi possível gerar a análise."
    }
  }

  // Separei geração do prompt em método próprio
  private generatePrompt(flows: any[]): string {
    return `Analise estes dados financeiros mensais de forma concisa, começando do mês mais antigo para o mais recente:

${flows
  .map(
    (flow) => `
${flow.nome}/${flow.ano}:
Receitas: Orçado R$ ${flow.receitaOrcada.toFixed(
      2
    )} | Realizado R$ ${flow.receitaRealizada.toFixed(2)}
Despesas: Orçado R$ ${flow.despesaOrcada.toFixed(
      2
    )} | Realizado R$ ${flow.despesaRealizada.toFixed(2)}
Saldo: R$ ${flow.saldoRealizado.toFixed(2)} (${
      flow.status
    } de R$ ${flow.gapMoney.toFixed(2)})`
  )
  .join("\n")}

[ANÁLISE]
Apresente a análise na ordem cronológica (do mais antigo para o mais recente):
${flows.map((f) => f.nome + "/" + f.ano + ":").join("\n")}
- Análise da receita
- Análise da despesa
- Impacto no saldo

[PONTOS FORTES E FRACOS]
Pontos Fortes:
- 3 pontos principais

Pontos Fracos:
- 3 pontos principais

[RECOMENDAÇÕES]
1-5: Cinco recomendações objetivas`
  }
}
