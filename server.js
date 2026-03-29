// ROTA PARA RELATÓRIO POR DATA
app.get('/relatorio', (req, res) => {
    const { data_inicio, data_fim } = req.query;
    
    let query = `
        SELECT 
            DATE(data) as data,
            SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as entradas,
            SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as saidas,
            SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE -valor END) as saldo_dia
        FROM movimentacoes
    `;
    
    let params = [];
    
    if (data_inicio && data_fim) {
        query += ` WHERE DATE(data) BETWEEN ? AND ?`;
        params = [data_inicio, data_fim];
    }
    
    query += ` GROUP BY DATE(data) ORDER BY data DESC`;
    
    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao gerar relatório' });
        }
        res.json(results);
    });
});
