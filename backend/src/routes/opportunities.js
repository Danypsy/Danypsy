const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunityController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', opportunityController.createOpportunity);
router.get('/', opportunityController.getAllOpportunities);
router.get('/active', opportunityController.getActiveOpportunities);
router.get('/:id', opportunityController.getOpportunity);
router.put('/:id', opportunityController.updateOpportunity);
router.delete('/:id', opportunityController.deleteOpportunity);

module.exports = router;
