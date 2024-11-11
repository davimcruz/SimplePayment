"use client"

import Link from "next/link"
import { BoxReveal } from "@/app/components/ui/box-reveal"
import { Button } from "@/app/components/ui/button"
import { WifiOff, RefreshCcw, Home } from "lucide-react"

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="flex flex-col min-h-screen bg-black overflow-hidden">
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-4 -mt-8">
        <BoxReveal boxColor="#10b981" duration={0.5}>
          <div className="flex items-center justify-center">
            <WifiOff className="text-[8rem] text-white" />
          </div>
        </BoxReveal>

        <BoxReveal boxColor="#10b981" duration={0.5}>
          <h2 className="text-2xl text-gray-300 text-center">
            Você está<span className="text-[#10b981]"> Offline</span>
          </h2>
        </BoxReveal>

        <BoxReveal boxColor="#10b981" duration={0.5}>
          <p className="text-gray-400 text-center max-w-md text-lg">
            Parece que você está sem conexão com a internet. Verifique sua
            conexão e tente novamente.
          </p>
        </BoxReveal>

        <BoxReveal boxColor="#10b981" duration={0.5}>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              variant="outline"
              className="border-[#10b981] hover:bg-[#10b981]/10 text-white"
              onClick={handleRefresh}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>

            <Button
              size="lg"
              className="bg-[#10b981] hover:bg-[#047857]/90 text-zinc-800 font-semibold"
              asChild
            >
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Ir para Dashboard
              </Link>
            </Button>
          </div>
        </BoxReveal>

        <BoxReveal boxColor="#10b981" duration={0.5}>
          <div className="mt-4 text-sm text-gray-500 text-center">
            <p>Algumas funcionalidades podem estar disponíveis offline.</p>
            <p>Seus dados serão sincronizados quando você voltar online.</p>
          </div>
        </BoxReveal>
      </div>
    </div>
  )
}
