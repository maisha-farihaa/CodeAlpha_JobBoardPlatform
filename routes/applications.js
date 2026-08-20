const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getDb, saveDb, selectAll, selectOne } = require('../db');

// resumes get saved into the uploads folder with a unique-ish filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + file.originalname;
    cb(null, unique);
  }
});
const upload = multer({ storage });

// POST /api/jobs/:id/apply - candidate applies, resume file optional
router.post('/jobs/:id/apply', upload.single('resume'), (req, res) => {
  const jobId = req.params.id;
  const { candidate_name, candidate_email, cover_letter } = req.body;

  if (!candidate_name || !candidate_email) {
    return res.status(400).json({ error: 'candidate_name and candidate_email are required.' });
  }

  const job = selectOne('SELECT * FROM jobs WHERE id = ?', [jobId]);
  if (!job) {
    return res.status(404).json({ error: 'Job not found.' });
  }

  const already = selectOne(
    'SELECT * FROM applications WHERE job_id = ? AND candidate_email = ?',
    [jobId, candidate_email]
  );
  if (already) {
    return res.status(409).json({ error: 'You have already applied to this job.' });
  }

  const resumeFilename = req.file ? req.file.filename : null;

  const db = getDb();
  db.run(
    `INSERT INTO applications (job_id, candidate_name, candidate_email, resume_filename, cover_letter)
     VALUES (?, ?, ?, ?, ?)`,
    [jobId, candidate_name, candidate_email, resumeFilename, cover_letter || '']
  );
  saveDb();

  const application = selectOne('SELECT * FROM applications ORDER BY id DESC LIMIT 1');
  res.status(201).json(application);
});

// GET /api/applications?email=candidate@example.com - candidate checks their applications
router.get('/applications', (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Please provide an email query param.' });
  }

  const rows = selectAll(`
    SELECT applications.id, applications.status, applications.created_at,
           jobs.title, jobs.employer_name, jobs.location
    FROM applications
    JOIN jobs ON jobs.id = applications.job_id
    WHERE applications.candidate_email = ?
    ORDER BY applications.created_at DESC
  `, [email]);

  res.json(rows);
});

// GET /api/jobs/:id/applications - employer views applicants for one job
router.get('/jobs/:id/applications', (req, res) => {
  const rows = selectAll(
    'SELECT * FROM applications WHERE job_id = ? ORDER BY created_at DESC',
    [req.params.id]
  );
  res.json(rows);
});

// PATCH /api/applications/:id/status - employer updates an application's status
router.patch('/applications/:id/status', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['applied', 'reviewed', 'accepted', 'rejected'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  const existing = selectOne('SELECT * FROM applications WHERE id = ?', [req.params.id]);
  if (!existing) {
    return res.status(404).json({ error: 'Application not found.' });
  }

  const db = getDb();
  db.run('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);
  saveDb();

  const updated = selectOne('SELECT * FROM applications WHERE id = ?', [req.params.id]);
  res.json(updated);
});

// GET /api/resumes/:filename - download a resume file
router.get('/resumes/:filename', (req, res) => {
  const filePath = path.join(__dirname, '..', 'uploads', req.params.filename);
  res.download(filePath, (err) => {
    if (err) res.status(404).json({ error: 'Resume not found.' });
  });
});

module.exports = router;