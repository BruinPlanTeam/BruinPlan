const express = require('express');
const cors = require('cors');

/**
 * Configure and return all middleware
 * @param {express.Application} app - Express application instance
 */
function configureMiddleware(app) {
  // parse json request bodies
  app.use(express.json());
  
  // enable cors - allow common dev ports
  app.use(cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://localhost:5175'
    ],
    credentials: true
  }));
}

module.exports = { configureMiddleware };

