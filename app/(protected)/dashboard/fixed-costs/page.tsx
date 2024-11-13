"use client"
import { useState, useEffect } from "react"
import { Button } from "@/app/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { Separator } from "@/app/components/ui/separator"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import LottieAnimation from "@/app/components/ui/loadingAnimation"
import { formatToCurrency } from "@/utils/moneyFormatter"
import { parseCookies } from "nookies"
import CreateFixedCosts from "@/app/components/setup/CreateFixedCosts"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog"

interface FixedCost {
  id: string
  nome: string
  valor: number
  diaVencimento: number
  formaPagamento: string
  categoria: string
  cardId?: string
  cartao?: {
    nomeCartao: string
  }
}

export default function FixedCostsPage() {
  const [costs, setCosts] = useState<FixedCost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [deletingCostId, setDeletingCostId] = useState<string | null>(null)

  useEffect(() => {
    fetchCosts()
  }, [])

  const fetchCosts = async () => {
    try {
      const cookies = parseCookies()
      const userId = cookies.userId

      if (!userId) {
        toast.error("Usuário não autenticado")
        return
      }

      const response = await fetch(`/api/costs/list?userId=${userId}`)
      if (!response.ok) throw new Error("Falha ao carregar despesas")

      const data = await response.json()
      setCosts(data)
    } catch (error) {
      toast.error("Erro ao carregar despesas fixas")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteCost = async (costId: string) => {
    setDeletingCostId(null)
    
    try {
      await toast.promise(
        (async () => {
          const response = await fetch('/api/costs/delete', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ costId }),
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || "Erro ao excluir despesa fixa")
          }

          setCosts(costs => costs.filter(cost => cost.id !== costId))
        })(),
        {
          loading: 'Excluindo despesa fixa...',
          success: 'Despesa fixa excluída com sucesso!',
          error: (error) => error instanceof Error ? error.message : "Erro ao excluir despesa fixa",
          duration: 4000,
        }
      )
    } catch (error) {
      console.error("Erro ao excluir despesa fixa:", error)
    }
  }

  return (
    <div className={`
      container mx-auto p-4 max-w-5xl 
      ${!showCreateForm 
        ? 'h-[calc(100vh-8rem)] flex items-center justify-center' 
        : 'space-y-4 h-[calc(100vh-8rem)]'
      }
    `}>
      <Card className={`
        bg-gradient-to-t from-background/10 to-primary/[5%] border-border
        ${!showCreateForm ? 'w-full' : ''}
        transition-all duration-300 ease-in-out
      `}>
        <CardHeader className="p-4 md:p-6">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                Despesas Fixas
              </CardTitle>
              <CardDescription className="mt-2 text-sm md:text-base">
                Gerencie suas despesas fixas mensais
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white font-semibold">
              <Plus className={`h-4 w-4 mr-2 transition-transform ${showCreateForm ? 'rotate-45' : ''}`} />
              {showCreateForm ? 'Cancelar' : 'Nova Despesa'}
            </Button>
          </div>
        </CardHeader>

        <Separator className="bg-border" />

        <CardContent className="p-4 md:p-6 space-y-6">
          {showCreateForm && (
              <CreateFixedCosts
                onComplete={() => {
                  setShowCreateForm(false)
                  fetchCosts()
                }}
                onBack={() => setShowCreateForm(false)}
              />
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <LottieAnimation animationPath="/utilities/loading.json" />
              <p className="mt-4 text-center text-sm md:text-base text-muted-foreground">
                Carregando despesas fixas...
              </p>
            </div>
          ) : costs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Você ainda não possui despesas fixas cadastradas
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {costs.map((cost) => (
                <div
                  key={cost.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-gradient-to-br from-background/10 to-primary/10"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-foreground">
                        {cost.nome}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        ({cost.categoria})
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span>{formatToCurrency(cost.valor)}</span>
                      <span className="mx-2">•</span>
                      <span>Vence dia {cost.diaVencimento}</span>
                      <span className="mx-2">•</span>
                      <span className="capitalize">
                        {cost.formaPagamento}
                        {cost.cartao && ` - ${cost.cartao.nomeCartao}`}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                    onClick={() => setDeletingCostId(cost.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deletingCostId}
        onOpenChange={(isOpen) => !isOpen && setDeletingCostId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <p className="text-muted-foreground">
              Tem certeza que deseja excluir esta despesa fixa? 
              {deletingCostId && costs.find(c => c.id === deletingCostId)?.formaPagamento === 'credito' 
                ? ' Todas as parcelas futuras nas faturas também serão excluídas.'
                : ' Todas as transações futuras serão excluídas.'}
            </p>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeletingCostId(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingCostId && handleDeleteCost(deletingCostId)}
            >
              Excluir Despesa
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
