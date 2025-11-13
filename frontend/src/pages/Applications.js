import React, { useState, useEffect } from 'react';
import { applicationsAPI, companiesAPI, contactsAPI } from '../services/api';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentApplication, setCurrentApplication] = useState(null);
  const [formData, setFormData] = useState({
    position_title: '',
    company_id: '',
    contact_id: '',
    application_type: 'spontaneous',
    status: 'sent',
    application_date: new Date().toISOString().split('T')[0],
    referral_source: '',
    cover_letter_notes: '',
    resume_version: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [appsRes, companiesRes, contactsRes] = await Promise.all([
        applicationsAPI.getAll(),
        companiesAPI.getAll(),
        contactsAPI.getAll()
      ]);
      setApplications(appsRes.data);
      setCompanies(companiesRes.data);
      setContacts(contactsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentApplication) {
        await applicationsAPI.update(currentApplication.id, formData);
      } else {
        await applicationsAPI.create(formData);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving application:', error);
    }
  };

  const handleEdit = (application) => {
    setCurrentApplication(application);
    setFormData({
      position_title: application.position_title,
      company_id: application.company_id || '',
      contact_id: application.contact_id || '',
      application_type: application.application_type,
      status: application.status,
      application_date: application.application_date,
      referral_source: application.referral_source || '',
      cover_letter_notes: application.cover_letter_notes || '',
      resume_version: application.resume_version || '',
      notes: application.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
      try {
        await applicationsAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting application:', error);
      }
    }
  };

  const resetForm = () => {
    setCurrentApplication(null);
    setFormData({
      position_title: '',
      company_id: '',
      contact_id: '',
      application_type: 'spontaneous',
      status: 'sent',
      application_date: new Date().toISOString().split('T')[0],
      referral_source: '',
      cover_letter_notes: '',
      resume_version: '',
      notes: ''
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      sent: 'badge-blue',
      viewed: 'badge-yellow',
      interview: 'badge-green',
      offer: 'badge-green',
      rejected: 'badge-red',
      withdrawn: 'badge-red'
    };
    return badges[status] || 'badge-blue';
  };

  const getTypeBadge = (type) => {
    return type === 'referral' ? 'badge-green' : 'badge-blue';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>📝 Candidatures</h2>
          <p>Suivez toutes vos candidatures spontanées et référées</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Nouvelle Candidature
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Poste</th>
              <th>Entreprise</th>
              <th>Type</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Référence</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    <div className="empty-state-icon">📝</div>
                    <h3>Aucune candidature</h3>
                    <p>Commencez à tracker vos candidatures</p>
                  </div>
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <strong>{app.position_title}</strong>
                  </td>
                  <td>{app.company_name || '-'}</td>
                  <td>
                    <span className={`badge ${getTypeBadge(app.application_type)}`}>
                      {app.application_type === 'referral' ? 'Référée' : 'Spontanée'}
                    </span>
                  </td>
                  <td>{app.application_date}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>{app.contact_name || app.referral_source || '-'}</td>
                  <td>
                    <button className="btn btn-secondary" style={{ marginRight: '0.5rem' }} onClick={() => handleEdit(app)}>
                      ✏️
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(app.id)}>
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
                {currentApplication ? 'Modifier la candidature' : 'Nouvelle candidature'}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Titre du poste *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.position_title}
                  onChange={(e) => setFormData({ ...formData, position_title: e.target.value })}
                  required
                />
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
                <label className="form-label">Type de candidature</label>
                <select
                  className="form-select"
                  value={formData.application_type}
                  onChange={(e) => setFormData({ ...formData, application_type: e.target.value })}
                >
                  <option value="spontaneous">Spontanée</option>
                  <option value="referral">Référée</option>
                  <option value="direct">Contact direct</option>
                </select>
              </div>
              {formData.application_type === 'referral' && (
                <div className="form-group">
                  <label className="form-label">Contact référent</label>
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
              )}
              <div className="form-group">
                <label className="form-label">Source de référence</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.referral_source}
                  onChange={(e) => setFormData({ ...formData, referral_source: e.target.value })}
                  placeholder="Ex: LinkedIn, événement, recommandation..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date de candidature *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.application_date}
                  onChange={(e) => setFormData({ ...formData, application_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Statut</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="sent">Envoyée</option>
                  <option value="viewed">Vue</option>
                  <option value="interview">Entretien</option>
                  <option value="offer">Offre</option>
                  <option value="rejected">Refusée</option>
                  <option value="withdrawn">Retirée</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes lettre de motivation</label>
                <textarea
                  className="form-textarea"
                  value={formData.cover_letter_notes}
                  onChange={(e) => setFormData({ ...formData, cover_letter_notes: e.target.value })}
                  placeholder="Points clés de personnalisation..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Version CV</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.resume_version}
                  onChange={(e) => setFormData({ ...formData, resume_version: e.target.value })}
                  placeholder="Ex: CV_Tech_2024_v3"
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
                  {currentApplication ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Applications;
