const express = require('express');
const router = express.Router();

// Abrir caixa
router.post('/abrir', (req, res) => {
    const { valor_inicial, operador } = req.body;
    res.json({ 
        sucesso: true, 
        mensagem: 'Caixa aberto com sucesso!',
        dados: { valor_inicial, operador, data_abertura: new Date() }
    });
});

// Registrar movimentação
router.post('/movimentacao', (req, res) => {
    const { tipo, valor, descricao } = req.body;
    res.json({ 
        sucesso: true, 
        mensagem: `${tipo} registrado com sucesso!`,
        dados: { tipo, valor, descricao, data: new Date() }
    });
});

// Fechar caixa
router.post('/fechar', (req, res) => {
    res.json({ 
        sucesso: true, 
        mensagem: 'Caixa fechado com sucesso!',
        total_apurado: 1500.00
    });
});

module.exports = router;