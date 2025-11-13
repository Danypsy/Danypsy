import React, { useState, useEffect } from 'react';
import { companiesAPI } from '../services/api';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    size: '',
    location: '',
    website: '',
    linkedin_url: '',
    status: 'researching',
    interest_level: 3,
    notes: ''
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const response = await companiesAPI.getWithStats();
      setCompanies(response.data);
    } catch (error) {
      console.error('Error loading companies:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentCompany) {
        await companiesAPI.update(currentCompany.id, formData);
      } else {
        await companiesAPI.create(formData);
      }
      setShowModal(false);
      resetForm();
      loadCompanies();
    } catch (error) {
      console.error('Error saving company:', error);
    }
  };

  const handleEdit = (company) => {
    setCurrentCompany(company);
    setFormData({
      name: company.name,
      industry: company.industry || '',
      size: company.size || '',
      location: company.location || '',
      website: company.website || '',
      linkedin_url: company.linkedin_url || '',
      status: company.status,
      interest_level: company.interest_level,
      notes: company.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) {
      try {
        await companiesAPI.delete(id);
        loadCompanies();
      } catch (error) {
        console.error('Error deleting company:', error);
      }
    }
  };

  const resetForm = () => {
    setCurrentCompany(null);
    setFormData({
      name: '',
      industry: '',
      size: '',
      location: '',
      website: '',
      linkedin_url: '',
      status: 'researching',
      interest_level: 3,
      notes: ''
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      researching: 'badge-blue',
      targeted: 'badge-yellow',
      contacted: 'badge-green',
      inactive: 'badge-red'
    };
    return badges[status] || 'badge-blue';
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Entreprises Cibles</h2>
          <p>Gérez vos entreprises cibles sur le marché caché</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
          + Nouvelle Entreprise
        </button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Entreprise</th>
              <th>Industrie</th>
              <th>Localisation</th>
              <th>Statut</th>
              <th>Intérêt</th>
              <th>Contacts</th>
              <th>Opportunités</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.length === 0 ? (
              <tr>
                <td colSpan="8">
                  <div className="empty-state">
                    <div className="empty-state-icon">🏢</div>
                    <h3>Aucune entreprise cible</h3>
                    <p>Commencez par ajouter des entreprises à cibler</p>
                  </div>
                </td>
              </tr>
            ) : (
              companies.map((company) => (
                <tr key={company.id}>
                  <td>
                    <strong>{company.name}</strong>
                    {company.website && (
                      <div>
                        <a href={company.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#2563eb' }}>
                          {company.website}
                        </a>
                      </div>
                    )}
                  </td>
                  <td>{company.industry || '-'}</td>
                  <td>{company.location || '-'}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(company.status)}`}>
                      {company.status}
                    </span>
                  </td>
                  <td>
                    {'⭐'.repeat(company.interest_level)}
                  </td>
                  <td>{company.contact_count || 0}</td>
                  <td>{company.opportunity_count || 0}</td>
                  <td>
                    <button className="btn btn-secondary" style={{ marginRight: '0.5rem' }} onClick={() => handleEdit(company)}>
                      ✏️
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(company.id)}>
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
                {currentCompany ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
              </h3>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nom de l'entreprise *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Industrie</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Taille</label>
                <select
                  className="form-select"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                >
                  <option value="">Sélectionner</option>
                  <option value="1-10">1-10 employés</option>
                  <option value="11-50">11-50 employés</option>
                  <option value="51-200">51-200 employés</option>
                  <option value="201-500">201-500 employés</option>
                  <option value="501+">501+ employés</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Localisation</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Site web</label>
                <input
                  type="url"
                  className="form-input"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
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
                <label className="form-label">Statut</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="researching">Recherche</option>
                  <option value="targeted">Ciblée</option>
                  <option value="contacted">Contactée</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Niveau d'intérêt (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="form-input"
                  value={formData.interest_level}
                  onChange={(e) => setFormData({ ...formData, interest_level: parseInt(e.target.value) })}
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
                  {currentCompany ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;
