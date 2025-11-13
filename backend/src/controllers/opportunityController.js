const HiddenOpportunity = require('../models/HiddenOpportunity');

exports.createOpportunity = (req, res) => {
  try {
    const opportunity = HiddenOpportunity.create(req.userId, req.body);
    res.status(201).json(opportunity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllOpportunities = (req, res) => {
  try {
    const opportunities = HiddenOpportunity.findByUser(req.userId);
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getActiveOpportunities = (req, res) => {
  try {
    const opportunities = HiddenOpportunity.getActive(req.userId);
    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOpportunity = (req, res) => {
  try {
    const opportunity = HiddenOpportunity.findById(req.params.id);
    if (!opportunity) {
      return res.status(404).json({ error: 'Opportunity not found' });
    }
    res.json(opportunity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOpportunity = (req, res) => {
  try {
    const opportunity = HiddenOpportunity.update(req.params.id, req.userId, req.body);
    res.json(opportunity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteOpportunity = (req, res) => {
  try {
    HiddenOpportunity.delete(req.params.id, req.userId);
    res.json({ message: 'Opportunity deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
