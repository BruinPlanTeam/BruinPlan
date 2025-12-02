const express = require('express');
const cors = require('cors');

/**
 * Configure and return all middleware
 * @param {express.Application} app - Express application instance
 */
function configureMiddleware(app) {
  // parse json request bodies
  app.use(express.json());
  
  // enable cors
  app.use(cors({
    origin: 'http://localhost:5173' 
  }));
}

module.exports = { configureMiddleware };

