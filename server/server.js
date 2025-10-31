const express = require('express');
const dotenv = require('dotenv');
const mysql = require('mysql2');
const cors = require('cors');


const { PrismaClient} = require('@prisma/client')
const prisma = new PrismaClient();


dotenv.config();

const app = express();
const PORT = 3000

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

app.use(cors({
    origin: 'http://localhost:5173' 
}));

conn.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1); 
  } else {
    console.log('Connected to MySQL successfully.');
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Hello from server!' });
});


app.get('/testing', async (req, res) => { 
  try {
    const results = await prisma.testing.findMany();

    res.json(results);
  } catch (error) {
    console.error("Error retrieving data:", error);
  }
});


app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
