import client from './client';

/**
 * CRUD completo dos produtos, persiste também no banco do prisma
 */
export const productService = {
  /** GET /products — leitura pública, com paginação. */
  async list({ page = 1, limit = 20 } = {}) {
    const { data } = await client.get('/products', { params: { page, limit } });
    return data;
  },

  /** GET /products/:id */
  async getById(id) {
    const { data } = await client.get(`/products/${id}`);
    return data;
  },

  /** POST /products — só ADMIN. */
  async create(product) {
    const { data } = await client.post('/products', product);
    return data;
  },

  /** PUT /products/:id — só ADMIN. */
  async update(id, product) {
    const { data } = await client.put(`/products/${id}`, product);
    return data;
  },

  /** DELETE /products/:id — sóADMIN. */
  async remove(id) {
    await client.delete(`/products/${id}`);
  },
};

export const categoryService = {
  /** GET /categories — só autenticado */
  async list({ page = 1, limit = 100 } = {}) {
    const { data } = await client.get('/categories', {
      params: { page, limit },
    });
    return data;
  },
};
