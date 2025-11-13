import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Contacts from './pages/Contacts';
import Opportunities from './pages/Opportunities';
import Applications from './pages/Applications';
import Interactions from './pages/Interactions';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/opportunities" element={<Opportunities />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/interactions" element={<Interactions />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
