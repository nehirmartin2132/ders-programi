import { useState } from 'react';

const DAY_FULL = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

function emptySession() {
  return { day: 0, start: '09:00', end: '10:30' };
}

export default function CourseForm({ onSubmit, submitting }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('required');
  const [sessions, setSessions] = useState([emptySession()]);
  const [error, setError] = useState('');

  function updateSession(index, patch) {
    setSessions((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }
  function removeSession(index) {
    setSessions((prev) => prev.filter((_, i) => i !== index));
  }
  function addSession() {
    setSessions((prev) => [...prev, emptySession()]);
  }

  async function handleSubmit() {
    setError('');
    if (!name.trim()) return setError('Lütfen ders adı gir.');
    if (sessions.length === 0) return setError('En az bir ders saati ekle.');
    for (const s of sessions) {
      if (s.end <= s.start) return setError('Bitiş saati başlangıçtan sonra olmalı.');
    }
    try {
      await onSubmit({ name: name.trim(), type, sessions });
      setName('');
      setType('required');
      setSessions([emptySession()]);
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="card">
      <h2>Ders Ekle</h2>
      <div className="row">
        <div>
          <label>Ders Adı</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="örn. Lineer Cebir"
          />
        </div>
      </div>

      <label>Tür</label>
      <div className="type-toggle">
        <label className={type === 'required' ? 'active' : ''}>
          <input type="radio" checked={type === 'required'} onChange={() => setType('required')} />
          <span>Zorunlu</span>
        </label>
        <label className={type === 'elective' ? 'active' : ''}>
          <input type="radio" checked={type === 'elective'} onChange={() => setType('elective')} />
          <span>Seçmeli</span>
        </label>
      </div>

      <label>Ders Saatleri</label>
      {sessions.map((s, i) => (
        <div className="session-row" key={i}>
          <select value={s.day} onChange={(e) => updateSession(i, { day: Number(e.target.value) })}>
            {DAY_FULL.map((d, idx) => (
              <option key={idx} value={idx}>{d}</option>
            ))}
          </select>
          <input type="time" value={s.start} onChange={(e) => updateSession(i, { start: e.target.value })} />
          <input type="time" value={s.end} onChange={(e) => updateSession(i, { end: e.target.value })} />
          <button type="button" className="remove-x" title="Kaldır" onClick={() => removeSession(i)}>✕</button>
        </div>
      ))}
      <button className="btn btn-secondary" type="button" onClick={addSession} style={{ marginBottom: 14 }}>
        + Saat Ekle
      </button>

      {error && <div className="warning">{error}</div>}

      <button className="btn btn-primary btn-block" type="button" onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Kaydediliyor…' : 'Dersi Kaydet'}
      </button>
    </div>
  );
}
