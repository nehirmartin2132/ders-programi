import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false },
});

const { rows: existingColumns } = await pool.query(`
  SELECT column_name FROM information_schema.columns WHERE table_name = 'courses'
`);
const columnNames = existingColumns.map((c) => c.column_name);

if (columnNames.length === 0) {
  await pool.query(`
    CREATE TABLE courses (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('required', 'elective')),
      color TEXT NOT NULL,
      sections JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
} else if (!columnNames.includes('sections')) {
  // Migrate legacy single-section schema (a flat `sessions` column) into the
  // new multi-section shape, wrapping the old sessions as one section so no
  // existing data is lost.
  await pool.query('ALTER TABLE courses ADD COLUMN sections JSONB');
  await pool.query(`
    UPDATE courses SET sections = jsonb_build_array(jsonb_build_object('sessions', sessions))
  `);
  await pool.query('ALTER TABLE courses ALTER COLUMN sections SET NOT NULL');
  await pool.query('ALTER TABLE courses DROP COLUMN sessions');
}

export default pool;
