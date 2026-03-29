const express = require("express");
const path = require("path");
require("dotenv").config();
const mysql = require("mysql2");

const app = express();

// ========================
// CONEXÃO HOSTINGER
// ========================
const db = mysql.createConnection({
  host: "auth-db1601.hstgr.io",
  user: "u519611382_8uP59",
  password: "21@Elesig",
  database: "u519611382_T9bc4"
});

db.connect((err) => {
  if (err) {
    console.error("❌ Erro ao conectar no banco:", err);
  } else {
    console.log("✅ Conectado ao MySQL da Hostinger");
  }
});

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
// LOGIN REAL (CORRIGIDO)
// ========================
app.post("/api/login", (req, res) => {
  const { user, pass } = req.body;

  console.log("Tentativa login:", user, pass);

  if (!user || !pass) {
    return res.json({ success: false, error: "dados vazios" });
  }

  const sql = "SELECT * FROM users WHERE user = ? AND pass = ?";

  db.query(sql, [user, pass], (err, results) => {
    if (err) {
      console.log("Erro SQL:", err);
      return res.status(500).json({ success: false });
    }

    console.log("Resultado:", results);

    if (results.length > 0) {
      return res.json({ success: true, user: results[0] });
    } else {
      return res.json({ success: false });
    }
  });
});

// ========================
// MOVIMENTAÇÃO
// ========================
app.post("/api/movimentacao", (req, res) => {
  const { tipo, valor, descricao } = req.body;

  if (!tipo || !valor) {
    return res.json({ success: false, erro: "Dados inválidos" });
  }

  const sql = "INSERT INTO movimentacoes (tipo, valor, descricao) VALUES (?, ?, ?)";

  db.query(sql, [tipo, valor, descricao], (err) => {
    if (err) {
      console.log("Erro SQL:", err);
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
