"use client"

import { toast } from "sonner"
import PlanCard from "@/app/components/plans/PlanCard"

const PlansPage = () => {
  const handleSelectPlan = (plan: string) => {
    if (plan === "pro") {
      toast.info("Em breve! O plano PRO estará disponível em breve.")
      return
    }
    toast.success("Você já está no plano gratuito!")
  }

  const plans = [
    {
      name: "Gratuito",
      price: "Grátis",
      description: "Perfeito para começar a organizar suas finanças",
      features: [
        { text: "Controle de despesas ilimitado", included: true },
        { text: "Análise básica de gastos", included: true },
        { text: "Categorização de transações", included: true },
        { text: "Suporte via email", included: true },
        { text: "Análise avançada com IA", included: false },
        { text: "Relatórios personalizados", included: false },
      ],
      buttonText: "Plano Atual",
      popular: false,
    },
    {
      name: "PRO",
      price: "R$ 19,90",
      description: "Para quem quer levar as finanças ao próximo nível",
      features: [
        { text: "Controle de despesas ilimitado", included: true },
        { text: "Análise básica de gastos", included: true },
        { text: "Categorização de transações", included: true },
        { text: "Suporte via email", included: true },
        { text: "Análise avançada com IA", included: true },
        { text: "Relatórios personalizados", included: true },
      ],
      buttonText: "Virar membro Pro",
      popular: true,
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
