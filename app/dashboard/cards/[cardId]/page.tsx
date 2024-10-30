"use client"
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ThemeProvider } from "@/app/components/theme/theme-provider";
import Header from "@/app/components/header/HeaderComponent";
import BillsTable from "@/app/components/cards/cardsTable.tsx/Bills/BillsTable";

const CardDetailsPage = () => {
  const router = useRouter();
  const { cardId } = useParams<{ cardId: string }>() || {} 

  if (!cardId) {
    console.log("CardId inválido")
  }

  const [user, setUser] = useState<{ nome: string; sobrenome: string; image?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userIdCookie = document.cookie.split('; ').find(row => row.startsWith('userId='));
      if (!userIdCookie) {
        router.push('/auth/signin');
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
        setError("Erro ao buscar os dados do usuário.");
        router.push('/auth/signin');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);
  return (
    <ThemeProvider defaultTheme="dark" attribute="class">
      <div className="flex min-h-screen w-full flex-col">
        <Header userImage={user?.image} />
        <div className="p-6">
          <BillsTable cardId={cardId as string} />
        </div>
      </div>
    </ThemeProvider>
  );
};

export default CardDetailsPage;
