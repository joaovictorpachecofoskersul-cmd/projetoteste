const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
    console.log('=== LOGIN ===');
    console.log('Body:', req.body);
    
    // Verifica se o body existe
    if (!req.body) {
        return res.status(400).json({ 
            erro: 'Nenhum dado enviado',
            solucao: 'Use JSON no body da requisição'
        });
    }
    
    const { username, password } = req.body;
    
    // Verifica se os campos existem
    if (!username) {
        return res.status(400).json({ 
            erro: 'Campo "username" é obrigatório' 
        });
    }
    
    if (!password) {
        return res.status(400).json({ 
            erro: 'Campo "password" é obrigatório' 
        });
    }
    
    // Login de exemplo
    if (username === 'admin' && password === '123456') {
        return res.json({ 
            sucesso: true,
            mensagem: 'Login realizado com sucesso!',
            usuario: username
        });
    }
    
    return res.status(401).json({ 
        sucesso: false,
        erro: 'Usuário ou senha inválidos' 
    });
});

router.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ 
            erro: 'Todos os campos são obrigatórios' 
        });
    }
    
    res.json({ 
        sucesso: true,
        mensagem: 'Usuário registrado!',
        usuario: { username, email }
    });
});

module.exports = router;