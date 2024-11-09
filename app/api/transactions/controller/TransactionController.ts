import { NextRequest, NextResponse } from "next/server"
import { verifyTokenFromRequest } from "@/lib/auth"
import { createTransactionSchema, createParcelsSchema } from "@/lib/validation"
import TransactionService from "../services/TransactionService"
import ParcelService from "../services/ParcelService"
import prisma from "@/lib/prisma"
import redis from "@/lib/cache/redis"
import { cookies } from "next/headers"
import SummaryService from "../services/SummaryService"
import ViewService from "../services/ViewService"
import { CreateParcelDTO } from "../services/ParcelService"

interface ErrorWithStatus extends Error {
  status?: number
}

class TransactionController {
  private readonly CACHE_TTL = 3600

  async createTransaction(request: NextRequest) {
    try {
      const tokenValid = await verifyTokenFromRequest(request)
      if (!tokenValid) {
        return NextResponse.json(
          { error: "[ERRO] Não autorizado" },
          { status: 401 }
        )
      }

      const cookieStore = cookies()
      const userId = Number(cookieStore.get("userId")?.value)

      if (!userId || isNaN(userId)) {
        return NextResponse.json(
          { error: "[ERRO] ID de usuário inválido" },
          { status: 400 }
        )
      }

      const data = await request.json()
      const { nome, tipo, fonte, detalhesFonte, data: transactionDate, valor } = data

      if (!nome || !tipo || !fonte || !transactionDate || typeof valor === 'undefined') {
        return NextResponse.json({
          error: "[ERRO] Dados inválidos",
          details: "Todos os campos obrigatórios devem ser preenchidos"
        }, { status: 400 })
      }

      const result = await TransactionService.create({
        nome,
        tipo,
        fonte,
        detalhesFonte,
        data: transactionDate,
        valor
      }, userId)

      return NextResponse.json({
        message: "[SUCESSO] Transação criada com sucesso",
        ...result,
      }, { status: 200 })
    } catch (error) {
      console.error("Erro ao criar transação:", error)
      const typedError = error as ErrorWithStatus
      return NextResponse.json({
        error: typedError.message || "[ERRO] Erro ao criar transação",
        details: typedError instanceof Error
          ? typedError.message
          : "Erro interno do servidor",
      }, { status: typedError.status || 500 })
    }
  }

