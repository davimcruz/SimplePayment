"use client"

import { useState, useContext } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/app/components/ui/badge"
import { Checkbox } from "@/app/components/ui/checkbox"
import { Button } from "@/app/components/ui/button"
import { CaretSortIcon, DotsHorizontalIcon } from "@radix-ui/react-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { toast } from "sonner"
import { RefreshContext } from "./users-table"

export type User = {
  id: string
  nome: string
  sobrenome: string
  email: string
  permissao: "admin" | "pro" | "free"
  createdAt: string
  status: "active" | "inactive" | "suspended"
}

const ActionsCell = ({ row }: { row: any }) => {
  const refresh = useContext(RefreshContext)
  const user = row.original
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await toast.promise(
        (async () => {
          const response = await fetch(`/api/admin/delete-users?userId=${user.id}`, {
            method: "DELETE",
            headers: {
              'Content-Type': 'application/json',
            }
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error)
          }
          
          refresh()
        })(),
        {
          loading: 'Excluindo usuário...',
          success: 'Usuário excluído com sucesso!',
          error: (error) => error instanceof Error ? error.message : "Erro ao excluir usuário",
          duration: 4000,
        }
      )
    } catch (error) {
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleUpdatePermission = async (newPermission: string) => {
    try {
      await toast.promise(
        (async () => {
          const response = await fetch(`/api/admin/update-permission`, {
            method: "PATCH",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              permission: newPermission
            })
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error)
          }
          
          refresh()
        })(),
        {
          loading: 'Atualizando permissão...',
          success: 'Permissão atualizada com sucesso!',
          error: (error) => error instanceof Error ? error.message : "Erro ao atualizar permissão",
          duration: 4000,
        }
      )
    } catch (error) {
      console.error(error)
    }
  }

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await toast.promise(
        (async () => {
          const response = await fetch(`/api/admin/update-status`, {
            method: "PATCH",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              status: newStatus
            })
          })
          
          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error)
          }
          
          refresh()
        })(),
        {
          loading: 'Atualizando status...',
          success: 'Status atualizado com sucesso!',
          error: (error) => error instanceof Error ? error.message : "Erro ao atualizar status",
          duration: 4000,
        }
      )
    } catch (error) {
      console.error(error)
    }
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(user.id)
    toast.success('ID copiado para a área de transferência!', {
      duration: 2000,
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <DotsHorizontalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Permissão</DropdownMenuLabel>
          <DropdownMenuItem 
            onSelect={() => handleUpdatePermission("free")}
            className="gap-2"
          >
            <Badge variant="secondary" className="h-5">Free</Badge>
            <span>Usuário Gratuito</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onSelect={() => handleUpdatePermission("pro")}
            className="gap-2"
          >
            <Badge variant="premium" className="h-5">Pro</Badge>
            <span>Usuário Pro</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onSelect={() => handleUpdatePermission("admin")}
            className="gap-2"
          >
            <Badge variant="destructive" className="h-5">Admin</Badge>
            <span>Administrador</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuLabel className="text-xs text-muted-foreground">Status</DropdownMenuLabel>
          <DropdownMenuItem 
            onSelect={() => handleUpdateStatus("active")}
            className="gap-2"
          >
            <Badge variant="default" className="h-5">●</Badge>
            <span>Ativar</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onSelect={() => handleUpdateStatus("inactive")}
            className="gap-2"
          >
            <Badge variant="secondary" className="h-5">●</Badge>
            <span>Desativar</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onSelect={() => handleUpdateStatus("suspended")}
            className="gap-2"
          >
            <Badge variant="destructive" className="h-5">●</Badge>
            <span>Suspender</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onSelect={handleCopyId}
            className="gap-2"
          >
            <span>Copiar ID</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onSelect={handleDelete}
            className="text-red-600 gap-2"
            disabled={isDeleting}
          >
            <span>{isDeleting ? "Excluindo..." : "Excluir usuário"}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="rounded-[4px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="rounded-[4px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "nome",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nome
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const nome = row.getValue("nome") as string
      const sobrenome = row.original.sobrenome
      return <div>{`${nome} ${sobrenome}`}</div>
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Email
        <CaretSortIcon className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "permissao",
    header: "Permissão",
    cell: ({ row }) => {
      const permissao = row.getValue("permissao") as string
      return (
        <Badge
          variant={
            permissao === "admin"
              ? "destructive"
              : permissao === "pro"
              ? "premium"
              : "secondary"
          }
        >
          {permissao === "admin"
            ? "Administrador"
            : permissao === "pro"
            ? "Usuário Pro"
            : "Usuário Gratuito"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      return (
        <Badge
          variant={
            status === "active"
              ? "default"
              : status === "inactive"
              ? "secondary"
              : "destructive"
          }
        >
          {status === "active"
            ? "Ativo"
            : status === "inactive"
            ? "Inativo"
            : "Suspenso"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Data de Cadastro",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return <div>{date.toLocaleDateString("pt-BR")}</div>
    },
  },
  {
    id: "actions",
    cell: ActionsCell
  },
]