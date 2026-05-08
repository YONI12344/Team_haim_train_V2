/* ═══════════════════════════════════════════════════════
   TEAM HAIM — Athlete Portal  |  script.js
   ═══════════════════════════════════════════════════════

   HOW TO CONNECT YOUR GOOGLE SHEET:
   1. Open Google Sheets → Extensions → Apps Script
   2. Paste the Code.gs content (see Code.gs file)
   3. Deploy → New deployment → Web App
      - Execute as: Me
      - Who has access: Anyone
   4. Copy the deployment URL
   5. Paste it below as APPS_SCRIPT_URL
   6. Each athlete page uses ?athlete=THEIR_ID in the URL
      e.g. yoursite.com/athlete/?athlete=yoni
   ═══════════════════════════════════════════════════════ */

const APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_URL_HERE'

/* ── Read athlete ID from URL (?athlete=yoni) ── */
const params = new URLSearchParams(window.location.search)
const ATHLETE_ID = params.get('athlete') || 'demo'

/* ══════════════════════════════════════════════
   SAMPLE DATA — used when APPS_SCRIPT_URL is
   not yet set or for local testing.
   Replace with real Google Sheets data later.
   ══════════════════════════════════════════════ */
const SAMPLE_DATA = {
  athlete: {
    id: 'demo',
    name: 'Yoni Cohen',
    goal: 'Sub 15:30 — 5K by June 2025\nCross country nationals qualifier',
    photo: ''
  },
  week: [
    {
      date: getDateString(0), day: 'Mon',
      type: 'easy', title: 'Easy recovery run',
      planned_km: 10, actual_km: 9.8,
      effort: 5, status: 'done',
      description: 'Easy aerobic run. Keep HR in Z1-Z2 the whole time.',
      sets: [
        { text: '10 km continuous easy', zone: 'Z1–Z2' }
      ],
      notes: 'Focus on posture and relaxed form. No ego today.',
      comment: 'Felt good. A bit heavy in the legs at the start but got better.'
    },
    {
      date: getDateString(1), day: 'Tue',
      type: 'intervals', title: '8 × 400m intervals',
      planned_km: 12, actual_km: 11.5,
      effort: 9, status: 'done',
      description: 'Quality track session. Full recovery between reps.',
      sets: [
        { text: '2 km warm-up @ easy pace', zone: 'Z1' },
        { text: '8 × 400m @ 3:40/km', zone: 'Z5' },
        { text: '90 sec jog recovery between reps', zone: 'Z1' },
        { text: '2 km cool-down @ easy', zone: 'Z1' }
      ],
      notes: 'Target 3:40/km per rep. If you feel great on rep 6–7 you can push to 3:35.',
      comment: 'Reps 1-5 felt controlled. 6 and 7 were tough. Finished strong.'
    },
    {
      date: getDateString(2), day: 'Wed',
      type: 'rest', title: 'Rest',
      planned_km: 0, status: 'done',
      description: '', sets: [], notes: '', comment: ''
    },
    {
      date: getDateString(3), day: 'Thu',
      type: 'tempo', title: 'Tempo run',
      planned_km: 14, status: 'upcoming',
      description: 'Sustained effort at lactate threshold. This is the key session of the week.',
      sets: [
        { text: '2 km warm-up @ easy', zone: 'Z1' },
        { text: '3 × 3 km @ 3:52/km', zone: 'Z4' },
        { text: '90 sec easy jog between blocks', zone: 'Z1' },
        { text: '2 km cool-down', zone: 'Z1' }
      ],
      notes: 'If HR goes above 172 on the tempo blocks, back off slightly. Consistency over heroics.',
      comment: ''
    },
    {
      date: getDateString(4), day: 'Fri',
      type: 'easy', title: 'Easy + strides',
      planned_km: 10, status: 'upcoming',
      description: 'Light run with short accelerations to keep the legs sharp before Saturday.',
      sets: [
        { text: '8 km easy continuous', zone: 'Z1–Z2' },
        { text: '6 × 100m strides @ 5K race effort', zone: 'Z5' }
      ],
      notes: 'Strides should feel effortless and fast — not a sprint. Full walk recovery.',
      comment: ''
    },
    {
      date: getDateString(5), day: 'Sat',
      type: 'race', title: '5K Road Race',
      planned_km: 5, status: 'upcoming',
      description: 'Race day. Goal time 15:45 (conservative) — 15:30 (target).',
      sets: [
        { text: 'Warm-up 15 min easy + 4 strides', zone: 'Z1–Z2' },
        { text: 'RACE 5K — target 3:06/km avg', zone: 'RACE' },
        { text: 'Cool-down 10–15 min very easy', zone: 'Z1' }
      ],
      notes: 'Go out controlled. First km should feel almost too easy. Build from km 2.',
      comment: ''
    },
    {
      date: getDateString(6), day: 'Sun',
      type: 'long', title: 'Long run',
      planned_km: 18, status: 'upcoming',
      description: 'Long aerobic run. This one builds your base.',
      sets: [
        { text: '18 km continuous easy', zone: 'Z1–Z2' },
        { text: 'Final 3 km @ marathon effort', zone: 'Z3' }
      ],
      notes: 'Eat before this one. Bring water if it\'s warm. Keep the first 12 km conversational.',
      comment: ''
    }
  ],
  logs: [
    { date: getDateString(1), km: 11.5, effort: 9, comment: 'Reps 1-5 felt controlled. 6 and 7 were tough. Finished strong.' },
    { date: getDateString(0), km: 9.8, effort: 5, comment: 'Felt good. A bit heavy in the legs at the start but got better.' },
    { date: getDateString(-1), km: 14.2, effort: 8, comment: 'Tempo felt hard but hit all the paces. Happy with this.' },
    { date: getDateString(-2), km: 0, effort: 0, comment: 'Rest day.' },
    { date: getDateString(-3), km: 10.1, effort: 6, comment: 'Good easy run, felt fresh.' }
  ],
  weekly_km: [38, 45, 42, 50, 48, 55, 52, 47]
}

