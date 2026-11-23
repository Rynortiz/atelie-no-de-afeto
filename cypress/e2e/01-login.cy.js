/// <reference types="cypress" />

describe("Autenticação — Login", () => {
  const api = Cypress.env("apiUrl");

  it("sucesso: autentica o admin do seed e devolve token", () => {
    cy.request("POST", `${api}/auth/login`, {
      email: Cypress.env("adminEmail"),
      password: Cypress.env("adminPassword"),
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("token").and.to.be.a("string");
      expect(res.body.user).to.include({ role: "ADMIN" });
      expect(res.body.user).to.not.have.property("password");
    });
  });

  it("falha: senha incorreta retorna 401", () => {
    cy.request({
      method: "POST",
      url: `${api}/auth/login`,
      failOnStatusCode: false,
      body: {
        email: Cypress.env("adminEmail"),
        password: "senha-errada-123",
      },
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body.message).to.match(/credenciais inválidas/i);
    });
  });

  it("falha: e-mail inexistente retorna 401", () => {
    cy.request({
      method: "POST",
      url: `${api}/auth/login`,
      failOnStatusCode: false,
      body: { email: "naoexiste@nosdeafeto.com", password: "Qualquer123" },
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });
});
