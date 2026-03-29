const express = require('express');
const app = express();

// ✅ Middlewares ESSENCIAIS para ler o body das requisições
app.use(express.json()); // Para ler JSON
app.use(express.urlencoded({ extended: true })); // Para ler formulários