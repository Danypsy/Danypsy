import React, { useState, useEffect } from 'react';
import { contactsAPI, companiesAPI } from '../services/api';
import { format } from 'date-fns';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    company_id: '',
    linkedin_url: '',
    relationship_strength: 1,
    how_met: '',
    last_contact_date: '',
    next_followup_date: '',
    notes: '',
    tags: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [contactsRes, companiesRes] = await Promise.all([
        contactsAPI.getAll(),
        companiesAPI.getAll()
      ]);
      setContacts(contactsRes.data);
      setCompanies(companiesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentContact) {
        await contactsAPI.update(currentContact.id, formData);
      } else {
        await contactsAPI.create(formData);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving contact:', error);
    }
  };

  const handleEdit = (contact) => {
    setCurrentContact(contact);
    setFormData({
      name: contact.name,
      title: contact.title || '',
      email: contact.email || '',
      phone: contact.phone || '',
      company_id: contact.company_id || '',
      linkedin_url: contact.linkedin_url || '',
      relationship_strength: contact.relationship_strength,
      how_met: contact.how_met || '',
      last_contact_date: contact.last_contact_date || '',
      next_followup_date: contact.next_followup_date || '',
      notes: contact.notes || '',
      tags: contact.tags || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contact ?')) {
      try {
        await contactsAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    }
  };

  const resetForm = () => {
    setCurrentContact(null);
    setFormData({
      name: '',
      title: '',
      email: '',
      phone: '',
      company_id: '',
      linkedin_url: '',
      relationship_strength: 1,
      how_met: '',
      last_contact_date: '',
      next_followup_date: '',
      notes: '',
      tags: ''
    });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Réseau Professionnel</h2>
          <p>Gérez vos contacts sur le marché caché</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Nouveau Contact
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Contact</th>
              <th>Entreprise</th>
              <th>Force Relation</th>
              <th>Dernier Contact</th>
              <th>Prochain Suivi</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contacts.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty-state">
                    <div className="empty-state-icon">👥</div>
                    <h3>Aucun contact</h3>
                    <p>Commencez à construire votre réseau professionnel</p>
                  </div>
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr key={contact.id}>
                  <td>
                    <strong>{contact.name}</strong>
                    {contact.title && <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{contact.title}</div>}
                    {contact.email && <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>{contact.email}</div>}
                  </td>
                  <td>{contact.company_name || '-'}</td>
                  <td>
                    {'⭐'.repeat(contact.relationship_strength)}
                  </td>
                  <td>{contact.last_contact_date || '-'}</td>
                  <td>
                    {contact.next_followup_date && (
                      <span className="badge badge-yellow">
                        {contact.next_followup_date}
                      </span>
                    )}
                  </td>
                  <td>
                    <button className="btn btn-secondary" style={{ marginRight: '0.5rem' }} onClick={() => handleEdit(contact)}>
                      ✏️
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(contact.id)}>
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {currentContact ? 'Modifier le contact' : 'Nouveau contact'}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nom *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Titre/Poste</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Entreprise</label>
                <select
                  className="form-select"
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                >
                  <option value="">Aucune entreprise</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">LinkedIn URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Force de la relation (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="form-input"
                  value={formData.relationship_strength}
                  onChange={(e) => setFormData({ ...formData, relationship_strength: parseInt(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Comment rencontré</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.how_met}
                  onChange={(e) => setFormData({ ...formData, how_met: e.target.value })}
                  placeholder="Ex: Conférence, LinkedIn, Référence..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date dernier contact</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.last_contact_date}
                  onChange={(e) => setFormData({ ...formData, last_contact_date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date prochain suivi</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.next_followup_date}
                  onChange={(e) => setFormData({ ...formData, next_followup_date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Tags (séparés par virgules)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Ex: RH, Développement, Manager..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  {currentContact ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
