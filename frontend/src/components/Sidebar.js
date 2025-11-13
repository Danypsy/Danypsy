import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/companies', label: 'Entreprises Cibles', icon: '🏢' },
    { path: '/contacts', label: 'Réseau Pro', icon: '👥' },
    { path: '/opportunities', label: 'Opportunités Cachées', icon: '💎' },
    { path: '/applications', label: 'Candidatures', icon: '📝' },
    { path: '/interactions', label: 'Interactions', icon: '💬' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>Hidden Jobs</h1>
        <p>Marché Caché</p>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
