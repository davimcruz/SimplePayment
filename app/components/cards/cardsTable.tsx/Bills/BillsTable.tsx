import React, { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import { Skeleton } from "@/app/components/ui/skeleton"
import { useRouter } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { LogOut } from "lucide-react"
import { DataTable } from "@/app/components/ui/DataTable"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog"
import { columns } from "./BillColumns"
import { ParcelsTable } from "./ParcelsTable"
import BillChart from "./Billchart"

interface BillType {
  faturaId: string
  mes: number
  ano: number
  valorTotal: number
  vencimento: string
}

interface ParcelType {
  parcelaId: string
  valorParcela: number
  mes: number
  ano: number
  transacao: {
    nome: string
    tipo: string
    fonte: string
  }
}

interface BillsTableProps {
  cardId: string
}

const BillsTable: React.FC<BillsTableProps> = ({ cardId }) => {
  const [bills, setBills] = useState<BillType[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [nomeCartao, setNomeCartao] = useState("")
  const [selectedFaturaId, setSelectedFaturaId] = useState<string | null>(null)
  const [parcelas, setParcelas] = useState<ParcelType[]>([])
  const [loadingParcelas, setLoadingParcelas] = useState<boolean>(false)

  const router = useRouter()

  const handleBackClick = () => {
    router.push("/dashboard/cards")
  }

  useEffect(() => {
    const fetchCardName = async () => {
      try {
        const response = await fetch(`/api/cards/get-name`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cardId }),
        })

        const data = await response.json()
        if (data.nomeCartao) {
          setNomeCartao(data.nomeCartao)
        }
      } catch (error) {
        console.error("Erro ao buscar o nome do cartão:", error)
      }
    }

    fetchCardName()
  }, [cardId])

  useEffect(() => {
    const fetchBills = async () => {
      setLoading(true)
      try {
        const response = await fetch("/api/bills/get-bill", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cardId }),
        })

        const data = await response.json()

        if (Array.isArray(data.faturas)) {
          setBills(data.faturas)
        } else {
          console.error("A resposta da API não é um array.")
        }
      } catch (error) {
        console.error("Erro ao buscar faturas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBills()
  }, [cardId])

  const fetchParcels = async (faturaId: string) => {
    setLoadingParcelas(true)
    try {
      const response = await fetch(
        `/api/bills/get-parcels?faturaId=${faturaId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      const data = await response.json()
      setParcelas(data.parcelas)
    } catch (error) {
      console.error("Erro ao buscar parcelas:", error)
    } finally {
      setLoadingParcelas(false)
    }
  }

  const handleBillClick = (faturaId: string) => {
    setSelectedFaturaId(faturaId)
    fetchParcels(faturaId)
  }

  const filteredBills = bills.filter(
    (bill) =>
      bill.mes.toString() || bill.ano.toString() || bill.valorTotal.toString()
  )

  return (
    <div className="flex flex-col md:flex-row w-full gap-6">
      <div className="w-full md:w-1/2 md:ml-12 px-4 md:px-0 pt-4 md:pt-0">
        <Card className="min-h-[500px] bg-gradient-to-t from-background/10 to-primary/[5%]">
          <CardHeader className="flex-col md:flex-row items-center justify-between">
            <div className="flex-col">
              <CardTitle className="text-center md:text-start">
                Faturas em Aberto
              </CardTitle>
              <CardDescription>
                Todas as faturas abertas para: <span className="font-semibold">{nomeCartao}</span>
              </CardDescription>
            </div>
            <Button
              onClick={handleBackClick}
              variant={"outline"}
              className="mt-4 md:mt-0 cursor-pointer"
            >
              <LogOut className="mr-2" /> Sair da Fatura
            </Button>
          </CardHeader>
          <CardContent className="px-2 md:px-6">
            {loading ? (
              <Skeleton className="h-[250px]" />
            ) : bills.length === 0 ? (
              <div className="text-center justify-center items-center pt-20">
                <p>Você não possui Faturas em Aberto</p>
              </div>
            ) : filteredBills.length === 0 ? (
              <div className="text-center justify-center items-center pt-20">
                <p>Nenhuma fatura encontrada</p>
              </div>
            ) : (
              <div className="w-full overflow-x-auto">
                <DataTable<BillType, unknown>
                  columns={columns(handleBillClick)}
                  data={filteredBills}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={!!selectedFaturaId}
          onOpenChange={() => setSelectedFaturaId(null)}
        >
          <DialogContent className="sm:max-w-[90%] md:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Parcelas da Fatura</DialogTitle>
            </DialogHeader>
            {loadingParcelas ? (
              <Skeleton className="h-[150px]" />
            ) : parcelas.length === 0 ? (
              <p>Nenhuma parcela encontrada para esta fatura.</p>
            ) : (
              <div className="overflow-x-auto">
                <ParcelsTable parcelas={parcelas} />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedFaturaId(null)}>
                Fechar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="w-full md:w-1/2 md:mr-12 mt-6 md:mt-0 px-4 md:px-0 mb-8 md:mb-0">
        <Card className="md:min-h-[500px] bg-gradient-to-t from-background/10 to-primary/[5%]">
          <BillChart bills={bills} />
        </Card>
      </div>
    </div>
  )
}

export default BillsTable
