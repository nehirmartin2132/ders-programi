# Ders Programı Oluşturucu

Zorunlu derslerini ve seçmeli ders havuzunu ekle, kaç seçmeli ders almak istediğini belirle — uygulama çakışmayan tüm olası haftalık programları üretir.

## Yapı

- `backend/` — Express + PostgreSQL REST API (ders CRUD, program oluşturma)
- `frontend/` — React (Vite) arayüzü

## Çalıştırma

### Backend

Bir PostgreSQL veritabanına ihtiyacın var (örn. [Neon](https://neon.tech) üzerinde ücretsiz bir proje açıp bağlantı adresini alabilirsin).

```bash
cd backend
npm install
DATABASE_URL="postgres://kullanici:sifre@host/veritabani?sslmode=require" npm start
```

`http://localhost:4000` üzerinde ayağa kalkar. Tablolar ilk çalıştırmada otomatik oluşturulur.

### Deploy (Render + Neon)

1. [neon.tech](https://neon.tech) üzerinde ücretsiz bir proje aç, bağlantı adresini (connection string) kopyala.
2. Render'da "New +" → "Blueprint" ile bu repoyu bağla; `render.yaml` iki servisi (backend + frontend) otomatik kuracak.
3. Backend servisinin `DATABASE_URL` değişkenine Neon'dan aldığın bağlantı adresini yapıştır.
4. Backend deploy olduktan sonra aldığı `https://ders-programi-backend.onrender.com` gibi adresi, frontend servisinin `VITE_API_URL` değişkenine `https://ders-programi-backend.onrender.com/api` şeklinde gir ve frontend'i yeniden deploy et.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

`http://localhost:5173` üzerinde açılır ve `/api` isteklerini backend'e proxy'ler (bkz. `vite.config.js`).

## API

- `GET /api/courses` — tüm dersleri listele
- `POST /api/courses` — `{ name, type: "required"|"elective", sessions: [{ day, start, end }] }`
- `DELETE /api/courses/:id`
- `POST /api/schedule/generate` — `{ electiveCount }` → çakışmayan tüm program kombinasyonları
