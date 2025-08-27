<<<<<<< HEAD
# PG Student Manager — Server

## Install & Run
=======
# PG Student Manager (React + Node.js + SQLite + Excel Export)

**اردو ہدایت**

یہ ایک سادہ سا مکمل نظام (Full‑Stack) ہے جس سے آپ اپنے PG میں رہنے والے اسٹوڈنٹس کا ڈیٹا محفوظ، اپڈیٹ، ڈلیٹ اور ایکسپورٹ (Excel) کر سکتے ہیں۔  
سرور Node.js/Express پر ہے اور ڈیٹا SQLite فائل میں اسٹور ہوتا ہے، اس لئے کوئی الگ ڈیٹا بیس سرور لگانے کی ضرورت نہیں۔ فرنٹ اینڈ React (Vite) میں ہے۔

## کیسے چلائیں؟
1) Node.js انسٹال ہو (v18+ بہتر ہے)۔
2) ایک ٹرمینل کھولیں:
>>>>>>> 8c84934 (Remove embedded server repo from parent index and ignore server/)
```bash
cd server
cp .env.example .env
npm install
npm run start
<<<<<<< HEAD
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
=======
```
- سرور `http://localhost:3001` پر چلے گا۔

3) دوسرا ٹرمینل کھولیں اور فرنٹ اینڈ چلائیں:
```bash
cd client
npm install
npm run dev
```
- ایپ `http://localhost:5173` پر اوپن کریں۔

> اگر آپ کا سرور کسی اور پورٹ/ڈومین پر ہے تو `client/.env` میں یہ رکھیں:
```
VITE_API_URL=http://your-server:3001
```

## فیچرز
- طلبہ کا ریکارڈ: نام، فون، روم، شامل ہونے کی تاریخ، بقایا فیس، نوٹس
- تلاش/فلٹر
- شامل/اپڈیٹ/ڈلیٹ
- ایک کلک میں **Excel** ایکسپورٹ (`Export Excel` بٹن)
- **Sample** ڈیٹا شامل کرنے کا بٹن (ٹیسٹنگ کیلئے)

## پروڈکشن کیلئے نوٹس
- سرور پر `npm run start` سے Express چلے گا اور `./server/data/pg.db` میں ڈیٹا بنے گا۔
- کسی VPS/EC2 پر ڈپلائے کرتے وقت **Nginx** کے ساتھ ریورس پراکسی لگا دیں اور **HTTPS** لگا لیں۔
- بیک اپ کیلئے `server/data/pg.db` فائل کو محفوظ رکھیں۔

خوش رہیے! 🙌
>>>>>>> 8c84934 (Remove embedded server repo from parent index and ignore server/)
