/* eslint-disable */
// M3S Client Onboarding — 6-step flow
// Reuses tokens & coach roster from v1_240426


// ─── Tokens (mirrored from tokens.css) ────────────────────────────────────
const OT = {
  sand50:  '#FBF7F0',
  sand100: '#F5EDE0',
  sand200: '#EADBC4',
  sand300: '#D9C3A3',
  paper:   '#FFFDF8',
  ink:     '#1C140E',
  clay500: '#A8825A',
  clay600: '#8A6640',
  walnut:  '#5E4228',
  espresso800: '#3E2C1C',
  espresso900: '#241810',
  ochre:   '#C99A3F',
  sage:    '#7B8B6F',
  terra:   '#B86B4B',
  clay:    '#A8825A',
  ok:      '#5E8A5E',
  warn:    '#C97A3F',
  bad:     '#B0463A',
  hairline:       'rgba(62,44,28,0.12)',
  hairlineStrong: 'rgba(62,44,28,0.22)',
  fDisplay: '"Instrument Serif", "Cormorant Garamond", Georgia, serif',
  fBody:    '"Inter", system-ui, sans-serif',
  fMono:    '"JetBrains Mono", ui-monospace, monospace',
  sh1: '0 1px 2px rgba(62,44,28,0.06)',
  sh2: '0 6px 20px -8px rgba(62,44,28,0.18)',
  sh3: '0 20px 50px -20px rgba(62,44,28,0.35)',
};

// Coach roster — copied from versions/v1_240426/data.js so this file is self-contained
const COACHES = [
  { id: "joe",     name: "Joe",     role: "Hypertrophy & Strength", tone: "espresso", bio: "Block-periodised hypertrophy. Muscle you can actually use.", specialties: ["Hypertrophy", "Strength", "Recovery"], initials: "JO", cert: "Strength · Hypertrophy", ptEligible: true,  avail: 0.55 },
  { id: "deb",     name: "Deb",     role: "Strength & Recovery", tone: "walnut",   bio: "Post-rehab strength and long-term recovery planning.", specialties: ["Strength", "Recovery", "Hyrox Prep"], initials: "DB", cert: "Strength · Recovery", ptEligible: true,  avail: 0.7 },
  { id: "deepika", name: "Deepika", role: "Hyrox & Conditioning", tone: "terra",   bio: "Zone 2 devotee turned Hyrox specialist. Endurance with structure.", specialties: ["Hyrox Prep", "Strength", "Conditioning"], initials: "DE", cert: "Hyrox · Strength", ptEligible: true, avail: 0.4 },
  { id: "lee",     name: "Lee",     role: "Hypertrophy & Strength", tone: "sage",  bio: "Form first, always. The coach who makes the last rep look like the first.", specialties: ["Hypertrophy", "Strength", "Recovery"], initials: "LE", cert: "Hypertrophy · Strength", ptEligible: true, avail: 0.85 },
  { id: "pilates", name: "Anisha",  role: "Pilates & Mobility", tone: "sand",      bio: "Clinical Pilates for posture, core control, and post-injury returns.", specialties: ["Pilates", "Mobility", "Recovery"], initials: "AN", cert: "Pilates · Mobility", ptEligible: false, avail: 0.6 },
  { id: "rahul",   name: "Rahul",   role: "Strength & Hyrox Prep", tone: "walnut", bio: "Competition-tested Hyrox coach. Builds engines that don't quit in round four.", specialties: ["Strength", "Hyrox Prep", "Conditioning"], initials: "RA", cert: "Strength · Hyrox · Recovery", ptEligible: true, avail: 0.3 },
  { id: "aakash",  name: "Aakash",  role: "Strength & Recovery", tone: "clay",     bio: "Old-school strength with new-school recovery protocols.", specialties: ["Strength", "Recovery", "Mobility"], initials: "AK", cert: "Strength · Recovery", ptEligible: true, avail: 0.65 },
  { id: "tarun",   name: "Tarun",   role: "Hyrox & Hypertrophy", tone: "clay",     bio: "Hybrid athlete programming — size, speed, stamina.", specialties: ["Hyrox Prep", "Hypertrophy", "Strength"], initials: "TR", cert: "Hyrox · Hypertrophy", ptEligible: true, avail: 0.45 },
  { id: "santo",   name: "Santo",   role: "Strength & Hypertrophy", tone: "espresso", bio: "Classical strength training with a bodybuilder's eye for detail.", specialties: ["Strength", "Hypertrophy", "Conditioning"], initials: "SA", cert: "Strength · Hypertrophy", ptEligible: true, avail: 0.5 },
  { id: "shahbaz", name: "Shahbaz", role: "Yoga & Breathwork", tone: "sage",       bio: "Traditional hatha and vinyasa. Breath-led practice for strength that lasts.", specialties: ["Yoga", "Breathwork", "Mobility"], initials: "SH", cert: "Yoga · Breathwork", ptEligible: false, avail: 0.55 },
];

const COACH_TONE_BG = {
  espresso: '#3E2C1C', walnut: '#5E4228', terra: '#B86B4B',
  sage: '#7B8B6F', sand: '#D9C3A3', clay: '#A8825A',
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

// ─── Primitives (local to this file to avoid name clashes) ────────────────
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

const OPill = ({ children, primary, full, small, ghost, style = {}, onClick, disabled }) => {
  const isDisabled = disabled;
  return (
    <button
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      style={{
        fontFamily: OT.fBody, fontSize: small ? 13 : 14, fontWeight: 600,
        padding: small ? '10px 18px' : '14px 28px',
        borderRadius: 999,
        border: ghost ? 'none' : (primary ? 'none' : `1px solid ${OT.hairlineStrong}`),
        background: primary ? (isDisabled ? '#d1c7bd' : OT.walnut) : (ghost ? 'transparent' : 'transparent'),
        color: primary ? (isDisabled ? '#9f9284' : OT.paper) : (isDisabled ? '#9f9284' : OT.walnut),
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        width: full ? '100%' : 'auto',
        boxShadow: primary && !isDisabled ? OT.sh2 : 'none',
        letterSpacing: 0.1, whiteSpace: 'nowrap',
        opacity: isDisabled ? 0.75 : 1,
        ...style,
      }}
    >{children}</button>
  );
};

const OChip = ({ children, selected, accent = OT.walnut, onClick, style = {} }) => (
  <button onClick={onClick} style={{
    fontFamily: OT.fBody, fontSize: 13, fontWeight: 600,
    padding: '9px 16px', borderRadius: 999,
    border: selected ? 'none' : `1px solid ${OT.hairlineStrong}`,
    background: selected ? accent : OT.sand100,
    color: selected ? OT.paper : OT.clay600,
    cursor: 'pointer', whiteSpace: 'nowrap',
    transition: 'all .12s', ...style,
  }}>{children}</button>
);

// M3S logo — uses site wordmark image so it matches index.html exactly
const M3SLogo = ({ size = 'md' }) => {
  const h = size === 'lg' ? 50 : 38;
  return (
    <a href="index.html" style={{ display: 'inline-flex', alignItems: 'center', lineHeight: 0, textDecoration: 'none' }} aria-label="My Third Space — home">
      <img
        src="assets/mts-logo.png"
        alt="My Third Space"
        style={{
          height: h, width: 'auto', objectFit: 'contain', display: 'block',
          filter: 'brightness(0) saturate(100%) invert(24%) sepia(17%) saturate(1487%) hue-rotate(344deg) brightness(97%) contrast(91%)',
        }}
      />
    </a>
  );
};

// Coach avatar (initials, tone-coloured)
const CoachAvatar = ({ coach, size = 56, ring = false }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%',
    background: COACH_TONE_BG[coach.tone] || OT.walnut,
    color: OT.paper, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: OT.fDisplay, fontStyle: 'italic',
    fontSize: size * 0.36, flexShrink: 0,
    boxShadow: ring ? `0 0 0 3px ${OT.paper}, 0 0 0 5px ${OT.ochre}` : OT.sh1,
  }}>{coach.initials}</div>
);

// Step header w/ progress dots
function StepHeader({ step, total = 7, title, subtitle, eyebrow }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {Array.from({ length: total }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 999,
            background: i < step ? OT.walnut : OT.sand200,
          }} />
        ))}
      </div>
      <OMono>Step {step} of {total} · {eyebrow}</OMono>
      <h1 style={{
        fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400,
        fontSize: 32, lineHeight: 1.05, color: OT.espresso900,
        margin: '10px 0 6px', letterSpacing: -0.5,
      }}>{title}</h1>
      {subtitle && <p style={{
        fontFamily: OT.fBody, fontSize: 14, lineHeight: 1.55,
        color: OT.clay600, margin: 0, maxWidth: 360,
      }}>{subtitle}</p>}
    </div>
  );
}

// Top bar with logo + close
function OnbTopBar({ rightLabel }) {
  const isClean = sessionStorage.getItem('m3s.onb_clean_session') === 'true';
  const toggleClean = () => {
    if (isClean) {
      sessionStorage.removeItem('m3s.onb_clean_session');
    } else {
      sessionStorage.setItem('m3s.onb_clean_session', 'true');
    }
    window.location.reload();
  };

  return (
    <div style={{
      padding: '14px 18px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', borderBottom: `1px solid ${OT.hairline}`,
      background: OT.sand50,
    }}>
      <M3SLogo />
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {rightLabel && <OMono size={9}>{rightLabel}</OMono>}
      </div>
    </div>
  );
}

