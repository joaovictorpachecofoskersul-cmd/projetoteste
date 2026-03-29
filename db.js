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
// TESTE
// ========================
app.get("/api", (req, res) => {
  res.json({ status: "ok" });
});

// ========================
// LOGIN MYSQL REAL
// ========================
app.post("/api/login", (req, res) => {
  const { user, pass } = req.body;

  if (!user || !pass) {
    return res.json({ success: false, message: "dados vazios" });
  }

  const sql = "SELECT * FROM users WHERE user = ? AND pass = ?";

  db.query(sql, [user, pass], (err, results) => {
    if (err) {
      console.log("Erro login:", err);
      return res.status(500).json({ success: false });
    }

    if (results.length > 0) {
      return res.json({
        success: true,
        user: results[0]
      });
    }

    return res.json({ success: false });
  });
});

// ========================
// MOVIMENTAÇÃO (JÁ NO MESMO DB)
// ========================
app.post("/api/movimentacao", (req, res) => {
  const { tipo, valor, user_id } = req.body;

  if (!tipo || !valor || !user_id) {
    return res.json({ success: false, erro: "Dados inválidos" });
  }

  const sql =
    "INSERT INTO movimentacoes (tipo, valor, user_id) VALUES (?, ?, ?)";

  db.query(sql, [tipo, valor, user_id], (err) => {
    if (err) {
      console.log("Erro movimentacao:", err);
      return res.status(500).json({ success: false });
    }

    return res.json({ success: true });
  });
});

// ========================
// RELATÓRIO POR USUÁRIO
// ========================
app.get("/relatorio", (req, res) => {
  const { user_id } = req.query;

  let sql = `
    SELECT 
      DATE(data) as data,
      SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as entradas,
      SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as saidas,
      SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE -valor END) as saldo
    FROM movimentacoes
  `;

  const params = [];

  if (user_id) {
    sql += " WHERE user_id = ?";
    params.push(user_id);
  }

  sql += " GROUP BY DATE(data) ORDER BY data DESC";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.log("Erro relatório:", err);
      return res.status(500).json({ erro: err.message });
    }

    return res.json(results);
  });
});

// ========================
// PORTA
// ========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Servidor rodando na porta " + PORT);
});
