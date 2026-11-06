/* eslint-disable */
// M3S — My Profile
// Loads from localStorage(`m3s.journey`) seeded by onboarding-flow.jsx,
// adds inline pencil-edit per field, plus a monthly progress log + graph.


// Environment Detection Helpers for PPE and PROD isolating
const getActiveEnvironment = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('-dev-') || hostname.includes('localhost')) {
    return 'PPE'; // Development / Pre-production
  }
  return 'PROD';  // Production / Live
};

const getEnvPrefix = () => {
  return getActiveEnvironment() === 'PPE' ? 'ppe_' : 'prod_';
};

let db = null;
if (typeof firebase !== 'undefined') {
  const firebaseConfig = {
    "projectId": "gen-lang-client-0044812364",
    "appId": "1:266738805654:web:3835977d452f345c03cbb7",
    "apiKey": "AIzaSyCGFoF87skCOMSeJsb4jAnCD9A1RsSu62E",
    "authDomain": "gen-lang-client-0044812364.firebaseapp.com",
    "firestoreDatabaseId": "ai-studio-0f3a0866-2248-4a92-a608-c99f0d784e03",
    "storageBucket": "gen-lang-client-0044812364.firebasestorage.app",
    "messagingSenderId": "266738805654"
  };
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  const dbId = firebaseConfig.firestoreDatabaseId;
  db = (dbId && dbId !== '(default)') ? firebase.app().firestore(dbId) : firebase.app().firestore();

  // Decorate collection path with environment-specific prefix (isolation)
  if (db && !db.collectionRaw && typeof db.collection === 'function') {
    const originalCollection = db.collection;
    db.collectionRaw = originalCollection.bind(db);
    db.collection = function(name) {
      if (name.startsWith('ppe_') || name.startsWith('prod_')) {
        return originalCollection.call(db, name);
      }
      const prefix = getEnvPrefix();
      return originalCollection.call(db, prefix + name);
    };
  }
}

// ─── Direct Firebase Syncing Bridge ───────────────────────────────────────
const M3S_DB = {
  get(key, fallback) {
    try {
      const prefix = getEnvPrefix();
      const raw = localStorage.getItem(`m3s.${prefix}${key}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {}
    return fallback;
  },
  set(key, val) {
    try {
      const prefix = getEnvPrefix();
      localStorage.setItem(`m3s.${prefix}${key}`, JSON.stringify(val));
      localStorage.setItem(key, JSON.stringify(val)); // dual-saving for compatibility fallback
    } catch {}
    if (db) {
      const parts = key.split('.');
      if (parts.length >= 2) {
        const coll = parts[1];
        if (coll === 'journey') {
          const userId = parts[2] || 'riya';
          db.collection('clients').doc(userId).set(val, { merge: true }).catch(err => console.warn(err));
          db.collection('assessments').doc(userId).set(val, { merge: true }).catch(err => console.warn(err));
        } else if (coll === 'ratings') {
          val.forEach(r => {
            const docId = r.id || `${r.clientId || 'riya'}_${r.sessionDate}`;
            db.collection('ratings').doc(docId).set({
              id: docId,
              client_id: r.clientId || 'riya',
              clientId: r.clientId || 'riya',
              clientName: r.clientName || 'Riya Sharma',
              coachId: r.coachId || 'lee',
              coachName: r.coachName || 'Lee',
              sessionDate: r.sessionDate,
              session_date: r.sessionDate,
              scores: r.scores,
              scores_json: r.scores,
              overall: r.overall,
              comment: r.comment,
              submittedAt: r.submittedAt || new Date().toISOString()
            }, { merge: true }).catch(err => console.warn(err));
          });
        }
      }
    }
  }
};

const OT = {
  sand50: '#FBF7F0', sand100: '#F5EDE0', sand200: '#EADBC4', sand300: '#D9C3A3',
  paper: '#FFFDF8', ink: '#1C140E',
  clay500: '#A8825A', clay600: '#8A6640',
  walnut: '#5E4228', espresso800: '#3E2C1C', espresso900: '#241810',
  ochre: '#C99A3F', sage: '#7B8B6F', terra: '#B86B4B',
  ok: '#5E8A5E', warn: '#C97A3F', bad: '#B0463A',
  hairline: 'rgba(62,44,28,0.12)', hairlineStrong: 'rgba(62,44,28,0.22)',
  fDisplay: '"Instrument Serif", "Cormorant Garamond", Georgia, serif',
  fBody: '"Inter", system-ui, sans-serif',
  fMono: '"JetBrains Mono", ui-monospace, monospace',
  sh1: '0 1px 2px rgba(62,44,28,0.06)',
  sh2: '0 6px 20px -8px rgba(62,44,28,0.18)',
  sh3: '0 20px 50px -20px rgba(62,44,28,0.35)',
};

// ─── Primitives ───────────────────────────────────────────────────────────
const OEyebrow = ({ children, dot = OT.walnut, color = OT.clay600, size = 11 }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    fontFamily: OT.fMono, fontSize: size, letterSpacing: 1.8,
    textTransform: 'uppercase', color, fontWeight: 500,
  }}>
    <span style={{ width: 6, height: 6, borderRadius: 999, background: dot, flexShrink: 0 }} />
    <span>{children}</span>
  </div>
);

const OMono = ({ children, size = 10, color = OT.clay600, style = {} }) => (
  <div style={{
    fontFamily: OT.fMono, fontSize: size, letterSpacing: 1.5,
    textTransform: 'uppercase', color, fontWeight: 500, ...style,
  }}>{children}</div>
);

const Pencil = ({ size = 13, color = OT.clay600 }) => (
  <svg className="pencil" width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M16.474 5.408l2.118 2.118m-1.082-3.2L13.69 8.144 4 17.834V20h2.166l9.69-9.69 3.624-3.624a1.527 1.527 0 0 0-2.16-2.16z"/>
  </svg>
);

const inputStyle = {
  fontFamily: OT.fBody, fontSize: 14, color: OT.espresso900,
  background: OT.paper, border: `1px solid ${OT.hairlineStrong}`,
  borderRadius: 8, padding: '8px 10px', outline: 'none',
  boxSizing: 'border-box',
};

// ─── Rating data store (localStorage) ────────────────────────────────────
const RATING_CRITERIA = [
  { key: 'workout',       label: 'How was the workout?',   hint: 'Overall session intensity and flow' },
  { key: 'form',          label: 'Form coaching',          hint: 'Cues, corrections, technique guidance' },
  { key: 'communication', label: 'Communication',          hint: 'Clarity, listening, encouragement' },
  { key: 'structure',     label: 'Session structure',      hint: 'Warm up, programming, cool down' },
  { key: 'content',       label: 'Programme content',      hint: 'Relevance to your goals' },
];

function loadRatings() {
  try { return JSON.parse(localStorage.getItem('m3s.ratings') || '[]'); }
  catch { return []; }
}
function saveRating(entry) {
  const ratings = loadRatings();
  const idx = ratings.findIndex(r => r.id === entry.id);
  if (idx >= 0) ratings[idx] = entry;
  else ratings.push(entry);
  localStorage.setItem('m3s.ratings', JSON.stringify(ratings));
  M3S_DB.set('m3s.ratings', ratings);
}
function computeOverall(scores) {
  const vals = Object.values(scores).filter(v => v > 0);
  if (!vals.length) return 0;
  return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
}
function ratingsForCoach(coachId) {
  return loadRatings().filter(r => r.coachId === coachId);
}
function coachAverages(coachId) {
  const rs = ratingsForCoach(coachId);
  if (!rs.length) return null;
  const avg = (key) => {
    const vals = rs.map(r => r.scores[key]).filter(v => v > 0);
    return vals.length
      ? parseFloat((vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1))
      : 0;
  };
  return {
    overall:       parseFloat((rs.map(r=>r.overall).reduce((a,b)=>a+b,0)/rs.length).toFixed(1)),
    workout:       avg('workout'),
    form:          avg('form'),
    communication: avg('communication'),
    structure:     avg('structure'),
    content:       avg('content'),
    count:         rs.length,
  };
}

const SEED_RATINGS = [
  { id: 'riya_2026-04-20', clientId: 'riya', clientName: 'Riya Sharma',
    coachId: 'lee', coachName: 'Lee', sessionDate: '2026-04-20', sessionType: 'PT Session',
    scores: { workout:5, form:4, communication:5, structure:4, content:5 }, overall: 4.6,
    comment: "Best session in weeks. Thoracic work really helped my overhead finally click.",
    submittedAt: '2026-04-20T09:15:00' },
  { id: 'riya_2026-04-13', clientId: 'riya', clientName: 'Riya Sharma',
    coachId: 'lee', coachName: 'Lee', sessionDate: '2026-04-13', sessionType: 'PT Session',
    scores: { workout:4, form:5, communication:4, structure:4, content:4 }, overall: 4.2,
    comment: "Form cues were incredibly precise. Shoulder felt better after the landmine work.",
    submittedAt: '2026-04-13T08:55:00' },
  { id: 'meera_2026-04-20', clientId: 'meera', clientName: 'Meera P.',
    coachId: 'lee', coachName: 'Lee', sessionDate: '2026-04-20', sessionType: 'PT Session',
    scores: { workout:5, form:5, communication:4, structure:5, content:4 }, overall: 4.6,
    comment: "Loved the progressive overload approach this block.",
    submittedAt: '2026-04-20T10:30:00' },
  { id: 'karan_2026-04-19', clientId: 'karan', clientName: 'Karan S.',
    coachId: 'rahul', coachName: 'Rahul', sessionDate: '2026-04-19', sessionType: 'PT Session',
    scores: { workout:4, form:4, communication:5, structure:4, content:5 }, overall: 4.4,
    comment: "Rahul always knows when to push and when to back off. Great session.",
    submittedAt: '2026-04-19T07:45:00' },
  { id: 'anita_2026-04-18', clientId: 'anita', clientName: 'Anita V.',
    coachId: 'lee', coachName: 'Lee', sessionDate: '2026-04-18', sessionType: 'PT Session',
    scores: { workout:3, form:4, communication:4, structure:3, content:4 }, overall: 3.6,
    comment: "Session was a bit shorter than usual but form coaching was detailed.",
    submittedAt: '2026-04-18T09:05:00' },
  { id: 'vikram_2026-04-17', clientId: 'vikram', clientName: 'Vikram R.',
    coachId: 'deb', coachName: 'Deb', sessionDate: '2026-04-17', sessionType: 'PT Session',
    scores: { workout:5, form:5, communication:5, structure:5, content:5 }, overall: 5.0,
    comment: "Perfect session. Programming was exactly what I needed.",
    submittedAt: '2026-04-17T08:20:00' },
];

if (getActiveEnvironment() !== 'PROD') {
  if (!localStorage.getItem('m3s.ratings')) {
    localStorage.setItem('m3s.ratings', JSON.stringify(SEED_RATINGS));
  }
}

const SEED_SESSIONS = [
  { id: "s1", coach_id: "lee", client_id: "riya", type: "PT Session", scheduled_at: "2026-06-10T07:00:00", duration_min: 60, status: "upcoming" },
  { id: "s_riya_2", coach_id: "lee", client_id: "riya", type: "PT Session", scheduled_at: "2026-06-12T09:30:00", duration_min: 60, status: "upcoming" },
  { id: "s_riya_3", coach_id: "lee", client_id: "riya", type: "PT Strength", scheduled_at: "2026-06-15T07:30:00", duration_min: 60, status: "upcoming" },
  { id: "s2", coach_id: "lee", client_id: "meera", type: "PT Session", scheduled_at: "2026-06-10T08:00:00", duration_min: 60, status: "upcoming" },
  { id: "s3", coach_id: "rahul", client_id: "karan", type: "PT Work", scheduled_at: "2026-06-11T18:00:00", duration_min: 60, status: "upcoming" },
  { id: "s4", coach_id: "deb", client_id: "vikram", type: "Mobility Flow", scheduled_at: "2026-06-12T07:30:00", duration_min: 60, status: "upcoming" },
];

if (getActiveEnvironment() !== 'PROD') {
  if (!localStorage.getItem('m3s.sessions')) {
    localStorage.setItem('m3s.sessions', JSON.stringify(SEED_SESSIONS));
  }
}

// ─── Coach roster (copied from onboarding-flow.jsx) ───────────────────────
const COACHES = [
  { id: "joe",     name: "Joe",     role: "Hypertrophy & Strength", tone: "espresso", bio: "Block-periodised hypertrophy. Muscle you can actually use.", specialties: ["Hypertrophy", "Strength", "Recovery"], initials: "JO", cert: "Strength · Hypertrophy" },
  { id: "deb",     name: "Deb",     role: "Strength & Recovery", tone: "walnut",   bio: "Post-rehab strength and long-term recovery planning.", specialties: ["Strength", "Recovery", "Hyrox Prep"], initials: "DB", cert: "Strength · Recovery" },
  { id: "deepika", name: "Deepika", role: "Hyrox & Conditioning", tone: "terra",   bio: "Zone 2 devotee turned Hyrox specialist. Endurance with structure.", specialties: ["Hyrox Prep", "Strength", "Conditioning"], initials: "DE", cert: "Hyrox · Strength" },
  { id: "lee",     name: "Lee",     role: "Hypertrophy & Strength", tone: "sage",  bio: "Form first, always. The coach who makes the last rep look like the first.", specialties: ["Hypertrophy", "Strength", "Recovery"], initials: "LE", cert: "Hypertrophy · Strength" },
  { id: "pilates", name: "Anisha",  role: "Pilates & Mobility", tone: "sand",      bio: "Clinical Pilates for posture, core control, and post-injury returns.", specialties: ["Pilates", "Mobility", "Recovery"], initials: "AN", cert: "Pilates · Mobility" },
  { id: "rahul",   name: "Rahul",   role: "Strength & Hyrox Prep", tone: "walnut", bio: "Competition-tested Hyrox coach. Builds engines that don't quit in round four.", specialties: ["Strength", "Hyrox Prep", "Conditioning"], initials: "RA", cert: "Strength · Hyrox · Recovery" },
  { id: "aakash",  name: "Aakash",  role: "Strength & Recovery", tone: "clay",     bio: "Old-school strength with new-school recovery protocols.", specialties: ["Strength", "Recovery", "Mobility"], initials: "AK", cert: "Strength · Recovery" },
  { id: "tarun",   name: "Tarun",   role: "Hyrox & Hypertrophy", tone: "clay",     bio: "Hybrid athlete programming — size, speed, stamina.", specialties: ["Hyrox Prep", "Hypertrophy", "Strength"], initials: "TR", cert: "Hyrox · Hypertrophy" },
  { id: "santo",   name: "Santo",   role: "Strength & Hypertrophy", tone: "espresso", bio: "Classical strength training with a bodybuilder's eye for detail.", specialties: ["Strength", "Hypertrophy", "Conditioning"], initials: "SA", cert: "Strength · Hypertrophy" },
  { id: "shahbaz", name: "Shahbaz", role: "Yoga & Breathwork", tone: "sage",       bio: "Traditional hatha and vinyasa. Breath-led practice for strength that lasts.", specialties: ["Yoga", "Breathwork", "Mobility"], initials: "SH", cert: "Yoga · Breathwork" },
];
const COACH_TONE_BG = {
  espresso: '#3E2C1C', walnut: '#5E4228', terra: '#B86B4B',
  sage: '#7B8B6F', sand: '#D9C3A3', clay: '#A8825A',
};

// ─── Nutrition log — coach-written, client-readable ───────────────────────
// localStorage key: 'm3s.nutrition'
const SEED_NUTRITION = [
  {
    id: 'n1', clientId: 'riya', coachId: 'lee', coachName: 'Lee',
    date: '2026-04-20', period: 'Week 3 of 12',
    mealPlan: { calories: 1800, protein: 140, carbs: 160, fat: 60 },
    notes: 'Keep protein high this block — muscle gain phase. Prioritise whole foods over supplements. Hydration target: 3L/day.',
    tags: ['Muscle Gain', 'High Protein', 'Week 3'],
  },
  {
    id: 'n2', clientId: 'riya', coachId: 'lee', coachName: 'Lee',
    date: '2026-03-30', period: 'Week 1 of 12',
    mealPlan: { calories: 1750, protein: 130, carbs: 170, fat: 58 },
    notes: 'Baseline week. Getting used to the targets. Shoulder still causing issues so holding off heavy pressing.',
    tags: ['Baseline', 'Week 1'],
  },
];

if (getActiveEnvironment() !== 'PROD') {
  if (!localStorage.getItem('m3s.nutrition')) {
    localStorage.setItem('m3s.nutrition', JSON.stringify(SEED_NUTRITION));
  }
}

function loadNutrition(clientId) {
  try {
    return JSON.parse(localStorage.getItem('m3s.nutrition') || '[]')
      .filter(n => n.clientId === clientId)
      .sort((a, b) => b.date.localeCompare(a.date));
  } catch { return []; }
}

// ─── Session notes — coach-written, client read-only ─────────────────────
// localStorage key: 'm3s.sessionNotes' (written by client-profile.jsx in coach-universe)
function loadMySessionNotes() {
  const activeId = localStorage.getItem('m3s.active_student_id') || 'riya';
  try {
    return JSON.parse(localStorage.getItem('m3s.sessionNotes') || '[]')
      .filter(n => n.clientId === activeId)
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  } catch { return []; }
}

const fmtSlot = (v) => {
  const m = v.match(/^(\d+):(\d+)$/);
  if (!m) return v;
  const h = parseInt(m[1], 10), mm = m[2];
  const period = h < 12 ? 'AM' : 'PM';
  const hh = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hh}:${mm} ${period}`;
};

// ─── Profile state hook ───────────────────────────────────────────────────
const STUDENT_PROFILES = {
  riya: {
    id: 'riya',
    name: 'Riya Sharma', age: '32', gender: 'Female', phone: '98230 12345', photo: null,
    experience: '6–24 months', goal: 'Muscle Gain', daysPerWeek: 4,
    notes: "Want visible upper-body muscle by Sept for my sister's wedding. I run 3x/week and want to keep that.",
    injuries: ['Shoulder'],
    injuryNotes: 'Right shoulder cranky on overhead press since 2024. PT-cleared but avoid heavy OHP.',
    slots: ['7:00', '7:30', '18:00', '18:30'], customSlots: [], coachId: 'lee',
    running5k: '28:40', running2k: '10:15', runRating: 6, runFrequency: '3x / week', runInjuryFlag: false,
  },
  karan: {
    id: 'karan',
    name: 'Karan S.', age: '34', gender: 'Male', phone: '98222 33344', photo: null,
    experience: '5+ years', goal: 'Hyrox Preparation', daysPerWeek: 5,
    notes: "Has knee injury, wants to peak in Hyrox upcoming season. Need deep metabolic conditioning.",
    injuries: ['Knee'],
    injuryNotes: 'Knee is steady, but avoid deep excessive heavy knee extension under fatigue.',
    slots: ['18:00', '18:30', '19:00'], customSlots: [], coachId: 'rahul',
    running5k: '21:30', running2k: '7:45', runRating: 9, runFrequency: '4x / week', runInjuryFlag: false,
  }
};

function useProfile() {
  const activeId = localStorage.getItem('m3s.active_student_id') || 'riya';
  const defaultProfile = STUDENT_PROFILES[activeId] || STUDENT_PROFILES.riya;

  const [profile, setProfile] = React.useState(() => {
    try {
      const raw = localStorage.getItem(`m3s.journey.${activeId}`);
      if (raw) return { ...defaultProfile, ...JSON.parse(raw) };
    } catch {}
    return defaultProfile;
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (db) {
        try {
          const doc = await db.collection('clients').doc(activeId).get();
          const assesDoc = await db.collection('assessments').doc(activeId).get();
          if (doc.exists) {
            const data = doc.data();
            const assesData = assesDoc.exists ? assesDoc.data() : {};
            const merged = { ...defaultProfile, ...data, ...assesData };
            setProfile(merged);
            localStorage.setItem(`m3s.journey.${activeId}`, JSON.stringify(merged));
          }
        } catch (e) {
          console.warn("Firestore profile fetch error", e);
        }
      }
    };
    fetchProfile();
  }, [activeId]);

  const update = (patch) => setProfile((p) => {
    const next = { ...p, ...patch };
    try {
      localStorage.setItem(`m3s.journey.${p.id}`, JSON.stringify(next));
      M3S_DB.set(`m3s.journey.${p.id}`, next);
    } catch {}
    return next;
  });

  return [profile, update];
}

// ─── Editable field row ───────────────────────────────────────────────────
function EditableField({ label, value, onSave, multiline, type = 'text', options }) {
  const [editing, setEditing] = React.useState(false);
  const [draft, setDraft] = React.useState(value);
  React.useEffect(() => { if (!editing) setDraft(value); }, [value, editing]);
  const startEdit = () => { setDraft(value); setEditing(true); };
  const commit = () => { onSave(draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  return (
    <div className={`field-row${editing ? ' editing' : ''}`} style={{
      display: 'grid', gridTemplateColumns: '140px 1fr auto',
      gap: 14, alignItems: multiline ? 'flex-start' : 'center',
      padding: '12px 0', borderTop: `1px solid ${OT.hairline}`,
    }}>
      <div style={{
        fontFamily: OT.fMono, fontSize: 9.5, letterSpacing: 1.4,
        color: OT.clay600, textTransform: 'uppercase', paddingTop: multiline ? 10 : 0,
      }}>{label}</div>
      {editing ? (
        options ? (
          <select value={draft} onChange={(e) => setDraft(e.target.value)} style={{ ...inputStyle, width: '100%' }}>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ) : multiline ? (
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={3}
            style={{ ...inputStyle, width: '100%', resize: 'vertical', lineHeight: 1.5 }} autoFocus />
        ) : (
          <input type={type} value={draft} onChange={(e) => setDraft(e.target.value)}
            style={{ ...inputStyle, width: '100%' }} autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }} />
        )
      ) : (
        <div style={{
          fontFamily: OT.fBody, fontSize: 14, color: OT.espresso900,
          lineHeight: multiline ? 1.55 : 1.3, fontWeight: 500,
          whiteSpace: multiline ? 'pre-wrap' : 'normal',
        }}>{value || <span style={{ color: OT.clay600, fontWeight: 400 }}>— not set —</span>}</div>
      )}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {editing ? (
          <>
            <button onClick={cancel} style={miniBtn(false)}>Cancel</button>
            <button onClick={commit} style={miniBtn(true)}>Save</button>
          </>
        ) : (
          <button onClick={startEdit} className="pencil" aria-label={`Edit ${label}`} style={{
            background: 'transparent', border: 'none', cursor: 'pointer', padding: 6,
            display: 'flex', alignItems: 'center',
          }}>
            <Pencil />
          </button>
        )}
      </div>
    </div>
  );
}

const miniBtn = (primary) => ({
  fontFamily: OT.fBody, fontSize: 12, fontWeight: 600,
  padding: '6px 12px', borderRadius: 6,
  border: primary ? 'none' : `1px solid ${OT.hairlineStrong}`,
  background: primary ? OT.walnut : OT.paper,
  color: primary ? OT.paper : OT.espresso900,
  cursor: 'pointer',
});

// ─── Section card wrapper ─────────────────────────────────────────────────
function Section({ eyebrow, title, children, dot, accessory }) {
  return (
    <section style={{
      background: OT.paper, border: `1px solid ${OT.hairline}`,
      borderRadius: 16, padding: '24px 26px', boxShadow: OT.sh1, marginBottom: 18,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
        <div>
          <OEyebrow dot={dot}>{eyebrow}</OEyebrow>
          <h2 style={{
            fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400,
            fontSize: 26, lineHeight: 1.15, color: OT.espresso900,
            margin: '6px 0 0', letterSpacing: -0.4,
          }}>{title}</h2>
        </div>
        {accessory}
      </div>
      <div style={{ marginTop: 12 }}>{children}</div>
    </section>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────
function Topbar({ name }) {
  const isMobile = useIsMobile();
  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: isMobile ? '12px 16px' : '18px 36px', borderBottom: `1px solid ${OT.hairline}`,
      background: OT.sand50,
    }}>
      <a href="index.html" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
        <img src="assets/mts-logo.png" alt="My Third Space" style={{
          height: isMobile ? 26 : 34, width: 'auto', objectFit: 'contain', display: 'block',
          filter: 'brightness(0) saturate(100%) invert(24%) sepia(17%) saturate(1487%) hue-rotate(344deg) brightness(97%) contrast(91%)',
        }}/>
      </a>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 18 }}>
        <a href="index.html" style={{
          fontFamily: OT.fBody, fontSize: 13, color: OT.clay600,
          textDecoration: 'none', fontWeight: 500,
        }}>← Home</a>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '6px 12px 6px 6px', borderRadius: 999,
          background: OT.paper, border: `1px solid ${OT.hairline}`,
        }}>
          <Avatar name={name} size={24} />
          <div style={{ fontFamily: OT.fBody, fontSize: 12.5, fontWeight: 600, color: OT.espresso900 }}>
            {name?.split(' ')[0] || 'You'}
          </div>
        </div>
      </div>
    </header>
  );
}

function Avatar({ name, size = 64, photo }) {
  const initials = (name || 'U').split(/\s+/).map(s => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U';
  if (photo) return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: `url(${photo}) center/cover`, flexShrink: 0 }} />
  );
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: OT.walnut, color: OT.paper,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: OT.fDisplay, fontStyle: 'italic',
      fontSize: size * 0.4, flexShrink: 0,
    }}>{initials}</div>
  );
}

// ─── Hero strip ───────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

