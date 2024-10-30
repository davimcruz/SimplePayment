import { z } from "zod"

export const deleteCardSchema = z.object({
  cardId: z.string().uuid({ message: "cardId deve ser um UUID válido" }),
  userId: z.number().positive(),
})

export type DeleteCardInput = z.infer<typeof deleteCardSchema>