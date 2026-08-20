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
