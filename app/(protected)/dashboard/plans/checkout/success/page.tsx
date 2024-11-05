'use client'

import { Card } from "@/app/components/ui/card"
import { Check } from "lucide-react"
import Link from "next/link"
import { Button } from "@/app/components/ui/button"

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 pb-4 py-8 md:-mt-8">
      <Card className="max-w-2xl w-full p-4 sm:p-8 text-center bg-gradient-to-tr from-background/10 to-primary/10">
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          <h1 className="text-2xl sm:text-3xl font-bold">
            Bem-vindo ao SimpleFinance{" "}
            <span className="text-emerald-500">PRO</span> 🎉
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground">
            Seu pagamento foi confirmado com sucesso
          </p>

          <div className="my-6 sm:my-8 space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold">
              Seus benefícios <span className="text-emerald-500">PRO</span> incluem:
            </h2>

            <ul className="text-left space-y-3 text-sm sm:text-base">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span>Acesso ilimitado a todas as funcionalidades</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span>Relatórios financeiros detalhados</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span>Planejamento financeiro avançado</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span>Análises por inteligência artificial</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span>Suporte prioritário</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span>Backup automático dos seus dados</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">

            <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard/settings">Configurar Conta</Link>
              </Button>
              <Button className="w-full sm:w-auto bg-emerald-700 hover:bg-emerald-600 text-white font-semibold" asChild>
                <Link href="/dashboard">Ir para o Dashboard</Link>
              </Button>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground px-2">
              Comece agora mesmo a aproveitar todos os benefícios da sua conta
              PRO!
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
