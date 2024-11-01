import { Button } from "@/app/components/ui/button"
import { cn } from "@/lib/utils"
import AnimatedGridPattern from "@/app/components/ui/animated-grid-pattern"
import Particles from "@/app/components/ui/particles"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

const LandingHero = () => {
  const [rotation, setRotation] = useState({ x: 10, y: 0 })

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const card = event.currentTarget
    const rect = card.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const rotateY = (x / rect.width - 0.5) * 20
    const rotateX = (y / rect.height - 0.5) * -20

    setRotation({ x: rotateX, y: rotateY })
  }

  const handleMouseLeave = () => {
    setRotation({ x: 10, y: 0 })
  }

  return (
    <main className="flex flex-col items-center justify-center pt-24 px-4">
      <div className="text-center space-y-6 max-w-4xl mx-auto mt-12">
        <Particles
          className="absolute inset-0 z-[50]"
          quantity={100}
          ease={80}
          color="#2662d9"
          refresh
        />

        <div className="relative">
          <h1 className="relative z-[60] text-4xl md:text-6xl lg:text-7xl font-bold text-white">
            Planeje suas Finanças com{" "}
            <span className="text-[#2662d9]">SimpleFinance</span>
          </h1>
          <AnimatedGridPattern
            numSquares={100}
            maxOpacity={0.1}
            duration={3}
            repeatDelay={1}
            className={cn(
              "[mask-image:radial-gradient(1000px_circle_at_center,white,transparent)]",
              "absolute inset-x-[-50vw] inset-y-[-100%] h-[1000%] w-[200vw] left-1/2 -translate-x-1/2 translate-y-[-30%] skew-y-12 z-[40]"
            )}
          />
        </div>

        <p className="relative z-[60] text-xl text-gray-400">
          Onde a gestão encontra a simplicidade.
          <br />
          Deixe a burocracia conosco.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6 relative z-[60]">
          <Button
            size="lg"
            className="bg-[#2662d9] hover:bg-[#2662d9]/90 text-white"
            asChild
          >
            <Link href="/signup">
              Vamos Começar?
            </Link>
          </Button>
        </div>

        <div
          className="relative mt-16 max-w-[90vw] z-[60] perspective-[2000px]"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <Image
            src="/dashboard.png"
            alt="Dashboard Preview"
            width={1200}
            height={600}
            className="rounded-xl shadow-2xl transition-transform duration-300 ease-out"
            style={{
              transform: `perspective(2000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              transformOrigin: "center",
            }}
            priority
          />
        </div>
      </div>
    </main>
  )
}

export default LandingHero
