require('dotenv').config();
const express = require('express');
const routes = require('./routes');
const { configureMiddleware } = require('./middleware/setup.middleware');

// initialize database connection
require('./config/database');

// start express app
const app = express();

// configure middleware
configureMiddleware(app);

// mount routes
app.use('/', routes);

module.exports = app;