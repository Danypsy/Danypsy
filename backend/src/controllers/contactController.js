const Contact = require('../models/Contact');

exports.createContact = (req, res) => {
  try {
    const contact = Contact.create(req.userId, req.body);
    res.status(201).json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllContacts = (req, res) => {
  try {
    const contacts = Contact.findByUser(req.userId);
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getContact = (req, res) => {
  try {
    const contact = Contact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateContact = (req, res) => {
  try {
    const contact = Contact.update(req.params.id, req.userId, req.body);
    res.json(contact);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteContact = (req, res) => {
  try {
    Contact.delete(req.params.id, req.userId);
    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUpcomingFollowUps = (req, res) => {
  try {
    const contacts = Contact.getUpcomingFollowUps(req.userId);
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
