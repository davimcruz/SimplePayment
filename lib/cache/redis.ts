import Redis from "ioredis"

const redisUrl = process.env.REDIS_URL
const redisToken = process.env.REDIS_TOKEN

if (!redisUrl || !redisToken) {
  throw new Error(
    "[ERRO] Redis não definido ou configurado."
  )
}

// Criação da instância do Redis
const redis = new Redis(redisUrl, {
  password: redisToken,
  maxRetriesPerRequest: 5,
  connectTimeout: 10000, // Timeout de conexão em milissegundos
  retryStrategy: (times) => {
    const delay = Math.min(times * 100, 3000)
    console.log(`Tentativa de reconexão ao Redis em ${delay}ms...`)
    return delay
  },
  reconnectOnError: (err) => {
    const targetErrors = ["READONLY", "ECONNRESET", "ETIMEDOUT"]
    if (targetErrors.some((targetError) => err.message.includes(targetError))) {
      console.log("Reconectando ao Redis devido a erro:", err.message)
      return true
    }
    return false
  },
})

redis.on("connect", () => {
  console.log("Conectado ao Redis com sucesso.")
})

redis.on("error", (err) => {
  console.error("Erro de conexão com o Redis:", err)
})

export default redis
