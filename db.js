const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "auth-db1601.hstgr.io",
  user: "u519611382_8uP59",
  password: "21@Elesig",
  database: "u519611382_T9bc4",
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error("❌ ERRO AO CONECTAR:", err);
  } else {
    console.log("✅ CONECTADO COM SUCESSO AO MYSQL!");
  }
});

module.exports = db;
