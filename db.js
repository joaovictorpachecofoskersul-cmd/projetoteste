const mysql = require("mysql2");

const db = mysql.createPool({
  host: "auth-db1601.hstgr.io",
  user: "u51961382_fluxo_admin",
  password: "A123456Senha@",
  database: "u51961382_fluxo_caixa_si",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ ERRO:", err.message);
  } else {
    console.log("✅ CONECTADO!");
    connection.release();
  }
});

module.exports = db;
