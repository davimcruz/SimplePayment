"use client"

import { ThemeProvider } from "./components/theme/theme-provider"
import { SidebarProvider } from "@/app/components/ui/sidebar"
import { OnboardingProvider } from '@/app/contexts/OnboardingContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <OnboardingProvider>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </OnboardingProvider>
    </ThemeProvider>
  )
}
