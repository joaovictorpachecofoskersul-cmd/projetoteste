const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// 🔥 FUNÇÃO UNIVERSAL (MYSQL + SQLITE)
function query(sql, params, callback) {
    if (process.env.NODE_ENV === "production") {
        // SQLITE
        if (sql.trim().toUpperCase().startsWith("SELECT")) {
            db.all(sql, params, callback);
        } else {
            db.run(sql, params, function (err) {
                callback(err, {
                    insertId: this?.lastID,
                    affectedRows: this?.changes
                });
            });
        }
    } else {
        // MYSQL
        db.query(sql, params, callback);
    }
}

// 🔐 LOGIN
app.post('/auth/login', (req, res) => {
    const { username, password } = req.body;

    query('SELECT * FROM usuarios WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro no servidor' });

        if (!results || results.length === 0) {
            return res.status(401).json({ erro: 'Usuário não encontrado' });
        }

        const usuario = results[0];

        if (usuario.password === password) {
            res.json({
                sucesso: true,
                usuario: usuario.username
            });
        } else {
            res.status(401).json({ erro: 'Senha incorreta' });
        }
    });
});

// 💰 MOVIMENTAÇÃO
app.post('/movimentacao', (req, res) => {
    const { tipo, valor, descricao } = req.body;

    if (!tipo || !valor || !descricao) {
        return res.status(400).json({ erro: 'Campos obrigatórios' });
    }

    query(
        'INSERT INTO movimentacoes (tipo, valor, descricao) VALUES (?, ?, ?)',
        [tipo, valor, descricao],
        (err, result) => {
            if (err) return res.status(500).json({ erro: 'Erro ao registrar' });

            res.json({
                sucesso: true,
                id: result.insertId
            });
        }
    );
});

// 📊 EXTRATO
app.get('/extrato', (req, res) => {
    query('SELECT * FROM movimentacoes ORDER BY data DESC', [], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar' });
        res.json(results);
    });
});

// 💵 SALDO
app.get('/saldo', (req, res) => {
    query(`
        SELECT 
            SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as total_entradas,
            SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as total_saidas,
            SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE -valor END) as saldo
        FROM movimentacoes
    `, [], (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro no saldo' });

        res.json({
            total_entradas: results[0]?.total_entradas || 0,
            total_saidas: results[0]?.total_saidas || 0,
            saldo: results[0]?.saldo || 0
        });
    });
});

// 🗑️ DELETE
app.delete('/movimentacao/:id', (req, res) => {
    const { id } = req.params;

    query('DELETE FROM movimentacoes WHERE id = ?', [id], (err, result) => {
        if (err) return res.status(500).json({ erro: 'Erro ao deletar' });

        if (result.affectedRows === 0) {
            return res.status(404).json({ erro: 'Não encontrado' });
        }

        res.json({ sucesso: true });
    });
});

// 📅 RELATÓRIO
app.get('/relatorio', (req, res) => {
    const { data_inicio, data_fim } = req.query;

    let sql = `
        SELECT 
            DATE(data) as data,
            SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as entradas,
            SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as saidas,
            SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE -valor END) as saldo_dia
        FROM movimentacoes
    `;

    let params = [];

    if (data_inicio && data_fim) {
        sql += ` WHERE DATE(data) BETWEEN ? AND ?`;
        params = [data_inicio, data_fim];
    }

    sql += ` GROUP BY DATE(data) ORDER BY data DESC`;

    query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ erro: 'Erro no relatório' });
        res.json(results);
    });
});

// 🌐 INDEX
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// 🚀 START
app.listen(port, () => {
    console.log(`🚀 Servidor rodando na porta ${port}`);
});
