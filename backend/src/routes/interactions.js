const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', interactionController.createInteraction);
router.get('/', interactionController.getAllInteractions);
router.get('/contact/:contactId', interactionController.getInteractionsByContact);
router.delete('/:id', interactionController.deleteInteraction);

module.exports = router;
