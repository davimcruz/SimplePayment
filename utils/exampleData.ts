interface Transactions {
  transactionId: string
  nome: string
  tipo: "receita" | "despesa"
  fonte: string
  detalhesFonte: string
  data: string
  valor: number
}

export const exampleTransactions: Transactions[] = [
  {
    transactionId: "18a8d5d1-4f93-40fd-8190-31c278ab6719",
    nome: "Controle Xbox",
    tipo: "despesa",
    fonte: "cartao-credito",
    valor: 399.9,
    data: "15-03-2024",
    detalhesFonte: "Nubank",
  },
  {
    transactionId: "23b9638f-4b35-403f-b41a-8df374ccd6df",
    nome: "Salario",
    tipo: "receita",
    fonte: "pix",
    valor: 5000.0,
    data: "05-03-2024",
    detalhesFonte: "Empresa XYZ",
  },
  {
    transactionId: "1f567feb-47fd-4bae-b68f-d25e389ee2dd",
    nome: "iPhone 16 (4° Parcela)",
    tipo: "despesa",
    fonte: "cartao-credito",
    valor: 1249.75,
    data: "10-03-2024",
    detalhesFonte: "C6 Bank",
  },
  {
    transactionId: "24bcafec-dbcc-4282-a37b-4dcbb1c94c9e",
    nome: "Dividendo",
    tipo: "receita",
    fonte: "investimentos",
    valor: 750.0,
    data: "01-03-2024",
    detalhesFonte: "B3",
  },
  {
    transactionId: "25d4cd4a-6eed-4cef-ace8-4096178c4a1c",
    nome: "Capinha",
    tipo: "despesa",
    fonte: "pix",
    valor: 49.9,
    data: "08-03-2024",
    detalhesFonte: "Loja de Acessórios",
  },
]

export const exampleFlows = [
  {
    userId: 87804272,
    mes: 7,
    ano: 2024,
    receitaOrcada: 4500,
    despesaOrcada: 3200,
    saldoOrcado: 1300,
    receitaRealizada: 4800,
    despesaRealizada: 3100,
    saldoRealizado: 1700,
    gapMoney: 400,
    gapPercentage: 0.3076,
    status: "excedente",
    nome: "Julho"
  },
  {
    userId: 87804272,
    mes: 8,
    ano: 2024,
    receitaOrcada: 4500,
    despesaOrcada: 3500,
    saldoOrcado: 1000,
    receitaRealizada: 4200,
    despesaRealizada: 3800,
    saldoRealizado: 400,
    gapMoney: -600,
    gapPercentage: -0.6,
    status: "deficit",
    nome: "Agosto"
  },
  {
    userId: 87804272,
    mes: 9,
    ano: 2024,
    receitaOrcada: 4000,
    despesaOrcada: 3500,
    saldoOrcado: 500,
    receitaRealizada: 4000,
    despesaRealizada: 3500,
    saldoRealizado: 500,
    gapMoney: 0,
    gapPercentage: 0,
    status: "neutro",
    nome: "Setembro"
  },
  {
    userId: 87804272,
    mes: 10,
    ano: 2024,
    receitaOrcada: 4000,
    despesaOrcada: 3500,
    saldoOrcado: 500,
    receitaRealizada: 8940,
    despesaRealizada: 4120,
    saldoRealizado: 4820,
    gapMoney: 4320,
    gapPercentage: 8.64,
    status: "excedente",
    nome: "Outubro"
  },
  {
    userId: 87804272,
    mes: 11,
    ano: 2024,
    receitaOrcada: 4000,
    despesaOrcada: 1000,
    saldoOrcado: 3000,
    receitaRealizada: 3500,
    despesaRealizada: 2500,
    saldoRealizado: 5820,
    gapMoney: 2320,
    gapPercentage: 0.6628571,
    status: "excedente",
    nome: "Novembro"
  },
  {
    userId: 87804272,
    mes: 12,
    ano: 2024,
    receitaOrcada: 1200,
    despesaOrcada: 1200,
    saldoOrcado: 3000,
    receitaRealizada: 0,
    despesaRealizada: 2500,
    saldoRealizado: 3320,
    gapMoney: -180,
    gapPercentage: -0.05142857,
    status: "deficit",
    nome: "Dezembro"
  }
]
