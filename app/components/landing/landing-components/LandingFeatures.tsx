import { CalendarIcon, FileTextIcon } from "@radix-ui/react-icons";
import { BellIcon, Share2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/app/components/ui/calendar";
import { BentoCard, BentoGrid } from "@/app/components/ui/bento-grid";
import Marquee from "@/app/components/ui/marquee";
import { AnimatedListDemo } from "./Notifications";
import { AnimatedBeamMultipleOutputDemo } from "./AnimatedBeam";

const files = [
  {
    name: "R$ 249,90",
    body: "Compra do mês no Supermercado Pão de Açúcar - 27/11/2024",
  },
  {
    name: "R$ 89,90",
    body: "Assinatura mensal Netflix - Débito automático - 25/11/2024",
  },
  {
    name: "R$ 1.250,00",
    body: "Pagamento do aluguel - Transferência bancária - 10/11/2024",
  },
  {
    name: "R$ 180,50",
    body: "Abastecimento no Posto Shell - Cartão de crédito - 05/11/2024",
  },
  {
    name: "R$ 75,00",
    body: "Farmácia São Paulo - Medicamentos - Cartão de débito - 01/11/2024",
  },
];

const features = [
  {
    Icon: FileTextIcon,
    name: "Gestão de Transações",
    description:
      "Acompanhe todas as suas transações financeiras em um só lugar. ",
    href: "/dashboard",
    cta: "Saiba mais",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [--duration:20s] [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] "
      >
        {files.map((f, idx) => (
          <figure
            key={idx}
            className={cn(
              "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
              "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
              "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
              "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none"
            )}
          >
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col">
                <figcaption className="text-sm font-medium dark:text-white">
                  {f.name}
                </figcaption>
              </div>
            </div>
            <blockquote className="mt-2 text-xs">{f.body}</blockquote>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: BellIcon,
    name: "Análise de Desempenho",
    description:
      "Acompanhe seu desempenho financeiro com gráficos e insights detalhados.",
    href: "/dashboard",
    cta: "Saiba mais",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedListDemo className="absolute right-2 top-4 h-[300px] w-full border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
    ),
  },
  {
    Icon: Share2Icon,
    name: "Gerencie todas as suas contas",
    description: "Tenha controle total sobre seus bancos e cartões com uma interface intuitiva.",
    href: "/dashboard",
    cta: "Saiba mais",
    className: "col-span-3 lg:col-span-2",
    background: (
      <AnimatedBeamMultipleOutputDemo className="absolute right-2 top-4 h-[300px] border-none transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)] group-hover:scale-105" />
    ),
  },
  {
    Icon: CalendarIcon,
    name: "Planeje seus gastos",
    description:
      "Planeje e acompanhe seus compromissos financeiros com facilidade.",
    className: "col-span-3 lg:col-span-1",
    href: "/dashboard",
    cta: "Saiba mais",
    background: (
      <Calendar
        mode="single"
        selected={new Date(2024, 4, 11, 0, 0, 0)}
        className="absolute right-0 top-10 origin-top rounded-md border transition-all duration-300 ease-out [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] group-hover:scale-105"
      />
    ),
  },
]

const LandingFeatures = () => {
  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Recursos <span className="text-emerald-500">Eficientes</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Ferramentas poderosas para simplificar sua gestão financeira
          </p>
        </div>

        <BentoGrid>
          {features.map((feature, idx) => (
            <BentoCard key={idx} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </section>
  )
};

export default LandingFeatures;
