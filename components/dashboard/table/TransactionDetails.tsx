import React, { useState, useEffect } from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { ptBR } from "date-fns/locale"
import { useRouter } from "next/router"
import LottieAnimation from "./fillAnimation"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogClose } from "@radix-ui/react-dialog"
import { Calendar as CalendarIcon } from "lucide-react"

interface TransactionsDetailsProps {
  transactionId: string
}

const TransactionsDetails = ({ transactionId }: TransactionsDetailsProps) => {
  const [date, setDate] = React.useState<Date>()
  const [valorEditado, setValorEditado] = useState<string>("")
  const [erro, setErro] = useState(false)
  const [nome, setNome] = useState("")
  const [tipoTransacao, setTipoTransacao] = useState("")
  const [fonteTransacao, setFonteTransacao] = useState("")
  const [detalhesFonte, setDetalhesFonte] = useState("")
  const [valorTransacao, setValorTransacao] = useState<number | null>(null)
  const [dataTransacao, setDataTransacao] = useState<Date | undefined>()
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDataLoading, setIsDataLoading] = useState(false) 
  const router = useRouter()

  const formatarValor = (valor: number): string => {
    return valor
      .toFixed(2)
      .replace(".", ",")
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valorInput = event.target.value.replace(/\D/g, "")
    const valorNumerico = parseFloat(valorInput) / 100
    setValorTransacao(valorNumerico)
    setValorEditado(formatarValor(valorNumerico))
  }

  const handleTipoTransacaoChange = (value: string) => {
    setTipoTransacao(value)
    setFonteTransacao("")
  }

  const handleTransactionsDetails = async () => {
    console.log("Id recebido:", transactionId)
    setIsDataLoading(true) 

    try {
      const response = await fetch("/api/Transactions/viewTransactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactionId }),
      })

      if (!response.ok) {
        throw new Error("Falha ao enviar requisição para a API.")
      }

      const data = await response.json()

      if (data) {
        setNome(data.nome || "")
        setTipoTransacao(data.tipo || "")
        setFonteTransacao(data.fonte || "")
        setDetalhesFonte(data.detalhesFonte || "")

        const dateParts = data.data.split("-")
        const formattedDate = new Date(
          `${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`
        )

        setDataTransacao(formattedDate)
        setDate(formattedDate)

        setValorTransacao(data.valor)
        setValorEditado(formatarValor(data.valor))

        setDialogOpen(true)
      }
    } catch (error) {
      console.error("Erro na requisição:", error)
    } finally {
      setIsDataLoading(false) 
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    if (
      nome &&
      tipoTransacao &&
      fonteTransacao &&
      detalhesFonte &&
      valorTransacao !== null &&
      dataTransacao
    ) {
      try {
        const response = await fetch("/api/Transactions/editTransactions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            transactionId,
            nome,
            tipo: tipoTransacao,
            fonte: fonteTransacao,
            detalhesFonte,
            valor: valorTransacao,
            data: dataTransacao,
          }),
        })

        if (!response.ok) {
          throw new Error("Falha ao enviar requisição para a API.")
        }

        setIsLoading(false)
        setDialogOpen(false)
        router.reload()
      } catch (error) {
        console.error("Erro na requisição:", error)
        setIsLoading(false)
      }
    } else {
      setErro(true)
      setIsLoading(false)
    }
  }

  const handleDeleteTransaction = async () => {
    try {
      const response = await fetch("/api/Transactions/deleteTransactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ transactionId }),
      })

      if (!response.ok) {
        throw new Error("Falha ao enviar requisição para a API.")
      }

      setDialogOpen(false)
      window.location.reload()
    } catch (error) {
      console.error("Erro ao excluir transação:", error)
    }
  }

  useEffect(() => {
    if (submitSuccess) {
      setTimeout(() => {
        setSubmitSuccess(false)
      }, 3000)
    }
  }, [submitSuccess])

  return (
    <>
      <Dialog
        open={dialogOpen}
        onOpenChange={(isOpen) => {
          setDialogOpen(isOpen)
          if (isOpen) {
            handleTransactionsDetails()
          }
        }}
      >
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="ml-auto lg:ml-4 gap-1">
            Detalhes
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[90vw] max-h-[90vh] overflow-auto rounded-xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Transação</DialogTitle>
          </DialogHeader>
          {isDataLoading ? (
            <div className="flex flex-col items-center justify-center">
              <LottieAnimation animationPath="/loadingAnimation.json" />
              <p className="text-lg font-bold">Carregando Dados...</p>
            </div>
          ) : (
            <>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center">
                  <LottieAnimation animationPath="/loadingAnimation.json" />
                  <p className="text-lg font-bold">Editando Transação...</p>
                </div>
              ) : (
                <div className="pt-8 pb-4">
                  <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 mb-12 sm:grid-cols-2 sm:gap-8">
                      <div className="grid gap-2">
                        <Label className="text-left" htmlFor="nome">
                          Nome da Transação
                        </Label>
                        <Input
                          id="nome"
                          placeholder="Tênis Nike, Burger King, etc"
                          required
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-left" htmlFor="type-transaction">
                          Tipo de Transação
                        </Label>
                        <Select
                          value={tipoTransacao}
                          onValueChange={(value) =>
                            handleTipoTransacaoChange(value)
                          }
                          required
                        >
                          <SelectTrigger className="w-full text-muted-foreground focus:text-foreground">
                            <SelectValue placeholder="Receita ou Despesa"></SelectValue>
                          </SelectTrigger>
                          <SelectContent id="select-type">
                            <SelectItem value="receita">Receita</SelectItem>
                            <SelectItem value="despesa">Despesa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-4 mb-12 sm:grid-cols-2 sm:gap-8">
                      <div className="grid gap-2">
                        <Label className="text-left" htmlFor="select-fonte">
                          Fonte da Transação
                        </Label>
                        <Select
                          value={fonteTransacao}
                          onValueChange={(value) => setFonteTransacao(value)}
                          required
                        >
                          <SelectTrigger className="w-full text-muted-foreground focus:text-foreground">
                            <SelectValue placeholder="Onde saiu ou entrou?"></SelectValue>
                          </SelectTrigger>
                          <SelectContent id="select-fonte">
                            <SelectItem value="cartao-credito">
                              Cartão de Crédito
                            </SelectItem>
                            <SelectItem value="cartao-debito">
                              Cartão de Débito
                            </SelectItem>
                            <SelectItem value="investimentos">
                              Investimentos
                            </SelectItem>
                            <SelectItem value="pix">PIX</SelectItem>
                            <SelectItem value="boleto">Boleto</SelectItem>
                            <SelectItem value="ted-doc">TED/DOC</SelectItem>
                            <SelectItem value="cedulas">Cédulas</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-left" htmlFor="detalhes-fonte">
                          Detalhes da Fonte
                        </Label>
                        <Input
                          id="detalhes-fonte"
                          placeholder="De qual Conta/Instituição"
                          value={detalhesFonte}
                          required
                          onChange={(e) => setDetalhesFonte(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 mb-12 sm:grid-cols-2 sm:gap-8">
                      <div className="grid gap-2">
                        <Label className="text-left" htmlFor="data">
                          Data da Transação
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {date ? (
                                format(date, "dd/MM/yyyy")
                              ) : (
                                <span>Selecione uma Data</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              locale={ptBR}
                              mode="single"
                              selected={date}
                              onSelect={(selectedDate) => {
                                setDate(selectedDate)
                                setDataTransacao(selectedDate)
                              }}
                              initialFocus
                              required
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="grid gap-2">
                        <Label className="text-left" htmlFor="valor">
                          Valor da Transação
                        </Label>
                        <Input
                          id="valor"
                          placeholder="Exemplo: 199,90"
                          value={valorEditado}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>
                    {erro && (
                      <div className="text-red-500">
                        Por favor, preencha todos os campos!
                      </div>
                    )}
                    <DialogFooter className="lg:flex lg:justify-end lg:items-end flex-col gap-4">
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <Button
                        onClick={handleDeleteTransaction}
                        variant="outline"
                      >
                        Excluir Transação
                      </Button>
                      <Button type="submit">Salvar Transação</Button>
                    </DialogFooter>
                  </form>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default TransactionsDetails
