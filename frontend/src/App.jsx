import { useEffect, useState } from 'react';
import { api } from './api.js';
import CourseForm from './components/CourseForm.jsx';
import CourseList from './components/CourseList.jsx';
import ScheduleView from './components/ScheduleView.jsx';

export default function App() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [electiveCount, setElectiveCount] = useState(1);
  const [schedules, setSchedules] = useState(null);
  const [scheduleError, setScheduleError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    setLoading(true);
    setLoadError('');
    try {
      const data = await api.getCourses();
      setCourses(data);
    } catch (e) {
      setLoadError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateCourse(course) {
    setSubmitting(true);
    try {
      const created = await api.createCourse(course);
      setCourses((prev) => [...prev, created]);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteCourse(id) {
    await api.deleteCourse(id);
    setCourses((prev) => prev.filter((c) => c.id !== id));
    setSchedules(null);
  }

  async function handleGenerate() {
    setScheduleError('');
    setSchedules(null);
    try {
      const { schedules } = await api.generateSchedules(Number(electiveCount));
      setSchedules(schedules);
      setCurrentIndex(0);
    } catch (e) {
      setScheduleError(e.message);
    }
  }

  return (
    <div className="container">
      <h1>Ders Programı Oluşturucu</h1>
      <p className="subtitle">
        Zorunlu derslerini ve seçmeli ders havuzunu ekle, kaç seçmeli ders almak istediğini belirle
        — çakışmayan tüm olası programları gör.
      </p>

      <div className="grid-2">
        <div>
          <CourseForm onSubmit={handleCreateCourse} submitting={submitting} />
          {loading ? (
            <div className="card"><div className="empty-state">Yükleniyor…</div></div>
          ) : loadError ? (
            <div className="card"><div className="warning">{loadError}</div></div>
          ) : (
            <CourseList courses={courses} onDelete={handleDeleteCourse} />
          )}
        </div>

        <div>
          <div className="card">
            <h2>Program Ayarları</h2>
            <div className="config-row">
              <div>
                <label>Kaç seçmeli ders almak istiyorsun?</label>
                <input
                  type="number"
                  min="0"
                  value={electiveCount}
                  onChange={(e) => setElectiveCount(e.target.value)}
                />
              </div>
              <div>
                <button className="btn btn-primary" type="button" onClick={handleGenerate}>
                  Programları Oluştur
                </button>
              </div>
            </div>
          </div>

          {scheduleError && (
            <div className="card"><div className="warning">{scheduleError}</div></div>
          )}

          {schedules && (
            <div className="card">
              <div className="result-header">
                <h2 style={{ margin: 0 }}>Olası Programlar</h2>
                {schedules.length > 0 && (
                  <div className="result-nav">
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => setCurrentIndex((i) => (i - 1 + schedules.length) % schedules.length)}
                    >
                      ‹ Önceki
                    </button>
                    <span>{currentIndex + 1} / {schedules.length}</span>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => setCurrentIndex((i) => (i + 1) % schedules.length)}
                    >
                      Sonraki ›
                    </button>
                  </div>
                )}
              </div>
              {schedules.length === 0 ? (
                <div className="warning">
                  Çakışmayan bir kombinasyon bulunamadı. Ders saatlerini veya seçmeli ders sayısını gözden geçir.
                </div>
              ) : (
                <ScheduleView schedule={schedules[currentIndex]} />
              )}
            </div>
          )}
        </div>
      </div>

      <footer>Veriler backend API üzerinden saklanır.</footer>
    </div>
  );
}
