const mysql = require('mysql2');

console.log("=== TESTE DE CONEXÃO MYSQL ===");
console.log("Host:", "auth-db1601.hstgr.io");
console.log("User:", "u519611382_8uP59");
console.log("Database:", "u519611382_7Pbcd4");
console.log("================================");

const db = mysql.createConnection({
  host: "auth-db1601.hstgr.io",
  user: "u519611382_8uP59",
  password: "21@Elesig",
  database: "u519611382_7Pbcd4",
  connectTimeout: 10000
});

db.connect((err) => {
  if (err) {
    console.log("\n❌ FALHA NA CONEXÃO!");
    console.log("Código do erro:", err.code);
    console.log("Mensagem:", err.message);
    
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log("\n🔑 Problema: Usuário ou senha incorretos!");
      console.log("Verifique no phpMyAdmin se as credenciais estão corretas.");
    } else if (err.code === 'ENOTFOUND') {
      console.log("\n🌐 Problema: Host não encontrado!");
      console.log("Verifique se o host 'auth-db1601.hstgr.io' está correto.");
    } else if (err.code === 'ETIMEDOUT') {
      console.log("\n⏰ Problema: Timeout na conexão!");
      console.log("O servidor MySQL pode estar bloqueando conexões externas.");
    } else if (err.code === 'ER_BAD_DB_ERROR') {
      console.log("\n📁 Problema: Banco de dados não encontrado!");
      console.log("Verifique se o banco 'u519611382_7Pbcd4' existe.");
    }
    
    process.exit(1);
  } else {
    console.log("\n✅ CONEXÃO BEM-SUCEDIDA!");
    console.log("Testando query...");
    
    db.query("SELECT NOW() as time", (err, results) => {
      if (err) {
        console.log("❌ Erro na query:", err.message);
      } else {
        console.log("✅ Query executada!");
        console.log("Horário do servidor:", results[0].time);
        
        // Verificar se a tabela users existe
        db.query("SHOW TABLES", (err, tables) => {
          if (err) {
            console.log("❌ Erro ao listar tabelas:", err.message);
          } else {
            console.log("\n📋 Tabelas no banco:");
            tables.forEach(table => {
              console.log("   -", Object.values(table)[0]);
            });
            
            // Verificar usuários
            db.query("SELECT * FROM users", (err, users) => {
              if (err) {
                console.log("❌ Erro ao consultar users:", err.message);
              } else {
                console.log(`\n👥 Usuários encontrados: ${users.length}`);
                users.forEach(user => {
                  console.log(`   ID: ${user.id}, Usuário: ${user.user}`);
                });
              }
              
              db.end();
            });
          }
        });
      }
    });
  }
});
