import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companiesAPI, contactsAPI, applicationsAPI, opportunitiesAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    companies: 0,
    contacts: 0,
    applications: 0,
    opportunities: 0
  });
  const [applicationStats, setApplicationStats] = useState(null);
  const [recentContacts, setRecentContacts] = useState([]);
  const [activeOpportunities, setActiveOpportunities] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [companies, contacts, applications, opportunities, appStats, activeOpps] = await Promise.all([
        companiesAPI.getAll(),
        contactsAPI.getAll(),
        applicationsAPI.getAll(),
        opportunitiesAPI.getAll(),
        applicationsAPI.getStats(),
        opportunitiesAPI.getActive()
      ]);

      setStats({
        companies: companies.data.length,
        contacts: contacts.data.length,
        applications: applications.data.length,
        opportunities: opportunities.data.length
      });

      setApplicationStats(appStats.data);
      setRecentContacts(contacts.data.slice(0, 5));
      setActiveOpportunities(activeOpps.data.slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Vue d'ensemble de votre recherche sur le marché caché</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Entreprises Cibles</div>
          <div className="stat-value">{stats.companies}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Contacts Réseau</div>
          <div className="stat-value">{stats.contacts}</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-label">Opportunités Cachées</div>
          <div className="stat-value">{stats.opportunities}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Candidatures</div>
          <div className="stat-value">{stats.applications}</div>
        </div>
      </div>

      {applicationStats && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Statistiques des Candidatures</h3>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Spontanées</div>
              <div className="stat-value">{applicationStats.spontaneous || 0}</div>
            </div>
            <div className="stat-card success">
              <div className="stat-label">Par Référence</div>
              <div className="stat-value">{applicationStats.referrals || 0}</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-label">Entretiens</div>
              <div className="stat-value">{applicationStats.interviews || 0}</div>
            </div>
            <div className="stat-card success">
              <div className="stat-label">Offres</div>
              <div className="stat-value">{applicationStats.offers || 0}</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Opportunités Actives</h3>
            <Link to="/opportunities" className="btn btn-primary">Voir tout</Link>
          </div>
          {activeOpportunities.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💎</div>
              <h3>Aucune opportunité cachée</h3>
              <p>Commencez à tracker vos opportunités</p>
            </div>
          ) : (
            <div>
              {activeOpportunities.map((opp) => (
                <div key={opp.id} className="list-item">
                  <div className="item-header">
                    <div className="item-title">{opp.title}</div>
                    <span className={`badge badge-${opp.priority >= 4 ? 'red' : 'yellow'}`}>
                      Priorité {opp.priority}
                    </span>
                  </div>
                  <div className="item-meta">
                    {opp.company_name && `${opp.company_name} • `}
                    Source: {opp.source || 'Non spécifiée'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Contacts Récents</h3>
            <Link to="/contacts" className="btn btn-primary">Voir tout</Link>
          </div>
          {recentContacts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3>Aucun contact</h3>
              <p>Commencez à construire votre réseau</p>
            </div>
          ) : (
            <div>
              {recentContacts.map((contact) => (
                <div key={contact.id} className="list-item">
                  <div className="item-header">
                    <div className="item-title">{contact.name}</div>
                    <span className={`badge badge-blue`}>
                      Force: {contact.relationship_strength}/5
                    </span>
                  </div>
                  <div className="item-meta">
                    {contact.title && `${contact.title} • `}
                    {contact.company_name || 'Entreprise non liée'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
