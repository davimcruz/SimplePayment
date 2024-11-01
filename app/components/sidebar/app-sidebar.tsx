"use client"
import { parseCookies } from "nookies"
import {
  Calendar,
  ChevronUp,
  CreditCard,
  Home,
  Inbox,
  LogOut,
  Search,
  Settings,
  User,
  Wallet,
} from "lucide-react"
import { useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu"
import { Badge } from "../ui/badge"
import { cn } from "@/lib/utils"
import useSWR from "swr"
import { Separator } from "../ui/separator"
import Image from "next/image"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"
import { useEffect, useState } from "react"
import VisaIcon from "@/public/visa.svg"
import MastercardIcon from "@/public/mastercard.svg"
import AmexIcon from "@/public/amex.svg"
import EloIcon from "@/public/elo.svg"
import HipercardIcon from "@/public/hipercard.svg"

interface UserData {
  id?: string
  nome?: string
  sobrenome?: string
  email?: string
  image?: string | null
  permissao?: 'admin' | 'pro' | 'free'
}

const items = [
  {
    title: "Dashboard",
    url: "/dashboard/",
    icon: Home,
  },
  {
    title: "Transações",
    url: "/dashboard/transactions/",
    icon: Inbox,
  },
  {
    title: "Fluxo de Caixa",
    url: "/dashboard/cashflow/",
    icon: Calendar,
  },
]

const fetcher = async (url: string) => {
  const cookies = parseCookies()
  const userId = cookies.userId

  if (!userId) return {
    image: '/profile.png',
    nome: 'User',
    sobrenome: '',
    email: '',
    permissao: 'free' as const
  }

  try {
    const response = await fetch(`${url}?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    
    if (!response.ok) {
      throw new Error('Erro ao carregar dados do usuário')
    }

    const data = await response.json()
    return {
      ...data,
      image: data.image || '/profile.png'
    }
  } catch (error) {
    return {
      image: '/profile.png',
      nome: 'User',
      sobrenome: '',
      email: '',
      permissao: 'free' as const
    }
  }
}

interface AppSidebarProps {
  initialData: UserData 
}

// Defina um tipo para as bandeiras possíveis
type CardBrand = 'Visa' | 'Mastercard' | 'American Express' | 'Elo' | 'Hipercard';

interface CardType {
  cardId: string
  nomeCartao: string
  bandeira: CardBrand
  limite?: string
  vencimento?: string
  tipoCartao: "credito"
}

const cardIcons = {
  'Visa': VisaIcon,
  'Mastercard': MastercardIcon,
  'American Express': AmexIcon,
  'Elo': EloIcon,
  'Hipercard': HipercardIcon,
} as const;

export function AppSidebar({ initialData }: AppSidebarProps) {
  const router = useRouter()
  const cookies = parseCookies()
  const { data: userData, isLoading } = useSWR<UserData>('/api/users/get-user', fetcher, {
    fallbackData: initialData,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    revalidateOnMount: false,
    dedupingInterval: 60000,
    suspense: false,
  })

  const [cards, setCards] = useState<CardType[]>([])

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch(`/api/cards/get-card?userId=${cookies.userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })

        const data = await response.json()
        if (Array.isArray(data.cartoes)) {
          setCards(data.cartoes)
        }
      } catch (error) {
        console.error("Erro ao buscar cartões:", error)
      }
    }

    if (cookies.userId) {
      fetchCards()
    }
  }, [cookies.userId])

  if (isLoading || !userData) {
    return (
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 mt-2">
            <Wallet className="w-4 h-4 ml-2" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Carregando...</SidebarGroupLabel>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
    )
  }

  const handleLogout = () => {
    const cookiesToDelete = ['token', 'userId']
    
    cookiesToDelete.forEach(cookieName => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    })

    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=')
      document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    })

    router.push('/signin')
    router.refresh() 
  }

  const handleSettings = () => {
    router.push("/dashboard/settings")
  }
console.log(userData)
  return (
    <Sidebar collapsible="icon" className="backdrop-blur-md bg-white/80 dark:bg-zinc-900 overflow-hidden">
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 ml-2 mt-4 group-data-[collapsible=icon]:block hidden" />
          <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <Wallet className="w-12 h-12 p-2 border-zinc-50 rounded-lg" />
            <Separator orientation="vertical" className="h-10 mx-1" />
            <div className="flex flex-col">
              <span className="text-md font-bold">SimpleFinance</span>
              <span className="text-xs text-zinc-400">Seu gerenciador financeiro</span>
            </div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Explore nossas opções</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.filter(item => item.title !== "Cartões de Crédito").map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <CreditCard />
                      <span>Cartões de Crédito</span>
                      <ChevronUp className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=closed]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-x-hidden">
                    <SidebarMenu className="ml-4 mt-2">
                      {cards.map((card) => {
                        const CardIcon = cardIcons[card.bandeira] || CreditCard
                        return (
                          <SidebarMenuItem key={card.cardId}>
                            <SidebarMenuButton asChild>
                              <a href={`/dashboard/cards/${card.cardId}`}>
                                <Image src={CardIcon} alt={card.bandeira} width={20} height={20} />
                                <span>{card.nomeCartao}</span>
                              </a>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        )
                      })}
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild>
                          <a href="/dashboard/cards">
                            <span className="text-xs text-muted-foreground">Ver todos os cartões</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Separator orientation="horizontal"/>
        <SidebarMenu className="space-y-2">
          <SidebarMenuItem>
            <div className="group-data-[collapsible=icon]:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild className="h-auto">
                  <SidebarMenuButton>
                    <Image
                      src={userData.image || "/profile.png"}
                      alt={`${userData.nome || "User"} profile`}
                      width={48}
                      height={48}
                      className="rounded-sm object-cover"
                      priority
                    />
                    <Separator orientation="vertical" className="h-12 mx-1" />
                    <div className="flex flex-col gap-1">
                      <span className="px-2">
                        {userData.nome && userData.sobrenome
                          ? `${userData.nome} ${userData.sobrenome}`
                          : "Username"}
                      </span>
                      <div className="flex justify-start">
                        <Badge
                          variant={
                            userData.permissao === "admin"
                              ? "destructive"
                              : userData.permissao === "pro"
                              ? "premium"
                              : "secondary"
                          }
                          className={cn(
                            "font-bold",
                            userData.permissao === "admin" &&
                              "bg-red-500/10 text-red-500 hover:bg-red-500/20",
                            userData.permissao === "pro" &&
                              "bg-violet-500/10 text-violet-500 hover:bg-violet-500/20",
                            userData.permissao === "free" &&
                              "bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/20"
                          )}
                        >
                          {userData.permissao === "admin"
                            ? "Administrador"
                            : userData.permissao === "pro"
                            ? "Usuário Pro"
                            : "Usuário Gratuito"}
                        </Badge>
                      </div>
                    </div>
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[--radix-popper-anchor-width]"
                >
                  <DropdownMenuLabel>
                    {userData.email || "Minha Conta"}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSettings}>
                    <Settings className="mr-2 size-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="hidden group-data-[collapsible=icon]:block">
              <SidebarMenuButton onClick={handleLogout}>
                <LogOut />
              </SidebarMenuButton>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
