const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "caixa_system"
});

db.connect((err) => {
  if (err) {
    console.log("❌ Erro no MySQL:", err);
  } else {
    console.log("✅ MySQL conectado!");
  }
});

module.exports = db;
