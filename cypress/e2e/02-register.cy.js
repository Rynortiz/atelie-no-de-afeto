/// <reference types="cypress" />

describe("Cadastro de usuário", () => {
  const api = Cypress.env("apiUrl");

  it("sucesso: cadastra um novo cliente", () => {
    cy.unique().then((suffix) => {
      cy.validCpf().then((cpf) => {
        cy.request("POST", `${api}/auth/register`, {
          name: `Cliente ${suffix}`,
          email: `cliente${suffix}@teste.com`,
          cpf,
          phone: "44999999999",
          password: "Senha@123",
          confirmPassword: "Senha@123",
        }).then((res) => {
          expect(res.status).to.eq(201);
          expect(res.body.user).to.include({
            email: `cliente${suffix}@teste.com`,
            role: "CLIENT",
          });
          expect(res.body.user).to.not.have.property("password");
        });
      });
    });
  });

  it("falha: e-mail duplicado retorna 409", () => {
    cy.unique().then((suffix) => {
      cy.validCpf().then((cpf1) => {
        const email = `dup${suffix}@teste.com`;
        const base = {
          name: `Dup ${suffix}`,
          email,
          phone: "44999999999",
          password: "Senha@123",
          confirmPassword: "Senha@123",
        };
        // primeiro cadastro: sucesso
        cy.request("POST", `${api}/auth/register`, { ...base, cpf: cpf1 })
          .its("status")
          .should("eq", 201);
        // segundo com o mesmo e-mail (CPF novo): conflito
        cy.validCpf().then((cpf2) => {
          cy.request({
            method: "POST",
            url: `${api}/auth/register`,
            failOnStatusCode: false,
            body: { ...base, cpf: cpf2 },
          }).then((res) => {
            expect(res.status).to.eq(409);
            expect(res.body.message).to.match(/e-mail já cadastrado/i);
          });
        });
      });
    });
  });

  it("falha: senhas não conferem retorna 400", () => {
    cy.unique().then((suffix) => {
      cy.validCpf().then((cpf) => {
        cy.request({
          method: "POST",
          url: `${api}/auth/register`,
          failOnStatusCode: false,
          body: {
            name: `Cliente ${suffix}`,
            email: `mismatch${suffix}@teste.com`,
            cpf,
            phone: "44999999999",
            password: "Senha@123",
            confirmPassword: "Outra@123",
          },
        }).then((res) => {
          expect(res.status).to.eq(400);
          expect(res.body.message).to.match(/senhas não conferem/i);
        });
      });
    });
  });

  it("falha: CPF inválido retorna 400", () => {
    cy.unique().then((suffix) => {
      cy.request({
        method: "POST",
        url: `${api}/auth/register`,
        failOnStatusCode: false,
        body: {
          name: `Cliente ${suffix}`,
          email: `cpfinvalido${suffix}@teste.com`,
          cpf: "00000000000",
          phone: "44999999999",
          password: "Senha@123",
          confirmPassword: "Senha@123",
        },
      }).then((res) => {
        expect(res.status).to.eq(400);
        expect(res.body.message).to.match(/cpf inválido/i);
      });
    });
  });
});
