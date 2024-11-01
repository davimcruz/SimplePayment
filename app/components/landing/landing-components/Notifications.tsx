"use client"

import { cn } from "@/lib/utils"
import { AnimatedList } from "@/app/components/ui/animated-list"

interface Item {
  name: string
  description: string
  icon: string
  color: string
  time: string
}

let notifications = [
  {
    name: "Status de Janeiro",
    description: "Controle melhor seus gastos pós-festas",
    time: "2h atrás",
    icon: "⚠️",
    color: "#FF3D71",
  },
  {
    name: "Status de Fevereiro",
    description: "Excelente controle financeiro! Continue assim",
    time: "5h atrás",
    icon: "🌟",
    color: "#00C9A7",
  },
  {
    name: "Status de Março",
    description: "Atenção com gastos em delivery",
    time: "8h atrás",
    icon: "😐",
    color: "#FFB800",
  },
  {
    name: "Status de Abril",
    description: "Cuidado com parcelamentos no cartão",
    time: "12h atrás",
    icon: "👎",
    color: "#FF3D71",
  },
  {
    name: "Status de Maio",
    description: "Suas economias estão rendendo bem!",
    time: "1d atrás",
    icon: "🌟",
    color: "#00C9A7",
  },
  {
    name: "Status de Junho",
    description: "Planeje-se para as férias com antecedência",
    time: "2d atrás",
    icon: "👍",
    color: "#1E86FF",
  },
  {
    name: "Status de Julho",
    description: "Gastos com lazer acima do orçamento",
    time: "3d atrás",
    icon: "⚠️",
    color: "#FF3D71",
  },
  {
    name: "Status de Agosto",
    description: "Bom momento para investir em renda fixa",
    time: "4d atrás",
    icon: "😐",
    color: "#FFB800",
  },
  {
    name: "Status de Setembro",
    description: "Meta de economia mensal alcançada!",
    time: "5d atrás",
    icon: "🌟",
    color: "#00C9A7",
  },
  {
    name: "Status de Outubro",
    description: "Comece a planejar as compras de fim de ano",
    time: "6d atrás",
    icon: "👍",
    color: "#1E86FF",
  },
  {
    name: "Status de Novembro",
    description: "Aproveite as ofertas da Black Friday com sabedoria",
    time: "1sem atrás",
    icon: "😐",
    color: "#FFB800",
  },
  {
    name: "Status de Dezembro",
    description: "Ótimo mês para presentear com responsabilidade",
    time: "2sem atrás",
    icon: "🌟",
    color: "#00C9A7",
  },
]

notifications = Array.from({ length: 10 }, () => notifications).flat()

const Notification = ({ name, description, icon, color, time }: Item) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full max-w-[400px] cursor-pointer overflow-hidden rounded-2xl p-4",
        "transition-all duration-200 ease-in-out hover:scale-[103%]",
        "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
        "transform-gpu dark:bg-transparent dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      )}
    >
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-10 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium dark:text-white">
            <span className="text-sm sm:text-lg">{name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-gray-500">{time}</span>
          </figcaption>
          <p className="text-sm font-normal dark:text-white/60">
            {description}
          </p>
        </div>
      </div>
    </figure>
  )
}

export function AnimatedListDemo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex h-[500px] w-full flex-col p-6 overflow-hidden rounded-lg border md:shadow-xl",
        className
      )}
    >
      <AnimatedList delay={1500}>
        {notifications.map((item, idx) => (
          <Notification {...item} key={idx} />
        ))}
      </AnimatedList>
    </div>
  )
}
