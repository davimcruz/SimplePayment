import { Providers } from "../components/providers"
import { SidebarTrigger } from "@/app/components/ui/sidebar"
import { AppSidebar } from "@/app/components/sidebar/app-sidebar"
import Header from "../components/sidebar/Header"
import { Separator } from "../components/ui/separator"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

async function getUserData() {
  const cookieStore = cookies()
  const userId = cookieStore.get("userId")?.value
  const token = cookieStore.get("token")?.value

  if (!userId || !token) {
    redirect('/signin')
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/get-user?userId=${userId}`,
      {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (!response.ok) {
      throw new Error('Falha ao obter dados do usuário')
    }

    return response.json()
  } catch (error) {
    console.error('Erro ao buscar dados do usuário:', error)
    redirect('/signin')
  }
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userData = await getUserData()

  if (!userData) {
    redirect('/signin')
  }

  return (
    <Providers>
      <div className="flex h-screen w-full">
        <AppSidebar initialData={userData} />
        <div className="flex-1 flex flex-col w-0">
          <header className="w-full flex items-center h-16 border-b bg-background px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-8 mx-4" />
            <Header />
          </header>
          <main>{children}</main>
        </div>
      </div>
    </Providers>
  )
}
