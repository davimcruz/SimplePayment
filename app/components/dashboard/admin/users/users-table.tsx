"use client"

import { columns } from "./columns"
import { DataTable } from "./data-table"
import { createContext, useState, useEffect } from "react"

type RefreshContextType = () => void
export const RefreshContext = createContext<RefreshContextType>(() => {})

export default function UsersTable() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [data, setData] = useState([])

  const refresh = () => setRefreshKey(prev => prev + 1)

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/get-all-users')
      const result = await response.json()
      if (result.users) {
        setData(result.users)
      }
    } catch (error) {
      console.error('Erro ao buscar usuários:', error)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [refreshKey])

  return (
    <RefreshContext.Provider value={refresh}>
      <div>
        <DataTable 
          columns={columns} 
          data={data}
          refetch={fetchUsers}
        />
      </div>
    </RefreshContext.Provider>
  )
}
