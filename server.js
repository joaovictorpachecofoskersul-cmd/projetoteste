const express = require("express");
const path = require("path");
const mysql = require("mysql2");
require("dotenv").config();  // ← Carrega as variáveis do .env

const app = express();

// ========================
// CONEXÃO MYSQL - USANDO .ENV
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
    console.log("📋 Configurações do .env:");
    console.log("   Host:", process.env.DB_HOST);
    console.log("   User:", process.env.DB_USER);
    console.log("   Database:", process.env.DB_NAME);
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
// ROTA PRINCIPAL
// ========================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ========================
// TESTE DO BANCO
// ========================
app.get("/teste-db", (req, res) => {
  db.query("SELECT id, user, created_at FROM users", (err, results) => {
    if (err) {
      console.log("Erro:", err);
      return res.json({ error: err.message });
    }
    res.json({ 
      success: true, 
      users: results, 
      total: results.length
    });
  });
});

// ========================
// LOGIN
// ========================
app.post("/api/login", (req, res) => {
  let { user, pass } = req.body;

  user = user ? user.trim() : "";
  pass = pass ? pass.trim() : "";

  console.log("📥 Tentativa login:", user);

  if (!user || !pass) {
    return res.json({ success: false, error: "Preencha usuário e senha" });
  }

  const sql = "SELECT * FROM users WHERE user = ?";
  
  db.query(sql, [user], (err, results) => {
    if (err) {
      console.log("❌ Erro SQL:", err);
      return res.status(500).json({ success: false, error: "Erro no banco: " + err.message });
    }

    console.log("📊 Resultados:", results.length);

    if (results.length === 0) {
      return res.json({ success: false, error: "Usuário não encontrado" });
    }

    const usuario = results[0];

    if (usuario.pass !== pass) {
      return res.json({ success: false, error: "Senha incorreta" });
    }

    console.log("✅ Login OK:", user);
    return res.json({ 
      success: true, 
      user: { id: usuario.id, user: usuario.user }
    });
  });
});

// ========================
// MOVIMENTAÇÃO
// ========================
app.post("/api/movimentacao", (req, res) => {
  const { tipo, valor, descricao } = req.body;

  if (!tipo || !valor) {
    return res.json({ success: false, error: "Dados incompletos" });
  }

  const sql = `INSERT INTO movimentacoes (tipo, valor, descricao) VALUES (?, ?, ?)`;
  
  db.query(sql, [tipo, valor, descricao || null], (err, result) => {
    if (err) {
      console.log("❌ Erro:", err);
      return res.json({ success: false, error: err.message });
    }
    console.log("✅ Movimentação salva - ID:", result.insertId);
    return res.json({ success: true });
  });
});

// ========================
// LISTAR MOVIMENTAÇÕES
// ========================
app.get("/api/movimentacoes", (req, res) => {
  db.query("SELECT * FROM movimentacoes ORDER BY data DESC LIMIT 100", (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, movimentacoes: results });
  });
});

// ========================
// SALDO
// ========================
app.get("/api/saldo", (req, res) => {
  const sql = `
    SELECT 
      SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as total_entradas,
      SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as total_saidas
    FROM movimentacoes
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
    
    const total_entradas = parseFloat(results[0].total_entradas) || 0;
    const total_saidas = parseFloat(results[0].total_saidas) || 0;
    const saldo = total_entradas - total_saidas;
    
    res.json({ 
      success: true, 
      saldo, 
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
  console.log(`👤 Usuário sistema: admin`);
  console.log(`🔑 Senha sistema: 123`);
  console.log("=".repeat(50));
});
