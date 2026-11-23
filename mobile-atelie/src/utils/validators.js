/**
 * Validações de entrada reutilizáveis.
 * Espelham as regras do backend, dando feedback imediato ao usuário
 * sem depender de uma ida ao servidor (o backend segue validando
 * de novo — validação no cliente é conveniência, não segurança).
 */

export const isValidEmail = email =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());

export const isNotEmpty = value => String(value ?? '').trim().length > 0;

export const isPositiveNumber = value => {
  const n = Number(String(value).replace(',', '.'));
  return !Number.isNaN(n) && n > 0;
};

export const isNonNegativeInteger = value => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 0;
};

/** Remove tudo que não for dígito — usado por CPF e telefone. */
export const onlyDigits = value => String(value ?? '').replace(/\D/g, '');

/**
 * Valida CPF pelos dígitos verificadores (mesma regra do backend).
 * Aceita com ou sem máscara: a limpeza acontece aqui dentro.
 */
export const isValidCpf = cpf => {
  const digits = onlyDigits(cpf);

  if (digits.length !== 11) return false;
  // Sequências como 111.111.111-11 passam no cálculo, mas são inválidas.
  if (/^(\d)\1{10}$/.test(digits)) return false;

  const calcCheckDigit = length => {
    let sum = 0;
    for (let i = 0; i < length; i += 1) {
      sum += Number(digits[i]) * (length + 1 - i);
    }
    const result = (sum * 10) % 11;
    return result === 10 ? 0 : result;
  };

  return (
    calcCheckDigit(9) === Number(digits[9]) &&
    calcCheckDigit(10) === Number(digits[10])
  );
};

/**
 * Valida o formulário de produto segundo as regras de negócio:
 * nome obrigatório, preço maior que zero, estoque não negativo
 * e categoria obrigatória.
 * Retorna um objeto de erros por campo ({} = válido).
 */
export const validateProductForm = ({ name, price, stock, categoryId }) => {
  const errors = {};

  if (!isNotEmpty(name)) {
    errors.name = 'Informe o nome do produto.';
  }
  if (!isPositiveNumber(price)) {
    errors.price = 'O preço deve ser maior que zero.';
  }
  if (!isNonNegativeInteger(stock)) {
    errors.stock = 'O estoque deve ser um número inteiro (0 ou mais).';
  }
  if (!isNotEmpty(categoryId)) {
    errors.categoryId = 'Selecione uma categoria.';
  }

  return errors;
};

export const validateLoginForm = ({ email, password }) => {
  const errors = {};

  if (!isValidEmail(email)) {
    errors.email = 'Informe um e-mail válido.';
  }
  if (!isNotEmpty(password)) {
    errors.password = 'Informe sua senha.';
  }

  return errors;
};

/**
 * o que valida o tanto o formulário quanto a força da senha
 * é o backend
 */
export const validateRegisterForm = ({
  name,
  email,
  cpf,
  phone,
  password,
  confirmPassword,
}) => {
  const errors = {};

  if (!isNotEmpty(name)) {
    errors.name = 'Informe seu nome.';
  }
  if (!isValidEmail(email)) {
    errors.email = 'Informe um e-mail válido.';
  }
  if (!isValidCpf(cpf)) {
    errors.cpf = 'Informe um CPF válido.';
  }
  // tel é opcional
  if (isNotEmpty(phone) && onlyDigits(phone).length < 10) {
    errors.phone = 'Informe o telefone com DDD.';
  }
  if (!isNotEmpty(password)) {
    errors.password = 'Informe uma senha.';
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = 'As senhas não conferem.';
  }

  return errors;
};