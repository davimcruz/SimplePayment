import prisma from "@/lib/prisma"
import redis from "@/lib/cache/redis"
import { paymentLogRepository } from "@/models/PaymentLog"
import { salesLogRepository } from "@/models/SalesLog"

export class AdminService {
  // Busca todos os usuários cadastrados no sistema
  async getAllUsers() {
    return await prisma.usuarios.findMany({
      select: {
        id: true,
        nome: true,
        sobrenome: true,
        email: true,
        permissao: true,
        createdAt: true,
        status: true,
        image: true,
      },
    })
  }

  // Atualiza o nível de permissão de um usuário específico (free, pro ou admin)
  async updateUserPermission(
    userId: number,
    permission: "admin" | "pro" | "free"
  ) {
    const user = await prisma.usuarios.update({
      where: { id: userId },
      data: { permissao: permission },
      select: {
        id: true,
        nome: true,
        email: true,
        permissao: true,
      },
    })

    // Invalida o cache do usuário no Redis
    await redis.del(`user:${userId}`)
    console.log(`[SUCESSO] Cache invalidado para o usuário ${userId}`)
    return user
  }

  // Atualiza o status de um usuário (ativo, inativo ou suspenso)
  async updateUserStatus(
    userId: number,
    status: "active" | "inactive" | "suspended"
  ) {
    const user = await prisma.usuarios.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        nome: true,
        email: true,
        status: true,
      },
    })

    // Invalida o cache do usuário no Redis
    await redis.del(`user:${userId}`)
    console.log(`[SUCESSO] Cache invalidado para o usuário ${userId}`)
    return user
  }

  // Remove um usuário específico e todos seus dados relacionados do sistema
  async deleteUser(userId: number) {
    await prisma.$transaction(async (prisma) => {
      // 1. Primeiro, encontra todos os cartões do usuário
      const userCards = await prisma.cartoes.findMany({
        where: { userId },
        select: { cardId: true },
      })
      const cardIds = userCards.map((card) => card.cardId)

      // 2. Remove todas as parcelas primeiro (pois dependem de faturas e transações)
      await prisma.parcelas.deleteMany({
        where: {
          OR: [{ cardId: { in: cardIds } }, { transacao: { userId: userId } }],
        },
      })

      // 3. Remove todas as faturas dos cartões
      await prisma.faturas.deleteMany({
        where: { cardId: { in: cardIds } },
      })

      // 4. Remove todas as transações
      // (onDelete: SetNull no cardId, então podemos deletar depois dos cartões)
      await prisma.transacoes.deleteMany({
        where: { userId },
      })

      // 5. Remove todos os cartões
      // (onDelete: Cascade com usuário, mas precisamos deletar antes por causa das relações)
      await prisma.cartoes.deleteMany({
        where: { userId },
      })

      // 6. Remove todos os orçamentos
      await prisma.orcamento.deleteMany({
        where: { userId },
      })

      // 7. Finalmente, remove o usuário
      await prisma.usuarios.delete({
        where: { id: userId },
      })
    })

    // Invalida o cache do usuário no Redis
    await redis.del(`user:${userId}`)
    console.log(
      `[SUCESSO] Usuário ${userId} e todos seus dados relacionados foram removidos`
    )
  }

  // Obtém estatísticas gerais do sistema (total de usuários, distribuição de planos)
  async getStats() {
    const [totalUsers, totalPro, totalFree, totalAdmin] = await Promise.all([
      prisma.usuarios.count(),
      prisma.usuarios.count({ where: { permissao: "pro" } }),
      prisma.usuarios.count({ where: { permissao: "free" } }),
      prisma.usuarios.count({ where: { permissao: "admin" } }),
    ])

    return {
      totalUsers,
      totalPro,
      totalFree,
      totalAdmin,
      conversionRate: totalUsers > 0 ? (totalPro / totalUsers) * 100 : 0,
    }
  }

  // Recupera informações detalhadas de um usuário específico
  async getUserDetails(userId: number) {
    const [user, transactionsCount, budgetsCount] = await Promise.all([
      prisma.usuarios.findUnique({
        where: { id: userId },
        select: {
          id: true,
          nome: true,
          sobrenome: true,
          email: true,
          permissao: true,
          createdAt: true,
          status: true,
          image: true,
        },
      }),
      prisma.transacoes.count({ where: { userId } }),
      prisma.orcamento.count({ where: { userId } }),
    ])

    return {
      ...user,
      transactionsCount,
      budgetsCount,
    }
  }

  // Remove múltiplos usuários e seus dados relacionados de uma vez
  async deleteMultipleUsers(userIds: number[]) {
    await prisma.$transaction(async (prisma) => {
      // 1. Encontra todos os cartões dos usuários
      const userCards = await prisma.cartoes.findMany({
        where: { userId: { in: userIds } },
        select: { cardId: true },
      })
      const cardIds = userCards.map((card) => card.cardId)

      // 2. Remove todas as parcelas primeiro
      await prisma.parcelas.deleteMany({
        where: {
          OR: [
            { cardId: { in: cardIds } },
            { transacao: { userId: { in: userIds } } },
          ],
        },
      })

      // 3. Remove todas as faturas
      await prisma.faturas.deleteMany({
        where: { cardId: { in: cardIds } },
      })

      // 4. Remove todas as transações
      await prisma.transacoes.deleteMany({
        where: { userId: { in: userIds } },
      })

      // 5. Remove todos os cartões
      await prisma.cartoes.deleteMany({
        where: { userId: { in: userIds } },
      })

      // 6. Remove todos os orçamentos
      await prisma.orcamento.deleteMany({
        where: { userId: { in: userIds } },
      })

      // 7. Remove os usuários
      await prisma.usuarios.deleteMany({
        where: { id: { in: userIds } },
      })
    })

    // Invalida o cache de todos os usuários deletados no Redis
    await Promise.all(userIds.map((id) => redis.del(`user:${id}`)))
    console.log(
      `[SUCESSO] ${userIds.length} usuários e todos seus dados relacionados foram removidos`
    )

    return { success: true }
  }

  async getAllSells() {
    try {
      const payments = await salesLogRepository.findAllApproved()

      const formattedPayments = payments.map((payment) => ({
        id: payment._id.toString(),
        paymentId: payment.paymentId,
        customerName: payment.customerName,
        customerEmail: payment.customerEmail,
        amount: payment.amount,
        date: payment.createdAt,
        plan: "PRO",
        userId: payment.userId,
      }))

      const stats = await salesLogRepository.getStats()

      return {
        sells: formattedPayments,
        stats,
      }
    } catch (error) {
      console.error("Erro ao buscar vendas:", error)
      throw new Error("Falha ao buscar histórico de vendas")
    } finally {
      await salesLogRepository.close()
    }
  }
}
