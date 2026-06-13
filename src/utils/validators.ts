import { Address } from '../types';

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
export const validateAddress = (address: Partial<Address>) => {
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
 * Máscara de telefone/celular brasileiro.
 */
export const maskPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(-\d{4})\d+?$/, '$1');
  }

  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
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

export const validateCPF = (cpf: string) => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  const digits = cleanCPF.split('').map(Number);
  const calculateDigit = (factor: number) => {
    const total = digits
      .slice(0, factor - 1)
      .reduce((sum, digit, index) => sum + digit * (factor - index), 0);
    const rest = (total * 10) % 11;
    return rest === 10 ? 0 : rest;
  };

  return calculateDigit(10) === digits[9] && calculateDigit(11) === digits[10];
};

export const getCPFValidationError = (cpf: string) => {
  const cleanCPF = cpf.replace(/\D/g, '');
  if (!cleanCPF) return '';
  if (cleanCPF.length < 11) return 'CPF incompleto. Informe os 11 dígitos.';
  if (!validateCPF(cpf)) return 'CPF inválido. Confira os dígitos informados.';
  return '';
};

export const validatePhone = (phone: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (cleanPhone.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanPhone)) return false;

  const ddd = Number(cleanPhone.slice(0, 2));
  const number = cleanPhone.slice(2);
  const subscriberDigits = cleanPhone.slice(3);
  const hasValidDDD = ddd >= 11 && ddd <= 99;
  const hasMobileNinthDigit = cleanPhone[2] === '9';
  const hasRepeatedSubscriber = /^(\d)\1{7}$/.test(subscriberDigits);
  const hasRepeatedMobileNumber = /^(\d)\1{8}$/.test(number);
  const uniqueSubscriberDigits = new Set(subscriberDigits).size;
  const blockedPatterns = new Set([
    '12345678',
    '23456789',
    '34567890',
    '01234567',
    '87654321',
    '98765432',
    '09876543',
  ]);

  return (
    hasValidDDD &&
    hasMobileNinthDigit &&
    !hasRepeatedSubscriber &&
    !hasRepeatedMobileNumber &&
    uniqueSubscriberDigits >= 3 &&
    !blockedPatterns.has(subscriberDigits)
  );
};

export const getPhoneValidationError = (phone: string, label = 'Celular') => {
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone) return '';
  if (cleanPhone.length < 11) return `${label} incompleto. Use DDD e número com 9 dígitos.`;
  if (!validatePhone(phone)) return `${label} inválido. Use um número real com DDD e 9 dígitos.`;
  return '';
};
