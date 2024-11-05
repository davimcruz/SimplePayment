export function maskCPF(value: string) {
  // Remove tudo que não é número
  const cleanValue = value.replace(/\D/g, '')
  
  // Limita a 11 dígitos
  const cpf = cleanValue.slice(0, 11)
  
  // Aplicar a máscara 999.999.999-99
  return cpf
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
} 