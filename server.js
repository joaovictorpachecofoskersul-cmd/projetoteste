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
// SERVIR FRONTEND
// ========================
app.use(express.static(path.join(__dirname, "public")));

// ========================
// TESTE API
// ========================
app.get("/api", (req, res) => {
  res.json({ status: "ok" });
});

// ========================
// LOGIN (CORRIGIDO)
// ========================
app.post("/api/login", (req, res) => {
  const { user, pass } = req.body;

  if (!user || !pass) {
    return res.json({ success: false, message: "Dados vazios" });
  }

  const sql = "SELECT * FROM usuarios WHERE username = ? AND password = ?";

  db.query(sql, [user, pass], (err, results) => {
    if (err) {
      console.error("Erro login:", err);
      return res.status(500).json({ success: false });
    }

    if (results.length > 0) {
      return res.json({
        success: true,
        user: results[0]
      });
    }

    return res.json({ success: false, message: "Usuário inválido" });
  });
});

// ========================
// MOVIMENTAÇÃO (CORRIGIDO)
// ========================
app.post("/api/movimentacao", (req, res) => {
  const { tipo, valor, descricao } = req.body;

  if (!tipo || !valor) {
    return res.json({ success: false, erro: "Dados inválidos" });
  }

  const sql = `
    INSERT INTO movimentacoes (tipo, valor, descricao) 
    VALUES (?, ?, ?)
  `;

  db.query(sql, [tipo, valor, descricao || ""], (err) => {
    if (err) {
      console.error("Erro movimentacao:", err);
      return res.status(500).json({ success: false });
    }

    return res.json({ success: true });
  });
});

// ========================
// EXTRATO
// ========================
app.get("/api/extrato", (req, res) => {
  const sql = "SELECT * FROM movimentacoes ORDER BY data DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Erro extrato:", err);
      return res.status(500).json([]);
    }

    res.json(results);
  });
});

// ========================
// RELATÓRIO
// ========================
app.get("/api/relatorio", (req, res) => {
  const { data_inicio, data_fim } = req.query;

  let query = `
    SELECT 
      DATE(data) as data,
      SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as entradas,
      SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as saidas,
      SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE -valor END) as saldo_dia
    FROM movimentacoes
  `;

  const params = [];

  if (data_inicio && data_fim) {
    query += " WHERE DATE(data) BETWEEN ? AND ?";
    params.push(data_inicio, data_fim);
  }

  query += " GROUP BY DATE(data) ORDER BY data DESC";

  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Erro relatório:", err);
      return res.status(500).json([]);
    }

    res.json(results);
  });
});

// ========================
// ROTA PADRÃO (IMPORTANTE)
// ========================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ========================
// PORTA
// ========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Servidor rodando na porta " + PORT);
});