// Footer CTA bar
function OnbFooter({ onBack, onNext, nextLabel = 'Continue →', skipLabel, secondary, disabled }) {
  return (
    <div style={{
      padding: '14px 16px 22px',
      borderTop: `1px solid ${OT.hairline}`, background: OT.sand50, flexShrink: 0,
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        {onBack && <OPill onClick={onBack} small>← Back</OPill>}
        <div style={{ flex: 1 }} />
        {secondary}
        <OPill primary disabled={disabled} onClick={onNext}>{nextLabel}</OPill>
      </div>
      {skipLabel && (
        <div onClick={disabled ? undefined : onNext} style={{
          textAlign: 'center', marginTop: 12,
          fontFamily: OT.fBody, fontSize: 12.5, color: disabled ? '#b8ae9c' : OT.clay600,
          textDecoration: 'underline', textUnderlineOffset: 3,
          textDecorationColor: OT.hairlineStrong, cursor: disabled ? 'not-allowed' : 'pointer',
        }}>{skipLabel}</div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SHARED — Time slot generation + journey state context
// ═══════════════════════════════════════════════════════════════════════════
function buildTimeSlots() {
  // 6:00 → 20:00 inclusive, every :00 and :30
  const slots = [];
  for (let h = 6; h <= 20; h++) {
    slots.push({ value: `${h}:00`, hh: h, mm: 0 });
    if (h < 20) slots.push({ value: `${h}:30`, hh: h, mm: 30 });
  }
  return slots;
}
const TIME_SLOTS = buildTimeSlots();

function fmtSlot(v) {
  const [h, m] = v.split(':').map(Number);
  const period = h < 12 ? 'AM' : 'PM';
  const hh = h === 0 ? 12 : (h > 12 ? h - 12 : h);
  return `${hh}:${m.toString().padStart(2, '0')} ${period}`;
}

// JourneyContext — shared between Step1 (journey + slots) and Step2 (coach match)
const JourneyContext = React.createContext(null);

function JourneyProvider({ children }) {
  const [journey, setJourney] = React.useState(() => {
    const isClean = sessionStorage.getItem('m3s.onb_clean_session') === 'true';

    const emptyValues = {
      name: '',
      age: '',
      gender: '',
      phone: '',
      photo: null,
      experience: '',
      goal: '',
      daysPerWeek: 3,
      notes: '',
      injuries: [],
      injuryNotes: '',
      slots: [],
      customSlots: [],
      coachId: null,
      running5k: '',
      running2k: '',
      runRating: 5,
      runFrequency: '',
      runInjuryFlag: false,
      runInjuryNotes: '',
      runGoals: '',
      runSubmitted: false,
      bcaUploaded: false,
      bcaFileName: '',
      bloodUploaded: false,
      bloodFileName: '',
      mskSignedOff: false,
      mskAnswers: {
        toeTouch: '',
        overheadReach: '',
        singleLegBalance: '',
        parallelSquat: '',
      },
    };

    if (isClean) {
      return emptyValues;
    }

    const defaults = {
      name: '',
      age: '',
      gender: '',
      phone: '',
      photo: null,
      experience: '',
      goal: '',
      daysPerWeek: null,
      notes: "",
      injuries: [],
      injuryNotes: '',
      slots: [],
      customSlots: [],
      coachId: null,
      running5k: '',
      running2k: '',
      runRating: 5,
      runFrequency: '',
      runInjuryFlag: false,
      runInjuryNotes: '',
      runGoals: '',
      runSubmitted: false,
      bcaUploaded: false,
      bcaFileName: '',
      bloodUploaded: false,
      bloodFileName: '',
      mskSignedOff: false,
      mskAnswers: {
        toeTouch: '',
        overheadReach: '',
        singleLegBalance: '',
        parallelSquat: '',
      },
    };

    try {
      const cachedUser = localStorage.getItem('m3s.user');
      if (cachedUser) {
        const parsedUser = JSON.parse(cachedUser);
        if (parsedUser && (parsedUser.name === 'Riya Sharma' || parsedUser.name === 'Karan S.' || parsedUser.phone === '98230 12345' || parsedUser.phone === '98222 33344')) {
          localStorage.removeItem('m3s.user');
        } else if (parsedUser && (parsedUser.name || parsedUser.phone)) {
          if (parsedUser.name) defaults.name = parsedUser.name;
          if (parsedUser.phone) defaults.phone = parsedUser.phone;
        }
      }
    } catch (e) {}

    try {
      const saved = localStorage.getItem('m3s.journey');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name === 'Riya Sharma' || parsed.name === 'Karan S.' || parsed.phone === '98230 12345' || parsed.phone === '98222 33344') {
          localStorage.removeItem('m3s.journey');
          return defaults;
        }
        return { ...defaults, ...parsed };
      }
    } catch {}
    return defaults;
  });

  const update = (patch) => setJourney(j => ({ ...j, ...patch }));

  const step1Errors = React.useMemo(() => {
    const errors = {};
    if (!journey.name || !journey.name.trim()) {
      errors.name = "Name is required.";
    }
    const ageVal = parseInt(journey.age, 10);
    if (!journey.age || isNaN(ageVal) || ageVal < 14 || ageVal > 99 || journey.age.includes('.') || journey.age.includes('e')) {
      errors.age = "Age must be between 14 and 99.";
    }
    const phoneClean = (journey.phone || '').replace(/\D/g, '');
    if (phoneClean.length < 10) {
      errors.phone = "Phone number must be at least 10 digits.";
    }
    return errors;
  }, [journey.name, journey.age, journey.phone]);

  const toggleSlot = (v) => setJourney(j => ({
    ...j, slots: j.slots.includes(v) ? j.slots.filter(s => s !== v) : [...j.slots, v]
  }));

  const toggleInjury = (tag) => setJourney(j => {
    if (tag === 'None') return { ...j, injuries: j.injuries.includes('None') ? [] : ['None'] };
    const without = j.injuries.filter(i => i !== 'None');
    return {
      ...j,
      injuries: without.includes(tag) ? without.filter(i => i !== tag) : [...without, tag],
    };
  });

  return (
    <JourneyContext.Provider value={{ journey, update, toggleSlot, toggleInjury, step1Errors }}>
      {children}
    </JourneyContext.Provider>
  );
}

const useJourney = () => {
  const ctx = React.useContext(JourneyContext);
  // graceful fallback when used outside provider (canvas previews)
  if (!ctx) {
    return {
      journey: {
        name: '', age: '', gender: '', phone: '', photo: null,
        experience: '', goal: '', daysPerWeek: null,
        notes: '',
        injuries: [], injuryNotes: '',
        slots: [], customSlots: [], coachId: null,
        running5k: '', running2k: '', runRating: 5, runFrequency: '', runInjuryFlag: false,
        runInjuryNotes: '', runGoals: '', runSubmitted: false,
      },
      update: () => {}, toggleSlot: () => {}, toggleInjury: () => {},
      step1Errors: {},
    };
  }
  return ctx;
};

// Time slot grid — used in step 1 mobile + desktop
function TimeSlotGrid({ compact = false }) {
  const { journey, toggleSlot, update } = useJourney();
  const [draft, setDraft] = React.useState('');
  const sel = new Set(journey.slots);
  // group: morning 6-11, midday 12-16, evening 17-20
  const groups = [
    { label: 'Morning · 6–11 AM',   filter: s => s.hh >= 6 && s.hh < 12 },
    { label: 'Afternoon · 12–4 PM', filter: s => s.hh >= 12 && s.hh < 17 },
    { label: 'Evening · 5–8 PM',    filter: s => s.hh >= 17 && s.hh <= 20 },
  ];
  const addCustom = () => {
    const v = draft.trim();
    if (!v) return;
    update({ customSlots: [...journey.customSlots, v] });
    setDraft('');
  };
  const removeCustom = (idx) => {
    update({ customSlots: journey.customSlots.filter((_, i) => i !== idx) });
  };
  const cellSize = compact ? { padding: '8px 10px', fontSize: 12 } : { padding: '10px 12px', fontSize: 13 };
  return (
    <div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: compact ? 12 : 14 }}>
        {groups.map(g => {
          const items = TIME_SLOTS.filter(g.filter);
          return (
            <div key={g.label}>
              <OMono size={9} style={{ marginBottom: 8 }}>{g.label}</OMono>
              <div style={{
                display: 'grid',
                gridTemplateColumns: compact ? 'repeat(4, 1fr)' : 'repeat(6, 1fr)',
                gap: 6,
              }}>
                {items.map(s => {
                  const active = sel.has(s.value);
                  return (
                    <button
                      key={s.value}
                      onClick={() => toggleSlot(s.value)}
                      style={{
                        ...cellSize,
                        fontFamily: OT.fBody, fontWeight: 600,
                        borderRadius: 8,
                        border: active ? 'none' : `1px solid ${OT.hairlineStrong}`,
                        background: active ? OT.walnut : OT.paper,
                        color: active ? OT.paper : OT.clay600,
                        cursor: 'pointer', textAlign: 'center',
                        transition: 'all .12s',
                      }}
                    >
                      {fmtSlot(s.value)}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom slot input */}
      <div style={{ marginTop: compact ? 14 : 16 }}>
        <OMono size={9} style={{ marginBottom: 8 }}>Add a custom slot</OMono>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
            placeholder="e.g. 5:45 AM weekdays only"
            style={{ ...inputStyle, flex: 1 }}
          />
          <OPill small onClick={addCustom}>+ Add</OPill>
        </div>
        {journey.customSlots.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {journey.customSlots.map((c, i) => (
              <span key={i} style={{
                fontFamily: OT.fBody, fontSize: 12, fontWeight: 600,
                padding: '6px 10px 6px 12px', borderRadius: 999,
                background: OT.sand200, color: OT.espresso900,
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}>
                {c}
                <button onClick={() => removeCustom(i)} style={{
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  color: OT.clay600, fontSize: 14, lineHeight: 1, padding: 0,
                }}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Selection summary */}
      <div style={{
        marginTop: 14, padding: '10px 14px', borderRadius: 10,
        background: OT.sand100, border: `1px solid ${OT.hairline}`,
        fontFamily: OT.fBody, fontSize: 12.5, color: OT.espresso800, lineHeight: 1.5,
      }}>
        {journey.slots.length === 0 && journey.customSlots.length === 0 ? (
          <>Pick one or more times that work for you. Multi-select is fine — your coach will train you in any of these slots.</>
        ) : (
          <>
            <strong style={{ color: OT.walnut }}>{journey.slots.length + journey.customSlots.length} slot{(journey.slots.length + journey.customSlots.length) !== 1 ? 's' : ''}</strong>{' '}
            selected · we'll match a coach who's free in these windows.
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 1 — Your journey + preferred time slots
// ═══════════════════════════════════════════════════════════════════════════

const EXISTING_MEMBERS = [
  { id: "riya", name: "Riya Sharma", age: "32", gender: "Female", phone: "98230 12345", email: "riya@gmail.com", coachId: "lee", goal: "Muscle Gain", experience: "6–24 months", daysPerWeek: 4, injuries: ["Shoulder"], running5k: "28:40", running2k: "10:15", runRating: 6, runFrequency: "3x / week" },
  { id: "karan", name: "Karan S.", age: "34", gender: "Male", phone: "98222 33344", email: "karan@gmail.com", coachId: "rahul", goal: "Hyrox Preparation", experience: "5+ years", daysPerWeek: 5, injuries: ["Knee"], running5k: "21:30", running2k: "7:45", runRating: 9, runFrequency: "4x / week" },
  { id: "vikram", name: "Vikram R.", age: "31", gender: "Male", phone: "98111 22233", email: "vikram@gmail.com", coachId: "deb", goal: "Baseline Recovery", experience: "Under 6 months", daysPerWeek: 2, injuries: ["Lower Back"], running5k: "35:45", running2k: "14:10", runRating: 3, runFrequency: "Never" },
  { id: "meera", name: "Meera P.", age: "29", gender: "Female", phone: "99123 45678", email: "meera@gmail.com", coachId: "lee", goal: "Conditioning & Fat Loss", experience: "1–2 years", daysPerWeek: 3, injuries: [], running5k: "31:10", running2k: "12:20", runRating: 4, runFrequency: "2x / week" }
];

// Basic info: name, age, gender, phone, photo
function BasicInfoBlock() {
  const { journey, update, step1Errors } = useJourney();
  const fileRef = React.useRef(null);
  const initials = (journey.name || 'U').split(/\s+/).map(s => s[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() || 'U';

  const [selectedId, setSelectedId] = React.useState('');
  const [searchPhone, setSearchPhone] = React.useState('');
  const [linkSuccess, setLinkSuccess] = React.useState(journey.existingClientId ? true : false);

  const handlePhoto = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => update({ photo: ev.target.result });
    reader.readAsDataURL(f);
  };

  const handleLinkAccount = () => {
    const target = EXISTING_MEMBERS.find(m => m.id === selectedId || m.phone.replace(/\s+/g, '') === searchPhone.replace(/\s+/g, ''));
    if (!target) return;

    update({
      name: target.name,
      age: target.age,
      gender: target.gender,
      phone: target.phone,
      experience: target.experience,
      goal: target.goal,
      daysPerWeek: target.daysPerWeek,
      injuries: target.injuries,
      running5k: target.running5k,
      running2k: target.running2k,
      runRating: target.runRating,
      runFrequency: target.runFrequency,
      coachId: target.coachId,
      existingClientId: target.id,
      userType: 'existing',
      bcaUploaded: true,
      bloodUploaded: true,
      mskSignedOff: true
    });
    setLinkSuccess(true);
  };

  const handleResetLink = () => {
    update({
      name: '',
      age: '',
      gender: 'Female',
      phone: '',
      existingClientId: null,
      userType: 'new',
      bcaUploaded: false,
      bloodUploaded: false,
      mskSignedOff: false
    });
    setSelectedId('');
    setSearchPhone('');
    setLinkSuccess(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Journey Type Switcher */}
      <div style={{
        display: 'flex', background: OT.sand100, padding: 4, borderRadius: 12,
        border: `1px solid ${OT.hairline}`
      }}>
        <button 
          type="button"
          onClick={() => { if (journey.userType === 'existing') handleResetLink(); }}
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 9, border: 'none',
            background: (journey.userType !== 'existing') ? OT.paper : 'transparent',
            color: (journey.userType !== 'existing') ? OT.walnut : OT.clay600,
            fontFamily: OT.fBody, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: (journey.userType !== 'existing') ? '0 2px 6px rgba(62,44,28,0.06)' : 'none'
          }}
        >
          🌱 New Client Onboarding
        </button>
        <button 
          type="button"
          onClick={() => update({ userType: 'existing' })}
          style={{
            flex: 1, padding: '8px 12px', borderRadius: 9, border: 'none',
            background: (journey.userType === 'existing') ? OT.paper : 'transparent',
            color: (journey.userType === 'existing') ? OT.walnut : OT.clay600,
            fontFamily: OT.fBody, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: (journey.userType === 'existing') ? '0 2px 6px rgba(62,44,28,0.06)' : 'none'
          }}
        >
          🔒 Existing Member Login
        </button>
      </div>

      <div style={{
        padding: 18, borderRadius: 14,
        background: OT.paper, border: `1px solid ${OT.hairline}`,
      }}>
        {journey.userType === 'existing' ? (
          <div>
            <OEyebrow dot={OT.sage}>Link Existing Member Account</OEyebrow>
            
            {linkSuccess ? (
              <div style={{ marginTop: 14 }}>
                <div style={{
                  padding: '12px 14px', background: 'rgba(123, 139, 111, 0.08)',
                  border: `1px solid ${OT.sage}`, borderRadius: 10,
                  fontFamily: OT.fBody, fontSize: 13, color: OT.sage, lineHeight: 1.5
                }}>
                  <strong>✓ Link Successful!</strong> Linked to <strong>{journey.name}</strong> ({journey.phone}). 
                  We've successfully imported your historical logs, DEXA reports, training slots, and coach comments.
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={handleResetLink}
                    style={{
                      background: 'none', border: 'none', color: OT.terra,
                      fontFamily: OT.fMono, fontSize: 10, cursor: 'pointer'
                    }}
                  >
                    RESET & UNLINK ACCOUNT
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <OMono style={{ marginBottom: 6 }}>Select your profile:</OMono>
                  <select 
                    value={selectedId} 
                    onChange={e => {
                      setSelectedId(e.target.value);
                      setSearchPhone('');
                    }}
                    style={{ ...inputStyle, appearance: 'none', backgroundImage: `linear-gradient(45deg, transparent 50%, ${OT.clay500} 50%), linear-gradient(135deg, ${OT.clay500} 50%, transparent 50%)`, backgroundPosition: 'calc(100% - 16px) 50%, calc(100% - 11px) 50%', backgroundSize: '5px 5px, 5px 5px', backgroundRepeat: 'no-repeat', paddingRight: 28 }}
                  >
                    <option value="">-- Choose Profile --</option>
                    {EXISTING_MEMBERS.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>
                    ))}
                  </select>
                </div>

                <div style={{ textAlign: 'center', fontFamily: OT.fMono, fontSize: 10, color: OT.clay500 }}>
                  — OR SEARCH BY PHONE —
                </div>

                <div>
                  <OMono style={{ marginBottom: 6 }}>Enter phone number:</OMono>
                  <input
                    type="text"
                    placeholder="e.g. 98222 33344"
                    value={searchPhone}
                    onChange={e => {
                      setSearchPhone(e.target.value);
                      setSelectedId('');
                    }}
                    style={inputStyle}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleLinkAccount}
                  disabled={!selectedId && !searchPhone}
                  style={{
                    padding: '10px 16px', background: OT.walnut, color: OT.paper,
                    borderRadius: 999, border: 'none', fontFamily: OT.fMono, fontSize: 11,
                    fontWeight: 'bold', cursor: (selectedId || searchPhone) ? 'pointer' : 'not-allowed',
                    opacity: (selectedId || searchPhone) ? 1 : 0.5, marginTop: 6
                  }}
                >
                  ✓ LINK & IMPORT MY DATA
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <OEyebrow dot={OT.walnut}>About you</OEyebrow>
            <div style={{ marginTop: 12, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {/* photo */}
              <div style={{ flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => fileRef.current && fileRef.current.click()}
                  style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: journey.photo ? `url(${journey.photo}) center/cover` : OT.linen,
                    border: `1px dashed ${OT.hairlineStrong}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 20,
                    color: OT.walnut, cursor: 'pointer', position: 'relative', padding: 0,
                  }}
                  aria-label="Upload photo"
                >
                  {!journey.photo && initials}
                </button>
                <div style={{
                  fontFamily: OT.fMono, fontSize: 9, color: OT.clay500,
                  textAlign: 'center', marginTop: 6, letterSpacing: 1, textTransform: 'uppercase',
                }}>{journey.photo ? 'Change' : 'Add photo'}</div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
              </div>

              {/* fields */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
                <div>
                  <OMono style={{ marginBottom: 6 }}>Name</OMono>
                  <input value={journey.name} onChange={(e) => update({ name: e.target.value })} style={{ ...inputStyle, border: step1Errors?.name ? `1px solid ${OT.terra}` : `1px solid ${OT.hairlineStrong}` }} />
                  {step1Errors?.name && <div style={{ color: OT.terra, fontSize: 12, marginTop: 4, fontFamily: OT.fBody }}>{step1Errors.name}</div>}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <OMono style={{ marginBottom: 6 }}>Age</OMono>
                    <input type="text" value={journey.age} onChange={(e) => update({ age: e.target.value })} style={{ ...inputStyle, border: step1Errors?.age ? `1px solid ${OT.terra}` : `1px solid ${OT.hairlineStrong}` }} />
                    {step1Errors?.age && <div style={{ color: OT.terra, fontSize: 11, marginTop: 4, fontFamily: OT.fBody }}>{step1Errors.age}</div>}
                  </div>
                  <div style={{ flex: 1.4 }}>
                    <OMono style={{ marginBottom: 6 }}>Gender</OMono>
                    <select value={journey.gender} onChange={(e) => update({ gender: e.target.value })} style={{ ...inputStyle, appearance: 'none', backgroundImage: `linear-gradient(45deg, transparent 50%, ${OT.clay500} 50%), linear-gradient(135deg, ${OT.clay500} 50%, transparent 50%)`, backgroundPosition: 'calc(100% - 16px) 50%, calc(100% - 11px) 50%', backgroundSize: '5px 5px, 5px 5px', backgroundRepeat: 'no-repeat', paddingRight: 28 }}>
                      <option>Female</option>
                      <option>Male</option>
                      <option>Non-binary</option>
                      <option>Prefer not to say</option>
                    </select>
                  </div>
                </div>
                <div>
                  <OMono style={{ marginBottom: 6 }}>Phone</OMono>
                  <input value={journey.phone} onChange={(e) => update({ phone: e.target.value })} style={{ ...inputStyle, border: step1Errors?.phone ? `1px solid ${OT.terra}` : `1px solid ${OT.hairlineStrong}` }} />
                  {step1Errors?.phone && <div style={{ color: OT.terra, fontSize: 12, marginTop: 4, fontFamily: OT.fBody }}>{step1Errors.phone}</div>}
                  <div style={{ marginTop: 6, fontSize: 11, color: "var(--clay-600)", fontFamily: "var(--f-body)" }}>
                    * Please use your WhatsApp number for easier communication.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Step1Journey() {
  const { journey, update, toggleInjury } = useJourney();
  return (
    <div className="frame-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 24px' }}>
      <StepHeader step={1} eyebrow="Your journey" title="Tell us about your journey." subtitle="So your coach can build a plan that meets you where you are — and at the times you can actually train." />

      <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <BasicInfoBlock />

        <div>
          <OMono style={{ marginBottom: 10 }}>How long have you been training?</OMono>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['< 6 months', '6–24 months', '2–5 years', '5+ years'].map(d => (
              <OChip key={d} selected={journey.experience === d} onClick={() => update({ experience: d })}>{d}</OChip>
            ))}
          </div>
        </div>

        <div>
          <OMono style={{ marginBottom: 10 }}>Primary goal</OMono>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Fat Loss', 'Muscle Gain', 'Hyrox / Performance', 'Injury Rehab', 'General Fitness'].map(g => (
              <OChip key={g} selected={journey.goal === g} onClick={() => update({ goal: g })}>{g}</OChip>
            ))}
          </div>
        </div>

        <div>
          <OMono style={{ marginBottom: 10 }}>Training days per week</OMono>
          <div style={{
            display: 'inline-flex', alignItems: 'center',
            background: OT.paper, border: `1px solid ${OT.hairlineStrong}`,
            borderRadius: 10, overflow: 'hidden',
          }}>
            <button onClick={() => update({ daysPerWeek: Math.max(1, journey.daysPerWeek - 1) })} style={stepperBtn}>−</button>
            <div style={{ width: 56, textAlign: 'center', fontFamily: OT.fDisplay, fontSize: 24, color: OT.walnut }}>{journey.daysPerWeek}</div>
            <button onClick={() => update({ daysPerWeek: Math.min(7, journey.daysPerWeek + 1) })} style={stepperBtn}>+</button>
          </div>
        </div>

        <div>
          <OMono style={{ marginBottom: 10 }}>Tell us more about your goal (optional)</OMono>
          <textarea
            value={journey.notes}
            onChange={(e) => update({ notes: e.target.value })}
            rows={3}
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
          />
        </div>

        <div>
          <OMono style={{ marginBottom: 10 }}>Injuries or limitations</OMono>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 10 }}>
            {['Lower back', 'Knee', 'Shoulder', 'Hip', 'Wrist', 'None'].map((tag) => {
              const sel = journey.injuries.includes(tag);
              return (
                <button key={tag} onClick={() => toggleInjury(tag)} style={{
                  fontFamily: OT.fBody, fontSize: 12, fontWeight: 600,
                  padding: '6px 12px', borderRadius: 999,
                  border: `1px solid ${sel ? OT.walnut : OT.hairlineStrong}`,
                  background: sel ? OT.walnut : 'transparent',
                  color: sel ? OT.paper : OT.clay600, cursor: 'pointer',
                }}>{sel ? tag + ' ×' : '+ ' + tag}</button>
              );
            })}
          </div>
          <textarea
            value={journey.injuryNotes}
            onChange={(e) => update({ injuryNotes: e.target.value })}
            rows={2}
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
          />
        </div>

        {/* PREFERRED TIME SLOTS — multi-select */}
        <div style={{
          marginTop: 4, padding: 16, borderRadius: 16,
          background: '#FFF8EE', border: `1px solid ${OT.hairline}`, boxShadow: OT.sh1,
        }}>
          <OEyebrow dot={OT.ochre}>Preferred time slots</OEyebrow>
          <h3 style={{
            fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400,
            fontSize: 22, color: OT.espresso900, margin: '8px 0 4px', letterSpacing: -0.3,
          }}>When can you train?</h3>
          <p style={{
            fontFamily: OT.fBody, fontSize: 13, color: OT.clay600,
            margin: '0 0 14px', lineHeight: 1.5,
          }}>Select <strong style={{ color: OT.walnut }}>one or more</strong> windows that work for you. We'll match a coach available in your slots.</p>
          <TimeSlotGrid compact />
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: OT.paper, border: `1px solid ${OT.hairlineStrong}`,
  borderRadius: 10, padding: '12px 14px',
  fontFamily: OT.fBody, fontSize: 14, color: OT.ink, outline: 'none',
};

// ═══════════════════════════════════════════════════════════════════════════
// STEP 2 — Coach recommendation (matched on goal + slots + availability)
// ═══════════════════════════════════════════════════════════════════════════

// Goal-specialty map drives the recommendation engine
const GOAL_SPECIALTIES = {
  'Muscle Gain':         ['Hypertrophy', 'Strength'],
  'Fat Loss':            ['Conditioning', 'Hyrox Prep', 'Strength'],
  'Hyrox / Performance': ['Hyrox Prep', 'Conditioning', 'Strength'],
  'Injury Rehab':        ['Recovery', 'Mobility', 'Pilates'],
  'General Fitness':     ['Strength', 'Conditioning', 'Mobility'],
};

// Mock per-coach availability across our slot grid.
// Each coach's available slots — derived from coach.id (deterministic).
function coachSlotsAvailable(coach) {
  // hash-ish: pick slots based on coach.id length/charcodes so it's stable.
  const seed = coach.id.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
  return TIME_SLOTS.filter((_, i) => ((i * 7 + seed) % 10) < (coach.avail * 10 + 1)).map(s => s.value);
}

function rankCoaches(journey) {
  const wanted = GOAL_SPECIALTIES[journey.goal] || [];
  const userSlots = new Set(journey.slots);
  const userSlotsCount = userSlots.size;
  return COACHES
    .filter(c => c.ptEligible)
    .map(c => {
      const slots = coachSlotsAvailable(c);
      const overlap = slots.filter(s => userSlots.has(s));
      
      // 30% Specialisation Match
      const specMatch = c.specialties.filter(s => wanted.includes(s)).length;
      const specLimit = wanted.length || 1;
      const specMatchRatio = Math.min(1.0, specMatch / specLimit);
      const specScore = specMatchRatio * 30;

      // 70% Availability Match
      // Comprises specific slot overlap (weighted at 70% of the availability component)
      // and the coach's overall availability capacity (weighted at 30% of the availability component)
      const slotOverlapRatio = userSlotsCount > 0 ? overlap.length / userSlotsCount : 1.0;
      const overallAvail = c.avail;
      const availabilityRatio = (slotOverlapRatio * 0.70) + (overallAvail * 0.30);
      const availabilityScore = availabilityRatio * 70;

      // Complete rounded Match Score out of 100
      const score = Math.round(availabilityScore + specScore);

      return { coach: c, slots, overlap, specMatch, score };
    })
    .sort((a, b) => b.score - a.score);
}

function CoachCard({ row, picked, onPick, compact = false }) {
  const { coach, overlap, slots, specMatch } = row;
  const userPicked = picked === coach.id;
  const noOverlap = overlap.length === 0;
  return (
    <div onClick={() => onPick(coach.id)} style={{
      background: userPicked ? '#FFF8EE' : OT.paper,
      border: userPicked ? `2px solid ${OT.ochre}` : `1px solid ${OT.hairline}`,
      borderRadius: 14, padding: compact ? 12 : 14,
      cursor: 'pointer', transition: 'all .12s',
      boxShadow: userPicked ? OT.sh2 : 'none',
      position: 'relative',
    }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <CoachAvatar coach={coach} size={compact ? 40 : 48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontFamily: OT.fBody, fontWeight: 600, fontSize: compact ? 14 : 15, color: OT.espresso900 }}>{coach.name}</div>
            {userPicked && <span style={{
              fontFamily: OT.fMono, fontSize: 8.5, letterSpacing: 1.2,
              color: OT.ochre, padding: '2px 6px',
              background: 'rgba(201,154,63,0.15)', borderRadius: 4, textTransform: 'uppercase',
            }}>Selected</span>}
          </div>
          <div style={{ fontFamily: OT.fBody, fontSize: 12.5, color: OT.clay600, marginTop: 2 }}>{coach.role}</div>
        </div>
        <div style={{
          width: 22, height: 22, borderRadius: '50%',
          background: userPicked ? OT.ochre : 'transparent',
          border: userPicked ? 'none' : `1.5px solid ${OT.hairlineStrong}`,
          color: OT.paper, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, flexShrink: 0,
        }}>{userPicked ? '✓' : ''}</div>
      </div>

      <div style={{
        marginTop: 10, display: 'flex', gap: 14, flexWrap: 'wrap',
        fontFamily: OT.fMono, fontSize: 9.5, letterSpacing: 1,
        color: noOverlap ? OT.bad : OT.clay600, textTransform: 'uppercase',
      }}>
        <span><strong style={{ color: noOverlap ? OT.bad : OT.walnut }}>{overlap.length}</strong> of your slots</span>
        <span>·  {specMatch} goal match</span>
        <span>·  {Math.round(coach.avail * 100)}% avail</span>
      </div>

      {overlap.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
          {overlap.slice(0, compact ? 4 : 6).map(s => (
            <span key={s} style={{
              fontFamily: OT.fBody, fontSize: 11, fontWeight: 600,
              padding: '3px 8px', borderRadius: 999,
              background: 'rgba(94,138,94,0.14)', color: OT.ok,
            }}>{fmtSlot(s)}</span>
          ))}
          {overlap.length > (compact ? 4 : 6) && (
            <span style={{ fontFamily: OT.fMono, fontSize: 9.5, color: OT.clay600, padding: '4px 6px' }}>
              +{overlap.length - (compact ? 4 : 6)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function Step2Coach() {
  const { journey, update } = useJourney();
  const ranked = React.useMemo(() => rankCoaches(journey), [journey.goal, journey.slots.join(',')]);
  const [showAll, setShowAll] = React.useState(false);

  // Auto-pick top coach if none chosen yet
  React.useEffect(() => {
    if (!journey.coachId && ranked.length > 0) {
      update({ coachId: ranked[0].coach.id });
    }
  }, [ranked.length]);

  const top = ranked[0];
  const noneAvailable = top && top.overlap.length === 0;
  const alternates = ranked.filter(r => r.overlap.length > 0).slice(0, 4);

  return (
    <div className="frame-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 24px' }}>
      <StepHeader step={2} eyebrow="Coach match" title="Meet your coach." subtitle={`Based on your goal (${journey.goal}), the ${journey.slots.length + journey.customSlots.length} time slots you picked, and live coach availability.`} />

      {/* RECOMMENDED COACH (or apology if no overlap) */}
      {!noneAvailable && top && (
        <div style={{
          marginTop: 22, background: '#FFF8EE',
          border: `1px solid ${OT.hairline}`, borderRadius: 16, padding: 18,
          boxShadow: OT.sh1, position: 'relative', overflow: 'hidden',
        }}>
          <OEyebrow dot={OT.ochre}>Recommended coach</OEyebrow>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 14 }}>
            <CoachAvatar coach={top.coach} size={64} ring />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: OT.fDisplay, fontStyle: 'italic',
                fontSize: 26, color: OT.espresso900, lineHeight: 1.1,
              }}>{top.coach.name}</div>
              <div style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.clay600, marginTop: 2 }}>
                {top.coach.role}
              </div>
            </div>
          </div>
          <p style={{
            fontFamily: OT.fBody, fontSize: 13.5, color: OT.espresso800,
            margin: '14px 0 0', lineHeight: 1.55,
          }}>
            <strong style={{ color: OT.walnut }}>Why {top.coach.name}:</strong> Specialises in {top.coach.specialties.slice(0, 2).join(' & ').toLowerCase()}.
            {' '}Free in <strong style={{ color: OT.ok }}>{top.overlap.length} of your {journey.slots.length} slots</strong>
            {' '}({Math.round(top.coach.avail * 100)}% overall availability).
          </p>

          {/* Overlapping slots */}
          {top.overlap.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <OMono size={9} style={{ marginBottom: 8 }}>Free in your slots</OMono>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {top.overlap.map(s => (
                  <span key={s} style={{
                    fontFamily: OT.fBody, fontSize: 12, fontWeight: 600,
                    padding: '5px 11px', borderRadius: 999,
                    background: 'rgba(94,138,94,0.14)', color: OT.ok,
                  }}>{fmtSlot(s)}</span>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <OPill small primary onClick={() => update({ coachId: top.coach.id })}>
              {journey.coachId === top.coach.id ? '✓ Selected' : 'Pick ' + top.coach.name}
            </OPill>
            <OPill small ghost onClick={() => setShowAll(s => !s)} style={{ color: OT.clay600 }}>
              {showAll ? 'Hide options' : 'Change coach'}
            </OPill>
          </div>
        </div>
      )}

      {/* APOLOGY + alternates */}
      {noneAvailable && (
        <div style={{
          marginTop: 22, background: 'rgba(176,70,58,0.06)',
          border: `1px solid rgba(176,70,58,0.25)`, borderRadius: 16, padding: 18,
        }}>
          <OEyebrow dot={OT.bad} color={OT.bad}>No exact match</OEyebrow>
          <h3 style={{
            fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400,
            fontSize: 22, color: OT.espresso900, margin: '8px 0 6px', letterSpacing: -0.3,
          }}>We're sorry — none of our PT coaches are free in your selected slots right now.</h3>
          <p style={{ fontFamily: OT.fBody, fontSize: 13.5, color: OT.espresso800, margin: 0, lineHeight: 1.55 }}>
            Here are coaches with the closest availability to what you picked. You can also <button
              onClick={() => window.location.hash = 'step=1'}
              style={{ background: 'transparent', border: 'none', color: OT.walnut, fontFamily: OT.fBody, fontSize: 13.5, padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
            >adjust your time slots</button>.
          </p>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {alternates.length > 0 ? alternates.map(r => (
              <CoachCard key={r.coach.id} row={r} picked={journey.coachId} onPick={(id) => update({ coachId: id })} compact />
            )) : (
              <div style={{
                padding: 14, background: OT.sand100, borderRadius: 10,
                fontFamily: OT.fBody, fontSize: 13, color: OT.espresso800,
              }}>No alternates either — please adjust your slots.</div>
            )}
          </div>
        </div>
      )}

      {/* OTHER COACHES — change coach picker */}
      {(showAll || noneAvailable) && !noneAvailable && (
        <div style={{ marginTop: 22 }}>
          <OEyebrow>Other coaches</OEyebrow>
          <p style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.clay600, margin: '8px 0 14px', lineHeight: 1.5 }}>
            Tap any to switch. We'll re-check availability against your slots.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ranked.slice(1).map(r => (
              <CoachCard key={r.coach.id} row={r} picked={journey.coachId} onPick={(id) => update({ coachId: id })} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const stepperBtn = {
  width: 44, height: 44, border: 'none', background: 'transparent',
  color: OT.walnut, fontSize: 18, cursor: 'pointer',
};

// Coach selection modal — used in step 2
function CoachPickerModal({ onClose }) {
  const ptCoaches = COACHES.filter(c => c.ptEligible);
  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(36,24,16,0.55)',
      display: 'flex', alignItems: 'flex-end', zIndex: 50,
    }}>
      <div style={{
        background: OT.sand50, width: '100%',
        borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: '16px 16px 22px', maxHeight: '80%', display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <OMono>Change coach</OMono>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', color: OT.clay600,
            fontSize: 18, cursor: 'pointer',
          }}>×</button>
        </div>
        <div className="frame-scroll" style={{ overflowY: 'auto', flex: 1 }}>
          {ptCoaches.map((c, i) => (
            <div key={c.id} style={{
              display: 'flex', gap: 12, alignItems: 'center', padding: '12px 4px',
              borderTop: i === 0 ? 'none' : `1px solid ${OT.hairline}`,
            }}>
              <CoachAvatar coach={c} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: OT.fBody, fontWeight: 600, fontSize: 14, color: OT.espresso900 }}>
                  {c.name} {c.id === 'lee' && <span style={{
                    fontFamily: OT.fMono, fontSize: 9, letterSpacing: 1.2,
                    color: OT.ochre, marginLeft: 6, padding: '2px 6px',
                    background: 'rgba(201,154,63,0.12)', borderRadius: 4, textTransform: 'uppercase',
                  }}>Match</span>}
                </div>
                <div style={{ fontFamily: OT.fBody, fontSize: 12, color: OT.clay600 }}>{c.role}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <OMono size={9}>{Math.round(c.avail * 100)}% avail</OMono>
              </div>
              <OPill small style={{ marginLeft: 8 }}>View</OPill>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 3 — Body Composition
// ═══════════════════════════════════════════════════════════════════════════
function Step3BodyComp() {
  const { journey, update } = useJourney();
  const isUploaded = !!journey.bcaUploaded;
  const fileName = journey.bcaFileName || 'InBody_April.pdf';

  const insights = [
    { label: 'Body fat',     value: isUploaded ? '24.8%' : '−−.−%', range: isUploaded ? 'Slightly high (target 22%)' : 'Awaiting status · target 22%', accent: isUploaded ? OT.warn : OT.clay600 },
    { label: 'Muscle mass',  value: isUploaded ? '49.2 kg' : '−−.− kg', range: isUploaded ? 'On track for height' : 'Awaiting data',       accent: isUploaded ? OT.ok : OT.clay600 },
    { label: 'Visceral fat', value: isUploaded ? '8' : '−',     range: isUploaded ? 'Healthy (1–12 range)' : 'Awaiting data',        accent: isUploaded ? OT.ok : OT.clay600 },
    { label: 'Metabolic age', value: isUploaded ? '34' : '−−',   range: isUploaded ? '2 yrs above chronological' : 'Awaiting data',   accent: isUploaded ? OT.warn : OT.clay600 },
  ];

  const triggerUpload = () => {
    document.getElementById('bca-file-input-mob')?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      update({
        bcaUploaded: true,
        bcaFileName: file.name,
      });
    }
  };

  return (
    <div className="frame-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 24px' }}>
      <StepHeader step={3} eyebrow="Body composition" title="Body composition scan." subtitle="Upload a recent InBody, DEXA, or Tanita report — we'll extract the metrics that matter." />

      <input
        type="file"
        id="bca-file-input-mob"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*,application/pdf"
      />

      {/* Upload card */}
      <div style={{
        marginTop: 22, padding: 20, borderRadius: 16,
        border: `1.5px dashed ${OT.hairlineStrong}`, background: OT.paper,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
        position: 'relative',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, background: OT.sand100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: OT.walnut,
        }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 19h14"/>
          </svg>
        </div>
        <div style={{ fontFamily: OT.fBody, fontWeight: 600, fontSize: 14, color: OT.espresso900 }}>
          {isUploaded ? 'Replace BCA report' : 'Upload BCA report'}
        </div>
        <div style={{ fontFamily: OT.fBody, fontSize: 12, color: OT.clay600, textAlign: 'center', maxWidth: 240, lineHeight: 1.4 }}>
          {isUploaded ? `Uploaded: ${fileName}` : 'PDF or photo · InBody · DEXA · Tanita'}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <OPill small primary onClick={triggerUpload}>Choose file</OPill>
          <OPill small onClick={triggerUpload}>Take photo</OPill>
        </div>
      </div>

      {/* Info copy on empty state */}
      {!isUploaded && (
        <div style={{
          marginTop: 14, padding: '14px 16px', background: 'rgba(201,154,63,0.06)',
          border: `1px solid rgba(201,154,63,0.22)`, borderRadius: 14,
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 16, marginTop: -1 }}>📊</span>
          <div style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.espresso800, lineHeight: 1.5 }}>
            <strong style={{ color: OT.ochre, fontWeight: 'bold' }}>Important:</strong> Once you upload your scan, InBody metrics automatically populate here. If you do not have a report, you can complete your scan for free at the <strong>M3S office in-person</strong> anytime before or after your first training session!
          </div>
        </div>
      )}

      {/* Insights — uploaded state preview */}
      <div style={{ marginTop: 22, opacity: isUploaded ? 1 : 0.65 }}>
        <OEyebrow dot={isUploaded ? OT.ochre : OT.clay600}>
          {isUploaded ? `AI insights · ${fileName}` : 'AI insights (Preview once uploaded)'}
        </OEyebrow>
        <div style={{
          marginTop: 12, background: OT.paper, border: `1px solid ${OT.hairline}`,
          borderRadius: 16, padding: 16, boxShadow: OT.sh1,
        }}>
          {insights.map((it, i) => (
            <div key={it.label} style={{
              display: 'grid', gridTemplateColumns: '1fr auto', gap: 8,
              alignItems: 'baseline', padding: '12px 0',
              borderTop: i === 0 ? 'none' : `1px solid ${OT.hairline}`,
            }}>
              <div>
                <OMono size={9}>{it.label}</OMono>
                <div style={{ fontFamily: OT.fBody, fontSize: 12, color: it.accent, marginTop: 4, fontWeight: 500 }}>
                  {it.range}
                </div>
              </div>
              <div style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 22, color: isUploaded ? OT.espresso900 : OT.clay600 }}>
                {it.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        marginTop: 18, padding: '14px 16px', background: OT.sand100,
        borderRadius: 12, border: `1px solid ${OT.hairline}`,
        opacity: isUploaded ? 1 : 0.6,
      }}>
        <OMono size={9} style={{ marginBottom: 6 }}>Coach note</OMono>
        <div style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.espresso800, lineHeight: 1.5 }}>
          {isUploaded 
            ? 'Numbers look good for your starting point. We\'ll re-test in 8 weeks.'
            : 'Pending your scan upload or in-person evaluation, our coach will add custom notes here.'}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 4 — Blood report
// ═══════════════════════════════════════════════════════════════════════════
const BLOOD_PARAMS = [
  { name: 'Vitamin D',     value: 18,    unit: 'ng/mL', low: 30,  high: 100, ideal: [30, 100],  status: 'low' },
  { name: 'Vitamin B12',   value: 312,   unit: 'pg/mL', low: 200, high: 900, ideal: [400, 900], status: 'low-ok' },
  { name: 'HbA1c',         value: 5.6,   unit: '%',     low: 4,   high: 6.4, ideal: [4, 5.6],   status: 'ok' },
  { name: 'Fasting Sugar', value: 96,    unit: 'mg/dL', low: 70,  high: 110, ideal: [70, 99],   status: 'ok' },
  { name: 'Total Chol.',   value: 218,   unit: 'mg/dL', low: 120, high: 240, ideal: [120, 200], status: 'high' },
  { name: 'HDL',           value: 42,    unit: 'mg/dL', low: 30,  high: 80,  ideal: [50, 80],   status: 'low' },
  { name: 'LDL',           value: 148,   unit: 'mg/dL', low: 50,  high: 200, ideal: [50, 100],  status: 'high' },
  { name: 'ALT (Liver)',   value: 28,    unit: 'U/L',   low: 0,   high: 56,  ideal: [7, 35],    status: 'ok' },
];

function StatusDot({ status }) {
  const map = {
    ok: { c: OT.ok,   t: 'Healthy' },
    'low-ok': { c: OT.warn, t: 'Low-normal' },
    low: { c: OT.bad, t: 'Low' },
    high: { c: OT.bad, t: 'High' },
  };
  const s = map[status] || map.ok;
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 8, height: 8, borderRadius: 999, background: s.c }} />
      <OMono size={9} color={s.c}>{s.t}</OMono>
    </div>
  );
}

function RangeBar({ p }) {
  const min = p.low;
  const max = p.high;
  const span = max - min;
  const idealStart = ((p.ideal[0] - min) / span) * 100;
  const idealEnd   = ((p.ideal[1] - min) / span) * 100;
  const valuePos = Math.max(0, Math.min(100, ((p.value - min) / span) * 100));
  const inIdeal = p.value >= p.ideal[0] && p.value <= p.ideal[1];
  return (
    <div style={{ position: 'relative', height: 22, marginTop: 6 }}>
      {/* full range track */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 8, height: 6,
        borderRadius: 999, background: OT.sand200,
      }} />
      {/* healthy band */}
      <div style={{
        position: 'absolute', left: `${idealStart}%`, width: `${idealEnd - idealStart}%`,
        top: 8, height: 6, borderRadius: 999, background: 'rgba(94,138,94,0.55)',
      }} />
      {/* value marker */}
      <div style={{
        position: 'absolute', left: `${valuePos}%`, top: 0,
        transform: 'translateX(-50%)',
      }}>
        <div style={{
          width: 12, height: 12, borderRadius: 999,
          background: inIdeal ? OT.ok : OT.bad,
          border: `2px solid ${OT.paper}`, boxShadow: OT.sh1,
          marginTop: 5,
        }} />
      </div>
      {/* range labels */}
      <div style={{ position: 'absolute', left: 0, top: 16, fontFamily: OT.fMono, fontSize: 8, color: OT.clay600 }}>{min}</div>
      <div style={{ position: 'absolute', right: 0, top: 16, fontFamily: OT.fMono, fontSize: 8, color: OT.clay600 }}>{max}</div>
    </div>
  );
}

function Step4Blood() {
  const { journey, update } = useJourney();
  const isUploaded = !!journey.bloodUploaded;
  const fileName = journey.bloodFileName || 'BloodPanel_Mar26.pdf';

  const triggerUpload = () => {
    document.getElementById('blood-file-input-mob')?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      update({
        bloodUploaded: true,
        bloodFileName: file.name,
      });
    }
  };

  return (
    <div className="frame-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 24px' }}>
      <input
        type="file"
        id="blood-file-input-mob"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*,application/pdf"
      />

      <StepHeader step={4} eyebrow="Blood report" title="Blood &amp; lab work." subtitle="Upload your most recent panel — we read it and flag what to act on." />

      {/* Upload card/action */}
      <div style={{
        marginTop: 20, padding: 16, borderRadius: 14,
        background: OT.paper, border: `1px solid ${OT.hairline}`, boxShadow: OT.sh1,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 10, background: OT.sand100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: OT.walnut, flexShrink: 0,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: OT.fBody, fontWeight: 600, fontSize: 13.5, color: OT.espresso900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isUploaded ? fileName : 'No Blood report uploaded'}
          </div>
          <div style={{ fontFamily: OT.fBody, fontSize: 11.5, color: OT.clay600 }}>
            {isUploaded ? '22 markers · parsed by AI · Online' : 'Upload reports to extract your biomarkers'}
          </div>
        </div>
        <OPill small ghost style={{ color: OT.clay600 }} onClick={triggerUpload}>
          {isUploaded ? 'Replace' : 'Upload'}
        </OPill>
      </div>

      {/* Summary banner */}
      {isUploaded ? (
        <div style={{
          marginTop: 14, padding: '12px 14px', borderRadius: 12,
          background: 'rgba(176,70,58,0.08)', border: `1px solid rgba(176,70,58,0.25)`,
        }}>
          <OMono size={9} color={OT.bad}>4 out of range · 4 healthy</OMono>
          <div style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.espresso900, marginTop: 4, lineHeight: 1.4 }}>
            Vitamin D and HDL deserve attention. LDL trending up.
          </div>
        </div>
      ) : (
        <div style={{
          marginTop: 14, padding: '14px 16px', background: 'rgba(123,139,111,0.06)',
          border: `1.5px dashed rgba(123,139,111,0.45)`, borderRadius: 12,
          display: 'flex', gap: 10, alignItems: 'flex-start'
        }}>
          <span style={{ fontSize: 18, marginTop: -2 }}>🩸</span>
          <div style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.espresso800, lineHeight: 1.5 }}>
            <strong style={{ color: OT.sage500, fontWeight: 'bold' }}>Free Yearly Blood Panel:</strong> Get your comprehensive yearly blood assessment done completely <strong>free of charge</strong> with any minimum 6-month membership plan. Please contact the M3S office to schedule your blood draw.
          </div>
        </div>
      )}

      {/* Parameter list */}
      <div style={{ marginTop: 16, opacity: isUploaded ? 1 : 0.5 }}>
        <OEyebrow dot={isUploaded ? OT.ochre : OT.clay600}>
          {isUploaded ? 'Biomarker levels' : 'Biomarker levels (Preview once uploaded)'}
        </OEyebrow>
        <div style={{
          marginTop: 10, background: OT.paper, border: `1px solid ${OT.hairline}`,
          borderRadius: 14, padding: '4px 16px',
        }}>
          {BLOOD_PARAMS.map((p, i) => {
            const displayVal = isUploaded ? p.value : '−−';
            const displayStatus = isUploaded ? p.status : 'ok';
            const mockParam = { ...p, value: isUploaded ? p.value : (p.low + (p.high - p.low) / 2) };
            return (
              <div key={p.name} style={{
                padding: '14px 0', borderTop: i === 0 ? 'none' : `1px solid ${OT.hairline}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                  <div style={{ fontFamily: OT.fBody, fontWeight: 600, fontSize: 13.5, color: OT.espresso900 }}>
                    {p.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 20, color: isUploaded ? OT.espresso900 : OT.clay600 }}>
                      {displayVal}
                    </span>
                    <span style={{ fontFamily: OT.fMono, fontSize: 9, letterSpacing: 1, color: OT.clay600, textTransform: 'uppercase' }}>
                      {p.unit}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  {isUploaded ? <StatusDot status={displayStatus} /> : <OMono size={8} color={OT.clay600}>Awaiting Upload</OMono>}
                  <OMono size={8}>Healthy {p.ideal[0]}–{p.ideal[1]}</OMono>
                </div>
                <RangeBar p={mockParam} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STEP 5 — MSK Movement Assessment
// ═══════════════════════════════════════════════════════════════════════════
const MSK_QUESTIONS = [
  { key: 'toeTouch', q: 'Can you touch your toes (knees soft)?', selfA: 'Almost — fingertips reach mid-shin', coachOverride: '−4cm from floor · tight hamstrings, posterior chain L>R', options: ['Fully touch toes with straight legs', 'Almost — fingertips reach mid-shin', 'Can barely reach knees / tight hamstrings'] },
  { key: 'overheadReach', q: 'Overhead reach without arching back?',  selfA: 'No — back arches when arms go up',  coachOverride: 'Lats restricted · thoracic ext. limited at T6-T8', options: ['Yes, arms go fully vertical', 'No — back arches when arms go up', 'Cannot raise arms above shoulders'] },
  { key: 'singleLegBalance', q: 'Single-leg balance, eyes closed (10s)?', selfA: 'Right OK, left wobbly',           coachOverride: 'L: 4s · R: 9s — hip abductor weakness L', options: ['Can hold easily over 10s', 'Right OK, left wobbly', 'Lose balance under 3s on both legs'] },
  { key: 'parallelSquat', q: 'Squat to parallel without heel lift?',  selfA: 'Heels rise slightly',                coachOverride: 'Ankle DF 32° L / 28° R · cue heel-load', options: ['Sinks deep to parallel easily', 'Heels rise slightly', 'Cannot get deep without pain'] },
];

function MSKQuestion({ q, i, isSignedOff, userVal, onSelect, coachName }) {
  const currentVal = userVal || q.selfA;
  return (
    <div style={{
      background: OT.paper, border: `1px solid ${OT.hairline}`,
      borderRadius: 14, padding: 16, marginBottom: 12,
    }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          background: OT.walnut, color: OT.paper,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: OT.fMono, fontSize: 10, flexShrink: 0,
        }}>{i + 1}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: OT.fBody, fontWeight: 600, fontSize: 13.5, color: OT.espresso900 }}>{q.q}</div>

          <OMono size={9} style={{ marginTop: 12, marginBottom: 6 }}>Your answer</OMono>
          {isSignedOff ? (
            <div style={{
              background: OT.sand100, padding: '10px 12px', borderRadius: 8,
              fontFamily: OT.fBody, fontSize: 13, color: OT.espresso800, lineHeight: 1.4,
            }}>{currentVal}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {q.options.map((opt) => {
                const isSelected = userVal === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => onSelect(opt)}
                    style={{
                      textAlign: 'left', fontFamily: OT.fBody, fontSize: 13,
                      padding: '10px 12px', borderRadius: 8,
                      border: isSelected ? `1.5px solid ${OT.walnut}` : `1px solid ${OT.hairlineStrong}`,
                      background: isSelected ? 'rgba(94,66,40,0.05)' : OT.sand50,
                      color: isSelected ? OT.walnut : OT.espresso800,
                      fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer', transition: 'all 0.1s',
                    }}
                  >{opt}</button>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <OMono size={9} color={isSignedOff ? OT.ochre : OT.clay600}>Coach review</OMono>
            <span style={{
              fontFamily: OT.fMono, fontSize: 8, letterSpacing: 1,
              color: isSignedOff ? OT.ochre : OT.clay600, padding: '2px 6px',
              background: isSignedOff ? 'rgba(201,154,63,0.12)' : 'rgba(62,44,28,0.06)', borderRadius: 4,
            }}>{isSignedOff ? 'EDITED SIGN-OFF' : 'PENDING SCREEN'}</span>
          </div>
          <div style={{
            marginTop: 6, background: isSignedOff ? 'rgba(201,154,63,0.08)' : 'rgba(62,44,28,0.02)',
            border: isSignedOff ? `1px solid rgba(201,154,63,0.3)` : `1px dashed ${OT.hairlineStrong}`,
            padding: '10px 12px', borderRadius: 8,
            fontFamily: OT.fBody, fontSize: 13, color: isSignedOff ? OT.espresso800 : OT.clay600, lineHeight: 1.4,
          }}>
            {isSignedOff 
              ? q.coachOverride 
              : `Awaiting physical scan. Coach ${coachName} will measure precise joint ranges during your screen.`}
          </div>
        </div>
      </div>
    </div>
  );
}

function Step5MSK() {
  const { journey, update } = useJourney();
  const isSignedOff = !!journey.mskSignedOff;

  // Real coach logic instead of static Lee
  const selectedCoachId = journey.coachId || 'deepika';
  const coach = COACHES.find(c => c.id === selectedCoachId) || COACHES[0];

  const answers = journey.mskAnswers || {};

  const handleSelectAnswer = (key, val) => {
    update({
      mskAnswers: {
        ...answers,
        [key]: val,
      }
    });
  };

  return (
    <div className="frame-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 24px' }}>
      <StepHeader step={5} eyebrow="MSK assessment" title="Movement screen." subtitle="Answer 4 quick screens. Your coach reviews and adds clinical detail in-person." />

      {/* Coach byline */}
      <div style={{
        marginTop: 16, padding: 14,
        background: OT.sand100, borderRadius: 12, border: `1px solid ${OT.hairline}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <CoachAvatar coach={coach} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <OMono size={9}>Reviewed by</OMono>
          <div style={{ fontFamily: OT.fBody, fontWeight: 600, fontSize: 13.5, color: OT.espresso900, marginTop: 2 }}>
            {coach.name} · MSK clinic, {isSignedOff ? 'Apr 26' : 'Awaiting check-in'}
          </div>
        </div>
        <span style={{
          fontFamily: OT.fMono, fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase',
          color: isSignedOff ? OT.ok : OT.clay600, padding: '4px 8px',
          background: isSignedOff ? 'rgba(94,138,94,0.12)' : 'rgba(62,44,28,0.06)', borderRadius: 999,
        }}>{isSignedOff ? 'Signed off' : 'Pending Screen'}</span>
      </div>

      <div style={{ marginTop: 18 }}>
        {MSK_QUESTIONS.map((q, i) => (
          <MSKQuestion
            key={i}
            q={q}
            i={i}
            isSignedOff={isSignedOff}
            userVal={answers[q.key]}
            onSelect={(val) => handleSelectAnswer(q.key, val)}
            coachName={coach.name}
          />
        ))}
      </div>

      {/* Coach summary box */}
      <div style={{
        marginTop: 4, background: isSignedOff ? '#FFF8EE' : OT.sand50,
        border: isSignedOff ? `1px solid ${OT.hairline}` : `1px dashed ${OT.hairlineStrong}`, borderRadius: 14, padding: 16,
      }}>
        <OEyebrow dot={isSignedOff ? OT.ochre : OT.clay600}>Coach's clinical summary</OEyebrow>
        <div style={{
          fontFamily: OT.fBody, fontSize: 13, color: isSignedOff ? OT.espresso800 : OT.clay600,
          marginTop: 10, lineHeight: 1.55,
        }}>
          {isSignedOff ? (
            'Posterior chain & thoracic mobility are the rate-limiters. We\'ll start with 90/90 hip work, loaded carries, and a 10-min thoracic flow before each session. Re-screen at week 6.'
          ) : (
            `No corrective program generated yet. Coach ${coach.name} will compile your joint biomechanics corrections here after your in-studio assessment.`
          )}
        </div>
      </div>
    </div>
  );
}

// STEP 6 — AI Summary + Login
// ═══════════════════════════════════════════════════════════════════════════
function Step6Summary({ onLogin }) {
  const p = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('m3s.journey') || '{}');
    } catch {
      return {};
    }
  }, []);

  const hasData = !!(p.bcaUploaded || p.bloodUploaded || p.mskSignedOff);
  const selectedCoachId = p.coachId || 'deepika';
  const coach = COACHES.find(c => c.id === selectedCoachId) || COACHES[0];

  const titleText = hasData ? (
    <>
      Solid base, recoverable gaps. <br/>
      You're <em style={{ color: OT.ochre }}>ahead</em> on metabolic health, <em style={{ color: OT.ochre }}>behind</em> on micronutrients &amp; mobility.
    </>
  ) : (
    <>
      Starting status pending check-in. <br/>
      Awaiting your in-studio <em style={{ color: OT.ochre }}>BCA &amp; physical movement screen</em>.
    </>
  );

  const pathDesc = hasData ? (
    <>
      <strong style={{ color: OT.ochre, fontWeight: 600 }}>16–20 weeks</strong> to visible upper-body hypertrophy, via 4×/wk PT with {coach.name} — block-periodised hypertrophy + thoracic mobility prep.
    </>
  ) : (
    <>
      <strong style={{ color: OT.ochre, fontWeight: 600 }}>Timeline calculated at check-in</strong>. Once you complete your free BCA &amp; joint mobility screen with Coach {coach.name}, we will map out your exact timeline and hypertrophy milestones.
    </>
  );

  const strengths = hasData ? [
    'Healthy fasting glucose &amp; HbA1c',
    'Consistent 3×/wk running base',
    'Visceral fat well within range',
  ] : [
    'Goal priority compiled (' + (p.goal || 'Hypertrophy') + ')',
    'Weekly slot targets scheduled',
    p.runFrequency ? `Steady cardio foundation (${p.runFrequency})` : 'Active cardio ready',
  ];

  const weaknesses = hasData ? [
    'Vitamin D deficient (18 ng/mL)',
    'LDL trending high (148)',
    'Right shoulder OHP-restricted',
    'Posterior chain &amp; thoracic mobility',
  ] : [
    'Awaiting body composition (InBody) scan',
    'Awaiting Blood Panel to screen micronutrients',
    `MSK joint assessment scheduled with ${coach.name}`,
  ];

  return (
    <div className="frame-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 24px' }}>
      <StepHeader step={7} eyebrow="Your starting picture" title="Here's where you stand." subtitle="Generated from your inputs. Your coach can refine before it goes to your profile." />

      {/* Fitness score — from onboarding inputs */}
      <div style={{ marginTop: 16, marginBottom: 4 }}>
        <FitnessScoreSection profile={p} />
      </div>

      {/* Hero summary card */}
      <div style={{
        marginTop: 20, background: OT.espresso900, color: OT.paper,
        borderRadius: 18, padding: 22, boxShadow: OT.sh3, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 160, height: 160,
          borderRadius: '50%', background: 'rgba(201,154,63,0.18)',
        }} />
        <OMono color="rgba(255,253,248,0.6)" size={9}>Current health status</OMono>
        <h2 style={{
          fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400,
          fontSize: 26, lineHeight: 1.15, color: OT.paper,
          margin: '8px 0 0', letterSpacing: -0.4,
        }}>
          {titleText}
        </h2>

         <div style={{
          marginTop: 18, padding: '14px 16px', borderRadius: 12,
          background: 'rgba(255,253,248,0.08)', border: `1px solid rgba(255,253,248,0.12)`,
        }}>
          <OMono color="rgba(255,253,248,0.6)" size={9}>Estimated path to goal</OMono>
          <div style={{
            fontFamily: OT.fBody, fontSize: 14, color: OT.paper, marginTop: 6, lineHeight: 1.5,
          }}>
            {pathDesc}
          </div>
        </div>
      </div>

      {/* Strengths / Weaknesses — editable */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, marginTop: 16 }}>
        <SWBlock kind="strength" items={strengths} />
        <SWBlock kind="weakness" items={weaknesses} />
      </div>

      {/* AI techniques */}
      <div style={{
        marginTop: 16, background: OT.paper, border: `1px solid ${OT.hairline}`,
        borderRadius: 14, padding: 16,
      }}>
        <OEyebrow dot={OT.sage}>Techniques your coach will use</OEyebrow>
        <ul style={{
          margin: '12px 0 0', padding: '0 0 0 18px',
          fontFamily: OT.fBody, fontSize: 13, color: OT.espresso800, lineHeight: 1.7,
        }}>
          <li>Block-periodised hypertrophy (4-wk volume → 2-wk intensity)</li>
          <li>Pre-session 10-min thoracic + 90/90 hip flow</li>
          <li>Substitute landmine / incline press for OHP</li>
          <li>Vit D3 5000IU + omega-3 supplementation (post-doctor sign-off)</li>
          <li>Re-test bloods &amp; BCA at week 8</li>
        </ul>
      </div>

      {/* 12-week milestones stepper */}
      <MilestonesStepper />

      <div style={{
        marginTop: 14, padding: '10px 14px', background: OT.sand100,
        borderRadius: 10, fontFamily: OT.fMono, fontSize: 9.5, letterSpacing: 1.2,
        color: OT.clay600, textTransform: 'uppercase', textAlign: 'center',
      }}>
        Updates automatically as your data changes
      </div>

      {/* Sign-up */}
      <div style={{
        marginTop: 20, padding: 18, background: OT.paper,
        border: `1px solid ${OT.hairlineStrong}`, borderRadius: 16, boxShadow: OT.sh2,
      }}>
        <h3 style={{
          fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 22, lineHeight: 1.2,
          color: OT.espresso900, margin: 0, fontWeight: 400,
        }}>Save this to your profile.</h3>
        <p style={{
          fontFamily: OT.fBody, fontSize: 13, color: OT.clay600,
          margin: '6px 0 14px', lineHeight: 1.5,
        }}>Create your account so this baseline lives in your dashboard and updates automatically.</p>

        <button onClick={onLogin} style={{
          width: '100%', padding: '12px 16px', borderRadius: 10,
          border: `1px solid ${OT.hairlineStrong}`, background: OT.paper,
          fontFamily: OT.fBody, fontSize: 14, fontWeight: 600, color: OT.espresso900,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8L6.2 32.6C9.5 39.1 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C40.6 35.5 44 30.2 44 24c0-1.3-.1-2.6-.4-3.9z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{
          margin: '12px 0', display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: OT.fMono, fontSize: 9, letterSpacing: 1.5,
          color: OT.clay600, textTransform: 'uppercase',
        }}>
          <div style={{ flex: 1, height: 1, background: OT.hairline }} />
          or
          <div style={{ flex: 1, height: 1, background: OT.hairline }} />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ ...inputStyle, width: 70, textAlign: 'center', flexShrink: 0 }}>+91</div>
          <input placeholder="Phone number" style={{ ...inputStyle, flex: 1 }} />
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "var(--clay-600)", fontFamily: "var(--f-body)" }}>
          * Please use your WhatsApp number for easier communication.
        </div>
        <button onClick={onLogin} style={{
          width: '100%', marginTop: 10, padding: '12px 16px', borderRadius: 10,
          border: 'none', background: OT.walnut, color: OT.paper,
          fontFamily: OT.fBody, fontSize: 14, fontWeight: 600, cursor: 'pointer',
          boxShadow: OT.sh2,
        }}>Send OTP</button>
      </div>
    </div>
  );
}

function SWBlock({ kind, items }) {
  const isStr = kind === 'strength';
  const accent = isStr ? OT.ok : OT.bad;
  const bg = isStr ? 'rgba(94,138,94,0.06)' : 'rgba(176,70,58,0.05)';
  return (
    <div style={{
      background: bg, border: `1px solid ${OT.hairline}`,
      borderRadius: 14, padding: '14px 16px', position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <OEyebrow dot={accent}>{isStr ? 'Strengths' : 'Areas to improve'}</OEyebrow>
        <button style={{
          fontFamily: OT.fMono, fontSize: 9, letterSpacing: 1.2,
          textTransform: 'uppercase', color: OT.clay600,
          background: 'transparent', border: 'none', cursor: 'pointer',
        }}>Edit ✎</button>
      </div>
      <ul style={{
        margin: '10px 0 0', padding: '0 0 0 18px',
        fontFamily: OT.fBody, fontSize: 13, color: OT.espresso800, lineHeight: 1.7,
      }}>
        {items.map((it, i) => <li key={i} dangerouslySetInnerHTML={{ __html: it }} />)}
      </ul>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FRAMES & LAYOUT
// ═══════════════════════════════════════════════════════════════════════════
function PhoneFrameOnb({ children }) {
  return (
    <div style={{
      width: 375, height: 812, position: 'relative',
      background: OT.sand50, overflow: 'hidden',
      fontFamily: OT.fBody,
    }}>
      {/* iOS status bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 44,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 24px 0', zIndex: 10,
      }}>
        <span style={{
          fontFamily: '-apple-system, system-ui', fontSize: 15, fontWeight: 600,
          color: OT.ink, letterSpacing: -0.2,
        }}>9:41</span>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="6" width="3" height="4" rx="0.6" fill={OT.ink}/><rect x="4.5" y="4" width="3" height="6" rx="0.6" fill={OT.ink}/><rect x="9" y="2" width="3" height="8" rx="0.6" fill={OT.ink}/><rect x="13.5" y="0" width="3" height="10" rx="0.6" fill={OT.ink}/></svg>
          <svg width="24" height="11" viewBox="0 0 24 11"><rect x="0.5" y="0.5" width="20" height="10" rx="2.5" stroke={OT.ink} strokeOpacity="0.4" fill="none"/><rect x="2" y="2" width="17" height="7" rx="1" fill={OT.ink}/></svg>
        </div>
      </div>
      <div style={{ position: 'absolute', inset: 0, paddingTop: 44, display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
      <div style={{
        position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
        width: 134, height: 5, borderRadius: 3, background: OT.ink, opacity: 0.5, zIndex: 20,
      }} />
    </div>
  );
}

function BrowserFrameOnb({ children, url }) {
  return (
    <div style={{
      width: 1280, height: 800, background: OT.paper,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: OT.fBody,
    }}>
      <div style={{
        height: 36, background: '#ECE6DA',
        display: 'flex', alignItems: 'center', padding: '0 14px',
        borderBottom: `1px solid ${OT.hairline}`, gap: 14, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#E07A5F' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#E0B85F' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#7B8B6F' }} />
        </div>
        <div style={{
          flex: 1, maxWidth: 420, height: 22, borderRadius: 6,
          background: OT.paper, border: `1px solid ${OT.hairline}`,
          margin: '0 auto', display: 'flex', alignItems: 'center', padding: '0 10px',
          fontFamily: OT.fMono, fontSize: 11, color: OT.clay600, letterSpacing: 0.3,
        }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke={OT.clay600} strokeWidth="1.2" style={{ marginRight: 6 }}>
            <rect x="2" y="4" width="6" height="5" rx="1"/><path d="M3.5 4V3a1.5 1.5 0 013 0v1"/>
          </svg>
          {url}
        </div>
        <div style={{ width: 60 }} />
      </div>
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative', background: OT.sand50 }}>
        {children}
      </div>
    </div>
  );
}

// Mobile screen wrapper — TopBar + step body + footer
function MobileStep({ step, footerProps, children }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: OT.sand50 }}>
      <OnbTopBar rightLabel={`Step ${step} / 7`} />
      {children}
      <OnbFooter {...footerProps} />
    </div>
  );
}

// Desktop split — narrative left, scrollable form right
function DesktopStep({ step, eyebrow, title, sub, footerProps, children, narrativeExtra }) {
  const isClean = sessionStorage.getItem('m3s.onb_clean_session') === 'true';
  const toggleClean = () => {
    if (isClean) {
      sessionStorage.removeItem('m3s.onb_clean_session');
    } else {
      sessionStorage.setItem('m3s.onb_clean_session', 'true');
    }
    window.location.reload();
  };

  return (
    <div style={{ width: '100%', height: '100%', background: OT.sand50, display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '20px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: `1px solid ${OT.hairline}`, flexShrink: 0,
      }}>
        <M3SLogo size="lg" />
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <OMono size={11}>Step {step} of 7 · {eyebrow}</OMono>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1.4fr', overflow: 'hidden' }}>
        <div style={{
          padding: '48px 48px', background: OT.sand100,
          borderRight: `1px solid ${OT.hairline}`,
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ width: '100%', maxWidth: 320, marginBottom: 36 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 3, borderRadius: 999,
                  background: i < step ? OT.walnut : OT.sand200,
                }} />
              ))}
            </div>
            <OMono size={10} style={{ marginTop: 10 }}>{step} of 7 complete</OMono>
          </div>
          <OEyebrow>{eyebrow}</OEyebrow>
          <h1 style={{
            fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400,
            fontSize: 56, lineHeight: 1.0, color: OT.espresso900,
            margin: '14px 0 14px', letterSpacing: -1,
          }}>{title}</h1>
          <p style={{
            fontFamily: OT.fBody, fontSize: 15, lineHeight: 1.6,
            color: OT.clay600, margin: 0, maxWidth: 340,
          }}>{sub}</p>
          {narrativeExtra}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div className="frame-scroll" style={{ flex: 1, overflowY: 'auto', padding: '40px 48px 24px' }}>
            <div style={{ maxWidth: 560 }}>{children}</div>
          </div>
          <div style={{
            padding: '14px 48px 22px', borderTop: `1px solid ${OT.hairline}`,
            background: OT.sand50, flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            {footerProps?.onBack
              ? <OPill small onClick={footerProps.onBack}>← Back</OPill>
              : <div style={{ width: 1 }} />}
            <div style={{ flex: 1 }} />
            {footerProps?.skipLabel && <span onClick={footerProps?.onNext} style={{
              fontFamily: OT.fBody, fontSize: 13, color: OT.clay600,
              textDecoration: 'underline', textUnderlineOffset: 3,
              textDecorationColor: OT.hairlineStrong, cursor: 'pointer',
            }}>{footerProps.skipLabel}</span>}
            <OPill primary onClick={footerProps?.onNext}>{footerProps?.nextLabel || 'Continue →'}</OPill>
          </div>
        </div>
      </div>
    </div>
  );
}

// Desktop body content per step — re-uses mobile bodies but in larger frame
function step1Body() { return <Step1BasicDesktop />; }
function step2Body() { return <Step2JourneyDesktop />; }
function step3Body() { return <Step3BodyCompDesktop />; }
function step4Body() { return <Step4BloodDesktop />; }
function step5Body() { return <Step5MSKDesktop />; }
function step6Body() { return <Step6SummaryDesktop />; }

// — Desktop variant of Step1: Journey + preferred time slots
function Step1JourneyDesktop() {
  const { journey, update, toggleInjury } = useJourney();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <BasicInfoBlock />
      <div>
        <OMono style={{ marginBottom: 10 }}>How long have you been training?</OMono>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['< 6 months', '6–24 months', '2–5 years', '5+ years'].map(d => (
            <OChip key={d} selected={journey.experience === d} onClick={() => update({ experience: d })}>{d}</OChip>
          ))}
        </div>
      </div>
      <div>
        <OMono style={{ marginBottom: 10 }}>Primary goal</OMono>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Fat Loss', 'Muscle Gain', 'Hyrox / Performance', 'Injury Rehab', 'General Fitness'].map(g => (
            <OChip key={g} selected={journey.goal === g} onClick={() => update({ goal: g })}>{g}</OChip>
          ))}
        </div>
      </div>
      <div>
        <OMono style={{ marginBottom: 10 }}>Training days per week</OMono>
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          background: OT.paper, border: `1px solid ${OT.hairlineStrong}`,
          borderRadius: 10, overflow: 'hidden',
        }}>
          <button onClick={() => update({ daysPerWeek: Math.max(1, journey.daysPerWeek - 1) })} style={stepperBtn}>−</button>
          <div style={{ width: 56, textAlign: 'center', fontFamily: OT.fDisplay, fontSize: 24, color: OT.walnut }}>{journey.daysPerWeek}</div>
          <button onClick={() => update({ daysPerWeek: Math.min(7, journey.daysPerWeek + 1) })} style={stepperBtn}>+</button>
        </div>
      </div>
      <div>
        <OMono style={{ marginBottom: 10 }}>Tell us more about your goal (optional)</OMono>
        <textarea value={journey.notes} onChange={(e) => update({ notes: e.target.value })} rows={3} style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} />
      </div>
      <div>
        <OMono style={{ marginBottom: 10 }}>Injuries or limitations</OMono>
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 10 }}>
          {['Lower back', 'Knee', 'Shoulder', 'Hip', 'Wrist', 'None'].map((tag) => {
            const sel = journey.injuries.includes(tag);
            return (
              <button key={tag} onClick={() => toggleInjury(tag)} style={{
                fontFamily: OT.fBody, fontSize: 12, fontWeight: 600,
                padding: '6px 12px', borderRadius: 999,
                border: `1px solid ${sel ? OT.walnut : OT.hairlineStrong}`,
                background: sel ? OT.walnut : 'transparent',
                color: sel ? OT.paper : OT.clay600, cursor: 'pointer',
              }}>{sel ? tag + ' ×' : '+ ' + tag}</button>
            );
          })}
        </div>
        <textarea value={journey.injuryNotes} onChange={(e) => update({ injuryNotes: e.target.value })} rows={2} style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }} />
      </div>

      {/* PREFERRED TIME SLOTS */}
      <div style={{
        padding: 22, borderRadius: 16,
        background: '#FFF8EE', border: `1px solid ${OT.hairline}`, boxShadow: OT.sh1,
      }}>
        <OEyebrow dot={OT.ochre}>Preferred time slots</OEyebrow>
        <h3 style={{
          fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400,
          fontSize: 26, color: OT.espresso900, margin: '8px 0 4px', letterSpacing: -0.4,
        }}>When can you train?</h3>
        <p style={{
          fontFamily: OT.fBody, fontSize: 14, color: OT.clay600,
          margin: '0 0 16px', lineHeight: 1.55, maxWidth: 460,
        }}>Select <strong style={{ color: OT.walnut }}>one or more</strong> windows that work for you. We'll match a coach available in your slots in Step 2.</p>
        <TimeSlotGrid />
      </div>
    </div>
  );
}

// — Desktop variants for steps 2–6 (re-use the inner contents w/o StepHeader)
function StripHeader({ children }) {
  // Render mobile component but visually drop top StepHeader (passed already w/ no header)
  return children;
}

function Step2CoachDesktop() {
  const { journey, update } = useJourney();
  const ranked = React.useMemo(() => rankCoaches(journey), [journey.goal, journey.slots.join(',')]);
  const [showAll, setShowAll] = React.useState(false);

  React.useEffect(() => {
    if (!journey.coachId && ranked.length > 0) update({ coachId: ranked[0].coach.id });
  }, [ranked.length]);

  const top = ranked[0];
  const noneAvailable = top && top.overlap.length === 0;
  const alternates = ranked.filter(r => r.overlap.length > 0).slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {!noneAvailable && top && (
        <div style={{
          background: '#FFF8EE', border: `1px solid ${OT.hairline}`,
          borderRadius: 18, padding: 24, boxShadow: OT.sh1,
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 18, alignItems: 'center' }}>
            <CoachAvatar coach={top.coach} size={72} ring />
            <div>
              <OEyebrow dot={OT.ochre}>Recommended coach</OEyebrow>
              <div style={{
                fontFamily: OT.fDisplay, fontStyle: 'italic',
                fontSize: 32, color: OT.espresso900, lineHeight: 1.1, marginTop: 6,
              }}>{top.coach.name}</div>
              <div style={{ fontFamily: OT.fBody, fontSize: 14, color: OT.clay600 }}>{top.coach.role}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <OMono size={9}>Match score</OMono>
              <div style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 32, color: OT.ochre, lineHeight: 1 }}>
                {Math.round(top.score)}%
              </div>
            </div>
          </div>
          <p style={{
            fontFamily: OT.fBody, fontSize: 14.5, color: OT.espresso800,
            margin: '16px 0 0', lineHeight: 1.6,
          }}>
            <strong style={{ color: OT.walnut }}>Why {top.coach.name}:</strong> Specialises in {top.coach.specialties.slice(0, 2).join(' & ').toLowerCase()}.
            {' '}Free in <strong style={{ color: OT.ok }}>{top.overlap.length} of your {journey.slots.length} slots</strong>
            {' '}({Math.round(top.coach.avail * 100)}% overall availability).
          </p>
          {top.overlap.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <OMono size={9} style={{ marginBottom: 8 }}>Free in your slots</OMono>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {top.overlap.map(s => (
                  <span key={s} style={{
                    fontFamily: OT.fBody, fontSize: 12.5, fontWeight: 600,
                    padding: '6px 12px', borderRadius: 999,
                    background: 'rgba(94,138,94,0.14)', color: OT.ok,
                  }}>{fmtSlot(s)}</span>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <OPill primary onClick={() => update({ coachId: top.coach.id })}>
              {journey.coachId === top.coach.id ? '✓ Selected' : 'Pick ' + top.coach.name}
            </OPill>
            <OPill ghost onClick={() => setShowAll(s => !s)} style={{ color: OT.clay600 }}>
              {showAll ? 'Hide other coaches' : 'Change coach'}
            </OPill>
          </div>
        </div>
      )}

      {noneAvailable && (
        <div style={{
          background: 'rgba(176,70,58,0.06)',
          border: `1px solid rgba(176,70,58,0.25)`, borderRadius: 18, padding: 24,
        }}>
          <OEyebrow dot={OT.bad} color={OT.bad}>No exact match</OEyebrow>
          <h3 style={{
            fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400,
            fontSize: 26, color: OT.espresso900, margin: '8px 0 8px', letterSpacing: -0.4, maxWidth: 560,
          }}>We're sorry — none of our PT coaches are free in your selected slots right now.</h3>
          <p style={{ fontFamily: OT.fBody, fontSize: 14, color: OT.espresso800, margin: 0, lineHeight: 1.55 }}>
            Here are coaches with the closest availability. You can also <button
              onClick={() => window.location.hash = 'step=1'}
              style={{ background: 'transparent', border: 'none', color: OT.walnut, fontFamily: OT.fBody, fontSize: 14, padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
            >adjust your time slots</button>.
          </p>
          <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {alternates.map(r => (
              <CoachCard key={r.coach.id} row={r} picked={journey.coachId} onPick={(id) => update({ coachId: id })} />
            ))}
          </div>
        </div>
      )}

      {showAll && !noneAvailable && (
        <div>
          <OEyebrow>Other coaches</OEyebrow>
          <p style={{ fontFamily: OT.fBody, fontSize: 13.5, color: OT.clay600, margin: '8px 0 14px', lineHeight: 1.5 }}>
            Click any to switch. Coaches with no overlap to your slots are flagged.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {ranked.slice(1).map(r => (
              <CoachCard key={r.coach.id} row={r} picked={journey.coachId} onPick={(id) => update({ coachId: id })} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Step3BodyCompDesktop() {
  const { journey, update } = useJourney();
  const isUploaded = !!journey.bcaUploaded;
  const fileName = journey.bcaFileName || 'InBody_April.pdf';

  const insights = [
    { label: 'Body fat',     value: isUploaded ? '24.8%' : '−−.−%',  range: isUploaded ? 'Slightly high · target 22%' : 'Awaiting status · target 22%',     accent: isUploaded ? OT.warn : OT.clay600 },
    { label: 'Muscle mass',  value: isUploaded ? '49.2 kg' : '−−.− kg',range: isUploaded ? 'On track for height' : 'Awaiting data',            accent: isUploaded ? OT.ok : OT.clay600 },
    { label: 'Visceral fat', value: isUploaded ? '8' : '−',      range: isUploaded ? 'Healthy · 1–12 range' : 'Awaiting data',           accent: isUploaded ? OT.ok : OT.clay600 },
    { label: 'Metabolic age',value: isUploaded ? '34' : '−−',     range: isUploaded ? '2 yrs above chronological' : 'Awaiting data',      accent: isUploaded ? OT.warn : OT.clay600 },
  ];

  const triggerUpload = () => {
    document.getElementById('bca-file-input-desk')?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      update({
        bcaUploaded: true,
        bcaFileName: file.name,
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <input
        type="file"
        id="bca-file-input-desk"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*,application/pdf"
      />

      <div style={{
        padding: 28, borderRadius: 16,
        border: `1.5px dashed ${OT.hairlineStrong}`, background: OT.paper,
        display: 'flex', alignItems: 'center', gap: 18,
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 14, background: OT.sand100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: OT.walnut, flexShrink: 0,
        }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 16V4M7 9l5-5 5 5"/><path d="M5 19h14"/>
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: OT.fBody, fontWeight: 600, fontSize: 15, color: OT.espresso900 }}>
            {isUploaded ? 'Replace your BCA report' : 'Upload your BCA report'}
          </div>
          <div style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.clay600, marginTop: 3 }}>
            {isUploaded ? `Uploaded: ${fileName}` : 'PDF or photo · InBody · DEXA · Tanita. Don\'t have one? Skip this — you can do it later.'}
          </div>
        </div>
        <OPill primary onClick={triggerUpload}>Choose file</OPill>
      </div>

      {/* Info copy on empty state */}
      {!isUploaded && (
        <div style={{
          padding: '16px 20px', background: 'rgba(201,154,63,0.06)',
          border: `1px solid rgba(201,154,63,0.22)`, borderRadius: 14,
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: 20, marginTop: -2 }}>📊</span>
          <div style={{ fontFamily: OT.fBody, fontSize: 13.5, color: OT.espresso800, lineHeight: 1.55 }}>
            <strong style={{ color: OT.ochre, fontWeight: 'bold' }}>Important note on values:</strong> Once you upload your InBody scan, your body composition highlights automatically parse and display here. If you do not have a report, you can complete your scan for free at the <strong>M3S office in-person</strong> anytime before or after your first training session! Contact our staff to coordinate your scan.
          </div>
        </div>
      )}

      <div style={{ opacity: isUploaded ? 1 : 0.65 }}>
        <OEyebrow dot={isUploaded ? OT.ochre : OT.clay600}>
          {isUploaded ? `AI insights · ${fileName}` : 'AI insights (Preview once uploaded)'}
        </OEyebrow>
        <div style={{
          marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12,
        }}>
          {insights.map((it) => (
            <div key={it.label} style={{
              background: OT.paper, border: `1px solid ${OT.hairline}`,
              borderRadius: 14, padding: 16, boxShadow: OT.sh1,
            }}>
              <OMono size={9}>{it.label}</OMono>
              <div style={{
                fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 28, color: isUploaded ? OT.espresso900 : OT.clay600, marginTop: 6,
              }}>{it.value}</div>
              <div style={{ fontFamily: OT.fBody, fontSize: 12.5, color: it.accent, marginTop: 4, fontWeight: 500 }}>{it.range}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        padding: '14px 18px', background: OT.sand100,
        borderRadius: 12, border: `1px solid ${OT.hairline}`,
        opacity: isUploaded ? 1 : 0.6,
      }}>
        <OMono size={9} style={{ marginBottom: 6 }}>Coach note</OMono>
        <div style={{ fontFamily: OT.fBody, fontSize: 13.5, color: OT.espresso800, lineHeight: 1.5 }}>
          {isUploaded 
            ? 'Numbers look good for your starting point. We\'ll re-test in 8 weeks.'
            : 'Pending your scan upload or in-person evaluation, our coach will add custom notes here.'}
        </div>
      </div>
    </div>
  );
}

function Step4BloodDesktop() {
  const { journey, update } = useJourney();
  const isUploaded = !!journey.bloodUploaded;
  const fileName = journey.bloodFileName || 'BloodPanel_Mar26.pdf';

  const triggerUpload = () => {
    document.getElementById('blood-file-input-desk')?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      update({
        bloodUploaded: true,
        bloodFileName: file.name,
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <input
        type="file"
        id="blood-file-input-desk"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept="image/*,application/pdf"
      />

      <div style={{
        padding: 18, borderRadius: 14, background: OT.paper,
        border: `1px solid ${OT.hairline}`, boxShadow: OT.sh1,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 12, background: OT.sand100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: OT.walnut, flexShrink: 0,
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6"/>
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: OT.fBody, fontWeight: 600, fontSize: 14, color: OT.espresso900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {isUploaded ? fileName : 'No Blood report uploaded'}
          </div>
          <div style={{ fontFamily: OT.fBody, fontSize: 12, color: OT.clay600 }}>
            {isUploaded ? '22 markers · parsed by AI · Online' : 'Upload reports to extract your biomarkers'}
          </div>
        </div>
        <OPill ghost style={{ color: OT.clay600 }} onClick={triggerUpload}>
          {isUploaded ? 'Replace' : 'Upload'}
        </OPill>
      </div>

      {isUploaded ? (
        <div style={{
          padding: '14px 18px', borderRadius: 12,
          background: 'rgba(176,70,58,0.08)', border: `1px solid rgba(176,70,58,0.25)`,
        }}>
          <OMono size={9} color={OT.bad}>4 out of range · 4 healthy</OMono>
          <div style={{ fontFamily: OT.fBody, fontSize: 14, color: OT.espresso900, marginTop: 4, lineHeight: 1.4 }}>
            Vitamin D and HDL deserve attention. LDL trending up.
          </div>
        </div>
      ) : (
        <div style={{
          padding: '16px 20px', background: 'rgba(123,139,111,0.06)',
          border: `1.5px dashed rgba(123,139,111,0.45)`, borderRadius: 12,
          display: 'flex', gap: 12, alignItems: 'flex-start'
        }}>
          <span style={{ fontSize: 22, marginTop: -2 }}>🩸</span>
          <div style={{ fontFamily: OT.fBody, fontSize: 13.5, color: OT.espresso800, lineHeight: 1.55 }}>
            <strong style={{ color: OT.sage500, fontWeight: 'bold' }}>Free Yearly Blood Panel:</strong> Get your comprehensive yearly blood assessment done completely <strong>free of charge</strong> with any minimum 6-month membership plan. Please contact the M3S office to schedule your blood draw.
          </div>
        </div>
      )}

      <div style={{ opacity: isUploaded ? 1 : 0.5 }}>
        <OEyebrow dot={isUploaded ? OT.ochre : OT.clay600}>
          {isUploaded ? 'Biomarker levels' : 'Biomarker levels (Preview once uploaded)'}
        </OEyebrow>
        <div style={{
          marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        }}>
          {BLOOD_PARAMS.map((p) => {
            const displayVal = isUploaded ? p.value : '−−';
            const displayStatus = isUploaded ? p.status : 'ok';
            const mockParam = { ...p, value: isUploaded ? p.value : (p.low + (p.high - p.low) / 2) };
            return (
              <div key={p.name} style={{
                background: OT.paper, border: `1px solid ${OT.hairline}`,
                borderRadius: 12, padding: 14,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontFamily: OT.fBody, fontWeight: 600, fontSize: 13.5, color: OT.espresso900 }}>{p.name}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 20, color: isUploaded ? OT.espresso900 : OT.clay600 }}>{displayVal}</span>
                    <span style={{ fontFamily: OT.fMono, fontSize: 9, letterSpacing: 1, color: OT.clay600, textTransform: 'uppercase' }}>{p.unit}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  {isUploaded ? <StatusDot status={displayStatus} /> : <OMono size={8} color={OT.clay600}>Awaiting Upload</OMono>}
                  <OMono size={8}>Healthy {p.ideal[0]}–{p.ideal[1]}</OMono>
                </div>
                <RangeBar p={mockParam} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Step5MSKDesktop() {
  const { journey, update } = useJourney();
  const isSignedOff = !!journey.mskSignedOff;

  const selectedCoachId = journey.coachId || 'deepika';
  const coach = COACHES.find(c => c.id === selectedCoachId) || COACHES[0];

  const answers = journey.mskAnswers || {};

  const handleSelectAnswer = (key, val) => {
    update({
      mskAnswers: {
        ...answers,
        [key]: val,
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{
        padding: 16, background: OT.sand100, borderRadius: 12, border: `1px solid ${OT.hairline}`,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <CoachAvatar coach={coach} size={48} />
        <div style={{ flex: 1 }}>
          <OMono size={9}>Reviewed by</OMono>
          <div style={{ fontFamily: OT.fBody, fontWeight: 600, fontSize: 14, color: OT.espresso900, marginTop: 2 }}>
            {coach.name} · MSK clinic, {isSignedOff ? 'Apr 26' : 'Awaiting check-in'}
          </div>
        </div>
        <span style={{
          fontFamily: OT.fMono, fontSize: 9.5, letterSpacing: 1.2, textTransform: 'uppercase',
          color: isSignedOff ? OT.ok : OT.clay600, padding: '4px 10px',
          background: isSignedOff ? 'rgba(94,138,94,0.12)' : 'rgba(62,44,28,0.06)', borderRadius: 999,
        }}>{isSignedOff ? 'Signed off' : 'Pending Screen'}</span>
      </div>

      {MSK_QUESTIONS.map((q, i) => (
        <MSKQuestion
          key={i}
          q={q}
          i={i}
          isSignedOff={isSignedOff}
          userVal={answers[q.key]}
          onSelect={(val) => handleSelectAnswer(q.key, val)}
          coachName={coach.name}
        />
      ))}

      <div style={{
        background: isSignedOff ? '#FFF8EE' : OT.sand50,
        border: isSignedOff ? `1px solid ${OT.hairline}` : `1px dashed ${OT.hairlineStrong}`, borderRadius: 14, padding: 18,
      }}>
        <OEyebrow dot={isSignedOff ? OT.ochre : OT.clay600}>Coach's clinical summary</OEyebrow>
        <div style={{
          fontFamily: OT.fBody, fontSize: 14, color: isSignedOff ? OT.espresso800 : OT.clay600,
          marginTop: 10, lineHeight: 1.6,
        }}>
          {isSignedOff ? (
            'Posterior chain & thoracic mobility are the rate-limiters. We\'ll start with 90/90 hip work, loaded carries, and a 10-min thoracic flow before each session. Re-screen at week 6.'
          ) : (
            `No corrective program generated yet. Coach ${coach.name} will compile your joint biomechanics corrections here after your in-studio assessment.`
          )}
        </div>
      </div>
    </div>
  );
}

function Step6SummaryDesktop({ onLogin }) {
  const handle = onLogin || (() => {
    try { localStorage.setItem('m3s.user', JSON.stringify({ name: 'Aanya', phone: '+91 98XXX XXXXX' })); } catch {}
    window.location.href = 'index.html?signed_up=1';
  });

  const p = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('m3s.journey') || '{}');
    } catch {
      return {};
    }
  }, []);

  const hasData = !!(p.bcaUploaded || p.bloodUploaded || p.mskSignedOff);
  const selectedCoachId = p.coachId || 'deepika';
  const coach = COACHES.find(c => c.id === selectedCoachId) || COACHES[0];

  const titleText = hasData ? (
    <>
      Solid base, recoverable gaps. <br/>
      You're <em style={{ color: OT.ochre }}>ahead</em> on metabolic health, <em style={{ color: OT.ochre }}>behind</em> on micronutrients &amp; mobility.
    </>
  ) : (
    <>
      Starting status pending check-in. <br/>
      Awaiting your in-studio <em style={{ color: OT.ochre }}>InBody scan &amp; joint mobility screen</em>.
    </>
  );

  const pathDesc = hasData ? (
    <>
      <strong style={{ color: OT.ochre, fontWeight: 600 }}>16–20 weeks</strong> to visible upper-body hypertrophy, via 4×/wk PT with {coach.name} — block-periodised hypertrophy + thoracic mobility prep.
    </>
  ) : (
    <>
      <strong style={{ color: OT.ochre, fontWeight: 600 }}>Timeline calculated at check-in</strong>. Once you complete your free InBody &amp; joint assessment with Coach {coach.name}, we will map out your exact hypertrophy protocol.
    </>
  );

  const strengths = hasData ? [
    'Healthy fasting glucose &amp; HbA1c',
    'Consistent 3×/wk running base',
    'Visceral fat well within range',
  ] : [
    'Goal priority compiled (' + (p.goal || 'Hypertrophy') + ')',
    'Weekly slot targets scheduled',
    p.runFrequency ? `Steady cardio foundation (${p.runFrequency})` : 'Active cardio ready',
  ];

  const weaknesses = hasData ? [
    'Vitamin D deficient (18 ng/mL)',
    'LDL trending high (148)',
    'Right shoulder OHP-restricted',
    'Posterior chain &amp; thoracic mobility',
  ] : [
    'Awaiting body composition (InBody) scan',
    'Awaiting Blood Panel to screen micronutrients',
    `MSK joint assessment scheduled with Coach ${coach.name}`,
  ];

  const techniques = hasData ? [
    'Block-periodised hypertrophy (4-wk volume → 2-wk intensity)',
    'Pre-session 10-min thoracic + 90/90 hip flow',
    'Substitute landmine / incline press for OHP',
    'Vit D3 5000IU + omega-3 supplementation (post-doctor sign-off)',
    'Re-test bloods &amp; BCA at week 8',
  ] : [
    `Complete free in-studio body composition baseline scan with Chef de MSK ${coach.name}`,
    `Run 12-minute active joint assessment to map corrective mobility protocol`,
    `Refining hypertrophic program block constraints and physical movement range of motion`,
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Fitness score — from onboarding inputs */}
      <div>
        <FitnessScoreSection profile={p} />
      </div>

      <div style={{
        background: OT.espresso900, color: OT.paper,
        borderRadius: 18, padding: 28, boxShadow: OT.sh3, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -50, right: -50, width: 220, height: 220,
          borderRadius: '50%', background: 'rgba(201,154,63,0.18)',
        }} />
        <OMono color="rgba(255,253,248,0.6)" size={9}>Current health status</OMono>
        <h2 style={{
          fontFamily: OT.fDisplay, fontStyle: 'italic', fontWeight: 400,
          fontSize: 36, lineHeight: 1.15, color: OT.paper,
          margin: '10px 0 0', letterSpacing: -0.5, maxWidth: 480,
        }}>
          {titleText}
        </h2>
        <div style={{
          marginTop: 22, padding: '16px 20px', borderRadius: 12,
          background: 'rgba(255,253,248,0.08)', border: `1px solid rgba(255,253,248,0.12)`, maxWidth: 540,
        }}>
          <OMono color="rgba(255,253,248,0.6)" size={9}>Estimated path to goal</OMono>
          <div style={{ fontFamily: OT.fBody, fontSize: 15, color: OT.paper, marginTop: 6, lineHeight: 1.55 }}>
            {pathDesc}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <SWBlock kind="strength" items={strengths} />
        <SWBlock kind="weakness" items={weaknesses} />
      </div>

      <div style={{
        background: OT.paper, border: `1px solid ${OT.hairline}`,
        borderRadius: 14, padding: 18,
      }}>
        <OEyebrow dot={OT.sage}>{hasData ? 'Techniques your coach will use' : 'Pending steps with your coach'}</OEyebrow>
        <ul style={{
          margin: '12px 0 0', padding: '0 0 0 20px',
          fontFamily: OT.fBody, fontSize: 14, color: OT.espresso800, lineHeight: 1.7,
        }}>
          {techniques.map((tech, idx) => (
            <li key={idx}>{tech}</li>
          ))}
        </ul>
      </div>

      {/* 12-week milestones stepper */}
      <MilestonesStepper desktop />

      {/* Sign up — desktop two-col */}
      <div style={{
        background: OT.paper, border: `1px solid ${OT.hairlineStrong}`,
        borderRadius: 18, padding: 24, boxShadow: OT.sh2,
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24,
      }}>
        <div>
          <h3 style={{
            fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 28, lineHeight: 1.15,
            color: OT.espresso900, margin: 0, fontWeight: 400,
          }}>Save this to your profile.</h3>
          <p style={{
            fontFamily: OT.fBody, fontSize: 14, color: OT.clay600,
            margin: '8px 0 0', lineHeight: 1.55,
          }}>Create your account so this baseline lives in your dashboard and updates automatically as your data changes.</p>
        </div>
        <div>
          <button onClick={handle} style={{
            width: '100%', padding: '12px 16px', borderRadius: 10,
            border: `1px solid ${OT.hairlineStrong}`, background: OT.paper,
            fontFamily: OT.fBody, fontSize: 14, fontWeight: 600, color: OT.espresso900,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.6 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8L6.2 32.6C9.5 39.1 16.2 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C40.6 35.5 44 30.2 44 24c0-1.3-.1-2.6-.4-3.9z"/>
            </svg>
            Continue with Google
          </button>
          <div style={{
            margin: '12px 0', display: 'flex', alignItems: 'center', gap: 10,
            fontFamily: OT.fMono, fontSize: 9, letterSpacing: 1.5,
            color: OT.clay600, textTransform: 'uppercase',
          }}>
            <div style={{ flex: 1, height: 1, background: OT.hairline }} /> or <div style={{ flex: 1, height: 1, background: OT.hairline }} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ ...inputStyle, width: 80, textAlign: 'center', flexShrink: 0 }}>+91</div>
            <input placeholder="Phone number" style={{ ...inputStyle, flex: 1 }} />
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: "var(--clay-600)", fontFamily: "var(--f-body)" }}>
            * Please use your WhatsApp number for easier communication.
          </div>
          <button onClick={handle} style={{
            width: '100%', marginTop: 10, padding: '12px 16px', borderRadius: 10,
            border: 'none', background: OT.walnut, color: OT.paper,
            fontFamily: OT.fBody, fontSize: 14, fontWeight: 600, cursor: 'pointer',
            boxShadow: OT.sh2,
          }}>Send OTP</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROTOTYPE RUNTIME — live, full-bleed, mobile + desktop responsive.
// (The DesignCanvas presentation lives only when invoked explicitly via
//  ?canvas=1 on the URL; default is the live prototype.)
// ═══════════════════════════════════════════════════════════════════════════
function buildSteps(onLoginRedirect) {
  return [
    { n: 1, eyebrow: 'Your journey',         title: 'Tell us about your journey.', sub: 'Your goals, history, and the times you can actually train.', mobile: <Step1Journey />, desktop: <Step1JourneyDesktop /> },
    { n: 2, eyebrow: 'Coach match',          title: 'Meet your coach.',            sub: 'Recommended on goal, time slots, and live availability. You can change coach anytime.', mobile: <Step2Coach />, desktop: <Step2CoachDesktop /> },
    { n: 3, eyebrow: 'Body composition',     title: 'Body composition.',           sub: 'Upload a recent InBody, DEXA, or Tanita report — we\'ll extract what matters.', mobile: <Step3BodyComp />, desktop: <Step3BodyCompDesktop /> },
    { n: 4, eyebrow: 'Blood report',         title: 'Blood & lab work.',           sub: 'Upload your most recent panel — we read it and flag what to act on.', mobile: <Step4Blood />, desktop: <Step4BloodDesktop /> },
    { n: 5, eyebrow: 'MSK assessment',       title: 'Movement screen.',            sub: 'Quick answers from you, refined and signed off by your coach.', mobile: <Step5MSK />, desktop: <Step5MSKDesktop /> },
    { n: 6, eyebrow: 'Running',              title: 'Running benchmark.',          sub: 'Your latest 5K and 2K — so we can build conditioning that doesn\'t cannibalise lifting.', mobile: <Step6Running />, desktop: <Step6RunningDesktop /> },
    { n: 7, eyebrow: 'Your starting picture',title: 'Here\'s where you stand.',    sub: 'Generated from everything above. Your coach can refine before it goes to your profile.', mobile: <Step6Summary onLogin={onLoginRedirect} />, desktop: <Step6SummaryDesktop onLogin={onLoginRedirect} /> },
  ];
}

function OnboardingFlowInner() {
  const { journey, step1Errors } = useJourney();

  const finishOnboarding = React.useCallback(async () => {
    try {
      const userName = journey.name || 'Aanya';
      const userPhone = journey.phone || '+91 98XXX XXXXX';
      const clientId = userName.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'aanya';

      // 1. Save core user tokens
      localStorage.setItem('m3s.user', JSON.stringify({ name: userName, phone: userPhone, id: clientId }));
      localStorage.setItem('m3s.active_student_id', clientId);
      localStorage.setItem('m3s.journey', JSON.stringify(journey));
      localStorage.setItem(`m3s.journey.${clientId}`, JSON.stringify(journey));

      // 2. Prepare Client & Assessment records
      const newClient = {
        id: clientId,
        name: userName,
        age: journey.age || '32',
        gender: journey.gender || 'Female',
        phone: userPhone,
        email: userName.toLowerCase().replace(/[^a-z0-9]/g, '') + '@gmail.com',
        assigned_coach_id: journey.coachId || 'lee',
        status: 'Active',
        created_at: new Date().toISOString().split('T')[0]
      };

      const newAssessment = {
        client_id: clientId,
        experience: journey.experience || '6–24 months',
        goal: journey.goal || 'Muscle Gain',
        days_per_week: journey.daysPerWeek || 4,
        injuries: journey.injuries || [],
        running_5k: journey.running5k || '28:40',
        running_2k: journey.running2k || '10:15',
        run_rating: journey.runRating || 6,
        run_frequency: journey.runFrequency || '3x / week'
      };

      const newSession = {
        id: `s_${clientId}_init`,
        coach_id: journey.coachId || 'lee',
        client_id: clientId,
        type: 'PT Session',
        scheduled_at: '2026-06-08T07:00:00', // upcoming session date
        duration_min: 60,
        status: 'upcoming'
      };

      // 3. Save to Localstorage Lists (for offline fallbacks)
      try {
        const localClients = JSON.parse(localStorage.getItem('m3s.clients') || '[]');
        if (!localClients.some(c => c.id === clientId)) {
          localClients.push(newClient);
          localStorage.setItem('m3s.clients', JSON.stringify(localClients));
        }

        const localAssessments = JSON.parse(localStorage.getItem('m3s.assessments') || '[]');
        if (!localAssessments.some(a => a.client_id === clientId)) {
          localAssessments.push(newAssessment);
          localStorage.setItem('m3s.assessments', JSON.stringify(localAssessments));
        }

        const localSessions = JSON.parse(localStorage.getItem('m3s.sessions') || '[]');
        if (!localSessions.some(s => s.id === newSession.id)) {
          localSessions.push(newSession);
          localStorage.setItem('m3s.sessions', JSON.stringify(localSessions));
        }
      } catch (err) {
        console.warn("localStorage list sync err:", err);
      }

      // 4. Save to Firestore Collections
      if (db) {
        try {
          await db.collection('clients').doc(clientId).set(newClient, { merge: true });
          await db.collection('assessments').doc(clientId).set(newAssessment, { merge: true });
          await db.collection('sessions').doc(newSession.id).set(newSession, { merge: true });
        } catch (fErr) {
          console.warn("Firestore sync error:", fErr);
        }
      }
    } catch (e) {
      console.warn("Onboarding finalize error:", e);
    }
    window.location.href = 'index.html?signed_up=1';
  }, [journey]);

  const STEPS_LIVE = React.useMemo(() => buildSteps(finishOnboarding), [finishOnboarding]);

  // Step state — use URL hash so refreshes preserve position; #step=2 etc.
  const [n, setN] = React.useState(() => {
    const m = window.location.hash.match(/step=(\d)/);
    const v = m ? parseInt(m[1], 10) : 1;
    return v >= 1 && v <= 7 ? v : 1;
  });
  React.useEffect(() => {
    window.history.replaceState({}, '', `#step=${n}`);
  }, [n]);

  const [isMobile, setIsMobile] = React.useState(() => typeof window !== 'undefined' && window.innerWidth < 900);
  React.useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const [buffering, setBuffering] = React.useState(false);

  const step = STEPS_LIVE[n - 1];

  const isStep1Invalid = Object.keys(step1Errors || {}).length > 0;
  const isContinueDisabled = n === 1 && isStep1Invalid;

  const onBack = n > 1 ? () => setN(n - 1) : null;
  const onNext = () => {
    if (isContinueDisabled) return; // Safeguard
    // Save partial progress to localStorage after each step's Continue succeeds.
    try {
      localStorage.setItem('m3s.journey', JSON.stringify(journey));
    } catch {}

    if (n === 6) { setBuffering(true); return; }
    if (n < 7) setN(n + 1);
    else finishOnboarding();
  };

  const footerProps = {
    onBack, onNext,
    nextLabel: n === 7 ? 'Done →' : 'Continue →',
    skipLabel: (n === 3 || n === 4 || n === 6) ? 'Skip — I\'ll do this later' : null,
    disabled: isContinueDisabled,
  };

  const onBufferDone = () => { setBuffering(false); setN(7); };

  if (isMobile) {
    return (
      <div style={{ width: '100vw', height: '100vh', background: OT.sand100, overflow: 'hidden' }}>
        <MobileStep step={n} footerProps={footerProps}>
          {step.mobile}
        </MobileStep>
        {buffering && <BufferingScreen onDone={onBufferDone} mobile />}
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: OT.sand50, overflow: 'hidden' }}>
      <DesktopStep
        step={n} eyebrow={step.eyebrow} title={step.title} sub={step.sub}
        footerProps={footerProps}
      >
        {step.desktop}
      </DesktopStep>
      {buffering && <BufferingScreen onDone={onBufferDone} />}
    </div>
  );
}

function OnboardingFlowPrototype() {
  return (
    <JourneyProvider>
      <OnboardingFlowInner />
    </JourneyProvider>
  );
}

// Legacy canvas (preserved for ?canvas=1 — design review only)
function OnboardingFlowCanvas() {
  const STEPS_CANVAS = buildSteps(() => { window.location.href = 'index.html?signed_up=1'; });
  return (
    <DesignCanvas>
      {STEPS_CANVAS.map((s) => (
        <DCSection
          key={s.n}
          id={`step-${s.n}`}
          title={`Step ${s.n} · ${s.eyebrow}`}
          subtitle={`${s.title}  —  Mobile + Desktop`}
        >
          <DCArtboard id={`m${s.n}`} label="Mobile · 375×812" width={375} height={812}>
            <PhoneFrameOnb>
              <MobileStep
                step={s.n}
                footerProps={{
                  nextLabel: s.n === 7 ? 'Done →' : 'Continue →',
                  skipLabel: (s.n === 3 || s.n === 4 || s.n === 6) ? 'Skip — I\'ll do this later' : null,
                }}
              >
                {s.mobile}
              </MobileStep>
            </PhoneFrameOnb>
          </DCArtboard>
          <DCArtboard id={`d${s.n}`} label="Desktop · 1280×800" width={1280} height={800}>
            <BrowserFrameOnb url={`app.mythirdspace.fit/onboarding/${s.n}`}>
              <DesktopStep
                step={s.n}
                eyebrow={s.eyebrow}
                title={s.title}
                sub={s.sub}
                footerProps={{
                  nextLabel: s.n === 7 ? 'Done →' : 'Continue →',
                  skipLabel: (s.n === 3 || s.n === 4 || s.n === 6) ? 'Skip — I\'ll do this later' : null,
                }}
              >
                {s.desktop}
              </DesktopStep>
            </BrowserFrameOnb>
          </DCArtboard>
        </DCSection>
      ))}
    </DesignCanvas>
  );
}

Object.assign(window, { OnboardingFlowCanvas, OnboardingFlowPrototype });

// ═══════════════════════════════════════════════════════════════════════════
// STEP 6 — RUNNING BENCHMARK (mobile + desktop)
// ═══════════════════════════════════════════════════════════════════════════
function RunRatingSlider({ value, onChange }) {
  const labels = ['Couch', 'Beginner', 'Casual', 'Steady', 'Strong', 'Athlete'];
  const idx = Math.min(labels.length - 1, Math.floor((value - 1) / (10 / labels.length)));
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <OEyebrow>How would you rate yourself as a runner?</OEyebrow>
        <div style={{ fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 22, color: OT.espresso900 }}>
          {value}<span style={{ fontSize: 12, color: OT.clay600, marginLeft: 4 }}>/10</span>
        </div>
      </div>
      <input
        type="range" min={1} max={10} step={1} value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        style={{ width: '100%', accentColor: OT.walnut }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
        {labels.map((l, i) => (
          <div key={l} style={{
            fontFamily: OT.fMono, fontSize: 8.5, letterSpacing: 0.8,
            color: i === idx ? OT.walnut : OT.clay600,
            fontWeight: i === idx ? 700 : 500, textTransform: 'uppercase',
          }}>{l}</div>
        ))}
      </div>
    </div>
  );
}

function TimeInput({ label, value, onChange }) {
  return (
    <label style={{ display: 'block' }}>
      <OEyebrow>{label}</OEyebrow>
      <input
        type="text" value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="mm:ss"
        style={{
          ...inputStyle, marginTop: 6, width: '100%',
          fontFamily: OT.fMono, fontSize: 22, letterSpacing: 1.5,
          fontWeight: 500, textAlign: 'center', color: OT.espresso900,
          padding: '14px 12px',
        }}
      />
    </label>
  );
}

function paceFrom(t, distKm) {
  // t = "mm:ss"
  const m = (t || '').match(/^(\d+):(\d+)/);
  if (!m) return null;
  const totalSec = parseInt(m[1], 10) * 60 + parseInt(m[2], 10);
  if (!totalSec || !distKm) return null;
  const perKm = totalSec / distKm;
  const mm = Math.floor(perKm / 60);
  const ss = Math.round(perKm - mm * 60);
  return `${mm}:${String(ss).padStart(2, '0')}/km`;
}

function RunInsightCard({ journey }) {
  const pace5 = paceFrom(journey.running5k, 5);
  const pace2 = paceFrom(journey.running2k, 2);
  return (
    <div style={{
      background: OT.espresso900, color: OT.paper, borderRadius: 14,
      padding: 16, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -30, right: -30, width: 110, height: 110,
        borderRadius: '50%', background: 'rgba(201,154,63,0.18)',
      }} />
      <OMono color="rgba(255,253,248,0.6)" size={9}>AI assessment</OMono>
      <div style={{
        fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: 17, lineHeight: 1.3,
        marginTop: 6, fontWeight: 400, position: 'relative',
      }}>
        Aerobic base is <span style={{ color: OT.ochre }}>solid</span>, top-end is the gap.
        Your 2K pace is only 12 sec/km faster than 5K — we'll add 1× tempo + short
        intervals to lift VO₂ without hurting recovery.
      </div>
      <div style={{
        marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
        position: 'relative',
      }}>
        <div style={{ background: 'rgba(255,253,248,0.08)', padding: 10, borderRadius: 8 }}>
          <OMono color="rgba(255,253,248,0.55)" size={8.5}>5K pace</OMono>
          <div style={{ fontFamily: OT.fMono, fontSize: 14, color: OT.paper, marginTop: 2 }}>{pace5 || '—'}</div>
        </div>
        <div style={{ background: 'rgba(255,253,248,0.08)', padding: 10, borderRadius: 8 }}>
          <OMono color="rgba(255,253,248,0.55)" size={8.5}>2K pace</OMono>
          <div style={{ fontFamily: OT.fMono, fontSize: 14, color: OT.paper, marginTop: 2 }}>{pace2 || '—'}</div>
        </div>
      </div>
    </div>
  );
}

function Step6Running() {
  const { journey, update } = useJourney();
  const freqs = ['Never', '1x / week', '2x / week', '3x / week', '4x+ / week'];
  const submitted = journey.runSubmitted;
  const has5k = !!(journey.running5k || '').match(/^\d+:\d{2}/);
  const has2k = !!(journey.running2k || '').match(/^\d+:\d{2}/);
  const canSubmit = has5k && has2k;
  return (
    <div className="frame-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 18px 24px' }}>
      <StepHeader step={6} eyebrow="Running" title="Running benchmark." subtitle="Your latest 5K and 2K — so we can build conditioning that doesn't cannibalise lifting." />

      <div style={{
        marginTop: 22, padding: 16, background: OT.paper, border: `1px solid ${OT.hairline}`,
        borderRadius: 14,
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <TimeInput label="Latest 5K time" value={journey.running5k} onChange={(v) => update({ running5k: v, runSubmitted: false })} />
          <TimeInput label="Latest 2K time" value={journey.running2k} onChange={(v) => update({ running2k: v, runSubmitted: false })} />
        </div>
        <div style={{ marginTop: 16 }}>
          <RunRatingSlider value={journey.runRating} onChange={(v) => update({ runRating: v, runSubmitted: false })} />
        </div>
        <div style={{ marginTop: 16 }}>
          <OEyebrow>How often do you run currently?</OEyebrow>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {freqs.map(f => {
              const active = journey.runFrequency === f;
              return (
                <button key={f} onClick={() => update({ runFrequency: f, runSubmitted: false })} style={{
                  padding: '8px 12px', borderRadius: 999,
                  border: `1px solid ${active ? OT.walnut : OT.hairlineStrong}`,
                  background: active ? OT.walnut : OT.paper,
                  color: active ? OT.paper : OT.espresso900,
                  fontFamily: OT.fBody, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer',
                }}>{f}</button>
              );
            })}
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <OEyebrow>Any injury or pain to flag?</OEyebrow>
          <textarea
            value={journey.runInjuryNotes}
            onChange={(e) => update({ runInjuryNotes: e.target.value, runSubmitted: false })}
            rows={2}
            placeholder="e.g. Right knee twinges on long runs."
            style={{ ...inputStyle, marginTop: 8, width: '100%', resize: 'none', lineHeight: 1.5, fontFamily: OT.fBody, fontSize: 13 }}
          />
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginTop: 10 }}>
            <input type="checkbox" checked={journey.runInjuryFlag}
              onChange={(e) => update({ runInjuryFlag: e.target.checked, runSubmitted: false })}
              style={{ marginTop: 3, accentColor: OT.walnut }} />
            <div style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.espresso800, lineHeight: 1.4 }}>
              I get knee, shin or foot pain when I run more than once a week.
            </div>
          </label>
        </div>
        <div style={{ marginTop: 16 }}>
          <OEyebrow>What do you want from running?</OEyebrow>
          <textarea
            value={journey.runGoals}
            onChange={(e) => update({ runGoals: e.target.value, runSubmitted: false })}
            rows={2}
            placeholder="e.g. Hit a 22-min 5K by autumn without losing lifting."
            style={{ ...inputStyle, marginTop: 8, width: '100%', resize: 'none', lineHeight: 1.5, fontFamily: OT.fBody, fontSize: 13 }}
          />
        </div>

        <button
          disabled={!canSubmit}
          onClick={() => canSubmit && update({ runSubmitted: true })}
          style={{
            marginTop: 18, width: '100%',
            fontFamily: OT.fBody, fontSize: 13, fontWeight: 600,
            padding: '14px 22px', borderRadius: 999,
            border: 'none',
            background: submitted ? OT.sage : (canSubmit ? OT.walnut : 'rgba(62,44,28,0.18)'),
            color: OT.paper,
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            boxShadow: canSubmit ? OT.sh2 : 'none',
          }}
        >
          {submitted ? '✓ Submitted — regenerate' : 'Submit for AI + coach review'}
        </button>
      </div>

      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {submitted ? <RunInsightCard journey={journey} /> : <RunSubmitEmptyState kind="ai" />}
        {submitted ? <CoachSummaryCard journey={journey} /> : <RunSubmitEmptyState kind="coach" />}
      </div>
    </div>
  );
}

function CoachSummaryCard({ journey }) {
  const selectedCoachId = journey.coachId || 'deepika';
  const coach = COACHES.find(c => c.id === selectedCoachId) || COACHES[0];
  const initials = coach.initials || 'CO';
  const toneBg = COACH_TONE_BG[coach.tone] || '#5E4228';

  return (
    <div style={{
      background: OT.paper, border: `1px solid ${OT.hairline}`,
      borderRadius: 14, padding: 16,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: toneBg, color: OT.paper,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: OT.fMono, fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
          flexShrink: 0,
        }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <OMono size={9}>Coach Assessment · {coach.name}</OMono>
          <div style={{
            fontFamily: OT.fBody, fontSize: 11, color: OT.clay600, marginTop: 1,
          }}>{coach.role} · pending assessment</div>
        </div>
      </div>
      <div style={{
        marginTop: 12, fontFamily: OT.fBody, fontSize: 13.5,
        lineHeight: 1.55, color: OT.espresso800,
      }}>
        Coach {coach.name} will assess your physical and cardiovascular fitness levels during your in-person studio check-in, then add your personalized training notes, velocity limits, and cardiovascular programming. Please refer to your profile for their final notes and customized guidance.
      </div>
      <div style={{
        marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${OT.hairlineStrong}`,
        display: 'flex', gap: 18, flexWrap: 'wrap', opacity: 0.5
      }}>
        <div>
          <OMono size={9}>Run cap</OMono>
          <div style={{ fontFamily: OT.fMono, fontSize: 12, color: OT.espresso900, marginTop: 2 }}>Awaiting check-in</div>
        </div>
        <div>
          <OMono size={9}>Tempo target</OMono>
          <div style={{ fontFamily: OT.fMono, fontSize: 12, color: OT.espresso900, marginTop: 2 }}>Awaiting benchmarks</div>
        </div>
        <div>
          <OMono size={9}>Re-test</OMono>
          <div style={{ fontFamily: OT.fMono, fontSize: 12, color: OT.espresso900, marginTop: 2 }}>Week 8-12</div>
        </div>
      </div>
    </div>
  );
}

function RunSubmitEmptyState({ kind }) {
  const { journey } = useJourney();
  const selectedCoachId = journey.coachId || 'deepika';
  const coach = COACHES.find(c => c.id === selectedCoachId) || COACHES[0];

  // kind: 'ai' | 'plan' | 'coach'
  const copy = {
    ai:    { eyebrow: 'AI assessment',          line: 'Submit your benchmarks to generate a read on your aerobic base + top-end gap.' },
    plan:  { eyebrow: "What we'll do with this", line: "We'll map your running into the lifting plan once you submit." },
    coach: { eyebrow: `Coach assessment · ${coach.name}`, line: `Coach ${coach.name} will assess your aerobic thresholds and compile your training notes here once your benchmarks are in.` },
  }[kind];
  const dotColor = kind === 'ai' ? OT.ochre : (kind === 'coach' ? OT.sage : OT.walnut);
  return (
    <div style={{
      background: OT.paper, border: `1px dashed ${OT.hairlineStrong}`,
      borderRadius: 14, padding: 16,
    }}>
      <OEyebrow dot={dotColor}>{copy.eyebrow}</OEyebrow>
      <div style={{
        marginTop: 8, fontFamily: OT.fBody, fontSize: 13,
        color: OT.clay600, lineHeight: 1.5,
      }}>{copy.line}</div>
    </div>
  );
}

function Step6RunningDesktop() {
  const { journey, update } = useJourney();
  const freqs = ['Never', '1x / week', '2x / week', '3x / week', '4x+ / week'];
  const submitted = journey.runSubmitted;
  const has5k = !!(journey.running5k || '').match(/^\d+:\d{2}/);
  const has2k = !!(journey.running2k || '').match(/^\d+:\d{2}/);
  const canSubmit = has5k && has2k;

  const submitBtnStyle = {
    fontFamily: OT.fBody, fontSize: 13, fontWeight: 600,
    padding: '12px 22px', borderRadius: 999,
    border: 'none',
    background: submitted ? OT.sage : (canSubmit ? OT.walnut : 'rgba(62,44,28,0.18)'),
    color: OT.paper,
    cursor: canSubmit ? 'pointer' : 'not-allowed',
    boxShadow: canSubmit ? OT.sh2 : 'none',
    letterSpacing: 0.1,
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 24 }}>
      <div style={{
        background: OT.paper, border: `1px solid ${OT.hairline}`,
        borderRadius: 18, padding: 24,
      }}>
        <OEyebrow dot={OT.ochre}>Recent benchmarks</OEyebrow>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
          <TimeInput label="Latest 5K" value={journey.running5k} onChange={(v) => update({ running5k: v, runSubmitted: false })} />
          <TimeInput label="Latest 2K" value={journey.running2k} onChange={(v) => update({ running2k: v, runSubmitted: false })} />
        </div>
        <div style={{ marginTop: 22 }}>
          <RunRatingSlider value={journey.runRating} onChange={(v) => update({ runRating: v, runSubmitted: false })} />
        </div>
        <div style={{ marginTop: 22 }}>
          <OEyebrow>Current run frequency</OEyebrow>
          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
            {freqs.map(f => {
              const active = journey.runFrequency === f;
              return (
                <button key={f} onClick={() => update({ runFrequency: f, runSubmitted: false })} style={{
                  padding: '10px 14px', borderRadius: 999,
                  border: `1px solid ${active ? OT.walnut : OT.hairlineStrong}`,
                  background: active ? OT.walnut : OT.paper,
                  color: active ? OT.paper : OT.espresso900,
                  fontFamily: OT.fBody, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                }}>{f}</button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <OEyebrow>Any injury or pain to flag?</OEyebrow>
          <textarea
            value={journey.runInjuryNotes}
            onChange={(e) => update({ runInjuryNotes: e.target.value, runSubmitted: false })}
            rows={2}
            placeholder="e.g. Right knee twinges on long runs; old shin splints from 2023."
            style={{ ...inputStyle, marginTop: 8, width: '100%', resize: 'none', lineHeight: 1.5, fontFamily: OT.fBody, fontSize: 13 }}
          />
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginTop: 10 }}>
            <input type="checkbox" checked={journey.runInjuryFlag}
              onChange={(e) => update({ runInjuryFlag: e.target.checked, runSubmitted: false })}
              style={{ marginTop: 3, accentColor: OT.walnut }} />
            <div style={{ fontFamily: OT.fBody, fontSize: 13, color: OT.espresso800, lineHeight: 1.4 }}>
              I get knee, shin or foot pain when I run more than once a week — flag this for my coach.
            </div>
          </label>
        </div>

        <div style={{ marginTop: 22 }}>
          <OEyebrow>What do you want from running?</OEyebrow>
          <textarea
            value={journey.runGoals}
            onChange={(e) => update({ runGoals: e.target.value, runSubmitted: false })}
            rows={2}
            placeholder="e.g. Keep my 5K under 28:00 without losing lifting progress. Hit a 22-min 5K by autumn."
            style={{ ...inputStyle, marginTop: 8, width: '100%', resize: 'none', lineHeight: 1.5, fontFamily: OT.fBody, fontSize: 13 }}
          />
        </div>

        <div style={{ marginTop: 22, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            disabled={!canSubmit}
            onClick={() => canSubmit && update({ runSubmitted: true })}
            style={submitBtnStyle}
          >
            {submitted ? '✓ Submitted — regenerate' : 'Submit for AI + coach review'}
          </button>
          {!canSubmit && (
            <div style={{ fontFamily: OT.fBody, fontSize: 12, color: OT.clay600 }}>
              Add both 5K and 2K times to submit.
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {submitted ? <RunInsightCard journey={journey} /> : <RunSubmitEmptyState kind="ai" />}
        {submitted ? (
          <div style={{
            background: OT.paper, border: `1px solid ${OT.hairline}`,
            borderRadius: 14, padding: 16,
          }}>
            <OEyebrow dot={OT.sage}>What we'll do with this</OEyebrow>
            <ul style={{
              margin: '10px 0 0', padding: '0 0 0 18px',
              fontFamily: OT.fBody, fontSize: 13, color: OT.espresso800, lineHeight: 1.7,
            }}>
              <li>Pair 1 short run-day with hypertrophy-recovery lifting</li>
              <li>Use 2K pace as VO₂max anchor — re-test month 2</li>
              {(journey.runInjuryFlag || (journey.runInjuryNotes || '').trim())
                ? <li>Auto-flag if shin/knee load exceeds tolerance</li>
                : <li>Hold run frequency at {journey.runFrequency.toLowerCase()} through block 1</li>}
              {(journey.runGoals || '').trim() && (
                <li style={{ color: OT.clay600 }}>
                  Track against your goal: <span style={{ color: OT.espresso900 }}>“{journey.runGoals.trim()}”</span>
                </li>
              )}
            </ul>
          </div>
        ) : <RunSubmitEmptyState kind="plan" />}
        {submitted ? <CoachSummaryCard journey={journey} /> : <RunSubmitEmptyState kind="coach" />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAN-GENERATION BUFFER (between step 6 and step 7)
// ═══════════════════════════════════════════════════════════════════════════
function BufferingScreen({ onDone, mobile }) {
  const captions = [
    'Reading your blood report…',
    'Mapping body composition deltas…',
    'Cross-referencing your MSK screen…',
    'Sequencing your hypertrophy blocks…',
    'Aligning run pace with recovery…',
    'Drafting milestones for your coach to review…',
  ];
  const [i, setI] = React.useState(0);
  const [done, setDone] = React.useState([]);
  React.useEffect(() => {
    const ticks = captions.map((_, idx) => setTimeout(() => {
      setI(idx);
      setDone(d => [...d, idx]);
    }, 600 + idx * 700));
    const finish = setTimeout(onDone, 600 + captions.length * 700 + 600);
    return () => { ticks.forEach(clearTimeout); clearTimeout(finish); };
  }, []);
  return (
    <div style={{
      position: 'fixed', inset: 0, background: OT.espresso900, color: OT.paper,
      zIndex: 1000, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: mobile ? 24 : 48,
    }}>
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,154,63,0.32) 0%, rgba(201,154,63,0) 70%)',
        animation: 'm3sPulse 2.4s ease-in-out infinite',
      }} />
      <style>{`@keyframes m3sPulse { 0%,100% { opacity: 0.6; transform: translateX(-50%) scale(1); } 50% { opacity: 1; transform: translateX(-50%) scale(1.08); } }`}</style>
      <M3SLogo size="lg" />
      <div style={{
        fontFamily: OT.fMono, fontSize: 10, letterSpacing: 1.5,
        color: 'rgba(255,253,248,0.5)', textTransform: 'uppercase', marginTop: 18,
      }}>Generating your starting picture</div>
      <div style={{
        fontFamily: OT.fDisplay, fontStyle: 'italic', fontSize: mobile ? 24 : 32,
        lineHeight: 1.2, color: OT.paper, marginTop: 12, textAlign: 'center', maxWidth: 520,
      }}>
        Synthesising your data into a 3-month plan.
      </div>
      <div style={{ marginTop: 28, width: '100%', maxWidth: 380 }}>
        {captions.map((c, idx) => {
          const isDone = done.includes(idx);
          const isCurrent = i === idx && !isDone;
          return (
            <div key={c} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 0', fontFamily: OT.fBody, fontSize: 13,
              color: isDone ? OT.paper : (isCurrent ? OT.ochre : 'rgba(255,253,248,0.4)'),
              transition: 'color 0.3s',
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                border: `1.5px solid ${isDone ? OT.ochre : 'rgba(255,253,248,0.3)'}`,
                background: isDone ? OT.ochre : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {isDone && (
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6.5L4.5 9L10 3" stroke={OT.espresso900} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <span>{c}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MILESTONES STEPPER (in summary)
// ═══════════════════════════════════════════════════════════════════════════
const MILESTONES = [
  { wk: 'Week 0',  label: 'Baseline',      detail: 'Bloods, BCA, MSK locked. Plan signed off by Lee.' },
  { wk: 'Week 4',  label: 'Volume base',   detail: 'Hit 12 sets/wk on chest+back. Vit D 30+. OHP-free.' },
  { wk: 'Week 8',  label: 'Re-test',       detail: 'Repeat bloods + BCA. LDL trending down. Body fat −1.5%.' },
  { wk: 'Week 12', label: 'Visible delta', detail: 'Upper-body hypertrophy visible. 5K pace ↓ 30 sec/km.' },
];

function MilestonesStepper({ desktop }) {
  const { journey } = useJourney();
  const selectedCoachId = journey.coachId || 'deepika';
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
    <div style={{
      marginTop: 16, background: OT.paper, border: `1px solid ${OT.hairline}`,
      borderRadius: 14, padding: 16,
    }}>
      <OEyebrow dot={OT.ochre}>Your 12-week milestones</OEyebrow>
      <div style={{
        marginTop: 14,
        display: desktop ? 'grid' : 'flex',
        gridTemplateColumns: desktop ? 'repeat(4, 1fr)' : undefined,
        flexDirection: desktop ? undefined : 'column',
        gap: desktop ? 0 : 0,
        position: 'relative',
      }}>
        {/* Connector */}
        {desktop ? (
          <div style={{
            position: 'absolute', top: 11, left: '12.5%', right: '12.5%',
            height: 2, background: OT.hairline, zIndex: 0,
          }} />
        ) : null}
        {dynamicMilestones.map((m, i) => (
          <div key={m.wk} style={{
            display: 'flex', flexDirection: desktop ? 'column' : 'row',
            gap: desktop ? 0 : 12, position: 'relative',
            paddingLeft: desktop ? 0 : 0, padding: desktop ? '0 8px' : '4px 0',
          }}>
            {/* Vertical connector for mobile */}
            {!desktop && i < MILESTONES.length - 1 && (
              <div style={{
                position: 'absolute', left: 11, top: 24, bottom: -4,
                width: 2, background: OT.hairline,
              }} />
            )}
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: i === 0 ? OT.walnut : OT.paper,
              border: `2px solid ${i === 0 ? OT.walnut : OT.hairlineStrong}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: i === 0 ? OT.paper : OT.clay600,
              fontFamily: OT.fMono, fontSize: 10, fontWeight: 700,
              flexShrink: 0, alignSelf: desktop ? 'center' : 'flex-start',
              marginBottom: desktop ? 8 : 0, zIndex: 1,
            }}>
              {i === 0 ? (
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6.5L4.5 9L10 3" stroke={OT.paper} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (i + 1)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: OT.fMono, fontSize: 9.5, letterSpacing: 1.4,
                color: OT.clay600, textTransform: 'uppercase',
              }}>{m.wk}</div>
              <div style={{
                fontFamily: OT.fBody, fontSize: 13, fontWeight: 600,
                color: OT.espresso900, marginTop: 2,
              }}>{m.label}</div>
              <div style={{
                fontFamily: OT.fBody, fontSize: 11.5, color: OT.clay600,
                marginTop: 4, lineHeight: 1.45,
              }}>{m.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { Step6Running, Step6RunningDesktop, BufferingScreen, MilestonesStepper });
