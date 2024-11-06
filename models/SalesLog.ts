import { Collection, MongoClient, ObjectId } from 'mongodb'

interface SaleLog {
  _id: ObjectId
  paymentId: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  amount: number
  customerEmail: string
  customerName: string
  customerCpf: string
  userId: string
  createdAt: Date
  updatedAt: Date
}

export class SalesLogRepository {
  private client: MongoClient
  private collection: Collection<SaleLog> | null = null

  constructor() {
    this.client = new MongoClient(process.env.MONGODB_URI!)
  }

  private async connect() {
    if (!this.collection) {
      await this.client.connect()
      const db = this.client.db('simplefinance')
      this.collection = db.collection<SaleLog>('payment_logs')
    }
  }

  async findAllApproved() {
    try {
      await this.connect()
      if (!this.collection) {
        throw new Error('Collection não inicializada')
      }
      
      const sales = await this.collection
        .find({ status: 'approved' })
        .sort({ createdAt: -1 })
        .toArray()
      
      return sales
    } catch (error) {
      console.error("Erro ao buscar vendas aprovadas:", error)
      throw error
    }
  }

  async findByDateRange(startDate: Date, endDate: Date) {
    try {
      await this.connect()
      if (!this.collection) {
        throw new Error('Collection não inicializada')
      }

      const sales = await this.collection
        .find({
          status: 'approved',
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        })
        .sort({ createdAt: -1 })
        .toArray()

      return sales
    } catch (error) {
      console.error("Erro ao buscar vendas por período:", error)
      throw error
    }
  }

  async getStats() {
    try {
      await this.connect()
      if (!this.collection) {
        throw new Error('Collection não inicializada')
      }

      const sales = await this.collection
        .find({ status: 'approved' })
        .toArray()

      const totalAmount = sales.reduce((acc, sale) => acc + sale.amount, 0)
      const totalSales = sales.length
      const averageTicket = totalSales > 0 ? totalAmount / totalSales : 0

      return {
        totalAmount,
        totalSales,
        averageTicket
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas de vendas:", error)
      throw error
    }
  }

  async close() {
    await this.client.close()
    this.collection = null
  }
}

export const salesLogRepository = new SalesLogRepository()
