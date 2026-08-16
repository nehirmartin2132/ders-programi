import { Router } from 'express';
import db from '../db.js';

const router = Router();

const COLORS = ['#4f46e5', '#0891b2', '#16a34a', '#ca8a04', '#dc2626', '#7c3aed', '#db2777', '#059669', '#ea580c', '#2563eb'];

function rowToCourse(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    color: row.color,
    sessions: JSON.parse(row.sessions),
  };
}

function validateSessions(sessions) {
  if (!Array.isArray(sessions) || sessions.length === 0) return 'En az bir ders saati gerekli.';
  for (const s of sessions) {
    if (typeof s.day !== 'number' || s.day < 0 || s.day > 5) return 'Geçersiz gün.';
    if (!/^\d{2}:\d{2}$/.test(s.start) || !/^\d{2}:\d{2}$/.test(s.end)) return 'Geçersiz saat formatı.';
    const [sh, sm] = s.start.split(':').map(Number);
    const [eh, em] = s.end.split(':').map(Number);
    if (eh * 60 + em <= sh * 60 + sm) return 'Bitiş saati başlangıçtan sonra olmalı.';
  }
  return null;
}

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM courses ORDER BY created_at ASC').all();
  res.json(rows.map(rowToCourse));
});

router.post('/', (req, res) => {
  const { name, type, sessions } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Ders adı gerekli.' });
  }
  if (type !== 'required' && type !== 'elective') {
    return res.status(400).json({ error: 'Tür "required" veya "elective" olmalı.' });
  }
  const sessionError = validateSessions(sessions);
  if (sessionError) return res.status(400).json({ error: sessionError });

  const count = db.prepare('SELECT COUNT(*) as c FROM courses').get().c;
  const color = COLORS[count % COLORS.length];

  const result = db
    .prepare('INSERT INTO courses (name, type, color, sessions) VALUES (?, ?, ?, ?)')
    .run(name.trim(), type, color, JSON.stringify(sessions));

  const row = db.prepare('SELECT * FROM courses WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(rowToCourse(row));
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM courses WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Ders bulunamadı.' });
  res.status(204).end();
});

export default router;
