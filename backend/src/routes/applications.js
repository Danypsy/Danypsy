const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', applicationController.createApplication);
router.get('/', applicationController.getAllApplications);
router.get('/stats', applicationController.getStats);
router.get('/:id', applicationController.getApplication);
router.put('/:id', applicationController.updateApplication);
router.delete('/:id', applicationController.deleteApplication);

module.exports = router;
