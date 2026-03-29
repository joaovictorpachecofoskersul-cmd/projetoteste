app.post("/api/login", (req, res) => {
  const { user, pass } = req.body;

  if (!user || !pass) {
    return res.json({ success: false, error: "dados vazios" });
  }

  const sql = "SELECT * FROM users WHERE user = ? AND pass = ?";

  db.query(sql, [user, pass], (err, results) => {
    if (err) {
      console.log("Erro login:", err);
      return res.status(500).json({ success: false });
    }

    if (results.length > 0) {
      return res.json({ success: true });
    }

    return res.json({ success: false });
  });
});
