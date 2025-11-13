const db = require('../config/database');

class Application {
  static create(userId, applicationData) {
    const stmt = db.prepare(`
      INSERT INTO applications (
        user_id, company_id, contact_id, position_title, application_type,
        status, application_date, referral_source, cover_letter_notes,
        resume_version, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      applicationData.company_id || null,
      applicationData.contact_id || null,
      applicationData.position_title,
      applicationData.application_type || 'spontaneous',
      applicationData.status || 'sent',
      applicationData.application_date,
      applicationData.referral_source || null,
      applicationData.cover_letter_notes || null,
      applicationData.resume_version || null,
      applicationData.notes || null
    );

    return this.findById(result.lastInsertRowid);
  }

  static findById(id) {
    const stmt = db.prepare(`
      SELECT a.*,
             tc.name as company_name,
             c.name as contact_name
      FROM applications a
      LEFT JOIN target_companies tc ON a.company_id = tc.id
      LEFT JOIN contacts c ON a.contact_id = c.id
      WHERE a.id = ?
    `);
    return stmt.get(id);
  }

  static findByUser(userId) {
    const stmt = db.prepare(`
      SELECT a.*,
             tc.name as company_name,
             c.name as contact_name
      FROM applications a
      LEFT JOIN target_companies tc ON a.company_id = tc.id
      LEFT JOIN contacts c ON a.contact_id = c.id
      WHERE a.user_id = ?
      ORDER BY a.application_date DESC
    `);
    return stmt.all(userId);
  }

  static update(id, userId, applicationData) {
    const stmt = db.prepare(`
      UPDATE applications
      SET company_id = ?, contact_id = ?, position_title = ?,
          application_type = ?, status = ?, application_date = ?,
          referral_source = ?, cover_letter_notes = ?, resume_version = ?,
          follow_up_dates = ?, response_date = ?, interview_dates = ?,
          outcome = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(
      applicationData.company_id || null,
      applicationData.contact_id || null,
      applicationData.position_title,
      applicationData.application_type || 'spontaneous',
      applicationData.status || 'sent',
      applicationData.application_date,
      applicationData.referral_source || null,
      applicationData.cover_letter_notes || null,
      applicationData.resume_version || null,
      applicationData.follow_up_dates || null,
      applicationData.response_date || null,
      applicationData.interview_dates || null,
      applicationData.outcome || null,
      applicationData.notes || null,
      id,
      userId
    );

    return this.findById(id);
  }

  static delete(id, userId) {
    const stmt = db.prepare('DELETE FROM applications WHERE id = ? AND user_id = ?');
    return stmt.run(id, userId);
  }

  static getStats(userId) {
    const stmt = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent,
        SUM(CASE WHEN status = 'interview' THEN 1 ELSE 0 END) as interviews,
        SUM(CASE WHEN status = 'offer' THEN 1 ELSE 0 END) as offers,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN application_type = 'referral' THEN 1 ELSE 0 END) as referrals,
        SUM(CASE WHEN application_type = 'spontaneous' THEN 1 ELSE 0 END) as spontaneous
      FROM applications
      WHERE user_id = ?
    `);
    return stmt.get(userId);
  }
}

module.exports = Application;
