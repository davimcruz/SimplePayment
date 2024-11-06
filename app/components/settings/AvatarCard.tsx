import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { UploadButton } from "@/app/components/uploadthing"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"

interface AvatarCardProps {
  userData: {
    image?: string
  }
}

export function AvatarCard({ userData }: AvatarCardProps) {
  const [loadingImage, setLoadingImage] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>("")
  const router = useRouter()

  const saveImage = async () => {
    if (!imageUrl) {
      toast.error("Selecione uma imagem primeiro")
      return
    }

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

      await toast.promise(
        (async () => {
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
          }

          router.push("/dashboard")
        })(),
        {
          loading: 'Salvando sua foto...',
          success: 'Foto atualizada com sucesso!',
          error: 'Erro ao salvar sua foto',
          duration: 4000,
        }
      )
    } catch (error) {
      console.log(error)
    } finally {
      setLoadingImage(false)
    }
  }

  const handleUploadComplete = (res: any[]) => {
    setImageUrl(res[0].url)
    toast.success("Imagem carregada com sucesso! Clique em salvar para confirmar.")
  }

  const handleUploadError = (error: Error) => {
    console.log(`Erro: ${error.message}`)
    toast.error("Erro ao carregar a imagem. Tente novamente.")
  }

  return (
    <Card className="bg-gradient-to-t from-background/10 to-primary/[5%]">
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
            ut-button: text-sm"
            endpoint="imageUploader"
            onClientUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
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
  )
} 