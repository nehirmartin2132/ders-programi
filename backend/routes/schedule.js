import { Router } from 'express';
import db from '../db.js';
import { generateSchedules } from '../scheduler.js';

const router = Router();

router.post('/generate', (req, res) => {
  const electiveCount = Number(req.body.electiveCount);
  if (!Number.isInteger(electiveCount) || electiveCount < 0) {
    return res.status(400).json({ error: 'electiveCount negatif olmayan bir tam sayı olmalı.' });
  }

  const rows = db.prepare('SELECT * FROM courses ORDER BY created_at ASC').all();
  const courses = rows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    color: row.color,
    sessions: JSON.parse(row.sessions),
  }));

  const result = generateSchedules(courses, electiveCount);
  if (result.error) return res.status(400).json({ error: result.error });
  res.json({ schedules: result.schedules });
});

export default router;