/* ── Helpers ── */
function getDateString(daysFromToday) {
  const d = new Date()
  d.setDate(d.getDate() + daysFromToday)
  return d.toISOString().split('T')[0]
}
function formatDate(str) {
  const d = new Date(str + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}
function isToday(str) {
  return str === new Date().toISOString().split('T')[0]
}

/* ── Render helpers ── */
function pillClass(type) {
  const map = { easy:'pill-easy', intervals:'pill-intervals', tempo:'pill-tempo',
    long:'pill-long', race:'pill-race', strength:'pill-strength', rest:'pill-rest' }
  return map[type] || 'pill-rest'
}
function pillLabel(type) {
  return type.charAt(0).toUpperCase() + type.slice(1)
}
function statusClass(s) {
  return { done:'status-done', upcoming:'status-upcoming', missed:'status-missed', race:'status-race' }[s] || ''
}
function statusIcon(s) {
  return { done:'✓ Done', upcoming:'· Upcoming', missed:'✗ Missed', race:'⚑ Race' }[s] || ''
}

/* ══════════════════════════════════════
   RENDER FUNCTIONS
   ══════════════════════════════════════ */

function renderHero(data) {
  const { athlete, week } = data
  document.getElementById('nav-athlete-name').textContent = athlete.name
  document.getElementById('hero-name').textContent = athlete.name.toUpperCase()
  document.getElementById('hero-goal').textContent = athlete.goal

  const today = new Date()
  const weekNum = Math.ceil((((today - new Date(today.getFullYear(), 0, 1)) / 86400000) + new Date(today.getFullYear(), 0, 1).getDay() + 1) / 7)
  document.getElementById('hero-tag').textContent = `Week ${weekNum} · ${today.getFullYear()}`
  document.title = `Team Haim | ${athlete.name}`

  const totalPlanned = week.filter(d => d.type !== 'rest').reduce((s, d) => s + (d.planned_km || 0), 0)
  const totalDone = week.filter(d => d.status === 'done' && d.type !== 'rest').reduce((s, d) => s + (d.actual_km || 0), 0)
  const sessionsDone = week.filter(d => d.status === 'done' && d.type !== 'rest').length
  const avgEffort = (() => {
    const s = week.filter(d => d.status === 'done' && d.effort)
    return s.length ? (s.reduce((a, d) => a + d.effort, 0) / s.length).toFixed(1) : '—'
  })()

  document.getElementById('stat-planned').textContent = totalPlanned
  document.getElementById('stat-done').textContent = totalDone.toFixed(1)
  document.getElementById('stat-sessions').textContent = `${sessionsDone} / ${week.filter(d => d.type !== 'rest').length}`
  document.getElementById('stat-load').textContent = avgEffort
}

function renderCalendar(week) {
  const grid = document.getElementById('calendar-grid')
  grid.innerHTML = ''

  week.forEach((day, i) => {
    const cell = document.createElement('div')
    cell.className = 'cal-day' + (isToday(day.date) ? ' today' : '')
    cell.dataset.index = i

    const dateObj = new Date(day.date + 'T00:00:00')
    const dateNum = dateObj.getDate()

    if (day.type === 'rest') {
      cell.innerHTML = `
        <div class="cal-day-name">${day.day}</div>
        <div class="cal-day-date">${dateNum}</div>
        <div class="cal-rest">Rest</div>`
    } else {
      cell.innerHTML = `
        <div class="cal-day-name">${day.day}</div>
        <div class="cal-day-date">${dateNum}</div>
        <div class="cal-session">
          <span class="session-type-pill ${pillClass(day.type)}">${pillLabel(day.type)}</span>
          <div class="session-title">${day.title}</div>
          <div class="session-km">${day.planned_km} km planned${day.actual_km ? ' · ' + day.actual_km + ' done' : ''}</div>
          <div class="session-status ${statusClass(day.status)}">${statusIcon(day.status)}</div>
        </div>`
    }

    cell.addEventListener('click', () => {
      document.querySelectorAll('.cal-day').forEach(c => c.classList.remove('selected'))
      cell.classList.add('selected')
      renderWorkoutDetail(day)
      document.getElementById('workout').scrollIntoView({ behavior: 'smooth', block: 'start' })
    })

    grid.appendChild(cell)
  })

  /* Auto-select today or next upcoming */
  const todayIdx = week.findIndex(d => isToday(d.date))
  const upcomingIdx = week.findIndex(d => d.status === 'upcoming')
  const selectIdx = todayIdx >= 0 ? todayIdx : (upcomingIdx >= 0 ? upcomingIdx : 0)
  if (week[selectIdx]) {
    grid.children[selectIdx]?.classList.add('selected')
    renderWorkoutDetail(week[selectIdx])
  }
}

function renderWorkoutDetail(day) {
  const container = document.getElementById('workout-detail')

  if (day.type === 'rest') {
    container.innerHTML = `<div class="workout-loading" style="color:#333;padding:2rem 0;">Rest day — recovery is part of the training.</div>`
    return
  }

  const setsHTML = day.sets?.length
    ? `<div class="wd-sets">${day.sets.map((s, i) => `
        <div class="wd-set">
          <div class="wd-set-num">0${i + 1}</div>
          <div class="wd-set-text">${s.text}</div>
          <div class="wd-set-zone">${s.zone}</div>
        </div>`).join('')}</div>`
    : ''

  const notesHTML = day.notes
    ? `<div class="wd-notes">
        <div class="wd-notes-label">Coach notes</div>
        <div class="wd-notes-text">${day.notes}</div>
       </div>` : ''

  const feedbackHTML = day.comment && day.status === 'done'
    ? `<div class="wd-notes">
        <div class="wd-notes-label" style="color:var(--done)">Your feedback</div>
        <div class="wd-notes-text" style="color:#888">"${day.comment}"</div>
       </div>` : ''

  container.innerHTML = `
    <div class="wd-header">
      <div>
        <span class="session-type-pill ${pillClass(day.type)}">${pillLabel(day.type)}</span>
        <div class="wd-title">${day.title}</div>
        <div class="wd-date">${formatDate(day.date)}</div>
      </div>
      <div>
        <div class="wd-km-badge">${day.actual_km || day.planned_km} KM</div>
        <div class="wd-km-label">${day.status === 'done' ? 'Completed' : 'Planned'}</div>
      </div>
    </div>
    ${day.description ? `<div class="wd-description">${day.description}</div>` : ''}
    ${setsHTML}
    ${notesHTML}
    ${feedbackHTML}`
}

function renderLogs(logs) {
  const list = document.getElementById('recent-list')
  if (!logs || !logs.length) {
    list.innerHTML = '<div style="color:#333;font-size:0.82rem;">No logs yet.</div>'
    return
  }
  list.innerHTML = logs.slice(0, 6).map(log => {
    const dots = Array.from({ length: 10 }, (_, i) =>
      `<div class="effort-dot ${i < log.effort ? 'filled' : ''}"></div>`
    ).join('')
    return `
      <div class="log-item">
        <div class="log-item-header">
          <span class="log-date">${formatDate(log.date)}</span>
          <span class="log-km">${log.km > 0 ? log.km + ' km' : 'Rest'}</span>
        </div>
        ${log.effort > 0 ? `<div class="log-effort">${dots}</div>` : ''}
        ${log.comment ? `<div class="log-comment">${log.comment}</div>` : ''}
      </div>`
  }).join('')
}

function renderStats(data) {
  const { logs, weekly_km } = data

  /* Monthly stats from logs */
  const thisMonth = new Date().getMonth()
  const monthLogs = logs.filter(l => new Date(l.date).getMonth() === thisMonth)
  const monthKm = monthLogs.reduce((s, l) => s + (l.km || 0), 0).toFixed(1)
  const monthSessions = monthLogs.filter(l => l.km > 0).length
  const allDone = data.week.filter(d => d.status !== 'upcoming' && d.type !== 'rest').length
  const totalSessions = data.week.filter(d => d.type !== 'rest').length
  const completion = totalSessions ? Math.round((allDone / totalSessions) * 100) + '%' : '—'
  const avgEffortMonth = monthLogs.filter(l => l.effort > 0).length
    ? (monthLogs.filter(l => l.effort > 0).reduce((s, l) => s + l.effort, 0) / monthLogs.filter(l => l.effort > 0).length).toFixed(1)
    : '—'

  document.getElementById('stat-month-km').textContent = monthKm
  document.getElementById('stat-avg-effort').textContent = avgEffortMonth + ' / 10'
  document.getElementById('stat-month-sessions').textContent = monthSessions
  document.getElementById('stat-completion').textContent = completion

  /* Bar chart */
  const chart = document.getElementById('bar-chart')
  const max = Math.max(...weekly_km, 1)
  const weekLabels = ['W-7', 'W-6', 'W-5', 'W-4', 'W-3', 'W-2', 'Last', 'This']
  chart.innerHTML = weekly_km.map((km, i) => `
    <div class="bar-col">
      <div class="bar-km">${km}</div>
      <div class="bar-fill ${i === weekly_km.length - 1 ? 'current' : ''}"
           style="height:${Math.round((km / max) * 110)}px"></div>
      <div class="bar-week">${weekLabels[i]}</div>
    </div>`).join('')
}

/* ══════════════════════════════════════
   EFFORT SLIDER
   ══════════════════════════════════════ */
const slider = document.getElementById('log-effort')
const effortDisplay = document.getElementById('effort-display')
const effortBar = document.getElementById('effort-bar')

function updateEffortUI(val) {
  effortDisplay.textContent = `${val} / 10`
  effortBar.style.width = `${val * 10}%`
  const hue = Math.round(120 - (val - 1) * 13.3)
  effortBar.style.background = `hsl(${hue}, 60%, 45%)`
}
slider.addEventListener('input', () => updateEffortUI(slider.value))
updateEffortUI(slider.value)

/* ── Set today's date as default ── */
document.getElementById('log-date').value = new Date().toISOString().split('T')[0]

/* ══════════════════════════════════════
   SUBMIT FEEDBACK
   ══════════════════════════════════════ */
document.getElementById('submit-log').addEventListener('click', async () => {
  const btn = document.getElementById('submit-log')
  const status = document.getElementById('submit-status')
  const payload = {
    athlete_id: ATHLETE_ID,
    date: document.getElementById('log-date').value,
    km: parseFloat(document.getElementById('log-km').value) || 0,
    effort: parseInt(slider.value),
    hr: parseInt(document.getElementById('log-hr').value) || '',
    comment: document.getElementById('log-comment').value.trim()
  }

  if (!payload.date) {
    status.textContent = 'Please select a date.'
    status.className = 'submit-status error'
    return
  }

  btn.textContent = 'Saving...'
  btn.disabled = true

  try {
    if (APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
      /* Demo mode — simulate a save */
      await new Promise(r => setTimeout(r, 800))
      status.textContent = '✓ Logged! (demo mode — connect Google Sheets to save for real)'
      status.className = 'submit-status success'
    } else {
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'log', ...payload })
      })
      status.textContent = '✓ Session logged successfully.'
      status.className = 'submit-status success'
    }
    document.getElementById('log-km').value = ''
    document.getElementById('log-hr').value = ''
    document.getElementById('log-comment').value = ''
  } catch (e) {
    status.textContent = '✗ Error saving. Check your connection and try again.'
    status.className = 'submit-status error'
  }

  btn.textContent = 'Submit session log'
  btn.disabled = false
})

