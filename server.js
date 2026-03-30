const express = require("express");
const path = require("path");
const mysql = require("mysql2");
require("dotenv").config();

const app = express();

// ========================
// CONEXÃO MYSQL
// ========================
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testar conexão
db.getConnection((err, connection) => {
  if (err) {
    console.log("❌ Erro ao conectar:", err.message);
    console.log("   Usuário:", process.env.DB_USER);
    console.log("   Banco:", process.env.DB_NAME);
  } else {
    console.log("✅ Conectado ao MySQL com sucesso!");
    console.log("📊 Banco:", process.env.DB_NAME);
    connection.release();
  }
});

// ========================
// MIDDLEWARE
// ========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ========================
// ROTAS
// ========================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/teste-db", (req, res) => {
  db.query("SELECT id, user, created_at FROM users", (err, results) => {
    if (err) return res.json({ error: err.message });
    res.json({ success: true, users: results, total: results.length });
  });
});

app.post("/api/login", (req, res) => {
  const { user, pass } = req.body;
  
  if (!user || !pass) {
    return res.json({ success: false, error: "Preencha usuário e senha" });
  }

  db.query("SELECT * FROM users WHERE user = ?", [user.trim()], (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (results.length === 0) return res.json({ success: false, error: "Usuário não encontrado" });
    if (results[0].pass !== pass.trim()) return res.json({ success: false, error: "Senha incorreta" });
    
    res.json({ success: true, user: { id: results[0].id, user: results[0].user } });
  });
});

app.post("/api/movimentacao", (req, res) => {
  const { tipo, valor, descricao } = req.body;
  
  if (!tipo || !valor) {
    return res.json({ success: false, error: "Dados incompletos" });
  }

  db.query("INSERT INTO movimentacoes (tipo, valor, descricao) VALUES (?, ?, ?)", 
    [tipo, valor, descricao || null], 
    (err, result) => {
      if (err) return res.json({ success: false, error: err.message });
      res.json({ success: true });
    });
});

app.get("/api/movimentacoes", (req, res) => {
  db.query("SELECT * FROM movimentacoes ORDER BY data DESC LIMIT 100", (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, movimentacoes: results });
  });
});

app.get("/api/saldo", (req, res) => {
  db.query(`
    SELECT 
      SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as total_entradas,
      SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as total_saidas
    FROM movimentacoes
  `, (err, results) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    
    const total_entradas = parseFloat(results[0].total_entradas) || 0;
    const total_saidas = parseFloat(results[0].total_saidas) || 0;
    
    res.json({ 
      success: true, 
      saldo: total_entradas - total_saidas,
      total_entradas, 
      total_saidas 
    });
  });
});

// ========================
// INICIAR SERVIDOR
// ========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("=".repeat(50));
  console.log("🚀 FLUXO DE CAIXA - SERVIDOR RODANDO");
  console.log("=".repeat(50));
  console.log(`📡 Porta: ${PORT}`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
  console.log(`📊 Banco: ${process.env.DB_NAME}`);
  console.log(`👤 Usuário MySQL: ${process.env.DB_USER}`);
  console.log(`👤 Usuário sistema: admin`);
  console.log(`🔑 Senha sistema: 123`);
  console.log("=".repeat(50));
});
