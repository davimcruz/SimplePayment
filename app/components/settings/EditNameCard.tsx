import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"

export function EditNameCard() {
  const [newName, setNewName] = useState("")
  const [newLastName, setNewLastName] = useState("")
  const [loadingSave, setLoadingSave] = useState(false)
  const router = useRouter()

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

      await toast.promise(
        (async () => {
          const response = await fetch("/api/settings/edit-name", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: emailFromCookie,
              nome: newName,
              sobrenome: newLastName,
            }),
          })

          if (!response.ok) {
            throw new Error("Erro ao atualizar nome e sobrenome")
          }

          router.push("/dashboard")
        })(),
        {
          loading: 'Atualizando seus dados...',
          success: 'Dados atualizados com sucesso!',
          error: 'Erro ao atualizar seus dados',
          duration: 4000,
        }
      )
    } catch (error) {
      console.error("Erro durante o salvamento:", error)
    } finally {
      setLoadingSave(false)
    }
  }

  return (
    <Card className="bg-gradient-to-t from-background/10 to-primary/[5%]">
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
  )
} 