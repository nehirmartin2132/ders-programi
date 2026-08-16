# Ders Programı Oluşturucu

Zorunlu derslerini ve seçmeli ders havuzunu ekle, kaç seçmeli ders almak istediğini belirle — uygulama çakışmayan tüm olası haftalık programları üretir.

## Yapı

- `backend/` — Express + SQLite REST API (ders CRUD, program oluşturma)
- `frontend/` — React (Vite) arayüzü

## Çalıştırma

### Backend

```bash
cd backend
npm install
npm start
```

`http://localhost:4000` üzerinde ayağa kalkar. Veriler `backend/data.sqlite` dosyasında saklanır.

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
