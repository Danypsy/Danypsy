const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const auth = require('../middleware/auth');

router.use(auth);

router.post('/', companyController.createCompany);
router.get('/', companyController.getAllCompanies);
router.get('/stats', companyController.getCompaniesWithStats);
router.get('/:id', companyController.getCompany);
router.put('/:id', companyController.updateCompany);
router.delete('/:id', companyController.deleteCompany);

module.exports = router;
