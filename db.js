const mysql = require('mysql2');
const sqlite3 = require('sqlite3').verbose();

let db;

if (process.env.NODE_ENV === "production") {
    console.log("🌐 Usando SQLite (produção)");

    db = new sqlite3.Database('./caixa.db', (err) => {
        if (err) {
            console.error("Erro SQLite:", err.message);
        } else {
            console.log("✅ SQLite conectado!");
        }
    });

} else {
    console.log("💻 Usando MySQL (local)");

    db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'caixa_system'
    });

    db.connect((err) => {
        if (err) {
            console.error('Erro MySQL:', err);
        } else {
            console.log('✅ MySQL conectado!');
        }
    });
}

module.exports = db;