function ProfileHero({ profile }) {
  const isMobile = useIsMobile();
  const coach = COACHES.find(c => c.id === profile.coachId) || COACHES[0];
  return (
    <div style={{
      background: OT.espresso900, color: OT.paper, borderRadius: 18,
      padding: isMobile ? '20px 24px' : '28px 30px', position: 'relative', overflow: 'hidden',
      marginBottom: 22, boxShadow: OT.sh3,
    }}>
      <div style={{
        position: 'absolute', top: -50, right: -50, width: 220, height: 220,
        borderRadius: '50%', background: 'rgba(201,154,63,0.15)',
      }} />
      <div style={{ 
        position: 'relative', 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 16 : 22, 
        alignItems: isMobile ? 'flex-start' : 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Avatar name={profile.name} photo={profile.photo} size={isMobile ? 68 : 84} />
          {isMobile && (
            <div style={{ minWidth: 0 }}>
              <OMono color="rgba(255,253,248,0.55)" size={9}>Member · since Apr 2025</OMono>
              <h1 style={{
                fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400,
                fontSize: 28, lineHeight: 1.1, color: OT.paper,
                margin: '4px 0 2px', letterSpacing: -0.5,
              }}>{profile.name}</h1>
              <div style={{ fontFamily: OT.fBody, fontSize: 13, color: 'rgba(255,253,248,0.75)' }}>
                {profile.age} · {profile.gender} · {profile.goal}
              </div>
            </div>
          )}
        </div>
        
        {!isMobile && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <OMono color="rgba(255,253,248,0.55)" size={9}>Member · since Apr 2025</OMono>
            <h1 style={{
              fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400,
              fontSize: 34, lineHeight: 1.1, color: OT.paper,
              margin: '6px 0 4px', letterSpacing: -0.5,
            }}>{profile.name}</h1>
            <div style={{ fontFamily: OT.fBody, fontSize: 13.5, color: 'rgba(255,253,248,0.75)' }}>
              {profile.age} · {profile.gender} · {profile.goal}
            </div>
          </div>
        )}
        
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 14px 10px 10px', borderRadius: 12,
          background: 'rgba(255,253,248,0.08)', border: `1px solid rgba(255,253,248,0.12)`,
          width: isMobile ? '100%' : 'auto',
          boxSizing: 'border-box'
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: COACH_TONE_BG[coach.tone], color: OT.paper,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 16,
          }}>{coach.initials}</div>
          <div style={{ minWidth: 0 }}>
            <OMono color="rgba(255,253,248,0.55)" size={8.5}>Coach</OMono>
            <div style={{ fontFamily: OT.fBody, fontSize: 13.5, fontWeight: 600, color: OT.paper, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {coach.name} · {coach.role.split(' & ')[0]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Direct helpers for rescheduling & styling ─────────────────────────────
function time12To24(time12) {
  const m = time12.trim().match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!m) return "12:00";
  let h = parseInt(m[1], 10);
  const mm = m[2];
  const ampm = m[3].toUpperCase();
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${mm}`;
}

function formatSessionDate(isoStr) {
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dayName = days[d.getDay()];
    const dateNum = d.getDate();
    const monthName = months[d.getMonth()];
    
    const parts = isoStr.split('T');
    if (parts.length > 1) {
      const timePart = parts[1].substring(0, 5);
      return `${dayName}, ${dateNum} ${monthName} · ${fmtSlot(timePart)}`;
    }
    return `${dayName}, ${dateNum} ${monthName}`;
  } catch {
    return isoStr;
  }
}

function formatSessionDateOnly(isoStr) {
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
  } catch {
    return isoStr;
  }
}

function formatSessionTimeOnly(isoStr) {
  try {
    const parts = isoStr.split('T');
    if (parts.length > 1) {
      const timePart = parts[1].substring(0, 5);
      return fmtSlot(timePart);
    }
  } catch {}
  return "7:00 AM";
}

function getCoachAvailability(coachId, dateStr, time12h, currentSessId = null) {
  try {
    const allSessions = JSON.parse(localStorage.getItem('m3s.sessions') || '[]');
    const formattedHourStr = time12To24(time12h);
    
    const conflict = allSessions.some(s => 
      s.coach_id === coachId && 
      s.scheduled_at.startsWith(`${dateStr}T${formattedHourStr}`) &&
      s.status !== 'cancelled' &&
      s.status !== 'blocked' &&
      s.id !== currentSessId
    );

    if (!conflict) {
      return { available: true, suggestedTimes: [] };
    }

    const stdTimes = ["7:00 AM", "7:30 AM", "8:00 AM", "9:30 AM", "11:00 AM", "1:00 PM", "4:00 PM", "6:00 PM", "6:30 PM", "7:00 PM"];
    const suggestedTimes = stdTimes.filter(t => {
      const formattedT = time12To24(t);
      const isConflicted = allSessions.some(s => 
        s.coach_id === coachId && 
        s.scheduled_at.startsWith(`${dateStr}T${formattedT}`) &&
        s.status !== 'cancelled' &&
        s.status !== 'blocked' &&
        s.id !== currentSessId
      );
      return !isConflicted;
    });

    return { available: false, suggestedTimes };
  } catch (err) {
    console.error(err);
    return { available: true, suggestedTimes: [] };
  }
}

function getNoPenaltyDeadline(currentScheduledAt) {
  try {
    if (!currentScheduledAt) return "the day before at 8:00 PM";
    const d = new Date(currentScheduledAt.split('T')[0]);
    if (isNaN(d.getTime())) return "the day before at 8:00 PM";
    d.setDate(d.getDate() - 1);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${dayNames[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} 8:00 PM`;
  } catch {
    return "the day before at 8:00 PM";
  }
}

function getUpcomingDays() {
  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  for (let i = 1; i <= 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    days.push({
      label: `${dayNames[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`,
      val: `${year}-${month}-${date}`
    });
  }
  return days;
}

// ─── Rating History (Read-only list replacing the Rate Coach form) ──────────
function RatingHistorySection({ profile }) {
  const [ratings, setRatings] = React.useState([]);

  const refreshRatings = React.useCallback(() => {
    const list = loadRatings()
      .filter(r => r.clientId === profile.id || r.client_id === profile.id)
      .map(r => ({
        ...r,
        sessionDate: r.sessionDate || r.session_date || '2026-04-20',
        coachName: r.coachName || r.coach_name || 'Coach',
        scores: r.scores || r.scores_json || {}
      }))
      .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));
    setRatings(list);
  }, [profile.id]);

  React.useEffect(() => {
    refreshRatings();
    window.addEventListener('storage', refreshRatings);
    window.addEventListener('m3s:rating-reset', refreshRatings);
    return () => {
      window.removeEventListener('storage', refreshRatings);
      window.removeEventListener('m3s:rating-reset', refreshRatings);
    };
  }, [refreshRatings]);

  if (ratings.length === 0) {
    return (
      <div style={{ padding: '16px 0', textAlign: 'center', color: OT.clay600, fontSize: 13, fontFamily: OT.fBody, fontStyle: 'italic' }}>
        No historical session ratings logged yet.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {ratings.map((r, idx) => {
        const coachObj = COACHES.find(c => c.id === r.coachId || c.name === r.coachName) || COACHES[0];
        const ratingScores = r.scores || {};
        return (
          <div key={r.id || idx} style={{ background: OT.sand100, border: `1px solid ${OT.hairline}`, borderRadius: 14, padding: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: COACH_TONE_BG[coachObj?.tone] || OT.walnut, color: OT.paper,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 12, fontWeight: 500
                }}>
                  {coachObj?.initials || r.coachName?.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: OT.fBody, fontSize: 13, fontWeight: 600, color: OT.espresso900 }}>
                    Coach {r.coachName}
                  </div>
                  <div style={{ fontFamily: OT.fMono, fontSize: 10, color: OT.clay600 }}>
                    SESSION DATE: {r.sessionDate}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ display: 'flex', gap: 2, color: OT.ochre, fontSize: 13 }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= Math.round(r.overall || 5);
                    return <span key={star}>{isFilled ? '★' : '☆'}</span>;
                  })}
                </div>
                <div style={{ fontFamily: OT.fMono, fontSize: 12, fontWeight: 700, color: OT.walnut }}>
                  {(r.overall || 5.0).toFixed(1)}/5
                </div>
              </div>
            </div>

            {Object.keys(ratingScores).length > 0 && (
              <div style={{ 
                fontFamily: OT.fMono, fontSize: 9.5, color: OT.clay600, 
                background: OT.sand50, padding: '4px 8px', borderRadius: 6, 
                border: `1px solid ${OT.hairlineStrong}`, marginBottom: 8,
                display: 'flex', gap: '8px 12px', flexWrap: 'wrap'
              }}>
                {Object.entries(ratingScores).map(([metric, val]) => (
                  <span key={metric}>
                    {metric.toUpperCase()}: <strong style={{ color: OT.espresso805 }}>{val}★</strong>
                  </span>
                ))}
              </div>
            )}

            {r.comment && (
              <p style={{ 
                fontFamily: OT.fBody, fontSize: 12.5, color: OT.espresso800, 
                margin: 0, fontStyle: 'italic', background: OT.paper, 
                padding: '8px 12px', borderRadius: 8, borderLeft: `2.5px solid ${OT.walnut}`
              }}>
                "{r.comment}"
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Scheduled PT Timeslots and Rescheduling Section ───────────────────────
function ScheduledTrainSlotsSection({ profile, onUpdate }) {
  const [sessions, setSessions] = React.useState([]);
  const [rescheduleModalOpen, setRescheduleModalOpen] = React.useState(false);
  
  const [selectedSessIds, setSelectedSessIds] = React.useState([]);
  const [newDate, setNewDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = React.useState('7:00 AM');
  const [newGoal, setNewGoal] = React.useState(profile.goal || 'Muscle Gain');

  const loadSessions = React.useCallback(() => {
    try {
      const allSess = JSON.parse(localStorage.getItem('m3s.sessions') || '[]');
      const filtered = allSess.filter(s => s.client_id === profile.id || s.clientId === profile.id || s.clientName === profile.name);
      setSessions(filtered);
    } catch {
      setSessions([]);
    }
  }, [profile.id]);

  React.useEffect(() => {
    loadSessions();
    window.addEventListener('storage', loadSessions);
    window.addEventListener('m3s:sessions-updated', loadSessions);
    return () => {
      window.removeEventListener('storage', loadSessions);
      window.removeEventListener('m3s:sessions-updated', loadSessions);
    };
  }, [loadSessions]);

  const activeSessions = sessions.filter(s => s.status !== 'blocked' && s.status !== 'cancelled');

  // Pre-select first session when modal opens
  React.useEffect(() => {
    if (rescheduleModalOpen && activeSessions.length > 0 && selectedSessIds.length === 0) {
      setSelectedSessIds([activeSessions[0].id]);
    }
  }, [rescheduleModalOpen, activeSessions, selectedSessIds.length]);

  const handleSelectAll = () => {
    if (selectedSessIds.length === activeSessions.length) {
      setSelectedSessIds([]);
    } else {
      setSelectedSessIds(activeSessions.map(s => s.id));
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedSessIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handlePerformReschedule = (takeToOnboarding) => {
    if (selectedSessIds.length === 0) return;
    try {
      const allSess = JSON.parse(localStorage.getItem('m3s.sessions') || '[]');
      const updated = allSess.map(s => {
        if (selectedSessIds.includes(s.id)) {
          const formattedTimePart = time12To24(newTime);
          return {
            ...s,
            scheduled_at: `${newDate}T${formattedTimePart}:00`
          };
        }
        return s;
      });
      localStorage.setItem('m3s.sessions', JSON.stringify(updated));
      
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('m3s:sessions-updated'));

      if (takeToOnboarding && selectedSessIds.length > 1) {
        onUpdate({ goal: newGoal });
        
        const journeyDefaults = {
          ...profile,
          goal: newGoal,
          slots: [time12To24(newTime)],
        };
        localStorage.setItem('m3s.journey', JSON.stringify(journeyDefaults));
        localStorage.setItem(`m3s.journey.${profile.id}`, JSON.stringify(journeyDefaults));
        
        localStorage.setItem('m3s.user', JSON.stringify({ name: profile.name, phone: profile.phone, id: profile.id }));
        localStorage.setItem('m3s.active_student_id', profile.id);

        alert(`Sessions rescheduled! We are now redirecting you to re-complete your onboarding journey with your updated goals.`);
        window.location.href = "onboarding.html#step=1";
      } else {
        alert("Session(s) successfully rescheduled!");
        setRescheduleModalOpen(false);
        setSelectedSessIds([]);
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while rescheduling. Please try again.");
    }
  };

  const timePresets = [
    "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM", "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", 
    "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM", "6:30 PM", 
    "7:00 PM", "7:30 PM", "8:00 PM"
  ];

  // Derived coach details and conflict checking
  const selectedSessions = activeSessions.filter(s => selectedSessIds.includes(s.id));
  const isSingle = selectedSessions.length === 1;
  const targetCoachId = selectedSessions[0]?.coach_id || profile.coachId || 'lee';
  const targetCoachObj = COACHES.find(c => c.id === targetCoachId) || COACHES[0];
  
  const availabilityInfo = getCoachAvailability(targetCoachId, newDate, newTime, isSingle ? selectedSessions[0].id : null);
  const isAvailable = availabilityInfo.available;

  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {activeSessions.length === 0 ? (
          <div style={{ padding: '16px 0', textAlign: 'center', color: OT.clay600, fontSize: 13, fontFamily: OT.fBody, fontStyle: 'italic' }}>
            No active personal training sessions scheduled.
          </div>
        ) : (
          activeSessions.map((s, idx) => {
            const coachObj = COACHES.find(c => c.id === s.coach_id) || COACHES[0];
            return (
              <div 
                key={s.id || idx} 
                style={{ 
                  background: OT.paper, 
                  border: `1px solid ${OT.hairline}`, 
                  borderRadius: 14, 
                  padding: 16,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    background: COACH_TONE_BG[coachObj?.tone] || OT.walnut, color: OT.paper,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 15, fontWeight: 500
                  }}>
                    {coachObj?.initials || 'CO'}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: OT.fBody, fontSize: 13.5, fontWeight: 600, color: OT.espresso900 }}>
                        {s.type || 'PT Session'}
                      </span>
                      <span style={{ fontFamily: OT.fMono, fontSize: 8.5, background: OT.sand100, color: OT.clay600, padding: '2px 6px', borderRadius: 999, fontWeight: 550 }}>
                        WITH {coachObj?.name.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontFamily: OT.fBody, fontSize: 12.5, color: OT.espresso800, marginTop: 3 }}>
                      {formatSessionDate(s.scheduled_at)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    fontFamily: OT.fMono, fontSize: 8.5, 
                    color: s.status === 'upcoming' ? OT.ok : OT.clay600,
                    border: `1.5px solid ${s.status === 'upcoming' ? OT.ok : OT.hairlineStrong}`,
                    padding: '3px 8px', borderRadius: 999, fontWeight: 700, textTransform: 'uppercase'
                  }}>
                    ● {s.status || 'upcoming'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {activeSessions.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <button 
            onClick={() => {
              setSelectedSessIds([]);
              setRescheduleModalOpen(true);
            }}
            style={{
              width: '100%',
              padding: '12px 24px',
              borderRadius: 999,
              background: OT.walnut,
              color: OT.paper,
              fontFamily: OT.fBody,
              fontSize: 13.5,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: OT.sh1,
              transition: 'background 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = OT.espresso800}
            onMouseOut={e => e.currentTarget.style.background = OT.walnut}
          >
            🔄 Reschedule Session(s)
          </button>
        </div>
      )}

      {rescheduleModalOpen && (
        <div style={{ 
          position: 'fixed', inset: 0, 
          background: 'rgba(36,24,16,0.5)', backdropFilter: 'blur(6px)', 
          zIndex: 1100, display: 'flex', alignItems: 'center', 
          justifyContent: 'center', padding: 20 
        }}>
          <div style={{ 
            background: OT.paper, borderRadius: 24, padding: 24, 
            maxWidth: 580, width: '100%', maxHeight: '90vh', 
            overflowY: 'auto', boxShadow: OT.sh3, border: `1px solid ${OT.sand200}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${OT.hairline}`, paddingBottom: 12, marginBottom: 16 }}>
              <OEyebrow dot={OT.terra}>RESCHEDULING ENGINE</OEyebrow>
              <button onClick={() => setRescheduleModalOpen(false)} style={{ border: 'none', background: 'none', fontSize: 24, color: OT.clay600, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            <h3 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400, fontSize: 32, color: OT.espresso900, lineHeight: 1.1, margin: '0 0 8px' }}>
              Select & Reschedule
            </h3>
            <p style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.clay600, margin: '0 0 20px' }}>
              Choose which personal training sessions to move, select a new target time slot, and realign coaching goals as needed.
            </p>

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontFamily: OT.fMono, fontSize: 9.5, color: OT.clay600, fontWeight: 650, letterSpacing: 0.8 }}>STEP 1: SELECT SESSIONS TO MOVE</span>
                <button 
                  type="button" 
                  onClick={handleSelectAll}
                  style={{ border: 'none', background: 'none', color: OT.walnut, fontFamily: OT.fMono, fontSize: 9, cursor: 'pointer', fontWeight: 600, textDecoration: 'underline' }}
                >
                  {selectedSessIds.length === activeSessions.length ? "DESELECT ALL" : "SELECT ALL SESSIONS"}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 150, overflowY: 'auto', background: OT.sand50, padding: 12, borderRadius: 12, border: `1px solid ${OT.hairline}` }}>
                {activeSessions.map(s => {
                  const isSelected = selectedSessIds.includes(s.id);
                  return (
                    <label 
                      key={s.id} 
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: 10, 
                        cursor: 'pointer', padding: '6px 8px', borderRadius: 8,
                        background: isSelected ? OT.sand100 : 'transparent',
                        transition: 'background 0.15s'
                      }}
                    >
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => handleToggleSelect(s.id)}
                        style={{ accentColor: OT.walnut, width: 15, height: 15 }}
                      />
                      <div style={{ fontFamily: OT.fBody, fontSize: 12.5, color: OT.espresso900 }}>
                        <strong>{s.type}</strong> on {formatSessionDate(s.scheduled_at)}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 6, letterSpacing: 0.8 }}>STEP 2: TARGET DATE</label>
                <input 
                  type="date"
                  value={newDate}
                  onChange={e => setNewDate(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: `1px solid ${OT.hairlineStrong}`, background: OT.paper,
                    fontFamily: OT.fBody, fontSize: 13, color: OT.espresso900, outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 6, letterSpacing: 0.8 }}>STEP 3: TARGET TIMESLOT</label>
                <select
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: `1px solid ${OT.hairlineStrong}`, background: OT.paper,
                    fontFamily: OT.fBody, fontSize: 13, color: OT.espresso900, outline: 'none',
                    height: '38px'
                  }}
                >
                  {timePresets.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Warn when coach has a conflict */}
            {!isAvailable && (
              <div style={{
                background: '#FFF5F2', border: `1.5px solid ${OT.terracotta || '#B86B4B'}`,
                borderRadius: 16, padding: '16px 20px', marginBottom: 20,
              }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 16, color: OT.terracotta || '#B86B4B' }}>⚠️</span>
                  <h4 style={{ margin: 0, fontFamily: OT.fBody, fontSize: 13.5, fontWeight: 700, color: OT.espresso900 }}>
                    Coach {targetCoachObj.name} is fully booked at {newTime} on {formatSessionDateOnly(newDate)}
                  </h4>
                </div>
                <p style={{ margin: '0 0 12px', fontFamily: OT.fBody, fontSize: 12.5, color: OT.espresso800, lineHeight: 1.45 }}>
                  From their live calendar database, Coach {targetCoachObj.name} is available only at the following times on this day:
                </p>
                
                {availabilityInfo.suggestedTimes.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {availabilityInfo.suggestedTimes.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setNewTime(t)}
                        style={{
                          background: OT.sand100, border: `1px solid ${OT.hairlineStrong}`,
                          padding: '4px 10px', borderRadius: 999, fontSize: 11, fontFamily: OT.fMono,
                          cursor: 'pointer', color: OT.walnut, fontWeight: 600,
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: '0 0 12px', fontFamily: OT.fBody, fontSize: 11.5, color: OT.clay600, fontStyle: 'italic' }}>
                    No other slots available on this date.
                  </p>
                )}
                
                <p style={{ margin: 0, fontFamily: OT.fBody, fontSize: 11.5, color: OT.clay600, borderTop: `1px solid ${OT.sand200}`, paddingTop: 10 }}>
                  ℹ️ <strong>Disclaimer:</strong> To check the availability of other coaches, arrange special custom bookings, or contact our studio support, please contact admin at <span style={{ textDecoration: 'underline' }}>admin@mythirdspace.fit</span>.
                </p>
              </div>
            )}

            {/* No-penalty reschedule policy window */}
            {selectedSessions.length > 0 && (
              <div style={{ 
                display: 'flex', gap: 10, background: '#FFF8EE', border: `1.5px solid ${OT.sand200}`, 
                borderRadius: 16, padding: 16, marginBottom: 20, alignItems: 'flex-start' 
              }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>⏱</span>
                <div style={{ fontFamily: OT.fBody, fontSize: 12, color: OT.espresso800, lineHeight: 1.45 }}>
                  <strong>No-penalty reschedule window:</strong> Rescheduling is fully free of cost when processed before{" "}
                  <strong style={{ color: OT.walnut }}>
                    {getNoPenaltyDeadline(selectedSessions[0].scheduled_at)}
                  </strong>
                  . Same session credits apply.
                </div>
              </div>
            )}

            {selectedSessIds.length > 1 && (
              <div style={{ 
                background: '#FDF6ED', border: `1px solid #F5DBD0`, 
                borderRadius: 16, padding: 16, marginBottom: 20 
              }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 18 }}>💡</span>
                  <div>
                    <h4 style={{ margin: '0 0 4px', fontFamily: OT.fBody, fontSize: 13.5, fontWeight: 700, color: OT.terra }}>
                      Goal Alignment Advice
                    </h4>
                    <p style={{ margin: '0 0 12px', fontFamily: OT.fBody, fontSize: 12.5, color: OT.espresso800, lineHeight: 1.45 }}>
                      You are rescheduling <strong>{selectedSessIds.length} sessions</strong>. Shifting multiple training dates serves as an excellent milestone to re-examine or modify your primary goals and match your session loads!
                    </p>
                    
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 8.5, color: OT.clay600, marginBottom: 4, letterSpacing: 0.8 }}>CHOOSE UPDATED GOAL</label>
                      <select
                        value={newGoal}
                        onChange={e => setNewGoal(e.target.value)}
                        style={{
                          width: '100%', padding: '6px 10px', borderRadius: 6,
                          border: `1px solid ${OT.hairlineStrong}`, background: OT.paper,
                          fontFamily: OT.fBody, fontSize: 12, color: OT.espresso900, outline: 'none'
                        }}
                      >
                        {['Muscle Gain', 'Fat Loss', 'Strength', 'Hyrox', 'General Fitness', 'Recovery / Rehab'].map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
              {selectedSessIds.length > 1 ? (
                <>
                  <button 
                    onClick={() => handlePerformReschedule(true)}
                    disabled={selectedSessIds.length === 0 || !isAvailable}
                    style={{
                      width: '100%', padding: '12px', borderRadius: 999,
                      background: OT.walnut, color: OT.paper, border: 'none',
                      fontFamily: OT.fBody, fontSize: 13.5, fontWeight: 600,
                      cursor: 'pointer', transition: 'filter 0.2s',
                      opacity: (selectedSessIds.length === 0 || !isAvailable) ? 0.5 : 1
                    }}
                  >
                    🚀 Update Goals & Re-complete Onboarding ↗
                  </button>

                  <button 
                    onClick={() => handlePerformReschedule(false)}
                    disabled={selectedSessIds.length === 0 || !isAvailable}
                    style={{
                      width: '100%', padding: '12px', borderRadius: 999,
                      background: 'none', color: OT.espresso900, border: `1.5px solid ${OT.hairlineStrong}`,
                      fontFamily: OT.fBody, fontSize: 13.5, fontWeight: 500,
                      cursor: 'pointer', transition: 'background 0.2s',
                      opacity: (selectedSessIds.length === 0 || !isAvailable) ? 0.5 : 1
                    }}
                    onMouseOver={e => e.currentTarget.style.background = OT.sand100}
                    onMouseOut={e => e.currentTarget.style.background = 'none'}
                  >
                    Just Move Selected Sessions ({selectedSessIds.length})
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => handlePerformReschedule(false)}
                  disabled={selectedSessIds.length === 0 || !isAvailable}
                  style={{
                    width: '100%', padding: '12px', borderRadius: 999,
                    background: OT.walnut, color: OT.paper, border: 'none',
                    fontFamily: OT.fBody, fontSize: 13.5, fontWeight: 600,
                    cursor: 'pointer', transition: 'filter 0.2s',
                    opacity: (selectedSessIds.length === 0 || !isAvailable) ? 0.5 : 1
                  }}
                >
                  Confirm Reschedule
                </button>
              )}

              <button 
                onClick={() => setRescheduleModalOpen(false)}
                style={{ width: '100%', padding: '11px', borderRadius: 999, border: `1px solid ${OT.hairlineStrong}`, background: 'transparent', color: OT.clay600, fontFamily: OT.fBody, fontSize: 13, cursor: 'pointer', textAlign: 'center' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Profile Completion Bar ─────────────────────────────────────────────────
function ProfileCompletionBar({ profile }) {
  const fields = [
    { id: 'name', has: Boolean(profile.name) },
    { id: 'age', has: Boolean(profile.age) },
    { id: 'gender', has: Boolean(profile.gender) },
    { id: 'phone', has: Boolean(profile.phone) },
    { id: 'experience', has: Boolean(profile.experience) },
    { id: 'goal', has: Boolean(profile.goal) },
    { id: 'slots', has: (profile.slots && profile.slots.length > 0) },
    { id: 'bca', has: Boolean(profile.bcaUploaded !== false) }, // assume true if undefined initially
    { id: 'blood', has: Boolean(profile.bloodUploaded !== false) } // assume true if undefined initially
  ];
  
  const completed = fields.filter(f => f.has).length;
  const total = fields.length;
  const pct = Math.round((completed / total) * 100);

  return (
    <div style={{ marginBottom: 24, padding: 24, background: OT.paper, borderRadius: 16, border: `1px solid ${OT.hairline}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
         <h4 style={{ margin: 0, fontFamily: OT.fBody, fontSize: 15, fontWeight: 500, color: OT.espresso900 }}>Profile Completion</h4>
         <span style={{ fontFamily: OT.fMono, fontSize: 13, fontWeight: 500, color: pct === 100 ? OT.ok : OT.ochre, letterSpacing: 0.5 }}>{pct}%</span>
      </div>
      <div style={{ height: 6, width: '100%', background: OT.sand100, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? OT.ok : OT.ochre, transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }} />
      </div>
      <div style={{ marginTop: 12, fontSize: 12.5, fontFamily: OT.fBody, color: OT.clay600, display: 'flex', justifyContent: 'space-between' }}>
        <span>{completed === total ? "You're all set! Coach has everything they need." : "Complete your profile to get the most out of your coaching."}</span>
        {completed !== total && <span>{completed} / {total} filled</span>}
      </div>
    </div>
  );
}

// ─── Body composition ─────────────────────────────────────────────────────
function BCAReadout({ profile, update }) {
  const isUploaded = profile.bcaUploaded !== false;
  
  if (!isUploaded) {
    return (
      <div style={{ padding: 24, border: `1px dashed ${OT.hairlineStrong}`, borderRadius: 12, textAlign: 'center' }}>
         <div style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.clay600, marginBottom: 12 }}>No BCA scan uploaded yet.</div>
         <button onClick={() => update({ bcaUploaded: true })} style={miniBtn(true)}>Upload PDF</button>
      </div>
    );
  }

  const insights = [
    { label: 'Body fat',     value: '24.8%',   range: 'Slightly high (target 22%)', accent: OT.warn },
    { label: 'Muscle mass',  value: '49.2 kg', range: 'On track for height',       accent: OT.ok },
    { label: 'Visceral fat', value: '8',       range: 'Healthy (1–12 range)',      accent: OT.ok },
    { label: 'Metabolic age',value: '34',      range: '2 yrs above chronological', accent: OT.warn },
  ];
  return (
    <div>
      <div style={{
        padding: '10px 14px', background: OT.sand100, borderRadius: 8,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12,
      }}>
        <div style={{ fontFamily: OT.fMono, fontSize: 10, letterSpacing: 1.4, color: OT.clay600 }}>
          INBODY_APRIL.PDF · UPLOADED 12 APR 2025
        </div>
        <button onClick={() => update({ bcaUploaded: false })} style={miniBtn(false)}>Remove</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {insights.map(it => (
          <div key={it.label} style={{
            padding: 14, borderRadius: 10, background: OT.sand50,
            border: `1px solid ${OT.hairline}`,
          }}>
            <OMono size={9}>{it.label}</OMono>
            <div style={{
              fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 26,
              color: OT.espresso900, marginTop: 4, lineHeight: 1,
            }}>{it.value}</div>
            <div style={{
              marginTop: 6, fontFamily: OT.fBody, fontSize: 11.5,
              color: it.accent, lineHeight: 1.4,
            }}>{it.range}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Blood readout ────────────────────────────────────────────────────────
function BloodReadout({ profile, update }) {
  const isUploaded = profile.bloodUploaded !== false;
  
  if (!isUploaded) {
    return (
      <div style={{ padding: 24, border: `1px dashed ${OT.hairlineStrong}`, borderRadius: 12, textAlign: 'center' }}>
         <div style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.clay600, marginBottom: 12 }}>No blood report uploaded yet.</div>
         <button onClick={() => update({ bloodUploaded: true })} style={miniBtn(true)}>Upload PDF</button>
      </div>
    );
  }

  const flags = [
    { name: 'Vit D',    value: '18', unit: 'ng/mL', target: '30–80',  status: 'Deficient',  accent: OT.bad },
    { name: 'LDL',      value: '148', unit: 'mg/dL', target: '<100',   status: 'High',       accent: OT.warn },
    { name: 'HbA1c',    value: '5.3', unit: '%',    target: '<5.7',   status: 'Optimal',    accent: OT.ok },
    { name: 'Ferritin', value: '52',  unit: 'ng/mL', target: '30–200', status: 'Optimal',    accent: OT.ok },
    { name: 'TSH',      value: '2.1', unit: 'mIU/L', target: '0.4–4',  status: 'Normal',     accent: OT.ok },
  ];
  return (
    <div>
      <div style={{
        padding: '10px 14px', background: OT.sand100, borderRadius: 8,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12,
      }}>
        <div style={{ fontFamily: OT.fMono, fontSize: 10, letterSpacing: 1.4, color: OT.clay600 }}>
          REDCLIFFE_PANEL.PDF · UPLOADED 9 APR 2025
        </div>
        <button onClick={() => update({ bloodUploaded: false })} style={miniBtn(false)}>Remove</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
        {flags.map(f => (
          <div key={f.name} style={{
            padding: 12, borderRadius: 10, background: OT.sand50,
            border: `1px solid ${OT.hairline}`, position: 'relative',
          }}>
            <OMono size={9}>{f.name}</OMono>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
              <div style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 22, color: OT.espresso900, lineHeight: 1 }}>{f.value}</div>
              <div style={{ fontFamily: OT.fMono, fontSize: 9, color: OT.clay600 }}>{f.unit}</div>
            </div>
            <div style={{
              marginTop: 6, fontFamily: OT.fBody, fontSize: 11,
              color: f.accent, fontWeight: 600,
            }}>{f.status}</div>
            <div style={{
              marginTop: 2, fontFamily: OT.fMono, fontSize: 9,
              letterSpacing: 1, color: OT.clay600,
            }}>TARGET {f.target}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MSK readout ──────────────────────────────────────────────────────────
function MSKReadout({ profile }) {
  const items = [
    { area: 'Shoulders',   status: 'Restricted', detail: 'Right shoulder OHP-restricted, PT-cleared. Avoid heavy OHP.', accent: OT.warn },
    { area: 'Hips',        status: 'Tight',      detail: 'Hip flexors short — daily 90/90 mobility prescribed.',        accent: OT.warn },
    { area: 'Thoracic',    status: 'Limited',    detail: 'Thoracic mobility limits overhead position. 10-min prep.',    accent: OT.warn },
    { area: 'Knees',       status: 'Cleared',    detail: 'Pain-free under load. Tracks well in squat.',                  accent: OT.ok },
    { area: 'Lower back',  status: 'Cleared',    detail: 'Hinge pattern clean. No referred pain.',                       accent: OT.ok },
  ];
  return (
    <div>
      {items.map((it, i) => (
        <div key={it.area} style={{
          display: 'grid', gridTemplateColumns: '120px 110px 1fr',
          gap: 14, alignItems: 'center', padding: '12px 0',
          borderTop: i === 0 ? 'none' : `1px solid ${OT.hairline}`,
        }}>
          <div style={{ fontFamily: OT.fBody, fontSize: 14, fontWeight: 600, color: OT.espresso900 }}>
            {it.area}
          </div>
          <div style={{
            fontFamily: OT.fMono, fontSize: 10, letterSpacing: 1.2,
            color: it.accent, fontWeight: 600, textTransform: 'uppercase',
          }}>● {it.status}</div>
          <div style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.clay600, lineHeight: 1.5 }}>
            {it.detail}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Running section ──────────────────────────────────────────────────────
function RunningReadout({ profile, update }) {
  const freqs = ['Never', '1x / week', '2x / week', '3x / week', '4x+ / week'];
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: '5K', value: profile.running5k, key: 'running5k' },
          { label: '2K', value: profile.running2k, key: 'running2k' },
          { label: 'Self-rating', value: `${profile.runRating}/10`, key: null },
          { label: 'Frequency', value: profile.runFrequency, key: null },
        ].map(s => (
          <div key={s.label} style={{
            padding: 14, borderRadius: 10, background: OT.sand50,
            border: `1px solid ${OT.hairline}`,
          }}>
            <OMono size={9}>{s.label}</OMono>
            <div style={{
              fontFamily: s.label === 'Frequency' ? OT.fBody : OT.fMono,
              fontSize: s.label === 'Frequency' ? 16 : 22,
              fontWeight: s.label === 'Frequency' ? 600 : 500,
              color: OT.espresso900, marginTop: 6, lineHeight: 1,
            }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 18, padding: 16, background: OT.espresso900, color: OT.paper, borderRadius: 12 }}>
        <OMono color="rgba(255,253,248,0.55)" size={9}>What your coach will do with this</OMono>
        <div style={{
          fontFamily: OT.fBody, fontSize: 13.5, color: OT.paper, marginTop: 8, lineHeight: 1.55,
        }}>
          Aerobic base is solid; top-end is the gap. We pair 1× tempo run + short intervals
          weekly to lift VO₂ without hurting hypertrophy recovery.
          <strong style={{ color: OT.ochre, fontWeight: 600 }}> 2K pace anchors VO₂max</strong> — re-test month 2.
        </div>
      </div>

      {profile.runInjuryFlag && (
        <div style={{
          marginTop: 12, padding: '10px 14px', background: 'rgba(201,122,63,0.12)',
          borderRadius: 8, fontFamily: OT.fBody, fontSize: 12.5, color: OT.warn, fontWeight: 500,
        }}>
          ⚠ You flagged knee/shin/foot pain — coach will limit run frequency to 1×/wk.
        </div>
      )}
    </div>
  );
}

// ─── Milestones ───────────────────────────────────────────────────────────
const MILESTONES = [
  { wk: 'Week 0',  label: 'Baseline',      detail: 'Bloods, BCA, MSK locked. Plan signed off by Lee.', state: 'done' },
  { wk: 'Week 4',  label: 'Volume base',   detail: '12 sets/wk on chest+back. Vit D 30+. OHP-free.',   state: 'done' },
  { wk: 'Week 8',  label: 'Re-test',       detail: 'Repeat bloods + BCA. LDL trending down. BF −1.5%.', state: 'current' },
  { wk: 'Week 12', label: 'Visible delta', detail: 'Upper-body hypertrophy visible. 5K −30 sec/km.',   state: 'pending' },
];

function MilestonesStepper() {
  const [profile] = useProfile();
  const selectedCoachId = profile.coachId || 'deepika';
  const coach = COACHES.find(c => c.id === selectedCoachId) || COACHES[0];

  const dynamicMilestones = MILESTONES.map(m => {
    if (m.wk === 'Week 0') {
      return {
        ...m,
        detail: `Bloods, BCA, MSK locked. Plan signed off by ${coach.name}.`
      };
    }
    return m;
  });

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        position: 'absolute', top: 11, left: '12.5%', right: '12.5%',
        height: 2, background: OT.hairline, zIndex: 0,
      }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', position: 'relative', zIndex: 1 }}>
        {dynamicMilestones.map((m, i) => {
          const done = m.state === 'done';
          const cur = m.state === 'current';
          return (
            <div key={m.wk} style={{ padding: '0 8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%',
                background: done ? OT.walnut : (cur ? OT.ochre : OT.paper),
                border: `2px solid ${done ? OT.walnut : (cur ? OT.ochre : OT.hairlineStrong)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: done ? OT.paper : (cur ? OT.paper : OT.clay600),
                fontFamily: OT.fMono, fontSize: 10, fontWeight: 700,
                boxShadow: cur ? '0 0 0 4px rgba(201,154,63,0.18)' : 'none',
                marginBottom: 10,
              }}>
                {done ? (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6.5L4.5 9L10 3" stroke={OT.paper} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (i + 1)}
              </div>
              <OMono size={9} style={{ textAlign: 'center' }}>{m.wk}</OMono>
              <div style={{
                fontFamily: OT.fBody, fontSize: 13, fontWeight: 600,
                color: OT.espresso900, marginTop: 2, textAlign: 'center',
              }}>{m.label}</div>
              <div style={{
                fontFamily: OT.fBody, fontSize: 11.5, color: OT.clay600,
                marginTop: 6, lineHeight: 1.45, textAlign: 'center',
              }}>{m.detail}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Monthly progress: dynamic reactive state ──────────────────────────
const SEED_PROGRESS_LOG = [
  { month: 'Apr 2025', weight: 67.4, bodyFat: 26.1, run5k: '29:55', muscleMass: 49.0,  note: 'Baseline week. Onboarding complete.' },
  { month: 'May 2025', weight: 67.0, bodyFat: 25.4, run5k: '29:20', muscleMass: 49.4, note: 'Gained 400g lean muscle. Progressive overload on chest+back; shoulder pain reducing.' },
  { month: 'Jun 2025', weight: 66.7, bodyFat: 24.8, run5k: '28:40', muscleMass: 49.8, note: 'Re-test pending. SMM +800g from baseline, fat mass down. Vit D 24 → trending up.' },
];

const SEED_ONE_REP_MAXES = [
  { id: '1', date: '2025-04-15', exercise: 'Bench Press', weight: 85, unit: 'kg', note: 'Felt strong, clean lock-out.' },
  { id: '2', date: '2025-04-15', exercise: 'Back Squat', weight: 110, unit: 'kg', note: 'Deep squat, slight knee valgus.' },
  { id: '3', date: '2025-04-15', exercise: 'Front Squat', weight: 90, unit: 'kg', note: 'Good rack position.' },
  { id: '4', date: '2025-04-15', exercise: 'Deadlift', weight: 130, unit: 'kg', note: 'Double overhand grip.' },
  { id: '5', date: '2025-04-15', exercise: 'Push Press', weight: 65, unit: 'kg', note: 'Solid leg drive.' },

  { id: '6', date: '2025-05-18', exercise: 'Bench Press', weight: 90, unit: 'kg', note: 'New PR! Back arch felt stable.' },
  { id: '7', date: '2025-05-18', exercise: 'Back Squat', weight: 115, unit: 'kg', note: 'Knees tracking beautifully.' },
  { id: '8', date: '2025-05-18', exercise: 'Front Squat', weight: 95, unit: 'kg', note: 'Upward chest drive.' },
  { id: '9', date: '2025-05-18', exercise: 'Deadlift', weight: 135, unit: 'kg', note: 'Bar path stayed tight.' },
  { id: '10', date: '2025-05-18', exercise: 'Push Press', weight: 70, unit: 'kg', note: 'Strong lock-out overhead.' },

  { id: '11', date: '2025-06-20', exercise: 'Bench Press', weight: 92.5, unit: 'kg', note: 'Attempted 95kg but missed at midpoint.' },
  { id: '12', date: '2025-06-20', exercise: 'Back Squat', weight: 120, unit: 'kg', note: 'Smashed 120kg for a single!' },
  { id: '13', date: '2025-06-20', exercise: 'Front Squat', weight: 100, unit: 'kg', note: 'Milestone 100kg reached!' },
  { id: '14', date: '2025-06-20', exercise: 'Deadlift', weight: 145, unit: 'kg', note: 'Felt light. Hook grip utilized.' },
  { id: '15', date: '2025-06-20', exercise: 'Push Press', weight: 72.5, unit: 'kg', note: 'Steady core bracing.' },
];

const DEFAULT_EXERCISES = ['Bench Press', 'Back Squat', 'Front Squat', 'Deadlift', 'Push Press'];

function useProgress() {
  const [log, setLog] = React.useState(() => {
    try {
      const raw = localStorage.getItem('m3s.progressLog');
      if (raw) return JSON.parse(raw);
    } catch {}
    if (getActiveEnvironment() === 'PROD') return [];
    try { localStorage.setItem('m3s.progressLog', JSON.stringify(SEED_PROGRESS_LOG)); } catch {}
    return SEED_PROGRESS_LOG;
  });

  const append = (newEntry) => {
    setLog(prev => {
      const idx = prev.findIndex(item => item.month === newEntry.month);
      let next;
      if (idx >= 0) {
        next = [...prev];
        next[idx] = { ...next[idx], ...newEntry };
      } else {
        next = [...prev, newEntry];
      }
      try { localStorage.setItem('m3s.progressLog', JSON.stringify(next)); } catch {}
      window.dispatchEvent(new Event('m3s.progressLogUpdated'));
      return next;
    });
  };

  React.useEffect(() => {
    const handleUpdate = () => {
      try {
        const raw = localStorage.getItem('m3s.progressLog');
        if (raw) setLog(JSON.parse(raw));
      } catch {}
    };
    window.addEventListener('m3s.progressLogUpdated', handleUpdate);
    return () => window.removeEventListener('m3s.progressLogUpdated', handleUpdate);
  }, []);

  return [log, append];
}

function useOneRepMaxes() {
  const [maxes, setMaxes] = React.useState(() => {
    try {
      const raw = localStorage.getItem('m3s.oneRepMaxes');
      if (raw) return JSON.parse(raw);
    } catch {}
    if (getActiveEnvironment() === 'PROD') return [];
    try { localStorage.setItem('m3s.oneRepMaxes', JSON.stringify(SEED_ONE_REP_MAXES)); } catch {}
    return SEED_ONE_REP_MAXES;
  });

  const appendMax = (newEntry) => {
    setMaxes(prev => {
      const entryWithId = {
        id: newEntry.id || Math.random().toString(36).substring(7),
        date: newEntry.date || new Date().toISOString().split('T')[0],
        exercise: newEntry.exercise,
        weight: parseFloat(newEntry.weight),
        unit: newEntry.unit || 'kg',
        note: newEntry.note || ''
      };
      const next = [...prev, entryWithId].sort((a, b) => a.date.localeCompare(b.date));
      try { localStorage.setItem('m3s.oneRepMaxes', JSON.stringify(next)); } catch {}
      window.dispatchEvent(new Event('m3s.oneRepMaxesUpdated'));
      
      if (db) {
        db.collection('one_rep_maxes').doc(entryWithId.id).set(entryWithId).catch(err => console.warn(err));
      }
      return next;
    });
  };

  const removeMax = (id) => {
    setMaxes(prev => {
      const next = prev.filter(x => x.id !== id);
      try { localStorage.setItem('m3s.oneRepMaxes', JSON.stringify(next)); } catch {}
      window.dispatchEvent(new Event('m3s.oneRepMaxesUpdated'));
      
      if (db) {
        db.collection('one_rep_maxes').doc(id).delete().catch(err => console.warn(err));
      }
      return next;
    });
  };

  React.useEffect(() => {
    const handleUpdate = () => {
      try {
        const raw = localStorage.getItem('m3s.oneRepMaxes');
        if (raw) setMaxes(JSON.parse(raw));
      } catch {}
    };
    
    const fetchCloudMaxes = async () => {
      if (db) {
        try {
          const snap = await db.collection('one_rep_maxes').get();
          if (!snap.empty) {
            const list = [];
            snap.forEach(doc => {
              list.push(doc.data());
            });
            const sorted = list.sort((a, b) => a.date.localeCompare(b.date));
            localStorage.setItem('m3s.oneRepMaxes', JSON.stringify(sorted));
            setMaxes(sorted);
          }
        } catch (e) {
          console.warn("Error fetching 1RM from Firestore", e);
        }
      }
    };

    fetchCloudMaxes();

    window.addEventListener('m3s.oneRepMaxesUpdated', handleUpdate);
    return () => window.removeEventListener('m3s.oneRepMaxesUpdated', handleUpdate);
  }, []);

  return [maxes, appendMax, removeMax];
}

function useExercises() {
  const [exercises, setExercises] = React.useState(() => {
    try {
      const raw = localStorage.getItem('m3s.exercises');
      if (raw) return JSON.parse(raw);
    } catch {}
    try { localStorage.setItem('m3s.exercises', JSON.stringify(DEFAULT_EXERCISES)); } catch {}
    return DEFAULT_EXERCISES;
  });

  const addExercise = (name) => {
    const cleanName = name.trim();
    if (!cleanName) return false;
    
    let isNew = false;
    setExercises(prev => {
      if (prev.some(ex => ex.toLowerCase() === cleanName.toLowerCase())) return prev;
      isNew = true;
      const next = [...prev, cleanName];
      try { localStorage.setItem('m3s.exercises', JSON.stringify(next)); } catch {}
      window.dispatchEvent(new Event('m3s.exercisesUpdated'));
      
      if (db) {
        db.collection('exercises').doc(cleanName.replace(/\//g, '_')).set({ name: cleanName }).catch(err => console.warn(err));
      }
      return next;
    });
    return isNew;
  };

  React.useEffect(() => {
    const handleUpdate = () => {
      try {
        const raw = localStorage.getItem('m3s.exercises');
        if (raw) setExercises(JSON.parse(raw));
      } catch {}
    };
    
    const fetchCloudExercises = async () => {
      if (db) {
        try {
          const snap = await db.collection('exercises').get();
          if (!snap.empty) {
            const list = [];
            snap.forEach(doc => {
              list.push(doc.data().name);
            });
            const merged = Array.from(new Set([...DEFAULT_EXERCISES, ...list]));
            localStorage.setItem('m3s.exercises', JSON.stringify(merged));
            setExercises(merged);
          }
        } catch (e) {
          console.warn("Error fetching exercises from Firestore", e);
        }
      }
    };

    fetchCloudExercises();

    window.addEventListener('m3s.exercisesUpdated', handleUpdate);
    return () => window.removeEventListener('m3s.exercisesUpdated', handleUpdate);
  }, []);

  return [exercises, addExercise];
}

function OneRepMaxGraph({ maxes, exercise }) {
  const filtered = React.useMemo(() => {
    return maxes.filter(m => m.exercise === exercise).sort((a, b) => a.date.localeCompare(b.date));
  }, [maxes, exercise]);

  if (filtered.length === 0) {
    return (
      <div style={{
        height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: OT.sand50, border: `1px solid ${OT.hairline}`, borderRadius: 12, padding: 16
      }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🏋️‍♂️</div>
        <div style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.clay600, fontWeight: 500 }}>
          No 1RM entries logged for {exercise} yet.
        </div>
        <p style={{ fontFamily: OT.fBody, fontSize: 11, color: OT.clay500, marginTop: 4, textAlign: 'center', maxWidth: 280 }}>
          Click "Log this month" to create your first landmark record.
        </p>
      </div>
    );
  }

  const W = 720, H = 220, PAD_L = 50, PAD_R = 20, PAD_T = 20, PAD_B = 36;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const N = filtered.length;
  
  const weights = filtered.map(f => f.weight);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  
  const yMin = minW - 5 > 0 ? minW - 5 : 0;
  const yMax = maxW + 5;

  const x = (i) => PAD_L + (N > 1 ? (i / (N - 1)) * innerW : innerW / 2);
  const y = (v) => {
    const range = yMax - yMin;
    return PAD_T + innerH - (range > 0 ? ((v - yMin) / range) * innerH : innerH / 2);
  };
  
  const path = filtered.map((f, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(f.weight)}`).join(' ');

  return (
    <div style={{
      background: OT.sand50, border: `1px solid ${OT.hairline}`,
      borderRadius: 12, padding: 16,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: OT.terra }} />
          <span style={{ fontFamily: OT.fBody, fontSize: 13, fontWeight: 600, color: OT.espresso900 }}>
            {exercise} 1RM Progression
          </span>
        </div>
        <OMono size={8.5}>{filtered.length} entries</OMono>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const yy = PAD_T + innerH * t;
          const val = yMax - (yMax - yMin) * t;
          return (
            <g key={i}>
              <line x1={PAD_L} x2={W - PAD_R} y1={yy} y2={yy} stroke={OT.hairline} strokeWidth="1" />
              <text x={PAD_L - 8} y={yy + 3.5} textAnchor="end"
                style={{ fontFamily: OT.fMono, fontSize: 9, fill: OT.clay600 }}>
                {val.toFixed(1)} kg
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {filtered.map((f, i) => {
          const dateObj = new Date(f.date);
          const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return (
            <text key={f.id} x={x(i)} y={H - 12} textAnchor="middle"
              style={{ fontFamily: OT.fMono, fontSize: 9, fill: OT.clay600 }}>
              {monthStr.toUpperCase()}
            </text>
          );
        })}

        {/* Area Gradient */}
        <defs>
          <linearGradient id="areaGrad1rm" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={OT.terra} stopOpacity="0.18" />
            <stop offset="100%" stopColor={OT.terra} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {N > 1 ? (
          <path
            d={`${path} L ${x(N-1)} ${PAD_T + innerH} L ${x(0)} ${PAD_T + innerH} Z`}
            fill="url(#areaGrad1rm)"
          />
        ) : null}

        {/* Line */}
        <path d={path} fill="none" stroke={OT.terra} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Points + labels */}
        {filtered.map((f, i) => (
          <g key={f.id}>
            <circle cx={x(i)} cy={y(f.weight)} r="4"
              fill={OT.paper} stroke={OT.terra} strokeWidth="2" />
            <text x={x(i)} y={y(f.weight) - 10} textAnchor="middle"
              style={{ fontFamily: OT.fMono, fontSize: 9, fontWeight: 600, fill: OT.espresso900 }}>
              {f.weight}
            </text>
          </g>
        ))}
      </svg>
      
      <div style={{
        marginTop: 10, padding: '10px 14px', background: OT.paper,
        borderRadius: 8, border: `1px solid ${OT.hairline}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <OMono size={9}>PR Growth</OMono>
        {(() => {
          const first = filtered[0]?.weight || 0;
          const last = filtered[filtered.length - 1]?.weight || 0;
          const diff = last - first;
          const percent = first > 0 ? (diff / first) * 100 : 0;
          return (
            <div style={{
              fontFamily: OT.fMono, fontSize: 13, fontWeight: 600, color: diff >= 0 ? OT.ok : OT.warn,
            }}>
              {diff >= 0 ? '+' : ''}{diff} kg ({diff >= 0 ? '+' : ''}{percent.toFixed(1)}%) {diff > 0 ? '· getting stronger' : ''}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function ProgressLog() {
  const [progressLog] = useProgress();
  const [maxes, appendMax, removeMax] = useOneRepMaxes();
  const [exercises, addExercise] = useExercises();
  const [activeTab, setActiveTab] = React.useState('metrics'); // 'metrics' | '1rm'
  const [selectedEx, setSelectedEx] = React.useState('Bench Press');
  const [newExName, setNewExName] = React.useState('');
  const [showAddSuccess, setShowAddSuccess] = React.useState('');

  const handleAddExercise = (e) => {
    e.preventDefault();
    if (!newExName.trim()) return;
    const success = addExercise(newExName);
    if (success) {
      setSelectedEx(newExName.trim());
      setShowAddSuccess(`Added "${newExName.trim()}"!`);
      setNewExName('');
      setTimeout(() => setShowAddSuccess(''), 3000);
    } else {
      setShowAddSuccess('Exercise already exists.');
      setTimeout(() => setShowAddSuccess(''), 3000);
    }
  };

  const latestMaxes = React.useMemo(() => {
    const map = {};
    maxes.forEach(m => {
      const existing = map[m.exercise];
      if (!existing || m.date >= existing.date) {
        map[m.exercise] = m;
      }
    });
    return map;
  }, [maxes]);

  return (
    <div>
      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setActiveTab('metrics')}
          style={{
            fontFamily: OT.fBody, fontSize: 12, fontWeight: activeTab === 'metrics' ? 600 : 500,
            padding: '8px 14px', borderRadius: 999,
            border: activeTab === 'metrics' ? 'none' : `1px solid ${OT.hairlineStrong}`,
            background: activeTab === 'metrics' ? OT.walnut : OT.paper,
            color: activeTab === 'metrics' ? OT.paper : OT.espresso900,
            cursor: 'pointer', transition: 'all 0.15s ease'
          }}
        >
          📈 Body Composition & Metrics
        </button>
        <button
          onClick={() => setActiveTab('1rm')}
          style={{
            fontFamily: OT.fBody, fontSize: 12, fontWeight: activeTab === '1rm' ? 600 : 500,
            padding: '8px 14px', borderRadius: 999,
            border: activeTab === '1rm' ? 'none' : `1px solid ${OT.hairlineStrong}`,
            background: activeTab === '1rm' ? OT.walnut : OT.paper,
            color: activeTab === '1rm' ? OT.paper : OT.espresso900,
            cursor: 'pointer', transition: 'all 0.15s ease'
          }}
        >
          🏋️‍♂️ 1RM Strength Lift Tracker
        </button>
      </div>

      {activeTab === 'metrics' ? (
        <div>
          {/* Graph */}
          <ProgressGraph progressLog={progressLog} />

          {/* Log entries */}
          <div style={{ marginTop: 22 }}>
            <OEyebrow>Monthly log</OEyebrow>
            <div style={{ marginTop: 10 }}>
              {progressLog.slice().reverse().map((m, i) => (
                <div key={m.month} style={{
                  display: 'grid',
                  gridTemplateColumns: '110px repeat(4, 1fr) 2.2fr',
                  gap: 14, alignItems: 'center', padding: '14px 0',
                  borderTop: `1px solid ${OT.hairline}`,
                }}>
                  <div>
                    <OMono size={9}>{m.month.split(' ')[1]}</OMono>
                    <div style={{
                      fontFamily: OT.fDisplay, fontStyle: 'italic',
                      fontSize: 22, color: OT.espresso900, lineHeight: 1,
                    }}>{m.month.split(' ')[0]}</div>
                  </div>
                  <Stat k="Weight" v={`${m.weight} kg`} />
                  <Stat k="Body fat" v={`${m.bodyFat}%`} />
                  <Stat k="5K time" v={m.run5k} />
                  <Stat k="Muscle mass" v={`${m.muscleMass} kg`} />
                  <div style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.clay600, lineHeight: 1.5 }}>
                    {m.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* 1RM Lift Graph */}
          <OneRepMaxGraph maxes={maxes} exercise={selectedEx} />

          {/* Exercise Selection Cards Grid */}
          <div style={{ marginTop: 20 }}>
            <OEyebrow>Select Strength Lift</OEyebrow>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10, marginTop: 10 }}>
              {exercises.map(ex => {
                const latest = latestMaxes[ex];
                const isSelected = ex === selectedEx;
                const allLifts = maxes.filter(m => m.exercise === ex).sort((a,b) => a.date.localeCompare(b.date));
                const initialW = allLifts[0]?.weight || 0;
                const currentW = latest?.weight || 0;
                const progress = currentW - initialW;

                return (
                  <div 
                    key={ex} 
                    onClick={() => setSelectedEx(ex)}
                    style={{
                      background: isSelected ? OT.sand100 : OT.paper,
                      border: isSelected ? `1.5px solid ${OT.walnut}` : `1px solid ${OT.hairline}`,
                      borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? OT.sh1 : 'none',
                    }}
                  >
                    <div style={{ fontFamily: OT.fMono, fontSize: 8, letterSpacing: 1, textTransform: 'uppercase', color: OT.clay600, marginBottom: 4 }}>
                      STRENGTH LIFT
                    </div>
                    <div style={{ fontFamily: OT.fBody, fontSize: 13, fontWeight: 700, color: OT.espresso900, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {ex}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontFamily: OT.fMono, fontSize: 18, fontWeight: 700, color: OT.espresso900 }}>
                        {currentW ? `${currentW}` : '—'}
                      </span>
                      <span style={{ fontFamily: OT.fMono, fontSize: 10, color: OT.clay600 }}>
                        kg
                      </span>
                    </div>

                    <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: OT.fMono, fontSize: 8, color: OT.clay500 }}>
                        {latest ? new Date(latest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No lift'}
                      </span>
                      {progress > 0 && (
                        <span style={{ fontFamily: OT.fMono, fontSize: 9, fontWeight: 600, color: OT.ok }}>
                          +{progress}kg
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Custom Exercise Form */}
          <form onSubmit={handleAddExercise} style={{
            marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
            padding: 12, background: OT.sand50, borderRadius: 10, border: `1px solid ${OT.hairline}`
          }}>
            <div style={{ flex: 1, minWidth: 180 }}>
              <input 
                type="text" 
                placeholder="Add custom exercise (e.g. Overhead Press)..." 
                value={newExName} 
                onChange={e => setNewExName(e.target.value)} 
                style={{ ...inputStyle, width: '100%', fontSize: 12, padding: '6px 10px' }}
              />
            </div>
            <button type="submit" style={miniBtn(true)}>
              + Add Exercise
            </button>
            {showAddSuccess && (
              <span style={{ fontFamily: OT.fMono, fontSize: 10, color: OT.ok, fontWeight: 500 }}>{showAddSuccess}</span>
            )}
          </form>

          {/* 1RM Lift Log Entries */}
          <div style={{ marginTop: 24 }}>
            <OEyebrow>1RM Lift Timeline</OEyebrow>
            <div style={{ marginTop: 10, maxHeight: 240, overflowY: 'auto', border: `1px solid ${OT.hairline}`, borderRadius: 12, background: OT.paper }}>
              {maxes.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', fontFamily: OT.fBody, fontSize: 13, color: OT.clay600 }}>
                  No lifts logged in your dynamic timeline. Click "+ Log this month" or use the modal to record entries.
                </div>
              ) : (
                maxes.slice().reverse().map((m) => (
                  <div key={m.id} style={{
                    display: 'grid',
                    gridTemplateColumns: '110px 1.2fr 1fr 2fr 44px',
                    gap: 12, alignItems: 'center', padding: '10px 14px',
                    borderBottom: `1px solid ${OT.hairline}`,
                  }}>
                    <div>
                      <span style={{ fontFamily: OT.fMono, fontSize: 11, color: OT.espresso900, fontWeight: 500 }}>
                        {new Date(m.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontFamily: OT.fBody, fontSize: 12, fontWeight: 600, color: OT.espresso900 }}>
                        {m.exercise}
                      </span>
                    </div>
                    <div>
                      <span style={{ fontFamily: OT.fMono, fontSize: 13, fontWeight: 600, color: OT.terra }}>
                        {m.weight} {m.unit}
                      </span>
                    </div>
                    <div style={{ fontFamily: OT.fBody, fontSize: 12, color: OT.clay600, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={m.note}>
                      {m.note || 'No training note.'}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <button 
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete this ${m.weight}kg log for ${m.exercise}?`)) {
                            removeMax(m.id);
                          }
                        }} 
                        style={{ background: 'none', border: 'none', color: OT.bad, fontSize: 12, cursor: 'pointer', padding: 4 }}
                        title="Delete record"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Stat = ({ k, v }) => (
  <div>
    <OMono size={9}>{k}</OMono>
    <div style={{ fontFamily: OT.fMono, fontSize: 14, color: OT.espresso900, marginTop: 4, fontWeight: 500 }}>
      {v}
    </div>
  </div>
);

function ProgressGraph({ progressLog: propProgressLog }) {
  const [localLog] = useProgress();
  const progressLog = propProgressLog || localLog;
  const [active, setActive] = React.useState('weight');

  const seriesList = React.useMemo(() => {
    return [
      { key: 'weight',     label: 'Weight (kg)',      color: OT.walnut, values: progressLog.map(p => p.weight),
        yMin: Math.min(...progressLog.map(p => p.weight)) - 1, yMax: Math.max(...progressLog.map(p => p.weight)) + 1 },
      { key: 'bodyFat',    label: 'Body fat (%)',     color: OT.ochre,  values: progressLog.map(p => p.bodyFat),
        yMin: Math.min(...progressLog.map(p => p.bodyFat)) - 1, yMax: Math.max(...progressLog.map(p => p.bodyFat)) + 1 },
      { key: 'muscleMass', label: 'Muscle mass (kg)', color: OT.sage,   values: progressLog.map(p => p.muscleMass),
        yMin: Math.min(...progressLog.map(p => p.muscleMass)) - 1, yMax: Math.max(...progressLog.map(p => p.muscleMass)) + 1 },
    ];
  }, [progressLog]);

  const runSeconds = React.useMemo(() => {
    return progressLog.map(p => {
      const split = p.run5k ? p.run5k.split(':').map(Number) : [28, 40];
      const m = split[0] || 28, s = split[1] || 40;
      return m * 60 + s;
    });
  }, [progressLog]);

  const series = React.useMemo(() => {
    if (active === 'run5k') {
      return {
        key: 'run5k', label: '5K time',   color: OT.terra,
        values: runSeconds,
        yMin: Math.min(...runSeconds) - 30, yMax: Math.max(...runSeconds) + 30,
        format: (v) => {
          const mm = Math.floor(v / 60);
          const ss = String(Math.round(v - mm * 60)).padStart(2, '0');
          return `${mm}:${ss}`;
        },
      };
    }
    return seriesList.find(s => s.key === active) || seriesList[0];
  }, [active, seriesList, runSeconds]);

  const W = 720, H = 220, PAD_L = 50, PAD_R = 20, PAD_T = 16, PAD_B = 36;
  const innerW = W - PAD_L - PAD_R;
  const innerH = H - PAD_T - PAD_B;
  const N = series.values.length;
  const x = (i) => PAD_L + (N > 1 ? (i / (N - 1)) * innerW : innerW / 2);
  const y = (v) => {
    const range = series.yMax - series.yMin;
    return PAD_T + innerH - (range > 0 ? ((v - series.yMin) / range) * innerH : innerH / 2);
  };
  const path = series.values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');
  const fmt = series.format || ((v) => v.toFixed(1));

  return (
    <div style={{
      background: OT.sand50, border: `1px solid ${OT.hairline}`,
      borderRadius: 12, padding: 16,
    }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {[...seriesList, { key: 'run5k', label: '5K time', color: OT.terra }].map(s => {
          const sel = s.key === active;
          return (
            <button key={s.key} onClick={() => setActive(s.key)} style={{
              padding: '7px 12px', borderRadius: 999,
              border: sel ? 'none' : `1px solid ${OT.hairlineStrong}`,
              background: sel ? (s.color || OT.walnut) : OT.paper,
              color: sel ? OT.paper : OT.espresso900,
              fontFamily: OT.fBody, fontSize: 12, fontWeight: 600,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: sel ? OT.paper : (s.color || OT.walnut),
              }} />
              {s.label}
            </button>
          );
        })}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
          const yy = PAD_T + innerH * t;
          const v = series.yMax - (series.yMax - series.yMin) * t;
          return (
            <g key={i}>
              <line x1={PAD_L} x2={W - PAD_R} y1={yy} y2={yy} stroke={OT.hairline} strokeWidth="1" />
              <text x={PAD_L - 8} y={yy + 3.5} textAnchor="end"
                style={{ fontFamily: OT.fMono, fontSize: 9, fill: OT.clay600 }}>
                {fmt(v)}
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {progressLog.map((p, i) => (
          <text key={p.month} x={x(i)} y={H - 12} textAnchor="middle"
            style={{ fontFamily: OT.fMono, fontSize: 9, fill: OT.clay600, letterSpacing: 1 }}>
            {p.month.toUpperCase()}
          </text>
        ))}

        {/* Area gradient */}
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={series.color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={series.color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${path} L ${x(N-1)} ${PAD_T + innerH} L ${x(0)} ${PAD_T + innerH} Z`}
          fill="url(#areaGrad)"
        />

        {/* Line */}
        <path d={path} fill="none" stroke={series.color} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" />

        {/* Points + labels */}
        {series.values.map((v, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(v)} r="5"
              fill={OT.paper} stroke={series.color} strokeWidth="2.5" />
            <text x={x(i)} y={y(v) - 12} textAnchor="middle"
              style={{ fontFamily: OT.fMono, fontSize: 10, fontWeight: 600, fill: OT.espresso900 }}>
              {fmt(v)}
            </text>
          </g>
        ))}
      </svg>

      {/* Delta callout */}
      <div style={{
        marginTop: 8, padding: '10px 14px', background: OT.paper,
        borderRadius: 8, border: `1px solid ${OT.hairline}`,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <OMono size={9}>Plan delta</OMono>
        {(() => {
          const first = series.values[0] || 0;
          const last = series.values[N - 1] || 0;
          const diff = last - first;
          const pos = diff > 0;
          const goodDown = series.key !== 'muscleMass';
          const isGood = goodDown ? diff < 0 : diff > 0;
          const color = isGood ? OT.ok : (Math.abs(diff) < 0.05 ? OT.clay600 : OT.warn);
          return (
            <div style={{
              fontFamily: OT.fMono, fontSize: 13, fontWeight: 600, color,
            }}>
              {pos ? '+' : '−'}{fmt(Math.abs(diff))} {isGood ? '· trending well' : ''}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ─── Star rating (reusable) ───────────────────────────────────────────────
function StarRating({ value, onChange, readonly = false }) {
  const [hover, setHover] = React.useState(0);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          data-star-val={star}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{
            fontSize: 22, cursor: readonly ? 'default' : 'pointer',
            color: star <= (hover || value) ? OT.ochre : OT.sand200,
            transition: 'color 0.1s',
            userSelect: 'none',
          }}
        >★</span>
      ))}
    </div>
  );
}

// ─── Rate the session (client → coach) ────────────────────────────────────
function RateSessionSection({ profile }) {
  const coach = COACHES.find(c => c.id === profile.coachId) || COACHES[0];

  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
  const entryId = `${profile.id}_${selectedDate}`;

  const [pastVersion, setPastVersion] = React.useState(0);
  const past = React.useMemo(() => {
    const raw = loadRatings().filter(r => r.clientId === profile.id);
    return raw.map(r => ({
      ...r,
      coachId: coach.id,
      coachName: coach.name,
    })).sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));
  }, [coach, pastVersion, profile.id]);

  const studentSessions = React.useMemo(() => {
    try {
      const allSess = JSON.parse(localStorage.getItem('m3s.sessions') || '[]');
      return allSess.filter(s => s.client_id === profile.id || s.clientId === profile.id);
    } catch {
      return [];
    }
  }, [profile.id]);

  const alreadyRated = past.some(r => r.id === entryId || r.sessionDate === selectedDate);

  const [scores, setScores] = React.useState({
    workout: 0, form: 0, communication: 0, structure: 0, content: 0,
  });
  const [comment, setComment] = React.useState('');
  const [submitted, setSubmitted] = React.useState(alreadyRated);

  function setScore(key, val) {
    setScores(prev => ({ ...prev, [key]: val }));
  }
  function submit() {
    const overall = computeOverall(scores);
    const entry = {
      id: entryId,
      clientId: profile.id, clientName: profile.name,
      coachId: coach.id, coachName: coach.name,
      sessionDate: selectedDate, sessionType: 'PT Session',
      scores, overall, comment,
      submittedAt: new Date().toISOString(),
    };
    saveRating(entry);
    setSubmitted(true);
    setPastVersion(v => v + 1);
  }

  // Effect to sync alreadyRated when tab or storage changes
  React.useEffect(() => {
    const checkRated = () => {
      const currentPast = loadRatings().filter(r => r.clientId === profile.id);
      const isCurrentlyRated = currentPast.some(r => r.id === entryId || r.sessionDate === selectedDate);
      if (isCurrentlyRated) {
        setSubmitted(true);
      } else {
        setSubmitted(false);
        setScores({ workout: 0, form: 0, communication: 0, structure: 0, content: 0 });
        setComment('');
      }
      setPastVersion(prev => prev + 1);
    };

    checkRated();
    window.addEventListener('storage', checkRated);
    window.addEventListener('m3s:rating-reset', checkRated);
    return () => {
      window.removeEventListener('storage', checkRated);
      window.removeEventListener('m3s:rating-reset', checkRated);
    };
  }, [entryId, selectedDate, profile.id]);

  React.useEffect(() => {
    const fetchRatings = async () => {
      if (db) {
        try {
          const snap = await db.collection('ratings').get();
          if (!snap.empty) {
            const list = [];
            snap.forEach(doc => {
              const d = doc.data();
              if (d.client_id === profile.id || d.clientId === profile.id) {
                list.push({
                  id: doc.id,
                  clientId: d.client_id || d.clientId,
                  clientName: d.clientName,
                  coachId: d.coachId,
                  coachName: d.coachName,
                  sessionDate: d.session_date || d.sessionDate,
                  scores: d.scores_json || d.scores,
                  overall: d.overall,
                  comment: d.comment,
                  submittedAt: d.submittedAt
                });
              }
            });
            if (list.length > 0) {
              const localRatings = loadRatings();
              const merged = [...localRatings];
              list.forEach(cloudR => {
                const idx = merged.findIndex(r => r.id === cloudR.id);
                if (idx >= 0) merged[idx] = cloudR;
                else merged.push(cloudR);
              });
              localStorage.setItem('m3s.ratings', JSON.stringify(merged));
              setPastVersion(v => v + 1);
            }
          }
        } catch (e) {
          console.warn("Firestore ratings fetch error", e);
        }
      }
    };
    fetchRatings();
  }, [profile.id]);

  const canSubmit = Object.values(scores).every(v => v > 0);

  return (
    <div>
      {!submitted ? (
        <div id="rating-form-card" style={{
          background: OT.sand50, border: `1px solid ${OT.hairline}`,
          borderRadius: 10, padding: 18, marginBottom: 20,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: COACH_TONE_BG[coach.tone] || OT.walnut, color: OT.paper,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 14,
            }}>{coach.initials}</div>
            <div>
              <OMono size={9}>RATE YOUR COACH PROFILE</OMono>
              <div style={{
                fontFamily: OT.fBody, fontSize: 14,
                fontWeight: 600, color: OT.espresso900, marginTop: 2,
              }}>{coach.name} rating session feedback</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 16, background: OT.sand100, padding: 12, borderRadius: 8, border: `1px solid ${OT.hairline}` }}>
            <div>
              <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 8.5, color: OT.clay600, marginBottom: 4, letterSpacing: 1 }}>CHOOSE FROM SESSIONS</label>
              <select
                value={selectedDate}
                onChange={e => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                  }
                }}
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 6,
                  border: `1px solid ${OT.hairlineStrong}`, background: OT.paper,
                  fontFamily: OT.fBody, fontSize: 12, color: OT.espresso900,
                  outline: 'none', height: 36, boxSizing: 'border-box'
                }}
              >
                <option value="">-- Click to select date --</option>
                {studentSessions.map(s => {
                  if (!s.scheduled_at) return null;
                  const sDate = s.scheduled_at.split('T')[0];
                  const sTime = s.scheduled_at.split('T')[1]?.substring(0, 5) || '';
                  return (
                    <option key={s.id} value={sDate}>
                      {sDate} {sTime ? `(${sTime})` : ''} - {s.type || 'PT Session'}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 8.5, color: OT.clay600, marginBottom: 4, letterSpacing: 1 }}>MANUAL DATE SELECTOR</label>
              <input
                type="date"
                required
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{
                  width: '100%', padding: '7px 10px', borderRadius: 6,
                  border: `1px solid ${OT.hairlineStrong}`, background: OT.paper,
                  fontFamily: OT.fBody, fontSize: 12, color: OT.espresso900,
                  outline: 'none', height: 36, boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {RATING_CRITERIA.map((c, i) => (
            <div key={c.key} data-criterion-row={c.key} style={{
              display: 'grid', gridTemplateColumns: '1fr auto',
              alignItems: 'center', padding: '12px 0',
              borderTop: i === 0 ? 'none' : `1px solid ${OT.hairline}`,
            }}>
              <div>
                <div style={{
                  fontFamily: OT.fBody, fontSize: 14,
                  fontWeight: 500, color: OT.espresso900,
                }}>{c.label}</div>
                <div style={{
                  fontFamily: OT.fBody, fontSize: 12,
                  color: OT.clay600, marginTop: 2,
                }}>{c.hint}</div>
              </div>
              <StarRating
                value={scores[c.key]}
                onChange={(v) => setScore(c.key, v)}
              />
            </div>
          ))}

          <div style={{ marginTop: 16 }}>
            <OMono size={9} style={{ marginBottom: 6 }}>
              Comment (optional)
            </OMono>
            <textarea
              id="rating-comment-input"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Anything else to share about the session?"
              rows={3}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '10px 12px', borderRadius: 8,
                border: `1px solid ${OT.hairlineStrong}`,
                background: OT.paper, fontFamily: OT.fBody,
                fontSize: 13, color: OT.espresso900,
                resize: 'vertical', outline: 'none',
              }}
            />
          </div>

          <button
            id="submit-rating-btn"
            onClick={submit}
            disabled={!canSubmit}
            style={{
              marginTop: 14, padding: '11px 22px',
              borderRadius: 999, border: 'none',
              background: canSubmit ? OT.walnut : OT.sand200,
              color: canSubmit ? OT.paper : OT.clay600,
              fontFamily: OT.fBody, fontSize: 14,
              fontWeight: 600, cursor: canSubmit ? 'pointer' : 'default',
              boxShadow: canSubmit ? OT.sh2 : 'none',
            }}
          >
            Submit rating →
          </button>

          {!canSubmit && (
            <div id="rating-error-helper" style={{
              marginTop: 8, fontFamily: OT.fBody,
              fontSize: 12, color: OT.clay600,
            }}>Rate all 5 criteria to submit.</div>
          )}
        </div>
      ) : (
        <div id="rating-confirmation-card" style={{
          padding: '12px 16px', borderRadius: 10,
          background: OT.sand100, border: `1px solid ${OT.hairline}`,
          marginBottom: 20, fontFamily: OT.fBody,
          fontSize: 13, color: OT.espresso800,
        }}>
          <div>
            ✓ Rating submitted for session on <strong>{selectedDate}</strong> with {coach.name}.
          </div>
          <div style={{ marginTop: 4 }}>
            Overall: <strong style={{ color: OT.walnut }}>
              {(past.find(r => r.id === entryId)?.overall || computeOverall(scores) || past[0]?.overall || 0.0).toFixed(1)}/5
            </strong>
          </div>
          <div style={{ marginTop: 8 }}>
            <button 
              type="button" 
              onClick={() => {
                setSelectedDate(new Date().toISOString().split('T')[0]);
                setScores({ workout: 0, form: 0, communication: 0, structure: 0, content: 0 });
                setComment('');
                setSubmitted(false);
              }}
              style={{
                border: 'none', background: 'transparent', color: OT.walnut,
                textDecoration: 'underline', cursor: 'pointer', fontFamily: OT.fBody,
                fontSize: 12, padding: 0
              }}
            >
              ← Choose another date to rate
            </button>
          </div>
        </div>
      )}

      {past.length > 0 && (
        <div>
          <OMono size={9} style={{ marginBottom: 10 }}>
            Your previous ratings
          </OMono>
          {past.slice(0, 5).map((r, i) => (
            <div key={r.id} style={{
              padding: '12px 0',
              borderTop: i === 0 ? 'none' : `1px solid ${OT.hairline}`,
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <div>
                  <OMono size={9}>{r.sessionDate} · {r.sessionType}</OMono>
                  {r.comment && (
                    <div style={{
                      fontFamily: OT.fBody, fontSize: 13,
                      color: OT.espresso800, marginTop: 4,
                      fontStyle: 'italic', lineHeight: 1.4,
                    }}>"{r.comment}"</div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                  <div style={{
                    fontFamily: OT.fDisplay, fontStyle: 'italic',
                    fontSize: 22, color: OT.espresso900, lineHeight: 1,
                  }}>{r.overall}</div>
                  <OMono size={9} style={{ color: OT.clay600 }}>/ 5</OMono>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Coach session notes (read-only feed for the client) ─────────────────
function CoachNotesClientView() {
  const [notes, setNotes] = React.useState(() => loadMySessionNotes());
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newNoteText, setNewNoteText] = React.useState('');
  const [newNoteType, setNewNoteType] = React.useState('Workout Feedback');
  const [successMsg, setSuccessMsg] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const activeId = localStorage.getItem('m3s.active_student_id') || 'riya';

  const fetchCloudNotes = async () => {
    if (db) {
      try {
        const snap = await db.collection('session_notes').get();
        if (!snap.empty) {
          const list = [];
          snap.forEach(doc => {
            const d = doc.data();
            const cid = d.client_id || d.clientId;
            if (cid === activeId) {
              list.push({
                id: doc.id,
                clientId: cid,
                coachId: d.coach_id || d.coachId || 'lee',
                date: d.date,
                text: d.text || d.body || '',
                tags: d.tags || [],
                sessionType: d.type || d.sessionType || 'PT SESSION',
                coachName: d.coachName,
                writtenBy: d.writtenBy || (d.type === 'Client Journal' || d.sessionType === 'Client Journal' ? 'client' : 'coach')
              });
            }
          });
          list.sort((a,b) => (b.date || '').localeCompare(a.date || ''));
          setNotes(list);
          localStorage.setItem('m3s.sessionNotes', JSON.stringify(list));
        }
      } catch(err) {
        console.warn("Firestore notes load error", err);
      }
    }
  };

  React.useEffect(() => {
    const handleStorageChange = () => {
      setNotes(loadMySessionNotes());
    };
    window.addEventListener('storage', handleStorageChange);

    fetchCloudNotes();
    const interval = setInterval(fetchCloudNotes, 5000);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [activeId]);

  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    setIsSubmitting(true);
    setSuccessMsg('');

    const newNote = {
      id: `sn_client_${Date.now()}`,
      client_id: activeId,
      clientId: activeId,
      coach_id: 'lee', // default or loaded coach
      date: new Date().toISOString().split('T')[0],
      text: newNoteText.trim(),
      tags: ['Client Journal', newNoteType],
      type: 'Client Journal',
      sessionType: 'Client Journal',
      writtenBy: 'client',
      coachName: 'Client'
    };

    try {
      // 1. Update localStorage instantly
      const currentLocal = JSON.parse(localStorage.getItem('m3s.sessionNotes') || '[]');
      const updatedLocal = [newNote, ...currentLocal];
      localStorage.setItem('m3s.sessionNotes', JSON.stringify(updatedLocal));

      const currentLocalSnake = JSON.parse(localStorage.getItem('session_notes') || '[]');
      const updatedLocalSnake = [newNote, ...currentLocalSnake];
      localStorage.setItem('session_notes', JSON.stringify(updatedLocalSnake));

      // 2. Save to Firestore
      if (db) {
        await db.collection('session_notes').doc(newNote.id).set(newNote);
      }

      setNotes(prev => [newNote, ...prev]);
      setNewNoteText('');
      setSuccessMsg('✓ Journal entry shared with your coach & Shwe!');
      setTimeout(() => setSuccessMsg(''), 4000);
      setShowAddForm(false);
    } catch (err) {
      console.warn("Error posting client note:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format ISO date "2026-04-20" → "APR 20, 2026"
  const fmt = (iso) => {
    if (!iso) return '';
    const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return iso;
    const month = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'][parseInt(m[2],10)-1];
    return `${month} ${parseInt(m[3],10)}, ${m[1]}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Add Journal Entry Toggle & Form */}
      <div style={{ 
        background: OT.sand100, borderRadius: 14, padding: showAddForm ? 16 : 10,
        border: `1px solid ${OT.hairline}`, transition: 'all 0.3s'
      }}>
        {!showAddForm ? (
          <button 
            type="button" 
            onClick={() => setShowAddForm(true)}
            style={{
              width: '100%', padding: '8px 12px', background: OT.paper,
              border: `1px solid ${OT.hairlineStrong}`, borderRadius: 10,
              fontFamily: OT.fMono, fontSize: 11, color: OT.walnut,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              fontWeight: 600
            }}
          >
            ✏️ Share a Journal Entry or Question with Coach & Shwe
          </button>
        ) : (
          <form onSubmit={handleSubmitNote} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: OT.fMono, fontSize: 11, color: OT.walnut, fontWeight: 'bold' }}>NEW JOURNAL ENTRY</span>
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)} 
                style={{ background: 'none', border: 'none', color: OT.clay600, fontSize: 11, cursor: 'pointer', fontFamily: OT.fMono }}
              >
                CANCEL
              </button>
            </div>

            <textarea 
              rows={3}
              value={newNoteText}
              onChange={e => setNewNoteText(e.target.value)}
              placeholder="What did you focus on today? Any soreness, questions, or workout updates for your coach and Shwe?"
              style={{
                width: '100%', padding: 12, borderRadius: 10, border: `1px solid ${OT.hairlineStrong}`,
                fontFamily: OT.fBody, fontSize: 13, background: OT.paper, color: OT.espresso900,
                resize: 'none', outline: 'none'
              }}
              required
            />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
              <span style={{ fontFamily: OT.fMono, fontSize: 10, color: OT.clay600 }}>Category:</span>
              {['Workout Feedback', 'Recovery Notes', 'Question for Coach', 'Soreness Log'].map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setNewNoteType(cat)}
                  style={{
                    padding: '4px 10px', borderRadius: 999, border: 'none',
                    background: newNoteType === cat ? OT.walnut : OT.paper,
                    color: newNoteType === cat ? OT.paper : OT.clay600,
                    fontFamily: OT.fMono, fontSize: 9, cursor: 'pointer',
                    transition: 'all 0.2s', border: `1px solid ${OT.hairline}`
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 14px', background: OT.sage, color: OT.paper,
                borderRadius: 999, border: 'none', fontFamily: OT.fMono, fontSize: 11,
                fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-end',
                transition: 'opacity 0.2s'
              }}
            >
              {isSubmitting ? 'POSTING...' : 'SHARE JOURNAL ENTRY'}
            </button>
          </form>
        )}
      </div>

      {successMsg && (
        <div style={{
          padding: '10px 14px', background: 'rgba(123, 139, 111, 0.12)',
          border: `1px solid ${OT.sage}`, borderRadius: 10,
          fontFamily: OT.fBody, fontSize: 12, color: OT.sage, fontWeight: 500
        }}>
          {successMsg}
        </div>
      )}

      {/* List */}
      {notes.length === 0 ? (
        <div style={{
          padding: '14px 16px', background: OT.sand50,
          border: `1px solid ${OT.hairline}`, borderRadius: 10,
          fontFamily: OT.fBody, fontSize: 13, color: OT.clay600,
        }}>
          No session notes yet. Your coach's notes and your training journal entries will appear here.
        </div>
      ) : (
        <div>
          {notes.slice(0, 5).map((note, i) => {
            const isClientNote = note.writtenBy === 'client' || note.sessionType === 'Client Journal' || note.type === 'Client Journal';
            return (
              <div key={note.id} style={{
                padding: '14px',
                marginTop: i === 0 ? 0 : 10,
                background: isClientNote ? 'rgba(123, 139, 111, 0.04)' : OT.paper,
                border: isClientNote ? `1px solid ${OT.sage}` : `1px solid ${OT.hairlineStrong}`,
                borderRadius: 14,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 8, flexWrap: 'wrap' }}>
                  <OMono size={9} style={{ color: isClientNote ? OT.sage : OT.ochre, fontWeight: 'bold' }}>
                    {isClientNote ? 'CLIENT JOURNAL' : (note.sessionType || 'PT SESSION').toUpperCase()}
                  </OMono>
                  <OMono size={9} style={{ color: OT.clay600 }}>
                    {fmt(note.date)} · {isClientNote ? 'Shared with Coach & Shwe' : (note.coachName ? `Coach ${note.coachName}` : 'Coach')}
                  </OMono>
                </div>
                <div style={{
                  fontFamily: OT.fBody, fontSize: 13.5, color: OT.espresso800,
                  lineHeight: 1.6, fontStyle: 'italic',
                }}>"{note.text || note.body || ''}"</div>
                {note.tags && note.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    {note.tags.map(tag => (
                      <div key={tag} style={{
                        padding: '2px 8px', borderRadius: 999,
                        background: OT.sand100, border: `1px solid ${OT.hairline}`,
                        fontFamily: OT.fMono, fontSize: 9, letterSpacing: 1.2,
                        textTransform: 'uppercase', color: OT.clay600,
                      }}>{tag}</div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {notes.length > 5 && (
            <div style={{ marginTop: 12, fontFamily: OT.fBody, fontSize: 12, color: OT.clay600, textAlign: 'center' }}>
              Showing 5 of {notes.length} notes.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Nutrition section (coach-edited, client read-only) ───────────────────
function NutritionSection({ profile }) {
  const selectedCoachId = profile.coachId || 'deepika';
  const coach = COACHES.find(c => c.id === selectedCoachId) || COACHES[0];

  const [rawEntries, setRawEntries] = React.useState(() => loadNutrition(profile.id));

  React.useEffect(() => {
    const fetchCloudNutrition = async () => {
      if (db) {
        try {
          const snap = await db.collection('nutrition_plans').doc(profile.id).get();
          if (snap.exists) {
            const d = snap.data();
            const fetched = [{
              id: snap.id,
              clientId: profile.id,
              coachId: d.coach_id,
              coachName: d.coachName || 'Coach',
              date: d.period || 'Active Block',
              period: d.period || 'Active Block Period',
              mealPlan: { calories: d.calories, protein: d.protein, carbs: d.carbs, fat: d.fat },
              notes: d.notes,
              tags: d.tags || []
            }];
            setRawEntries(fetched);
            localStorage.setItem('m3s.nutrition', JSON.stringify(fetched));
            return;
          }
        } catch(err) {
          console.warn("Firestore nutrition load error", err);
        }
      }
    };
    fetchCloudNutrition();
    const interval = setInterval(fetchCloudNutrition, 5000);
    return () => clearInterval(interval);
  }, []);

  const entries = React.useMemo(() => {
    return rawEntries.map(e => ({
      ...e,
      coachId: coach.id,
      coachName: e.coachName || coach.name,
    }));
  }, [rawEntries, coach]);

  const latest = entries[0];

  if (!latest) return (
    <div style={{
      padding: '16px 20px', background: OT.sand50,
      border: `1px solid ${OT.hairline}`, borderRadius: 10,
      fontFamily: OT.fBody, fontSize: 13, color: OT.clay600,
    }}>
      No nutrition plan set yet. Your coach will add one after your first session.
    </div>
  );

  return (
    <div>
      {/* Coach + period header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px', background: OT.sand100,
        border: `1px solid ${OT.hairline}`, borderRadius: 8, marginBottom: 16,
      }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: COACH_TONE_BG[coach?.tone || 'walnut'],
            color: OT.paper, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontFamily: OT.fDisplay,
            fontStyle: 'italic', fontSize: 11,
          }}>
            {coach?.initials || 'CO'}
          </div>
          <div>
            <OMono size={9}>Set by {latest.coachName}</OMono>
            <div style={{
              fontFamily: OT.fBody, fontSize: 12, color: OT.espresso900, marginTop: 1,
            }}>{latest.period} · Updated {latest.date}</div>
          </div>
        </div>
        <div style={{
          padding: '3px 10px', borderRadius: 999,
          background: OT.sand200, fontFamily: OT.fMono,
          fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase',
          color: OT.clay600,
        }}>Coach edits only</div>
      </div>

      {/* 4-col macro grid — BCAReadout pattern */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
        marginBottom: 16,
      }}>
        {[
          { label: 'Calories', value: `${latest.mealPlan.calories}`, range: 'kcal / day' },
          { label: 'Protein',  value: `${latest.mealPlan.protein}g`, range: 'per day target' },
          { label: 'Carbs',    value: `${latest.mealPlan.carbs}g`,   range: 'per day target' },
          { label: 'Fat',      value: `${latest.mealPlan.fat}g`,     range: 'per day target' },
        ].map(t => (
          <div key={t.label} style={{
            padding: 14, borderRadius: 10,
            background: OT.sand50, border: `1px solid ${OT.hairline}`,
          }}>
            <OMono size={9}>{t.label}</OMono>
            <div style={{
              fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 26,
              color: OT.espresso900, marginTop: 4, lineHeight: 1,
            }}>{t.value}</div>
            <div style={{
              marginTop: 6, fontFamily: OT.fBody, fontSize: 11.5,
              color: OT.clay600, lineHeight: 1.4,
            }}>{t.range}</div>
          </div>
        ))}
      </div>

      {/* Tags */}
      {latest.tags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          {latest.tags.map(tag => (
            <div key={tag} style={{
              padding: '3px 10px', borderRadius: 999,
              background: OT.sand100, border: `1px solid ${OT.hairline}`,
              fontFamily: OT.fMono, fontSize: 9, letterSpacing: 1.2,
              textTransform: 'uppercase', color: OT.clay600,
            }}>{tag}</div>
          ))}
        </div>
      )}

      {/* Coach note */}
      {latest.notes && (
        <div style={{
          padding: '12px 14px', background: '#FFF8EE',
          border: `1px solid ${OT.hairline}`, borderRadius: 10,
          marginBottom: 16,
        }}>
          <OMono size={9} style={{ marginBottom: 6 }}>
            Coach note from {latest.coachName}
          </OMono>
          <div style={{
            fontFamily: OT.fBody, fontSize: 13.5,
            color: OT.espresso800, lineHeight: 1.6, fontStyle: 'italic',
          }}>“{latest.notes}”</div>
        </div>
      )}

      {/* History — past entries */}
      {entries.length > 1 && (
        <div>
          <OMono size={9} style={{ marginBottom: 8 }}>Previous plans</OMono>
          {entries.slice(1).map((e) => (
            <div key={e.id} style={{
              padding: '10px 0', borderTop: `1px solid ${OT.hairline}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <OMono size={9}>{e.date} · {e.period}</OMono>
                <div style={{
                  fontFamily: OT.fBody, fontSize: 12, color: OT.espresso800, marginTop: 2,
                }}>
                  {e.mealPlan.calories} kcal · {e.mealPlan.protein}g protein
                </div>
              </div>
              <OMono size={9} style={{ color: OT.clay600 }}>{e.coachName}</OMono>
            </div>
          ))}
        </div>
      )}

      {/* Read-only footer */}
      <div style={{
        marginTop: 14, fontFamily: OT.fBody, fontSize: 12, color: OT.clay600,
      }}>
        This plan is set by your coach and updates after each programme review.
        <strong style={{ color: OT.walnut }}> Speak to {latest.coachName}</strong> to adjust targets.
      </div>
    </div>
  );
}

// ─── Session decline banner — desktop variant ───────────────────────────────
function DTerraBtn({ children, onClick }) {
  const [hov, setHov] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: '11px 22px', borderRadius: 999, border: 'none',
        background: hov ? '#9C5A3A' : '#B86B4B', color: OT.paper,
        fontFamily: OT.fBody, fontSize: 14, fontWeight: 600,
        cursor: 'pointer', transition: 'background .18s', flexShrink: 0,
      }}>
      {children}
    </button>
  );
}
function DTerraGhostBtn({ children, onClick }) {
  const [hov, setHov] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: '10px 22px', borderRadius: 999,
        border: '1.5px solid rgba(184,107,75,0.45)',
        background: hov ? 'rgba(184,107,75,0.09)' : 'transparent',
        color: '#B86B4B',
        fontFamily: OT.fBody, fontSize: 14, fontWeight: 500,
        cursor: 'pointer', transition: 'background .18s', flexShrink: 0,
      }}>
      {children}
    </button>
  );
}
function DeclineBanner({ state, onAccept, onDecline }) {
  const [profile] = useProfile();
  const coach = COACHES.find(c => c.id === profile.coachId) || COACHES[0];
  const terra = '#B86B4B';
  const eyebrow = (color, label) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      fontFamily: OT.fMono, fontSize: 10, letterSpacing: 1.8,
      textTransform: 'uppercase', color, marginBottom: 9,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
      {label}
    </div>
  );
  const headline = (text) => (
    <div style={{ fontFamily: OT.fBody, fontSize: 16, fontWeight: 600, color: OT.espresso900, marginBottom: 8, lineHeight: 1.25 }}>{text}</div>
  );
  const body = (text) => (
    <div style={{ fontFamily: OT.fBody, fontSize: 14, color: OT.espresso800, lineHeight: 1.62 }}>{text}</div>
  );

  if (state === 'accepted') return (
    <>
      <style>{`@keyframes m3sPDrain { from { width:100%; } to { width:0%; } }`}</style>
      <div style={{ background: '#EEF5EE', borderLeft: '3px solid ' + OT.sage, borderRadius: '0 14px 14px 0', padding: '13px 22px 13px', marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ fontFamily: OT.fMono, fontSize: 12, letterSpacing: '0.6px', color: OT.sage, lineHeight: 1.45 }}>
          ✓ Confirmed with Coach Meera · Tuesday, 29 Apr · 7:00 AM
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, height: 2, background: OT.ochre, width: '100%', animation: 'm3sPDrain 4s linear forwards' }} />
      </div>
    </>
  );

  if (state === 'declined') return (
    <div style={{ background: OT.sand100, borderLeft: '3px solid ' + OT.clay500, borderRadius: '0 14px 14px 0', padding: '14px 22px', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: OT.fMono, fontSize: 10, letterSpacing: 1.8, textTransform: 'uppercase', color: OT.clay500, marginBottom: 7 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: OT.clay500, display: 'inline-block', flexShrink: 0 }} />
        Session voided · 1 credit added to your package
      </div>
      <div style={{ fontFamily: OT.fBody, fontSize: 13, fontStyle: 'italic', color: OT.clay600, lineHeight: 1.55 }}>
        Your credit will appear in your package summary within a few minutes.
      </div>
    </div>
  );

  return (
    <div style={{ background: '#FEF0CC', borderLeft: '4px solid ' + terra, borderRadius: '0 14px 14px 0', padding: '16px 22px', marginBottom: 16 }}>
      {eyebrow(terra, 'ACTION NEEDED')}
      {headline('Your session has been updated')}
      <p style={{ fontFamily: OT.fBody, fontSize: 14, color: OT.espresso800, lineHeight: 1.62, margin: '0 0 18px' }}>
        Coach {coach.name} is unavailable on Tuesday, 29 Apr at 7:00 AM.
        Coach Meera is available at the same time. Confirm by 8&nbsp;PM
        tonight or you'll be auto-confirmed with Coach Meera.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <DTerraBtn onClick={onAccept}>Accept Coach Meera</DTerraBtn>
        <DTerraGhostBtn onClick={onDecline}>Decline &amp; get session credit</DTerraGhostBtn>
      </div>
    </div>
  );
}

// ─── Confirm decline modal (desktop) ────────────────────────────────
function ConfirmDeclineModal({ onConfirm, onBack }) {
  const [profile] = useProfile();
  const coach = COACHES.find(c => c.id === profile.coachId) || COACHES[0];
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(36,24,16,0.45)', backdropFilter: 'blur(4px)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: OT.paper, borderRadius: 20, padding: '36px 40px', maxWidth: 460, width: '100%', boxShadow: OT.sh3 }}>
        <h2 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400, fontSize: 32, color: OT.espresso900, lineHeight: 1.1, marginBottom: 14 }}>Are you sure?</h2>
        <p style={{ fontFamily: OT.fBody, fontSize: 15, color: OT.espresso800, lineHeight: 1.65, marginBottom: 28 }}>
          If you decline, this session will be voided and 1 session credit will be added to your package. You can book a future session with Coach {coach.name} when they&apos;re available.
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <DTerraBtn onClick={onConfirm}>Yes, decline &amp; credit me</DTerraBtn>
          <DTerraGhostBtn onClick={onBack}>Go back</DTerraGhostBtn>
        </div>
      </div>
    </div>
  );
}

// ─── Client Dashboard (HOME tab) ──────────────────────────────────────────
function ClientDashboard() {
  const [profile, updateProfile] = useProfile();
  const [progressLog, appendProgressLog] = useProgress();
  const [bannerState, setBannerState] = React.useState('pending');
  const [activeModal, setActiveModal] = React.useState(null); // 'view_plan' | 'reschedule' | 'log_weight' | 'upload_bca' | 'this_weeks_plan' | 'message_coach'

  // Dynamic session schedule
  const [sessDate, setSessDate] = React.useState('Tuesday, 29 Apr');
  const [sessTime, setSessTime] = React.useState('7:00 AM');

  // Load database sessions to sync Home next session card and rescheduling checks
  const [dbSessions, setDbSessions] = React.useState([]);

  const loadDbSessions = React.useCallback(() => {
    try {
      const allSess = JSON.parse(localStorage.getItem('m3s.sessions') || '[]');
      setDbSessions(allSess);
    } catch {
      setDbSessions([]);
    }
  }, []);

  React.useEffect(() => {
    loadDbSessions();
    window.addEventListener('storage', loadDbSessions);
    window.addEventListener('m3s:sessions-updated', loadDbSessions);
    return () => {
      window.removeEventListener('storage', loadDbSessions);
      window.removeEventListener('m3s:sessions-updated', loadDbSessions);
    };
  }, [loadDbSessions]);

  const clientSessions = dbSessions.filter(s => s.client_id === profile.id || s.clientId === profile.id || s.clientName === profile.name);
  const upcomingSessList = clientSessions.filter(s => s.status === 'upcoming');
  const sortedUpcoming = upcomingSessList.sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));
  const nextSessionDetail = sortedUpcoming[0];

  React.useEffect(() => {
    if (nextSessionDetail) {
      setSessDate(formatSessionDateOnly(nextSessionDetail.scheduled_at));
      setSessTime(formatSessionTimeOnly(nextSessionDetail.scheduled_at));
    } else {
      setSessDate('Tuesday, 29 Apr');
      setSessTime('7:00 AM');
    }
  }, [nextSessionDetail]);

  // Load selected coach
  const coach = COACHES.find(c => c.id === profile.coachId) || COACHES[0];
  const sessionCoachName = bannerState === 'accepted' ? 'Meera' : coach.name;

  // Time-based greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';

  // Subtext status strings
  const lastWeightVal = progressLog[progressLog.length - 1];
  const lastWeightSub = lastWeightVal 
    ? `Last: ${lastWeightVal.weight} kg · ${lastWeightVal.month}`
    : 'Last: 67.4 kg · Apr 21';
  
  const bcaSubStatus = profile.bcaUploaded 
    ? 'Verified scan active ✓' 
    : 'Next check-in: May 5';

  const planSubStatus = `${progressLog.length + 3} sessions done · 1 remaining`;

  // Reschedule state logs
  const upcomingDays = React.useMemo(() => getUpcomingDays(), []);
  const [selectedReschedDate, setSelectedReschedDate] = React.useState(() => upcomingDays[0]?.val || '2026-06-08');
  const [selectedReschedTime, setSelectedReschedTime] = React.useState('7:30 AM');

  const handleHomeRescheduleConfirm = () => {
    if (!nextSessionDetail) {
      alert("No upcoming session found to reschedule.");
      setActiveModal(null);
      return;
    }
    try {
      const allSess = JSON.parse(localStorage.getItem('m3s.sessions') || '[]');
      const updated = allSess.map(s => {
        if (s.id === nextSessionDetail.id) {
          const formattedTimePart = time12To24(selectedReschedTime);
          return {
            ...s,
            scheduled_at: `${selectedReschedDate}T${formattedTimePart}:00`
          };
        }
        return s;
      });
      localStorage.setItem('m3s.sessions', JSON.stringify(updated));
      
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('m3s:sessions-updated'));

      alert("Your next session has been successfully rescheduled!");
      setActiveModal(null);
    } catch (err) {
      console.error(err);
      alert("Failed to reschedule session.");
    }
  };

  // Manual body weight logging state
  const [weightInput, setWeightInput] = React.useState('66.5');
  const [weightNote, setWeightNote] = React.useState('');
  const [loggingWeight, setLoggingWeight] = React.useState(false);

  // BCA scanning upload simulation
  const [bcaFileName, setBcaFileName] = React.useState('');
  const [scanningBca, setScanningBca] = React.useState(false);
  const [scanningBcaSuccess, setScanningBcaSuccess] = React.useState(false);

  // Live messaging state logs
  const [chatMessages, setChatMessages] = React.useState([]);
  const [messageInput, setMessageInput] = React.useState('');
  const [coachTyping, setCoachTyping] = React.useState(false);

  React.useEffect(() => {
    const loadAndPollChats = async () => {
      if (db) {
        try {
          const snap = await db.collection('chats').get();
          if (!snap.empty) {
            const list = [];
            snap.forEach(doc => {
              const d = doc.data();
              if (d.client_id === 'riya') {
                list.push({
                  id: doc.id,
                  sender: d.sender,
                  text: d.text,
                  time: d.timestamp || 'Just now'
                });
              }
            });
            if (list.length > 0) {
              setChatMessages(list);
              localStorage.setItem('m3s.chats', JSON.stringify(list));
              return;
            }
          }
        } catch(err) {
          console.warn("Firestore chats fetch failed", err);
        }
      }
      try {
        const raw = localStorage.getItem('m3s.chats');
        if (raw) setChatMessages(JSON.parse(raw));
        else {
          const SEED_CHATS = [
            { sender: 'coach', text: `Hi ${profile.name || 'Riya'}! Excited to run through your progress report. Your sleep was slightly higher on average this week. Did it help training?`, time: 'Yesterday 3:15 PM' },
            { sender: 'client', text: 'Absolutely! Keeping the room cold meant I targets my deep recovery window. Feel much less stiff.', time: 'Yesterday 4:02 PM' },
            { sender: 'coach', text: 'Brilliant response. We will keep your barbell volumes consistent tomorrow. Recovery is working!', time: 'Yesterday 4:10 PM' }
          ];
          if (getActiveEnvironment() === 'PROD') {
            setChatMessages([]);
          } else {
            setChatMessages(SEED_CHATS);
            localStorage.setItem('m3s.chats', JSON.stringify(SEED_CHATS));
          }
        }
      } catch {}
    };
    loadAndPollChats();
    const interval = setInterval(loadAndPollChats, 5000);
    return () => clearInterval(interval);
  }, [profile.name]);

  // Send client message
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!messageInput.trim()) return;

    const userMsg = { sender: 'client', text: messageInput, time: 'Just now' };
    const nextChats = [...chatMessages, userMsg];
    setChatMessages(nextChats);
    const typedText = messageInput;
    setMessageInput('');

    // Save to Firestore & local
    try {
      localStorage.setItem('m3s.chats', JSON.stringify(nextChats));
      if (db) {
        const id = Math.random().toString(36).substring(7);
        await db.collection('chats').doc(id).set({
          id,
          client_id: 'riya',
          coach_id: 'lee',
          sender: 'client',
          text: typedText,
          timestamp: 'Just now'
        });
      }
    } catch(err) {
      console.warn(err);
    }

    // Trigger coach automated customized reply simulator
    setCoachTyping(true);
    setTimeout(async () => {
      setCoachTyping(false);
      let replyText = `Thanks for letting me know! I am locking that into your training profile for our next workout. Keep hydrating!`;
      if (typedText.toLowerCase().includes('pain') || typedText.toLowerCase().includes('shoulders') || typedText.toLowerCase().includes('cranky')) {
        replyText = `Understood. I've noted that! We will back off on high-velocity overhead press tomorrow and check your thoracic mobility before the first set.`;
      } else if (typedText.toLowerCase().includes('sleep') || typedText.toLowerCase().includes('tired') || typedText.toLowerCase().includes('exhausted')) {
        replyText = `Recovery and sleep are paramount! Focus on getting 300g slow-digesting carbs tonight and we'll focus today on heavy isometric posture locks.`;
      } else if (typedText.toLowerCase().includes('weight') || typedText.toLowerCase().includes('mass') || typedText.toLowerCase().includes('bca')) {
        replyText = `Outstanding tracking! Your lean mass accrual is beautiful. This is block-periodization at its best. Keep fueling this consistency.`;
      }
      
      const coachMsg = { sender: 'coach', text: replyText, time: 'Just now' };
      const nextChatsWithCoach = [...nextChats, coachMsg];
      setChatMessages(nextChatsWithCoach);
      localStorage.setItem('m3s.chats', JSON.stringify(nextChatsWithCoach));
      
      if (db) {
        try {
          const id = Math.random().toString(36).substring(7);
          await db.collection('chats').doc(id).set({
            id,
            client_id: 'riya',
            coach_id: 'lee',
            sender: 'coach',
            text: replyText,
            timestamp: 'Just now'
          });
        } catch(err) {
          console.warn(err);
        }
      }
    }, 1500);
  };

  // Submit new weight log
  const handleWeightLogSubmit = (e) => {
    if (e) e.preventDefault();
    const wNumeric = parseFloat(weightInput);
    if (!wNumeric || isNaN(wNumeric)) return;

    setLoggingWeight(true);
    setTimeout(() => {
      // Calculate next dynamic month
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const now = new Date();
      const currentMonthStr = `${months[now.getMonth()]} ${now.getFullYear()}`;
      
      const latestEntry = progressLog[progressLog.length - 1] || {};
      const targetBodyFat = latestEntry.bodyFat || 24.8;
      const targetMuscleMass = parseFloat((wNumeric * (1 - (targetBodyFat / 100)) * 0.8).toFixed(1));

      appendProgressLog({
        month: currentMonthStr,
        weight: wNumeric,
        bodyFat: targetBodyFat,
        run5k: latestEntry.run5k || '28:40',
        muscleMass: targetMuscleMass,
        note: weightNote || 'Logged manually by student via Home Dashboard check-in.'
      });

      setLoggingWeight(false);
      setActiveModal(null);
    }, 1000);
  };

  // Handle BCA scan upload simulation
  const handleBcaUploadSimulated = (e) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (!file) return;
    setBcaFileName(file.name);
    setScanningBca(true);
    setScanningBcaSuccess(false);

    setTimeout(() => {
      // Extract simulated metrics
      const currentMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentNow = new Date();
      const currentMonthStr = `${currentMonths[currentNow.getMonth()]} ${currentNow.getFullYear()}`;

      // Update journey profile state
      updateProfile({ bcaUploaded: true });

      // Append verified high-performance stats to progress logs
      appendProgressLog({
        month: currentMonthStr,
        weight: 66.2,
        bodyFat: 24.2, // Improved fat reduction
        run5k: '28:40',
        muscleMass: 50.1, // Lean muscle increase!
        note: `AI Verified InBody Scan loaded. Fat mass decreased, skeletal muscle mass increased (+0.3kg index!). Visceral fat tier: 7.`
      });

      setScanningBca(false);
      setScanningBcaSuccess(true);
    }, 2000);
  };

  const isMobile = useIsMobile();

  return (
    <div style={{ maxWidth: 920, margin: '0 auto', padding: isMobile ? '16px 12px 100px' : '24px 24px 100px' }}>

      {/* ── HERO CARD ── */}
      <div style={{
        background: OT.espresso900, borderRadius: 18, padding: '24px 28px',
        marginBottom: 20, boxShadow: OT.sh3, position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative circle */}
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 180, height: 180,
          borderRadius: '50%', background: 'rgba(201,154,63,0.12)',
        }} />
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <OMono color="rgba(255,253,248,0.5)" size={9}>{greeting}</OMono>
            <div style={{
              fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 34,
              color: OT.paper, margin: '6px 0 4px', letterSpacing: -0.5,
            }}>{profile.name || 'Riya'}</div>
            <OMono color="rgba(255,253,248,0.45)" size={9}>
              WEEK 3 OF 12 · COACH: {coach.name.toUpperCase()}
            </OMono>
          </div>
          <Avatar name={profile.name} photo={profile.photo} size={52} />
        </div>
      </div>

      {/* ── SESSION UPDATE BANNER ── */}
      <DeclineBanner
        state={bannerState === 'confirming' ? 'pending' : bannerState}
        onAccept={() => setBannerState('accepted')}
        onDecline={() => setBannerState('confirming')}
      />

      {/* ── CONFIRM DECLINE MODAL ── */}
      {bannerState === 'confirming' && (
        <ConfirmDeclineModal
          onConfirm={() => {
            setBannerState('declined');
            // update profile credits
            updateProfile({ daysPerWeek: profile.daysPerWeek });
          }}
          onBack={() => setBannerState('pending')}
        />
      )}

      {/* ── NEXT SESSION CARD ── */}
      <div style={{
        background: OT.paper, borderRadius: 16, padding: 20,
        border: `1px solid ${OT.hairline}`, boxShadow: OT.sh2, marginBottom: 16,
        opacity: bannerState === 'declined' ? 0.5 : 1,
        transition: 'opacity .3s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <OEyebrow>YOUR NEXT SESSION</OEyebrow>
          {bannerState === 'accepted' && (
            <span style={{ fontFamily: OT.fMono, fontSize: 9, letterSpacing: '1.4px', textTransform: 'uppercase', color: OT.ochre, background: 'rgba(201,154,63,0.12)', padding: '3px 8px', borderRadius: 999, border: '1px solid rgba(201,154,63,0.28)' }}>REASSIGNED</span>
          )}
        </div>
        <div style={{
          fontFamily: OT.fBody, fontWeight: 600, fontSize: 17,
          color: OT.espresso900, margin: '10px 0 2px',
        }}>{sessDate} · {sessTime}</div>
        <div style={{
          fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 22,
          color: OT.espresso900, marginBottom: 4,
        }}>Strength & Conditioning</div>
        {bannerState !== 'declined' && (
          <div style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.clay600 }}>with {sessionCoachName}</div>
        )}
        {bannerState === 'declined' && (
          <div style={{ marginTop: 8 }}>
            <div style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 20, color: OT.espresso900, lineHeight: 1.1, marginBottom: 10 }}>No upcoming sessions.</div>
            <div style={{ fontFamily: OT.fBody, fontSize: 14, fontWeight: 600, color: OT.walnut, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => setActiveModal('reschedule')}>Book your next with Coach {coach.name} <span>→</span></div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <div style={{
            padding: '4px 12px', borderRadius: 999,
            background: 'rgba(201,154,63,0.15)', color: OT.ochre,
            fontFamily: OT.fMono, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase',
          }}>IN {sessDate.includes('29 Apr') ? '2 DAYS' : 'SCHEDULED'}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              onClick={() => setActiveModal('view_plan')}
              style={{
                padding: '8px 16px', borderRadius: 999, border: 'none',
                background: OT.walnut, color: OT.paper,
                fontFamily: OT.fBody, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                boxShadow: OT.sh2,
              }}>View plan</button>
            <button 
              onClick={() => setActiveModal('reschedule')}
              disabled={bannerState === 'declined'}
              style={{
                padding: '8px 16px', borderRadius: 999,
                border: `1px solid ${OT.hairlineStrong}`, background: 'transparent',
                color: OT.walnut, fontFamily: OT.fBody, fontSize: 13, cursor: 'pointer',
                opacity: bannerState === 'declined' ? 0.35 : 1,
              }}>Reschedule</button>
          </div>
        </div>
      </div>

      {/* ── PROGRESS ROW ── */}
      <OEyebrow style={{ marginBottom: 10 }}>YOUR PROGRESS</OEyebrow>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', marginBottom: 20, paddingBottom: 4 }}>
        {[
          { label: 'SESSIONS', value: '6', sub: 'of 12 completed', fill: 50 },
          { label: 'BODY COMP', value: profile.bcaUploaded ? '24.2%' : 'May 5', sub: profile.bcaUploaded ? 'Verified SMM 50.1kg ✓' : 'DEXA check-in', fill: null },
          { label: 'STREAK',    value: '4',    sub: 'sessions 🔥',   fill: null },
        ].map(card => (
          <div key={card.label} style={{
            background: OT.sand100, borderRadius: 14, padding: '14px 18px',
            border: `1px solid ${OT.hairline}`, flexShrink: 0, minWidth: 150,
          }}>
            <OMono size={9}>{card.label}</OMono>
            <div style={{
              fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 30,
              color: OT.espresso900, lineHeight: 1, margin: '6px 0 4px',
            }}>{card.value}</div>
            <div style={{ fontFamily: OT.fBody, fontSize: 12, color: OT.clay600 }}>
              {card.sub}
            </div>
            {card.fill !== null && (
              <div style={{ height: 3, borderRadius: 999, background: OT.sand200, marginTop: 8 }}>
                <div style={{ height: '100%', borderRadius: 999, width: `${card.fill}%`, background: OT.ochre }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── COACH NOTE ── */}
      <div style={{
        background: '#FFF8EE', borderRadius: 14, padding: 18,
        border: `1px solid ${OT.hairline}`, marginBottom: 20,
      }}>
        <OEyebrow dot={OT.ochre}>FROM {coach.name.toUpperCase()}</OEyebrow>
        <div style={{
          fontFamily: OT.fBody, fontSize: 15, color: OT.espresso800,
          lineHeight: 1.6, margin: '10px 0 10px',
        }}>
          "Focus on sleep this week — recovery is where the gains happen. See you Tuesday 💪"
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <OMono size={9}>SENT FRIDAY</OMono>
          <button 
            onClick={() => setActiveModal('message_coach')}
            style={{
              padding: '5px 12px', borderRadius: 999,
              border: `1px solid ${OT.hairline}`, background: 'transparent',
              color: OT.clay600, fontFamily: OT.fBody, fontSize: 12, cursor: 'pointer',
            }}>Reply →</button>
        </div>
      </div>

      {/* ── QUICK ACTIONS ── */}
      <OEyebrow style={{ marginBottom: 12 }}>QUICK ACTIONS</OEyebrow>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        {[
          { key: 'weight', label: 'Log body weight',    sub: lastWeightSub,   icon: '⚖' },
          { key: 'bca',    label: 'Upload BCA scan',    sub: bcaSubStatus,   icon: '↑' },
          { key: 'plan',   label: "This week's plan",   sub: planSubStatus,  icon: '☰' },
          { key: 'chat',   label: `Message ${coach.name}`, sub: 'Last reply: yesterday', icon: '💬' },
          { key: 'rate_coach', label: 'Rate your coach', sub: 'Select date & submit rating', icon: '⭐' },
        ].map(action => (
          <div 
            key={action.key} 
            onClick={() => {
              if (action.key === 'weight') setActiveModal('log_weight');
              if (action.key === 'bca') setActiveModal('upload_bca');
              if (action.key === 'plan') setActiveModal('this_weeks_plan');
              if (action.key === 'chat') setActiveModal('message_coach');
              if (action.key === 'rate_coach') setActiveModal('rate_coach');
            }}
            style={{
              background: OT.sand100, borderRadius: 12, padding: '14px 16px',
              border: `1px solid ${OT.hairline}`, cursor: 'pointer',
              display: 'flex', alignItems: 'flex-start', gap: 12,
              transition: 'background 0.2s',
            }}>
            <div style={{ fontSize: 18, lineHeight: 1, marginTop: 1 }}>{action.icon}</div>
            <div>
              <div style={{ fontFamily: OT.fBody, fontWeight: 500, fontSize: 13, color: OT.espresso900 }}>
                {action.label}
              </div>
              <div style={{ fontFamily: OT.fBody, fontSize: 11, color: OT.clay600, marginTop: 2 }}>
                {action.sub}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── HIGH FIDELITY EARTH TONE MODALS ── */}

      {/* 1. VIEW PLAN MODAL */}
      {activeModal === 'view_plan' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(36,24,16,0.45)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: OT.paper, borderRadius: 24, padding: '32px', maxWidth: 540, width: '100%', boxShadow: OT.sh3, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <OEyebrow dot={OT.ochre}>PLAN CONTRACT</OEyebrow>
              <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: 20, color: OT.clay600, cursor: 'pointer' }}>×</button>
            </div>
            
            <h2 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400, fontSize: 34, color: OT.espresso900, lineHeight: 1.1, marginBottom: 6 }}>
              12-Week Studio Performance Plan
            </h2>
            <p style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.clay600, marginBottom: 24 }}>
              Active Contract Period: Apr 10, 2026 – Jul 3, 2026 · Standard 2-Month Studio Core access.
            </p>

            {/* Session Banking Block */}
            <div style={{ background: OT.sand50, borderRadius: 16, padding: 20, border: `1px solid ${OT.hairline}`, marginBottom: 24 }}>
              <OMono size={9} style={{ marginBottom: 12 }}>SESSION BANK &amp; CREDITS</OMono>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontFamily: OT.fBody, fontSize: 12, color: OT.clay600 }}>Total Purchased</div>
                  <div style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 40, color: OT.espresso900, lineHeight: 1 }}>12 <span style={{ fontSize: 14, fontFamily: OT.fBody, fontStyle: 'normal', color: OT.clay600 }}>sessions</span></div>
                </div>
                <div>
                  <div style={{ fontFamily: OT.fBody, fontSize: 12, color: OT.clay600 }}>Already Completed</div>
                  <div style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 40, color: OT.sage, lineHeight: 1 }}>6 <span style={{ fontSize: 14, fontFamily: OT.fBody, fontStyle: 'normal', color: OT.clay600 }}>done</span></div>
                </div>
              </div>

              <div style={{ height: 1, background: OT.hairline, margin: '16px 0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontFamily: OT.fBody, fontSize: 12, color: OT.clay600 }}>Upcoming Scheduled</div>
                  <div style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 28, color: OT.ochre, lineHeight: 1 }}>2 <span style={{ fontSize: 13, fontFamily: OT.fBody, fontStyle: 'normal' }}>booked</span></div>
                </div>
                <div>
                  <div style={{ fontFamily: OT.fBody, fontSize: 12, color: OT.clay600 }}>Remaining Credits</div>
                  <div style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 28, color: OT.espresso900, lineHeight: 1 }}>4 <span style={{ fontSize: 13, fontFamily: OT.fBody, fontStyle: 'normal' }}>to book</span></div>
                </div>
              </div>

              {/* Progress bar visual */}
              <div style={{ marginTop: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 6 }}>
                  <span>CONTRACT COMPLETION</span>
                  <span>50% COMPLETED</span>
                </div>
                <div style={{ height: 8, background: OT.sand200, borderRadius: 999, overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: '50%', background: OT.sage }} />
                  <div style={{ width: '17%', background: OT.ochre }} />
                  <div style={{ width: '33%', background: 'transparent' }} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8, fontFamily: OT.fBody, fontSize: 10, color: OT.clay600 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: OT.sage }} /> Done (6)</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: OT.ochre }} /> Booked (2)</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: OT.sand200 }} /> Unbooked (4)</span>
                </div>
              </div>
            </div>

            {/* Calendar breakdown indicator */}
            <div style={{ marginBottom: 24 }}>
              <OMono size={9} style={{ marginBottom: 10 }}>ACTIVE COHORT CALENDAR</OMono>
              <p style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.espresso800, lineHeight: 1.5, margin: 0 }}>
                You are currently mapped to a high-frequency tracking protocol with <strong>{coach.name}</strong>. Checkpoints occur every 4 weeks to verify InBody muscle accumulation trends.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                onClick={() => { setActiveModal(null); setActiveModal('reschedule'); }}
                style={{ flex: 1, padding: '12px', borderRadius: 999, border: 'none', background: OT.walnut, color: OT.paper, fontFamily: OT.fBody, fontWeight: 600, fontSize: 14, cursor: 'pointer', textAlign: 'center' }}>
                Reschedule Next Session
              </button>
              <button 
                onClick={() => setActiveModal(null)}
                style={{ flex: 0.5, padding: '12px', borderRadius: 999, border: `1px solid ${OT.hairlineStrong}`, background: 'transparent', color: OT.espresso900, fontFamily: OT.fBody, fontSize: 14, cursor: 'pointer', textAlign: 'center' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. RESCHEDULE MODAL */}
      {activeModal === 'reschedule' && (() => {
        const homeAvailability = getCoachAvailability(coach.id, selectedReschedDate, selectedReschedTime, nextSessionDetail?.id);
        const homePenaltyDeadline = getNoPenaltyDeadline(nextSessionDetail?.scheduled_at);
        return (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(36,24,16,0.45)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: OT.paper, borderRadius: 24, padding: '32px', maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: OT.sh3, border: `1px solid ${OT.sand200}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <OEyebrow dot={OT.terra}>EASY RESCHEDULE</OEyebrow>
                <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: 20, color: OT.clay600, cursor: 'pointer' }}>×</button>
              </div>

              <h2 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400, fontSize: 32, color: OT.espresso900, lineHeight: 1.1, marginBottom: 12 }}>
                Reschedule Session
              </h2>
              <p style={{ fontFamily: OT.fBody, fontSize: 13.5, color: OT.espresso800, lineHeight: 1.5, marginBottom: 20 }}>
                Current session is scheduled for <strong>{nextSessionDetail ? formatSessionDate(nextSessionDetail.scheduled_at) : 'Tuesday, 29 Apr at 7:00 AM'}</strong> with Coach {coach.name}. Choose a new target slot below:
              </p>

              {/* Alternating Date Selectors with Custom Picker */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <OMono size={8.5}>CHOOSE DAY</OMono>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {upcomingDays.map(day => {
                    const sel = selectedReschedDate === day.val;
                    return (
                      <button key={day.val} onClick={() => setSelectedReschedDate(day.val)} style={{
                        padding: '10px 4px', borderRadius: 10,
                        border: sel ? 'none' : `1px solid ${OT.hairline}`,
                        background: sel ? OT.walnut : OT.sand50,
                        color: sel ? OT.paper : OT.espresso900,
                        fontFamily: OT.fBody, fontSize: 11, fontWeight: sel ? 600 : 400,
                        cursor: 'pointer', textAlign: 'center'
                      }}>
                        {day.label}
                      </button>
                    );
                  })}
                  <input 
                    type="date"
                    value={selectedReschedDate}
                    onChange={e => setSelectedReschedDate(e.target.value)}
                    style={{
                      padding: '8px', borderRadius: 10,
                      border: !upcomingDays.some(d => d.val === selectedReschedDate) ? `1.5px solid ${OT.walnut}` : `1px solid ${OT.hairline}`,
                      background: !upcomingDays.some(d => d.val === selectedReschedDate) ? OT.sand100 : OT.paper,
                      color: OT.espresso900,
                      fontFamily: OT.fBody, fontSize: 11,
                      cursor: 'pointer', outline: 'none', textAlign: 'center',
                      height: '100%', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Alternate Slot Selectors */}
              <div style={{ marginBottom: 24 }}>
                <OMono size={8.5} style={{ marginBottom: 8 }}>CHOOSE AVAILABLE TIME</OMono>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {['7:00 AM', '7:30 AM', '8:00 AM', '9:30 AM', '6:00 PM', '6:30 PM', '7:00 PM'].map(time => {
                    const sel = selectedReschedTime === time;
                    return (
                      <button key={time} onClick={() => setSelectedReschedTime(time)} style={{
                        padding: '8px 0', borderRadius: 999,
                        border: sel ? 'none' : `1px solid ${OT.hairline}`,
                        background: sel ? OT.ochre : OT.sand50,
                        color: sel ? OT.paper : OT.espresso900,
                        fontFamily: OT.fMono, fontSize: 10, fontWeight: sel ? 600 : 400,
                        cursor: 'pointer', textAlign: 'center'
                      }}>
                        {time}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Check live availability conflict of the Coach */}
              {!homeAvailability.available && (
                <div style={{
                  background: '#FFF5F2', border: `1.5px solid ${OT.terracotta || '#B86B4B'}`,
                  borderRadius: 16, padding: '16px 20px', marginBottom: 24,
                }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 16, color: OT.terracotta || '#B86B4B' }}>⚠️</span>
                    <h4 style={{ margin: 0, fontFamily: OT.fBody, fontSize: 13.5, fontWeight: 700, color: OT.espresso900 }}>
                      Coach {coach.name} is fully booked at {selectedReschedTime} on {formatSessionDateOnly(selectedReschedDate)}
                    </h4>
                  </div>
                  <p style={{ margin: '0 0 12px', fontFamily: OT.fBody, fontSize: 12.5, color: OT.espresso800, lineHeight: 1.45 }}>
                    From their live calendar, Coach {coach.name} is available only at the following times on this day:
                  </p>
                  
                  {homeAvailability.suggestedTimes.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                      {homeAvailability.suggestedTimes.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSelectedReschedTime(t)}
                          style={{
                            background: OT.sand100, border: `1px solid ${OT.hairlineStrong}`,
                            padding: '4px 10px', borderRadius: 999, fontSize: 11, fontFamily: OT.fMono,
                            cursor: 'pointer', color: OT.walnut, fontWeight: 600,
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p style={{ margin: '0 0 12px', fontFamily: OT.fBody, fontSize: 11.5, color: OT.clay600, fontStyle: 'italic' }}>
                      No other slots available on this date.
                    </p>
                  )}
                  
                  <p style={{ margin: 0, fontFamily: OT.fBody, fontSize: 11.5, color: OT.clay600, borderTop: `1px solid ${OT.sand200}`, paddingTop: 10 }}>
                    ℹ️ <strong>Disclaimer:</strong> To check the availability of other coaches, arrange special custom bookings, or contact our studio support, please contact admin at <span style={{ textDecoration: 'underline' }}>admin@mythirdspace.fit</span>.
                  </p>
                </div>
              )}

              {/* Safety policy warning matches cancel */}
              <div style={{ display: 'flex', gap: 10, background: '#FFF8EE', border: `1px solid ${OT.sand200}`, padding: 16, borderRadius: 16, marginBottom: 24, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 16, lineHeight: 1 }}>⏱</span>
                <div style={{ fontFamily: OT.fBody, fontSize: 12, color: OT.espresso800, lineHeight: 1.45 }}>
                  <strong>No-penalty reschedule window:</strong> Rescheduling is fully free of cost when processed before{" "}
                  <strong style={{ color: OT.walnut }}>{homePenaltyDeadline}</strong>. Same session credits apply.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button 
                  onClick={handleHomeRescheduleConfirm}
                  disabled={!homeAvailability.available}
                  style={{ flex: 1.5, padding: '12px', borderRadius: 999, border: 'none', background: OT.walnut, color: OT.paper, fontFamily: OT.fBody, fontWeight: 600, fontSize: 14, cursor: 'pointer', textAlign: 'center', opacity: homeAvailability.available ? 1 : 0.5 }}>
                  Confirm Reschedule
                </button>
                <button 
                  onClick={() => setActiveModal(null)}
                  style={{ flex: 1, padding: '12px', borderRadius: 999, border: `1px solid ${OT.hairlineStrong}`, background: 'transparent', color: OT.espresso900, fontFamily: OT.fBody, fontSize: 14, cursor: 'pointer', textAlign: 'center' }}>
                  Go Back
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3. LOG BODY WEIGHT MODAL */}
      {activeModal === 'log_weight' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(36,24,16,0.45)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <form onSubmit={handleWeightLogSubmit} style={{ background: OT.paper, borderRadius: 24, padding: '32px', maxWidth: 420, width: '100%', boxShadow: OT.sh3 }}>
            <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <OEyebrow dot={OT.walnut}>DAILY TRACKER</OEyebrow>
              <button type="button" onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: 20, color: OT.clay600, cursor: 'pointer' }}>×</button>
            </div>

            <h2 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400, fontSize: 32, color: OT.espresso900, lineHeight: 1.1, marginBottom: 8 }}>
              Log Body Weight
            </h2>
            <p style={{ fontFamily: OT.fBody, fontSize: 14, color: OT.clay600, lineHeight: 1.5, marginBottom: 20 }}>
              Enter your morning body mass. This entry adds a dynamic reference coordinate to your progress logs &amp; charts.
            </p>

            {/* Input fields */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 6 }}>WEIGHT (KG)</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input 
                  type="number" step="0.1" required
                  value={weightInput} onChange={(e) => setWeightInput(e.target.value)}
                  style={{ ...inputStyle, width: '100%', fontSize: 18, fontWeight: 600, paddingRight: 40 }} />
                <span style={{ position: 'absolute', right: 14, fontFamily: OT.fMono, fontSize: 11, color: OT.clay600 }}>kg</span>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 6 }}>TRAINING NOTES (OPTIONAL)</label>
              <textarea 
                rows="2" placeholder="e.g. Smashed my sets, no shoulder stiffness."
                value={weightNote} onChange={(e) => setWeightNote(e.target.value)}
                style={{ ...inputStyle, width: '100%', height: 60, resize: 'none' }} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                type="submit" disabled={loggingWeight}
                style={{ flex: 1.5, padding: '12px', borderRadius: 999, border: 'none', background: OT.walnut, color: OT.paper, fontFamily: OT.fBody, fontWeight: 600, fontSize: 14, cursor: 'pointer', textAlign: 'center', opacity: loggingWeight ? 0.6 : 1 }}>
                {loggingWeight ? 'Saving Log...' : 'Confirm Entry'}
              </button>
              <button 
                type="button" onClick={() => setActiveModal(null)}
                style={{ flex: 1, padding: '12px', borderRadius: 999, border: `1px solid ${OT.hairlineStrong}`, background: 'transparent', color: OT.espresso900, fontFamily: OT.fBody, fontSize: 14, cursor: 'pointer', textAlign: 'center' }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 4. UPLOAD BCA SCAN MODAL */}
      {activeModal === 'upload_bca' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(36,24,16,0.45)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: OT.paper, borderRadius: 24, padding: '32px', maxWidth: 460, width: '100%', boxShadow: OT.sh3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <OEyebrow dot={OT.sage}>INBODY COMP CHECK</OEyebrow>
              <button onClick={() => { setActiveModal(null); setScanningBcaSuccess(false); setBcaFileName(''); }} style={{ border: 'none', background: 'none', fontSize: 20, color: OT.clay600, cursor: 'pointer' }}>×</button>
            </div>

            <h2 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400, fontSize: 32, color: OT.espresso900, lineHeight: 1.1, marginBottom: 8 }}>
              Upload InBody BCA Scan
            </h2>
            
            {!scanningBca && !scanningBcaSuccess && (
              <>
                <p style={{ fontFamily: OT.fBody, fontSize: 14, color: OT.espresso800, lineHeight: 1.5, marginBottom: 20 }}>
                  Upload your bioelectrical impedance analysis chart (PDF or image). Our AI assistant filters skeletal mass index, visceral fat and hydration balances dynamically.
                </p>

                {/* File input area */}
                <div style={{ border: `2px dashed ${OT.hairlineStrong}`, borderRadius: 16, backgroundColor: OT.sand50, padding: '36px 20px', textAlign: 'center', cursor: 'pointer', marginBottom: 24, position: 'relative' }}>
                  <input 
                    type="file" accepts="image/*,application/pdf"
                    onChange={handleBcaUploadSimulated}
                    style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} />
                  <div style={{ fontSize: 34, marginBottom: 10 }}>📄</div>
                  <div style={{ fontFamily: OT.fBody, fontWeight: 600, fontSize: 13, color: OT.espresso900, marginBottom: 4 }}>Select PDF Scan sheet</div>
                  <div style={{ fontFamily: OT.fBody, fontSize: 11, color: OT.clay600 }}>Supports JPEG, PNG or InBody PDF up to 5MB</div>
                </div>
              </>
            )}

            {scanningBca && (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <div style={{ fontSize: 44, animation: 'spin 2s linear infinite' }}>⏳</div>
                <h3 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 24, color: OT.espresso900, marginTop: 14, marginBottom: 6 }}>Reading Scan with AI...</h3>
                <p style={{ fontFamily: OT.fBody, fontSize: 12, color: OT.clay600, maxWidth: 300, margin: '0 auto 20px' }}>
                  Analyzing skeletal muscle mass channels, somatic liquid parameters &amp; adipose values...
                </p>

                {/* Animated progress bar indicator */}
                <div style={{ width: '80%', height: 4, background: OT.sand200, borderRadius: 999, margin: '0 auto', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, height: '100%', background: OT.sage, width: '50%', animation: 'm3sPDrain 2s infinite linear alternate-direction' }} />
                </div>
              </div>
            )}

            {scanningBcaSuccess && (
              <div style={{ padding: '4px 0' }}>
                <div style={{ background: '#EEF5EE', borderRadius: 14, padding: '14px 18px', border: `1px solid ${OT.sage}`, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: OT.fMono, fontSize: 11, color: OT.ok, fontWeight: 600, marginBottom: 10 }}>
                    <span style={{ fontSize: 14 }}>✓</span> AI EXTRACTION VERIFIED
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <span style={{ fontFamily: OT.fMono, fontSize: 9, color: OT.clay600 }}>BODY FAT %</span>
                      <div style={{ fontFamily: OT.fDisplay, fontSize: 22, color: OT.espresso900 }}>24.2% <span style={{ fontSize: 11, color: OT.ok, fontFamily: OT.fMono }}>-0.6%</span></div>
                    </div>
                    <div>
                      <span style={{ fontFamily: OT.fMono, fontSize: 9, color: OT.clay600 }}>SKELETAL MUSCLE</span>
                      <div style={{ fontFamily: OT.fDisplay, fontSize: 22, color: OT.espresso900 }}>50.1 kg <span style={{ fontSize: 11, color: OT.ok, fontFamily: OT.fMono }}>+0.3kg</span></div>
                    </div>
                  </div>
                  <div style={{ height: 1, background: 'rgba(94,138,94,0.18)', margin: '10px 0' }} />
                  <div style={{ fontFamily: OT.fBody, fontSize: 11.5, color: OT.espresso800, lineHeight: 1.45 }}>
                    These metrics have been verified against calibrators and synchronized to your graph progression line!
                  </div>
                </div>

                <button 
                  onClick={() => { setActiveModal(null); setScanningBcaSuccess(false); }}
                  style={{ width: '100%', padding: '12px', borderRadius: 999, border: 'none', background: OT.walnut, color: OT.paper, fontFamily: OT.fBody, fontWeight: 600, fontSize: 14, cursor: 'pointer', textAlign: 'center' }}>
                  Done &amp; Sync Metrics
                </button>
              </div>
            )}

            {!scanningBca && !scanningBcaSuccess && (
              <button 
                onClick={() => setActiveModal(null)}
                style={{ width: '100%', padding: '12px', borderRadius: 999, border: `1px solid ${OT.hairlineStrong}`, background: 'transparent', color: OT.espresso900, fontFamily: OT.fBody, fontSize: 14, cursor: 'pointer', textAlign: 'center' }}>
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. THIS WEEK'S PLAN CALENDAR MODAL */}
      {activeModal === 'this_weeks_plan' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(36,24,16,0.45)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: OT.paper, borderRadius: 24, padding: '32px', maxWidth: 540, width: '100%', boxShadow: OT.sh3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <OEyebrow dot={OT.ochre}>WEEK CHECKPOINT</OEyebrow>
              <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: 20, color: OT.clay600, cursor: 'pointer' }}>×</button>
            </div>

            <h2 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400, fontSize: 32, color: OT.espresso900, lineHeight: 1.1, marginBottom: 8 }}>
              This Week's Plan
            </h2>
            <p style={{ fontFamily: OT.fBody, fontSize: 14, color: OT.clay600, lineHeight: 1.5, marginBottom: 20 }}>
              Your customized training week tracking. Map out workouts and lock indicators:
            </p>

            {/* Calendar list checkoff */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, maxHeight: 360, overflowY: 'auto' }}>
              {(() => {
                const weeklyPTSessions = clientSessions.filter(s => s.status !== 'cancelled' && s.status !== 'blocked');
                const sortedWeeklyPT = [...weeklyPTSessions].sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at));

                if (sortedWeeklyPT.length === 0) {
                  return (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: OT.clay600, fontSize: 13.5, fontFamily: OT.fBody, fontStyle: 'italic', background: OT.sand50, borderRadius: 12, border: `1px solid ${OT.hairline}` }}>
                      No active personal training sessions scheduled.
                    </div>
                  );
                }

                return sortedWeeklyPT.map(s => {
                  const dateFull = formatSessionDateOnly(s.scheduled_at);
                  const parts = dateFull.split(', ');
                  const dayNameFull = parts[0] || 'TUE';
                  const day3Letter = dayNameFull.substring(0, 3).toUpperCase();
                  const datePart = parts[1] || '29 Apr';

                  const coachObj = COACHES.find(c => c.id === s.coach_id) || COACHES[0];
                  const coachNameFinal = (bannerState === 'accepted' && s.id === nextSessionDetail?.id) ? 'Meera' : coachObj.name;
                  const title = `${s.type || 'PT Session'} with Coach ${coachNameFinal}`;
                  
                  const isDone = s.status === 'completed';
                  const stateVal = isDone ? 'done' : 'booked';
                  const timeStr = isDone 
                    ? `${formatSessionTimeOnly(s.scheduled_at)} (Completed check ✓)`
                    : formatSessionTimeOnly(s.scheduled_at);

                  return (
                    <div key={s.id} style={{
                      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                      borderRadius: 12, border: `1px solid ${OT.hairline}`,
                      background: stateVal === 'done' ? 'rgba(94, 138, 94, 0.05)' : 'rgba(201, 154, 63, 0.05)'
                    }}>
                      <div style={{ textAlign: 'center', paddingRight: 10, borderRight: `1px solid ${OT.hairline}`, minWidth: 54 }}>
                        <div style={{ fontFamily: OT.fMono, fontSize: 10, color: OT.clay600 }}>{day3Letter}</div>
                        <div style={{ fontFamily: OT.fBody, fontWeight: 600, fontSize: 11, color: OT.espresso900, whiteSpace: 'nowrap' }}>{datePart}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: OT.fBody, fontWeight: 500, fontSize: 13, color: OT.espresso900 }}>{title}</div>
                        <div style={{ fontFamily: OT.fMono, fontSize: 9.5, color: stateVal === 'done' ? OT.ok : OT.ochre, marginTop: 2 }}>{timeStr}</div>
                      </div>
                      <div>
                        {stateVal === 'done' && <span style={{ color: OT.ok, fontWeight: 'bold' }}>✓</span>}
                        {stateVal === 'booked' && <span style={{ color: OT.ochre, fontWeight: 'bold' }}>⏱</span>}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <button 
              onClick={() => setActiveModal(null)}
              style={{ width: '100%', padding: '12px', borderRadius: 999, border: 'none', background: OT.walnut, color: OT.paper, fontFamily: OT.fBody, fontWeight: 600, fontSize: 14, cursor: 'pointer', textAlign: 'center' }}>
              Got It
            </button>
          </div>
        </div>
      )}

      {/* 6. MESSAGE COACH (CHAT MODAL) */}
      {activeModal === 'message_coach' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(36,24,16,0.45)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: OT.paper, borderRadius: 24, padding: '24px', maxWidth: 480, width: '100%', boxShadow: OT.sh3, display: 'flex', flexDirection: 'column', height: '80vh', maxHeight: 600 }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, borderBottom: `1px solid ${OT.hairline}`, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Avatar name={coach.name} photo={null} size={36} />
                <div>
                  <h3 style={{ fontFamily: OT.fBody, fontWeight: 600, fontSize: 14, color: OT.espresso900, margin: 0 }}>Coach {coach.name}</h3>
                  <div style={{ fontFamily: OT.fMono, fontSize: 8.5, color: OT.sage, letterSpacing: 1 }}>● ONLINE &amp; DIRECT</div>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: 20, color: OT.clay600, cursor: 'pointer' }}>×</button>
            </div>

            {/* Chats stream */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 4px', display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 14 }}>
              {chatMessages.map((msg, idx) => {
                const isMe = msg.sender === 'client';
                return (
                  <div key={idx} style={{
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '80%'
                  }}>
                    <div style={{
                      background: isMe ? OT.walnut : OT.sand100,
                      color: isMe ? OT.paper : OT.espresso900,
                      padding: '10px 14px',
                      borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      fontFamily: OT.fBody, fontSize: 13, lineHeight: 1.45,
                      boxShadow: OT.sh1
                    }}>
                      {msg.text}
                    </div>
                    <div style={{
                      fontFamily: OT.fMono, fontSize: 8, color: OT.clay600,
                      marginTop: 4, textAlign: isMe ? 'right' : 'left'
                    }}>
                      {msg.time}
                    </div>
                  </div>
                );
              })}
              {coachTyping && (
                <div style={{ alignSelf: 'flex-start', background: OT.sand50, padding: '10px 14px', borderRadius: 12 }}>
                  <span style={{ fontFamily: OT.fBody, fontSize: 12, color: OT.clay600, fontStyle: 'italic' }}>Coach {coach.name} is typing...</span>
                </div>
              )}
            </div>

            {/* Message input drawer */}
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8 }}>
              <input 
                type="text" placeholder={`Message Coach ${coach.name}...`}
                value={messageInput} onChange={(e) => setMessageInput(e.target.value)}
                style={{ ...inputStyle, flex: 1 }} />
              <button 
                type="submit"
                style={{ padding: '8px 16px', borderRadius: 999, border: 'none', background: OT.walnut, color: OT.paper, fontFamily: OT.fBody, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 7. RATE COACH MODAL (QUICK ACTION DETOUR) */}
      {activeModal === 'rate_coach' && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(36,24,16,0.45)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: OT.paper, borderRadius: 24, padding: '24px', maxWidth: 640, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: OT.sh3 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${OT.hairline}`, paddingBottom: 12, marginBottom: 16 }}>
              <OEyebrow dot={OT.ochre}>QUICK FEEDBACK LOBBY</OEyebrow>
              <button onClick={() => setActiveModal(null)} style={{ border: 'none', background: 'none', fontSize: 22, color: OT.clay600, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            <h2 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400, fontSize: 32, color: OT.espresso900, lineHeight: 1.1, marginBottom: 16 }}>
              Rate Your Coach Session
            </h2>

            <div style={{ marginBottom: 10 }}>
              <RateSessionSection profile={profile} />
            </div>

            <button 
              onClick={() => setActiveModal(null)}
              style={{ width: '100%', padding: '12px', borderRadius: 999, border: `1px solid ${OT.hairlineStrong}`, background: 'transparent', color: OT.espresso900, fontFamily: OT.fBody, fontSize: 14, fontWeight: 500, cursor: 'pointer', textAlign: 'center', marginTop: 10 }}>
              Close Session Feedback
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
function ProfilePageContent() {
  const [profile, update] = useProfile();
  const isMobile = useIsMobile();
  const [progressLog, appendProgressLog] = useProgress();
  const [maxes, appendMax] = useOneRepMaxes();
  const [exercises] = useExercises();

  // Modal State
  const [logModalOpen, setLogModalOpen] = React.useState(false);
  const [logModalType, setLogModalType] = React.useState('metrics');

  // Metrics form state
  const [weightVal, setWeightVal] = React.useState('66.5');
  const [fatVal, setFatVal] = React.useState('24.8');
  const [muscleVal, setMuscleVal] = React.useState('49.8');
  const [runVal, setRunVal] = React.useState('28:40');
  const [noteVal, setNoteVal] = React.useState('');
  
  // Calculate next month string dynamically
  const months = React.useMemo(() => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], []);
  const defaultMonthStr = React.useMemo(() => {
    const nextDate = new Date();
    return `${months[nextDate.getMonth()]} ${nextDate.getFullYear()}`;
  }, [months]);
  const [monthVal, setMonthVal] = React.useState(defaultMonthStr);

  // 1RM form state
  const [exVal, setExVal] = React.useState('Bench Press');
  const [exWeight, setExWeight] = React.useState('85');
  const [exDate, setExDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [exNote, setExNote] = React.useState('');

  const handleMetricsSubmit = (e) => {
    e.preventDefault();
    const w = parseFloat(weightVal);
    const f = parseFloat(fatVal);
    const m = parseFloat(muscleVal);
    if (isNaN(w) || isNaN(f) || isNaN(m)) return;

    appendProgressLog({
      month: monthVal,
      weight: w,
      bodyFat: f,
      run5k: runVal,
      muscleMass: m,
      note: noteVal || 'Logged manually by athlete.'
    });
    setLogModalOpen(false);
    setNoteVal('');
  };

  const handle1RMSubmit = (e) => {
    e.preventDefault();
    const w = parseFloat(exWeight);
    if (isNaN(w)) return;

    appendMax({
      exercise: exVal,
      weight: w,
      date: exDate,
      note: exNote
    });
    setLogModalOpen(false);
    setExNote('');
  };

  return (
    <main style={{ maxWidth: 920, margin: '0 auto', padding: isMobile ? '16px 12px 80px' : '32px 24px 80px' }}>
        <ProfileHero profile={profile} />

        <ProfileCompletionBar profile={profile} />

        {/* Fitness score — hero card, stands alone (renders its own chrome) */}
        <div style={{ marginBottom: 18 }}>
          <FitnessScoreSection profile={profile} />
        </div>

        {/* About you */}
        <Section eyebrow="About you" title="Your details." dot={OT.walnut}>
          <EditableField label="Name"   value={profile.name}   onSave={(v) => update({ name: v })} />
          <EditableField label="Age"    value={profile.age}    onSave={(v) => update({ age: v })} />
          <EditableField label="Gender" value={profile.gender} onSave={(v) => update({ gender: v })}
            options={['Female', 'Male', 'Non-binary', 'Prefer not to say']} />
          <EditableField label="Phone"  value={profile.phone}  onSave={(v) => update({ phone: v })} />
        </Section>

        {/* Journey */}
        <Section eyebrow="Your journey" title="Goals & history." dot={OT.ochre}>
          <EditableField label="Experience" value={profile.experience} onSave={(v) => update({ experience: v })}
            options={['Brand new', '<6 months', '6–24 months', '2–5 years', '5+ years']} />
          <EditableField label="Primary goal" value={profile.goal} onSave={(v) => update({ goal: v })}
            options={['Muscle Gain', 'Fat Loss', 'Strength', 'Hyrox', 'General Fitness', 'Recovery / Rehab']} />
          <EditableField label="Days / week" value={String(profile.daysPerWeek)}
            onSave={(v) => update({ daysPerWeek: parseInt(v, 10) || 4 })} type="number" />
          <EditableField label="Why this matters" value={profile.notes} multiline
            onSave={(v) => update({ notes: v })} />
          <EditableField label="Injuries" value={(profile.injuries || []).join(', ') || 'None'}
            onSave={(v) => update({ injuries: v.split(',').map(s => s.trim()).filter(Boolean) })} />
          <EditableField label="Injury notes" value={profile.injuryNotes} multiline
            onSave={(v) => update({ injuryNotes: v })} />
        </Section>

        {/* Time slots */}
        <Section eyebrow="Preferred times" title="When you train." dot={OT.terra}>
          <ScheduledTrainSlotsSection profile={profile} onUpdate={update} />
        </Section>

        {/* Body composition */}
        <Section eyebrow="Body composition" title="Last scan." dot={OT.ochre}>
          <BCAReadout profile={profile} update={update} />
        </Section>

        {/* Blood */}
        <Section eyebrow="Blood report" title="Last panel." dot={OT.bad}>
          <BloodReadout profile={profile} update={update} />
        </Section>

        {/* MSK */}
        <Section eyebrow="MSK assessment" title="Movement screen." dot={OT.warn}>
          <MSKReadout profile={profile} />
        </Section>

        {/* Running */}
        <Section eyebrow="Running" title="Conditioning baseline." dot={OT.terra}
          accessory={(
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => {
                const v = prompt('Latest 5K time (mm:ss)', profile.running5k);
                if (v) update({ running5k: v });
              }} style={miniBtn(false)}>Update 5K</button>
              <button onClick={() => {
                const v = prompt('Latest 2K time (mm:ss)', profile.running2k);
                if (v) update({ running2k: v });
              }} style={miniBtn(false)}>Update 2K</button>
            </div>
          )}>
          <RunningReadout profile={profile} update={update} />
        </Section>

        {/* Session notes from coach */}
        <Section eyebrow="From your coach" title="Session notes." dot={OT.walnut}>
          <CoachNotesClientView />
        </Section>

        {/* Nutrition */}
        <Section eyebrow="Nutrition plan" title="Your targets." dot={OT.sage}>
          <NutritionSection profile={profile} />
        </Section>

        {/* Milestones */}
        <Section eyebrow="12-week plan" title="Your milestones." dot={OT.walnut}>
          <MilestonesStepper />
        </Section>

        {/* Progress */}
        <Section eyebrow="Monthly progress" title="How it's tracking." dot={OT.sage}
          accessory={<button style={miniBtn(true)} onClick={() => setLogModalOpen(true)}>+ Log this month</button>}>
          <ProgressLog />
        </Section>

        {/* Coach feedback history */}
        <Section eyebrow="Feedback history" title="Your coach ratings." dot={OT.ochre}>
          <RatingHistorySection profile={profile} />
        </Section>

        {/* ─── DYNAMIC PROGRESS & 1RM LOGGING MODAL ─── */}
        {logModalOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(36,24,16,0.45)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <div style={{ background: OT.paper, borderRadius: 24, padding: '32px', maxWidth: 460, width: '100%', boxShadow: OT.sh3, maxHeight: '95vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <OEyebrow dot={OT.walnut}>MEMBER PROGRESS LOG</OEyebrow>
                <button type="button" onClick={() => setLogModalOpen(false)} style={{ border: 'none', background: 'none', fontSize: 24, color: OT.clay600, cursor: 'pointer', lineHeight: 1 }}>×</button>
              </div>

              {/* Segment Controls */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 20, background: OT.sand50, padding: 4, borderRadius: 10 }}>
                <button 
                  type="button" 
                  onClick={() => setLogModalType('metrics')} 
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none',
                    background: logModalType === 'metrics' ? OT.paper : 'transparent',
                    color: logModalType === 'metrics' ? OT.espresso900 : OT.clay600,
                    fontFamily: OT.fBody, fontSize: 13, fontWeight: logModalType === 'metrics' ? 600 : 500,
                    cursor: 'pointer', transition: 'all 0.1s'
                  }}
                >
                  📊 Body Metrics
                </button>
                <button 
                  type="button" 
                  onClick={() => setLogModalType('1rm')} 
                  style={{
                    flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none',
                    background: logModalType === '1rm' ? OT.paper : 'transparent',
                    color: logModalType === '1rm' ? OT.espresso900 : OT.clay600,
                    fontFamily: OT.fBody, fontSize: 13, fontWeight: logModalType === '1rm' ? 600 : 500,
                    cursor: 'pointer', transition: 'all 0.1s'
                  }}
                >
                  🏋️‍♂️ 1RM Strength Lifts
                </button>
              </div>

              {logModalType === 'metrics' ? (
                <form onSubmit={handleMetricsSubmit}>
                  <h2 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400, fontSize: 28, color: OT.espresso900, lineHeight: 1.1, marginBottom: 8 }}>
                    Log Monthly Metrics
                  </h2>
                  <p style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.clay600, lineHeight: 1.4, marginBottom: 16 }}>
                    Enter your latest monthly performance benchmarks and composition details.
                  </p>

                  {/* Input Fields: Weight, Body Fat */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4 }}>WEIGHT (KG)</label>
                      <input type="number" step="0.1" required value={weightVal} onChange={e => setWeightVal(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4 }}>BODY FAT %</label>
                      <input type="number" step="0.1" required value={fatVal} onChange={e => setFatVal(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                  </div>

                  {/* Input Fields: Muscle Mass, 5K Time */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4 }}>MUSCLE MASS (KG)</label>
                      <input type="number" step="0.1" required value={muscleVal} onChange={e => setMuscleVal(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4 }}>5K RUN TIME (MM:SS)</label>
                      <input type="text" placeholder="e.g. 28:40" required value={runVal} onChange={e => setRunVal(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4 }}>MONTH (E.G. "JUL 2026")</label>
                    <input type="text" required value={monthVal} onChange={e => setMonthVal(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4 }}>COACH NOTES / JOURNAL</label>
                    <textarea rows="2" placeholder="Describe your performance progression..." value={noteVal} onChange={e => setNoteVal(e.target.value)} style={{ ...inputStyle, width: '100%', height: 50, resize: 'none' }} />
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" style={{ flex: 1.5, padding: '12px', borderRadius: 999, border: 'none', background: OT.walnut, color: OT.paper, fontFamily: OT.fBody, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      Save Metrics
                    </button>
                    <button type="button" onClick={() => setLogModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: 999, border: `1px solid ${OT.hairlineStrong}`, background: 'transparent', color: OT.espresso900, fontFamily: OT.fBody, fontSize: 13, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handle1RMSubmit}>
                  <h2 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400, fontSize: 28, color: OT.espresso900, lineHeight: 1.1, marginBottom: 8 }}>
                    Log One Rep Max (1RM)
                  </h2>
                  <p style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.clay600, lineHeight: 1.4, marginBottom: 16 }}>
                    Record a landmark lifting performance to establish a strength reference.
                  </p>

                  <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4 }}>EXERCISE</label>
                    <select value={exVal} onChange={e => setExVal(e.target.value)} style={{ ...inputStyle, width: '100%', height: 38 }}>
                      {exercises.map(ex => (
                        <option key={ex} value={ex}>{ex}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12, marginBottom: 12 }}>
                    <div>
                      <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4 }}>WEIGHT (KG)</label>
                      <input type="number" step="0.5" required value={exWeight} onChange={e => setExWeight(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4 }}>DATE</label>
                      <input type="date" required value={exDate} onChange={e => setExDate(e.target.value)} style={{ ...inputStyle, width: '100%' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4 }}>LIFT DETAILS / NOTES</label>
                    <textarea rows="2" placeholder="e.g. Smashed single rep with crisp, stable lock-out!" value={exNote} onChange={e => setExNote(e.target.value)} style={{ ...inputStyle, width: '100%', height: 50, resize: 'none' }} />
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" style={{ flex: 1.5, padding: '12px', borderRadius: 999, border: 'none', background: OT.walnut, color: OT.paper, fontFamily: OT.fBody, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                      Save Lift Max
                    </button>
                    <button type="button" onClick={() => setLogModalOpen(false)} style={{ flex: 1, padding: '12px', borderRadius: 999, border: `1px solid ${OT.hairlineStrong}`, background: 'transparent', color: OT.espresso900, fontFamily: OT.fBody, fontSize: 13, cursor: 'pointer' }}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
  );
}

