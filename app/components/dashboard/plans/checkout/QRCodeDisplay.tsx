import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/app/components/ui/button"
import { Copy } from "lucide-react"
import { toast } from "sonner"

interface QRCodeDisplayProps {
  qrCodeData: string
  price: number
  onBack: () => void
}

export function QRCodeDisplay({ qrCodeData, price, onBack }: QRCodeDisplayProps) {
  const handleCopyPix = async () => {
    try {
      await navigator.clipboard.writeText(qrCodeData)
      toast.success("Código PIX copiado com sucesso!")
    } catch (error) {
      toast.error("Erro ao copiar código PIX")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Escaneie o QR Code abaixo com seu aplicativo de banco para pagar via PIX
            </p>
        <div className="bg-white p-4 rounded-lg">
          <QRCodeSVG
            value={qrCodeData}
            size={256}
            level="H"
          />
        </div>
        
        <div className="text-center space-y-2">
          <p className="font-medium">
            Valor: {new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL'
            }).format(price)}
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={onBack}
          >
            Voltar
          </Button>

          <Button
            variant="outline"
            onClick={handleCopyPix}
            className="flex items-center gap-2"
          >
            <Copy className="h-4 w-4" />
            Copiar Código PIX
          </Button>
        </div>
      </div>
    </div>
  )
} 