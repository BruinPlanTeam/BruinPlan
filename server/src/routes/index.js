const express = require('express');
const router = express.Router();
const routes = require('./routes');


// root route
router.get('/', (req, res) => {
  res.json({ message: 'Reached Root Route' });
});

// mount routes
router.use('/', routes);

module.exports = router;

