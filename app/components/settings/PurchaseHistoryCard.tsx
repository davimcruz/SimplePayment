import { useEffect, useState } from "react"
import { parseCookies } from "nookies"
import useSWR from "swr"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table"
import { Badge } from "@/app/components/ui/badge"

interface Purchase {
  id: string
  paymentId: string
  status: 'approved' | 'pending' | 'rejected' | 'cancelled'
  amount: number
  customerName: string
  date: string
  plan: string
}

const fetcher = async (url: string) => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Erro ao buscar histórico de pagamentos')
  }
  return response.json()
}

export function PurchaseHistoryCard() {
  const cookies = parseCookies()
  const userId = cookies.userId

  const { data: purchases, error } = useSWR<Purchase[]>(
    userId ? `/api/payment/get-payments?userId=${userId}` : null,
    fetcher
  )

  if (error) {
    console.error('Erro ao carregar histórico:', error)
  }

  return (
    <Card className="bg-gradient-to-t from-background/10 to-primary/[5%] mb-12">
      <CardHeader>
        <CardTitle>Histórico de Compras</CardTitle>
        <CardDescription>
          Visualize todas as suas transações realizadas na plataforma
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead className="hidden md:table-cell">Plano</TableHead>
              <TableHead className="hidden md:table-cell">Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {purchases?.map((purchase) => (
              <TableRow key={purchase.id}>
                <TableCell>
                  {new Date(purchase.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {(() => {
                    switch (purchase.plan.toUpperCase()) {
                      case 'PRO':
                        return 'Membro Pro'
                      default:
                        return purchase.plan
                    }
                  })()}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {purchase.amount.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      purchase.status === 'approved'
                        ? 'premium'
                        : purchase.status === 'pending'
                        ? 'secondary'
                        : 'destructive'
                    }
                  >
                    {purchase.status === 'approved'
                      ? 'Aprovado'
                      : purchase.status === 'pending'
                      ? 'Pendente'
                      : purchase.status === 'cancelled'
                      ? 'Cancelado'
                      : 'Rejeitado'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {!purchases?.length && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  Nenhuma transação encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
} 