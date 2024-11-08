import prisma from "@/lib/prisma"
import { transacoes } from "@prisma/client"
import { sharedMemoryCache } from '@/lib/cache/sharedCache'

interface TransactionView {
  transactionId: string
  userId: number
  nome: string
  tipo: string
  fonte: string
  detalhesFonte: string | null
  data: string | null
  valor: number
  dataCriacao: Date
  cardId: string | null
  grupoParcelamentoId: string | null
  parcelas: {
    parcelaId: string
    mes: number
    ano: number
    valorParcela: number
    pago: boolean
  }[] | null
  cartao: {
    cardId: string
    nomeCartao: string
    limite: number | null
    vencimento: number | null
  } | null
}

class ViewService {
  private readonly CACHE_KEY_PREFIX = 'transaction_view:'

  async viewTransaction(transactionId: string): Promise<TransactionView> {
    if (!transactionId) {
      throw new Error("[ERRO] ID da transação é obrigatório")
    }

    const cacheKey = `${this.CACHE_KEY_PREFIX}${transactionId}`
    
    const cached = sharedMemoryCache.get<TransactionView>(cacheKey)
    if (cached) {
      return cached
    }

    const transaction = await prisma.transacoes.findUnique({
      where: { transactionId },
      include: {
        cartoes: {
          select: {
            cardId: true,
            nomeCartao: true,
            limite: true,
            vencimento: true,
          }
        },
        parcelas: {
          select: {
            parcelaId: true,
            mes: true,
            ano: true,
            valorParcela: true,
            pago: true,
          }
        },
      },
    })

    if (!transaction) {
      throw new Error("[ERRO] Transação não encontrada")
    }

    const transactionData: TransactionView = {
      transactionId: transaction.transactionId,
      userId: transaction.userId,
      nome: transaction.nome,
      tipo: transaction.tipo,
      fonte: transaction.fonte,
      detalhesFonte: transaction.detalhesFonte,
      data: transaction.data,
      valor: Number(transaction.valor),
      dataCriacao: transaction.dataCriacao,
      cardId: transaction.cardId,
      grupoParcelamentoId: transaction.grupoParcelamentoId,
      parcelas: transaction.parcelas.length > 0 ? transaction.parcelas : null,
      cartao: transaction.cartoes
    }

    sharedMemoryCache.set(cacheKey, transactionData)

    return transactionData
  }

  invalidateCache(transactionId: string): void {
    sharedMemoryCache.del(`${this.CACHE_KEY_PREFIX}${transactionId}`)
  }
}

export default new ViewService()
