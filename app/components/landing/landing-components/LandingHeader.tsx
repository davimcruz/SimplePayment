import { Button } from "@/app/components/ui/button"
import { LogIn } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const Header = () => {
  const scrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const featuresSection = document.getElementById('features')
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const scrollToAbout = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const aboutSection = document.getElementById('about')
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav className="fixed top-0 w-full z-[100]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3 flex-shrink-0 w-[200px] md:w-[220px]">
              <Image
                src="/logo.svg"
                alt="SimpleFinance"
                width={48}
                height={48}
                priority
              />
              <span className="text-white font-semibold text-xl whitespace-nowrap">
                SimpleFinance
              </span>
            </div>

            <div className="hidden md:flex items-center justify-center flex-1 mx-4">
              <div className="flex items-center gap-8">
                <Link
                  href=""
                  onClick={scrollToFeatures}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  O que fazemos
                </Link>
                <Link
                  href=""
                  onClick={scrollToAbout}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Quem Somos
                </Link>
                {/* <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                  Nossos Serviços
                </Link>
                <Link href="#" className="text-gray-300 hover:text-white transition-colors">
                  Planos Acessíveis
                </Link> */}
              </div>
            </div>

            <div className="flex items-center flex-shrink-0 w-[200px] md:w-[220px] justify-end">
              <Button
                variant="default"
                className="bg-emerald-500 hover:bg-emerald-800/90 flex items-center gap-2 text-zinc-800 hover:text-white transition-colors font-semibold"
                asChild
              >
                <Link href="/signin">
                  <LogIn className="w-4 h-4" />
                  <span className="whitespace-nowrap">Fazer Login</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Header
