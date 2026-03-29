const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// CONEXÃO HOSTINGER
const db = mysql.createConnection({
  host: 'SEU_HOST_AQUI',
  user: 'SEU_USER_AQUI',
  password: 'SUA_SENHA_AQUI',
  database: 'SEU_BANCO_AQUI'
});

db.connect((err) => {
  if (err) {
    console.log('Erro conexão DB:', err);
  } else {
    console.log('Conectado no MySQL!');
  }
});

// LOGIN
app.post('/login', (req, res) => {
  const { user, pass } = req.body;

  db.query(
    'SELECT * FROM users WHERE user = ? AND pass = ?',
    [user, pass],
    (err, result) => {
      if (err) return res.json({ ok: false, error: err });

      if (result.length > 0) {
        res.json({ ok: true, user: result[0] });
      } else {
        res.json({ ok: false, message: 'Login inválido' });
      }
    }
  );
});

// START SERVER
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
