const Company = require('../models/Company');

exports.createCompany = (req, res) => {
  try {
    const company = Company.create(req.userId, req.body);
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCompanies = (req, res) => {
  try {
    const companies = Company.findByUser(req.userId);
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCompaniesWithStats = (req, res) => {
  try {
    const companies = Company.getWithStats(req.userId);
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCompany = (req, res) => {
  try {
    const company = Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCompany = (req, res) => {
  try {
    const company = Company.update(req.params.id, req.userId, req.body);
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCompany = (req, res) => {
  try {
    Company.delete(req.params.id, req.userId);
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
