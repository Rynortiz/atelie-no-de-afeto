// Validação das mensagens de commit (padrão Conventional Commits).
// Ex.: feat: adiciona proxy reverso | fix: corrige redirect HTTPS
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    "subject-empty": [2, "never"],
    "type-empty": [2, "never"],
  },
};
