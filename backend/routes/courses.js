import { Router } from 'express';
import pool from '../db.js';

const router = Router();

const COLORS = ['#4f46e5', '#0891b2', '#16a34a', '#ca8a04', '#dc2626', '#7c3aed', '#db2777', '#059669', '#ea580c', '#2563eb'];

function rowToCourse(row) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    color: row.color,
    sessions: row.sessions,
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

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM courses ORDER BY created_at ASC');
    res.json(rows.map(rowToCourse));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, type, sessions } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Ders adı gerekli.' });
    }
    if (type !== 'required' && type !== 'elective') {
      return res.status(400).json({ error: 'Tür "required" veya "elective" olmalı.' });
    }
    const sessionError = validateSessions(sessions);
    if (sessionError) return res.status(400).json({ error: sessionError });

    const { rows: countRows } = await pool.query('SELECT COUNT(*)::int AS c FROM courses');
    const color = COLORS[countRows[0].c % COLORS.length];

    const { rows } = await pool.query(
      'INSERT INTO courses (name, type, color, sessions) VALUES ($1, $2, $3, $4) RETURNING *',
      [name.trim(), type, color, JSON.stringify(sessions)]
    );
    res.status(201).json(rowToCourse(rows[0]));
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM courses WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Ders bulunamadı.' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
