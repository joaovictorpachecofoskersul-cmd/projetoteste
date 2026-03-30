const express = require("express");
const path = require("path");
const mysql = require("mysql2");

const app = express();

// ========================
// CONEXÃO MYSQL - CREDENCIAIS CORRETAS
// ========================
const db = mysql.createPool({
  host: "auth-db1601.hstgr.io",
  user: "u519611382_8uP59",
  password: "21@Elesig",  // ou a senha que você redefinir
  database: "u519611382_T9bc4",  // ← SÓ ESTE BANCO
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testar conexão
db.getConnection((err, connection) => {
  if (err) {
    console.log("❌ Erro ao conectar:", err.message);
    console.log("Código:", err.code);
  } else {
    console.log("✅ Conectado ao MySQL com sucesso!");
    console.log("📊 Banco:", "u51961382_T9bc4");
    console.log("👤 Usuário:", "u51961382_SuPS9");
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
// SETUP - CRIAR TABELAS
// ========================
app.get("/setup", (req, res) => {
  const createUsers = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user VARCHAR(100) NOT NULL UNIQUE,
      pass VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  const createMovimentacoes = `
    CREATE TABLE IF NOT EXISTS movimentacoes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      tipo VARCHAR(20) NOT NULL,
      valor DECIMAL(10,2) NOT NULL,
      descricao TEXT,
      data TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  
  const insertAdmin = `
    INSERT IGNORE INTO users (user, pass) VALUES ('admin', '123')
  `;
  
  db.query(createUsers, (err) => {
    if (err) return res.json({ error: "Erro ao criar users", details: err.message });
    
    db.query(createMovimentacoes, (err) => {
      if (err) return res.json({ error: "Erro ao criar movimentacoes", details: err.message });
      
      db.query(insertAdmin, (err) => {
        if (err) return res.json({ error: "Erro ao inserir admin", details: err.message });
        
        res.json({ 
          success: true, 
          message: "✅ Tabelas criadas e usuário admin adicionado!",
          login: "admin / 123"
        });
      });
    });
  });
});

// ========================
// TESTE DO BANCO
// ========================
app.get("/teste-db", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.log("Erro no teste-db:", err);
      return res.json({ error: err.message, code: err.code });
    }
    res.json({ 
      success: true, 
      users: results, 
      total: results.length,
      message: "Banco conectado com sucesso!"
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

    console.log("📊 Resultados encontrados:", results.length);

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
      console.log("❌ Erro ao inserir:", err);
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
  console.log("🚀 SERVIDOR FLUXO DE CAIXA");
  console.log("=".repeat(50));
  console.log(`📡 Porta: ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`📊 Banco: u51961382_T9bc4`);
  console.log(`👤 Usuário: u51961382_SuPS9`);
  console.log("=".repeat(50));
});