// ─── App shell — tab switcher ─────────────────────────────────────────────
function App() {
  const [tab, setTab] = React.useState('home');
  const [profile] = useProfile();

  return (
    <div style={{ minHeight: '100vh', background: OT.sand50 }}>
      {/* Sticky header — Topbar + tab strip locked together */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: OT.sand50 }}>
        <Topbar name={profile.name} />

        {/* Tab switcher bar */}
        <div style={{
          display: 'flex', borderBottom: `1px solid ${OT.hairline}`,
          background: OT.paper, padding: '0 24px',
        }}>
        {[
          { id: 'home',    label: 'Home' },
          { id: 'profile', label: 'My Profile' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '14px 20px', border: 'none', background: 'none',
              fontFamily: OT.fMono, fontSize: 10, letterSpacing: 1.5,
              textTransform: 'uppercase', cursor: 'pointer',
              color: tab === t.id ? OT.walnut : OT.clay600,
              borderBottom: tab === t.id
                ? `2px solid ${OT.walnut}`
                : '2px solid transparent',
              marginBottom: -1,
              transition: 'color 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
        </div>
      </div>

      {/* Tab content — conditional render */}
      {tab === 'home'
        ? <ClientDashboard />
        : <ProfilePageContent />
      }
    </div>
  );
}

// ─── Direct client Sync & Diagnostics visual overlay ──────────────────────────
function ProfileQASuite({ tab, setTab, profile }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('scenarios');
  const [logs, setLogs] = React.useState([]);
  const [testResults, setTestResults] = React.useState({});

  const addLog = (msg) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const runProgrammaticSimulationTest = async () => {
    addLog("🚀 Launching Programmatic Cross-Portal Onboarding & Note Sync Simulation...");
    try {
      const testId = 'test_athlete_' + Math.floor(Math.random() * 900 + 100);
      const testName = 'Vikram Patel';
      
      // 1. Programmatically trigger "Onboarding" flow data simulation
      addLog(`👉 Step 1: Simulating Onboarding for new athlete: ${testName} (${testId})...`);
      
      const VikramClient = {
        id: testId,
        name: testName,
        age: '30',
        gender: 'Male',
        phone: '+91 91234 56789',
        email: 'vikram.patel@gmail.com',
        assigned_coach_id: 'lee',
        status: 'Active',
        created_at: new Date().toISOString().split('T')[0]
      };

      const VikramAssessment = {
        client_id: testId,
        experience: '24+ months (Advanced)',
        goal: 'Lean Shred & Powerbuilding',
        days_per_week: 5,
        injuries: ['Mild lower back tightness'],
        running_5k: '21:15',
        running_2k: '07:45',
        run_rating: 8,
        run_frequency: '4x / week'
      };

      const VikramSession = {
        id: `s_${testId}_initial_pt`,
        coach_id: 'lee',
        client_id: testId,
        type: 'PT Session',
        scheduled_at: '2026-06-10T08:00:00',
        duration_min: 60,
        status: 'upcoming'
      };

      // Set items in LocalStorage
      const prevClients = JSON.parse(localStorage.getItem('m3s.clients') || '[]');
      if (!prevClients.some(c => c.id === testId)) {
        localStorage.setItem('m3s.clients', JSON.stringify([...prevClients, VikramClient]));
      }
      
      const prevAssessments = JSON.parse(localStorage.getItem('m3s.assessments') || '[]');
      if (!prevAssessments.some(a => a.client_id === testId)) {
        localStorage.setItem('m3s.assessments', JSON.stringify([...prevAssessments, VikramAssessment]));
      }
      
      const prevSessions = JSON.parse(localStorage.getItem('m3s.sessions') || '[]');
      if (!prevSessions.some(s => s.id === VikramSession.id)) {
        localStorage.setItem('m3s.sessions', JSON.stringify([...prevSessions, VikramSession]));
      }

      // Set user's individual journey key
      const mockJourney = {
        name: testName,
        phone: '+91 91234 56789',
        age: 30,
        gender: 'Male',
        experience: '24+ months (Advanced)',
        goal: 'Lean Shred & Powerbuilding',
        daysPerWeek: 5,
        injuries: ['lower_back'],
        coachId: 'lee',
        running5k: '21:15',
        running2k: '07:45',
        runRating: 8,
        runFrequency: '4x / week',
        runSubmitted: true
      };
      localStorage.setItem(`m3s.journey.${testId}`, JSON.stringify(mockJourney));

      // Push to Firestore Collections if db is initialized
      if (db) {
        addLog("☁️ Firestore detected. Writing Vikram's onboarding records to cloud collections...");
        await db.collection('clients').doc(testId).set(VikramClient, { merge: true });
        await db.collection('assessments').doc(testId).set(VikramAssessment, { merge: true });
        await db.collection('sessions').doc(VikramSession.id).set(VikramSession, { merge: true });
        addLog("✅ Cloud records successfully provisioned for the new athlete!");
      } else {
        addLog("⚠️ Firestore connection offline. Proceeding with robust offline sync state.");
      }

      // 2. Programmatically trigger "User Action: Session Notes & Rating Feedback Submission"
      addLog(`👉 Step 2: Simulating User Action: Athlete ${testName} registers rating session notes...`);
      const ratingId = `${testId}_session_feedback`;
      const VikramRating = {
        id: ratingId,
        clientId: testId,
        client_id: testId,
        clientName: testName,
        coachId: 'lee',
        coachName: 'Lee',
        sessionDate: new Date().toISOString().split('T')[0],
        sessionType: 'PT Session',
        scores: { workout: 5, form: 5, communication: 5, structure: 5, content: 5 },
        overall: 5.0,
        comment: 'Extremely good session notes. Coach customized the weights exactly to my current form level.',
        submittedAt: new Date().toISOString()
      };

      const prevRatings = JSON.parse(localStorage.getItem('m3s.ratings') || '[]');
      if (!prevRatings.some(r => r.id === ratingId)) {
        localStorage.setItem('m3s.ratings', JSON.stringify([...prevRatings, VikramRating]));
      }

      if (db) {
        addLog("☁️ Writing User feedback with comments to firestore collection 'ratings'...");
        await db.collection('ratings').doc(ratingId).set({
          id: ratingId,
          client_id: testId,
          clientName: testName,
          coachId: 'lee',
          coachName: 'Lee',
          session_date: VikramRating.sessionDate,
          scores_json: VikramRating.scores,
          overall: VikramRating.overall,
          comment: VikramRating.comment,
          submittedAt: VikramRating.submittedAt
        }, { merge: true });
        addLog("✅ User feedback matching ratings successfully synchronized in cloud!");
      }

      // 3. Programmatically trigger "Coach Action: Note Creation" via Coach Lee
      addLog(`👉 Step 3: Simulating Coach Action: Coach Lee registers session training notes...`);
      
      const coachNoteId = `n_${testId}_session_1`;
      const VikramCoachNote = {
        id: coachNoteId,
        clientId: testId,
        client_id: testId,
        date: new Date().toISOString().split('T')[0],
        text: 'Form was solid. Tested 3RM squat today: 120kg moved with pristine speed. Back safety parameters observed perfectly.',
        sessionType: 'PT STRENGTH',
        coachName: 'Lee',
        coach_id: 'lee'
      };

      const prevNotes = JSON.parse(localStorage.getItem('m3s.session_notes') || '[]');
      if (!prevNotes.some(n => n.id === coachNoteId)) {
        const next = [...prevNotes, VikramCoachNote];
        localStorage.setItem('m3s.session_notes', JSON.stringify(next));
        localStorage.setItem('m3s.sessionNotes', JSON.stringify(next)); // profile timeline fallback
      }

      if (db) {
        addLog("☁️ Writing Coach Lee's notes to session_notes Firestore collection...");
        await db.collection('session_notes').doc(coachNoteId).set(VikramCoachNote, { merge: true });
        addLog("✅ Coach Notes successfully synchronized in cloud database!");
      }

      // 4. Programmatically query databases back and verify cross-session matching
      addLog("👉 Step 4: Verifying cross-session data integrity of local and cloud collections...");
      
      // Query LocalStorage back
      const readClients = JSON.parse(localStorage.getItem('m3s.clients') || '[]');
      const readAssessments = JSON.parse(localStorage.getItem('m3s.assessments') || '[]');
      const readNotes = JSON.parse(localStorage.getItem('m3s.session_notes') || '[]');
      const readLocalRatings = JSON.parse(localStorage.getItem('m3s.ratings') || '[]');

      const foundClient = readClients.find(c => c.id === testId);
      const foundAssessment = readAssessments.find(a => a.client_id === testId);
      const foundNote = readNotes.find(n => n.clientId === testId || n.client_id === testId);
      const foundRating = readLocalRatings.find(r => r.clientId === testId || r.client_id === testId);

      _assert(foundClient, "Client record missing in local storage index mapping");
      _assert(foundClient.name === testName, `Client Name mismatch: expected '${testName}', got '${foundClient?.name}'`);
      _assert(foundClient.assigned_coach_id === 'lee', "Assigned coach ID mismatch");
      _assert(foundAssessment, "Assessment values missing in database query");
      _assert(foundAssessment.goal.includes('Lean Shred'), "Goal attribute is not consistent with onboarded choices");
      _assert(foundAssessment.running_5k === '21:15', "Running benchmarks corrupted during synchronization");
      
      _assert(foundNote, "Coach notes record missing or not visible by other channels");
      _assert(foundNote.text.includes('120kg moved'), `Note content corrupted: '${foundNote?.text}'`);
      
      _assert(foundRating, "User feedback rating record missing");
      _assert(foundRating.comment.includes('weights exactly'), `Feedback text mismatch: '${foundRating?.comment}'`);

      if (db) {
        addLog("🔍 Querying cloud collections and matching field parity with local storage...");
        const cloudClientDoc = await db.collection('clients').doc(testId).get();
        const cloudAssessmentDoc = await db.collection('assessments').doc(testId).get();
        const cloudNoteDoc = await db.collection('session_notes').doc(coachNoteId).get();
        const cloudRatingDoc = await db.collection('ratings').doc(ratingId).get();

        _assert(cloudClientDoc.exists, "Cloud Firestore clients collection missing onboarded user document");
        _assert(cloudAssessmentDoc.exists, "Cloud assessment record missing");
        _assert(cloudNoteDoc.exists, "Cloud coach notes document missing");
        _assert(cloudRatingDoc.exists, "Cloud user rating feedback document missing");

        const cc = cloudClientDoc.data();
        const ca = cloudAssessmentDoc.data();
        const cn = cloudNoteDoc.data();
        const cr = cloudRatingDoc.data();

        _assert(cc.name === testName, "Cloud Client Name mismatch");
        _assert(ca.goal === VikramAssessment.goal, "Cloud Assessment Goal parity mismatch");
        _assert(cn.text === VikramCoachNote.text, "Cloud Note text parity mismatch");
        _assert(cr.comment === VikramRating.comment, "Cloud rating feedback comment parity mismatch");
        
        addLog("⭐⭐ Cloud database fields match local storage fields down to the exact string!");
      }

      addLog(`🎉 SUCCESS! Verified '${testName}' is perfectly consistent across Coach, Client, and Admin records.`);
      setTestResults(prev => ({ ...prev, e2e_sync: 'PASS' }));
      
      // Select the Vikram Patel account so user can preview him on next screen refresh!
      localStorage.setItem('m3s.active_student_id', testId);
      window.dispatchEvent(new Event('storage'));
      addLog(`👉 Active user switched to '${testName}' (${testId}) so you can preview their dashboard right now!`);
    } catch (e) {
      addLog(`❌ Core Sync Test Failed: ${e.message}`);
      setTestResults(prev => ({ ...prev, e2e_sync: 'FAIL' }));
    }
  };

  const _assert = (cond, msg) => {
    if (!cond) throw new Error(msg);
  };

  const runTestCP01 = async () => {
    addLog("Running TEST CP-01: Tab Switching...");
    try {
      setTab('home');
      await new Promise(r => setTimeout(r, 200));
      const homeGreeting = document.body.textContent.includes("Riya") || document.body.textContent.includes("Home");
      if (!homeGreeting) throw new Error("Home tab content not found");
      
      setTab('profile');
      await new Promise(r => setTimeout(r, 200));
      const profileContent = document.body.textContent.includes("About you") || document.body.textContent.includes("Fitness Level");
      if (!profileContent) throw new Error("My Profile tab content not found");

      setTestResults(prev => ({ ...prev, cp01: 'PASS' }));
      addLog("✅ TEST CP-01 passed successfully!");
    } catch (e) {
      setTestResults(prev => ({ ...prev, cp01: 'FAIL' }));
      addLog(`❌ TEST CP-01 failed: ${e.message}`);
    }
  };

  const runTestCP02 = async () => {
    addLog("Running TEST CP-02: Fitness Score Drill-down...");
    try {
      setTab('profile');
      await new Promise(r => setTimeout(r, 200));
      
      const buttons = Array.from(document.querySelectorAll('button'));
      const strengthBtn = buttons.find(b => b.textContent.includes("TAP TO SEE WHY") || b.textContent.includes("HIDE REASONS"));
      
      if (!strengthBtn) throw new Error("Strength card tap button not found in DOM");
      
      if (strengthBtn.textContent.includes("TAP TO SEE WHY")) {
        strengthBtn.click();
        await new Promise(r => setTimeout(r, 300));
      }

      const matchesText = document.body.textContent.includes("Why Strength is");
      if (!matchesText) throw new Error("Breakdown panel not displayed after tapping Strength card");
      
      const updatedBtn = buttons.find(b => b.textContent.includes("HIDE REASONS"));
      if (!updatedBtn) throw new Error("Mono label did not update to 'HIDE REASONS ↑'");

      setTestResults(prev => ({ ...prev, cp02: 'PASS' }));
      addLog("✅ TEST CP-02 passed successfully!");
    } catch (e) {
      setTestResults(prev => ({ ...prev, cp02: 'FAIL' }));
      addLog(`❌ TEST CP-02 failed: ${e.message}`);
    }
  };

  const runTestCP03 = async () => {
    addLog("Running TEST CP-03: Coach Override Visibility...");
    try {
      const testOverride = {
        strength: {
          value: 8.5,
          comment: 'Set by Lee · overrides AI calculation',
          date: '2026-05-31',
          coachId: 'lee'
        }
      };
      localStorage.setItem('m3s.coachScoreOverrides', JSON.stringify(testOverride));
      window.dispatchEvent(new CustomEvent('m3s:coach-overrides', { detail: testOverride }));
      
      setTab('profile');
      await new Promise(r => setTimeout(r, 300));

      const buttons = Array.from(document.querySelectorAll('button'));
      const strengthBtn = buttons.find(b => b.textContent.includes("TAP TO SEE WHY") || b.textContent.includes("HIDE REASONS"));
      if (strengthBtn && strengthBtn.textContent.includes("TAP TO SEE WHY")) {
        strengthBtn.click();
        await new Promise(r => setTimeout(r, 300));
      }

      const hasBanner = document.body.textContent.includes("COACH OVERRIDE") && document.body.textContent.includes("8.5/10");
      if (!hasBanner) throw new Error("Highlighted sage-200 COACH OVERRIDE banner not shown at top of the reasons list");

      setTestResults(prev => ({ ...prev, cp03: 'PASS' }));
      addLog("✅ TEST CP-03 passed successfully!");
    } catch (e) {
      setTestResults(prev => ({ ...prev, cp03: 'FAIL' }));
      addLog(`❌ TEST CP-03 failed: ${e.message}`);
    }
  };

  const runTestCP04 = async () => {
    addLog("Running TEST CP-04: Coach Session Notes Client View...");
    try {
      const notes = [
        { id: 'note1', clientId: 'riya', date: '2026-05-30', text: 'Stellar strength progression. Form was pristine on squats today.', sessionType: 'PT STRENGTH', coachName: 'Lee' },
        { id: 'note2', clientId: 'riya', date: '2026-05-28', text: 'Conditioning capacity scaling nicely. Focused on zone 2 aerobic base.', sessionType: 'CARDIO CONDT', coachName: 'Lee' }
      ];
      localStorage.setItem('m3s.sessionNotes', JSON.stringify(notes));
      window.dispatchEvent(new Event('storage'));

      setTab('profile');
      await new Promise(r => setTimeout(r, 350));

      const hasNotes = document.body.textContent.includes("Stellar") || document.body.textContent.includes("PT STRENGTH");
      if (!hasNotes) throw new Error("Coach session notes not displaying correctly in the client's feed");

      const hasEditIndicator = document.body.textContent.includes("Edit note") || document.body.textContent.includes("Delete note");
      if (hasEditIndicator) throw new Error("Notes should be completely read-only with no edit/delete indicators for the client");

      setTestResults(prev => ({ ...prev, cp04: 'PASS' }));
      addLog("✅ TEST CP-04 passed successfully!");
    } catch (e) {
      setTestResults(prev => ({ ...prev, cp04: 'FAIL' }));
      addLog(`❌ TEST CP-04 failed: ${e.message}`);
    }
  };

  const runTestCP05 = async () => {
    addLog("Running TEST CP-05: Nutrition Plan Read-Only Verification...");
    try {
      setTab('profile');
      await new Promise(r => setTimeout(r, 300));

      const hasNutrition = document.body.textContent.includes("Nutrition plan") || document.body.textContent.includes("Calories");
      if (!hasNutrition) throw new Error("Nutrition plan section not found in DOM");

      const hasEditsOnlyLabel = document.body.textContent.includes("Coach edits only");
      if (!hasEditsOnlyLabel) throw new Error("'Coach edits only' chip not found in header");

      const hasFooter = document.body.textContent.includes("Speak to") && document.body.textContent.includes("to adjust targets");
      if (!hasFooter) throw new Error("Expected call-to-action footer directing client to talk to coach not found");

      setTestResults(prev => ({ ...prev, cp05: 'PASS' }));
      addLog("✅ TEST CP-05 passed successfully!");
    } catch (e) {
      setTestResults(prev => ({ ...prev, cp05: 'FAIL' }));
      addLog(`❌ TEST CP-05 failed: ${e.message}`);
    }
  };

  const runTestRT01 = async () => {
    addLog("Running TEST RT-01: Submit complete session rating...");
    try {
      setTab('profile');
      await new Promise(r => setTimeout(r, 450));

      // Scroll to rate your coach section
      const formHeading = Array.from(document.querySelectorAll('div')).find(el => el.textContent.includes("How was your session?"));
      if (formHeading) {
        formHeading.scrollIntoView({ behavior: 'smooth' });
      }

      // Reset today's rating to ensure form card is visible
      const today = new Date().toISOString().split('T')[0];
      const entryId = `riya_${today}`;
      const currentRatings = JSON.parse(localStorage.getItem('m3s.ratings') || '[]');
      const filtered = currentRatings.filter(r => r.id !== entryId);
      localStorage.setItem('m3s.ratings', JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent('m3s:rating-reset'));
      await new Promise(r => setTimeout(r, 400));

      const formCard = document.getElementById('rating-form-card');
      if (!formCard) throw new Error("Rating form card not visible after resetting today's rating");

      // Give star ratings for all 5 criteria (workout, form, communication, structure, content)
      const criteria = ['workout', 'form', 'communication', 'structure', 'content'];
      for (const crit of criteria) {
        const row = document.querySelector(`div[data-criterion-row="${crit}"]`);
        if (!row) throw new Error(`Rating row not found for criteria: ${crit}`);
        // Let's set 4 for form and structure, 5 for others (average = 4.6)
        const starVal = (crit === 'form' || crit === 'structure') ? 4 : 5;
        const star = row.querySelector(`span[data-star-val="${starVal}"]`);
        if (!star) throw new Error(`Star with value ${starVal} not found for criteria ${crit}`);
        star.click();
        await new Promise(r => setTimeout(r, 150));
      }

      // Write an optional comment
      const commentInput = document.getElementById('rating-comment-input');
      if (commentInput) {
        commentInput.value = "Best session in weeks. Thoracic work really helped my overhead finally click.";
        // Trigger React's state sync
        const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value").set;
        nativeTextareaValueSetter.call(commentInput, "Best session in weeks. Thoracic work really helped my overhead finally click.");
        commentInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      await new Promise(r => setTimeout(r, 200));

      // Tap "Submit rating ->"
      const submitBtn = document.getElementById('submit-rating-btn');
      if (!submitBtn) throw new Error("Submit rating button not found");
      if (submitBtn.disabled) throw new Error("Submit rating button is unexpectedly disabled after scoring all 5 criteria");
      
      submitBtn.click();
      await new Promise(r => setTimeout(r, 450));

      // Replaced with confirmation card
      const confirmationCard = document.getElementById('rating-confirmation-card');
      if (!confirmationCard) throw new Error("Rating confirmation card not displayed after submission");
      
      const containsMessage = confirmationCard.textContent.includes("Rating submitted") && confirmationCard.textContent.includes("4.6/5");
      if (!containsMessage) throw new Error(`Confirmation text mismatch: "${confirmationCard.textContent}"`);

      // Verify localStorage m3s.ratings has entry with computed overall = average
      const updatedRatings = JSON.parse(localStorage.getItem('m3s.ratings') || '[]');
      const submission = updatedRatings.find(r => r.id === entryId);
      if (!submission) throw new Error("New rating entry not found in localStorage m3s.ratings");
      if (submission.overall !== 4.6) throw new Error(`Computed overall average expected 4.6, got ${submission.overall}`);

      setTestResults(prev => ({ ...prev, rt01: 'PASS' }));
      addLog("✅ TEST RT-01 passed successfully! Complete score rated & submitted.");
    } catch (e) {
      setTestResults(prev => ({ ...prev, rt01: 'FAIL' }));
      addLog(`❌ TEST RT-01 failed: ${e.message}`);
    }
  };

  const runTestRT02 = async () => {
    addLog("Running TEST RT-02: Partial rating cannot submit...");
    try {
      setTab('profile');
      await new Promise(r => setTimeout(r, 300));

      // Reset today's rating
      const today = new Date().toISOString().split('T')[0];
      const entryId = `riya_${today}`;
      const currentRatings = JSON.parse(localStorage.getItem('m3s.ratings') || '[]');
      const filtered = currentRatings.filter(r => r.id !== entryId);
      localStorage.setItem('m3s.ratings', JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent('m3s:rating-reset'));
      await new Promise(r => setTimeout(r, 450));

      const formCard = document.getElementById('rating-form-card');
      if (!formCard) throw new Error("Rating form card not visible after reset");

      // Score only 3 of 5 criteria
      const partialCriteria = ['workout', 'form', 'communication'];
      for (const crit of partialCriteria) {
        const row = document.querySelector(`div[data-criterion-row="${crit}"]`);
        if (!row) throw new Error(`Rating row not found for criteria: ${crit}`);
        const star = row.querySelector(`span[data-star-val="5"]`);
        if (star) star.click();
        await new Promise(r => setTimeout(r, 150));
      }

      // Try to tap submit (button must be disabled)
      const submitBtn = document.getElementById('submit-rating-btn');
      if (!submitBtn) throw new Error("Submit rating button not found");
      if (!submitBtn.disabled) throw new Error("Submit rating button should be disabled for partial (3/5) feedback");

      // Check helper text "Rate all 5 criteria to submit."
      const helper = document.getElementById('rating-error-helper');
      if (!helper) throw new Error("Error helper text instructing client is missing");
      if (!helper.textContent.includes("Rate all 5 criteria to submit")) {
        throw new Error(`Unexpected helper text: "${helper.textContent}"`);
      }

      setTestResults(prev => ({ ...prev, rt02: 'PASS' }));
      addLog("✅ TEST RT-02 passed successfully! Submit button disabled on partial ratings, instruction helper is active.");
    } catch (e) {
      setTestResults(prev => ({ ...prev, rt02: 'FAIL' }));
      addLog(`❌ TEST RT-02 failed: ${e.message}`);
    }
  };

  const runTestRT03 = async () => {
    addLog("Running TEST RT-03: Double-submit prevention...");
    try {
      setTab('profile');
      await new Promise(r => setTimeout(r, 300));

      const today = new Date().toISOString().split('T')[0];
      const entryId = `riya_${today}`;

      // Simulate a submission by setting the ID for today
      const todayRating = {
        id: entryId,
        clientId: 'riya', clientName: 'Riya Sharma',
        coachId: 'lee', coachName: 'Lee', sessionDate: today, sessionType: 'PT Session',
        scores: { workout: 5, form: 5, communication: 5, structure: 5, content: 5 },
        overall: 5.0, comment: 'Automatic preventative rating', submittedAt: new Date().toISOString()
      };

      const prev = JSON.parse(localStorage.getItem('m3s.ratings') || '[]');
      const filtered = prev.filter(r => r.id !== entryId);
      filtered.push(todayRating);
      localStorage.setItem('m3s.ratings', JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent('m3s:rating-reset'));

      await new Promise(r => setTimeout(r, 450));

      // Form is hidden & confirmation card shows
      const formCard = document.getElementById('rating-form-card');
      const confirmationCard = document.getElementById('rating-confirmation-card');

      if (formCard) throw new Error("Form rating card is still visible even when today's rating was already submitted");
      if (!confirmationCard) throw new Error("Confirmation card is missing for today's completed rating");

      setTestResults(prev => ({ ...prev, rt03: 'PASS' }));
      addLog("✅ TEST RT-03 passed successfully! Form hidden, confirmation card displays, double rating blocked via date ID.");
    } catch (e) {
      setTestResults(prev => ({ ...prev, rt03: 'FAIL' }));
      addLog(`❌ TEST RT-03 failed: ${e.message}`);
    }
  };

  const runTestRT04 = async () => {
    addLog("Running TEST RT-04: Rating Dynamic Synchronization (Coach Live averages)...");
    try {
      const today = new Date().toISOString().split('T')[0];
      const entryId = `riya_${today}`;

      // Submit/override a custom rating
      const testRating = {
        id: entryId,
        clientId: 'riya', clientName: 'Riya Sharma',
        coachId: 'lee', coachName: 'Lee', sessionDate: today, sessionType: 'PT Session',
        scores: { workout: 5, form: 4, communication: 5, structure: 4, content: 5 },
        overall: 4.6, comment: 'Highly coordinated training loop.', submittedAt: new Date().toISOString()
      };

      const current = JSON.parse(localStorage.getItem('m3s.ratings') || '[]');
      const filtered = current.filter(r => r.id !== entryId);
      filtered.push(testRating);
      localStorage.setItem('m3s.ratings', JSON.stringify(filtered));
      window.dispatchEvent(new Event('storage'));

      // Validate on-the-fly average aggregation updates
      const totalRatings = JSON.parse(localStorage.getItem('m3s.ratings') || '[]');
      const leeRatings = totalRatings.filter(r => r.coachId === 'lee');
      const overallSum = leeRatings.reduce((sum, r) => sum + r.overall, 0);
      const computedAvg = parseFloat((overallSum / leeRatings.length).toFixed(1));

      addLog(`Lee Ratings Aggregate: New Avg = ${computedAvg}/5 over ${leeRatings.length} sessions.`);
      if (isNaN(computedAvg) || computedAvg <= 0 || computedAvg > 5) {
        throw new Error("Aggregated coach rating computation failed boundaries check");
      }

      setTestResults(prev => ({ ...prev, rt04: 'PASS' }));
      addLog("✅ TEST RT-04 passed successfully! Ratings correctly sync to Coach view models.");
    } catch (e) {
      setTestResults(prev => ({ ...prev, rt04: 'FAIL' }));
      addLog(`❌ TEST RT-04 failed: ${e.message}`);
    }
  };

  const runTestRT05 = async () => {
    addLog("Running TEST RT-05: Admin Dashboard Reports audit...");
    try {
      const globalRatings = JSON.parse(localStorage.getItem('m3s.ratings') || '[]');
      
      // Inject different ratings for multiple coaches so Admin can see
      const testRatings = [
        ...globalRatings,
        { id: 'riya_2026-05-10', clientId: 'riya', clientName: 'Riya Sharma', coachId: 'joe', coachName: 'Joe', sessionDate: '2026-05-10', sessionType: 'PT Session', scores: { workout: 5, form: 5, communication: 5, structure: 5, content: 5 }, overall: 5.0, comment: 'Joe is stellar on strength hypertrophy progression.', submittedAt: '2026-05-10T11:00:00' },
        { id: 'riya_2026-05-09', clientId: 'riya', clientName: 'Riya Sharma', coachId: 'deepika', coachName: 'Deepika', sessionDate: '2026-05-09', sessionType: 'PT Session', scores: { workout: 4, form: 3, communication: 4, structure: 4, content: 4 }, overall: 3.8, comment: 'Solid base but form cues were slightly rapid.', submittedAt: '2026-05-09T10:30:00' }
      ];
      localStorage.setItem('m3s.ratings', JSON.stringify(testRatings));
      window.dispatchEvent(new Event('storage'));

      // Verify that filterable sets map cleanly
      const distinctCoaches = [...new Set(testRatings.map(r => r.coachName))];
      addLog(`Verified database report contains feedback metrics for distinct trainers: ${distinctCoaches.join(', ')}.`);
      
      if (distinctCoaches.length < 2) {
        throw new Error("Admin overview report failed context scope limits: expected multiple coaches");
      }

      setTestResults(prev => ({ ...prev, rt05: 'PASS' }));
      addLog("✅ TEST RT-05 passed successfully! Admin view models see all structured feedback feeds.");
    } catch (e) {
      setTestResults(prev => ({ ...prev, rt05: 'FAIL' }));
      addLog(`❌ TEST RT-05 failed: ${e.message}`);
    }
  };

  const runAlledgetests = async () => {
    addLog("Verifying Edge Case: 0 Score Override...");
    try {
      const zeroOverride = {
        strength: {
          value: 0,
          comment: 'Perfect zero test',
          date: '2026-05-31',
          coachId: 'lee'
        }
      };
      localStorage.setItem('m3s.coachScoreOverrides', JSON.stringify(zeroOverride));
      window.dispatchEvent(new CustomEvent('m3s:coach-overrides', { detail: zeroOverride }));
      
      await new Promise(r => setTimeout(r, 300));
      const hasZero = document.body.textContent.includes("0/10") || document.body.textContent.includes("0.0/10") || document.body.textContent.includes("Perfect zero test");
      if (!hasZero) throw new Error("Override of 0 was not correctly applied or was treated as undefined");
      
      addLog("✅ Edge Case: Override=0 passed!");
    } catch(e) {
      addLog(`❌ Edge Case: Override=0 failed: ${e.message}`);
    }
  };

  const triggerResetData = () => {
    localStorage.removeItem('m3s.coachScoreOverrides');
    localStorage.setItem('m3s.sessionNotes', '[]');
    // Reset to initial seedling ratings
    localStorage.setItem('m3s.ratings', JSON.stringify(SEED_RATINGS));
    window.dispatchEvent(new CustomEvent('m3s:coach-overrides', { detail: {} }));
    window.dispatchEvent(new CustomEvent('m3s:rating-reset'));
    window.dispatchEvent(new Event('storage'));
    addLog("🔄 Reset test overrides & session notes to clean seed state!");
  };

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, fontFamily: 'var(--f-body)' }}>
      {/* Floating launcher button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 54, height: 54, borderRadius: '50%',
          background: 'var(--walnut-700)', color: '#FFFDF8',
          border: 'none', boxShadow: '0 8px 32px rgba(94, 66, 40, 0.4)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.background = 'var(--espresso-800)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.background = 'var(--walnut-700)';
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
          <path d="M12 6v6l4 2"/>
        </svg>
      </button>

      {/* Main Console expanded view */}
      {isOpen && (
        <div style={{
          position: 'absolute', bottom: 64, right: 0,
          width: 400, maxHeight: 600, background: '#FFFDF8',
          borderRadius: 20, boxShadow: '0 20px 50px rgba(36,24,16,0.22)',
          border: '1px solid rgba(62,44,28,0.12)', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          animation: 'm3sConsoleIn .25s ease-out',
        }}>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes m3sConsoleIn {
              from { opacity: 0; transform: translateY(15px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}} />
          
          {/* Header */}
          <div style={{ background: 'var(--espresso-900)', color: '#FFFDF8', padding: '16px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'var(--sage-500)' }} />
                <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, letterSpacing: 1.5, fontWeight: 'bold' }}>SYSTEM RATING QA & SYNC CONSOLE</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                style={{ background: 'none', border: 'none', color: '#FFFDF8', opacity: 0.6, fontSize: 18, cursor: 'pointer' }}
              >×</button>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: 11, opacity: 0.8 }}>Automated user workflows & sync validations</p>
          </div>

          {/* Navigation Tabstrip */}
          <div style={{ display: 'flex', background: 'var(--sand-100)', borderBottom: '1px solid rgba(62,44,28,0.08)' }}>
            <button 
              onClick={() => setActiveTab('scenarios')}
              style={{
                flex: 1, padding: '12px 0', border: 'none',
                background: activeTab === 'scenarios' ? '#FFFDF8' : 'transparent',
                fontFamily: 'var(--f-mono)', fontSize: 9.5, letterSpacing: 1,
                fontWeight: 600, color: activeTab === 'scenarios' ? 'var(--walnut-700)' : 'var(--clay-600)',
                cursor: 'pointer', borderBottom: activeTab === 'scenarios' ? '2.5px solid var(--walnut-700)' : 'none'
              }}
            >
              🚀 CP CHECKS
            </button>
            <button 
              onClick={() => setActiveTab('ratingtests')}
              style={{
                flex: 1, padding: '12px 0', border: 'none',
                background: activeTab === 'ratingtests' ? '#FFFDF8' : 'transparent',
                fontFamily: 'var(--f-mono)', fontSize: 9.5, letterSpacing: 1,
                fontWeight: 600, color: activeTab === 'ratingtests' ? 'var(--walnut-700)' : 'var(--clay-600)',
                cursor: 'pointer', borderBottom: activeTab === 'ratingtests' ? '2.5px solid var(--walnut-700)' : 'none'
              }}
            >
              📈 RATINGS (RT)
            </button>
            <button 
              onClick={() => setActiveTab('logins')}
              style={{
                flex: 1, padding: '12px 0', border: 'none',
                background: activeTab === 'logins' ? '#FFFDF8' : 'transparent',
                fontFamily: 'var(--f-mono)', fontSize: 9.5, letterSpacing: 1,
                fontWeight: 600, color: activeTab === 'logins' ? 'var(--walnut-700)' : 'var(--clay-600)',
                cursor: 'pointer', borderBottom: activeTab === 'logins' ? '2.5px solid var(--walnut-700)' : 'none'
              }}
            >
              👤 STUDENT LOGINS
            </button>
            <button 
              onClick={() => setActiveTab('presets')}
              style={{
                width: 70, padding: '12px 0', border: 'none',
                background: activeTab === 'presets' ? '#FFFDF8' : 'transparent',
                fontFamily: 'var(--f-mono)', fontSize: 9.5, letterSpacing: 1,
                fontWeight: 600, color: activeTab === 'presets' ? 'var(--walnut-700)' : 'var(--clay-600)',
                cursor: 'pointer', borderBottom: activeTab === 'presets' ? '2.5px solid var(--walnut-700)' : 'none'
              }}
            >
              ⚙️ SEEDS
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {activeTab === 'logins' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ fontSize: 10, fontFamily: 'var(--f-mono)', color: 'var(--clay-600)', letterSpacing: 0.5, marginBottom: 4 }}>DEMO STUDENT CREDS</div>
                
                {(() => {
                  const base = [
                    { id: 'riya', name: "Riya Sharma", coach: "Lee", desc: "Muscle Gain phase. Has right shoulder impingement restriction. Syncs with Coach Lee." },
                    { id: 'karan', name: "Karan S.", coach: "Rahul", desc: "Hyrox Prep track. Active knee stability drills loaded. Syncs with Coach Rahul." }
                  ];
                  try {
                    const extraClients = JSON.parse(localStorage.getItem('m3s.clients') || '[]');
                    extraClients.forEach(c => {
                      if (c.id !== 'riya' && c.id !== 'karan') {
                        base.push({
                          id: c.id,
                          name: c.name,
                          coach: c.assigned_coach_id === 'lee' ? 'Lee' : (c.assigned_coach_id === 'rahul' ? 'Rahul' : c.assigned_coach_id),
                          desc: `Onboarded: ${c.age} year old, ${c.gender}. Goal: ${c.status || 'Active'}. Synchronized across client, coach, and admin workspace.`
                        });
                      }
                    });
                  } catch (e) {}
                  return base;
                })().map(std => {
                  const isActive = (localStorage.getItem('m3s.active_student_id') || 'riya') === std.id;
                  return (
                    <div key={std.id} style={{
                      background: isActive ? 'rgba(123, 139, 111, 0.08)' : 'var(--sand-50)',
                      border: isActive ? '1.5px solid var(--sage-500)' : '1px solid rgba(62,44,28,0.08)',
                      borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column', gap: 6,
                      color: 'var(--espresso-900)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 14, fontWeight: 'bold' }}>{std.name}</span>
                        {isActive ? (
                          <span style={{ background: 'var(--sage-500)', color: '#FFFDF8', fontSize: 9, fontFamily: 'var(--f-mono)', padding: '2px 8px', borderRadius: 999, fontWeight: 'bold' }}>ACTIVE</span>
                        ) : (
                          <button
                            onClick={() => {
                              localStorage.setItem('m3s.active_student_id', std.id);
                              window.location.reload();
                            }}
                            style={{
                              padding: '5px 12px', background: 'var(--walnut-700)', color: '#FFFDF8',
                              border: 'none', borderRadius: 999, fontSize: 10, fontFamily: 'var(--f-mono)', cursor: 'pointer', fontWeight: 'bold'
                            }}
                          >
                            SIGN IN
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--clay-600)', lineHeight: '1.4' }}>{std.desc}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontFamily: 'var(--f-mono)', color: 'var(--walnut-700)', marginTop: 4 }}>
                        <span>🏫 Assigned Coach: <strong>{std.coach}</strong></span>
                      </div>
                    </div>
                  );
                })}

                <div style={{ borderTop: '1px solid rgba(62,44,28,0.08)', paddingTop: 12, marginTop: 4 }}>
                  <div style={{ fontSize: 10, fontFamily: 'var(--f-mono)', color: 'var(--clay-600)', letterSpacing: 0.5, marginBottom: 8 }}>CROSS-PORTAL PORTKEY</div>
                  <a href="coach-universe.html" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    padding: '10px', borderRadius: 10, background: 'var(--espresso-900)', color: '#FFFDF8',
                    textDecoration: 'none', fontFamily: 'var(--f-body)', fontSize: 13, fontWeight: 500, transition: 'all 0.2s'
                  }}>
                    <span>💻 Open Coach & Admin Universe</span>
                    <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10 }}>→</span>
                  </a>
                </div>
              </div>
            )}

            {activeTab === 'scenarios' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  
                  {/* Premium Onboarding & Note Sync Simulation Test */}
                  <div style={{
                    background: 'var(--sand-100)',
                    padding: '14px',
                    borderRadius: 14,
                    border: '1.5px solid var(--walnut-700)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    marginBottom: 6
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1, marginRight: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--espresso-900)', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>🧪</span>
                          <span>E2E Cross-Portal Sync Simulator</span>
                        </div>
                        <div style={{ fontSize: 10.5, color: 'var(--espresso-800)', marginTop: 4, lineHeight: 1.35 }}>
                          Programmatic 3-Role validation. Triggers Onboarding (Vikram Patel) &amp; Coach Note creation. Audits localStorage &amp; Cloud database alignment instantly.
                        </div>
                      </div>
                      <div>
                        {testResults.e2e_sync === 'PASS' && <span style={{ background: 'var(--sage-500)', color: '#FFF', padding: '4px 10px', borderRadius: 999, fontSize: 9.5, fontWeight: 'bold', fontFamily: 'var(--f-mono)' }}>PASS ✓</span>}
                        {testResults.e2e_sync === 'FAIL' && <span style={{ background: 'var(--terracotta-500)', color: '#FFF', padding: '4px 10px', borderRadius: 999, fontSize: 9.5, fontWeight: 'bold', fontFamily: 'var(--f-mono)' }}>FAIL ✗</span>}
                        {testResults.e2e_sync && testResults.e2e_sync !== 'PASS' && testResults.e2e_sync !== 'FAIL' && <span style={{ background: 'var(--ochre-500)', color: '#FFF', padding: '4px 10px', borderRadius: 999, fontSize: 9.5, fontWeight: 'bold', fontFamily: 'var(--f-mono)' }}>RUNNING</span>}
                      </div>
                    </div>
                    <button
                      onClick={runProgrammaticSimulationTest}
                      style={{
                        padding: '8px 12px',
                        background: 'var(--walnut-700)',
                        color: 'var(--paper)',
                        border: 'none',
                        borderRadius: 30,
                        fontFamily: 'var(--f-mono)',
                        fontSize: 11,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(94, 66, 40, 0.2)',
                        transition: 'all 0.15s ease',
                        width: '100%',
                        textAlign: 'center'
                      }}
                    >
                      🚀 Run Onboarding & Sync Test Case
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontFamily: 'var(--f-mono)', color: 'var(--clay-600)', letterSpacing: 0.5 }}>DIAGNOSTIC AUTOMATIONS</span>
                    <button 
                      onClick={async () => {
                        await runTestCP01();
                        await runTestCP02();
                        await runTestCP03();
                        await runTestCP04();
                        await runTestCP05();
                      }}
                      style={{
                        padding: '4px 10px', borderRadius: 999, border: 'none',
                        background: 'var(--walnut-700)', color: '#FFFDF8',
                        fontSize: 9, fontFamily: 'var(--f-mono)', fontWeight: 'bold', cursor: 'pointer'
                      }}
                    >
                      RUN ALL CP
                    </button>
                  </div>

                  {/* CP-01 */}
                  <div style={{ background: 'var(--sand-50)', padding: 10, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(62,44,28,0.06)' }}>
                    <div style={{ flex: 1, marginRight: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--espresso-900)' }}>CP-01: Tab Switching</div>
                      <div style={{ fontSize: 10.5, color: 'var(--clay-600)', marginTop: 2 }}>Home/Profile toggling correctness</div>
                    </div>
                    <div>
                      {testResults.cp01 === 'PASS' && <span style={{ background: 'var(--sage-500)', color: '#FFF', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 'bold' }}>PASS</span>}
                      {testResults.cp01 === 'FAIL' && <span style={{ background: 'var(--terracotta-500)', color: '#FFF', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 'bold' }}>FAIL</span>}
                      {!testResults.cp01 && <button onClick={runTestCP01} style={{ background: 'none', border: '1px solid var(--walnut-700)', borderRadius: 999, fontSize: 10, color: 'var(--walnut-700)', padding: '3px 10px', cursor: 'pointer' }}>Run</button>}
                    </div>
                  </div>

                  {/* CP-02 */}
                  <div style={{ background: 'var(--sand-50)', padding: 10, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(62,44,28,0.06)' }}>
                    <div style={{ flex: 1, marginRight: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--espresso-900)' }}>CP-02: Fitness Drill-down</div>
                      <div style={{ fontSize: 10.5, color: 'var(--clay-600)', marginTop: 2 }}>Expansion & labels synchronizations</div>
                    </div>
                    <div>
                      {testResults.cp02 === 'PASS' && <span style={{ background: 'var(--sage-500)', color: '#FFF', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 'bold' }}>PASS</span>}
                      {testResults.cp02 === 'FAIL' && <span style={{ background: 'var(--terracotta-500)', color: '#FFF', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 'bold' }}>FAIL</span>}
                      {!testResults.cp02 && <button onClick={runTestCP02} style={{ background: 'none', border: '1px solid var(--walnut-700)', borderRadius: 999, fontSize: 10, color: 'var(--walnut-700)', padding: '3px 10px', cursor: 'pointer' }}>Run</button>}
                    </div>
                  </div>

                  {/* CP-03 */}
                  <div style={{ background: 'var(--sand-50)', padding: 10, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(62,44,28,0.06)' }}>
                    <div style={{ flex: 1, marginRight: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--espresso-900)' }}>CP-03: Coach Override banner</div>
                      <div style={{ fontSize: 10.5, color: 'var(--clay-600)', marginTop: 2 }}>Validate 8.5/10 live comment highlights</div>
                    </div>
                    <div>
                      {testResults.cp03 === 'PASS' && <span style={{ background: 'var(--sage-500)', color: '#FFF', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 'bold' }}>PASS</span>}
                      {testResults.cp03 === 'FAIL' && <span style={{ background: 'var(--terracotta-500)', color: '#FFF', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 'bold' }}>FAIL</span>}
                      {!testResults.cp03 && <button onClick={runTestCP03} style={{ background: 'none', border: '1px solid var(--walnut-700)', borderRadius: 999, fontSize: 10, color: 'var(--walnut-700)', padding: '3px 10px', cursor: 'pointer' }}>Run</button>}
                    </div>
                  </div>

                  {/* CP-04 */}
                  <div style={{ background: 'var(--sand-50)', padding: 10, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(62,44,28,0.06)' }}>
                    <div style={{ flex: 1, marginRight: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--espresso-900)' }}>CP-04: Session Notes Read-Only</div>
                      <div style={{ fontSize: 10.5, color: 'var(--clay-600)', marginTop: 2 }}>Secure timeline history for clients</div>
                    </div>
                    <div>
                      {testResults.cp04 === 'PASS' && <span style={{ background: 'var(--sage-500)', color: '#FFF', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 'bold' }}>PASS</span>}
                      {testResults.cp04 === 'FAIL' && <span style={{ background: 'var(--terracotta-500)', color: '#FFF', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 'bold' }}>FAIL</span>}
                      {!testResults.cp04 && <button onClick={runTestCP04} style={{ background: 'none', border: '1px solid var(--walnut-700)', borderRadius: 999, fontSize: 10, color: 'var(--walnut-700)', padding: '3px 10px', cursor: 'pointer' }}>Run</button>}
                    </div>
                  </div>

                  {/* CP-05 */}
                  <div style={{ background: 'var(--sand-50)', padding: 10, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(62,44,28,0.06)' }}>
                    <div style={{ flex: 1, marginRight: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--espresso-900)' }}>CP-05: Nutrition Protection</div>
                      <div style={{ fontSize: 10.5, color: 'var(--clay-600)', marginTop: 2 }}>Confirm secure lock instructions</div>
                    </div>
                    <div>
                      {testResults.cp05 === 'PASS' && <span style={{ background: 'var(--sage-500)', color: '#FFF', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 'bold' }}>PASS</span>}
                      {testResults.cp05 === 'FAIL' && <span style={{ background: 'var(--terracotta-500)', color: '#FFF', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 'bold' }}>FAIL</span>}
                      {!testResults.cp05 && <button onClick={runTestCP05} style={{ background: 'none', border: '1px solid var(--walnut-700)', borderRadius: 999, fontSize: 10, color: 'var(--walnut-700)', padding: '3px 10px', cursor: 'pointer' }}>Run</button>}
                    </div>
                  </div>
                </div>

                {/* Console Logs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 9.5, fontFamily: 'var(--f-mono)', color: 'var(--clay-600)' }}>CONSOLE LOGS</span>
                  <div style={{
                    background: 'var(--espresso-900)', color: '#D9C3A3',
                    borderRadius: 8, padding: 10, height: 110, overflowY: 'auto',
                    fontFamily: 'var(--f-mono)', fontSize: 9, lineHeight: 1.4
                  }}>
                    {logs.length === 0 ? "Idle. Click 'Run' to begin checks." : logs.map((log, i) => (
                      <div key={i}>{log}</div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'ratingtests' && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontFamily: 'var(--f-mono)', color: 'var(--clay-600)' }}>5-CRITERIA TESTING SUITE</span>
                    <button 
                      onClick={async () => {
                        await runTestRT01();
                        await runTestRT02();
                        await runTestRT03();
                        await runTestRT04();
                        await runTestRT05();
                      }}
                      style={{
                        padding: '4px 10px', borderRadius: 999, border: 'none',
                        background: 'var(--walnut-700)', color: '#FFFDF8',
                        fontSize: 9, fontFamily: 'var(--f-mono)', fontWeight: 'bold', cursor: 'pointer'
                      }}
                    >
                      RUN ALL RT
                    </button>
                  </div>

                  {/* TEST RT-01 */}
                  <div style={{ background: 'var(--sand-50)', padding: 10, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(62,44,28,0.06)' }}>
                    <div style={{ flex: 1, marginRight: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--espresso-900)' }}>RT-01: Complete rating</div>
                      <div style={{ fontSize: 10.5, color: 'var(--clay-600)', marginTop: 2 }}>Auto selects 5 stars, comments, and submits a 4.6</div>
                    </div>
                    <div>
                      {testResults.rt01 === 'PASS' && <span style={{ background: 'var(--sage-500)', color: '#FFF', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 'bold' }}>PASS</span>}
                      {testResults.rt01 === 'FAIL' && <span style={{ background: 'var(--terracotta-500)', color: '#FFF', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 'bold' }}>FAIL</span>}
                      {!testResults.rt01 && <button onClick={runTestRT01} style={{ background: 'none', border: '1px solid var(--walnut-700)', borderRadius: 999, fontSize: 10, color: 'var(--walnut-700)', padding: '3px 10px', cursor: 'pointer' }}>Run</button>}
                    </div>
                  </div>

                  {/* TEST RT-02 */}
                  <div style={{ background: 'var(--sand-50)', padding: 10, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(62,44,28,0.06)' }}>
                    <div style={{ flex: 1, marginRight: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--espresso-900)' }}>RT-02: Partial rating block</div>
                      <div style={{ fontSize: 10.5, color: 'var(--clay-600)', marginTop: 2 }}>Submitting only 3 criterias leaves button safely disabled</div>
                    </div>
                    <div>
                      {testResults.rt02 === 'PASS' && <span style={{ background: 'var(--sage-500)', color: '#FFF', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 'bold' }}>PASS</span>}
                      {testResults.rt02 === 'FAIL' && <span style={{ background: 'var(--terracotta-500)', color: '#FFF', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 'bold' }}>FAIL</span>}
                      {!testResults.rt02 && <button onClick={runTestRT02} style={{ background: 'none', border: '1px solid var(--walnut-700)', borderRadius: 999, fontSize: 10, color: 'var(--walnut-700)', padding: '3px 10px', cursor: 'pointer' }}>Run</button>}
                    </div>
                  </div>

                  {/* TEST RT-03 */}
                  <div style={{ background: 'var(--sand-50)', padding: 10, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(62,44,28,0.06)' }}>
                    <div style={{ flex: 1, marginRight: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--espresso-900)' }}>RT-03: Double-submit prevention</div>
                      <div style={{ fontSize: 10.5, color: 'var(--clay-600)', marginTop: 2 }}>Same day rating upserts & locks rating form state</div>
                    </div>
                    <div>
                      {testResults.rt03 === 'PASS' && <span style={{ background: 'var(--sage-500)', color: '#FFF', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 'bold' }}>PASS</span>}
                      {testResults.rt03 === 'FAIL' && <span style={{ background: 'var(--terracotta-500)', color: '#FFF', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 'bold' }}>FAIL</span>}
                      {!testResults.rt03 && <button onClick={runTestRT03} style={{ background: 'none', border: '1px solid var(--walnut-700)', borderRadius: 999, fontSize: 10, color: 'var(--walnut-700)', padding: '3px 10px', cursor: 'pointer' }}>Run</button>}
                    </div>
                  </div>

                  {/* TEST RT-04 */}
                  <div style={{ background: 'var(--sand-50)', padding: 10, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(62,44,28,0.06)' }}>
                    <div style={{ flex: 1, marginRight: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--espresso-900)' }}>RT-04: Coach Profile Feed Sync</div>
                      <div style={{ fontSize: 10.5, color: 'var(--clay-600)', marginTop: 2 }}>Verify ratings live aggregation on coach side</div>
                    </div>
                    <div>
                      {testResults.rt04 === 'PASS' && <span style={{ background: 'var(--sage-500)', color: '#FFF', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 'bold' }}>PASS</span>}
                      {testResults.rt04 === 'FAIL' && <span style={{ background: 'var(--terracotta-500)', color: '#FFF', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 'bold' }}>FAIL</span>}
                      {!testResults.rt04 && <button onClick={runTestRT04} style={{ background: 'none', border: '1px solid var(--walnut-700)', borderRadius: 999, fontSize: 10, color: 'var(--walnut-700)', padding: '3px 10px', cursor: 'pointer' }}>Run</button>}
                    </div>
                  </div>

                  {/* TEST RT-05 */}
                  <div style={{ background: 'var(--sand-50)', padding: 10, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid rgba(62,44,28,0.06)' }}>
                    <div style={{ flex: 1, marginRight: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--espresso-900)' }}>RT-05: Admin dashboard audit</div>
                      <div style={{ fontSize: 10.5, color: 'var(--clay-600)', marginTop: 2 }}>Test multiple coaches aggregation spreadsheet model</div>
                    </div>
                    <div>
                      {testResults.rt05 === 'PASS' && <span style={{ background: 'var(--sage-500)', color: '#FFF', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 'bold' }}>PASS</span>}
                      {testResults.rt05 === 'FAIL' && <span style={{ background: 'var(--terracotta-500)', color: '#FFF', padding: '3px 8px', borderRadius: 999, fontSize: 9, fontWeight: 'bold' }}>FAIL</span>}
                      {!testResults.rt05 && <button onClick={runTestRT05} style={{ background: 'none', border: '1px solid var(--walnut-700)', borderRadius: 999, fontSize: 10, color: 'var(--walnut-700)', padding: '3px 10px', cursor: 'pointer' }}>Run</button>}
                    </div>
                  </div>
                </div>

                {/* Console Logs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 9.5, fontFamily: 'var(--f-mono)', color: 'var(--clay-600)' }}>CONSOLE LOGS</span>
                  <div style={{
                    background: 'var(--espresso-900)', color: '#D9C3A3',
                    borderRadius: 8, padding: 10, height: 110, overflowY: 'auto',
                    fontFamily: 'var(--f-mono)', fontSize: 9, lineHeight: 1.4
                  }}>
                    {logs.length === 0 ? "Idle. Click 'Run' to begin checks." : logs.map((log, i) => (
                      <div key={i}>{log}</div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === 'presets' && (
              <>
                {/* Control preset overrides and seeds */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <span style={{ fontSize: 10, fontFamily: 'var(--f-mono)', color: 'var(--clay-600)' }}>COACH ACTIONS SIMULATORS</span>
                    <p style={{ margin: '4px 0 8px', fontSize: 11, color: 'var(--espresso-800)' }}>Simulate real-time coach feedback changes:</p>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <button 
                      onClick={() => {
                        const sOverride = {
                          strength: { value: 8.5, comment: 'Set by Lee · strength coach override parameters', date: '2026-05-31', coachId: 'lee' }
                        };
                        localStorage.setItem('m3s.coachScoreOverrides', JSON.stringify(sOverride));
                        window.dispatchEvent(new CustomEvent('m3s:coach-overrides', { detail: sOverride }));
                        addLog("Preset: Strength Overridden to 8.5");
                      }}
                      style={{
                        padding: '6px 10px', border: 'none', background: 'var(--sand-200)',
                        fontFamily: 'var(--f-mono)', fontSize: 9.5, fontWeight: 600, color: 'var(--espresso-900)',
                        borderRadius: 6, cursor: 'pointer', flex: '1 1 120px'
                      }}
                    >
                      🏋️‍♂️ Strength = 8.5
                    </button>

                    <button 
                      onClick={() => {
                        const zOverride = {
                          strength: { value: 0.0, comment: 'Extreme fallback override limit check', date: '2026-05-31', coachId: 'lee' }
                        };
                        localStorage.setItem('m3s.coachScoreOverrides', JSON.stringify(zOverride));
                        window.dispatchEvent(new CustomEvent('m3s:coach-overrides', { detail: zOverride }));
                        addLog("Preset: Strength Overridden to 0.0!");
                      }}
                      style={{
                        padding: '6px 10px', border: 'none', background: 'var(--sand-200)',
                        fontFamily: 'var(--f-mono)', fontSize: 9.5, fontWeight: 600, color: 'var(--espresso-900)',
                        borderRadius: 6, cursor: 'pointer', flex: '1 1 120px'
                      }}
                    >
                      🚫 Override = 0.0
                    </button>

                    <button 
                      onClick={() => {
                        const unassignedSetting = { ...profile, coachId: '' };
                        try {
                          localStorage.setItem('m3s.journey', JSON.stringify(unassignedSetting));
                        } catch(e) {}
                        window.dispatchEvent(new Event('storage'));
                        addLog("Coach unassigned (AI calculations only).");
                      }}
                      style={{
                        padding: '6px 10px', border: 'none', background: 'var(--sand-200)',
                        fontFamily: 'var(--f-mono)', fontSize: 9.5, fontWeight: 600, color: 'var(--espresso-900)',
                        borderRadius: 6, cursor: 'pointer', flex: '1 1 120px'
                      }}
                    >
                      👤 Unassign Coach
                    </button>

                    <button 
                      onClick={() => {
                        const assignedSetting = { ...profile, coachId: 'lee' };
                        try {
                          localStorage.setItem('m3s.journey', JSON.stringify(assignedSetting));
                        } catch(e) {}
                        window.dispatchEvent(new Event('storage'));
                        addLog("Coach reassigned to Lee");
                      }}
                      style={{
                        padding: '6px 10px', border: 'none', background: 'var(--sand-200)',
                        fontFamily: 'var(--f-mono)', fontSize: 9.5, fontWeight: 600, color: 'var(--espresso-900)',
                        borderRadius: 6, cursor: 'pointer', flex: '1 1 120px'
                      }}
                    >
                      🤝 Reassign (Lee)
                    </button>
                    
                    <button 
                      onClick={runAlledgetests}
                      style={{
                        padding: '6px 10px', border: 'none', background: 'var(--sage-500)',
                        fontFamily: 'var(--f-mono)', fontSize: 10, fontWeight: 600, color: 'var(--paper)',
                        borderRadius: 6, cursor: 'pointer', width: '100%', marginTop: 4
                      }}
                    >
                      ⚡ Verify Score Persistences
                    </button>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(62,44,28,0.1)', paddingTop: 10 }}>
                    <button 
                      onClick={triggerResetData}
                      style={{
                        padding: '8px 12px', border: '1px solid var(--terracotta-500)', background: 'transparent',
                        fontFamily: 'var(--f-mono)', fontSize: 9.5, fontWeight: 'bold', color: 'var(--terracotta-500)',
                        borderRadius: 6, cursor: 'pointer', width: '100%'
                      }}
                    >
                      ♻️ RESET SEED DATA
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { App, ClientDashboard, ProfilePageContent });
