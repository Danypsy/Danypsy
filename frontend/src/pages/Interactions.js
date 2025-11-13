import React, { useState, useEffect } from 'react';
import { interactionsAPI, contactsAPI, companiesAPI } from '../services/api';

const Interactions = () => {
  const [interactions, setInteractions] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    contact_id: '',
    company_id: '',
    interaction_type: 'email',
    interaction_date: new Date().toISOString().split('T')[0],
    subject: '',
    notes: '',
    outcome: '',
    follow_up_required: false
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [interactionsRes, contactsRes, companiesRes] = await Promise.all([
        interactionsAPI.getAll(),
        contactsAPI.getAll(),
        companiesAPI.getAll()
      ]);
      setInteractions(interactionsRes.data);
      setContacts(contactsRes.data);
      setCompanies(companiesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await interactionsAPI.create(formData);
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving interaction:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette interaction ?')) {
      try {
        await interactionsAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting interaction:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      contact_id: '',
      company_id: '',
      interaction_type: 'email',
      interaction_date: new Date().toISOString().split('T')[0],
      subject: '',
      notes: '',
      outcome: '',
      follow_up_required: false
    });
  };

  const getTypeIcon = (type) => {
    const icons = {
      email: '📧',
      phone: '📞',
      meeting: '🤝',
      linkedin: '💼',
      coffee: '☕',
      event: '🎉',
      other: '💬'
    };
    return icons[type] || '💬';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>💬 Interactions</h2>
          <p>Historique de toutes vos interactions de networking</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Nouvelle Interaction
        </button>
      </div>

      <div className="card">
        <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
          {interactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <h3>Aucune interaction</h3>
              <p>Commencez à documenter vos échanges professionnels</p>
            </div>
          ) : (
            interactions.map((interaction) => (
              <div key={interaction.id} className="list-item">
                <div className="item-header">
                  <div>
                    <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>
                      {getTypeIcon(interaction.interaction_type)}
                    </span>
                    <strong>{interaction.subject || 'Sans sujet'}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {interaction.follow_up_required && (
                      <span className="badge badge-yellow">Suivi requis</span>
                    )}
                    <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }} onClick={() => handleDelete(interaction.id)}>
                      🗑️
                    </button>
                  </div>
                </div>
                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  {interaction.contact_name && (
                    <span className="badge badge-blue">👤 {interaction.contact_name}</span>
                  )}
                  {interaction.company_name && (
                    <span className="badge badge-green">🏢 {interaction.company_name}</span>
                  )}
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    📅 {interaction.interaction_date}
                  </span>
                </div>
                {interaction.notes && (
                  <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.375rem', fontSize: '0.875rem' }}>
                    {interaction.notes}
                  </div>
                )}
                {interaction.outcome && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#10b981' }}>
                    <strong>Résultat:</strong> {interaction.outcome}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Nouvelle Interaction</h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Type d'interaction *</label>
                <select
                  className="form-select"
                  value={formData.interaction_type}
                  onChange={(e) => setFormData({ ...formData, interaction_type: e.target.value })}
                  required
                >
                  <option value="email">Email</option>
                  <option value="phone">Appel téléphonique</option>
                  <option value="meeting">Réunion</option>
                  <option value="linkedin">Message LinkedIn</option>
                  <option value="coffee">Café networking</option>
                  <option value="event">Événement</option>
                  <option value="other">Autre</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Contact</label>
                <select
                  className="form-select"
                  value={formData.contact_id}
                  onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                >
                  <option value="">Sélectionner un contact</option>
                  {contacts.map((contact) => (
                    <option key={contact.id} value={contact.id}>
                      {contact.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Entreprise</label>
                <select
                  className="form-select"
                  value={formData.company_id}
                  onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                >
                  <option value="">Sélectionner une entreprise</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.interaction_date}
                  onChange={(e) => setFormData({ ...formData, interaction_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sujet</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Ex: Discussion sur opportunités développeur"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-textarea"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Détails de la conversation, points importants..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Résultat</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.outcome}
                  onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                  placeholder="Ex: Opportunité identifiée, référence promise..."
                />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.follow_up_required}
                    onChange={(e) => setFormData({ ...formData, follow_up_required: e.target.checked })}
                  />
                  <span className="form-label" style={{ margin: 0 }}>Suivi requis</span>
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Interactions;
