import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT =5000

app.use(cors())       

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from server!' })
})

