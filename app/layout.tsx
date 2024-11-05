import "./globals.css"
import { Inter } from "next/font/google"
import { Metadata } from "next"
import type { Viewport } from "next"
import { ThemeProvider } from "@/app/components/theme/theme-provider"
import { Analytics } from "@vercel/analytics/react"
import { Toaster } from "sonner"

const inter = Inter({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-inter",
})

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export const metadata: Metadata = {
  title: "SimpleFinance",
  description:
    "Descubra o SimpleFinance, o principal software de finanças pessoais projetado para ajudá-lo a gerenciar orçamentos, despesas e cartões em um só lugar.",
  openGraph: {
    title: "SimpleFinance - Seu Gerente de Finanças Pessoais",
    description:
      "Simplifique seu gerenciamento financeiro com o SimpleFinance. Acompanhe despesas, gerencie orçamentos e supervisione seus cartões com facilidade.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <Analytics />
      <ThemeProvider defaultTheme="dark" attribute="class">
        <body className={inter.className}>
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
        </body>
      </ThemeProvider>
    </html>
  )
}
