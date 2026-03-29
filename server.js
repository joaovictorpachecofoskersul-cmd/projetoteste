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
// FRONTEND (PASTA PUBLIC)
// ========================
app.use(express.static(path.join(__dirname, "public")));

// ========================
// TESTE API
// ========================
app.get("/api", (req, res) => {
  res.json({ status: "ok" });
});

// ========================
// LOGIN (MYSQL REAL)
// ========================
app.post("/api/login", (req, res) => {
  const { user, pass } = req.body;

  if (!user || !pass) {
    return res.json({ success: false, error: "dados vazios" });
  }

  const sql = "SELECT * FROM users WHERE user = ? AND pass = ?";

  db.query(sql, [user, pass], (err, results) => {
    if (err) {
      console.error("❌ ERRO LOGIN:", err);
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
// MOVIMENTAÇÃO
// ========================
app.post("/api/movimentacao", (req, res) => {
  const { tipo, valor, descricao } = req.body;

  if (!tipo || valor === undefined) {
    return res.json({ success: false, erro: "Dados inválidos" });
  }

  const sql =
    "INSERT INTO movimentacoes (tipo, valor, descricao) VALUES (?, ?, ?)";

  db.query(sql, [tipo, valor, descricao], (err) => {
    if (err) {
      console.error("❌ ERRO MOVIMENTAÇÃO:", err);
      return res.status(500).json({ success: false });
    }

    return res.json({
      success: true,
      mensagem: "Movimentação salva com sucesso!"
    });
  });
});

// ========================
// RELATÓRIO
// ========================
app.get("/api/relatorio", (req, res) => {
  const { data_inicio, data_fim } = req.query;

  let sql = `
    SELECT 
      DATE(data) as data,
      SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as entradas,
      SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as saidas,
      SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE -valor END) as saldo
    FROM movimentacoes
  `;

  const params = [];

  if (data_inicio && data_fim) {
    sql += " WHERE DATE(data) BETWEEN ? AND ?";
    params.push(data_inicio, data_fim);
  }

  sql += " GROUP BY DATE(data) ORDER BY data DESC";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("❌ ERRO RELATÓRIO:", err);
      return res.status(500).json({ erro: err.message });
    }

    return res.json(results);
  });
});

// ========================
// ROTA EXTRATO (LISTAR)
// ========================
app.get("/api/extrato", (req, res) => {
  const sql = "SELECT * FROM movimentacoes ORDER BY data DESC";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ ERRO EXTRATO:", err);
      return res.status(500).json({ erro: err.message });
    }

    return res.json(results);
  });
});

// ========================
// DELETAR MOVIMENTAÇÃO
// ========================
app.delete("/api/movimentacao/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM movimentacoes WHERE id = ?";

  db.query(sql, [id], (err) => {
    if (err) {
      console.error("❌ ERRO DELETE:", err);
      return res.status(500).json({ success: false });
    }

    return res.json({ success: true });
  });
});

// ========================
// PORTA
// ========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Servidor rodando na porta " + PORT);
});
