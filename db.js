const mysql = require('mysql2');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const isProd = process.env.NODE_ENV === 'production';

let db;

if (isProd) {
    const dbPath = path.join(__dirname, 'database.sqlite');

    db = new sqlite3.Database(dbPath, (err) => {
        if (err) console.log('Erro SQLite:', err);
        else console.log('SQLite conectado');
    });

    // 🔥 CRIA TABELAS AUTOMÁTICO
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT,
                password TEXT
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS movimentacoes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tipo TEXT,
                valor REAL,
                descricao TEXT,
                data DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    });

} else {
    db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'caixa_system'
    });

    db.connect();
}

// 🔥 PADRÃO UNIFICADO
db.query = function (sql, params, callback) {

    if (isProd) {
        if (sql.trim().toUpperCase().startsWith("SELECT")) {
            return this.all(sql, params, callback);
        }

        return this.run(sql, params, function (err) {
            callback(err, {
                insertId: this.lastID,
                affectedRows: this.changes
            });
        });
    }

    return this.query(sql, params, callback);
};

module.exports = db;
