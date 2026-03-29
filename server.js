const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// FRONTEND
app.use(express.static(path.join(__dirname, 'public')));

// 🔥 LOGIN
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;

    db.query(
        'SELECT * FROM usuarios WHERE username = ?',
        [username],
        (err, results) => {
            if (err) return res.status(500).json({ erro: 'Erro servidor' });

            if (!results || results.length === 0) {
                return res.status(401).json({ erro: 'Usuário não encontrado' });
            }

            const user = results[0];

            if (user.password === password) {
                return res.json({ sucesso: true });
            }

            return res.status(401).json({ erro: 'Senha incorreta' });
        }
    );
});

// MOVIMENTAÇÃO
app.post('/movimentacao', (req, res) => {
    const { tipo, valor, descricao } = req.body;

    db.query(
        'INSERT INTO movimentacoes (tipo, valor, descricao) VALUES (?, ?, ?)',
        [tipo, valor, descricao],
        (err) => {
            if (err) return res.status(500).json({ erro: 'Erro' });

            res.json({ sucesso: true });
        }
    );
});

// EXTRATO
app.get('/extrato', (req, res) => {
    db.query('SELECT * FROM movimentacoes ORDER BY id DESC', [], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro' });
        res.json(results);
    });
});

// SALDO
app.get('/saldo', (req, res) => {
    db.query(`
        SELECT 
            SUM(CASE WHEN tipo='entrada' THEN valor ELSE 0 END) as entradas,
            SUM(CASE WHEN tipo='saida' THEN valor ELSE 0 END) as saidas,
            SUM(CASE WHEN tipo='entrada' THEN valor ELSE -valor END) as saldo
        FROM movimentacoes
    `, [], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro' });

        res.json(results[0]);
    });
});

app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
});