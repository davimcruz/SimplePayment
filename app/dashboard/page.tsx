"use client"
import { ThemeProvider } from "@/app/components/theme/theme-provider";
import { Skeleton } from "@/app/components/ui/skeleton";

import Summary from "@/app/components/dashboard/summary/Summary";
import TransactionsTable from "@/app/components/dashboard/table/TransactionsTable";
import FinancesGraph from "@/app/components/dashboard/graphs/FinancesGraph";
import Header from "@/app/components/header/HeaderComponent";
import { useEffect, useState } from "react";

const DashboardPage = () => {
  const [user, setUser] = useState<{ nome: string; sobrenome: string; image?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const userIdCookie = document.cookie.split('; ').find(row => row.startsWith('userId='));
      if (!userIdCookie) {
        window.location.href = '/auth/signin'; // Redireciona se o cookie não existir
        return;
      }

      const userId = userIdCookie.split('=')[1];
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/users/get-user?userId=${userId}`);
        const userData = await response.json();

        if (!response.ok) {
          throw new Error('Erro ao buscar dados do usuário');
        }

        setUser(userData);
      } catch (error) {
        console.error("Erro ao buscar os dados do usuário:", error);
        window.location.href = '/auth/signin'; // Redireciona em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <div className="flex min-h-screen w-full flex-col">
        <Header userImage={user?.image} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div>
            {!user || !user.nome || !user.sobrenome ? (
              <Skeleton className="h-8 w-[230px]" />
            ) : (
              <h1 className="ml-2 text-2xl font-bold py-2 lg:py-0">
                Olá, {user.nome} {user.sobrenome}
              </h1>
            )}
          </div>
          <Summary initialData={null} />
          <div className="grid lg:max-h-96 gap-4 md:gap-8 xl:grid-cols-3">
            <TransactionsTable />
            <FinancesGraph />
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default DashboardPage;
