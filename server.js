const express = require("express");
const path = require("path");

const app = express();

// Middleware obrigatório
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SERVIR FRONTEND (PC + celular)
app.use(express.static(path.join(__dirname, "public")));

// ROTAS
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// LOGIN (exemplo funcional)
app.post("/login", (req, res) => {
  const { user, password } = req.body;

  if (user === "admin" && password === "123") {
    return res.json({ success: true });
  }

  return res.json({ success: false });
});

// PORTA COMPATÍVEL COM HOSTINGER + LOCAL
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
