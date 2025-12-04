const express = require('express');
const router = express.Router();
const { createPlan, getPlans, updatePlan, deletePlan, updatePlanName } = require('../controllers/plan.controller');
const { getAllMajors, getMajorByName } = require('../controllers/major.controller');
const { createUser, login, updateUsername } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// user routes
router.post('/users', createUser);
router.post('/users/login', login);
router.patch('/users/username', authenticateToken, updateUsername);

// plan routes
router.post('/plans', authenticateToken, createPlan);
router.get('/plans', authenticateToken, getPlans);
router.put('/plans/:planId', authenticateToken, updatePlan);
router.patch('/plans/:planId/name', authenticateToken, updatePlanName);
router.delete('/plans/:planId', authenticateToken, deletePlan);

// major routes
router.get('/majors', getAllMajors);
router.get('/majors/:majorName', getMajorByName);

module.exports = router;

