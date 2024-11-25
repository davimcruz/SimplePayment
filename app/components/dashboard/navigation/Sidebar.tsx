import React from "react"
import Link from "next/link"
import { LayoutDashboard, User } from "lucide-react"
import { Button } from "@/app/components/ui/button"
import {
  Card,
  CardContent,
} from "@/app/components/ui/card"
import { Separator } from "../../ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"

/**
 * Dados mockados do usuário para desenvolvimento
 */
const MOCK_USER = {
  name: "João Silva",
  email: "joao@empresa.com",
  role: "Administrador",
  avatarUrl: "/avatars/user.png"
} as const;

/**
 * Componente de navegação lateral
 * Exibe perfil do usuário e links principais
 */
const Sidebar = () => {
  return (
    <Card className="h-full bg-gradient-to-tl from-background/10 to-primary/[5%]">
      <CardContent className="flex flex-col h-full p-6">
        {/* Links de Navegação */}
        <nav className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            asChild
          >
            <Link href="/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        </nav>

        <Separator className="my-4" />

        {/* Perfil do Usuário */}
        <div className="mt-auto flex items-center gap-4 py-4">
          <Avatar>
            <AvatarImage src={MOCK_USER.avatarUrl} alt={MOCK_USER.name} />
            <AvatarFallback>
              {MOCK_USER.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{MOCK_USER.name}</span>
            <span className="text-xs text-muted-foreground">
              {MOCK_USER.role}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="ml-auto">
            <User className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default Sidebar 