const express = require("express");
const path = require("path");
const mysql = require("mysql2");

const app = express();

// ========================
// CONEXÃO MYSQL HOSTINGER (COM DEBUG)
// ========================
console.log("🔧 Tentando conectar ao MySQL...");
console.log("📊 Configurações:");
console.log("   Host:", "auth-db1601.hstgr.io");
console.log("   User:", "u519611382_8uP59");
console.log("   Database:", "u519611382_7Pbcd4");

const db = mysql.createPool({
  host: "auth-db1601.hstgr.io",
  user: "u519611382_8uP59",
  password: "21@Elesig",
  database: "u519611382_7Pbcd4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Adicionar timeout para debug
  connectTimeout: 10000
});

// Testar conexão com mais detalhes
db.getConnection((err, connection) => {
  if (err) {
    console.log("❌ ERRO DETALHADO AO CONECTAR:");
    console.log("   Código:", err.code);
    console.log("   Mensagem:", err.message);
    console.log("   Erro completo:", err);
  } else {
    console.log("✅ Conectado ao MySQL com sucesso!");
    console.log("📊 Banco de dados: u519611382_7Pbcd4");
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
// TESTE DA API
// ========================
app.get("/api", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Servidor funcionando!",
    timestamp: new Date().toISOString()
  });
});

// ========================
// TESTE DO BANCO DE DADOS
// ========================
app.get("/teste-db", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) {
      console.log("❌ Erro no teste-db:", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message,
        code: err.code
      });
    }
    res.json({ 
      success: true, 
      users: results,
      total: results.length 
    });
  });
});

// ========================
// LOGIN DO USUÁRIO
// ========================
app.post("/api/login", (req, res) => {
  let { user, pass } = req.body;

  user = user ? user.trim() : "";
  pass = pass ? pass.trim() : "";

  console.log("📥 Tentativa de login recebida:");
  console.log("   Usuário:", user);
  console.log("   Senha:", pass ? "******" : "vazia");

  if (!user || !pass) {
    console.log("❌ Dados vazios");
    return res.json({ 
      success: false, 
      error: "Preencha usuário e senha" 
    });
  }

  const sql = "SELECT id, user, pass FROM users WHERE user = ?";
  
  db.query(sql, [user], (err, results) => {
    if (err) {
      console.log("❌ Erro na consulta SQL:", err);
      return res.status(500).json({ 
        success: false, 
        error: "Erro no banco de dados" 
      });
    }

    console.log("📊 Resultados encontrados:", results.length);

    if (results.length === 0) {
      console.log("❌ Usuário não encontrado:", user);
      return res.json({ 
        success: false, 
        error: "Usuário não encontrado" 
      });
    }

    const usuario = results[0];
    console.log("👤 Usuário encontrado:", usuario.user, "(ID:", usuario.id + ")");

    // Comparação simples de senha (recomendo usar bcrypt em produção)
    if (usuario.pass !== pass) {
      console.log("❌ Senha incorreta para:", user);
      return res.json({ 
        success: false, 
        error: "Senha incorreta" 
      });
    }

    console.log("✅ Login bem-sucedido:", user);
    return res.json({ 
      success: true, 
      user: { 
        id: usuario.id, 
        user: usuario.user 
      }
    });
  });
});

// ========================
// REGISTRAR MOVIMENTAÇÃO
// ========================
app.post("/api/movimentacao", (req, res) => {
  const { tipo, valor, descricao } = req.body;

  console.log("📝 Nova movimentação:");
  console.log("   Tipo:", tipo);
  console.log("   Valor:", valor);
  console.log("   Descrição:", descricao);

  if (!tipo || !valor) {
    console.log("❌ Dados incompletos");
    return res.json({ 
      success: false, 
      error: "Tipo e valor são obrigatórios" 
    });
  }

  // Validar tipo
  if (tipo !== 'entrada' && tipo !== 'saida') {
    console.log("❌ Tipo inválido:", tipo);
    return res.json({ 
      success: false, 
      error: "Tipo deve ser 'entrada' ou 'saida'" 
    });
  }

  const sql = `
    INSERT INTO movimentacoes (tipo, valor, descricao) 
    VALUES (?, ?, ?)
  `;
  
  db.query(sql, [tipo, valor, descricao || null], (err, result) => {
    if (err) {
      console.log("❌ Erro ao inserir movimentação:", err);
      return res.json({ 
        success: false, 
        error: err.message 
      });
    }
    
    console.log("✅ Movimentação registrada com ID:", result.insertId);
    return res.json({ 
      success: true, 
      id: result.insertId 
    });
  });
});

// ========================
// LISTAR MOVIMENTAÇÕES
// ========================
app.get("/api/movimentacoes", (req, res) => {
  const sql = "SELECT * FROM movimentacoes ORDER BY data DESC LIMIT 100";
  
  db.query(sql, (err, results) => {
    if (err) {
      console.log("❌ Erro ao listar movimentações:", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    res.json({ 
      success: true, 
      movimentacoes: results 
    });
  });
});

// ========================
// SALDO TOTAL
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
      console.log("❌ Erro ao calcular saldo:", err);
      return res.status(500).json({ 
        success: false, 
        error: err.message 
      });
    }
    
    const total_entradas = parseFloat(results[0].total_entradas) || 0;
    const total_saidas = parseFloat(results[0].total_saidas) || 0;
    const saldo = total_entradas - total_saidas;
    
    res.json({ 
      success: true, 
      saldo: saldo,
      total_entradas: total_entradas,
      total_saidas: total_saidas
    });
  });
});

// ========================
// ROTA 404 - PÁGINA NÃO ENCONTRADA
// ========================
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: "Rota não encontrada" 
  });
});

// ========================
// INICIAR SERVIDOR
// ========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("=".repeat(50));
  console.log("🚀 SERVIDOR FLUXO DE CAIXA INICIADO");
  console.log("=".repeat(50));
  console.log(`📡 Porta: ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`📁 Diretório: ${__dirname}`);
  console.log(`🔄 Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log("=".repeat(50));
});
