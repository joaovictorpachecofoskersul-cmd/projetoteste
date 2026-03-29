const express = require("express");
const path = require("path");
const mysql = require("mysql2");

const app = express();

// ========================
// CONEXÃO MYSQL HOSTINGER
// ========================
const db = mysql.createConnection({
  host: "auth-db1601.hstgr.io",
  user: "u519611382_8uP59",
  password: "21@Elesig",
  database: "u519611382_T9bc4"
});

db.connect((err) => {
  if (err) {
    console.log("❌ Erro ao conectar no banco:", err);
  } else {
    console.log("✅ Conectado ao MySQL");
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
// TESTE API
// ========================
app.get("/api", (req, res) => {
  res.json({ status: "ok" });
});

// ========================
// TESTE BANCO
// ========================
app.get("/teste-db", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});

// ========================
// LOGIN (CORRIGIDO + DEBUG)
// ========================
app.post("/api/login", (req, res) => {
  let { user, pass } = req.body;

  user = user ? user.trim() : "";
  pass = pass ? pass.trim() : "";

  console.log("📥 LOGIN RECEBIDO:", user, pass);

  if (!user || !pass) {
    return res.json({ success: false, error: "dados vazios" });
  }

  const sql = "SELECT * FROM users WHERE user = ?";

  db.query(sql, [user], (err, results) => {
    if (err) {
      console.log("❌ Erro SQL:", err);
      return res.status(500).json({ success: false });
    }

    console.log("📊 Resultado banco:", results);

    if (results.length === 0) {
      return res.json({ success: false, error: "usuario nao encontrado" });
    }

    const usuario = results[0];

    if (usuario.pass !== pass) {
      return res.json({ success: false, error: "senha incorreta" });
    }

    return res.json({ success: true, user: usuario });
  });
});

// ========================
// MOVIMENTAÇÃO
// ========================
app.post("/api/movimentacao", (req, res) => {
  const { tipo, valor, descricao } = req.body;

  if (!tipo || !valor) {
    return res.json({ success: false });
  }

  const sql = `
    INSERT INTO movimentacoes (tipo, valor, descricao)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [tipo, valor, descricao], (err) => {
    if (err) {
      console.log("❌ Erro SQL:", err);
      return res.json({ success: false });
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
