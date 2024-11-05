import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/app/components/ui/button"

interface QRCodeDisplayProps {
  qrCodeData: string
  price: number
  onBack: () => void
}

export function QRCodeDisplay({ qrCodeData, price, onBack }: QRCodeDisplayProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center justify-center space-y-4">
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
          <p className="text-sm text-muted-foreground">
            Escaneie o QR Code acima com seu aplicativo de banco para pagar via PIX
          </p>
        </div>

        <Button 
          variant="outline"
          onClick={onBack}
          className="mt-4"
        >
          Voltar
        </Button>
      </div>
    </div>
  )
} 