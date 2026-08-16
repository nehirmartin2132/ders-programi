function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function sessionsConflict(a, b) {
  if (a.day !== b.day) return false;
  return timeToMinutes(a.start) < timeToMinutes(b.end) && timeToMinutes(b.start) < timeToMinutes(a.end);
}

function coursesConflict(c1, c2) {
  for (const s1 of c1.sessions) {
    for (const s2 of c2.sessions) {
      if (sessionsConflict(s1, s2)) return true;
    }
  }
  return false;
}

function combinations(arr, k) {
  const results = [];
  function helper(start, combo) {
    if (combo.length === k) {
      results.push(combo.slice());
      return;
    }
    for (let i = start; i < arr.length; i++) {
      combo.push(arr[i]);
      helper(i + 1, combo);
      combo.pop();
    }
  }
  helper(0, []);
  return results;
}

/**
 * Generates all conflict-free weekly schedules containing every required
 * course plus exactly `electiveCount` electives chosen from the pool.
 */
export function generateSchedules(courses, electiveCount) {
  const required = courses.filter((c) => c.type === 'required');
  const electives = courses.filter((c) => c.type === 'elective');

  for (let i = 0; i < required.length; i++) {
    for (let j = i + 1; j < required.length; j++) {
      if (coursesConflict(required[i], required[j])) {
        return {
          error: `Zorunlu dersler kendi aralarında çakışıyor: "${required[i].name}" ve "${required[j].name}".`,
        };
      }
    }
  }

  if (electiveCount > electives.length) {
    return {
      error: `Seçmeli ders havuzunda sadece ${electives.length} ders var, ${electiveCount} tane seçemezsin.`,
    };
  }

  const electiveCombos = electiveCount === 0 ? [[]] : combinations(electives, electiveCount);
  const validSchedules = [];

  for (const combo of electiveCombos) {
    let ok = true;
    for (let i = 0; i < combo.length && ok; i++) {
      for (let j = i + 1; j < combo.length && ok; j++) {
        if (coursesConflict(combo[i], combo[j])) ok = false;
      }
    }
    if (ok) {
      outer: for (const req of required) {
        for (const el of combo) {
          if (coursesConflict(req, el)) {
            ok = false;
            break outer;
          }
        }
      }
    }
    if (ok) validSchedules.push([...required, ...combo]);
  }

  return { schedules: validSchedules };
}
