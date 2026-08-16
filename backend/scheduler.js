function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function sessionsConflict(a, b) {
  if (a.day !== b.day) return false;
  return timeToMinutes(a.start) < timeToMinutes(b.end) && timeToMinutes(b.start) < timeToMinutes(a.end);
}

function sectionsConflict(secA, secB) {
  for (const s1 of secA.sessions) {
    for (const s2 of secB.sessions) {
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
 * Every course carries one or more sections (şube); a schedule picks exactly
 * one section per included course. Explores every required-course section
 * assignment that doesn't conflict internally, since that set is independent
 * of which electives get chosen.
 */
function buildRequiredAssignments(required) {
  const assignments = [];
  function helper(idx, chosen) {
    if (idx === required.length) {
      assignments.push(chosen.slice());
      return;
    }
    const course = required[idx];
    for (const section of course.sections) {
      let ok = true;
      for (const picked of chosen) {
        if (sectionsConflict(picked.section, section)) {
          ok = false;
          break;
        }
      }
      if (ok) {
        chosen.push({ course, section });
        helper(idx + 1, chosen);
        chosen.pop();
      }
    }
  }
  helper(0, []);
  return assignments;
}

function toScheduleItem(course, section, sectionIndex) {
  return {
    id: course.id,
    name: course.name,
    type: course.type,
    color: course.color,
    sessions: section.sessions,
    sectionIndex,
    sectionCount: course.sections.length,
  };
}

/**
 * Generates all conflict-free weekly schedules containing one section of
 * every required course plus exactly `electiveCount` electives chosen from
 * the pool (electives have a single implicit section).
 */
export function generateSchedules(courses, electiveCount) {
  const required = courses.filter((c) => c.type === 'required');
  const electives = courses.filter((c) => c.type === 'elective');

  const requiredAssignments = buildRequiredAssignments(required);
  if (required.length > 0 && requiredAssignments.length === 0) {
    return {
      error: 'Zorunlu derslerin şubeleri arasında çakışmayan bir kombinasyon yok.',
    };
  }

  if (electiveCount > electives.length) {
    return {
      error: `Seçmeli ders havuzunda sadece ${electives.length} ders var, ${electiveCount} tane seçemezsin.`,
    };
  }

  const electiveCombos = electiveCount === 0 ? [[]] : combinations(electives, electiveCount);
  const validSchedules = [];

  for (const reqAssignment of requiredAssignments) {
    for (const electiveCombo of electiveCombos) {
      let ok = true;
      for (let i = 0; i < electiveCombo.length && ok; i++) {
        for (let j = i + 1; j < electiveCombo.length && ok; j++) {
          if (sectionsConflict(electiveCombo[i].sections[0], electiveCombo[j].sections[0])) ok = false;
        }
      }
      if (ok) {
        outer: for (const el of electiveCombo) {
          for (const req of reqAssignment) {
            if (sectionsConflict(req.section, el.sections[0])) {
              ok = false;
              break outer;
            }
          }
        }
      }
      if (ok) {
        const schedule = [
          ...reqAssignment.map(({ course, section }) =>
            toScheduleItem(course, section, course.sections.indexOf(section))
          ),
          ...electiveCombo.map((course) => toScheduleItem(course, course.sections[0], 0)),
        ];
        validSchedules.push(schedule);
      }
    }
  }

  return { schedules: validSchedules };
}
