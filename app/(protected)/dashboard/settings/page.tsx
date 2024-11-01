"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { parseCookies } from "nookies"
import useSWR from "swr"
import Link from "next/link"
import { UploadButton } from "@/app/components/uploadthing"

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import { Button } from "@/app/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"

interface UserData {
  nome: string
  sobrenome: string
  image?: string
}

const fetcher = async (url: string) => {
  const cookies = parseCookies()
  const userId = cookies.userId

  if (!userId) return {
    image: '/profile.png',
    nome: 'User',
    sobrenome: '',
    email: '',
    permissao: 'free' as const
  }

  try {
    const response = await fetch(`${url}?userId=${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    
    if (!response.ok) {
      throw new Error('Erro ao carregar dados do usuário')
    }

    const data = await response.json()
    return {
      ...data,
      image: data.image || '/profile.png'
    }
  } catch (error) {
    return {
      image: '/profile.png',
      nome: 'User',
      sobrenome: '',
      email: '',
      permissao: 'free' as const
    }
  }
}

const SettingsPage = () => {
  const [newName, setNewName] = useState("")
  const [newLastName, setNewLastName] = useState("")
  const [loadingSave, setLoadingSave] = useState(false)
  const [loadingImage, setLoadingImage] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>("")

  const { data: userData } = useSWR('/api/users/get-user', fetcher)
  const router = useRouter()

  const handleLogout = () => {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })

    router.push("/signin")
  }

  const handleSave = async () => {
    if (!newName || !newLastName) {
      return
    }
    try {
      setLoadingSave(true)
      const emailFromCookieEncoded = document.cookie
        .split("; ")
        .find((row) => row.startsWith("email="))
        ?.split("=")[1]

      if (!emailFromCookieEncoded) {
        throw new Error("Email não encontrado nos cookies")
      }

      const emailFromCookie = decodeURIComponent(emailFromCookieEncoded)

      const requestBody = {
        email: emailFromCookie,
        nome: newName,
        sobrenome: newLastName,
      }

      const response = await fetch("/api/settings/edit-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error("Erro ao atualizar nome e sobrenome")
      } else {
        router.push("/dashboard")
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error("Erro durante o salvamento:", error)
    } finally {
      setLoadingSave(false)
    }
  }

  const saveImage = async () => {
    try {
      setLoadingImage(true)
      const emailFromCookieEncoded = document.cookie
        .split("; ")
        .find((row) => row.startsWith("email="))
        ?.split("=")[1]

      if (!emailFromCookieEncoded) {
        throw new Error("Email não encontrado nos cookies")
      }

      const emailFromCookie = decodeURIComponent(emailFromCookieEncoded)

      const response = await fetch("/api/settings/save-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailFromCookie,
          imageUrl: imageUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao salvar a imagem")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoadingImage(false)
    }
  }

  return (
    <div className="flex flex-col">
      <main className="min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-3xl items-start gap-6">
          <div className="grid gap-6">
            <Card x-chunk="dashboard-04-chunk-1">
              <CardHeader>
                <CardTitle>Editar Nome</CardTitle>
                <CardDescription>
                  Para editar seu nome na plataforma você deve preencher ambos
                  os campos abaixo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form>
                  <Input
                    className="mb-4"
                    placeholder="Nome"
                    value={newName}
                    required
                    onChange={(e) => setNewName(e.target.value)}
                  />
                  <Input
                    placeholder="Sobrenome"
                    value={newLastName}
                    required
                    onChange={(e) => setNewLastName(e.target.value)}
                  />
                </form>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button
                  onClick={handleSave}
                  variant="outline"
                  disabled={loadingSave || !newName || !newLastName}
                >
                  {loadingSave ? "Salvando..." : "Salvar"}
                </Button>
              </CardFooter>
            </Card>
            <Card x-chunk="dashboard-04-chunk-2">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <CardTitle>Imagem do Avatar</CardTitle>
                    <CardDescription>
                      Utilize esse espaço para fazer upload do seu avatar que
                      será exibido na plataforma
                    </CardDescription>
                  </div>
                  <Avatar className="w-20 h-20 self-center sm:self-start">
                    <AvatarImage src={imageUrl || userData?.image} />
                    <AvatarFallback>SF</AvatarFallback>
                  </Avatar>
                </div>
              </CardHeader>
              <CardContent>
                <form className="flex flex-col gap-4">
                  <UploadButton
                    className="mt-6 lg:mt-0 
                    ut-button:bg-zinc-800
                    ut-button:after:bg-zinc-600
                    ut-button:text-white
                    ut-allowed-content:hidden
                    ut-button:font-normal
                    ut-button: text-sm
                     "
                    endpoint="imageUploader"
                    onClientUploadComplete={(res) => {
                      setImageUrl(res[0].url)
                    }}
                    onUploadError={(error: Error) => {
                      console.log(`Erro: ${error.message}`)
                    }}
                  />
                </form>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button
                  onClick={saveImage}
                  className="font-semibold"
                  disabled={loadingImage}
                  variant="outline"
                  id="save-image"
                >
                  {loadingImage ? "Salvando..." : "Salvar"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SettingsPage
