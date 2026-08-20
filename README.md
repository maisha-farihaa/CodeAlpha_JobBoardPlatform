# Job Board Platform

A backend project for posting jobs and applying to them, built with Node.js, Express, and SQLite as part of the CodeAlpha Backend Development Internship.

## What it does

- Employers can post job listings with title, description, location, type, and salary range
- Anyone can search jobs by keyword or location
- Candidates can apply to a job with their name, email, an optional cover letter, and a resume file
- Prevents the same person from applying twice to the same job
- Candidates can look up their applications and see the current status
- Employers can view applicants for a job and update an application's status
- Employers can remove their own job listing

## Built with

- Node.js and Express
- SQLite (through the sql.js package)
- Multer for handling resume uploads
- Plain HTML, CSS, and JavaScript for the frontend

## Getting started

1. Install the dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Open your browser and go to:
   ```
   http://localhost:5000
   ```

The database file and uploads folder are created automatically the first time you run the app.

## API

**GET /api/jobs?search=&location=&job_type=**
Returns jobs, optionally filtered by keyword, location, or job type.

**GET /api/jobs/:id**
Returns one job, including how many people applied.

**POST /api/jobs**
Posts a new job.
```
{ "employer_name": "TechCorp", "employer_email": "hr@techcorp.com", "title": "Backend Developer", "location": "Dhaka", "job_type": "Full-time" }
```

**DELETE /api/jobs/:id**
Removes a job listing.

**POST /api/jobs/:id/apply**
Applies to a job. Sent as form data so a resume file can be attached.
Fields: `candidate_name`, `candidate_email`, `cover_letter` (optional), `resume` (optional file)

**GET /api/applications?email=someone@example.com**
Returns all applications tied to that email, with their status.

**GET /api/jobs/:id/applications**
Returns all applicants for one job.

**PATCH /api/applications/:id/status**
Updates an application's status. Must be one of: applied, reviewed, accepted, rejected.
```
{ "status": "reviewed" }
```

**GET /api/resumes/:filename**
Downloads a submitted resume file.

## Notes

- The same email cannot apply twice to the same job.
- Resume upload is optional when applying.
- Made for Task 4 of the CodeAlpha Backend Development Internship.
