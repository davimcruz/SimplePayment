"use client"

import { usePathname, useParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/components/ui/breadcrumb"
import { HomeIcon } from "lucide-react"
import { ModeToggle } from "../theme/toggleTheme"

const Header = () => {
  const pathname = usePathname()
  const params = useParams()
  const [cardName, setCardName] = useState<string>("")

  const routeNames: { [key: string]: string } = {
    dashboard: "Dashboard",
    transactions: "Transações",
    cards: "Cartões",
    cashflow: "Fluxo de Caixa",
    settings: "Configurações",
    setup: "Configuração Inicial",
    plans: "Planos",
    checkout: "Checkout",
    success: "Sucesso",
    updateflow: "Atualizar Fluxo",
  'fixed-costs': "Despesas Fixas",
  }

  useEffect(() => {
    const fetchCardName = async () => {
      if (params?.cardId) {
        try {
          const response = await fetch('/api/cards/get-name', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ cardId: params.cardId }),
          })
          
          const data = await response.json()
          
          if (data.nomeCartao) {
            setCardName(data.nomeCartao)
          } else {
            setCardName("Cartão")
          }
        } catch (error) {
          console.error("Erro ao buscar nome do cartão:", error)
          setCardName("Cartão")
        }
      }
    }
    fetchCardName()
  }, [params?.cardId])
  
  const getBreadcrumbs = () => {
    if (!pathname) return []
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs = paths.map((path, index) => {
      const href = `/${paths.slice(0, index + 1).join('/')}`
      const isLast = index === paths.length - 1
      
      let label = path
      if (params?.cardId && path === params.cardId) {
        label = cardName
      } else {
        label = routeNames[path] || path.charAt(0).toUpperCase() + path.slice(1)
      }
      
      return {
        href,
        label,
        isLast
      }
    })
    
    return breadcrumbs
  }

  return (
    <div className="flex-1 flex items-center justify-between w-full h-16 lg:h-auto">
      <Breadcrumb>
        <BreadcrumbList className="py-2 lg:py-0">
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">
              <HomeIcon className="h-4 w-4" />
            </BreadcrumbLink>
          </BreadcrumbItem>
          {getBreadcrumbs().map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {breadcrumb.isLast ? (
                  <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={breadcrumb.href}>
                    {breadcrumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <ModeToggle />
    </div>
  )
}

export default Header
