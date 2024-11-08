"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import UsersTable from "@/app/components/admin/users/users-table"
import { SalesComponent } from "@/app/components/admin/SalesComponent"
import Cookies from "js-cookie"

const AdminPage = () => {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const userId = Cookies.get('userId')
        const response = await fetch(`/api/users/get-user?userId=${userId}`)
        const data = await response.json()

        if (!data || data.permissao !== 'admin') {
          router.push('/dashboard')
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        router.push('/dashboard')
      }
    }

    checkPermission()
  }, [router])

  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="h-full">Carregando...</h1>
      </div>
    )
  }

  if (isAuthorized) {
    return (
      <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8 h-[calc(100vh-4rem)]">
        <div className="grid gap-8">
          <div className="rounded-lg">
            <SalesComponent />
          </div>

          <div className="rounded-lg">
            <UsersTable />
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default AdminPage
