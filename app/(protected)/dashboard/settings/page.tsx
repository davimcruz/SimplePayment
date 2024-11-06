"use client"
import useSWR from "swr"
import { parseCookies } from "nookies"
import { EditNameCard } from "@/app/components/settings/EditNameCard"
import { AvatarCard } from "@/app/components/settings/AvatarCard"
import { PurchaseHistoryCard } from "@/app/components/settings/PurchaseHistoryCard"

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

const SettingsPage = () => {
  const { data: userData } = useSWR('/api/users/get-user', fetcher)

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <main className="min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-3xl items-start gap-6">
          <div className="grid gap-6">
            <EditNameCard />
            <AvatarCard userData={userData} />
            <PurchaseHistoryCard />
          </div>
        </div>
      </main>
    </div>
  )
}

export default SettingsPage
