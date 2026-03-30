const express = require("express");
const path = require("path");
const mysql = require("mysql2");

const app = express();

// ========================
// CONEXÃO MYSQL
// ========================
const db = mysql.createPool({
  host: "auth-db1601.hstgr.io",
  user: "u519611382_testefinal",
  password: "21Joaovictor21",
  database: "u519611382_testefinal",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testar conexão
db.getConnection((err, connection) => {
  if (err) {
    console.log("❌ ERRO:", err.message);
  } else {
    console.log("✅ CONECTADO!");
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
// ROTAS EXISTENTES
// ========================
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
    (err) => {
      if (err) return res.json({ success: false });
      res.json({ success: true });
    });
});

app.get("/api/movimentacoes", (req, res) => {
  db.query("SELECT * FROM movimentacoes ORDER BY data DESC", (err, results) => {
    if (err) return res.json([]);
    res.json(results);
  });
});

app.get("/api/saldo", (req, res) => {
  db.query(`
    SELECT 
      SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as entradas,
      SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as saidas
    FROM movimentacoes
  `, (err, results) => {
    if (err) return res.json({ error: err.message });
    
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

// ========================
// NOVAS ROTAS DE PRODUTOS E VENDAS (COLOQUE AQUI)
// ========================

// Listar todos os produtos
app.get("/api/produtos", (req, res) => {
    db.query("SELECT * FROM produtos WHERE ativo = true ORDER BY nome", (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, produtos: results });
    });
});

// Buscar produto por código de barras
app.get("/api/produtos/buscar/:codigo", (req, res) => {
    const codigo = req.params.codigo;
    db.query("SELECT * FROM produtos WHERE codigo_barras = ? AND ativo = true", [codigo], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.json({ success: false, error: "Produto não encontrado" });
        res.json({ success: true, produto: results[0] });
    });
});

// Cadastrar produto
app.post("/api/produtos", (req, res) => {
    const { codigo_barras, nome, descricao, preco_custo, preco_venda, estoque, categoria } = req.body;
    
    const sql = `INSERT INTO produtos (codigo_barras, nome, descricao, preco_custo, preco_venda, estoque, categoria) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [codigo_barras, nome, descricao, preco_custo, preco_venda, estoque, categoria], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: result.insertId });
    });
});

// Atualizar estoque
app.put("/api/produtos/:id/estoque", (req, res) => {
    const { id } = req.params;
    const { quantidade, operacao } = req.body;
    
    const sql = operacao === 'add' 
        ? "UPDATE produtos SET estoque = estoque + ? WHERE id = ?"
        : "UPDATE produtos SET estoque = estoque - ? WHERE id = ? AND estoque >= ?";
    
    db.query(sql, [quantidade, id, quantidade], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.json({ success: false, error: "Estoque insuficiente" });
        res.json({ success: true });
    });
});

// Registrar venda
app.post("/api/vendas", (req, res) => {
    const { itens, cliente_nome, forma_pagamento, desconto } = req.body;
    
    const total = itens.reduce((sum, item) => sum + (item.preco_unitario * item.quantidade), 0) - (desconto || 0);
    
    db.beginTransaction((err) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const sqlVenda = `INSERT INTO vendas (usuario_id, cliente_nome, total, desconto, forma_pagamento) 
                          VALUES (?, ?, ?, ?, ?)`;
        
        db.query(sqlVenda, [1, cliente_nome, total, desconto || 0, forma_pagamento], (err, result) => {
            if (err) {
                return db.rollback(() => res.status(500).json({ error: err.message }));
            }
            
            const vendaId = result.insertId;
            let itensInseridos = 0;
            
            itens.forEach((item) => {
                const sqlItem = `INSERT INTO venda_itens (venda_id, produto_id, quantidade, preco_unitario, subtotal) 
                                VALUES (?, ?, ?, ?, ?)`;
                
                db.query(sqlItem, [vendaId, item.produto_id, item.quantidade, item.preco_unitario, item.preco_unitario * item.quantidade], (err) => {
                    if (err) {
                        return db.rollback(() => res.status(500).json({ error: err.message }));
                    }
                    
                    db.query("UPDATE produtos SET estoque = estoque - ? WHERE id = ?", [item.quantidade, item.produto_id], (err) => {
                        if (err) {
                            return db.rollback(() => res.status(500).json({ error: err.message }));
                        }
                        
                        itensInseridos++;
                        if (itensInseridos === itens.length) {
                            db.commit((err) => {
                                if (err) return db.rollback(() => res.status(500).json({ error: err.message }));
                                res.json({ success: true, venda_id: vendaId, total });
                            });
                        }
                    });
                });
            });
        });
    });
});

// Listar vendas
app.get("/api/vendas", (req, res) => {
    const sql = `
        SELECT v.*, 
               (SELECT COUNT(*) FROM venda_itens WHERE venda_id = v.id) as total_itens
        FROM vendas v 
        ORDER BY v.data DESC 
        LIMIT 50
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, vendas: results });
    });
});

// Detalhes da venda
app.get("/api/vendas/:id", (req, res) => {
    const { id } = req.params;
    
    const sqlVenda = "SELECT * FROM vendas WHERE id = ?";
    const sqlItens = `
        SELECT vi.*, p.nome, p.codigo_barras 
        FROM venda_itens vi 
        JOIN produtos p ON vi.produto_id = p.id 
        WHERE vi.venda_id = ?
    `;
    
    db.query(sqlVenda, [id], (err, venda) => {
        if (err) return res.status(500).json({ error: err.message });
        if (venda.length === 0) return res.json({ success: false, error: "Venda não encontrada" });
        
        db.query(sqlItens, [id], (err, itens) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, venda: venda[0], itens });
        });
    });
});

// Relatório de vendas
app.get("/api/relatorio/vendas", (req, res) => {
    let sql = `
        SELECT 
            DATE(data) as data,
            COUNT(*) as total_vendas,
            SUM(total) as faturamento,
            AVG(total) as ticket_medio
        FROM vendas 
        WHERE data >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY DATE(data)
        ORDER BY data DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, relatorio: results });
    });
});

// ========================
// INICIAR SERVIDOR
// ========================
const PORT = 3000;

app.listen(PORT, () => {
  console.log("=".repeat(50));
  console.log("🚀 FLUXO DE CAIXA - SERVIDOR RODANDO");
  console.log("=".repeat(50));
  console.log(`📡 Porta: ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`📊 Banco: u519611382_testefinal`);
  console.log(`👤 Login: admin / 123`);
  console.log("=".repeat(50));
});
