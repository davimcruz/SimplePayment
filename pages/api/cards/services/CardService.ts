import prisma from "@/lib/prisma"
import redis from "@/lib/redis"
import { CreateCardInput } from "../dtos/CreateCardDTO"
import { UpdateCardInput } from "../dtos/UpdateCardDTO"
import { DeleteCardInput } from "../dtos/DeleteCardDTO"

class CardService {
  // Serviço de criação de cartões
  async createCard(data: CreateCardInput) {
    const { userId, nome, bandeira, instituicao, tipo, vencimento, limite } =
      data

    // Verificação do número de cartões do tipo especificado já existentes para o usuário (Feito para que no futuro seja capaz também adicionar funcionalidade de controle específico de cartão de débito)
    const cartoesExistentes = await prisma.cartoes.count({
      where: {
        userId: userId,
        tipoCartao: tipo,
      },
    })

    if (cartoesExistentes >= 3) {
      throw new Error(`[ERRO] Limite de 3 cartões do tipo ${tipo} já atingido.`)
    }

    const novoCartao = await prisma.cartoes.create({
      data: {
        userId,
        nomeCartao: nome,
        bandeira,
        instituicao,
        tipoCartao: tipo,
        vencimento,
        limite,
      },
    })

    // Invalida o cache do usuário no Redis
    const cacheKey = `userCards:${userId}`
    await redis.del(cacheKey)
    console.log(`[SUCESSO] Cache invalidado para a chave: ${cacheKey}`)

    return novoCartao
  }

  // Serviço de atualização de cartões
  async updateCard(data: UpdateCardInput) {
    const { cardId, nome, vencimento, ...updateFields } = data

    // Verificação da existência do cartão antes da atualização
    const currentCard = await prisma.cartoes.findUnique({
      where: { cardId },
    })
    if (!currentCard) {
      throw new Error("[ERRO] Cartão não encontrado.")
    }

    const updatedCard = await prisma.cartoes.update({
      where: { cardId },
      data: {
        nomeCartao: nome,
        vencimento,
        ...updateFields,
      },
    })

    // Invalida o cache do usuário no Redis
    const cacheKey = `userCards:${currentCard.userId}`
    await redis.del(cacheKey)
    console.log(`[SUCESSO] Cache invalidado para a chave: ${cacheKey}`)

    return updatedCard
  }

  // Serviço de exclusão de cartões
  async deleteCard(data: DeleteCardInput) {
    const { cardId, userId } = data

    const deletedCard = await prisma.cartoes.delete({
      where: {
        cardId,
        userId,
      },
    })

    // Invalida o cache do usuário no Redis
    const cacheKey = `userCards:${userId}`
    await redis.del(cacheKey)
    console.log(`[SUCESSO] Cache invalidado para a chave: ${cacheKey}`)

    return deletedCard
  }

  // Serviço para obtenção de cartões do usuário
  async getCard(userId: number) {
    const cacheKey = `userCards:${userId}`

    // Verificar se os cartões do usuário já estão no cache, se sim, retorna-los
    const cachedCards = await redis.get(cacheKey)
    if (cachedCards) {
      console.log(
        `[SUCESSO] Cartões recuperados do cache para o usuário ${userId}`
      )
      return JSON.parse(cachedCards) 
    }

    // Se não estiver no cache, realiza a busca diretamente no banco de dados
    const cartoes = await prisma.cartoes.findMany({
      where: { userId },
    })

    // Armazena os cartões no Redis para futuras requisições
    await redis.set(cacheKey, JSON.stringify(cartoes), "EX", 60 * 60 * 24) // 24 horas de cache no redis
    console.log(
      `[SUCESSO] Cartões armazenados no cache para o usuário ${userId}`
    )

    return cartoes
  }

  // Serviço para obtenção do nome do cartão
  async getCardName(cardId: string) {
    return await prisma.cartoes.findUnique({
      where: { cardId },
      select: { nomeCartao: true },
    })
  }
}

export default new CardService()
