import { useState } from 'react';

const DAY_FULL = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

function emptySession() {
  return { day: 0, start: '09:00', end: '10:30' };
}
function emptySection() {
  return { sessions: [emptySession()] };
}

export default function CourseForm({ onSubmit, submitting }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('required');
  const [sections, setSections] = useState([emptySection()]);
  const [error, setError] = useState('');

  function updateSession(sectionIdx, sessionIdx, patch) {
    setSections((prev) =>
      prev.map((sec, si) =>
        si !== sectionIdx
          ? sec
          : { sessions: sec.sessions.map((s, i) => (i === sessionIdx ? { ...s, ...patch } : s)) }
      )
    );
  }
  function addSession(sectionIdx) {
    setSections((prev) =>
      prev.map((sec, si) => (si !== sectionIdx ? sec : { sessions: [...sec.sessions, emptySession()] }))
    );
  }
  function removeSession(sectionIdx, sessionIdx) {
    setSections((prev) =>
      prev.map((sec, si) =>
        si !== sectionIdx ? sec : { sessions: sec.sessions.filter((_, i) => i !== sessionIdx) }
      )
    );
  }
  function addSection() {
    setSections((prev) => [...prev, emptySection()]);
  }
  function removeSection(sectionIdx) {
    setSections((prev) => prev.filter((_, i) => i !== sectionIdx));
  }

  function resetForm() {
    setName('');
    setType('required');
    setSections([emptySection()]);
  }

  async function handleSubmit() {
    setError('');
    if (!name.trim()) return setError('Lütfen ders adı gir.');
    if (sections.length === 0) return setError('En az bir şube gerekli.');
    for (const sec of sections) {
      if (sec.sessions.length === 0) return setError('Her şubede en az bir saat olmalı.');
      for (const s of sec.sessions) {
        if (s.end <= s.start) return setError('Bitiş saati başlangıçtan sonra olmalı.');
      }
    }
    try {
      if (type === 'elective') {
        await onSubmit({ name: name.trim(), type, sessions: sections[0].sessions });
      } else {
        await onSubmit({ name: name.trim(), type, sections });
      }
      resetForm();
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
          <input
            type="radio"
            checked={type === 'required'}
            onChange={() => setType('required')}
          />
          <span>Zorunlu</span>
        </label>
        <label className={type === 'elective' ? 'active' : ''}>
          <input
            type="radio"
            checked={type === 'elective'}
            onChange={() => {
              setType('elective');
              setSections((prev) => [prev[0] ?? emptySection()]);
            }}
          />
          <span>Seçmeli</span>
        </label>
      </div>

      {type === 'required' ? (
        <>
          <label>Şubeler</label>
          <p className="hint">
            Bu dersin birden fazla şubesi (grubu) varsa hepsini ekle — program oluşturucu her seferinde
            çakışmayan bir şube seçecek.
          </p>
          {sections.map((sec, si) => (
            <div className="section-block" key={si}>
              <div className="section-block-header">
                <span>Şube {si + 1}</span>
                {sections.length > 1 && (
                  <button type="button" className="remove-x" title="Şubeyi kaldır" onClick={() => removeSection(si)}>
                    ✕
                  </button>
                )}
              </div>
              {sec.sessions.map((s, i) => (
                <div className="session-row" key={i}>
                  <select value={s.day} onChange={(e) => updateSession(si, i, { day: Number(e.target.value) })}>
                    {DAY_FULL.map((d, idx) => (
                      <option key={idx} value={idx}>{d}</option>
                    ))}
                  </select>
                  <input type="time" value={s.start} onChange={(e) => updateSession(si, i, { start: e.target.value })} />
                  <input type="time" value={s.end} onChange={(e) => updateSession(si, i, { end: e.target.value })} />
                  {sec.sessions.length > 1 && (
                    <button type="button" className="remove-x" title="Kaldır" onClick={() => removeSession(si, i)}>
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-small" onClick={() => addSession(si)}>
                + Saat Ekle
              </button>
            </div>
          ))}
          <button className="btn btn-secondary" type="button" onClick={addSection} style={{ marginBottom: 14 }}>
            + Şube Ekle
          </button>
        </>
      ) : (
        <>
          <label>Ders Saatleri</label>
          {sections[0].sessions.map((s, i) => (
            <div className="session-row" key={i}>
              <select value={s.day} onChange={(e) => updateSession(0, i, { day: Number(e.target.value) })}>
                {DAY_FULL.map((d, idx) => (
                  <option key={idx} value={idx}>{d}</option>
                ))}
              </select>
              <input type="time" value={s.start} onChange={(e) => updateSession(0, i, { start: e.target.value })} />
              <input type="time" value={s.end} onChange={(e) => updateSession(0, i, { end: e.target.value })} />
              {sections[0].sessions.length > 1 && (
                <button type="button" className="remove-x" title="Kaldır" onClick={() => removeSession(0, i)}>
                  ✕
                </button>
              )}
            </div>
          ))}
          <button className="btn btn-secondary" type="button" onClick={() => addSession(0)} style={{ marginBottom: 14 }}>
            + Saat Ekle
          </button>
        </>
      )}

      {error && <div className="warning">{error}</div>}

      <button className="btn btn-primary btn-block" type="button" onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Kaydediliyor…' : 'Dersi Kaydet'}
      </button>
    </div>
  );
}
