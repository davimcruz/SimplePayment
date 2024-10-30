import { z } from "zod"

export const updateFlowSchema = z.object({
  userId: z.number().positive(), 
  flow: z.record(
    z.object({
      receitaOrcada: z
        .number()
        .min(0, { message: "Receita orçada deve ser maior ou igual a 0" }), 
      despesaOrcada: z
        .number()
        .min(0, { message: "Despesa orçada deve ser maior ou igual a 0" }), 
    })
  ),
})

export type UpdateFlowInput = z.infer<typeof updateFlowSchema> 
