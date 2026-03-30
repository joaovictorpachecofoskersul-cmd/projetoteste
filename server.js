const express = require("express");
const path = require("path");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();

// Conexão
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.log("❌ Erro:", err.message);
  } else {
    console.log("✅ Conectado!");
  }
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/teste-db", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) return res.json({ error: err.message });
    res.json(results);
  });
});

app.post("/api/login", (req, res) => {
  const { user, pass } = req.body;
  db.query("SELECT * FROM users WHERE user = ?", [user], (err, results) => {
    if (err) return res.json({ success: false });
    if (results.length === 0) return res.json({ success: false, error: "Usuário não encontrado" });
    if (results[0].pass !== pass) return res.json({ success: false, error: "Senha incorreta" });
    res.json({ success: true });
  });
});

app.post("/api/movimentacao", (req, res) => {
  const { tipo, valor, descricao } = req.body;
  db.query("INSERT INTO movimentacoes (tipo, valor, descricao) VALUES (?, ?, ?)",
    [tipo, valor, descricao], (err) => {
      if (err) return res.json({ success: false });
      res.json({ success: true });
    });
});

app.get("/api/movimentacoes", (req, res) => {
  db.query("SELECT * FROM movimentacoes ORDER BY data DESC", (err, results) => {
    if (err) return res.json([]);
    res.json(results);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor: http://localhost:${PORT}`);
});
