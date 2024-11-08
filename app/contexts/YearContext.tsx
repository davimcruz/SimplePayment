import { createContext, useContext, useState, ReactNode } from 'react';

interface YearContextType {
  selectedYear: string;
  setSelectedYear: (year: string) => void;
}

const YearContext = createContext<YearContextType | undefined>(undefined);

export function YearProvider({ children }: { children: ReactNode }) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  return (
    <YearContext.Provider value={{ selectedYear, setSelectedYear }}>
      {children}
    </YearContext.Provider>
  );
}

export function useYear() {
  const context = useContext(YearContext);
  if (context === undefined) {
    throw new Error('useYear tem que ser usado dentro de um YearProvider');
  }
  return context;
} 