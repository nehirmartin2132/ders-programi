import { Fragment } from 'react';

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const SLOT_HEIGHT = 32; // px per 30 minutes
const HEADER_HEIGHT = 36;

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export default function ScheduleView({ schedule }) {
  let minMin = 24 * 60;
  let maxMin = 0;
  schedule.forEach((c) =>
    c.sessions.forEach((s) => {
      minMin = Math.min(minMin, timeToMinutes(s.start));
      maxMin = Math.max(maxMin, timeToMinutes(s.end));
    })
  );
  if (schedule.length === 0 || minMin > maxMin) {
    minMin = 8 * 60;
    maxMin = 18 * 60;
  }
  minMin = Math.floor(minMin / 60) * 60;
  maxMin = Math.ceil(maxMin / 60) * 60;
  if (maxMin - minMin < 60) maxMin = minMin + 60;

  const totalSlots = (maxMin - minMin) / 30;

  return (
    <>
      <div className="legend">
        {schedule.map((c) => (
          <span key={c.id} style={{ background: c.color }}>
            {c.name}{c.type === 'elective' ? ' (S)' : ''}
          </span>
        ))}
      </div>

      <div
        className="schedule-grid"
        style={{ gridTemplateRows: `${HEADER_HEIGHT}px repeat(${totalSlots}, ${SLOT_HEIGHT}px)` }}
      >
        <div className="head" />
        {DAYS.map((d) => (
          <div className="head" key={d}>{d}</div>
        ))}

        {Array.from({ length: totalSlots }).map((_, slot) => {
          const mins = minMin + slot * 30;
          const label = mins % 60 === 0 ? `${String(Math.floor(mins / 60)).padStart(2, '0')}:00` : '';
          return (
            <Fragment key={`row-${slot}`}>
              <div className="time-label">{label}</div>
              {DAYS.map((_, d) => (
                <div className="cell" key={`c-${slot}-${d}`} />
              ))}
            </Fragment>
          );
        })}

        {schedule.flatMap((c) =>
          c.sessions.map((s, si) => {
            const top = HEADER_HEIGHT + ((timeToMinutes(s.start) - minMin) / 30) * SLOT_HEIGHT;
            const height = ((timeToMinutes(s.end) - timeToMinutes(s.start)) / 30) * SLOT_HEIGHT;
            return (
              <div
                key={`${c.id}-${si}`}
                className="course-block"
                style={{
                  top,
                  height: height - 2,
                  left: `calc(50px + (100% - 50px) * ${s.day} / 6 + 2px)`,
                  width: `calc((100% - 50px) / 6 - 4px)`,
                  background: c.color,
                }}
              >
                <strong>{c.name}</strong><br />{s.start}-{s.end}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
