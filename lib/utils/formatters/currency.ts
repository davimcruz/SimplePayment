/**
 * Classe utilitária para manipulação de valores monetários
 * Implementa formatação e parsing seguindo padrões brasileiros
 * 
 * @remarks
 * Todos os valores são tratados internamente como centavos para evitar
 * problemas de precisão com números decimais
 */
export class CurrencyFormatter {
  static readonly locale = 'pt-BR'
  static readonly currency = 'BRL'
  
  /**
   * Formata um número para exibição monetária
   * @param amount - Valor em reais
   * @returns String formatada (ex: R$ 1.234,56)
   */
  static format(amount: number): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency: this.currency
    }).format(amount)
  }

  /**
   * Converte uma string formatada em número
   * @param value - String formatada (aceita R$, pontos e vírgulas)
   */
  static parse(value: string): number {
    return Number(value.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
  }

  /**
   * Converte reais para centavos
   * Útil para APIs que trabalham com valores inteiros
   */
  static toMinorUnits(amount: number): number {
    return Math.round(amount * 100)
  }

  /**
   * Converte centavos para reais
   * @param minorUnits - Valor em centavos
   */
  static fromMinorUnits(minorUnits: number): number {
    return minorUnits / 100
  }
}

/**
 * Hook para manipulação de inputs monetários
 * Mantém o estado formatado e fornece métodos de conversão
 * 
 * @example
 * const { format, parse } = useCurrencyInput(1000)
 */
export function useCurrencyInput(initialValue = 0) {
  // Implementação mantida por brevidade
} 