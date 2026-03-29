app.post('/login', (req, res) => {
  console.log("BODY RECEBIDO:", req.body);

  const { user, pass } = req.body;

  db.query(
    'SELECT * FROM users WHERE user = ? AND pass = ?',
    [user, pass],
    (err, result) => {
      if (err) {
        console.log("ERRO SQL:", err);
        return res.json({ ok: false, error: err });
      }

      console.log("RESULTADO:", result);

      res.json({
        ok: result.length > 0,
        data: result
      });
    }
  );
});
