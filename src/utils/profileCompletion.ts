import { UserProfile } from '../types';
import { validateCPF, validatePhone } from './validators';

function hasCompleteAddress(profile?: UserProfile | null) {
  return Boolean(profile?.addresses?.some((address) => (
    address.zip?.trim() &&
    address.street?.trim() &&
    address.number?.trim() &&
    address.city?.trim() &&
    address.state?.trim()
  )));
}

export function getProfileCompletion(profile?: UserProfile | null) {
  const missingFields: string[] = [];
  const hasValidPhone = Boolean(profile?.phone?.trim() && validatePhone(profile.phone));
  const hasValidCPF = Boolean(profile?.cpf?.trim() && validateCPF(profile.cpf));

  if (!profile?.displayName?.trim()) missingFields.push('nome completo');
  if (!hasValidPhone) missingFields.push('celular');
  if (!hasValidCPF) missingFields.push('CPF');
  if (!profile?.birthDate?.trim()) missingFields.push('data de nascimento');
  if (!hasCompleteAddress(profile)) missingFields.push('endereço de entrega');

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    targetTab: !profile?.displayName?.trim() || !hasValidPhone || !hasValidCPF || !profile?.birthDate?.trim() ? 'data' : 'addresses',
  };
}
