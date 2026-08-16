const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

function sectionLabel(sessions) {
  return sessions.map((s) => `${DAYS[s.day]} ${s.start}-${s.end}`).join(', ');
}

export default function CourseList({ courses, onDelete }) {
  return (
    <div className="card">
      <h2>Eklenen Dersler</h2>
      {courses.length === 0 ? (
        <div className="empty-state">Henüz ders eklenmedi.</div>
      ) : (
        <div className="course-list">
          {courses.map((c) => (
            <div className="course-item" key={c.id}>
              <div className="info">
                <div>
                  <span className={`badge ${c.type === 'required' ? 'badge-required' : 'badge-elective'}`}>
                    {c.type === 'required' ? 'Zorunlu' : 'Seçmeli'}
                  </span>
                  <strong>{c.name}</strong>
                </div>
                {c.sections.length > 1 ? (
                  <div className="sessions">
                    {c.sections.map((sec, i) => (
                      <div key={i}>Şube {i + 1}: {sectionLabel(sec.sessions)}</div>
                    ))}
                  </div>
                ) : (
                  <div className="sessions">{sectionLabel(c.sections[0].sessions)}</div>
                )}
              </div>
              <button type="button" className="remove-x" title="Sil" onClick={() => onDelete(c.id)}>🗑</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
