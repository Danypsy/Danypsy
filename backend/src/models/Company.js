const db = require('../config/database');

class Company {
  static create(userId, companyData) {
    const stmt = db.prepare(`
      INSERT INTO target_companies (
        user_id, name, industry, size, location, website, linkedin_url,
        status, interest_level, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      companyData.name,
      companyData.industry || null,
      companyData.size || null,
      companyData.location || null,
      companyData.website || null,
      companyData.linkedin_url || null,
      companyData.status || 'researching',
      companyData.interest_level || 3,
      companyData.notes || null
    );

    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM target_companies WHERE id = ?');
    return stmt.get(id);
  }

  static findByUser(userId) {
    const stmt = db.prepare(`
      SELECT * FROM target_companies
      WHERE user_id = ?
      ORDER BY interest_level DESC, updated_at DESC
    `);
    return stmt.all(userId);
  }

  static update(id, userId, companyData) {
    const stmt = db.prepare(`
      UPDATE target_companies
      SET name = ?, industry = ?, size = ?, location = ?, website = ?,
          linkedin_url = ?, status = ?, interest_level = ?, notes = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(
      companyData.name,
      companyData.industry || null,
      companyData.size || null,
      companyData.location || null,
      companyData.website || null,
      companyData.linkedin_url || null,
      companyData.status || 'researching',
      companyData.interest_level || 3,
      companyData.notes || null,
      id,
      userId
    );

    return this.findById(id);
  }

  static delete(id, userId) {
    const stmt = db.prepare('DELETE FROM target_companies WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
  }

  static getWithStats(userId) {
    const stmt = db.prepare(`
      SELECT
        tc.*,
        COUNT(DISTINCT c.id) as contact_count,
        COUNT(DISTINCT a.id) as application_count,
        COUNT(DISTINCT ho.id) as opportunity_count
      FROM target_companies tc
      LEFT JOIN contacts c ON tc.id = c.company_id
      LEFT JOIN applications a ON tc.id = a.company_id
      LEFT JOIN hidden_opportunities ho ON tc.id = ho.company_id
      WHERE tc.user_id = ?
      GROUP BY tc.id
      ORDER BY tc.interest_level DESC, tc.updated_at DESC
    `);
    return stmt.all(userId);
  }
}

module.exports = Company;
