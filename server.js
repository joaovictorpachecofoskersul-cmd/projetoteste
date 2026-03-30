const express = require("express");
const path = require("path");
const mysql = require("mysql2");

const app = express();

// ========================
// CONEXÃO MYSQL HOSTINGER (com Pool)
// ========================
const db = mysql.createPool({
  host: "auth-db1601.hstgr.io",
  user: "u519611382_8uP59",
  password: "21@Elesig",
  database: "u519611382_T9bc4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testar conexão
db.getConnection((err, connection) => {
  if (err) {
    console.log("❌ Erro ao conectar no banco:", err);
  } else {
    console.log("✅ Conectado ao MySQL");
    connection.release();
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
// ROTA PRINCIPAL
// ========================
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ========================
// TESTE API
// ========================
app.get("/api", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// ========================
// TESTE BANCO
// ========================
app.get("/teste-db", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) {
      console.log("Erro no teste-db:", err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, users: result });
  });
});

// ========================
// LOGIN (VERSÃO CORRIGIDA)
// ========================
app.post("/api/login", (req, res) => {
  let { user, pass } = req.body;

  user = user ? user.trim() : "";
  pass = pass ? pass.trim() : "";

  console.log("📥 Tentativa de login:", { user, pass });

  if (!user || !pass) {
    console.log("❌ Dados vazios");
    return res.json({ success: false, error: "Preencha usuário e senha" });
  }

  const sql = "SELECT * FROM users WHERE user = ?";

  db.query(sql, [user], (err, results) => {
    if (err) {
      console.log("❌ Erro na consulta SQL:", err);
      return res.status(500).json({ success: false, error: "Erro no banco de dados" });
    }

    console.log("📊 Resultados encontrados:", results.length);

    if (results.length === 0) {
      console.log("❌ Usuário não encontrado:", user);
      return res.json({ success: false, error: "Usuário não encontrado" });
    }

    const usuario = results[0];
    console.log("👤 Usuário encontrado:", { id: usuario.id, user: usuario.user });

    if (usuario.pass !== pass) {
      console.log("❌ Senha incorreta para:", user);
      return res.json({ success: false, error: "Senha incorreta" });
    }

    console.log("✅ Login bem-sucedido:", user);
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

  const sql = `
    INSERT INTO movimentacoes (tipo, valor, descricao)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [tipo, valor, descricao || null], (err, result) => {
    if (err) {
      console.log("❌ Erro ao inserir movimentação:", err);
      return res.json({ success: false, error: err.message });
    }

    console.log("✅ Movimentação registrada:", { tipo, valor, descricao });
    return res.json({ success: true, id: result.insertId });
  });
});

// ========================
// PORTA
// ========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Servidor rodando na porta " + PORT);
  console.log("📁 Diretório atual:", __dirname);
  console.log("🌐 Acesse: http://localhost:" + PORT);
});
