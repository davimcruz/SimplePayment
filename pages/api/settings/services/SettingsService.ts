import prisma from "@/lib/prisma"
import redis from "@/lib/cache/redis"
import { UpdateUserDto } from "../dtos/UpdateUserDTO"
import { SaveImageDto } from "../dtos/SaveImageDTO"

class SettingsService {
  // Função para obter o userId baseado no email
  private async getUserIdByEmail(email: string): Promise<number | null> {
    const user = await prisma.usuarios.findUnique({
      where: { email },
      select: { id: true },
    })
    return user ? user.id : null
  }

  async updateUser(data: UpdateUserDto) {
    const { email, nome, sobrenome } = data

    const updatedUser = await prisma.usuarios.update({
      where: { email },
      data: { nome, sobrenome },
    })

    const userId = await this.getUserIdByEmail(email)
    if (userId) {
      await redis.del(`user:${userId}`) // Invalida o cache usando o userId no redis
      console.log(`[SUCESSO] Cache invalidado para o usuário ID: ${userId}`)
    }

    return updatedUser
  }

  async saveImage(data: SaveImageDto) {
    const { email, imageUrl } = data

    const updatedUser = await prisma.usuarios.update({
      where: { email },
      data: { image: imageUrl },
    })

    const userId = await this.getUserIdByEmail(email)
    if (userId) {
      await redis.del(`user:${userId}`) // Invalida o cache usando o userId no redis
      console.log(`[SUCESSO] Cache invalidado para o usuário ID: ${userId}`)
    }

    return updatedUser
  }
}

export default new SettingsService()
