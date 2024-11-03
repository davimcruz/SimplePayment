"use client"

import Link from "next/link"
import { BoxReveal } from "@/app/components/ui/box-reveal"
import { Button } from "@/app/components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-black overflow-hidden">
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 px-4">
        <BoxReveal boxColor="#10b981" duration={0.5}>
          <h1 className="text-[8rem] font-bold text-white">
            4<span className="text-[#10b981]">0</span>4
          </h1>
        </BoxReveal>

        <BoxReveal boxColor="#10b981" duration={0.5}>
          <h2 className="text-2xl text-gray-300 text-center">
            Página não<span className="text-[#10b981]"> encontrada</span>
          </h2>
        </BoxReveal>

        <BoxReveal boxColor="#10b981" duration={0.5}>
          <p className="text-gray-400 text-center max-w-md text-lg">
            Desculpe, a página que você está procurando não existe ou foi movida.
          </p>
        </BoxReveal>

        <BoxReveal boxColor="#10b981" duration={0.5}>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              variant="outline"
              className="border-[#10b981] hover:bg-[#10b981]/10 text-white"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Home
              </Link>
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
      </div>
    </div>
  )
}
