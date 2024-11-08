import { NextApiRequest, NextApiResponse } from "next"
import { verifyTokenFromRequest } from "@/pages/api/middleware/jwt-auth"
import { createTransactionSchema, createParcelsSchema } from "@/lib/validation"
import TransactionService from "../services/TransactionService"
import ParcelService from "../services/ParcelService"
import prisma from "@/lib/prisma"
import redis from "@/lib/cache/redis"
import { parseCookies } from "nookies"
import SummaryService from "../services/SummaryService"
import ViewService from "../services/ViewService"
interface ErrorWithStatus extends Error {
  status?: number
}

class TransactionController {
  private readonly CACHE_TTL = 3600

  async createTransaction(req: NextApiRequest, res: NextApiResponse) {
    try {
      const tokenValid = verifyTokenFromRequest(req as any)
      if (!tokenValid) {
        return res.status(401).json({ error: "[ERRO] Não autorizado" })
      }

      const parsedBody = createTransactionSchema.safeParse(req.body)
      if (!parsedBody.success) {
        return res.status(400).json({
          error: "[ERRO] Dados inválidos",
          details: parsedBody.error.flatten().fieldErrors,
        })
      }

      const user = await this.getUserWithCache(parsedBody.data.email)
      if (!user) {
        return res.status(404).json({ error: "[ERRO] Usuário não encontrado" })
      }

      const result = await TransactionService.create(parsedBody.data, user.id)

      return res.status(200).json({
        message: "[SUCESSO] Transação criada com sucesso",
        ...result,
      })
    } catch (error) {
      console.error("Erro ao criar transação:", error)
      const typedError = error as ErrorWithStatus
      return res.status(typedError.status || 500).json({
        error: typedError.message || "[ERRO] Erro ao criar transação",
        details:
          typedError instanceof Error
            ? typedError.message
            : "Erro interno do servidor",
      })
    }
  }

  async createParcels(req: NextApiRequest, res: NextApiResponse) {
    try {
      const tokenValid = verifyTokenFromRequest(req as any)
      if (!tokenValid) {
        return res.status(401).json({ error: "[ERRO] Não autorizado" })
      }

      const parsedBody = createParcelsSchema.safeParse(req.body)
      if (!parsedBody.success) {
        return res.status(400).json({
          error: "[ERRO] Dados inválidos",
          details: parsedBody.error.flatten().fieldErrors,
        })
      }

      const user = await this.getUserWithCache(parsedBody.data.email)
      if (!user) {
        return res.status(404).json({ error: "[ERRO] Usuário não encontrado" })
      }

      const serviceData = {
        ...parsedBody.data,
        userId: user.id,
        detalhesFonte: parsedBody.data.detalhesFonte || undefined,
      }

      const result = await ParcelService.createParcels(serviceData)

      return res.status(200).json({
        message: "[SUCESSO] Parcelas criadas com sucesso",
        ...result,
      })
    } catch (error) {
      console.error("Erro ao criar parcelas:", error)
      const typedError = error as ErrorWithStatus
      return res.status(typedError.status || 500).json({
        error: typedError.message || "[ERRO] Erro ao criar parcelas",
        details:
          typedError instanceof Error
            ? typedError.message
            : "Erro interno do servidor",
      })
    }
  }

  private async getUserWithCache(email: string) {
    const cacheKey = `user:${email}`
    const cachedUser = await redis.get(cacheKey)

    if (cachedUser) {
      return JSON.parse(cachedUser)
    }

    const user = await prisma.usuarios.findUnique({
      where: { email },
      select: { id: true },
    })

    if (user) {
      await redis.setex(cacheKey, this.CACHE_TTL, JSON.stringify(user))
    }

    return user
  }

  async getTransactions(req: NextApiRequest, res: NextApiResponse) {
    try {
      const tokenValid = verifyTokenFromRequest(req as any)
      if (!tokenValid) {
        return res.status(401).json({ error: "[ERRO] Não autorizado" })
      }

      const cookies = parseCookies({ req })
      const userId = Number(cookies.userId)

      if (!userId || isNaN(userId)) {
        return res.status(400).json({
          error: "[ERRO] ID de usuário inválido ou não encontrado nos cookies",
        })
      }

      const transactions = await TransactionService.getTransactions(userId)
      return res.status(200).json(transactions)
    } catch (error) {
      console.error("Erro ao buscar transações:", error)
      const typedError = error as ErrorWithStatus
      return res.status(typedError.status || 500).json({
        error: typedError.message || "[ERRO] Erro ao buscar transações",
        details:
          typedError instanceof Error
            ? typedError.message
            : "Erro interno do servidor",
      })
    }
  }

  async deleteTransaction(req: NextApiRequest, res: NextApiResponse) {
    try {
      const tokenValid = verifyTokenFromRequest(req as any)
      if (!tokenValid) {
        return res.status(401).json({ error: "[ERRO] Não autorizado" })
      }

      if (req.method !== "POST") {
        return res.status(405).json({ error: "[ERRO] Método não permitido" })
      }

      const { transactionId } = req.body

      if (!transactionId || typeof transactionId !== "string") {
        return res.status(400).json({ error: "[ERRO] Transaction ID inválido" })
      }

      const result = await TransactionService.delete(transactionId)

      return res.status(200).json(result)
    } catch (error) {
      console.error("Erro ao deletar transação:", error)
      const typedError = error as ErrorWithStatus
      return res.status(typedError.status || 500).json({
        error: typedError.message || "[ERRO] Erro ao deletar transação",
        details:
          typedError instanceof Error
            ? typedError.message
            : "Erro interno do servidor",
      })
    }
  }

