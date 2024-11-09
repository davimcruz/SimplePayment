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

export interface MPPaymentResponse {
  id: number
  status: "pending" | "approved" | "rejected" | "cancelled"
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string
      qr_code_base64?: string
    }
  }
} 