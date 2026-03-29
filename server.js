const mysql = require('mysql2');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 🔥 DECIDE AUTOMATICAMENTE O BANCO
const isProduction = process.env.NODE_ENV === 'production';

let db;

if (isProduction) {
    // =========================
    // 🟢 SQLITE (HOSTINGER)
    // =========================
    const dbPath = path.join(__dirname, 'database.sqlite');

    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ Erro SQLite:', err);
        } else {
            console.log('✅ SQLite conectado (produção)');
        }
    });

} else {
    // =========================
    // 🔵 MYSQL (LOCAL / XAMPP)
    // =========================
    db = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'caixa_system'
    });

    db.connect((err) => {
        if (err) {
            console.error('❌ Erro MySQL:', err);
        } else {
            console.log('✅ MySQL conectado (local)');
        }
    });
}

// 🔥 PADRONIZA MYSQL → SQLITE
db.query = function (sql, params, callback) {

    // SQLITE
    if (isProduction) {

        if (sql.trim().toUpperCase().startsWith("SELECT")) {
            return this.all(sql, params, callback);
        }

        return this.run(sql, params, function (err) {
            callback(err, {
                insertId: this?.lastID,
                affectedRows: this?.changes
            });
        });
    }

    // MYSQL
    return this.query(sql, params, callback);
};

module.exports = db;
