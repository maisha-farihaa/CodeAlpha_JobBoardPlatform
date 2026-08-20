const express = require('express');
const router = express.Router();
const { getDb, saveDb, selectAll, selectOne } = require('../db');

// GET /api/jobs?search=&location=&job_type=
router.get('/', (req, res) => {
  const { search, location, job_type } = req.query;

  let sql = 'SELECT * FROM jobs WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (location) {
    sql += ' AND location LIKE ?';
    params.push(`%${location}%`);
  }

  if (job_type) {
    sql += ' AND job_type = ?';
    params.push(job_type);
  }

  sql += ' ORDER BY created_at DESC';

  const jobs = selectAll(sql, params);
  res.json(jobs);
});
// GET /api/jobs/:id
router.get('/:id', (req, res) => {
  const job = selectOne('SELECT * FROM jobs WHERE id = ?', [req.params.id]);

  if (!job) {
    return res.status(404).json({ error: 'Job not found.' });
  }

  const count = selectOne('SELECT COUNT(*) AS total FROM applications WHERE job_id = ?', [job.id]);
  job.applicants = count.total;

  res.json(job);
});


// POST /api/jobs - post a new job listing
router.post('/', (req, res) => {
  const { employer_name, employer_email, title, description, location, job_type, salary_range } = req.body;

  if (!employer_name || !employer_email || !title) {
    return res.status(400).json({ error: 'employer_name, employer_email, and title are required.' });
  }

  const db = getDb();
  db.run(
    `INSERT INTO jobs (employer_name, employer_email, title, description, location, job_type, salary_range)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [employer_name, employer_email, title, description || '', location || '', job_type || 'Full-time', salary_range || '']
  );
  saveDb();

  const newJob = selectOne('SELECT * FROM jobs ORDER BY id DESC LIMIT 1');
  res.status(201).json(newJob);
});

// DELETE /api/jobs/:id - employer removes their own listing
router.delete('/:id', (req, res) => {
  const job = selectOne('SELECT * FROM jobs WHERE id = ?', [req.params.id]);

  if (!job) {
    return res.status(404).json({ error: 'Job not found.' });
  }

  const db = getDb();
  db.run('DELETE FROM applications WHERE job_id = ?', [req.params.id]);
  db.run('DELETE FROM jobs WHERE id = ?', [req.params.id]);
  saveDb();

  res.json({ message: 'Job listing removed.' });
});

module.exports = router;
