const db = require('../config/database');

class Interaction {
  static create(userId, interactionData) {
    const stmt = db.prepare(`
      INSERT INTO interactions (
        user_id, contact_id, company_id, interaction_type, interaction_date,
        subject, notes, outcome, follow_up_required
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      interactionData.contact_id || null,
      interactionData.company_id || null,
      interactionData.interaction_type,
      interactionData.interaction_date,
      interactionData.subject || null,
      interactionData.notes || null,
      interactionData.outcome || null,
      interactionData.follow_up_required ? 1 : 0
    );

    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const stmt = db.prepare(`
      SELECT i.*,
             c.name as contact_name,
             tc.name as company_name
      FROM interactions i
      LEFT JOIN contacts c ON i.contact_id = c.id
      LEFT JOIN target_companies tc ON i.company_id = tc.id
      WHERE i.id = ?
    `);
    return stmt.get(id);
  }

  static findByUser(userId) {
    const stmt = db.prepare(`
      SELECT i.*,
             c.name as contact_name,
             tc.name as company_name
      FROM interactions i
      LEFT JOIN contacts c ON i.contact_id = c.id
      LEFT JOIN target_companies tc ON i.company_id = tc.id
      WHERE i.user_id = ?
      ORDER BY i.interaction_date DESC
    `);
    return stmt.all(userId);
  }

  static findByContact(contactId) {
    const stmt = db.prepare(`
      SELECT i.*, tc.name as company_name
      FROM interactions i
      LEFT JOIN target_companies tc ON i.company_id = tc.id
      WHERE i.contact_id = ?
      ORDER BY i.interaction_date DESC
    `);
    return stmt.all(contactId);
  }

  static delete(id, userId) {
    const stmt = db.prepare('DELETE FROM interactions WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
  }
}

module.exports = Interaction;
