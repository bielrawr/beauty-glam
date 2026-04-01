/**
 * Validações e utilitários de formatação para o projeto.
 */

/**
 * Valida se um e-mail possui formato correto.
 */
export const isValidEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Formata um número como moeda BRL.
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Valida campos de endereço obrigatórios.
 */
export const validateAddress = (address: any) => {
  const errors: Record<string, string> = {};
  if (!address.street) errors.street = "Rua é obrigatória";
  if (!address.number) errors.number = "Número é obrigatório";
  if (!address.city) errors.city = "Cidade é obrigatória";
  if (!address.state) errors.state = "Estado é obrigatório";
  if (!address.zip) errors.zip = "CEP é obrigatório";
  return errors;
};

/**
 * Gera um ID de cliente único para simulação.
 * Combina o prefixo "BG-", 4 caracteres aleatórios e os últimos 4 dígitos do timestamp atual.
 */
export const generateCustomerId = (): string => {
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timestamp = Date.now().toString().slice(-4);
  return `BG-${random}${timestamp}`;
};

/**
 * Máscara básica de CPF (000.000.000-00)
 */
export const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

/**
 * Máscara básica de CEP (00000-000)
 */
export const maskCEP = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
};

/**
 * Validação simples de CPF
 */
export const validateCPF = (cpf: string) => {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.length === 11;
};
