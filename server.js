const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname)); // 👈 SERVE O HTML

// ROTA DE LOGIN
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    db.query('SELECT * FROM usuarios WHERE username = ?', [username], (err, results) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro no servidor' });
        }
        
        if (results.length === 0) {
            return res.status(401).json({ erro: 'Usuário não encontrado' });
        }
        
        const usuario = results[0];
        
        if (usuario.password === password) {
            res.json({ 
                sucesso: true, 
                mensagem: 'Login realizado!',
                usuario: usuario.username
            });
        } else {
            res.status(401).json({ erro: 'Senha incorreta' });
        }
    });
});

// ROTA PARA REGISTRAR MOVIMENTAÇÃO
app.post('/movimentacao', (req, res) => {
    const { tipo, valor, descricao } = req.body;
    
    if (!tipo || !valor || !descricao) {
        return res.status(400).json({ 
            erro: 'Os campos tipo, valor e descricao são obrigatórios' 
        });
    }
    
    if (tipo !== 'entrada' && tipo !== 'saida') {
        return res.status(400).json({ 
            erro: 'Tipo deve ser "entrada" ou "saida"' 
        });
    }
    
    db.query(
        'INSERT INTO movimentacoes (tipo, valor, descricao) VALUES (?, ?, ?)',
        [tipo, valor, descricao],
        (err, result) => {
            if (err) {
                return res.status(500).json({ erro: 'Erro ao registrar movimentação' });
            }
            
            res.json({ 
                sucesso: true, 
                mensagem: `${tipo === 'entrada' ? 'Entrada' : 'Saída'} registrada!`,
                id: result.insertId
            });
        }
    );
});

// ROTA PARA VER EXTRATO
app.get('/extrato', (req, res) => {
    db.query('SELECT * FROM movimentacoes ORDER BY data DESC', (err, results) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao buscar dados' });
        }
        res.json(results);
    });
});

// ROTA PARA VER SALDO
app.get('/saldo', (req, res) => {
    db.query(`
        SELECT 
            SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as total_entradas,
            SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as total_saidas,
            SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE -valor END) as saldo
        FROM movimentacoes
    `, (err, results) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao calcular saldo' });
        }
        
        res.json({
            total_entradas: results[0].total_entradas || 0,
            total_saidas: results[0].total_saidas || 0,
            saldo: results[0].saldo || 0
        });
    });
});

// ROTA PARA DELETAR MOVIMENTAÇÃO
app.delete('/movimentacao/:id', (req, res) => {
    const { id } = req.params;
    
    db.query('DELETE FROM movimentacoes WHERE id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao deletar' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Movimentação não encontrada' });
        }
        
        res.json({ sucesso: true, mensagem: 'Movimentação deletada!' });
    });
});

// ROTA PARA SERVIR O HTML (tem que ser a ÚLTIMA)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(port, () => {
    console.log(`🚀 Servidor em http://localhost:${port}`);
    console.log(`✅ Conectado ao banco!`);
});
