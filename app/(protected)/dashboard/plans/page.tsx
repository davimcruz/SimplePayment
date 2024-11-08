"use client"

import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useUserData } from "@/app/components/hooks/useUserData"
import PlanCard from "@/app/components/plans/PlanCard"

const PlansPage = () => {
  const router = useRouter()
  const { user, loading: isLoading, error } = useUserData()

  const handleSelectPlan = (plan: string) => {
    if (!user) {
      toast.error("Erro ao verificar usuário")
      return
    }

    if (plan === user.permissao) {
      toast.info("Você já está neste plano!")
      return
    }

    if (plan === "pro") {
      router.push("/dashboard/plans/checkout")
      return
    }
  }

  const plans = [
    {
      name: "Gratuito",
      price: "Grátis",
      description: "Perfeito para começar a organizar suas finanças",
      features: [
        { text: "Suporte via email", included: true },
        { text: "Controle de despesas ilimitado", included: true },
        { text: "Análise básica de gastos", included: true },
        { text: "Limite de 3 cartões de crédito cadastrados", included: true },
        { text: "Análise avançada com IA", included: false },
        { text: "Relatórios personalizados", included: false },
      ],
      buttonText:
        user?.permissao === "free"
          ? "Plano Atual"
          : user?.permissao === "pro"
          ? "Você já é um membro Pro"
          : "Selecionar Plano",
      popular: false,
      disabled: user?.permissao === "free" || user?.permissao === "pro",
    },
    {
      name: "PRO",
      price: "R$ 1,00",
      description: "Para quem quer levar as finanças ao próximo nível",
      features: [
        { text: "Suporte via email", included: true },
        { text: "Controle de despesas ilimitado", included: true },
        { text: "Análise básica de gastos", included: true },
        { text: "Limite de 10 cartões de crédito cadastrados", included: true },
        { text: "Análise avançada com IA", included: true },
        { text: "Relatórios personalizados", included: true },
      ],
      buttonText:
        user?.permissao === "pro" ? "Plano Atual" : "Virar membro Pro",
      popular: true,
      disabled: user?.permissao === "pro",
    },
  ]

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Planos e Preços</h1>
        <p className="text-muted-foreground mt-2">
          Escolha o plano perfeito para suas necessidades financeiras
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full ">
        {plans.map((plan) => (
          <PlanCard
            key={plan.name}
            {...plan}
            onSelect={() => handleSelectPlan(plan.name.toLowerCase())}
          />
        ))}
      </div>
    </div>
  )
}

export default PlansPage
