const Interaction = require('../models/Interaction');

exports.createInteraction = (req, res) => {
  try {
    const interaction = Interaction.create(req.userId, req.body);
    res.status(201).json(interaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllInteractions = (req, res) => {
  try {
    const interactions = Interaction.findByUser(req.userId);
    res.json(interactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInteractionsByContact = (req, res) => {
  try {
    const interactions = Interaction.findByContact(req.params.contactId);
    res.json(interactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteInteraction = (req, res) => {
  try {
    Interaction.delete(req.params.id, req.userId);
    res.json({ message: 'Interaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
