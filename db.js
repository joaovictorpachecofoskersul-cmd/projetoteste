const mysql = require("mysql2");

const db = mysql.createPool({
  host: "auth-db1601.hstgr.io",
  user: "u519611382_testefinal",
  password: "21Joaovictor21",
  database: "u519611382_testefinal",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("❌ ERRO:", err.message);
  } else {
    console.log("✅ CONECTADO COM SUCESSO!");
    console.log("📊 Banco: u519611382_testefinal");
    connection.release();
  }
});

module.exports = db;
