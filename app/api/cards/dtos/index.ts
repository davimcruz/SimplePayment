import { z } from "zod"

// CreateCardDTO
export const createCardSchema = z.object({
  userId: z.number().positive(),
  nome: z
    .string()
    .min(1, { message: "Nome do cartão é obrigatório" })
    .regex(/^[a-zA-ZÀ-ÿ0-9\s]+$/, {
      message:
        "O nome deve conter apenas letras (incluindo acentuadas), números e espaços.",
    }),
  bandeira: z.enum(
    ["Mastercard", "Visa", "Elo", "American Express", "Hipercard"],
    {
      errorMap: () => ({ message: "Bandeira inválida" }),
    }
  ),
  instituicao: z
    .string()
    .min(1, { message: "Instituição é obrigatória" })
    .regex(/^[a-zA-ZÀ-ÿ0-9\s]+$/, {
      message:
        "A instituição deve conter apenas letras (incluindo acentuadas), números e espaços.",
    }),
  tipo: z.literal("credito"),
  vencimento: z
    .number()
    .min(1)
    .max(31, { message: "Vencimento deve ser entre 1 e 31" }),
  limite: z.number().min(0.01, { message: "Limite deve ser maior que zero" }),
})

// UpdateCardDTO
export const updateCardSchema = z.object({
  cardId: z.string().uuid({ message: "cardId deve ser um UUID válido" }),
  nome: z
    .string()
    .min(1, { message: "Nome do cartão é obrigatório" })
    .regex(/^[a-zA-ZÀ-ÿ0-9\s]+$/, {
      message:
        "O nome deve conter apenas letras (incluindo acentuadas), números e espaços.",
    })
    .optional(),
  bandeira: z
    .enum(["Mastercard", "Visa", "Elo", "American Express", "Hipercard"], {
      errorMap: () => ({ message: "Bandeira inválida" }),
    })
    .optional(),
  instituicao: z
    .string()
    .min(1, { message: "Instituição é obrigatória" })
    .regex(/^[a-zA-ZÀ-ÿ0-9\s]+$/, {
      message:
        "A instituição deve conter apenas letras (incluindo acentuadas), números e espaços.",
    })
    .optional(),
  vencimento: z
    .number()
    .min(1)
    .max(31, { message: "Vencimento deve ser entre 1 e 31" })
    .optional(),
  limite: z
    .number()
    .min(0.01, { message: "Limite deve ser maior que zero" })
    .optional(),
})

// DeleteCardDTO
export const deleteCardSchema = z.object({
  cardId: z.string().uuid({ message: "cardId deve ser um UUID válido" }),
  userId: z.number().positive(),
})

export type CreateCardInput = z.infer<typeof createCardSchema>
export type UpdateCardInput = z.infer<typeof updateCardSchema>
export type DeleteCardInput = z.infer<typeof deleteCardSchema> 