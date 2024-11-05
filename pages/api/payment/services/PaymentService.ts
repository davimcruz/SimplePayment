import { MercadoPagoConfig, Payment } from 'mercadopago';
import { GetPixDTO, PixResponse, PaymentStatusResponse } from "../dtos/GetPixDTO"
import { paymentLogRepository } from '@/models/PaymentLog'
import prisma from '@/lib/prisma'

interface MPPaymentResponse {
  id: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string
      qr_code_base64?: string
    }
  }
}

export class PaymentService {
  private client: Payment;

  constructor() {
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MP_ACCESS_TOKEN!,
      options: { timeout: 5000 }
    });
    this.client = new Payment(client);
  }

  async generatePix({
    email,
    nome,
    cpf,
    valor
  }: GetPixDTO): Promise<PixResponse> {
    try {
      // Buscar pagamentos pendentes existenes pra esse CPF
      const existingLogs = await paymentLogRepository.findByCpf(cpf)
      const pendingPayment = existingLogs.find(log => log.status === 'pending')

      // Se existe um pagamento pendente verificar status atual
      if (pendingPayment) {
        const response = await this.client.get({ id: Number(pendingPayment.paymentId) })
        const currentStatus = response as unknown as MPPaymentResponse
        
        // Se ainda está pendente e tem todos os dados necessários, retornar o PIX existente (isso é pra evitar gerar um novo PIX e encher o banco de dados)
        if (currentStatus.status === 'pending' && 
            currentStatus.point_of_interaction?.transaction_data?.qr_code &&
            currentStatus.point_of_interaction?.transaction_data?.qr_code_base64) {
          
          console.log('Retornando PIX pendente existente:', pendingPayment.paymentId)
          return {
            qrCode: currentStatus.point_of_interaction.transaction_data.qr_code,
            qrCodeBase64: currentStatus.point_of_interaction.transaction_data.qr_code_base64,
            paymentId: currentStatus.id
          }
        }
      }

      // Se não tem pendente ou o anterior já foi finalizado, gerar novo PIX
      const body = {
        transaction_amount: Number(valor),
        description: "Plano PRO - Assinatura",
        payment_method_id: "pix",
        payer: {
          email,
          first_name: nome,
          identification: {
            type: "CPF",
            number: cpf
          }
        }
      }

      const response = await this.client.create({ body })
      const payment = response as unknown as MPPaymentResponse

      if (!payment.point_of_interaction?.transaction_data?.qr_code ||
          !payment.point_of_interaction?.transaction_data?.qr_code_base64 ||
          !payment.id) {
        throw new Error("Resposta do Mercado Pago incompleta")
      }

      // Log específico do código PIX
      console.log('=== CÓDIGO PIX GERADO ===')
      console.log(payment.point_of_interaction.transaction_data.qr_code)
      console.log('=== QR CODE BASE64 ===')
      console.log(payment.point_of_interaction.transaction_data.qr_code_base64)
      console.log('=== ID DO PAGAMENTO ===')
      console.log(payment.id)
      console.log('========================')

      // Salvar novo log
      await paymentLogRepository.create({
        paymentId: payment.id.toString(),
        status: 'pending',
        amount: Number(valor),
        customerEmail: email,
        customerName: nome,
        customerCpf: cpf,
        userId: 'pending'
      })

      return {
        qrCode: payment.point_of_interaction.transaction_data.qr_code,
        qrCodeBase64: payment.point_of_interaction.transaction_data.qr_code_base64,
        paymentId: payment.id
      }
    } catch (error) {
      console.error("Erro ao gerar PIX:", error)
      throw new Error("Falha ao gerar pagamento PIX")
    }
  }

  async getPaymentStatus(paymentId: number): Promise<PaymentStatusResponse> {
    try {
      const payment = await this.client.get({ id: paymentId })

      if (!payment.status || !payment.id) {
        throw new Error("Resposta do Mercado Pago incompleta")
      }

      const status = payment.status as PaymentStatusResponse['status']
      if (!['pending', 'approved', 'rejected', 'cancelled'].includes(status)) {
        throw new Error("Status de pagamento inválido")
      }

      // Buscar log existente para atualizar
      const existingLog = await paymentLogRepository.findByPaymentId(payment.id.toString())
      
      if (existingLog && status !== existingLog.status) {
        // Se foi aprovado
        if (status === 'approved') {
          // Atualizar permissão do usuário para PRO
          await prisma.usuarios.update({
            where: { 
              id: Number(existingLog.userId)
            },
            data: { 
              permissao: 'PRO'
            }
          })

          // Retornar com redirect para página de sucesso
          return {
            status,
            paymentId: payment.id,
            redirect: '/dashboard/plans/checkout/success'
          }
        }

        // Atualizar status no log
        await paymentLogRepository.update(existingLog.paymentId, {
          status: status
        })
      }

      return {
        status,
        paymentId: payment.id
      }
    } catch (error) {
      console.error("Erro ao verificar status:", error)
      throw new Error("Falha ao verificar status do pagamento")
    } finally {
      await paymentLogRepository.close()
    }
  }
}
