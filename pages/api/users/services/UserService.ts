import prisma from "@/lib/prisma" 
import redis from "@/lib/redis" 

export class UserService {
  // Serviço para deletar orçamentos com base em uma lista de IDs
  async deleteBudgets(ids: number[]) {
    return await prisma.orcamento.deleteMany({
      where: {
        userId: { in: ids }, 
      },
    })
  }

  // Serviço para deletar transações com base em uma lista de IDs
  async deleteTransactions(ids: number[]) {
    return await prisma.transacoes.deleteMany({
      where: {
        userId: { in: ids },
      },
    })
  }

  // Serviço para deletar usuários com base em uma lista de IDs
  async deleteUsers(ids: number[]) {
    return await prisma.usuarios.deleteMany({
      where: {
        id: { in: ids },
      },
    })
  }

  // Serviço para obter um usuário pelo ID, utilizando cache (redis) para otimizar a performance
  async getUserById(userId: number) {
    const cacheKey = `user:${userId}`; 

    // Vai tentar recuperar o usuário do cache do redis
    const cachedUser = await redis.get(cacheKey);
    if (cachedUser) {
      console.log(`[SUCESSO] Usuário recuperado do cache: ${userId}`);
      return JSON.parse(cachedUser);
    }

    // Se não estiver no cache, busca o usuário no banco de dados
    const user = await prisma.usuarios.findUnique({
      where: { id: userId },
      select: { id: true, nome: true, sobrenome: true, image: true, email: true, permissao: true }, 
    });

    // Se o usuário for encontrado, armazena no cache para futuras requisições (mais performático)
    if (user) {
      await redis.set(cacheKey, JSON.stringify(user), "EX", 60 * 60); // Armazena no cache do redis por 1 hora
      console.log(`[SUCESSO] Usuário armazenado no cache: ${userId}`);
    } else {
      console.log(`[AVISO] Usuário não encontrado no banco de dados: ${userId}`);
    }

    return user; 
  }
}
