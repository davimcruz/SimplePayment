import { Providers } from "../components/providers"
import { SidebarTrigger } from "@/app/components/ui/sidebar"
import { AppSidebar } from "@/app/components/sidebar/app-sidebar"
import Header from "../components/sidebar/Header"
import { Separator } from "../components/ui/separator"
import { cookies } from "next/headers"

async function getUserData() {
  const cookieStore = cookies()
  const userId = cookieStore.get("userId")?.value

  if (!userId) return null

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/get-user?userId=${userId}`,
    {
      cache: "no-store",
    }
  )
  return response.json()
}

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userData = await getUserData()

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
