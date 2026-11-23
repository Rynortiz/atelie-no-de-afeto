import { onlyDigits } from './validators';

/** formata valor para BR */
export const formatCurrency = value => {
  const number = Number(value) || 0;
  return number.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

/**
 *formata valor com ,
 */
export const formatPriceInput = value => {
  if (value === null || value === undefined || value === '') return '';

  const number = Number(value);
  if (Number.isNaN(number)) return '';
  return number.toFixed(2).replace('.', ',');
};
export const parseDecimal = text =>
  Number(String(text).replace(',', '.')) || 0;

/**
 * máscara do CPF
 */
export const formatCpf = value => {
  const digits = onlyDigits(value).slice(0, 11);

  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

/**
 * Máscara de telefone, cobrindo fixo (10 dígitos) e celular (11).
 */
export const formatPhone = value => {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }

  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
};