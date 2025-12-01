const express = require('express');
const router = express.Router();
const { createPlan, getPlans } = require('../controllers/plan.controller');
const { getAllMajors, getMajorByName } = require('../controllers/major.controller');
const { createUser, login } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// user routes
router.post('/users', createUser);
router.post('/users/login', login);

// plan routes
router.post('/plans', authenticateToken, createPlan);
router.get('/plans', authenticateToken, getPlans);

// major routes
router.get('/majors', getAllMajors);
router.get('/majors/:majorName', getMajorByName);

module.exports = router;

