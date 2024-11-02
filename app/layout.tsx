import "./globals.css"
// import { Poppins } from "next/font/google"
import { Inter } from "next/font/google"
import { Metadata } from "next"
import type { Viewport } from "next"
import { ThemeProvider } from "@/app/components/theme/theme-provider"
import { Analytics } from "@vercel/analytics/react"

// const poppins = Poppins({
//   subsets: ["latin"],
//   weight: ["200", "300", "400", "500", "600", "700"],
//   variable: "--font-poppins",
// })

const inter = Inter({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-inter",
})

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <body className={inter.className}>{children}</body>
      </ThemeProvider>
    </html>
  )
}
