// backend/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
const { v4: uuidv4 } = require("uuid");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
});

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS maintenance_logs (
      id UUID PRIMARY KEY,
      asset_id TEXT NOT NULL,
      action TEXT NOT NULL,
      performed_by TEXT NOT NULL,
      date DATE NOT NULL,
      cost TEXT,
      notes TEXT
    );
  `);
};

initDB();

app.get("/api/logs", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM maintenance_logs ORDER BY date DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/logs", async (req, res) => {
  const { assetId, action, performedBy, date, cost, notes } = req.body;
  if (!assetId || !action || !performedBy || !date) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const id = uuidv4();
  try {
    const result = await pool.query(
      `INSERT INTO maintenance_logs (id, asset_id, action, performed_by, date, cost, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, assetId, action, performedBy, date, cost, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/logs/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM maintenance_logs WHERE id = $1", [id]);
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Maintenance API running on http://localhost:${port}`);
});
