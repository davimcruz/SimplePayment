import "./globals.css"
import { Inter } from "next/font/google"
import { Metadata } from "next"
import type { Viewport } from "next"
import { ThemeProvider } from "@/app/components/theme/theme-provider"
import { Analytics } from "@vercel/analytics/react"
import { Toaster } from "sonner"
import { PWAInstall } from "@/app/components/pwa/PWAInstall"
import { useEffect } from "react"

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
  metadataBase: new URL('https://simplefinance.cloud'),
  title: {
    default: "SimpleFinance - Controle Financeiro Pessoal | Gestão Financeira Simplificada",
    template: "%s | SimpleFinance"
  },
  description:
    "Simplifique sua vida financeira com o SimpleFinance. Gerencie orçamentos, despesas, investimentos e cartões em uma única plataforma. Experimente grátis o software de finanças pessoais mais completo do Brasil.",
  keywords: [
    "finanças pessoais",
    "controle financeiro",
    "gestão financeira",
    "orçamento pessoal",
    "controle de gastos",
    "planejamento financeiro",
    "economia pessoal",
    "educação financeira",
    "investimentos",
    "carteira digital",
    "gestão de cartões",
    "relatórios financeiros"
  ],
  alternates: {
    canonical: 'https://simplefinance.cloud',
    languages: {
      'pt-BR': 'https://simplefinance.cloud',
    }
  },
  authors: [{ name: "SimpleFinance" }],
  creator: "SimpleFinance",
  publisher: "SimpleFinance",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/logos/logo.svg", type: "image/svg+xml" },
      { url: "/logos/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/logos/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/logos/icon-192.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: ["/images/favicon.ico"],
    other: [
      {
        rel: "search",
        type: "image/x-icon",
        url: "/images/favicon.ico",
      },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://simplefinance.cloud",
    title: "SimpleFinance - Controle Financeiro Pessoal | Gestão Financeira Simplificada",
    description:
      "Simplifique sua vida financeira com o SimpleFinance. Gerencie orçamentos, despesas, investimentos e cartões em uma única plataforma. Experimente grátis o software de finanças pessoais mais completo do Brasil.",
    siteName: "SimpleFinance",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SimpleFinance - Plataforma de Gestão Financeira Pessoal",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SimpleFinance - Controle financeiro simplificado",
    description:
      "SimpleFinance é o software de finanças pessoais mais completo do Brasil.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/logos/icon-192.png" />
      </head>
      <body className={inter.className}>
        <Analytics />
        <ThemeProvider defaultTheme="dark" attribute="class">
          {children}
          <Toaster
            richColors
            position="top-right"
            theme="dark"
            className="toaster-custom md:-mr-4 -mt-2 md-mt-5"
            icons={{
              loading: <LoadingIcon />,
            }}
            toastOptions={{
              style: {
                background: "hsl(162.9 93.5% 24.3%)",
                color: "white",
                border: "none",
              },
              classNames: {
                toast: "toast-custom",
              },
              duration: 3000,
            }}
          />
          <PWAInstall />
        </ThemeProvider>
      </body>
    </html>
  )
}
