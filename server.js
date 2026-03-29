const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROTA PRINCIPAL (evita "Cannot GET /")
app.get("/", (req, res) => {
  res.send("Sistema online 🚀");
});

// LOGIN SIMPLES
app.post("/login", (req, res) => {
  const { user, password } = req.body;

  if (user === "admin" && password === "123") {
    return res.json({ success: true });
  }

  return res.json({ success: false });
});

// 🔥 HOSTINGER OBRIGATÓRIO
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log("Servidor rodando na porta " + PORT);
});
