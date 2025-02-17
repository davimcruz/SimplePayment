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
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-2 md:gap-3">
              <Image
                src="/logos/logo.svg"
                alt="SimpleFinance"
                className="w-[30px] h-[30px] md:w-[42px] md:h-[42px]"
                width={42}
                height={42}
                priority
              />
              <span className="text-white font-semibold text-lg md:text-xl whitespace-nowrap hidden md:block">
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
              </div>
            </div>

            <Button
              variant="default"
              className="bg-emerald-800 hover:bg-emerald-800/90 flex items-center gap-1 text-white transition-colors font-semibold px-3 md:px-4 h-9 md:h-10"
              asChild
            >
              <Link href="/signin">
                <LogIn className="w-4 h-4" />
                <span className="whitespace-nowrap text-sm md:text-base">Fazer Login</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Header
