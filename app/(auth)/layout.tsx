import { Inter } from "next/font/google"

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter"
})

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${inter.className}`}>
      {children}
    </div>
  )
}
