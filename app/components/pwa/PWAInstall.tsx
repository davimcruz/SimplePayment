"use client"

import { useEffect, useState } from "react"
import { Button } from "../ui/button"

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((error) => console.error("Erro no registro do SW:", error))
    }

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    })
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(
        `Usuário ${outcome === "accepted" ? "aceitou" : "recusou"} a instalação`
      )
      setDeferredPrompt(null)
      setShowInstall(false)
    }
  }

  if (!showInstall) return null

  return (
    <Button
      onClick={handleInstall}
      className="bg-emerald-500 hover:bg-emerald-600 text-white"
    >
      Instalar Aplicativo
    </Button>
  )
}
