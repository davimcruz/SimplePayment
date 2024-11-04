import prisma from "@/lib/prisma"
import redis from "@/lib/redis"

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
  async updateUserPermission(userId: number, permission: 'admin' | 'pro' | 'free') {
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
  async updateUserStatus(userId: number, status: 'active' | 'inactive' | 'suspended') {
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
    // Remove em cascata (orçamentos e transações primeiro)
    await prisma.orcamento.deleteMany({
      where: { userId },
    })

    await prisma.transacoes.deleteMany({
      where: { userId },
    })

    const deletedUser = await prisma.usuarios.delete({
      where: { id: userId },
    })

    // Invalida o cache do usuário no Redis
    await redis.del(`user:${userId}`)
    console.log(`[SUCESSO] Cache invalidado para o usuário ${userId}`)
    return deletedUser
  }

  // Obtém estatísticas gerais do sistema (total de usuários, distribuição de planos)
  async getStats() {
    const [totalUsers, totalPro, totalFree, totalAdmin] = await Promise.all([
      prisma.usuarios.count(),
      prisma.usuarios.count({ where: { permissao: 'pro' } }),
      prisma.usuarios.count({ where: { permissao: 'free' } }),
      prisma.usuarios.count({ where: { permissao: 'admin' } }),
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
      // Remove todos os orçamentos dos usuários selecionados
      await prisma.orcamento.deleteMany({
        where: { userId: { in: userIds } },
      })

      // Remove todas as transações dos usuários selecionados
      await prisma.transacoes.deleteMany({
        where: { userId: { in: userIds } },
      })

      // Remove os usuários selecionados
      await prisma.usuarios.deleteMany({
        where: { id: { in: userIds } },
      })
    })

    // Invalida o cache de todos os usuários deletados no Redis
    await Promise.all(userIds.map(id => redis.del(`user:${id}`)))
    console.log(`[SUCESSO] Cache invalidado para ${userIds.length} usuários`)

    return { success: true }
  }
}