  async getComparison(req: NextApiRequest, res: NextApiResponse) {
    try {
      const tokenValid = verifyTokenFromRequest(req as any)
      if (!tokenValid) {
        return res.status(401).json({ error: "[ERRO] Não autorizado" })
      }

      const cookies = parseCookies({ req })
      const userId = Number(cookies.userId)

      if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: "[ERRO] ID de usuário inválido" })
      }

      const monthlyTransactions = await TransactionService.getComparison(userId)
      return res.status(200).json(monthlyTransactions)
    } catch (error) {
      console.error("Erro ao buscar comparação:", error)
      const typedError = error as ErrorWithStatus
      return res.status(typedError.status || 500).json({
        error: typedError.message || "[ERRO] Erro ao buscar comparação",
        details: typedError instanceof Error 
          ? typedError.message 
          : "Erro interno do servidor",
      })
    }
  }

  async getSummary(req: NextApiRequest, res: NextApiResponse) {
    try {
      const tokenValid = verifyTokenFromRequest(req as any)
      if (!tokenValid) {
        return res.status(401).json({ error: "[ERRO] Não autorizado" })
      }

      const cookies = parseCookies({ req })
      const userId = Number(cookies.userId)

      if (!userId || isNaN(userId)) {
        return res.status(400).json({ error: "[ERRO] ID de usuário inválido" })
      }

      const summaryData = await SummaryService.getSummary(userId)
      return res.status(200).json(summaryData)
    } catch (error) {
      console.error("Erro ao buscar resumo:", error)
      const typedError = error as ErrorWithStatus
      return res.status(typedError.status || 500).json({
        error: typedError.message || "[ERRO] Erro ao buscar resumo",
        details: typedError instanceof Error 
          ? typedError.message 
          : "Erro interno do servidor",
      })
    }
  }

  async getTransactionsTable(req: NextApiRequest, res: NextApiResponse) {
    try {
      const tokenValid = verifyTokenFromRequest(req as any)
      if (!tokenValid) {
        return res.status(401).json({ error: "[ERRO] Não autorizado" })
      }

      const cookies = parseCookies({ req })
      const userId = Number(cookies.userId)

      const table = await TransactionService.getTransactionsTable(userId)
      
      return res.status(200).json({ table })
    } catch (error) {
      console.error("[ERRO] Falha ao buscar tabela:", error)
      const typedError = error as ErrorWithStatus
      return res.status(typedError.status || 500).json({
        error: typedError.message || "[ERRO] Erro ao buscar tabela de transações",
        details: typedError instanceof Error 
          ? typedError.message 
          : "Erro interno do servidor"
      })
    }
  }

  async viewTransaction(req: NextApiRequest, res: NextApiResponse) {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "[ERRO] Método não permitido" })
      }

      const tokenValid = verifyTokenFromRequest(req as any)
      if (!tokenValid) {
        return res.status(401).json({ error: "[ERRO] Não autorizado" })
      }

      const { transactionId } = req.body

      if (!transactionId) {
        return res.status(400).json({ 
          error: "[ERRO] transactionId é necessário no corpo da requisição" 
        })
      }

      const transactionData = await ViewService.viewTransaction(transactionId)
      return res.status(200).json(transactionData)
      
    } catch (error) {
      console.error("[ERRO] Falha ao visualizar transação:", error)
      const typedError = error as ErrorWithStatus
      return res.status(typedError.status || 500).json({
        error: typedError.message || "[ERRO] Erro ao visualizar transação",
        details: typedError instanceof Error 
          ? typedError.message 
          : "Erro interno do servidor"
      })
    }
  }

  async updateTransaction(req: NextApiRequest, res: NextApiResponse) {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "[ERRO] Método não permitido" })
      }

      const tokenValid = verifyTokenFromRequest(req as any)
      if (!tokenValid) {
        return res.status(401).json({ error: "[ERRO] Não autorizado" })
      }

      const { transactionId, ...updateFields } = req.body

      if (!transactionId) {
        return res.status(400).json({ 
          error: "[ERRO] transactionId é necessário no corpo da requisição" 
        })
      }

      const updatedTransaction = await TransactionService.updateTransaction(
        transactionId, 
        updateFields
      )

      const transactionView = await ViewService.viewTransaction(transactionId)
      return res.status(200).json(transactionView)

    } catch (error) {
      console.error("[ERRO] Falha ao atualizar transação:", error)
      const typedError = error as ErrorWithStatus
      return res.status(typedError.status || 500).json({
        error: typedError.message || "[ERRO] Erro ao atualizar transação",
        details: typedError instanceof Error 
          ? typedError.message 
          : "Erro interno do servidor"
      })
    }
  }
}

export default new TransactionController()
