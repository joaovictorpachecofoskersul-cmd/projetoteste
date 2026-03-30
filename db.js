const mysql = require("mysql2");

const db = mysql.createPool({
  host: "auth-db1601.hstgr.io",
  user: "u519611382_fluxo_admin",
  password: "21@Vitor21",
  database: "u519611382_fluxo_caixa_si",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ ERRO AO CONECTAR:", err.message);
  } else {
    console.log("✅ CONECTADO COM SUCESSO AO MYSQL!");
    console.log("📊 Banco:", "u519611382_fluxo_caixa_si");
    console.log("👤 Usuário:", "u519611382_fluxo_admin");
    connection.release();
  }
});

module.exports = db;
