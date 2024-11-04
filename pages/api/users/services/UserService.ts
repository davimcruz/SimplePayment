import prisma from "@/lib/prisma" 
import redis from "@/lib/redis" 
import bcrypt from "bcrypt"

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

  // Verifica se a senha atual está correta
  async verifyCurrentPassword(userId: number, currentPassword: string) {
    try {
      const user = await prisma.usuarios.findUnique({
        where: { id: userId },
        select: { senha: true }
      })

      if (!user) {
        return { 
          status: 404, 
          data: { error: "[ERRO] Usuário não encontrado" } 
        }
      }

      // Verifica se a senha atual está correta usando bcrypt
      const isPasswordValid = await bcrypt.compare(currentPassword, user.senha)
      
      if (!isPasswordValid) {
        return { 
          status: 401, 
          data: { error: "[ERRO] Senha atual incorreta" } 
        }
      }

      return { 
        status: 200, 
        data: { message: "[SUCESSO] Senha atual válida" } 
      }
    } catch (error) {
      console.error("[ERRO] Erro ao verificar senha:", error)
      return { 
        status: 500, 
        data: { error: "[ERRO] Erro ao verificar senha" } 
      }
    }
  }

  // Atualiza a senha do usuário
  async updatePassword(userId: number, currentPassword: string, newPassword: string) {
    try {
      // Primeiro verifica se a senha atual está correta
      const verifyResult = await this.verifyCurrentPassword(userId, currentPassword)
      if (verifyResult.status !== 200) {
        return verifyResult
      }

      // Hash da nova senha
      const hashedPassword = await bcrypt.hash(newPassword, 10)

      // Atualiza a senha no banco
      await prisma.usuarios.update({
        where: { id: userId },
        data: { senha: hashedPassword }
      })

      // Invalida o cache do usuário
      await redis.del(`user:${userId}`)
      console.log(`[SUCESSO] Cache invalidado para o usuário ${userId}`)

      return { 
        status: 200, 
        data: { message: "[SUCESSO] Senha atualizada com sucesso" } 
      }
    } catch (error) {
      console.error("[ERRO] Erro ao atualizar senha:", error)
      return { 
        status: 500, 
        data: { error: "[ERRO] Erro ao atualizar senha" } 
      }
    }
  }
}
