# LinkHub — Branded Short-Link & Bio-Link Hub

A URL shortening engine with custom vanity slugs, click analytics, and a customizable "Link-in-Bio" profile page — built as a Bitly + Linktree hybrid.

## Tech Stack

- **Backend:** Python, FastAPI
- **Database:** SQLite + SQLAlchemy ORM
- **Auth:** JWT (access + refresh token pair), bcrypt password hashing
- **Other:** slowapi (rate limiting), qrcode (QR generation), user-agents (device detection)

## Features

- Signup/login with pair-token JWT auth (15-min access token, 7-day refresh token in httpOnly cookie)
- Email verification & password reset (simulated via console log — see note below)
- Short link creation — auto-generated 6-character codes or custom vanity slugs
- High-speed redirect engine (`GET /r/:shortCode`) with asynchronous click logging
- Click analytics — total clicks, clicks over time, device breakdown, top referrers
- Link library with search, pagination, and QR code generation
- Bio-Link Hub — public profile page (`/bio/:username`) with theme selection and social links
- Rate limiting on link-creation and redirect routes

## Setup Instructions

1. Clone the repo and navigate into it:
```bash
   git clone <your-repo-url>
   cd linkhub
```

2. Create and activate a virtual environment:
```bash
   python -m venv venv
   venv\Scripts\activate      # Windows
```

3. Install dependencies:
```bash
   pip install -r requirements.txt
```

4. Copy `.env.example` to `.env` and fill in values:
```bash
   copy .env.example .env
```
   Generate a secure `JWT_SECRET_KEY`:
```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
```

5. Run the server:
```bash
   uvicorn app.main:app --reload
```

6. Open the interactive API docs:
http://127.0.0.1:8000/docs


## Database

SQLite is used for simplicity (`linkhub.db`, auto-created on first run). Tables: `users`, `links`, `clicks`, `social_links`.

## Assumptions & Limitations

- Email verification and password reset emails are **simulated** (printed to console) rather than actually sent, per assessment scope.
- SQLite is used instead of a production database for simplicity; the code uses SQLAlchemy ORM so switching to PostgreSQL/MySQL only requires changing `DATABASE_URL`.
- QR codes are generated on-demand and not stored/cached.

## Frontend

- **Tech:** React (Vite), Tailwind CSS v4, React Router, Axios, Recharts
- **Location:** `/frontend`

### Frontend Setup

1. Navigate to the frontend folder:
```bash
   cd frontend
```
2. Install dependencies:
```bash
   npm install
```
3. Run the dev server:
```bash
   npm run dev
```
4. Open `http://localhost:5173`

### Frontend Pages
- `/` — Landing page
- `/login`, `/signup` — Auth
- `/dashboard` — Link creation, list, QR code, delete (protected)
- `/dashboard/analytics/:linkId` — Per-link analytics with charts (protected)
- `/dashboard/bio` — Bio profile editor (protected)
- `/bio/:username` — Public bio page (no login required)