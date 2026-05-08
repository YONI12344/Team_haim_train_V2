/* ═══════════════════════════════════════════════════════════
   TEAM HAIM — Google Apps Script Backend  |  Code.gs
   ═══════════════════════════════════════════════════════════

   FIRST TIME SETUP — do this once:
   1. Paste this file into Apps Script (Extensions → Apps Script)
   2. Select the function "setupSheet" from the dropdown at the top
   3. Click ▶ Run — it creates all tabs, headers, and sample data
   4. Deploy → New deployment → Web App
      - Execute as: Me
      - Who has access: Anyone
   5. Copy the URL → paste into script.js as APPS_SCRIPT_URL

   AFTER SETUP — to add a new athlete:
   Just add a row to the "athletes" tab. That's it.
   ═══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════
   SETUP — run this ONCE manually
   Creates all tabs + headers + sample data
   ══════════════════════════════════════ */
function setupSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()

  const tabs = [
    {
      name: 'athletes',
      headers: ['id', 'name', 'goal', 'photo_url'],
      sample: [
        ['yoni', 'Yoni Cohen', 'Sub 15:30 5K by June 2025', ''],
        ['dan',  'Dan Levi',   'Complete first half marathon', '']
      ]
    },
    {
      name: 'plans',
      headers: [
        'athlete_id', 'date', 'type', 'title',
        'planned_km', 'description', 'sets_json', 'notes', 'status'
      ],
      sample: buildSamplePlans()
    },
    {
      name: 'logs',
      headers: ['id', 'athlete_id', 'date', 'actual_km', 'effort', 'hr', 'comment', 'timestamp'],
      sample: [
        [Utilities.getUuid(), 'yoni', todayStr(-1), 9.8,  5, 148, 'Felt good, easy effort', new Date().toISOString()],
        [Utilities.getUuid(), 'yoni', todayStr(-2), 11.5, 8, 162, 'Intervals were tough but hit all paces', new Date().toISOString()],
        [Utilities.getUuid(), 'dan',  todayStr(-1), 8.0,  6, 155, 'Nice easy run', new Date().toISOString()]
      ]
    },
    {
      name: 'weekly_km',
      headers: ['athlete_id', 'w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8'],
      sample: [
        ['yoni', 38, 45, 42, 50, 48, 55, 52, 47],
        ['dan',  20, 25, 22, 28, 30, 27, 32, 30]
      ]
    }
  ]

  tabs.forEach(({ name, headers, sample }) => {
    const existing = ss.getSheetByName(name)
    if (existing) ss.deleteSheet(existing)

    const sheet = ss.insertSheet(name)

    /* Headers — styled gold on dark */
    const headerRange = sheet.getRange(1, 1, 1, headers.length)
    headerRange.setValues([headers])
    headerRange.setBackground('#1a1a1a')
    headerRange.setFontColor('#c9a84c')
    headerRange.setFontWeight('bold')
    headerRange.setFontFamily('Courier New')
    headerRange.setFontSize(11)
    sheet.setFrozenRows(1)

    /* Sample rows */
    if (sample && sample.length) {
      sheet.getRange(2, 1, sample.length, headers.length).setValues(sample)
      for (let i = 0; i < sample.length; i++) {
        const bg = i % 2 === 0 ? '#0f0f0f' : '#141414'
        sheet.getRange(i + 2, 1, 1, headers.length)
          .setBackground(bg)
          .setFontColor('#cccccc')
          .setFontSize(11)
      }
    }

    sheet.autoResizeColumns(1, headers.length)
    Logger.log('✓ Created tab: ' + name)
  })

  /* Remove default Sheet1 if it exists */
  const defaultSheet = ss.getSheetByName('Sheet1')
  if (defaultSheet) ss.deleteSheet(defaultSheet)

  Logger.log('✅ Setup complete.')

  SpreadsheetApp.getUi().alert(
    '✅  Team Haim setup complete!\n\n' +
    '4 tabs created:\n' +
    '  • athletes    — add your athletes here\n' +
    '  • plans       — add weekly training plans\n' +
    '  • logs        — athlete feedback saves here automatically\n' +
    '  • weekly_km   — update weekly totals here\n\n' +
    'Sample data for "yoni" and "dan" is already loaded.\n\n' +
    'Next → Deploy → New deployment → Web App'
  )
}

