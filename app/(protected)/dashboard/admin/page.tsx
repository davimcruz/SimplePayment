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
      <div className="flex flex-col gap-4 p-4 md:gap-8 md:p-8 h-[calc(100vh-4rem)]">
        <div className="grid gap-8">
          {/* Skeleton para SalesComponent */}
          <div className="rounded-lg bg-card border shadow-sm p-4">
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded-md w-1/4" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
              <div className="h-64 bg-muted animate-pulse rounded-lg" />
            </div>
          </div>

          {/* Skeleton para UsersTable */}
          <div className="rounded-lg bg-card border shadow-sm p-4">
            <div className="space-y-4">
              <div className="h-8 bg-muted animate-pulse rounded-md w-1/3" />
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded-md" />
                ))}
              </div>
              <div className="flex justify-between items-center">
                <div className="h-8 bg-muted animate-pulse rounded-md w-24" />
                <div className="h-8 bg-muted animate-pulse rounded-md w-32" />
              </div>
            </div>
          </div>
        </div>
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
