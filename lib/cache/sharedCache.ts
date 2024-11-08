import NodeCache from 'node-cache'

export const sharedMemoryCache = new NodeCache({
  stdTTL: 300, // 5 minutos
  checkperiod: 60,
  useClones: false
}) 