  async createParcels(request: NextRequest) {
    try {
      const tokenValid = await verifyTokenFromRequest(request)
      if (!tokenValid) {
        return NextResponse.json(
          { error: "[ERRO] Não autorizado" },
          { status: 401 }
        )
      }

      const cookieStore = cookies()
      const userId = Number(cookieStore.get("userId")?.value)

      if (!userId || isNaN(userId)) {
        return NextResponse.json(
          { error: "[ERRO] ID de usuário inválido" },
          { status: 400 }
        )
      }

      const data = await request.json()
      const parsedBody = createParcelsSchema.safeParse(data)
      
      if (!parsedBody.success) {
        return NextResponse.json({
          error: "[ERRO] Dados inválidos",
          details: parsedBody.error.flatten().fieldErrors,
        }, { status: 400 })
      }

      const serviceData = {
        cardId: parsedBody.data.cardId,
        nome: parsedBody.data.nome,
        tipo: parsedBody.data.tipo,
        fonte: parsedBody.data.fonte,
        detalhesFonte: parsedBody.data.detalhesFonte || undefined,
        data: parsedBody.data.data,
        valor: parsedBody.data.valor,
        numeroParcelas: parsedBody.data.numeroParcelas,
        userId
      }

      const result = await ParcelService.createParcels(serviceData)

      return NextResponse.json({
        message: "[SUCESSO] Parcelas criadas com sucesso",
        ...result,
      }, { status: 200 })
    } catch (error) {
      console.error("Erro ao criar parcelas:", error)
      const typedError = error as ErrorWithStatus
      return NextResponse.json({
        error: typedError.message || "[ERRO] Erro ao criar parcelas",
        details: typedError instanceof Error
          ? typedError.message
          : "Erro interno do servidor",
      }, { status: typedError.status || 500 })
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

  async getTransactions(request: NextRequest) {
    try {
      const tokenValid = await verifyTokenFromRequest(request)
      if (!tokenValid) {
        return NextResponse.json(
          { error: "[ERRO] Não autorizado" },
          { status: 401 }
        )
      }

      const cookieStore = cookies()
      const userId = Number(cookieStore.get("userId")?.value)

      if (!userId || isNaN(userId)) {
        return NextResponse.json({
          error: "[ERRO] ID de usuário inválido ou não encontrado nos cookies",
        }, { status: 400 })
      }

      const transactions = await TransactionService.getTransactions(userId)
      return NextResponse.json(transactions, { status: 200 })
    } catch (error) {
      console.error("Erro ao buscar transações:", error)
      const typedError = error as ErrorWithStatus
      return NextResponse.json({
        error: typedError.message || "[ERRO] Erro ao buscar transações",
        details: typedError instanceof Error
          ? typedError.message
          : "Erro interno do servidor",
      }, { status: typedError.status || 500 })
    }
  }

  async deleteTransaction(request: NextRequest) {
    try {
      const tokenValid = await verifyTokenFromRequest(request)
      if (!tokenValid) {
        return NextResponse.json(
          { error: "[ERRO] Não autorizado" },
          { status: 401 }
        )
      }

      const data = await request.json()
      const { transactionId } = data

      if (!transactionId || typeof transactionId !== "string") {
        return NextResponse.json(
          { error: "[ERRO] Transaction ID inválido" },
          { status: 400 }
        )
      }

      const result = await TransactionService.delete(transactionId)
      return NextResponse.json(result, { status: 200 })
    } catch (error) {
      console.error("Erro ao deletar transação:", error)
      const typedError = error as ErrorWithStatus
      return NextResponse.json({
        error: typedError.message || "[ERRO] Erro ao deletar transação",
        details: typedError instanceof Error
          ? typedError.message
          : "Erro interno do servidor",
      }, { status: typedError.status || 500 })
    }
  }

  async getComparison(request: NextRequest) {
    try {
      const tokenValid = await verifyTokenFromRequest(request)
      if (!tokenValid) {
        return NextResponse.json(
          { error: "[ERRO] Não autorizado" },
          { status: 401 }
        )
      }

      const cookieStore = cookies()
      const userId = Number(cookieStore.get("userId")?.value)

      if (!userId || isNaN(userId)) {
        return NextResponse.json(
          { error: "[ERRO] ID de usuário inválido" },
          { status: 400 }
        )
      }

      const monthlyTransactions = await TransactionService.getComparison(userId)
      return NextResponse.json(monthlyTransactions, { status: 200 })
    } catch (error) {
      console.error("Erro ao buscar comparação:", error)
      const typedError = error as ErrorWithStatus
      return NextResponse.json({
        error: typedError.message || "[ERRO] Erro ao buscar comparação",
        details: typedError instanceof Error
          ? typedError.message
          : "Erro interno do servidor",
      }, { status: typedError.status || 500 })
    }
  }

  async getSummary(request: NextRequest) {
    try {
      const tokenValid = await verifyTokenFromRequest(request)
      if (!tokenValid) {
        return NextResponse.json(
          { error: "[ERRO] Não autorizado" },
          { status: 401 }
        )
      }

      const cookieStore = cookies()
      const userId = Number(cookieStore.get("userId")?.value)

      if (!userId || isNaN(userId)) {
        return NextResponse.json(
          { error: "[ERRO] ID de usuário inválido" },
          { status: 400 }
        )
      }

      const summaryData = await SummaryService.getSummary(userId)
      return NextResponse.json(summaryData, { status: 200 })
    } catch (error) {
      console.error("Erro ao buscar resumo:", error)
      const typedError = error as ErrorWithStatus
      return NextResponse.json({
        error: typedError.message || "[ERRO] Erro ao buscar resumo",
        details: typedError instanceof Error
          ? typedError.message
          : "Erro interno do servidor",
      }, { status: typedError.status || 500 })
    }
  }

  async getTransactionsTable(request: NextRequest) {
    try {
      const tokenValid = await verifyTokenFromRequest(request)
      if (!tokenValid) {
        return NextResponse.json(
          { error: "[ERRO] Não autorizado" },
          { status: 401 }
        )
      }

      const cookieStore = cookies()
      const userId = Number(cookieStore.get("userId")?.value)

      if (!userId || isNaN(userId)) {
        return NextResponse.json(
          { error: "[ERRO] ID de usuário inválido" },
          { status: 400 }
        )
      }

      const table = await TransactionService.getTransactionsTable(userId)
      return NextResponse.json({ table }, { status: 200 })
    } catch (error) {
      console.error("[ERRO] Falha ao buscar tabela:", error)
      const typedError = error as ErrorWithStatus
      return NextResponse.json({
        error: typedError.message || "[ERRO] Erro ao buscar tabela de transações",
        details: typedError instanceof Error
          ? typedError.message
          : "Erro interno do servidor",
      }, { status: typedError.status || 500 })
    }
  }

  async viewTransaction(request: NextRequest) {
    try {
      const tokenValid = await verifyTokenFromRequest(request)
      if (!tokenValid) {
        return NextResponse.json(
          { error: "[ERRO] Não autorizado" },
          { status: 401 }
        )
      }

      const data = await request.json()
      const { transactionId } = data

      if (!transactionId) {
        return NextResponse.json({
          error: "[ERRO] transactionId é necessário no corpo da requisição",
        }, { status: 400 })
      }

      const transactionData = await ViewService.viewTransaction(transactionId)
      return NextResponse.json(transactionData, { status: 200 })
    } catch (error) {
      console.error("[ERRO] Falha ao visualizar transação:", error)
      const typedError = error as ErrorWithStatus
      return NextResponse.json({
        error: typedError.message || "[ERRO] Erro ao visualizar transação",
        details: typedError instanceof Error
          ? typedError.message
          : "Erro interno do servidor",
      }, { status: typedError.status || 500 })
    }
  }

  async updateTransaction(request: NextRequest) {
    try {
      const tokenValid = await verifyTokenFromRequest(request)
      if (!tokenValid) {
        return NextResponse.json(
          { error: "[ERRO] Não autorizado" },
          { status: 401 }
        )
      }

      const data = await request.json()
      const { transactionId, ...updateFields } = data

      if (!transactionId) {
        return NextResponse.json({
          error: "[ERRO] transactionId é necessário no corpo da requisição",
        }, { status: 400 })
      }

      const updatedTransaction = await TransactionService.updateTransaction(
        transactionId,
        updateFields
      )

      const transactionView = await ViewService.viewTransaction(transactionId)
      return NextResponse.json(transactionView, { status: 200 })
    } catch (error) {
      console.error("[ERRO] Falha ao atualizar transação:", error)
      const typedError = error as ErrorWithStatus
      return NextResponse.json({
        error: typedError.message || "[ERRO] Erro ao atualizar transação",
        details: typedError instanceof Error
          ? typedError.message
          : "Erro interno do servidor",
      }, { status: typedError.status || 500 })
    }
  }
}

export default new TransactionController() 