// ─── Comandos customizados ───────────────────────────────────

// Faz login direto na API e devolve o token (sem passar pela UI).
Cypress.Commands.add("apiLogin", (email, password) => {
  return cy
    .request("POST", `${Cypress.env("apiUrl")}/auth/login`, {
      email,
      password,
    })
    .then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body).to.have.property("token");
      return res.body.token;
    });
});

// Login como ADMIN (usa as credenciais do seed).
Cypress.Commands.add("adminToken", () => {
  return cy.apiLogin(
    Cypress.env("adminEmail"),
    Cypress.env("adminPassword"),
  );
});

// Gera um sufixo único para evitar colisões de e-mail/CPF/nome entre execuções.
Cypress.Commands.add("unique", () => {
  return cy.wrap(Date.now().toString().slice(-9));
});

// CPF válido gerado dinamicamente (passa no validador do backend).
Cypress.Commands.add("validCpf", () => {
  const n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const calc = (base) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) {
      sum += base[i] * (base.length + 1 - i);
    }
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  const d1 = calc(n);
  const d2 = calc([...n, d1]);
  return cy.wrap([...n, d1, d2].join(""));
});
