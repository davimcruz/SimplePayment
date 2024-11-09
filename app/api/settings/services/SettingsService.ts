import prisma from "@/lib/prisma"
import redis from "@/lib/cache/redis"
import { UpdateUserDto, SaveImageDto } from "../dtos"

class SettingsService {
  async updateUser(data: UpdateUserDto) {
    const { userId, nome, sobrenome } = data

    const updatedUser = await prisma.usuarios.update({
      where: { id: userId },
      data: { nome, sobrenome },
    })

    await redis.del(`user:${userId}`)
    console.log(`[SUCESSO] Cache invalidado para o usuário ID: ${userId}`)

    return updatedUser
  }

  async saveImage(data: SaveImageDto) {
    const { userId, imageUrl } = data

    const updatedUser = await prisma.usuarios.update({
      where: { id: userId },
      data: { image: imageUrl },
    })

    await redis.del(`user:${userId}`)
    console.log(`[SUCESSO] Cache invalidado para o usuário ID: ${userId}`)

    return updatedUser
  }
}

export default new SettingsService()
