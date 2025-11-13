const db = require('../config/database');

class HiddenOpportunity {
  static create(userId, opportunityData) {
    const stmt = db.prepare(`
      INSERT INTO hidden_opportunities (
        user_id, company_id, contact_id, title, department, source,
        discovery_date, estimated_opening_date, status, priority,
        requirements, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      opportunityData.company_id || null,
      opportunityData.contact_id || null,
      opportunityData.title,
      opportunityData.department || null,
      opportunityData.source || null,
      opportunityData.discovery_date,
      opportunityData.estimated_opening_date || null,
      opportunityData.status || 'tracked',
      opportunityData.priority || 3,
      opportunityData.requirements || null,
      opportunityData.notes || null
    );

    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const stmt = db.prepare(`
      SELECT ho.*,
             tc.name as company_name,
             c.name as contact_name
      FROM hidden_opportunities ho
      LEFT JOIN target_companies tc ON ho.company_id = tc.id
      LEFT JOIN contacts c ON ho.contact_id = c.id
      WHERE ho.id = ?
    `);
    return stmt.get(id);
  }

  static findByUser(userId) {
    const stmt = db.prepare(`
      SELECT ho.*,
             tc.name as company_name,
             c.name as contact_name
      FROM hidden_opportunities ho
      LEFT JOIN target_companies tc ON ho.company_id = tc.id
      LEFT JOIN contacts c ON ho.contact_id = c.id
      WHERE ho.user_id = ?
      ORDER BY ho.priority DESC, ho.discovery_date DESC
    `);
    return stmt.all(userId);
  }

  static update(id, userId, opportunityData) {
    const stmt = db.prepare(`
      UPDATE hidden_opportunities
      SET company_id = ?, contact_id = ?, title = ?, department = ?,
          source = ?, discovery_date = ?, estimated_opening_date = ?,
          status = ?, priority = ?, requirements = ?, notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(
      opportunityData.company_id || null,
      opportunityData.contact_id || null,
      opportunityData.title,
      opportunityData.department || null,
      opportunityData.source || null,
      opportunityData.discovery_date,
      opportunityData.estimated_opening_date || null,
      opportunityData.status || 'tracked',
      opportunityData.priority || 3,
      opportunityData.requirements || null,
      opportunityData.notes || null,
      id,
      userId
    );

    return this.findById(id);
  }

  static delete(id, userId) {
    const stmt = db.prepare('DELETE FROM hidden_opportunities WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
  }

  static getActive(userId) {
    const stmt = db.prepare(`
      SELECT ho.*,
             tc.name as company_name,
             c.name as contact_name
      FROM hidden_opportunities ho
      LEFT JOIN target_companies tc ON ho.company_id = tc.id
      LEFT JOIN contacts c ON ho.contact_id = c.id
      WHERE ho.user_id = ? AND ho.status IN ('tracked', 'approaching')
      ORDER BY ho.priority DESC, ho.estimated_opening_date ASC
    `);
    return stmt.all(userId);
  }
}

module.exports = HiddenOpportunity;
