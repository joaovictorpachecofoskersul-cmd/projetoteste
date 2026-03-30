const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/teste-db", (req, res) => {
  db.query("SELECT * FROM users", (err, results) => {
    if (err) return res.json({ error: err.message });
    res.json({ success: true, users: results });
  });
});

app.post("/api/login", (req, res) => {
  const { user, pass } = req.body;
  
  db.query("SELECT * FROM users WHERE user = ?", [user], (err, results) => {
    if (err) return res.json({ success: false, error: err.message });
    if (results.length === 0) return res.json({ success: false, error: "Usuário não encontrado" });
    if (results[0].pass !== pass) return res.json({ success: false, error: "Senha incorreta" });
    
    res.json({ success: true, user: { id: results[0].id, user: results[0].user } });
  });
});

app.post("/api/movimentacao", (req, res) => {
  const { tipo, valor, descricao } = req.body;
  
  db.query("INSERT INTO movimentacoes (tipo, valor, descricao) VALUES (?, ?, ?)",
    [tipo, valor, descricao],
    (err, result) => {
      if (err) return res.json({ success: false, error: err.message });
      res.json({ success: true });
    });
});

app.get("/api/movimentacoes", (req, res) => {
  db.query("SELECT * FROM movimentacoes ORDER BY data DESC", (err, results) => {
    if (err) return res.json({ success: false, error: err.message });
    res.json({ success: true, movimentacoes: results });
  });
});

app.get("/api/saldo", (req, res) => {
  db.query(`
    SELECT 
      SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as entradas,
      SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as saidas
    FROM movimentacoes
  `, (err, results) => {
    if (err) return res.json({ success: false, error: err.message });
    
    const entradas = parseFloat(results[0].entradas) || 0;
    const saidas = parseFloat(results[0].saidas) || 0;
    
    res.json({ 
      success: true, 
      saldo: entradas - saidas,
      entradas, 
      saidas 
    });
  });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log("🚀 FLUXO DE CAIXA - SERVIDOR RODANDO");
  console.log("=".repeat(50));
  console.log(`📡 Porta: ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`👤 Login: admin / 123`);
  console.log("=".repeat(50));
});