/* ══════════════════════════════════════
   WEEK NAV (prev / next week)
   These shift the SAMPLE_DATA dates for demo.
   In production, pass week offset to Apps Script.
   ══════════════════════════════════════ */
let weekOffset = 0
document.getElementById('prev-week').addEventListener('click', () => {
  weekOffset--
  renderWeekDisplay()
  shiftWeekDates(weekOffset)
})
document.getElementById('next-week').addEventListener('click', () => {
  weekOffset++
  renderWeekDisplay()
  shiftWeekDates(weekOffset)
})
function renderWeekDisplay() {
  const d = document.getElementById('week-display')
  if (weekOffset === 0) d.textContent = 'This week'
  else if (weekOffset === -1) d.textContent = 'Last week'
  else if (weekOffset === 1) d.textContent = 'Next week'
  else d.textContent = `${weekOffset > 0 ? '+' : ''}${weekOffset} weeks`
}
function shiftWeekDates(offset) {
  const shifted = SAMPLE_DATA.week.map((day, i) => ({
    ...day,
    date: getDateString(i + offset * 7),
    status: offset !== 0 ? (offset < 0 ? 'done' : 'upcoming') : day.status
  }))
  renderCalendar(shifted)
}

/* ══════════════════════════════════════
   LOAD DATA
   Tries Google Sheets first, falls back
   to SAMPLE_DATA for development/demo.
   ══════════════════════════════════════ */
async function loadData() {
  if (APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_URL_HERE') {
    /* Dev / demo mode */
    init(SAMPLE_DATA)
    return
  }
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?athlete=${ATHLETE_ID}`)
    const data = await res.json()
    init(data)
  } catch (err) {
    console.warn('Could not reach Google Sheets, using sample data.', err)
    init(SAMPLE_DATA)
  }
}

function init(data) {
  renderHero(data)
  renderCalendar(data.week)
  renderLogs(data.logs)
  renderStats(data)
}

/* ── Smooth nav scroll ── */
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault()
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'))
    link.classList.add('active')
    const target = document.querySelector(link.getAttribute('href'))
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
})

loadData()
