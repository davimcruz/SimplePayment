"use client"
import { parseCookies, destroyCookie } from "nookies"
import {
  Calendar,
  ChevronUp,
  CreditCard,
  Home,
  Inbox,
  LogOut,
  Settings,
  Wallet,
  PlusCircle,
  ListOrdered,
  Crown,
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
  SidebarMenuSub,
  SidebarMenuSubItem,
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
import useSWR, { mutate } from "swr"
import { Separator } from "../ui/separator"
import Image from "next/image"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"
import { useEffect, useState, useCallback } from "react"
import VisaIcon from "@/public/cards/visa.svg"
import MastercardIcon from "@/public/cards/mastercard.svg"
import AmexIcon from "@/public/cards/amex.svg"
import EloIcon from "@/public/cards/elo.svg"
import HipercardIcon from "@/public/cards/hipercard.svg"
import CreateTransaction from "../create-transactions/CreateTransactions"
import { toast } from "sonner"

interface UserData {
  id?: string
  nome?: string
  sobrenome?: string
  email?: string
  image?: string | null
  permissao?: "admin" | "pro" | "free"
}

const items = [
  {
    title: "Painel Admin",
    url: "/dashboard/admin",
    icon: Settings,
    adminOnly: true,
  },
  {
    title: "Dashboard",
    url: "/dashboard/",
    icon: Home,
    adminOnly: false,
  },
]

const fetcher = async (url: string) => {
  const cookies = parseCookies()
  const userId = cookies.userId

  if (!userId)
    return {
      image: "/utilities/profile.png",
      nome: "User",
      sobrenome: "",
      email: "",
      permissao: "free" as const,
    }

  try {
    const response = await fetch(`${url}?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Erro ao carregar dados do usuário")
    }

    const data = await response.json()
    return {
      ...data,
      image: data.image || "/utilities/profile.png",
    }
  } catch (error) {
    return {
      image: "/utilities/profile.png",
      nome: "User",
      sobrenome: "",
      email: "",
      permissao: "free" as const,
    }
  }
}

interface AppSidebarProps {
  initialData: UserData
}

type CardBrand =
  | "Visa"
  | "Mastercard"
  | "American Express"
  | "Elo"
  | "Hipercard"

interface CardType {
  cardId: string
  nomeCartao: string
  bandeira: CardBrand
  limite?: string
  vencimento?: string
  tipoCartao: "credito"
}

const cardIcons = {
  Visa: VisaIcon,
  Mastercard: MastercardIcon,
  "American Express": AmexIcon,
  Elo: EloIcon,
  Hipercard: HipercardIcon,
} as const

export function AppSidebar({ initialData }: AppSidebarProps) {
  const router = useRouter()
  const cookies = parseCookies()

  const { data: userData = initialData, mutate: mutateUser } = useSWR<UserData>(
    "/api/users/get-user",
    fetcher,
    {
      fallbackData: initialData,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      revalidateIfStale: false,
      revalidateOnMount: true,
      dedupingInterval: 0,
      suspense: false,
    }
  )

  const [cards, setCards] = useState<CardType[]>([])
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch(
          `/api/cards/get-card?userId=${cookies.userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        )

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

  const handleTransactionSuccess = useCallback(() => {
    if (window.location.pathname === "/dashboard/transactions") {
      router.refresh()
    }
  }, [router])

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const hasChecked = localStorage.getItem("payment_checked")

      if (
        window.location.pathname === "/dashboard/plans/checkout/success" &&
        !hasChecked
      ) {
        try {
          localStorage.setItem("payment_checked", "true")

          await new Promise((resolve) => setTimeout(resolve, 10000))
          await mutate("/api/users/get-user")
          await mutateUser()

          window.location.reload()
        } catch (error) {
          console.error("Erro ao atualizar dados do usuário:", error)
        }
      }
    }

    checkPaymentStatus()
  }, [])

  const handleLogout = () => {
    const cookies = parseCookies()

    Object.keys(cookies).forEach((cookieName) => {
      destroyCookie(null, cookieName, {
        path: "/",
        domain: window.location.hostname,
      })
    })

    document.cookie.split(";").forEach((cookie) => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
    })

    toast.success("Logout realizado com sucesso!")

    router.push("/signin")
    router.refresh()
  }

  const handleSettings = () => {
    router.push("/dashboard/settings")
  }
  return (
    <>
      <Sidebar
        collapsible="icon"
        className="backdrop-blur-md bg-white/80 dark:bg-zinc-900 overflow-hidden"
      >
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Image
              className="ml-2 mt-4 group-data-[collapsible=icon]:block hidden"
              src="/logos/logo-vector.png"
              alt="SimpleFinance"
              width={16}
              height={16}
            />
            {/* <Wallet className="w-4 h-4 ml-2 mt-4 group-data-[collapsible=icon]:block hidden" /> */}
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
              <Image
                src="/logos/logo-vector.png"
                alt="SimpleFinance"
                className="p-2"
                width={48}
                height={48}
              />
              {/* <Wallet className="w-12 h-12 p-2 border-zinc-50 rounded-lg" /> */}
              <Separator orientation="vertical" className="h-10 mx-1" />
              <div className="flex flex-col">
                <span className="text-md font-bold">SimpleFinance</span>
                <span className="text-xs text-zinc-400">
                  Seu gerenciador financeiro
                </span>
              </div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Explore nossas opções</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items
                  .filter(
                    (item) => !item.adminOnly || userData?.permissao === "admin"
                  )
                  .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}

                <Collapsible className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <Inbox />
                        <span>Transações</span>
                        <ChevronUp className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=closed]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-x-hidden">
                      <SidebarMenuSub className="text-zinc-700">
                        <SidebarMenuSubItem>
                          <SidebarMenuButton
                            onClick={() => setIsTransactionDialogOpen(true)}
                          >
                            <PlusCircle className="h-4 w-4 dark:text-neutral-300" />
                            <span className="dark:text-neutral-300">
                              Criar Transação
                            </span>
                          </SidebarMenuButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                          <SidebarMenuButton asChild>
                            <a href="/dashboard/transactions">
                              <ListOrdered className="h-4 w-4 dark:text-neutral-300" />
                              <span className="dark:text-neutral-300">
                                Ver Todas as Transações
                              </span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/dashboard/plans" className="relative">
                      <Calendar />
                      <span>Fluxo de Caixa</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <Collapsible className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        <CreditCard />
                        <span>Cartões de Crédito</span>
                        <ChevronUp className="ml-auto h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=closed]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-x-hidden">
                      <SidebarMenuSub className="text-zinc-700">
                        {cards.length > 0 ? (
                          <>
                            {cards.map((card) => {
                              const CardIcon =
                                cardIcons[card.bandeira] || CreditCard
                              return (
                                <SidebarMenuSubItem key={card.cardId}>
                                  <SidebarMenuButton asChild>
                                    <a href={`/dashboard/cards/${card.cardId}`}>
                                      <Image
                                        src={CardIcon}
                                        alt={card.bandeira}
                                        width={24}
                                        height={24}
                                      />
                                      <span className="dark:text-neutral-300">
                                        {card.nomeCartao}
                                      </span>
                                    </a>
                                  </SidebarMenuButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                            <SidebarMenuSubItem>
                              <SidebarMenuButton asChild>
                                <a href="/dashboard/cards">
                                  <span className="text-xs text-muted-foreground">
                                    Ver todos os cartões
                                  </span>
                                </a>
                              </SidebarMenuButton>
                            </SidebarMenuSubItem>
                          </>
                        ) : (
                          <SidebarMenuSubItem>
                            <SidebarMenuButton asChild>
                              <a href="/dashboard/cards">
                                <PlusCircle className="h-4 w-4 dark:text-neutral-300" />
                                <span className="dark:text-neutral-300">
                                  Cadastrar Cartão
                                </span>
                              </a>
                            </SidebarMenuButton>
                          </SidebarMenuSubItem>
                        )}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/dashboard/plans" className="relative">
                      <Crown />
                      <span>Planos</span>
                      {userData?.permissao === "free" && (
                        <Badge
                          variant="premium"
                          className="ml-auto bg-violet-500/10 text-violet-500 hover:bg-violet-500/20"
                        >
                          Upgrade
                        </Badge>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Separator orientation="horizontal" />
          <SidebarMenu className="space-y-2">
            <SidebarMenuItem>
              <div className="group-data-[collapsible=icon]:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="h-auto">
                    <SidebarMenuButton>
                      <Image
                        src={userData.image || "/utilities/profile.png"}
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
                                "bg-emerald-400 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-500 dark:hover:bg-emerald-500/20"
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

      <CreateTransaction
        isOpen={isTransactionDialogOpen}
        onOpenChange={setIsTransactionDialogOpen}
        onSuccess={handleTransactionSuccess}
      />
    </>
  )
}
