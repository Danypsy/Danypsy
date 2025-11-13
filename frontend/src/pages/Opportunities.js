import React, { useState, useEffect } from 'react';
import { opportunitiesAPI, companiesAPI, contactsAPI } from '../services/api';

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentOpportunity, setCurrentOpportunity] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    company_id: '',
    contact_id: '',
    department: '',
    source: '',
    discovery_date: new Date().toISOString().split('T')[0],
    estimated_opening_date: '',
    status: 'tracked',
    priority: 3,
    requirements: '',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [oppsRes, companiesRes, contactsRes] = await Promise.all([
        opportunitiesAPI.getAll(),
        companiesAPI.getAll(),
        contactsAPI.getAll()
      ]);
      setOpportunities(oppsRes.data);
      setCompanies(companiesRes.data);
      setContacts(contactsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentOpportunity) {
        await opportunitiesAPI.update(currentOpportunity.id, formData);
      } else {
        await opportunitiesAPI.create(formData);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving opportunity:', error);
    }
  };

  const handleEdit = (opportunity) => {
    setCurrentOpportunity(opportunity);
    setFormData({
      title: opportunity.title,
      company_id: opportunity.company_id || '',
      contact_id: opportunity.contact_id || '',
      department: opportunity.department || '',
      source: opportunity.source || '',
      discovery_date: opportunity.discovery_date,
      estimated_opening_date: opportunity.estimated_opening_date || '',
      status: opportunity.status,
      priority: opportunity.priority,
      requirements: opportunity.requirements || '',
      notes: opportunity.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette opportunité ?')) {
      try {
        await opportunitiesAPI.delete(id);
        loadData();
      } catch (error) {
        console.error('Error deleting opportunity:', error);
      }
    }
  };

  const resetForm = () => {
    setCurrentOpportunity(null);
    setFormData({
      title: '',
      company_id: '',
      contact_id: '',
      department: '',
      source: '',
      discovery_date: new Date().toISOString().split('T')[0],
      estimated_opening_date: '',
      status: 'tracked',
      priority: 3,
      requirements: '',
      notes: ''
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      tracked: 'badge-blue',
      approaching: 'badge-yellow',
      applied: 'badge-green',
      closed: 'badge-red'
    };
    return badges[status] || 'badge-blue';
  };

  const getPriorityColor = (priority) => {
    if (priority >= 4) return 'red';
    if (priority === 3) return 'yellow';
    return 'green';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>💎 Opportunités Cachées</h2>
          <p>Suivez les opportunités non publiées découvertes via votre réseau</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Nouvelle Opportunité
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Opportunité</th>
              <th>Entreprise</th>
              <th>Contact Source</th>
              <th>Découverte</th>
              <th>Priorité</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {opportunities.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="empty-state">
                    <div className="empty-state-icon">💎</div>
                    <h3>Aucune opportunité cachée</h3>
                    <p>Utilisez votre réseau pour découvrir des postes non publiés</p>
                  </div>
                </td>
              </tr>
            ) : (
              opportunities.map((opp) => (
                <tr key={opp.id}>
                  <td>
                    <strong>{opp.title}</strong>
                    {opp.department && <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Département: {opp.department}</div>}
                    {opp.source && <div style={{ fontSize: '0.75rem', color: '#2563eb' }}>Source: {opp.source}</div>}
                  </td>
                  <td>{opp.company_name || '-'}</td>
                  <td>{opp.contact_name || '-'}</td>
                  <td>{opp.discovery_date}</td>
                  <td>
                    <span className={`badge badge-${getPriorityColor(opp.priority)}`}>
                      {'⭐'.repeat(opp.priority)}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(opp.status)}`}>
                      {opp.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary" style={{ marginRight: '0.5rem' }} onClick={() => handleEdit(opp)}>
                      ✏️
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(opp.id)}>
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
                {currentOpportunity ? 'Modifier l\'opportunité' : 'Nouvelle opportunité'}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Titre du poste *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                <label className="form-label">Contact source</label>
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
                <label className="form-label">Département</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Source de découverte</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="Ex: Conversation LinkedIn, Événement networking..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date de découverte *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.discovery_date}
                  onChange={(e) => setFormData({ ...formData, discovery_date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date d'ouverture estimée</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.estimated_opening_date}
                  onChange={(e) => setFormData({ ...formData, estimated_opening_date: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Statut</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="tracked">Suivie</option>
                  <option value="approaching">En approche</option>
                  <option value="applied">Candidature envoyée</option>
                  <option value="closed">Fermée</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priorité (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="form-input"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Exigences</label>
                <textarea
                  className="form-textarea"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="Compétences requises, années d'expérience..."
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
                  {currentOpportunity ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Opportunities;
