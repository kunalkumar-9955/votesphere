# VoteSphere Biometric — Fingerprint Smart Voting Platform

> Production-ready, full-stack biometric voting platform. WebAuthn fingerprint authentication, AI fraud detection, and end-to-end encryption.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![WebAuthn](https://img.shields.io/badge/WebAuthn-FIDO2-blue)](https://webauthn.io)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwindcss)](https://tailwindcss.com)

---

## What's New — Biometric Upgrade

| Feature | Status |
|---|---|
| WebAuthn Fingerprint Registration | ✅ |
| Biometric Vote Confirmation Flow | ✅ |
| Device Manager (add/remove devices) | ✅ |
| Fingerprint Scanner Animation | ✅ |
| Biometric Security Logs (Admin) | ✅ |
| 3-Step Vote Flow (select → biometric → confirm) | ✅ |
| Biometric enrollment prompt on voter dashboard | ✅ |
| Touch ID / Windows Hello / Android fingerprint | ✅ |
| Fallback to OTP when biometrics unavailable | ✅ |

---

## Full Feature List

| Feature | Status |
|---|---|
| JWT + OTP + Biometric Auth | ✅ |
| Real SMTP Email Delivery | ✅ |
| 10 Election Types | ✅ |
| 3-Tier Role System | ✅ |
| One-Person-One-Vote | ✅ |
| Anonymous Voting | ✅ |
| Multi-Choice Voting | ✅ |
| Live Turnout Stats | ✅ |
| AI Fraud Detection | ✅ |
| PDF Report Generation | ✅ |
| Audit Logs | ✅ |
| Organization Invite Codes | ✅ |
| Vote Receipts | ✅ |
| Interactive Analytics Charts | ✅ |
| Skeleton Loading States | ✅ |
| Framer Motion Animations | ✅ |
| Dark Mode UI | ✅ |
| Fully Responsive | ✅ |
| Results Page with Charts | ✅ |
| Notifications System | ✅ |

---

## Tech Stack

**Backend:** FastAPI · SQLAlchemy · SQLite/PostgreSQL · JWT · bcrypt · pandas · scikit-learn · ReportLab  
**Frontend:** Next.js 14 · TypeScript · Tailwind CSS · Framer Motion · Recharts · Zustand · Zod  
**Auth:** JWT + OTP (SMTP email) + WebAuthn biometric  
**Biometric:** Web Authentication API (FIDO2/WebAuthn) — Touch ID, Windows Hello, Android fingerprint

---

## Quick Start

### Backend

```bash
cd votesphere/backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
pip install "bcrypt==4.0.1"    # pin for passlib compatibility
cp .env.example .env           # edit DATABASE_URL if needed
python seed.py
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd votesphere/frontend
npm install
# .env.local already set to http://localhost:8000/api
node_modules\.bin\next.cmd dev --port 3000
```

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | admin@votesphere.com | Admin@123 |
| Org Admin | rajesh@college.edu | Admin@123 |
| Voter | student1@college.edu | Voter@123 |

---

## Biometric Voting Flow

1. **Enroll** — Go to Voter Dashboard → Biometric Devices → Add Device
2. **Vote** — Click "Vote Now" on any active election
3. **Select** — Choose your candidate(s)
4. **Verify** — Touch your fingerprint sensor when prompted
5. **Confirm** — Review and submit your vote
6. **Receipt** — Copy your cryptographic vote receipt

### Supported Biometric Devices
- **Windows** — Windows Hello (fingerprint, face, PIN)
- **Mac** — Touch ID
- **Android** — Fingerprint sensor (Chrome/Edge)
- **iPhone** — Face ID / Touch ID (Safari)

### Fallback
If biometrics are unavailable, voters can skip biometric verification and vote with just their session (less secure, flagged in audit logs).

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register | Register + send OTP |
| POST | /api/auth/login | Login + JWT tokens |
| POST | /api/auth/verify-otp | Verify email OTP |
| POST | /api/auth/refresh | Refresh access token |
| GET | /api/biometric/register/challenge | WebAuthn registration challenge |
| POST | /api/biometric/register/verify | Store biometric credential |
| GET | /api/biometric/authenticate/challenge | WebAuthn auth challenge |
| POST | /api/biometric/authenticate/verify | Verify biometric assertion |
| GET | /api/biometric/credentials | List enrolled devices |
| DELETE | /api/biometric/credentials/{id} | Remove device |
| GET | /api/biometric/fraud-logs | Biometric security events |
| POST | /api/elections/vote | Cast vote (with biometric flag) |
| GET | /api/elections/{id}/turnout | Live turnout |
| GET | /api/elections/results/{id} | Published results |
| GET | /api/analytics/dashboard/stats | Platform stats |
| GET | /api/analytics/fraud/reports | AI fraud analysis |

Full docs: http://localhost:8000/api/docs

---

## Pages

| URL | Description |
|---|---|
| / | Landing page with fingerprint hero animation |
| /login | Login with demo credential quick-fill |
| /register | Register + animated OTP verification |
| /biometric/enroll | Fingerprint enrollment + device manager |
| /dashboard/admin | Super admin overview with live charts |
| /dashboard/admin/analytics | Vote trends, type distribution |
| /dashboard/admin/fraud | AI fraud detection panel |
| /dashboard/admin/biometric | Biometric security logs |
| /dashboard/admin/users | User management + suspend |
| /dashboard/admin/organizations | Org approval panel |
| /dashboard/admin/logs | Full audit trail |
| /dashboard/org | Org admin overview |
| /dashboard/org/elections | All elections with filters |
| /dashboard/org/elections/create | Create new election |
| /dashboard/org/elections/[id] | Manage election (candidates, turnout, results) |
| /dashboard/org/members | Members + invite codes |
| /dashboard/org/reports | PDF export + results links |
| /dashboard/voter | Voter dashboard with biometric status |
| /dashboard/voter/elections | Active elections list |
| /dashboard/voter/history | Vote history with receipts |
| /dashboard/voter/devices | Biometric device manager |
| /dashboard/voter/organizations | Joined orgs + join by code |
| /vote/[id] | 3-step biometric voting flow |
| /results/[id] | Election results with charts |

---

## Deployment

### Backend → Render
```
Build: pip install -r requirements.txt && pip install "bcrypt==4.0.1"
Start: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Env: DATABASE_URL, SECRET_KEY, SMTP_USER, SMTP_PASSWORD
```

### Frontend → Vercel
```
Root: votesphere/frontend
Env: NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api
```

### Database → Supabase/Neon (PostgreSQL)
Change `.env` `DATABASE_URL` to your PostgreSQL connection string.
SQLite is used for local development automatically.
