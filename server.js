const express = require("express");
const path = require("path");
require("dotenv").config();

const db = require("./db");

const app = express();

// ========================
// MIDDLEWARE
// ========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================
// FRONTEND
// ========================
app.use(express.static(path.join(__dirname, "public")));

// ========================
// TESTE API
// ========================
app.get("/api", (req, res) => {
  res.json({ status: "ok" });
});

// ========================
// LOGIN
// ========================
app.post("/api/login", (req, res) => {
  const { user, pass } = req.body;

  if (user === "admin" && pass === "123") {
    return res.json({ success: true });
  }

  return res.json({ success: false });
});

// ========================
// SALVAR MOVIMENTAÇÃO
// ========================
app.post("/api/movimentacao", (req, res) => {
  const { tipo, valor } = req.body;

  if (!tipo || !valor) {
    return res.json({ success: false, erro: "Dados inválidos" });
  }

  const sql = "INSERT INTO movimentacoes (tipo, valor) VALUES (?, ?)";

  db.query(sql, [tipo, valor], (err) => {
    if (err) {
      console.log("Erro:", err);
      return res.json({ success: false });
    }

    res.json({ success: true });
  });
});

// ========================
// RELATÓRIO
// ========================
app.get("/relatorio", (req, res) => {
  const { data_inicio, data_fim } = req.query;

  let query = `
    SELECT 
      DATE(data) as data,
      SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as entradas,
      SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as saidas,
      SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE -valor END) as saldo_dia
    FROM movimentacoes
  `;

  let params = [];

  if (data_inicio && data_fim) {
    query += ` WHERE DATE(data) BETWEEN ? AND ?`;
    params.push(data_inicio, data_fim);
  }

  query += ` GROUP BY DATE(data) ORDER BY data DESC`;

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Erro relatório:", err);
      return res.status(500).json({ erro: err.message });
    }

    res.json(results);
  });
});

// ========================
// PORTA
// ========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Servidor rodando");
});
