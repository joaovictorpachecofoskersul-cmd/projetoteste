const express = require("express");
const path = require("path");

const app = express();

// JSON obrigatório
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// FRONTEND
app.use(express.static(path.join(__dirname, "public")));

// LOGIN SIMPLES (DB fake corrigido)
const users = [
  { user: "admin", password: "123" }
];

app.post("/login", (req, res) => {
  const { user, password } = req.body;

  const found = users.find(
    u => u.user === user && u.password === password
  );

  if (found) {
    return res.json({ success: true });
  }

  return res.json({ success: false });
});

// ROTA PRINCIPAL
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// PORTA COMPATÍVEL (PC + HOSTINGER + GIT)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
