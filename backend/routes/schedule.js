import { Router } from 'express';
import pool from '../db.js';
import { generateSchedules } from '../scheduler.js';

const router = Router();

router.post('/generate', async (req, res, next) => {
  try {
    const electiveCount = Number(req.body.electiveCount);
    if (!Number.isInteger(electiveCount) || electiveCount < 0) {
      return res.status(400).json({ error: 'electiveCount negatif olmayan bir tam sayı olmalı.' });
    }

    const { rows } = await pool.query('SELECT * FROM courses ORDER BY created_at ASC');
    const courses = rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      color: row.color,
      sections: row.sections,
    }));

    const result = generateSchedules(courses, electiveCount);
    if (result.error) return res.status(400).json({ error: result.error });
    res.json({ schedules: result.schedules });
  } catch (err) {
    next(err);
  }
});

export default router;
