import express from 'express';
import cors from 'cors';
import coursesRouter from './routes/courses.js';
import scheduleRouter from './routes/schedule.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/courses', coursesRouter);
app.use('/api/schedule', scheduleRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Sunucu hatası.' });
});

app.listen(PORT, () => {
  console.log(`Ders Programı API http://localhost:${PORT} üzerinde çalışıyor`);
});
