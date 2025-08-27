# PG Student Manager — Server

## Install & Run
```bash
cd server
cp .env.example .env
npm install
npm run start
# or for dev:
npm run dev
```
API runs on http://localhost:3001 by default.

## API
- `GET /api/students` — list
- `POST /api/students` — create (JSON body: { name, phone, room, join_date, fee_due, notes })
- `PUT /api/students/:id` — update
- `DELETE /api/students/:id` — delete
- `GET /api/export` — download Excel file
- `POST /api/seed` — add sample data
