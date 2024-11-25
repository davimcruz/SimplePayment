/**
 * Utilitários avançados para manipulação de datas
 * Implementa formatação, comparação e manipulação seguindo padrões brasileiros
 * 
 * @remarks
 * - Todas as datas são tratadas no timezone local
 * - Formatação segue padrões brasileiros por default
 * - Suporta ISO8601 para integrações
 */
export class DateUtils {
  private static now = new Date()

  /**
   * Obtém informações do mês atual
   * @returns Objeto com número, nome completo e abreviado
   * 
   * @example
   * const { number, fullName } = DateUtils.getCurrentMonth()
   * console.log(`Mês ${number}: ${fullName}`) // Mês 3: Março
   */
  static getCurrentMonth(): {
    number: number;
    fullName: string;
    shortName: string;
    paddedNumber: string;
  } {
    const monthIndex = this.now.getMonth()
    return {
      number: monthIndex + 1,
      fullName: MONTHS_PT.full[monthIndex],
      shortName: MONTHS_PT.short[monthIndex],
      paddedNumber: String(monthIndex + 1).padStart(2, '0')
    }
  }

  /**
   * Formata uma data para exibição
   * @param date - Data a ser formatada
   * @param format - Formato desejado ('iso' | 'br' | 'timestamp')
   * 
   * @example
   * DateUtils.format(new Date(), 'br') // '21/03/2024'
   * DateUtils.format(new Date(), 'iso') // '2024-03-21T10:30:00.000Z'
   */
  static format(date: Date | string, format: 'iso' | 'br' | 'timestamp' = 'br'): string {
    const d = typeof date === 'string' ? new Date(date) : date
    
    switch (format) {
      case 'iso':
        return d.toISOString()
      case 'br':
        return d.toLocaleDateString('pt-BR')
      case 'timestamp':
        return d.toLocaleString('pt-BR')
      default:
        return d.toLocaleDateString('pt-BR')
    }
  }

  /**
   * Formata uma data usando um padrão customizado
   * @param pattern - Padrão usando tokens (dd, mm, yyyy, hh, mi, ss)
   * 
   * @example
   * DateUtils.formatCustom(new Date(), 'dd/mm/yyyy hh:mi')
   * // Retorna '21/03/2024 10:30'
   */
  static formatCustom(date: Date | string, pattern: string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')

    return pattern
      .replace('dd', day)
      .replace('mm', month)
      .replace('yyyy', String(year))
      .replace('hh', hours)
      .replace('mi', minutes)
      .replace('ss', seconds)
  }

  /**
   * Obtém range de datas formatado
   * Útil para relatórios e filtros
   * 
   * @example
   * const { start, end } = DateUtils.getDateRangeFormatted(
   *   startDate,
   *   endDate,
   *   'br'
   * )
   */
  static getDateRangeFormatted(
    startDate: Date,
    endDate: Date,
    format: 'iso' | 'br' | 'timestamp' = 'br'
  ): {
    start: string;
    end: string;
  } {
    return {
      start: this.format(startDate, format),
      end: this.format(endDate, format)
    }
  }
}

/**
 * Meses em português para formatação
 * @internal
 */
export const MONTHS_PT = {
  full: [
    'Janeiro',
    'Fevereiro',
    'Março', 
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto', 
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro'
  ],
  short: [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez'
  ]
} as const 