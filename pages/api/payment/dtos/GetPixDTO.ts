export interface GetPixDTO {
  email: string
  nome: string
  cpf: string
  valor: number
  userId: number
}

export interface PixResponse {
  qrCode: string
  qrCodeBase64: string
  paymentId: number
}

export interface PaymentStatusResponse {
  status: "pending" | "approved" | "rejected" | "cancelled"
  paymentId: number
  redirect?: string
}
