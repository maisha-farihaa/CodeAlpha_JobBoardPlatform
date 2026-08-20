require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { initDb } = require('./db');
const jobRoutes = require('./routes/jobs');
const applicationRoutes = require('./routes/applications');

const app = express();
const PORT = process.env.PORT || 5000;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

app.use('/api/jobs', jobRoutes);
app.use('/api', applicationRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Job Board server running on http://localhost:${PORT}`);
  });
});
