const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection 
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'disaster_db',
  password: 'YOUR_PGADMIN_PASSWORD', // The password you set earlier
  port: 5432,
});

// Example Route: Get all Affected Areas [cite: 29, 31]
app.get('/api/areas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM AffectedAreas');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});