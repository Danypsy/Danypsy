const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', contactController.createContact);
router.get('/', contactController.getAllContacts);
router.get('/followups', contactController.getUpcomingFollowUps);
router.get('/:id', contactController.getContact);
router.put('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);

module.exports = router;
