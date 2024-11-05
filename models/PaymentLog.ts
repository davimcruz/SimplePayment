import { MongoClient, Collection, MongoClientOptions } from 'mongodb'

interface PaymentLog {
  paymentId: string
  status: 'approved' | 'pending' | 'rejected' | 'cancelled'
  amount: number
  customerEmail: string
  customerName: string
  customerCpf: string
  userId: string
  createdAt: Date
}

class PaymentLogRepository {
  private client: MongoClient
  private collection: Collection<PaymentLog> | null = null
  private readonly dbName = 'simplefinance'
  private readonly collectionName = 'payment_logs'

  constructor() {
    const uri = process.env.MONGODB_URI
    if (!uri) {
      throw new Error('MONGODB_URI não configurado')
    }

    const options: MongoClientOptions = {
      connectTimeoutMS: 10000, // 10 segundos
      socketTimeoutMS: 45000,  // 45 segundos
    }

    this.client = new MongoClient(uri, options)
  }

  private async getCollection(): Promise<Collection<PaymentLog>> {
    if (!this.collection) {
      try {
        await this.client.connect()
        const db = this.client.db(this.dbName)
        this.collection = db.collection<PaymentLog>(this.collectionName)
        
        // Criar índices se necessário
        await this.collection.createIndex({ userId: 1 })
        await this.collection.createIndex({ paymentId: 1 }, { unique: true })
        await this.collection.createIndex({ createdAt: -1 })
      } catch (error) {
        console.error('Erro ao conectar com MongoDB:', error)
        throw new Error('Falha na conexão com o banco de dados')
      }
    }
    return this.collection
  }

  async create(payment: Omit<PaymentLog, 'createdAt'>): Promise<void> {
    try {
      const collection = await this.getCollection()
      await collection.insertOne({
        ...payment,
        createdAt: new Date()
      })
    } catch (error) {
      console.error('Erro ao salvar log de pagamento:', error)
      throw new Error('Falha ao salvar log de pagamento')
    }
  }

  async findByUserId(userId: string): Promise<PaymentLog[]> {
    try {
      const collection = await this.getCollection()
      return await collection
        .find({ userId })
        .sort({ createdAt: -1 })
        .toArray()
    } catch (error) {
      console.error('Erro ao buscar logs de pagamento:', error)
      throw new Error('Falha ao buscar logs de pagamento')
    }
  }

  async findByPaymentId(paymentId: string): Promise<PaymentLog | null> {
    try {
      const collection = await this.getCollection()
      return await collection.findOne({ paymentId })
    } catch (error) {
      console.error('Erro ao buscar log de pagamento:', error)
      throw new Error('Falha ao buscar log de pagamento')
    }
  }

  async findByCpf(cpf: string): Promise<PaymentLog[]> {
    try {
      const collection = await this.getCollection()
      return await collection
        .find({ customerCpf: cpf })
        .sort({ createdAt: -1 })
        .toArray()
    } catch (error) {
      console.error('Erro ao buscar logs por CPF:', error)
      throw new Error('Falha ao buscar logs por CPF')
    }
  }

  async close(): Promise<void> {
    await this.client.close()
    this.collection = null
  }

  async update(paymentId: string, data: Partial<PaymentLog>): Promise<void> {
    try {
      const collection = await this.getCollection()
      await collection.updateOne(
        { paymentId },
        { $set: data }
      )
    } catch (error) {
      console.error('Erro ao atualizar log:', error)
      throw new Error('Falha ao atualizar log de pagamento')
    }
  }
}

// Singleton para reutilizar a conexão
export const paymentLogRepository = new PaymentLogRepository()
