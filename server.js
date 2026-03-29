const express = require("express");
const path = require("path");

const app = express();

// MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// FRONTEND
app.use(express.static(path.join(__dirname, "public")));

// ROTA TESTE
app.get("/api", (req, res) => {
  res.json({ status: "ok" });
});

// LOGIN
app.post("/api/login", (req, res) => {
  const { user, pass } = req.body;

  // Login simples (depois você pode ligar no banco)
  if (user === "admin" && pass === "123") {
    return res.json({ success: true });
  }

  return res.json({ success: false });
});

// PORTA HOSTINGER
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Servidor rodando");
});
