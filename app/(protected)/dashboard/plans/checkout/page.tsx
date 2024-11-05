"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/app/components/ui/card"
import { toast } from "sonner"
import { parseCookies } from "nookies"
import { CheckoutForm } from "@/app/components/dashboard/plans/checkout/CheckoutForm"
import { QRCodeDisplay } from "@/app/components/dashboard/plans/checkout/QRCodeDisplay"
import { CheckoutFormData } from "@/lib/validation"

const PLAN_PRICE = 1.00 // Alterar também no PaymentController.ts
const PAYMENT_CHECK_INTERVAL = 3000

interface User {
  id: number
  email: string
  nome: string
  sobrenome: string
}

interface CheckoutState {
  nome: string
  email: string
  cpf: string
  userId: number | null
  isLoading: boolean
  showQRCode: boolean
  qrCodeData: string
  paymentId: string | null
}

export default function CheckoutPage() {
  const router = useRouter()
  const [state, setState] = useState<CheckoutState>({
    nome: "",
    email: "",
    cpf: "",
    userId: null,
    isLoading: false,
    showQRCode: false,
    qrCodeData: "",
    paymentId: null
  })

  const fetchUserData = useCallback(async () => {
    
    try {
      const { userId } = parseCookies()
      if (!userId) {
        toast.error("Sessão expirada. Por favor, faça login novamente.")
        router.push("/signin")
        return
      }

      const response = await fetch(`/api/users/get-user?userId=${userId}`)
      if (!response.ok) {
        throw new Error("Erro ao buscar dados do usuário")
      }

      const userData: User = await response.json()
      setState(prev => ({
        ...prev,
        nome: `${userData.nome} ${userData.sobrenome}`,
        email: userData.email,
        userId: userData.id
      }))
    } catch (error) {
      toast.error("Erro ao carregar seus dados. Tente novamente.")
      console.error("Erro ao carregar dados:", error)
    }
  }, [router])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  const handleSubmit = async (data: CheckoutFormData) => {
    const loadingToast = toast.loading("Gerando QR Code PIX...")
    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const response = await fetch("/api/payment/get-pix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          userId: state.userId
        }),
      })

      const responseData = await response.json()
      
      if (!response.ok) {
        throw new Error(responseData.error || "Erro ao gerar pagamento")
      }
      
      setState(prev => ({
        ...prev,
        qrCodeData: responseData.qrCode,
        paymentId: responseData.paymentId,
        showQRCode: true,
        isLoading: false
      }))
      toast.dismiss(loadingToast)
      toast.success("QR Code PIX gerado com sucesso!")
    } catch (error) {
      toast.dismiss(loadingToast)
      toast.error("Erro ao gerar pagamento. Tente novamente.")
      console.error("Erro ao gerar PIX:", error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout

    const checkPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payment/get-status?paymentId=${state.paymentId}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Erro ao verificar status")
        }

        if (data.status === "approved") {
          toast.success("Pagamento aprovado! Redirecionando...")
          clearInterval(interval)
          router.push("/dashboard")
        }
      } catch (error) {
        console.error("Erro ao verificar status:", error)
      }
    }

    if (state.paymentId && state.showQRCode) {
      interval = setInterval(checkPaymentStatus, PAYMENT_CHECK_INTERVAL)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [state.paymentId, state.showQRCode, router])

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout do Plano PRO</h1>
      
      <Card className="p-6 bg-gradient-to-t from-background/10 to-primary/10">
        <div className="space-y-6">
          {!state.showQRCode ? (
            <CheckoutForm 
              nome={state.nome}
              email={state.email}
              cpf={state.cpf}
              isLoading={state.isLoading}
              onSubmit={handleSubmit}
            />
          ) : (
            <QRCodeDisplay 
              qrCodeData={state.qrCodeData}
              price={PLAN_PRICE}
              onBack={() => setState(prev => ({ ...prev, showQRCode: false }))}
            />
          )}
        </div>
      </Card>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        <p>Após a confirmação do pagamento, seu plano será atualizado automaticamente</p>
      </div>
    </div>
  )
}
