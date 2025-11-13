const Application = require('../models/Application');

exports.createApplication = (req, res) => {
  try {
    const application = Application.create(req.userId, req.body);
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllApplications = (req, res) => {
  try {
    const applications = Application.findByUser(req.userId);
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getApplication = (req, res) => {
  try {
    const application = Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateApplication = (req, res) => {
  try {
    const application = Application.update(req.params.id, req.userId, req.body);
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteApplication = (req, res) => {
  try {
    Application.delete(req.params.id, req.userId);
    res.json({ message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStats = (req, res) => {
  try {
    const stats = Application.getStats(req.userId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
