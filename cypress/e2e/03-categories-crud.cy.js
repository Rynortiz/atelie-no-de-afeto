/// <reference types="cypress" />
describe("CRUD — Categorias", () => {
  const api = Cypress.env("apiUrl");
  let token;
  let categoryId;
  let name;

  before(() => {
    cy.adminToken().then((t) => (token = t));
    cy.unique().then((s) => (name = `Categoria ${s}`));
  });

  const auth = () => ({ Authorization: `Bearer ${token}` });

  it("sucesso: cadastra uma nova categoria", () => {
    cy.request({
      method: "POST",
      url: `${api}/categories`,
      headers: auth(),
      body: { name },
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body.message).to.match(/criada com sucesso/i);
      expect(res.body.category).to.have.property("id");
      expect(res.body.category.name).to.eq(name);
      categoryId = res.body.category.id;
    });
  });

  it("falha: nome duplicado retorna 409", () => {
    cy.request({
      method: "POST",
      url: `${api}/categories`,
      headers: auth(),
      failOnStatusCode: false,
      body: { name },
    }).then((res) => {
      expect(res.status).to.eq(409);
      expect(res.body.message).to.match(/já existe uma categoria/i);
    });
  });

  it("falha: nome vazio retorna 400", () => {
    cy.request({
      method: "POST",
      url: `${api}/categories`,
      headers: auth(),
      failOnStatusCode: false,
      body: { name: "" },
    }).then((res) => {
      expect(res.status).to.eq(400);
    });
  });

  it("falha: criar sem autenticação retorna 401", () => {
    cy.request({
      method: "POST",
      url: `${api}/categories`,
      failOnStatusCode: false,
      body: { name: "Sem token" },
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it("sucesso: lista categorias e encontra a recém-criada", () => {
    cy.request({
      method: "GET",
      url: `${api}/categories?page=1&limit=100`,
      headers: auth(),
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("data").and.to.be.an("array");
      const found = res.body.data.find((c) => c.id === categoryId);
      expect(found, "categoria criada deve aparecer na listagem").to.exist;
    });
  });

  it("sucesso: edita o nome da categoria", () => {
    const newName = `${name} Editada`;
    cy.request({
      method: "PUT",
      url: `${api}/categories/${categoryId}`,
      headers: auth(),
      body: { name: newName },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.message).to.match(/atualizada com sucesso/i);
      expect(res.body.category.name).to.eq(newName);
      name = newName;
    });
  });

  it("falha: editar categoria inexistente retorna 404", () => {
    cy.request({
      method: "PUT",
      url: `${api}/categories/00000000-0000-0000-0000-000000000000`,
      headers: auth(),
      failOnStatusCode: false,
      body: { name: "Inexistente" },
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });

  it("sucesso: exclui a categoria", () => {
    cy.request({
      method: "DELETE",
      url: `${api}/categories/${categoryId}`,
      headers: auth(),
    }).then((res) => {
      expect(res.status).to.eq(204);
    });
  });

  it("falha: excluir a mesma categoria de novo retorna 404", () => {
    cy.request({
      method: "DELETE",
      url: `${api}/categories/${categoryId}`,
      headers: auth(),
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });
});
