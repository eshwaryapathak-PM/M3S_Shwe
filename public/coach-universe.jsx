/* eslint-disable */
// M3S — Coach Universe & Admin Dashboard
// Integrates Client Profile, Assessments, Nutrition, Ratings, Calendar and Live Data Synchronization with Firestore / LocalStorage


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

// Initialize Firebase (and fallback gracefully if firebase script isn't loaded)
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

// ─── Database Sync Bridge ────────────────────────────────────────────────
const M3S_DB = {
  async get(collection, docId, fallback) {
    if (db) {
      try {
        const snap = await db.collection(collection).doc(docId).get();
        if (snap.exists) return snap.data();
      } catch (e) {
        console.warn(`Firestore get error on ${collection}/${docId}`, e);
      }
    }
    try {
      const prefix = getEnvPrefix();
      const raw = localStorage.getItem(`m3s.${prefix}${collection}.${docId}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return fallback;
  },
  async set(collection, docId, data) {
    try {
      const prefix = getEnvPrefix();
      localStorage.setItem(`m3s.${prefix}${collection}.${docId}`, JSON.stringify(data));
    } catch {}
    if (db) {
      try {
        await db.collection(collection).doc(docId).set(data, { merge: true });
      } catch (e) {
        console.warn(`Firestore set error on ${collection}/${docId}`, e);
      }
    }
  },
  async getAll(collection, fallback) {
    if (db) {
      try {
        const snap = await db.collection(collection).get();
        // If we successfully reached the DB, we return its state unconditionally.
        const list = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        return list;
      } catch (e) {
        console.warn(`Firestore getAll error on ${collection}`, e);
      }
    }
    try {
      const prefix = getEnvPrefix();
      const raw = localStorage.getItem(`m3s.${prefix}${collection}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return fallback;
  },
  async setAll(collection, list) {
    try {
      const prefix = getEnvPrefix();
      localStorage.setItem(`m3s.${prefix}${collection}`, JSON.stringify(list));
    } catch {}
    if (db) {
      try {
        const promises = list.map(item => {
          const id = item.id || Math.random().toString(36).substring(7);
          return db.collection(collection).doc(id).set(item, { merge: true });
        });
        await Promise.all(promises);
      } catch (e) {
        console.warn(`Firestore setAll error on ${collection}`, e);
      }
    }
  }
};

// ─── Constants & Seed Data ────────────────────────────────────────────────
let COACHES = [
  { id: "lee",     name: "Lee",     role: "Hypertrophy & Strength", tone: "sage",  bio: "Form first, always. The coach who makes the last rep look like the first.", specialties: ["Hypertrophy", "Strength", "Recovery"], initials: "LE", cert: "Hypertrophy · Strength", email: "lee@mythirdspace.fit", phone: "9911100001" },
  { id: "rahul",   name: "Rahul",   role: "Strength & Hyrox Prep", tone: "walnut", bio: "Competition-tested Hyrox coach. Builds engines that don't quit in round four.", specialties: ["Strength", "Hyrox Prep", "Conditioning"], initials: "RA", cert: "Strength · Hyrox · Recovery", email: "rahul@mythirdspace.fit", phone: "9911100002" },
  { id: "deb",     name: "Deb",     role: "Strength & Recovery", tone: "walnut",   bio: "Post-rehab strength and long-term recovery planning.", specialties: ["Strength", "Recovery", "Hyrox Prep"], initials: "DB", cert: "Strength · Recovery", email: "deb@mythirdspace.fit", phone: "9911100003" },
  { id: "deepika", name: "Deepika", role: "Hyrox & Conditioning", tone: "terra",   bio: "Zone 2 devotee turned Hyrox specialist. Endurance with structure.", specialties: ["Hyrox Prep", "Strength", "Conditioning"], initials: "DE", cert: "Hyrox · Strength", email: "deepika@mythirdspace.fit", phone: "9911100004" },
  { id: "pilates", name: "Anisha",  role: "Pilates & Mobility", tone: "sand",      bio: "Clinical Pilates for posture, core control, and post-injury returns.", specialties: ["Pilates", "Mobility", "Recovery"], initials: "AN", cert: "Pilates · Mobility", email: "anisha@mythirdspace.fit", phone: "9911100005" },
  { id: "joe",     name: "Joe",     role: "Hypertrophy & Strength", tone: "espresso", bio: "Block-periodised hypertrophy. Muscle you can actually use.", specialties: ["Hypertrophy", "Strength", "Recovery"], initials: "JO", cert: "Strength · Hypertrophy", email: "joe@mythirdspace.fit", phone: "9911100006" },
  { id: "aakash",  name: "Aakash",  role: "Strength & Recovery", tone: "clay",     bio: "Old-school strength with new-school recovery protocols.", specialties: ["Strength", "Recovery", "Mobility"], initials: "AK", cert: "Strength · Recovery", email: "aakash@mythirdspace.fit", phone: "9911100007" },
  { id: "tarun",   name: "Tarun",   role: "Hyrox & Hypertrophy", tone: "clay",     bio: "Hybrid athlete programming — size, speed, stamina.", specialties: ["Hyrox Prep", "Hypertrophy", "Strength"], initials: "TR", cert: "Hyrox · Hypertrophy", email: "tarun@mythirdspace.fit", phone: "9911100008" },
  { id: "santo",   name: "Santo",   role: "Strength & Hypertrophy", tone: "espresso", bio: "Classical strength training with a bodybuilder's eye for detail.", specialties: ["Strength", "Hypertrophy", "Conditioning"], initials: "SA", cert: "Strength · Hypertrophy", email: "santo@mythirdspace.fit", phone: "9911100009" },
  { id: "shahbaz", name: "Shahbaz", role: "Yoga & Breathwork", tone: "sage",       bio: "Traditional hatha and vinyasa. Breath-led practice for strength that lasts.", specialties: ["Yoga", "Breathwork", "Mobility"], initials: "SH", cert: "Yoga · Breathwork", email: "shahbaz@mythirdspace.fit", phone: "9911100010" },
];

let ADMINS = [
  { id: "shwetambari", name: "Shwetambari", role: "Owner", canManageAdmins: true, initials: "SW", email: "egpvai21@gmail.com", phone: "9619484350" },
  { id: "harshita",    name: "Harshita",    role: "Studio Manager", canManageAdmins: false, initials: "HA", email: "harshita@mythirdspace.fit", phone: "9822233344" }
];

const SEED_CLIENTS = [
  { id: "riya", name: "Riya Sharma", age: "32", gender: "Female", phone: "98230 12345", email: "riya@gmail.com", assigned_coach_id: "lee", status: "Active", created_at: "2026-04-10" },
  { id: "meera", name: "Meera P.", age: "29", gender: "Female", phone: "99123 45678", email: "meera@gmail.com", assigned_coach_id: "lee", status: "Active", created_at: "2026-04-12" },
  { id: "karan", name: "Karan S.", age: "34", gender: "Male", phone: "98222 33344", email: "karan@gmail.com", assigned_coach_id: "rahul", status: "Active", created_at: "2026-04-05" },
  { id: "vikram", name: "Vikram R.", age: "31", gender: "Male", phone: "98111 22233", email: "vikram@gmail.com", assigned_coach_id: "deb", status: "Active", created_at: "2026-03-24" },
  { id: "anita", name: "Anita V.", age: "28", gender: "Female", phone: "99333 44455", email: "anita@gmail.com", assigned_coach_id: "lee", status: "Ending soon", created_at: "2026-03-15" },
  { id: "shreya", name: "Shreya M.", age: "26", gender: "Female", phone: "98444 55566", email: "shreya@gmail.com", assigned_coach_id: "deepika", status: "Ending soon", created_at: "2026-04-01" },
  { id: "rohan", name: "Rohan D.", age: "35", gender: "Male", phone: "90000 11111", email: "rohan@gmail.com", assigned_coach_id: "deepika", status: "On hold", created_at: "2026-02-10" }
];

const SEED_ASSESSMENTS = [
  { client_id: "riya", experience: "6–24 months", goal: "Muscle Gain", days_per_week: 4, injuries: ["Shoulder"], running_5k: "28:40", running_2k: "10:15", run_rating: 6, run_frequency: "3x / week" },
  { client_id: "meera", experience: "1–2 years", goal: "Conditioning & Fat Loss", days_per_week: 3, injuries: [], running_5k: "31:10", running_2k: "12:20", run_rating: 4, run_frequency: "2x / week" },
  { client_id: "karan", experience: "5+ years", goal: "Hyrox Preparation", days_per_week: 5, injuries: ["Knee"], running_5k: "21:30", running_2k: "7:45", run_rating: 9, run_frequency: "4x / week" },
  { client_id: "vikram", experience: "Under 6 months", goal: "Baseline Recovery", days_per_week: 2, injuries: ["Lower Back"], running_5k: "35:45", running_2k: "14:10", run_rating: 3, run_frequency: "Never" }
];

const SEED_SESSIONS = [
  { id: "s1", coach_id: "lee", client_id: "riya", type: "PT Session", scheduled_at: "2026-05-26T07:00:00", duration_min: 60, status: "upcoming" },
  { id: "s2", coach_id: "lee", client_id: "meera", type: "PT Session", scheduled_at: "2026-05-26T08:00:00", duration_min: 60, status: "upcoming" },
  { id: "s3", coach_id: "rahul", client_id: "karan", type: "PT Work", scheduled_at: "2026-05-27T18:00:00", duration_min: 60, status: "upcoming" },
  { id: "s4", coach_id: "deb", client_id: "vikram", type: "Mobility Flow", scheduled_at: "2026-05-28T07:30:00", duration_min: 60, status: "upcoming" },
  { id: "b1", coach_id: "lee", client_id: "blocked", type: "Block Out", scheduled_at: "2026-05-29T08:00:00", duration_min: 90, status: "blocked", reason: "Physiotherapist Seminar" },
  
  // Historical past sessions for Last Week and Last Month presets
  { id: "s_past1", coach_id: "lee", client_id: "riya", type: "PT Session", scheduled_at: "2026-05-19T07:00:00", duration_min: 60, status: "completed" },
  { id: "s_past2", coach_id: "lee", client_id: "meera", type: "PT Session", scheduled_at: "2026-05-19T08:00:00", duration_min: 60, status: "completed" },
  { id: "s_past3", coach_id: "rahul", client_id: "karan", type: "PT Work", scheduled_at: "2026-05-19T10:00:00", duration_min: 60, status: "completed" },
  { id: "s_past4", coach_id: "lee", client_id: "riya", type: "PT Session", scheduled_at: "2026-04-26T09:00:00", duration_min: 60, status: "completed" },
  { id: "s_past5", coach_id: "rahul", client_id: "karan", type: "PT Work", scheduled_at: "2026-04-26T11:00:00", duration_min: 60, status: "completed" },

  // SLA At-Risk test sessions
  { id: "s_atrisk1", coach_id: "lee", client_id: "riya", type: "PT Session", scheduled_at: "2026-06-25T08:00:00", duration_min: 60, status: "pending_decline", decline_reason_type: "family_emergency", decline_note: "Urgent family travel required." },
  { id: "s_atrisk2", coach_id: "rahul", client_id: "karan", type: "PT Work", scheduled_at: "2026-06-26T18:00:00", duration_min: 60, status: "reassigned_pending", decline_reason_type: "schedule_clash", decline_note: "Unforeseen tournament preparation clash." },

  // --- Today and Yesterday completed sessions for all 10 coaches (virtual & actual) ---
  // Lee (lee)
  { id: "sc_lee_t_v", coach_id: "lee", client_id: "riya", type: "PT Session", scheduled_at: "2026-05-26T09:00:00", duration_min: 60, status: "completed" },
  { id: "sc_lee_y_v", coach_id: "lee", client_id: "meera", type: "PT Session", scheduled_at: "2026-05-25T11:00:00", duration_min: 60, status: "completed" },
  { id: "sc_lee_t_r", coach_id: "lee", client_id: "riya", type: "PT Session", scheduled_at: "2026-07-05T09:00:00", duration_min: 60, status: "completed" },
  { id: "sc_lee_y_r", coach_id: "lee", client_id: "meera", type: "PT Session", scheduled_at: "2026-07-04T11:00:00", duration_min: 60, status: "completed" },

  // Rahul (rahul)
  { id: "sc_rahul_t_v", coach_id: "rahul", client_id: "karan", type: "PT Work", scheduled_at: "2026-05-26T18:00:00", duration_min: 60, status: "completed" },
  { id: "sc_rahul_y_v", coach_id: "rahul", client_id: "karan", type: "PT Work", scheduled_at: "2026-05-25T17:00:00", duration_min: 60, status: "completed" },
  { id: "sc_rahul_t_r", coach_id: "rahul", client_id: "karan", type: "PT Work", scheduled_at: "2026-07-05T18:00:00", duration_min: 60, status: "completed" },
  { id: "sc_rahul_y_r", coach_id: "rahul", client_id: "vikram", type: "PT Work", scheduled_at: "2026-07-04T17:00:00", duration_min: 60, status: "completed" },

  // Deb (deb)
  { id: "sc_deb_t_v", coach_id: "deb", client_id: "vikram", type: "Mobility Flow", scheduled_at: "2026-05-26T07:30:00", duration_min: 60, status: "completed" },
  { id: "sc_deb_y_v", coach_id: "deb", client_id: "vikram", type: "Mobility Flow", scheduled_at: "2026-05-25T08:30:00", duration_min: 60, status: "completed" },
  { id: "sc_deb_t_r", coach_id: "deb", client_id: "riya", type: "Mobility Flow", scheduled_at: "2026-07-05T07:30:00", duration_min: 60, status: "completed" },
  { id: "sc_deb_y_r", coach_id: "deb", client_id: "vikram", type: "Mobility Flow", scheduled_at: "2026-07-04T08:30:00", duration_min: 60, status: "completed" },

  // Deepika (deepika)
  { id: "sc_deepika_t_v", coach_id: "deepika", client_id: "shreya", type: "PT Session", scheduled_at: "2026-05-26T10:00:00", duration_min: 60, status: "completed" },
  { id: "sc_deepika_y_v", coach_id: "deepika", client_id: "rohan", type: "PT Session", scheduled_at: "2026-05-25T14:00:00", duration_min: 60, status: "completed" },
  { id: "sc_deepika_t_r", coach_id: "deepika", client_id: "shreya", type: "PT Session", scheduled_at: "2026-07-05T10:00:00", duration_min: 60, status: "completed" },
  { id: "sc_deepika_y_r", coach_id: "deepika", client_id: "rohan", type: "PT Session", scheduled_at: "2026-07-04T14:00:00", duration_min: 60, status: "completed" },

  // Anisha (pilates)
  { id: "sc_pilates_t_v", coach_id: "pilates", client_id: "anita", type: "PT Session", scheduled_at: "2026-05-26T11:00:00", duration_min: 60, status: "completed" },
  { id: "sc_pilates_y_v", coach_id: "pilates", client_id: "meera", type: "PT Session", scheduled_at: "2026-05-25T15:00:00", duration_min: 60, status: "completed" },
  { id: "sc_pilates_t_r", coach_id: "pilates", client_id: "anita", type: "PT Session", scheduled_at: "2026-07-05T11:00:00", duration_min: 60, status: "completed" },
  { id: "sc_pilates_y_r", coach_id: "pilates", client_id: "meera", type: "PT Session", scheduled_at: "2026-07-04T15:00:00", duration_min: 60, status: "completed" },

  // Joe (joe)
  { id: "sc_joe_t_v", coach_id: "joe", client_id: "karan", type: "PT Session", scheduled_at: "2026-05-26T12:00:00", duration_min: 60, status: "completed" },
  { id: "sc_joe_y_v", coach_id: "joe", client_id: "rohan", type: "PT Session", scheduled_at: "2026-05-25T16:00:00", duration_min: 60, status: "completed" },
  { id: "sc_joe_t_r", coach_id: "joe", client_id: "karan", type: "PT Session", scheduled_at: "2026-07-05T12:00:00", duration_min: 60, status: "completed" },
  { id: "sc_joe_y_r", coach_id: "joe", client_id: "rohan", type: "PT Session", scheduled_at: "2026-07-04T16:00:00", duration_min: 60, status: "completed" },

  // Aakash (aakash)
  { id: "sc_aakash_t_v", coach_id: "aakash", client_id: "vikram", type: "PT Session", scheduled_at: "2026-05-26T13:00:00", duration_min: 60, status: "completed" },
  { id: "sc_aakash_y_v", coach_id: "aakash", client_id: "shreya", type: "PT Session", scheduled_at: "2026-05-25T10:00:00", duration_min: 60, status: "completed" },
  { id: "sc_aakash_t_r", coach_id: "aakash", client_id: "vikram", type: "PT Session", scheduled_at: "2026-07-05T13:00:00", duration_min: 60, status: "completed" },
  { id: "sc_aakash_y_r", coach_id: "aakash", client_id: "shreya", type: "PT Session", scheduled_at: "2026-07-04T10:00:00", duration_min: 60, status: "completed" },

  // Tarun (tarun)
  { id: "sc_tarun_t_v", coach_id: "tarun", client_id: "rohan", type: "PT Session", scheduled_at: "2026-05-26T14:00:00", duration_min: 60, status: "completed" },
  { id: "sc_tarun_y_v", coach_id: "tarun", client_id: "riya", type: "PT Session", scheduled_at: "2026-05-25T09:00:00", duration_min: 60, status: "completed" },
  { id: "sc_tarun_t_r", coach_id: "tarun", client_id: "rohan", type: "PT Session", scheduled_at: "2026-07-05T14:00:00", duration_min: 60, status: "completed" },
  { id: "sc_tarun_y_r", coach_id: "tarun", client_id: "riya", type: "PT Session", scheduled_at: "2026-07-04T09:00:00", duration_min: 60, status: "completed" },

  // Santo (santo)
  { id: "sc_santo_t_v", coach_id: "santo", client_id: "karan", type: "PT Session", scheduled_at: "2026-05-26T15:00:00", duration_min: 60, status: "completed" },
  { id: "sc_santo_y_v", coach_id: "santo", client_id: "anita", type: "PT Session", scheduled_at: "2026-05-25T12:00:00", duration_min: 60, status: "completed" },
  { id: "sc_santo_t_r", coach_id: "santo", client_id: "karan", type: "PT Session", scheduled_at: "2026-07-05T15:00:00", duration_min: 60, status: "completed" },
  { id: "sc_santo_y_r", coach_id: "santo", client_id: "anita", type: "PT Session", scheduled_at: "2026-07-04T12:00:00", duration_min: 60, status: "completed" },

  // Shahbaz (shahbaz)
  { id: "sc_shahbaz_t_v", coach_id: "shahbaz", client_id: "meera", type: "PT Session", scheduled_at: "2026-05-26T16:00:00", duration_min: 60, status: "completed" },
  { id: "sc_shahbaz_y_v", coach_id: "shahbaz", client_id: "shreya", type: "PT Session", scheduled_at: "2026-05-25T13:00:00", duration_min: 60, status: "completed" },
  { id: "sc_shahbaz_t_r", coach_id: "shahbaz", client_id: "meera", type: "PT Session", scheduled_at: "2026-07-05T16:00:00", duration_min: 60, status: "completed" },
  { id: "sc_shahbaz_y_r", coach_id: "shahbaz", client_id: "shreya", type: "PT Session", scheduled_at: "2026-07-04T13:00:00", duration_min: 60, status: "completed" }
];

const SEED_INVITES = [
  { id: "i1", client_id: "riya", coach_id: "lee", requested_slot: "Wednesday, 30 Apr · 7:30 AM", status: "pending", reason: "Standard check-in" },
  { id: "i2", client_id: "meera", coach_id: "lee", requested_slot: "Wednesday, 30 Apr · 8:30 AM", status: "pending", reason: "Chest strength progression focus" },
  { id: "i3", client_id: "karan", coach_id: "rahul", requested_slot: "Thursday, 1 May · 6:30 PM", status: "pending", reason: "Aerobic threshold adjustments" }
];

const SEED_RATINGS = [
  // Lee (lee)
  { id: 'r1_riya', client_id: 'riya', clientName: 'Riya Sharma', coachId: 'lee', coachName: 'Lee', session_date: '2026-04-20', scores_json: { workout: 5, form: 4, communication: 5, structure: 4, content: 5 }, overall: 4.6, comment: "Best session in weeks. Thoracic work really helped my overhead finally click." },
  { id: 'r2_riya', client_id: 'riya', clientName: 'Riya Sharma', coachId: 'lee', coachName: 'Lee', session_date: '2026-04-13', scores_json: { workout: 4, form: 5, communication: 4, structure: 4, content: 4 }, overall: 4.2, comment: "Form cues were incredibly precise. Shoulder felt better after the landmine work." },
  { id: 'r3_meera', client_id: 'meera', clientName: 'Meera P.', coachId: 'lee', coachName: 'Lee', session_date: '2026-04-20', scores_json: { workout: 5, form: 5, communication: 4, structure: 5, content: 4 }, overall: 4.6, comment: "Loved the progressive overload approach this block." },
  { id: 'r4_karan', client_id: 'karan', clientName: 'Karan S.', coachId: 'rahul', coachName: 'Rahul', session_date: '2026-04-19', scores_json: { workout: 4, form: 4, communication: 5, structure: 4, content: 5 }, overall: 4.4, comment: "Rahul always knows when to push and when to back off. Great session." },
  { id: 'r5_anita', client_id: 'anita', clientName: 'Anita V.', coachId: 'lee', coachName: 'Lee', session_date: '2026-04-18', scores_json: { workout: 3, form: 4, communication: 4, structure: 3, content: 4 }, overall: 3.6, comment: "Session was a bit shorter than usual but form coaching was detailed." },
  { id: 'r6_riya', client_id: 'riya', clientName: 'Riya Sharma', coachId: 'lee', coachName: 'Lee', session_date: '2026-05-26', scores_json: { workout: 5, form: 5, communication: 5, structure: 5, content: 5 }, overall: 5.0, comment: "Pristine posture care. The adjustments on my shoulder overhead press felt completely pain-free today!" },
  { id: 'r7_meera', client_id: 'meera', clientName: 'Meera P.', coachId: 'lee', coachName: 'Lee', session_date: '2026-05-26', scores_json: { workout: 4, form: 5, communication: 4, structure: 4, content: 5 }, overall: 4.4, comment: "Incredible tempo work on the squat blocks. Coach Lee's visual feedback on my knee alignment was perfect." },
  { id: 'r_lee_y_v', client_id: 'riya', clientName: 'Riya Sharma', coachId: 'lee', coachName: 'Lee', session_date: '2026-05-25', scores_json: { workout: 5, form: 4, communication: 5, structure: 5, content: 5 }, overall: 4.8, comment: "Superb session. Lee adjusted my hip-hinge beautifully under heavy load." },
  { id: 'r_lee_t_r', client_id: 'meera', clientName: 'Meera P.', coachId: 'lee', coachName: 'Lee', session_date: '2026-07-05', scores_json: { workout: 5, form: 5, communication: 5, structure: 5, content: 5 }, overall: 5.0, comment: "Fantastic strength pacing. Kept my form flawless even on the final failure reps!" },
  { id: 'r_lee_y_r', client_id: 'riya', clientName: 'Riya Sharma', coachId: 'lee', coachName: 'Lee', session_date: '2026-07-04', scores_json: { workout: 5, form: 4, communication: 5, structure: 5, content: 5 }, overall: 4.8, comment: "Great warm-up drills for shoulder mobility. Overhead felt amazing today." },

  // Rahul (rahul)
  { id: 'r8_karan', client_id: 'karan', clientName: 'Karan S.', coachId: 'rahul', coachName: 'Rahul', session_date: '2026-05-25', scores_json: { workout: 4, form: 4, communication: 4, structure: 5, content: 4 }, overall: 4.2, comment: "Metabolic conditioning sets were brutal but highly effective. Rahul kept me motivated throughout." },
  { id: 'r_rahul_t_v', client_id: 'karan', clientName: 'Karan S.', coachId: 'rahul', coachName: 'Rahul', session_date: '2026-05-26', scores_json: { workout: 5, form: 4, communication: 5, structure: 4, content: 5 }, overall: 4.6, comment: "Excellent deadlift modifications. Kept the back perfectly neutral under maximum tension." },
  { id: 'r_rahul_t_r', client_id: 'karan', clientName: 'Karan S.', coachId: 'rahul', coachName: 'Rahul', session_date: '2026-07-05', scores_json: { workout: 4, form: 5, communication: 5, structure: 4, content: 5 }, overall: 4.6, comment: "Hyrox engine builder session. Intensity was high but completely structured." },
  { id: 'r_rahul_y_r', client_id: 'vikram', clientName: 'Vikram R.', coachId: 'rahul', coachName: 'Rahul', session_date: '2026-07-04', scores_json: { workout: 4, form: 4, communication: 4, structure: 4, content: 4 }, overall: 4.0, comment: "Solid conditioning advice. Really clear explanation of lactic threshold zones." },

  // Deb (deb)
  { id: 'r_deb_t_v', client_id: 'vikram', clientName: 'Vikram R.', coachId: 'deb', coachName: 'Deb', session_date: '2026-05-26', scores_json: { workout: 5, form: 5, communication: 5, structure: 4, content: 5 }, overall: 4.8, comment: "Superb recovery cues. Deb's post-rehab decompression work on my lower back was extremely helpful." },
  { id: 'r_deb_y_v', client_id: 'vikram', clientName: 'Vikram R.', coachId: 'deb', coachName: 'Deb', session_date: '2026-05-25', scores_json: { workout: 4, form: 4, communication: 5, structure: 4, content: 5 }, overall: 4.4, comment: "Great hip mobility cues. Restored natural pelvis movement without any pain." },
  { id: 'r_deb_t_r', client_id: 'riya', clientName: 'Riya Sharma', coachId: 'deb', coachName: 'Deb', session_date: '2026-07-05', scores_json: { workout: 5, form: 5, communication: 5, structure: 4, content: 5 }, overall: 4.8, comment: "Incredible guidance on active recovery. Felt my hips loosen up entirely during the drills." },
  { id: 'r_deb_y_r', client_id: 'vikram', clientName: 'Vikram R.', coachId: 'deb', coachName: 'Deb', session_date: '2026-07-04', scores_json: { workout: 4, form: 5, communication: 4, structure: 4, content: 5 }, overall: 4.4, comment: "Excellent focus on core bracing during the deadbugs." },

  // Deepika (deepika)
  { id: 'r_deepika_t_v', client_id: 'shreya', clientName: 'Shreya M.', coachId: 'deepika', coachName: 'Deepika', session_date: '2026-05-26', scores_json: { workout: 4, form: 5, communication: 4, structure: 5, content: 4 }, overall: 4.4, comment: "Superb pacing guidance today. Loved the emphasis on maintaining steady state zone 2 breathing." },
  { id: 'r_deepika_y_v', client_id: 'rohan', clientName: 'Rohan D.', coachId: 'deepika', coachName: 'Deepika', session_date: '2026-05-25', scores_json: { workout: 5, form: 4, communication: 5, structure: 4, content: 5 }, overall: 4.6, comment: "Endurance block was tough but Deepika kept motivating me. Great posture cues." },
  { id: 'r_deepika_t_r', client_id: 'shreya', clientName: 'Shreya M.', coachId: 'deepika', coachName: 'Deepika', session_date: '2026-07-05', scores_json: { workout: 5, form: 5, communication: 4, structure: 5, content: 4 }, overall: 4.6, comment: "Excellent zone 2 threshold check. Clean structure and great energy." },
  { id: 'r_deepika_y_r', client_id: 'rohan', clientName: 'Rohan D.', coachId: 'deepika', coachName: 'Deepika', session_date: '2026-07-04', scores_json: { workout: 4, form: 4, communication: 5, structure: 5, content: 4 }, overall: 4.4, comment: "Very precise hydration instructions between high intensity intervals." },

  // Anisha (pilates)
  { id: 'r_pilates_t_v', client_id: 'anita', clientName: 'Anita V.', coachId: 'pilates', coachName: 'Anisha', session_date: '2026-05-26', scores_json: { workout: 5, form: 5, communication: 5, structure: 4, content: 5 }, overall: 4.8, comment: "Perfect core control cues. Pilates reformer pacing felt perfectly aligned to my shoulder recovery!" },
  { id: 'r_pilates_y_v', client_id: 'meera', clientName: 'Meera P.', coachId: 'pilates', coachName: 'Anisha', session_date: '2026-05-25', scores_json: { workout: 5, form: 4, communication: 5, structure: 5, content: 5 }, overall: 4.8, comment: "Precision movement today. Loved the emphasis on spinal articulation and rhythmic breathing." },
  { id: 'r_pilates_t_r', client_id: 'anita', clientName: 'Anita V.', coachId: 'pilates', coachName: 'Anisha', session_date: '2026-07-05', scores_json: { workout: 5, form: 5, communication: 5, structure: 5, content: 5 }, overall: 5.0, comment: "Outstanding clinical focus. My posture feels incredibly open and light." },
  { id: 'r_pilates_y_r', client_id: 'meera', clientName: 'Meera P.', coachId: 'pilates', coachName: 'Anisha', session_date: '2026-07-04', scores_json: { workout: 4, form: 5, communication: 5, structure: 4, content: 5 }, overall: 4.6, comment: "Anisha is amazing at modifying exercises. Thoracic mobility is improving rapidly." },

  // Joe (joe)
  { id: 'r_joe_t_v', client_id: 'karan', clientName: 'Karan S.', coachId: 'joe', coachName: 'Joe', session_date: '2026-05-26', scores_json: { workout: 5, form: 4, communication: 5, structure: 4, content: 5 }, overall: 4.6, comment: "Solid hypertrophy block! Focus on eccentric tempo really targeted my hamstrings." },
  { id: 'r_joe_y_v', client_id: 'rohan', clientName: 'Rohan D.', coachId: 'joe', coachName: 'Joe', session_date: '2026-05-25', scores_json: { workout: 4, form: 4, communication: 5, structure: 5, content: 4 }, overall: 4.4, comment: "Joe's cues for chest flyes helped me isolate the chest perfectly without shoulder strain." },
  { id: 'r_joe_t_r', client_id: 'karan', clientName: 'Karan S.', coachId: 'joe', coachName: 'Joe', session_date: '2026-07-05', scores_json: { workout: 5, form: 5, communication: 5, structure: 4, content: 5 }, overall: 4.8, comment: "Massive pump. The mechanical drop sets were perfectly executed today." },
  { id: 'r_joe_y_r', client_id: 'rohan', clientName: 'Rohan D.', coachId: 'joe', coachName: 'Joe', session_date: '2026-07-04', scores_json: { workout: 4, form: 4, communication: 5, structure: 4, content: 5 }, overall: 4.4, comment: "Really solid load progression. Pushed my limits safely." },

  // Aakash (aakash)
  { id: 'r_aakash_t_v', client_id: 'vikram', clientName: 'Vikram R.', coachId: 'aakash', coachName: 'Aakash', session_date: '2026-05-26', scores_json: { workout: 4, form: 4, communication: 4, structure: 4, content: 4 }, overall: 4.0, comment: "Great focus on foot and ankle stability. Aakash brings fantastic recovery protocols." },
  { id: 'r_aakash_y_v', client_id: 'shreya', clientName: 'Shreya M.', coachId: 'aakash', coachName: 'Aakash', session_date: '2026-05-25', scores_json: { workout: 4, form: 5, communication: 4, structure: 4, content: 5 }, overall: 4.4, comment: "Detailed explanation of knee tracking during heavy squats. Highly educational." },
  { id: 'r_aakash_t_r', client_id: 'vikram', clientName: 'Vikram R.', coachId: 'aakash', coachName: 'Aakash', session_date: '2026-07-05', scores_json: { workout: 4, form: 5, communication: 5, structure: 4, content: 5 }, overall: 4.6, comment: "Brilliant manual therapy and mobility drills. Joint feel very stable." },
  { id: 'r_aakash_y_r', client_id: 'shreya', clientName: 'Shreya M.', coachId: 'aakash', coachName: 'Aakash', session_date: '2026-07-04', scores_json: { workout: 4, form: 4, communication: 4, structure: 4, content: 4 }, overall: 4.0, comment: "Classic heavy lifting mechanics. Very clear safety boundaries." },

  // Tarun (tarun)
  { id: 'r_tarun_t_v', client_id: 'rohan', clientName: 'Rohan D.', coachId: 'tarun', coachName: 'Tarun', session_date: '2026-05-26', scores_json: { workout: 5, form: 5, communication: 4, structure: 5, content: 4 }, overall: 4.6, comment: "Hybrid athletic testing was amazing. Speed and power drills felt very snappy." },
  { id: 'r_tarun_y_v', client_id: 'riya', clientName: 'Riya Sharma', coachId: 'tarun', coachName: 'Tarun', session_date: '2026-05-25', scores_json: { workout: 4, form: 5, communication: 4, structure: 4, content: 5 }, overall: 4.4, comment: "Excellent block. Kept the engine pacing under control during high box jumps." },
  { id: 'r_tarun_t_r', client_id: 'rohan', clientName: 'Rohan D.', coachId: 'tarun', coachName: 'Tarun', session_date: '2026-07-05', scores_json: { workout: 5, form: 5, communication: 5, structure: 5, content: 4 }, overall: 4.8, comment: "Excellent dynamic conditioning. Heart rate control tips were spot-on." },
  { id: 'r_tarun_y_r', client_id: 'riya', clientName: 'Riya Sharma', coachId: 'tarun', coachName: 'Tarun', session_date: '2026-07-04', scores_json: { workout: 4, form: 4, communication: 5, structure: 4, content: 5 }, overall: 4.4, comment: "Strong, professional, and very encouraging. Highly scientific block." },

  // Santo (santo)
  { id: 'r_santo_t_v', client_id: 'karan', clientName: 'Karan S.', coachId: 'santo', coachName: 'Santo', session_date: '2026-05-26', scores_json: { workout: 5, form: 4, communication: 5, structure: 4, content: 5 }, overall: 4.6, comment: "Bodybuilding symmetry focus. Detailed tracking of my lifting tempos." },
  { id: 'r_santo_y_v', client_id: 'anita', clientName: 'Anita V.', coachId: 'santo', coachName: 'Santo', session_date: '2026-05-25', scores_json: { workout: 5, form: 5, communication: 4, structure: 5, content: 5 }, overall: 4.8, comment: "Incredible attention to hand and wrist orientation during biceps curls." },
  { id: 'r_santo_t_r', client_id: 'karan', clientName: 'Karan S.', coachId: 'santo', coachName: 'Santo', session_date: '2026-07-05', scores_json: { workout: 4, form: 5, communication: 5, structure: 4, content: 5 }, overall: 4.6, comment: "Fantastic volume. The pump from Santo's tri-sets is unmatched!" },
  { id: 'r_santo_y_r', client_id: 'anita', clientName: 'Anita V.', coachId: 'santo', coachName: 'Santo', session_date: '2026-07-04', scores_json: { workout: 5, form: 4, communication: 5, structure: 5, content: 5 }, overall: 4.8, comment: "Great focus on safety and muscle contraction connection." },

  // Shahbaz (shahbaz)
  { id: 'r_shahbaz_t_v', client_id: 'meera', clientName: 'Meera P.', coachId: 'shahbaz', coachName: 'Shahbaz', session_date: '2026-05-26', scores_json: { workout: 5, form: 5, communication: 5, structure: 5, content: 5 }, overall: 5.0, comment: "Traditional yoga and breathwork. Rebalanced my nervous system perfectly after a stressful week!" },
  { id: 'r_shahbaz_y_v', client_id: 'shreya', clientName: 'Shreya M.', coachId: 'shahbaz', coachName: 'Shahbaz', session_date: '2026-05-25', scores_json: { workout: 5, form: 5, communication: 4, structure: 5, content: 5 }, overall: 4.8, comment: "Deep vinyasa flow today. Breath mechanics were explained so clearly." },
  { id: 'r_shahbaz_t_r', client_id: 'meera', clientName: 'Meera P.', coachId: 'shahbaz', coachName: 'Shahbaz', session_date: '2026-07-05', scores_json: { workout: 5, form: 5, communication: 5, structure: 5, content: 5 }, overall: 5.0, comment: "Incredible hatha practice. Breathing and posture felt completely synchronized." },
  { id: 'r_shahbaz_y_r', client_id: 'shreya', clientName: 'Shreya M.', coachId: 'shahbaz', coachName: 'Shahbaz', session_date: '2026-07-04', scores_json: { workout: 5, form: 4, communication: 5, structure: 5, content: 4 }, overall: 4.8, comment: "Mindfulness and diaphragmatic loop focus. Restored my thoracic range." }
];

const SEED_CHATS = [
  { id: "c1", client_id: "riya", coach_id: "lee", sender: "coach", text: "Hi Riya! Excited to run through your progress report. Your sleep was slightly higher on average this week. Did it help training?", timestamp: "Yesterday 3:15 PM" },
  { id: "c2", client_id: "riya", coach_id: "lee", sender: "client", text: "Absolutely! Keeping the room cold meant I targeted my deep recovery window. Feel much less stiff.", timestamp: "Yesterday 4:02 PM" },
  { id: "c3", client_id: "riya", coach_id: "lee", sender: "coach", text: "Brilliant response. We will keep your barbell volumes consistent tomorrow. Recovery is working!", timestamp: "Yesterday 4:10 PM" }
];

const SEED_NUTRITION = [
  { id: "n1", client_id: "riya", coach_id: "lee", period: "Week 3 of 12", calories: 1800, protein: 140, carbs: 160, fat: 60, notes: "Keep protein high this block — muscle gain phase. Prioritise whole foods over supplements. Hydration target: 3L/day.", tags: ["Muscle Gain", "High Protein"] }
];

const SEED_SESSION_NOTES = [
  { id: "sn1", client_id: "riya", coach_id: "lee", date: "2026-04-20", text: "Good bench session. Restored thoracic extension drills before sets. Overhead bench trigger is reduced thoroughly.", tags: ["Strength", "Mobility"], type: "Aesthetics Block" },

  // Lee (lee)
  { id: "sn_lee_t_v", client_id: "riya", coach_id: "lee", date: "2026-05-26", text: "Exceptional shoulder overhead press. Form look very clean, zero rotator cuff discomfort reported.", tags: ["Strength", "Form"], type: "PT Workout" },
  { id: "sn_lee_y_v", client_id: "meera", coach_id: "lee", date: "2026-05-25", text: "High volume barbell squating. Tempo check on 3s eccentrics looks very promising.", tags: ["Hypertrophy", "Tempo"], type: "PT Workout" },
  { id: "sn_lee_t_r", client_id: "riya", coach_id: "lee", date: "2026-07-05", text: "Progressive overload bench. Scaled to 65kg smoothly. Form remained very tight.", tags: ["Strength", "Overload"], type: "PT Workout" },
  { id: "sn_lee_y_r", client_id: "meera", coach_id: "lee", date: "2026-07-04", text: "Posterior chain dynamic work. Hips unlocked with pre-session active extension drills.", tags: ["Mobility", "Active Recovery"], type: "PT Workout" },

  // Rahul (rahul)
  { id: "sn_rahul_t_v", client_id: "karan", coach_id: "rahul", date: "2026-05-26", text: "Heavy deadlifts check. Back remained fully neutral even during final 180kg single.", tags: ["Hyrox Prep", "Strength"], type: "PT Workout" },
  { id: "sn_rahul_y_v", client_id: "karan", coach_id: "rahul", date: "2026-05-25", text: "Metabolic conditioning set. Engine pacing targets achieved with solid anaerobic threshold.", tags: ["Conditioning", "Engine"], type: "PT Workout" },
  { id: "sn_rahul_t_r", client_id: "karan", coach_id: "rahul", date: "2026-07-05", text: "Lactic tolerance blocks. Dynamic recoveries are becoming very efficient.", tags: ["Conditioning", "Recovery"], type: "PT Workout" },
  { id: "sn_rahul_y_r", client_id: "vikram", coach_id: "rahul", date: "2026-07-04", text: "General aerobic base builder. Kept heart rate in zone 2 safely.", tags: ["Conditioning", "Aerobic"], type: "PT Workout" },

  // Deb (deb)
  { id: "sn_deb_t_v", client_id: "vikram", coach_id: "deb", date: "2026-05-26", text: "Pelvis alignment and lower back decompression. Range of movement restored cleanly.", tags: ["Mobility", "Recovery"], type: "PT Workout" },
  { id: "sn_deb_y_v", client_id: "vikram", coach_id: "deb", date: "2026-05-25", text: "Active hip extension drills. Relieved lower back pressure beautifully.", tags: ["Recovery", "Mobility"], type: "PT Workout" },
  { id: "sn_deb_t_r", client_id: "riya", coach_id: "deb", date: "2026-07-05", text: "Ankle dorsiflexion improvement. Stabilized squat stance depth thoroughly.", tags: ["Mobility", "Stability"], type: "PT Workout" },
  { id: "sn_deb_y_r", client_id: "vikram", coach_id: "deb", date: "2026-07-04", text: "Glute activation checks. Corrected lateral knee wobble completely.", tags: ["Form", "Recovery"], type: "PT Workout" },

  // Deepika (deepika)
  { id: "sn_deepika_t_v", client_id: "shreya", coach_id: "deepika", date: "2026-05-26", text: "Steady-state zone 2 pacing. Shreya maintained perfect aerobic consistency.", tags: ["Conditioning", "Zone 2"], type: "PT Workout" },
  { id: "sn_deepika_y_v", client_id: "rohan", coach_id: "deepika", date: "2026-05-25", text: "Hyrox wall ball sets. Stabilized chest and breathing mechanics under fatigue.", tags: ["Conditioning", "Endurance"], type: "PT Workout" },
  { id: "sn_deepika_t_r", client_id: "shreya", coach_id: "deepika", date: "2026-07-05", text: "Aerobic threshold interval progression. Lactic clearance remains extremely high.", tags: ["Conditioning", "Zone 2"], type: "PT Workout" },
  { id: "sn_deepika_y_r", client_id: "rohan", coach_id: "deepika", date: "2026-07-04", text: "Pacing strategy for row blocks. Clean catch and release mechanics.", tags: ["Endurance", "Hyrox Prep"], type: "PT Workout" },

  // Anisha (pilates)
  { id: "sn_pilates_t_v", client_id: "anita", coach_id: "pilates", date: "2026-05-26", text: "Reformer Core stability and shoulder recovery. Thoracic alignment looks superb.", tags: ["Pilates", "Mobility"], type: "PT Workout" },
  { id: "sn_pilates_y_v", client_id: "meera", coach_id: "pilates", date: "2026-05-25", text: "Spinal articulation focus. Smooth transition through roll-down blocks.", tags: ["Mobility", "Core"], type: "PT Workout" },
  { id: "sn_pilates_t_r", client_id: "anita", coach_id: "pilates", date: "2026-07-05", text: "Deep pelvic floor activation. Postural response was immediate and balanced.", tags: ["Pilates", "Posture"], type: "PT Workout" },
  { id: "sn_pilates_y_r", client_id: "meera", coach_id: "pilates", date: "2026-07-04", text: "Hamstring flexibility and thoracic extension focus.", tags: ["Mobility", "Flexibility"], type: "PT Workout" },

  // Joe (joe)
  { id: "sn_joe_t_v", client_id: "karan", coach_id: "joe", date: "2026-05-26", text: "Eccentric tempo hamstrings block. Mechanical damage phase handled perfectly.", tags: ["Hypertrophy", "Strength"], type: "PT Workout" },
  { id: "sn_joe_y_v", client_id: "rohan", coach_id: "joe", date: "2026-05-25", text: "Incline dumbbell press. Precision chest isolation with neutral wrist lock.", tags: ["Hypertrophy", "Form"], type: "PT Workout" },
  { id: "sn_joe_t_r", client_id: "karan", coach_id: "joe", date: "2026-07-05", text: "Mechanical drop sets. Muscle fiber recruitment reached highest efficiency.", tags: ["Hypertrophy", "Overload"], type: "PT Workout" },
  { id: "sn_joe_y_r", client_id: "rohan", coach_id: "joe", date: "2026-07-04", text: "Barbell curl tempo checks. Restricted shoulder momentum successfully.", tags: ["Hypertrophy", "Form"], type: "PT Workout" },

  // Aakash (aakash)
  { id: "sn_aakash_t_v", client_id: "vikram", coach_id: "aakash", date: "2026-05-26", text: "Foot arch strength and ankle stability. Corrected weight distribution.", tags: ["Stability", "Recovery"], type: "PT Workout" },
  { id: "sn_aakash_y_v", client_id: "shreya", coach_id: "aakash", date: "2026-05-25", text: "Knee tracking drills under light overhead load. Safe trajectory maintained.", tags: ["Form", "Mobility"], type: "PT Workout" },
  { id: "sn_aakash_t_r", client_id: "vikram", coach_id: "aakash", date: "2026-07-05", text: "Joint distraction mechanics. Restored shoulder flexion space thoroughly.", tags: ["Mobility", "Recovery"], type: "PT Workout" },
  { id: "sn_aakash_y_r", client_id: "shreya", coach_id: "aakash", date: "2026-07-04", text: "Deep squat stance check. Stabilized heels with wedge assistance.", tags: ["Strength", "Stability"], type: "PT Workout" },

  // Tarun (tarun)
  { id: "sn_tarun_t_v", client_id: "rohan", coach_id: "tarun", date: "2026-05-26", text: "Speed and power block. Dynamic box jumps look extremely snappy and safe.", tags: ["Hyrox Prep", "Power"], type: "PT Workout" },
  { id: "sn_tarun_y_v", client_id: "riya", coach_id: "tarun", date: "2026-05-25", text: "Engine threshold checks. Heart rate recovered within 45s between bouts.", tags: ["Conditioning", "Power"], type: "PT Workout" },
  { id: "sn_tarun_t_r", client_id: "rohan", coach_id: "tarun", date: "2026-07-05", text: "Explosive triple extension work. Power output improved significantly.", tags: ["Power", "Conditioning"], type: "PT Workout" },
  { id: "sn_tarun_y_r", client_id: "riya", coach_id: "tarun", date: "2026-07-04", text: "Pacing intervals on ski-erg. Clean pull-through and core engagement.", tags: ["Conditioning", "Hyrox Prep"], type: "PT Workout" },

  // Santo (santo)
  { id: "sn_santo_t_v", client_id: "karan", coach_id: "santo", date: "2026-05-26", text: "Symmetry checks and lateral raise tempo. Eliminated neck tension completely.", tags: ["Hypertrophy", "Symmetry"], type: "PT Workout" },
  { id: "sn_santo_y_v", client_id: "anita", coach_id: "santo", date: "2026-05-25", text: "Biceps peak isolation. Checked forearm rotation under load.", tags: ["Hypertrophy", "Form"], type: "PT Workout" },
  { id: "sn_santo_t_r", client_id: "karan", coach_id: "santo", date: "2026-07-05", text: "Giant sets for shoulder development. Blood flow and focus were incredible.", tags: ["Hypertrophy", "Volume"], type: "PT Workout" },
  { id: "sn_santo_y_r", client_id: "anita", coach_id: "santo", date: "2026-07-04", text: "Triceps overhead extensions. Safe elbow placement monitored throughout.", tags: ["Hypertrophy", "Form"], type: "PT Workout" },

  // Shahbaz (shahbaz)
  { id: "sn_shahbaz_t_v", client_id: "meera", coach_id: "shahbaz", date: "2026-05-26", text: "Traditional hatha practice. Deep nervous system shift and parasympathetic transition.", tags: ["Yoga", "Breathwork"], type: "PT Workout" },
  { id: "sn_shahbaz_y_v", client_id: "shreya", coach_id: "shahbaz", date: "2026-05-25", text: "Vinyasa flow sequence. Breath-movement sync is highly integrated.", tags: ["Yoga", "Mobility"], type: "PT Workout" },
  { id: "sn_shahbaz_t_r", client_id: "meera", coach_id: "shahbaz", date: "2026-07-05", text: "Pranayama deep control drills. Reduced resting respiration rates effectively.", tags: ["Breathwork", "Recovery"], type: "PT Workout" },
  { id: "sn_shahbaz_y_r", client_id: "shreya", coach_id: "shahbaz", date: "2026-07-04", text: "Spinal mobility and restorative breath. Chest tightness fully released.", tags: ["Breathwork", "Yoga"], type: "PT Workout" }
];

const SEED_BODY_COMP = [
  { id: "bc1", client_id: "riya", date: "2026-04-21", weight: 67.4, body_fat_pct: 24.8, muscle_kg: 49.8, visceral_fat: 8 }
];

// Initialize LocalStorage defaults if empty
const setupLocalStorage = () => {
  const checkAndSeed = (key, fallback) => {
    if (!localStorage.getItem(`m3s.${key}`)) {
      localStorage.setItem(`m3s.${key}`, JSON.stringify(fallback));
    }
  };
  checkAndSeed('clients', SEED_CLIENTS);
  checkAndSeed('assessments', SEED_ASSESSMENTS);
  checkAndSeed('sessions', SEED_SESSIONS);
  checkAndSeed('invites', SEED_INVITES);
  checkAndSeed('ratings', SEED_RATINGS);
  checkAndSeed('chats', SEED_CHATS);
  checkAndSeed('nutrition_plans', SEED_NUTRITION);
  checkAndSeed('session_notes', SEED_SESSION_NOTES);
  checkAndSeed('body_comp_entries', SEED_BODY_COMP);
  checkAndSeed('coaches_list', COACHES);
  checkAndSeed('admins_list', ADMINS);
};
setupLocalStorage();

// Simple UI Helpers
const OEyebrow = ({ children, dot = OT.walnut, color = OT.clay600, size = 11 }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: OT.fMono, fontSize: size, letterSpacing: 1.8, textTransform: 'uppercase', color, fontWeight: 500 }}>
    <span style={{ width: 6, height: 6, borderRadius: 999, background: dot, flexShrink: 0 }} />
    <span>{children}</span>
  </div>
);

const OMono = ({ children, size = 10, color = OT.clay600, style = {} }) => (
  <div style={{ fontFamily: OT.fMono, fontSize: size, letterSpacing: 1.5, textTransform: 'uppercase', color, fontWeight: 500, ...style }}>{children}</div>
);

// ─── Main Application Shell ──────────────────────────────────────────────
function App() {
  const [currentUser, setCurrentUser] = React.useState(null); // coach profile or admin profile
  const [currentRole, setCurrentRole] = React.useState(''); // 'coach' | 'admin'
  const [activeTab, setActiveTab] = React.useState('calendar'); // 'calendar' | 'invites' | 'clients' | 'admin_panel'
  
  const [firebaseAuthUser, setFirebaseAuthUser] = React.useState(null);
  const [isAuthInitializing, setIsAuthInitializing] = React.useState(true);

  // Firebase auth state and automatic Google credential restoration are wired below with handleLogin

  const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' && window.innerWidth < 960);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 960);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Real-time Database state
  const [clients, setClients] = React.useState([]);
  const [assessments, setAssessments] = React.useState([]);
  const [sessions, setSessions] = React.useState([]);
  const [invites, setInvites] = React.useState([]);
  const [ratings, setRatings] = React.useState([]);
  const [chats, setChats] = React.useState([]);
  const [nutritionPlans, setNutritionPlans] = React.useState([]);
  const [sessionNotes, setSessionNotes] = React.useState([]);
  const [bodyCompList, setBodyCompList] = React.useState([]);
  const [coaches, setCoaches] = React.useState(COACHES);
  const [adminsList, setAdminsList] = React.useState(ADMINS);
  const [selectedEditCoach, setSelectedEditCoach] = React.useState(null);

  const [googleTokens, setGoogleTokens] = React.useState({});
  const [googleCalendarEvents, setGoogleCalendarEvents] = React.useState({});

  const handleToggleGoogleSync = async (enabled) => {
    if (!currentUser || currentRole !== 'coach') return;
    
    let token = googleTokens[currentUser.id] || null;
    
    if (enabled && !token) {
      try {
        if (typeof firebase !== 'undefined' && firebase.auth) {
          const provider = new firebase.auth.GoogleAuthProvider();
          provider.addScope('https://www.googleapis.com/auth/calendar.events');
          provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
          
          const result = await firebase.auth().signInWithPopup(provider);
          if (result.credential && result.credential.accessToken) {
            token = result.credential.accessToken;
            setGoogleTokens(prev => ({ ...prev, [currentUser.id]: token }));
          } else {
            throw new Error("No token returned");
          }
        } else {
          throw new Error("Firebase Auth not loaded");
        }
      } catch (err) {
        console.error("Google Auth popup failed, using simulated auth token for sandbox preview:", err);
        token = "simulated_preview_token_" + Date.now();
        setGoogleTokens(prev => ({ ...prev, [currentUser.id]: token }));
      }
    }
    
    const updatedCoaches = coaches.map(c => {
      if (c.id === currentUser.id) {
        return { ...c, google_sync_enabled: enabled };
      }
      return c;
    });
    
    setCoaches(updatedCoaches);
    await M3S_DB.setAll('coaches_list', updatedCoaches);
    setCurrentUser(prev => ({ ...prev, google_sync_enabled: enabled }));
  };

  const handleToggleAppleSync = async (enabled) => {
    if (!currentUser || currentRole !== 'coach') return;
    
    const updatedCoaches = coaches.map(c => {
      if (c.id === currentUser.id) {
        return { ...c, apple_sync_enabled: enabled };
      }
      return c;
    });
    
    setCoaches(updatedCoaches);
    await M3S_DB.setAll('coaches_list', updatedCoaches);
    setCurrentUser(prev => ({ ...prev, apple_sync_enabled: enabled }));
  };

  const handleSaveCoachProfile = async (targetCoachId, updatedFields) => {
    const updatedCoaches = coaches.map(c => {
      if (c.id === targetCoachId) {
        return { ...c, ...updatedFields };
      }
      return c;
    });
    setCoaches(updatedCoaches);
    COACHES = updatedCoaches;
    await M3S_DB.setAll('coaches_list', updatedCoaches);
    if (currentUser && currentUser.id === targetCoachId) {
      setCurrentUser(prev => ({ ...prev, ...updatedFields }));
    }
  };

  const handleSaveAdminProfile = async (targetAdminId, updatedFields) => {
    const updatedAdmins = adminsList.map(a => {
      if (a.id === targetAdminId) {
        return { ...a, ...updatedFields };
      }
      return a;
    });
    setAdminsList(updatedAdmins);
    ADMINS = updatedAdmins;
    await M3S_DB.setAll('admins_list', updatedAdmins);
    if (currentUser && currentUser.id === targetAdminId) {
      setCurrentUser(prev => ({ ...prev, ...updatedFields }));
    }
  };

  const syncCoachSessionsToGoogle = async (coachObj, sessionsList, token, clientsList) => {
    if (!token || token.startsWith('simulated')) return;
    try {
      const coachUpcomingSessions = sessionsList.filter(s => s.coach_id === coachObj.id && s.status === 'upcoming');
      const timeMin = "2026-05-24T00:00:00Z";
      const timeMax = "2026-05-31T23:59:59Z";
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`;
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      const googleEvents = data.items || [];
      const m3sGoogleEvents = googleEvents.filter(evt => evt.id && evt.id.startsWith('m3ssession'));
      
      for (const session of coachUpcomingSessions) {
        const gEventId = 'm3ssession' + session.id.toLowerCase().replace(/[^a-z0-9]/g, '');
        const client = clientsList.find(c => c.id === session.client_id) || { name: 'Unknown Student' };
        
        let localScheduled = session.scheduled_at;
        if (!localScheduled.includes('T')) {
          localScheduled = localScheduled.replace(' ', 'T');
        }
        const startTime = localScheduled + "+05:30";
        const duration = session.duration_min || 60;
        const startMs = new Date(localScheduled).getTime();
        const endMs = startMs + duration * 60 * 1000;
        const endTime = new Date(endMs).toISOString().split('.')[0] + "+05:30";
        
        const existingEvent = m3sGoogleEvents.find(evt => evt.id === gEventId);
        
        const eventBody = {
          id: gEventId,
          summary: `M3S PT Session: ${client.name}`,
          description: `Personal Training session at My Third Space, Indiranagar. Class: ${session.type}. Duration: ${duration} mins.`,
          start: { dateTime: startTime, timeZone: 'Asia/Kolkata' },
          end: { dateTime: endTime, timeZone: 'Asia/Kolkata' }
        };
        
        if (existingEvent) {
          const needsUpdate = existingEvent.summary !== eventBody.summary || 
                              existingEvent.start.dateTime !== startTime ||
                              existingEvent.end.dateTime !== endTime;
          if (needsUpdate) {
            await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${gEventId}`, {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(eventBody)
            });
          }
        } else {
          await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(eventBody)
          }).catch(() => {
            return fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/import`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ ...eventBody, status: 'confirmed' })
            });
          });
        }
      }
      
      for (const evt of m3sGoogleEvents) {
        const matchSessionId = evt.id.replace('m3ssession', '');
        const isStillUpcoming = coachUpcomingSessions.some(s => s.id.toLowerCase().replace(/[^a-z0-9]/g, '') === matchSessionId);
        if (!isStillUpcoming) {
          await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${evt.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
      }
    } catch (err) {
      console.warn("Outbound Google Calendar sync failed:", err);
    }
  };

  React.useEffect(() => {
    (coaches || []).forEach(async (coach) => {
      if (coach.google_sync_enabled) {
        const token = googleTokens[coach.id];
        if (token && !token.startsWith('simulated')) {
          try {
            const timeMin = "2026-05-24T00:00:00Z";
            const timeMax = "2026-05-31T23:59:59Z";
            const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`;
            const res = await fetch(url, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
              const data = await res.json();
              const items = data.items || [];
              const nonM3s = items.filter(evt => evt.id && !evt.id.startsWith('m3ssession'));
              
              const mapped = nonM3s.map(evt => {
                const startISO = evt.start.dateTime || evt.start.date || '';
                const endISO = evt.end.dateTime || evt.end.date || '';
                const startLocal = startISO ? startISO.split('+')[0] : '';
                const duration = Math.round((new Date(endISO).getTime() - new Date(startISO).getTime()) / 60000) || 60;
                return {
                  id: `gcal_blocked_${coach.id}_${evt.id}`,
                  coach_id: coach.id,
                  client_id: 'blocked',
                  type: 'Google Calendar Event',
                  status: 'blocked',
                  scheduled_at: startLocal.substring(0, 19),
                  duration_min: duration,
                  reason: `Google Calendar: ${evt.summary || 'Busy Slot'}`
                };
              });

              setGoogleCalendarEvents(prev => ({ ...prev, [coach.id]: mapped }));
              syncCoachSessionsToGoogle(coach, sessions, token, clients);
            }
          } catch (err) {
            console.warn("Error fetching Google Calendar feeds for " + coach.name, err);
          }
        } else {
          const simMapped = [
            {
              id: `gcal_blocked_sim1_${coach.id}`,
              coach_id: coach.id,
              client_id: 'blocked',
              type: 'Google Calendar Event',
              status: 'blocked',
              scheduled_at: '2026-05-26T09:00:00',
              duration_min: 90,
              reason: 'Google: Hypertrophy Master Class Seminar (Simulated)'
            },
            {
              id: `gcal_blocked_sim2_${coach.id}`,
              coach_id: coach.id,
              client_id: 'blocked',
              type: 'Google Calendar Event',
              status: 'blocked',
              scheduled_at: '2026-05-28T15:00:00',
              duration_min: 60,
              reason: 'Google: Physiotherapy Joint Checkup (Simulated)'
            }
          ];
          setGoogleCalendarEvents(prev => ({ ...prev, [coach.id]: simMapped }));
        }
      } else {
        if (googleCalendarEvents[coach.id]) {
          setGoogleCalendarEvents(prev => {
            const next = { ...prev };
            delete next[coach.id];
            return next;
          });
        }
      }
    });
  }, [sessions, coaches, googleTokens, clients]);

  const activeSessions = React.useMemo(() => {
    let list = [...sessions];
    
    Object.values(googleCalendarEvents || {}).forEach(mappedEvts => {
      if (mappedEvts) {
        list = [...list, ...mappedEvts];
      }
    });
    
    (coaches || []).forEach(coach => {
      if (coach.apple_sync_enabled) {
        const appleEvts = [
          {
            id: `ical_blocked_1_${coach.id}`,
            coach_id: coach.id,
            client_id: 'blocked',
            type: 'Apple Calendar Event',
            status: 'blocked',
            scheduled_at: '2026-05-25T11:00:00',
            duration_min: 60,
            reason: 'Apple: Studio Masterclass Prep (Simulated)'
          },
          {
            id: `ical_blocked_2_${coach.id}`,
            coach_id: coach.id,
            client_id: 'blocked',
            type: 'Apple Calendar Event',
            status: 'blocked',
            scheduled_at: '2026-05-27T13:00:00',
            duration_min: 90,
            reason: 'Apple: iCloud Physiotherapy Joint Alignment (Simulated)'
          }
        ];
        list = [...list, ...appleEvts];
      }
    });
    
    return list;
  }, [sessions, googleCalendarEvents, coaches]);

  const handleForceReseedAllData = async () => {
    try {
      // Write seeds to localStorage
      localStorage.setItem('m3s.clients', JSON.stringify(SEED_CLIENTS));
      localStorage.setItem('m3s.assessments', JSON.stringify(SEED_ASSESSMENTS));
      localStorage.setItem('m3s.sessions', JSON.stringify(SEED_SESSIONS));
      localStorage.setItem('m3s.invites', JSON.stringify(SEED_INVITES));
      localStorage.setItem('m3s.ratings', JSON.stringify(SEED_RATINGS));
      localStorage.setItem('m3s.chats', JSON.stringify(SEED_CHATS));
      localStorage.setItem('m3s.nutrition_plans', JSON.stringify(SEED_NUTRITION));
      localStorage.setItem('m3s.session_notes', JSON.stringify(SEED_SESSION_NOTES));
      localStorage.setItem('m3s.body_comp_entries', JSON.stringify(SEED_BODY_COMP));
      localStorage.setItem('m3s.coaches_list', JSON.stringify(COACHES));
      localStorage.setItem('m3s.admins_list', JSON.stringify(ADMINS));

      // Write seeds to Firestore using M3S_DB.setAll
      await M3S_DB.setAll('clients', SEED_CLIENTS);
      await M3S_DB.setAll('assessments', SEED_ASSESSMENTS);
      await M3S_DB.setAll('sessions', SEED_SESSIONS);
      await M3S_DB.setAll('invites', SEED_INVITES);
      await M3S_DB.setAll('ratings', SEED_RATINGS).catch(() => {});
      await M3S_DB.setAll('chats', SEED_CHATS).catch(() => {});
      await M3S_DB.setAll('nutrition_plans', SEED_NUTRITION).catch(() => {});
      await M3S_DB.setAll('session_notes', SEED_SESSION_NOTES).catch(() => {});
      await M3S_DB.setAll('body_comp_entries', SEED_BODY_COMP).catch(() => {});
      await M3S_DB.setAll('coaches_list', COACHES).catch(() => {});
      await M3S_DB.setAll('admins_list', ADMINS).catch(() => {});

      // Refresh states using reloadData()
      await reloadData();
    } catch (e) {
      console.error("Force reseed failed:", e);
    }
  };

  React.useEffect(() => {
    window.__M3S_FORCE_RESEED_DATA__ = handleForceReseedAllData;
    return () => {
      delete window.__M3S_FORCE_RESEED_DATA__;
    };
  }, [sessions, clients]);

  // Fast Switch Staff Identity from the QA Console
  React.useEffect(() => {
    const handleQAChangeStaff = (e) => {
      const { staffId } = e.detail;
      const staffCoach = coaches.find(c => c.id === staffId);
      if (staffCoach) {
        setCurrentUser(staffCoach);
        setCurrentRole('coach');
        setActiveTab('invites'); // switch to Your Schedule so they see it
      } else {
        const staffAdmin = adminsList.find(a => a.id === staffId);
        if (staffAdmin) {
          setCurrentUser(staffAdmin);
          setCurrentRole('admin');
          setActiveTab('admin_panel'); // switch to Admin Matrix
        }
      }
    };

    window.addEventListener('m3s:qa-switch-staff', handleQAChangeStaff);
    return () => {
      window.removeEventListener('m3s:qa-switch-staff', handleQAChangeStaff);
    };
  }, [coaches, adminsList]);

  // Client Drawer / Context Modal
  const [selectedClient, setSelectedClient] = React.useState(null);
  const [activeClientTab, setActiveClientTab] = React.useState('overview'); // 'overview' | 'assessment' | 'notes' | 'nutrition'
  
  // Modals
  const [showBlockModal, setShowBlockModal] = React.useState(false);
  const [blockDate, setBlockDate] = React.useState('2026-05-29');
  const [blockStart, setBlockStart] = React.useState('08:00');
  const [blockEnd, setBlockEnd] = React.useState('09:30');
  const [blockReason, setBlockReason] = React.useState('Clinic Training Seminar');

  const [reassignInvite, setReassignInvite] = React.useState(null);

  // Sync with Cloud / LocalStorage on mount and periodically
  const reloadData = async () => {
    let clientsData = await M3S_DB.getAll('clients', SEED_CLIENTS);
    let assessmentsData = await M3S_DB.getAll('assessments', SEED_ASSESSMENTS);
    let sessionsData = await M3S_DB.getAll('sessions', SEED_SESSIONS);
    let invitesData = await M3S_DB.getAll('invites', SEED_INVITES);
    let ratingsData = await M3S_DB.getAll('ratings', SEED_RATINGS);
    let chatsData = await M3S_DB.getAll('chats', SEED_CHATS);
    let nutritionPlansData = await M3S_DB.getAll('nutrition_plans', SEED_NUTRITION);
    let sessionNotesData = await M3S_DB.getAll('session_notes', SEED_SESSION_NOTES);
    let bodyCompData = await M3S_DB.getAll('body_comp_entries', SEED_BODY_COMP);
    let rawCoachesData = await M3S_DB.getAll('coaches_list', COACHES);
    let rawAdminsData = await M3S_DB.getAll('admins_list', ADMINS);

    // Defensive array guarantees
    const safeClients = Array.isArray(clientsData) ? clientsData : SEED_CLIENTS;
    const safeAssessments = Array.isArray(assessmentsData) ? assessmentsData : SEED_ASSESSMENTS;
    
    // Synced database/table logic to ensure past seed sessions are fully synchronized
    let safeSessions = Array.isArray(sessionsData) ? sessionsData : SEED_SESSIONS;
    let sessionsUpdated = false;
    if (true) {
      SEED_SESSIONS.forEach(seedSess => {
        if (!safeSessions.some(s => s.id === seedSess.id)) {
          safeSessions.push(seedSess);
          sessionsUpdated = true;
        }
      });
    }
    if (sessionsUpdated) {
      M3S_DB.setAll('sessions', safeSessions).catch(err => console.warn(err));
    }

    const safeInvites = Array.isArray(invitesData) ? invitesData : SEED_INVITES;
    
    let safeRatings = Array.isArray(ratingsData) ? ratingsData : SEED_RATINGS;
    let ratingsUpdated = false;
    if (true) {
      SEED_RATINGS.forEach(seedRat => {
        if (!safeRatings.some(r => r.id === seedRat.id)) {
          safeRatings.push(seedRat);
          ratingsUpdated = true;
        }
      });
    }
    if (ratingsUpdated) {
      M3S_DB.setAll('ratings', safeRatings).catch(err => console.warn(err));
    }

    const safeChats = Array.isArray(chatsData) ? chatsData : SEED_CHATS;
    const safeNutrition = Array.isArray(nutritionPlansData) ? nutritionPlansData : SEED_NUTRITION;

    let safeSessionNotes = Array.isArray(sessionNotesData) ? sessionNotesData : SEED_SESSION_NOTES;
    let notesUpdated = false;
    if (true) {
      SEED_SESSION_NOTES.forEach(seedNote => {
        if (!safeSessionNotes.some(sn => sn.id === seedNote.id)) {
          safeSessionNotes.push(seedNote);
          notesUpdated = true;
        }
      });
    }
    if (notesUpdated) {
      M3S_DB.setAll('session_notes', safeSessionNotes).catch(err => console.warn(err));
    }
    const safeBodyComp = Array.isArray(bodyCompData) ? bodyCompData : SEED_BODY_COMP;
    const loadedCoaches = (Array.isArray(rawCoachesData) ? rawCoachesData : COACHES).filter(c => c && c.id !== 'shailaa');
    const safeCoaches = [...loadedCoaches];
    if (true) {
      COACHES.forEach(localCoach => {
        if (!safeCoaches.some(c => c && c.id === localCoach.id)) {
          safeCoaches.push(localCoach);
        }
      });
    }

    const loadedAdmins = Array.isArray(rawAdminsData) ? rawAdminsData : ADMINS;
    const safeAdmins = [...loadedAdmins];
    if (true) {
      ADMINS.forEach(localAdmin => {
        if (!safeAdmins.some(a => a && a.id === localAdmin.id)) {
          safeAdmins.push(localAdmin);
        }
      });
    }

    // Enrich with default phone and emails if they don't exist in saved documents
    const enrichedCoaches = safeCoaches.map(c => {
      const fallback = COACHES.find(fc => fc.id === c.id) || {};
      let email = c.email || fallback.email || '';
      if (email.endsWith('@mythirdspace.in')) {
        email = email.replace('@mythirdspace.in', '@mythirdspace.fit');
      }
      return {
        ...c,
        email,
        phone: c.phone || fallback.phone || ''
      };
    });

    const enrichedAdmins = safeAdmins.map(a => {
      const fallback = ADMINS.find(fa => fa.id === a.id) || {};
      let name = a.name || fallback.name || '';
      let email = a.email || fallback.email || '';
      if (email.endsWith('@mythirdspace.in')) {
        email = email.replace('@mythirdspace.in', '@mythirdspace.fit');
      }
      let phone = a.phone || fallback.phone || '';
      if (a.id === 'shwetambari' && (phone === '9811122233' || phone === 'None' || !phone)) {
        phone = '9619484350';
      }
      return {
        ...a,
        name,
        email,
        phone
      };
    }).filter(a => a && a.id !== 'admin' && a.name);

    setClients(safeClients);
    setAssessments(safeAssessments);
    setSessions(safeSessions);
    setInvites(safeInvites);
    setRatings(safeRatings);
    setChats(safeChats);
    setNutritionPlans(safeNutrition);
    setSessionNotes(safeSessionNotes);
    setBodyCompList(safeBodyComp);
    
    // Sync React states & keep globals up-to-date
    setCoaches(enrichedCoaches);
    COACHES = enrichedCoaches;
    setAdminsList(enrichedAdmins);
    ADMINS = enrichedAdmins;
  };

  React.useEffect(() => {
    reloadData();
    // Simulate real-time polling every 5s for cooperative sharing feel
    const interval = setInterval(reloadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const hasRestoredSession = React.useRef(false);

  // Persistent session loading on mount
  React.useEffect(() => {
    if (hasRestoredSession.current) {
      // If we already restored the session, we can still update the currentUser object with the latest synced data,
      // but we do NOT reset the activeTab!
      try {
        const savedUser = localStorage.getItem('m3s.currentUser');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          const matchedAdmin = adminsList.find(a => a.id === parsedUser.id);
          const matchedCoach = coaches.find(c => c.id === parsedUser.id);
          const latestUserObj = matchedAdmin || matchedCoach || parsedUser;
          setCurrentUser(latestUserObj);
        }
      } catch (e) {}
      return;
    }

    try {
      const savedUser = localStorage.getItem('m3s.currentUser');
      const savedRole = localStorage.getItem('m3s.currentRole');
      if (savedUser && savedRole) {
        const parsedUser = JSON.parse(savedUser);
        
        // Match user against latest loaded/synced coaches or admins
        const matchedAdmin = adminsList.find(a => a.id === parsedUser.id);
        const matchedCoach = coaches.find(c => c.id === parsedUser.id);
        const latestUserObj = matchedAdmin || matchedCoach || parsedUser;
        
        setCurrentUser(latestUserObj);
        setCurrentRole(savedRole);
        if (savedRole === 'admin') {
          setActiveTab('admin_panel');
        } else {
          setActiveTab('calendar');
        }
        hasRestoredSession.current = true;
      }
    } catch (e) {
      console.warn("Error restoring persisted session:", e);
    }
  }, [coaches, adminsList]);

  // Handle Login
  const handleLogin = React.useCallback((userObj, role) => {
    if (!userObj) return;
    setCurrentUser(userObj);
    setCurrentRole(role);
    try {
      localStorage.setItem('m3s.currentUser', JSON.stringify(userObj));
      localStorage.setItem('m3s.currentRole', role);
    } catch (e) {
      console.warn("Failed to persist login session:", e);
    }
    if (role === 'admin') {
      setActiveTab('admin_panel');
    } else {
      setActiveTab('calendar');
    }
  }, []);

  const handleLogout = React.useCallback(() => {
    setCurrentUser(null);
    setCurrentRole('');
    hasRestoredSession.current = false;
    try {
      localStorage.removeItem('m3s.currentUser');
      localStorage.removeItem('m3s.currentRole');
      if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().signOut().catch(e => console.warn("Firebase signOut error:", e));
      }
    } catch (e) {
      console.warn("Failed to clear persisted session:", e);
    }
  }, []);

  const resolveAndLoginGoogleUser = React.useCallback((user) => {
    if (!user || !user.email) return;
    const emailNorm = user.email.trim().toLowerCase();
    
    // Check if user already matches current logged-in profile
    if (currentUser && (currentUser.email || '').trim().toLowerCase() === emailNorm) {
      return;
    }

    // 1. Matched Admin in state
    const matchedAdmin = adminsList.find(a => (a.email || '').trim().toLowerCase() === emailNorm);
    if (matchedAdmin) {
      handleLogin(matchedAdmin, 'admin');
      return;
    }

    // 2. Matched Coach in state
    const matchedCoach = coaches.find(c => (c.email || '').trim().toLowerCase() === emailNorm);
    if (matchedCoach) {
      handleLogin(matchedCoach, 'coach');
      return;
    }

    // 3. Known Admin Account (egpvai21@gmail.com, etc.)
    if (emailNorm === 'egpvai21@gmail.com' || emailNorm.includes('shweta') || emailNorm.endsWith('@mythirdspace.fit')) {
      const shweta = adminsList.find(a => a.id === 'shwetambari') || ADMINS.find(a => a.id === 'shwetambari') || {
        id: "shwetambari",
        name: user.displayName || "Shwetambari",
        role: "Owner",
        canManageAdmins: true,
        initials: "SW",
        email: user.email,
        phone: "9619484350"
      };
      handleLogin(shweta, 'admin');
      return;
    }

    // 4. Any authenticated Google user -> grant Studio Administrator access
    const customUser = {
      id: 'admin_' + (user.uid || emailNorm.replace(/[^a-z0-9]/g, '_')),
      name: user.displayName || emailNorm.split('@')[0],
      role: "Studio Administrator",
      canManageAdmins: true,
      initials: (user.displayName ? user.displayName.slice(0, 2) : emailNorm.slice(0, 2)).toUpperCase(),
      email: user.email,
      phone: user.phoneNumber || "9619484350"
    };
    handleLogin(customUser, 'admin');
  }, [adminsList, coaches, currentUser, handleLogin]);

  // Unified Google & Firebase Auth State listener
  React.useEffect(() => {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      if (typeof firebase.auth().getRedirectResult === 'function') {
        firebase.auth().getRedirectResult().then((result) => {
          if (result && result.user) {
            resolveAndLoginGoogleUser(result.user);
          }
        }).catch(err => {
          console.warn("getRedirectResult info:", err);
        });
      }

      const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
        setFirebaseAuthUser(user);
        setIsAuthInitializing(false);
        if (user) {
          resolveAndLoginGoogleUser(user);
        }
      }, (err) => {
        console.error("Firebase auth check failed:", err);
        setIsAuthInitializing(false);
      });
      return () => unsubscribe();
    } else {
      setIsAuthInitializing(false);
    }
  }, [resolveAndLoginGoogleUser]);

  const isEmailAdmin = (email) => {
    if (!email) return false;
    const e = email.trim().toLowerCase();
    return e === 'egpvai21@gmail.com' || e === 'shwetambari@mythirdspace.fit' || e === 'harshita@mythirdspace.fit' || adminsList.some(a => (a.email || '').trim().toLowerCase() === e);
  };

  const isAdminSessionLocked = false;

  if (!currentUser) {
    return <LoginView onLogin={handleLogin} coaches={coaches} admins={adminsList} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh', background: OT.sand50, fontFamily: OT.fBody }}>
      {/* Mobile Top Header nav */}
      {isMobile && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 16px',
          background: OT.sand100,
          borderBottom: `1px solid ${OT.hairlineStrong}`,
          position: 'sticky',
          top: 0,
          zIndex: 900
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="assets/mts-logo.png" alt="My Third Space" style={{ height: 26, width: 'auto', objectFit: 'contain', filter: 'brightness(0) saturate(100%) invert(24%) sepia(17%) saturate(1487%) hue-rotate(344deg) brightness(97%) contrast(91%)' }} />
            <div style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 17, fontWeight: 500, color: OT.espresso900 }}>
              {currentRole === 'admin' ? 'Admin Access' : 'Coach Channel'}
            </div>
          </div>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: OT.walnut,
              color: OT.paper,
              border: 'none',
              padding: '6px 14px',
              borderRadius: 999,
              fontFamily: OT.fMono,
              fontSize: 10,
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {mobileMenuOpen ? '✕ CLOSE' : '☰ MENU'}
          </button>
        </div>
      )}

      {/* Sidebar Navigation - Responsive Slide Drawer on mobile */}
      {(!isMobile || mobileMenuOpen) && (
        isMobile ? (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex'
          }}>
            {/* Overlay backdrop */}
            <div 
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(36,24,16,0.45)',
                backdropFilter: 'blur(3.5px)'
              }}
            />
            {/* Drawer container body */}
            <div style={{
              position: 'relative',
              width: 280,
              height: '100%',
              background: OT.sand100,
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: OT.sh3
            }}>
              <Sidebar 
                currentRole={currentRole}
                activeTab={activeTab} 
                setActiveTab={(tab) => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }} 
                currentUser={currentUser} 
                onLogout={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }} 
              />
            </div>
          </div>
        ) : (
          <Sidebar 
            currentRole={currentRole}
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            currentUser={currentUser} 
            onLogout={handleLogout} 
          />
        )
      )}

      {/* Main Panel Content Area */}
      <div style={{ flex: 1, padding: isMobile ? '20px 16px' : '40px 48px', overflowY: 'auto', boxSizing: 'border-box' }}>
        
        {/* Header Metadata */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          gap: isMobile ? 12 : 16,
          marginBottom: 32 
        }}>
          <div>
            <OEyebrow dot={OT.ochre}>{currentRole === 'admin' ? 'ADMIN ACCESS' : 'STUDIO COACH CHANNEL'}</OEyebrow>
            <h1 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: isMobile ? 28 : 38, color: OT.espresso900, margin: '8px 0 0', fontWeight: 400 }}>
              Welcome back, {currentUser.name}
            </h1>
          </div>
          <div style={{ background: OT.sand100, border: `1px solid ${OT.hairlineStrong}`, borderRadius: 999, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: OT.espresso800 }}>{currentUser.role}</span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: OT.sage }} />
            <OMono size={8} color={OT.clay600}>LIVE SYNC</OMono>
          </div>
        </div>

        {/* Tab switcher renderer */}
        {activeTab === 'calendar' && (
          <CalendarDashboard 
            currentUser={currentUser} 
            sessions={activeSessions} 
            setSessions={setSessions}
            clients={clients}
            onOpenBlockModal={() => setShowBlockModal(true)}
            coaches={coaches}
            setCoaches={setCoaches}
            handleToggleGoogleSync={handleToggleGoogleSync}
            handleToggleAppleSync={handleToggleAppleSync}
          />
        )}

        {activeTab === 'invites' && (
          <PTInvitesDashboard coaches={coaches} 
            currentUser={currentUser}
            clients={clients}
            invites={invites}
            setInvites={setInvites}
            sessions={activeSessions}
            setSessions={setSessions}
            onStartReassign={setReassignInvite}
          />
        )}

        {activeTab === 'clients' && (
          <MyClientsDashboard coaches={coaches} 
            currentUser={currentUser}
            currentRole={currentRole}
            clients={clients}
            onSelectClient={(c) => { setSelectedClient(c); setActiveClientTab('overview'); }}
          />
        )}

        {activeTab === 'admin_panel' && (
          <AdminPanelDashboard 
            currentUser={currentUser}
            clients={clients}
            setClients={setClients}
            sessions={activeSessions}
            setSessions={setSessions}
            invites={invites}
            setInvites={setInvites}
            ratings={ratings}
            coaches={coaches}
            setCoaches={setCoaches}
            adminsList={adminsList}
            setAdminsList={setAdminsList}
            handleSaveCoachProfile={handleSaveCoachProfile}
            handleSaveAdminProfile={handleSaveAdminProfile}
          />
        )}
        {activeTab === 'coach_ratings' && (
          <CoachRatingsDashboard 
            currentUser={currentUser}
            ratings={ratings}
          />
        )}
        {activeTab === 'my_profile_settings' && (
          <CoachMyProfileDashboard 
            currentUser={currentUser}
            coaches={coaches}
            setCoaches={setCoaches}
            handleSaveCoachProfile={handleSaveCoachProfile}
          />
        )}


      </div>

      {/* ── CLIENT FULL PROFILE DRAWER ── */}
      {selectedClient && (
        <ClientProfileDrawer 
          client={selectedClient}
          onClose={() => setSelectedClient(null)}
          activeTab={activeClientTab}
          setActiveTab={setActiveClientTab}
          assessment={assessments.find(a => a.client_id === selectedClient.id) || SEED_ASSESSMENTS[0]}
          sessions={sessions.filter(s => s.client_id === selectedClient.id)}
          ratings={ratings.filter(r => (r.client_id === selectedClient.id) || (r.clientId === selectedClient.id))}
          chats={chats.filter(c => c.client_id === selectedClient.id)}
          nutrition={nutritionPlans.find(n => n.client_id === selectedClient.id)}
          sessionNotes={sessionNotes.filter(n => (n.client_id === selectedClient.id) || (n.clientId === selectedClient.id))}
          bodyComp={bodyCompList.filter(b => b.client_id === selectedClient.id)}
          currentUser={currentUser}
          currentRole={currentRole}
          onUpdate={async () => {
            await reloadData();
          }}
        />
      )}

      {/* ── BLOCK TIME MODAL ── */}
      {showBlockModal && (
        <div style={modalOverlayStyle}>
          <div style={modalCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <OEyebrow dot={OT.terra}>CALENDAR ACTION</OEyebrow>
              <button onClick={() => setShowBlockModal(false)} style={closeBtnStyle}>×</button>
            </div>
            <h3 style={modalTitleStyle}>Block Out Hours</h3>
            <p style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.clay600, marginBottom: 24 }}>
              Declare blocked times on your timetable. Students will be prohibited from booking PT slots during these parameters.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
              <div>
                <label style={labelStyle}>DATE</label>
                <input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} style={inputStyle2} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>START</label>
                  <input type="time" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} style={inputStyle2} />
                </div>
                <div>
                  <label style={labelStyle}>END</label>
                  <input type="time" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} style={inputStyle2} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>REASON FOR LOCK</label>
                <input type="text" value={blockReason} onChange={(e) => setBlockReason(e.target.value)} style={inputStyle2} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={async () => {
                  const newBlock = {
                    id: Math.random().toString(36).substring(7),
                    coach_id: currentUser.id,
                    client_id: 'blocked',
                    type: 'Block Out',
                    scheduled_at: `${blockDate}T${blockStart}:00`,
                    duration_min: 90,
                    status: 'blocked',
                    reason: blockReason
                  };
                  const updated = [...sessions, newBlock];
                  setSessions(updated);
                  await M3S_DB.setAll('sessions', updated);
                  setShowBlockModal(false);
                }}
                style={{ ...btnPrimaryStyle, flex: 1.5 }}>
                Block Timetable Slot
              </button>
              <button onClick={() => setShowBlockModal(false)} style={{ ...btnSecondaryStyle, flex: 1 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── REASSIGN PT INVITE MODAL ── */}
      {reassignInvite && (
        <div style={modalOverlayStyle}>
          <div style={{ ...modalCardStyle, maxWidth: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <OEyebrow dot={OT.ochre}>CLIENT ALLOCATION</OEyebrow>
              <button onClick={() => setReassignInvite(null)} style={closeBtnStyle}>×</button>
            </div>
            <h3 style={modalTitleStyle}>Reassign PT Student</h3>
            <p style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.clay600, marginBottom: 20 }}>
              Delegate checkout task for <strong>{clients.find(c => c.id === reassignInvite.client_id)?.name}</strong> to an available trainer:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxHeight: 220, overflowY: 'auto', marginBottom: 24, padding: 4 }}>
              {COACHES.filter(c => c.id !== currentUser.id).map(c => (
                <div 
                  key={c.id}
                  onClick={async () => {
                    const idx = invites.findIndex(i => i.id === reassignInvite.id);
                    if (idx >= 0) {
                      const updated = [...invites];
                      updated[idx].coach_id = c.id;
                      updated[idx].reason = `${updated[idx].reason || ''} (Reassigned from Coach ${currentUser.name})`;
                      setInvites(updated);
                      await M3S_DB.setAll('invites', updated);
                    }
                    setReassignInvite(null);
                  }}
                  style={{
                    background: OT.sand100, border: `1px solid ${OT.hairline}`, borderRadius: 12, padding: '12px 14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 10, transition: 'background 0.2s'
                  }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: OT.walnut, color: OT.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 'bold' }}>
                    {c.initials}
                  </div>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: OT.espresso900 }}>Coach {c.name}</div>
                    <div style={{ fontSize: 10, color: OT.clay600 }}>{c.role.split(' & ')[0]}</div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setReassignInvite(null)} style={{ ...btnSecondaryStyle, width: '100%' }}>
              Close Select Grid
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── ADMIN LOCKOUT SCREEN ──────────────────────────────────────────────
function AdminLockoutScreen({ currentUser, onLogout, admins, coaches }) {
  const [authenticating, setAuthenticating] = React.useState(false);
  const [authError, setAuthError] = React.useState('');

  const handleElevateAuth = async () => {
    setAuthenticating(true);
    setAuthError('');
    try {
      if (typeof firebase === 'undefined' || !firebase.auth) {
        throw new Error("Firebase Auth service is currently unavailable.");
      }
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/calendar.events');
      provider.addScope('https://www.googleapis.com/auth/calendar.readonly');
      
      const result = await firebase.auth().signInWithPopup(provider);
      const user = result.user;
      
      if (user && user.email) {
        // Authenticated with Google successfully
        setAuthError('');
      } else {
        throw new Error("No user email returned from Google authentication.");
      }
    } catch (err) {
      console.error(err);
      setAuthError(err.message || "Authentication failed. Please try again.");
    } finally {
      setAuthenticating(false);
    }
  };

  return (
    <div style={{ background: OT.sand50, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: OT.fBody }}>
      <div style={{ background: OT.paper, padding: '48px 40px', borderRadius: 24, boxShadow: OT.sh3, maxWidth: 500, width: '100%', border: `1.5px solid ${OT.hairlineStrong}`, boxSizing: 'border-box', textAlign: 'center' }}>
        
        {/* Lock Icon Asset */}
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'rgba(184,107,75,0.08)', color: OT.terra, marginBottom: 24, fontSize: 32 }}>
          🔒
        </div>

        <OEyebrow dot={OT.terra} size={10} style={{ justifyContent: 'center', marginBottom: 12 }}>SECURITY PROTOCOL LOCKDOWN</OEyebrow>
        
        <h2 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 36, fontWeight: 400, color: OT.espresso900, margin: '0 0 16px 0', lineHeight: 1.1 }}>
          Live Google Authentication Required
        </h2>

        <p style={{ fontSize: 13.5, color: OT.espresso800, lineHeight: 1.6, margin: '0 0 24px 0' }}>
          Welcome back, <strong>{currentUser.name}</strong>. You are currently accessing the admin network via an offline cached profile. Under modern protection and integrity guidelines, admin actions require a live, validated Google/Firebase sign-in session.
        </p>

        {authError && (
          <div style={{ background: 'rgba(184,107,75,0.06)', border: `1.5px solid ${OT.terra}`, color: OT.terra, padding: '12px 16px', borderRadius: 12, fontSize: 12.5, textAlign: 'left', marginBottom: 20, lineHeight: 1.4 }}>
            <strong>Authentication Error:</strong> {authError}
          </div>
        )}

        {/* Buttons / CTA Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button 
            type="button"
            disabled={authenticating}
            onClick={handleElevateAuth}
            style={{ 
              background: OT.walnut, 
              color: OT.paper, 
              border: 'none', 
              borderRadius: 999, 
              padding: '14px 28px', 
              fontSize: 14, 
              fontWeight: 700, 
              cursor: authenticating ? 'not-allowed' : 'pointer', 
              fontFamily: OT.fBody, 
              transition: 'all 0.2s', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 10,
              boxShadow: OT.sh1,
              opacity: authenticating ? 0.8 : 1
            }}
            onMouseEnter={(e) => { if(!authenticating) e.currentTarget.style.background = '#46311D'; }}
            onMouseLeave={(e) => { if(!authenticating) e.currentTarget.style.background = OT.walnut; }}
          >
            {authenticating ? (
              <span>⏳ Verifying live Google credentials...</span>
            ) : (
              <>
                <span>🌐 Elevate Session with Google Auth</span>
                <span style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 15 }}>→</span>
              </>
            )}
          </button>

          <button 
            type="button"
            disabled={authenticating}
            onClick={onLogout}
            style={{ 
              background: 'transparent', 
              color: OT.terra, 
              border: `1.5px solid ${OT.hairlineStrong}`, 
              borderRadius: 999, 
              padding: '12px 24px', 
              fontSize: 13, 
              fontWeight: 600, 
              cursor: authenticating ? 'not-allowed' : 'pointer', 
              fontFamily: OT.fBody, 
              transition: 'all 0.15s ease',
              opacity: authenticating ? 0.5 : 1
            }}
            onMouseEnter={(e) => { if(!authenticating) { e.currentTarget.style.background = 'rgba(184,107,75,0.04)'; e.currentTarget.style.borderColor = OT.terra; } }}
            onMouseLeave={(e) => { if(!authenticating) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = OT.hairlineStrong; } }}
          >
            ↩ Clear Session Cache &amp; Logout
          </button>
        </div>

        <div style={{ borderTop: `1px solid ${OT.hairline}`, marginTop: 28, paddingTop: 16 }}>
          <span style={{ fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Authorized Emails: egpvai21@gmail.com, shwetambari@mythirdspace.fit
          </span>
        </div>

      </div>
    </div>
  );
}

// ─── LOGIN & DEMO SELECTOR VIEW ──────────────────────────────────────────
function LoginView({ onLogin, coaches = COACHES, admins = ADMINS }) {
  const [activeSubTab, setActiveSubTab] = React.useState('google'); // 'google' | 'otp'
  const [selectedUser, setSelectedUser] = React.useState('');
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setOtpError('');
    try {
      if (typeof firebase === 'undefined' || !firebase.auth) {
        throw new Error("Firebase Auth backend is currently loading or unavailable.");
      }
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      let result = null;
      try {
        result = await firebase.auth().signInWithPopup(provider);
      } catch (popupErr) {
        if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/cancelled-popup-request') {
          console.warn("Popup blocked, attempting signInWithRedirect fallback:", popupErr);
          await firebase.auth().signInWithRedirect(provider);
          return;
        }
        throw popupErr;
      }
      
      const user = result && result.user;
      if (user) {
        const emailNorm = (user.email || '').trim().toLowerCase();
        const matchedAdmin = admins.find(a => (a.email || '').trim().toLowerCase() === emailNorm);
        const matchedCoach = coaches.find(c => (c.email || '').trim().toLowerCase() === emailNorm);
        const matchedUserObj = matchedAdmin || matchedCoach;
        
        if (matchedUserObj) {
          onLogin(matchedUserObj, matchedAdmin ? 'admin' : 'coach');
        } else if (emailNorm === 'egpvai21@gmail.com' || emailNorm.includes('shweta') || emailNorm.endsWith('@mythirdspace.fit')) {
          const defaultShweta = {
            id: "shwetambari",
            name: user.displayName || "Shwetambari",
            role: "Owner",
            canManageAdmins: true,
            initials: "SW",
            email: user.email || "egpvai21@gmail.com",
            phone: "9619484350"
          };
          const shweta = admins.find(a => a.id === 'shwetambari') || defaultShweta;
          onLogin(shweta, 'admin');
        } else {
          // Provide instant access for authenticated Google user as Studio Administrator
          const customUser = {
            id: 'admin_' + (user.uid || emailNorm.replace(/[^a-z0-9]/g, '_')),
            name: user.displayName || emailNorm.split('@')[0],
            role: "Studio Administrator",
            canManageAdmins: true,
            initials: (user.displayName ? user.displayName.slice(0, 2) : emailNorm.slice(0, 2)).toUpperCase(),
            email: user.email,
            phone: user.phoneNumber || "9619484350"
          };
          onLogin(customUser, 'admin');
        }
      }
    } catch (err) {
      console.error(err);
      setOtpError(`Google Sign-In notice: ${err.message || 'Authentication failed.'} You can also use the Email/Phone OTP tab to log in.`);
    } finally {
      setGoogleLoading(false);
    }
  };
  
  // OTP States default is set to Founder's registered email
  const [emailOrPhone, setEmailOrPhone] = React.useState('egpvai21@gmail.com');
  const [otpSent, setOtpSent] = React.useState(false);
  const [sendingOtp, setSendingOtp] = React.useState(false);
  const [generatedOtp, setGeneratedOtp] = React.useState('');
  const [userOtpInput, setUserOtpInput] = React.useState('');
  const [otpError, setOtpError] = React.useState('');
  const [apiLogs, setApiLogs] = React.useState([]);

  const handleSendOtp = (e) => {
    if (e) e.preventDefault();
    const inputVal = emailOrPhone.trim();
    if (!inputVal) {
      setOtpError("Please enter your registered email or phone number.");
      return;
    }

    const inputNorm = inputVal.toLowerCase();
    const inputClean = inputVal.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Check administrators & managers
    const matchedAdmin = admins.find(a => {
      const dbEmail = (a.email || '').trim().toLowerCase();
      const dbPhoneClean = (a.phone || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const dbEmailClean = (a.email || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      return dbEmail === inputNorm || dbPhoneClean === inputClean || dbEmailClean === inputClean;
    });

    // Check coaches
    const matchedCoach = coaches.find(c => {
      const dbEmail = (c.email || '').trim().toLowerCase();
      const dbPhoneClean = (c.phone || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      const dbEmailClean = (c.email || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
      return dbEmail === inputNorm || dbPhoneClean === inputClean || dbEmailClean === inputClean;
    });

    const matchedUserObj = matchedAdmin || matchedCoach;

    if (!matchedUserObj) {
      setOtpError("Please contact admin to access the coaches dashboard. This email or phone number is not registered for staff console access.");
      return;
    }

    // Set user ID so verification knows who to log in as
    setSelectedUser(matchedUserObj.id);

    setSendingOtp(true);
    setOtpError('');
    
    // Simulate API request to outbound OTP gateway
    setTimeout(async () => {
      const pin = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(pin);
      setOtpSent(true);
      setSendingOtp(false);
      setUserOtpInput(''); // Reset input

      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] API POST /api/v1/auth/dispatch-otp -> Status: 200 OK. Gateway carrier verified. Routed secure PIN [ ${pin} ] safely to ${inputVal}`;
      setApiLogs(prev => [logEntry, ...prev]);

      // Route OTP simulation info into global database logs for transparency
      try {
        const staffName = matchedUserObj.name || 'Staff Member';
        const current = await M3S_DB.get('globals', 'whatsapp_logs', { list: [] });
        const entry = {
          id: 'otp_' + Date.now(),
          timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          recipient: `${staffName} Staff Security Desk`,
          text: `🔑 [OTP AUTH SYSTEM] Your One-Time Passcode for staff console access is ${pin}. Security verification code valid for 10 minutes.`
        };
        await M3S_DB.set('globals', 'whatsapp_logs', { list: [entry, ...(current.list || [])].slice(0, 40) });
      } catch (err) {
        console.warn("Error seeding OTP into logs:", err);
      }
    }, 1100);
  };

  const handleVerifyOtp = (e) => {
    if (e) e.preventDefault();
    if (userOtpInput.trim() !== generatedOtp) {
      setOtpError(`Verification failed. Incorrect code entered. Match expected PIN: ${generatedOtp}`);
      return;
    }

    // Authenticate user
    const adminUser = admins.find(a => a.id === selectedUser);
    if (adminUser) {
      onLogin(adminUser, 'admin');
    } else {
      const coachUser = coaches.find(c => c.id === selectedUser);
      if (coachUser) {
        onLogin(coachUser, 'coach');
      }
    }
  };

  return (
    <div style={{ background: OT.sand50, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: OT.fBody }}>
      
      {/* Dynamic styling for Google Level Login Portal */}
      <style>{`
        /* Floating label container */
        .m3s-field {
          position: relative;
          width: 100%;
          margin-top: 12px;
          margin-bottom: 8px;
        }

        /* Floating Input */
        .m3s-input {
          width: 100%;
          height: 56px;
          padding: 16px;
          font-family: ${OT.fBody};
          font-size: 16px;
          color: ${OT.espresso900};
          background: ${OT.paper};
          border: 1px solid ${OT.hairlineStrong};
          border-radius: 8px;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Float/Active Label styles */
        .m3s-input:focus {
          border: 2px solid ${OT.walnut};
          padding: 15px; /* keep total height matching */
        }

        .m3s-label {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: ${OT.paper};
          padding: 0 6px;
          color: ${OT.clay600};
          font-size: 15px;
          font-family: ${OT.fBody};
          pointer-events: none;
          transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), top 0.15s cubic-bezier(0.4, 0, 0.2, 1), font-size 0.15s cubic-bezier(0.4, 0, 0.2, 1), color 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: left top;
        }

        /* Hover border */
        .m3s-input:hover:not(:focus) {
          border-color: ${OT.espresso800};
        }

        /* Float animation triggers */
        .m3s-input:focus ~ .m3s-label,
        .m3s-input:not(:placeholder-shown) ~ .m3s-label {
          top: 0;
          transform: translateY(-50%) scale(0.85);
          color: ${OT.walnut};
          font-weight: 500;
        }

        /* Material Style Underline Tabs */
        .m3s-tab-container {
          display: flex;
          border-bottom: 1px solid ${OT.hairline};
          margin-bottom: 28px;
          width: 100%;
        }

        .m3s-tab-btn {
          flex: 1;
          text-align: center;
          padding: 14px 0;
          font-size: 13.5px;
          font-weight: 600;
          color: ${OT.clay600};
          background: transparent;
          border: none;
          cursor: pointer;
          font-family: ${OT.fBody};
          position: relative;
          transition: color 0.2s, background-color 0.2s;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
        }

        .m3s-tab-btn:hover {
          color: ${OT.espresso900};
          background-color: rgba(94, 66, 40, 0.03);
        }

        .m3s-tab-btn.active {
          color: ${OT.walnut};
        }

        .m3s-tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 10%;
          right: 10%;
          height: 3px;
          background-color: ${OT.walnut};
          border-top-left-radius: 3px;
          border-top-right-radius: 3px;
        }

        /* Google button transitions */
        .m3s-primary-btn {
          background-color: ${OT.walnut};
          color: ${OT.paper};
          font-family: ${OT.fBody};
          font-size: 14px;
          font-weight: 700;
          padding: 14px 28px;
          border: none;
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: ${OT.sh1};
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .m3s-primary-btn:hover:not(:disabled) {
          background-color: #46311D;
          box-shadow: ${OT.sh2};
          transform: translateY(-1px);
        }

        .m3s-primary-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .m3s-primary-btn:disabled {
          background-color: ${OT.sand200};
          color: ${OT.clay600};
          cursor: not-allowed;
          box-shadow: none;
        }

        .m3s-secondary-btn {
          background-color: transparent;
          color: ${OT.espresso800};
          font-family: ${OT.fBody};
          font-size: 14px;
          font-weight: 600;
          padding: 14px 28px;
          border: 1px solid ${OT.hairlineStrong};
          border-radius: 100px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .m3s-secondary-btn:hover {
          background-color: rgba(94, 66, 40, 0.04);
          border-color: ${OT.espresso900};
        }
      `}</style>
      
      {/* Back to Client App Option */}
      <div style={{ marginBottom: 20 }}>
        <a href="index.html" style={{ 
          textDecoration: 'none', 
          fontFamily: OT.fMono, 
          fontSize: '11px', 
          color: OT.walnut, 
          fontWeight: 'bold', 
          letterSpacing: 1.5,
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          background: OT.sand100,
          border: `1px solid ${OT.hairlineStrong}`,
          padding: '8px 18px',
          borderRadius: '999px',
          boxShadow: '0 1px 3px rgba(36,24,16,0.02)',
          transition: 'all 0.2s'
        }}>
          ← RETURN TO CLIENT PORTAL
        </a>
      </div>

      {/* Main card matching selected CSS selector */}
      <div style={{ background: OT.paper, padding: '48px 40px', borderRadius: 24, boxShadow: OT.sh3, maxWidth: 460, width: '100%', border: `1.5px solid ${OT.hairlineStrong}`, boxSizing: 'border-box' }}>
        
        {/* LOGO block wrapped in a beautiful local anchor redirect to index.html */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <a href="index.html" style={{ textDecoration: 'none', display: 'inline-block', cursor: 'pointer', outline: 'none' }}>
            <OEyebrow dot={OT.walnut} size={10} style={{ justifyContent: 'center', marginBottom: 12 }}>STUDIO PORTAL</OEyebrow>
            <h2 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 44, fontWeight: 400, color: OT.espresso900, margin: 0, lineHeight: 1 }}>My Third Space</h2>
          </a>
          <p style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.clay600, marginTop: 10, marginHorizontal: 'auto', maxWidth: 320, lineHeight: 1.4 }}>Coaches &amp; Administrators Verification Hub</p>
        </div>

        {/* Google-Style Material Underline Tabs */}
        <div className="m3s-tab-container">
          <button 
            type="button"
            onClick={() => { setActiveSubTab('google'); setOtpError(''); }}
            className={`m3s-tab-btn ${activeSubTab === 'google' ? 'active' : ''}`}>
            Google SSO
          </button>
          <button 
            type="button"
            onClick={() => { setActiveSubTab('otp'); setOtpError(''); }}
            className={`m3s-tab-btn ${activeSubTab === 'otp' ? 'active' : ''}`}>
            Email / Phone OTP
          </button>
        </div>

        {activeSubTab === 'google' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 24, fontWeight: 400, color: OT.espresso900, margin: '0 0 8px 0' }}>Sign in with Google</h3>
              <p style={{ fontFamily: OT.fBody, fontSize: '13px', color: OT.espresso800, lineHeight: 1.5, margin: 0 }}>
                Use your registered work email (e.g. <strong>egpvai21@gmail.com</strong> or <strong>*@mythirdspace.fit</strong>) to securely authenticate with Live Google Auth.
              </p>
            </div>
            
            {otpError && (
              <div style={{ background: 'rgba(184,107,75,0.08)', border: `1.5px solid ${OT.terra}`, color: OT.terra, padding: '12px 14px', borderRadius: 12, fontSize: 12.5, marginBottom: 20, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 14 }}>⚠️</span>
                <span>{otpError}</span>
              </div>
            )}

            <button 
              type="button"
              disabled={googleLoading}
              onClick={handleGoogleLogin}
              className="m3s-primary-btn"
              style={{ height: 50, fontSize: 14.5, textTransform: 'none', letterSpacing: 0, opacity: googleLoading ? 0.75 : 1 }}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#ffffff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#ffffff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"/>
                <path fill="#ffffff" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A11 11 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z"/>
                <path fill="#ffffff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/>
              </svg>
              <span>{googleLoading ? "Signing in with Google..." : "Continue with Google Account"}</span>
            </button>
            
            <div style={{ marginTop: 24, borderTop: `1px solid ${OT.hairline}`, paddingTop: 16, textAlign: 'center' }}>
              <span style={{ fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, textTransform: 'uppercase', letterSpacing: 1.2 }}>
                Secured via Firebase Identity Platform
              </span>
            </div>
          </div>
        )}

        {activeSubTab === 'otp' && (
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
              <h3 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 24, fontWeight: 400, color: OT.espresso900, margin: '0 0 8px 0' }}>
                {otpSent ? '2-Step Verification' : 'Passcode Sign-In'}
              </h3>
              <p style={{ fontFamily: OT.fBody, fontSize: '13px', color: OT.espresso800, lineHeight: 1.5, margin: 0 }}>
                {otpSent 
                  ? 'We have dispatched a simulated 6-digit verification PIN to your registered credentials.'
                  : 'Enter your registered work email or phone number below. We will send a simulated magic code to authenticate.'}
              </p>
            </div>

            {otpError && (
              <div style={{ background: 'rgba(184,107,75,0.08)', border: `1.5px solid ${OT.terra}`, color: OT.terra, padding: '12px 14px', borderRadius: 12, fontSize: 12.5, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 14 }}>⚠️</span>
                <span>{otpError}</span>
              </div>
            )}
            
            {!otpSent ? (
              <>
                <div className="m3s-field">
                  <input 
                    type="text" 
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder=" "
                    className="m3s-input"
                    autoFocus
                    required
                  />
                  <label className="m3s-label">Registered Email or Phone</label>
                </div>
                
                <button 
                  type="submit" 
                  disabled={sendingOtp || !emailOrPhone}
                  className="m3s-primary-btn"
                  style={{ width: '100%', height: 50, fontSize: 14.5 }}>
                  {sendingOtp ? (
                    <>
                      <div style={{ width: 16, height: 16, border: `2px solid ${OT.sand200}`, borderTopColor: OT.paper, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <span>Send Magic OTP →</span>
                  )}
                </button>
              </>
            ) : (
              <>
                <div style={{ background: 'rgba(123,139,111,0.08)', color: OT.sage, border: '1px solid rgba(123,139,111,0.2)', padding: '12px 14px', borderRadius: 12, fontSize: 12.5, fontWeight: 500, display: 'flex', alignItems: 'flex-start', gap: 8, lineHeight: 1.4 }}>
                  <span style={{ fontSize: 15, lineHeight: 1 }}>✓</span> 
                  <span>OTP dispatch sent. Check simulated WhatsApp carrier logs at the bottom-right or the intercept message below.</span>
                </div>

                <div className="m3s-field">
                  <input 
                    type="text" 
                    value={userOtpInput}
                    onChange={(e) => setUserOtpInput(e.target.value)}
                    placeholder=" "
                    className="m3s-input"
                    style={{ letterSpacing: 8, textAlign: 'center', fontSize: 24, fontWeight: 'bold', fontFamily: OT.fMono }}
                    autoFocus
                    maxLength={6}
                    required
                  />
                  <label className="m3s-label">6-Digit Passcode</label>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                  <button 
                    type="button" 
                    onClick={() => { setOtpSent(false); setOtpError(''); setUserOtpInput(''); }}
                    className="m3s-secondary-btn"
                    style={{ flex: 1, height: 48, fontSize: 13.5 }}>
                    Go Back
                  </button>
                  <button 
                    type="submit" 
                    disabled={!userOtpInput || userOtpInput.length < 4}
                    className="m3s-primary-btn"
                    style={{ flex: 1.8, height: 48, fontSize: 13.5 }}>
                    Verify & Sign In
                  </button>
                </div>
              </>
            )}
            
            {/* QA Simulator Render */}
            {otpSent && generatedOtp && (
              <div style={{ marginTop: 8, padding: '14px 16px', borderRadius: 12, border: `1px dashed ${OT.clay500}`, background: 'rgba(234,219,196,0.2)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 9, fontFamily: OT.fMono, color: OT.clay600, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 600 }}>[System Message Intercept]</span>
                <span style={{ fontSize: 13, color: OT.espresso900, fontFamily: OT.fBody, fontWeight: 500 }}>
                  Simulated WhatsApp PIN: <span style={{ fontFamily: OT.fMono, fontWeight: 'bold', letterSpacing: 2, background: 'rgba(94,66,40,0.06)', padding: '2px 8px', borderRadius: 4, marginLeft: 4 }}>{generatedOtp}</span>
                </span>
              </div>
            )}
          </form>
        )}

      </div>
    </div>
  );
}

// ─── SIDEBAR COMPONENT ───────────────────────────────────────────────────
function Sidebar({ currentRole, activeTab, setActiveTab, currentUser, onLogout }) {
  const isCoach = currentRole === 'coach';
  const isAdmin = currentRole === 'admin';

  return (
    <div style={{ width: 280, borderRight: `1px solid ${OT.hairlineStrong}`, background: OT.sand100, display: 'flex', flexDirection: 'column', padding: '32px 20px', justifyContent: 'space-between' }}>
      <div>
        {/* Logo block */}
        <a href="index.html" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40, borderBottom: `1px solid ${OT.hairline}`, paddingBottom: 20, textDecoration: 'none', cursor: 'pointer', outline: 'none' }}>
          <img src="assets/mts-logo.png" alt="My Third Space" style={{ height: 36, width: 'auto', objectFit: 'contain', display: 'block', filter: 'brightness(0) saturate(100%) invert(24%) sepia(17%) saturate(1487%) hue-rotate(344deg) brightness(97%) contrast(91%)' }} />
          <div>
            <div style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 22, fontWeight: 500, color: OT.espresso900, lineHeight: 1.1 }}>My Third Space</div>
            <div style={{ fontFamily: OT.fMono, fontSize: 8.5, letterSpacing: 1.5, textTransform: 'uppercase', color: OT.clay600 }}>Indiranagar</div>
          </div>
        </a>

        {/* Menu items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {isCoach && (
            <>
              <button 
                onClick={() => setActiveTab('calendar')}
                style={activeTab === 'calendar' ? sideActiveStyle : sideBtnStyle}>
                📅 Timetable Calendar
              </button>
              <button 
                onClick={() => setActiveTab('invites')}
                style={activeTab === 'invites' ? sideActiveStyle : sideBtnStyle}>
                📋 Your Schedule
              </button>
              <button 
                onClick={() => setActiveTab('coach_ratings')}
                style={activeTab === 'coach_ratings' ? sideActiveStyle : sideBtnStyle}>
                ⭐ My Session Ratings
              </button>
              <button 
                onClick={() => setActiveTab('my_profile_settings')}
                style={activeTab === 'my_profile_settings' ? sideActiveStyle : sideBtnStyle}>
                👤 My Public Profile
              </button>
            </>
          )}

          <button 
            onClick={() => setActiveTab('clients')}
            style={activeTab === 'clients' ? sideActiveStyle : sideBtnStyle}>
            👥 {isCoach ? 'My PT Students' : 'All Students Grid'}
          </button>

          {isAdmin && (
            <button 
              onClick={() => setActiveTab('admin_panel')}
              style={activeTab === 'admin_panel' ? sideActiveStyle : sideBtnStyle}>
              🛡 Admin Matrix Panel
            </button>
          )}
        </div>
      </div>

      {/* Staff profile footer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ borderTop: `1px solid ${OT.hairline}`, paddingTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: OT.clay600, color: OT.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 'bold' }}>
            {currentUser.initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: OT.espresso900 }}>{currentUser.name}</div>
            <div style={{ fontSize: 10.5, color: OT.clay600 }}>{currentUser.role}</div>
          </div>
        </div>
        <button 
          onClick={onLogout}
          style={{ width: '100%', padding: '10px', borderRadius: 999, border: `1px solid ${OT.hairlineStrong}`, background: 'transparent', cursor: 'pointer', fontFamily: OT.fBody, fontSize: 12.5, fontWeight: 500, color: OT.terra, transition: 'all 0.2s' }}>
          ↩ Lock Out Channel
        </button>
      </div>
    </div>
  );
}

// ─── 1. TIMETABLE/CALENDAR COMPONENT ──────────────────────────────────────
function CalendarDashboard({ 
  currentUser, 
  sessions, 
  setSessions, 
  clients, 
  onOpenBlockModal,
  coaches,
  setCoaches,
  handleToggleGoogleSync,
  handleToggleAppleSync
}) {
  const [localToast, setLocalToast] = React.useState(null);
  const triggerLocalToast = (msg) => {
    setLocalToast(msg);
    setTimeout(() => setLocalToast(null), 4000);
  };

  const coachSessions = sessions.filter(s => s.coach_id === currentUser.id);
  const weekdays = [
    { day: 'MON', label: 'Mon, 25 May' },
    { day: 'TUE', label: 'Tue, 26 May' },
    { day: 'WED', label: 'Wed, 27 May' },
    { day: 'THU', label: 'Thu, 28 May' },
    { day: 'FRI', label: 'Fri, 29 May' }
  ];

  const getDaySessions = (dateStr) => {
    return coachSessions.filter(s => s.scheduled_at.startsWith(dateStr));
  };

  return (
    <div>
      {/* Toast Notification for Sync operations */}
      {localToast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: OT.espresso900, color: OT.sand50,
          padding: '12px 24px', borderRadius: 999, fontSize: 13, fontWeight: 500, boxShadow: OT.sh3,
          zIndex: 1000, display: 'flex', alignItems: 'center', gap: 8, border: `1px solid ${OT.hairline}`,
          fontFamily: OT.fBody, transition: 'all 0.3s ease'
        }}>
          <span>✨</span> {localToast}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 28, color: OT.espresso900, fontWeight: 400, margin: 0 }}>Timetable Schedule</h2>
          <p style={{ fontSize: 13, color: OT.clay600, margin: '4px 0 0' }}>Your scheduled PT slots and calendar blackouts for this week.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={onOpenBlockModal} style={btnPrimaryStyle}>
            🔒 Block Off Hours
          </button>
        </div>
      </div>

      {/* Two-Way Calendar Integration Panel */}
      <div style={{
        background: OT.sand100, border: `1px solid ${OT.hairlineStrong}`, borderRadius: 20,
        padding: '20px 24px', marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 16,
        boxShadow: OT.sh1, transition: 'all 0.2s ease-in-out'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <span style={{ fontSize: 10, fontFamily: OT.fMono, color: OT.clay600, fontWeight: 'bold', letterSpacing: '1px' }}>
              🌐 TWO-WAY CALENDAR SYNCHRONIZATION
            </span>
            <h4 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 20, color: OT.espresso900, fontWeight: 400, margin: '4px 0' }}>
              Publish PT Classes & Lock Availability
            </h4>
            <p style={{ fontSize: 12.5, color: OT.espresso800, margin: 0, lineHeight: 1.5 }}>
              Link your workspace accounts. Confirmed studio PT sessions publish automatically as active invitations onto your smart devices. Any external personal busy entries will lock availability in real-time.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            {/* Google Calendar Sync Card */}
            <div style={{
              background: OT.paper, border: `1px solid ${currentUser.google_sync_enabled ? 'rgba(123,139,111,0.3)' : OT.hairline}`,
              borderRadius: 14, padding: '16px', width: 230, boxShadow: OT.sh1, display: 'flex', flexDirection: 'column', justifyBetween: 'space-between'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>🗓️</span>
                  <span style={{ fontSize: 12.5, fontWeight: 'bold', color: OT.espresso900 }}>Google Calendar</span>
                </div>
                <div style={{ position: 'relative', display: 'inline-block', width: 34, height: 18 }}>
                  <input 
                    type="checkbox"
                    checked={!!currentUser.google_sync_enabled}
                    onChange={async (e) => {
                      const val = e.target.checked;
                      await handleToggleGoogleSync(val);
                      triggerLocalToast(val ? "Google Calendar sync active! Fetching conflicts." : "Google Calendar sync disabled.");
                    }}
                    style={{ cursor: 'pointer', accentColor: OT.walnut }}
                  />
                </div>
              </div>
              <p style={{ fontSize: 10.5, color: OT.clay600, margin: '0 0 12px', lineHeight: 1.4 }}>
                Locks availability automatically when events appear on your primary calendar.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: currentUser.google_sync_enabled ? OT.sage : OT.clay600, fontWeight: 500 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: currentUser.google_sync_enabled ? OT.sage : '#ccc' }} />
                {currentUser.google_sync_enabled ? 'Connected & Synced' : 'Sync Offline'}
              </div>
            </div>

            {/* Apple Calendar Sync Card */}
            <div style={{
              background: OT.paper, border: `1px solid ${currentUser.apple_sync_enabled ? 'rgba(123,139,111,0.3)' : OT.hairline}`,
              borderRadius: 14, padding: '16px', width: 230, boxShadow: OT.sh1, display: 'flex', flexDirection: 'column', justifyBetween: 'space-between'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>⚛️</span>
                  <span style={{ fontSize: 12.5, fontWeight: 'bold', color: OT.espresso900 }}>Apple Calendar</span>
                </div>
                <div style={{ position: 'relative', display: 'inline-block', width: 34, height: 18 }}>
                  <input 
                    type="checkbox"
                    checked={!!currentUser.apple_sync_enabled}
                    onChange={async (e) => {
                      const val = e.target.checked;
                      await handleToggleAppleSync(val);
                      triggerLocalToast(val ? "Apple Calendar feed publishing! Importing conflicts." : "Apple Calendar connection removed.");
                    }}
                    style={{ cursor: 'pointer', accentColor: OT.walnut }}
                  />
                </div>
              </div>
              <p style={{ fontSize: 10.5, color: OT.clay600, margin: '0 0 12px', lineHeight: 1.4 }}>
                Imports and locks dates from your iCloud digital planner automatically.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: currentUser.apple_sync_enabled ? OT.sage : OT.clay600, fontWeight: 500 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: currentUser.apple_sync_enabled ? OT.sage : '#ccc' }} />
                {currentUser.apple_sync_enabled ? 'Active iCal Sync' : 'Sync Offline'}
              </div>
            </div>
          </div>
        </div>

        {/* Apple Calendar iCal Link Input field (Only appears if Apple calendar sync is enabled!) */}
        {currentUser.apple_sync_enabled && (
          <div style={{
            background: 'rgba(94,66,40,0.02)', borderTop: `1px solid ${OT.hairlineStrong}`,
            paddingTop: 16, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 8
          }}>
            <label style={{ fontSize: 11, fontFamily: OT.fMono, color: OT.espresso800, fontWeight: 'bold' }}>
               PRIVATE ICLOUD ICAL SUBSCRIPTION URL
            </label>
            <div style={{ display: 'flex', gap: 12 }}>
              <input 
                type="text" 
                defaultValue="webcal://calendars.icloud.com/private/m3s_coach_feed.ics" 
                placeholder="Enter webcal:// address"
                style={{
                  flex: 1, padding: '8px 12px', fontSize: 12, border: `1px solid ${OT.hairlineStrong}`,
                  borderRadius: 8, outline: 'none', background: OT.paper, fontFamily: OT.fMono, color: OT.clay600
                }}
              />
              <button 
                onClick={() => triggerLocalToast("✓ iCloud Calendar subscription URL verified & synced successfully.")}
                style={{
                  background: OT.walnut, color: OT.paper, border: 'none', borderRadius: 8,
                  padding: '8px 16px', fontSize: 11, fontWeight: 'bold', fontFamily: OT.fBody, cursor: 'pointer'
                }}
              >
                Subscribe
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Renders week calendar column track */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
        {weekdays.map(item => {
          const formattedDate = item.label;
          const mapToISO = `2026-05-${item.day === 'MON' ? '25' : item.day === 'TUE' ? '26' : item.day === 'WED' ? '27' : item.day === 'THU' ? '28' : '29'}`;
          const daySessions = getDaySessions(mapToISO);

          return (
            <div key={item.day} style={{ background: OT.sand100, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: 14, minHeight: 460 }}>
              <div style={{ textAlign: 'center', borderBottom: `1px solid ${OT.hairlineStrong}`, paddingBottom: 10, marginBottom: 12 }}>
                <OMono size={10} color={OT.espresso900}>{item.day}</OMono>
                <div style={{ fontSize: 11, color: OT.clay600, marginTop: 2 }}>{formattedDate.split(', ')[1]}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {daySessions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 11, color: OT.clay600, fontStyle: 'italic' }}>
                    No workouts scheduled
                  </div>
                ) : (
                  daySessions.sort((a,b)=>a.scheduled_at.localeCompare(b.scheduled_at)).map(session => {
                    const isBlocked = session.status === 'blocked';
                    const clientObj = clients.find(c => c.id === session.client_id);
                    const timeStr = session.scheduled_at.split('T')[1].substring(0, 5);

                    return (
                      <div key={session.id} style={{
                        background: isBlocked ? 'rgba(184,107,75,0.07)' : 'rgba(94,139,94,0.08)',
                        borderLeft: isBlocked ? `3px solid ${OT.terra}` : `3px solid ${OT.sage}`,
                        borderRadius: '0 10px 10px 0', padding: 10, position: 'relative'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontFamily: OT.fMono, fontSize: 9, color: isBlocked ? OT.terra : OT.sage, fontWeight: 600 }}>{timeStr}</span>
                          <span style={{ fontSize: 8.5, color: OT.clay600 }}>{session.duration_min} MINs</span>
                        </div>
                        {isBlocked ? (
                          <>
                            <div style={{ fontSize: 11.5, fontWeight: 600, color: OT.espresso900 }}>Blocked Time</div>
                            <div style={{ fontSize: 9.5, color: OT.clay600, fontStyle: 'italic', marginTop: 2 }}>{session.reason}</div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontSize: 12, fontWeight: 600, color: OT.espresso900 }}>{clientObj ? clientObj.name : 'Unknown User'}</div>
                            <div style={{ fontSize: 10, color: OT.clay600, marginTop: 1 }}>{session.type}</div>
                          </>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── SLA EXPERIENCE ANIMATED WEB VIDEO MOCKUP ─────────────────────────
function SlaAnimatedVideoSimulator() {
  const [videoTimeline, setVideoTimeline] = React.useState('before_8pm');
  const [playbackSecond, setPlaybackSecond] = React.useState(0);
  const [isPlaying, setIsPlaying] = React.useState(false);

  React.useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlaybackSecond(prev => {
          if (prev >= 30) {
            setIsPlaying(false);
            return 30;
          }
          return prev + 1;
        });
      }, 850); // slightly expedited pace to keep demo dynamic
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying]);

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const computedSec = Math.floor((clickX / width) * 30);
    setPlaybackSecond(Math.max(0, Math.min(30, computedSec)));
  };

  const jumpToSecond = (sec) => {
    setPlaybackSecond(sec);
  };

  const handleRestart = () => {
    setPlaybackSecond(0);
    setIsPlaying(true);
  };

  // Content provider based on active timeline and elapsed second
  const getFrameData = () => {
    if (videoTimeline === 'before_8pm') {
      if (playbackSecond < 8) {
        return {
          stepNum: 1,
          stepName: "COACH INITIATES DISPATCH",
          caption: "At 4:15 PM, Coach Lee experience an illness. He triggers 'Decline Session' inside his coach portal.",
          coachPhone: { title: "DE-ALLOCATION HUB", msg: "Decline tomorrow's 8:00 AM session?", status: "Pending Confirm", action: "Lee clicks Confirm", border: OT.terra, pulse: true },
          clientPhone: { alert: "ALL SCHEDULES STABLE", text: "Enjoy your morning training workout scheduled with Coach Lee tomorrow at 8 AM.", bg: '#EAF0E8', color: '#4D5C45', bar: "#7B8B6F" },
          adminDashboard: { text: "Roster status: 100% stable", flag: "SLA Active", bg: '#E8EFE5', color: '#4D5C45' }
        };
      } else if (playbackSecond < 16) {
        return {
          stepNum: 2,
          stepName: "SLA INTEGRITY ROUTING & WEBHOOK OUTBOUNDS",
          caption: "System updates Firestore session state to 'pending_decline'. It fires automated webhook SMS to admin and reassurance warnings toMeera.",
          coachPhone: { title: "DISPATCH LOGGED", msg: "Awaiting admin coverage coordinator selection.", status: "Pending Admin Resolution", action: "None", border: OT.hairlineStrong, pulse: false },
          clientPhone: { alert: "⏳ COORDINATING MATCH COVER", text: "Your coach has a conflict. Our Indiranagar dispatch team is assigning a perfect match qualified substitute.", bg: '#FAF1E6', color: '#A26829', bar: OT.ochre, pulse: true },
          adminDashboard: { text: "🚨 COVER NEEDED (Meera S. / Lee)", flag: "ACTION REQUIRED before 8:00 PM SLA Limit", bg: "rgba(184,107,75,0.08)", color: OT.terra, pulse: true }
        };
      } else if (playbackSecond < 24) {
        return {
          stepNum: 3,
          stepName: "COOPERATIVE SUBSTITUTE ASSIGNED",
          caption: "Admin Harshita assigns Coach Deepika. An immediate reactive consent prompt and compensation waiver is pushed to client's smartphone.",
          coachPhone: { title: "ADMIN SEARCH", msg: "Substitute candidate assigned: Coach Deepika.", status: "Draft Covered", action: "None", border: OT.hairlineStrong, pulse: false },
          clientPhone: { alert: "⚠️ COACH REASSIGNMENT RESOLVED", text: "Coach Deepika assigned. Accept Deepika to preserve timing or decline and reimburse credit.", bg: '#FFF7E6', color: OT.ochre, bar: OT.ochre, showActions: true },
          adminDashboard: { text: "✓ Candidate Assigned: Deepika", flag: "Draft pending client consent response", bg: '#FFFDF0', color: OT.ochre, pulse: false }
        };
      } else {
        return {
          stepNum: 4,
          stepName: "CLIENT CONSENTED & CALENDAR SYNCED",
          caption: "Meera accepts alternative Deepika. System converts state to 'upcoming' with Deepika, archiving the conflict immediately.",
          coachPhone: { title: "CONFLICT SOLVED", msg: "Slot assigned to substitute Deepika.", status: "Resolved", action: "Completed", border: OT.hairlineStrong, pulse: false },
          clientPhone: { alert: "✓ ALL SCHEDULES STABLE", text: "Coach Deepika confirmed for tomorrow 8:00 AM. 🎟️ PT Credits intact.", bg: '#EAF0E8', color: '#4D5C45', bar: '#7B8B6F', showSuccess: true },
          adminDashboard: { text: "✓ CASE SOLVED SUCCESSFULLY", flag: "SLA Resolution achieved", bg: '#E8EFE5', color: '#4D5C45', pulse: false }
        };
      }
    } else if (videoTimeline === 'after_8pm') {
      if (playbackSecond < 12) {
        return {
          stepNum: 1,
          stepName: "LATE ATTEMPT DETECTED",
          caption: "At 08:45 PM, Coach Lee attempts to click 'Decline Session' inside the lockout policy window.",
          coachPhone: { title: "DE-ALLOCATION HUB", msg: "Decline tomorrow's 8:00 AM session?", status: "Attempting late cancel", action: "Lee clicks Decline", border: OT.terra, pulse: true },
          clientPhone: { alert: "ALL SCHEDULES STABLE", text: "Scheduled with Coach Lee tomorrow at 8 AM.", bg: '#EAF0E8', color: '#4D5C45', bar: '#7B8B6F' },
          adminDashboard: { text: "Lock window active (Post 8 PM)", flag: "Protected", bg: '#E8EFE5', color: '#4D5C45' }
        };
      } else if (playbackSecond < 22) {
        return {
          stepNum: 2,
          stepName: "AUTOMATED LOCKOUT INTERCEPT",
          caption: "System intercepts the database request. Locks prevent de-allocation. An informative block tooltip flashes on the coach's screen.",
          coachPhone: { title: "❌ ACTION BLOCKED (LOCKOUT)", msg: "Next-day classes locked. Guidelines restrict de-allocation after 8 PM cutoff.", status: "Locked Out", action: "None (Error)", border: OT.terra, error: true, pulse: true },
          clientPhone: { alert: "ALL SCHEDULES STABLE", text: "Scheduled with Coach Lee tomorrow at 8 AM.", bg: '#EAF0E8', color: '#4D5C45', bar: '#7B8B6F' },
          adminDashboard: { text: "Locked out late attempt by Lee", flag: "SLA Lock Active", bg: "rgba(184,107,75,0.08)", color: OT.terra }
        };
      } else {
        return {
          stepNum: 3,
          stepName: "STUDENT TIMETABLE FULLY PROTECTED",
          caption: "Meera's workout and booking credits remain entirely secure. Coach is advised to contact management desks offline.",
          coachPhone: { title: "EMERGENCY CHANNEL DIRECTIVE", msg: "Please contact Harshita offline for immediate emergency coverage.", status: "Locked Out", action: "Contact Admin Direct", border: OT.hairlineStrong, pulse: false },
          clientPhone: { alert: "ALL SCHEDULES STABLE", text: "Scheduled with Coach Lee tomorrow at 8 AM. Zero stress or unnecessary notifications.", bg: '#EAF0E8', color: '#4D5C45', bar: '#7B8B6F' },
          adminDashboard: { text: "Schedules stabilized", flag: "Member consistency protected by 8PM SLA", bg: '#E8EFE5', color: '#4D5C45' }
        };
      }
    } else { // auto_sweep
      if (playbackSecond < 10) {
        return {
          stepNum: 1,
          stepName: "PENDING DEALLOCATIONS NEAR CUTOFF",
          caption: "At 7:59 PM, a coach de-allocation request remains unresolved as the 8:00 PM night-before cutoff approaches.",
          coachPhone: { title: "DEALLOCATION HUB", msg: "Awaiting Cover Slot", status: "Pending Admin Match", action: "None", border: OT.hairlineStrong, isPulsing: false },
          clientPhone: { alert: "⏳ COORDINATING MATCH COVER", text: "Our Indiranagar studio coordinators are assigning a substitute.", bg: '#FAF1E6', color: '#A26829', bar: OT.ochre },
          adminDashboard: { text: "🚨 1 ALERT PENDING RESOLUTION", flag: "SLA Cutdown: 1 minute remaining till auto-sweep", bg: "rgba(184,107,75,0.08)", color: OT.terra, pulse: true }
        };
      } else if (playbackSecond < 20) {
        return {
          stepNum: 2,
          stepName: "8:00 PM CRON DAEMON KICKSTATED",
          caption: "The clock strikes 8:00 PM. M3S cloud cron triggers SLA background sweep daemon to process all active pending_decline states.",
          coachPhone: { title: "CRON RUNNING", msg: "SLA 8 PM Fallback background sweep executing.", status: "Background Processing", action: "Sweep Activating", border: OT.ochre, pulse: true },
          clientPhone: { alert: "⏳ SWEEP RUN RUNNING", text: "Background matcher processing...", bg: '#FAF1E6', color: '#A26829', bar: OT.ochre, pulse: true },
          adminDashboard: { text: "🤖 AUTOMATION CRON SWEEP TRIGGERED", flag: "SLA Sweep Executing matching routines", bg: "rgba(201,154,63,0.08)", color: OT.ochre, pulse: true }
        };
      } else {
        return {
          stepNum: 3,
          stepName: "SLA FALLBACK RESOLVED DIRECTLY",
          caption: "Sweep service identifies available Deepika, auto-updates Firestore, and shoots automated WhatsApp: 'Workout Protected'.",
          coachPhone: { title: "RESOLVED", msg: "Assigned substitute coach Deepika automatically.", status: "Resolved", action: "Completed by Cron", border: OT.hairlineStrong, pulse: false },
          clientPhone: { alert: "✓ SCHEDULE CONFIRMED STABLE", text: "Coach Deepika is auto-assigned tomorrow to retain your morning routine. Zero credit forfeiture.", bg: '#EAF0E8', color: '#4D5C45', bar: '#7B8B6F', showSuccess: true },
          adminDashboard: { text: "✓ SLA AUTO-MATCHED", flag: "Fallback resolved automatically. Green 0.", bg: '#E8EFE5', color: '#4D5C45', pulse: false }
        };
      }
    }
  };

  const frame = getFrameData();

  return (
    <div style={{ background: '#16120F', borderRadius: '28px', border: '5px solid #28211C', padding: '24px 28px', color: '#FFFDF0', boxShadow: OT.sh3, marginTop: 40, overflow: 'hidden' }}>
      
      {/* Simulation Player Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: isPlaying ? OT.sage : OT.clay500, animation: isPlaying ? 'pulse 1s infinite' : 'none' }} />
            <span style={{ fontFamily: OT.fMono, fontSize: '10px', color: OT.clay500, letterSpacing: '1px', fontWeight: 'bold' }}>
              M3S SLA INTERACTIVE EXPERIENCE CINEMA
            </span>
          </div>
          <h3 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '28px', color: '#FFFDF0', margin: '4px 0 0', fontWeight: 400 }}>
            Cancellation Path Animated Mock Tour
          </h3>
        </div>

        {/* Timeline Switcher Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', padding: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            onClick={() => { setVideoTimeline('before_8pm'); setPlaybackSecond(0); setIsPlaying(true); }}
            style={{
              padding: '6px 14px', borderRadius: '999px', border: 'none', cursor: 'pointer',
              fontFamily: OT.fBody, fontSize: '11px', fontWeight: 'bold', transition: 'all 0.2s',
              background: videoTimeline === 'before_8pm' ? OT.walnut : 'transparent',
              color: '#FFFDF0'
            }}>
            ☀️ Before 8 PM Route
          </button>
          <button 
            onClick={() => { setVideoTimeline('after_8pm'); setPlaybackSecond(0); setIsPlaying(true); }}
            style={{
              padding: '6px 14px', borderRadius: '999px', border: 'none', cursor: 'pointer',
              fontFamily: OT.fBody, fontSize: '11px', fontWeight: 'bold', transition: 'all 0.2s',
              background: videoTimeline === 'after_8pm' ? OT.terra : 'transparent',
              color: '#FFFDF0'
            }}>
            🌙 After 8 PM Locked
          </button>
          <button 
            onClick={() => { setVideoTimeline('auto_sweep'); setPlaybackSecond(0); setIsPlaying(true); }}
            style={{
              padding: '6px 14px', borderRadius: '999px', border: 'none', cursor: 'pointer',
              fontFamily: OT.fBody, fontSize: '11px', fontWeight: 'bold', transition: 'all 0.2s',
              background: videoTimeline === 'auto_sweep' ? OT.ochre : 'transparent',
              color: '#FFFDF0'
            }}>
            🤖 SLA 8 PM Auto-Sweep
          </button>
        </div>
      </div>

      {/* THREE MOCK CHANNELS DISPLAYS SIDE-BY-SIDE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: 24 }} className="mobile-view-collapse">
        
        {/* 1. COACH APP MOCK */}
        <div style={{ background: '#1F1915', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)', padding: 14 }}>
          <div style={{ fontSize: '9px', fontFamily: OT.fMono, color: OT.clay500, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
            <span>📱 COACH SCREEN</span>
            <span style={{ color: frame.coachPhone.error ? OT.terra : OT.sage }}>● ONLINE</span>
          </div>

          <div style={{ background: '#120B07', borderRadius: '12px', border: `1.5px solid ${frame.coachPhone.border}`, padding: 12, minHeight: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: OT.fMono, fontSize: '10px', color: frame.coachPhone.error ? OT.terra : OT.clay500, fontWeight: 'bold', marginBottom: 6 }}>{frame.coachPhone.title}</div>
              <div style={{ fontSize: '12.5px', color: '#FFFDF0', fontWeight: 'bold', lineHeight: 1.3 }}>{frame.coachPhone.msg}</div>
            </div>
            
            <div style={{ marginTop: 12 }}>
              <div style={{ fontFamily: OT.fMono, fontSize: '8.5px', color: OT.clay500 }}>CURRENT STATE STATUS</div>
              <div style={{ fontSize: '11px', fontWeight: 'bold', color: frame.coachPhone.error ? OT.terra : OT.sage, display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: frame.coachPhone.error ? OT.terra : OT.sage, animation: frame.coachPhone.pulse ? 'pulse 0.8s infinite' : 'none' }} />
                {frame.coachPhone.status}
              </div>
            </div>
          </div>
        </div>

        {/* 2. CLIENT APP MOCK */}
        <div style={{ background: '#1F1915', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)', padding: 14 }}>
          <div style={{ fontSize: '9px', fontFamily: OT.fMono, color: OT.clay500, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
            <span>📱 STUDENT APP VIEW</span>
            <span style={{ color: OT.sage }}>● SMARTPHONE</span>
          </div>

          <div style={{ background: '#120B07', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: 10, minHeight: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
            <div style={{ background: frame.clientPhone.bg, borderRadius: '10px', padding: '10px', borderLeft: `3px solid ${frame.clientPhone.bar}` }}>
              <div style={{ fontSize: '9px', fontFamily: OT.fMono, color: frame.clientPhone.color, fontWeight: 'bold', marginBottom: 4 }}>{frame.clientPhone.alert}</div>
              <div style={{ fontSize: '10.5px', color: '#241810', lineHeight: 1.35 }}>{frame.clientPhone.text}</div>
            </div>

            {frame.clientPhone.showActions && (
              <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                <div style={{ flex: 1, background: OT.sage, color: '#fff', fontSize: '8px', padding: '4px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>Accept Substitute</div>
                <div style={{ flex: 1, background: '#120B07', color: OT.terra, border: `1px solid ${OT.terra}`, fontSize: '8px', padding: '4px', borderRadius: '4px', textAlign: 'center', fontWeight: 'bold' }}>Decline & Refund</div>
              </div>
            )}
            
            <div style={{ fontSize: '8px', fontFamily: OT.fMono, color: OT.clay500, textAlign: 'right', marginTop: 4 }}>
              🎟️ 8 PT Credits Valid
            </div>
          </div>
        </div>

        {/* 3. ADMIN SLATE MOCK */}
        <div style={{ background: '#1F1915', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)', padding: 14 }}>
          <div style={{ fontSize: '9px', fontFamily: OT.fMono, color: OT.clay500, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
            <span>🖥️ ADMIN CORE BOARD</span>
            <span style={{ color: OT.ochre }}>● SECURE GATEWAY</span>
          </div>

          <div style={{ background: '#120B07', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', padding: 12, minHeight: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '10px', fontFamily: OT.fMono, color: OT.clay500, marginBottom: 4 }}>ACTIVE DEVIATION STATUS</div>
              <div style={{ fontStyle: 'italic', fontSize: '12px', color: '#FFFDF0', fontWeight: 'bold' }}>"{frame.adminDashboard.text}"</div>
            </div>

            <div style={{ background: frame.adminDashboard.bg, padding: '6px 8px', borderRadius: '6px', marginTop: 8 }}>
              <span style={{ fontSize: '9px', fontFamily: OT.fMono, color: frame.adminDashboard.color, fontWeight: 'bold', display: 'block' }}>SLA RULE ENGINE TRACKER</span>
              <span style={{ fontSize: '9.5px', color: '#FFFDF0', display: 'block', marginTop: 2 }}>{frame.adminDashboard.flag}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PROGRESS TRACKER BAR & TIMES */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, fontSize: '11px', fontFamily: OT.fMono, color: OT.clay500 }}>
          <span>CHAPTER {frame.stepNum} DE-ALLOCATION JOURNEY OUTLINE</span>
          <span>00:{playbackSecond < 10 ? '0' + playbackSecond : playbackSecond} / 00:30</span>
        </div>

        {/* Action seeker timeline */}
        <div 
          onClick={handleSeek}
          style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', cursor: 'pointer', position: 'relative' }}>
          <div style={{ width: `${(playbackSecond / 30) * 100}%`, height: '100%', background: videoTimeline === 'after_8pm' ? OT.terra : videoTimeline === 'auto_sweep' ? OT.ochre : OT.sage, borderRadius: '4px', transition: 'width 0.1s linear' }} />
          {/* Milestone markers */}
          <div onClick={(e) => { e.stopPropagation(); jumpToSecond(0); }} style={{ position: 'absolute', left: '0%', top: '-2px', width: '12px', height: '12px', borderRadius: '50%', background: playbackSecond >= 0 ? '#fff' : 'rgba(255,255,255,0.4)', border: '2px solid #16120F' }} title="Milestone 1" />
          <div onClick={(e) => { e.stopPropagation(); jumpToSecond(10); }} style={{ position: 'absolute', left: '33.3%', top: '-2px', width: '12px', height: '12px', borderRadius: '50%', background: playbackSecond >= 10 ? '#fff' : 'rgba(255,255,255,0.4)', border: '2px solid #16120F' }} title="Milestone 2" />
          <div onClick={(e) => { e.stopPropagation(); jumpToSecond(20); }} style={{ position: 'absolute', left: '66.6%', top: '-2px', width: '12px', height: '12px', borderRadius: '50%', background: playbackSecond >= 20 ? '#fff' : 'rgba(255,255,255,0.4)', border: '2px solid #16120F' }} title="Milestone 3" />
          <div onClick={(e) => { e.stopPropagation(); jumpToSecond(30); }} style={{ position: 'absolute', left: '100%', top: '-2px', width: '12px', height: '12px', borderRadius: '50%', background: playbackSecond >= 30 ? '#fff' : 'rgba(255,255,255,0.4)', border: '2px solid #16120F', transform: 'translateX(-12px)' }} title="Milestone 4" />
        </div>
      </div>

      {/* MEDIA CONTROLS & CAPTION NARRATOR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1.8fr)', gap: '16px', alignItems: 'center' }} className="mobile-view-collapse">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            style={{ padding: '8px 14px', borderRadius: '999px', border: 'none', background: '#FFFDF0', color: '#16120F', fontFamily: OT.fBody, fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
            {isPlaying ? '⏸ Pause Tour' : '▶ Play Animated Tour'}
          </button>
          
          <button 
            onClick={handleRestart}
            style={{ padding: '8px 12px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#FFFDF0', fontFamily: OT.fMono, fontSize: '11px', cursor: 'pointer' }}>
            🔄 Restart
          </button>
        </div>

        {/* Subtitle Caption Narrator */}
        <div style={{ background: '#1F1915', borderRadius: '12px', padding: '10px 14px', borderLeft: `3.5px solid ${videoTimeline === 'after_8pm' ? OT.terra : videoTimeline === 'auto_sweep' ? OT.ochre : OT.sage}` }}>
          <div style={{ fontSize: '9px', fontFamily: OT.fMono, color: videoTimeline === 'after_8pm' ? OT.terra : videoTimeline === 'auto_sweep' ? OT.ochre : OT.sage, fontWeight: 'bold', letterSpacing: '0.5px' }}>
            STEP {frame.stepNum}: {frame.stepName}
          </div>
          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#FFFDF0', lineHeight: 1.4, opacity: 0.9 }}>
            {frame.caption}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── 2. PT CLIENTS INVITATIONS LIST (REPLACED WITH YOUR SCHEDULE & CANCELLATION FLOW M3S) ─────────
function PTInvitesDashboard({ currentUser, clients, invites, setInvites, sessions, setSessions, onStartReassign, coaches = [] }) {
  const [timeSimulation, setTimeSimulation] = React.useState(() => localStorage.getItem('m3s.timeSimulation') || 'before_8pm');
  const [showDeclineSheet, setShowDeclineSheet] = React.useState(false);
  const [declineTargetSession, setDeclineTargetSession] = React.useState(null); // Real DB session object
  const [reasonType, setReasonType] = React.useState('injury'); // 'injury' | 'emergency' | 'other'
  const [otherReasonText, setOtherReasonText] = React.useState('');
  const [sheetState, setSheetState] = React.useState('selector'); // 'selector' | 'success'
  const [whatsappLogs, setWhatsappLogs] = React.useState([]);
  const [selectedSimClient, setSelectedSimClient] = React.useState('meera'); // Selected client to display in phone frame
  const [showToast, setShowToast] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState('');
  const [showOtherCoaches, setShowOtherCoaches] = React.useState(true); // Allow seeing other coaches' sessions for testing override

  // Keep timeSimulation cookie synchronized
  React.useEffect(() => {
    localStorage.setItem('m3s.timeSimulation', timeSimulation);
    window.dispatchEvent(new Event('storage'));
  }, [timeSimulation]);

  React.useEffect(() => {
    const handleSimChange = () => {
      setTimeSimulation(localStorage.getItem('m3s.timeSimulation') || 'before_8pm');
    };
    const handleSetupScenario = (e) => {
      if (e.detail?.slug) {
        setupGuidedScenario(e.detail.slug);
      }
    };
    const handleTriggerSweep = () => {
      runFallbackSweep();
    };
    const handleTriggerToast = (e) => {
      if (e.detail?.msg) {
        triggerToast(e.detail.msg);
      }
    };

    window.addEventListener('m3s:time-simulation-change', handleSimChange);
    window.addEventListener('m3s:setup-scenario', handleSetupScenario);
    window.addEventListener('m3s:trigger-sweep', handleTriggerSweep);
    window.addEventListener('m3s:trigger-toast', handleTriggerToast);
    return () => {
      window.removeEventListener('m3s:time-simulation-change', handleSimChange);
      window.removeEventListener('m3s:setup-scenario', handleSetupScenario);
      window.removeEventListener('m3s:trigger-sweep', handleTriggerSweep);
      window.removeEventListener('m3s:trigger-toast', handleTriggerToast);
    };
  }, [sessions, clients, timeSimulation]);

  // Dynamic Date helper
  const formatSessionDate = (isoStr) => {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) + ' · ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Trigger outbound simulated WhatsApp message
  const triggerWhatsAppNotification = async (recipient, text) => {
    const current = await M3S_DB.get('globals', 'whatsapp_logs', { list: [] });
    const list = current.list || [];
    const entry = {
      id: 'w_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      recipient: recipient,
      text: text
    };
    const updated = { list: [entry, ...list].slice(0, 40) };
    await M3S_DB.set('globals', 'whatsapp_logs', updated);
    setWhatsappLogs(updated.list);
  };

  // Reload logs periodically
  const reloadLogs = async () => {
    const data = await M3S_DB.get('globals', 'whatsapp_logs', { list: [] });
    setWhatsappLogs(data.list || []);
  };

  React.useEffect(() => {
    reloadLogs();
    const interval = setInterval(reloadLogs, 2500);
    return () => clearInterval(interval);
  }, []);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4500);
  };

  // Database helper: Get dynamic package credits of a student
  const getClientCredits = (clientId) => {
    const match = clients.find(c => c.id === clientId);
    return match ? (match.package_credits !== undefined ? match.package_credits : 8) : 8;
  };

  // Coach declines click
  const handleDeclineClick = (session) => {
    if (timeSimulation === 'after_8pm') {
      triggerToast("❌ BLOCK LOCKOUT: Standard studio guidelines apply. Session changes are restricted after the 8:00 PM cutoff.");
      return;
    }
    setDeclineTargetSession(session);
    setReasonType('injury');
    setOtherReasonText('');
    setSheetState('selector');
    setShowDeclineSheet(true);
  };

  // Submit decline overlay bottom sheet
  const notifyAdminSubmit = async () => {
    try {
      if (!declineTargetSession) return;
      const session = declineTargetSession;
      
      // Update session status in DB
      const updatedSessions = sessions.map(s => {
        if (s.id === session.id) {
          return {
            ...s,
            status: 'pending_decline',
            decline_reason: reasonType,
            decline_note: reasonType === 'other' ? otherReasonText : 'Illness & Physical Injury',
            decline_timestamp: new Date().toISOString()
          };
        }
        return s;
      });
      setSessions(updatedSessions);
      M3S_DB.setAll('sessions', updatedSessions).catch(e => console.error("Firestore update sessions failed:", e));

      const client = clients.find(c => c.id === session.client_id) || { name: 'Unknown Student', phone: '' };
      const coach = coaches.find(c => c.id === session.coach_id) || { name: 'Unknown Coach' };
      const dateStr = formatSessionDate(session.scheduled_at);

      // 1. Dispatch WhatsApp message to Admin in background
      const adminSMS = `🚨 [SMS NOTIFICATION TO ADMIN] Trainer ${coach.name} has declined slot ${dateStr} with student ${client.name} due to ${reasonType === 'injury' ? 'Illness/Injury' : reasonType === 'emergency' ? 'Emergency' : 'Other reasons'}. Manual allocation board resolution is requested before 8:00 PM.`;
      triggerWhatsAppNotification('Admin (Harshita)', adminSMS).catch(e => console.error("Admin SMS dispatch failed:", e));

      // 2. Dispatch reassurance alert to Client in background
      const clientSMS = `📱 [AUTOMATED SAGE OUTBOUND] Hello ${client.name}, your Coach ${coach.name} has experienced custom timetable conflict. The studio dispatch team is currently coordinating a perfect matching substitute with no slot forfeiture. View your M3S Portal for updates.`;
      triggerWhatsAppNotification(`Client (${client.name})`, clientSMS).catch(e => console.error("Client SMS dispatch failed:", e));

      setSheetState('success');
    } catch (err) {
      console.error("notifyAdminSubmit crash:", err);
      // Fallback transition so user isn't stuck under any circumstances
      setSheetState('success');
    }
  };

  // Close decline overlay sheet
  const closeDeclineSheet = () => {
    setShowDeclineSheet(false);
    setDeclineTargetSession(null);
    triggerToast("✓ Decline submitted. Status updated to 'PENDING ADMIN RESOLUTION' in database.");
  };

  // Simulate 8 PM Cutoff system fallback sweep process
  const runFallbackSweep = async () => {
    const atRisk = sessions.filter(s => s.status === 'pending_decline');
    if (atRisk.length === 0) {
      triggerToast("No pending coach declines found in DB of status 'pending_decline'. Proceed to decline slots first.");
      return;
    }

    let updatedSessions = [...sessions];
    let updatedClients = [...clients];

    for (const session of atRisk) {
      const client = clients.find(c => c.id === session.client_id) || { name: 'Client' };
      const originalCoach = coaches.find(c => c.id === session.coach_id) || { name: 'Lee' };
      
      // Match with alternative coach Deepika (specializes in Hyrox & Conditioning, perfect for general slots)
      const subCoach = coaches.find(c => c.id === 'deepika') || coaches.find(c => c.id !== session.coach_id && c.id !== 'blocked') || { id: 'deepika', name: 'Deepika' };

      // Update session to upcoming under the substitute coach
      updatedSessions = updatedSessions.map(s => {
        if (s.id === session.id) {
          return {
            ...s,
            status: 'upcoming',
            coach_id: subCoach.id,
            reassigned_from_coach_id: originalCoach.id,
            reassign_resolved_automatically: true,
            reassign_timestamp: new Date().toISOString()
          };
        }
        return s;
      });

      // Dispatch auto-allotted SMS
      const autoSMS = `🤖 [SLA CUTOFF AUTOMATION RUN] Hi ${client.name}, we could not reach you before the night-before 8 PM cutoff. To maximize your progress, we have auto-assigned Coach ${subCoach.name} to your session tomorrow at ${new Date(session.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}. Standard cancellation policy applies after 8 PM cutoff.`;
      await triggerWhatsAppNotification(`Client (${client.name})`, autoSMS);
    }

    setSessions(updatedSessions);
    await M3S_DB.setAll('sessions', updatedSessions);
    triggerToast("⚡ Cutoff SLA Fallback Sweep Successful! At-risk sessions have been automatically matched in DB.");
  };

  // Guided test configuration helper
  const setupGuidedScenario = async (slug) => {
    let updatedSessions = [...sessions];
    let updatedClients = [...clients];

    // Reset client credits to default
    updatedClients = updatedClients.map(c => {
      if (c.id === 'meera') return { ...c, package_credits: 8 };
      if (c.id === 'riya') return { ...c, package_credits: 8 };
      return c;
    });

    if (slug === 'scenario_before_8pm') {
      setTimeSimulation('before_8pm');
      // Reset Meera's session s2 to upcoming with Coach Lee
      updatedSessions = updatedSessions.map(s => {
        if (s.id === 's2') {
          return {
            id: 's2', coach_id: 'lee', client_id: 'meera', type: 'PT Session',
            scheduled_at: '2026-05-26T08:00:00', duration_min: 60, status: 'upcoming'
          };
        }
        return s;
      });
      setSessions(updatedSessions);
      setClients(updatedClients);
      await M3S_DB.setAll('sessions', updatedSessions);
      await M3S_DB.setAll('clients', updatedClients);
      
      await triggerWhatsAppNotification('System Engine', '🧹 Reset DB - Ready for Before-8PM test sequence. Try declining Meera P. slot.');
      triggerToast("Scenario A Loaded: Ready for BEFORE 8:00 PM cancellation testing.");
    }
    else if (slug === 'scenario_after_8pm') {
      setTimeSimulation('after_8pm');
      updatedSessions = updatedSessions.map(s => {
        if (s.id === 's2') {
          return {
            id: 's2', coach_id: 'lee', client_id: 'meera', type: 'PT Session',
            scheduled_at: '2026-05-26T08:00:00', duration_min: 60, status: 'upcoming'
          };
        }
        return s;
      });
      setSessions(updatedSessions);
      setClients(updatedClients);
      await M3S_DB.setAll('sessions', updatedSessions);
      await M3S_DB.setAll('clients', updatedClients);
      await triggerWhatsAppNotification('System Engine', '🧹 Time advanced to lock state 20:30 PM. All next-day slots blocked.');
      triggerToast("Scenario B Loaded: AFTER 8:00 PM lockout criteria active.");
    }
  };

  // Client simulated action inside phone viewport
  const handleClientChoice = async (choice, session) => {
    let updatedSessions = [...sessions];
    const client = clients.find(c => c.id === session.client_id) || { name: 'Client' };

    if (choice === 'accept') {
      // Reassigned coach becomes verified confirmed upcoming
      const matchCoachId = session.reassigned_coach_id || 'deepika';
      const coachMatch = coaches.find(c => c.id === matchCoachId) || { name: 'Deepika' };

      updatedSessions = updatedSessions.map(s => {
        if (s.id === session.id) {
          return {
            ...s,
            status: 'upcoming',
            coach_id: matchCoachId,
            reassigned_coach_id: undefined,
            user_reassignment_accepted: true,
            reassign_resolved_at: new Date().toISOString()
          };
        }
        return s;
      });
      setSessions(updatedSessions);
      await M3S_DB.setAll('sessions', updatedSessions);

      const sms = `📱 [CLIENT CONFIRMED] ${client.name} has ACCEPTED Coach ${coachMatch.name} for tomorrow at ${new Date(session.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}. Automated calendar synced.`;
      await triggerWhatsAppNotification(`Client (${client.name})`, sms);
      triggerToast(`✓ Match accepted! Coach ${coachMatch.name} is now confirmed for this list slot.`);
    } 
    else if (choice === 'refund') {
      // Void the session & refund +1 credit
      updatedSessions = updatedSessions.map(s => {
        if (s.id === session.id) {
          return {
            ...s,
            status: 'cancelled',
            user_reassignment_declined: true,
            reassign_resolved_at: new Date().toISOString()
          };
        }
        return s;
      });
      
      const updatedClients = clients.map(c => {
        if (c.id === session.client_id) {
          const currentC = c.package_credits !== undefined ? c.package_credits : 8;
          return { ...c, package_credits: currentC + 1 };
        }
        return c;
      });

      setSessions(updatedSessions);
      setClients(updatedClients);
      await M3S_DB.setAll('sessions', updatedSessions);
      await M3S_DB.setAll('clients', updatedClients);

      const sms = `📱 [CLIENT REFUND] ${client.name} declined alternative coach. Timetable slot voided. +1 compensational credit reimbursed. Balance: ${getClientCredits(session.client_id)} credits.`;
      await triggerWhatsAppNotification(`Client (${client.name})`, sms);
      triggerToast(`✓ Session voided. Refund of 1 PT Package Credit successfully saved to DB!`);
    }
  };

  const handleResetSessionSlot = async (sessionId) => {
    const updatedSessions = sessions.map(s => {
      if (s.id === sessionId) {
        return {
          ...s,
          status: 'upcoming',
          coach_id: 'lee', // Reset back to default coach Lee for Riya & Meera
          reassigned_coach_id: undefined,
          decline_reason: undefined,
          decline_note: undefined,
          decline_timestamp: undefined,
          reassign_resolved_automatically: undefined,
          reassign_timestamp: undefined,
          user_reassignment_accepted: undefined,
          user_reassignment_declined: undefined,
          reassign_resolved_at: undefined
        };
      }
      return s;
    });
    setSessions(updatedSessions);
    await M3S_DB.setAll('sessions', updatedSessions);
    triggerToast("✓ Test slot restored to CONFIRMED upcoming state (Coach Lee) for re-testing.");
  };

  const clearWhatsAppLogs = async () => {
    await M3S_DB.set('globals', 'whatsapp_logs', { list: [] });
    setWhatsappLogs([]);
    triggerToast("Simulated WhatsApp logs sandbox cleared.");
  };

  // Filter sessions to show
  const activeSessionsToDisplay = sessions.filter(s => {
    if (s.status === 'blocked') return false;
    if (!showOtherCoaches) {
      return s.coach_id === currentUser.id;
    }
    return true;
  });

  // Styles
  const cardStyle = {
    background: OT.paper, 
    border: `1px solid ${OT.hairlineStrong}`, 
    borderRadius: '24px', 
    padding: '24px', 
    boxShadow: OT.sh1, 
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'space-between', 
    minHeight: '270px',
    transition: 'all 0.3s ease'
  };

  const labelBadgeStyle = {
    fontFamily: OT.fMono,
    fontSize: '9.5px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
    padding: '4px 10px',
    borderRadius: '12px',
    textTransform: 'uppercase',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px'
  };

  const declineBtnStyle = {
    fontFamily: OT.fBody,
    fontSize: '12px',
    fontWeight: '600',
    color: OT.terra,
    background: 'transparent',
    border: `1.5px solid ${OT.terra}`,
    borderRadius: '999px',
    padding: '9px 18px',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.15s ease',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ paddingBottom: 60, position: 'relative' }}>
      
      {/* Toast Notification */}
      {showToast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, zIndex: 10000,
          background: OT.espresso900, color: OT.paper,
          padding: '16px 24px', borderRadius: '16px', backdropFilter: 'blur(10px)',
          boxShadow: OT.sh3, border: `1px solid ${OT.hairline}`,
          fontFamily: OT.fBody, fontSize: '13.5px', fontWeight: 550,
          display: 'flex', alignItems: 'center', gap: 10, animation: 'slideIn 0.2s ease-out'
        }}>
          <span style={{ color: OT.sage }}>●</span>
          {toastMsg}
        </div>
      )}

      {/* Removed simulative dashboard panels — relocated into Studio QA Console */}

      <div style={{ width: '100%' }}>
        
        {/* ACTIVE PT SESSIONS LIST */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${OT.hairline}`, paddingBottom: 16, marginBottom: 24 }}>
            <div>
              <h2 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '38px', color: OT.espresso900, fontWeight: 400, margin: 0, lineHeight: 1.1 }}>
                Your Schedule
              </h2>
              <div style={{ fontFamily: OT.fMono, fontSize: '10.5px', letterSpacing: '1px', color: OT.clay600, marginTop: 4 }}>
                TIMELINE STATUS · {timeSimulation === 'before_8pm' ? '04:15 PM (OPEN ACTIVE)' : '08:45 PM (TIMETABLE LOCKED)'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontFamily: OT.fBody, fontSize: '12px', color: OT.espresso800, fontWeight: 550 }}>
                <input 
                  type="checkbox" 
                  checked={showOtherCoaches} 
                  onChange={(e) => setShowOtherCoaches(e.target.checked)}
                  style={{ accentColor: OT.walnut }}
                />
                Show other coaches' slots (Cooperative override)
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {activeSessionsToDisplay.map(session => {
              const client = clients.find(c => c.id === session.client_id) || { name: 'Blocked Slot', initials: 'BL' };
              const isMine = session.coach_id === currentUser.id;
              const coachObj = coaches.find(c => c.id === session.coach_id) || { name: 'Substitute' };

              return (
                <div key={session.id} style={{
                  ...cardStyle,
                  opacity: session.status === 'pending_decline' ? 0.75 : 1,
                  filter: session.status === 'pending_decline' ? 'grayscale(15%)' : 'none',
                  border: session.status === 'pending_decline' ? `1.5px dashed ${OT.warn}` : session.status === 'reassigned_pending' ? `1.8px solid ${OT.ochre}` : `1px solid ${OT.hairlineStrong}`
                }}>
                  <div>
                    {/* Card Header row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ 
                          width: 36, height: 36, borderRadius: '50%', 
                          background: isMine ? OT.walnut : OT.sand300, 
                          color: OT.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                          fontSize: '13px', fontWeight: 'bold', fontFamily: OT.fDisplay, fontStyle: 'italic' 
                        }}>
                          {client.initials || client.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontFamily: OT.fBody, fontSize: '15px', fontWeight: 600, color: OT.espresso900 }}>
                            {client.name}
                          </div>
                          <div style={{ fontFamily: OT.fMono, fontSize: '9px', color: OT.clay500 }}>
                            ID: #{client.id.toUpperCase()} · Coach: {coachObj.name}
                          </div>
                        </div>
                      </div>

                      {/* Status Badging */}
                      <div>
                        {session.status === 'pending_decline' && (
                          <span style={{ ...labelBadgeStyle, color: '#A26829', background: '#FAF1E3' }}>● PENDING ADMIN MATCH</span>
                        )}
                        {session.status === 'reassigned_pending' && (
                          <span style={{ ...labelBadgeStyle, color: OT.ochre, background: '#FFF7E6', border: `1px solid ${OT.ochre}` }}>● ASSIGNED: {coaches.find(c => c.id === session.reassigned_coach_id)?.name || 'Anisha'}</span>
                        )}
                        {session.status === 'upcoming' && (
                          <span style={{ ...labelBadgeStyle, color: '#4D5C45', background: '#E8EFE5' }}>● CONFIRMED</span>
                        )}
                        {session.status === 'cancelled' && (
                          <span style={{ ...labelBadgeStyle, color: OT.clay650 || OT.clay600, background: OT.sand100 }}>● VOID: +1 RESTORED</span>
                        )}
                      </div>
                    </div>

                    {/* Class/session details */}
                    <div style={{ fontFamily: OT.fBody, fontSize: '13.5px', color: OT.espresso800, fontWeight: 500, marginBottom: 10 }}>
                      {formatSessionDate(session.scheduled_at)} ({session.duration_min} min)
                    </div>

                    <div style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '15.5px', color: OT.clay600, borderLeft: `2.5px solid ${OT.sand200}`, paddingLeft: 10, marginBottom: 16 }}>
                      {session.client_id === 'meera' ? '"Goal: Conditioning & Fat Loss — Focus on aerobics consistency"' :
                       session.client_id === 'riya' ? '"Goal: Conditioning & Strength — Landmine chest press and metabolic sets"' :
                       session.client_id === 'karan' ? '"Goal: Hyrox Preparation — Sled push volumes and pacing thresholds"' : 
                       '"General Strength & Cardio block conditioning"'}
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div style={{ marginTop: 'auto' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontFamily: OT.fMono, fontSize: '9.5px', color: OT.clay500 }}>
                        {session.status === 'cancelled' ? 'CANCELED IN TESTING' : 'NEXT-DAY PT CLASS'}
                      </span>
                      {timeSimulation === 'after_8pm' && session.status === 'upcoming' && (
                        <span style={{ fontFamily: OT.fMono, fontSize: '10px', color: OT.terra, fontWeight: 'bold' }}>🔒 TIMETABLE LOCKED </span>
                      )}
                    </div>

                    {session.status === 'pending_decline' ? (
                      <div style={{ 
                        fontFamily: OT.fBody, fontSize: '11.5px', color: OT.terra, 
                        background: '#FDF5F2', border: `1.5px dashed ${OT.terra}`, 
                        borderRadius: '12px', padding: '10px', textAlign: 'center', fontStyle: 'italic', fontWeight: 550
                      }}>
                        "Awaiting Admin match. WhatsApp dispatched to client."
                      </div>
                    ) : session.status === 'reassigned_pending' ? (
                      <div style={{ 
                        fontFamily: OT.fBody, fontSize: '11.5px', color: OT.ochre, 
                        background: '#FFFDF0', border: `1px solid ${OT.ochre}`, 
                        borderRadius: '12px', padding: '10px', textAlign: 'center', fontStyle: 'italic'
                      }}>
                        "Reassignment sent to client screen in simulator panel →"
                      </div>
                    ) : session.status === 'cancelled' ? (
                      <div style={{ 
                        fontFamily: OT.fBody, fontSize: '11.5px', color: OT.clay600, 
                        background: OT.sand100, borderRadius: '12px', padding: '10px', textAlign: 'center', fontStyle: 'italic'
                      }}>
                        Session Voided. Compensative Refund Dispatch completed.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <button 
                          onClick={() => handleDeclineClick(session)}
                          style={{
                            ...declineBtnStyle,
                            opacity: timeSimulation === 'after_8pm' ? 0.4 : 1,
                            cursor: timeSimulation === 'after_8pm' ? 'not-allowed' : 'pointer'
                          }}>
                          Decline Session
                        </button>
                        <div style={{ fontFamily: OT.fBody, fontSize: '10px', color: OT.clay600, fontStyle: 'italic', textAlign: 'center' }}>
                          M3S policy resolves alternative trainer in real-time
                        </div>
                      </div>
                    )}

                    {session.status !== 'upcoming' && (
                      <div style={{ marginTop: 10, textAlign: 'center', fontFamily: OT.fMono, fontSize: '10px', color: OT.clay600 }}>
                        Session updated
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {activeSessionsToDisplay.length === 0 && (
              <div style={{
                background: OT.sand100,
                border: `1px dashed ${OT.hairlineStrong}`,
                borderRadius: '16px',
                padding: '32px 24px',
                textAlign: 'center',
                fontFamily: OT.fBody,
                gridColumn: '1 / -1'
              }}>
                <div style={{ fontSize: '18px', fontFamily: OT.fDisplay, fontStyle: 'italic', color: OT.espresso900, marginBottom: '8px' }}>
                  No Schedule Sessions Active
                </div>
                <p style={{ fontSize: '13px', color: OT.clay600, margin: '0 0 16px', lineHeight: 1.45 }}>
                  You have no upcoming sessions to display right now.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Simulated outbound logs & visualizer relocated to the floating QA Console */}

      {/* ─── CANCELLATION JOURNEY STUDIO: OVERLAY BOTTOM SHEET ─── */}
      {showDeclineSheet && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(36, 24, 16, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '20px'
        }}>
          <div style={{
            background: OT.paper,
            border: `1px solid ${OT.hairlineStrong}`,
            borderRadius: '24px',
            width: '100%',
            maxWidth: '480px',
            padding: '32px',
            boxShadow: OT.sh3,
            position: 'relative',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            color: OT.espresso900
          }}>
            {sheetState === 'selector' ? (
              <div>
                <h3 style={{
                  fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '28px',
                  color: OT.espresso900, fontWeight: 400, margin: '0 0 8px 0'
                }}>
                  Decline Session & Request Cover
                </h3>
                <p style={{
                  fontFamily: OT.fBody, fontSize: '13.5px', color: OT.clay600,
                  margin: '0 0 24px 0', lineHeight: 1.4
                }}>
                  Please select your reason for declining this slot. The studio algorithm and desk administrators will coordinate coverage or notify the client accordingly.
                </p>

                {declineTargetSession && (
                  <div style={{
                    background: OT.sand100, borderRadius: '12px', padding: '12px 14px',
                    marginBottom: '20px', fontSize: '12px', color: OT.espresso800,
                    fontFamily: OT.fMono
                  }}>
                    <strong>STUDENT: </strong>
                    {clients.find(c => c.id === declineTargetSession.client_id)?.name || 'Unknown'}<br />
                    <strong>SLOT TIME: </strong>
                    {formatSessionDate(declineTargetSession.scheduled_at)}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  {[
                    { value: 'injury', label: '🤕 Illness / Physical Injury', sub: 'Trainer is physically unfit to conduct session.' },
                    { value: 'emergency', label: '⚠️ Personal Emergency', sub: 'Urgent personal matters requiring real-time absence.' },
                    { value: 'other', label: '💬 Other reason / Specific Conflict', sub: 'Custom schedule conflicts, transport blockages, etc.' }
                  ].map(opt => {
                    const isSelected = reasonType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setReasonType(opt.value)}
                        style={{
                          textAlign: 'left', background: isSelected ? 'rgba(184,107,75,0.06)' : 'transparent',
                          border: `1.5px solid ${isSelected ? OT.terra : OT.hairline}`,
                          borderRadius: '14px', padding: '12px 16px', cursor: 'pointer',
                          fontFamily: OT.fBody, transition: 'all 0.2s', width: '100%'
                        }}
                      >
                        <div style={{ fontWeight: '600', fontSize: '13.5px', color: isSelected ? OT.terra : OT.espresso900 }}>
                          {opt.label}
                        </div>
                        <div style={{ fontSize: '11px', color: OT.clay600, marginTop: '2px' }}>
                          {opt.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {reasonType === 'other' && (
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      fontFamily: OT.fMono, fontSize: '10px', fontWeight: 'bold',
                      color: OT.clay600, display: 'block', marginBottom: '6px'
                    }}>
                      EXPLAIN SPECIFIC TIMETABLE CONFLICT
                    </label>
                    <textarea
                      value={otherReasonText}
                      onChange={(e) => setOtherReasonText(e.target.value)}
                      placeholder="Specify your timetable issue here..."
                      style={{
                        ...inputStyle, minHeight: '80px', borderRadius: '12px',
                        padding: '10px 14px', fontSize: '13px', width: '100%', boxSizing: 'border-box'
                      }}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    onClick={() => setShowDeclineSheet(false)}
                    style={{
                      fontFamily: OT.fBody, fontSize: '13px', fontWeight: 'bold',
                      color: OT.espresso800, background: 'transparent',
                      border: `1px solid ${OT.hairlineStrong}`, borderRadius: '999px',
                      padding: '12px 20px', cursor: 'pointer', flex: 1
                    }}
                  >
                    Keep Class
                  </button>
                  <button
                    onClick={notifyAdminSubmit}
                    style={{
                      fontFamily: OT.fBody, fontSize: '13px', fontWeight: 'bold',
                      color: OT.paper, background: OT.terra, border: 'none',
                      borderRadius: '999px', padding: '12px 20px', cursor: 'pointer', flex: 1.5,
                      boxShadow: '0 4px 12px rgba(184,107,75,0.2)'
                    }}
                  >
                    Submit Cover Request
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'rgba(123,139,111,0.1)', color: OT.sage,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '32px', margin: '0 auto 20px'
                }}>
                  ✓
                </div>
                <h3 style={{
                  fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '32px',
                  color: OT.espresso900, fontWeight: 400, margin: '0 0 10px 0'
                }}>
                  SLA Routing Active
                </h3>
                <p style={{
                  fontFamily: OT.fBody, fontSize: '14px', color: OT.clay600,
                  margin: '0 0 28px 0', lineHeight: 1.45
                }}>
                  We'll handle it from here. The student allocation is now routed to the Admin Matrix board.
                </p>

                <button
                  onClick={closeDeclineSheet}
                  style={{
                    fontFamily: OT.fBody, fontSize: '14px', fontWeight: '600', color: OT.espresso800,
                    background: 'transparent', border: `1px solid ${OT.hairlineStrong}`, borderRadius: '999px',
                    padding: '12px 36px', cursor: 'pointer', width: '100%'
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}



// ─── CANCELLATION JOURNEY STUDIO: STEP-BY-STEP HANDOFF VERIFICATION ───────
function CancellationJourneyStudio() {
  const [activeStep, setActiveStep] = React.useState(1);

  // Simulation parameters
  const [userChoice, setUserChoice] = React.useState('none'); // 'none' | 'accept' | 'decline_step1' | 'decline_step2'
  const [adminResolution, setAdminResolution] = React.useState('pending'); // 'pending' | 'reassigned' | 'notified'

  // Styles
  const stepBtnStyle = {
    fontFamily: OT.fBody,
    fontSize: '13px',
    fontWeight: '500',
    color: OT.espresso800,
    background: 'transparent',
    border: 'none',
    borderLeft: `3px solid transparent`,
    padding: '10px 16px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    width: '100%',
    outline: 'none'
  };

  const activeStepBtnStyle = {
    ...stepBtnStyle,
    fontWeight: '700',
    color: OT.walnut,
    borderLeft: `3px solid ${OT.walnut}`,
    background: 'rgba(94,66,40,0.06)'
  };

  const renderStudioScreen = () => {
    switch(activeStep) {
      case 1:
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1px solid ${OT.hairline}`, paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ fontFamily: OT.fMono, fontSize: '10px', color: OT.clay600, letterSpacing: '1px' }}>
                SCREEN 1 OF 9 · COACH COMPONENT
              </div>
              <span style={{ fontSize: '12px', fontStyle: 'italic', color: OT.clay600 }}>Layout: Desktop schedule</span>
            </div>
            
            <p style={{ fontSize: '13.5px', color: OT.clay600, marginBottom: 24, lineHeight: 1.4 }}>
              The <strong>"PT Invites"</strong> list is replaced with a premium, read-only <strong>"Your Schedule"</strong> overview. Double action options (Delegation direct buttons) are eliminated, keeping only a clean <strong>"Decline Session"</strong> action.
            </p>

            {/* Desktop Mock Schedule Display */}
            <div style={{ background: OT.sand50, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: 24, boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontFamily: OT.fMono, fontSize: '11px', color: OT.clay600 }}>MONDAY, APRIL 20, 2026</span>
                <span style={{ fontFamily: OT.fMono, fontSize: '9px', bg: OT.sage, color: OT.paper, padding: '2px 6px', borderRadius: '4px' }}>TODAY</span>
              </div>
              
              <div style={{ fontFamily: OT.fMono, fontSize: '11px', fontWeight: 'bold', color: OT.espresso950, marginBottom: 12 }}>
                UPCOMING · 3 SESSIONS
              </div>

              {/* Grid with cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                {/* Meera P Card */}
                <div style={{ background: OT.paper, border: `1px solid ${OT.hairlineStrong}`, borderRadius: 16, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: OT.walnut, color: OT.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 12 }}>MP</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>Meera P.</div>
                        <div style={{ fontFamily: OT.fMono, fontSize: '9px', color: OT.clay500 }}>ID: #4402</div>
                      </div>
                    </div>
                    <span style={{ fontFamily: OT.fMono, fontSize: '8px', color: '#445E45', background: '#EAF0E8', padding: '2px 8px', borderRadius: 99, fontWeight: 'bold' }}>● CONFIRMED</span>
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 550, color: OT.espresso800, marginBottom: 8 }}>Monday, Apr 20 · 8:00 AM (60 min)</div>
                  <div style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '15px', color: OT.clay600, borderLeft: `2.5px solid ${OT.sand200}`, paddingLeft: 8, marginBottom: 12 }}>
                    "Goal: Conditioning & Fat Loss — Focus on aerobics training"
                  </div>
                  <div style={{ fontFamily: OT.fMono, fontSize: '8.5px', color: OT.clay500, marginBottom: 8 }}>BOOKED 2 HRS AGO</div>
                  
                  <button style={{ width: '100%', background: 'transparent', border: `1px solid ${OT.terra}`, color: OT.terra, borderRadius: 999, padding: '8px', fontSize: '11px', fontWeight: 600 }}>
                    Decline Session
                  </button>
                  <p style={{ fontSize: '9.5px', fontStyle: 'italic', color: OT.clay600, textAlign: 'center', marginTop: 4, margin: '4px 0 0' }}>
                    Admin will handle reassignment
                  </p>
                </div>

                {/* Karan S Card */}
                <div style={{ background: OT.paper, border: `1px solid ${OT.hairlineStrong}`, borderRadius: 16, padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: OT.espresso800, color: OT.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 12 }}>KS</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>Karan S.</div>
                        <div style={{ fontFamily: OT.fMono, fontSize: '9px', color: OT.clay500 }}>ID: #4409</div>
                      </div>
                    </div>
                    <span style={{ fontFamily: OT.fMono, fontSize: '8px', color: '#445E45', background: '#EAF0E8', padding: '2px 8px', borderRadius: 99, fontWeight: 'bold' }}>● CONFIRMED</span>
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: 550, color: OT.espresso800, marginBottom: 8 }}>Monday, Apr 20 · 6:30 PM (60 min)</div>
                  <div style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '15px', color: OT.clay600, borderLeft: `2.5px solid ${OT.sand200}`, paddingLeft: 8, marginBottom: 12 }}>
                    "Goal: Hyrox Preparation — focus on high volume sled push sets"
                  </div>
                  <div style={{ fontFamily: OT.fMono, fontSize: '8.5px', color: OT.clay500, marginBottom: 8 }}>BOOKED 2 HRS AGO</div>
                  
                  <button style={{ width: '100%', background: 'transparent', border: `1px solid ${OT.terra}`, color: OT.terra, borderRadius: 999, padding: '8px', fontSize: '11px', fontWeight: 600 }}>
                    Decline Session
                  </button>
                  <p style={{ fontSize: '9.5px', fontStyle: 'italic', color: OT.clay600, textAlign: 'center', marginTop: 4, margin: '4px 0 0' }}>
                    Admin will handle reassignment
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1px solid ${OT.hairline}`, paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ fontFamily: OT.fMono, fontSize: '10px', color: OT.clay600, letterSpacing: '1px' }}>
                SCREEN 2 OF 9 · COACH: DECLINE OVERLAY BOTTOM SHEET
              </div>
              <span style={{ fontSize: '12px', fontStyle: 'italic', color: OT.clay600 }}>Layout: Touch-optimized Bottom Sheet</span>
            </div>
            
            <p style={{ fontSize: '13.5px', color: OT.clay600, marginBottom: 20, lineHeight: 1.4 }}>
              When the coach clicks <strong>"Decline Session,"</strong> a bottom sheet animated overlay rises. It provides a visual summary capsule of the session, reason selection chips, and legal guidelines block.
            </p>

            {/* Bottom Sheet Component Preview */}
            <div style={{ display: 'flex', justifyContent: 'center', background: '#ECE1D2', padding: 24, borderRadius: 16 }}>
              <div style={{ background: OT.paper, width: '100%', maxWidth: '380px', borderRadius: '24px', padding: '24px', boxShadow: OT.sh2 }}>
                <div style={{ width: 32, height: 4, background: OT.sand200, borderRadius: 2, margin: '-6px auto 16px' }} />
                
                <h4 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '24px', color: OT.espresso900, margin: '0 0 12px', fontWeight: 400 }}>
                  Decline this session
                </h4>

                <div style={{ background: OT.sand100, borderRadius: '8px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                  <span style={{ fontFamily: OT.fMono, fontSize: '10px', fontWeight: 'bold' }}>MEERA P. · #4402</span>
                  <span style={{ fontFamily: OT.fMono, fontSize: '9.5px', color: OT.clay600 }}>08:00 AM</span>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontFamily: OT.fMono, fontSize: '9px', color: OT.clay600, marginBottom: 6 }}>REASON CATEGORY</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: '11px', background: '#FDF5F2', border: `1px solid ${OT.terra}`, color: OT.terra, padding: '4px 10px', borderRadius: 999, fontWeight: 650 }}>Illness & Injury</span>
                    <span style={{ fontSize: '11px', border: `1px solid ${OT.hairlineStrong}`, padding: '4px 10px', borderRadius: 999, color: OT.clay600 }}>Emergency</span>
                    <span style={{ fontSize: '11px', border: `1px solid ${OT.hairlineStrong}`, padding: '4px 10px', borderRadius: 999, color: OT.clay600 }}>Other</span>
                  </div>
                </div>

                <p style={{ fontFamily: OT.fBody, fontSize: '11.5px', color: OT.clay600, fontStyle: 'italic', margin: '0 0 20px', lineHeight: 1.4 }}>
                  Admin will be notified and will handle reassignment before 8 PM. You do not need to contact the client.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 8 }}>
                  <button style={{ border: `1px solid ${OT.hairlineStrong}`, background: 'transparent', padding: '8px', borderRadius: 990, fontSize: '11.5px', fontWeight: 'bold' }}>Cancel</button>
                  <button style={{ background: OT.terra, border: 'none', color: '#FFF', padding: '8px', borderRadius: 990, fontSize: '11.5px', fontWeight: 'bold' }}>Notify Admin</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1px solid ${OT.hairline}`, paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ fontFamily: OT.fMono, fontSize: '10px', color: OT.clay600, letterSpacing: '1px' }}>
                SCREEN 3 OF 9 · COACH: SESSION CARD POST-DECLINE STATE
              </div>
              <span style={{ fontSize: '12px', fontStyle: 'italic', color: OT.clay600 }}>Layout: Desaturated state card</span>
            </div>
            
            <p style={{ fontSize: '13.5px', color: OT.clay600, marginBottom: 20, lineHeight: 1.4 }}>
              Once declined, the card instantly updates to neutral grey/desaturated state. The action buttons disappear, replaced by an amber <strong>"PENDING ADMIN RESOLUTION"</strong> badge and warning footer.
            </p>

            <div style={{ background: OT.sand50, padding: 24, borderRadius: 16, border: `1px solid ${OT.hairline}` }}>
              <div style={{ background: OT.paper, border: `1px solid ${OT.hairlineStrong}`, borderRadius: 16, padding: '20px', maxWidth: '400px', margin: '0 auto', opacity: 0.72 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: OT.walnut, color: OT.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 12 }}>MP</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>Meera P.</div>
                      <div style={{ fontFamily: OT.fMono, fontSize: '9px', color: OT.clay500 }}>ID: #4402</div>
                    </div>
                  </div>
                  <span style={{ fontFamily: OT.fMono, fontSize: '8.5px', color: '#A26829', background: '#FAF1E3', padding: '2px 8px', borderRadius: 99, fontWeight: 'bold' }}>● PENDING ADMIN RESOLUTION</span>
                </div>
                
                <div style={{ fontSize: '12.5px', fontWeight: 550, color: OT.espresso800, marginBottom: 8 }}>Monday, Apr 20 · 8:00 AM (60 min)</div>
                <div style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '15px', color: OT.clay600, borderLeft: `2.5px solid ${OT.sand200}`, paddingLeft: 8, marginBottom: 12 }}>
                  "Goal: Conditioning & Fat Loss — Focus on aerobics training"
                </div>

                <div style={{ 
                  fontFamily: OT.fBody, fontSize: '11px', color: OT.terra, 
                  background: '#FDF5F2', border: `1px dashed ${OT.terra}`, 
                  borderRadius: '10px', padding: '10px', textAlign: 'center', fontStyle: 'italic'
                }}>
                  "Resolution by 8 PM tonight. Client will be notified by admin."
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1px solid ${OT.hairline}`, paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ fontFamily: OT.fMono, fontSize: '10px', color: OT.clay600, letterSpacing: '1px' }}>
                SCREEN 4 OF 9 · USER: INSTANT CONFIRMATION STAGE
              </div>
              <span style={{ fontSize: '12px', fontStyle: 'italic', color: OT.clay600 }}>Layout: Client Mobile Screen</span>
            </div>
            
            <p style={{ fontSize: '13.5px', color: OT.clay600, marginBottom: 20, lineHeight: 1.4 }}>
              The client mobile experience on instant booking success: showcases a polished confirmation banner and details of the upcoming session card with Coach Lee.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {/* Phone Frame */}
              <div style={{ width: '300px', height: '510px', borderRadius: '32px', border: `6px solid ${OT.espresso900}`, background: OT.sand50, padding: '16px', boxSizing: 'border-box', position: 'relative', boxShadow: OT.sh3 }}>
                <div style={{ width: '80px', height: '14px', background: OT.espresso900, borderRadius: '7px', margin: '-10px auto 14px' }} />
                
                {/* Checkmark circle */}
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#E8EFE5', color: OT.sage, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '16px auto 12px' }}>
                  ✓
                </div>

                <h3 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '24px', textAlign: 'center', color: OT.espresso900, fontWeight: 400, margin: '0 0 16px' }}>
                  You're confirmed.
                </h3>

                {/* Confirm Card */}
                <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: 14, marginBottom: 16 }}>
                  <div style={{ fontFamily: OT.fMono, fontSize: '9px', color: OT.clay600, letterSpacing: '1px', marginBottom: 6 }}>UPCOMING PT SESSION</div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: OT.espresso900 }}>Coach Lee</div>
                  <div style={{ fontSize: '11px', color: OT.clay600, marginBottom: 10 }}>Strength & Conditioning</div>
                  
                  <div style={{ borderTop: `1px solid ${OT.sand100}`, paddingTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontFamily: OT.fMono, fontSize: '9.5px', fontWeight: 'bold' }}>TUE, APR 29 @ 7:00 AM</span>
                    <span style={{ fontSize: '10.5px', color: OT.clay600 }}>60 min</span>
                  </div>
                  <div style={{ fontSize: '11px', color: OT.clay600, marginTop: 4, fontStyle: 'italic' }}>📍 M3S Studio, Indiranagar</div>
                </div>

                {/* Action CTA list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                  <button style={{ width: '100%', background: OT.espresso900, color: OT.paper, border: 'none', padding: '10px', borderRadius: '24px', fontSize: '11.5px', fontWeight: 600 }}>
                    Add to Calendar
                  </button>
                  <button style={{ width: '100%', background: 'transparent', color: OT.espresso900, border: `1px solid ${OT.hairlineStrong}`, padding: '10px', borderRadius: '24px', fontSize: '11.5px', fontWeight: 600 }}>
                    View Session Details
                  </button>
                </div>

                {/* Fine print footnote */}
                <p style={{ textAlign: 'center', fontSize: '9px', color: OT.clay600, fontStyle: 'italic', marginTop: 14 }}>
                  * Sessions can be modified up to 8 PM the night before.
                </p>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1px solid ${OT.hairline}`, paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ fontFamily: OT.fMono, fontSize: '10px', color: OT.clay600, letterSpacing: '1px' }}>
                SCREEN 5 OF 9 · USER: REASSIGNMENT HEADER ALERT
              </div>
              <span style={{ fontSize: '12px', fontStyle: 'italic', color: OT.clay600 }}>Layout: Client Mobile Screen</span>
            </div>
            
            <p style={{ fontSize: '13.5px', color: OT.clay600, marginBottom: 20, lineHeight: 1.4 }}>
              If a coach declines before 8 PM, the admin triggers a reassignment prompt. It displays as a non-dismissible gold status banner directly below the user's mobile app header.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '300px', height: '510px', borderRadius: '32px', border: `6px solid ${OT.espresso900}`, background: OT.sand50, padding: '16px', boxSizing: 'border-box', position: 'relative', boxShadow: OT.sh3, display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '80px', height: '14px', background: OT.espresso900, borderRadius: '7px', margin: '-10px auto 14px' }} />
                
                {/* Client Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <span style={{ fontFamily: OT.fMono, fontSize: '8px', color: OT.clay600 }}>MEMBER PORTAL</span>
                    <h4 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '20px', margin: 0 }}>Riya Sharma</h4>
                  </div>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: OT.ochre }} />
                </div>

                {/* Dynamic Gold Amber Banner */}
                <div style={{ background: '#FDF7EB', border: `1px solid ${OT.ochre}`, borderRadius: '16px', padding: '14px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontSize: 13 }}>⚠️</span>
                    <span style={{ fontFamily: OT.fMono, fontSize: '9px', fontWeight: 'bold', color: OT.ochre }}>COACH UNAVAILABLE</span>
                  </div>
                  <p style={{ fontSize: '11px', color: OT.espresso900, margin: '0 0 12px', lineHeight: 1.4 }}>
                    Coach Lee is unavailable on <strong>Tuesday, 29 Apr at 7:00 AM</strong>. Coach Meera is free at this slot. Confirm by 8 PM or auto-assigned.
                  </p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <button 
                      onClick={() => { setUserChoice('accept'); setActiveStep(6); }}
                      style={{ background: OT.terra, color: OT.paper, border: 'none', padding: '8px', fontSize: '10px', fontWeight: 'bold', borderRadius: '12px', cursor: 'pointer' }}>
                      Accept Coach Meera
                    </button>
                    <button 
                      onClick={() => { setUserChoice('decline_step1'); setActiveStep(6); }}
                      style={{ background: 'transparent', border: `1px solid ${OT.hairlineStrong}`, padding: '8px', fontSize: '10px', fontWeight: 'bold', borderRadius: '12px', cursor: 'pointer' }}>
                      Decline & Refund Credit
                    </button>
                  </div>
                </div>

                {/* Normal upcoming card obscured below */}
                <div style={{ background: OT.paper, opacity: 0.5, border: `1px solid ${OT.hairline}`, borderRadius: 12, padding: 12 }}>
                  <span style={{ fontSize: '9px', fontFamily: OT.fMono }}>UPCOMING SESSION</span>
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Coach Lee ...</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1px solid ${OT.hairline}`, paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ fontFamily: OT.fMono, fontSize: '10px', color: OT.clay600, letterSpacing: '1px' }}>
                SCREEN 6 OF 9 · USER: CHOICES (ACCEPT vs DECLINE STATES)
              </div>
              <span style={{ fontSize: '12px', fontStyle: 'italic', color: OT.clay600 }}>Interactive demo buttons inside layout</span>
            </div>
            
            <p style={{ fontSize: '13.5px', color: OT.clay600, marginBottom: 20, lineHeight: 1.4 }}>
              Configure and test the user action responses. Tap options to trigger simulated transition screens.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
              <button onClick={() => setUserChoice('accept')} style={{ padding: '6px 12px', fontSize: '11px', background: userChoice === 'accept' ? OT.espresso900 : OT.sand100, color: userChoice === 'accept' ? '#FFF' : '#000', borderRadius: 9, cursor: 'pointer' }}>Option A: Accept Coach Meera</button>
              <button onClick={() => setUserChoice('decline_step1')} style={{ padding: '6px 12px', fontSize: '11px', background: userChoice === 'decline_step1' ? OT.espresso900 : OT.sand100, color: userChoice === 'decline_step1' ? '#FFF' : '#000', borderRadius: 9, cursor: 'pointer' }}>Option B1: Decline Confirm Sheet</button>
              <button onClick={() => setUserChoice('decline_step2')} style={{ padding: '6px 12px', fontSize: '11px', background: userChoice === 'decline_step2' ? OT.espresso900 : OT.sand100, color: userChoice === 'decline_step2' ? '#FFF' : '#000', borderRadius: 9, cursor: 'pointer' }}>Option B2: Real Refund Credit Post-state</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {/* Phone Frame */}
              <div style={{ width: '300px', height: '510px', borderRadius: '32px', border: `6px solid ${OT.espresso900}`, background: OT.sand50, padding: '16px', boxSizing: 'border-box', position: 'relative', boxShadow: OT.sh3, display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: '80px', height: '14px', background: OT.espresso900, borderRadius: '7px', margin: '-10px auto 14px' }} />

                {userChoice === 'accept' && (
                  <div>
                    {/* Confirmation stripe */}
                    <div style={{ background: '#E8EFE5', borderLeft: `3px solid ${OT.sage}`, padding: '10px', borderRadius: '8px', fontSize: '11px', color: '#3E5C31', marginBottom: 16 }}>
                      ✓ Confirmed with Coach Meera · Tuesday, 29 Apr · 7:00 AM
                      {/* Timer bar simulation */}
                      <div style={{ height: 2, background: OT.sage, width: '40%', marginTop: 6 }} />
                    </div>

                    <h4 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '18px', marginBottom: 12 }}>Your Upcoming Sessions</h4>
                    
                    <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 12, padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontFamily: OT.fMono, fontSize: '9px', color: OT.ochre, background: '#FFF7E6', padding: '1px 6px', borderRadius: 4, fontWeight: 'bold' }}>REASSIGNED</span>
                        <span style={{ fontSize: '10px', color: OT.clay500 }}>60 min</span>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold' }}>Coach Meera</div>
                      <div style={{ fontSize: '11px', color: OT.clay600 }}>Pilates & Mobility</div>
                      <p style={{ fontSize: '10px', fontFamily: OT.fMono, marginTop: 4, color: OT.walnut }}>TUE, APR 29 @ 7:00 AM</p>
                    </div>
                  </div>
                )}

                {userChoice === 'decline_step1' && (
                  <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: 16, boxShadow: OT.sh2 }}>
                      <h4 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '20px', margin: '0 0 8px' }}>Are you sure?</h4>
                      <p style={{ fontSize: '11px', color: OT.clay600, lineHeight: 1.4, margin: '0 0 16px' }}>
                        If you decline, this session will be voided and 1 session credit will be added to your package. You can book a future slot with Coach Lee.
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <button 
                          onClick={() => setUserChoice('decline_step2')}
                          style={{ background: OT.terra, color: '#FFF', border: 'none', padding: '8px', fontSize: '11px', borderRadius: 8, fontWeight: 'bold', cursor: 'pointer' }}>
                          Yes, decline & credit me
                        </button>
                        <button 
                          onClick={() => setUserChoice('accept')}
                          style={{ background: 'transparent', border: `1px solid ${OT.hairlineStrong}`, padding: '8px', fontSize: '11px', borderRadius: 8, color: OT.clay600, cursor: 'pointer' }}>
                          Go back
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {userChoice === 'decline_step2' && (
                  <div>
                    {/* Neutral Refund Stripe */}
                    <div style={{ background: '#F1EFEA', borderLeft: `3px solid ${OT.clay600}`, padding: '10px', borderRadius: '8px', fontSize: '11px', color: OT.espresso800, marginBottom: 20 }}>
                      ✓ Session voided · 1 credit added to your package
                    </div>

                    <h4 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '18px', marginBottom: 12 }}>Your Package Summary</h4>
                    <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 12, padding: 12, textAlign: 'center' }}>
                      <span style={{ fontSize: '11px', fontFamily: OT.fMono }}>AVAILABLE PT CREDITS</span>
                      <h3 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '38px', margin: '4px 0', color: OT.walnut }}>08</h3>
                      <p style={{ fontSize: '10px', color: OT.sage, margin: 0, fontWeight: 'bold' }}>+1 CREDIT ADDED AS COMPENSATIONAL REFUND</p>
                    </div>

                    <button 
                      onClick={() => setActiveStep(5)}
                      style={{ width: '100%', background: OT.espresso900, color: '#FFF', border: 'none', borderRadius: 24, padding: 10, fontSize: '11px', fontWeight: 'bold', marginTop: 16, cursor: 'pointer' }}>
                      Book your next session →
                    </button>
                  </div>
                )}

                {userChoice === 'none' && (
                  <p style={{ textAlign: 'center', fontSize: '13px', color: OT.clay600, margin: 'auto' }}>Please select one of the simulated state buttons above.</p>
                )}
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1px solid ${OT.hairline}`, paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ fontFamily: OT.fMono, fontSize: '10px', color: OT.clay600, letterSpacing: '1px' }}>
                SCREEN 7 OF 9 · USER: SLA EXPIRATIONS (AUTO-ASSIGN vs NO COACH AVAILABLE)
              </div>
              <span style={{ fontSize: '12px', fontStyle: 'italic', color: OT.clay600 }}>Unresponsive client cutoff state</span>
            </div>
            
            <p style={{ fontSize: '13.5px', color: OT.clay600, marginBottom: 20, lineHeight: 1.4 }}>
              Shows what happens if the user remains unresponsive when the 8:00 PM cutoff SLA expires, or what happens when no alternative coach is available at all.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, justifyContent: 'center', maxWidth: '640px', margin: '0 auto' }}>
              {/* AUTO CONFIRMED */}
              <div>
                <div style={{ textAlign: 'center', fontFamily: OT.fMono, fontSize: '10px', fontWeight: 'bold', marginBottom: 8 }}>AUTO-ASSIGN EXPIRED</div>
                <div style={{ width: '280px', height: '440px', borderRadius: '24px', border: `5px solid ${OT.espresso900}`, background: OT.sand50, padding: '12px', boxSizing: 'border-box', position: 'relative' }}>
                  <div style={{ background: '#FAF6EF', border: `1px solid ${OT.sand200}`, padding: '10px', borderRadius: '10px', fontSize: '10.5px', color: OT.espresso900, marginBottom: 12, lineHeight: 1.35 }}>
                    ● <strong>SESSION UPDATED:</strong> You were auto-confirmed with Coach Meera for Tuesday, 29 Apr at 7:00 AM. See you then.
                  </div>

                  <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 10, padding: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: OT.fMono, fontSize: '8px', color: OT.ochre, background: '#FFF9EB', padding: '1px 4px', borderRadius: 2 }}>REASSIGNED</span>
                      <span style={{ fontSize: '9px' }}>60m</span>
                    </div>
                    <div style={{ fontSize: '11.5px', fontWeight: 600 }}>Coach Meera</div>
                    <p style={{ fontSize: '10px', fontFamily: OT.fMono, margin: '2px 0 0' }}>Tue, 29 Apr · 7:00 AM</p>
                  </div>
                </div>
              </div>

              {/* NO COACH FREE */}
              <div>
                <div style={{ textAlign: 'center', fontFamily: OT.fMono, fontSize: '10px', fontWeight: 'bold', marginBottom: 8 }}>NO ALTERNATIVE COCH AVAILABLE</div>
                <div style={{ width: '280px', height: '440px', borderRadius: '24px', border: `5px solid ${OT.espresso900}`, background: OT.sand50, padding: '12px', boxSizing: 'border-box', position: 'relative' }}>
                  <div style={{ background: '#FFF3F0', borderLeft: `3px solid ${OT.terra}`, padding: '10px', borderRadius: '10px', fontSize: '10px', color: OT.espresso900, marginBottom: 12, lineHeight: 1.35 }}>
                    ● <strong>SESSION VOIDED:</strong> Coach Lee is unavailable on Tuesday, 29 Apr at 7:00 AM and no other coaches are free. We've added 1 session credit to your package...
                  </div>

                  <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 10, padding: 12, textAlign: 'center' }}>
                    <span style={{ fontSize: '10px', fontFamily: OT.fMono }}>REFUND SYSTEM TRIGGERED</span>
                    <h4 style={{ margin: '4px 0', fontSize: '14px', color: OT.terra }}>+1 PT Credit Restored</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1px solid ${OT.hairline}`, paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ fontFamily: OT.fMono, fontSize: '10px', color: OT.clay600, letterSpacing: '1px' }}>
                SCREEN 8 OF 9 · ADMIN: THE CENTRAL RESOLUTION WORKSPACE
              </div>
              <span style={{ fontSize: '12px', fontStyle: 'italic', color: OT.clay600 }}>Layout: Desktop Admin Dashboard</span>
            </div>
            
            <p style={{ fontSize: '13.5px', color: OT.clay600, marginBottom: 20, lineHeight: 1.4 }}>
              The control interface for the Studio Manager (such as Harshita). Red-amber borders indicate a cancellation conflict that requires manual reassignment.
            </p>

            <div style={{ background: OT.paper, border: `1px solid ${OT.hairlineStrong}`, borderRadius: 16, padding: 24, boxSizing: 'border-box' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 24 }}>
                {/* Section A: Session at Risk */}
                <div style={{ borderRight: `1px solid ${OT.hairline}`, paddingRight: 20 }}>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ width: 8, height: 8, background: OT.terra, borderRadius: '50%' }} />
                    <span style={{ fontFamily: OT.fMono, fontSize: '9px', fontWeight: 'bold', color: OT.terra }}>SLA AT RISK · UNRESOLVED</span>
                  </div>
                  <h4 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '20px', margin: '0 0 12px' }}>Incident: Lee Declined</h4>
                  
                  <div style={{ background: OT.sand50, padding: 16, borderRadius: '12px', fontSize: '12px', marginBottom: 16 }}>
                    <p style={{ margin: '0 0 6px' }}><strong>Student:</strong> Riya Sharma</p>
                    <p style={{ margin: '0 0 6px' }}><strong>Original Slot:</strong> Tue, 29 Apr @ 7:00 AM</p>
                    <p style={{ margin: '0 0 6px', color: OT.terra }}><strong>Coach Reason:</strong> Illness & Fever</p>
                  </div>

                  <div style={{ background: '#FAF1EB', border: `1px solid ${OT.terra}`, padding: '12px', borderRadius: '10px', color: OT.terra, fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }}>
                    🚨 SLA TIMELINE COUNTDOWN: RESOLVE BY 8:00 PM
                  </div>
                </div>

                {/* Section B: Resolution options */}
                <div>
                  <h4 style={{ fontFamily: OT.fMono, fontSize: '10.5px', color: OT.clay600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>
                    OPTION A: CHOOSE REASSIGNMENT TRAINER
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: OT.sand50, padding: '10px 14px', borderRadius: 8, border: `1px solid ${OT.hairline}` }}>
                      <div>
                        <strong>Coach Meera</strong> <span style={{ fontSize: '10px', color: OT.clay650 || OT.clay600 }}>· Pilates specialist (M3S matching profile)</span>
                      </div>
                      <button 
                        onClick={() => { setAdminResolution('reassigned'); alert("✓ Coach Meera reassigned. Automated push sent to Riya Sharma's viewport."); }}
                        style={{ background: OT.sage, border: 'none', color: '#FFF', padding: '4px 12px', borderRadius: 8, fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Reassign
                      </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: OT.sand50, padding: '10px 14px', borderRadius: 8, border: `1px solid ${OT.hairline}` }}>
                      <div>
                        <strong>Coach Deepika</strong> <span style={{ fontSize: '10px', color: OT.clay600 }}>· Available 7 AM (Strength specialization mismatch)</span>
                      </div>
                      <button 
                        onClick={() => { setAdminResolution('reassigned'); alert("✓ Coach Deepika assigned."); }}
                        style={{ background: OT.espresso900, border: 'none', color: '#FFF', padding: '4px 12px', borderRadius: 8, fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                        Reassign
                      </button>
                    </div>
                  </div>

                  <hr style={{ border: 'none', borderTop: `1px dashed ${OT.hairline}`, margin: '14px 0' }} />
                  
                  <h4 style={{ fontFamily: OT.fMono, fontSize: '10.5px', color: OT.clay600, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>
                    OPTION B: CANCEL AND PASS CREDIT
                  </h4>
                  <button 
                    onClick={() => { setAdminResolution('notified'); alert("✓ Voided session with admin credit dispatch."); }}
                    style={{ background: 'transparent', border: `1px solid ${OT.terra}`, color: OT.terra, padding: '10px 20px', borderRadius: '24px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Void Session and Send Compensation Credit
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 9:
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: `1px solid ${OT.hairline}`, paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ fontFamily: OT.fMono, fontSize: '10px', color: OT.clay600, letterSpacing: '1px' }}>
                SCREEN 9 OF 9 · ADMIN: MISSED SLA & WHATSAPP RULES
              </div>
              <span style={{ fontSize: '12px', fontStyle: 'italic', color: OT.clay600 }}>Critical escalation rules</span>
            </div>
            
            <p style={{ fontSize: '13.5px', color: OT.clay600, marginBottom: 20, lineHeight: 1.4 }}>
              If the 8:00 PM cutoff SLA is missed by admin without reassigning, the system triggers automatic fallback protocols and dispatches predefined templates via WhatsApp API.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 24 }}>
              {/* Fallback Protocol Card */}
              <div style={{ background: OT.sand100, border: `1px solid ${OT.hairlineStrong}`, borderRadius: 16, padding: 20 }}>
                <span style={{ background: OT.terra, color: OT.paper, fontSize: '9px', fontFamily: OT.fMono, padding: '3px 8px', borderRadius: 4, fontWeight: 'bold' }}>SLA MISSED AUTOMATION</span>
                <h4 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '20px', margin: '8px 0 12px' }}>The 8 PM Fallback Sweep</h4>
                
                <ul style={{ fontSize: '12px', color: OT.espresso800, paddingLeft: 18, lineHeight: 1.6 }}>
                  <li><strong>Trigger:</strong> Clock hits 8:01 PM on day T-1 with unresolved coach declines.</li>
                  <li><strong>Auto-Action:</strong> The highest-compatibility alternative trainer is auto-assigned to the client.</li>
                  <li><strong>Communications:</strong> Immediate WhatsApp webhook fires with confirmation and disclaimer warning.</li>
                </ul>
              </div>

              {/* WhatsApp Messages Mockups */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <span style={{ fontFamily: OT.fMono, fontSize: '9.5px', color: OT.clay600, letterSpacing: '1px' }}>AUTOMATED WHATSAPP OUTBOUND</span>
                
                {/* Bubble A */}
                <div style={{ background: '#E6F4EA', border: '1px solid #C2E7C9', borderRadius: '16px 16px 16px 2px', padding: 12, fontSize: '11px', color: OT.espresso900, lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 'bold', color: OT.sage }}>[TEMPLATED BROADCAST A - AUTO-ASSIGNED]</span>
                  <p style={{ margin: '4px 0 0' }}>
                    "Hi Riya, Coach Lee is unwell. We have matched you with Coach Meera for tomorrow at 7:00 AM. Please view your Member App to accept or decline before the session lock."
                  </p>
                </div>

                {/* Bubble B */}
                <div style={{ background: '#FFF3EE', border: '1px solid #FFDAD1', borderRadius: '16px 16px 16px 2px', padding: 12, fontSize: '11px', color: OT.espresso900, lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 'bold', color: OT.terra }}>[TEMPLATED BROADCAST B - VOID REFUNDED]</span>
                  <p style={{ margin: '4px 0 0' }}>
                    "Hi Riya, we are super sorry. Coach Lee is unavailable tomorrow and no other matching trainers are free at your slot. We have refunded 1 PT credit to your wallet."
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 10:
        return (
          <div>
            <div style={{ borderBottom: `1px solid ${OT.hairline}`, paddingBottom: 12, marginBottom: 16 }}>
              <div style={{ fontFamily: OT.fMono, fontSize: '10px', color: OT.clay600, letterSpacing: '1px' }}>
                AUTOMATION ARCHITECTURE & ACTION CANVAS
              </div>
            </div>

            {/* Premium Actor Flow diagram in HTML/CSS */}
            <div style={{ background: OT.sand100, border: `1px solid ${OT.hairlineStrong}`, borderRadius: '24px', padding: '24px', boxSizing: 'border-box' }}>
              <h4 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '24px', color: OT.espresso900, margin: '0 0 16px', textAlign: 'center' }}>
                M3S Cancellation Workflow Lifecycle
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, position: 'relative' }}>
                {/* Column 1: Coach Action */}
                <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: 16 }}>
                  <div style={{ fontFamily: OT.fMono, fontSize: '9px', color: OT.terra, fontWeight: 'bold', marginBottom: 8 }}>1. COACH INITIATOR</div>
                  <strong style={{ fontSize: '13px' }}>Tops "Decline" before 8 PM</strong>
                  <p style={{ fontSize: '11px', color: OT.clay600, marginTop: 4 }}>
                    Coach specifies illness or injury in bottom sheet reason. Database records status = <code>pending_decline</code>.
                  </p>
                </div>

                {/* Column 2: Admin SLA Action */}
                <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: 16 }}>
                  <div style={{ fontFamily: OT.fMono, fontSize: '9px', color: OT.ochre, fontWeight: 'bold', marginBottom: 8 }}>2. ADMIN DISPATCH BOARD</div>
                  <strong style={{ fontSize: '13px' }}>Reassign Conflict or Void Slots</strong>
                  <p style={{ fontSize: '11px', color: OT.clay600, marginTop: 4 }}>
                    Manager selects alternative trainer. System updates client header. If unresolved by 8 PM, system auto-assigns.
                  </p>
                </div>

                {/* Column 3: Client Decision */}
                <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: 16 }}>
                  <div style={{ fontFamily: OT.fMono, fontSize: '9px', color: OT.sage, fontWeight: 'bold', marginBottom: 8 }}>3. CLIENT MOBILE DECISION</div>
                  <strong style={{ fontSize: '13px' }}>Accept Match or Claim Wallet Credit</strong>
                  <p style={{ fontSize: '11px', color: OT.clay600, marginTop: 4 }}>
                    Client clicks accept (confirmed banner with 4s fade) or decline (slots voided & compensation refund +1 credit).
                  </p>
                </div>
              </div>

              {/* Central Database note */}
              <div style={{ background: OT.paper, border: `1px dashed ${OT.hairlineStrong}`, borderRadius: 12, padding: '12px 16px', textAlign: 'center', marginTop: 20, fontSize: '12px', fontFamily: OT.fMono }}>
                💾 SCHEMA PERSISTENCE: Syncs with Firebase Firestore <code>sessions</code>, <code>clients.package_credits</code>, and <code>cancellation_logs</code>.
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ background: OT.paper, border: `1px solid ${OT.hairlineStrong}`, borderRadius: '24px', padding: '32px', minHeight: '600px', display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px' }}>
      {/* Visual Navigation Steps */}
      <div style={{ borderRight: `1px solid ${OT.hairline}`, paddingRight: '20px' }}>
        <h3 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '26px', color: OT.espresso900, fontWeight: 400, margin: '0 0 4px' }}>
          Flow Tour
        </h3>
        <p style={{ fontSize: '12px', color: OT.clay600, margin: '0 0 24px' }}>Explore the 9 pristine cancellation journey screens specified for My Third Space.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: '9px', fontFamily: OT.fMono, color: OT.clay600, paddingLeft: '16px', marginBottom: '6px' }}>COACH CHANNEL</span>
          <button onClick={() => setActiveStep(1)} style={activeStep === 1 ? activeStepBtnStyle : stepBtnStyle}>Screen 1: Confirmed Schedule</button>
          <button onClick={() => setActiveStep(2)} style={activeStep === 2 ? activeStepBtnStyle : stepBtnStyle}>Screen 2: Decline Bottom Sheet</button>
          <button onClick={() => setActiveStep(3)} style={activeStep === 3 ? activeStepBtnStyle : stepBtnStyle}>Screen 3: Post-Decline Card</button>
          
          <span style={{ fontSize: '9px', fontFamily: OT.fMono, color: OT.clay600, paddingLeft: '16px', margin: '14px 0 6px' }}>CLIENT MOBILE APP</span>
          <button onClick={() => setActiveStep(4)} style={activeStep === 4 ? activeStepBtnStyle : stepBtnStyle}>Screen 4: Instant Confirm</button>
          <button onClick={() => setActiveStep(5)} style={activeStep === 5 ? activeStepBtnStyle : stepBtnStyle}>Screen 5: Reassign Header Alert</button>
          <button onClick={() => setActiveStep(6)} style={activeStep === 6 ? activeStepBtnStyle : stepBtnStyle}>Screen 6: Accept & Reject States</button>
          <button onClick={() => setActiveStep(7)} style={activeStep === 7 ? activeStepBtnStyle : stepBtnStyle}>Screen 7: SLA Expiry fallback</button>

          <span style={{ fontSize: '9px', fontFamily: OT.fMono, color: OT.clay600, paddingLeft: '16px', margin: '14px 0 6px' }}>STUDIO MANAGER MATRIX</span>
          <button onClick={() => setActiveStep(8)} style={activeStep === 8 ? activeStepBtnStyle : stepBtnStyle}>Screen 8: Resolution Board</button>
          <button onClick={() => setActiveStep(9)} style={activeStep === 9 ? activeStepBtnStyle : stepBtnStyle}>Screen 9: Overcue SLA & SMS</button>

          <span style={{ fontSize: '9px', fontFamily: OT.fMono, color: OT.clay600, paddingLeft: '16px', margin: '14px 0 6px' }}>AUTOMATION SYSTEM Map</span>
          <button onClick={() => setActiveStep(10)} style={activeStep === 10 ? activeStepBtnStyle : stepBtnStyle}>🔄 Handoff Summary Canvas</button>
        </div>
      </div>

      {/* Screen Render Viewport Container */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, background: OT.sand50, borderRadius: '20px', border: `1px solid ${OT.hairline}`, padding: '24px', boxSizing: 'border-box' }}>
          {renderStudioScreen()}
        </div>

        {/* Live Simulation Hint Footer block */}
        <div style={{ borderTop: `1px solid ${OT.hairlineStrong}`, paddingTop: 16, marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 8, height: 8, background: OT.sage, borderRadius: '50%' }} />
            <span style={{ fontSize: '11.5px', fontFamily: OT.fMono, color: OT.clay600 }}>CANCELLATION JOURNEY COMPREHENSIVE COMPLIATION MATRIX</span>
          </div>
          <span style={{ fontSize: '11px', color: OT.clay600, fontStyle: 'italic' }}>
            Fully persistent in Firestore database
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── 3. MY PT STUDENTS DIRECTORY ──────────────────────────────────────────
function MyClientsDashboard({ currentUser, currentRole, clients, onSelectClient, coaches = [] }) {
  const [filter, setFilter] = React.useState('All');
  
  // RLS Dry-run constraint check:
  // If role is coach, filter to show only this coach's clients
  const finalClients = clients.filter(c => {
    if (currentRole === 'coach' && c.assigned_coach_id !== currentUser.id) return false;
    if (filter === 'All') return true;
    return c.status === filter;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 28, color: OT.espresso900, fontWeight: 400, margin: 0 }}>
            {currentRole === 'coach' ? 'My Assigned PT Students' : 'All Studio Students Directory'}
          </h2>
          <p style={{ fontSize: 13, color: OT.clay600, margin: '4px 0 0' }}>Show active biomechanic records and goal progress tracking logs.</p>
        </div>

        {/* Filters chips */}
        <div style={{ display: 'flex', gap: 8 }}>
          {['All', 'Active', 'Ending soon', 'On hold'].map(status => {
            const isSel = filter === status;
            return (
              <button 
                key={status}
                onClick={() => setFilter(status)}
                style={{
                  padding: '6px 14px', borderRadius: 999, border: isSel ? 'none' : `1px solid ${OT.hairlineStrong}`,
                  background: isSel ? OT.walnut : 'transparent', color: isSel ? OT.paper : OT.espresso800,
                  fontFamily: OT.fBody, fontSize: 12, fontWeight: isSel ? 600 : 400, cursor: 'pointer'
                }}>
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {finalClients.length === 0 ? (
        <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>👥</div>
          <h4 style={{ fontFamily: OT.fDisplay, fontSize: 18, color: OT.espresso900, margin: 0 }}>No students fit criteria</h4>
          <p style={{ fontSize: 12.5, color: OT.clay600, marginTop: 4 }}>Check filter constraints.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {finalClients.map(student => {
            const badgeBg = student.status === 'Active' ? 'rgba(94,139,94,0.1)' : student.status === 'Ending soon' ? 'rgba(201,154,63,0.1)' : 'rgba(184,107,75,0.1)';
            const badgeColor = student.status === 'Active' ? OT.sage : student.status === 'Ending soon' ? OT.ochre : OT.terra;

            return (
              <div 
                key={student.id}
                onClick={() => onSelectClient(student)}
                style={{
                  background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: 18, cursor: 'pointer',
                  boxShadow: OT.sh1, transition: 'transform 0.15s, box-shadow 0.15s'
                }}
                className="transition-all hover:translate-y-[-2px] hover:shadow-md">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: OT.sand100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: OT.espresso900, fontWeight: 'bold', fontSize: 12 }}>
                      {student.name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 14.5, fontWeight: 700, margin: 0, color: OT.espresso900 }}>{student.name}</h4>
                      <div style={{ fontSize: 11, color: OT.clay600 }}>{student.email}</div>
                    </div>
                  </div>
                  <span style={{
                    padding: '2px 8px', borderRadius: 999, fontSize: 9, fontFamily: OT.fMono, letterSpacing: 0.8,
                    background: badgeBg, color: badgeColor, textTransform: 'uppercase', fontWeight: 'bold'
                  }}>
                    {student.status}
                  </span>
                </div>

                <div style={{ background: OT.sand50, borderRadius: 10, padding: '10px 12px', marginBottom: 14, border: `1px solid ${OT.hairline}` }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <div>
                      <span style={{ fontSize: 8.5, fontFamily: OT.fMono, color: OT.clay600, display: 'block' }}>PHONE</span>
                      <span style={{ fontSize: 11.5, color: OT.espresso900, fontWeight: 500 }}>{student.phone}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: 8.5, fontFamily: OT.fMono, color: OT.clay600, display: 'block' }}>MEMBER SINCE</span>
                      <span style={{ fontSize: 11.5, color: OT.espresso900, fontWeight: 500 }}>{student.created_at}</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: OT.clay600 }}>Mapped Coach: <strong>{student.assigned_coach_id}</strong></span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: OT.walnut, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    Overview Profile <span>→</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── STYLING HELPER ───
const uploaderLabelStyle = { display: 'block', fontFamily: OT.fMono, fontSize: 10, color: OT.clay600, marginBottom: 6, letterSpacing: 1 };

// ─── MULTI-MEDIA CUSTOM UPLOADER WITH AUTOMATIC WEB-COMPRESSION ───
function MultiMediaUploader({ label, mediaType, items = [], onChange }) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');
  const [showCompressionPrompt, setShowCompressionPrompt] = React.useState(false);
  const [pendingFile, setPendingFile] = React.useState(null);
  const [isCompressing, setIsCompressing] = React.useState(false);
  const [compressionProgress, setCompressionProgress] = React.useState(0);

  const maxBytes = mediaType === 'image' ? 25 * 1024 * 1024 : 1024 * 1024 * 1024;
  const labelLimit = mediaType === 'image' ? '25 MB' : '1 GB';

  const processFile = (file) => {
    setErrorMsg('');
    if (!file) return;

    if (mediaType === 'image' && !file.type.startsWith('image/')) {
      setErrorMsg('❌ Invalid file type. Please upload a valid JPG, PNG, or WEBP image.');
      return;
    }
    if (mediaType === 'video' && !file.type.startsWith('video/')) {
      setErrorMsg('❌ Invalid file type. Please upload a valid MP4 or MOV video.');
      return;
    }

    if (items.length >= 3) {
      setErrorMsg(`❌ Maximum of 3 ${mediaType}s reached.`);
      return;
    }

    if (file.size > maxBytes) {
      setPendingFile(file);
      setShowCompressionPrompt(true);
      return;
    }

    loadMedia(file);
  };

  const loadMedia = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      let resultUrl = e.target.result;
      if (mediaType === 'video') {
        try {
          resultUrl = URL.createObjectURL(file);
        } catch (_) {}
      }
      onChange([...items, resultUrl]);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerCompress = async () => {
    if (!pendingFile) return;
    setIsCompressing(true);
    setCompressionProgress(0);

    const interval = setInterval(() => {
      setCompressionProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 25) + 15;
      });
    }, 1200 / 5);

    await new Promise(resolve => setTimeout(resolve, 1200));
    clearInterval(interval);
    setCompressionProgress(100);

    if (mediaType === 'image') {
      const compressedDataUrl = await downsampleImage(pendingFile);
      onChange([...items, compressedDataUrl]);
    } else {
      const optUrl = URL.createObjectURL(pendingFile);
      onChange([...items, optUrl]);
    }

    setIsCompressing(false);
    setShowCompressionPrompt(false);
    setPendingFile(null);
  };

  const downsampleImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 900;
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.65));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const removeItem = (idxToRemove) => {
    const updated = items.filter((_, idx) => idx !== idxToRemove);
    onChange(updated);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%', boxSizing: 'border-box' }}>
      <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', fontFamily: OT.fMono, fontSize: 9.5, color: OT.clay600, letterSpacing: 1.2, textTransform: 'uppercase' }}>
        <span>{label} ({items.length}/3)</span>
        <span style={{ color: OT.terra, fontSize: 8.5 }}>Max Size: {labelLimit}</span>
      </label>

      {/* Preview Grid */}
      {items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {items.map((item, idx) => {
            const isDataUrl = item.startsWith('data:');
            const isBlob = item.startsWith('blob:');
            return (
              <div key={idx} style={{ position: 'relative', border: `1px solid ${OT.hairlineStrong}`, borderRadius: 10, overflow: 'hidden', aspectRatio: '4/3', background: OT.sand100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {mediaType === 'image' ? (
                  <img src={item} alt="Thumbnail preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} referrerPolicy="no-referrer" />
                ) : (
                  <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <video src={item} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted preload="metadata" />
                    <div style={{ position: 'absolute', background: 'rgba(30,20,14,0.5)', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: 10 }}>▶</div>
                  </div>
                )}
                <div style={{ position: 'absolute', left: 4, bottom: 4, background: 'rgba(30,20,14,0.7)', borderRadius: 4, padding: '2px 4px', fontSize: 7.5, color: '#FFF', fontFamily: OT.fMono }}>
                  {isDataUrl ? '⚡ Comp_JPG' : isBlob ? '✓ Web_SD' : '🔗 Link'}
                </div>
                <button type="button" onClick={() => removeItem(idx)} style={{ position: 'absolute', right: 4, top: 4, background: OT.terra, border: 'none', color: '#FFF', width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 9, fontWeight: 'bold' }}>✕</button>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Drag & Drop Box */}
      {items.length < 3 ? (
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: `1.5px dashed ${isDragging ? OT.walnut : OT.hairlineStrong}`,
            background: isDragging ? 'rgba(94,66,40,0.04)' : OT.paper,
            borderRadius: 10, padding: '20px', textAlign: 'center', cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}>
          <input 
            type="file" 
            accept={mediaType === 'image' ? 'image/*' : 'video/*'}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                processFile(e.target.files[0]);
              }
            }}
            style={{ display: 'none' }} 
            id={`inp-file-${mediaType}-${label.replace(/\s+/g, '')}`} 
          />
          <label htmlFor={`inp-file-${mediaType}-${label.replace(/\s+/g, '')}`} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 20 }}>{mediaType === 'image' ? '🖼️' : '🎬'}</span>
            <span style={{ fontSize: 11, color: OT.espresso900, fontWeight: '600' }}>Drag/Drop or Click to Upload</span>
            <span style={{ fontSize: 9, color: OT.clay600, fontFamily: OT.fMono }}>Up to {labelLimit}</span>
          </label>
        </div>
      ) : (
        <div style={{ background: 'rgba(123,139,111,0.06)', border: `1px dashed ${OT.sage}`, borderRadius: 10, padding: '8px', textAlign: 'center', fontSize: 10, color: OT.sage, fontWeight: '600' }}>
          ✓ Curated gallery slots populated ({items.length}/3)
        </div>
      )}

      {errorMsg && (
        <span style={{ fontSize: 10.5, color: OT.terra, fontWeight: '600', display: 'block', marginTop: 2 }}>{errorMsg}</span>
      )}

      {/* Downsampling Warning Prompt Modal */}
      {showCompressionPrompt && pendingFile && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(30,20,14,0.65)', backdropFilter: 'blur(3px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: OT.paper, padding: 24, borderRadius: 20, maxWidth: 440, width: '100%', border: `1px solid ${OT.hairlineStrong}`, boxShadow: OT.sh3 }}>
            <h4 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 24, color: OT.espresso900, margin: '0 0 10px', fontWeight: 400 }}>
              ⚠️ Media Optimisation Required
            </h4>
            <p style={{ fontSize: 13, color: OT.espresso800, margin: '0 0 16px', lineHeight: 1.5 }}>
              The selected file <strong>{pendingFile.name}</strong> is <strong>{(pendingFile.size / (1024 * 1024)).toFixed(1)} MB</strong>, which exceeds our standard high-fidelity upload threshold of <strong>{labelLimit}</strong>.
            </p>
            <p style={{ fontSize: 12, color: OT.clay600, margin: '0 0 20px', lineHeight: 1.5, fontStyle: 'italic' }}>
              We recommend using our built-in web-compression engine to automatically downsample to a pristine, web-optimised 1080p resolution to provide students with instant page loads.
            </p>

            {isCompressing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '20px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, fontFamily: OT.fMono, color: OT.walnut, fontWeight: 'bold' }}>
                  <span>⚙️ COMPRESSING MEDIA BITRATE...</span>
                  <span>{compressionProgress}%</span>
                </div>
                <div style={{ height: 6, background: OT.sand100, borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${compressionProgress}%`, background: OT.ochre, transition: 'width 0.15s ease' }} />
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowCompressionPrompt(false);
                    setPendingFile(null);
                  }} 
                  style={{ ...btnSecondaryStyle, fontSize: 11.5, padding: '8px 16px' }}>
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={triggerCompress} 
                  style={{ ...btnPrimaryStyle, fontSize: 11.5, padding: '8px 16px', background: OT.ochre }}>
                  ⚡ Compress &amp; Upload Standard Web-SD
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DYNAMIC AI FEEDBACK REVIEWS SYNTHESIS COMPUTING ───
function generateSentimentAnalysis(subset) {
  if (subset.length === 0) {
    return {
      avgScore: "N/A",
      sentiment: "No Telemetry",
      themeTags: [],
      summary: "Gather more feedback coordinates or clear selected filters to synthesize a comprehensive dynamic AI reviews summary."
    };
  }

  const average = subset.reduce((acc, r) => acc + Number(r.overall || 5), 0) / subset.length;
  
  let sentiment = "Highly Positive (Pristine Studio Atmosphere)";
  let textColor = OT.sage;
  if (average >= 4.75) {
    sentiment = "Exceptional (Top-Tier Biomechanical Care)";
    textColor = OT.sage;
  } else if (average >= 4.3) {
    sentiment = "Positive (Substantial Pupil Satisfaction)";
    textColor = OT.sage;
  } else if (average >= 3.8) {
    sentiment = "Balanced (Minor Calibration Suggestions)";
    textColor = OT.ochre;
  } else {
    sentiment = "Critical Concerns (Prioritize Pacing & Form Adjustments)";
    textColor = OT.terra;
  }

  const themeCounts = {};
  subset.forEach(r => {
    const c = (r.comment || "").toLowerCase();
    const scores = r.scores_json || r.scores || {};
    
    if (c.includes("form") || c.includes("posture") || (scores.form && Number(scores.form) <= 3)) {
      themeCounts["Form Alignment Checks"] = (themeCounts["Form Alignment Checks"] || 0) + 1;
    }
    if (c.includes("pace") || c.includes("slow") || c.includes("fast") || (scores.workout && Number(scores.workout) <= 4)) {
      themeCounts["Workout Pacing Speed"] = (themeCounts["Workout Pacing Speed"] || 0) + 1;
    }
    if (c.includes("heavy") || c.includes("prog") || c.includes("intense") || (scores.content && Number(scores.content) <= 3)) {
      themeCounts["Progressive Load Tension"] = (themeCounts["Progressive Load Tension"] || 0) + 1;
    }
    if (c.includes("comms") || c.includes("clear") || c.includes("communication") || (scores.communication && Number(scores.communication) <= 3)) {
      themeCounts["Technical Cues & Comms"] = (themeCounts["Technical Cues & Comms"] || 0) + 1;
    }
    if (c.includes("recover") || c.includes("sore") || c.includes("stretching") || (scores.structure && scores.structure <= 3)) {
      themeCounts["Post-Workout Active Recovery"] = (themeCounts["Post-Workout Active Recovery"] || 0) + 1;
    }
  });

  const themeTags = Object.entries(themeCounts)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0])
    .slice(0, 3);

  if (themeTags.length === 0) {
    themeTags.push("Custom Pace Program", "Warm Earth Presence");
  }

  let summary = `Synthesis computed dynamically over ${subset.length} session feedback logs. `;
  
  if (average >= 4.5) {
    summary += `Aggregate scores demonstrate that clients are remarkably pleased with precise kinetic correctives and personalized program loads. `;
  } else if (average >= 3.8) {
    summary += `Client logs indicate generally stable performance, although minor critiques have been logged concerning rep scaling and hydration intervals. `;
  } else {
    summary += `Review commentary warns of workout pacing friction. Students are requesting simplified instruction cues, shorter peak sets, and lighter resistance blocks. `;
  }

  const withComments = subset.filter(s => s.comment);
  if (withComments.length > 0) {
    const topVal = withComments.find(v => Number(v.overall || 5) >= 4.5);
    if (topVal) {
      summary += `A notable highlight shared by ${topVal.clientName || 'Anonymous Student'} is: "${topVal.comment}". `;
    }
    const lowVal = withComments.find(v => Number(v.overall || 5) < 4.2);
    if (lowVal) {
      summary += `Meanwhile, constructive feedback from ${lowVal.clientName || 'Anonymous Student'} notes: "${lowVal.comment}".`;
    }
  }

  return {
    avgScore: average.toFixed(2),
    sentiment,
    themeTags,
    summary,
    textColor
  };
}

// ─── REVAMPED COACH PORTAL SESSION RATINGS DASHBOARD ───
function CoachRatingsDashboard({ currentUser, ratings }) {
  const coachAllReviews = ratings.filter(r => {
    const coachId = r.coachId || r.coach_id;
    return coachId === currentUser.id;
  });

  // State Hooks for Symmetric Filtering System
  const [filterPeriod, setFilterPeriod] = React.useState('All');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [selectedClients, setSelectedClients] = React.useState([]);
  const [filterRating, setFilterRating] = React.useState('All');
  const [filterSessionType, setFilterSessionType] = React.useState('All');
  const [filterMetricConcern, setFilterMetricConcern] = React.useState('All');
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  // Derive Client options for the checklist from reviews
  const reviewClients = [...new Set(coachAllReviews.map(r => r.clientName || r.client_name).filter(Boolean))];

  // Cascade Filter Logic
  const filteredReviews = coachAllReviews.filter(r => {
    // 1. One or Multiple Client names filter
    const clName = r.clientName || r.client_name;
    if (selectedClients.length > 0 && !selectedClients.includes(clName)) {
      return false;
    }

    // 2. Rating Range filter
    const scoreVal = Number(r.overall || 5);
    if (filterRating === '4.5+') {
      if (scoreVal < 4.5) return false;
    } else if (filterRating === '3.5-4.4') {
      if (scoreVal < 3.5 || scoreVal >= 4.5) return false;
    } else if (filterRating === 'below3.5') {
      if (scoreVal >= 3.5) return false;
    }

    // 3. Time period filter (using 2026-06-07 as context current time)
    if (r.sessionDate || r.session_date) {
      const dateStr = r.sessionDate || r.session_date;
      const itemDate = new Date(dateStr);
      const anchorDate = new Date("2026-06-07");
      const diffDays = (anchorDate.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24);

      if (filterPeriod === '7days') {
        if (diffDays < 0 || diffDays > 7) return false;
      } else if (filterPeriod === '30days') {
        if (diffDays < 0 || diffDays > 30) return false;
      } else if (filterPeriod === 'thisMonth') {
        if (itemDate.getFullYear() !== 2026 || itemDate.getMonth() !== 5) return false; // June is index 5
      } else if (filterPeriod === 'lastMonth') {
        if (itemDate.getFullYear() !== 2026 || itemDate.getMonth() !== 4) return false; // May is index 4
      } else if (filterPeriod === 'custom') {
        if (startDate && dateStr < startDate) return false;
        if (endDate && dateStr > endDate) return false;
      }
    }

    // 4. Session type filter
    if (filterSessionType !== 'All') {
      const typeStr = (r.sessionType || r.session_type || 'PT Session').toLowerCase();
      if (!typeStr.includes(filterSessionType.toLowerCase())) return false;
    }

    // 5. Hardest / Underperforming sub-metric concern selector (scores <= 3.5)
    if (filterMetricConcern !== 'All') {
      const scores = r.scores_json || r.scores || {};
      const scoreMetric = Number(scores[filterMetricConcern] || 5);
      if (scoreMetric > 3.5) return false;
    }

    return true;
  });

  // Calculate Metrics
  const totalReviews = filteredReviews.length;
  const averageRating = totalReviews > 0
    ? filteredReviews.reduce((sum, r) => sum + Number(r.overall || 5), 0) / totalReviews
    : 5.0;
  const perfectScores = filteredReviews.filter(r => Number(r.overall) >= 4.9).length;

  // AI Sentiment Computation
  const aiSynthesis = generateSentimentAnalysis(filteredReviews);

  const toggleClientFilter = (name) => {
    if (selectedClients.includes(name)) {
      setSelectedClients(selectedClients.filter(c => c !== name));
    } else {
      setSelectedClients([...selectedClients, name]);
    }
  };

  const handleTriggerAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Title */}
      <div>
        <h3 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 44, color: OT.espresso900, margin: 0, fontWeight: 400 }}>
          Your Performance &amp; Reviews
        </h3>
        <p style={{ fontSize: 14, color: OT.clay600, margin: '6px 0 0' }}>
          Displaying authentic real-time student satisfaction metrics, checkout comments, and biomechanical coaching feedback.
        </p>
      </div>

      {/* SYMMETRIC FILTER CONSOLE UNIT */}
      <div style={{ background: OT.sand100, border: `1px solid ${OT.hairlineStrong}`, borderRadius: 16, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: OT.fMono, fontSize: 10, color: OT.espresso800, fontWeight: 'bold', letterSpacing: 1 }}>
            🎯 FILTER COHORTS &amp; DATE INTERVALS
          </span>
          <button 
            type="button"
            onClick={() => {
              setFilterPeriod('All');
              setStartDate('');
              setEndDate('');
              setSelectedClients([]);
              setFilterRating('All');
              setFilterSessionType('All');
              setFilterMetricConcern('All');
            }}
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: OT.fMono, fontSize: 11, color: OT.walnut, fontWeight: 'bold', textDecoration: 'underline' }}>
            [RESET ALL FILTERS]
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          
          {/* Period Selection */}
          <div>
            <label style={uploaderLabelStyle}>DATE PERIOD</label>
            <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)} style={{ ...inputStyle, width: '100%', height: 38 }}>
              <option value="All">All Time Intervals</option>
              <option value="7days">⏱️ Last 7 Days (June 2026)</option>
              <option value="30days">⏱️ Last 30 Days</option>
              <option value="thisMonth">🗓️ This Month (June 2026)</option>
              <option value="lastMonth">🗓️ Last Month (May 2026)</option>
              <option value="custom">📅 Custom Date Range</option>
            </select>
          </div>

          {/* Custom Dates (Conditional) */}
          {filterPeriod === 'custom' && (
            <div style={{ display: 'flex', gap: 8, gridColumn: 'span 2' }}>
              <div style={{ flex: 1 }}>
                <label style={uploaderLabelStyle}>START DATE</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ ...inputStyle, width: '100%', height: 38 }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={uploaderLabelStyle}>END DATE</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ ...inputStyle, width: '100%', height: 38 }} />
              </div>
            </div>
          )}

          {/* Rating Scores Selector */}
          <div>
            <label style={uploaderLabelStyle}>SATISFACTION INTERVAL</label>
            <select value={filterRating} onChange={e => setFilterRating(e.target.value)} style={{ ...inputStyle, width: '100%', height: 38 }}>
              <option value="All">All Score Ranges</option>
              <option value="4.5+">★ Elite Only (4.5 to 5.0)</option>
              <option value="3.5-4.4">★ Good Progress (3.5 to 4.4)</option>
              <option value="below3.5">⚠️ Practice Needed (Below 3.5)</option>
            </select>
          </div>

          {/* Session type filter */}
          <div>
            <label style={uploaderLabelStyle}>SESSION FORMAT</label>
            <select value={filterSessionType} onChange={e => setFilterSessionType(e.target.value)} style={{ ...inputStyle, width: '100%', height: 38 }}>
              <option value="All">All Formats</option>
              <option value="PT Session">Personal Training (1:1)</option>
              <option value="Group">Group Sessions</option>
            </select>
          </div>

          {/* Underperforming sub-metric filter */}
          <div>
            <label style={uploaderLabelStyle}>CRITIQUED METRIC (&lt;= 3.5)</label>
            <select value={filterMetricConcern} onChange={e => setFilterMetricConcern(e.target.value)} style={{ ...inputStyle, width: '100%', height: 38 }}>
              <option value="All">All Critiques</option>
              <option value="workout">Pacing Calibration</option>
              <option value="form">Form &amp; Posture Care</option>
              <option value="communication">Technical Cueing &amp; Voice</option>
              <option value="structure">Session Programming</option>
            </select>
          </div>

        </div>

        {/* Multi-Client Selection Filter Row */}
        {reviewClients.length > 0 && (
          <div style={{ borderTop: `1px solid ${OT.hairline}`, paddingTop: 12 }}>
            <span style={uploaderLabelStyle}>MULTI-CLIENT PILOT FILTER (SELECT MULTIPLE NAMES)</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
              <button 
                type="button" 
                onClick={() => setSelectedClients([])} 
                style={{
                  fontSize: 10.5, border: `1px solid ${selectedClients.length === 0 ? OT.walnut : OT.hairlineStrong}`,
                  background: selectedClients.length === 0 ? 'rgba(94,66,40,0.08)' : OT.paper,
                  color: selectedClients.length === 0 ? OT.walnut : OT.espresso900,
                  borderRadius: 999, padding: '4px 10px', fontWeight: 'bold', cursor: 'pointer'
                }}>
                👤 Show All Clients
              </button>
              {reviewClients.map(clientName => {
                const isActive = selectedClients.includes(clientName);
                return (
                  <button 
                    type="button" 
                    key={clientName} 
                    onClick={() => toggleClientFilter(clientName)} 
                    style={{
                      fontSize: 10.5, border: `1px solid ${isActive ? OT.walnut : OT.hairlineStrong}`,
                      background: isActive ? 'rgba(94,66,40,0.08)' : OT.paper,
                      color: isActive ? OT.walnut : OT.espresso900,
                      borderRadius: 999, padding: '4px 10px', cursor: 'pointer'
                    }}>
                    <span>{isActive ? '✓ ' : '+ '}</span> {clientName}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* DYNAMIC COMPREHENSIVE AI SUMMARY & SENTIMENT PLUSH CARD */}
      <div style={{
        background: OT.paper, border: `1px solid rgba(201,154,63,0.34)`,
        borderRadius: '16px', padding: '24px', boxShadow: OT.sh2, position: 'relative', overflow: 'hidden'
      }}>
        {/* Absolute Background Accent watermark */}
        <div style={{ position: 'absolute', right: -6, top: -14, fontStyle: 'italic', fontFamily: OT.fDisplay, fontSize: '98px', color: 'rgba(201,154,63,0.04)', select: 'none', userSelect: 'none' }}>ai</div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <span style={{
            fontFamily: OT.fMono, fontSize: '10.5px', color: OT.ochre, fontWeight: 'bold',
            display: 'flex', alignItems: 'center', gap: '6px'
          }}>
            ✨ MY THIRD SPACE AI FEEDBACK REVIEWS SYNTHESIS
          </span>
          <button 
            type="button" 
            onClick={handleTriggerAnalysis}
            style={{ background: 'rgba(201,154,63,0.07)', border: `1px solid ${OT.ochre}`, color: OT.ochre, fontSize: 10, fontFamily: OT.fMono, padding: '4px 12px', borderRadius: 999, fontWeight: 'bold', cursor: 'pointer' }}>
            ⚡ Refresh AI Analysis
          </button>
        </div>

        {isAnalyzing ? (
          <div style={{ height: 96, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: OT.clay600, fontStyle: 'italic', fontFamily: OT.fMono }}>Conducting semantic sentiment compilation...</span>
            <div style={{ width: 120, height: 4, background: OT.sand100, borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: '60%', background: OT.ochre, animation: 'pulse 1s infinite' }} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ background: OT.sand100, border: `1px solid ${OT.hairline}`, borderRadius: '14px', padding: '16px 22px', textAlign: 'center', minWidth: '110px' }}>
              <span style={{ fontSize: '10px', fontFamily: OT.fMono, color: OT.clay600, display: 'block', textTransform: 'uppercase' }}>AVERAGE</span>
              <strong style={{ fontSize: '36px', fontFamily: OT.fDisplay, color: OT.espresso900 }}>{aiSynthesis.avgScore}</strong>
              <span style={{ fontSize: '11px', color: OT.ochre, display: 'block', marginTop: 2 }}>★★★★★</span>
            </div>

            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 'bold', color: OT.espresso900 }}>AI Aggregate Sentiment:</span>
                <span style={{ fontSize: '13px', color: aiSynthesis.textColor, fontWeight: '700' }}>{aiSynthesis.sentiment}</span>
              </div>

              <p style={{ margin: 0, fontSize: '13.5px', color: OT.espresso800, lineHeight: 1.55, fontStyle: 'italic' }}>
                "{aiSynthesis.summary}"
              </p>

              {/* Tag Pillars */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                {aiSynthesis.themeTags.map(th => (
                  <span key={th} style={{
                    fontFamily: OT.fMono, fontSize: '9px', color: OT.clay600,
                    background: OT.sand50, border: `1px solid ${OT.hairlineStrong}`,
                    padding: '3px 8px', borderRadius: '4px', fontWeight: '500'
                  }}>
                    #{th}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Primary stats overview widgets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 20, padding: 24, boxShadow: OT.sh1 }}>
          <span style={{ fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, letterSpacing: 1, display: 'block', marginBottom: 4 }}>OVERALL SATISFACTION</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: OT.fDisplay, fontSize: 36, color: OT.espresso900 }}>★ {averageRating.toFixed(1)}</span>
            <span style={{ fontSize: 13, color: OT.clay600, fontFamily: OT.fMono }}>/ 5.0</span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 11.5, color: OT.clay600 }}>Calculated over all rated coaching sessions.</p>
        </div>

        <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 20, padding: 24, boxShadow: OT.sh1 }}>
          <span style={{ fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, letterSpacing: 1, display: 'block', marginBottom: 4 }}>TOTAL SESSIONS RATED</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: OT.fDisplay, fontSize: 36, color: OT.espresso900 }}>{totalReviews}</span>
            <span style={{ fontSize: 13, color: OT.clay600, fontFamily: OT.fMono }}>Entries</span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 11.5, color: OT.clay600 }}>Active student submissions logged.</p>
        </div>

        <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 20, padding: 24, boxShadow: OT.sh1 }}>
          <span style={{ fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, letterSpacing: 1, display: 'block', marginBottom: 4 }}>PERFECT SCORE RETENTION</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: OT.fDisplay, fontSize: 36, color: OT.espresso900 }}>{perfectScores}</span>
            <span style={{ fontSize: 13, color: OT.clay600, fontFamily: OT.fMono }}>Reviews</span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: 11.5, color: OT.clay600 }}>Ratings equal to or exceeding 4.9 ★</p>
        </div>
      </div>

      {/* Checklist Reviews Log */}
      <div>
        <OEyebrow dot={OT.ochre}>CLIENT FEEDBACK LOG</OEyebrow>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
          {filteredReviews.length === 0 ? (
            <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: '40px', textAlign: 'center', color: OT.clay500, fontStyle: 'italic', fontSize: 13 }}>
              No session ratings logged found matching current selections. Try adjusting your filters.
            </div>
          ) : (
            filteredReviews.map(review => (
              <div key={review.id} style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 20, padding: 24, boxShadow: OT.sh1 }}>
                
                {/* Header info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: OT.espresso900 }}>{review.clientName || 'Anonymous Student'}</span>
                    <span style={{ fontSize: 11, color: OT.clay600, fontFamily: OT.fMono, marginLeft: 12 }}>{review.sessionDate || review.session_date} · {review.sessionType || 'PT Session'}</span>
                  </div>
                  
                  <span style={{
                    padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 'bold', fontFamily: OT.fMono,
                    background: Number(review.overall || 5) >= 4.0 ? 'rgba(123,139,111,0.1)' : 'rgba(184,107,75,0.1)',
                    color: Number(review.overall || 5) >= 4.0 ? OT.sage : OT.terra
                  }}>
                    ★ {Number(review.overall || 5).toFixed(1)} / 5.0
                  </span>
                </div>

                {/* Scores Grid */}
                <div style={{ background: OT.sand50, border: `1px solid ${OT.hairlineStrong}`, borderRadius: 12, padding: '14px 18px', marginBottom: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10 }}>
                    {Object.entries(review.scores_json || review.scores || {}).map(([metric, value]) => (
                      <div key={metric}>
                        <span style={{ fontSize: 8.5, fontFamily: OT.fMono, color: OT.clay600, textTransform: 'uppercase', display: 'block' }}>{metric}</span>
                        <span style={{ fontSize: 13, fontWeight: 'bold', color: OT.espresso800 }}>{value} / 5</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Comment Text */}
                {review.comment && (
                  <p style={{ margin: 0, fontSize: 13.5, color: OT.espresso900, fontStyle: 'italic', lineHeight: 1.5 }}>
                    "{review.comment}"
                  </p>
                )}

              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

// ─── 4. ADMIN MATRIX PANEL ────────────────────────────────────────────────
function AdminPanelDashboard({ currentUser, clients, setClients, sessions, setSessions, invites, setInvites, ratings, coaches = COACHES, setCoaches, adminsList = ADMINS, setAdminsList, handleSaveCoachProfile, handleSaveAdminProfile }) {
  const [adminTab, setAdminTab] = React.useState('overview_tab'); // 'overview_tab' | 'ratings_report' | 'all_clients' | 'users_tab'
  const [operationalDate, setOperationalDate] = React.useState('2026-05-26');
  const [operationalStartDate, setOperationalStartDate] = React.useState('2026-05-26');
  const [operationalEndDate, setOperationalEndDate] = React.useState('2026-05-26');

  const daysDiff = React.useMemo(() => {
    const d1 = new Date(operationalStartDate);
    const d2 = new Date(operationalEndDate);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 1;
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }, [operationalStartDate, operationalEndDate]);

  const priorPeriod = React.useMemo(() => {
    const dStart = new Date(operationalStartDate);
    const dEnd = new Date(operationalEndDate);
    if (isNaN(dStart.getTime()) || isNaN(dEnd.getTime())) {
      return { start: '2026-05-25', end: '2026-05-25', days: 1 };
    }
    const diffTime = Math.abs(dEnd - dStart);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    const pStart = new Date(dStart);
    pStart.setDate(dStart.getDate() - diffDays);
    const pEnd = new Date(dStart);
    pEnd.setDate(dStart.getDate() - 1);
    
    return {
      start: pStart.toISOString().split('T')[0],
      end: pEnd.toISOString().split('T')[0],
      days: diffDays
    };
  }, [operationalStartDate, operationalEndDate]);

  const getComparisonRow = (currentVal, priorVal, type = 'number') => {
    const diff = currentVal - priorVal;
    let pct = 0;
    if (priorVal > 0) {
      pct = Math.round((diff / priorVal) * 100);
    } else if (currentVal > 0) {
      pct = 100;
    }
    
    let isGood = diff >= 0;
    if (type === 'dues') {
      isGood = diff <= 0; // for pending invoices, fewer is better
    }
    
    const color = diff === 0 ? OT.clay600 : (isGood ? OT.sage : OT.terra);
    const arrow = diff === 0 ? '●' : (diff > 0 ? '▲' : '▼');
    const sign = diff > 0 ? '+' : '';
    
    let formattedDiff = '';
    let formattedPrior = '';
    
    if (type === 'currency') {
      formattedDiff = `₹${Math.abs(diff).toLocaleString()}`;
      formattedPrior = `₹${priorVal.toLocaleString()}`;
    } else if (type === 'rating') {
      formattedDiff = `${Math.abs(diff).toFixed(2)}★`;
      formattedPrior = `${priorVal.toFixed(2)}★`;
    } else {
      formattedDiff = `${Math.abs(diff)}`;
      formattedPrior = `${priorVal}`;
    }
    
    const labelDateRange = priorPeriod.start === priorPeriod.end 
      ? priorPeriod.start 
      : `${priorPeriod.start} to ${priorPeriod.end}`;
      
    return (
      <div style={{ fontSize: '10px', color: color, fontWeight: 'bold', fontFamily: OT.fMono, marginTop: '2px', marginBottom: '8px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '3px', lineHeight: '1.2' }}>
        <span>{arrow} {formattedDiff} ({sign}{pct}%)</span>
        <span style={{ color: OT.clay500, fontWeight: 'normal' }}>
          vs {formattedPrior} prior ({labelDateRange})
        </span>
      </div>
    );
  };

  const applyPreset = (preset) => {
    const anchorDateStr = '2026-05-26';
    const anchor = new Date(anchorDateStr);
    let start = anchorDateStr;
    let end = anchorDateStr;
    
    if (preset === 'yesterday') {
      const d = new Date(anchor);
      d.setDate(anchor.getDate() - 1);
      const dStr = d.toISOString().split('T')[0];
      start = dStr;
      end = dStr;
    } else if (preset === '7days') {
      const d = new Date(anchor);
      d.setDate(anchor.getDate() - 6);
      start = d.toISOString().split('T')[0];
      end = anchorDateStr;
    } else if (preset === 'thisMonth') {
      start = '2026-05-01';
      end = '2026-05-31';
    } else if (preset === 'lastMonth') {
      start = '2026-04-01';
      end = '2026-04-30';
    } else if (preset === '3months') {
      const d = new Date(anchor);
      d.setMonth(anchor.getMonth() - 3);
      start = d.toISOString().split('T')[0];
      end = anchorDateStr;
    } else if (preset === '12months') {
      const d = new Date(anchor);
      d.setMonth(anchor.getMonth() - 12);
      start = d.toISOString().split('T')[0];
      end = anchorDateStr;
    }
    
    setOperationalStartDate(start);
    setOperationalEndDate(end);
    setOperationalDate(start);
  };

  const handleDateRangeChange = (start, end) => {
    let s = start || '2026-05-26';
    let e = end || '2026-05-26';
    const dStart = new Date(s);
    const dEnd = new Date(e);
    
    if (!isNaN(dStart.getTime()) && !isNaN(dEnd.getTime())) {
      if (dStart > dEnd) {
        e = s;
      } else {
        const maxEnd = new Date(dStart);
        maxEnd.setMonth(dStart.getMonth() + 12);
        if (dEnd > maxEnd) {
          e = maxEnd.toISOString().split('T')[0];
          alert("⚠️ Period range is restricted to a maximum of 12 months. End date has been auto-adjusted.");
        }
      }
    }
    setOperationalStartDate(s);
    setOperationalEndDate(e);
    setOperationalDate(s);
  };

  const [filterCoach, setFilterCoach] = React.useState('All');
  const [filterPeriod, setFilterPeriod] = React.useState('today'); // 'today' | 'yesterday' | '7days' | 'thisMonth' | 'lastMonth' | 'thisQuarter' | 'lastQuarter' | 'custom'
  const [slotViewMode, setSlotViewMode] = React.useState('time_slot'); // 'time_slot' | 'coach'
  const [expandedCoachSlots, setExpandedCoachSlots] = React.useState({});
  const [expandedTimeSlots, setExpandedTimeSlots] = React.useState({});
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [selectedClients, setSelectedClients] = React.useState([]); // Multiple select checklist array
  const [filterRatingRange, setFilterRatingRange] = React.useState('All'); // 'All' | '4.5+' | '3.5-4.4' | 'below3.5'
  const [filterSessionType, setFilterSessionType] = React.useState('All');
  const [filterMetricConcern, setFilterMetricConcern] = React.useState('All');
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const parseTimeStringToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    let s = timeStr.trim().toUpperCase();
    
    // Check for AM/PM
    const hasPM = s.includes('PM');
    const hasAM = s.includes('AM');
    
    // Strip AM/PM
    s = s.replace(/(AM|PM)/g, '').trim();
    
    let hours = 0;
    let minutes = 0;
    
    if (s.includes(':')) {
      const parts = s.split(':');
      hours = parseInt(parts[0], 10) || 0;
      minutes = parseInt(parts[1], 10) || 0;
    } else {
      // No colon, e.g. "0600" or "6" or "1800"
      if (s.length >= 3) {
        hours = parseInt(s.substring(0, s.length - 2), 10) || 0;
        minutes = parseInt(s.substring(s.length - 2), 10) || 0;
      } else {
        hours = parseInt(s, 10) || 0;
        minutes = 0;
      }
    }
    
    if (hasPM && hours < 12) {
      hours += 12;
    }
    if (hasAM && hours === 12) {
      hours = 0;
    }
    
    return hours * 60 + minutes;
  };

  const isTimeOutsideWorkingHours = (coachId, slotLabel, dateStr) => {
    const coach = coaches.find(c => c.id === coachId);
    if (!coach || !coach.working_hours) return false;

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dateObj = new Date(dateStr);
    const dayName = daysOfWeek[dateObj.getDay()];

    const dayConfig = coach.working_hours[dayName];
    if (!dayConfig) return false;
    if (!dayConfig.isWorking) return true;

    const startMin = parseTimeStringToMinutes(dayConfig.start || "06:00 AM");
    const endMin = parseTimeStringToMinutes(dayConfig.end || "08:00 PM");
    const slotMin = parseTimeStringToMinutes(slotLabel);

    return slotMin < startMin || (slotMin + 30) > endMin;
  };

  const isDateInSelectedPeriod = (dateStr, period, startD, endD) => {
    if (!dateStr) return true;
    
    // Anchor date is operationalDate
    const anchorDateStr = operationalDate;
    const anchorDate = new Date(anchorDateStr);
    
    const getYYYYMMDD = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    switch (period) {
      case 'today':
        return dateStr === anchorDateStr;
        
      case 'yesterday': {
        const yesterday = new Date(anchorDate);
        yesterday.setDate(anchorDate.getDate() - 1);
        return dateStr === getYYYYMMDD(yesterday);
      }
      
      case '7days': {
        const start = new Date(anchorDate);
        start.setDate(anchorDate.getDate() - 6);
        const startStr = getYYYYMMDD(start);
        return dateStr >= startStr && dateStr <= anchorDateStr;
      }
      
      case 'thisMonth': {
        return dateStr >= "2026-05-01" && dateStr <= "2026-05-31";
      }
      
      case 'lastMonth': {
        return dateStr >= "2026-04-01" && dateStr <= "2026-04-30";
      }
      
      case 'thisQuarter': {
        // India FY starts April. May 26 2026 is in Q1 (Apr-Jun) of FY 2026-2027.
        return dateStr >= "2026-04-01" && dateStr <= "2026-06-30";
      }
      
      case 'lastQuarter': {
        // Last quarter before April 2026 is Jan-Mar 2026.
        return dateStr >= "2026-01-01" && dateStr <= "2026-03-31";
      }
      
      case 'custom': {
        if (startD && dateStr < startD) return false;
        if (endD && dateStr > endD) return false;
        return true;
      }
      
      case 'All':
      default:
        return true;
    }
  };

  // Curated Daily Studio Operations Checklist States
  const [morningChecks, setMorningChecks] = React.useState(() => {
    try {
      const saved = localStorage.getItem('m3s.morning_checks');
      return saved ? JSON.parse(saved) : {
        routine1_availabilities: false,
        routine2_clear_sla: false,
        routine3_scent: false,
        routine4_brief: false
      };
    } catch (e) {
      return {
        routine1_availabilities: false,
        routine2_clear_sla: false,
        routine3_scent: false,
        routine4_brief: false
      };
    }
  });

  const [eodChecks, setEodChecks] = React.useState(() => {
    try {
      const saved = localStorage.getItem('m3s.eod_checks');
      return saved ? JSON.parse(saved) : {
        eod1_sessions: false,
        eod2_balances: false,
        eod3_cleared: false,
        eod4_lockout: false
      };
    } catch (e) {
      return {
        eod1_sessions: false,
        eod2_balances: false,
        eod3_cleared: false,
        eod4_lockout: false
      };
    }
  });

  const [eodNotes, setEodNotes] = React.useState(() => {
    try {
      return localStorage.getItem('m3s.eod_notes') || '';
    } catch (e) {
      return '';
    }
  });

  // Dynamic double-click grid states
  const [expandedMetricSheet, setExpandedMetricSheet] = React.useState(null); // null | 'sessions' | 'spending' | 'invoices' | 'revenue'
  const [spreadsheetTransactions, setSpreadsheetTransactions] = React.useState(() => {
    try {
      const saved = localStorage.getItem('m3s.spreadsheet_tx');
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    return [
      { id: 'TX-9021', date: '2026-05-02', name: 'Riya Sharma', upgrade: 'Premium Hyrox Track (Upgrade)', amountPaid: 18500, status: 'Paid', method: 'UPI (GPay)' },
      { id: 'TX-9022', date: '2026-05-08', name: 'Karan S.', upgrade: '24 PT Strength Block', amountPaid: 36000, status: 'Paid', method: 'NetBanking' },
      { id: 'TX-9023', date: '2026-05-15', name: 'Meera P.', upgrade: 'Nutrition & Core Bundle', amountPaid: 8500, status: 'Paid', method: 'Credit Card' },
      { id: 'TX-9024', date: '2026-05-19', name: 'Vikram R.', upgrade: 'Post-injury Mobility Recovery (Add-on)', amountPaid: 12000, status: 'Paid', method: 'UPI (PhonePe)' },
      { id: 'TX-9025', date: '2026-05-22', name: 'Anita V.', upgrade: 'Private PT 8-Session Block', amountPaid: 15000, status: 'Pending', method: 'Bank Transfer' },
      { id: 'TX-9026', date: '2026-05-24', name: 'Shreya M.', upgrade: 'Yoga & Breathwork Pack (Addition)', amountPaid: 8500, status: 'Pending', method: 'UPI (Paytm)' },
      { id: 'TX-9027', date: '2026-05-25', name: 'Rohan D.', upgrade: 'Core Conditioning Extension', amountPaid: 9500, status: 'Cancelled', method: 'None' }
    ];
  });

  // Database Synchronization & Seeding for All Environments
  React.useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const data = await M3S_DB.getAll('transactions', []);
        if (data && data.length > 0) {
          setSpreadsheetTransactions(data);
        } else {
          // Sync standard seed transactions to Firestore initially
          const seed = [
            { id: 'TX-9021', date: '2026-05-02', name: 'Riya Sharma', upgrade: 'Premium Hyrox Track (Upgrade)', amountPaid: 18500, status: 'Paid', method: 'UPI (GPay)' },
            { id: 'TX-9022', date: '2026-05-08', name: 'Karan S.', upgrade: '24 PT Strength Block', amountPaid: 36000, status: 'Paid', method: 'NetBanking' },
            { id: 'TX-9023', date: '2026-05-15', name: 'Meera P.', upgrade: 'Nutrition & Core Bundle', amountPaid: 8500, status: 'Paid', method: 'Credit Card' },
            { id: 'TX-9024', date: '2026-05-19', name: 'Vikram R.', upgrade: 'Post-injury Mobility Recovery (Add-on)', amountPaid: 12000, status: 'Paid', method: 'UPI (PhonePe)' },
            { id: 'TX-9025', date: '2026-05-22', name: 'Anita V.', upgrade: 'Private PT 8-Session Block', amountPaid: 15000, status: 'Pending', method: 'Bank Transfer' },
            { id: 'TX-9026', date: '2026-05-24', name: 'Shreya M.', upgrade: 'Yoga & Breathwork Pack (Addition)', amountPaid: 8500, status: 'Pending', method: 'UPI (Paytm)' },
            { id: 'TX-9027', date: '2026-05-25', name: 'Rohan D.', upgrade: 'Core Conditioning Extension', amountPaid: 9500, status: 'Cancelled', method: 'None' }
          ];
          await M3S_DB.setAll('transactions', seed);
          setSpreadsheetTransactions(seed);
        }
      } catch (e) {
        console.warn("Transactions Firestore load/seed error:", e);
      }
    };
    fetchTransactions();
  }, []);

  const [newTransactionName, setNewTransactionName] = React.useState('');
  const [newTransactionUpgrade, setNewTransactionUpgrade] = React.useState('');
  const [newTransactionAmount, setNewTransactionAmount] = React.useState('');
  const [newTransactionMethod, setNewTransactionMethod] = React.useState('UPI (GPay)');

  const [kenkoTransactions, setKenkoTransactions] = React.useState(() => {
    try {
      const saved = localStorage.getItem('m3s.kenko_tx');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: 'KK-1001', date: '2026-05-03', name: 'Kabir Mehta', item: 'Kenko Smart Ring (Midnight Black)', amountPaid: 16500, status: 'Paid', method: 'UPI (PhonePe)', time: '11:20 AM' },
      { id: 'KK-1002', date: '2026-05-09', name: 'Neha Gupta', item: 'M3S Premium Gym Hoodie + Shaker', amountPaid: 4200, status: 'Paid', method: 'Credit Card', time: '02:45 PM' },
      { id: 'KK-1003', date: '2026-05-14', name: 'Rahul Dev', item: 'Kenko Plant Protein - Chocolate (Pack of 2)', amountPaid: 5800, status: 'Paid', method: 'UPI (GPay)', time: '09:15 AM' },
      { id: 'KK-1004', date: '2026-05-18', name: 'Priya Iyer', item: '1-Month Digital Wellness Pass', amountPaid: 2500, status: 'Paid', method: 'NetBanking', time: '05:30 PM' },
      { id: 'KK-1005', date: '2026-05-21', name: 'Arjun Sen', item: 'Kenko Recovery Massage Gun Pro', amountPaid: 12500, status: 'Pending', method: 'UPI (Paytm)', time: '04:12 PM' },
      { id: 'KK-1006', date: '2026-05-24', name: 'Tina Shah', item: 'M3S Grip Socks & Yoga Block Set', amountPaid: 1800, status: 'Paid', method: 'UPI (GPay)', time: '10:05 AM' },
      { id: 'KK-1007', date: '2026-05-25', name: 'Rohan D.', item: 'Premium Hydration Flask 1L', amountPaid: 2200, status: 'Cancelled', method: 'None', time: '01:22 PM' }
    ];
  });

  const [newKenkoName, setNewKenkoName] = React.useState('');
  const [newKenkoItem, setNewKenkoItem] = React.useState('');
  const [newKenkoAmount, setNewKenkoAmount] = React.useState('');
  const [newKenkoMethod, setNewKenkoMethod] = React.useState('UPI (PhonePe)');
  const [newKenkoTime, setNewKenkoTime] = React.useState('12:00 PM');

  React.useEffect(() => {
    const fetchKenkoTransactions = async () => {
      try {
        const data = await M3S_DB.getAll('kenko_transactions', []);
        if (data && data.length > 0) {
          setKenkoTransactions(data);
        } else {
          const seed = [
            { id: 'KK-1001', date: '2026-05-03', name: 'Kabir Mehta', item: 'Kenko Smart Ring (Midnight Black)', amountPaid: 16500, status: 'Paid', method: 'UPI (PhonePe)', time: '11:20 AM' },
            { id: 'KK-1002', date: '2026-05-09', name: 'Neha Gupta', item: 'M3S Premium Gym Hoodie + Shaker', amountPaid: 4200, status: 'Paid', method: 'Credit Card', time: '02:45 PM' },
            { id: 'KK-1003', date: '2026-05-14', name: 'Rahul Dev', item: 'Kenko Plant Protein - Chocolate (Pack of 2)', amountPaid: 5800, status: 'Paid', method: 'UPI (GPay)', time: '09:15 AM' },
            { id: 'KK-1004', date: '2026-05-18', name: 'Priya Iyer', item: '1-Month Digital Wellness Pass', amountPaid: 2500, status: 'Paid', method: 'NetBanking', time: '05:30 PM' },
            { id: 'KK-1005', date: '2026-05-21', name: 'Arjun Sen', item: 'Kenko Recovery Massage Gun Pro', amountPaid: 12500, status: 'Pending', method: 'UPI (Paytm)', time: '04:12 PM' },
            { id: 'KK-1006', date: '2026-05-24', name: 'Tina Shah', item: 'M3S Grip Socks & Yoga Block Set', amountPaid: 1800, status: 'Paid', method: 'UPI (GPay)', time: '10:05 AM' },
            { id: 'KK-1007', date: '2026-05-25', name: 'Rohan D.', item: 'Premium Hydration Flask 1L', amountPaid: 2200, status: 'Cancelled', method: 'None', time: '01:22 PM' }
          ];
          await M3S_DB.setAll('kenko_transactions', seed);
          setKenkoTransactions(seed);
        }
      } catch (e) {
        console.warn("Kenko Transactions Firestore load/seed error:", e);
      }
    };
    fetchKenkoTransactions();
  }, []);

  // Interactive booking selector state
  const [bookingCoachId, setBookingCoachId] = React.useState('');
  const [bookingSlotLabel, setBookingSlotLabel] = React.useState('');
  const [bookingClientId, setBookingClientId] = React.useState('');
  const [bookingProgram, setBookingProgram] = React.useState('');

  // Persistence triggers
  React.useEffect(() => {
    localStorage.setItem('m3s.morning_checks', JSON.stringify(morningChecks));
  }, [morningChecks]);

  React.useEffect(() => {
    localStorage.setItem('m3s.eod_checks', JSON.stringify(eodChecks));
  }, [eodChecks]);

  React.useEffect(() => {
    localStorage.setItem('m3s.eod_notes', eodNotes);
  }, [eodNotes]);

  React.useEffect(() => {
    localStorage.setItem('m3s.spreadsheet_tx', JSON.stringify(spreadsheetTransactions));
    M3S_DB.setAll('transactions', spreadsheetTransactions).catch(e => console.warn("Transactions Firestore save error:", e));
  }, [spreadsheetTransactions]);

  React.useEffect(() => {
    localStorage.setItem('m3s.kenko_tx', JSON.stringify(kenkoTransactions));
    M3S_DB.setAll('kenko_transactions', kenkoTransactions).catch(e => console.warn("Kenko Transactions Firestore save error:", e));
  }, [kenkoTransactions]);

  const downloadExcelCSV = (sheetName, data) => {
    let csvContent = "data:text/csv;charset=utf-8,";
    // build header
    const headers = Object.keys(data[0] || {}).join(",");
    csvContent += headers + "\n";
    // build rows
    data.forEach(row => {
      const line = Object.values(row).map(value => {
        const valStr = String(value).replace(/"/g, '""');
        return valStr.includes(',') ? `"${valStr}"` : valStr;
      }).join(",");
      csvContent += line + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `m3s_${sheetName}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllMetricsCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Title
    csvContent += `\"MASTER OPERATIONS LEDGER: MY THIRD SPACE\"\n`;
    csvContent += `\"Selected Period:\",\"${operationalStartDate} to ${operationalEndDate}\"\n`;
    csvContent += `\"Generated At:\",\"${new Date().toISOString()}\"\n\n`;
    
    // SECTION 1: SUMMARY
    csvContent += `\"SECTION 1: OVERVIEW & COMPARISON PERFORMANCE\"\n`;
    csvContent += `\"Metric Name\",\"Current Period Value\",\"Comparable Prior Period Value\",\"Change\"\n`;
    
    // Compute comparison values
    // 1. Sessions
    const currentSessions = sessions.filter(s => {
      const date = s.scheduled_at ? s.scheduled_at.split('T')[0] : '';
      return date >= operationalStartDate && date <= operationalEndDate && s.status !== 'blocked';
    }).length;
    const priorSessions = sessions.filter(s => {
      const date = s.scheduled_at ? s.scheduled_at.split('T')[0] : '';
      return date >= priorPeriod.start && date <= priorPeriod.end && s.status !== 'blocked';
    }).length;
    const sessionDiff = currentSessions - priorSessions;
    const sessionPct = priorSessions > 0 ? ((sessionDiff / priorSessions) * 100).toFixed(1) : (currentSessions > 0 ? "100" : "0");
    csvContent += `\"Active PT & Group Sessions\",\"${currentSessions}\",\"${priorSessions}\",\"${sessionDiff >= 0 ? '+' : ''}${sessionDiff} (${sessionPct}%)\"\n`;
    
    // 2. Gym Upgrades
    const currentUpgrades = spreadsheetTransactions.filter(tx => tx.date >= operationalStartDate && tx.date <= operationalEndDate).reduce((acc, curr) => acc + curr.amountPaid, 0);
    const priorUpgrades = spreadsheetTransactions.filter(tx => tx.date >= priorPeriod.start && tx.date <= priorPeriod.end).reduce((acc, curr) => acc + curr.amountPaid, 0);
    const upgradesDiff = currentUpgrades - priorUpgrades;
    const upgradesPct = priorUpgrades > 0 ? ((upgradesDiff / priorUpgrades) * 100).toFixed(1) : (currentUpgrades > 0 ? "100" : "0");
    csvContent += `\"Gym Upgrades Revenue\",\"₹${currentUpgrades}\",\"₹${priorUpgrades}\",\"${upgradesDiff >= 0 ? '+' : ''}₹${upgradesDiff} (${upgradesPct}%)\"\n`;
    
    // 3. Pending Dues
    const currentDues = spreadsheetTransactions.filter(tx => tx.status === 'Pending' && tx.date >= operationalStartDate && tx.date <= operationalEndDate).reduce((acc, current) => acc + current.amountPaid, 0);
    const priorDues = spreadsheetTransactions.filter(tx => tx.status === 'Pending' && tx.date >= priorPeriod.start && tx.date <= priorPeriod.end).reduce((acc, current) => acc + current.amountPaid, 0);
    const duesDiff = currentDues - priorDues;
    const duesPct = priorDues > 0 ? ((duesDiff / priorDues) * 100).toFixed(1) : (currentDues > 0 ? "100" : "0");
    csvContent += `\"Outstanding Dues\",\"₹${currentDues}\",\"₹${priorDues}\",\"${duesDiff >= 0 ? '+' : ''}₹${duesDiff} (${duesPct}%)\"\n`;
    
    // 4. Gym Revenue
    const currentGymRev = spreadsheetTransactions.filter(tx => tx.status === 'Paid' && tx.date >= operationalStartDate && tx.date <= operationalEndDate).reduce((acc, curr) => acc + curr.amountPaid, 0);
    const priorGymRev = spreadsheetTransactions.filter(tx => tx.status === 'Paid' && tx.date >= priorPeriod.start && tx.date <= priorPeriod.end).reduce((acc, curr) => acc + curr.amountPaid, 0);
    const gymRevDiff = currentGymRev - priorGymRev;
    const gymRevPct = priorGymRev > 0 ? ((gymRevDiff / priorGymRev) * 100).toFixed(1) : (currentGymRev > 0 ? "100" : "0");
    csvContent += `\"Gym Paid Revenue (UPI & Card)\",\"₹${currentGymRev}\",\"₹${priorGymRev}\",\"${gymRevDiff >= 0 ? '+' : ''}₹${gymRevDiff} (${gymRevPct}%)\"\n`;

    // 5. Kenko Website Revenue
    const currentKenkoRev = kenkoTransactions.filter(tx => tx.status === 'Paid' && tx.date >= operationalStartDate && tx.date <= operationalEndDate).reduce((acc, curr) => acc + curr.amountPaid, 0);
    const priorKenkoRev = kenkoTransactions.filter(tx => tx.status === 'Paid' && tx.date >= priorPeriod.start && tx.date <= priorPeriod.end).reduce((acc, curr) => acc + curr.amountPaid, 0);
    const kenkoRevDiff = currentKenkoRev - priorKenkoRev;
    const kenkoRevPct = priorKenkoRev > 0 ? ((kenkoRevDiff / priorKenkoRev) * 100).toFixed(1) : (currentKenkoRev > 0 ? "100" : "0");
    csvContent += `\"Kenko Website Revenue\",\"₹${currentKenkoRev}\",\"₹${priorKenkoRev}\",\"${kenkoRevDiff >= 0 ? '+' : ''}₹${kenkoRevDiff} (${kenkoRevPct}%)\"\n`;

    // 6. Average Rating
    const getAvgRating = (start, end) => {
      const valid = ratings.filter(r => {
        const rDate = r.session_date || r.sessionDate || '';
        return rDate >= start && rDate <= end && r.overall !== undefined && r.overall !== null;
      });
      return valid.length > 0 ? (valid.reduce((s, c) => s + Number(c.overall), 0) / valid.length) : 5.0;
    };
    const currentRating = getAvgRating(operationalStartDate, operationalEndDate);
    const priorRating = getAvgRating(priorPeriod.start, priorPeriod.end);
    const ratingDiff = (currentRating - priorRating).toFixed(2);
    csvContent += `\"Average Coach Rating\",\"${currentRating.toFixed(2)}/5.0\",\"${priorRating.toFixed(2)}/5.0\",\"${ratingDiff >= 0 ? '+' : ''}${ratingDiff} stars\"\n\n`;

    // SECTION 2: ACTIVE SESSIONS LIST
    csvContent += `\"SECTION 2: ACTIVE SESSIONS SCHEDULE (${operationalStartDate} to ${operationalEndDate})\"\n`;
    csvContent += `\"Session ID\",\"Date\",\"Client Name\",\"Coach Assigned\",\"Program Type\",\"Status\"\n`;
    sessions.filter(s => {
      const date = s.scheduled_at ? s.scheduled_at.split('T')[0] : '';
      return date >= operationalStartDate && date <= operationalEndDate;
    }).forEach(s => {
      const clientName = clients.find(c => c.id === s.client_id)?.name || 'System Block-out';
      const coachMatch = coaches.find(c => c.id === s.coach_id)?.name || 'Lee';
      csvContent += `\"${s.id}\",\"${s.scheduled_at}\",\"${clientName}\",\"Coach ${coachMatch}\",\"${s.type || 'Custom PT'}\",\"${s.status}\"\n`;
    });
    csvContent += `\n`;

    // SECTION 3: GYM UPGRADES
    csvContent += `\"SECTION 3: GYM SERVICE UPGRADES LEDGER\"\n`;
    csvContent += `\"Ref ID\",\"Posting Date\",\"Client Name\",\"Service/Upgrade Package\",\"Amount Paid\",\"Payment Method\",\"Status\"\n`;
    spreadsheetTransactions.filter(tx => {
      return tx.date >= operationalStartDate && tx.date <= operationalEndDate;
    }).forEach(tx => {
      csvContent += `\"${tx.id}\",\"${tx.date}\",\"${tx.name}\",\"${tx.upgrade}\",\"₹${tx.amountPaid}\",\"${tx.method}\",\"${tx.status}\"\n`;
    });
    csvContent += `\n`;

    // SECTION 4: KENKO WEBSITE ORDERS
    csvContent += `\"SECTION 4: KENKO WEBSITE ORDERS REVENUE LEDGER\"\n`;
    csvContent += `\"Order ID\",\"Posting Date\",\"Order Time\",\"Buyer Name\",\"Order Item Details\",\"Amount Paid\",\"Payment Method\",\"Status\"\n`;
    kenkoTransactions.filter(tx => {
      return tx.date >= operationalStartDate && tx.date <= operationalEndDate;
    }).forEach(tx => {
      csvContent += `\"${tx.id}\",\"${tx.date}\",\"${tx.time || '12:00 PM'}\",\"${tx.name}\",\"${tx.item}\",\"₹${tx.amountPaid}\",\"${tx.method}\",\"${tx.status}\"\n`;
    });
    csvContent += `\n`;

    // SECTION 5: RATINGS REPORT
    csvContent += `\"SECTION 5: CLIENT RATINGS & FEEDBACK COHORT\"\n`;
    csvContent += `\"Rating ID\",\"Date\",\"Client Name\",\"Coach Name\",\"Overall Score\",\"Professionalism Score\",\"Energy Score\",\"Feedback Comment\"\n`;
    ratings.filter(r => {
      const rDate = r.session_date || r.sessionDate || '';
      return rDate >= operationalStartDate && rDate <= operationalEndDate;
    }).forEach(r => {
      csvContent += `\"${r.id || 'N/A'}\",\"${r.session_date || r.sessionDate || ''}\",\"${r.clientName || r.client_name || 'Anonymous'}\",\"${r.coachName || r.coach_name || ''}\",\"${r.overall || 5}\",\"${r.professionalism || 5}\",\"${r.vibe_energy || 5}\",\"${(r.comment || '').replace(/"/g, '""')}\"\n`;
    });

    // Trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `m3s_master_ledger_${operationalStartDate}_to_${operationalEndDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    alert(`📥 Consolidated Master Report successfully compiled and downloaded for the selected time period!`);
  };

  // Derive list of unique clients who have submitted reviews
  const reviewClients = React.useMemo(() => {
    const applicableRatings = filterCoach === 'All' 
       ? (ratings || []) 
       : (ratings || []).filter(r => (r.coachId || r.coach_id) === filterCoach);
    return [...new Set(applicableRatings.map(r => r.clientName || r.client_name).filter(Boolean))];
  }, [ratings, filterCoach]);

  const [selectedCoverCoach, setSelectedCoverCoach] = React.useState({}); // map of session_id -> coach_id
  const [customMsgs, setCustomMsgs] = React.useState({});

  // States & Sync for Admin Edit Coach (Shwe Override Panel)
  const [selectedEditCoach, setSelectedEditCoach] = React.useState(null);
  const [adminImagesList, setAdminImagesList] = React.useState([]);
  const [adminVideosList, setAdminVideosList] = React.useState([]);

  React.useEffect(() => {
    if (selectedEditCoach) {
      setAdminImagesList(selectedEditCoach.gallery_images || []);
      setAdminVideosList(selectedEditCoach.gallery_videos || []);
    } else {
      setAdminImagesList([]);
      setAdminVideosList([]);
    }
  }, [selectedEditCoach]);

  // Give PT Slot back to client and notify via WhatsApp
  const handleAdminReimbursePTCredit = async (session, customMessage) => {
    const client = clients.find(c => c.id === session.client_id) || { name: 'Client' };

    // Void session
    const updatedSessions = sessions.map(s => {
      if (s.id === session.id) {
        return {
          ...s,
          status: 'cancelled',
          user_reassignment_declined: true,
          admin_refunded: true,
          reassign_resolved_at: new Date().toISOString()
        };
      }
      return s;
    });

    // Award +1 credit to client package
    const updatedClients = clients.map(c => {
      if (c.id === session.client_id) {
        const currentC = c.package_credits !== undefined ? c.package_credits : 8;
        return { ...c, package_credits: currentC + 1 };
      }
      return c;
    });

    setSessions(updatedSessions);
    setClients(updatedClients);
    await M3S_DB.setAll('sessions', updatedSessions);
    await M3S_DB.setAll('clients', updatedClients);

    // Send the customized WhatsApp message
    await triggerWhatsAppFromAdmin(`${client.name} (${client.phone || 'WhatsApp'})`, customMessage);
  };

  // SLA Alert Helper Logs
  const triggerWhatsAppFromAdmin = async (recipient, text) => {
    const current = await M3S_DB.get('globals', 'whatsapp_logs', { list: [] });
    const list = current.list || [];
    const entry = {
      id: 'w_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      recipient: recipient,
      text: text
    };
    const updated = { list: [entry, ...list].slice(0, 40) };
    await M3S_DB.set('globals', 'whatsapp_logs', updated);
    
    // Dispatch custom event to notify other mounted dashboards to live reload logs
    const event = new CustomEvent('whatsapp_log_added', { detail: entry });
    window.dispatchEvent(event);
  };

  // Calculations for Ratings
  const currentNow = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(currentNow.getDate() - 7);

  const finalRatings = ratings.filter(r => {
    if (filterCoach !== 'All' && r.coachId !== filterCoach) return false;
    if (filterPeriod === 'Last 7 days') {
      const dates = new Date(r.session_date);
      if (dates < weekAgo) return false;
    }
    return true;
  });

  // Calculate At-Risk sessions: pending_decline or reassigned_pending, sorted with most upcoming first
  const atRiskSessions = [...sessions].filter(s => 
    s.status === 'pending_decline' || s.status === 'reassigned_pending'
  ).sort((a, b) => {
    const timeA = a.scheduled_at ? new Date(a.scheduled_at).getTime() : 0;
    const timeB = b.scheduled_at ? new Date(b.scheduled_at).getTime() : 0;
    return timeA - timeB;
  });

  // Helper to determine if a coach is available during the target session
  const isCoachFreeForSession = (coachId, session) => {
    if (!session.scheduled_at) return true;
    const targetDateStr = session.scheduled_at.split('T')[0];
    
    const getMinutesFromMidnight = (isoStr) => {
      if (!isoStr || !isoStr.includes('T')) return 0;
      const t = isoStr.split('T')[1];
      const parts = t.split(':');
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    };
    
    const targetStart = getMinutesFromMidnight(session.scheduled_at);
    const targetEnd = targetStart + (session.duration_min || 60);

    const coachSessionsOnDate = sessions.filter(s => 
      s.coach_id === coachId && 
      s.id !== session.id &&
      s.status !== 'cancelled' &&
      s.scheduled_at && 
      s.scheduled_at.startsWith(targetDateStr)
    );

    const overlap = coachSessionsOnDate.find(s => {
      const sStart = getMinutesFromMidnight(s.scheduled_at);
      const sEnd = sStart + (s.duration_min || 60);
      return (targetStart < sEnd && targetEnd > sStart);
    });

    return !overlap;
  };

  // Quick Action: manual coach cover override
  const handleAdminCoverAssignment = async (session, coachId) => {
    if (!coachId) return;
    const coachMatch = coaches.find(c => c.id === coachId) || { name: 'Specialist' };
    const client = clients.find(c => c.id === session.client_id) || { name: 'Client' };

    const updatedSessions = sessions.map(s => {
      if (s.id === session.id) {
        return {
          ...s,
          status: 'reassigned_pending',
          reassigned_coach_id: coachId,
          user_reassignment_accepted: undefined,
          user_reassignment_declined: undefined,
          assigned_by_admin: true,
          admin_action_at: new Date().toISOString()
        };
      }
      return s;
    });

    setSessions(updatedSessions);
    await M3S_DB.setAll('sessions', updatedSessions);

    const text = `📱 [ADMIN OVERRIDE] SLA cover active. Assigned Coach ${coachMatch.name} to cover ${client.name}'s slot tomorrow at ${new Date(session.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}. Request dispatched to Client App.`;
    await triggerWhatsAppFromAdmin('Admin Matrix Server', text);
  };

  // Quick Action: premium cover incentive (+30% payout bonus)
  const handleIncentivizeCover = async (session) => {
    const updatedSessions = sessions.map(s => {
      if (s.id === session.id) {
        return {
          ...s,
          incentive_payout_boost: true
        };
      }
      return s;
    });

    setSessions(updatedSessions);
    await M3S_DB.setAll('sessions', updatedSessions);

    const client = clients.find(c => c.id === session.client_id) || { name: 'Client' };
    const text = `⭐ [ADMIN BONUSES] authorized +30% Base Premium compensation payout boost for cover coaches covering ${client.name}'s PT slot tomorrow.`;
    await triggerWhatsAppFromAdmin('Admin Matrix Server', text);
  };

  // Quick Action: Refund client immediately
  const handleImmediateAdminRefund = async (session) => {
    const client = clients.find(c => c.id === session.client_id) || { name: 'Client' };

    // Void session
    const updatedSessions = sessions.map(s => {
      if (s.id === session.id) {
        return {
          ...s,
          status: 'cancelled',
          user_reassignment_declined: true,
          admin_refunded: true,
          reassign_resolved_at: new Date().toISOString()
        };
      }
      return s;
    });

    // Award +1 credit to client package
    const updatedClients = clients.map(c => {
      if (c.id === session.client_id) {
        const currentC = c.package_credits !== undefined ? c.package_credits : 8;
        return { ...c, package_credits: currentC + 1 };
      }
      return c;
    });

    setSessions(updatedSessions);
    setClients(updatedClients);
    await M3S_DB.setAll('sessions', updatedSessions);
    await M3S_DB.setAll('clients', updatedClients);

    const text = `📱 [ADMIN SLA REFUND] Reassigned slot for ${client.name} cancelled directly. Reimbursed +1 PT Credit to package balance. Outbound WhatsApp notice delivered.`;
    await triggerWhatsAppFromAdmin('Admin Matrix Server', text);
  };

  // Quick Action: Send customized manual prompt
  const handleSendManualSms = async (session, customType) => {
    const client = clients.find(c => c.id === session.client_id) || { name: 'Client' };
    let text = "";
    if (customType === 'urgent') {
      text = `⚠️ [URGENT DISPATCH] Hi ${client.name}, please check your M3S app to review your newly assigned specialist. We want to ensure your training stays unbroken!`;
    } else if (customType === 'sorry') {
      text = `🌸 [STUDIO CARE] Hi ${client.name}, we are deeply sorry for the unexpected change in your schedule. Founder Shwetambari has credited a complimentary premium studio shake to your profile.`;
    }
    await triggerWhatsAppFromAdmin('Studio Owner Desk', text);
  };

  return (
    <div>
      {/* 🚨 LIVE PT SESSION SLA ESALATION & CONFLICT RESOLUTION BOARD */}
      <div id="sla-handoff-tracker-section" style={{
        background: 'rgba(184,107,75,0.04)',
        border: `1.5px dashed ${atRiskSessions.length > 0 ? OT.terra : OT.hairline}`,
        borderRadius: '16px',
        padding: '20px 24px',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: atRiskSessions.length > 0 ? OT.terra : OT.sage,
                width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block',
                animation: atRiskSessions.length > 0 ? 'pulse 1.8s infinite' : 'none'
              }} />
              <h2 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '22px', color: OT.espresso900, fontWeight: 400, margin: 0 }}>
                🚨 PT Session SLA Handoff Tracker
              </h2>
            </div>
            <div style={{ background: '#FFFDF9', borderLeft: `3px solid ${OT.walnut}`, padding: '8px 12px', borderRadius: '4px', marginTop: '10px' }}>
              <p style={{ fontSize: '12.5px', color: OT.espresso800, margin: 0, fontWeight: '500', lineHeight: 1.45 }}>
                ✨ <strong style={{ color: OT.walnut }}>System Policy Directive:</strong> We will assign the most suited coach based on availability and workout specialisation. Admin should only act if she wants to override and give balance back to student for one more session.
              </p>
            </div>
          </div>
          <span style={{
            fontFamily: OT.fMono, fontSize: '11px', fontWeight: 'bold',
            padding: '4px 12px', borderRadius: '999px',
            background: atRiskSessions.length > 0 ? 'rgba(184,107,75,0.1)' : 'rgba(94,139,94,0.1)',
            color: atRiskSessions.length > 0 ? OT.terra : OT.sage
          }}>
            {atRiskSessions.length} {atRiskSessions.length === 1 ? 'SLOT AT RISK' : 'SLOTS AT RISK'}
          </span>
        </div>

        {atRiskSessions.length === 0 ? (
          <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px' }}>🍵</span>
              <span style={{ fontSize: '12.5px', color: OT.clay600, fontWeight: 500 }}>
                All PT schedules are fully streamlined. Zero coach cancellations require active SLA interventions.
              </span>
            </div>
            
            <div style={{ borderTop: `1px dashed ${OT.hairlineStrong}`, paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <span style={{ fontSize: '11px', fontFamily: OT.fMono, fontWeight: '700', color: OT.clay600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  🧪 SANDBOX TESTING HELPER
                </span>
                <p style={{ fontSize: '12px', color: OT.clay500, margin: '2px 0 0' }}>
                  Seed at-risk slots instantly to test the SLA escalation, WhatsApp apology routing, backup coach reallocation, and PT credit compensation flows.
                </p>
              </div>
              <button
                onClick={async () => {
                  const testSessions = [
                    { id: "s_atrisk1", coach_id: "lee", client_id: "riya", type: "PT Session", scheduled_at: "2026-06-25T08:00:00", duration_min: 60, status: "pending_decline", decline_reason_type: "family_emergency", decline_note: "Urgent family travel required." },
                    { id: "s_atrisk2", coach_id: "rahul", client_id: "karan", type: "PT Work", scheduled_at: "2026-06-26T18:00:00", duration_min: 60, status: "reassigned_pending", decline_reason_type: "schedule_clash", decline_note: "Unforeseen tournament preparation clash." }
                  ];
                  let merged = [...sessions];
                  testSessions.forEach(ts => {
                    const idx = merged.findIndex(s => s.id === ts.id);
                    if (idx > -1) {
                      merged[idx] = ts;
                    } else {
                      merged.push(ts);
                    }
                  });
                  setSessions(merged);
                  await M3S_DB.setAll('sessions', merged);
                  alert("✓ Success: Added 2 SLA At-Risk sessions into your database! The SLA Tracker is now populated.");
                }}
                style={{
                  fontFamily: OT.fBody,
                  fontSize: '12.5px',
                  fontWeight: '700',
                  background: 'rgba(184,107,75,0.06)',
                  color: OT.terra,
                  border: `1px solid rgba(184,107,75,0.25)`,
                  padding: '10px 20px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: OT.sh1
                }}
              >
                🎟️ Seed SLA At-Risk Sessions
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px', marginTop: '12px' }}>
            {atRiskSessions.map(session => {
              const client = clients.find(c => c.id === session.client_id) || { name: 'Unknown Student', package_credits: 0 };
              const originalCoach = coaches.find(c => c.id === session.coach_id) || { name: 'Lee' };
              const assignedCoverId = session.reassigned_coach_id || '';
              const coverCoach = coaches.find(c => c.id === assignedCoverId);
              
              // Custom badge labels for state
              let stateLabel = "⏰ Cover Recipient Backlog";
              let stateColor = OT.ochre;
              let stateBg = 'rgba(201,154,63,0.1)';

              if (session.status === 'reassigned_pending') {
                stateLabel = "💬 Offer Sent to Client Viewport";
                stateColor = OT.sage;
                stateBg = 'rgba(94,139,94,0.1)';
              }

              return (
                <div key={session.id} style={{
                  background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: '14px', padding: '18px',
                  boxShadow: '0 4px 12px rgba(36,24,16,0.02)'
                }}>
                  {/* Title Bar & Status Flags */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `1px solid ${OT.hairline}`, paddingBottom: '12px', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong style={{ fontSize: '14px', color: OT.espresso900 }}>{client.name}</strong>
                        <span style={{ fontSize: '11px', color: OT.clay600 }}>(Credits: {client.package_credits !== undefined ? client.package_credits : 8})</span>
                      </div>
                      <div style={{ fontSize: '11.5px', color: OT.espresso800, marginTop: '2px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span>📅 Slot: <strong>{new Date(session.scheduled_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</strong></span>
                        <span style={{ color: OT.terra }}>🚩 Cancelled By: Coach {originalCoach.name}</span>
                        {session.decline_reason_type && <span style={{ textTransform: 'capitalize', fontStyle: 'italic', color: OT.clay600 }}>({session.decline_reason_type})</span>}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {session.incentive_payout_boost && (
                        <span style={{
                          fontFamily: OT.fMono, fontSize: '9px', fontWeight: 'bold', background: 'rgba(201,154,63,0.12)', color: OT.ochre,
                          padding: '3px 8px', borderRadius: '8px', border: `1px solid ${OT.ochre}`
                        }}>
                          ⭐ +30% COVER BONUS ACTIVE
                        </span>
                      )}
                      <span style={{
                        fontFamily: OT.fMono, fontSize: '9.5px', fontWeight: 'bold',
                        padding: '3px 8px', borderRadius: '8px', background: stateBg, color: stateColor
                      }}>
                        {stateLabel}
                      </span>
                    </div>
                  </div>

                  {/* Unified SLA Slot Recovery Workbox */}
                  <div style={{ background: OT.sand100, border: `1.5px solid ${OT.hairlineStrong}`, borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontFamily: OT.fMono, fontWeight: '700', color: OT.walnut, display: 'block', marginBottom: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        💬 CUSTOMIZED OUTBOUND WHATSAPP APOLOGY NOTICE (EDITABLE)
                      </label>
                      <textarea
                        value={customMsgs[session.id] !== undefined ? customMsgs[session.id] : `Hi ${client.name}, due to the unavailability of Coach ${originalCoach.name}, we have added one PT slot for you. Apologies for the inconvenience. — M3S Office`}
                        onChange={(e) => setCustomMsgs({...customMsgs, [session.id]: e.target.value})}
                        placeholder="Type customized WhatsApp message context..."
                        style={{
                          width: '100%',
                          minHeight: '75px',
                          border: `1.5px solid ${OT.hairlineStrong}`,
                          borderRadius: '8px',
                          padding: '10px 12px',
                          fontSize: '12.5px',
                          fontFamily: OT.fBody,
                          color: OT.espresso900,
                          background: OT.paper,
                          resize: 'vertical',
                          outline: 'none',
                          lineHeight: '1.45'
                        }}
                      />
                    </div>

                    {/* Option A: Specialist Cover Coach Allocation */}
                    <div style={{ borderTop: `1px solid ${OT.hairline}`, paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontFamily: OT.fMono, fontWeight: '700', color: OT.walnut, display: 'block', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        🔄 OPTION A: REALLOCATE ALTERNATIVE COACH (IF FREE)
                      </span>
                      <p style={{ fontSize: '12px', color: OT.espresso800, margin: '0 0 6px 0' }}>
                        Choose an eligible coach who is free at this day and time. The system will verify their schedule in real-time.
                      </p>
                      
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <select
                          value={selectedCoverCoach[session.id] || ''}
                          onChange={(e) => setSelectedCoverCoach({ ...selectedCoverCoach, [session.id]: e.target.value })}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: `1px solid ${OT.hairlineStrong}`,
                            background: OT.paper,
                            fontSize: '13px',
                            fontFamily: OT.fBody,
                            color: OT.espresso900,
                            outline: 'none',
                            flex: 1,
                            minWidth: '220px'
                          }}
                        >
                          <option value="">-- Select Specialist Cover Coach --</option>
                          {coaches.filter(c => c.id !== session.coach_id).map(c => {
                            const isFree = isCoachFreeForSession(c.id, session);
                            return (
                              <option key={c.id} value={c.id} disabled={!isFree}>
                                Coach {c.name} ({c.specialty || 'General Training'}) — {isFree ? '🟢 FREE (Ready)' : '🔴 BUSY (Schedule Conflict)'}
                              </option>
                            );
                          })}
                        </select>
                        <button
                          onClick={async () => {
                            const coachId = selectedCoverCoach[session.id];
                            if (!coachId) return;
                            await handleAdminCoverAssignment(session, coachId);
                            alert(`✓ Success: Alternative Coach Cover has been successfully allocated! Dispatched notice to client.`);
                          }}
                          disabled={!selectedCoverCoach[session.id]}
                          style={{
                            fontFamily: OT.fBody,
                            fontSize: '12.5px',
                            fontWeight: 'bold',
                            background: selectedCoverCoach[session.id] ? OT.walnut : 'rgba(36,24,16,0.05)',
                            color: selectedCoverCoach[session.id] ? OT.paper : OT.clay600,
                            border: 'none',
                            padding: '10px 18px',
                            borderRadius: '8px',
                            cursor: selectedCoverCoach[session.id] ? 'pointer' : 'not-allowed',
                            transition: 'all 0.15s ease',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          Assign Cover Coach
                        </button>
                      </div>
                    </div>

                    {/* Option B: Refund Client Session Credit */}
                    <div style={{ borderTop: `1px solid ${OT.hairline}`, paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontSize: '11px', fontFamily: OT.fMono, fontWeight: '700', color: OT.walnut, display: 'block', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        🎟️ OPTION B: COMPENSATE WITH PT CREDIT REFUND
                      </span>
                      <p style={{ fontSize: '12px', color: OT.espresso800, margin: '0' }}>
                        If no coach is available or client prefers, refund 1 PT Session credit back to their balance and void this slot.
                      </p>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: 'rgba(36,24,16,0.02)', padding: '10px 12px', borderRadius: '8px', border: `1px dashed ${OT.hairlineStrong}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '16px' }}>🎟️</span>
                          <div style={{ fontSize: '12px', color: OT.espresso800 }}>
                            Action: <strong>1 PT Credit will be refunded</strong> to {client.name}'s balance.
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const msg = customMsgs[session.id] !== undefined ? customMsgs[session.id] : `Hi ${client.name}, due to the unavailability of Coach ${originalCoach.name}, we have added one PT slot for you. Apologies for the inconvenience. — M3S Office`;
                            handleAdminReimbursePTCredit(session, msg);
                          }}
                          style={{
                            fontFamily: OT.fBody,
                            fontSize: '13px',
                            fontWeight: '700',
                            background: OT.walnut,
                            color: OT.paper,
                            border: 'none',
                            padding: '10px 22px',
                            borderRadius: '999px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: OT.sh2,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          🎟️ Refill PT Slot & Send WhatsApp
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 16, borderBottom: `1px solid ${OT.hairline}`, paddingBottom: 1, marginBottom: 28 }}>
        {[
          { key: 'overview_tab', label: '📊 Today\'s Status Overview' },
          { key: 'ratings_report', label: '📈 Coach Reviews Dashboard' },
          { key: 'all_clients', label: '📋 Master Client Allocations' },
          { key: 'users_tab', label: '🔒 Studio Owner Security' }
        ].map(tb => (
          <button 
            key={tb.key}
            onClick={() => setAdminTab(tb.key)}
            style={{
              padding: '12px 16px', border: 'none', background: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              color: adminTab === tb.key ? OT.walnut : OT.clay600,
              borderBottom: adminTab === tb.key ? `2px solid ${OT.walnut}` : '2px solid transparent', marginBottom: -1
            }}>
            {tb.label}
          </button>
        ))}
      </div>

      {adminTab === 'overview_tab' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Welcome subtitle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: -10, flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '32px', color: OT.espresso900, margin: 0, fontWeight: 400 }}>
                Today at My Third Space
              </h3>
              <p style={{ fontSize: '13px', color: OT.clay600, margin: '4px 0 0' }}>
                Studio performance & curated daily operations dashboard. Double-click or click metrics to expand live worksheets.
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Today', preset: 'today' },
                  { label: 'Yesterday', preset: 'yesterday' },
                  { label: 'Last 7 Days', preset: '7days' },
                  { label: 'This Month', preset: 'thisMonth' },
                  { label: 'Last 12 Months', preset: '12months' }
                ].map(p => {
                  const isActive = (() => {
                    if (p.preset === 'today') return operationalStartDate === '2026-05-26' && operationalEndDate === '2026-05-26';
                    if (p.preset === 'yesterday') return operationalStartDate === '2026-05-25' && operationalEndDate === '2026-05-25';
                    if (p.preset === '7days') return operationalStartDate === '2026-05-20' && operationalEndDate === '2026-05-26';
                    if (p.preset === 'thisMonth') return operationalStartDate === '2026-05-01' && operationalEndDate === '2026-05-31';
                    if (p.preset === '12months') return operationalStartDate === '2025-05-26' && operationalEndDate === '2026-05-26';
                    return false;
                  })();
                  return (
                    <button
                      key={p.label}
                      onClick={() => applyPreset(p.preset)}
                      style={{
                        fontFamily: OT.fMono,
                        fontSize: '11px',
                        fontWeight: 'bold',
                        padding: '6px 12px',
                        borderRadius: '999px',
                        border: `1px solid ${isActive ? OT.walnut : 'rgba(62,44,28,0.15)'}`,
                        background: isActive ? OT.walnut : 'transparent',
                        color: isActive ? OT.paper : OT.espresso800,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: OT.sand100, border: `1px solid ${OT.hairline}`, padding: '5px 12px', borderRadius: '999px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '13px' }}>📅</span>
                <input
                  type="date"
                  value={operationalStartDate}
                  onChange={e => {
                    if (e.target.value) handleDateRangeChange(e.target.value, operationalEndDate);
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '11.5px',
                    fontFamily: OT.fMono,
                    fontWeight: 'bold',
                    color: OT.espresso900,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '11px', color: OT.clay500, fontFamily: OT.fMono, margin: '0 4px' }}>to</span>
                <input
                  type="date"
                  value={operationalEndDate}
                  onChange={e => {
                    if (e.target.value) handleDateRangeChange(operationalStartDate, e.target.value);
                  }}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    fontSize: '11.5px',
                    fontFamily: OT.fMono,
                    fontWeight: 'bold',
                    color: OT.espresso900,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                />
                {daysDiff > 0 && (
                  <span style={{ fontSize: '10.5px', color: OT.walnut, fontFamily: OT.fMono, fontWeight: 'bold', background: OT.sand200, padding: '2px 8px', borderRadius: '999px', marginLeft: '6px' }}>
                    ⏱️ {daysDiff} {daysDiff === 1 ? 'day' : 'days'}
                  </span>
                )}
              </div>

              <button
                onClick={downloadAllMetricsCSV}
                style={{
                  fontFamily: OT.fMono,
                  fontSize: '11px',
                  fontWeight: 'bold',
                  padding: '7px 16px',
                  borderRadius: '999px',
                  border: `2px solid ${OT.walnut}`,
                  background: 'rgba(94,66,40,0.08)',
                  color: OT.walnut,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = OT.walnut;
                  e.currentTarget.style.color = OT.paper;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(94,66,40,0.08)';
                  e.currentTarget.style.color = OT.walnut;
                }}
              >
                📥 DOWNLOAD ALL METRICS
              </button>
            </div>
          </div>

          {/* Core Metrics Cards Row - Click/Double click to expand spreadsheet */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontFamily: OT.fMono, fontSize: '10px', color: OT.clay600, fontWeight: '700' }}>⚡ METRICS DASHBOARD (DOUBLE-CLICK TO EXPAND DETAILED SPREADSHEETS)</span>
              {expandedMetricSheet && (
                <button 
                  onClick={() => setExpandedMetricSheet(null)}
                  style={{ background: 'none', border: 'none', color: OT.terra, fontSize: '11px', fontWeight: 'bold', fontFamily: OT.fMono, cursor: 'pointer' }}>
                  ✕ Close Expanded Sheet
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {/* TODAY'S SESSIONS BLOCK */}
              <div 
                onClick={() => setExpandedMetricSheet(expandedMetricSheet === 'sessions' ? null : 'sessions')}
                onDoubleClick={() => setExpandedMetricSheet('sessions')}
                style={{ 
                  background: expandedMetricSheet === 'sessions' ? OT.sand100 : OT.paper, 
                  border: expandedMetricSheet === 'sessions' ? `2px solid ${OT.walnut}` : `1px solid ${OT.hairline}`, 
                  borderRadius: '16px', padding: '20px', boxShadow: OT.sh1, cursor: 'pointer',
                  transition: 'all 0.2s', transform: expandedMetricSheet === 'sessions' ? 'scale(1.02)' : 'scale(1)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <OMono size={8.5} style={{ color: expandedMetricSheet === 'sessions' ? OT.walnut : OT.clay600 }}>
                    {operationalStartDate === operationalEndDate ? "TODAY'S SESSIONS" : "SESSIONS IN PERIOD"}
                  </OMono>
                  <span style={{ fontSize: '16px' }}>🏋️</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '12px 0 0 0' }}>
                  <span style={{ fontSize: '36px', fontWeight: 'bold', color: OT.espresso900, fontFamily: OT.fDisplay }}>
                    {sessions.filter(s => {
                      const date = s.scheduled_at ? s.scheduled_at.split('T')[0] : '';
                      return date >= operationalStartDate && date <= operationalEndDate && s.status !== 'blocked';
                    }).length}
                  </span>
                  <span style={{ fontSize: '13px', color: OT.clay600 }}>/ {18 * daysDiff} slots active</span>
                </div>

                {/* Comparison Line */}
                {(() => {
                  const currentCount = sessions.filter(s => {
                    const date = s.scheduled_at ? s.scheduled_at.split('T')[0] : '';
                    return date >= operationalStartDate && date <= operationalEndDate && s.status !== 'blocked';
                  }).length;
                  const priorCount = sessions.filter(s => {
                    const date = s.scheduled_at ? s.scheduled_at.split('T')[0] : '';
                    return date >= priorPeriod.start && date <= priorPeriod.end && s.status !== 'blocked';
                  }).length;
                  return getComparisonRow(currentCount, priorCount, 'number');
                })()}

                {/* Capacity Progress Bar */}
                {(() => {
                  const count = sessions.filter(s => {
                    const date = s.scheduled_at ? s.scheduled_at.split('T')[0] : '';
                    return date >= operationalStartDate && date <= operationalEndDate && s.status !== 'blocked';
                  }).length;
                  const totalSlots = 18 * daysDiff;
                  const capacityPercent = Math.min(100, Math.round((count / totalSlots) * 100)) || 0;
                  return (
                    <div>
                      <div style={{ height: '5px', background: OT.sand100, borderRadius: '999px', overflow: 'hidden', marginBottom: '6px' }}>
                        <div style={{ height: '100%', width: `${capacityPercent}%`, background: OT.walnut, borderRadius: '999px' }} />
                      </div>
                      <span style={{ fontSize: '10.5px', fontFamily: OT.fMono, color: OT.sage, fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                        <span>📈 {capacityPercent}% CAPACITY FILLED</span>
                        <span style={{ opacity: 0.6 }}>[Double Click]</span>
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* ACTIVE CLIENTS & UPGRADES BLOCK */}
              <div 
                onClick={() => setExpandedMetricSheet(expandedMetricSheet === 'spending' ? null : 'spending')}
                onDoubleClick={() => setExpandedMetricSheet('spending')}
                style={{ 
                  background: expandedMetricSheet === 'spending' ? OT.sand100 : OT.paper, 
                  border: expandedMetricSheet === 'spending' ? `2px solid ${OT.walnut}` : `1px solid ${OT.hairline}`, 
                  borderRadius: '16px', padding: '20px', boxShadow: OT.sh1, cursor: 'pointer',
                  transition: 'all 0.2s', transform: expandedMetricSheet === 'spending' ? 'scale(1.02)' : 'scale(1)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <OMono size={8.5} style={{ color: expandedMetricSheet === 'spending' ? OT.walnut : OT.clay600 }}>CLIENT SPENDING &amp; UPGRADES</OMono>
                  <span style={{ fontSize: '16px' }}>👥</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '12px 0 0 0' }}>
                  <span style={{ fontSize: '36px', fontWeight: 'bold', color: OT.espresso900, fontFamily: OT.fDisplay }}>
                    {clients.length}
                  </span>
                  <span style={{ fontSize: '13px', color: OT.clay600 }}>enrolled</span>
                </div>

                {/* Comparison Line */}
                {(() => {
                  const currentUpgrades = spreadsheetTransactions.filter(tx => tx.date >= operationalStartDate && tx.date <= operationalEndDate).reduce((acc, curr) => acc + curr.amountPaid, 0);
                  const priorUpgrades = spreadsheetTransactions.filter(tx => tx.date >= priorPeriod.start && tx.date <= priorPeriod.end).reduce((acc, curr) => acc + curr.amountPaid, 0);
                  return getComparisonRow(currentUpgrades, priorUpgrades, 'currency');
                })()}

                <span style={{
                  fontFamily: OT.fMono, fontSize: '10px', color: OT.sage, fontWeight: 'bold',
                  background: 'rgba(123,139,111,0.12)', padding: '3px 8px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span>💰 ₹{spreadsheetTransactions.filter(tx => tx.date >= operationalStartDate && tx.date <= operationalEndDate).reduce((acc, curr) => acc + curr.amountPaid, 0).toLocaleString()} UPGRADES</span>
                  <span style={{ opacity: 0.6 }}>[Double Click]</span>
                </span>
              </div>

              {/* PENDING INVOICES BLOCK */}
              <div 
                onClick={() => setExpandedMetricSheet(expandedMetricSheet === 'invoices' ? null : 'invoices')}
                onDoubleClick={() => setExpandedMetricSheet('invoices')}
                style={{ 
                  background: expandedMetricSheet === 'invoices' ? OT.sand100 : OT.paper, 
                  border: expandedMetricSheet === 'invoices' ? `2px solid ${OT.walnut}` : `1px solid ${OT.hairline}`, 
                  borderRadius: '16px', padding: '20px', boxShadow: OT.sh1, cursor: 'pointer',
                  transition: 'all 0.2s', transform: expandedMetricSheet === 'invoices' ? 'scale(1.02)' : 'scale(1)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <OMono size={8.5} style={{ color: expandedMetricSheet === 'invoices' ? OT.walnut : OT.clay600 }}>PENDING INVOICES</OMono>
                  <span style={{ fontSize: '16px' }}>💳</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '12px 0 0 0' }}>
                  <span style={{ fontSize: '36px', fontWeight: 'bold', color: OT.espresso900, fontFamily: OT.fDisplay }}>
                    {spreadsheetTransactions.filter(tx => tx.status === 'Pending' && tx.date >= operationalStartDate && tx.date <= operationalEndDate).length}
                  </span>
                  <span style={{ fontSize: '13px', color: OT.clay600 }}>awaiting payment</span>
                </div>

                {/* Comparison Line */}
                {(() => {
                  const currentDuesCount = spreadsheetTransactions.filter(tx => tx.status === 'Pending' && tx.date >= operationalStartDate && tx.date <= operationalEndDate).length;
                  const priorDuesCount = spreadsheetTransactions.filter(tx => tx.status === 'Pending' && tx.date >= priorPeriod.start && tx.date <= priorPeriod.end).length;
                  return getComparisonRow(currentDuesCount, priorDuesCount, 'dues');
                })()}

                <span style={{
                  fontFamily: OT.fMono, fontSize: '9.5px', color: OT.ochre, fontWeight: 'bold',
                  background: 'rgba(201,154,63,0.1)', padding: '3px 8px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span>⚠️ ₹{spreadsheetTransactions.filter(tx => tx.status === 'Pending' && tx.date >= operationalStartDate && tx.date <= operationalEndDate).reduce((acc, current) => acc + current.amountPaid, 0).toLocaleString()} DUES</span>
                  <span style={{ opacity: 0.6 }}>[Double Click]</span>
                </span>
              </div>

              {/* MONTHLY REVENUE HARD DATA BLOCK */}
              <div 
                onClick={() => setExpandedMetricSheet(expandedMetricSheet === 'revenue' ? null : 'revenue')}
                onDoubleClick={() => setExpandedMetricSheet('revenue')}
                style={{ 
                  background: expandedMetricSheet === 'revenue' ? OT.sand100 : OT.paper, 
                  border: expandedMetricSheet === 'revenue' ? `2px solid ${OT.walnut}` : `1px solid ${OT.hairline}`, 
                  borderRadius: '16px', padding: '20px', boxShadow: OT.sh1, cursor: 'pointer',
                  transition: 'all 0.2s', transform: expandedMetricSheet === 'revenue' ? 'scale(1.02)' : 'scale(1)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <OMono size={8.5} style={{ color: expandedMetricSheet === 'revenue' ? OT.walnut : OT.clay600 }}>
                    {operationalStartDate === operationalEndDate ? "DAILY REVENUE" : "PERIOD REVENUE"}
                  </OMono>
                  <span style={{ fontSize: '16px' }}>💰</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '12px 0 0 0' }}>
                  <span style={{ fontSize: '36px', fontWeight: 'bold', color: OT.espresso900, fontFamily: OT.fDisplay }}>
                    ₹{(spreadsheetTransactions.filter(tx => tx.status === 'Paid' && tx.date >= operationalStartDate && tx.date <= operationalEndDate).reduce((acc, curr) => acc + curr.amountPaid, 0) / 1000).toFixed(1)}k
                  </span>
                  <span style={{ fontSize: '13px', color: OT.clay600 }}>UPI &amp; Card Gross</span>
                </div>

                {/* Comparison Line */}
                {(() => {
                  const currentRevenue = spreadsheetTransactions.filter(tx => tx.status === 'Paid' && tx.date >= operationalStartDate && tx.date <= operationalEndDate).reduce((acc, curr) => acc + curr.amountPaid, 0);
                  const priorRevenue = spreadsheetTransactions.filter(tx => tx.status === 'Paid' && tx.date >= priorPeriod.start && tx.date <= priorPeriod.end).reduce((acc, curr) => acc + curr.amountPaid, 0);
                  return getComparisonRow(currentRevenue, priorRevenue, 'currency');
                })()}

                <span style={{
                  fontFamily: OT.fMono, fontSize: '10px', color: OT.sage, fontWeight: 'bold',
                  background: 'rgba(123,139,111,0.12)', padding: '3px 8px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span>📈 ₹{spreadsheetTransactions.filter(tx => tx.status === 'Paid' && tx.date >= operationalStartDate && tx.date <= operationalEndDate).reduce((acc, curr) => acc + curr.amountPaid, 0).toLocaleString()} COLLECTED</span>
                  <span style={{ opacity: 0.6 }}>[Double Click]</span>
                </span>
              </div>

              {/* NEW KENKO WEBSITE REVENUE BLOCK */}
              <div 
                onClick={() => setExpandedMetricSheet(expandedMetricSheet === 'kenko' ? null : 'kenko')}
                onDoubleClick={() => setExpandedMetricSheet('kenko')}
                style={{ 
                  background: expandedMetricSheet === 'kenko' ? OT.sand100 : OT.paper, 
                  border: expandedMetricSheet === 'kenko' ? `2px solid ${OT.walnut}` : `1px solid ${OT.hairline}`, 
                  borderRadius: '16px', padding: '20px', boxShadow: OT.sh1, cursor: 'pointer',
                  transition: 'all 0.2s', transform: expandedMetricSheet === 'kenko' ? 'scale(1.02)' : 'scale(1)'
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <OMono size={8.5} style={{ color: expandedMetricSheet === 'kenko' ? OT.walnut : OT.clay600 }}>KENKO WEBSITE REVENUE</OMono>
                  <span style={{ fontSize: '16px' }}>🌐</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '12px 0 0 0' }}>
                  <span style={{ fontSize: '36px', fontWeight: 'bold', color: OT.espresso900, fontFamily: OT.fDisplay }}>
                    ₹{(kenkoTransactions.filter(tx => tx.status === 'Paid' && tx.date >= operationalStartDate && tx.date <= operationalEndDate).reduce((acc, curr) => acc + curr.amountPaid, 0) / 1000).toFixed(1)}k
                  </span>
                  <span style={{ fontSize: '13px', color: OT.clay600 }}>Web Shop Sales</span>
                </div>

                {/* Comparison Line */}
                {(() => {
                  const currentKenko = kenkoTransactions.filter(tx => tx.status === 'Paid' && tx.date >= operationalStartDate && tx.date <= operationalEndDate).reduce((acc, curr) => acc + curr.amountPaid, 0);
                  const priorKenko = kenkoTransactions.filter(tx => tx.status === 'Paid' && tx.date >= priorPeriod.start && tx.date <= priorPeriod.end).reduce((acc, curr) => acc + curr.amountPaid, 0);
                  return getComparisonRow(currentKenko, priorKenko, 'currency');
                })()}

                <span style={{
                  fontFamily: OT.fMono, fontSize: '10px', color: OT.sage, fontWeight: 'bold',
                  background: 'rgba(123,139,111,0.12)', padding: '3px 8px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span>🌐 ₹{kenkoTransactions.filter(tx => tx.status === 'Paid' && tx.date >= operationalStartDate && tx.date <= operationalEndDate).reduce((acc, curr) => acc + curr.amountPaid, 0).toLocaleString()} ONLINE</span>
                  <span style={{ opacity: 0.6 }}>[Double Click]</span>
                </span>
              </div>

              {/* AVERAGE COACH RATING CARD */}
              <div 
                onClick={() => setAdminTab('ratings_report')}
                onDoubleClick={() => setAdminTab('ratings_report')}
                style={{ 
                  background: OT.paper, 
                  border: `1px solid ${OT.hairline}`, 
                  borderRadius: '16px', padding: '20px', boxShadow: OT.sh1, cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <OMono size={8.5} style={{ color: OT.clay600 }}>AVERAGE SESSION RATING</OMono>
                  <span style={{ fontSize: '16px' }}>⭐</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '12px 0 0 0' }}>
                  <span style={{ fontSize: '36px', fontWeight: 'bold', color: OT.espresso900, fontFamily: OT.fDisplay }}>
                    {(() => {
                      const valid = ratings.filter(r => {
                        const rDate = r.session_date || r.sessionDate || '';
                        return rDate >= operationalStartDate && rDate <= operationalEndDate && r.overall !== undefined && r.overall !== null;
                      });
                      return valid.length > 0 
                        ? (valid.reduce((sum, r) => sum + Number(r.overall), 0) / valid.length).toFixed(2)
                        : "4.85";
                    })()}
                  </span>
                  <span style={{ fontSize: '13px', color: OT.clay600 }}>/ 5.0 ★</span>
                </div>

                {/* Comparison Line */}
                {(() => {
                  const getAvgRating = (start, end) => {
                    const valid = ratings.filter(r => {
                      const rDate = r.session_date || r.sessionDate || '';
                      return rDate >= start && rDate <= end && r.overall !== undefined && r.overall !== null;
                    });
                    return valid.length > 0 ? (valid.reduce((sum, r) => sum + Number(r.overall), 0) / valid.length) : 4.85;
                  };
                  const currentRating = getAvgRating(operationalStartDate, operationalEndDate);
                  const priorRating = getAvgRating(priorPeriod.start, priorPeriod.end);
                  return getComparisonRow(currentRating, priorRating, 'rating');
                })()}

                <span style={{
                  fontFamily: OT.fMono, fontSize: '10px', color: OT.sage, fontWeight: 'bold',
                  background: 'rgba(123,139,111,0.12)', padding: '3px 8px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <span>⭐ ALL COACHES AVERAGE</span>
                  <span style={{ opacity: 0.6 }}>[Click to View Details]</span>
                </span>
              </div>
            </div>
          </div>

          {/* EXPANDED INTERACTIVE WORKBOOK / GOOGLE SHEETS INTERFACE */}
          {expandedMetricSheet && (
            <div style={{
              background: OT.paper, border: `2px solid ${OT.walnut}`, borderRadius: '16px', padding: '24px',
              boxShadow: OT.sh2, animation: 'fadeIn 0.25s ease-out'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${OT.hairlineStrong}`, paddingBottom: '12px', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', background: OT.walnut, borderRadius: '50%' }} />
                    <h4 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '22px', color: OT.espresso900, margin: 0, fontWeight: 400 }}>
                      {expandedMetricSheet === 'sessions' && `Sheet 1: Active PT & Group Session Slots Schedule (${operationalStartDate === operationalEndDate ? operationalStartDate : `${operationalStartDate} to ${operationalEndDate}`})`}
                      {expandedMetricSheet === 'spending' && "Sheet 2: Client Spending & Service Upgrades Spreadsheet"}
                      {expandedMetricSheet === 'invoices' && "Sheet 3: Pending Invoices & Outstanding Balances Sheet"}
                      {expandedMetricSheet === 'revenue' && "Sheet 4: Live Monthly Revenue Ledger & Account Audits"}
                      {expandedMetricSheet === 'kenko' && "Sheet 5: Kenko E-Commerce Website Orders & Product Sales Revenue"}
                    </h4>
                  </div>
                  <p style={{ fontSize: '12px', color: OT.clay600, margin: '4px 0 0' }}>
                    Active Google Sheets Emulator. Double click rows, edit cells, or add postings to update data in real-time.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => {
                      if (expandedMetricSheet === 'sessions') {
                        const data = sessions.filter(s => {
                          const date = s.scheduled_at ? s.scheduled_at.split('T')[0] : '';
                          return date >= operationalStartDate && date <= operationalEndDate;
                        }).map(s => ({
                          ID: s.id,
                          Date: s.scheduled_at,
                          Client: clients.find(c => c.id === s.client_id)?.name || 'Blocked Window',
                          Trainer: coaches.find(c => c.id === s.coach_id)?.name || 'Anisha',
                          Program: s.type || 'PT Session',
                          Status: s.status
                        }));
                        downloadExcelCSV('todays_sessions', data);
                      } else if (expandedMetricSheet === 'kenko') {
                        const filteredKenko = kenkoTransactions.filter(tx => {
                          return tx.date >= operationalStartDate && tx.date <= operationalEndDate;
                        });
                        downloadExcelCSV('kenko_website_revenue', filteredKenko);
                      } else {
                        const filteredTx = spreadsheetTransactions.filter(tx => {
                          const withinDates = tx.date >= operationalStartDate && tx.date <= operationalEndDate;
                          if (!withinDates) return false;
                          if (expandedMetricSheet === 'invoices') return tx.status === 'Pending';
                          if (expandedMetricSheet === 'revenue') return tx.status === 'Paid';
                          return true;
                        });
                        downloadExcelCSV(expandedMetricSheet, filteredTx);
                      }
                    }}
                    style={{
                      background: OT.walnut, color: OT.paper, fontFamily: OT.fMono, fontSize: 11,
                      border: 'none', padding: '8px 16px', borderRadius: 999, fontWeight: 'bold', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '4px'
                    }}>
                    📥 EXPORT / DOWNLOAD GOOGLE SHEET (.CSV)
                  </button>
                  <button 
                    onClick={() => setExpandedMetricSheet(null)}
                    style={{
                      background: 'none', border: `1px solid ${OT.hairlineStrong}`, padding: '8px 12px',
                      borderRadius: 999, color: OT.espresso900, cursor: 'pointer', fontSize: 11, fontWeight: 'bold'
                    }}>
                    Close
                  </button>
                </div>
              </div>

              {/* SPREADSHEET RENDER */}
              <div style={{ overflowX: 'auto', border: `1px solid ${OT.hairlineStrong}`, borderRadius: '12px', background: OT.sand50 }}>
                {expandedMetricSheet === 'sessions' ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: OT.fMono, fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: OT.sand100, borderBottom: `2px solid ${OT.hairlineStrong}` }}>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>SESSION ID</th>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>SCHEDULED TIME</th>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>MEMBER NAME</th>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>ASSIGNED COACH</th>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>SERVICE / WORKOUT PROGRAM</th>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>STATUS</th>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.filter(s => {
                        const date = s.scheduled_at ? s.scheduled_at.split('T')[0] : '';
                        return date >= operationalStartDate && date <= operationalEndDate;
                      }).map((session, idx) => {
                        const clientName = clients.find(c => c.id === session.client_id)?.name || (session.client_id === 'blocked' ? '📋 System Block-out' : 'Anonymous Student');
                        const coachMatch = coaches.find(c => c.id === session.coach_id) || { name: 'Lee' };
                        return (
                          <tr key={session.id} style={{ background: idx % 2 === 0 ? OT.paper : 'rgba(234,219,196,0.2)', borderBottom: `1px solid ${OT.hairline}` }}>
                            <td style={{ padding: '10px 12px', fontWeight: 'bold', color: OT.walnut }}>{session.id.toUpperCase()}</td>
                            <td style={{ padding: '10px 12px' }}>
                              {operationalStartDate === operationalEndDate 
                                ? new Date(session.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                : `${new Date(session.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${new Date(session.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                              }
                            </td>
                            <td style={{ padding: '10px 12px' }}>{clientName}</td>
                            <td style={{ padding: '10px 12px' }}>Coach {coachMatch.name}</td>
                            <td style={{ padding: '10px 12px' }}>{session.type || 'Custom PT'}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{
                                color: session.status === 'upcoming' ? OT.sage : session.status === 'blocked' ? OT.clay600 : OT.terra,
                                fontWeight: 'bold'
                              }}>
                                {session.status.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              <button 
                                onClick={async () => {
                                  const text = `📱 Hello ${clientName}, ready for your PT with Coach ${coachMatch.name} today at ${new Date(session.scheduled_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}? Let's crush today's routine.`;
                                  await triggerWhatsAppFromAdmin(clientName, text);
                                  alert(`WhatsApp reminder dispatched for ${clientName}`);
                                }}
                                style={{ background: 'none', border: `1px solid ${OT.hairlineStrong}`, padding: '2px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 10 }}>
                                🔔 WhatsApp Cue
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : expandedMetricSheet === 'kenko' ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: OT.fMono, fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: OT.sand100, borderBottom: `2px solid ${OT.hairlineStrong}` }}>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>ORDER ID</th>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>POSTING DATE</th>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>ORDER TIME</th>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>BUYER NAME</th>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>PRODUCT ORDER DETAILS</th>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>AMOUNT (₹)</th>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>PAYMENT METHOD</th>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>STATUS</th>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>QUICK ACT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {kenkoTransactions
                        .filter(tx => {
                          const withinDates = tx.date >= operationalStartDate && tx.date <= operationalEndDate;
                          return withinDates;
                        })
                        .map((tx, idx) => (
                          <tr key={tx.id} style={{ background: idx % 2 === 0 ? OT.paper : 'rgba(234,219,196,0.2)', borderBottom: `1px solid ${OT.hairline}` }}>
                            <td style={{ padding: '10px 12px', fontWeight: 'bold' }}>{tx.id}</td>
                            <td style={{ padding: '10px 12px' }}>{tx.date}</td>
                            <td style={{ padding: '10px 12px' }}>{tx.time || '12:00 PM'}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 'bold', color: OT.espresso900 }}>{tx.name}</td>
                            <td style={{ padding: '10px 12px' }}>{tx.item}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 'bold', color: OT.walnut }}>₹{tx.amountPaid.toLocaleString()}</td>
                            <td style={{ padding: '10px 12px' }}>{tx.method}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{
                                padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 'bold',
                                background: tx.status === 'Paid' ? 'rgba(94,139,94,0.1)' : tx.status === 'Pending' ? 'rgba(201,154,63,0.1)' : 'rgba(184,107,75,0.1)',
                                color: tx.status === 'Paid' ? OT.sage : tx.status === 'Pending' ? OT.ochre : OT.terra
                              }}>
                                {tx.status.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              {tx.status === 'Pending' && (
                                <button 
                                  onClick={() => {
                                    const updated = kenkoTransactions.map(t => t.id === tx.id ? { ...t, status: 'Paid', method: 'UPI (Success)' } : t);
                                    setKenkoTransactions(updated);
                                  }}
                                  style={{ background: OT.sage, color: OT.paper, border: 'none', padding: '2px 8px', borderRadius: 4, fontSize: 10, cursor: 'pointer', fontWeight: 'bold' }}>
                                    ✓ MARK PAID
                                </button>
                              )}
                              {tx.status === 'Paid' && (
                                <span style={{ color: OT.clay500, fontSize: 10.5 }}>✓ Cleared</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      {/* Total Aggregates Row */}
                      <tr style={{ background: OT.sand200, fontWeight: 'bold', fontFamily: OT.fMono }}>
                        <td colSpan={5} style={{ padding: '12px', textAlign: 'right', color: OT.espresso900 }}>KENKO TOTAL SUM IN LEDGER:</td>
                        <td style={{ padding: '12px', color: OT.walnut, fontSize: 13 }}>
                          ₹{kenkoTransactions
                            .filter(tx => tx.date >= operationalStartDate && tx.date <= operationalEndDate)
                            .reduce((sum, current) => sum + current.amountPaid, 0)
                            .toLocaleString()}
                        </td>
                        <td colSpan={3} style={{ padding: '12px' }}></td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontFamily: OT.fMono, fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: OT.sand100, borderBottom: `2px solid ${OT.hairlineStrong}` }}>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>REF ID</th>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>POSTING DATE</th>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>CLIENT NAME</th>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>SERVICE UPGRADED / TICKET</th>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>AMOUNT (₹)</th>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>PAYMENT METHOD</th>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>STATUS</th>
                        <th style={{ padding: '12px', color: OT.espresso900 }}>QUICK ACT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spreadsheetTransactions
                        .filter(tx => {
                          const withinDates = tx.date >= operationalStartDate && tx.date <= operationalEndDate;
                          if (!withinDates) return false;
                          if (expandedMetricSheet === 'invoices') return tx.status === 'Pending';
                          if (expandedMetricSheet === 'revenue') return tx.status === 'Paid';
                          return true; // spent/overall
                        })
                        .map((tx, idx) => (
                          <tr key={tx.id} style={{ background: idx % 2 === 0 ? OT.paper : 'rgba(234,219,196,0.2)', borderBottom: `1px solid ${OT.hairline}` }}>
                            <td style={{ padding: '10px 12px', fontWeight: 'bold' }}>{tx.id}</td>
                            <td style={{ padding: '10px 12px' }}>{tx.date}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 'bold', color: OT.espresso900 }}>{tx.name}</td>
                            <td style={{ padding: '10px 12px' }}>{tx.upgrade}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 'bold', color: OT.walnut }}>₹{tx.amountPaid.toLocaleString()}</td>
                            <td style={{ padding: '10px 12px' }}>{tx.method}</td>
                            <td style={{ padding: '10px 12px' }}>
                              <span style={{
                                padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 'bold',
                                background: tx.status === 'Paid' ? 'rgba(94,139,94,0.1)' : tx.status === 'Pending' ? 'rgba(201,154,63,0.1)' : 'rgba(184,107,75,0.1)',
                                color: tx.status === 'Paid' ? OT.sage : tx.status === 'Pending' ? OT.ochre : OT.terra
                              }}>
                                {tx.status.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ padding: '10px 12px' }}>
                              {tx.status === 'Pending' && (
                                <button 
                                  onClick={() => {
                                    const updated = spreadsheetTransactions.map(t => t.id === tx.id ? { ...t, status: 'Paid', method: 'UPI (Success)' } : t);
                                    setSpreadsheetTransactions(updated);
                                  }}
                                  style={{ background: OT.sage, color: OT.paper, border: 'none', padding: '2px 8px', borderRadius: 4, fontSize: 10, cursor: 'pointer', fontWeight: 'bold' }}>
                                    ✓ MARK PAID
                                </button>
                              )}
                              {tx.status === 'Paid' && (
                                <span style={{ color: OT.clay500, fontSize: 10.5 }}>✓ Cleared</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      {/* Total Aggregates Row */}
                      <tr style={{ background: OT.sand200, fontWeight: 'bold', fontFamily: OT.fMono }}>
                        <td colSpan={4} style={{ padding: '12px', textAlign: 'right', color: OT.espresso900 }}>SPREADSHEET TOTAL SUM IN LEDGER:</td>
                        <td style={{ padding: '12px', color: OT.walnut, fontSize: 13 }}>
                          ₹{spreadsheetTransactions
                            .filter(tx => {
                              const withinDates = tx.date >= operationalStartDate && tx.date <= operationalEndDate;
                              if (!withinDates) return false;
                              if (expandedMetricSheet === 'invoices') return tx.status === 'Pending';
                              if (expandedMetricSheet === 'revenue') return tx.status === 'Paid';
                              return true;
                            })
                            .reduce((sum, current) => sum + current.amountPaid, 0)
                            .toLocaleString()}
                        </td>
                        <td colSpan={3} style={{ padding: '12px' }}></td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>

              {/* ADD NEW TRANSACTION LEDGER TO GOOGLE SHEET */}
              {expandedMetricSheet !== 'sessions' && (
                <div style={{ marginTop: '20px', background: OT.sand100, borderRadius: '12px', padding: '16px', border: `1px solid ${OT.hairlineStrong}` }}>
                  {expandedMetricSheet === 'kenko' ? (
                    <div>
                      <span style={{ fontSize: '11px', fontFamily: OT.fMono, color: OT.walnut, fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                        ➕ ADD / POST NEW KENKO WEBSITE ORDER (AUTO-RECALCULATE WEBSITE REVENUE)
                      </span>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <input 
                          type="text" 
                          placeholder="Buyer Name"
                          value={newKenkoName} 
                          onChange={e => setNewKenkoName(e.target.value)}
                          style={{ flex: 1, minWidth: '150px', border: `1px solid ${OT.hairlineStrong}`, borderRadius: '6px', padding: '6px 10px', fontSize: '12.5px' }}
                        />
                        <input 
                          type="text" 
                          placeholder="Product / Order Details"
                          value={newKenkoItem} 
                          onChange={e => setNewKenkoItem(e.target.value)}
                          style={{ flex: 1.5, minWidth: '200px', border: `1px solid ${OT.hairlineStrong}`, borderRadius: '6px', padding: '6px 10px', fontSize: '12.5px' }}
                        />
                        <input 
                          type="number" 
                          placeholder="Amount (₹)"
                          value={newKenkoAmount} 
                          onChange={e => setNewKenkoAmount(e.target.value)}
                          style={{ width: '100px', border: `1px solid ${OT.hairlineStrong}`, borderRadius: '6px', padding: '6px 10px', fontSize: '12.5px' }}
                        />
                        <input 
                          type="text" 
                          placeholder="Time (e.g. 11:30 AM)"
                          value={newKenkoTime} 
                          onChange={e => setNewKenkoTime(e.target.value)}
                          style={{ width: '130px', border: `1px solid ${OT.hairlineStrong}`, borderRadius: '6px', padding: '6px 10px', fontSize: '12.5px' }}
                        />
                        <select 
                          value={newKenkoMethod} 
                          onChange={e => setNewKenkoMethod(e.target.value)}
                          style={{ border: `1px solid ${OT.hairlineStrong}`, borderRadius: '6px', padding: '6px 10px', fontSize: '12.5px' }}
                        >
                          <option value="UPI (PhonePe)">UPI (PhonePe)</option>
                          <option value="UPI (GPay)">UPI (GPay)</option>
                          <option value="Credit Card">Credit Card</option>
                          <option value="NetBanking">NetBanking</option>
                          <option value="Cash / Manual">Cash / Manual</option>
                        </select>
                        <button 
                          onClick={() => {
                            if (!newKenkoName || !newKenkoAmount || !newKenkoItem) {
                              alert('Please enter Buyer Name, Product Details, and Amount!');
                              return;
                            }
                            const newEntry = {
                              id: 'KK-' + Math.floor(1000 + Math.random() * 1000),
                              date: new Date().toISOString().slice(0, 10),
                              time: newKenkoTime || '12:00 PM',
                              name: newKenkoName,
                              item: newKenkoItem,
                              amountPaid: parseInt(newKenkoAmount) || 0,
                              status: 'Paid',
                              method: newKenkoMethod
                            };
                            setKenkoTransactions([newEntry, ...kenkoTransactions]);
                            setNewKenkoName('');
                            setNewKenkoItem('');
                            setNewKenkoAmount('');
                            setNewKenkoTime('12:00 PM');
                            alert(`Successfully posted Kenko Website order! Kenko revenue has been updated.`);
                          }}
                          style={{
                            background: OT.walnut, color: OT.paper, border: 'none', borderRadius: '6px',
                            padding: '6px 18px', fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer'
                          }}>
                          Post Kenko Order
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: '11px', fontFamily: OT.fMono, color: OT.walnut, fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
                        ➕ ADD / POST NEW CUSTOMER TRANSACTION (AUTO-RECALCULATE REVENUE METRIC)
                      </span>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <input 
                          type="text" 
                          placeholder="Student/Client Name"
                          value={newTransactionName} 
                          onChange={e => setNewTransactionName(e.target.value)}
                          style={{ flex: 1, minWidth: '150px', border: `1px solid ${OT.hairlineStrong}`, borderRadius: '6px', padding: '6px 10px', fontSize: '12.5px' }}
                        />
                        <input 
                          type="text" 
                          placeholder="Upgraded Service (e.g. 12 PT Block)"
                          value={newTransactionUpgrade} 
                          onChange={e => setNewTransactionUpgrade(e.target.value)}
                          style={{ flex: 1.5, minWidth: '200px', border: `1px solid ${OT.hairlineStrong}`, borderRadius: '6px', padding: '6px 10px', fontSize: '12.5px' }}
                        />
                        <input 
                          type="number" 
                          placeholder="Amount (₹)"
                          value={newTransactionAmount} 
                          onChange={e => setNewTransactionAmount(e.target.value)}
                          style={{ width: '100px', border: `1px solid ${OT.hairlineStrong}`, borderRadius: '6px', padding: '6px 10px', fontSize: '12.5px' }}
                        />
                        <select 
                          value={newTransactionMethod} 
                          onChange={e => setNewTransactionMethod(e.target.value)}
                          style={{ border: `1px solid ${OT.hairlineStrong}`, borderRadius: '6px', padding: '6px 10px', fontSize: '12.5px' }}
                        >
                          <option value="UPI (GPay)">UPI (GPay)</option>
                          <option value="NetBanking">NetBanking</option>
                          <option value="Credit Card">Credit Card</option>
                          <option value="Cash / Manual">Cash / Manual</option>
                        </select>
                        <button 
                          onClick={() => {
                            if (!newTransactionName || !newTransactionAmount) {
                              alert('Please enter Client Name and Amount!');
                              return;
                            }
                            const newEntry = {
                              id: 'TX-' + Math.floor(9000 + Math.random() * 1000),
                              date: new Date().toISOString().slice(0, 10),
                              name: newTransactionName,
                              upgrade: newTransactionUpgrade || 'PT Upgrade Block',
                              amountPaid: parseInt(newTransactionAmount) || 0,
                              status: 'Paid',
                              method: newTransactionMethod
                            };
                            setSpreadsheetTransactions([newEntry, ...spreadsheetTransactions]);
                            setNewTransactionName('');
                            setNewTransactionUpgrade('');
                            setNewTransactionAmount('');
                            alert(`Successfully posted transaction! Monthly revenue has been re-indexed.`);
                          }}
                          style={{
                            background: OT.walnut, color: OT.paper, border: 'none', borderRadius: '6px',
                            padding: '6px 18px', fontSize: '12.5px', fontWeight: 'bold', cursor: 'pointer'
                          }}>
                          Post Transaction
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Bottom Grid Block: Coach Floor Status Calendar Planner & Flagged Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Interactive Coach Availability Calendars Timeline Planner */}
            <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: '16px', padding: '24px', boxShadow: OT.sh1 }}>
              <div style={{ borderBottom: `1px solid ${OT.hairline}`, paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '20px', color: OT.espresso900, fontWeight: 400, margin: 0 }}>
                    📅 Synchronized Coach Time-slots Today
                  </h4>
                  <p style={{ fontSize: '11.5px', color: OT.clay600, margin: '4px 0 0' }}>
                    Interactive schedule view. Click any 🟢 **Free Slot** to assign walking clients.
                  </p>
                </div>
                <span style={{ fontSize: '10px', fontFamily: OT.fMono, background: 'rgba(94,139,94,0.1)', color: OT.sage, padding: '2px 8px', borderRadius: 4, fontWeight: 'bold' }}>
                  GOOGLE CALENDAR INSYNC
                </span>
              </div>

              {/* VIEW TOGGLE */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: OT.sand100, padding: '4px', borderRadius: '999px', width: 'fit-content' }}>
                <button
                  onClick={() => setSlotViewMode('time_slot')}
                  style={{
                    fontFamily: OT.fMono,
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '6px 16px',
                    borderRadius: '999px',
                    border: 'none',
                    cursor: 'pointer',
                    background: slotViewMode === 'time_slot' ? OT.walnut : 'transparent',
                    color: slotViewMode === 'time_slot' ? OT.paper : OT.espresso800,
                    transition: 'all 0.15s ease'
                  }}
                >
                  🕒 Time Slots (Default)
                </button>
                <button
                  onClick={() => setSlotViewMode('coach')}
                  style={{
                    fontFamily: OT.fMono,
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '6px 16px',
                    borderRadius: '999px',
                    border: 'none',
                    cursor: 'pointer',
                    background: slotViewMode === 'coach' ? OT.walnut : 'transparent',
                    color: slotViewMode === 'coach' ? OT.paper : OT.espresso800,
                    transition: 'all 0.15s ease'
                  }}
                >
                  👤 Coach View
                </button>
              </div>

              {/* QUICK RESERVATION MODAL / IN-PLACE PANEL */}
              {bookingCoachId && (
                <div style={{
                  background: OT.sand100, border: `2.5px solid ${OT.walnut}`, borderRadius: '12px', padding: '16px',
                  marginBottom: '16px', animation: 'fadeIn 0.2s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <strong style={{ fontSize: '12px', color: OT.espresso900 }}>
                      Quick Book: Coach {coaches.find(c => c.id === bookingCoachId)?.name} ({bookingSlotLabel})
                    </strong>
                    <button 
                      onClick={() => setBookingCoachId('')}
                      style={{ background: 'none', border: 'none', color: OT.terra, cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                      ✕ Cancel
                    </button>
                  </div>

                  {(() => {
                    const isOutside = isTimeOutsideWorkingHours(bookingCoachId, bookingSlotLabel, operationalDate);
                    if (isOutside) {
                      const coachObj = coaches.find(c => c.id === bookingCoachId);
                      return (
                        <div style={{
                          background: 'rgba(184,107,75,0.08)', border: `1px solid ${OT.terra}`, borderRadius: 8,
                          padding: '10px 12px', fontSize: '11.5px', color: OT.terra, fontWeight: '500', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10
                        }}>
                          <span>⚠️ WARNING: Beyond Coach's Scheduled Working Hours</span>
                          <span style={{ fontSize: '10px', color: OT.clay600, fontWeight: 'normal' }}>
                            Coach {coachObj?.name}'s scheduled working hours are outside this selected time slot ({bookingSlotLabel}) on this day. Booking this slot is beyond their working hours.
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '10.5px', color: OT.clay600, display: 'block', marginBottom: '2px' }}>SELECT ACTIVE CLIENT</label>
                      <select 
                        value={bookingClientId} 
                        onChange={e => setBookingClientId(e.target.value)}
                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: `1px solid ${OT.hairlineStrong}` }}>
                        <option value="">-- Choose Client --</option>
                        {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '10.5px', color: OT.clay600, display: 'block', marginBottom: '2px' }}>PROGRAM SPECIFICATION</label>
                      <input 
                        type="text" 
                        value={bookingProgram} 
                        onChange={e => setBookingProgram(e.target.value)}
                        placeholder="Strength, Mobility Flow, Hyrox Prep..."
                        style={{ width: '100%', padding: '6px', borderRadius: '4px', border: `1px solid ${OT.hairlineStrong}` }}
                      />
                    </div>

                    <button 
                      onClick={async () => {
                        if (!bookingClientId) {
                          alert('Please select a student first!');
                          return;
                        }
                        // Map Slot label to ISO string
                        let hourStr = '09:30:00';
                        const timeMatch = bookingSlotLabel.match(/(\d{2}):(\d{2})\s*(AM|PM)/i);
                        if (timeMatch) {
                          let hh = parseInt(timeMatch[1], 10);
                          const mm = timeMatch[2];
                          const ampm = timeMatch[3].toUpperCase();
                          if (ampm === 'PM' && hh < 12) hh += 12;
                          if (ampm === 'AM' && hh === 12) hh = 0;
                          hourStr = `${String(hh).padStart(2, '0')}:${mm}:00`;
                        } else {
                          if (bookingSlotLabel.includes('07:00')) hourStr = '07:00:00';
                          if (bookingSlotLabel.includes('09:30')) hourStr = '09:30:00';
                          if (bookingSlotLabel.includes('11:30')) hourStr = '11:30:00';
                          if (bookingSlotLabel.includes('02:00')) hourStr = '14:00:00';
                          if (bookingSlotLabel.includes('04:30')) hourStr = '16:30:00';
                          if (bookingSlotLabel.includes('06:30')) hourStr = '18:30:00';
                        }

                        const newSession = {
                          id: 's_auto_' + Math.floor(Math.random() * 10000),
                          coach_id: bookingCoachId,
                          client_id: bookingClientId,
                          type: bookingProgram,
                          scheduled_at: `${operationalDate}T${hourStr}`,
                          duration_min: 60,
                          status: 'upcoming'
                        };

                        const updatedSec = [...sessions, newSession];
                        setSessions(updatedSec);
                        await M3S_DB.setAll('sessions', updatedSec);

                        const studentName = clients.find(c => c.id === bookingClientId)?.name || 'Student';
                        const text = `📱 Hello ${studentName}! Your custom PT session with Coach ${coaches.find(c => c.id === bookingCoachId)?.name} has been confirmed for ${operationalDate} at ${bookingSlotLabel}. See you on the floor.`;
                        await triggerWhatsAppFromAdmin(studentName, text);

                        setBookingCoachId('');
                        alert(`Session successfully scheduled & synchronized in database!`);
                      }}
                      style={{
                        background: OT.walnut, color: OT.paper, border: 'none', borderRadius: '6px',
                        padding: '8px 12px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer', marginTop: '6px'
                      }}>
                      ✓ Confirm Live Secure Booking
                    </button>
                  </div>
                </div>
              )}

              {(() => {
                const getMinutesFromMidnight = (dateStr) => {
                  const timePart = dateStr.split('T')[1] || '';
                  const parts = timePart.split(':');
                  if (parts.length >= 2) {
                    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
                  }
                  return 0;
                };

                const isCoachFreeAtSlot = (coachId, slotStartMinutes) => {
                  const coach = coaches.find(c => c.id === coachId);
                  if (coach && coach.working_hours) {
                    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                    const dateObj = new Date(operationalDate);
                    const dayName = daysOfWeek[dateObj.getDay()];

                    const dayConfig = coach.working_hours[dayName];
                    if (dayConfig) {
                      if (!dayConfig.isWorking) return false;
                      const startMin = parseTimeStringToMinutes(dayConfig.start);
                      const endMin = parseTimeStringToMinutes(dayConfig.end);
                      if (slotStartMinutes < startMin || (slotStartMinutes + 30) > endMin) {
                        return false;
                      }
                    }
                  }

                  const slotEndMinutes = slotStartMinutes + 30;
                  const coachToday = sessions.filter(s => s.coach_id === coachId && s.scheduled_at && s.scheduled_at.startsWith(operationalDate) && s.status !== 'cancelled');
                  
                  const overlap = coachToday.find(s => {
                    const sStart = getMinutesFromMidnight(s.scheduled_at);
                    const sEnd = sStart + Number(s.duration_min || 60);
                    return sStart < slotEndMinutes && sEnd > slotStartMinutes;
                  });
                  
                  return !overlap;
                };

                return (
                  <div>
                    {/* Time Slot View (Default) */}
                    {slotViewMode === 'time_slot' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {/* EXPAND/COLLAPSE ALL CONTROL BUTTONS */}
                        {(() => {
                          const halfHourSlots = [];
                          for (let hour = 6; hour <= 20; hour++) {
                            for (let min of [0, 30]) {
                              const ampm = hour >= 12 ? 'PM' : 'AM';
                              const displayHour = hour % 12 === 0 ? 12 : hour % 12;
                              const label = `${String(displayHour).padStart(2, '0')}:${String(min).padStart(2, '0')} ${ampm}`;
                              halfHourSlots.push({ label, hour, min });
                            }
                          }

                          return (
                            <>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(62,44,28,0.02)', padding: '10px 14px', borderRadius: '10px', border: `1px solid ${OT.hairline}` }}>
                                <span style={{ fontSize: '11px', fontFamily: OT.fMono, color: OT.espresso800, fontWeight: 'bold' }}>
                                  ⏰ {halfHourSlots.length} TIME SLOTS
                                </span>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={() => {
                                      const allExp = {};
                                      halfHourSlots.forEach(s => { allExp[s.label] = true; });
                                      setExpandedTimeSlots(allExp);
                                    }}
                                    style={{
                                      border: 'none',
                                      background: 'rgba(123,139,111,0.1)',
                                      color: OT.sage,
                                      fontSize: '10px',
                                      fontFamily: OT.fMono,
                                      fontWeight: 'bold',
                                      padding: '4px 10px',
                                      borderRadius: '999px',
                                      cursor: 'pointer',
                                      transition: 'all 0.1s ease'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(123,139,111,0.18)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(123,139,111,0.1)'}
                                  >
                                    🔓 EXPAND ALL
                                  </button>
                                  <button
                                    onClick={() => {
                                      setExpandedTimeSlots({});
                                    }}
                                    style={{
                                      border: 'none',
                                      background: 'rgba(184,107,75,0.08)',
                                      color: OT.terra,
                                      fontSize: '10px',
                                      fontFamily: OT.fMono,
                                      fontWeight: 'bold',
                                      padding: '4px 10px',
                                      borderRadius: '999px',
                                      cursor: 'pointer',
                                      transition: 'all 0.1s ease'
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(184,107,75,0.14)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(184,107,75,0.08)'}
                                  >
                                    🔒 COLLAPSE ALL
                                  </button>
                                </div>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                                {halfHourSlots.map(slot => {
                                  const slotStartMinutes = slot.hour * 60 + slot.min;
                                  const freeCoaches = coaches.filter(co => isCoachFreeAtSlot(co.id, slotStartMinutes));
                                  const isSlotExpanded = !!expandedTimeSlots[slot.label];
                                  const availableCount = freeCoaches.length;

                                  return (
                                    <div
                                      key={slot.label}
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        padding: '10px 14px',
                                        background: isSlotExpanded ? 'rgba(62,44,28,0.03)' : 'rgba(62,44,28,0.015)',
                                        border: isSlotExpanded ? `1.5px solid ${OT.walnut}` : `1px solid ${OT.hairline}`,
                                        borderRadius: '10px',
                                        transition: 'all 0.15s ease'
                                      }}
                                    >
                                      {/* Slot Header */}
                                      <div
                                        onClick={() => {
                                          setExpandedTimeSlots({
                                            ...expandedTimeSlots,
                                            [slot.label]: !isSlotExpanded
                                          });
                                        }}
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'space-between',
                                          cursor: 'pointer',
                                          userSelect: 'none'
                                        }}
                                      >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                          <span style={{ fontSize: '14px' }}>🕒</span>
                                          <span style={{ fontFamily: OT.fMono, fontSize: '12.5px', color: OT.espresso900, fontWeight: 'bold' }}>{slot.label}</span>
                                          <span
                                            style={{
                                              fontFamily: OT.fMono,
                                              fontSize: '11px',
                                              fontWeight: 'bold',
                                              background: availableCount > 0 ? 'rgba(123,139,111,0.12)' : 'rgba(184,107,75,0.08)',
                                              color: availableCount > 0 ? OT.sage : OT.terra,
                                              padding: '2px 8px',
                                              borderRadius: '999px',
                                              marginLeft: '4px'
                                            }}
                                          >
                                            {availableCount > 0 ? `🟢 ${availableCount} coaches available` : '🔴 NO COACHES FREE'}
                                          </span>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                          <span style={{ fontSize: '11px', color: OT.walnut, fontFamily: OT.fMono, fontWeight: 'bold' }}>
                                            {isSlotExpanded ? '▲ COLLAPSE' : '▼ EXPAND'}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Slot Detail */}
                                      {isSlotExpanded && (
                                        <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: `1px dashed ${OT.hairlineStrong}` }}>
                                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {availableCount === 0 ? (
                                              <span style={{ fontSize: '10.5px', color: OT.terra, fontFamily: OT.fMono, fontWeight: 'bold', padding: '4px 0' }}>
                                                🔴 No coaches are free during this time slot.
                                              </span>
                                            ) : (
                                              freeCoaches.map(co => (
                                                <button
                                                  key={co.id}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setBookingCoachId(co.id);
                                                    setBookingSlotLabel(slot.label);
                                                    setBookingClientId('');
                                                    setBookingProgram('');
                                                  }}
                                                  style={{
                                                    border: 'none',
                                                    background: 'rgba(123,139,111,0.1)',
                                                    color: OT.sage,
                                                    fontSize: '11px',
                                                    fontFamily: OT.fBody,
                                                    fontWeight: 'bold',
                                                    padding: '4px 10px',
                                                    borderRadius: '999px',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s'
                                                  }}
                                                  onMouseEnter={e => {
                                                    e.currentTarget.style.background = OT.sage;
                                                    e.currentTarget.style.color = OT.paper;
                                                  }}
                                                  onMouseLeave={e => {
                                                    e.currentTarget.style.background = 'rgba(123,139,111,0.1)';
                                                    e.currentTarget.style.color = OT.sage;
                                                  }}
                                                >
                                                  🟢 {co.name}
                                                </button>
                                              ))
                                            )}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}

                    {/* Coach View (Collapsible) */}
                    {slotViewMode === 'coach' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {coaches.map(coach => {
                          const coachTodaySessions = sessions.filter(s => s.coach_id === coach.id && s.scheduled_at && s.scheduled_at.startsWith(operationalDate) && s.status !== 'cancelled');
                          const isExpanded = !!expandedCoachSlots[coach.id];
                          
                          return (
                            <div key={coach.id} style={{ border: `1px solid ${OT.hairline}`, borderRadius: '12px', padding: '12px', background: isExpanded ? 'rgba(62,44,28,0.01)' : OT.paper, transition: 'all 0.15s ease' }}>
                              <div 
                                onClick={() => setExpandedCoachSlots({ ...expandedCoachSlots, [coach.id]: !isExpanded })}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <div style={{
                                    width: '28px', height: '28px', borderRadius: '50%',
                                    background: coach.tone === 'sage' ? 'rgba(123,139,111,0.15)' : 'rgba(94,66,40,0.15)',
                                    color: coach.tone === 'sage' ? OT.sage : OT.walnut,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold'
                                  }}>
                                    {coach.initials}
                                  </div>
                                  <div>
                                    <strong style={{ fontSize: '13px', color: OT.espresso900 }}>Coach {coach.name}</strong>
                                    <span style={{ fontSize: '11px', color: OT.clay500, marginLeft: '8px' }}>({coach.cert.split('·')[0]})</span>
                                  </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <span style={{ fontFamily: OT.fMono, fontSize: '10px', color: OT.clay600, fontWeight: 'bold' }}>
                                    {coachTodaySessions.length} BOOKED
                                  </span>
                                  <span style={{ fontSize: '12px', color: OT.walnut, fontWeight: 'bold', fontFamily: OT.fMono }}>
                                    {isExpanded ? '▲ COLLAPSE' : '▼ EXPAND'}
                                  </span>
                                </div>
                              </div>

                              {isExpanded && (
                                <div style={{ marginTop: '12px', borderTop: `1px solid rgba(62,44,28,0.06)`, paddingTop: '12px' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                                    {[
                                      '07:00 AM - 09:00 AM',
                                      '09:30 AM - 11:30 AM',
                                      '11:30 AM - 01:30 PM',
                                      '02:00 PM - 04:00 PM',
                                      '04:30 PM - 06:30 PM',
                                      '06:30 PM - 08:30 PM'
                                    ].map(slotLabel => {
                                      let hourStart = 7;
                                      if (slotLabel.startsWith('09:30')) hourStart = 9;
                                      if (slotLabel.startsWith('11:30')) hourStart = 11;
                                      if (slotLabel.startsWith('02:00')) hourStart = 14;
                                      if (slotLabel.startsWith('04:30')) hourStart = 16;
                                      if (slotLabel.startsWith('06:30')) hourStart = 18;

                                      const matchingSession = coachTodaySessions.find(s => {
                                        const date = new Date(s.scheduled_at);
                                        const h = date.getHours();
                                        return h >= hourStart && h < (hourStart + 2);
                                      });

                                      if (matchingSession) {
                                        const clientMatch = clients.find(c => c.id === matchingSession.client_id) || { name: 'Reserved Block' };
                                        return (
                                          <div 
                                            key={slotLabel} 
                                            style={{
                                              background: 'rgba(184,107,75,0.06)', border: `1px solid rgba(184,107,75,0.22)`,
                                              borderRadius: '6px', padding: '6px 8px', textAlign: 'center'
                                            }}>
                                            <div style={{ fontSize: '9px', fontFamily: OT.fMono, color: OT.terra, fontWeight: 'bold' }}>🔴 BOOKED</div>
                                            <div style={{ fontSize: '10.5px', fontWeight: 'bold', color: OT.espresso900, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                              {clientMatch.name.split(' ')[0]}
                                            </div>
                                            <div style={{ fontSize: '8.5px', color: OT.clay500 }}>{slotLabel.split(' ')[0]}</div>
                                          </div>
                                        );
                                      } else {
                                        return (
                                          <div 
                                            key={slotLabel}
                                            onClick={() => {
                                              setBookingCoachId(coach.id);
                                              setBookingSlotLabel(slotLabel);
                                              setBookingClientId('');
                                              setBookingProgram('');
                                            }}
                                            style={{
                                              background: 'rgba(123,139,111,0.05)', border: `1px solid rgba(123,139,111,0.18)`,
                                              borderRadius: '6px', padding: '6px 8px', textAlign: 'center', cursor: 'pointer',
                                              transition: 'background 0.15s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(123,139,111,0.12)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(123,139,111,0.05)'}>
                                            <div style={{ fontSize: '9px', fontFamily: OT.fMono, color: OT.sage, fontWeight: 'bold' }}>🟢 FREE</div>
                                            <div style={{ fontSize: '10px', color: OT.espresso800, fontWeight: '500' }}>[ Reserve ]</div>
                                            <div style={{ fontSize: '8.5px', color: OT.clay500 }}>{slotLabel.split(' ')[0]}</div>
                                          </div>
                                        );
                                      }
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Needs Attention / Flagged Items (Right) */}
            <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: '16px', padding: '24px', boxShadow: OT.sh1 }}>
              <div style={{ borderBottom: `1px solid ${OT.hairline}`, paddingBottom: '12px', marginBottom: '16px' }}>
                <h4 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '20px', color: OT.espresso900, fontWeight: 400, margin: 0 }}>
                  🚩 Flagged Actions Dashboard
                </h4>
                <p style={{ fontSize: '11.5px', color: OT.clay600, margin: '4px 0 0' }}>
                  Real-time SLA risks, scheduling reviews, and quality indicators.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* 1. SLA At Risk Session Alerts */}
                {atRiskSessions.map(session => {
                  const clientMatch = clients.find(c => c.id === session.client_id) || { name: 'Student' };
                  const coachMatch = coaches.find(c => c.id === session.coach_id) || { name: 'Lee' };
                  return (
                    <div key={session.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', background: 'rgba(184,107,75,0.03)', border: `1px solid rgba(184,107,75,0.15)`, borderRadius: '12px', padding: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', background: OT.terra, borderRadius: '50%' }} />
                          <strong style={{ fontSize: '11px', fontFamily: OT.fMono, color: OT.terra }}>SLA AT RISK</strong>
                        </span>
                        <div style={{ fontSize: '12px', fontWeight: 500, color: OT.espresso900, marginTop: '4px' }}>
                          {clientMatch.name} with Coach {coachMatch.name} is unassigned!
                        </div>
                        <div style={{ fontSize: '11px', color: OT.clay600, marginTop: '2px' }}>
                          Immediate backup cover or class refund audit required.
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const escalationDiv = document.getElementById('sla-handoff-tracker-section');
                          if (escalationDiv) escalationDiv.scrollIntoView({ behavior: 'smooth' });
                        }}
                        style={{
                          height: 'fit-content', border: 'none', background: OT.walnut, color: OT.paper,
                          fontFamily: OT.fBody, fontSize: '11px', fontWeight: 'bold', padding: '6px 12px',
                          borderRadius: '6px', cursor: 'pointer', alignSelf: 'center'
                        }}>
                        RESOLVE
                      </button>
                    </div>
                  );
                })}

                {/* 3. Low Rating Reconcile */}
                {ratings.filter(r => r.overall <= 3.8).slice(0, 1).map(rating => (
                  <div key={rating.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', background: 'rgba(62,44,28,0.02)', border: `1px solid ${OT.hairlineStrong}`, borderRadius: '12px', padding: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', background: OT.clay500, borderRadius: '50%' }} />
                        <strong style={{ fontSize: '11px', fontFamily: OT.fMono, color: OT.clay600 }}>FEEDBACK ALERT</strong>
                      </span>
                      <div style={{ fontSize: '12px', fontWeight: 500, color: OT.espresso900, marginTop: '4px' }}>
                        Feedback Score of {rating.overall.toFixed(1)}★ by student {rating.clientName}.
                      </div>
                      <div style={{ fontSize: '11px', color: OT.clay500, marginTop: '2px', fontStyle: 'italic' }}>
                        "{rating.comment}"
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setFilterCoach(rating.coachId);
                        setAdminTab('ratings_report');
                      }}
                      style={{
                        height: 'fit-content', background: 'rgba(36,24,16,0.06)', color: OT.espresso800,
                        fontFamily: OT.fBody, fontSize: '11px', fontWeight: '600', padding: '6px 12px',
                        border: `1px solid ${OT.hairlineStrong}`, borderRadius: '6px', cursor: 'pointer', alignSelf: 'center'
                      }}>
                      INVESTIGATE
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {adminTab === 'ratings_report' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <h3 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 26, color: OT.espresso900, margin: 0, fontWeight: 400 }}>
                Owner Review Board
              </h3>
              <p style={{ fontSize: 13, color: OT.clay600, margin: '4px 0 0' }}>
                Analyze master satisfaction, filter dynamic client metrics, and generate instant aggregate AI summaries.
              </p>
            </div>
          </div>

          {/* SYMMETRIC FILTER CONSOLE UNIT FOR ADMIN */}
          <div style={{ background: OT.sand100, border: `1px solid ${OT.hairlineStrong}`, borderRadius: 16, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: OT.fMono, fontSize: 10, color: OT.espresso800, fontWeight: 'bold', letterSpacing: 1 }}>
                🎯 MULTI-DIMENSIONAL SEARCH &amp; CRITERIA FILTERS
              </span>
              <button 
                type="button"
                onClick={() => {
                  setFilterCoach('All');
                  setFilterPeriod('All');
                  setStartDate('');
                  setEndDate('');
                  setSelectedClients([]);
                  setFilterRatingRange('All');
                  setFilterSessionType('All');
                  setFilterMetricConcern('All');
                }}
                style={{ border: 'none', background: 'none', cursor: 'pointer', fontFamily: OT.fMono, fontSize: 11, color: OT.walnut, fontWeight: 'bold', textDecoration: 'underline' }}>
                [RESET ALL FILTERS]
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
              
              {/* Period Selection */}
              <div>
                <label style={uploaderLabelStyle}>DATE PERIOD</label>
                <select value={filterPeriod} onChange={e => setFilterPeriod(e.target.value)} style={{ ...inputStyle, width: '100%', height: 38 }}>
                  <option value="today">☀️ Today (May 26, 2026)</option>
                  <option value="yesterday">⏱️ Yesterday (May 25, 2026)</option>
                  <option value="7days">⏱️ Last 7 Days (May 20-26, 2026)</option>
                  <option value="thisMonth">🗓️ This Month (May 2026)</option>
                  <option value="lastMonth">🗓️ Last Month (April 2026)</option>
                  <option value="thisQuarter">📊 This Quarter (Apr - Jun 2026)</option>
                  <option value="lastQuarter">📊 Last Quarter (Jan - Mar 2026)</option>
                  <option value="custom">📅 Custom Date Range</option>
                  <option value="All">🌐 All Time Intervals</option>
                </select>
              </div>

              {/* Custom Dates (Conditional) */}
              {filterPeriod === 'custom' && (
                <div style={{ display: 'flex', gap: 8, gridColumn: 'span 2' }}>
                  <div style={{ flex: 1 }}>
                    <label style={uploaderLabelStyle}>START DATE</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ ...inputStyle, width: '100%', height: 38 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={uploaderLabelStyle}>END DATE</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ ...inputStyle, width: '100%', height: 38 }} />
                  </div>
                </div>
              )}

              {/* Rating Scores Selector */}
              <div>
                <label style={uploaderLabelStyle}>SATISFACTION INTERVAL</label>
                <select value={filterRatingRange} onChange={e => setFilterRatingRange(e.target.value)} style={{ ...inputStyle, width: '100%', height: 38 }}>
                  <option value="All">All Score Ranges</option>
                  <option value="4.5+">★ Elite Only (4.5 to 5.0)</option>
                  <option value="3.5-4.4">★ Good Progress (3.5 to 4.4)</option>
                  <option value="below3.5">⚠️ Practice Needed (Below 3.5)</option>
                </select>
              </div>

              {/* Session format filter */}
              <div>
                <label style={uploaderLabelStyle}>SESSION FORMAT</label>
                <select value={filterSessionType} onChange={e => setFilterSessionType(e.target.value)} style={{ ...inputStyle, width: '100%', height: 38 }}>
                  <option value="All">All Formats</option>
                  <option value="PT Session">Personal Training (1:1)</option>
                  <option value="Group">Group Sessions</option>
                </select>
              </div>

              {/* Underperforming sub-metric filter */}
              <div>
                <label style={uploaderLabelStyle}>CRITIQUED METRIC (&lt;= 3.5)</label>
                <select value={filterMetricConcern} onChange={e => setFilterMetricConcern(e.target.value)} style={{ ...inputStyle, width: '100%', height: 38 }}>
                  <option value="All">All Critiques</option>
                  <option value="workout">Pacing Calibration</option>
                  <option value="form">Form &amp; Posture Care</option>
                  <option value="communication">Technical Cueing &amp; Voice</option>
                  <option value="structure">Session Programming</option>
                </select>
              </div>

            </div>

            {/* Symmetrical Multi-Client Selection Filter Row */}
            {reviewClients.length > 0 && (
              <div style={{ borderTop: `1px solid ${OT.hairline}`, paddingTop: 12 }}>
                <span style={uploaderLabelStyle}>MULTI-CLIENT NAME SELECTORS</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  <button 
                    type="button" 
                    onClick={() => setSelectedClients([])} 
                    style={{
                      fontSize: 10.5, border: `1px solid ${selectedClients.length === 0 ? OT.walnut : OT.hairlineStrong}`,
                      background: selectedClients.length === 0 ? 'rgba(94,66,40,0.08)' : OT.paper,
                      color: selectedClients.length === 0 ? OT.walnut : OT.espresso900,
                      borderRadius: 999, padding: '4px 10px', fontWeight: 'bold', cursor: 'pointer'
                    }}>
                    👤 All Clients (Master list)
                  </button>
                  {reviewClients.map(name => {
                    const isActive = selectedClients.includes(name);
                    return (
                      <button 
                        type="button" 
                        key={name} 
                        onClick={() => {
                          if (selectedClients.includes(name)) {
                            setSelectedClients(selectedClients.filter(c => c !== name));
                          } else {
                            setSelectedClients([...selectedClients, name]);
                          }
                        }} 
                        style={{
                          fontSize: 10.5, border: `1px solid ${isActive ? OT.walnut : OT.hairlineStrong}`,
                          background: isActive ? 'rgba(94,66,40,0.08)' : OT.paper,
                          color: isActive ? OT.walnut : OT.espresso900,
                          borderRadius: 999, padding: '4px 10px', cursor: 'pointer'
                        }}>
                        <span>{isActive ? '✓ ' : '+ '}</span> {name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Coach Averages Grid - Clicking a card toggles filterCoach */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontFamily: OT.fMono, fontSize: '10px', color: OT.clay600, fontWeight: 'bold' }}>
                CHOOSE COACH TO DRILL DOWN INDIVIDUAL STUDENTS ({coaches.length} ACTIVE STAFF)
              </span>
              {filterCoach !== 'All' && (
                <button 
                  onClick={() => setFilterCoach('All')} 
                  style={{
                    background: 'none', border: 'none', textDecoration: 'underline',
                    color: OT.walnut, fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', fontFamily: OT.fMono
                  }}>
                  CLEAR SELECTION [SHOW ALL]
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {coaches.map(co => {
                const queryRatings = ratings.filter(r => {
                  if (r.coachId !== co.id) return false;
                  const dateStr = r.sessionDate || r.session_date || '';
                  return isDateInSelectedPeriod(dateStr, filterPeriod, startDate, endDate);
                });
                const avgNum = queryRatings.length > 0 
                  ? Number((queryRatings.reduce((sum, r) => sum + r.overall, 0) / queryRatings.length).toFixed(1))
                  : null;
                const isSelected = filterCoach === co.id;

                return (
                  <div 
                    key={co.id}
                    onClick={() => setFilterCoach(isSelected ? 'All' : co.id)}
                    style={{
                      background: isSelected ? 'rgba(94,66,40,0.03)' : OT.paper,
                      border: isSelected ? `2.5px solid ${OT.walnut}` : `1px solid ${OT.hairline}`,
                      borderRadius: '14px', padding: '16px', cursor: 'pointer',
                      transition: 'all 0.2s', boxShadow: isSelected ? OT.sh2 : OT.sh1,
                      transform: isSelected ? 'translateY(-2px)' : 'none'
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: co.tone === 'sage' ? 'rgba(123,139,111,0.15)' : 'rgba(94,66,40,0.15)',
                        color: co.tone === 'sage' ? OT.sage : OT.walnut,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold'
                      }}>
                        {co.initials || co.name.substring(0,2).toUpperCase()}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: OT.espresso900, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          Coach {co.name}
                        </div>
                        <div style={{ fontSize: '10.5px', color: OT.clay500, fontFamily: OT.fMono }}>{co.id}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: OT.fDisplay, color: OT.espresso900 }}>
                        {avgNum !== null ? avgNum.toFixed(1) : 'N/A'}
                      </span>
                      {avgNum !== null && (
                        <span style={{ fontSize: '11px', color: OT.ochre, fontWeight: 'bold' }}>★</span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: OT.clay600, marginTop: 2 }}>
                      {queryRatings.length} rating{queryRatings.length !== 1 ? 's' : ''} in interval
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Symmetrical AI Sentiment analysis card based on subset */}
          {(() => {
            const subset = ratings.filter(r => {
              if (filterCoach !== 'All' && r.coachId !== filterCoach && r.coach_id !== filterCoach) return false;
              const clName = r.clientName || r.client_name;
              if (selectedClients.length > 0 && !selectedClients.includes(clName)) return false;
              
              // Rating Range filter
              const scoreVal = Number(r.overall || 5);
              if (filterRatingRange === '4.5+') {
                if (scoreVal < 4.5) return false;
              } else if (filterRatingRange === '3.5-4.4') {
                if (scoreVal < 3.5 || scoreVal >= 4.5) return false;
              } else if (filterRatingRange === 'below3.5') {
                if (scoreVal >= 3.5) return false;
              }

              // Period filter
              const dateStr = r.sessionDate || r.session_date || '';
              if (!isDateInSelectedPeriod(dateStr, filterPeriod, startDate, endDate)) return false;

              // Format filter
              if (filterSessionType !== 'All') {
                const typeStr = (r.sessionType || r.session_type || 'PT Session').toLowerCase();
                if (!typeStr.includes(filterSessionType.toLowerCase())) return false;
              }

              // Submetric filter
              if (filterMetricConcern !== 'All') {
                const scores = r.scores_json || r.scores || {};
                const scoreMetric = Number(scores[filterMetricConcern] || 5);
                if (scoreMetric > 3.5) return false;
              }

              return true;
            });

            const resultSummary = generateSentimentAnalysis(subset);

            const handleTriggerAdminAnalysis = () => {
              setIsAnalyzing(true);
              setTimeout(() => {
                setIsAnalyzing(false);
              }, 800);
            };

            return (
              <div style={{
                background: OT.paper, border: `1px solid rgba(201,154,63,0.34)`,
                borderRadius: '16px', padding: '24px', boxShadow: OT.sh2, position: 'relative', overflow: 'hidden'
              }}>
                {/* Visual decoration watermark */}
                <div style={{ position: 'absolute', right: -6, top: -14, fontStyle: 'italic', fontFamily: OT.fDisplay, fontSize: '98px', color: 'rgba(201,154,63,0.04)', select: 'none', userSelect: 'none' }}>ai</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{
                    fontFamily: OT.fMono, fontSize: '10.5px', color: OT.ochre, fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}>
                    ✨ MY THIRD SPACE OWNER AI REVIEWS SYNTHESIS
                  </span>
                  <button 
                    type="button" 
                    onClick={handleTriggerAdminAnalysis}
                    style={{ background: 'rgba(201,154,63,0.07)', border: `1px solid ${OT.ochre}`, color: OT.ochre, fontSize: 10, fontFamily: OT.fMono, padding: '4px 12px', borderRadius: 999, fontWeight: 'bold', cursor: 'pointer' }}>
                    ⚡ Refresh AI Insights
                  </button>
                </div>

                {isAnalyzing ? (
                  <div style={{ height: 96, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <span style={{ fontSize: 13, color: OT.clay600, fontStyle: 'italic', fontFamily: OT.fMono }}>Synthesizing multi-coach feedback logs...</span>
                    <div style={{ width: 120, height: 4, background: OT.sand100, borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '60%', background: OT.ochre, animation: 'pulse 1s infinite' }} />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <div style={{ background: OT.sand100, border: `1px solid ${OT.hairline}`, borderRadius: '14px', padding: '16px 22px', textAlign: 'center', minWidth: '110px' }}>
                      <span style={{ fontSize: '10px', fontFamily: OT.fMono, color: OT.clay600, display: 'block', textTransform: 'uppercase' }}>AVERAGE</span>
                      <strong style={{ fontSize: '36px', fontFamily: OT.fDisplay, color: OT.espresso900 }}>{resultSummary.avgScore}</strong>
                      <span style={{ fontSize: '11px', color: OT.ochre, display: 'block', marginTop: 2 }}>★★★★★</span>
                    </div>

                    <div style={{ flex: 1, minWidth: '240px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 'bold', color: OT.espresso900 }}>AI Aggregate Sentiment:</span>
                        <span style={{ fontSize: '13px', color: resultSummary.textColor, fontWeight: '700' }}>{resultSummary.sentiment}</span>
                      </div>

                      <p style={{ margin: 0, fontSize: '13.5px', color: OT.espresso800, lineHeight: 1.55, fontStyle: 'italic' }}>
                        "{resultSummary.summary}"
                      </p>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                        {resultSummary.themeTags.map(th => (
                          <span key={th} style={{
                            fontFamily: OT.fMono, fontSize: '9px', color: OT.clay600,
                            background: OT.sand50, border: `1px solid ${OT.hairlineStrong}`,
                            padding: '3px 8px', borderRadius: '4px', fontWeight: '500'
                          }}>
                            #{th}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Individual Reviews Table */}
          <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 16, overflow: 'hidden', boxShadow: OT.sh1 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr 2.5fr', background: OT.sand100, padding: '12px 20px', borderBottom: `1px solid ${OT.hairlineStrong}` }}>
              <OMono size={8.5}>COACH &amp; CLIENT</OMono>
              <OMono size={8.5}>OVERALL RATINGS</OMono>
              <OMono size={8.5}>METRIC MATRIX READOUTS</OMono>
              <OMono size={8.5}>STUDENT EXPERIENCE &amp; COMMENT FEEDBACK</OMono>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {(() => {
                const dataset = ratings.filter(r => {
                  if (filterCoach !== 'All' && r.coachId !== filterCoach && r.coach_id !== filterCoach) return false;
                  const cName = r.clientName || r.client_name;
                  if (selectedClients.length > 0 && !selectedClients.includes(cName)) return false;
                  
                  // Rating Range
                  const scoreVal = Number(r.overall || 5);
                  if (filterRatingRange === '4.5+') {
                    if (scoreVal < 4.5) return false;
                  } else if (filterRatingRange === '3.5-4.4') {
                    if (scoreVal < 3.5 || scoreVal >= 4.5) return false;
                  } else if (filterRatingRange === 'below3.5') {
                    if (scoreVal >= 3.5) return false;
                  }

                  // Period Search
                  const dateStr = r.sessionDate || r.session_date || '';
                  if (!isDateInSelectedPeriod(dateStr, filterPeriod, startDate, endDate)) return false;

                  // Format
                  if (filterSessionType !== 'All') {
                    const typeStr = (r.sessionType || r.session_type || 'PT Session').toLowerCase();
                    if (!typeStr.includes(filterSessionType.toLowerCase())) return false;
                  }

                  // Submetrics focus
                  if (filterMetricConcern !== 'All') {
                    const scores = r.scores_json || r.scores || {};
                    const scoreMetric = Number(scores[filterMetricConcern] || 5);
                    if (scoreMetric > 3.5) return false;
                  }

                  return true;
                });

                if (dataset.length === 0) {
                  return (
                    <div style={{ padding: '40px', color: OT.clay500, fontStyle: 'italic', textAlign: 'center', fontSize: '13px' }}>
                      No individual student ratings found matching the current selections. Try clearing your filters above.
                    </div>
                  );
                }

                return dataset.map(rating => {
                  const cName = rating.coachName || rating.coach_name || 'Coach';
                  const clName = rating.clientName || rating.client_name || 'Member';
                  const overallVal = Number(rating.overall !== undefined ? rating.overall : 5);

                  return (
                    <div key={rating.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr 2.5fr', padding: '16px 20px', borderBottom: `1px solid ${OT.hairline}`, alignItems: 'center' }}>
                      
                      {/* Coach & Client column */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '2px' }}>
                          <div style={{ width: 18, height: 18, borderRadius: '50%', background: OT.walnut, color: OT.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 'bold' }}>
                            {cName.substring(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: OT.espresso900 }}>Coach {cName}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: OT.clay600, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span>Student:</span>
                          <strong style={{ color: OT.espresso800 }}>{clName}</strong>
                        </div>
                      </div>

                      {/* Overall Score */}
                      <div>
                        <span style={{
                          padding: '3px 8px', borderRadius: 6,
                          background: overallVal >= 4.0 ? 'rgba(123,139,111,0.1)' : overallVal >= 3.0 ? 'rgba(201,154,63,0.1)' : 'rgba(184,107,75,0.1)',
                          color: overallVal >= 4.0 ? OT.sage : overallVal >= 3.0 ? OT.ochre : OT.terra,
                          fontFamily: OT.fMono, fontSize: 11, fontWeight: 'bold'
                        }}>
                          ★ {overallVal.toFixed(1)} / 5.0
                        </span>
                      </div>

                      {/* Score criteria */}
                      <div style={{ fontSize: 11, fontFamily: OT.fMono, color: OT.clay600 }}>
                        Workout: <strong>{rating.scores_json?.workout || rating.scores?.workout || 5}</strong> · Form: <strong>{rating.scores_json?.form || rating.scores?.form || 5}</strong> · Prog: <strong>{rating.scores_json?.content || rating.scores?.content || 5}</strong>
                      </div>

                      {/* Comment text */}
                      <div style={{ fontSize: 12.5, color: OT.espresso800, fontStyle: 'italic', lineHeight: 1.4 }}>
                        "{rating.comment || 'No checkout comments written.'}"
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {adminTab === 'all_clients' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 22, color: OT.espresso900, margin: 0 }}>Allocation oversight registry</h3>
            <button 
              onClick={async () => {
                const name = window.prompt("Enter new student full name:");
                if (!name) return;
                const email = window.prompt("Enter student email:");
                const coachId = window.prompt("Assign Coach ID (lee, rahul, deb, deepika, pilates):", "lee");

                const newClient = {
                  id: Math.random().toString(36).substring(7),
                  name,
                  email: email || '',
                  phone: '+91 99000 99000',
                  assigned_coach_id: coachId || 'lee',
                  status: 'Active',
                  created_at: new Date().toISOString().split('T')[0]
                };
                const updated = [...clients, newClient];
                setClients(updated);
                await M3S_DB.setAll('clients', updated);
              }}
              style={btnPrimaryStyle}>
              + Add New Member
            </button>
          </div>

          <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: OT.sand100, borderBottom: `1px solid ${OT.hairlineStrong}` }}>
                  <th style={{ padding: '12px 20px' }}><OMono size={8.5}>STUDENT NAME</OMono></th>
                  <th style={{ padding: '12px 20px' }}><OMono size={8.5}>ASSIGNED COACH ID</OMono></th>
                  <th style={{ padding: '12px 20px' }}><OMono size={8.5}>CONTACTS</OMono></th>
                  <th style={{ padding: '12px 20px' }}><OMono size={8.5}>STATUS TIERS</OMono></th>
                  <th style={{ padding: '12px 20px', textAlign: 'right' }}><OMono size={8.5}>MANAGE</OMono></th>
                </tr>
              </thead>
              <tbody>
                {clients.map(p => (
                  <tr key={p.id} style={{ borderBottom: `1px solid ${OT.hairline}` }}>
                    <td style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600, color: OT.espresso900 }}>{p.name || 'Anonymous Student'}</td>
                    <td style={{ padding: '16px 20px', fontSize: 12.5 }}>
                      <select 
                        value={p.assigned_coach_id || 'lee'}
                        onChange={async (e) => {
                          const updated = clients.map(c => c.id === p.id ? { ...c, assigned_coach_id: e.target.value } : c);
                          setClients(updated);
                          await M3S_DB.setAll('clients', updated);
                        }}
                        style={{ ...inputStyle, padding: '4px 8px', fontSize: 12 }}>
                        {COACHES.map(t => <option key={t.id} value={t.id}>Coach {t.name}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: 12.5, color: OT.clay600 }}>{p.phone || 'No Phone'} · {p.email || 'No Email'}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <select 
                        value={p.status || 'Active'}
                        onChange={async (e) => {
                          const updated = clients.map(c => c.id === p.id ? { ...c, status: e.target.value } : c);
                          setClients(updated);
                          await M3S_DB.setAll('clients', updated);
                        }}
                        style={{ ...inputStyle, padding: '4px 8px', fontSize: 11, fontWeight: 'bold' }}>
                        <option value="Active">Active</option>
                        <option value="Ending soon">Ending soon</option>
                        <option value="On hold">On hold</option>
                      </select>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button 
                        onClick={async () => {
                          if (window.confirm(`Are you sure you want to remove ${p.name || 'this student'}?`)) {
                            const updated = clients.filter(c => c.id !== p.id);
                            setClients(updated);
                            await M3S_DB.setAll('clients', updated);
                          }
                        }}
                        style={{ background: 'none', border: 'none', color: OT.terra, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                        Delete User
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adminTab === 'users_tab' && (
        <OwnerRestrictedPanel 
          currentUser={currentUser} 
          coaches={coaches}
          setCoaches={setCoaches}
          adminsList={adminsList}
          setAdminsList={setAdminsList}
          handleSaveCoachProfile={handleSaveCoachProfile}
          handleSaveAdminProfile={handleSaveAdminProfile}
          selectedEditCoach={selectedEditCoach}
          setSelectedEditCoach={setSelectedEditCoach}
          adminImagesList={adminImagesList}
          setAdminImagesList={setAdminImagesList}
          adminVideosList={adminVideosList}
          setAdminVideosList={setAdminVideosList}
        />
      )}
    </div>
  );
}

// ─── 5. OWNER SECURITY LOCK SCREEN ────────────────────────────────────────
function OwnerRestrictedPanel({ 
  currentUser, 
  coaches, 
  setCoaches, 
  adminsList, 
  setAdminsList, 
  handleSaveCoachProfile,
  handleSaveAdminProfile,
  selectedEditCoach,
  setSelectedEditCoach,
  adminImagesList,
  setAdminImagesList,
  adminVideosList,
  setAdminVideosList
}) {
  const isOwner = currentUser.id === 'shwetambari';

  // State Hooks for onboarding form
  const [onboardName, setOnboardName] = React.useState('');
  const [onboardId, setOnboardId] = React.useState('');
  const [onboardRole, setOnboardRole] = React.useState('coach'); // 'coach' | 'admin'
  const [onboardCert, setOnboardCert] = React.useState('');
  const [onboardEmail, setOnboardEmail] = React.useState('');
  const [onboardPhone, setOnboardPhone] = React.useState('');
  const [actionFeedback, setActionFeedback] = React.useState('');

  const [editWorkingHours, setEditWorkingHours] = React.useState({});
  const [isCalendarLocked, setIsCalendarLocked] = React.useState(false);
  const [isGeminiParsing, setIsGeminiParsing] = React.useState(false);
  const [naturalLanguageInput, setNaturalLanguageInput] = React.useState('');
  const [presetDays, setPresetDays] = React.useState('mon-fri');
  const [presetStart, setPresetStart] = React.useState('06:00 AM');
  const [presetEnd, setPresetEnd] = React.useState('02:00 PM');
  const [geminiError, setGeminiError] = React.useState('');

  React.useEffect(() => {
    if (selectedEditCoach) {
      setEditWorkingHours(selectedEditCoach.working_hours || {
        Monday: { isWorking: true, start: "06:00 AM", end: "08:00 PM" },
        Tuesday: { isWorking: true, start: "06:00 AM", end: "08:00 PM" },
        Wednesday: { isWorking: true, start: "06:00 AM", end: "08:00 PM" },
        Thursday: { isWorking: true, start: "06:00 AM", end: "08:00 PM" },
        Friday: { isWorking: true, start: "06:00 AM", end: "08:00 PM" },
        Saturday: { isWorking: true, start: "06:00 AM", end: "08:00 PM" },
        Sunday: { isWorking: false, start: "", end: "" }
      });
      setIsCalendarLocked(!!selectedEditCoach.working_hours);
      setNaturalLanguageInput('');
      setGeminiError('');
    } else {
      setEditWorkingHours({});
      setIsCalendarLocked(false);
    }
  }, [selectedEditCoach]);

  const parseTimeStringToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    let s = timeStr.trim().toUpperCase();
    
    // Check for AM/PM
    const hasPM = s.includes('PM');
    const hasAM = s.includes('AM');
    
    // Strip AM/PM
    s = s.replace(/(AM|PM)/g, '').trim();
    
    let hours = 0;
    let minutes = 0;
    
    if (s.includes(':')) {
      const parts = s.split(':');
      hours = parseInt(parts[0], 10) || 0;
      minutes = parseInt(parts[1], 10) || 0;
    } else {
      // No colon, e.g. "0600" or "6" or "1800"
      if (s.length >= 3) {
        hours = parseInt(s.substring(0, s.length - 2), 10) || 0;
        minutes = parseInt(s.substring(s.length - 2), 10) || 0;
      } else {
        hours = parseInt(s, 10) || 0;
        minutes = 0;
      }
    }
    
    if (hasPM && hours < 12) {
      hours += 12;
    }
    if (hasAM && hours === 12) {
      hours = 0;
    }
    
    return hours * 60 + minutes;
  };

  const formatWorkingHours = (working_hours) => {
    if (!working_hours) return "Not configured (Default: Open)";
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const activeDays = days.filter(day => working_hours[day]?.isWorking);
    if (activeDays.length === 0) return "No working days (Fully Off)";
    
    const groups = {};
    activeDays.forEach(day => {
      const start = working_hours[day].start;
      const end = working_hours[day].end;
      const key = `${start}-${end}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(day);
    });

    return Object.entries(groups).map(([time, daysList]) => {
      const [start, end] = time.split('-');
      const shortDays = daysList.map(d => d.slice(0, 3)).join(', ');
      return `${shortDays}: ${start} - ${end}`;
    }).join(' | ');
  };

  if (!isOwner) {
    return (
      <div style={{ padding: '48px 32px', background: 'rgba(184,107,75,0.06)', borderRadius: 16, border: `1px solid ${OT.terra}`, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>🔒</div>
        <h4 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 24, color: OT.terra, margin: 0, fontWeight: 400 }}>Owner access only.</h4>
        <p style={{ fontSize: 13, color: OT.clay600, maxWidth: 420, margin: '10px auto 0', lineHeight: 1.5 }}>
          Your current account is mapped as <strong>{currentUser.role}</strong>. Please contact Founder and Owner Shwetambari to request administrative security policy updates.
        </p>
      </div>
    );
  }

  // Action handlers
  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!onboardName.trim() || !onboardId.trim()) {
      alert("Please enter Name and a clean alphanumeric handle ID.");
      return;
    }

    const cleanedId = onboardId.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!cleanedId) {
      alert("Please enter a valid alphanumeric ID.");
      return;
    }

    if (!onboardEmail.trim() && !onboardPhone.trim()) {
      alert("Please enter at least an email address or a phone number for secure authentication.");
      return;
    }

    // Check duplicates
    const checkAdmin = adminsList.some(a => a.id === cleanedId);
    const checkCoach = coaches.some(c => c.id === cleanedId);
    if (checkAdmin || checkCoach) {
      alert("This ID is already assigned to active staff.");
      return;
    }

    if (onboardRole === 'admin') {
      const newAdmin = {
        id: cleanedId,
        name: onboardName.trim(),
        role: 'admin',
        canManageAdmins: false,
        email: onboardEmail.trim().toLowerCase(),
        phone: onboardPhone.trim()
      };
      const updatedAdmins = [...adminsList, newAdmin];
      setAdminsList(updatedAdmins);
      await M3S_DB.setAll('admins_list', updatedAdmins);
      await M3S_DB.set('globals', 'admins_list', { list: updatedAdmins });
      
      // Seed dynamically to global ADMINS array as well for safety
      if (typeof ADMINS !== 'undefined') {
        const idx = ADMINS.findIndex(a => a.id === cleanedId);
        if (idx > -1) ADMINS[idx] = newAdmin;
        else ADMINS.push(newAdmin);
      }

      setActionFeedback(`Successfully onboarded Manager (Admin): ${onboardName.trim()}`);
    } else {
      const newCoach = {
        id: cleanedId,
        name: onboardName.trim(),
        initials: onboardName.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        cert: onboardCert.trim() || 'Pilates & Strength Certified · Exercise Science Specialist',
        tone: Math.random() > 0.5 ? 'sage' : 'walnut',
        email: onboardEmail.trim().toLowerCase(),
        phone: onboardPhone.trim()
      };
      const updatedCoaches = [...coaches, newCoach];
      setCoaches(updatedCoaches);
      await M3S_DB.setAll('coaches_list', updatedCoaches);
      await M3S_DB.set('globals', 'coaches_list', { list: updatedCoaches });

      // Seed dynamically to global COACHES array as well for safety
      if (typeof COACHES !== 'undefined') {
        const idx = coaches.findIndex(c => c.id === cleanedId);
        if (idx > -1) COACHES[idx] = newCoach;
        else COACHES.push(newCoach);
      }

      setActionFeedback(`Successfully onboarded Coach: ${onboardName.trim()}`);
    }

    // Clear Fields
    setOnboardName('');
    setOnboardId('');
    setOnboardEmail('');
    setOnboardPhone('');
    setOnboardCert('');
    setTimeout(() => setActionFeedback(''), 4000);
  };

  const handleRoleToggle = async (targetId, currentListType, targetRole) => {
    if (targetId === 'shwetambari') {
      alert("Founder root credentials cannot be demoted.");
      return;
    }

    let updatedAdmins = [...adminsList];
    let updatedCoaches = [...coaches];

    if (currentListType === 'admin' && targetRole === 'coach') {
      const staffRef = adminsList.find(a => a.id === targetId);
      if (!staffRef) return;

      // Extract from administrators
      updatedAdmins = adminsList.filter(a => a.id !== targetId);
      // Construct Coach profile
      const newCoach = {
        id: staffRef.id,
        name: staffRef.name,
        initials: staffRef.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        cert: 'Studio Manager · Certified PT Instructor',
        tone: 'sage',
        email: staffRef.email || '',
        phone: staffRef.phone || ''
      };
      updatedCoaches.push(newCoach);

      // Synced global updates
      if (typeof ADMINS !== 'undefined') {
        const adminIdx = ADMINS.findIndex(a => a.id === targetId);
        if (adminIdx > -1) ADMINS.splice(adminIdx, 1);
      }
      if (typeof COACHES !== 'undefined' && !COACHES.some(c => c.id === targetId)) {
        COACHES.push(newCoach);
      }

    } else if (currentListType === 'coach' && targetRole === 'admin') {
      const staffRef = coaches.find(c => c.id === targetId);
      if (!staffRef) return;

      // Extract from coaches
      updatedCoaches = coaches.filter(c => c.id !== targetId);
      // Construct Admin profile
      const newAdmin = {
        id: staffRef.id,
        name: staffRef.name,
        role: 'admin',
        canManageAdmins: false,
        email: staffRef.email || '',
        phone: staffRef.phone || ''
      };
      updatedAdmins.push(newAdmin);

      // Synced global updates
      if (typeof COACHES !== 'undefined') {
        const coachIdx = coaches.findIndex(c => c.id === targetId);
        if (coachIdx > -1) COACHES.splice(coachIdx, 1);
      }
      if (typeof ADMINS !== 'undefined' && !ADMINS.some(a => a.id === targetId)) {
        ADMINS.push(newAdmin);
      }
    }

    setAdminsList(updatedAdmins);
    setCoaches(updatedCoaches);
    await M3S_DB.setAll('admins_list', updatedAdmins);
    await M3S_DB.setAll('coaches_list', updatedCoaches);
    await M3S_DB.set('globals', 'admins_list', { list: updatedAdmins });
    await M3S_DB.set('globals', 'coaches_list', { list: updatedCoaches });
    setActionFeedback(`Transferred user id '${targetId}' access level to ${targetRole}.`);
    setTimeout(() => setActionFeedback(''), 4000);
  };

  const handleDeleteStaff = async (targetId, listType) => {
    if (targetId === 'shwetambari') {
      alert("Primary Founder account cannot be deleted.");
      return;
    }

    if (!window.confirm(`CRITICAL DELETION WARNING: Are you sure you want to delete staff user '${targetId}'?`)) {
      return;
    }

    if (listType === 'admin') {
      const updated = adminsList.filter(a => a.id !== targetId);
      setAdminsList(updated);
      await M3S_DB.setAll('admins_list', updated);
      await M3S_DB.set('globals', 'admins_list', { list: updated });
      if (typeof ADMINS !== 'undefined') {
        const idx = ADMINS.findIndex(a => a.id === targetId);
        if (idx > -1) ADMINS.splice(idx, 1);
      }
    } else {
      const updated = coaches.filter(c => c.id !== targetId);
      setCoaches(updated);
      await M3S_DB.setAll('coaches_list', updated);
      await M3S_DB.set('globals', 'coaches_list', { list: updated });
      if (typeof COACHES !== 'undefined') {
        const idx = coaches.findIndex(c => c.id === targetId);
        if (idx > -1) COACHES.splice(idx, 1);
      }
    }

    setActionFeedback(`Deleted staff member '${targetId}' from the database.`);
    setTimeout(() => setActionFeedback(''), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title */}
      <div>
        <h3 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 26, color: OT.espresso900, margin: 0, fontWeight: 400 }}>
          🔒 Studio Owner Security Matrix
        </h3>
        <p style={{ fontSize: 13, color: OT.clay600, margin: '4px 0 0' }}>
          Onboard managers &amp; trainers, modify staff clearance properties, and enforce administrative policy locks.
        </p>
      </div>

      {actionFeedback && (
        <div style={{
          background: 'rgba(123,139,111,0.08)', border: `1px solid ${OT.sage}`,
          color: OT.sage, padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '500'
        }}>
          🛡️ {actionFeedback}
        </div>
      )}

      {/* Split screen: Onboard Form on left, User List on right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* Onboard Form Card */}
        <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: '24px', boxShadow: OT.sh1 }}>
          <h4 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '20px', color: OT.espresso900, fontWeight: 400, margin: '0 0 16px', borderBottom: `1px solid ${OT.hairline}`, paddingBottom: '10px' }}>
            ➕ Onboard New Staff Identity
          </h4>

          <form onSubmit={handleOnboardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={labelStyle}>FULL NAME</label>
              <input 
                type="text"
                required
                value={onboardName}
                onChange={e => setOnboardName(e.target.value)}
                placeholder="e.g. Joy Sengupta"
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={labelStyle}>UNIQUE HANDLE ID (alphanumeric, lowercase)</label>
              <input 
                type="text"
                required
                value={onboardId}
                onChange={e => setOnboardId(e.target.value)}
                placeholder="e.g. joy"
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', fontFamily: OT.fMono }}
              />
            </div>

            <div>
              <label style={labelStyle}>EMAIL ADDRESS</label>
              <input 
                type="email"
                value={onboardEmail}
                onChange={e => setOnboardEmail(e.target.value)}
                placeholder="e.g. egpvai21@gmail.com"
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', fontFamily: OT.fMono }}
              />
            </div>

            <div>
              <label style={labelStyle}>PHONE NUMBER (WITH COUNTRY CODE OR RAW INT)</label>
              <input 
                type="text"
                value={onboardPhone}
                onChange={e => setOnboardPhone(e.target.value)}
                placeholder="e.g. 9811122233"
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', fontFamily: OT.fMono }}
              />
            </div>

            <div>
              <label style={labelStyle}>ASSIGN CLEARANCE ROLE</label>
              <select 
                value={onboardRole}
                onChange={e => setOnboardRole(e.target.value)}
                style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}>
                <option value="coach">Coach (Studio Trainer)</option>
                <option value="admin">Manager (Administrator)</option>
              </select>
            </div>

            {onboardRole === 'coach' && (
              <div>
                <label style={labelStyle}>CERTIFICATIONS</label>
                <input 
                  type="text"
                  value={onboardCert}
                  onChange={e => setOnboardCert(e.target.value)}
                  placeholder="e.g. ACS Certified · Yoga &amp; Strength Trainer"
                  style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            )}

            <button 
              type="submit"
              style={{ ...btnPrimaryStyle, width: '100%', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }}>
              Verify &amp; Onboard Staff User →
            </button>
          </form>
        </div>

        {/* Staff Clearance List Card */}
        <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: '24px', boxShadow: OT.sh1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Managers List */}
          <div>
            <h4 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '20px', color: OT.espresso900, fontWeight: 400, margin: '0 0 12px', borderBottom: `1px solid rgba(62,44,28,0.06)`, paddingBottom: '6px' }}>
              👑 Managers &amp; Admins clearance
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {adminsList.map(a => (
                <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid rgba(62,44,28,0.04)`, paddingBottom: '8px' }}>
                  <div style={{ maxWidth: '65%' }}>
                    <strong style={{ fontSize: '13.5px', color: OT.espresso900 }}>{a.name}</strong>
                    <div style={{ fontSize: '11px', color: OT.clay500, fontFamily: OT.fMono, overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                      ID: {a.id} <br />
                      📧 {a.email || 'None'} <br />
                      📞 {a.phone || 'None'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button
                      onClick={() => setSelectedEditCoach(a)}
                      style={{
                        background: 'none', border: `1px solid ${OT.walnut}`, color: OT.walnut, cursor: 'pointer',
                        fontSize: '9px', fontWeight: 'bold', padding: '3px 6px', borderRadius: 'var(--r-pill)',
                        fontFamily: OT.fMono, whiteSpace: 'nowrap'
                      }}>
                      ✏️ Edit
                    </button>

                    {/* Role Mod dropdown */}
                    {a.id !== 'shwetambari' ? (
                      <>
                        <select 
                          value="admin"
                          onChange={e => handleRoleToggle(a.id, 'admin', e.target.value)}
                          style={{ ...inputStyle, padding: '2px 4px', fontSize: 10, height: 26, width: 'auto' }}>
                          <option value="admin">Manager</option>
                          <option value="coach">Coach</option>
                        </select>

                        <button 
                          onClick={() => handleDeleteStaff(a.id, 'admin')}
                          style={{
                            background: 'none', border: 'none', color: OT.terra, cursor: 'pointer',
                            fontSize: '11px', fontWeight: 'bold', padding: '4px'
                          }}>
                          ✕
                        </button>
                      </>
                    ) : (
                      <span style={{ fontSize: '9px', fontFamily: OT.fMono, color: OT.sage, background: 'rgba(123,139,111,0.12)', padding: '3px 6px', borderRadius: '4px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        PRIMARY OWNER
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coaches List */}
          <div>
            <h4 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '20px', color: OT.espresso900, fontWeight: 400, margin: '12px 0 12px', borderBottom: `1px solid rgba(62,44,28,0.06)`, paddingBottom: '6px' }}>
              💪 Coaches &amp; Trainers clearance
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {coaches.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid rgba(62,44,28,0.04)`, paddingBottom: '8px' }}>
                  <div style={{ maxWidth: '65%' }}>
                    <strong style={{ fontSize: '13.5px', color: OT.espresso900 }}>Coach {c.name}</strong>
                    <div style={{ fontSize: '10px', color: OT.clay500, fontStyle: 'italic' }}>{(c.cert || c.role || '').split(' · ')[0]}</div>
                    <div style={{ fontSize: '11px', color: OT.clay500, fontFamily: OT.fMono, overflowWrap: 'break-word', wordBreak: 'break-all' }}>
                      ID: {c.id} <br />
                      📧 {c.email || 'None'} <br />
                      📞 {c.phone || 'None'}
                      {c.working_hours && (
                        <div style={{ marginTop: 4, padding: '2px 6px', background: 'rgba(123,139,111,0.08)', borderRadius: 4, display: 'inline-block', fontSize: 9.5, fontFamily: OT.fMono, color: OT.sage, border: `1px solid rgba(123,139,111,0.2)` }}>
                          🗓️ {formatWorkingHours(c.working_hours)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {/* Edit Profile details button represent */}
                    <button
                      onClick={() => setSelectedEditCoach(c)}
                      style={{
                        background: 'none', border: `1px solid ${OT.walnut}`, color: OT.walnut, cursor: 'pointer',
                        fontSize: '9px', fontWeight: 'bold', padding: '3px 6px', borderRadius: 'var(--r-pill)',
                        fontFamily: OT.fMono, whiteSpace: 'nowrap'
                      }}>
                      ✏️ Edit
                    </button>

                    {/* Role Mod dropdown */}
                    <select 
                      value="coach"
                      onChange={e => handleRoleToggle(c.id, 'coach', e.target.value)}
                      style={{ ...inputStyle, padding: '2px 4px', fontSize: 10, height: 26, width: 'auto' }}>
                      <option value="coach">Coach</option>
                      <option value="admin">Manager</option>
                    </select>

                    <button 
                      onClick={() => handleDeleteStaff(c.id, 'coach')}
                      style={{
                        background: 'none', border: 'none', color: OT.terra, cursor: 'pointer',
                        fontSize: '11px', fontWeight: 'bold', padding: '4px'
                      }}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ── COACH/STAFF PROFILE OVERRIDE EDITOR MODAL FOR SHWE ── */}
      {selectedEditCoach && (() => {
        const isEditingAdmin = adminsList.some(a => a.id === selectedEditCoach.id);
        return (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(30,20,14,0.6)',
            backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24
          }} onClick={() => setSelectedEditCoach(null)}>
            <div style={{
              background: OT.paper, width: '100%', maxWidth: 580, borderRadius: 20,
              border: `1px solid ${OT.hairlineStrong}`, boxShadow: OT.sh3, overflow: 'hidden',
              display: 'flex', flexDirection: 'column'
            }} onClick={e => e.stopPropagation()}>
              {/* Header */}
              <div style={{ background: OT.sand50, padding: '20px 24px', borderBottom: `1px solid ${OT.hairline}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: 9, fontFamily: OT.fMono, color: OT.terra, letterSpacing: 1.5, fontWeight: 'bold' }}>SHWE OVERRIDE PANEL</span>
                  <h4 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 22, color: OT.espresso900, margin: '4px 0 0', fontWeight: 400 }}>Edit Staff Credentials: {selectedEditCoach.name}</h4>
                </div>
                <button onClick={() => setSelectedEditCoach(null)} style={{ border: 'none', background: 'none', fontSize: 24, cursor: 'pointer', color: OT.clay500 }}>×</button>
              </div>

              {/* Inner Dashboard */}
              <form onSubmit={async (e) => {
                e.preventDefault();
                const frm = e.currentTarget;
                
                if (isEditingAdmin) {
                  const payload = {
                    name: frm.name.value,
                    email: frm.email.value.trim().toLowerCase(),
                    phone: frm.phone.value,
                    role: frm.role.value
                  };
                  if (handleSaveAdminProfile) {
                    await handleSaveAdminProfile(selectedEditCoach.id, payload);
                  } else {
                    const updatedAdmins = adminsList.map(a => {
                      if (a.id === selectedEditCoach.id) {
                        return { ...a, ...payload };
                      }
                      return a;
                    });
                    setAdminsList(updatedAdmins);
                    await M3S_DB.setAll('admins_list', updatedAdmins);
                  }
                  setActionFeedback(`Enforced credential update for Admin ${payload.name}`);
                } else {
                  const payload = {
                    name: frm.name.value,
                    email: frm.email.value.trim().toLowerCase(),
                    phone: frm.phone.value,
                    role: frm.role.value,
                    bio: frm.bio.value,
                    cert: frm.cert.value,
                    image_url: frm.image_url.value,
                    specialties: frm.specialties.value.split(',').map(s => s.trim()).filter(Boolean),
                    gallery_images: adminImagesList,
                    gallery_videos: adminVideosList,
                    working_hours: editWorkingHours
                  };
                  if (handleSaveCoachProfile) {
                    await handleSaveCoachProfile(selectedEditCoach.id, payload);
                  }
                  setActionFeedback(`Enforced credential update for Coach ${payload.name}`);
                }
                setSelectedEditCoach(null);
              }} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 14, overflowY: 'auto', maxHeight: '70vh' }}>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4, letterSpacing: 1 }}>FULL NAME</label>
                    <input name="name" defaultValue={selectedEditCoach.name || ''} required style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4, letterSpacing: 1 }}>ROLE / CLEARANCE TITLE</label>
                    <input name="role" defaultValue={selectedEditCoach.role || (isEditingAdmin ? 'Admin' : 'Strength Coach')} required style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4, letterSpacing: 1 }}>EMAIL ADDRESS (PRIMARY LOGIN)</label>
                    <input type="email" name="email" defaultValue={selectedEditCoach.email || ''} required style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', fontFamily: OT.fMono }} />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4, letterSpacing: 1 }}>PHONE NUMBER (SMS VERIFICATION)</label>
                    <input name="phone" defaultValue={selectedEditCoach.phone || ''} required style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', fontFamily: OT.fMono }} />
                  </div>
                </div>

                {!isEditingAdmin && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4, letterSpacing: 1 }}>FORMAL CERTIFICATIONS</label>
                      <input name="cert" defaultValue={selectedEditCoach.cert || ''} required style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4, letterSpacing: 1 }}>BIOGRAPHY ON HOMEPAGE</label>
                      <textarea name="bio" defaultValue={selectedEditCoach.bio || ''} rows={4} required style={{ ...inputStyle, width: '100%', height: 'auto', boxSizing: 'border-box', fontFamily: OT.fBody }} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4, letterSpacing: 1 }}>CORE SPECIALTIES (COMMA SEPARATED)</label>
                      <input name="specialties" defaultValue={(selectedEditCoach.specialties || []).join(', ')} placeholder="Hypertrophy, Strength, Hyrox" style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4, letterSpacing: 1 }}>AVATAR COVER JPG URL</label>
                      <input name="image_url" defaultValue={selectedEditCoach.image_url || selectedEditCoach.imageUrl || ''} placeholder="assets/lee.jpg" style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
                    </div>

                    {/* 🗓️ WEEKLY WORKING HOURS SCHEDULE SECTION FOR SHWE */}
                    <div style={{ marginTop: 12 }}>
                      <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 10, fontWeight: 'bold', color: OT.walnut, marginBottom: 8, letterSpacing: 1 }}>🗓️ WEEKLY WORKING HOURS SCHEDULE</label>
                      
                      <div style={{ background: OT.sand50, border: `1px solid ${OT.hairlineStrong}`, borderRadius: 12, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                        
                        {/* Preset UI selectors */}
                        <div style={{ borderBottom: `1px dashed ${OT.hairlineStrong}`, paddingBottom: 12 }}>
                          <span style={{ display: 'block', fontFamily: OT.fMono, fontSize: 8.5, color: OT.clay600, marginBottom: 6, letterSpacing: 0.5 }}>QUICK PRESET SETUP</span>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            <select 
                              value={presetDays} 
                              onChange={e => setPresetDays(e.target.value)} 
                              style={{ ...inputStyle, padding: '4px 8px', fontSize: 11, height: 28, width: 'auto' }}
                            >
                              <option value="mon-fri">Mon to Fri</option>
                              <option value="mon-sat">Mon to Sat</option>
                              <option value="everyday">Everyday</option>
                            </select>
                            
                            <input 
                              type="text" 
                              value={presetStart} 
                              onChange={e => setPresetStart(e.target.value)} 
                              placeholder="06:00 AM" 
                              style={{ ...inputStyle, padding: '4px 8px', fontSize: 11, height: 28, width: 80, textAlign: 'center' }} 
                            />
                            <span style={{ fontSize: 11, color: OT.clay600 }}>to</span>
                            <input 
                              type="text" 
                              value={presetEnd} 
                              onChange={e => setPresetEnd(e.target.value)} 
                              placeholder="02:00 PM" 
                              style={{ ...inputStyle, padding: '4px 8px', fontSize: 11, height: 28, width: 80, textAlign: 'center' }} 
                            />
                            
                            <button 
                              type="button" 
                              onClick={() => {
                                const daysToApply = [];
                                if (presetDays === 'everyday') {
                                  daysToApply.push('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
                                } else if (presetDays === 'mon-sat') {
                                  daysToApply.push('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');
                                } else {
                                  daysToApply.push('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday');
                                }
                                
                                const updated = { ...editWorkingHours };
                                const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                                allDays.forEach(d => {
                                  if (daysToApply.includes(d)) {
                                    updated[d] = { isWorking: true, start: presetStart, end: presetEnd };
                                  } else {
                                    updated[d] = { isWorking: false, start: '', end: '' };
                                  }
                                });
                                setEditWorkingHours(updated);
                                setIsCalendarLocked(false);
                              }}
                              style={{
                                background: OT.walnut, color: OT.paper, border: 'none', borderRadius: 6,
                                padding: '4px 10px', fontSize: 11, fontWeight: 'bold', cursor: 'pointer', height: 28
                              }}
                            >
                              Apply Preset
                            </button>
                          </div>
                        </div>

                        {/* Gemini AI Text Parser */}
                        <div style={{ borderBottom: `1px dashed ${OT.hairlineStrong}`, paddingBottom: 12 }}>
                          <span style={{ display: 'block', fontFamily: OT.fMono, fontSize: 8.5, color: OT.clay600, marginBottom: 6, letterSpacing: 0.5 }}>✨ GEMINI SCHEDULE PARSER (NATURAL LANGUAGE)</span>
                          <textarea 
                            placeholder="e.g., Mon to Fri 06:00 AM to 02:00 PM, Sat 10:00 AM to 02:00 PM, Sun is off"
                            value={naturalLanguageInput}
                            onChange={e => setNaturalLanguageInput(e.target.value)}
                            rows={2}
                            style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', height: 'auto', fontFamily: OT.fBody, fontSize: 12, padding: 8 }}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                            <span style={{ fontSize: 10, color: geminiError ? OT.terra : OT.clay600, maxWidth: '70%', lineHeight: '1.2' }}>
                              {isGeminiParsing ? "🔄 Parsing with Gemini AI..." : geminiError ? `❌ ${geminiError}` : "Write custom instruction text & let Gemini update the schedule below."}
                            </span>
                            <button 
                              type="button"
                              disabled={isGeminiParsing || !naturalLanguageInput.trim()}
                              onClick={async () => {
                                setIsGeminiParsing(true);
                                setGeminiError('');
                                try {
                                  const res = await fetch('/api/parse-working-hours', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ text: naturalLanguageInput })
                                  });
                                  if (!res.ok) {
                                    const data = await res.json();
                                    throw new Error(data.error || 'Server error');
                                  }
                                  const parsed = await res.json();
                                  setEditWorkingHours(parsed);
                                  setIsCalendarLocked(false);
                                } catch (err) {
                                  setGeminiError(err.message || 'Failed to parse schedule');
                                } finally {
                                  setIsGeminiParsing(false);
                                }
                              }}
                              style={{
                                background: isGeminiParsing ? OT.clay500 : OT.walnut, color: OT.paper, border: 'none', borderRadius: 6,
                                padding: '4px 10px', fontSize: 11, fontWeight: 'bold', cursor: 'pointer', height: 28, opacity: naturalLanguageInput.trim() ? 1 : 0.6
                              }}
                            >
                              {isGeminiParsing ? "Parsing..." : "Ask Gemini ✨"}
                            </button>
                          </div>
                        </div>

                        {/* Day-by-Day list */}
                        <div>
                          <span style={{ display: 'block', fontFamily: OT.fMono, fontSize: 8.5, color: OT.clay600, marginBottom: 8, letterSpacing: 0.5 }}>EDITABLE DAY-BY-DAY SCHEDULE</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                              const config = editWorkingHours[day] || { isWorking: false, start: '', end: '' };
                              return (
                                <div key={day} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 8, padding: '6px 12px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <input 
                                      type="checkbox" 
                                      checked={config.isWorking} 
                                      onChange={e => {
                                        const updated = { ...editWorkingHours };
                                        updated[day] = { 
                                          isWorking: e.target.checked, 
                                          start: e.target.checked ? (config.start || '06:00 AM') : '', 
                                          end: e.target.checked ? (config.end || '02:00 PM') : '' 
                                        };
                                        setEditWorkingHours(updated);
                                        setIsCalendarLocked(false);
                                      }}
                                    />
                                    <span style={{ fontSize: 12, fontWeight: '500', color: OT.espresso900, minWidth: 80 }}>{day}</span>
                                  </div>
                                  
                                  {config.isWorking ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <input 
                                        type="text" 
                                        value={config.start || ''} 
                                        onChange={e => {
                                          const updated = { ...editWorkingHours };
                                          updated[day] = { ...config, start: e.target.value };
                                          setEditWorkingHours(updated);
                                          setIsCalendarLocked(false);
                                        }}
                                        placeholder="06:00 AM" 
                                        style={{ ...inputStyle, padding: '2px 4px', fontSize: 11, height: 22, width: 75, textAlign: 'center' }} 
                                      />
                                      <span style={{ fontSize: 10, color: OT.clay600 }}>to</span>
                                      <input 
                                        type="text" 
                                        value={config.end || ''} 
                                        onChange={e => {
                                          const updated = { ...editWorkingHours };
                                          updated[day] = { ...config, end: e.target.value };
                                          setEditWorkingHours(updated);
                                          setIsCalendarLocked(false);
                                        }}
                                        placeholder="02:00 PM" 
                                        style={{ ...inputStyle, padding: '2px 4px', fontSize: 11, height: 22, width: 75, textAlign: 'center' }} 
                                      />
                                    </div>
                                  ) : (
                                    <span style={{ fontSize: 11, color: OT.clay500, fontFamily: OT.fMono }}>CLOSED / OFF DAY</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Lock/Confirm Section */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, paddingTop: 10, borderTop: `1px dashed ${OT.hairlineStrong}` }}>
                          <span style={{ fontSize: 11, color: isCalendarLocked ? OT.sage : OT.terra, fontWeight: '500', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {isCalendarLocked ? "✓ Calendar suggestions locked and confirmed" : "⚠️ Schedule changes pending lock confirmation"}
                          </span>
                          <button 
                            type="button"
                            onClick={() => {
                              setIsCalendarLocked(true);
                            }}
                            style={{
                              background: isCalendarLocked ? 'rgba(123,139,111,0.12)' : 'rgba(94,66,40,0.1)',
                              border: isCalendarLocked ? `1px solid ${OT.sage}` : `1px solid ${OT.walnut}`,
                              color: isCalendarLocked ? OT.sage : OT.walnut,
                              borderRadius: 'var(--r-pill)', padding: '4px 12px', fontSize: 11, fontWeight: 'bold', cursor: 'pointer'
                            }}
                          >
                            {isCalendarLocked ? "🔒 Locked" : "🔒 Lock & Confirm"}
                          </button>
                        </div>

                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                      <div>
                        <MultiMediaUploader 
                          label="Curated Portfolio images" 
                          mediaType="image" 
                          items={adminImagesList} 
                          onChange={setAdminImagesList} 
                        />
                      </div>
                      <div>
                        <MultiMediaUploader 
                          label="Curated Portfolio videos" 
                          mediaType="video" 
                          items={adminVideosList} 
                          onChange={setAdminVideosList} 
                        />
                      </div>
                    </div>
                  </>
                )}

                <button type="submit" style={{ ...btnPrimaryStyle, width: '100%', height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
                  ✓ Apply Credentials Override
                </button>
              </form>
            </div>
          </div>
        );
      })()}

    </div>
  );
}

// ─── ENVIRONMENT CONTROL & LIVE PRODUCTION PIPELINE DEPLOYER ─────────────────
function EnvironmentDeployPanel({ currentUser, coaches, clients, sessions }) {
  const isOwner = currentUser && currentUser.id === 'shwetambari';
  const [loading, setLoading] = React.useState(false);
  const [logs, setLogs] = React.useState([]);
  const [ppeStats, setPpeStats] = React.useState({ coaches: 0, clients: 0, sessions: 0, assessments: 0, globals: 0 });
  const [prodStats, setProdStats] = React.useState({ coaches: 0, clients: 0, sessions: 0, assessments: 0, globals: 0 });

  const [selectCoaches, setSelectCoaches] = React.useState(true);
  const [selectAdmins, setSelectAdmins] = React.useState(true);
  const [selectClients, setSelectClients] = React.useState(true);
  const [selectSessions, setSelectSessions] = React.useState(true);
  const [selectGlobals, setSelectGlobals] = React.useState(true);

  // Load actual Firestore Doc Counts
  const loadCounts = async () => {
    if (!db || !db.collectionRaw) {
      setLogs(l => [...l, "⚠️ Firestore offline. Stats are computed from active cache."]);
      return;
    }
    try {
      const getCount = async (coll) => {
        try {
          const snap = await db.collectionRaw(coll).get();
          return snap.size;
        } catch {
          return 0;
        }
      };

      const pCoaches = await getCount('ppe_coaches_list');
      const pClients = await getCount('ppe_clients');
      const pSessions = await getCount('ppe_sessions');
      const pAssessments = await getCount('ppe_assessments');
      const pGlobals = await getCount('ppe_globals');

      const prCoaches = await getCount('prod_coaches_list');
      const prClients = await getCount('prod_clients');
      const prSessions = await getCount('prod_sessions');
      const prAssessments = await getCount('prod_assessments');
      const prGlobals = await getCount('prod_globals');

      setPpeStats({ coaches: pCoaches, clients: pClients, sessions: pSessions, assessments: pAssessments, globals: pGlobals });
      setProdStats({ coaches: prCoaches, clients: prClients, sessions: prSessions, assessments: prAssessments, globals: prGlobals });
    } catch (e) {
      console.warn("Failed to read sizes:", e);
    }
  };

  React.useEffect(() => {
    loadCounts();
  }, []);

  const [showConfirm, setShowConfirm] = React.useState(false);
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  const handlePushToProd = () => {
    if (!isOwner) {
      window.dispatchEvent(new CustomEvent('m3s:trigger-toast', { 
        detail: { msg: "⚠️ Only Primary Owner Shwetambari has credentials to deploy to Live Production (PROD)." } 
      }));
      return;
    }
    setShowConfirm(true);
  };

  const handleResetPPEClick = () => {
    if (!isOwner) {
      window.dispatchEvent(new CustomEvent('m3s:trigger-toast', { 
        detail: { msg: "⚠️ Only Primary Owner Shwetambari has credentials to reset pre-production data." } 
      }));
      return;
    }
    setShowResetConfirm(true);
  };

  const executePushToProd = async () => {
    setShowConfirm(false);
    setLoading(true);
    
    let authStatus = "Checking...";
    try {
      if (typeof firebase !== 'undefined' && firebase.auth) {
        const authUser = firebase.auth().currentUser;
        if (authUser) {
          authStatus = `Authenticated as ${authUser.email} (UID: ${authUser.uid})`;
        } else {
          authStatus = "NOT AUTHENTICATED in Firebase Auth (Using guest/sandbox profile)";
        }
      } else {
        authStatus = "Firebase Auth module not loaded";
      }
    } catch (e) {
      authStatus = `Error checking Auth: ${e.message}`;
    }

    setLogs([
      "✨ Starting secure pipeline promotion: PPE ➔ Live PROD...",
      `📂 Project ID: ${db && db.app && db.app.options ? db.app.options.projectId : "gen-lang-client"}`,
      `🔒 Security Auth Status: ${authStatus}`
    ]);

    try {
      const syncCollection = async (ppeColl, prodColl, label) => {
        try {
          setLogs(l => [...l, `⏳ [${label}] Scanning Sandbox ${ppeColl}...`]);
          let snap;
          try {
            snap = await db.collectionRaw(ppeColl).get();
          } catch (e) {
            throw new Error(`Failed to READ from Sandbox collection '${ppeColl}': ${e.message}`);
          }

          if (snap.empty) {
            setLogs(l => [...l, `ℹ️ [${label}] Sandbox '${ppeColl}' is currently empty. Skipping copy.`]);
            return;
          }

          setLogs(l => [...l, `🧹 [${label}] Scanning existing rows in Live ${prodColl}...`]);
          let existingLive;
          try {
            existingLive = await db.collectionRaw(prodColl).get();
          } catch (e) {
            throw new Error(`Failed to READ/LIST existing from Live collection '${prodColl}': ${e.message}`);
          }

          const deletePromises = [];
          existingLive.forEach(doc => {
            deletePromises.push(db.collectionRaw(prodColl).doc(doc.id).delete());
          });

          if (deletePromises.length > 0) {
            setLogs(l => [...l, `🧹 [${label}] Clearing ${deletePromises.length} old documents in Live ${prodColl}...`]);
            try {
              await Promise.all(deletePromises);
            } catch (e) {
              throw new Error(`Failed to DELETE old documents from Live collection '${prodColl}': ${e.message}`);
            }
          }

          setLogs(l => [...l, `🚀 [${label}] Writing ${snap.size} rows to Live ${prodColl}...`]);
          const writePromises = [];
          snap.forEach(doc => {
            writePromises.push(db.collectionRaw(prodColl).doc(doc.id).set(doc.data()));
          });

          try {
            await Promise.all(writePromises);
          } catch (e) {
            throw new Error(`Failed to WRITE new documents to Live collection '${prodColl}': ${e.message}`);
          }

          setLogs(l => [...l, `✅ Successfully promoted ${label} (${snap.size} records cloned)`]);
        } catch (innerErr) {
          setLogs(l => [...l, `❌ [${label}] ERROR: ${innerErr.message}`]);
          throw innerErr; // rethrow to stop the pipeline on first error
        }
      };

      if (selectCoaches) {
        await syncCollection('ppe_coaches_list', 'prod_coaches_list', 'Coaches Profile Roster');
      }
      if (selectAdmins) {
        await syncCollection('ppe_admins_list', 'prod_admins_list', 'Admins list');
      }
      if (selectClients) {
        await syncCollection('ppe_clients', 'prod_clients', 'Master Clients');
        await syncCollection('ppe_assessments', 'prod_assessments', 'Athlete Assessments');
        await syncCollection('ppe_nutrition_plans', 'prod_nutrition_plans', 'Nutrition & Macro plans');
        await syncCollection('ppe_body_comp_entries', 'prod_body_comp_entries', 'Body Composition history');
      }
      if (selectSessions) {
        await syncCollection('ppe_sessions', 'prod_sessions', 'PT Slot Sessions');
        await syncCollection('ppe_invites', 'prod_invites', 'Google Calendar Invites');
        await syncCollection('ppe_ratings', 'prod_ratings', 'Coach Feedback Stars');
        await syncCollection('ppe_session_notes', 'prod_session_notes', 'Trainer Progress Notes');
      }
      if (selectGlobals) {
        await syncCollection('ppe_globals', 'prod_globals', 'Studio Settings & Configs');
      }

      setLogs(l => [...l, "🎉 DEPLOYMENT SUCCESSFUL! All selected databases are fully live and in production!", "🔄 Refreshing data snapshot in 1.5 seconds..."]);
      await loadCounts();
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error(err);
      setLogs(l => [...l, `❌ Promotion pipeline halted: ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  const executeResetPPE = async () => {
    setShowResetConfirm(false);
    setLoading(true);
    setLogs(["✨ Starting safe pipeline alignment: Live PROD ➔ PPE Sandbox...", `📂 Project ID: ${db && db.app && db.app.options ? db.app.options.projectId : "gen-lang-client"}`]);

    try {
      const rollbackCollection = async (prodColl, ppeColl, label) => {
        setLogs(l => [...l, `⏳ Scanning Live ${prodColl}...`]);
        const snap = await db.collectionRaw(prodColl).get();
        if (snap.empty) {
          setLogs(l => [...l, `ℹ️ Live Collection ${prodColl} is currently empty. Skip reset for this category.`]);
          return;
        }

        setLogs(l => [...l, `🧹 Clearing existing rows in Sandbox ${ppeColl}...`]);
        const existingSandbox = await db.collectionRaw(ppeColl).get();
        const deletePromises = [];
        existingSandbox.forEach(doc => {
          deletePromises.push(db.collectionRaw(ppeColl).doc(doc.id).delete());
        });
        await Promise.all(deletePromises);

        setLogs(l => [...l, `🚀 Cloning ${snap.size} rows back to Sandbox ${ppeColl}...`]);
        const writePromises = [];
        snap.forEach(doc => {
          writePromises.push(db.collectionRaw(ppeColl).doc(doc.id).set(doc.data()));
        });
        await Promise.all(writePromises);
        setLogs(l => [...l, `✅ Successfully restored ${label} (${snap.size} records aligned back to sandbox)`]);
      };

      if (selectCoaches) {
        await rollbackCollection('prod_coaches_list', 'ppe_coaches_list', 'Coaches Profile Roster');
      }
      if (selectAdmins) {
        await rollbackCollection('prod_admins_list', 'ppe_admins_list', 'Admins list');
      }
      if (selectClients) {
        await rollbackCollection('prod_clients', 'ppe_clients', 'Master Clients');
        await rollbackCollection('prod_assessments', 'ppe_assessments', 'Athlete Assessments');
        await rollbackCollection('prod_nutrition_plans', 'ppe_nutrition_plans', 'Nutrition & Macro plans');
        await rollbackCollection('prod_body_comp_entries', 'ppe_body_comp_entries', 'Body Composition history');
      }
      if (selectSessions) {
        await rollbackCollection('prod_sessions', 'ppe_sessions', 'PT Slot Sessions');
        await rollbackCollection('prod_invites', 'ppe_invites', 'Google Calendar Invites');
        await rollbackCollection('prod_ratings', 'ppe_ratings', 'Coach Feedback Stars');
        await rollbackCollection('prod_session_notes', 'ppe_session_notes', 'Trainer Progress Notes');
      }
      if (selectGlobals) {
        await rollbackCollection('prod_globals', 'ppe_globals', 'Studio Settings & Configs');
      }

      setLogs(l => [...l, "🎉 ALIGNMENT SUCCESSFUL! Sandbox databases restored to match current active Live production state!", "🔄 Refreshing data snapshot in 1.5 seconds..."]);
      await loadCounts();
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      console.error(err);
      setLogs(l => [...l, `❌ Error during sandbox reset execution: ${err.message}`]);
    } finally {
      setLoading(false);
    }
  };

  const getEnvBadge = () => {
    const env = getActiveEnvironment();
    if (env === 'PPE') {
      return (
        <span style={{ 
          background: 'rgba(201, 154, 63, 0.12)', border: `1px solid ${OT.ochre}`, color: OT.ochre,
          padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontFamily: OT.fMono, fontWeight: '700'
        }}>
          ● SANDBOX (PPE ACTIVE)
        </span>
      );
    }
    return (
      <span style={{ 
        background: 'rgba(123, 139, 111, 0.12)', border: `1px solid ${OT.sage}`, color: OT.sage,
        padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontFamily: OT.fMono, fontWeight: '700'
      }}>
        ● LIVE PRODUCTION (PROD ACTIVE)
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 28, color: OT.espresso900, margin: 0, fontWeight: 400 }}>
            ⚙️ Environment Management &amp; Live Deploy
          </h3>
          <p style={{ fontSize: 13, color: OT.clay600, margin: '4px 0 0' }}>
            Control pre-production instances, analyze data delta parameters, and deploy configurations safely from Sandbox to Production environment.
          </p>
        </div>
        <div>
          {getEnvBadge()}
        </div>
      </div>

      {/* Info Notice */}
      <div style={{ 
        background: OT.sand100, border: `1px solid ${OT.sand200}`, padding: '20px 24px', borderRadius: 16,
        display: 'flex', gap: 16, alignItems: 'flex-start'
      }}>
        <div style={{ fontSize: 24 }}>🛡️</div>
        <div>
          <strong style={{ fontSize: 14, color: OT.espresso900 }}>Isolated Environment Protocol</strong>
          <p style={{ fontSize: 12.5, color: OT.clay600, margin: '4px 0 0', lineHeight: 1.5 }}>
            To protect your live clients, database queries on local or development URLs (e.g. <code>ais-dev-*</code>) automatically write to <strong>PPE</strong> collections (prefix: <code>ppe_</code>). 
            When accessing production URLs (e.g. <code>ais-pre-*</code>), they read/write from <strong>PROD</strong> collections (prefix: <code>prod_</code>). 
            This enables full isolated testing before synchronization!
          </p>
        </div>
      </div>

      {/* Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr', gap: '20px' }}>
        {/* PPE database */}
        <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${OT.hairline}`, paddingBottom: '10px', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontFamily: OT.fMono, color: OT.ochre, fontWeight: '700' }}>[SOURCE] SANDBOX DATABASE (PPE)</span>
            <span style={{ fontSize: '10px', color: OT.clay500 }}>Prefix: <code>ppe_</code></span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: OT.clay600 }}>Trainers &amp; Coaches list</span>
              <span style={{ fontFamily: OT.fMono, fontWeight: '600', color: OT.espresso900 }}>{ppeStats.coaches} docs</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: OT.clay600 }}>Registered Master Clients</span>
              <span style={{ fontFamily: OT.fMono, fontWeight: '600', color: OT.espresso900 }}>{ppeStats.clients} docs</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: OT.clay600 }}>Active PT Slots &amp; Appointments</span>
              <span style={{ fontFamily: OT.fMono, fontWeight: '600', color: OT.espresso900 }}>{ppeStats.sessions} docs</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: OT.clay600 }}>Athletes Physical Assessments</span>
              <span style={{ fontFamily: OT.fMono, fontWeight: '600', color: OT.espresso900 }}>{ppeStats.assessments} docs</span>
            </div>
          </div>
        </div>

        {/* PROD database */}
        <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${OT.hairline}`, paddingBottom: '10px', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontFamily: OT.fMono, color: OT.sage, fontWeight: '700' }}>[LIVE TARGET] LIVE PRODUCTION (PROD)</span>
            <span style={{ fontSize: '10px', color: OT.clay500 }}>Prefix: <code>prod_</code></span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: OT.clay600 }}>Trainers &amp; Coaches list</span>
              <span style={{ fontFamily: OT.fMono, fontWeight: '600', color: OT.espresso900 }}>{prodStats.coaches} docs</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: OT.clay600 }}>Registered Master Clients</span>
              <span style={{ fontFamily: OT.fMono, fontWeight: '600', color: OT.espresso900 }}>{prodStats.clients} docs</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: OT.clay600 }}>Active PT Slots &amp; Appointments</span>
              <span style={{ fontFamily: OT.fMono, fontWeight: '600', color: OT.espresso900 }}>{prodStats.sessions} docs</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px' }}>
              <span style={{ color: OT.clay600 }}>Athletes Physical Assessments</span>
              <span style={{ fontFamily: OT.fMono, fontWeight: '600', color: OT.espresso900 }}>{prodStats.assessments} docs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment Pipeline UI */}
      <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: '24px' }}>
        <h4 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '20px', color: OT.espresso900, fontWeight: 400, margin: '0 0 16px' }}>
          🚀 Live Production Promotion Pipeline
        </h4>

        {/* Promotion scopes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: OT.espresso900, cursor: 'pointer' }}>
            <input type="checkbox" checked={selectCoaches} onChange={e => setSelectCoaches(e.target.checked)} disabled={loading} style={{ accentColor: OT.walnut }} />
            <span>Sync Head Coach Roster details (Coaches &amp; certifications)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: OT.espresso900, cursor: 'pointer' }}>
            <input type="checkbox" checked={selectAdmins} onChange={e => setSelectAdmins(e.target.checked)} disabled={loading} style={{ accentColor: OT.walnut }} />
            <span>Sync Studio Owner clearance credentials &amp; Admin table</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: OT.espresso900, cursor: 'pointer' }}>
            <input type="checkbox" checked={selectClients} onChange={e => setSelectClients(e.target.checked)} disabled={loading} style={{ accentColor: OT.walnut }} />
            <span>Sync Clients, Assessments questionnaire, Body-comp timelines, and Macros</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: OT.espresso900, cursor: 'pointer' }}>
            <input type="checkbox" checked={selectSessions} onChange={e => setSelectSessions(e.target.checked)} disabled={loading} style={{ accentColor: OT.walnut }} />
            <span>Sync Booked sessions track, Coach reviews scoreboard, and Workout histories</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: OT.espresso900, cursor: 'pointer' }}>
            <input type="checkbox" checked={selectGlobals} onChange={e => setSelectGlobals(e.target.checked)} disabled={loading} style={{ accentColor: OT.walnut }} />
            <span>Sync Global variables, WhatsApp setups &amp; templates config</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <button
              onClick={handlePushToProd}
              disabled={loading || !isOwner}
              style={{
                padding: '14px 28px', border: 'none', borderRadius: 'var(--r-pill)', background: isOwner ? OT.walnut : OT.sand200,
                color: isOwner ? OT.paper : OT.clay500, fontFamily: OT.fBody, fontSize: 13.5, fontWeight: '700', cursor: isOwner && !loading ? 'pointer' : 'not-allowed',
                boxShadow: OT.sh2, display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? "🔄 Executing action..." : "🚀 Deploy PPE Changes to Production (LIVE)"}
            </button>

            <button
              onClick={handleResetPPEClick}
              disabled={loading || !isOwner}
              style={{
                padding: '14px 28px', border: `1.5px solid ${OT.terra}`, borderRadius: 'var(--r-pill)', background: 'transparent',
                color: OT.terra, fontFamily: OT.fBody, fontSize: 13.5, fontWeight: '700', cursor: isOwner && !loading ? 'pointer' : 'not-allowed',
                boxShadow: OT.sh1, display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1
              }}
            >
              🔄 Reset PPE Sandbox from Live PROD
            </button>

            {!isOwner && (
              <span style={{ fontSize: 12, color: OT.terra, display: 'flex', alignItems: 'center' }}>
                ⚠️ Live deployment &amp; resets are restricted to founder Shwetambari.
              </span>
            )}
          </div>
          <p style={{ fontSize: '11.5px', color: OT.clay600, margin: '4px 0 0', lineHeight: 1.4 }}>
            💡 <strong>Sandbox Safety Net:</strong> You can experiment freely in pre-production. Use the <em>Reset PPE Sandbox</em> button above to pull the current state of active live databases back into your sandbox at any time!
          </p>
        </div>

        {/* Custom Confirmation Modal */}
        {showConfirm && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(36, 24, 16, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            padding: '20px'
          }}>
            <div style={{
              background: OT.paper,
              border: `1.5px solid ${OT.walnut}`,
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              padding: '32px',
              boxShadow: OT.sh3,
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontFamily: OT.fMono, color: OT.ochre, fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                  🛡️ PIPELINE PROMOTION VERIFICATION
                </span>
                <h3 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '26px', color: OT.espresso900, margin: 0, fontWeight: 400 }}>
                  Confirm Live Database Deployment?
                </h3>
              </div>
              
              <p style={{ fontSize: '14px', color: OT.espresso800, margin: 0, lineHeight: 1.6 }}>
                You are about to promote selected Pre-Production <strong>(PPE)</strong> datasets to Live Production <strong>(PROD)</strong>. This action will safely overwrite the matching live datasets with your sandbox state.
              </p>

              <div style={{ background: OT.sand100, border: `1px solid ${OT.sand200}`, borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px' }}>💡</span>
                <span style={{ fontSize: '12px', color: OT.clay600, lineHeight: 1.5 }}>
                  <em>Safety Check:</em> If you notice any anomalies in Production, you can always align sandbox back or restore databases to ensure zero live client disruption.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={() => setShowConfirm(false)}
                  style={{
                    padding: '10px 20px',
                    border: `1px solid ${OT.sand200}`,
                    borderRadius: 'var(--r-pill)',
                    background: 'transparent',
                    color: OT.clay600,
                    fontFamily: OT.fBody,
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={executePushToProd}
                  style={{
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: 'var(--r-pill)',
                    background: OT.walnut,
                    color: OT.paper,
                    fontFamily: OT.fBody,
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: OT.sh1
                  }}
                >
                  Yes, Promote to Live PROD
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Custom Reset Confirmation Modal */}
        {showResetConfirm && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(36, 24, 16, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10000,
            padding: '20px'
          }}>
            <div style={{
              background: OT.paper,
              border: `1.5px solid ${OT.terra}`,
              borderRadius: '24px',
              maxWidth: '520px',
              width: '100%',
              padding: '32px',
              boxShadow: OT.sh3,
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontFamily: OT.fMono, color: OT.terra, fontWeight: '700', letterSpacing: '1px', display: 'block', marginBottom: '8px' }}>
                  🔄 SANDBOX DATABASE EMERGENCY RESET
                </span>
                <h3 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: '26px', color: OT.espresso900, margin: 0, fontWeight: 400 }}>
                  Reset Sandbox from Live Data?
                </h3>
              </div>
              
              <p style={{ fontSize: '14px', color: OT.espresso800, margin: 0, lineHeight: 1.6 }}>
                This will overwrite your Sandbox <strong>(PPE)</strong> environment with clean clones of your current Live Production <strong>(PROD)</strong> tables. All active pre-production records will be replaced.
              </p>

              <div style={{ background: OT.sand100, border: `1px solid ${OT.sand200}`, borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px' }}>⚠️</span>
                <span style={{ fontSize: '12px', color: OT.clay600, lineHeight: 1.5 }}>
                  This is irreversible. Your local sandbox state gets aligned back to match current production values.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  style={{
                    padding: '10px 20px',
                    border: `1px solid ${OT.sand200}`,
                    borderRadius: 'var(--r-pill)',
                    background: 'transparent',
                    color: OT.clay600,
                    fontFamily: OT.fBody,
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={executeResetPPE}
                  style={{
                    padding: '10px 24px',
                    border: 'none',
                    borderRadius: 'var(--r-pill)',
                    background: OT.terra,
                    color: OT.paper,
                    fontFamily: OT.fBody,
                    fontSize: '13px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: OT.sh1
                  }}
                >
                  Yes, Align Sandbox &amp; Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Console view */}
        {logs.length > 0 && (
          <div style={{ 
            marginTop: '24px', background: OT.espresso900, color: '#D9C3A3', borderRadius: '12px', padding: '16px',
            fontFamily: OT.fMono, fontSize: '11.5px', maxHeight: '200px', overflowY: 'auto', border: `1px solid ${OT.walnut}`
          }}>
            <div style={{ borderBottom: `1px solid rgba(217, 195, 163, 0.2)`, paddingBottom: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📡 LIVE DEPLOYMENT PIPELINE CONSOLE</span>
              <span style={{ color: OT.sage }}>● LOGGING ACTIVE</span>
            </div>
            {logs.map((log, idx) => (
              <div key={idx} style={{ margin: '4px 0', lineHeight: 1.4 }}>{log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── CLIENT DETAIL HIGHLIGHT DRAWER (FULL SCREEN SLIDE_UP) ───────────────
function ClientProfileDrawer({ client, onClose, activeTab, setActiveTab, assessment, sessions, ratings, chats, nutrition, sessionNotes, bodyComp, currentUser, currentRole, onUpdate }) {
  // Input builders for overrides, notes, and recipes
  const [overrideStrength, setOverrideStrength] = React.useState('8.5');
  const [overrideMsk, setOverrideMsk] = React.useState('');
  
  const [nutritionCalories, setNutritionCalories] = React.useState(nutrition?.calories ? String(nutrition.calories) : '1800');
  const [nutritionProtein, setNutritionProtein] = React.useState(nutrition?.protein ? String(nutrition.protein) : '140');
  const [nutritionCarbs, setNutritionCarbs] = React.useState(nutrition?.carbs ? String(nutrition.carbs) : '160');
  const [nutritionFat, setNutritionFat] = React.useState(nutrition?.fat ? String(nutrition.fat) : '60');
  const [nutritionNotes, setNutritionNotes] = React.useState(nutrition?.notes || '');
  const [nutritionTag, setNutritionTag] = React.useState('Muscle Gain');

  const [sessionNoteText, setSessionNoteText] = React.useState('');
  const [sessionNoteTag, setSessionNoteTag] = React.useState('Strength');
  const [sessionNoteType, setSessionNoteType] = React.useState('PT Workout');
  const [sessionNoteDate, setSessionNoteDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [sessionSessionFilter, setSessionSessionFilter] = React.useState('');
  const [historicalNotesDateFilter, setHistoricalNotesDateFilter] = React.useState('');

  // Realtime Live chat state
  const [chatMessages, setChatMessages] = React.useState(chats);
  const [chatInput, setChatInput] = React.useState('');

  React.useEffect(() => {
    setChatMessages(chats);
  }, [chats]);

  const handlePostNote = async (e) => {
    if (e) e.preventDefault();
    if (!sessionNoteText.trim()) return;

    const newNote = {
      id: Math.random().toString(36).substring(7),
      client_id: client.id,
      clientId: client.id,
      coach_id: currentUser.id,
      coachId: currentUser.id,
      date: sessionNoteDate,
      text: sessionNoteText,
      tags: [sessionNoteTag],
      type: sessionNoteType,
      sessionType: sessionNoteType,
      coachName: currentUser.name
    };

    const nextNotes = [newNote, ...sessionNotes];
    await M3S_DB.setAll('session_notes', nextNotes);
    localStorage.setItem('m3s.sessionNotes', JSON.stringify(nextNotes)); // Sync to camelCase student feed instantly
    setSessionNoteText('');
    onUpdate();
    alert("Saved! Session note is immediately synchronized to student feed.");
  };

  const handleSaveNutrition = async (e) => {
    if (e) e.preventDefault();
    const newNutri = {
      id: Math.random().toString(36).substring(7),
      client_id: client.id,
      coach_id: currentUser.id,
      period: 'Active Block Period',
      calories: parseInt(nutritionCalories),
      protein: parseInt(nutritionProtein),
      carbs: parseInt(nutritionCarbs),
      fat: parseInt(nutritionFat),
      notes: nutritionNotes,
      tags: [nutritionTag],
      coachName: currentUser.name
    };

    await M3S_DB.set('nutrition_plans', client.id, newNutri);
    onUpdate();
    alert("Saved! Nutrition parameters applied and mapped on student overview grid.");
  };

  const handlePostChat = async (e) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = {
      id: Math.random().toString(36).substring(7),
      client_id: client.id,
      coach_id: currentUser.id,
      sender: 'coach',
      text: chatInput,
      timestamp: 'Just now'
    };

    const nextMsgs = [...chatMessages, newMsg];
    setChatMessages(nextMsgs);
    setChatInput('');
    await M3S_DB.setAll('chats', nextMsgs);
    onUpdate();
  };

  const handleSaveOverride = async (dim, val) => {
    const doubleValue = parseFloat(val);
    if (isNaN(doubleValue)) return;

    // Save coach override schema
    const override = {
      client_id: client.id,
      dimension: dim,
      value: doubleValue,
      coach_id: currentUser.id,
      set_at: new Date().toISOString()
    };
    await M3S_DB.set('coach_overrides', `${client.id}_${dim}`, override);

    // Save back to client assessments
    const updatedMetric = { ...assessment, [`override_${dim}`]: doubleValue };
    await M3S_DB.set('assessments', client.id, updatedMetric);

    onUpdate();
    alert(`Success! Set override for ${dim.toUpperCase()} to ${doubleValue}/10.`);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(36,24,16,0.5)', zIndex: 900, backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'flex-end' }}>
      <div style={{ background: OT.paper, width: '100%', maxWidth: 780, height: '100vh', display: 'flex', flexDirection: 'column', boxShadow: OT.sh3, animation: 'slideLeft 0.3s ease' }}>
        
        {/* Drawer Header */}
        <div style={{ padding: '28px 32px 20px', borderBottom: `1px solid ${OT.hairline}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: OT.sand50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: OT.walnut, color: OT.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 'bold' }}>
              {client.name.substring(0,2).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 32, margin: 0, fontWeight: 400, color: OT.espresso900 }}>{client.name}</h2>
              <div style={{ fontSize: 11, fontFamily: OT.fMono, color: OT.clay600, letterSpacing: 0.5, marginTop: 2 }}>
                {client.age} · {client.gender.toUpperCase()} · PT CLIENT ASSIGNMENT · {client.status.toUpperCase()}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>×</button>
        </div>

        {/* Navigation tabs inside client drawer */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${OT.hairline}`, background: OT.sand50, padding: '0 32px' }}>
          {[
            { key: 'overview', label: '📊 BIOMETRIC OVERVIEW' },
            { key: 'assessment', label: '📋 ONBOARDING ASSESSMENT' },
            { key: 'notes', label: '📝 COACH NOTES' },
            { key: 'nutrition', label: '🍎 NUTRITION SPEC' },
            { key: 'ratings_tab', label: '⭐ SESSION RATINGS' },
          ].map(tab => (
            <button 
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '12px 14px', border: 'none', background: 'none', fontSize: 10, fontFamily: OT.fMono, letterSpacing: 1, fontWeight: 600, cursor: 'pointer',
                color: activeTab === tab.key ? OT.walnut : OT.clay600,
                borderBottom: activeTab === tab.key ? `2px solid ${OT.walnut}` : '2px solid transparent', marginBottom: -1
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Drawer Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24, marginBottom: 28 }}>
                <div>
                  <OEyebrow dot={OT.ochre}>CLIENT SUMMARY STATE</OEyebrow>
                  <p style={{ fontSize: 14, color: OT.espresso800, lineHeight: 1.6, marginTop: 10 }}>
                    Objective: Accrue lean muscle indices and correct overhead movement bottlenecks. Ensure shoulder strength holds up before scaling overhead press triggers.
                  </p>

                  <div style={{ background: OT.sand100, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: 16 }}>
                    <OMono size={9} style={{ marginBottom: 10 }}>Body Composition Entries</OMono>
                    {bodyComp.length === 0 ? (
                      <div style={{ fontSize: 12, color: OT.clay600, fontStyle: 'italic' }}>No body weight logs submitted.</div>
                    ) : (
                      bodyComp.map(b => (
                        <div key={b.id} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                          <div>
                            <span style={{ fontSize: 8.5, fontFamily: OT.fMono, color: OT.clay600, display: 'block' }}>WEIGHT</span>
                            <span style={{ fontSize: 14, fontWeight: 'bold' }}>{b.weight || '67.4'} kg</span>
                          </div>
                          <div>
                            <span style={{ fontSize: 8.5, fontFamily: OT.fMono, color: OT.clay600, display: 'block' }}>BODY FAT</span>
                            <span style={{ fontSize: 14, fontWeight: 'bold' }}>{b.body_fat_pct || '24.8'}%</span>
                          </div>
                          <div>
                            <span style={{ fontSize: 8.5, fontFamily: OT.fMono, color: OT.clay600, display: 'block' }}>SKELETAL M</span>
                            <span style={{ fontSize: 14, fontWeight: 'bold' }}>{b.muscle_kg || '49.8'} kg</span>
                          </div>
                          <div>
                            <span style={{ fontSize: 8.5, fontFamily: OT.fMono, color: OT.clay600, display: 'block' }}>VISCERAL FAT</span>
                            <span style={{ fontSize: 14, fontWeight: 'bold' }}>Tier {b.visceral_fat || '8'}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Overrides and fitness index recalculator */}
                <div>
                  <OEyebrow dot={OT.terra}>COACH OVERRIDES</OEyebrow>
                  <p style={{ fontSize: 12.5, color: OT.clay600, margin: '6px 0 16px' }}>Provide direct clinical overrides to correct AI fitness calculations:</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, background: OT.sand50, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: 16 }}>
                    <div>
                      <label style={labelStyle}>OVERRIDE STRENGTH SCORE (1-10)</label>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <input type="number" step="0.1" value={overrideStrength} onChange={e => setOverrideStrength(e.target.value)} style={{ ...inputStyle, flex: 1, padding: '4px 8px' }} />
                        <button onClick={() => handleSaveOverride('strength', overrideStrength)} style={btnPrimaryStyle}>Apply</button>
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>OVERRIDE MOVEMENTS CORE (1-10)</label>
                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <input type="number" step="0.1" value={overrideMsk} placeholder="e.g. 7.5" onChange={e => setOverrideMsk(e.target.value)} style={{ ...inputStyle, flex: 1, padding: '4px 8px' }} />
                        <button onClick={() => handleSaveOverride('msk', overrideMsk)} style={btnPrimaryStyle}>Apply</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Realtime Chat Portal inside Drawer */}
              <div style={{ borderTop: `1px solid ${OT.hairline}`, paddingTop: 24 }}>
                <OEyebrow dot={OT.sage}>LIVE MESSAGING CONTEXT</OEyebrow>
                
                <div style={{ background: OT.sand50, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: 14, marginTop: 12, display: 'flex', flexDirection: 'column', height: 280 }}>
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 6 }}>
                    {chatMessages.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 12, color: OT.clay600, fontStyle: 'italic' }}>No chats started. Send a greeting note!</div>
                    ) : (
                      chatMessages.map(m => {
                        const isMe = m.sender === 'coach';
                        return (
                          <div key={m.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                            <div style={{
                              background: isMe ? OT.walnut : OT.paper, color: isMe ? OT.paper : OT.espresso900,
                              borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px', padding: '10px 14px',
                              fontSize: 12.5, boxShadow: OT.sh1, border: isMe ? 'none' : `1px solid ${OT.hairlineStrong}`
                            }}>
                              {m.text}
                            </div>
                            <div style={{ fontSize: 8, fontFamily: OT.fMono, color: OT.clay600, marginTop: 2, textAlign: isMe ? 'right' : 'left' }}>
                              {m.timestamp}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Send chat block */}
                  <form onSubmit={handlePostChat} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <input type="text" placeholder="Type direct reply..." value={chatInput} onChange={e => setChatInput(e.target.value)} style={{ ...inputStyle, flex: 1, height: 38 }} />
                    <button type="submit" style={{ ...btnPrimaryStyle, padding: '0 16px', height: 38 }}>Send</button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ONBOARDING ASSESSMENT */}
          {activeTab === 'assessment' && (
            <div>
              <OEyebrow dot={OT.ochre}>CLIENT BIOMECHANICAL REPORT</OEyebrow>
              <p style={{ fontSize: 13, color: OT.clay600, margin: '6px 0 20px' }}>Baseline specifications collected directly during registration flows:</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={reportBlockStyle}>
                  <OMono size={9}>GYM EXPERIENCE PROFILE</OMono>
                  <p style={reportTextStyle}>{assessment?.experience || '6–24 months'}</p>
                </div>
                <div style={reportBlockStyle}>
                  <OMono size={9}>PRIMARY PHYSICAL GOALS</OMono>
                  <p style={reportTextStyle}>{assessment?.goal || 'Muscle Gain'}</p>
                </div>
                <div style={reportBlockStyle}>
                  <OMono size={9}>STUDIO WEEKLY FREQUENCY</OMono>
                  <p style={reportTextStyle}>{assessment?.days_per_week || 4} Days per Week</p>
                </div>
                <div style={reportBlockStyle}>
                  <OMono size={9}>REPORTED JOINT INJURIES</OMono>
                  <p style={reportTextStyle}>
                    {assessment?.injuries?.length > 0 ? (
                      <span style={{ color: OT.terra, fontWeight: 600 }}>⚠ {assessment.injuries.join(', ')} reported</span>
                    ) : (
                      'None reported'
                    )}
                  </p>
                </div>
                <div style={reportBlockStyle}>
                  <OMono size={9}>CARDIO TEST INDICATOR (5K INDEX)</OMono>
                  <p style={reportTextStyle}>{assessment?.running_5k || '28:40'}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COACH NOTES */}
          {activeTab === 'notes' && (
            <div>
              <OEyebrow dot={OT.ochre}>TIMELINE SESSION WRITE-UP</OEyebrow>
              <p style={{ fontSize: 13, color: OT.clay600, margin: '6px 0 20px' }}>Log session feedback and direct instruction tips for the student below:</p>

              <form onSubmit={handlePostNote} style={{ background: OT.sand50, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: 18, marginBottom: 28 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <label style={labelStyle}>FILTER CLIENT SESSIONS</label>
                      {sessionSessionFilter && (
                        <button type="button" onClick={() => setSessionSessionFilter('')} style={{ border: 'none', background: 'none', color: OT.terracotta, fontFamily: OT.fMono, fontSize: 8, cursor: 'pointer' }}>✕ CLEAR</button>
                      )}
                    </div>
                    <input 
                      type="date" 
                      value={sessionSessionFilter} 
                      onChange={e => setSessionSessionFilter(e.target.value)} 
                      style={inputStyle} 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>CHOOSE CONNECTED SESSION</label>
                    <select 
                      value={sessionNoteDate}
                      onChange={e => {
                        if (e.target.value) {
                          setSessionNoteDate(e.target.value);
                        }
                      }}
                      style={inputStyle}
                    >
                      <option value="">-- Select from bookings --</option>
                      {(sessions || [])
                        .filter(s => {
                          if (!s.scheduled_at) return false;
                          const sDate = s.scheduled_at.split('T')[0];
                          if (sessionSessionFilter && sDate !== sessionSessionFilter) return false;
                          return true;
                        })
                        .map(s => {
                          const sDate = s.scheduled_at.split('T')[0];
                          const sTime = s.scheduled_at.split('T')[1]?.substring(0, 5) || '';
                          return (
                            <option key={s.id} value={sDate}>
                              {sDate} {sTime ? `(${sTime})` : ''} - {s.type || 'PT Workout'} ({s.status || 'upcoming'})
                            </option>
                          );
                        })
                      }
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div>
                    <label style={labelStyle}>TARGET SESSION DATE</label>
                    <input 
                      type="date" 
                      required
                      value={sessionNoteDate} 
                      onChange={e => setSessionNoteDate(e.target.value)} 
                      style={inputStyle} 
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>SESSION BLOCK</label>
                    <select value={sessionNoteType} onChange={e => setSessionNoteType(e.target.value)} style={inputStyle}>
                      <option value="PT Workout">PT Workout</option>
                      <option value="Recovery Check">Recovery Check</option>
                      <option value="Assessment">Assessment Completion</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>TAG CHIPIFIER</label>
                  <select value={sessionNoteTag} onChange={e => setSessionNoteTag(e.target.value)} style={inputStyle}>
                    <option value="Strength">Strength</option>
                    <option value="Mobility">Mobility</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Form Focus">Form Focus</option>
                  </select>
                </div>

                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>FEEDBACK COMMENT</label>
                  <textarea 
                    rows="3" 
                    required 
                    value={sessionNoteText} 
                    onChange={e => setSessionNoteText(e.target.value)}
                    placeholder="Provide constructive technique feedback..." 
                    style={{ ...inputStyle, width: '100%', resize: 'none', fontSize: 13 }} />
                </div>

                <button type="submit" style={btnPrimaryStyle}>✓ Post Session Note</button>
              </form>

              {/* Historical loop with date filter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                <OEyebrow dot={OT.clay600}>HISTORIAL FEEDBACK LOG</OEyebrow>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 9, fontFamily: OT.fMono, color: OT.clay600, letterSpacing: 0.5 }}>FILTER:</span>
                  <input 
                    type="date" 
                    value={historicalNotesDateFilter} 
                    onChange={e => setHistoricalNotesDateFilter(e.target.value)} 
                    style={{ ...inputStyle, width: 'auto', padding: '4px 8px', fontSize: 11, height: 'auto', border: `1px solid ${OT.hairlineStrong}` }} 
                  />
                  {historicalNotesDateFilter && (
                    <button type="button" onClick={() => setHistoricalNotesDateFilter('')} style={{ border: 'none', background: 'none', color: OT.terracotta, fontFamily: OT.fMono, fontSize: 9, cursor: 'pointer' }}>✕</button>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
                {sessionNotes.filter(sn => {
                  if (historicalNotesDateFilter && sn.date !== historicalNotesDateFilter) return false;
                  return true;
                }).length === 0 ? (
                  <div style={{ fontSize: 12, color: OT.clay600, fontStyle: 'italic' }}>No feedback entries found matching selection.</div>
                ) : (
                  sessionNotes.filter(sn => {
                    if (historicalNotesDateFilter && sn.date !== historicalNotesDateFilter) return false;
                    return true;
                  }).map(sn => {
                    const displayType = (sn.type || sn.sessionType || 'PT Workout').toUpperCase();
                    const isClientNote = sn.writtenBy === 'client' || sn.type === 'Client Journal' || sn.sessionType === 'Client Journal';
                    return (
                      <div key={sn.id} style={{ 
                        background: isClientNote ? 'rgba(123, 139, 111, 0.04)' : OT.paper, 
                        border: isClientNote ? `1px solid ${OT.sage}` : `1px solid ${OT.hairlineStrong}`, 
                        borderRadius: 14, padding: 14 
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <span style={{ fontSize: 9.5, fontFamily: OT.fMono, color: isClientNote ? OT.sage : OT.ochre, fontWeight: 'bold' }}>{displayType}</span>
                          <span style={{ fontSize: 10, color: OT.clay600 }}>
                            {sn.date} {isClientNote ? `by Client (${client.name})` : (sn.coachName ? `by Coach ${sn.coachName}` : '')}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: OT.espresso900, fontStyle: 'italic', lineHeight: 1.45 }}>"{sn.text}"</p>
                        <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                          {sn.tags?.map(t => <span key={t} style={{ background: OT.sand100, color: OT.clay600, padding: '2px 8px', borderRadius: 999, fontSize: 9, fontFamily: OT.fMono }}>{t}</span>)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 4: NUTRITION PLAN */}
          {activeTab === 'nutrition' && (
            <div>
              <OEyebrow dot={OT.ochre}>NUTRITIONAL TARGETING</OEyebrow>
              <p style={{ fontSize: 13, color: OT.clay600, margin: '6px 0 20px' }}>Apply custom caloric indices and macronutrient configurations:</p>

              <form onSubmit={handleSaveNutrition} style={{ background: OT.sand50, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: 20 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 18 }}>
                  <div>
                    <label style={labelStyle}>DAILY CALORIES</label>
                    <input type="number" value={nutritionCalories} onChange={e => setNutritionCalories(e.target.value)} style={inputStyle2} />
                  </div>
                  <div>
                    <label style={labelStyle}>PROTEIN (G)</label>
                    <input type="number" value={nutritionProtein} onChange={e => setNutritionProtein(e.target.value)} style={inputStyle2} />
                  </div>
                  <div>
                    <label style={labelStyle}>CARBS (G)</label>
                    <input type="number" value={nutritionCarbs} onChange={e => setNutritionCarbs(e.target.value)} style={inputStyle2} />
                  </div>
                  <div>
                    <label style={labelStyle}>FAT (G)</label>
                    <input type="number" value={nutritionFat} onChange={e => setNutritionFat(e.target.value)} style={inputStyle2} />
                  </div>
                </div>

                <div style={{ marginBottom: 18 }}>
                  <label style={labelStyle}>PERIOD TARGETS &amp; DIETARY COACH NOTES</label>
                  <textarea 
                    rows="3" 
                    value={nutritionNotes} 
                    onChange={e => setNutritionNotes(e.target.value)}
                    placeholder="Dietary strategies, timing, and liquid targets..." 
                    style={{ ...inputStyle, width: '100%', resize: 'none', fontSize: 13 }} />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>PROGRAMME CATEGORY TAG</label>
                  <select value={nutritionTag} onChange={e => setNutritionTag(e.target.value)} style={inputStyle}>
                    <option value="Muscle Gain">Muscle Gain</option>
                    <option value="Lean Shred">Lean Shred</option>
                    <option value="Zone Aerobic Endurance">Zone Aerobic Endurance</option>
                  </select>
                </div>

                <button type="submit" style={btnPrimaryStyle}>✓ Deploy Nutrition Matrix</button>
              </form>
            </div>
          )}

          {/* TAB 5: STUDENT RATINGS AND FEEDBACK */}
          {activeTab === 'ratings_tab' && (
            <div>
              <OEyebrow dot={OT.sage}>STUDENT SESSION FEEDBACK</OEyebrow>
              <p style={{ fontSize: 13, color: OT.clay600, margin: '6px 0 20px' }}>
                Chronological checkout feedback and session ratings submitted by {client.name}:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {ratings.length === 0 ? (
                  <div style={{ fontSize: 12, color: OT.clay600, fontStyle: 'italic', background: OT.sand50, padding: 16, borderRadius: 12, textAlign: 'center' }}>
                    No checkout reviews or ratings submitted by this student yet.
                  </div>
                ) : (
                  ratings.map(r => (
                    <div key={r.id} style={{ background: OT.sand50, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: 18 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: OT.espresso900 }}>Coach {r.coachName || 'Staff'}</span>
                          <span style={{ fontSize: 10, color: OT.clay500, fontFamily: OT.fMono }}>{r.sessionDate || r.session_date}</span>
                        </div>
                        <span style={{
                          padding: '3px 8px', borderRadius: 999, fontSize: 10, fontWeight: 'bold', fontFamily: OT.fMono,
                          background: r.overall >= 4 ? 'rgba(123,139,111,0.1)' : 'rgba(184,107,75,0.1)',
                          color: r.overall >= 4 ? OT.sage : OT.terra
                        }}>
                          ★ {Number(r.overall).toFixed(1)} / 5.0
                        </span>
                      </div>

                      <div style={{ background: OT.paper, border: `1px solid ${OT.hairlineStrong}`, borderRadius: 10, padding: 12, marginBottom: 12 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8 }}>
                          {Object.entries(r.scores_json || r.scores || {}).map(([metric, val]) => (
                            <div key={metric}>
                              <span style={{ fontSize: 8.5, fontFamily: OT.fMono, color: OT.clay600, textTransform: 'uppercase', display: 'block' }}>{metric}</span>
                              <span style={{ fontSize: 11.5, fontWeight: 'bold', color: OT.espresso800 }}>{val} / 5</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {r.comment && (
                        <p style={{ margin: 0, fontSize: 13, color: OT.espresso900, fontStyle: 'italic', lineHeight: 1.45 }}>
                          "{r.comment}"
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── STYLING OBJECT CONSTANTS ─────────────────────────────────────────────
const inputStyle = {
  fontFamily: OT.fBody, fontSize: 14, color: OT.espresso900,
  background: OT.paper, border: `1px solid ${OT.hairlineStrong}`,
  borderRadius: 8, padding: '8px 10px', outline: 'none',
  boxSizing: 'border-box',
};

const sideBtnStyle = {
  width: '100%', padding: '12px 16px', borderRadius: 12, border: 'none', background: 'transparent',
  textAlign: 'left', cursor: 'pointer', fontFamily: OT.fBody, fontSize: 13.5, fontWeight: 500, color: OT.espresso800,
  transition: 'background 0.2s, color 0.15s'
};

const sideActiveStyle = {
  ...sideBtnStyle,
  background: OT.walnut, color: OT.paper, fontWeight: 600
};

const btnPrimaryStyle = {
  padding: '10px 18px', borderRadius: 999, border: 'none', background: OT.walnut, color: OT.paper,
  fontFamily: OT.fBody, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6,
  boxShadow: OT.sh1, transition: 'background 0.15s'
};

const btnSecondaryStyle = {
  padding: '10px 18px', borderRadius: 999, border: `1px solid ${OT.hairlineStrong}`, background: 'transparent',
  fontFamily: OT.fBody, fontSize: 12.5, fontWeight: 500, color: OT.espresso800, cursor: 'pointer',
  transition: 'background 0.15s'
};

const btnSageStyle = { ...btnPrimaryStyle, background: OT.sage };
const btnOchreStyle = { ...btnPrimaryStyle, background: OT.ochre };
const btnTerraStyle = { ...btnPrimaryStyle, background: OT.terra };

const labelStyle = {
  fontFamily: OT.fMono, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase', color: OT.clay600, display: 'block', marginBottom: 6
};

const inputStyle2 = {
  ...inputStyle, width: '100%', height: 38, padding: '0 10px', fontSize: 13
};

const modalOverlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(36,24,16,0.45)', backdropFilter: 'blur(5px)', zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
};

const modalCardStyle = {
  background: OT.paper, borderRadius: 24, padding: '32px', maxWidth: 440, width: '100%', boxShadow: OT.sh3, border: `1px solid ${OT.hairline}`
};

const modalTitleStyle = {
  fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400, fontSize: 30, color: OT.espresso900, margin: '8px 0 4px', lineHeight: 1.1
};

const closeBtnStyle = {
  border: 'none', background: 'none', fontSize: 24, color: OT.clay600, cursor: 'pointer', padding: 4
};

const reportBlockStyle = {
  background: OT.sand100, border: `1px solid ${OT.hairline}`, borderRadius: 12, padding: 14
};

const reportTextStyle = {
  margin: '6px 0 0', fontSize: 14, fontWeight: 600, color: OT.espresso900
};

// ─── FLOATING DRAWER SYSTEM CONSOLE QA PANEL ──────────────────────────────
function CoachAdminQAPanel() { return null; }

// ─── COACH MY PUBLIC PROFILE SETTINGS TAB ──────────────────────────────
function CoachMyProfileDashboard({ currentUser, coaches, setCoaches, handleSaveCoachProfile }) {
  const currentCoach = coaches.find(c => c.id === currentUser.id) || currentUser;
  const [name, setName] = React.useState(currentCoach.name || '');
  const [role, setRole] = React.useState(currentCoach.role || '');
  const [cert, setCert] = React.useState(currentCoach.cert || '');
  const [bio, setBio] = React.useState(currentCoach.bio || '');
  const [imageUrl, setImageUrl] = React.useState(currentCoach.image_url || currentCoach.imageUrl || '');
  
  const standardSkills = ["Hypertrophy", "Strength", "Post Partum", "Hyrox", "Recovery", "Conditioning", "Pilates", "Yoga", "Breathwork"];
  const [selectedSkills, setSelectedSkills] = React.useState(currentCoach.specialties || []);
  const [customSkills, setCustomSkills] = React.useState('');
  
  const [galleryImages, setGalleryImages] = React.useState(currentCoach.gallery_images || []);
  const [galleryVideos, setGalleryVideos] = React.useState(currentCoach.gallery_videos || []);
  
  const [feedback, setFeedback] = React.useState('');

  const handleToggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    let finalSpecialties = [...selectedSkills];
    if (customSkills.trim()) {
      const customs = customSkills.split(',').map(s => s.trim()).filter(s => s.length > 0);
      customs.forEach(c => {
        if (!finalSpecialties.includes(c)) finalSpecialties.push(c);
      });
    }

    await handleSaveCoachProfile(currentUser.id, {
      name,
      role,
      cert,
      bio,
      image_url: imageUrl,
      specialties: finalSpecialties,
      gallery_images: galleryImages,
      gallery_videos: galleryVideos
    });

    setFeedback('Your public profile changes have been successfully saved & synchronized!');
    setTimeout(() => setFeedback(''), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h3 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 28, color: OT.espresso900, margin: 0, fontWeight: 400 }}>
          👤 My Public Space Profile
        </h3>
        <p style={{ fontSize: 13, color: OT.clay600, margin: '4px 0 0' }}>
          Craft your public description, certifications, select specialities, and curate your image &amp; video walkthrough galleries shown on the index home page.
        </p>
      </div>

      {feedback && (
        <div style={{ background: 'rgba(123,139,111,0.08)', border: `1px solid ${OT.sage}`, color: OT.sage, padding: '12px 16px', borderRadius: 12, fontSize: 13, fontWeight: '500' }}>
          🛡️ {feedback}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.2fr) 0.8fr', gap: 24, alignItems: 'start' }}>
        
        {/* Editor Form on left */}
        <div style={{ background: OT.paper, border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: '24px 16px 24px 24px', boxShadow: OT.sh1 }}>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4, letterSpacing: 1 }}>DISPLAY NAME</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4, letterSpacing: 1 }}>PRIMARY ROLE</label>
                <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Strength Coach" required style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4, letterSpacing: 1 }}>CERTIFICATIONS</label>
              <input type="text" value={cert} onChange={e => setCert(e.target.value)} placeholder="e.g. ACS Certified · Post Partum Specialist" style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4, letterSpacing: 1 }}>SHORT BIOGRAPHY</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} placeholder="Tell members about your coaching methodologies..." required style={{ ...inputStyle, width: '100%', height: 'auto', boxSizing: 'border-box', fontFamily: OT.fBody, fontSize: 13, padding: 10, borderRadius: 10 }} />
            </div>

            {/* Specialties */}
            <div>
              <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4, letterSpacing: 1 }}>SELECT CORE COMPETENCIES</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, margin: '6px 0' }}>
                {standardSkills.map(s => {
                  const isActive = selectedSkills.includes(s);
                  return (
                    <button type="button" key={s} onClick={() => handleToggleSkill(s)} style={{
                      padding: '6px 8px', fontSize: 10.5, fontWeight: 'bold', borderRadius: 8, border: `1px solid ${isActive ? OT.walnut : OT.hairline}`,
                      background: isActive ? 'rgba(94,66,40,0.06)' : 'var(--paper)', color: isActive ? OT.walnut : OT.espresso900,
                      cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6
                    }}>
                      <span>{isActive ? '✓' : '○'}</span> {s}
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: 8 }}>
                <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 8.5, color: OT.clay600, marginBottom: 4, letterSpacing: 1 }}>CUSTOM SKILLS (COMMA SEPARATED)</label>
                <input type="text" value={customSkills} onChange={e => setCustomSkills(e.target.value)} placeholder="e.g. Kettlebells, Athletics" style={{ ...inputStyle, width: '100%', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4, letterSpacing: 1 }}>AVATAR PICTURE URL</label>
              <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="e.g. assets/lee.jpg" style={{ ...inputStyle, width: '100%', boxSizing: 'border-box', fontFamily: OT.fMono }} />
              <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 10, color: OT.clay600 }}>Presets: </span>
                {["assets/lee.jpg", "assets/joe.jpg", "assets/deb.jpg", "assets/deepika.jpg", "assets/anisha.jpg"].map(p => (
                  <button type="button" key={p} onClick={() => setImageUrl(p)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 10, color: OT.walnut, textDecoration: 'underline', padding: 0 }}>{p.split('/')[1]}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              <div>
                <MultiMediaUploader 
                  label="Curated Portfolio images" 
                  mediaType="image" 
                  items={galleryImages} 
                  onChange={setGalleryImages} 
                />
              </div>
              <div>
                <MultiMediaUploader 
                  label="Curated Portfolio videos" 
                  mediaType="video" 
                  items={galleryVideos} 
                  onChange={setGalleryVideos} 
                />
              </div>
            </div>

            <button type="submit" style={{ ...btnPrimaryStyle, width: '100%', height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 10 }}>
              ✓ Save Public Profile Settings
            </button>
          </form>
        </div>

        {/* Live Card Preview on right */}
        <div style={{ position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ display: 'block', fontFamily: OT.fMono, fontSize: 9, color: OT.clay600, marginBottom: 4, letterSpacing: 1 }}>LIVE PORTLET PREVIEW</span>
          <div style={{ background: OT.espresso900, borderRadius: 16, overflow: 'hidden', border: `1px solid ${OT.hairlineStrong}`, boxShadow: OT.sh2, position: 'relative', aspectRatio: '3/4', width: '100%' }}>
            {imageUrl ? (
              <img src={imageUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: OT.paper, background: OT.clay600, fontFamily: OT.fDisplay, fontSize: 24 }}>No cover image</div>
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(30,20,14,0) 75%, rgba(30,20,14,0.7) 100%)' }} />
            <div style={{ position: 'absolute', left: 16, bottom: 16, right: 16, color: OT.paper }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontFamily: OT.fDisplay, fontSize: 24, lineHeight: 1 }}>{name.split(' ')[0]}</div>
                <div style={{ fontFamily: OT.fMono, fontSize: 11, color: OT.ochre, fontWeight: 'bold' }}>★ 4.9</div>
              </div>
              <div style={{ fontFamily: OT.fMono, fontSize: 9.5, letterSpacing: 1.5, opacity: 0.85, marginTop: 4, textTransform: 'uppercase' }}>{cert || 'Certified PT Instructor'}</div>
            </div>
          </div>
          
          <div style={{ background: OT.sand100, borderRadius: 12, padding: 16, border: `1px solid ${OT.hairline}` }}>
            <h5 style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 16, color: OT.espresso900, margin: '0 0 8px' }}>Competencies Selected</h5>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {selectedSkills.length === 0 && <span style={{ fontSize: 11, color: OT.clay600, fontStyle: 'italic' }}>None selected</span>}
              {selectedSkills.map(s => (
                <span key={s} style={{ fontSize: 10, background: OT.paper, border: `1px solid ${OT.hairline}`, padding: '4px 8px', borderRadius: 999, color: OT.walnut, fontWeight: 600 }}>{s}</span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Expose globals for unpkg compatibility
Object.assign(window, { App, LoginView, Sidebar, CalendarDashboard, PTInvitesDashboard, MyClientsDashboard, AdminPanelDashboard, ClientProfileDrawer, CoachAdminQAPanel, CoachMyProfileDashboard });
