import { Inter } from "next/font/google"
import { SidebarTrigger } from "@/app/components/ui/sidebar"
import { AppSidebar } from "@/app/components/sidebar/app-sidebar"
import Header from "../components/sidebar/Header"
import { Separator } from "../components/ui/separator"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Providers } from "../_app"
import { Toaster } from "sonner"
import { GuidedTour } from '@/app/components/onboarding/GuidedTour'

const inter = Inter({ subsets: ["latin"] })

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

const LoadingIcon = () => (
  <svg 
    className="animate-spin" 
    width="16" 
    height="16" 
    viewBox="0 0 16 16"
    fill="none"
  >
    <circle
      className="text-white/30"
      cx="8"
      cy="8"
      r="7"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      className="text-white"
      fill="currentColor"
      d="M15 8a7 7 0 00-7-7v2a5 5 0 015 5h2z"
    >
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="0 8 8"
        to="360 8 8"
        dur="0.8s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
)

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
      <div className={`flex h-screen w-full ${inter.className}`}>
        <AppSidebar initialData={userData} />
        <div className="flex-1 flex flex-col w-0">
          <header className="w-full flex items-center h-16 border-b bg-background px-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-8 mx-4" />
            <Header />
          </header>
          <main className={inter.className}>
            {children}
            <Toaster
              richColors
              position="top-right"
              theme="dark"
              className="toaster-custom md:-mr-4 -mt-2 md-mt-5"
              icons={{
                loading: <LoadingIcon />
              }}
              toastOptions={{
                style: {
                  background: 'hsl(162.9 93.5% 24.3%)',
                  color: 'white',
                  border: 'none',
                },
                classNames: {
                  toast: "toast-custom",
                },
                duration: 3000,
              }}
            />
            <GuidedTour />
          </main>
        </div>
      </div>
    </Providers>
  )
}
