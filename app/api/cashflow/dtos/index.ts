import { z } from "zod"

// Schema para criação de fluxo de caixa
export const createFlowSchema = z.object({
  userId: z.number().positive(),
  flow: z.record(
    z.string(),
    z.object({
      receitaOrcada: z.number().min(0),
      despesaOrcada: z.number().min(0),
    })
  ),
})

// Schema para atualização de fluxo de caixa
export const updateFlowSchema = z.object({
  userId: z.number().positive(),
  flow: z.record(
    z.string(),
    z.object({
      receitaOrcada: z.number().min(0),
      despesaOrcada: z.number().min(0),
    })
  ),
})

// Types
export type CreateFlowInput = z.infer<typeof createFlowSchema>
export type UpdateFlowInput = z.infer<typeof updateFlowSchema> 