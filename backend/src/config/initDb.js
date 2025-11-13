require('dotenv').config();
const db = require('./database');

console.log('🔨 Initialisation de la base de données...');

// Table des utilisateurs
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Table des entreprises cibles
db.exec(`
  CREATE TABLE IF NOT EXISTS target_companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    industry TEXT,
    size TEXT,
    location TEXT,
    website TEXT,
    linkedin_url TEXT,
    status TEXT DEFAULT 'researching',
    interest_level INTEGER DEFAULT 3,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Table des contacts professionnels (le cœur du marché caché)
db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    company_id INTEGER,
    name TEXT NOT NULL,
    title TEXT,
    email TEXT,
    phone TEXT,
    linkedin_url TEXT,
    relationship_strength INTEGER DEFAULT 1,
    how_met TEXT,
    last_contact_date DATE,
    next_followup_date DATE,
    notes TEXT,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES target_companies(id) ON DELETE SET NULL
  )
`);

// Table des interactions (networking)
db.exec(`
  CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    contact_id INTEGER,
    company_id INTEGER,
    interaction_type TEXT NOT NULL,
    interaction_date DATE NOT NULL,
    subject TEXT,
    notes TEXT,
    outcome TEXT,
    follow_up_required BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES target_companies(id) ON DELETE CASCADE
  )
`);

// Table des candidatures (spontanées et référées)
db.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    company_id INTEGER,
    contact_id INTEGER,
    position_title TEXT NOT NULL,
    application_type TEXT DEFAULT 'spontaneous',
    status TEXT DEFAULT 'sent',
    application_date DATE NOT NULL,
    referral_source TEXT,
    cover_letter_notes TEXT,
    resume_version TEXT,
    follow_up_dates TEXT,
    response_date DATE,
    interview_dates TEXT,
    outcome TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES target_companies(id) ON DELETE SET NULL,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
  )
`);

// Table des opportunités non publiées (marché caché)
db.exec(`
  CREATE TABLE IF NOT EXISTS hidden_opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    company_id INTEGER,
    contact_id INTEGER,
    title TEXT NOT NULL,
    department TEXT,
    source TEXT,
    discovery_date DATE NOT NULL,
    estimated_opening_date DATE,
    status TEXT DEFAULT 'tracked',
    priority INTEGER DEFAULT 3,
    requirements TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES target_companies(id) ON DELETE SET NULL,
    FOREIGN KEY (contact_id) REFERENCES contacts(id) ON DELETE SET NULL
  )
`);

// Table des rappels et tâches
db.exec(`
  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    related_type TEXT,
    related_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATETIME NOT NULL,
    completed BOOLEAN DEFAULT 0,
    completed_at DATETIME,
    priority TEXT DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Table des événements de networking
db.exec(`
  CREATE TABLE IF NOT EXISTS networking_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    event_name TEXT NOT NULL,
    event_type TEXT,
    event_date DATE NOT NULL,
    location TEXT,
    attendees TEXT,
    companies_present TEXT,
    key_takeaways TEXT,
    follow_ups TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Index pour améliorer les performances
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_contacts_user ON contacts(user_id);
  CREATE INDEX IF NOT EXISTS idx_companies_user ON target_companies(user_id);
  CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
  CREATE INDEX IF NOT EXISTS idx_interactions_user ON interactions(user_id);
  CREATE INDEX IF NOT EXISTS idx_reminders_user_due ON reminders(user_id, due_date);
`);

console.log('✅ Base de données initialisée avec succès!');
console.log('📊 Tables créées:');
console.log('  - users (utilisateurs)');
console.log('  - target_companies (entreprises cibles)');
console.log('  - contacts (réseau professionnel)');
console.log('  - interactions (historique de networking)');
console.log('  - applications (candidatures)');
console.log('  - hidden_opportunities (opportunités cachées)');
console.log('  - reminders (rappels)');
console.log('  - networking_events (événements)');

db.close();
