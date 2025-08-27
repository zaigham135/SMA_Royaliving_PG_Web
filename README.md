# PG Student Manager (React + Node.js + SQLite + Excel Export)

This repository contains a full-stack sample application to manage PG/hostel students.

Contents:
- server/ — Node.js + Express API (stores data in SQLite)
- client/ — React (Vite) frontend

Quick start
1) Ensure Node.js v18+ is installed.
2) Start the server:

```powershell
cd server
copy .env.example .env    # on PowerShell; use cp on Unix
npm install
npm run start
# for development: npm run dev
```

The API runs on http://localhost:3001 by default.

Start the client in another terminal:

```powershell
cd client
npm install
npm run dev
```

The app will open at http://localhost:5173.

If your server runs on a different host/port, update `client/.env`:

```
VITE_API_URL=http://your-server:3001
```

API endpoints (server)
- `GET /api/students` — list students
- `POST /api/students` — create student (JSON body: { name, phone, room, join_date, fee_due, notes })
- `PUT /api/students/:id` — update student
- `DELETE /api/students/:id` — delete student
- `GET /api/export` — download Excel file
- `POST /api/seed` — add sample data

Production notes
- In production run `npm run start` under `server/`. The SQLite file is `server/data/pg.db`.
- Put a reverse proxy (Nginx) and HTTPS in front of the server for production.
- Back up `server/data/pg.db` regularly.

اردو ہدایت (مختصر)

یہ پروجیکٹ ایک سادہ Full‑Stack ایپ ہے جس میں React فرنٹ اینڈ اور Node.js/Express بیک اینڈ شامل ہے۔
سرور SQLite فائل میں ڈیٹا رکھتا ہے، اور فرنٹ اینڈ Vite+React پر چلتا ہے۔

چلانے کے لیے:
1) `server` فولڈر میں جا کر `.env` بنائیں، `npm install` اور `npm run start` چلائیں。
2) `client` فولڈر میں جا کر `npm install` اور `npm run dev` چلائیں۔

خوش رہیے!
