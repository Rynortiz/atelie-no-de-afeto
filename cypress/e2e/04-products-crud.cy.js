/// <reference types="cypress" />
// Cria uma categoria de apoio e a remove ao final (cleanup).
describe("CRUD — Produtos", () => {
  const api = Cypress.env("apiUrl");
  let token;
  let categoryId;
  let productId;
  let productName;

  before(() => {
    cy.adminToken().then((t) => {
      token = t;
      // categoria de apoio para os produtos
      cy.unique().then((s) => {
        cy.request({
          method: "POST",
          url: `${api}/categories`,
          headers: { Authorization: `Bearer ${token}` },
          body: { name: `Apoio Produtos ${s}` },
        }).then((res) => {
          categoryId = res.body.category.id;
        });
        productName = `Produto ${s}`;
      });
    });
  });

  after(() => {
    // remove a categoria de apoio (já sem produtos vinculados)
    if (categoryId) {
      cy.request({
        method: "DELETE",
        url: `${api}/categories/${categoryId}`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      });
    }
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });

  it("sucesso: cadastra um novo produto", () => {
    cy.request({
      method: "POST",
      url: `${api}/products`,
      headers: auth(),
      body: {
        name: productName,
        description: "Peça de teste em crochê feita à mão.",
        price: 99.9,
        stock: 10,
        categoryId,
      },
    }).then((res) => {
      expect(res.status).to.eq(201);
      const body = res.body.product || res.body;
      expect(body).to.have.property("id");
      expect(body.name).to.eq(productName);
      productId = body.id;
    });
  });

  it("falha: preço zero retorna 400", () => {
    cy.request({
      method: "POST",
      url: `${api}/products`,
      headers: auth(),
      failOnStatusCode: false,
      body: {
        name: "Produto inválido",
        description: "desc",
        price: 0,
        stock: 5,
        categoryId,
      },
    }).then((res) => {
      expect(res.status).to.eq(400);
      expect(res.body.message).to.match(/preço deve ser maior/i);
    });
  });

  it("falha: categoria inexistente retorna 404", () => {
    cy.request({
      method: "POST",
      url: `${api}/products`,
      headers: auth(),
      failOnStatusCode: false,
      body: {
        name: "Produto sem categoria",
        description: "desc",
        price: 50,
        stock: 5,
        categoryId: "00000000-0000-0000-0000-000000000000",
      },
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });

  it("falha: criar produto sem autenticação retorna 401", () => {
    cy.request({
      method: "POST",
      url: `${api}/products`,
      failOnStatusCode: false,
      body: {
        name: "Sem token",
        description: "desc",
        price: 10,
        stock: 1,
        categoryId,
      },
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it("sucesso: lista produtos (rota pública) e encontra o criado", () => {
    cy.request({
      method: "GET",
      url: `${api}/products?page=1&limit=100`,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("data").and.to.be.an("array");
      const found = res.body.data.find((p) => p.id === productId);
      expect(found, "produto criado deve aparecer na listagem").to.exist;
    });
  });

  it("sucesso: edita preço e estoque do produto", () => {
    cy.request({
      method: "PUT",
      url: `${api}/products/${productId}`,
      headers: auth(),
      body: {
        name: productName,
        description: "Descrição atualizada.",
        price: 149.9,
        stock: 25,
        categoryId,
      },
    }).then((res) => {
      expect(res.status).to.eq(200);
      const body = res.body.product || res.body;
      expect(Number(body.price)).to.eq(149.9);
      expect(body.stock).to.eq(25);
    });
  });

  it("falha: editar produto inexistente retorna 404", () => {
    cy.request({
      method: "PUT",
      url: `${api}/products/00000000-0000-0000-0000-000000000000`,
      headers: auth(),
      failOnStatusCode: false,
      body: {
        name: "x",
        description: "x",
        price: 10,
        stock: 1,
        categoryId,
      },
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });

  it("sucesso: exclui o produto", () => {
    cy.request({
      method: "DELETE",
      url: `${api}/products/${productId}`,
      headers: auth(),
    }).then((res) => {
      expect(res.status).to.eq(204);
    });
  });

  it("falha: excluir o mesmo produto de novo retorna 404", () => {
    cy.request({
      method: "DELETE",
      url: `${api}/products/${productId}`,
      headers: auth(),
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });
});
