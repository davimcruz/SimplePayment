/**
 * Utilitários para formatação e validação de CPF.
 * Implementa as regras da Receita Federal do Brasil.
 * 
 * @example
 * formatCPF('12345678900') // retorna '123.456.789-00'
 * validateCPF('123.456.789-00') // retorna true/false
 */

/**
 * Formata uma string numérica em formato CPF (###.###.###-##)
 * Remove caracteres não numéricos antes da formatação
 */
export function formatCPF(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

/**
 * Valida um CPF usando o algoritmo da RFB
 * Implementa a validação dos dígitos verificadores
 * 
 * @param cpf - CPF com ou sem formatação
 * @returns boolean indicando se o CPF é válido
 */
export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '')
  if (cleanCPF.length !== 11) return false
  
  // Validação dos dígitos verificadores
  let sum = 0
  let rest
  
  for (let i = 1; i <= 9; i++) 
    sum = sum + parseInt(cleanCPF.substring(i-1, i)) * (11 - i)
  
  rest = (sum * 10) % 11
  if (rest === 10 || rest === 11) rest = 0
  if (rest !== parseInt(cleanCPF.substring(9, 10))) return false
  
  sum = 0
  for (let i = 1; i <= 10; i++) 
    sum = sum + parseInt(cleanCPF.substring(i-1, i)) * (12 - i)
  
  rest = (sum * 10) % 11
  if (rest === 10 || rest === 11) rest = 0
  if (rest !== parseInt(cleanCPF.substring(10, 11))) return false
  
  return true
} 