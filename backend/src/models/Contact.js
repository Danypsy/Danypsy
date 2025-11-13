const db = require('../config/database');

class Contact {
  static create(userId, contactData) {
    const stmt = db.prepare(`
      INSERT INTO contacts (
        user_id, company_id, name, title, email, phone, linkedin_url,
        relationship_strength, how_met, last_contact_date, next_followup_date,
        notes, tags
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      contactData.company_id || null,
      contactData.name,
      contactData.title || null,
      contactData.email || null,
      contactData.phone || null,
      contactData.linkedin_url || null,
      contactData.relationship_strength || 1,
      contactData.how_met || null,
      contactData.last_contact_date || null,
      contactData.next_followup_date || null,
      contactData.notes || null,
      contactData.tags || null
    );

    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const stmt = db.prepare(`
      SELECT c.*, tc.name as company_name
      FROM contacts c
      LEFT JOIN target_companies tc ON c.company_id = tc.id
      WHERE c.id = ?
    `);
    return stmt.get(id);
  }

  static findByUser(userId) {
    const stmt = db.prepare(`
      SELECT c.*, tc.name as company_name
      FROM contacts c
      LEFT JOIN target_companies tc ON c.company_id = tc.id
      WHERE c.user_id = ?
      ORDER BY c.relationship_strength DESC, c.last_contact_date DESC
    `);
    return stmt.all(userId);
  }

  static update(id, userId, contactData) {
    const stmt = db.prepare(`
      UPDATE contacts
      SET company_id = ?, name = ?, title = ?, email = ?, phone = ?,
          linkedin_url = ?, relationship_strength = ?, how_met = ?,
          last_contact_date = ?, next_followup_date = ?, notes = ?, tags = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(
      contactData.company_id || null,
      contactData.name,
      contactData.title || null,
      contactData.email || null,
      contactData.phone || null,
      contactData.linkedin_url || null,
      contactData.relationship_strength || 1,
      contactData.how_met || null,
      contactData.last_contact_date || null,
      contactData.next_followup_date || null,
      contactData.notes || null,
      contactData.tags || null,
      id,
      userId
    );

    return this.findById(id);
  }

  static delete(id, userId) {
    const stmt = db.prepare('DELETE FROM contacts WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
  }

  static getUpcomingFollowUps(userId) {
    const stmt = db.prepare(`
      SELECT c.*, tc.name as company_name
      FROM contacts c
      LEFT JOIN target_companies tc ON c.company_id = tc.id
      WHERE c.user_id = ? AND c.next_followup_date IS NOT NULL
      ORDER BY c.next_followup_date ASC
    `);
    return stmt.all(userId);
  }
}

module.exports = Contact;
