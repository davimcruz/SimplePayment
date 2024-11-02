import { Button } from "@/app/components/ui/button"
import { BoxReveal } from "@/app/components/ui/box-reveal"
import { Shield, Users, TrendingUp, HeartHandshake } from "lucide-react"
import NumberTicker from "../../ui/number-ticker"

const AboutUs = () => {
  return (
    <section id="about" className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <BoxReveal boxColor="#10b981" duration={0.5}>
            <p className="text-[3rem] font-bold text-white">
              Quem<span className="text-[#10b981]"> Somos</span>
            </p>
          </BoxReveal>

          <BoxReveal boxColor="#10b981" duration={0.5}>
            <h2 className="mt-2 text-[1.2rem] text-gray-300">
              Uma empresa focada em
              <span className="text-[#10b981]">
                {" "}
                transformar sua relação com o dinheiro
              </span>
            </h2>
          </BoxReveal>
        </div>

        {/* Grid de valores - Espaçamento reduzido */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <BoxReveal boxColor="#10b981" duration={0.5}>
            <div className="bg-gradient-to-br from-background/10 to-primary/10 p-8 rounded-xl border-[0.5px] border-zinc-800">
              <Shield className="w-12 h-12 text-white mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">
                Segurança em Primeiro Lugar
              </h3>
              <p className="text-gray-400">
                Utilizamos as mais avançadas tecnologias de criptografia e
                proteção de dados. Sua privacidade financeira é nossa prioridade
                absoluta.
              </p>
            </div>
          </BoxReveal>

          <BoxReveal boxColor="#10b981" duration={0.5}>
            <div className="bg-gradient-to-br from-background/10 to-primary/10 p-8 rounded-xl border-[0.5px] border-zinc-800">
              <Users className="w-12 h-12 text-white mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">
                Time Especializado
              </h3>
              <p className="text-gray-400">
                Nossa equipe é formada por especialistas em finanças, tecnologia
                e experiência do usuário, prontos para apoiar sua jornada
                financeira.
              </p>
            </div>
          </BoxReveal>

          <BoxReveal boxColor="#10b981" duration={0.5}>
            <div className="bg-gradient-to-br from-background/10 to-primary/10 p-8 rounded-xl border-[0.5px] border-zinc-800">
              <TrendingUp className="w-12 h-12 text-white mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">
                Inovação Constante
              </h3>
              <p className="text-gray-400">
                Estamos sempre atualizando nossa plataforma com as últimas
                tecnologias e tendências do mercado financeiro para oferecer a
                melhor experiência.
              </p>
            </div>
          </BoxReveal>

          <BoxReveal boxColor="#10b981" duration={0.5}>
            <div className="bg-gradient-to-br from-background/10 to-primary/10 p-8 rounded-xl border-[0.5px] border-zinc-800">
              <HeartHandshake className="w-12 h-12 text-white mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">
                Compromisso com Resultados
              </h3>
              <p className="text-gray-400">
                Nosso sucesso é medido pelo seu sucesso financeiro. Trabalhamos
                incansavelmente para ajudá-lo a alcançar seus objetivos.
              </p>
            </div>
          </BoxReveal>
        </div>

        <div className="flex justify-center mb-20">
          <BoxReveal boxColor="#10b981" duration={0.5}>
            <div className="grid grid-cols-3 md:grid-cols-3 gap-8 max-w-4xl">
              <div className="text-center">
                <p className="text-4xl font-bold text-white">
                  <NumberTicker value={10} />
                  k+
                </p>
                <p className="text-gray-400 mt-2">Transações</p>
              </div>

              <div className="text-center">
                <p className="text-4xl font-bold text-white">
                  <NumberTicker value={99.9} decimalPlaces={1} />%
                </p>
                <p className="text-gray-400 mt-2">Uptime</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-white">
                  <NumberTicker value={24} />/
                  <NumberTicker value={7} direction="up" />
                </p>
                <p className="text-gray-400 mt-2">Suporte</p>
              </div>
            </div>
          </BoxReveal>
        </div>

        <div className="flex justify-center">
          <BoxReveal boxColor="#10b981" duration={0.5}>
            <div className="text-center max-w-3xl">
              <p className="text-xl text-gray-400 mb-6">
                Junte-se a milhares de pessoas que já transformaram sua vida
                financeira com o SimpleFinance. Comece sua jornada hoje mesmo.
              </p>
              <Button
                size="lg"
                className="bg-[#10b981] hover:bg-[#10b981]/90 text-zinc-800 font-semibold px-8"
                asChild
              >
                <a href="#features">Conheça Nossos Recursos</a>
              </Button>
            </div>
          </BoxReveal>
        </div>
      </div>
    </section>
  )
}

export default AboutUs
