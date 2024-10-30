"use client"
import { ThemeProvider } from "@/app/components/theme/theme-provider"
import CreateFlow from "@/app/components/setup/CreateFlow"

export default function SetupPage() {
  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <div className="flex min-h-screen flex-col items-center justify-center p-6">
        <main className="flex flex-col items-center justify-center flex-1 gap-8 px-4 py-16 lg:px-0">
          <CreateFlow />
        </main>
      </div>
    </ThemeProvider>
  )
}
