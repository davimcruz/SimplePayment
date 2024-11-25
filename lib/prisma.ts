/**
 * Configuração do Prisma Client com suporte a hot-reload em desenvolvimento
 * e singleton em produção para evitar múltiplas conexões.
 * 
 * @remarks
 * Em desenvolvimento, mantemos a instância no objeto global para evitar
 * múltiplas conexões durante hot-reload do Next.js
 */

import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
  return new PrismaClient()
}

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma