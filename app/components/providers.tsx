"use client"

import { ThemeProvider } from "./theme/theme-provider"
import { SidebarProvider } from "@/app/components/ui/sidebar"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <SidebarProvider>{children}</SidebarProvider>
    </ThemeProvider>
  )
}