/* ── Date helper ── */
function todayStr(offsetDays) {
  const d = new Date()
  d.setDate(d.getDate() + (offsetDays || 0))
  return d.toISOString().split('T')[0]
}

/* ── Build one week of sample plans for athlete "yoni" ── */
function buildSamplePlans() {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))

  const days = [
    {
      type: 'easy', title: 'Easy recovery run', km: 10,
      desc: 'Easy aerobic run. Keep HR in Z1-Z2 the whole time.',
      sets: JSON.stringify([{ text: '10 km continuous easy', zone: 'Z1–Z2' }]),
      notes: 'Focus on posture and relaxed form. No ego today.',
      status: 'done'
    },
    {
      type: 'intervals', title: '8 × 400m intervals', km: 12,
      desc: 'Quality track session. Full recovery between reps.',
      sets: JSON.stringify([
        { text: '2 km warm-up easy', zone: 'Z1' },
        { text: '8 × 400m @ 3:40/km', zone: 'Z5' },
        { text: '90 sec jog recovery between reps', zone: 'Z1' },
        { text: '2 km cool-down easy', zone: 'Z1' }
      ]),
      notes: 'Target 3:40/km per rep. If feeling great on rep 6-7 push to 3:35.',
      status: 'done'
    },
    {
      type: 'rest', title: 'Rest', km: 0,
      desc: '', sets: '[]', notes: '', status: 'done'
    },
    {
      type: 'tempo', title: 'Tempo run', km: 14,
      desc: 'Sustained effort at lactate threshold. Key session of the week.',
      sets: JSON.stringify([
        { text: '2 km warm-up easy', zone: 'Z1' },
        { text: '3 × 3 km @ 3:52/km', zone: 'Z4' },
        { text: '90 sec easy jog between blocks', zone: 'Z1' },
        { text: '2 km cool-down', zone: 'Z1' }
      ]),
      notes: 'If HR goes above 172 on tempo blocks, back off slightly.',
      status: 'upcoming'
    },
    {
      type: 'easy', title: 'Easy + strides', km: 10,
      desc: 'Light run with short accelerations to keep legs sharp.',
      sets: JSON.stringify([
        { text: '8 km easy continuous', zone: 'Z1–Z2' },
        { text: '6 × 100m strides @ 5K race effort', zone: 'Z5' }
      ]),
      notes: 'Strides should feel effortless — not a sprint. Full walk recovery.',
      status: 'upcoming'
    },
    {
      type: 'race', title: '5K Road Race', km: 5,
      desc: 'Race day. Goal: 15:45 conservative — 15:30 target.',
      sets: JSON.stringify([
        { text: 'Warm-up 15 min easy + 4 strides', zone: 'Z1–Z2' },
        { text: 'RACE 5K — target 3:06/km avg', zone: 'RACE' },
        { text: 'Cool-down 10–15 min very easy', zone: 'Z1' }
      ]),
      notes: 'Go out controlled. First km should feel almost too easy. Build from km 2.',
      status: 'upcoming'
    },
    {
      type: 'long', title: 'Long run', km: 18,
      desc: 'Long aerobic run. Builds your base.',
      sets: JSON.stringify([
        { text: '18 km continuous easy', zone: 'Z1–Z2' },
        { text: 'Final 3 km @ marathon effort', zone: 'Z3' }
      ]),
      notes: 'Eat before this one. Keep first 12 km conversational.',
      status: 'upcoming'
    }
  ]

  return days.map((day, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return [
      'yoni',
      d.toISOString().split('T')[0],
      day.type, day.title, day.km,
      day.desc, day.sets, day.notes, day.status
    ]
  })
}

