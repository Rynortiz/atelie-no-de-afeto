import client from './client';

export const authService = {
  async login(email, password) {
    const { data } = await client.post('/auth/login', { email, password });
    return data;
  },

  async register({ name, email, cpf, phone, password, confirmPassword }) {
    const { data } = await client.post('/auth/register', {
      name,
      email,
      cpf,
      phone,
      password,
      confirmPassword,
    });
    return data;
  },
};
