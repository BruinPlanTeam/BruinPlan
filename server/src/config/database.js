require('dotenv').config();
const mysql = require('mysql2');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
  prisma
};