/* ══════════════════════════════════════════════════════════
   API — used by your website. Do not edit below this line.
   ══════════════════════════════════════════════════════════ */

function getSheet(name) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name)
}

function sheetToObjects(sheetName) {
  const sheet = getSheet(sheetName)
  if (!sheet) return []
  const values = sheet.getDataRange().getValues()
  if (values.length < 2) return []
  const [headers, ...rows] = values
  return rows.map(row => {
    const obj = {}
    headers.forEach((h, i) => { obj[h] = row[i] })
    return obj
  })
}

/* GET — page load */
function doGet(e) {
  try {
    const athleteId = (e.parameter && e.parameter.athlete) || ''
    const athletes = sheetToObjects('athletes')
    const athlete = athletes.find(a => a.id === athleteId) || athletes[0]
    if (!athlete) return jsonResponse({ error: 'Athlete not found' })

    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7))
    monday.setHours(0, 0, 0, 0)

    const allPlans = sheetToObjects('plans')
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const week = []

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]
      const plan = allPlans.find(
        p => String(p.athlete_id) === String(athlete.id) && String(p.date) === dateStr
      )

      if (plan) {
        let sets = []
        try { sets = JSON.parse(plan.sets_json || '[]') } catch (_) {}
        week.push({
          date: dateStr, day: dayNames[i],
          type: plan.type || 'rest', title: plan.title || '',
          planned_km: parseFloat(plan.planned_km) || 0,
          description: plan.description || '',
          sets, notes: plan.notes || '',
          status: plan.status || 'upcoming',
          actual_km: 0, effort: 0, comment: ''
        })
      } else {
        week.push({
          date: dateStr, day: dayNames[i], type: 'rest', title: 'Rest',
          planned_km: 0, status: 'done', sets: [],
          description: '', notes: '', actual_km: 0, effort: 0, comment: ''
        })
      }
    }

    /* Enrich with logs */
    const allLogs = sheetToObjects('logs')
    const athleteLogs = allLogs
      .filter(l => String(l.athlete_id) === String(athlete.id))
      .map(l => ({
        date: String(l.date).split('T')[0],
        km: parseFloat(l.actual_km) || 0,
        effort: parseInt(l.effort) || 0,
        hr: l.hr || '',
        comment: l.comment || ''
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date))

    week.forEach(day => {
      const log = athleteLogs.find(l => l.date === day.date)
      if (log) {
        day.actual_km = log.km
        day.effort = log.effort
        day.comment = log.comment
        if (day.type !== 'rest') day.status = 'done'
      }
    })

    /* Weekly km */
    const weeklyRows = sheetToObjects('weekly_km')
    const weeklyRow = weeklyRows.find(r => String(r.athlete_id) === String(athlete.id))
    const weekly_km = weeklyRow
      ? [weeklyRow.w1, weeklyRow.w2, weeklyRow.w3,
         weeklyRow.w4, weeklyRow.w5, weeklyRow.w6,
         weeklyRow.w7, weeklyRow.w8].map(Number)
      : [0, 0, 0, 0, 0, 0, 0, 0]

    return jsonResponse({ athlete, week, logs: athleteLogs.slice(0, 10), weekly_km })

  } catch (err) {
    return jsonResponse({ error: err.toString() })
  }
}

/* POST — athlete submits feedback */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents)
    if (body.action === 'log') {
      const sheet = getSheet('logs')
      sheet.appendRow([
        Utilities.getUuid(),
        body.athlete_id,
        body.date,
        body.km || 0,
        body.effort || 0,
        body.hr || '',
        body.comment || '',
        new Date().toISOString()
      ])
      return jsonResponse({ success: true })
    }
    return jsonResponse({ error: 'Unknown action' })
  } catch (err) {
    return jsonResponse({ error: err.toString() })
  }
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}
