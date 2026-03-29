const express = require("express");
const path = require("path");
const mysql = require("mysql2");

const app = express();

// ========================
// CONEXÃO MYSQL
// ========================
const db = mysql.createConnection({
  host: "auth-db1601.hstgr.io",
  user: "u519611382_8uP59",
  password: "21@Elesig",
  database: "u519611382_T9bc4"
});

db.connect((err) => {
  if (err) {
    console.log("ERRO BANCO:", err);
  } else {
    console.log("MYSQL CONECTADO");
  }
});

// ========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// ========================
// TESTE
// ========================
app.get("/api", (req, res) => {
  res.json({ status: "ok" });
});

// ========================
// TESTE BANCO
// ========================
app.get("/teste-db", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});

// ========================
// LOGIN
// ========================
app.post("/api/login", (req, res) => {
  const { user, pass } = req.body;

  console.log("LOGIN:", user, pass);

  const sql = "SELECT * FROM users WHERE user = ? AND pass = ?";

  db.query(sql, [user, pass], (err, result) => {
    if (err) {
      console.log(err);
      return res.json({ success: false });
    }

    if (result.length > 0) {
      return res.json({ success: true });
    } else {
      return res.json({ success: false });
    }
  });
});

// ========================
// MOVIMENTAÇÃO
// ========================
app.post("/api/movimentacao", (req, res) => {
  const { tipo, valor, descricao } = req.body;

  const sql = `
    INSERT INTO movimentacoes (tipo, valor, descricao)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [tipo, valor, descricao], (err) => {
    if (err) {
      console.log(err);
      return res.json({ success: false });
    }

    res.json({ success: true });
  });
});

// ========================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log("SERVIDOR RODANDO");
});
