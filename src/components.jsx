import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TRAINERS, PT_TRAINERS, IG_POSTS, KENKO_MENU, KENKO_CONFIG, BCA_HISTORY, CONTACT, SERVICES, BOOKING_DAYS, TESTIMONIALS } from "./data.js";
import { Placeholder } from "./placeholders.jsx";
// Shared UI atoms for My Third Space


// ---------- Logo ----------
function M3SLogo({ size = 36, color = "currentColor" }) {
  const isLight = color.includes("sand") || color.includes("paper");
  // The logo PNG already contains the "M3S · MY THIRD SPACE" lockup.
  // Use it directly as a wordmark; aspect ratio ~679:357 (~1.9:1).
  return (
    <a href="index.html" style={{ display: "inline-flex", alignItems: "center", color, lineHeight: 0, textDecoration: "none" }} aria-label="My Third Space — home">
      <img referrerPolicy="no-referrer" 
        src="assets/mts-logo.png"
        alt="My Third Space"
        style={{
          height: size * 1.5,
          width: "auto",
          objectFit: "contain",
          display: "block",
          filter: isLight
            ? "none"
            : "brightness(0) saturate(100%) invert(20%) sepia(40%) saturate(850%) hue-rotate(355deg) brightness(85%) contrast(95%)",
          opacity: isLight ? 0.95 : 1,
        }}
      />
    </a>
  );
}

// ---------- Button ----------
function Btn({ children, variant = "primary", size = "md", onClick, style, disabled, as = "button", href, icon }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 8,
    fontFamily: "var(--f-body)", fontWeight: 500,
    border: "1px solid transparent", cursor: disabled ? "not-allowed" : "pointer",
    borderRadius: "var(--r-pill)",
    transition: "all .2s ease",
    opacity: disabled ? 0.5 : 1,
    textDecoration: "none",
    whiteSpace: "nowrap",
  };
  const sizes = {
    sm: { padding: "8px 16px", fontSize: 13 },
    md: { padding: "12px 22px", fontSize: 14 },
    lg: { padding: "16px 32px", fontSize: 15 },
  };
  const variants = {
    primary: { background: "var(--walnut-700)", color: "var(--paper)", borderColor: "var(--walnut-700)" },
    secondary: { background: "transparent", color: "var(--walnut-700)", borderColor: "var(--walnut-700)" },
    ghost: { background: "transparent", color: "var(--walnut-700)", borderColor: "transparent" },
    sage: { background: "var(--sage-500)", color: "var(--paper)", borderColor: "var(--sage-500)" },
    terra: { background: "var(--terracotta-500)", color: "var(--paper)", borderColor: "var(--terracotta-500)" },
  };
  const Tag = as === "a" ? "a" : "button";
  return (
    <Tag
      href={href}
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.transform = "translateY(-1px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      {children}{icon}
    </Tag>
  );
}

// ---------- Chip ----------
function Chip({ children, tone = "sand", active, onClick }) {
  const tones = {
    sand: { bg: "var(--sand-100)", fg: "var(--walnut-700)", border: "var(--hairline)" },
    sage: { bg: "var(--sage-200)", fg: "#4a5a41", border: "rgba(123,139,111,0.35)" },
    terra: { bg: "var(--terracotta-200)", fg: "#7a3f26", border: "rgba(184,107,75,0.35)" },
  };
  const t = tones[tone];
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 1, textTransform: "uppercase",
        padding: "6px 12px", borderRadius: "var(--r-pill)",
        background: active ? "var(--walnut-700)" : t.bg,
        color: active ? "var(--paper)" : t.fg,
        border: `1px solid ${active ? "var(--walnut-700)" : t.border}`,
        cursor: onClick ? "pointer" : "default",
      }}
    >{children}</button>
  );
}

// ---------- Section wrappers ----------
function Section({ children, id, bg = "var(--sand-50)", pad = "0 0 72px", style }) {
  return (
    <section id={id} style={{ background: bg, padding: pad, scrollMarginTop: 0, ...style }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "18px 32px 0" }}>
        {children}
      </div>
    </section>
  );
}

function EyebrowTitle({ eyebrow, title, lead, align = "left", color = "var(--walnut-700)" }) {
  return (
    <div style={{ textAlign: align, maxWidth: align === "center" ? 760 : undefined, margin: align === "center" ? "0 auto" : undefined }}>
      {eyebrow && (
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 12, letterSpacing: 2.5, textTransform: "uppercase", color: "var(--clay-600)", marginBottom: 20 }}>
          — {eyebrow}
        </div>
      )}
      <h2 style={{
        fontFamily: "var(--f-display)", fontWeight: 400,
        fontSize: "clamp(38px, 5vw, 68px)", lineHeight: 1.02, letterSpacing: -0.5,
        color, margin: 0,
      }}>{title}</h2>
      {lead && (
        <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--espresso-800)", opacity: 0.8, marginTop: 20, maxWidth: 620 }}>
          {lead}
        </p>
      )}
    </div>
  );
}

// ---------- Card ----------
function Card({ children, tone = "paper", style, onClick, hoverable }) {
  const tones = {
    paper: { bg: "var(--paper)", fg: "var(--ink)", border: "var(--hairline)" },
    sand: { bg: "var(--sand-100)", fg: "var(--ink)", border: "var(--hairline)" },
    walnut: { bg: "var(--walnut-700)", fg: "var(--paper)", border: "transparent" },
    sage: { bg: "var(--sage-500)", fg: "var(--paper)", border: "transparent" },
    terra: { bg: "var(--terracotta-500)", fg: "var(--paper)", border: "transparent" },
    espresso: { bg: "var(--espresso-800)", fg: "var(--paper)", border: "transparent" },
  };
  const t = tones[tone];
  const [hover, setHover] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: t.bg, color: t.fg,
        border: `1px solid ${t.border}`,
        borderRadius: "var(--r-lg)",
        padding: 28,
        boxShadow: hoverable && hover ? "var(--sh-3)" : "var(--sh-1)",
        transform: hoverable && hover ? "translateY(-4px)" : "none",
        transition: "all .25s ease",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >{children}</div>
  );
}

// ---------- Divider ----------
function Hairline({ label, style }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, ...style }}>
      <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
      {label && (
        <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--clay-600)" }}>{label}</span>
      )}
      <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
    </div>
  );
}

// ---------- Icon (line) ----------
function Icon({ name, size = 22, color = "currentColor", strokeWidth = 1.5 }) {
  const paths = {
    heart: "M12 21s-7-4.5-7-11a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 6.5-7 11-7 11z",
    leaf: "M5 19c7 1 14-5 14-14-7 0-14 5-14 14zM5 19c2-4 6-8 10-10",
    calendar: "M3 7h18v13H3zM3 7l0-3M21 7l0-3M8 3v4M16 3v4M3 11h18",
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20c0-4 4-6 8-6s8 2 8 6",
    arrow: "M5 12h14M13 6l6 6-6 6",
    check: "M5 12l5 5L20 7",
    clock: "M12 21a9 9 0 1 1 0-18 9 9 0 0 1 0 18zM12 7v5l3 2",
    moon: "M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z",
    flame: "M12 3s6 6 6 11a6 6 0 0 1-12 0c0-2 1-3 2-4-1-2 0-5 4-7zM12 21a3 3 0 0 1-3-3c0-2 3-4 3-4s3 2 3 4a3 3 0 0 1-3 3z",
    dumbbell: "M3 10v4M7 7v10M17 7v10M21 10v4M7 12h10",
    sparkle: "M12 3v6M12 15v6M3 12h6M15 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4",
    phone: "M5 3h4l2 5-3 2a11 11 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z",
    mail: "M3 6h18v12H3zM3 6l9 7 9-7",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={paths[name] || paths.sparkle} />
    </svg>
  );
}



// Hero, About, Founder, Services, Testimonials sections


// — Nav icons (inline SVG, currentColor) ————————————————————————
// All icons: 24×24 viewBox, 1.5px stroke, round caps/joins, no fill (matches
// the editorial line style of the existing <Icon /> set in ui.jsx).
const NavIcon = {
  home: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 10.8 12 4l8.5 6.8V19a1.5 1.5 0 0 1-1.5 1.5h-4V14h-6v6.5H5A1.5 1.5 0 0 1 3.5 19v-8.2z"/>
    </svg>
  ),
  // About / "What is M3S" — three overlapping circles, the third-space mark.
  about: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8.4" cy="10" r="4.6"/>
      <circle cx="15.6" cy="10" r="4.6"/>
      <circle cx="12" cy="15.4" r="4.6"/>
    </svg>
  ),
  // Founder / "Shwe" — a single person bust inside a soft frame (distinct from `trainers`, which is multiple).
  founder: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9.2" r="3.2"/>
      <path d="M5.8 20c.7-3.4 3.2-5.1 6.2-5.1s5.5 1.7 6.2 5.1"/>
      <path d="M3.5 12a8.5 8.5 0 1 1 17 0"/>
    </svg>
  ),
  services: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6.5h12M8 12h12M8 17.5h12"/>
      <circle cx="4.2" cy="6.5" r="1.1"/><circle cx="4.2" cy="12" r="1.1"/><circle cx="4.2" cy="17.5" r="1.1"/>
    </svg>
  ),
  trainers: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="8.2" r="3"/>
      <path d="M3.4 19c.6-3 3-4.5 5.6-4.5s5 1.5 5.6 4.5"/>
      <circle cx="16.6" cy="6.4" r="2.3"/>
      <path d="M15 14.4c.6-.7 1.5-1 2-1 2.1 0 3.8 1.3 4.3 3.1"/>
    </svg>
  ),
  book: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5"/>
      <path d="M3.5 10h17M8 3.5v4M16 3.5v4"/>
      <circle cx="12" cy="15" r="1.4" fill="currentColor" stroke="none"/>
    </svg>
  ),
  // Kenko — a bowl with steam (cafe / food side of the studio).
  kenko: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12.5h18a8.4 8.4 0 0 1-8.4 7H11.4A8.4 8.4 0 0 1 3 12.5z"/>
      <path d="M9 4.5c-.8 1 -.8 2 0 3M12 4c-.8 1 -.8 2 0 3M15 4.5c-.8 1 -.8 2 0 3"/>
    </svg>
  ),
  // Social — speech bubble.
  social: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.5 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.6A8 8 0 1 1 20.5 12z"/>
    </svg>
  ),
  user: (s = 22) => (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="9" r="3.5"/><path d="M5.5 19c1-3 3.5-4.5 6.5-4.5s5.5 1.5 6.5 4.5"/>
    </svg>
  ),
};

const NAV_ITEMS = [
  { id: "home",     label: "Home",     icon: NavIcon.home },
  { id: "about",    label: "About",    icon: NavIcon.about },
  { id: "founder",  label: "Shwe",     icon: NavIcon.founder },
  { id: "services", label: "Services", icon: NavIcon.services },
  { id: "trainers", label: "Trainers", icon: NavIcon.trainers },
  { id: "book",     label: "Book",     icon: NavIcon.book },
  { id: "kenko",    label: "Kenko",    icon: NavIcon.kenko },
  { id: "social",   label: "Social",   icon: NavIcon.social },
];

function ProfileMenu({ user, onMyProfile, onSignOut, onSignIn }) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef(null);
  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  if (!user) {
    return (
      <button onClick={onSignIn} style={{
        background: "transparent", border: "1px solid var(--hairline-strong)",
        padding: "8px 14px", borderRadius: "var(--r-pill)", cursor: "pointer",
        fontFamily: "var(--f-body)", fontSize: 13, fontWeight: 600, color: "var(--walnut-700)",
        whiteSpace: "nowrap",
      }}>Sign in</button>
    );
  }

  const initials = (user.name || "U").trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={() => setOpen(v => !v)} aria-label="Profile menu" style={{
        width: 38, height: 38, borderRadius: "50%",
        background: "var(--espresso-900)", color: "var(--paper)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--f-body)", fontSize: 13, fontWeight: 700,
        border: "none", cursor: "pointer", letterSpacing: 0.4,
        boxShadow: "var(--sh-1)",
      }}>{initials}</button>

      {open && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 10px)", zIndex: 100,
          background: "var(--paper)", border: "1px solid var(--hairline-strong)",
          borderRadius: 14, boxShadow: "var(--sh-3)",
          minWidth: 240, padding: 8, fontFamily: "var(--f-body)",
        }}>
          {/* User block */}
          <div style={{ padding: "10px 12px 12px", borderBottom: "1px solid var(--hairline)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--espresso-900)" }}>{user.name}</div>
            <div style={{ fontSize: 11.5, color: "var(--clay-600)", marginTop: 2, fontFamily: "var(--f-mono)", letterSpacing: 0.4 }}>
              {user.phone || user.email || "Member"}
            </div>
          </div>
          <button onClick={() => { setOpen(false); onMyProfile(); }} style={menuItemStyle}>
            <span style={{ display: "inline-flex" }}>{NavIcon.user(16)}</span> My profile
          </button>
          <button onClick={() => { setOpen(false); onSignOut(); }} style={{ ...menuItemStyle, color: "var(--clay-600)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg> Sign out
          </button>
        </div>
      )}
    </div>
  );
}

const menuItemStyle = {
  display: "flex", alignItems: "center", gap: 10,
  width: "100%", textAlign: "left",
  padding: "10px 12px", border: "none", background: "transparent",
  fontFamily: "var(--f-body)", fontSize: 13.5, color: "var(--espresso-900)",
  cursor: "pointer", borderRadius: 8,
};

function Nav({ active, onNav, onBook, user, onSignIn, onSignOut, onMyProfile }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 960);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 960);
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener("resize", onResize); window.removeEventListener("scroll", onScroll); };
  }, []);

  const navBg = scrolled ? "rgba(251,247,240,0.94)" : "rgba(251,247,240,0.82)";
  const navBorder = scrolled ? "1px solid var(--hairline)" : "1px solid transparent";

  return (
    <>
    {/* DESKTOP: top nav — logo + icon-only center + profile/CTA right. Sticky, always visible. */}
    {/* MOBILE: top bar — logo + Book + profile avatar. Always visible. */}
    <nav style={{
      position: "sticky", top: 0, zIndex: 50,
      background: navBg,
      backdropFilter: "saturate(140%) blur(14px)",
      WebkitBackdropFilter: "saturate(140%) blur(14px)",
      borderBottom: navBorder,
      transition: "background .2s ease, border-color .2s ease",
    }}>
      <div style={{
        maxWidth: 1240, margin: "0 auto",
        padding: isMobile ? "12px 18px" : "16px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      }}>
        <M3SLogo size={isMobile ? 28 : 34} color="var(--walnut-700)" />

        {/* Desktop center: icon + label nav */}
        {!isMobile && (
          <div style={{
            display: "flex", gap: 2, alignItems: "stretch",
            background: "var(--sand-100)", padding: 6, borderRadius: 18,
            border: "1px solid var(--hairline)",
          }}>
            {NAV_ITEMS.map((it) => {
              const isActive = active === it.id;
              return (
                <button key={it.id}
                  onClick={() => onNav(it.id)}
                  aria-label={it.label}
                  style={{
                    minWidth: 56, padding: "6px 9px 5px",
                    border: "none", borderRadius: 12,
                    background: isActive ? "var(--paper)" : "transparent",
                    color: isActive ? "var(--walnut-700)" : "var(--espresso-800)",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                    cursor: "pointer",
                    boxShadow: isActive ? "var(--sh-1)" : "none",
                    transition: "all .15s",
                  }}
                >
                  {it.icon(20)}
                  <span style={{
                    fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1.3,
                    textTransform: "uppercase", fontWeight: isActive ? 600 : 500,
                    lineHeight: 1,
                  }}>{it.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Right cluster */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {!isMobile && (
            <Btn size="sm" onClick={onBook} icon={<Icon name="arrow" size={14} color="currentColor" />}>Book a Session</Btn>
          )}
          {isMobile && (
            <button onClick={onBook} style={{
              border: "1px solid var(--walnut-700)",
              background: "var(--walnut-700)", color: "var(--paper)",
              padding: "8px 14px", borderRadius: "var(--r-pill)", cursor: "pointer",
              fontFamily: "var(--f-body)", fontSize: 12.5, fontWeight: 600,
              letterSpacing: 0.2, whiteSpace: "nowrap",
            }}>Book</button>
          )}
          <ProfileMenu user={user} onSignIn={onSignIn} onSignOut={onSignOut} onMyProfile={onMyProfile} />
        </div>
      </div>
    </nav>

    {/* MOBILE bottom nav — fixed, icons + label, always visible */}
    {isMobile && <MobileBottomNav active={active} onNav={onNav} />}
    </>
  );
}

function MobileBottomNav({ active, onNav }) {
  return (
    <div style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 49,
      background: "rgba(251,247,240,0.96)",
      backdropFilter: "saturate(140%) blur(14px)",
      WebkitBackdropFilter: "saturate(140%) blur(14px)",
      borderTop: "1px solid var(--hairline)",
      boxShadow: "0 -4px 16px rgba(62,44,28,0.06)",
      display: "flex", alignItems: "stretch",
      paddingBottom: "env(safe-area-inset-bottom, 8px)",
      paddingTop: 6,
    }}>
      {NAV_ITEMS.map((it) => {
        const isActive = active === it.id;
        const color = isActive ? "var(--walnut-700)" : "var(--clay-600)";
        return (
          <button key={it.id}
            onClick={() => onNav(it.id)}
            style={{
              flex: 1, minWidth: 0,
              border: "none", background: "transparent",
              padding: "6px 2px 10px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              cursor: "pointer", color, position: "relative",
              opacity: isActive ? 1 : 0.75,
            }}
          >
            {isActive && (
              <span style={{
                position: "absolute", top: 0, width: 22, height: 2,
                background: "var(--walnut-700)", borderRadius: 2,
              }} />
            )}
            {it.icon(20)}
            <span style={{
              fontFamily: "var(--f-mono)", fontSize: "7px", letterSpacing: "-0.2px",
              textTransform: "uppercase", fontWeight: 500,
              textAlign: "center", width: "100%", display: "block",
              whiteSpace: "nowrap",
              padding: "0 1px",
            }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function AnimatedCounter({ value, delay = 0 }) {
  const nodeRef = useRef(null);
  
  useEffect(() => {
    const match = String(value).match(/^(\D*)(\d+)(\D*)$/);
    if (!match) {
      if (nodeRef.current) nodeRef.current.textContent = value;
      return;
    }
    const [, pre, numStr, post] = match;
    const end = parseInt(numStr, 10);
    
    let startTime = null;
    let animationFrame;
    const duration = 1500; 
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const current = Math.min(progress / duration, 1);
      
      const ease = current === 1 ? 1 : 1 - Math.pow(2, -10 * current);
      const currentNum = Math.floor(ease * end);
      
      if (nodeRef.current) {
        nodeRef.current.textContent = `${pre}${currentNum}${post}`;
      }
      
      if (current < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    const timeout = setTimeout(() => {
      if (nodeRef.current) {
        animationFrame = requestAnimationFrame(animate);
      }
    }, delay * 1000);
    
    return () => {
      clearTimeout(timeout);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [value, delay]);

  const match = String(value).match(/^(\D*)(\d+)(\D*)$/);
  const initialValue = match ? `${match[1]}0${match[3]}` : value;

  return <span ref={nodeRef}>{initialValue}</span>;
}

function Hero({ onExplore, onBook, onGetStarted, isLoggedIn = false, variant = "third-space" }) {
  // Default routing: logged out → onboarding, logged in → dashboard.
  // Parent can override via onGetStarted prop.
  onGetStarted = onGetStarted || (() => {
    if (isLoggedIn) console.log("[route] → /dashboard");
    else console.log("[route] → /onboarding");
  });

  const [index, setIndex] = useState(0);
  const terms = ["Health club.", "Fitness Studio.", "My Third Space."];

  useEffect(() => {
    if (variant !== "third-space") return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % terms.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [variant]);

  const variants = {
    "third-space": { pre: "Home, work," },
    "future-self": { pre: "Train for your", em: "future self." },
    "welcome":     { pre: "Welcome to", em: "my third space." },
  };
  const v = variants[variant] || variants["third-space"];
  const stats = [
    { v: "11", l: "Coaches, each certified" },
    { v: "<20", l: "Members per class" },
    { v: "110+", l: "Hyrox finishers so far" },
    { v: "400+", l: "Members, growing slowly on purpose" },
  ];
  return (
    <section id="home" style={{ position: "relative", padding: "28px 32px 40px", minHeight: "calc(100vh - 80px)", display: "flex", flexDirection: "column" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroImageReveal {
          from { opacity: 0; transform: scale(0.97) translateY(12px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}} />
      <div style={{ maxWidth: 1320, margin: "0 auto", width: "100%", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Eyebrow row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16, opacity: 0, animation: "heroFadeUp 0.5s ease-out forwards" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: "var(--clay-600)" }}>
            Indiranagar · Bengaluru
          </div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: "var(--clay-600)" }}>
            Open today · 5:30 AM – 9:30 PM
          </div>
        </div>

        {/* Headline + image side-by-side */}
        <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 48, alignItems: "stretch", flex: 1, minHeight: 0 }}>
          {/* Left column: heading, copy, CTAs */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", paddingBottom: 8 }}>
            <h1 style={{
              fontFamily: "var(--f-display)", fontWeight: 400,
              fontSize: "clamp(56px, 7.2vw, 116px)", lineHeight: 0.95, letterSpacing: -2,
              color: "var(--espresso-900)", margin: 0,
              opacity: 0, animation: "heroFadeUp 0.5s ease-out 0.1s forwards"
            }}>
              {v.pre}<br />
              {variant === "third-space" ? (
                <span style={{ display: "inline-grid" }}>
                  <AnimatePresence mode="popLayout">
                    <motion.em
                      key={index}
                      initial={{ opacity: 0, y: 30, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -30, filter: "blur(4px)" }}
                      transition={{ duration: 0.5, ease: "anticipate" }}
                      style={{ fontStyle: "italic", color: "var(--walnut-700)", gridArea: "1 / 1 / 2 / 2" }}
                    >
                      {terms[index]}
                    </motion.em>
                  </AnimatePresence>
                </span>
              ) : (
                <em style={{ fontStyle: "italic", color: "var(--walnut-700)" }}>{v.em}</em>
              )}
            </h1>
            <p style={{ fontSize: 18, lineHeight: 1.55, color: "var(--espresso-800)", margin: "28px 0 0", maxWidth: 440, opacity: 0, animation: "heroFadeUp 0.5s ease-out 0.2s forwards" }}>
              A holistic studio in the quiet middle of your week — where movement, breath, and measurement meet.
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap", alignItems: "center", opacity: 0, animation: "heroFadeUp 0.5s ease-out 0.3s forwards" }}>
              <Btn onClick={onBook}>Book a session</Btn>
              <Btn variant="secondary" onClick={onGetStarted}>
                Get started →
              </Btn>
            </div>
          </div>

          {/* Right column: hero image — soft rounded corners, no border, full opacity */}
          <div style={{ position: "relative", minHeight: 460, alignSelf: "stretch", borderRadius: 28, overflow: "hidden", opacity: 0, animation: "heroImageReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards" }}>
            <img referrerPolicy="no-referrer" 
              src="assets/hero-studio-vertical.jpg"
              alt="M3S studio interior — the runway"
              style={{
                position: "absolute", inset: 0, width: "100%", height: "100%",
                objectFit: "cover", display: "block",
              }}
            />
            {/* Soft bottom gradient for caption legibility */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(30,20,14,0) 55%, rgba(30,20,14,0.7))", pointerEvents: "none" }} />
            <div style={{ position: "absolute", left: 28, right: 28, bottom: 24, color: "var(--paper)" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", opacity: 0.85 }}>The Studio</div>
              <div style={{ fontFamily: "var(--f-display)", fontSize: "clamp(20px, 2.2vw, 30px)", lineHeight: 1.1, marginTop: 6, maxWidth: 360 }}>
                3,200 sqft. Natural light. No mirrors on the ceiling.
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats strip — kept inside first fold */}
        <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, borderTop: "1px solid var(--hairline)", paddingTop: 20 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ opacity: 0, animation: `heroFadeUp 0.5s ease-out ${0.4 + i*0.1}s forwards` }}>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 44, lineHeight: 1, color: "var(--walnut-700)" }}>
                <AnimatedCounter value={s.v} delay={0.4 + i*0.1} />
              </div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: 1.2, color: "var(--clay-600)", marginTop: 8, textTransform: "uppercase" }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutM3S() {
  const pillars = [
    { icon: "dumbbell", title: "Move", body: "Strength, mobility, and cardio programmed like medicine — dosed for your goals, not the algorithm." },
    { icon: "leaf", title: "Nourish", body: "Blood panels, body composition, and a registered dietitian translating data to dinner." },
    { icon: "moon", title: "Rest", body: "Sauna, plunge, sleep coaching, and breathwork. Recovery you can schedule, not just hope for." },
    { icon: "sparkle", title: "Learn", body: "Workshops with visiting practitioners — dance, gymnastics, martial arts — so you never plateau." },
  ];
  return (
    <Section id="about" bg="var(--sand-100)">
      <div className="m3s-about-grid">
        <div className="m3s-about-sticky">
          <EyebrowTitle
            eyebrow="What is M3S"
            title={<>A third space, by design.</>}
            lead="Not your home. Not your office. A studio built for the hours that actually change how you feel — movement, measurement, and recovery under one vaulted roof."
          />
          <div style={{ marginTop: 32, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Chip tone="sage">Holistic</Chip>
            <Chip tone="terra">Evidence-led</Chip>
            <Chip>Slow growth</Chip>
            <Chip tone="sage">Coach-owned</Chip>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}>
          {pillars.map((p, i) => (
            <Card key={i} tone={i === 0 ? "walnut" : i === 2 ? "espresso" : "paper"} hoverable style={{ padding: 32, minHeight: 240 }}>
              <Icon name={p.icon} size={28} color={i === 0 || i === 2 ? "var(--sand-200)" : "var(--walnut-700)"} />
              <div style={{ fontFamily: "var(--f-display)", fontSize: 36, marginTop: 24, lineHeight: 1 }}>{p.title}</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, marginTop: 14, opacity: 0.9 }}>{p.body}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, opacity: 0.5, marginTop: 24 }}>0{i + 1} / 04</div>
            </Card>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Founder() {
  return (
    <Section id="founder" bg="var(--sand-50)">
      <div className="m3s-founder-grid" style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 80, alignItems: "center" }}>
        <div className="m3s-founder-img-wrap" style={{ position: "relative" }}>
          <div style={{ borderRadius: "var(--r-lg)", overflow: "hidden", aspectRatio: "4/5", border: "1px solid var(--hairline)" }}>
            <img referrerPolicy="no-referrer" src="assets/shwetambari.png" alt="Shwetambari Shetty" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }} />
          </div>
          <div style={{
            position: "absolute", bottom: -24, right: -24, background: "var(--walnut-700)", color: "var(--paper)",
            padding: "20px 26px", borderRadius: "var(--r-md)", boxShadow: "var(--sh-2)",
          }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, opacity: 0.7, textTransform: "uppercase" }}>Founder</div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 28, marginTop: 4, lineHeight: 1 }}>Shwetambari Shetty</div>
          </div>
        </div>

        <div>
          <EyebrowTitle
            eyebrow="Founder's Note"
            title={<>"I exercise for my <em style={{ fontStyle: "italic", color: "var(--sage-500)" }}>future self.</em>"</>}
          />
          <div style={{ marginTop: 36, fontSize: 17, lineHeight: 1.7, color: "var(--espresso-800)", display: "flex", flexDirection: "column", gap: 20 }}>
            <p style={{ margin: 0 }}>
              Growing old is inevitable. Aging gracefully is in your hands. I built M3S to help people get strong for their older self — because I watched my mother go from the healthiest woman I knew to multiple falls a day from Parkinson's, and every doctor said the same thing: <em>she needs to exercise.</em>
            </p>
            <p style={{ margin: 0 }}>
              So we start early. We start now. It's not how many years we live — it's how well we live the years we have. Look your best, feel your best, age gracefully.
            </p>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 12, letterSpacing: 2, color: "var(--clay-600)", marginTop: 8 }}>
              #ATMYTHIRDSPACE
            </div>
          </div>

          <div style={{ marginTop: 40, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, borderTop: "1px solid var(--hairline)", borderBottom: "1px solid var(--hairline)" }}>
            {[
              { k: "15+ yrs", v: "Coaching fitness" },
              { k: "Dance Fitness", v: "Founder" },
              { k: "Follow her", v: "on Instagram", link: "https://www.instagram.com/shweshetty/" },
            ].map((s, i) => {
              const content = (
                <>
                  <div style={{ fontFamily: "var(--f-display)", fontSize: 26, color: "var(--walnut-700)", lineHeight: 1, display: "flex", alignItems: "center", gap: 6 }}>
                    {s.k} {s.link && <span style={{ fontSize: 16 }}>↗</span>}
                  </div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1.5, color: "var(--clay-600)", marginTop: 8, textTransform: "uppercase" }}>{s.v}</div>
                </>
              );

              const itemStyle = {
                padding: "24px 0",
                borderLeft: i === 0 ? "none" : "1px solid var(--hairline)",
                paddingLeft: i === 0 ? 0 : 24,
                textDecoration: "none",
                display: "block",
                color: "inherit",
              };

              if (s.link) {
                return (
                  <a key={i} href={s.link} target="_blank" rel="noopener noreferrer" style={{ ...itemStyle, cursor: "pointer" }}
                     className="hover:opacity-80 transition-opacity">
                    {content}
                  </a>
                );
              }

              return (
                <div key={i} style={itemStyle}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Section>
  );
}

function Services({ onBook }) {
  const [active, setActive] = useState(SERVICES[0].id);
  const [mIdx, setMIdx] = useState(0);
  const mobileRef = React.useRef(null);
  const isMobile = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(max-width: 899px)").matches;

  const tones = {
    walnut:   { bg: "var(--walnut-700)", fg: "var(--paper)" },
    espresso: { bg: "var(--espresso-800)", fg: "var(--paper)" },
    sand:     { bg: "var(--sand-100)", fg: "var(--espresso-900)" },
    sage:     { bg: "var(--sage-500)", fg: "var(--paper)" },
    terra:    { bg: "var(--terracotta-500)", fg: "var(--paper)" },
  };

  const svcImage = (s) => {
    if (s.id === "approach") {
      return <img referrerPolicy="no-referrer" src="assets/health-assessment.png" alt="Holistic Health Assessment Scale Setup" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />;
    }
    const map = {
      pt: "assets/pt-session.png",
      group: "assets/group-workout.png",
      work: "assets/workshops.jpg",
      recover: "assets/sauna.png",
    };
    const src = map[s.id];
    return src
      ? <img referrerPolicy="no-referrer" src={src} alt={s.kind} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      : <Placeholder label={s.kind.toLowerCase()} tone="sand" w={800} h={600} />;
  };

  const current = SERVICES.find(s => s.id === active) || SERVICES[0];
  const activeIdx = SERVICES.findIndex(s => s.id === active);

  const step = (dir) => {
    // Desktop: swap active
    const n = SERVICES.length;
    const nextIdx = (activeIdx + dir + n) % n;
    setActive(SERVICES[nextIdx].id);
    // Mobile: scroll carousel
    const el = mobileRef.current;
    if (el) {
      const target = Math.max(0, Math.min(n - 1, mIdx + dir));
      el.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
    }
  };

  const ArrowBtn = ({ dir, dim = false }) => (
    <button
      onClick={() => step(dir)}
      aria-label={dir < 0 ? "Previous service" : "Next service"}
      style={{
        width: 44, height: 44, borderRadius: 999,
        border: "1px solid rgba(245,237,224,0.28)",
        background: dim ? "transparent" : "rgba(245,237,224,0.06)",
        color: "var(--sand-100)", cursor: "pointer",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        transition: "background .2s, border-color .2s, transform .15s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--sand-100)"; e.currentTarget.style.color = "var(--espresso-900)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = dim ? "transparent" : "rgba(245,237,224,0.06)"; e.currentTarget.style.color = "var(--sand-100)"; }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transform: dir < 0 ? "scaleX(-1)" : "none" }}>
        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );

  // Track mobile carousel scroll → dots
  useEffect(() => {
    const el = mobileRef.current;
    if (!el) return;
    const onScroll = () => {
      const idx = Math.round(el.scrollLeft / el.clientWidth);
      setMIdx(Math.max(0, Math.min(SERVICES.length - 1, idx)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="services" className="m3s-services" style={{
      background: "var(--espresso-900)", color: "var(--sand-100)",
      minHeight: "100vh", display: "flex", flexDirection: "column",
      padding: "72px 0 56px",
    }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px", width: "100%", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header row — compact */}
        <div className="svc-head" style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 32, alignItems: "end", marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: "var(--sand-300)", opacity: 0.7 }}>Offerings</div>
            <h2 style={{
              fontFamily: "var(--f-display)", fontWeight: 400,
              fontSize: "clamp(40px, 5.5vw, 72px)", lineHeight: 1, letterSpacing: -1.5,
              color: "var(--sand-100)", margin: "10px 0 0",
            }}>
              Five ways we work with you.
            </h2>
          </div>
          <div className="svc-count" style={{ fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 2, color: "var(--sand-300)", opacity: 0.85, textAlign: "right", display: "flex", alignItems: "center", gap: 12 }}>
            <span>0{activeIdx + 1} / 0{SERVICES.length}</span>
            <span className="svc-arrows" style={{ display: "inline-flex", gap: 8 }}>
              <ArrowBtn dir={-1} />
              <ArrowBtn dir={1} />
            </span>
          </div>
        </div>

        {/* Desktop split view */}
        <div className="svc-desktop" style={{
          display: "grid", gridTemplateColumns: "0.9fr 1.3fr",
          gap: 48, flex: 1, minHeight: 0,
        }}>
          {/* Left rail — list + description + CTAs */}
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, borderTop: "1px solid rgba(245,237,224,0.14)" }}>
              {SERVICES.map((s, i) => {
                const on = s.id === active;
                return (
                  <li key={s.id} style={{ borderBottom: "1px solid rgba(245,237,224,0.14)" }}>
                    <button
                      onClick={() => setActive(s.id)}
                      onMouseEnter={() => setActive(s.id)}
                      style={{
                        width: "100%", textAlign: "left", border: "none", background: "transparent",
                        padding: "16px 0", color: on ? "var(--sand-100)" : "rgba(245,237,224,0.7)",
                        cursor: "pointer", display: "grid", gridTemplateColumns: "36px 1fr auto", alignItems: "center", gap: 14,
                        fontFamily: "var(--f-body)", transition: "color .2s",
                      }}
                    >
                      <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, opacity: on ? 0.8 : 0.5 }}>0{i + 1}</span>
                      <span style={{
                        fontFamily: "var(--f-display)", fontStyle: on ? "italic" : "normal",
                        fontSize: "clamp(20px, 2.1vw, 28px)", lineHeight: 1.1, letterSpacing: -0.3,
                      }}>
                        {s.kind}
                      </span>
                      <span style={{
                        width: on ? 36 : 8, height: 1, background: "var(--sand-100)",
                        transition: "width .25s ease", opacity: on ? 1 : 0.4,
                      }} />
                    </button>
                  </li>
                );
              })}
            </ul>

            <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid rgba(245,237,224,0.14)" }}>
              <p style={{ fontSize: 15, lineHeight: 1.55, color: "var(--sand-200)", margin: 0, maxWidth: 440 }}>
                {current.desc}
              </p>
              <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 8 }}>
                {current.items.map((it, i) => (
                  <span key={i} style={{
                    fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: 1.5,
                    textTransform: "uppercase", color: "var(--sand-200)",
                    border: "1px solid rgba(245,237,224,0.22)", padding: "6px 10px", borderRadius: "var(--r-pill)",
                  }}>{it}</span>
                ))}
              </div>
              <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                <Btn onClick={onBook}>Book this →</Btn>
                <Btn variant="ghost" style={{ color: "var(--sand-100)", opacity: 0.75 }}>Learn more</Btn>
              </div>
            </div>
          </div>

          {/* Right panel — big art + tagline */}
          <div style={{
            position: "relative", borderRadius: "var(--r-xl)", overflow: "hidden",
            background: tones[current.tone].bg, color: tones[current.tone].fg,
            minHeight: 0, display: "flex", flexDirection: "column",
          }}>
            <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
              <div key={current.id} style={{
                position: "absolute", inset: 0, animation: "svcFade .35s ease",
              }}>
                {svcImage(current)}
              </div>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(30,20,14,0) 45%, rgba(30,20,14,0.78))", pointerEvents: "none" }} />
            </div>
            <div style={{
              position: "absolute", left: 32, right: 32, bottom: 28,
              color: tones[current.tone].fg,
            }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 2, opacity: 0.8, textTransform: "uppercase" }}>
                {current.kind}
              </div>
              <h3 style={{
                fontFamily: "var(--f-display)", fontWeight: 400,
                fontSize: "clamp(28px, 3.2vw, 48px)", lineHeight: 1.05, letterSpacing: -0.8,
                margin: "8px 0 0",
              }}>
                {current.tagline}
              </h3>
            </div>
          </div>
        </div>

        {/* Mobile carousel */}
        <div className="svc-mobile" style={{ display: "none", flex: 1, flexDirection: "column", minHeight: 0 }}>
          <div
            ref={mobileRef}
            style={{
              display: "flex", overflowX: "auto", scrollSnapType: "x mandatory",
              gap: 12, paddingBottom: 8, flex: 1, minHeight: 0,
              scrollbarWidth: "none",
            }}
          >
            {SERVICES.map((s, i) => {
              const t = tones[s.tone];
              return (
                <article key={s.id} style={{
                  flex: "0 0 100%", scrollSnapAlign: "start",
                  borderRadius: "var(--r-xl)", overflow: "hidden",
                  background: t.bg, color: t.fg,
                  display: "flex", flexDirection: "column",
                }}>
                  <div style={{ position: "relative", flex: "0 0 auto", aspectRatio: "4/3", overflow: "hidden" }}>
                    {svcImage(s)}
                    <div style={{ position: "absolute", top: 14, left: 14, fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, color: "var(--paper)", textTransform: "uppercase", background: "rgba(30,20,14,0.55)", padding: "5px 9px", borderRadius: "var(--r-pill)" }}>
                      0{i + 1} / 0{SERVICES.length}
                    </div>
                  </div>
                  <div style={{ padding: "18px 18px 20px", flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: 2, opacity: 0.75, textTransform: "uppercase" }}>{s.kind}</div>
                    <h3 style={{
                      fontFamily: "var(--f-display)", fontWeight: 400,
                      fontSize: 26, lineHeight: 1.1, letterSpacing: -0.5,
                      margin: "6px 0 10px",
                    }}>{s.tagline}</h3>
                    <p style={{ fontSize: 13.5, lineHeight: 1.5, margin: 0, opacity: 0.92 }}>{s.desc}</p>
                    <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {s.items.slice(0, 4).map((it, j) => (
                        <span key={j} style={{
                          fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1.2,
                          textTransform: "uppercase", padding: "4px 8px",
                          border: `1px solid ${t.fg === "var(--paper)" ? "rgba(255,253,248,0.28)" : "rgba(30,20,14,0.2)"}`,
                          borderRadius: "var(--r-pill)", opacity: 0.9,
                        }}>{it}</span>
                      ))}
                    </div>
                    <div style={{ marginTop: "auto", paddingTop: 14, display: "flex", gap: 10 }}>
                      <Btn size="sm" onClick={onBook} variant={s.tone === "sand" ? "primary" : "secondary"} style={s.tone !== "sand" ? { color: t.fg, borderColor: t.fg } : undefined}>
                        Book this →
                      </Btn>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Dots + arrows */}
          <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {SERVICES.map((s, i) => (
                <button key={s.id}
                  onClick={() => {
                    const el = mobileRef.current;
                    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
                  }}
                  aria-label={`Go to ${s.kind}`}
                  style={{
                    width: mIdx === i ? 22 : 7, height: 7, border: "none",
                    borderRadius: 999, background: mIdx === i ? "var(--sand-100)" : "rgba(245,237,224,0.35)",
                    transition: "width .25s, background .2s", cursor: "pointer", padding: 0,
                  }} />
              ))}
            </div>
            <div style={{ display: "inline-flex", gap: 8 }}>
              <ArrowBtn dir={-1} />
              <ArrowBtn dir={1} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <Section bg="var(--sand-100)">
      <EyebrowTitle eyebrow="From the floor" title="Members, in their words." align="center" />
      <div style={{ marginTop: 64, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
        {TESTIMONIALS.map((t, i) => (
          <Card key={i} tone={i === 1 ? "walnut" : "paper"} style={{ padding: 36 }}>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 48, lineHeight: 0.8, opacity: 0.4 }}>"</div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 24, lineHeight: 1.3, marginTop: -20 }}>{t.q}</div>
            <div style={{ marginTop: 32, paddingTop: 20, borderTop: `1px solid ${i === 1 ? "rgba(255,253,248,0.18)" : "var(--hairline)"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.by}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1.5, opacity: 0.65, marginTop: 4, textTransform: "uppercase" }}>{t.role}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}

function Footer() {
  return (
    <footer style={{ background: "var(--espresso-900)", color: "var(--sand-200)", padding: "80px 32px 40px" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40 }}>
          <div>
            <M3SLogo size={40} color="var(--sand-100)" />
            <p style={{ fontSize: 14, lineHeight: 1.6, marginTop: 24, opacity: 0.7, maxWidth: 320 }}>
              A holistic studio for the hours between home and work. Built for your future self.
            </p>
          </div>
          {[
            { h: "Visit", l: ["HAL 2nd Stage, Indiranagar", "Bengaluru 560008", "Get directions →"] },
            { h: "Hours", l: ["Mon–Fri · 5:30 AM – 9:30 PM", "Sat · 7 AM – 6 PM", "Sun · 9 AM – 6 PM"] },
            { h: "Contact", l: ["hello@mythirdspace.fit", "+91 81239 01143", "@my.thirdspace"] },
          ].map((col, i) => (
            <div key={i}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", opacity: 0.6, marginBottom: 16 }}>{col.h}</div>
              {col.l.map((x, j) => <div key={j} style={{ fontSize: 14, padding: "6px 0", opacity: 0.85 }}>{x}</div>)}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 60, paddingTop: 24, borderTop: "1px solid rgba(245,237,224,0.12)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap", fontFamily: "var(--f-mono)", fontSize: 11, opacity: 0.75 }}>
          <span style={{ opacity: 0.8 }}>© 2026 My Third Space</span>
          <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap" }}>
            <a href="coach-universe.html" style={{ color: "var(--sand-200)", textDecoration: "none", letterSpacing: 2, textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(245,237,224,0.35)", paddingBottom: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ochre-500)" }} />
              Coach Universe →
            </a>
            <span style={{ opacity: 0.7 }}>#ATMYTHIRDSPACE</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ApproachDiagram() {
  // Editorial, on-brand composed SVG showing the 5-step assessment flow.
  // Palette: sand paper over deep walnut. Hand-drawn-ish marks, mono labels.
  const steps = [
    { n: "01", label: "1-1 CONSULT",    angle: -90 },
    { n: "02", label: "BLOOD TEST",     angle: -18 },
    { n: "03", label: "BODY COMP",      angle:  54 },
    { n: "04", label: "FITNESS",        angle: 126 },
    { n: "05", label: "NUTRITION",      angle: 198 },
  ];
  const cx = 300, cy = 240, R = 140;
  const pt = (a) => {
    const rad = (a * Math.PI) / 180;
    return { x: cx + R * Math.cos(rad), y: cy + R * Math.sin(rad) };
  };

  return (
    <div style={{
      width: "100%", height: "100%",
      background: "var(--sand-100)",
      position: "relative", overflow: "hidden",
      border: "1px solid rgba(255,253,248,0.12)",
      borderRadius: "var(--r-md)",
    }}>
      {/* subtle diagonal paper texture */}
      <svg width="100%" height="100%" viewBox="0 0 600 480" preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
        <defs>
          <pattern id="appr-stripe" width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="18" height="18" fill="#F3E7D0"/>
            <line x1="0" y1="0" x2="0" y2="18" stroke="#E8D7B5" strokeWidth="1"/>
          </pattern>
          <radialGradient id="appr-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FBF7F0" stopOpacity="0.9"/>
            <stop offset="100%" stopColor="#F3E7D0" stopOpacity="0"/>
          </radialGradient>
        </defs>
        <rect width="600" height="480" fill="url(#appr-stripe)"/>
        <circle cx={cx} cy={cy} r="200" fill="url(#appr-glow)"/>

        {/* outer guide ring */}
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#5E4228" strokeOpacity="0.18" strokeDasharray="2 6" strokeWidth="1"/>
        <circle cx={cx} cy={cy} r={R + 30} fill="none" stroke="#5E4228" strokeOpacity="0.1" strokeWidth="0.75"/>

        {/* connecting spokes */}
        {steps.map((s, i) => {
          const p = pt(s.angle);
          return <line key={"ln"+i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#5E4228" strokeOpacity="0.22" strokeWidth="0.75"/>;
        })}

        {/* center badge — "YOU" */}
        <circle cx={cx} cy={cy} r="52" fill="#5E4228"/>
        <circle cx={cx} cy={cy} r="52" fill="none" stroke="#3E2C1C" strokeWidth="1.5"/>
        <text x={cx} y={cy - 4} textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="30" fill="#FBF7F0" fontWeight="400">you</text>
        <text x={cx} y={cy + 18} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" letterSpacing="2" fill="#EADBC4" opacity="0.7">BASELINE</text>

        {/* step nodes */}
        {steps.map((s, i) => {
          const p = pt(s.angle);
          // label offset outward
          const rad = (s.angle * Math.PI) / 180;
          const lx = cx + (R + 34) * Math.cos(rad);
          const ly = cy + (R + 34) * Math.sin(rad);
          const anchor = Math.cos(rad) > 0.3 ? "start" : Math.cos(rad) < -0.3 ? "end" : "middle";
          return (
            <g key={"nd"+i}>
              <circle cx={p.x} cy={p.y} r="22" fill="#FBF7F0" stroke="#5E4228" strokeWidth="1.5"/>
              <circle cx={p.x} cy={p.y} r="22" fill="none" stroke="#5E4228" strokeOpacity="0.3" strokeWidth="4"/>
              {/* tiny glyph per step */}
              <StepGlyph n={i} x={p.x} y={p.y} />
              {/* number + label */}
              <text x={lx} y={ly - 4} textAnchor={anchor} fontFamily="JetBrains Mono, monospace" fontSize="10" letterSpacing="1.5" fill="#8A6640">{s.n}</text>
              <text x={lx} y={ly + 10} textAnchor={anchor} fontFamily="JetBrains Mono, monospace" fontSize="11" letterSpacing="1.5" fill="#3E2C1C" fontWeight="600">{s.label}</text>
            </g>
          );
        })}

        {/* corner callouts */}
        <g opacity="0.65">
          <text x="32" y="36" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="2" fill="#5E4228">[ COMPREHENSIVE APPROACH ]</text>
          <text x="568" y="36" textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="2" fill="#5E4228">FIG. 01</text>
          <text x="32" y="456" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="2" fill="#5E4228">MEASURE · MOVE · RECOVER</text>
          <text x="568" y="456" textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="2" fill="#5E4228">M3S / BENGALURU</text>
        </g>
      </svg>
    </div>
  );
}

function StepGlyph({ n, x, y }) {
  // 5 minimal glyphs for: consult, blood, body-comp, fitness, nutrition
  const s = 10; // half-size
  const stroke = "#5E4228", sw = 1.4;
  const common = { stroke, strokeWidth: sw, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  if (n === 0) return ( // two-person chat
    <g {...common}>
      <circle cx={x-5} cy={y-3} r="2.6"/>
      <path d={`M ${x-9} ${y+6} Q ${x-5} ${y+1} ${x-1} ${y+6}`}/>
      <circle cx={x+5} cy={y-3} r="2.6"/>
      <path d={`M ${x+1} ${y+6} Q ${x+5} ${y+1} ${x+9} ${y+6}`}/>
    </g>
  );
  if (n === 1) return ( // blood drop
    <g {...common}>
      <path d={`M ${x} ${y-8} Q ${x+7} ${y} ${x+4} ${y+5} Q ${x} ${y+9} ${x-4} ${y+5} Q ${x-7} ${y} ${x} ${y-8} Z`}/>
      <path d={`M ${x-1} ${y+2} Q ${x-3} ${y-1} ${x-1} ${y-3}`} strokeOpacity="0.5"/>
    </g>
  );
  if (n === 2) return ( // body-comp: bars
    <g {...common}>
      <rect x={x-8} y={y-2} width="3.5" height="9"/>
      <rect x={x-2} y={y-6} width="3.5" height="13"/>
      <rect x={x+4} y={y} width="3.5" height="7"/>
    </g>
  );
  if (n === 3) return ( // fitness: heartbeat
    <g {...common}>
      <path d={`M ${x-9} ${y} L ${x-4} ${y} L ${x-2} ${y-6} L ${x+1} ${y+6} L ${x+3} ${y} L ${x+9} ${y}`}/>
    </g>
  );
  // n===4 nutrition: bowl + leaf
  return (
    <g {...common}>
      <path d={`M ${x-8} ${y+1} Q ${x} ${y+10} ${x+8} ${y+1}`}/>
      <line x1={x-8} y1={y+1} x2={x+8} y2={y+1}/>
      <path d={`M ${x} ${y-7} Q ${x+5} ${y-5} ${x+3} ${y-1} Q ${x-1} ${y-2} ${x} ${y-7} Z`}/>
    </g>
  );
}

function PTScene() {
  // Composed editorial scene: coach spotting a student on a dumbbell row,
  // M3S wordmark painted on the back wall. Stylized, on-brand.
  return (
    <div style={{ width: "100%", height: "100%", borderRadius: "var(--r-md)", overflow: "hidden", position: "relative" }}>
      <svg viewBox="0 0 600 480" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display: "block" }}>
        <defs>
          {/* warm backlight */}
          <linearGradient id="pt-wall" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#6B4D31"/>
            <stop offset="55%" stopColor="#5E4228"/>
            <stop offset="100%" stopColor="#3E2C1C"/>
          </linearGradient>
          <radialGradient id="pt-sun" cx="75%" cy="18%" r="55%">
            <stop offset="0%" stopColor="#EADBC4" stopOpacity="0.55"/>
            <stop offset="60%" stopColor="#B86B4B" stopOpacity="0.12"/>
            <stop offset="100%" stopColor="#3E2C1C" stopOpacity="0"/>
          </radialGradient>
          {/* wood floor */}
          <linearGradient id="pt-floor" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3E2C1C"/>
            <stop offset="100%" stopColor="#2A1C10"/>
          </linearGradient>
          {/* window light shaft */}
          <linearGradient id="pt-shaft" x1="0" x2="0.6" y1="0" y2="1">
            <stop offset="0%" stopColor="#FBF7F0" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="#FBF7F0" stopOpacity="0"/>
          </linearGradient>
          {/* skin + fabric tones */}
          <linearGradient id="pt-skin" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#D7A982"/>
            <stop offset="100%" stopColor="#B68566"/>
          </linearGradient>
        </defs>

        {/* back wall */}
        <rect width="600" height="360" fill="url(#pt-wall)"/>
        <rect width="600" height="360" fill="url(#pt-sun)"/>
        {/* light shaft from top-right */}
        <polygon points="420,0 600,0 600,260 340,360 300,360" fill="url(#pt-shaft)"/>

        {/* subtle wall studs / battens */}
        {[80, 170, 260, 440, 530].map((x, i) => (
          <line key={i} x1={x} y1="0" x2={x} y2="360" stroke="#FBF7F0" strokeOpacity="0.05" strokeWidth="1"/>
        ))}

        {/* M3S wordmark on back wall (painted, low-contrast) */}
        <g opacity="0.22" transform="translate(60, 70)">
          <text x="0" y="0" fontFamily="Fraunces, serif" fontStyle="italic" fontWeight="400" fontSize="120" fill="#FBF7F0" letterSpacing="-2">M3S</text>
          <rect x="3" y="18" width="200" height="2" fill="#FBF7F0" opacity="0.6"/>
          <text x="3" y="42" fontFamily="JetBrains Mono, monospace" fontSize="11" letterSpacing="6" fill="#FBF7F0">MY THIRD SPACE</text>
        </g>

        {/* floor */}
        <rect y="360" width="600" height="120" fill="url(#pt-floor)"/>
        {/* floor planks */}
        {[380, 410, 440, 470].map((y, i) => (
          <line key={"fp"+i} x1="0" y1={y} x2="600" y2={y} stroke="#1A1108" strokeOpacity="0.5" strokeWidth="1"/>
        ))}
        {/* floor shadow pool under figures */}
        <ellipse cx="300" cy="410" rx="180" ry="18" fill="#000" opacity="0.35"/>

        {/* --- Rack in background, left --- */}
        <g opacity="0.65">
          <rect x="22" y="180" width="6" height="200" fill="#2A1C10"/>
          <rect x="110" y="180" width="6" height="200" fill="#2A1C10"/>
          <rect x="18" y="210" width="100" height="4" fill="#2A1C10"/>
          <rect x="18" y="250" width="100" height="4" fill="#2A1C10"/>
          <rect x="18" y="290" width="100" height="4" fill="#2A1C10"/>
          {/* plates on rack */}
          <circle cx="45" cy="230" r="10" fill="#1A1108"/>
          <circle cx="90" cy="230" r="10" fill="#1A1108"/>
          <circle cx="45" cy="270" r="12" fill="#1A1108"/>
          <circle cx="90" cy="270" r="12" fill="#1A1108"/>
        </g>

        {/* --- Bench in foreground center --- */}
        <g>
          <rect x="230" y="330" width="140" height="16" rx="4" fill="#2A1C10"/>
          <rect x="240" y="346" width="8" height="40" fill="#1A1108"/>
          <rect x="352" y="346" width="8" height="40" fill="#1A1108"/>
          <rect x="225" y="338" width="150" height="3" fill="#5E4228" opacity="0.4"/>
        </g>

        {/* ====== STUDENT — seated on bench, rowing dumbbell ====== */}
        {/* torso */}
        <g>
          {/* leggings */}
          <path d="M 260 330 Q 256 296 272 282 L 318 282 Q 334 296 330 330 Z" fill="#2A1C10"/>
          {/* white crop tee */}
          <path d="M 266 282 Q 262 252 280 240 L 312 240 Q 328 252 324 282 Z" fill="#FBF7F0"/>
          {/* tee shadow */}
          <path d="M 266 282 Q 266 272 276 268 L 314 268 Q 324 272 324 282 Z" fill="#E2D0B3" opacity="0.7"/>
          {/* M3S tiny logo on chest */}
          <text x="295" y="262" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="6" letterSpacing="1" fill="#5E4228">M3S</text>

          {/* head */}
          <circle cx="296" cy="224" r="16" fill="url(#pt-skin)"/>
          {/* ponytail */}
          <path d="M 308 218 Q 320 214 324 226 Q 326 240 316 244 Q 310 240 308 230 Z" fill="#1A1108"/>
          {/* hair front */}
          <path d="M 280 218 Q 282 208 296 206 Q 310 206 312 218 Q 304 214 296 214 Q 288 214 280 218 Z" fill="#1A1108"/>

          {/* right arm (rowing — pulling back) */}
          <path d="M 318 250 Q 338 250 350 264 L 352 276 Q 336 276 322 268 Z" fill="url(#pt-skin)"/>
          {/* forearm pulling dumbbell up */}
          <path d="M 348 264 Q 362 260 368 248 L 362 238 Q 350 248 346 258 Z" fill="url(#pt-skin)"/>
          {/* dumbbell */}
          <g transform="translate(356, 232)">
            <rect x="0" y="4" width="22" height="6" rx="2" fill="#1A1108"/>
            <rect x="-6" y="-2" width="8" height="18" rx="2" fill="#2A1C10"/>
            <rect x="20" y="-2" width="8" height="18" rx="2" fill="#2A1C10"/>
            <rect x="-8" y="-4" width="4" height="22" rx="1" fill="#B86B4B"/>
            <rect x="28" y="-4" width="4" height="22" rx="1" fill="#B86B4B"/>
          </g>

          {/* left arm resting on knee */}
          <path d="M 274 250 Q 258 254 250 274 L 258 282 Q 270 270 278 264 Z" fill="url(#pt-skin)"/>
        </g>

        {/* ====== COACH — standing right, cueing form ====== */}
        <g>
          {/* shadow leg */}
          <path d="M 432 386 L 442 300 L 466 300 L 470 386 Z" fill="#1A1108"/>
          {/* front leg */}
          <path d="M 448 386 L 456 300 L 478 300 L 482 386 Z" fill="#2A1C10"/>
          {/* torso — dark tee */}
          <path d="M 430 300 Q 426 258 446 246 L 486 246 Q 506 258 502 300 Z" fill="#1A1108"/>
          {/* tee highlight */}
          <path d="M 434 270 Q 448 262 466 262 Q 484 262 498 270" stroke="#3E2C1C" strokeWidth="2" fill="none"/>
          {/* M3S logo on coach tee */}
          <text x="466" y="285" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="7" letterSpacing="1.5" fill="#B86B4B">M3S</text>

          {/* coach head */}
          <circle cx="466" cy="228" r="17" fill="#B68566"/>
          {/* short hair */}
          <path d="M 450 222 Q 452 210 466 208 Q 480 208 482 222 Q 480 216 466 216 Q 452 216 450 222 Z" fill="#1A1108"/>
          {/* beard hint */}
          <path d="M 456 236 Q 466 244 476 236" stroke="#2A1C10" strokeWidth="1.5" fill="none"/>

          {/* extended arm — pointing at student's back (form cue) */}
          <path d="M 438 260 Q 404 258 380 270 L 378 280 Q 404 274 438 274 Z" fill="#B68566"/>
          {/* pointing hand */}
          <circle cx="378" cy="275" r="7" fill="#B68566"/>
          <rect x="368" y="272" width="12" height="2.5" rx="1" fill="#B68566"/>

          {/* other arm holding clipboard */}
          <path d="M 498 270 Q 516 276 520 300 L 510 306 Q 502 290 498 280 Z" fill="#B68566"/>
          {/* clipboard */}
          <rect x="500" y="300" width="24" height="30" rx="2" fill="#EADBC4" stroke="#1A1108" strokeWidth="1"/>
          <line x1="504" y1="308" x2="520" y2="308" stroke="#5E4228" strokeWidth="1"/>
          <line x1="504" y1="314" x2="520" y2="314" stroke="#5E4228" strokeWidth="1"/>
          <line x1="504" y1="320" x2="516" y2="320" stroke="#5E4228" strokeWidth="1"/>
          <rect x="508" y="296" width="8" height="4" rx="1" fill="#1A1108"/>
        </g>

        {/* --- foreground floor dumbbell --- */}
        <g transform="translate(150, 396)">
          <rect x="0" y="2" width="28" height="8" rx="2" fill="#1A1108"/>
          <circle cx="-2" cy="6" r="10" fill="#2A1C10"/>
          <circle cx="30" cy="6" r="10" fill="#2A1C10"/>
          <circle cx="-2" cy="6" r="6" fill="#1A1108"/>
          <circle cx="30" cy="6" r="6" fill="#1A1108"/>
        </g>

        {/* --- motion cue arrow from coach hand to student back --- */}
        <g opacity="0.55">
          <path d="M 372 272 Q 352 260 336 252" stroke="#EADBC4" strokeWidth="1.3" strokeDasharray="3 4" fill="none"/>
          <path d="M 340 248 L 334 252 L 338 258" stroke="#EADBC4" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </g>

        {/* editorial callouts */}
        <g opacity="0.75">
          <text x="32" y="36" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="2" fill="#EADBC4">[ PERSONAL TRAINING · 1:1 ]</text>
          <text x="568" y="36" textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="2" fill="#EADBC4">FIG. 02</text>
          <text x="32" y="462" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="2" fill="#EADBC4">60 MIN · ONE COACH · YOUR PLAN</text>
          <text x="568" y="462" textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="2" fill="#EADBC4">M3S / INDIRANAGAR</text>
        </g>
      </svg>
    </div>
  );
}



// Trainers grid, Social (IG), Members portal, Kenko Life


// ============ TRAINER PROFILE OVERLAY ============
function TrainerProfile({ trainer, onClose, onBook, ratings = [], onUpdate }) {
  if (!trainer) return null;
  const V = "?v=15";
  const imgMap = { rahul: "assets/rahul.jpg" + V, joe: "assets/joe.jpg" + V, aakash: "assets/aakash.jpg" + V, deepika: "assets/deepika.jpg" + V, lee: "assets/lee.jpg" + V, deb: "assets/deb.jpg" + V, tarun: "assets/tarun.jpg" + V, pilates: "assets/anisha.jpg" + V, shahbaz: "assets/shahbaz.jpg" + V, santo: "assets/santo.jpg" + V };
  const imgSrc = imgMap[trainer.id] || null;

  const [isEditing, setIsEditing] = React.useState(false);

  // Form edit states
  const [editRole, setEditRole] = React.useState(trainer.role || "");
  const [editBio, setEditBio] = React.useState(trainer.bio || "");
  const [editImageUrl, setEditImageUrl] = React.useState(trainer.image_url || trainer.imageUrl || "");
  const [editSpecialties, setEditSpecialties] = React.useState(trainer.specialties || []);
  const [editGalleryImages, setEditGalleryImages] = React.useState((trainer.gallery_images || []).join("\n"));
  const [editGalleryVideos, setEditGalleryVideos] = React.useState((trainer.gallery_videos || []).join("\n"));

  React.useEffect(() => {
    // Reset states when coach changes
    setEditRole(trainer.role || "");
    setEditBio(trainer.bio || "");
    setEditImageUrl(trainer.image_url || trainer.imageUrl || "");
    setEditSpecialties(trainer.specialties || []);
    setEditGalleryImages((trainer.gallery_images || []).join("\n"));
    setEditGalleryVideos((trainer.gallery_videos || []).join("\n"));
    setIsEditing(false);
  }, [trainer]);

  React.useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, []);

  const handleSaveOverride = async (e) => {
    e.preventDefault();
    const updatedFields = {
      role: editRole,
      bio: editBio,
      specialties: editSpecialties,
      image_url: editImageUrl,
      gallery_images: editGalleryImages.split("\n").map(s => s.trim()).filter(Boolean),
      gallery_videos: editGalleryVideos.split("\n").map(s => s.trim()).filter(Boolean)
    };

    // Save locally to local coaches_list
    let list = [];
    let prefix = "";
    try {
      const fb = await import("./firebase.js");
      prefix = fb.getEnvPrefix ? fb.getEnvPrefix() : "";
    } catch (e) {}

    try {
      const local = localStorage.getItem("m3s." + prefix + "coaches_list");
      if (local) list = JSON.parse(local);
    } catch (err) {}

    const existsIdx = list.findIndex(c => c.id === trainer.id);
    if (existsIdx > -1) {
      list[existsIdx] = { ...list[existsIdx], ...updatedFields };
    } else {
      list.push({ id: trainer.id, name: trainer.name, cert: trainer.cert, ...updatedFields });
    }

    try {
      localStorage.setItem("m3s." + prefix + "coaches_list", JSON.stringify(list));
    } catch (err) {}

    // Save to firestore if online
    try {
      const { doc, setDoc } = await import("firebase/firestore");
      const { db } = await import("./firebase.js");
      if (db) {
        const coachDocRef = doc(db, prefix + "coaches_list", trainer.id);
        await setDoc(coachDocRef, updatedFields, { merge: true });
      }
    } catch (err) {
      console.warn("Firestore save mismatch, using robust localStorage backup:", err);
    }

    setIsEditing(false);
    if (onUpdate) {
      onUpdate();
    }
  };

  // Helper styles
  const editorLabelStyle = {
    display: "block",
    fontFamily: "var(--f-mono)",
    fontSize: "9px",
    letterSpacing: "1.5px",
    color: "var(--clay-600)",
    marginBottom: "4px",
    textTransform: "uppercase",
    fontWeight: "bold"
  };

  const editorInputStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px",
    fontSize: "13px",
    borderRadius: "10px",
    border: "1px solid var(--hairline-strong)",
    background: "var(--paper)",
    color: "var(--espresso-900)",
    outline: "none"
  };

  const editorTextareaStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "10px",
    fontSize: "13px",
    borderRadius: "10px",
    border: "1px solid var(--hairline-strong)",
    background: "var(--paper)",
    color: "var(--espresso-900)",
    fontFamily: "var(--f-body)",
    outline: "none",
    resize: "vertical"
  };

  // Calculate dynamic average rating
  const coachRatings = ratings.filter(r => r.coachId === trainer.id || r.coach_id === trainer.id || r.trainerId === trainer.id);
  const avgRating = coachRatings.length > 0
    ? (coachRatings.reduce((sum, r) => sum + (Number(r.overall) || Number(r.rating) || 0), 0) / coachRatings.length).toFixed(1)
    : (trainer.avgRating || "4.9");

  // Multi-media setup
  const finalCoverImage = editImageUrl || trainer.image_url || imgSrc;
  const customImages = (trainer.gallery_images || []);
  const customVideos = (trainer.gallery_videos || []);
  const hasVideo = customVideos.length > 0;
  const videoUrl = hasVideo ? customVideos[0] : null;

  if (isEditing) {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 200, background: "rgba(30,20,14,0.55)",
        backdropFilter: "blur(8px)", overflowY: "auto", padding: "40px 20px",
      }} onClick={onClose}>
        <div onClick={(e) => e.stopPropagation()} style={{
          maxWidth: "min(680px, calc(100vw - 40px))", margin: "0 auto", background: "var(--paper)",
          borderRadius: "var(--r-xl)", overflow: "hidden", boxShadow: "var(--sh-3)",
          border: "1px solid var(--hairline-strong)", padding: 32, display: "flex", flexDirection: "column", gap: 20
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--hairline)", paddingBottom: 16 }}>
            <div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, color: "var(--clay-600)", textTransform: "uppercase" }}>Founder Override View</div>
              <h3 style={{ fontFamily: "var(--f-display)", fontSize: 32, fontWeight: 400, margin: "4px 0 0", color: "var(--espresso-900)" }}>Override: {trainer.name}</h3>
            </div>
            <button onClick={() => setIsEditing(false)} style={{ border: "none", background: "none", fontSize: 24, cursor: "pointer", color: "var(--clay-600)" }}>×</button>
          </div>

          <form onSubmit={handleSaveOverride} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={editorLabelStyle}>TAGLINE / PRIMARY ROLE</label>
              <input type="text" value={editRole} onChange={e => setEditRole(e.target.value)} required style={editorInputStyle} />
            </div>

            <div>
              <label style={editorLabelStyle}>BIOGRAPHY / PERFORMANCE DESCRIPTION</label>
              <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3} required style={editorTextareaStyle} />
            </div>

            {/* Specialty checkboxes */}
            <div>
              <label style={editorLabelStyle}>SPECIALTIES &amp; SKILLS (SELECT ACCORDINGLY)</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, margin: "6px 0" }}>
                {["Hypertrophy", "Strength", "Post Partum", "Hyrox", "Recovery", "Conditioning", "Pilates", "Yoga", "Breathwork"].map(s => {
                  const hasSkill = editSpecialties.includes(s);
                  return (
                    <button type="button" key={s} onClick={() => {
                      if (hasSkill) {
                        setEditSpecialties(editSpecialties.filter(x => x !== s));
                      } else {
                        setEditSpecialties([...editSpecialties, s]);
                      }
                    }} style={{
                      padding: "6px 10px", fontSize: 11, borderRadius: "var(--r-pill)", cursor: "pointer",
                      border: `1px solid ${hasSkill ? "var(--walnut-700)" : "var(--hairline-strong)"}`,
                      background: hasSkill ? "rgba(94,66,40,0.08)" : "var(--paper)",
                      color: hasSkill ? "var(--walnut-700)" : "var(--espresso-900)",
                      textAlign: "left", fontWeight: "600",
                    }}>
                      {hasSkill ? "✓ " : "○ "} {s}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={editorLabelStyle}>COVER IMAGE URL</label>
              <input type="text" value={editImageUrl} onChange={e => setEditImageUrl(e.target.value)} placeholder="assets/lee.jpg or https://unsplash.com/..." style={editorInputStyle} />
              <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 9, color: 'var(--clay-500)' }}>Presets: </span>
                {["assets/lee.jpg", "assets/joe.jpg", "assets/deb.jpg", "assets/deepika.jpg", "assets/anisha.jpg"].map(p => (
                  <button type="button" key={p} onClick={() => setEditImageUrl(p)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 9, color: 'var(--walnut-700)', textDecoration: 'underline', padding: 0 }}>{p.split('/')[1]}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={editorLabelStyle}>GALLERY IMAGE URLS (ONE PER LINE)</label>
                <textarea value={editGalleryImages} onChange={e => setEditGalleryImages(e.target.value)} rows={3} placeholder="https://images.unsplash.com/photo-..." style={editorTextareaStyle} />
              </div>
              <div>
                <label style={editorLabelStyle}>GALLERY VIDEO URLS (ONE PER LINE)</label>
                <textarea value={editGalleryVideos} onChange={e => setEditGalleryVideos(e.target.value)} rows={3} placeholder="https://www.youtube.com/embed/..." style={editorTextareaStyle} />
              </div>
            </div>

            <button type="submit" style={{
              background: "var(--walnut-700)", color: "var(--paper)", border: "none", height: 44,
              borderRadius: "var(--r-pill)", fontFamily: "var(--f-mono)", fontSize: 12, letterSpacing: 1.5,
              textTransform: "uppercase", cursor: "pointer", fontWeight: "bold", marginTop: 12
            }}>
              ✓ Apply &amp; Synchronize Override
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200, background: "rgba(30,20,14,0.55)",
      backdropFilter: "blur(8px)", overflowY: "auto", padding: "40px 20px",
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        maxWidth: "min(1180px, calc(100vw - 40px))", margin: "0 auto", background: "var(--paper)",
        borderRadius: "var(--r-xl)", overflow: "hidden", boxShadow: "var(--sh-3)",
        border: "1px solid var(--hairline-strong)",
      }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px", borderBottom: "1px solid var(--hairline)" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 2, color: "var(--clay-600)", textTransform: "uppercase" }}>
            Coach Profile · M3S
          </div>
          <button onClick={onClose} style={{ border: "1px solid var(--hairline)", background: "var(--sand-50)", borderRadius: "var(--r-pill)", padding: "8px 18px", cursor: "pointer", fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase" }}>Close ✕</button>
        </div>

        {/* Hero */}
        <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 0.85fr) 1.15fr", gap: 0, alignItems: "stretch" }}>
          <div style={{ aspectRatio: "4/5", background: "var(--espresso-900)", position: "relative", overflow: "hidden" }}>
            {finalCoverImage
              ? <img referrerPolicy="no-referrer" src={finalCoverImage} alt={trainer.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
              : <Placeholder label="" tone={trainer.tone} w={450} h={800} />}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(30,20,14,0) 60%, rgba(30,20,14,0.7))" }} />
            <div style={{ position: "absolute", left: 24, bottom: 24, right: 24, color: "var(--paper)" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, opacity: 0.85, textTransform: "uppercase" }}>{trainer.cert}</div>
              <h2 style={{ fontFamily: "var(--f-display)", fontSize: 72, fontWeight: 400, lineHeight: 0.95, margin: "6px 0 0" }}>{trainer.name}</h2>
            </div>
          </div>
          <div style={{ padding: "48px 48px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "var(--sand-50)" }}>
            <div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, color: "var(--clay-600)", textTransform: "uppercase", marginBottom: 16 }}>About</div>
              <h3 style={{ fontFamily: "var(--f-display)", fontSize: 38, fontWeight: 400, lineHeight: 1.1, margin: "0 0 20px", color: "var(--espresso-900)" }}>
                {trainer.role}
              </h3>
              <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--espresso-800)", margin: 0 }}>{trainer.bio}</p>
              <p style={{ fontSize: 15, lineHeight: 1.65, color: "var(--espresso-800)", opacity: 0.78, margin: "16px 0 0" }}>
                {trainer.name.split(" ")[0]} works with members across strength blocks, Hyrox prep, and return-to-training after injury. Expect honest feedback, small-group attention, and programming you can actually follow.
              </p>

              <div style={{ marginTop: 32 }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, color: "var(--clay-600)", textTransform: "uppercase", marginBottom: 12 }}>Core competencies</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {trainer.specialties.map(s => <Chip key={s}>{s}</Chip>)}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 40 }}>
              {trainer.ptEligible
                ? <Btn onClick={() => { onBook && onBook(); onClose(); }}>Book with {trainer.name.split(" ")[0]} →</Btn>
                : <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 1.5, color: "var(--clay-600)", textTransform: "uppercase", padding: "12px 0" }}>Group classes only — see the schedule</div>}
            </div>
          </div>
        </div>

        {/* Stats band */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: "1px solid var(--hairline)", borderBottom: "1px solid var(--hairline)", background: "var(--paper)" }}>
          {[
            { v: "10+ yrs", l: "On the floor" },
            { v: "3×/wk", l: "Avg. member cadence" },
            { v: "220+", l: "Members coached" },
            { v: `★ ${avgRating}`, l: "Member rating" },
          ].map((s, i) => (
            <div key={i} style={{ padding: 28, borderRight: i < 3 ? "1px solid var(--hairline)" : "none" }}>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 32, color: "var(--walnut-700)" }}>{s.v}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1.5, color: "var(--clay-600)", textTransform: "uppercase", marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Media gallery */}
        <div style={{ padding: "56px 48px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", marginBottom: 24 }}>
            <div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, color: "var(--clay-600)", textTransform: "uppercase" }}>Gallery</div>
              <h4 style={{ fontFamily: "var(--f-display)", fontSize: 36, fontWeight: 400, margin: "6px 0 0", color: "var(--espresso-900)" }}>On the floor with {trainer.name.split(" ")[0]}</h4>
            </div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1.5, color: "var(--clay-600)" }}>LIVE SYNC · MEDIA MODULE</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr 1fr", gap: 12 }}>
            {hasVideo ? (
              <div style={{ aspectRatio: "4/5", position: "relative", borderRadius: "var(--r-md)", overflow: "hidden", background: "var(--espresso-900)" }}>
                <iframe src={videoUrl} title="Walkthrough video" style={{ width: "100%", height: "100%", border: "none" }} allowFullScreen />
              </div>
            ) : (
              <div style={{ aspectRatio: "4/5", position: "relative", borderRadius: "var(--r-md)", overflow: "hidden", background: "var(--sand-200)" }}>
                <Placeholder label="" tone={trainer.tone} w={500} h={625} />
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(251,247,240,0.9)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "var(--walnut-700)" }}>▶</div>
                </div>
                <div style={{ position: "absolute", left: 16, bottom: 16, fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1.5, color: "var(--paper)", textTransform: "uppercase" }}>Video · Form walkthrough</div>
              </div>
            )}

            {customImages[0] ? (
              <div style={{ aspectRatio: "4/5", borderRadius: "var(--r-md)", overflow: "hidden" }}>
                <img referrerPolicy="no-referrer" src={customImages[0]} alt="Gallery focus 1" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : (
              <div style={{ aspectRatio: "4/5", borderRadius: "var(--r-md)", overflow: "hidden" }}>
                <Placeholder label="" tone="walnut" w={400} h={500} />
              </div>
            )}

            {customImages[1] ? (
              <div style={{ aspectRatio: "4/5", borderRadius: "var(--r-md)", overflow: "hidden" }}>
                <img referrerPolicy="no-referrer" src={customImages[1]} alt="Gallery focus 2" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ) : (
              <div style={{ aspectRatio: "4/5", borderRadius: "var(--r-md)", overflow: "hidden" }}>
                <Placeholder label="" tone="sand" w={400} h={500} />
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: "24px 48px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 1.5, color: "var(--clay-600)", textTransform: "uppercase" }}>
              Press ESC to close
            </span>
          </div>
          <Btn onClick={() => { onBook && onBook(); onClose(); }}>See {trainer.name.split(" ")[0]}'s schedule →</Btn>
        </div>
      </div>
    </div>
  );
}

// ============ TRAINERS ============
function TrainersSection() {
  const [coaches, setCoaches] = useState(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      const isPPE = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('-dev-') || hostname.includes('localhost');
      if (!isPPE) return []; // Empty clean slate in PROD!
    }
    return TRAINERS;
  });
  const [ratings, setRatings] = useState([]);
  const [active, setActive] = useState(TRAINERS[0]?.id || "");
  const [profileId, setProfileId] = useState(null);

  const reloadData = async () => {
    let coachesVal = [];
    let ratingsVal = [];
    let prefix = "";
    let isProd = true;

    try {
      const fb = await import("./firebase.js");
      prefix = fb.getEnvPrefix ? fb.getEnvPrefix() : "";
      isProd = fb.getActiveEnvironment() === 'PROD';
    } catch (e) {}

    try {
      const localCoaches = localStorage.getItem("m3s." + prefix + "coaches_list");
      if (localCoaches) {
        const parsed = JSON.parse(localCoaches) || [];
        coachesVal = parsed.filter(c => c.id !== "shailaa");
        if (parsed.length !== coachesVal.length) {
          localStorage.setItem("m3s." + prefix + "coaches_list", JSON.stringify(coachesVal));
        }
      }
    } catch (e) {}
    try {
      const localRatings = localStorage.getItem("m3s." + prefix + "ratings");
      if (localRatings) ratingsVal = JSON.parse(localRatings);
    } catch (e) {}

    // Firestore load
    try {
      const { collection, getDocs, doc, deleteDoc } = await import("firebase/firestore");
      const { db, handleFirestoreError, OperationType } = await import("./firebase.js");
      if (db) {
        // Programmatic clean-up of Shailaa record
        try {
          const shailaaRef = doc(db, prefix + "coaches_list", "shailaa");
          await deleteDoc(shailaaRef);
        } catch (err) {}

        // Fetch coaches list inside its own try-catch
        try {
          const cSnap = await getDocs(collection(db, prefix + "coaches_list"));
          const fsCoaches = [];
          cSnap.forEach(doc => {
            if (doc.id !== "shailaa" && doc.id !== "shwetambari") {
              fsCoaches.push({ id: doc.id, ...doc.data() });
            }
          });
          coachesVal = fsCoaches; // Always trust DB
        } catch (err) {
          console.warn("Firestore coaches_list download failed:", err);
          handleFirestoreError(err, OperationType.LIST, prefix + "coaches_list");
        }

        // Fetch ratings inside its own try-catch
        try {
          const rSnap = await getDocs(collection(db, prefix + "ratings"));
          const fsRatings = [];
          rSnap.forEach(doc => fsRatings.push({ id: doc.id, ...doc.data() }));
          ratingsVal = fsRatings; // Always trust DB
        } catch (err) {
          console.warn("Firestore ratings download failed:", err);
          handleFirestoreError(err, OperationType.LIST, prefix + "ratings");
        }
      }
    } catch (e) {
      console.warn("Firestore setup or import failed:", e);
    }

    setRatings(ratingsVal);

    let finalMerged = [];
    if (isProd) {
      // In PROD: Only coaches actively present in database are loaded
      finalMerged = coachesVal.map(found => {
        const staticCoach = TRAINERS.find(t => t.id === found.id) || {};
        return {
          ...staticCoach,
          ...found,
          specialties: found.specialties || staticCoach.specialties || [],
          bio: found.bio || staticCoach.bio || "",
          name: found.name || staticCoach.name || "",
          cert: found.cert || staticCoach.cert || "",
          role: found.role || staticCoach.role || "",
        };
      });
    } else {
      // In PPE/Dev: Merge coaches with fallback static TRAINERS
      const merged = TRAINERS.map(staticCoach => {
        const found = coachesVal.find(c => c.id === staticCoach.id);
        if (found) {
          return {
            ...staticCoach,
            ...found,
            specialties: found.specialties || staticCoach.specialties,
            bio: found.bio || staticCoach.bio,
            name: found.name || staticCoach.name,
            cert: found.cert || staticCoach.cert,
            role: found.role || staticCoach.role,
          };
        }
        return staticCoach;
      });

      // Add any manual coaches added via admin that are not in TRAINERS
      coachesVal.forEach(c => {
        if (c.id !== "shailaa" && c.id !== "shwetambari" && !merged.some(m => m.id === c.id)) {
          merged.push(c);
        }
      });
      finalMerged = merged;
    }

    finalMerged = finalMerged.filter(c => c.id !== "shailaa");

    // Compute average ratings
    const withRatings = finalMerged.map(coach => {
      const coachRatings = ratingsVal.filter(r => r.coachId === coach.id || r.coach_id === coach.id || r.trainerId === coach.id);
      const avg = coachRatings.length > 0
        ? (coachRatings.reduce((sum, r) => sum + (Number(r.overall) || Number(r.rating) || 0), 0) / coachRatings.length).toFixed(1)
        : "4.9";
      return { ...coach, avgRating: avg };
    });

    setCoaches(withRatings);
  };

  useEffect(() => {
    reloadData();
    const interval = setInterval(reloadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const t = coaches.find(x => x.id === active) || coaches[0] || TRAINERS[0];
  const profile = profileId ? (coaches.find(x => x.id === profileId) || TRAINERS.find(x => x.id === profileId)) : null;

  const scrollToBook = () => {
    const el = document.getElementById("book");
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
  };
  return (
    <Section id="trainers" bg="var(--sand-100)">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "end", marginBottom: 56 }}>
        <EyebrowTitle eyebrow="Our Team" title={<>Coaches, not<br/><em style={{ fontStyle: "italic", color: "var(--sage-500)" }}>influencers.</em></>} />
        <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--espresso-800)", opacity: 0.85, margin: 0, maxWidth: 460 }}>
          Ten certified practitioners, each with a decade or more on the floor. Hover to preview — tap any coach to open their profile.
        </p>
      </div>

      {coaches.length === 0 ? (
        <Card tone="paper" style={{ padding: "48px 32px", textAlign: "center", marginBottom: 40, border: "1px dashed var(--hairline-strong)" }}>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 28, color: "var(--espresso-900)", marginBottom: 12 }}>
            Roster Initializing
          </div>
          <p style={{ fontSize: 14, color: "var(--clay-600)", maxWidth: 520, margin: "0 auto", lineHeight: 1.6 }}>
            This production website environment starts with a clean slate. Use the secure database administration panel on your development/PPE environment to push the initial coaches (Shwe, Manager) to the live database when you are ready.
          </p>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
          {coaches.map(tr => (
            <button key={tr.id}
              onMouseEnter={() => setActive(tr.id)}
              onClick={() => setProfileId(tr.id)}
              style={{
                border: "none", padding: 0, cursor: "pointer", background: "transparent", textAlign: "left",
                transition: "all .3s",
              }}>
              <div style={{ aspectRatio: "3/4", borderRadius: "var(--r-lg)", overflow: "hidden", position: "relative",
                border: active === tr.id ? "2px solid var(--walnut-700)" : "1px solid var(--hairline)",
                transform: active === tr.id ? "translateY(-6px)" : "none",
                boxShadow: active === tr.id ? "var(--sh-3)" : "var(--sh-1)",
                transition: "all .3s",
              }}>
                {(() => {
                  const map = { rahul: "assets/rahul.jpg", joe: "assets/joe.jpg", aakash: "assets/aakash.jpg", deepika: "assets/deepika.jpg", lee: "assets/lee.jpg", deb: "assets/deb.jpg", tarun: "assets/tarun.jpg", pilates: "assets/anisha.jpg", shahbaz: "assets/shahbaz.jpg", santo: "assets/santo.jpg" };
                  const src = tr.image_url || tr.imageUrl || map[tr.id];
                  return src
                    ? <img referrerPolicy="no-referrer" src={src} alt={tr.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    : <Placeholder label="" tone={tr.tone} w={400} h={520} />;
                })()}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(30,20,14,0) 78%, rgba(30,20,14,0.45))", pointerEvents: "none" }} />
                <div style={{ position: "absolute", left: 14, bottom: 14, right: 14, color: "var(--paper)", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div style={{ fontFamily: "var(--f-display)", fontSize: 22, lineHeight: 1 }}>{tr.name.split(" ")[0]}</div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--ochre-500)", fontWeight: "bold" }}>★ {tr.avgRating || "4.9"}</div>
                  </div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: 1.5, opacity: 0.85, marginTop: 4, textTransform: "uppercase" }}>{tr.cert}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <Card tone="paper" style={{ padding: 40, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 24 }}>
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, color: "var(--clay-600)", textTransform: "uppercase", marginBottom: 6 }}>Tap any coach above</div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 28, color: "var(--espresso-900)", lineHeight: 1.15 }}>
            Open a profile to see their full bio, core competencies, and schedule.
          </div>
        </div>
        <Btn onClick={scrollToBook}>Book a session →</Btn>
      </Card>

      <TrainerProfile trainer={profile} ratings={ratings} onClose={() => setProfileId(null)} onBook={scrollToBook} onUpdate={reloadData} />
    </Section>
  );
}

// ============ SOCIAL / INSTAGRAM ============
function SocialSection() {
  return (
    <Section id="social" bg="var(--sand-50)">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "end", marginBottom: 48 }}>
        <EyebrowTitle eyebrow="@my.thirdspace" title={<>The floor,<br/>in pictures.</>} />
        <div style={{ textAlign: "right" }}>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--espresso-800)", opacity: 0.85, margin: 0, marginLeft: "auto", maxWidth: 440 }}>
            Live from our Instagram. Workshops, member stories, ice-bath Mondays, and the occasional coach in mid-hysterics.
          </p>
          <div style={{ marginTop: 20 }}>
            <Btn as="a" href="https://www.instagram.com/my.thirdspace/" variant="secondary" size="sm">Follow →</Btn>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .ig-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 768px) {
          .ig-grid {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            padding-bottom: 16px;
            margin: 0 -24px;
            padding: 0 24px 16px;
          }
          .ig-grid::-webkit-scrollbar {
            display: none;
          }
          .ig-grid > div {
            min-width: 80vw;
            scroll-snap-align: center;
          }
        }
      `}} />
      <div className="ig-grid">
        {IG_POSTS.map((p, i) => <IGPost key={i} p={p} i={i} />)}
      </div>

      <div style={{ marginTop: 40, padding: 24, background: "var(--sand-100)", borderRadius: "var(--r-lg)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", gap: 40 }}>
          <div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 32, color: "var(--walnut-700)" }}>11.1k</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1.5, color: "var(--clay-600)", textTransform: "uppercase", marginTop: 2 }}>Followers</div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 32, color: "var(--walnut-700)" }}>405</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1.5, color: "var(--clay-600)", textTransform: "uppercase", marginTop: 2 }}>Posts</div>
          </div>
        </div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 1.5, color: "var(--clay-600)", textTransform: "uppercase" }}>
          #ATMYTHIRDSPACE
        </div>
      </div>
    </Section>
  );
}

function IGPost({ p, i }) {
  if (p.embedId) {
    return (
      <div style={{ position: "relative", aspectRatio: "9/16", borderRadius: "var(--r-md)", overflow: "hidden", border: "1px solid var(--hairline)", background: "var(--paper)" }}>
        <iframe
          src={`https://www.instagram.com/p/${p.embedId}/embed`}
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          allowtransparency="true"
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
      </div>
    );
  }

  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: "relative", aspectRatio: "9/16", borderRadius: "var(--r-md)", overflow: "hidden", cursor: "pointer", border: "1px solid var(--hairline)" }}
    >
      <Placeholder label={p.tag.toLowerCase()} tone={p.tone} w={500} h={500} />
      <div style={{
        position: "absolute", inset: 0,
        background: hover ? "rgba(30,20,14,0.78)" : "linear-gradient(180deg, rgba(30,20,14,0) 50%, rgba(30,20,14,0.45))",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: 18, color: "var(--paper)",
        transition: "background .3s",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: 2, padding: "4px 8px", background: "rgba(255,253,248,0.2)", borderRadius: 4, backdropFilter: "blur(4px)" }}>
            {p.tag}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--f-mono)", fontSize: 11 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 21s-7-4.5-7-11a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 6.5-7 11-7 11z"/></svg>
            {p.likes}
          </div>
        </div>
        <div style={{ fontFamily: "var(--f-body)", fontSize: 13, lineHeight: 1.5, opacity: hover ? 1 : 0, transition: "opacity .25s" }}>
          {p.cap}
        </div>
      </div>
    </div>
  );
}

// ============ MEMBERS PORTAL ============
function MembersSection() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [method, setMethod] = useState(null); // google, phone
  const [val, setVal] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const login = () => { setLoggedIn(true); };

  return (
    <Section id="members" bg="var(--espresso-900)" style={{ color: "var(--sand-100)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "end", marginBottom: 56 }}>
        <EyebrowTitle eyebrow="Members" title={<>Your body,<br/><em style={{ fontStyle: "italic", color: "var(--terracotta-500)" }}>measured.</em></>} color="var(--sand-100)" />
        <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--sand-200)", margin: 0, maxWidth: 440 }}>
          Log in to sync your wearable, upload BCA scans, and track how the work is translating. No spreadsheets. No guessing.
        </p>
      </div>

      {!loggedIn ? (
        <MembersLogin method={method} setMethod={setMethod} val={val} setVal={setVal} otpSent={otpSent} setOtpSent={setOtpSent} onLogin={login} />
      ) : (
        <MembersDashboard onSignOut={() => { setLoggedIn(false); setMethod(null); setVal(""); setOtpSent(false); }} />
      )}
    </Section>
  );
}

function MembersLogin({ method, setMethod, val, setVal, otpSent, setOtpSent, onLogin }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      <div style={{ background: "var(--sand-50)", color: "var(--ink)", padding: 48, borderRadius: "var(--r-xl)" }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, color: "var(--clay-600)", textTransform: "uppercase", marginBottom: 12 }}>Sign in · no password</div>
        <h3 style={{ fontFamily: "var(--f-display)", fontSize: 44, fontWeight: 400, margin: 0, lineHeight: 1.05, color: "var(--espresso-900)" }}>Welcome back.</h3>
        <p style={{ fontSize: 14, color: "var(--espresso-800)", opacity: 0.8, marginTop: 10 }}>
          Members see their training history, BCA trends, and upcoming bookings.
        </p>

        <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={() => { setMethod("google"); setTimeout(onLogin, 400); }}
            style={{
              display: "flex", alignItems: "center", gap: 14, padding: "16px 20px",
              background: "var(--paper)", border: "1.5px solid var(--hairline-strong)",
              borderRadius: "var(--r-md)", cursor: "pointer",
              fontFamily: "var(--f-body)", fontSize: 15, fontWeight: 500, color: "var(--espresso-900)",
              transition: "all .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = "var(--walnut-700)"}
            onMouseLeave={e => e.currentTarget.style.borderColor = "var(--hairline-strong)"}>
            <GoogleG />
            Continue with Google
            <span style={{ marginLeft: "auto", fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--clay-600)", letterSpacing: 1 }}>→</span>
          </button>

          <div style={{ textAlign: "center", fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, color: "var(--clay-600)", padding: "8px 0" }}>OR</div>

          <div style={{ padding: 18, border: `1.5px solid ${method === "phone" ? "var(--walnut-700)" : "var(--hairline-strong)"}`, borderRadius: "var(--r-md)", background: "var(--paper)" }}>
            <label style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, color: "var(--clay-600)", textTransform: "uppercase" }}>Phone number</label>
            <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 15, color: "var(--walnut-700)" }}>+91</span>
              <input
                type="tel" value={val} onChange={e => { setMethod("phone"); setVal(e.target.value); }}
                placeholder="98200 12345"
                style={{ flex: 1, border: "none", background: "transparent", outline: "none", fontFamily: "var(--f-body)", fontSize: 16, color: "var(--espresso-900)" }}
              />
            </div>
            {method === "phone" && !otpSent && (
              <div style={{ marginTop: 10, fontSize: 11, color: "var(--clay-600)", fontFamily: "var(--f-body)" }}>
                * Please use your WhatsApp number for easier communication.
              </div>
            )}
            {otpSent && (
              <div style={{ marginTop: 16, padding: 14, background: "var(--sand-100)", borderRadius: "var(--r-sm)" }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, color: "var(--clay-600)", textTransform: "uppercase" }}>OTP sent to +91 {val}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  {[0,1,2,3].map(i => (
                    <input key={i} maxLength={1} defaultValue={["9","1","2","4"][i]} style={{
                      width: 44, height: 48, textAlign: "center",
                      border: "1.5px solid var(--hairline-strong)", borderRadius: "var(--r-sm)",
                      background: "var(--paper)", fontFamily: "var(--f-mono)", fontSize: 20, fontWeight: 600,
                      color: "var(--walnut-700)", outline: "none",
                    }}/>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Btn onClick={() => { if (!otpSent && val.length >= 5) setOtpSent(true); else if (otpSent) onLogin(); }}
            disabled={val.length < 5} style={{ marginTop: 8, justifyContent: "center" }}>
            {otpSent ? "Verify & Sign In" : "Send OTP"}
          </Btn>
        </div>

        <div style={{ marginTop: 24, fontSize: 12, lineHeight: 1.6, color: "var(--espresso-800)", opacity: 0.7 }}>
          By continuing you agree to our Terms and Privacy. We'll never spam — we're a gym.
        </div>
      </div>

      <div style={{ padding: 48, borderRadius: "var(--r-xl)", background: "var(--walnut-700)", color: "var(--sand-100)" }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, opacity: 0.7, textTransform: "uppercase" }}>What's inside</div>
        <h3 style={{ fontFamily: "var(--f-display)", fontSize: 40, fontWeight: 400, margin: "12px 0 24px", lineHeight: 1.05 }}>Training, measured.</h3>

        {[
          { icon: "clock", title: "Wearable sync", body: "Connect Garmin, Apple Watch, WHOOP, Oura. Your sleep, HRV, and training load — in one view." },
          { icon: "heart", title: "BCA history", body: "Upload your Tanita MC-780 scan. We turn the paper into graphs and insights." },
          { icon: "calendar", title: "Booking history", body: "Every session, every coach, every note. Rebook a favorite in one tap." },
          { icon: "leaf", title: "Kenko meal log", body: "Order-ahead from our in-house cafe; meals link to your training days." },
        ].map((f, i) => (
          <div key={i} style={{ padding: "18px 0", borderBottom: i < 3 ? "1px solid rgba(245,237,224,0.15)" : "none", display: "flex", gap: 18, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,253,248,0.1)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={f.icon} size={18} color="var(--sand-100)" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{f.title}</div>
              <div style={{ fontSize: 13, lineHeight: 1.55, opacity: 0.8, marginTop: 4 }}>{f.body}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.4l6.7-6.7C35.5 2.3 30 0 24 0 14.6 0 6.6 5.4 2.6 13.2l7.8 6c1.9-5.7 7.3-9.7 13.6-9.7z"/>
      <path fill="#4285F4" d="M46.5 24.5c0-1.5-.1-3-.4-4.5H24v9h12.7c-.5 3-2.3 5.6-4.8 7.3l7.4 5.7c4.3-4 6.7-9.8 6.7-17.5z"/>
      <path fill="#FBBC05" d="M10.4 28.8c-.5-1.4-.8-2.9-.8-4.4s.3-3 .8-4.4l-7.8-6C1 17.3 0 20.5 0 24s1 6.7 2.6 9.5l7.8-4.7z"/>
      <path fill="#34A853" d="M24 48c6 0 11-2 14.7-5.4l-7.4-5.7c-2 1.4-4.6 2.2-7.3 2.2-6.3 0-11.7-4-13.6-9.6l-7.8 4.7C6.6 42.6 14.6 48 24 48z"/>
    </svg>
  );
}

function MembersDashboard({ onSignOut }) {
  const [bcaUploaded, setBcaUploaded] = useState(true); // pre-loaded sample for demo
  const [wearables, setWearables] = useState({ garmin: true, apple: false, whoop: true, oura: false });
  const latest = BCA_HISTORY[BCA_HISTORY.length - 1];
  const first = BCA_HISTORY[0];

  return (
    <div style={{ background: "var(--sand-50)", color: "var(--ink)", borderRadius: "var(--r-xl)", padding: 40 }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 28, borderBottom: "1px solid var(--hairline)", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--walnut-700)", color: "var(--paper)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-display)", fontSize: 22 }}>K</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "var(--espresso-900)" }}>Hi, Karan</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1.5, color: "var(--clay-600)", textTransform: "uppercase", marginTop: 2 }}>Member · 18 months</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 24, fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 1, color: "var(--clay-600)", textTransform: "uppercase" }}>
          <span>SESSIONS: 142</span>
          <span>STREAK: 18 DAYS</span>
          <button onClick={onSignOut} style={{ border: "none", background: "transparent", color: "var(--walnut-700)", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit", letterSpacing: "inherit", textTransform: "inherit" }}>Sign out →</button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24, marginTop: 32 }}>
        {/* Left: BCA graphs */}
        <div>
          <Card tone="paper" style={{ padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
              <div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, color: "var(--clay-600)", textTransform: "uppercase" }}>Body Composition · Tanita MC-780</div>
                <h3 style={{ fontFamily: "var(--f-display)", fontSize: 30, fontWeight: 400, margin: "6px 0 0", color: "var(--espresso-900)" }}>Your trajectory, six months.</h3>
              </div>
              <button style={{ padding: "8px 14px", background: "var(--sand-100)", border: "1px solid var(--hairline)", borderRadius: "var(--r-pill)", fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1.5, color: "var(--walnut-700)", cursor: "pointer", textTransform: "uppercase" }}>
                + Upload New Scan
              </button>
            </div>

            <BCAChart />

            <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, borderTop: "1px solid var(--hairline)" }}>
              {[
                { k: "Weight", v: `${latest.weight} kg`, d: latest.weight - first.weight, unit: "kg" },
                { k: "Body Fat", v: `${latest.fatPct}%`, d: latest.fatPct - first.fatPct, unit: "%" },
                { k: "Muscle Mass", v: `${latest.muscle} kg`, d: latest.muscle - first.muscle, unit: "kg" },
                { k: "Metabolic Age", v: `${latest.metabolicAge} yrs`, d: latest.metabolicAge - first.metabolicAge, unit: "yr" },
              ].map((m, i) => {
                const isGoodDown = m.k === "Weight" || m.k === "Body Fat" || m.k === "Metabolic Age";
                const good = isGoodDown ? m.d < 0 : m.d > 0;
                return (
                  <div key={i} style={{ padding: "20px 16px", borderRight: i < 3 ? "1px solid var(--hairline)" : "none" }}>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1.5, color: "var(--clay-600)", textTransform: "uppercase" }}>{m.k}</div>
                    <div style={{ fontFamily: "var(--f-display)", fontSize: 30, color: "var(--espresso-900)", marginTop: 6, lineHeight: 1 }}>{m.v}</div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: good ? "var(--sage-500)" : "var(--terracotta-500)", marginTop: 6 }}>
                      {m.d > 0 ? "↑" : "↓"} {Math.abs(m.d).toFixed(1)} {m.unit} vs Oct
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card tone="paper" style={{ padding: 32, marginTop: 24 }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, color: "var(--clay-600)", textTransform: "uppercase" }}>Insights · from your last scan</div>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { tone: "sage", title: "Visceral fat dropped to 12", body: "Down from 14 in October. You're now in the Normal range. Keep the Zone 2 cardio on Tue/Thu." },
                { tone: "walnut", title: "Muscle mass up 1.6 kg", body: "Strong signal from the progressive overload block. Nisha recommends bumping protein to 170g/day." },
                { tone: "terra", title: "Right-side arm asymmetry", body: "4.4 kg left vs 4.2 kg right. Suggest unilateral dumbbell work — mention to Shwetambari next session." },
              ].map((ins, i) => (
                <div key={i} style={{ padding: 16, background: "var(--sand-100)", borderLeft: `3px solid var(--${ins.tone === "sage" ? "sage-500" : ins.tone === "walnut" ? "walnut-700" : "terracotta-500"})`, borderRadius: "var(--r-sm)" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--espresso-900)" }}>{ins.title}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.55, color: "var(--espresso-800)", marginTop: 4, opacity: 0.9 }}>{ins.body}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Wearables + upcoming */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <Card tone="paper" style={{ padding: 28 }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, color: "var(--clay-600)", textTransform: "uppercase" }}>Wearables</div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 22, color: "var(--espresso-900)", marginTop: 4 }}>Sync your data</div>
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { id: "garmin", label: "Garmin Connect", body: "HR, VO2, sleep, running dynamics" },
                { id: "apple", label: "Apple Watch", body: "Activity rings, HRV, workouts" },
                { id: "whoop", label: "WHOOP 4.0", body: "Recovery, strain, sleep stages" },
                { id: "oura", label: "Oura Ring", body: "Sleep score, readiness, body temp" },
              ].map(w => {
                const on = wearables[w.id];
                return (
                  <button key={w.id} onClick={() => setWearables({ ...wearables, [w.id]: !on })}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: 14,
                      borderRadius: "var(--r-md)",
                      border: `1px solid ${on ? "var(--sage-500)" : "var(--hairline)"}`,
                      background: on ? "var(--sage-200)" : "var(--paper)",
                      cursor: "pointer", textAlign: "left", transition: "all .2s",
                    }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: on ? "var(--sage-500)" : "var(--sand-200)", color: on ? "var(--paper)" : "var(--walnut-700)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-mono)", fontSize: 11, fontWeight: 600 }}>
                      {w.id[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--espresso-900)" }}>{w.label}</div>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1, color: "var(--clay-600)", marginTop: 2 }}>{w.body}</div>
                    </div>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1.5, color: on ? "#4a5a41" : "var(--clay-600)", textTransform: "uppercase" }}>
                      {on ? "● SYNCED" : "+ CONNECT"}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card tone="walnut" style={{ padding: 28 }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, opacity: 0.7, textTransform: "uppercase" }}>Upcoming</div>
            <div style={{ fontFamily: "var(--f-display)", fontSize: 22, marginTop: 4 }}>Tomorrow · 6:30 AM</div>
            <div style={{ marginTop: 16, padding: 14, background: "rgba(255,253,248,0.08)", borderRadius: "var(--r-sm)", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--sand-200)", color: "var(--walnut-700)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--f-display)", fontSize: 14 }}>SS</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Strength w/ Shwetambari</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, opacity: 0.7, marginTop: 2 }}>60 MIN · M3S INDIRANAGAR</div>
              </div>
            </div>
            <Btn variant="secondary" size="sm" style={{ marginTop: 16, color: "var(--sand-100)", borderColor: "var(--sand-200)" }}>Reschedule</Btn>
          </Card>
        </div>
      </div>
    </div>
  );
}

function BCAChart() {
  // Plot weight, fat%, muscle over 4 time points
  const w = 620, h = 200, pad = 40;
  const dates = BCA_HISTORY.map(r => r.date);
  const series = [
    { key: "weight", label: "Weight (kg)", color: "#5E4228", range: [90, 100] },
    { key: "fatPct", label: "Body Fat %", color: "#B86B4B", range: [20, 26] },
    { key: "muscle", label: "Muscle (kg)", color: "#7B8B6F", range: [67, 71] },
  ];
  const toX = i => pad + (i / (BCA_HISTORY.length - 1)) * (w - pad * 2);
  const toY = (v, [lo, hi]) => h - pad - ((v - lo) / (hi - lo)) * (h - pad * 2);

  return (
    <div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes drawLine {
          from { stroke-dashoffset: 2000; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeInPt {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
      `}} />
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
        {/* Gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <line key={i} x1={pad} x2={w - pad} y1={pad + p * (h - pad * 2)} y2={pad + p * (h - pad * 2)} stroke="#EADBC4" strokeWidth="1" strokeDasharray={i === 0 || i === 4 ? "0" : "2,3"} />
        ))}
        {/* Date labels */}
        {dates.map((d, i) => (
          <text key={i} x={toX(i)} y={h - 12} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="#8A6640" letterSpacing="1">{d.toUpperCase()}</text>
        ))}
        {/* Series */}
        {series.map((s, si) => {
          const pts = BCA_HISTORY.map((r, i) => `${toX(i)},${toY(r[s.key], s.range)}`).join(" ");
          return (
            <g key={s.key}>
              <polyline 
                points={pts} 
                fill="none" 
                stroke={s.color} 
                strokeWidth="2.5" 
                strokeLinejoin="round" 
                strokeLinecap="round" 
                strokeDasharray="2000"
                strokeDashoffset="2000"
                style={{ animation: `drawLine 1.5s ease-out ${si * 0.2}s forwards` }}
              />
              {BCA_HISTORY.map((r, i) => (
                <circle 
                  key={i} 
                  cx={toX(i)} 
                  cy={toY(r[s.key], s.range)} 
                  r="4" 
                  fill="#FBF7F0" 
                  stroke={s.color} 
                  strokeWidth="2.5" 
                  style={{ 
                    opacity: 0, 
                    transformOrigin: `${toX(i)}px ${toY(r[s.key], s.range)}px`,
                    animation: `fadeInPt 0.4s ease-out ${1.5 + si * 0.2 + (i * 0.1)}s forwards` 
                  }} 
                />
              ))}
            </g>
          );
        })}
      </svg>
      <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
        {series.map((s, si) => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 8, opacity: 0, animation: `fadeInPt 0.4s ease-out ${si * 0.2}s forwards` }}>
            <span style={{ width: 12, height: 3, background: s.color, borderRadius: 2 }}></span>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--clay-600)", letterSpacing: 0.5 }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ KENKO LIFE ============
// Architecture: All menu data lives in KENKO_MENU (data.js).
// Update prices / add items / add categories by editing that object only.
// No JSX change needed.
function KenkoSection({ user }) {
  const C = KENKO_CONFIG;
  const cur = C.currency;
  const allItems = React.useMemo(
    () => KENKO_MENU.categories.flatMap(c => c.items),
    []
  );
  const itemById = React.useMemo(() => {
    const m = {};
    allItems.forEach(it => { m[it.id] = it; });
    return m;
  }, [allItems]);

  const [isMobile, setIsMobile] = React.useState(() => typeof window !== "undefined" && window.innerWidth < 760);
  React.useEffect(() => {
    const onR = () => setIsMobile(window.innerWidth < 760);
    window.addEventListener("resize", onR);
    return () => window.removeEventListener("resize", onR);
  }, []);

  // ── State ────────────────────────────────
  const [view, setView] = React.useState("menu"); // 'menu' | 'cart' | 'payment' | 'confirm'
  const [cart, setCart] = React.useState({});      // { [itemId]: qty }
  const [pickupTime, setPickupTime] = React.useState("");
  const [whatsappInput, setWhatsappInput] = React.useState("");
  const [confirmedWhatsapp, setConfirmedWhatsapp] = React.useState("");
  const [editContact, setEditContact] = React.useState(false);
  const [confirmedPmtMethod, setConfirmedPmtMethod] = React.useState("");
  const [confirmedTxId, setConfirmedTxId] = React.useState("");

  // ── Kenko QA Integration ────────────────
  React.useEffect(() => {
    window.__KENKO_QA_ACTION__ = (action, payload) => {
      if (action === "SET_VIEW") {
        setView(payload);
      } else if (action === "SET_CART") {
        setCart(payload);
      } else if (action === "ADD_TO_CART") {
        setCart(p => ({ ...p, [payload]: (p[payload] || 0) + 1 }));
      } else if (action === "SET_PICKUP_TIME") {
        setPickupTime(payload);
      } else if (action === "SET_WHATSAPP_INPUT") {
        setWhatsappInput(payload);
      } else if (action === "SET_CONFIRMED_WHATSAPP") {
        setConfirmedWhatsapp(payload);
      } else if (action === "RESET") {
        setCart({});
        setPickupTime("");
        setWhatsappInput("");
        setConfirmedWhatsapp("");
        setEditContact(false);
        setConfirmedPmtMethod("");
        setConfirmedTxId("");
        setView("menu");
      }
    };
    return () => {
      delete window.__KENKO_QA_ACTION__;
    };
  }, []);

  // ── Cart helpers ─────────────────────────
  const addToCart = (id) => setCart(p => ({ ...p, [id]: (p[id] || 0) + 1 }));
  const removeFromCart = (id) => setCart(p => {
    const n = { ...p };
    if (n[id] > 1) n[id]--; else delete n[id];
    return n;
  });
  const cartCount = () => Object.values(cart).reduce((s, q) => s + q, 0);
  const cartTotal = () => Object.entries(cart).reduce((s, [id, q]) => s + (itemById[id]?.price || 0) * q, 0);

  // ── Time slots: 7:00 AM → 9:00 PM, past slots disabled ─────────
  const getPickupSlots = React.useCallback(() => {
    const now = typeof window !== "undefined" && window.__M3S_GET_SIM_TIME__ ? window.__M3S_GET_SIM_TIME__() : new Date();
    const openingMins = 7 * 60;
    const closingMins = C.closingTime.h * 60 + C.closingTime.m;
    const earliestAvailable = Math.ceil((now.getHours() * 60 + now.getMinutes() + 15) / 15) * 15;
    const slots = [];
    for (let m = openingMins; m <= closingMins; m += C.pickupSlotMinutes) {
      const h = Math.floor(m / 60), min = m % 60;
      const value = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
      const suffix = h < 12 ? "AM" : "PM";
      const dispH = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const display = `${dispH}:${String(min).padStart(2, "0")} ${suffix}`;
      slots.push({ value, display, disabled: m < earliestAvailable });
    }
    return slots;
  }, [C]);

  // ── Auth helpers ────────────────────────
  const loggedInPhone = user?.phone || "";
  const isLoggedIn = !!loggedInPhone;
  const maskedPhone = (() => {
    if (!loggedInPhone) return "";
    const digits = loggedInPhone.replace(/\D/g, "");
    if (digits.length < 4) return loggedInPhone;
    return `9XXXX XX${digits.slice(-3)}`;
  })();

  // ── Order submission ───────────────────
  const buildOrderText = (waNum, pmtMethod = "", txId = "") => {
    const lines = allItems
      .filter(it => cart[it.id])
      .map(it => `  ${cart[it.id]}× ${it.name} — ${cur}${it.price * cart[it.id]}`)
      .join("\n");
    const total = cartTotal();
    const pmtLine = txId
      ? `\n*Payment Status*: PAID via Razorpay (${pmtMethod.toUpperCase()})\n*Transaction ID*: ${txId}`
      : `\n*Payment Status*: Payment collected at pickup`;
    return encodeURIComponent(
      `🥗 *New Kenko Order*\n\n${lines}\n\n*Total: ${cur}${total}*\nPickup: ${pickupTime}\nCustomer WA: ${waNum}\n${pmtLine}`
    );
  };
  const submitOrder = (waNum, pmtMethod = "", txId = "") => {
    setConfirmedPmtMethod(pmtMethod);
    setConfirmedTxId(txId);
    const text = buildOrderText(waNum, pmtMethod, txId);
    window.open(`https://wa.me/${C.whatsappNumber}?text=${text}`, "_blank");
    if (window.__M3S_LOG__) {
      window.__M3S_LOG__(`[Order] Sent to WhatsApp with number +91 ${waNum}`);
    }

    // Trigger simulated WhatsApp message confirmation
    if (window.__M3S_TRIGGER_WHATSAPP_SIM__) {
      const decodedText = decodeURIComponent(text);
      window.__M3S_TRIGGER_WHATSAPP_SIM__({
        sender: "Kenko Café",
        phone: waNum,
        message: decodedText
      });
    }

    if (C.petpoojaWebhook) {
      const payload = {
        items: allItems.filter(it => cart[it.id]).map(it => ({ id: it.id, name: it.name, qty: cart[it.id], price: it.price })),
        total: cartTotal(),
        pickupTime,
        customerWhatsapp: waNum,
        paymentStatus: txId ? "Paid" : "Pending",
        paymentMethod: txId ? `Razorpay_${pmtMethod.toUpperCase()}` : "COD",
        transactionId: txId || null,
      };
      if (window.__M3S_LOG__) {
        window.__M3S_LOG__(`[Webhook] Sending payload to Petpooja: ${C.petpoojaWebhook}`);
      }
      fetch(C.petpoojaWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(() => {
          if (window.__M3S_LOG__) window.__M3S_LOG__(`[Webhook] Petpooja POST succeeded.`);
        })
        .catch((err) => {
          if (window.__M3S_LOG__) window.__M3S_LOG__(`[Webhook] Petpooja POST error: ${err.message}`);
        });
    } else {
      if (window.__M3S_LOG__) {
        window.__M3S_LOG__(`[Webhook] No Petpooja webhook URL configured. Simulated webhook payload logged to console.`);
        console.log("Simulated Petpooja Webhook payload:", {
          items: allItems.filter(it => cart[it.id]).map(it => ({ id: it.id, name: it.name, qty: cart[it.id], price: it.price })),
          total: cartTotal(),
          pickupTime,
          customerWhatsapp: waNum,
          paymentStatus: txId ? "Paid" : "Pending",
          paymentMethod: txId ? `Razorpay_${pmtMethod.toUpperCase()}` : "COD",
          transactionId: txId || null,
        });
      }
    }
    setView("confirm");
  };

  // ── Hero header (always shown above the menu/cart/confirm view) ──
  const heroBlock = (
    <div style={{
      padding: isMobile ? 28 : 56, borderRadius: "var(--r-xl)",
      background: "var(--sage-500)", color: "var(--paper)",
      display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1.2fr 1fr",
      gap: isMobile ? 28 : 60, alignItems: "center",
      marginBottom: 40, position: "relative", overflow: "hidden",
    }}>
      <div>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 2.5, opacity: 0.85, textTransform: "uppercase" }}>
          Kenko Life × M3S
        </div>
        <h2 style={{
          fontFamily: "var(--f-display)", fontSize: "clamp(38px, 6vw, 80px)",
          fontWeight: 400, lineHeight: 1.02, margin: "16px 0 20px", letterSpacing: -1,
        }}>
          Meals that<br/><em style={{ fontStyle: "italic" }}>match the work.</em>
        </h2>
        <p style={{ fontSize: isMobile ? 15 : 17, lineHeight: 1.6, margin: 0, opacity: 0.95, maxWidth: 440 }}>
          Our in-house cafe, run by Kenko Life — whole-food bowls, cold-pressed juice, and protein that doesn't taste like protein. Order ahead; pick up after class.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
          <Btn
            as="a"
            href={`https://wa.me/${C.whatsappNumber}?text=${encodeURIComponent("Hi Kenko! I'd like to chat about a custom order.")}`}
            style={{ background: "var(--paper)", color: "var(--sage-500)", borderColor: "var(--paper)" }}
          >
            <WhatsAppIcon /> Contact on WhatsApp
          </Btn>
          <Btn variant="ghost" style={{ color: "var(--paper)" }} onClick={() => {
            const el = document.getElementById("kenko-menu-start");
            if (el) {
              const top = el.getBoundingClientRect().top + window.scrollY - 100;
              window.scrollTo({ top, behavior: "smooth" });
            }
          }}>See menu →</Btn>
        </div>
      </div>
      <div style={{ borderRadius: "var(--r-lg)", overflow: "hidden", aspectRatio: "1/1" }}>
        <img referrerPolicy="no-referrer" src="assets/kenko-bowls.jpg" alt="Kenko Life meal bowls" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      </div>
    </div>
  );

  return (
    <Section id="kenko" bg="var(--sand-100)" pad={isMobile ? "56px 0 72px" : "96px 0 120px"}>
      {heroBlock}
      <div id="kenko-menu-start" style={{ height: 0 }} />

      {view === "menu" && (
        <MenuView
          isMobile={isMobile}
          cart={cart}
          cartCount={cartCount()}
          cartTotal={cartTotal()}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onViewCart={() => setView("cart")}
          cur={cur}
        />
      )}

      {view === "cart" && (
        <CartView
          isMobile={isMobile}
          cart={cart}
          itemById={itemById}
          cartCount={cartCount()}
          cartTotal={cartTotal()}
          onAdd={addToCart}
          onRemove={removeFromCart}
          onBack={() => setView("menu")}
          pickupTime={pickupTime}
          setPickupTime={setPickupTime}
          pickupSlots={getPickupSlots()}
          isLoggedIn={isLoggedIn}
          loggedInPhone={loggedInPhone}
          maskedPhone={maskedPhone}
          whatsappInput={whatsappInput}
          setWhatsappInput={setWhatsappInput}
          editContact={editContact}
          setEditContact={setEditContact}
          onSubmit={(waNum) => {
            setConfirmedWhatsapp(waNum);
            setView("payment");
          }}
          cur={cur}
        />
      )}

      {view === "payment" && (
        <KenkoPayment
          cart={cart}
          itemById={itemById}
          cartTotal={cartTotal()}
          pickupTime={pickupTime}
          onBack={() => setView("cart")}
          onPay={(pmtMethod, txId) => {
            submitOrder(confirmedWhatsapp, pmtMethod, txId);
          }}
          cur={cur}
        />
      )}

      {view === "confirm" && (
        <ConfirmView
          isMobile={isMobile}
          cart={cart}
          itemById={itemById}
          cartTotal={cartTotal()}
          pickupTime={pickupTime}
          pmtMethod={confirmedPmtMethod}
          txId={confirmedTxId}
          onAgain={() => { setCart({}); setPickupTime(""); setWhatsappInput(""); setConfirmedWhatsapp(""); setEditContact(false); setConfirmedPmtMethod(""); setConfirmedTxId(""); setView("menu"); }}
          onHome={() => { const el = document.getElementById("home"); if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" }); }}
          cur={cur}
        />
      )}
    </Section>
  );
}

// ────────────────────────────────────────
// MENU VIEW
// ────────────────────────────────────────
function MenuView({ isMobile, cart, cartCount, cartTotal, onAdd, onRemove, onViewCart, cur }) {
  const categories = KENKO_MENU.categories;
  const [activeCat, setActiveCat] = React.useState(categories[0].id);

  const scrollToCat = (id) => {
    setActiveCat(id);
    const el = document.getElementById(`kenko-cat-${id}`);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 140;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  // Track active category on scroll
  React.useEffect(() => {
    const onScroll = () => {
      let current = categories[0].id;
      for (const c of categories) {
        const el = document.getElementById(`kenko-cat-${c.id}`);
        if (el && el.getBoundingClientRect().top - 160 <= 0) current = c.id;
      }
      setActiveCat(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Category tabs (horizontal scroll pills) */}
      <div style={{
        display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 36,
        scrollbarWidth: "none",
      }}>
        <div className="kenko-cat-tabs" style={{ display: "flex", gap: 8, flexWrap: isMobile ? "nowrap" : "wrap" }}>
          {categories.map(c => {
            const on = activeCat === c.id;
            return (
              <button key={c.id} onClick={() => scrollToCat(c.id)} style={{
                fontFamily: "var(--f-body)", fontSize: 13, fontWeight: 500,
                padding: "9px 16px", borderRadius: "var(--r-pill)",
                background: on ? "var(--walnut-700)" : "var(--sand-50)",
                color: on ? "var(--paper)" : "var(--clay-600)",
                border: `1px solid ${on ? "var(--walnut-700)" : "var(--hairline)"}`,
                cursor: "pointer", whiteSpace: "nowrap", transition: "all .2s ease",
              }}>{c.name}</button>
            );
          })}
        </div>
      </div>

      {/* Menu categories */}
      <div style={{ display: "flex", flexDirection: "column", gap: 48 }}>
        {categories.map(cat => (
          <div key={cat.id} id={`kenko-cat-${cat.id}`} style={{ scrollMarginTop: 120 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 20, flexWrap: "wrap" }}>
              <h3 style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: isMobile ? 28 : 32, fontWeight: 400, margin: 0, color: "var(--espresso-900)", letterSpacing: -0.5 }}>
                {cat.name}
              </h3>
              {cat.tag && (
                <span style={{
                  fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: 1.8, textTransform: "uppercase",
                  background: cat.tagColor || "var(--sage-500)", color: "var(--paper)",
                  padding: "4px 10px", borderRadius: "var(--r-pill)",
                }}>{cat.tag}</span>
              )}
              <div style={{ flex: 1, height: 1, background: "var(--hairline)", minWidth: 40 }} />
            </div>

            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
              gap: 14,
            }}>
              {cat.items.map(item => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  qty={cart[item.id] || 0}
                  onAdd={onAdd}
                  onRemove={onRemove}
                  cur={cur}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Sticky cart bar — fixed at bottom-center, visible only when cart has items */}
      {cartCount > 0 && (
        <button
          onClick={onViewCart}
          style={{
            position: "fixed",
            bottom: isMobile ? 90 : 28,
            left: "50%", transform: "translateX(-50%)",
            zIndex: 50,
            background: "var(--walnut-700)", color: "var(--paper)",
            border: "none", cursor: "pointer",
            padding: "14px 24px", borderRadius: "var(--r-pill)",
            boxShadow: "var(--sh-3)",
            fontFamily: "var(--f-body)", fontWeight: 600, fontSize: 14,
            display: "inline-flex", alignItems: "center", gap: 14,
            transition: "transform .2s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateX(-50%) translateY(-2px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "translateX(-50%) translateY(0)"}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <CartIcon /> {cartCount} {cartCount === 1 ? "item" : "items"}
          </span>
          <span style={{ opacity: 0.45 }}>·</span>
          <span>{cur}{cartTotal}</span>
          <span style={{ opacity: 0.45 }}>·</span>
          <span style={{ fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase" }}>
            View order →
          </span>
        </button>
      )}
    </>
  );
}

function MenuItemCard({ item, qty, onAdd, onRemove, cur }) {
  return (
    <div style={{
      background: "var(--paper)", borderRadius: "var(--r-lg)",
      border: "1px solid var(--hairline)", boxShadow: "var(--sh-1)",
      padding: "20px 24px",
      display: "flex", gap: 20, alignItems: "flex-start",
    }}>
      {/* LEFT */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <VegDot veg={item.veg} />
          <div style={{ fontFamily: "var(--f-body)", fontWeight: 600, fontSize: 16, color: "var(--espresso-900)", lineHeight: 1.3 }}>
            {item.name}
          </div>
        </div>
        <div style={{ fontFamily: "var(--f-body)", fontSize: 13, color: "var(--clay-600)", lineHeight: 1.5 }}>
          {item.desc}
        </div>
        {item.macros && (
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--clay-600)", letterSpacing: 1, marginTop: 8, textTransform: "uppercase" }}>
            {item.macros}
          </div>
        )}
        {item.tags && item.tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {item.tags.map(t => (
              <span key={t} style={{
                fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase",
                background: "var(--sand-100)", color: "var(--clay-600)",
                padding: "4px 9px", borderRadius: "var(--r-pill)",
                border: "1px solid var(--hairline)",
              }}>{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
        <div style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 22, color: "var(--espresso-900)", lineHeight: 1 }}>
          {cur}{item.price}
        </div>
        {qty === 0 ? (
          <button onClick={() => onAdd(item.id)} style={{
            background: "var(--walnut-700)", color: "var(--paper)",
            border: "none", cursor: "pointer",
            padding: "8px 16px", borderRadius: "var(--r-pill)",
            fontFamily: "var(--f-body)", fontWeight: 600, fontSize: 13,
            transition: "background .2s ease",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--espresso-800)"}
            onMouseLeave={e => e.currentTarget.style.background = "var(--walnut-700)"}
          >+ Add</button>
        ) : (
          <Stepper qty={qty} onPlus={() => onAdd(item.id)} onMinus={() => onRemove(item.id)} />
        )}
      </div>
    </div>
  );
}

function Stepper({ qty, onPlus, onMinus, size = 32 }) {
  const fontPx = size <= 26 ? 14 : 16;
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <button onClick={onMinus} style={{
        width: size, height: size, borderRadius: "50%",
        background: "var(--sand-100)", color: "var(--clay-600)",
        border: "1px solid var(--hairline)", cursor: "pointer",
        fontFamily: "var(--f-body)", fontWeight: 600, fontSize: fontPx,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        lineHeight: 1, padding: 0,
      }}>−</button>
      <span style={{ fontFamily: "var(--f-body)", fontWeight: 700, fontSize: 16, color: "var(--espresso-900)", minWidth: 20, textAlign: "center" }}>
        {qty}
      </span>
      <button onClick={onPlus} style={{
        width: size, height: size, borderRadius: "50%",
        background: "var(--walnut-700)", color: "var(--paper)",
        border: "none", cursor: "pointer",
        fontFamily: "var(--f-body)", fontWeight: 600, fontSize: fontPx,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        lineHeight: 1, padding: 0,
      }}>+</button>
    </div>
  );
}

function VegDot({ veg }) {
  const color = veg ? "#4F8B3E" : "#B83A2A";
  return (
    <span title={veg ? "Vegetarian" : "Non-vegetarian"} style={{
      width: 12, height: 12, borderRadius: 2,
      border: `1.5px solid ${color}`,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
    </span>
  );
}

function CartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 4h2l2.5 12h11L21 7H6" />
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="17" cy="20" r="1.4" />
    </svg>
  );
}

// ────────────────────────────────────────
// CART VIEW
// ────────────────────────────────────────
function CartView({
  isMobile, cart, itemById, cartCount, cartTotal,
  onAdd, onRemove, onBack,
  pickupTime, setPickupTime, pickupSlots,
  isLoggedIn, loggedInPhone, maskedPhone,
  whatsappInput, setWhatsappInput,
  editContact, setEditContact,
  onSubmit, cur,
}) {
  const cartItems = Object.entries(cart)
    .map(([id, qty]) => ({ item: itemById[id], qty }))
    .filter(r => r.item);

  const useLoggedIn = isLoggedIn && !editContact;
  const waNum = useLoggedIn ? loggedInPhone : whatsappInput;
  const waDigits = (waNum || "").replace(/\D/g, "");
  const canSubmit = pickupTime && (useLoggedIn ? waDigits.length >= 10 : waDigits.length >= 10);

  return (
    <div>
      <button onClick={onBack} style={{
        background: "transparent", border: "none", cursor: "pointer",
        fontFamily: "var(--f-body)", fontSize: 14, color: "var(--clay-600)",
        padding: 0, marginBottom: 20,
        display: "inline-flex", alignItems: "center", gap: 6,
      }}>← Menu</button>

      <div style={{
        background: "var(--paper)", borderRadius: "var(--r-xl)",
        boxShadow: "var(--sh-2)", maxWidth: 560, margin: "0 auto",
        padding: 28, position: "relative", overflow: "hidden",
      }}>
        {/* Dark header */}
        <div style={{
          background: "var(--espresso-900)", color: "var(--sand-100)",
          padding: "16px 20px", margin: "-28px -28px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "var(--ochre-500)", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ochre-500)" }} />
            Your order
          </div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: 2, textTransform: "uppercase", color: "var(--sand-300)" }}>
            {cartCount} {cartCount === 1 ? "item" : "items"}
          </div>
        </div>

        {/* Order items list */}
        <div>
          {cartItems.map((row, i) => (
            <div key={row.item.id} style={{
              borderTop: i === 0 ? "none" : "1px solid var(--hairline)",
              padding: "12px 0",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--clay-600)", letterSpacing: 1 }}>{row.qty}×</span>
                    <span style={{ fontFamily: "var(--f-body)", fontWeight: 500, fontSize: 14, color: "var(--espresso-900)" }}>{row.item.name}</span>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <Stepper qty={row.qty} onPlus={() => onAdd(row.item.id)} onMinus={() => onRemove(row.item.id)} size={26} />
                  </div>
                </div>
                <div style={{ fontFamily: "var(--f-body)", fontWeight: 600, fontSize: 14, color: "var(--walnut-700)", whiteSpace: "nowrap" }}>
                  {cur}{row.qty * row.item.price}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: "var(--hairline)", margin: "16px 0" }} />

        {/* Total */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: "var(--f-body)", fontWeight: 600, fontSize: 16, color: "var(--espresso-900)" }}>Total</span>
          <span style={{ fontFamily: "var(--f-body)", fontWeight: 700, fontSize: 20, color: "var(--walnut-700)" }}>{cur}{cartTotal}</span>
        </div>

        {/* Pickup time */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: "var(--clay-600)" }}>
            Choose pickup time
          </div>
          {pickupSlots.length > 0 && (
            <div style={{ fontFamily: "var(--f-body)", fontSize: 12, color: "var(--clay-600)", marginTop: 6, marginBottom: 12 }}>
              {pickupSlots.every(s => s.disabled) ? (
                <span style={{ color: "var(--terracotta-500)", fontWeight: 600 }}>Closed for the day. Order tomorrow from 7AM.</span>
              ) : (
                `Next available slot: ${(pickupSlots.find(s => !s.disabled) || {}).display || "Tomorrow morning"}`
              )}
            </div>
          )}

          <div>
            <select
              value={pickupTime}
              onChange={e => setPickupTime(e.target.value)}
              disabled={pickupSlots.every(s => s.disabled)}
              style={{
                width: "100%",
                backgroundColor: pickupSlots.every(s => s.disabled) ? "var(--sand-100)" : "var(--paper)", 
                color: "var(--espresso-900)",
                border: "1.5px solid var(--hairline-strong)", borderRadius: "var(--r-md)",
                padding: "12px 14px", fontFamily: "var(--f-body)", fontSize: 14,
                cursor: pickupSlots.every(s => s.disabled) ? "not-allowed" : "pointer", appearance: "none",
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23998877' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 14px center",
                paddingRight: 36,
              }}
            >
              {pickupSlots.every(s => s.disabled) ? (
                <option value="">Closed for the day. Order tomorrow from 7AM.</option>
              ) : (
                <>
                  <option value="">Pick a time</option>
                  {pickupSlots.map(s => (
                    <option key={s.value} value={s.value} disabled={s.disabled} style={s.disabled ? { color: "#bbb" } : undefined}>
                      {s.display}{s.disabled ? " — past" : ""}
                    </option>
                  ))}
                </>
              )}
            </select>
          </div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1.5, color: "var(--clay-600)", marginTop: 8 }}>
            Café open 7:00 AM – 9:00 PM · Past slots are greyed out
          </div>
          {!pickupTime && (
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--terracotta-500)", marginTop: 8 }}>
              Please select a pickup time to continue
            </div>
          )}
        </div>

        {/* Contact */}
        <div style={{ marginTop: 24 }}>
          {useLoggedIn ? (
            <>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: "var(--clay-600)" }}>
                Order confirmed to
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>
                <div style={{ fontFamily: "var(--f-body)", fontWeight: 500, fontSize: 15, color: "var(--espresso-900)" }}>
                  +91 {maskedPhone}
                </div>
                <button onClick={() => setEditContact(true)} style={{
                  background: "transparent", border: "none", cursor: "pointer", padding: 0,
                  fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
                  color: "var(--walnut-700)", textDecoration: "underline",
                }}>Edit</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: "var(--clay-600)" }}>
                Your WhatsApp number
              </div>
              <div style={{ fontFamily: "var(--f-body)", fontSize: 12, color: "var(--clay-600)", marginTop: 6, marginBottom: 10 }}>
                Order confirmation and receipt sent here
              </div>
              <input
                type="tel"
                value={whatsappInput}
                onChange={e => setWhatsappInput(e.target.value)}
                placeholder="+91 98765 43210"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "var(--paper)", color: "var(--espresso-900)",
                  border: "1.5px solid var(--hairline-strong)", borderRadius: "var(--r-md)",
                  padding: "10px 12px", fontFamily: "var(--f-body)", fontSize: 14,
                }}
              />
              {isLoggedIn && editContact && (
                <button onClick={() => { setEditContact(false); setWhatsappInput(""); }} style={{
                  background: "transparent", border: "none", cursor: "pointer", padding: 0, marginTop: 8,
                  fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
                  color: "var(--clay-600)", textDecoration: "underline",
                }}>← Use saved number</button>
              )}
            </>
          )}
        </div>

        {/* Place order */}
        <button
          disabled={!canSubmit}
          onClick={() => canSubmit && onSubmit(waNum)}
          style={{
            width: "100%", marginTop: 20,
            height: 48, borderRadius: "var(--r-pill)",
            border: "none", cursor: canSubmit ? "pointer" : "not-allowed",
            background: canSubmit ? "var(--walnut-700)" : "var(--sand-200)",
            color: canSubmit ? "var(--paper)" : "var(--clay-600)",
            fontFamily: "var(--f-body)", fontWeight: 600, fontSize: 14,
            transition: "background .2s ease",
          }}
          onMouseEnter={e => canSubmit && (e.currentTarget.style.background = "var(--espresso-800)")}
          onMouseLeave={e => canSubmit && (e.currentTarget.style.background = "var(--walnut-700)")}
        >
          {canSubmit
            ? <>Proceed to Payment →&nbsp;&nbsp;{cur}{cartTotal}</>
            : !pickupTime
              ? "Select pickup time to continue"
              : "Enter a valid WhatsApp number"}
        </button>

        <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--clay-600)", textAlign: "center", marginTop: 14 }}>
          Online Payment via Razorpay · Order goes to Kenko kitchen after payment
        </div>
      </div>
    </div>
  );
}

// ─── Razorpay-style payment screen for Kenko ────────────────────────────────
function KenkoPayment({ cart, itemById, cartTotal, pickupTime, onBack, onPay, cur }) {
  const [method, setMethod] = React.useState("upi");
  const [upiId, setUpiId] = React.useState("");
  const [upiApp, setUpiApp] = React.useState(null);
  const [card, setCard] = React.useState({ number: "", expiry: "", cvv: "", name: "", save: false });
  const [processing, setProcessing] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState("");

  const cartItems = React.useMemo(() => {
    return Object.entries(cart)
      .map(([id, qty]) => ({ item: itemById[id], qty }))
      .filter(r => r.item);
  }, [cart, itemById]);

  const convenienceFee = 0;
  const total = cartTotal + convenienceFee;

  const setCardNumber = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 16);
    const spaced = digits.replace(/(.{4})/g, "$1 ").trim();
    setCard({ ...card, number: spaced });
  };
  
  const setExpiry = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    const formatted = digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
    setCard({ ...card, expiry: formatted });
  };
  
  const setCvv = (raw) => setCard({ ...card, cvv: raw.replace(/\D/g, "").slice(0, 3) });

  const PAYMENT_METHODS = [
    { id: "upi", label: "UPI", sub: "Google Pay / PhonePe / BHIM" },
    { id: "card", label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay, Amex" },
    { id: "netbank", label: "Net Banking", sub: "All Indian banks" },
    { id: "emi", label: "EMI", sub: "3 / 6 / 9 / 12 months · No-cost options" },
  ];

  const handlePayClick = () => {
    setProcessing(true);
    setStatusMessage("Contacting payment gateway...");
    
    setTimeout(() => {
      setStatusMessage("Securing 3D Secure fallback connection...");
      setTimeout(() => {
        setStatusMessage("Authorizing ₹" + total + " with your bank...");
        setTimeout(() => {
          setProcessing(false);
          const mockTxId = "pay_" + Math.random().toString(36).substring(2, 11).toUpperCase();
          onPay(method, mockTxId);
        }, 800);
      }, 700);
    }, 600);
  };

  const pmtInputStyle = {
    width: "100%", boxSizing: "border-box",
    background: "var(--paper)", color: "var(--espresso-900)",
    border: "1.5px solid var(--hairline-strong)", borderRadius: "var(--r-md)",
    padding: "10px 12px", fontFamily: "var(--f-body)", fontSize: 13.5,
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <div style={{
        width: "100%", maxWidth: 480,
        background: "var(--paper)", borderRadius: "var(--r-xl)",
        boxShadow: "var(--sh-3)", overflow: "hidden",
        border: "1px solid var(--hairline)",
      }}>
        {/* Dark header */}
        <div style={{
          background: "var(--espresso-900)", color: "var(--paper)",
          padding: "20px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              background: "#3395FF", color: "#FFFFFF",
              padding: "4px 9px", borderRadius: 4,
              fontFamily: "var(--f-mono)", fontWeight: 700, fontSize: 12, letterSpacing: 0.5,
            }}>rzp</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, opacity: 0.7, textTransform: "uppercase" }}>
              Secure payment
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--sand-300)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="4" y="11" width="16" height="10" rx="2"/>
            <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
          </svg>
        </div>

        {processing ? (
          <div style={{ padding: "48px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: "50%",
              border: "3px solid var(--sand-200)", borderTopColor: "var(--walnut-700)",
            }} className="animate-spin" />
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--walnut-700)", fontWeight: "bold" }}>
              {statusMessage}
            </div>
            <div style={{ fontFamily: "var(--f-body)", fontSize: 13, color: "var(--clay-500)" }}>
              Please do not refresh or press back
            </div>
          </div>
        ) : (
          <>
            {/* Order summary */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--hairline)" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--clay-600)", marginBottom: 10 }}>
                Kenko Cafe Order
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 110, overflowY: "auto" }}>
                {cartItems.map((row) => (
                  <div key={row.item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 13 }}>
                    <div style={{ display: "flex", gap: 6, color: "var(--espresso-800)" }}>
                      <span style={{ fontFamily: "var(--f-mono)", color: "var(--clay-500)" }}>{row.qty}×</span>
                      <span>{row.item.name}</span>
                    </div>
                    <div style={{ fontFamily: "var(--f-body)", fontWeight: 500, color: "var(--walnut-700)" }}>
                      {cur}{row.qty * row.item.price}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--clay-600)", marginTop: 8, letterSpacing: 0.5 }}>
                Pickup time: {pickupTime}
              </div>

              <div style={{ height: 1, background: "var(--hairline)", margin: "14px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontFamily: "var(--f-body)", fontWeight: 600, fontSize: 14, color: "var(--espresso-900)" }}>Total</span>
                <span style={{ fontFamily: "var(--f-body)", fontWeight: 700, fontSize: 18, color: "var(--espresso-900)" }}>{cur}{total}</span>
              </div>
            </div>

            {/* Method selector */}
            <div style={{ padding: "20px 24px" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--clay-600)", marginBottom: 12 }}>
                Choose payment method
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {PAYMENT_METHODS.map((m) => {
                  const on = method === m.id;
                  return (
                    <div key={m.id}>
                      <button onClick={() => setMethod(m.id)} style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 12, boxSizing: "border-box",
                        padding: "12px 14px", borderRadius: "var(--r-md)",
                        border: `1px solid ${on ? "var(--walnut-700)" : "var(--hairline)"}`,
                        background: on ? "var(--sand-100)" : "var(--paper)",
                        cursor: "pointer", textAlign: "left", transition: "all .15s",
                      }}>
                        <Radio on={on} />
                        <PaymentGlyph kind={m.id} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--espresso-900)" }}>{m.label}</div>
                          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1, color: "var(--clay-600)", marginTop: 3, textTransform: "uppercase" }}>{m.sub}</div>
                        </div>
                      </button>

                      {on && m.id === "upi" && (
                        <div style={{ padding: "14px 14px 4px" }}>
                          <input
                            type="text" value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="yourname@upi"
                            style={pmtInputStyle}
                          />
                          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1.5, color: "var(--clay-600)", textTransform: "uppercase", margin: "12px 0 8px" }}>
                            Or pay with
                          </div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {[
                              { id: "gpay", label: "GPay", color: "#1A73E8" },
                              { id: "phonepe", label: "PhonePe", color: "#5F259F" },
                              { id: "bhim", label: "BHIM", color: "#00BAF2" },
                            ].map((app) => {
                              const onApp = upiApp === app.id;
                              return (
                                <button key={app.id} onClick={() => setUpiApp(onApp ? null : app.id)} style={{
                                  display: "inline-flex", alignItems: "center", gap: 8,
                                  padding: "8px 12px", borderRadius: "var(--r-pill)",
                                  border: `1px solid ${onApp ? "var(--walnut-700)" : "var(--hairline)"}`,
                                  background: onApp ? "var(--walnut-700)" : "var(--paper)",
                                  color: onApp ? "var(--paper)" : "var(--espresso-900)",
                                  cursor: "pointer", fontSize: 12, fontFamily: "var(--f-body)", fontWeight: 500,
                                  transition: "all .15s",
                                }}>
                                  <span style={{
                                    width: 16, height: 16, borderRadius: 3,
                                    background: app.color, color: "white",
                                    fontSize: 9, fontWeight: 700,
                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                  }}>{app.label[0]}</span>
                                  {app.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {on && m.id === "card" && (
                        <div style={{ padding: "14px 14px 4px", display: "flex", flexDirection: "column", gap: 10 }}>
                          <input type="text" inputMode="numeric" value={card.number}
                            onChange={(e) => setCardNumber(e.target.value)}
                            placeholder="1234 5678 9012 3456" style={pmtInputStyle} />
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                            <input type="text" inputMode="numeric" value={card.expiry}
                              onChange={(e) => setExpiry(e.target.value)}
                              placeholder="MM/YY" style={pmtInputStyle} />
                            <input type="password" inputMode="numeric" value={card.cvv}
                              onChange={(e) => setCvv(e.target.value)}
                              placeholder="CVV" style={pmtInputStyle} />
                          </div>
                          <input type="text" value={card.name}
                            onChange={(e) => setCard({ ...card, name: e.target.value })}
                            placeholder="Cardholder name" style={pmtInputStyle} />
                        </div>
                      )}

                      {on && m.id === "netbank" && (
                        <div style={{ padding: "14px 14px 4px" }}>
                          <select style={pmtInputStyle} defaultValue="">
                            <option value="" disabled>Select your bank</option>
                            <option>HDFC Bank</option>
                            <option>ICICI Bank</option>
                            <option>State Bank of India</option>
                            <option>Axis Bank</option>
                            <option>Kotak Mahindra Bank</option>
                          </select>
                        </div>
                      )}

                      {on && m.id === "emi" && (
                        <div style={{ padding: "14px 14px 4px" }}>
                          {total < 3000 ? (
                            <div style={{
                              fontSize: 12, color: "var(--terracotta-500)",
                              fontFamily: "var(--f-body)", background: "rgba(184,107,75,0.08)",
                              padding: "10px 12px", borderRadius: "10px", border: "1px dashed rgba(184,107,75,0.3)",
                              lineHeight: 1.45,
                            }}>
                              ⚠️ Available on orders above {cur}3,000. Current order total is {cur}{total}. Please choose another payment method.
                            </div>
                          ) : (
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              {["3 mo", "6 mo", "9 mo", "12 mo"].map((t) => (
                                <span key={t} style={{
                                  padding: "8px 14px", borderRadius: "var(--r-pill)",
                                  border: "1px solid var(--hairline)", background: "var(--sand-50)",
                                  fontSize: 12, color: "var(--espresso-800)", fontFamily: "var(--f-body)",
                                }}>{t}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA */}
            <div style={{ padding: "0 24px 24px" }}>
              <button onClick={handlePayClick} style={{
                width: "100%", padding: "14px 22px", borderRadius: "var(--r-pill)",
                border: "none", background: "var(--walnut-700)", color: "var(--paper)",
                fontFamily: "var(--f-body)", fontSize: 15, fontWeight: 600, letterSpacing: 0.2,
                cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
                boxShadow: "var(--sh-2)", transition: "all .2s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--espresso-800)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--walnut-700)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Pay {cur}{total} <span style={{ fontSize: 17, fontWeight: 400, lineHeight: 1 }}>→</span>
              </button>
              
              <div style={{
                marginTop: 12, fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: 2,
                color: "var(--clay-600)", textAlign: "center", textTransform: "uppercase",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="11" width="16" height="10" rx="2"/>
                  <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
                </svg>
                256-bit encrypted · Secured by Razorpay
              </div>
              <div style={{
                marginTop: 4, fontFamily: "var(--f-body)", fontSize: 10,
                color: "var(--clay-600)", textAlign: "center", opacity: 0.7,
              }}>
                Powered by <span style={{ fontFamily: "var(--f-mono)", fontWeight: 600, color: "#3395FF" }}>Razorpay</span>
              </div>

              <div style={{ marginTop: 16, textAlign: "center" }}>
                <button onClick={onBack} style={{
                  background: "transparent", border: "none", cursor: "pointer",
                  fontFamily: "var(--f-body)", fontSize: 12.5, color: "var(--clay-600)",
                  textDecoration: "underline", textUnderlineOffset: 3,
                }}>← Back to cart</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────
// CONFIRM VIEW
// ────────────────────────────────────────
function ConfirmView({ isMobile, cart, itemById, cartTotal, pickupTime, pmtMethod, txId, onAgain, onHome, cur }) {
  const cartItems = Object.entries(cart)
    .map(([id, qty]) => ({ item: itemById[id], qty }))
    .filter(r => r.item);

  return (
    <div style={{
      background: "var(--paper)", borderRadius: "var(--r-xl)",
      boxShadow: "var(--sh-3)", maxWidth: 480, margin: "0 auto",
      padding: 36, textAlign: "left",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: "var(--sage-500)",
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20,
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12l5 5L20 7" />
        </svg>
      </div>

      <h3 style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 32, fontWeight: 400, color: "var(--espresso-900)", margin: 0, letterSpacing: -0.5 }}>
        Order placed.
      </h3>
      <p style={{ fontFamily: "var(--f-body)", fontSize: 15, color: "var(--espresso-800)", lineHeight: 1.6, marginTop: 12 }}>
        Your order is heading to the Kenko kitchen.<br/>
        Pickup at <strong style={{ color: "var(--espresso-900)" }}>{pickupTime}</strong>.
      </p>

      {/* Order summary */}
      <div style={{
        background: "var(--sand-100)", borderRadius: "var(--r-lg)",
        padding: 16, marginTop: 16,
      }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", color: "var(--clay-600)", marginBottom: 10 }}>
          Order summary
        </div>
        {cartItems.map(row => (
          <div key={row.item.id} style={{
            display: "flex", justifyContent: "space-between", alignItems: "baseline",
            padding: "6px 0", fontFamily: "var(--f-body)", fontSize: 13, color: "var(--espresso-900)",
          }}>
            <span>{row.qty}× {row.item.name}</span>
            <span style={{ color: "var(--clay-600)" }}>{cur}{row.qty * row.item.price}</span>
          </div>
        ))}
        <div style={{ height: 1, background: "var(--hairline)", margin: "10px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontFamily: "var(--f-body)", fontWeight: 600, fontSize: 14, color: "var(--espresso-900)" }}>Total</span>
          <span style={{ fontFamily: "var(--f-body)", fontWeight: 700, fontSize: 16, color: "var(--walnut-700)" }}>{cur}{cartTotal}</span>
        </div>
      </div>

      <p style={{ fontFamily: "var(--f-body)", fontSize: 13, color: "var(--clay-600)", marginTop: 12, marginBottom: 0 }}>
        Receipt sent to your WhatsApp.
      </p>

      <div style={{
        background: "var(--sand-100)", borderRadius: "var(--r-lg)",
        border: "1px solid var(--hairline)",
        padding: "14px 16px", marginTop: 10,
      }}>
        {txId ? (
          <div style={{ fontFamily: "var(--f-body)", fontSize: 14, fontWeight: 600, color: "var(--espresso-900)", lineHeight: 1.5 }}>
            🎉 Payment Successful via Razorpay!<br/>
            <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--sage-500)", fontWeight: "bold" }}>Method: {pmtMethod?.toUpperCase()} · Ref: {txId}</span><br/>
            <span style={{ fontSize: 13, color: "var(--clay-600)", fontWeight: "normal" }}>Your prepaid order is confirmed. We will have it ready at your pickup time.</span>
          </div>
        ) : (
          <div style={{ fontFamily: "var(--f-body)", fontSize: 15, fontWeight: 600, color: "var(--espresso-900)", lineHeight: 1.5 }}>
            Please collect your order and pay at Kenko Café, 1st floor.<br/>
            We'll have it ready at your pickup time.
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: isMobile ? "wrap" : "nowrap" }}>
        <button onClick={onAgain} style={{
          flex: 1,
          background: "transparent", color: "var(--walnut-700)",
          border: "1px solid var(--walnut-700)", borderRadius: "var(--r-pill)",
          padding: "12px 22px", cursor: "pointer",
          fontFamily: "var(--f-body)", fontWeight: 500, fontSize: 14,
        }}>Order again</button>
        <button onClick={onHome} style={{
          flex: 1,
          background: "var(--walnut-700)", color: "var(--paper)",
          border: "none", borderRadius: "var(--r-pill)",
          padding: "12px 22px", cursor: "pointer",
          fontFamily: "var(--f-body)", fontWeight: 600, fontSize: 14,
        }}>Back to home</button>
      </div>
    </div>
  );
}

function WhatsAppIcon({ small }) {
  const s = small ? 13 : 16;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.3 0-.5 0-.1-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.6 2.6 1 3.1.8 3.7.8.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.6 1.4 5.1L2 22l5-1.3c1.5.8 3.2 1.3 5 1.3 5.5 0 10-4.5 10-10S17.5 2 12 2z"/>
    </svg>
  );
}



// Booking flow — Calendly-style: pick by trainer availability OR by any trainer slot
// Now supports SINGLE or BULK (multi-day) booking with package discounts.


// Per-session price (INR)
const SESSION_PRICE = 2400;

// ─── Booking policy: simulated "now" for prototype demo ─────────────────
// We use standard new Date() for production
const CUTOFF_HOUR = 20; // 8pm

function getSimulatedNow() {
  return new Date();
}

function isAfterCutoff() { 
  return getSimulatedNow().getHours() >= CUTOFF_HOUR; 
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isTomorrow(date) {
  const t = new Date(getSimulatedNow()); 
  t.setDate(getSimulatedNow().getDate() + 1);
  return isSameDay(date, t);
}

function isSunday(date) { 
  return date.getDay() === 0; 
}

// A day's PT slots are unbookable if: it's Sunday, OR it's tomorrow and we're past cutoff.
function isDayLocked(date) {
  if (isSunday(date)) return "sunday";
  if (isTomorrow(date) && isAfterCutoff()) return "cutoff";
  return null;
}

// Duration packages — user picks one explicitly (NOT span-derived).
// Each maps to a number of weeks the schedule will cover.
const DURATIONS = [
  { id: "twoweek", weeks: 2, days: 14, pct: 5,  label: "2 weeks",  sub: "5% off"  },
  { id: "month",   weeks: 4, days: 28, pct: 10, label: "1 month",  sub: "10% off" },
  { id: "twomo",   weeks: 8, days: 56, pct: 15, label: "2 months", sub: "15% off" },
];
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEKDAY_SHORT  = ["S", "M", "T", "W", "T", "F", "S"];

// Given chosen weekday-of-week numbers (Set of 0-6) + a duration in days,
// return the indices into BOOKING_DAYS that fall on those weekdays within [day0, day0+durationDays).
function expandSchedule(weekdaySet, durationDays) {
  const out = [];
  for (let i = 0; i < Math.min(durationDays, BOOKING_DAYS.length); i++) {
    if (weekdaySet.has(BOOKING_DAYS[i].date.getDay())) out.push(i);
  }
  return out;
}

function Booking({ initialMode = "time", user = null, onSignIn = null }) {
  const [mode, setMode] = useState(initialMode);             // "time" or "trainer"
  const [bookingType, setBookingType] = useState("single");  // "single" or "bulk"
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState(null);
  const [auth, setAuth] = useState({ method: null, value: "", reminders: ["email", "sms"] });
  const [banner, setBanner] = useState(null); // { method, value } | null

  // Support responsive simulation time
  const [simTime, setSimTime] = useState(new Date(2026, 3, 17, 21, 0));

  useEffect(() => {
    window.__M3S_SET_SIM_TIME__ = (newTime) => {
      setSimTime(newTime);
    };
    window.__M3S_GET_SIM_TIME__ = () => simTime;
    return () => {
      delete window.__M3S_SET_SIM_TIME__;
      delete window.__M3S_GET_SIM_TIME__;
    };
  }, [simTime]);

  useEffect(() => {
    window.__M3S_QA_ACTION__ = (action, payload) => {
      if (action === "SET_STEP") {
        setStep(payload);
      } else if (action === "SET_SELECTION") {
        setSelection(payload);
      } else if (action === "SET_AUTH") {
        setAuth(payload);
      } else if (action === "SET_BOOKING_TYPE") {
        setBookingType(payload);
      } else if (action === "SET_MODE") {
        setMode(payload);
      } else if (action === "RESET") {
        reset();
      }
    };
    return () => {
      delete window.__M3S_QA_ACTION__;
    };
  }, []);

  // Auto-dismiss the confirm banner after 6s
  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 6000);
    return () => clearTimeout(t);
  }, [banner]);

  const confirmBooking = () => {
    setStep(3); // → payment
  };

  const payAndComplete = () => {
    setBanner({ method: auth.method, value: auth.value });
    setStep(4); // → success

    // Trigger simulated WhatsApp message confirmation
    if (window.__M3S_TRIGGER_WHATSAPP_SIM__) {
      const isBulk = selection?.type === "bulk";
      const total = isBulk 
        ? (selection.sessions * SESSION_PRICE - Math.round(selection.sessions * SESSION_PRICE * selection.tier.pct / 100))
        : SESSION_PRICE;
      
      const messageText = isBulk
        ? `🏋️‍♂️ *My Third Space Booking Confirmed!*\n\nHello! Your package booking is confirmed:\n*Plan*: ${selection.duration.label} (${selection.sessions} Sessions)\n*Schedule*: ${selection.weekdays.map(n => WEEKDAY_LABELS[n]).join(", ")} at ${selection.times.join(", ")}\n*Total Paid*: ₹ ${total.toLocaleString("en-IN")}\n\nWe look forward to seeing you on the gym floor!`
        : `🏋️‍♂️ *My Third Space Booking Confirmed!*\n\nHello! Your PT session is confirmed:\n*Coach*: ${selection.trainer.name}\n*When*: ${selection.day.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at ${selection.time} IST\n*Duration*: 60 min\n*Total Paid*: ₹ ${SESSION_PRICE.toLocaleString("en-IN")}\n\nWe look forward to seeing you on the gym floor!`;

      window.__M3S_TRIGGER_WHATSAPP_SIM__({
        sender: "My Third Space",
        phone: auth.value,
        message: messageText
      });
    }
  };

  const reset = () => {
    setStep(1); setSelection(null);
    setAuth({ method: null, value: "", reminders: ["email", "sms"] });
  };

  return (
    <section id="book" style={{ background: "var(--sand-50)", padding: "120px 0 140px", position: "relative" }}>
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 40, alignItems: "end", marginBottom: 16 }}>
          <EyebrowTitle
            eyebrow="Book a session"
            title={<>Reserve your hour.</>}
            lead="One session, a week, or a full two-month block. Pick a coach or a time — the package discount kicks in automatically as you commit further out."
          />
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 2, color: "var(--clay-600)", textTransform: "uppercase" }}>
            Step {step} / 4
          </div>
        </div>
        <div style={{
          fontFamily: "var(--f-body)", fontSize: 13, lineHeight: 1.5,
          color: "var(--clay-600)", marginBottom: 32, maxWidth: 640,
          paddingLeft: 14, borderLeft: "2px solid var(--hairline-strong)",
        }}>
          PT sessions can be booked until 8pm the evening before.
          Sundays are group classes only &mdash; no PT on Sundays.
        </div>

        <BookingStepper step={step} />

        {step === 1 && (
          <BookingPick
            mode={mode} setMode={setMode}
            bookingType={bookingType} setBookingType={setBookingType}
            onConfirm={(sel) => { setSelection(sel); setStep(2); }}
          />
        )}
        {step === 2 && (
          <BookingLogin
            user={user} onSignIn={onSignIn}
            selection={selection}
            auth={auth} setAuth={setAuth}
            onBack={() => setStep(1)}
            onConfirm={confirmBooking}
          />
        )}
        {step === 3 && (
          <BookingPayment
            selection={selection} auth={auth}
            onBack={() => setStep(2)}
            onPay={payAndComplete}
          />
        )}
        {step === 4 && (
          <BookingSuccess selection={selection} auth={auth} onReset={reset} />
        )}
      </div>

      {banner && <ConfirmBanner method={banner.method} value={banner.value} onClose={() => setBanner(null)} />}
    </section>
  );
}

function BookingPick({ mode, setMode, bookingType, setBookingType, onConfirm }) {
  const PT = PT_TRAINERS || TRAINERS;
  const [trainerId, setTrainerId] = useState(PT[0].id);

  // Single-mode state
  const [dayIdx, setDayIdx] = useState(0);
  const [selected, setSelected] = useState(null); // {time, trainerId}
  const [weekOffset, setWeekOffset] = useState(0);

  // Bulk-mode state — NEW model: cadence + duration drive the schedule, not free-form dates.
  const [daysPerWeek, setDaysPerWeek]   = useState(3);                  // 2 / 3 / 4 / 5
  const [weekdays, setWeekdays]         = useState(new Set([1, 3, 5])); // weekday-of-week numbers, 0=Sun..6=Sat
  const [durationId, setDurationId]     = useState("twoweek");          // 2wk / 1mo / 2mo
  const [bulkTimes, setBulkTimes]       = useState([]);                 // "HH:MM" strings — applied to every chosen weekday

  // ─── SINGLE mode views ────────────────────────────────────────────────
  const day = BOOKING_DAYS[dayIdx];
  const filteredSlots = useMemo(() => {
    if (mode === "trainer") return day.slots.filter((s) => s.trainerId === trainerId);
    const map = {};
    day.slots.forEach((s) => { (map[s.time] = map[s.time] || []).push(s.trainerId); });
    return Object.entries(map).map(([time, ids]) => ({ time, ids }));
  }, [mode, trainerId, dayIdx]);

  const duration = DURATIONS.find(d => d.id === durationId) || DURATIONS[0];
  const scheduledDayIdxs = useMemo(() => expandSchedule(weekdays, duration.days), [weekdays, duration.days]);

  // ─── BULK aggregation under the new model ─────────────────────────────
  // For each scheduled day, count how many of the picked time slots have an available trainer.
  const bulkSummary = useMemo(() => {
    if (scheduledDayIdxs.length === 0 || bulkTimes.length === 0) {
      return { sessions: 0, perDay: [], misses: 0 };
    }
    let sessions = 0, misses = 0;
    const perDay = scheduledDayIdxs.map((idx) => {
      const d = BOOKING_DAYS[idx];
      const hits = bulkTimes.map((t) => {
        const slotMatch = d.slots.find((s) => s.time === t && (mode === "time" || s.trainerId === trainerId));
        if (slotMatch) sessions += 1; else misses += 1;
        return { time: t, ok: !!slotMatch, trainerId: slotMatch?.trainerId };
      });
      return { idx, day: d, hits };
    });
    return { sessions, perDay, misses };
  }, [scheduledDayIdxs, bulkTimes, trainerId, mode]);

  // Times rail: union of all times that appear in BOOKING_DAYS (deterministic order)
  const ALL_TIMES = useMemo(() => {
    const set = new Set();
    BOOKING_DAYS.forEach((d) => d.slots.forEach((s) => set.add(s.time)));
    return [...set].sort();
  }, []);

  const isBulk = bookingType === "bulk";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 24 }}>
      {/* ─── LEFT: mode + booking type + trainer ─── */}
      <Card tone="paper" style={{ padding: 32 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--clay-600)", marginBottom: 16 }}>
          01 · How would you like to book?
        </div>
        <div style={{ display: "flex", gap: 4, background: "var(--sand-100)", padding: 4, borderRadius: "var(--r-pill)", border: "1px solid var(--hairline)" }}>
          {[
            { id: "trainer", label: "By trainer", icon: "user" },
            { id: "time", label: "By time", icon: "clock" },
          ].map((m) => (
            <button key={m.id}
              onClick={() => { setMode(m.id); setSelected(null); }}
              style={pillBtn(mode === m.id)}>
              <Icon name={m.icon} size={14} /> {m.label}
            </button>
          ))}
        </div>

        {/* Single vs Bulk */}
        <div style={{ marginTop: 24, fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--clay-600)", marginBottom: 12 }}>
          02 · Single or recurring?
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {[
            { id: "single", label: "Single session", sub: "One day, one slot" },
            { id: "bulk",   label: "Multi-day plan", sub: "Bulk discount up to 15%" },
          ].map((b) => {
            const on = bookingType === b.id;
            return (
              <button key={b.id} onClick={() => setBookingType(b.id)} style={{
                padding: 14, borderRadius: "var(--r-md)",
                border: `1.5px solid ${on ? "var(--walnut-700)" : "var(--hairline)"}`,
                background: on ? "var(--sand-100)" : "var(--paper)",
                cursor: "pointer", textAlign: "left", transition: "all .15s",
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--espresso-900)" }}>{b.label}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1, color: "var(--clay-600)", marginTop: 4, textTransform: "uppercase" }}>{b.sub}</div>
              </button>
            );
          })}
        </div>

        <div style={{ marginTop: 24, fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--clay-600)", marginBottom: 14 }}>
          {mode === "trainer" ? "03 · Pick your coach" : "03 · Pick a focus (optional)"}
        </div>

        {mode === "trainer" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PT.map((t) => (
              <button key={t.id}
                onClick={() => { setTrainerId(t.id); setSelected(null); }}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: 14, borderRadius: "var(--r-md)",
                  border: `1px solid ${trainerId === t.id ? "var(--walnut-700)" : "var(--hairline)"}`,
                  background: trainerId === t.id ? "var(--sand-100)" : "var(--paper)",
                  cursor: "pointer", textAlign: "left", transition: "all .2s",
                }}>
                <TrainerAvatar t={t} size={42} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "var(--espresso-900)" }}>{t.name}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1, color: "var(--clay-600)", marginTop: 2, textTransform: "uppercase" }}>{t.role}</div>
                </div>
                {trainerId === t.id && <Icon name="check" size={16} color="var(--walnut-700)" />}
              </button>
            ))}
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--espresso-800)", opacity: 0.75, margin: 0 }}>
              Any trainer who has this slot open will be offered. You'll see all available coaches at that time — pick whoever resonates.
            </p>
            <div style={{ marginTop: 20, display: "flex", flexWrap: "wrap", gap: 6 }}>
              {["Strength", "Mobility", "Recovery", "Yoga", "Cardio", "Assessment"].map((g) => (
                <Chip key={g} tone="sand">{g}</Chip>
              ))}
            </div>
          </div>
        )}

        {/* Bulk pricing preview */}
        {isBulk && (
          <BulkPricingCard
            sessions={bulkSummary.sessions}
            duration={duration}
            scheduledDays={scheduledDayIdxs.length}
            timesCount={bulkTimes.length}
          />
        )}
      </Card>

      {/* ─── RIGHT: day + slots ─── */}
      <Card tone="paper" style={{ padding: 32 }}>
        {!isBulk ? (
          <SingleDaySlots
            mode={mode} trainerId={trainerId}
            dayIdx={dayIdx} setDayIdx={(i) => { setDayIdx(i); setSelected(null); }}
            selected={selected} setSelected={setSelected}
            day={day} filteredSlots={filteredSlots}
            onConfirm={onConfirm}
            weekOffset={weekOffset} setWeekOffset={setWeekOffset}
          />
        ) : (
          <BulkPicker
            mode={mode} trainerId={trainerId}
            daysPerWeek={daysPerWeek} setDaysPerWeek={setDaysPerWeek}
            weekdays={weekdays} setWeekdays={setWeekdays}
            durationId={durationId} setDurationId={setDurationId}
            duration={duration}
            bulkTimes={bulkTimes} setBulkTimes={setBulkTimes}
            allTimes={ALL_TIMES}
            scheduledDayIdxs={scheduledDayIdxs}
            summary={bulkSummary}
            onConfirm={() => onConfirm({
              type: "bulk",
              trainer: TRAINERS.find(t => t.id === trainerId),
              mode,
              daysPerWeek,
              weekdays: [...weekdays],
              duration,
              days: scheduledDayIdxs.map(i => BOOKING_DAYS[i]),
              times: bulkTimes,
              sessions: bulkSummary.sessions,
              tier: duration,
              perDay: bulkSummary.perDay,
            })}
          />
        )}
      </Card>
    </div>
  );
}

// ─── Single-day slot picker (existing flow, lightly cleaned) ───────────────
function SingleDaySlots({ mode, trainerId, dayIdx, setDayIdx, selected, setSelected, day, filteredSlots, onConfirm, weekOffset, setWeekOffset }) {
  const WEEK = 7;
  const visibleStart = weekOffset * WEEK;
  const visibleDays = BOOKING_DAYS.slice(visibleStart, visibleStart + WEEK);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--clay-600)" }}>
          04 · Choose a day
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))} disabled={weekOffset === 0} style={navBtn(weekOffset === 0)}>←</button>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1.5, color: "var(--clay-600)", minWidth: 80, textAlign: "center" }}>
            Week {weekOffset + 1} / {Math.ceil(BOOKING_DAYS.length / WEEK)}
          </div>
          <button onClick={() => setWeekOffset(Math.min(Math.ceil(BOOKING_DAYS.length / WEEK) - 1, weekOffset + 1))} disabled={visibleStart + WEEK >= BOOKING_DAYS.length} style={navBtn(visibleStart + WEEK >= BOOKING_DAYS.length)}>→</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 28 }}>
        {visibleDays.map((d, i) => {
          const realIdx = visibleStart + i;
          const isActive = realIdx === dayIdx;
          const lock = isDayLocked(d.date);
          const tomorrowCutoff = lock === "cutoff";
          return (
            <div key={d.iso} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <button onClick={() => setDayIdx(realIdx)}
                style={{
                  padding: "12px 6px", borderRadius: "var(--r-md)",
                  border: `1px solid ${isActive ? "var(--walnut-700)" : "var(--hairline)"}`,
                  background: isActive ? "var(--walnut-700)" : "var(--paper)",
                  color: isActive ? "var(--paper)" : "var(--espresso-900)",
                  cursor: "pointer", textAlign: "center", transition: "all .2s",
                  position: "relative",
                }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: 1, opacity: 0.7, textTransform: "uppercase" }}>{d.label}</div>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 22, marginTop: 2, lineHeight: 1 }}>{d.day}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, opacity: 0.7, marginTop: 2, textTransform: "uppercase" }}>{d.month}</div>
                {lock && (
                  <div style={{
                    position: "absolute", top: 6, right: 6,
                    width: 6, height: 6, borderRadius: "50%",
                    background: lock === "sunday" ? "var(--terracotta-500)" : "var(--ochre-500)",
                  }} />
                )}
              </button>
              {tomorrowCutoff && (
                <div style={{
                  fontFamily: "var(--f-mono)", fontSize: 8.5, letterSpacing: 1, lineHeight: 1.35,
                  color: "var(--terracotta-500)", textAlign: "center", textTransform: "uppercase",
                  fontWeight: 600, marginTop: 4,
                }}>
                  BOOKING CLOSED<br/>
                  <span style={{ fontSize: 7.5, opacity: 0.85 }}>OPENS TOMORROW</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--clay-600)", marginBottom: 14 }}>
        05 · Available slots — {day.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </div>

      {(() => { const lock = isDayLocked(day.date); return lock === "sunday" ? (
        <div style={{
          padding: "48px 24px", borderRadius: "var(--r-md)",
          background: "var(--sand-200)", border: "1px solid var(--hairline)",
          textAlign: "center",
        }}>
          <div style={{
            fontFamily: "var(--f-mono)", fontSize: 13, letterSpacing: 2,
            textTransform: "uppercase", color: "var(--clay-600)", fontWeight: 600,
          }}>No PT Sundays</div>
          <div style={{
            fontFamily: "var(--f-body)", fontSize: 13, fontStyle: "italic",
            color: "var(--clay-600)", marginTop: 10, lineHeight: 1.55,
          }}>Group classes only — see schedule</div>
        </div>
      ) : null; })()}

      {isDayLocked(day.date) !== "sunday" && (mode === "trainer" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {filteredSlots.length === 0 && <EmptyState trainer={TRAINERS.find(t => t.id === trainerId)} />}
          {filteredSlots.map((s, i) => {
            const isSel = selected && selected.time === s.time && selected.trainerId === s.trainerId;
            const disabled = isDayLocked(day.date) === "cutoff";
            return (
              <button key={i}
                onClick={disabled ? undefined : () => setSelected({ time: s.time, trainerId: s.trainerId })}
                disabled={disabled}
                style={disabled ? disabledSlotBtn() : slotBtn(isSel)}>
                <div style={{ fontFamily: "var(--f-display)", fontSize: 20, lineHeight: 1 }}>{s.time}</div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, marginTop: 4, opacity: 0.7, textTransform: "uppercase" }}>60 min</div>
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
          {filteredSlots.length === 0 && <div style={{ padding: 24, color: "var(--clay-600)" }}>No slots this day.</div>}
          {filteredSlots.map((row) => {
            const isSelRow = selected && selected.time === row.time;
            const disabled = isDayLocked(day.date) === "cutoff";
            return (
              <div key={row.time} style={{
                padding: 14, borderRadius: "var(--r-md)",
                border: `1px solid ${isSelRow ? "var(--walnut-700)" : "var(--hairline)"}`,
                background: disabled ? "var(--sand-200)" : "var(--paper)",
                opacity: disabled ? 0.55 : 1,
                pointerEvents: disabled ? "none" : "auto",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontFamily: "var(--f-display)", fontSize: 22, color: "var(--espresso-900)" }}>{row.time}</div>
                  <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--clay-600)", letterSpacing: 1 }}>{row.ids.length} OPEN</div>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  {row.ids.map((id) => {
                    const t = TRAINERS.find(x => x.id === id);
                    const pick = selected && selected.time === row.time && selected.trainerId === id;
                    return (
                      <button key={id} onClick={() => setSelected({ time: row.time, trainerId: id })}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "6px 10px", borderRadius: "var(--r-pill)",
                          border: `1px solid ${pick ? "var(--walnut-700)" : "var(--hairline)"}`,
                          background: pick ? "var(--walnut-700)" : "var(--sand-50)",
                          color: pick ? "var(--paper)" : "var(--espresso-900)",
                          cursor: "pointer", fontSize: 12, fontFamily: "var(--f-body)",
                          transition: "all .15s",
                        }}>
                        <TrainerAvatar t={t} size={18} />
                        {t.name.split(" ")[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {selected && (
        <div style={{
          marginTop: 28, padding: 20, borderRadius: "var(--r-md)",
          background: "var(--sand-100)", border: "1px solid var(--hairline)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <TrainerAvatar t={TRAINERS.find(t => t.id === selected.trainerId)} size={40} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{TRAINERS.find(t => t.id === selected.trainerId).name}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--clay-600)", marginTop: 2 }}>
                {day.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · {selected.time} · 60 min
              </div>
            </div>
          </div>
          <Btn onClick={() => onConfirm({ type: "single", trainer: TRAINERS.find(t => t.id === selected.trainerId), day, time: selected.time })} icon={<Icon name="arrow" size={14} />}>
            Continue
          </Btn>
        </div>
      )}
    </>
  );
}

// ─── Bulk picker: multi-day grid + multi-time grid + summary ───────────────
function BulkPicker({ mode, trainerId, daysPerWeek, setDaysPerWeek, weekdays, setWeekdays, durationId, setDurationId, duration, bulkTimes, setBulkTimes, allTimes, scheduledDayIdxs, summary, onConfirm }) {
  const toggleWeekday = (n) => {
    const next = new Set(weekdays);
    if (next.has(n)) next.delete(n); else {
      if (next.size >= daysPerWeek) {
        // Drop the earliest-added (smallest weekday) to keep cap.
        const first = [...next].sort()[0];
        next.delete(first);
      }
      next.add(n);
    }
    setWeekdays(next);
  };
  const toggleTime = (t) => {
    setBulkTimes(bulkTimes.includes(t) ? bulkTimes.filter(x => x !== t) : [...bulkTimes, t]);
  };
  const handleCadence = (n) => {
    setDaysPerWeek(n);
    // Trim weekdays down if user reduced cadence
    if (weekdays.size > n) {
      const trimmed = new Set([...weekdays].sort().slice(0, n));
      setWeekdays(trimmed);
    }
  };
  const ready = weekdays.size === daysPerWeek && bulkTimes.length > 0 && summary.sessions > 0;
  const cadenceComplete = weekdays.size === daysPerWeek;

  return (
    <>
      {/* 04 · Days per week */}
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--clay-600)", marginBottom: 12 }}>
        04 · How many days per week?
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 22 }}>
        {[2, 3, 4, 5].map((n) => {
          const on = daysPerWeek === n;
          return (
            <button key={n} onClick={() => handleCadence(n)} style={{
              padding: "12px 8px", borderRadius: "var(--r-md)",
              border: `1.5px solid ${on ? "var(--walnut-700)" : "var(--hairline)"}`,
              background: on ? "var(--walnut-700)" : "var(--paper)",
              color: on ? "var(--paper)" : "var(--espresso-900)",
              cursor: "pointer", textAlign: "center", transition: "all .15s",
            }}>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 22, lineHeight: 1 }}>{n}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, marginTop: 4, opacity: 0.7, textTransform: "uppercase" }}>days / wk</div>
            </button>
          );
        })}
      </div>

      {/* 05 · Which weekdays */}
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--clay-600)", marginBottom: 12 }}>
        05 · Which days?
        <span style={{ color: cadenceComplete ? "var(--sage-500)" : "var(--walnut-700)", marginLeft: 8 }}>
          {weekdays.size} / {daysPerWeek} picked
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6, marginBottom: 22 }}>
        {WEEKDAY_LABELS.map((lbl, n) => {
          const on = weekdays.has(n);
          return (
            <button key={n} onClick={() => toggleWeekday(n)} style={{
              padding: "14px 6px", borderRadius: "var(--r-md)",
              border: `1.5px solid ${on ? "var(--walnut-700)" : "var(--hairline)"}`,
              background: on ? "var(--walnut-700)" : "var(--paper)",
              color: on ? "var(--paper)" : "var(--espresso-900)",
              cursor: "pointer", textAlign: "center", transition: "all .15s",
            }}>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 18, lineHeight: 1 }}>{lbl}</div>
            </button>
          );
        })}
      </div>

      {/* 06 · Duration */}
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--clay-600)", marginBottom: 12 }}>
        06 · Duration
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 22 }}>
        {DURATIONS.map((d) => {
          const on = durationId === d.id;
          return (
            <button key={d.id} onClick={() => setDurationId(d.id)} style={{
              padding: 14, borderRadius: "var(--r-md)", textAlign: "left",
              border: `1.5px solid ${on ? "var(--walnut-700)" : "var(--hairline)"}`,
              background: on ? "var(--sand-100)" : "var(--paper)",
              cursor: "pointer", transition: "all .15s",
            }}>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 20, color: "var(--espresso-900)", lineHeight: 1 }}>{d.label}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: on ? "var(--walnut-700)" : "var(--clay-600)", marginTop: 6, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>{d.sub}</div>
            </button>
          );
        })}
      </div>

      {/* 07 · Time slots */}
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--clay-600)", marginBottom: 12 }}>
        07 · Pick time slots <span style={{ color: "var(--walnut-700)", marginLeft: 8 }}>{bulkTimes.length} selected</span>
        <div style={{ marginTop: 4, fontFamily: "var(--f-body)", fontSize: 12, fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--clay-600)" }}>
          Applied to every chosen weekday across the {duration.label.toLowerCase()}.
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 20 }}>
        {allTimes.map((t) => {
          const on = bulkTimes.includes(t);
          return (
            <button key={t} onClick={() => toggleTime(t)} style={slotBtn(on)}>
              <div style={{ fontFamily: "var(--f-display)", fontSize: 18, lineHeight: 1 }}>{t}</div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9, marginTop: 4, opacity: 0.7, textTransform: "uppercase" }}>60 min</div>
            </button>
          );
        })}
      </div>

      {/* Schedule preview */}
      {scheduledDayIdxs.length > 0 && bulkTimes.length > 0 && (
        <div style={{
          marginTop: 8, padding: 14, borderRadius: "var(--r-md)",
          background: "var(--sand-50)", border: "1px solid var(--hairline)",
          maxHeight: 200, overflowY: "auto",
        }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--clay-600)", marginBottom: 10 }}>
            Schedule preview · {summary.sessions} session{summary.sessions === 1 ? "" : "s"}{summary.misses > 0 ? ` · ${summary.misses} unavailable` : ""}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {summary.perDay.slice(0, 16).map((row) => (
              <div key={row.idx} style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 12, alignItems: "center", fontSize: 12 }}>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: 1, color: "var(--espresso-900)" }}>
                  {row.day.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {row.hits.map((h) => (
                    <span key={h.time} style={{
                      padding: "3px 8px", borderRadius: 999,
                      background: h.ok ? "var(--walnut-700)" : "transparent",
                      color: h.ok ? "var(--paper)" : "var(--clay-600)",
                      border: h.ok ? "none" : "1px dashed var(--hairline-strong)",
                      fontFamily: "var(--f-mono)", fontSize: 10.5, letterSpacing: 0.5,
                      textDecoration: h.ok ? "none" : "line-through",
                    }}>{h.time}</span>
                  ))}
                </div>
              </div>
            ))}
            {summary.perDay.length > 16 && (
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--clay-600)", letterSpacing: 1, textAlign: "center", paddingTop: 6 }}>
                +{summary.perDay.length - 16} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Continue */}
      <div style={{
        marginTop: 24, padding: 20, borderRadius: "var(--r-md)",
        background: "var(--sand-100)", border: "1px solid var(--hairline)",
        display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16,
      }}>
        <div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1.5, color: "var(--clay-600)", textTransform: "uppercase" }}>
            {ready ? `${duration.label} · ${duration.pct}% off` : "Complete cadence, duration, and times to continue"}
          </div>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 22, color: "var(--espresso-900)", marginTop: 4 }}>
            {ready ? `${summary.sessions} sessions · ${formatINR(calcTotal(summary.sessions, duration.pct))}` : "—"}
          </div>
        </div>
        <Btn disabled={!ready} onClick={onConfirm} icon={<Icon name="arrow" size={14} />}>Continue</Btn>
      </div>
    </>
  );
}

function BulkPricingCard({ sessions, duration, scheduledDays, timesCount }) {
  const subtotal = sessions * SESSION_PRICE;
  const discount = Math.round(subtotal * duration.pct / 100);
  const total = subtotal - discount;
  return (
    <div style={{
      marginTop: 24, padding: 16, borderRadius: "var(--r-md)",
      background: "var(--espresso-900)", color: "var(--paper)",
    }}>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1.5, opacity: 0.6, textTransform: "uppercase" }}>
        Package preview
      </div>
      <div style={{ fontFamily: "var(--f-display)", fontSize: 22, marginTop: 6, color: "var(--ochre, #C99A3F)" }}>
        {duration.label} · −{duration.pct}%
      </div>
      <div style={{ fontSize: 11.5, opacity: 0.75, marginTop: 4, lineHeight: 1.5 }}>{duration.sub} on every session in the block.</div>

      {/* Tier ladder */}
      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
        {DURATIONS.map((t) => {
          const active = t.id === duration.id;
          return (
            <div key={t.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "6px 10px", borderRadius: 6,
              background: active ? "rgba(201,154,63,0.18)" : "transparent",
              opacity: active ? 1 : 0.55,
            }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1 }}>
                {active ? "●" : "○"} {t.label}
              </div>
              <div style={{ fontFamily: "var(--f-body)", fontSize: 12, fontWeight: 600 }}>
                {t.pct}% off
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid rgba(255,253,248,0.15)", display: "flex", flexDirection: "column", gap: 6 }}>
        <Row k="Days scheduled" v={scheduledDays} />
        <Row k="Times / day" v={timesCount} />
        <Row k="Sessions" v={sessions || 0} />
        <Row k="Subtotal" v={formatINR(subtotal)} />
        {duration.pct > 0 && <Row k={`Discount (${duration.pct}%)`} v={`− ${formatINR(discount)}`} accent />}
        <Row k="Total" v={formatINR(total)} bold />
      </div>
    </div>
  );
}

function Row({ k, v, bold, accent }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1, opacity: 0.7, textTransform: "uppercase" }}>{k}</span>
      <span style={{
        fontFamily: bold ? "var(--f-display)" : "var(--f-body)",
        fontSize: bold ? 18 : 13, fontWeight: bold ? 400 : 500,
        color: accent ? "var(--ochre, #C99A3F)" : "var(--paper)",
      }}>{v}</span>
    </div>
  );
}

function calcTotal(sessions, pct) {
  return sessions * SESSION_PRICE - Math.round(sessions * SESSION_PRICE * pct / 100);
}
function formatINR(n) {
  return "₹ " + n.toLocaleString("en-IN");
}

function pillBtn(active) {
  return {
    flex: 1, padding: "10px 14px", borderRadius: "var(--r-pill)",
    border: "none", cursor: "pointer",
    background: active ? "var(--walnut-700)" : "transparent",
    color: active ? "var(--paper)" : "var(--espresso-800)",
    fontFamily: "var(--f-body)", fontSize: 13, fontWeight: 500,
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
    transition: "all .2s",
  };
}
function navBtn(disabled) {
  return {
    width: 32, height: 32, borderRadius: "50%",
    border: "1px solid var(--hairline)", background: "var(--paper)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.3 : 1, fontSize: 14, color: "var(--walnut-700)",
  };
}
function slotBtn(active) {
  return {
    padding: "12px 8px", borderRadius: "var(--r-md)",
    border: `1px solid ${active ? "var(--walnut-700)" : "var(--hairline)"}`,
    background: active ? "var(--walnut-700)" : "var(--paper)",
    color: active ? "var(--paper)" : "var(--espresso-900)",
    cursor: "pointer", textAlign: "center", transition: "all .15s",
  };
}
function disabledSlotBtn() {
  return {
    padding: "12px 8px", borderRadius: "var(--r-md)",
    border: "1px solid var(--hairline)",
    background: "var(--sand-200)",
    color: "var(--clay-600)",
    opacity: 0.4, cursor: "not-allowed", textAlign: "center",
  };
}

function EmptyState({ trainer }) {
  return (
    <div style={{ gridColumn: "1/-1", padding: 32, textAlign: "center", background: "var(--sand-100)", borderRadius: "var(--r-md)", border: "1px dashed var(--hairline-strong)" }}>
      <div style={{ fontFamily: "var(--f-display)", fontSize: 22, color: "var(--walnut-700)" }}>No slots this day</div>
      <div style={{ fontSize: 13, color: "var(--clay-600)", marginTop: 6 }}>
        {trainer.name.split(" ")[0]} is booked. Try another date, or switch to "By time" to see all trainers.
      </div>
    </div>
  );
}

function TrainerAvatar({ t, size = 36 }) {
  const tones = { walnut: "var(--walnut-700)", sage: "var(--sage-500)", terra: "var(--terracotta-500)", clay: "var(--clay-500)", sand: "var(--sand-400)" };
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: tones[t.tone] || "var(--walnut-700)",
      color: "var(--paper)", display: "inline-flex", alignItems: "center", justifyContent: "center",
      fontFamily: "var(--f-display)", fontSize: size * 0.42, flexShrink: 0,
    }}>{t.initials}</div>
  );
}

function BookingLogin({ user, onSignIn, selection, auth, setAuth, onBack, onConfirm }) {
  // Pre-fill auth from logged-in user once.
  React.useEffect(() => {
    if (user && !auth.method) {
      if (user.email) setAuth((a) => ({ ...a, method: "email", value: user.email }));
      else if (user.phone) setAuth((a) => ({ ...a, method: "phone", value: user.phone }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const validEmail = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(auth.value);
  const validPhone = /^\+?[\d\s-]{8,}$/.test(auth.value);
  const ok = user
    ? true
    : auth.method === "email" ? validEmail
    : auth.method === "phone" ? validPhone
    : false;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>
      <Card tone="paper" style={{ padding: 40 }}>
        {user ? (
          <SignedInBlock user={user} auth={auth} setAuth={setAuth} selection={selection} />
        ) : (
          <GuestAuthBlock auth={auth} setAuth={setAuth} onSignIn={onSignIn} selection={selection} />
        )}

        <RemindersBlock auth={auth} setAuth={setAuth} />

        <div style={{ marginTop: 40 }}>
          <Btn variant="ghost" onClick={onBack}>← Back</Btn>
        </div>
      </Card>

      <BookingSummary selection={selection} auth={auth} canConfirm={ok} onConfirm={onConfirm} />
    </div>
  );
}

// ─── Signed-in: show masked contact, no auth picker ──────────────────────
function SignedInBlock({ user, auth, setAuth, selection }) {
  const method = user.email ? "email" : "phone";
  const value = user.email || user.phone || "";
  const masked = maskContact(method, value);
  return (
    <>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--clay-600)", marginBottom: 12 }}>
        06 · Signed in
      </div>
      <h3 style={{ fontFamily: "var(--f-display)", fontSize: 36, fontWeight: 400, lineHeight: 1.1, margin: 0, color: "var(--espresso-900)" }}>
        {selection?.type === "bulk" ? "Your plan, saved." : "Your slot, saved."}
      </h3>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--espresso-800)", opacity: 0.8, marginTop: 12, maxWidth: 480 }}>
        Confirmation and reminders will be sent to the contact on your profile.
      </p>

      <div style={{
        marginTop: 24, padding: "18px 20px", borderRadius: "var(--r-md)",
        background: "var(--sand-100)", border: "1px solid var(--hairline)",
        display: "flex", alignItems: "center", gap: 14,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: "50%",
          background: "var(--walnut-700)", color: "var(--paper)",
          display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          fontFamily: "var(--f-display)", fontSize: 16,
        }}>
          {(user.name || "M").slice(0, 1).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "var(--f-body)", fontSize: 14, fontWeight: 600, color: "var(--espresso-900)" }}>
            {user.name || "Member"}
          </div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 12, color: "var(--clay-600)", marginTop: 3, letterSpacing: 0.5 }}>
            {masked}
          </div>
        </div>
        <Icon name="check" size={18} color="var(--sage-500)" />
      </div>
    </>
  );
}

// ─── Guest: Continue with Google OR Phone OTP ───────────────────────
function GuestAuthBlock({ auth, setAuth, onSignIn, selection }) {
  const [phone, setPhone] = useState(auth.method === "phone" ? auth.value.replace(/^\+91\s*/, "") : "");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const phoneDigits = phone.replace(/\D/g, "");
  const validLocalPhone = phoneDigits.length >= 10;

  // Sync phone state → auth, so the right-card Confirm CTA enables once OTP verified.
  const verify = () => {
    if (otp.length !== 6) return;
    const value = "+91 " + phoneDigits;
    setAuth({ ...auth, method: "phone", value });
    onSignIn && onSignIn({ name: "Member", phone: value });
  };
  const sendOtp = () => {
    if (!validLocalPhone) return;
    setOtpSent(true);
    // Also stash partial auth so summary can preview the masked number.
    setAuth({ ...auth, method: "phone", value: "+91 " + phoneDigits });
  };

  const handleGoogle = () => {
    const u = { name: "Aanya Member", email: "aanya@gmail.com" };
    setAuth({ ...auth, method: "email", value: u.email });
    onSignIn && onSignIn(u);
  };

  return (
    <>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--clay-600)", marginBottom: 12 }}>
        06 · Save this to your profile
      </div>
      <h3 style={{ fontFamily: "var(--f-display)", fontStyle: "italic", fontSize: 36, fontWeight: 400, lineHeight: 1.1, margin: 0, color: "var(--espresso-900)" }}>
        {selection?.type === "bulk" ? "Your plan, saved." : "Your slot, saved."}
      </h3>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--espresso-800)", opacity: 0.8, marginTop: 12, maxWidth: 480 }}>
        Sign in so we can send reminders and let you reschedule in one tap. Continue with Google or your phone &mdash; no passwords.
      </p>

      {/* Google */}
      <button onClick={handleGoogle} style={{
        marginTop: 24, width: "100%", padding: "14px 18px", borderRadius: "var(--r-md)",
        border: "1.5px solid var(--hairline-strong)", background: "var(--paper)",
        cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
        fontFamily: "var(--f-body)", fontSize: 14, fontWeight: 600, color: "var(--espresso-900)",
        transition: "all .15s",
      }}
        onMouseEnter={(e) => e.currentTarget.style.background = "var(--sand-100)"}
        onMouseLeave={(e) => e.currentTarget.style.background = "var(--paper)"}>
        <GoogleG />
        Continue with Google
        <span style={{ marginLeft: "auto", fontFamily: "var(--f-mono)", fontSize: 10, color: "var(--clay-600)", letterSpacing: 1 }}>→</span>
      </button>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
        <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, color: "var(--clay-600)", textTransform: "uppercase" }}>or</div>
        <div style={{ flex: 1, height: 1, background: "var(--hairline)" }} />
      </div>

      {/* Phone */}
      <div style={{ display: "grid", gridTemplateColumns: "96px 1fr", gap: 10 }}>
        <div style={{
          padding: "14px 16px", borderRadius: "var(--r-md)",
          border: "1.5px solid var(--hairline-strong)", background: "var(--paper)",
          fontFamily: "var(--f-body)", fontSize: 16, color: "var(--espresso-900)",
          textAlign: "center", boxSizing: "border-box",
        }}>+91</div>
        <input
          type="tel" inputMode="numeric"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); if (otpSent) { setOtpSent(false); setOtp(""); } }}
          placeholder="Phone number"
          style={{
            padding: "14px 16px", borderRadius: "var(--r-md)",
            border: "1.5px solid var(--hairline-strong)", background: "var(--paper)",
            fontFamily: "var(--f-body)", fontSize: 16, color: "var(--espresso-900)",
            outline: "none", boxSizing: "border-box",
          }}
          onFocus={(e) => e.target.style.borderColor = "var(--walnut-700)"}
          onBlur={(e) => e.target.style.borderColor = "var(--hairline-strong)"}
        />
      </div>
      
      <div style={{ marginTop: 8, fontSize: 11, color: "var(--clay-600)", fontFamily: "var(--f-body)", textAlign: "center" }}>
        * Please use your WhatsApp number for easier communication.
      </div>

      {!otpSent ? (
        <button onClick={sendOtp} disabled={!validLocalPhone} style={{
          marginTop: 12, width: "100%", padding: "14px 22px", borderRadius: "var(--r-pill)",
          border: "none",
          background: validLocalPhone ? "var(--walnut-700)" : "var(--sand-200)",
          color: validLocalPhone ? "var(--paper)" : "var(--clay-600)",
          fontFamily: "var(--f-body)", fontSize: 14, fontWeight: 600,
          cursor: validLocalPhone ? "pointer" : "not-allowed",
          transition: "all .2s",
        }}>Send OTP</button>
      ) : (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, color: "var(--clay-600)", textTransform: "uppercase", marginBottom: 8 }}>
            Enter 6-digit OTP
          </div>
          <input
            type="tel" inputMode="numeric" autoFocus
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="123456"
            style={{
              width: "100%", padding: "14px 16px", borderRadius: "var(--r-md)",
              border: "1.5px solid var(--hairline-strong)", background: "var(--paper)",
              fontFamily: "var(--f-mono)", fontSize: 22, letterSpacing: 8, textAlign: "center",
              color: "var(--espresso-900)", outline: "none", boxSizing: "border-box",
            }}
          />
          <button onClick={verify} disabled={otp.length !== 6} style={{
            marginTop: 12, width: "100%", padding: "14px 22px", borderRadius: "var(--r-pill)",
            border: "none",
            background: otp.length === 6 ? "var(--walnut-700)" : "var(--sand-200)",
            color: otp.length === 6 ? "var(--paper)" : "var(--clay-600)",
            fontFamily: "var(--f-body)", fontSize: 14, fontWeight: 600,
            cursor: otp.length === 6 ? "pointer" : "not-allowed",
            transition: "all .2s",
          }}>Verify &amp; Sign In</button>
          <button onClick={() => { setOtpSent(false); setOtp(""); }} style={{
            marginTop: 8, width: "100%", padding: 4, background: "transparent", border: "none",
            fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1.5, color: "var(--clay-600)",
            cursor: "pointer", textTransform: "uppercase",
          }}>← Change number</button>
        </div>
      )}
    </>
  );
}

// Google G logo (matches onboarding flow)

function RemindersBlock({ auth, setAuth }) {
  return (
    <div style={{ marginTop: 28 }}>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--clay-600)", marginBottom: 12 }}>
        Reminders
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { id: "email", label: "Email 24h before" },
          { id: "sms", label: "SMS 2h before" },
          { id: "ics", label: "Add to calendar" },
        ].map((r) => {
          const on = auth.reminders.includes(r.id);
          return (
            <button key={r.id}
              onClick={() => setAuth({ ...auth, reminders: on ? auth.reminders.filter(x => x !== r.id) : [...auth.reminders, r.id] })}
              style={{
                padding: "10px 16px", borderRadius: "var(--r-pill)",
                border: `1px solid ${on ? "var(--walnut-700)" : "var(--hairline)"}`,
                background: on ? "var(--walnut-700)" : "var(--paper)",
                color: on ? "var(--paper)" : "var(--espresso-900)",
                cursor: "pointer", fontSize: 13, fontFamily: "var(--f-body)",
                display: "inline-flex", alignItems: "center", gap: 6, transition: "all .15s",
              }}>
              {on && <Icon name="check" size={13} />}
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BookingSummary({ selection, auth, canConfirm, onConfirm }) {
  if (!selection) return null;
  const isBulk = selection.type === "bulk";

  if (isBulk) {
    const subtotal = selection.sessions * SESSION_PRICE;
    const discount = Math.round(subtotal * selection.tier.pct / 100);
    const total = subtotal - discount;
    return (
      <Card tone="walnut" style={{ padding: 28, position: "sticky", top: 100, height: "fit-content", maxHeight: "calc(100vh - 120px)", overflowY: "auto" }}>
        <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", opacity: 0.65, marginBottom: 16 }}>
          Your package
        </div>
        <div style={{ paddingBottom: 16, borderBottom: "1px solid rgba(255,253,248,0.15)" }}>
          <div style={{ fontFamily: "var(--f-display)", fontSize: 22 }}>{selection.tier.label}</div>
          {selection.tier.pct > 0 && (
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--ochre, #C99A3F)", letterSpacing: 1, marginTop: 4 }}>
              −{selection.tier.pct}% PACKAGE DISCOUNT
            </div>
          )}
        </div>
        <div style={{ paddingTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <SumRow k="Sessions" v={selection.sessions} />
          <SumRow k="Cadence" v={`${selection.daysPerWeek}× / week`} />
          <SumRow k="Days" v={selection.weekdays.map(n => WEEKDAY_LABELS[n]).join(", ")} />
          <SumRow k="Times" v={selection.times.join(", ")} />
          {selection.mode === "trainer" && <SumRow k="Coach" v={selection.trainer.name} />}
          <SumRow k="Subtotal" v={formatINR(subtotal)} />
          {selection.tier.pct > 0 && <SumRow k={`Discount (−${selection.tier.pct}%)`} v={`− ${formatINR(discount)}`} />}
          <SumRow k="Total" v={formatINR(total)} highlight />
        </div>
        <CancellationPolicy />
        {onConfirm && <SummaryCTA canConfirm={canConfirm} onConfirm={onConfirm} label="Confirm booking" />}
      </Card>
    );
  }

  return (
    <Card tone="walnut" style={{ padding: 28, position: "sticky", top: 100, height: "fit-content" }}>
      <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", opacity: 0.65, marginBottom: 16 }}>
        Your booking
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, paddingBottom: 20, borderBottom: "1px solid rgba(255,253,248,0.15)" }}>
        <TrainerAvatar t={selection.trainer} size={48} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>{selection.trainer.name}</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1, opacity: 0.7, marginTop: 3, textTransform: "uppercase" }}>{selection.trainer.role}</div>
        </div>
      </div>
      <div style={{ paddingTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <SumRow k="Date" v={selection.day.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} />
        <SumRow k="Time" v={`${selection.time} — ${addMin(selection.time, 60)} IST`} />
        <SumRow k="Duration" v="60 minutes" />
        <SumRow k="Location" v="M3S Studio · Indiranagar" />
        <SumRow k="Price" v={formatINR(SESSION_PRICE)} highlight />
      </div>
      <CancellationPolicy />
      {onConfirm && <SummaryCTA canConfirm={canConfirm} onConfirm={onConfirm} label="Confirm booking" />}
    </Card>
  );
}

function SummaryCTA({ canConfirm, onConfirm, label }) {
  return (
    <div style={{ marginTop: 16 }}>
      <button onClick={onConfirm} disabled={!canConfirm} style={{
        width: "100%", padding: "14px 22px", borderRadius: "var(--r-pill)",
        border: "none",
        background: canConfirm ? "var(--paper)" : "rgba(255,253,248,0.18)",
        color: canConfirm ? "var(--espresso-900)" : "rgba(255,253,248,0.55)",
        fontFamily: "var(--f-body)", fontSize: 15, fontWeight: 600, letterSpacing: 0.2,
        cursor: canConfirm ? "pointer" : "not-allowed",
        display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
        transition: "all .2s",
      }}
        onMouseEnter={(e) => { if (canConfirm) { e.currentTarget.style.background = "var(--sand-100)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
        onMouseLeave={(e) => { if (canConfirm) { e.currentTarget.style.background = "var(--paper)"; e.currentTarget.style.transform = "translateY(0)"; } }}>
        {label} <span style={{ fontSize: 17, fontWeight: 400, lineHeight: 1 }}>→</span>
      </button>
      {!canConfirm && (
        <div style={{ marginTop: 8, fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1.5, color: "rgba(255,253,248,0.55)", textAlign: "center", textTransform: "uppercase" }}>
          Sign in to continue
        </div>
      )}
    </div>
  );
}

function SumRow({ k, v, highlight }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
      <span style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1.5, opacity: 0.65, textTransform: "uppercase" }}>{k}</span>
      <span style={{ fontSize: highlight ? 18 : 13, fontWeight: highlight ? 600 : 400, fontFamily: highlight ? "var(--f-display)" : "var(--f-body)", textAlign: "right" }}>{v}</span>
    </div>
  );
}

function addMin(t, m) {
  const [h, mm] = t.split(":").map(Number);
  const d = new Date(2026, 3, 17, h, mm + m);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function BookingConfirm({ selection, auth, onReset }) {
  const isBulk = selection?.type === "bulk";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24 }}>
      <Card tone="paper" style={{ padding: 48, textAlign: "center" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "var(--sage-500)", color: "var(--paper)",
          display: "inline-flex", alignItems: "center", justifyContent: "center", margin: "0 auto",
        }}>
          <Icon name="check" size={34} strokeWidth={2.5} />
        </div>
        <h3 style={{ fontFamily: "var(--f-display)", fontSize: 48, fontWeight: 400, lineHeight: 1.05, margin: "24px 0 12px", color: "var(--espresso-900)" }}>
          {isBulk ? "Your plan is locked." : "You're in."}
        </h3>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--espresso-800)", opacity: 0.85, margin: "0 auto", maxWidth: 460 }}>
          {isBulk
            ? `${selection.sessions} sessions over ${selection.duration.label.toLowerCase()}, locked at ${selection.tier.pct}% off. We've sent the schedule to `
            : `We've sent a confirmation to `}
          <strong>{auth.value}</strong>. {auth.reminders.includes("sms") && "SMS reminders 2 hours before each session. "}See you on the floor.
        </p>

        <div style={{ marginTop: 40, display: "inline-flex", flexDirection: "column", gap: 8, padding: 20, border: "1px dashed var(--hairline-strong)", borderRadius: "var(--r-md)", textAlign: "left", minWidth: 320 }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--clay-600)" }}>BOOKING REF</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 15, color: "var(--espresso-900)" }}>M3S-{Math.random().toString(36).slice(2, 8).toUpperCase()}</div>
        </div>

        <div style={{ marginTop: 32, display: "flex", gap: 12, justifyContent: "center" }}>
          <Btn variant="secondary" onClick={onReset}>Book another</Btn>
          <Btn variant="sage">Add to calendar</Btn>
        </div>
      </Card>

      <BookingSummary selection={selection} />
    </div>
  );
}



// ─── Labeled stepper: CHOOSE → CONFIRM → PAY → DONE ──────────────────────
function BookingStepper({ step }) {
  const STEPS = [
    { n: 1, label: "Choose" },
    { n: 2, label: "Confirm" },
    { n: 3, label: "Pay" },
    { n: 4, label: "Done" },
  ];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      marginBottom: 40, flexWrap: "wrap",
    }}>
      {STEPS.map((s, i) => {
        const status = step > s.n ? "done" : step === s.n ? "active" : "todo";
        const color =
          status === "done" ? "var(--sage-500)"
          : status === "active" ? "var(--walnut-700)"
          : "var(--clay-600)";
        const isLast = i === STEPS.length - 1;
        return (
          <React.Fragment key={s.n}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              opacity: status === "todo" ? 0.7 : 1,
            }}>
              {/* Step indicator: circled number, ✓ when done */}
              <span style={{
                width: 22, height: 22, borderRadius: "50%",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--f-mono)", fontSize: 11, fontWeight: 700, letterSpacing: 0,
                background: status === "done" ? "var(--sage-500)"
                  : status === "active" ? "var(--walnut-700)"
                  : "transparent",
                color: status === "todo" ? "var(--clay-600)" : "var(--paper)",
                border: status === "todo" ? "1.5px solid var(--hairline-strong)" : "none",
                flexShrink: 0,
                transition: "all .2s",
              }}>
                {status === "done" ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : s.n}
              </span>
              <span style={{
                fontFamily: "var(--f-mono)", fontSize: 11, letterSpacing: 2,
                textTransform: "uppercase", fontWeight: status === "active" ? 600 : 500,
                color,
                transition: "color .2s",
              }}>{s.label}</span>
            </div>
            {!isLast && (
              <span aria-hidden="true" style={{
                flex: "1 1 24px", minWidth: 24, maxWidth: 80,
                height: 1.5, borderRadius: 1,
                background: step > s.n ? "var(--sage-500)" : "var(--hairline-strong)",
                transition: "background .3s",
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Step 3: Razorpay-style payment screen ────────────────────────────────
function BookingPayment({ selection, auth, onBack, onPay }) {
  const [method, setMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [upiApp, setUpiApp] = useState(null);
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "", save: false });

  const isBulk = selection?.type === "bulk";
  const sessions = isBulk ? selection.sessions : 1;
  const subtotal = sessions * SESSION_PRICE;
  const discount = isBulk ? Math.round(subtotal * selection.tier.pct / 100) : 0;
  const sessionFee = subtotal - discount;
  const convenienceFee = 0;
  const total = sessionFee + convenienceFee;

  const setCardNumber = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 16);
    const spaced = digits.replace(/(.{4})/g, "$1 ").trim();
    setCard({ ...card, number: spaced });
  };
  const setExpiry = (raw) => {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    const formatted = digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
    setCard({ ...card, expiry: formatted });
  };
  const setCvv = (raw) => setCard({ ...card, cvv: raw.replace(/\D/g, "").slice(0, 3) });

  const PAYMENT_METHODS = [
    { id: "upi", label: "UPI", sub: "Google Pay / PhonePe / BHIM" },
    { id: "card", label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay, Amex" },
    { id: "netbank", label: "Net Banking", sub: "All Indian banks" },
    { id: "emi", label: "EMI", sub: "3 / 6 / 9 / 12 months · No-cost options" },
  ];

  const sessionLine = isBulk
    ? `${selection.sessions} sessions · ${selection.duration.label}`
    : `${selection.trainer.name} · Personal Training`;
  const whenLine = isBulk
    ? `${selection.weekdays.map((n) => WEEKDAY_LABELS[n]).join(" · ")} · ${selection.times.join(", ")}`
    : `${selection.day.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} · ${selection.time} IST`;

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{
        width: "100%", maxWidth: 480,
        background: "var(--paper)", borderRadius: "var(--r-xl)",
        boxShadow: "var(--sh-3)", overflow: "hidden",
        border: "1px solid var(--hairline)",
      }}>
        {/* Dark header */}
        <div style={{
          background: "var(--espresso-900)", color: "var(--paper)",
          padding: "20px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              background: "#3395FF", color: "#FFFFFF",
              padding: "4px 9px", borderRadius: 4,
              fontFamily: "var(--f-mono)", fontWeight: 700, fontSize: 12, letterSpacing: 0.5,
            }}>rzp</div>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, opacity: 0.7, textTransform: "uppercase" }}>
              Secure payment
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--sand-300)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="4" y="11" width="16" height="10" rx="2"/>
            <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
          </svg>
        </div>

        {/* Order summary */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--hairline)" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--clay-600)", marginBottom: 10 }}>
            Booking summary
          </div>
          <div style={{ fontFamily: "var(--f-body)", fontSize: 14, fontWeight: 500, color: "var(--espresso-900)", lineHeight: 1.4 }}>
            {sessionLine}
          </div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 11, color: "var(--clay-600)", marginTop: 6, letterSpacing: 0.5 }}>
            {whenLine}
          </div>

          <div style={{ height: 1, background: "var(--hairline)", margin: "16px 0" }} />

          <SumLine label="Session fee" value={formatINR(sessionFee)} valueStyle={{ fontWeight: 600, fontSize: 16, color: "var(--walnut-700)" }} />
          <SumLine label="Convenience fee" value={formatINR(convenienceFee)} labelStyle={{ color: "var(--clay-600)", fontSize: 13 }} valueStyle={{ color: "var(--clay-600)", fontSize: 13 }} />

          <div style={{ height: 1, background: "var(--hairline-strong)", margin: "14px 0 12px" }} />

          <SumLine label="Total" value={formatINR(total)}
            labelStyle={{ fontWeight: 600, fontSize: 14, color: "var(--espresso-900)" }}
            valueStyle={{ fontWeight: 700, fontSize: 18, color: "var(--espresso-900)" }} />
        </div>

        {/* Method selector */}
        <div style={{ padding: "20px 24px" }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "var(--clay-600)", marginBottom: 12 }}>
            Choose payment method
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PAYMENT_METHODS.map((m) => {
              const on = method === m.id;
              return (
                <div key={m.id}>
                  <button onClick={() => setMethod(m.id)} style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: "var(--r-md)",
                    border: `1px solid ${on ? "var(--walnut-700)" : "var(--hairline)"}`,
                    background: on ? "var(--sand-100)" : "var(--paper)",
                    cursor: "pointer", textAlign: "left", transition: "all .15s",
                  }}>
                    <Radio on={on} />
                    <PaymentGlyph kind={m.id} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--espresso-900)" }}>{m.label}</div>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1, color: "var(--clay-600)", marginTop: 3, textTransform: "uppercase" }}>{m.sub}</div>
                    </div>
                  </button>

                  {on && m.id === "upi" && (
                    <div style={{ padding: "14px 14px 4px" }}>
                      <input
                        type="text" value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@upi"
                        style={pmtInput()}
                      />
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1.5, color: "var(--clay-600)", textTransform: "uppercase", margin: "12px 0 8px" }}>
                        Or pay with
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {[
                          { id: "gpay", label: "GPay", color: "#1A73E8" },
                          { id: "phonepe", label: "PhonePe", color: "#5F259F" },
                          { id: "bhim", label: "BHIM", color: "#00BAF2" },
                        ].map((app) => {
                          const onApp = upiApp === app.id;
                          return (
                            <button key={app.id} onClick={() => setUpiApp(onApp ? null : app.id)} style={{
                              display: "inline-flex", alignItems: "center", gap: 8,
                              padding: "8px 12px", borderRadius: "var(--r-pill)",
                              border: `1px solid ${onApp ? "var(--walnut-700)" : "var(--hairline)"}`,
                              background: onApp ? "var(--walnut-700)" : "var(--paper)",
                              color: onApp ? "var(--paper)" : "var(--espresso-900)",
                              cursor: "pointer", fontSize: 12, fontFamily: "var(--f-body)", fontWeight: 500,
                              transition: "all .15s",
                            }}>
                              <span style={{
                                width: 16, height: 16, borderRadius: 3,
                                background: app.color, color: "white",
                                fontSize: 9, fontWeight: 700,
                                display: "inline-flex", alignItems: "center", justifyContent: "center",
                              }}>{app.label[0]}</span>
                              {app.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {on && m.id === "card" && (
                    <div style={{ padding: "14px 14px 4px", display: "flex", flexDirection: "column", gap: 10 }}>
                      <input type="text" inputMode="numeric" value={card.number}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456" style={pmtInput()} />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <input type="text" inputMode="numeric" value={card.expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          placeholder="MM/YY" style={pmtInput()} />
                        <input type="password" inputMode="numeric" value={card.cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="CVV" style={pmtInput()} />
                      </div>
                      <input type="text" value={card.name}
                        onChange={(e) => setCard({ ...card, name: e.target.value })}
                        placeholder="Cardholder name" style={pmtInput()} />
                      <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--espresso-800)", cursor: "pointer", marginTop: 2 }}>
                        <input type="checkbox" checked={card.save}
                          onChange={(e) => setCard({ ...card, save: e.target.checked })}
                          style={{ accentColor: "var(--walnut-700)", width: 14, height: 14 }} />
                        Save card for future bookings
                      </label>
                    </div>
                  )}

                  {on && m.id === "netbank" && (
                    <div style={{ padding: "14px 14px 4px" }}>
                      <select style={pmtInput()} defaultValue="">
                        <option value="" disabled>Select your bank</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>State Bank of India</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}

                  {on && m.id === "emi" && (
                    <div style={{ padding: "14px 14px 4px" }}>
                      {total < 3000 ? (
                        <div style={{
                          fontSize: 12, color: "var(--terracotta-500)",
                          fontFamily: "var(--f-body)", background: "rgba(184,107,75,0.08)",
                          padding: "10px 12px", borderRadius: "10px", border: "1px dashed rgba(184,107,75,0.3)",
                          lineHeight: 1.45,
                        }}>
                          ⚠️ Available on orders above {formatINR(3000)}. Current order total is {formatINR(total)}. Please choose another payment method.
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {["3 mo", "6 mo", "9 mo", "12 mo"].map((t) => (
                            <span key={t} style={{
                              padding: "8px 14px", borderRadius: "var(--r-pill)",
                              border: "1px solid var(--hairline)", background: "var(--sand-50)",
                              fontSize: 12, color: "var(--espresso-800)", fontFamily: "var(--f-body)",
                            }}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: "0 24px 24px" }}>
          <button onClick={onPay} style={{
            width: "100%", padding: "14px 22px", borderRadius: "var(--r-pill)",
            border: "none", background: "var(--walnut-700)", color: "var(--paper)",
            fontFamily: "var(--f-body)", fontSize: 15, fontWeight: 600, letterSpacing: 0.2,
            cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 10,
            boxShadow: "var(--sh-2)", transition: "all .2s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--espresso-800)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--walnut-700)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Pay {formatINR(total)} <span style={{ fontSize: 17, fontWeight: 400, lineHeight: 1 }}>→</span>
          </button>
          <div style={{
            marginTop: 12, fontFamily: "var(--f-mono)", fontSize: 9, letterSpacing: 2,
            color: "var(--clay-600)", textAlign: "center", textTransform: "uppercase",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="11" width="16" height="10" rx="2"/>
              <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
            </svg>
            256-bit encrypted · Secured by Razorpay
          </div>
          <div style={{
            marginTop: 4, fontFamily: "var(--f-body)", fontSize: 10,
            color: "var(--clay-600)", textAlign: "center", opacity: 0.7,
          }}>
            Powered by <span style={{ fontFamily: "var(--f-mono)", fontWeight: 600, color: "#3395FF" }}>Razorpay</span>
          </div>

          <div style={{ marginTop: 16, textAlign: "center" }}>
            <button onClick={onBack} style={{
              background: "transparent", border: "none", cursor: "pointer",
              fontFamily: "var(--f-body)", fontSize: 12.5, color: "var(--clay-600)",
              textDecoration: "underline", textUnderlineOffset: 3,
            }}>← Back to sign-in</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Radio({ on }) {
  return (
    <span style={{
      width: 18, height: 18, borderRadius: "50%",
      border: `1.5px solid ${on ? "var(--walnut-700)" : "var(--hairline-strong)"}`,
      display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      background: "var(--paper)",
    }}>
      {on && <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--walnut-700)" }} />}
    </span>
  );
}

function PaymentGlyph({ kind }) {
  const base = { width: 28, height: 20, borderRadius: 4, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "var(--f-mono)", fontWeight: 700, fontSize: 9, letterSpacing: 0.5 };
  if (kind === "upi") return <span style={{ ...base, background: "var(--sand-100)", color: "var(--walnut-700)" }}>UPI</span>;
  if (kind === "card") return (
    <span style={{ ...base, background: "var(--espresso-900)", color: "var(--paper)", justifyContent: "flex-start", padding: "0 4px", position: "relative" }}>
      <span style={{ width: 10, height: 7, background: "var(--ochre-500)", borderRadius: 1 }} />
    </span>
  );
  if (kind === "netbank") return <span style={{ ...base, background: "var(--sage-500)", color: "var(--paper)" }}>NB</span>;
  if (kind === "emi") return <span style={{ ...base, background: "var(--terracotta-500)", color: "var(--paper)" }}>EMI</span>;
  return null;
}

function SumLine({ label, value, labelStyle = {}, valueStyle = {} }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "4px 0" }}>
      <span style={{ fontFamily: "var(--f-body)", fontSize: 14, color: "var(--espresso-800)", ...labelStyle }}>{label}</span>
      <span style={{ fontFamily: "var(--f-body)", fontSize: 14, color: "var(--espresso-900)", ...valueStyle }}>{value}</span>
    </div>
  );
}

function pmtInput() {
  return {
    width: "100%", padding: "12px 14px",
    borderRadius: "var(--r-md)", border: "1.5px solid var(--hairline-strong)",
    background: "var(--paper)", fontFamily: "var(--f-body)", fontSize: 14,
    color: "var(--espresso-900)", outline: "none",
    boxSizing: "border-box",
  };
}

// ─── Step 4: Success card (paper, same 480px container) ───────────────────
function BookingSuccess({ selection, auth, onReset }) {
  const isBulk = selection?.type === "bulk";
  const masked = maskContact(auth.method, auth.value);
  const ref = useMemo(() => "M3S-" + Math.random().toString(36).slice(2, 8).toUpperCase(), []);

  const seeYouLine = isBulk
    ? `See you for ${selection.sessions} sessions, starting ${selection.days[0].date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}.`
    : `See you ${selection.day.date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} at ${selection.time} with ${selection.trainer.name}.`;

  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div style={{
        width: "100%", maxWidth: 480,
        background: "var(--paper)", borderRadius: "var(--r-xl)",
        boxShadow: "var(--sh-3)", overflow: "hidden",
        border: "1px solid var(--hairline)",
        padding: "44px 32px 32px", textAlign: "center",
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: "var(--sage-500)", color: "var(--paper)",
          display: "inline-flex", alignItems: "center", justifyContent: "center", margin: "0 auto",
          boxShadow: "0 8px 20px -8px rgba(123,139,111,0.6)",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h3 style={{
          fontFamily: "var(--f-display)", fontSize: 32, fontWeight: 400, fontStyle: "italic",
          lineHeight: 1.1, margin: "20px 0 12px", color: "var(--espresso-900)",
          letterSpacing: "-0.5px",
        }}>
          You're booked.
        </h3>

        <p style={{
          fontFamily: "var(--f-body)", fontSize: 15, lineHeight: 1.55,
          color: "var(--espresso-800)", margin: "0 auto 4px", maxWidth: 380,
        }}>
          Confirmation sent to <span style={{ fontFamily: "var(--f-mono)", fontWeight: 600, fontSize: 14 }}>{masked}</span>.
        </p>
        <p style={{
          fontFamily: "var(--f-body)", fontSize: 15, lineHeight: 1.55,
          color: "var(--espresso-800)", margin: "0 auto", maxWidth: 380,
        }}>
          {seeYouLine}
        </p>

        <div style={{
          margin: "28px auto 0", display: "inline-flex", flexDirection: "column", gap: 6,
          padding: "12px 18px", border: "1px dashed var(--hairline-strong)",
          borderRadius: "var(--r-md)", textAlign: "left",
        }}>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 2, textTransform: "uppercase", color: "var(--clay-600)" }}>Booking ref</div>
          <div style={{ fontFamily: "var(--f-mono)", fontSize: 14, color: "var(--espresso-900)", letterSpacing: 0.5 }}>{ref}</div>
        </div>

        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 10 }}>
          <button style={{
            width: "100%", padding: "13px 22px", borderRadius: "var(--r-pill)",
            border: "none", background: "var(--walnut-700)", color: "var(--paper)",
            fontFamily: "var(--f-body)", fontSize: 14.5, fontWeight: 600,
            cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "all .2s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--espresso-800)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--walnut-700)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            Add to calendar <span style={{ fontSize: 16, fontWeight: 400 }}>→</span>
          </button>
          <button onClick={() => { onReset(); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{
            width: "100%", padding: "12px 22px", borderRadius: "var(--r-pill)",
            border: "1px solid var(--hairline-strong)", background: "transparent", color: "var(--espresso-900)",
            fontFamily: "var(--f-body)", fontSize: 14, fontWeight: 500,
            cursor: "pointer", transition: "all .2s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--sand-100)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Cancellation policy block ────────────────────────────────────
function CancellationPolicy() {
  const rowStyle = {
    display: "flex", alignItems: "center", gap: 8,
    fontFamily: "var(--f-body)", fontSize: 13, lineHeight: 1.4,
    color: "var(--espresso-800)",
  };
  const Mark = ({ color, children }) => (
    <span style={{
      width: 14, height: 14, flexShrink: 0,
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      color,
    }}>{children}</span>
  );
  return (
    <div style={{
      marginTop: 16, padding: "14px 16px", borderRadius: "var(--r-md)",
      background: "var(--sand-100)", border: "1px solid var(--hairline)",
    }}>
      <div style={{
        fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 2,
        textTransform: "uppercase", color: "var(--clay-600)", marginBottom: 10,
      }}>Cancellation policy</div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={rowStyle}>
          <Mark color="var(--sage-500)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </Mark>
          Cancel 8+ hours before <span style={{ color: "var(--clay-600)" }}>→</span> <strong style={{ fontWeight: 600 }}>Full refund</strong>
        </div>
        <div style={rowStyle}>
          <Mark color="var(--ochre-500)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 3 A9 9 0 0 1 12 21 Z" fill="currentColor" stroke="none"/></svg>
          </Mark>
          Cancel 4–8 hours before <span style={{ color: "var(--clay-600)" }}>→</span> <strong style={{ fontWeight: 600 }}>50% refund</strong>
        </div>
        <div style={rowStyle}>
          <Mark color="var(--terracotta-500)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
          </Mark>
          Cancel under 4 hours <span style={{ color: "var(--clay-600)" }}>→</span> <strong style={{ fontWeight: 600 }}>No refund</strong>
        </div>
      </div>

      <div style={{
        marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--hairline)",
        fontFamily: "var(--f-mono)", fontSize: 10, letterSpacing: 1, lineHeight: 1.5,
        color: "var(--clay-600)", textTransform: "uppercase",
      }}>
        Refund processed to original payment method within 3–5 business days.
      </div>
    </div>
  );
}

// ─── Confirm banner ───────────────────────────────────────────────────────
function maskContact(method, value) {
  if (!value) return "eXXXXX@gXXXl.com";
  if (method === "email") {
    if (!value || !value.includes("@")) return "eXXXXX@gXXXl.com";
    const [user, domain] = value.split("@");
    const dotIdx = domain.lastIndexOf(".");
    const tld = dotIdx >= 0 ? domain.slice(dotIdx) : "";
    const dom = dotIdx >= 0 ? domain.slice(0, dotIdx) : domain;
    
    // Username masking
    let mu = "";
    if (user.length <= 2) {
      mu = user[0] + "X" + (user[1] || "");
    } else {
      mu = user[0] + "X".repeat(user.length - 2) + user[user.length - 1];
    }
    
    // Domain masking
    let md = "";
    if (dom.length <= 2) {
      md = dom[0] + "X" + (dom[1] || "");
    } else {
      md = dom[0] + "X".repeat(dom.length - 2) + dom[dom.length - 1];
    }
    
    return mu + "@" + md + tld;
  }
  // phone - preserves first digit + last 2 of phone
  const digits = (value || "").replace(/\D/g, "");
  if (digits.length < 3) return "9XXXXXX10";
  return digits[0] + "X".repeat(Math.max(1, digits.length - 3)) + digits.slice(-2);
}

function ConfirmBanner({ method, value, onClose }) {
  const masked = maskContact(method, value);
  return (
    <div role="status" aria-live="polite" style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 300,
      height: 48, padding: "0 24px",
      background: "var(--sage-500)", color: "var(--paper)",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
      fontFamily: "var(--f-body)", fontSize: 14, fontWeight: 500,
      boxShadow: "0 6px 20px -8px rgba(62,44,28,0.18)",
      animation: "m3sBannerIn .3s ease-out",
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      <span>
        Booking confirmed &mdash; details sent to <strong style={{ fontWeight: 600, fontFamily: "var(--f-mono)", fontSize: 13, letterSpacing: 0.5 }}>{masked}</strong>
      </span>
      <button onClick={onClose} aria-label="Dismiss"
        style={{
          position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)",
          width: 24, height: 24, padding: 0, border: "none", background: "transparent",
          color: "var(--paper)", opacity: 0.7, cursor: "pointer",
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          transition: "opacity .15s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      </button>
    </div>
  );
}

// ─── QA Testing Console ──────────────────────────────────────────────────
function BookingQASuite({ simTime, setSimTime, step, selection, auth }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("booking"); // "booking" | "kenko"
  const [logs, setLogs] = useState(["[System] M3S Unified QA Suite Online.", "Ready to run PT and Kenko Cafe tests."]);
  const [testEmail, setTestEmail] = useState("");
  const [testPhone, setTestPhone] = useState("");

  const addLog = React.useCallback((msg) => {
    const dStr = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs(prev => [`[${dStr}] ${msg}`, ...prev.slice(0, 5)]);
  }, []);

  // Sync log function for Kenko to use
  useEffect(() => {
    window.__M3S_LOG__ = (msg) => {
      addLog(msg);
    };
    return () => {
      delete window.__M3S_LOG__;
    };
  }, [addLog]);

  // ─── BOOKING TESTS ──────────────────────
  const handleBK01 = () => {
    const t = new Date(2026, 3, 17, 12, 0, 0);
    setSimTime(t);
    window.__M3S_SET_SIM_TIME__?.(t);

    window.__M3S_QA_ACTION__?.("SET_MODE", "trainer");
    window.__M3S_QA_ACTION__?.("SET_BOOKING_TYPE", "single");
    
    const dayObj = BOOKING_DAYS[3];
    const slot = dayObj.slots[0];
    const sel = {
      type: "single",
      trainer: TRAINERS.find(x => x.id === slot.trainerId) || TRAINERS[0],
      day: dayObj,
      time: slot.time
    };

    window.__M3S_QA_ACTION__?.("SET_SELECTION", sel);
    window.__M3S_QA_ACTION__?.("SET_AUTH", { method: "email", value: "riya.singh@gmail.com", reminders: ["email", "sms"] });
    window.__M3S_QA_ACTION__?.("SET_STEP", 3);
    addLog("BK-01: Time 12:00, Auth Riya, booked Apr 20, Step 3 (Payment).");
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBK02_1959 = () => {
    const t = new Date(2026, 3, 17, 19, 59, 0);
    setSimTime(t);
    window.__M3S_SET_SIM_TIME__?.(t);
    window.__M3S_QA_ACTION__?.("SET_STEP", 1);
    addLog("BK-02 Boundary: 19:59 Mode (Before Cut-off). Tomorrow unblocked!");
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBK02_2001 = () => {
    const t = new Date(2026, 3, 17, 20, 1, 0);
    setSimTime(t);
    window.__M3S_SET_SIM_TIME__?.(t);
    window.__M3S_QA_ACTION__?.("SET_STEP", 1);
    addLog("BK-02 Boundary: 20:01 Mode (After Cut-off). Tomorrow locked.");
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBK03 = () => {
    const t = new Date(2026, 3, 17, 12, 0, 0);
    setSimTime(t);
    window.__M3S_SET_SIM_TIME__?.(t);
    window.__M3S_QA_ACTION__?.("SET_STEP", 1);
    addLog("BK-03 Run: Focusing Sunday slots. Note Sundays are locked with No PT Sunday warning.");
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBK04 = () => {
    const dayObj = BOOKING_DAYS[3];
    const slot = dayObj.slots[0];
    const sel = {
      type: "single",
      trainer: TRAINERS.find(x => x.id === slot.trainerId) || TRAINERS[0],
      day: dayObj,
      time: slot.time
    };
    window.__M3S_QA_ACTION__?.("SET_SELECTION", sel);
    window.__M3S_QA_ACTION__?.("SET_STEP", 2);
    addLog("BK-04 Show: Cancellation Rules block visible on Step 2 Review.");
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBK05_Single = () => {
    const dayObj = BOOKING_DAYS[3];
    const slot = dayObj.slots[0];
    const sel = {
      type: "single",
      trainer: TRAINERS.find(x => x.id === slot.trainerId) || TRAINERS[0],
      day: dayObj,
      time: slot.time
    };
    window.__M3S_QA_ACTION__?.("SET_SELECTION", sel);
    window.__M3S_QA_ACTION__?.("SET_STEP", 3);
    addLog("BK-05 Single: Single booking (₹2,400). Choose EMI in form.");
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBK05_Bulk = () => {
    const durObj = DURATIONS[1];
    const sel = {
      type: "bulk",
      duration: durObj,
      sessions: 14,
      daysPerWeek: 3,
      weekdays: [1, 3, 5],
      times: ["07:30"],
      tier: durObj,
      days: BOOKING_DAYS.slice(0, 14),
      time: "07:30"
    };
    window.__M3S_QA_ACTION__?.("SET_SELECTION", sel);
    window.__M3S_QA_ACTION__?.("SET_STEP", 3);
    addLog("BK-05 Bulk: Package booking (₹33,600). EMI options unlocked.");
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  // ─── KENKO TESTS ───────────────────────
  const handleKN01 = () => {
    const t = new Date(2026, 5, 31, 12, 0, 0); // Neutral Friday 12:00
    setSimTime(t);
    window.__M3S_SET_SIM_TIME__?.(t);

    window.__KENKO_QA_ACTION__?.("SET_CART", {
      sm_peanut_monk: 2,
      ds_chickpea_brownie: 1,
      cf_espresso: 1
    });
    window.__KENKO_QA_ACTION__?.("SET_VIEW", "menu");
    addLog("KN-01: Added items (2 Peanut Monk, 1 Brownie, 1 Espresso). Total = ₹1,025. Verify sticky bar!");
    document.getElementById("kenko")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKN02 = () => {
    const t = new Date(2026, 5, 31, 12, 0, 0);
    setSimTime(t);
    window.__M3S_SET_SIM_TIME__?.(t);

    window.__KENKO_QA_ACTION__?.("SET_CART", {
      sm_peanut_monk: 1,
      bw_turkish_eggs: 1,
      ds_protein_laddu: 1,
      jc_golden_hour: 1,
      cf_espresso: 1,
      ao_oat_milk: 1
    });
    window.__KENKO_QA_ACTION__?.("SET_VIEW", "menu");
    addLog("KN-02: Added 1 item from each of the 6 categories. Total = ₹1,145.");
    document.getElementById("kenko")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKN03_Morning = () => {
    const t = new Date(2026, 5, 31, 8, 21, 0); // Friday 08:21 AM
    setSimTime(t);
    window.__M3S_SET_SIM_TIME__?.(t);

    window.__KENKO_QA_ACTION__?.("SET_CART", { sm_peanut_monk: 1 });
    window.__KENKO_QA_ACTION__?.("SET_PICKUP_TIME", "");
    window.__KENKO_QA_ACTION__?.("SET_VIEW", "cart");
    addLog("KN-03 08:21 AM Sim: First slot should show 08:45 AM, last 21:00 (9 PM).");
    document.getElementById("kenko")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKN03_Edge = () => {
    const t = new Date(2026, 5, 31, 20, 46, 0); // Friday 08:46 PM
    setSimTime(t);
    window.__M3S_SET_SIM_TIME__?.(t);

    window.__KENKO_QA_ACTION__?.("SET_CART", { sm_peanut_monk: 1 });
    window.__KENKO_QA_ACTION__?.("SET_PICKUP_TIME", "");
    window.__KENKO_QA_ACTION__?.("SET_VIEW", "cart");
    addLog("KN-03 20:46 PM Sim: Less than 15m to 21:00. All slots are past/disabled.");
    document.getElementById("kenko")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKN03_Closed = () => {
    const t = new Date(2026, 5, 31, 21, 15, 0); // Friday 09:15 PM (Closed)
    setSimTime(t);
    window.__M3S_SET_SIM_TIME__?.(t);

    window.__KENKO_QA_ACTION__?.("SET_CART", { sm_peanut_monk: 1 });
    window.__KENKO_QA_ACTION__?.("SET_PICKUP_TIME", "");
    window.__KENKO_QA_ACTION__?.("SET_VIEW", "cart");
    addLog("KN-03 21:15 PM Sim: Cafe is Closed. Dropdown locked, order disabled.");
    document.getElementById("kenko")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKN04 = () => {
    const t = new Date(2026, 5, 31, 12, 0, 0);
    setSimTime(t);
    window.__M3S_SET_SIM_TIME__?.(t);

    window.__KENKO_QA_ACTION__?.("SET_CART", { sm_peanut_monk: 1 });
    window.__KENKO_QA_ACTION__?.("SET_PICKUP_TIME", "12:30");
    window.__KENKO_QA_ACTION__?.("SET_WHATSAPP_INPUT", "");
    window.__KENKO_QA_ACTION__?.("SET_VIEW", "cart");
    addLog("KN-04: Guest Phone Input. Verify button remains locked until 10+ digits entered.");
    document.getElementById("kenko")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKN05 = () => {
    const t = new Date(2026, 5, 31, 12, 0, 0);
    setSimTime(t);
    window.__M3S_SET_SIM_TIME__?.(t);

    window.__KENKO_QA_ACTION__?.("SET_CART", { sm_peanut_monk: 1, bw_turkish_eggs: 1 }); // Total ₹680
    window.__KENKO_QA_ACTION__?.("SET_PICKUP_TIME", "13:00");
    window.__KENKO_QA_ACTION__?.("SET_WHATSAPP_INPUT", "9876543210");
    window.__KENKO_QA_ACTION__?.("SET_CONFIRMED_WHATSAPP", "9876543210");
    window.__KENKO_QA_ACTION__?.("SET_VIEW", "payment");
    addLog("KN-05: Razorpay Prep. Pay ₹680 on Payment screen to submit + trigger WhatsApp URLs + Webhooks.");
    document.getElementById("kenko")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20, zIndex: 1000,
      fontFamily: "var(--f-body)", display: "flex", flexDirection: "column", alignItems: "flex-end",
    }}>
      {/* Balloon launcher */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            background: "var(--espresso-900)", color: "var(--paper)",
            border: "1.5px solid var(--walnut-700)", borderRadius: "var(--r-pill)",
            padding: "10px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            boxShadow: "0 4px 20px rgba(36,24,16,0.2)", display: "flex", alignItems: "center", gap: 8,
            fontFamily: "var(--f-mono)", letterSpacing: 0.8, textTransform: "uppercase",
            transition: "transform 0.15s ease",
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.03)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          <span style={{ display: "inline-block", width: 8, height: 8, background: "var(--ochre-500)", borderRadius: "50%", animation: "pulse 1.3s infinite" }} />
          QA Panel
        </button>
      )}

      {/* Styled Panel */}
      {open && (
        <div style={{
          width: 380, maxHeight: "85vh", background: "var(--paper)",
          border: "2px solid var(--walnut-700)", borderRadius: "var(--r-xl)",
          boxShadow: "0 12px 40px rgba(36,24,16,0.25)", overflow: "hidden",
          display: "flex", flexDirection: "column",
          animation: "slideIn .25s ease-out",
        }}>
          
          {/* Header */}
          <div style={{
            background: "var(--espresso-900)", color: "var(--paper)",
            padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontFamily: "var(--f-display)", fontSize: 24, fontStyle: "italic", color: "var(--paper)" }}>
              M3S QA Console
            </span>
            <button onClick={() => setOpen(false)} style={{
              background: "transparent", border: "none", color: "var(--paper)",
              fontSize: 18, cursor: "pointer", opacity: 0.7,
            }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}>×</button>
          </div>

          {/* Unified Tabs */}
          <div style={{ display: "flex", background: "var(--sand-100)", borderBottom: "1px solid var(--hairline)" }}>
            <button onClick={() => setTab("booking")} style={{
              flex: 1, padding: "11px 12px", border: "none",
              borderBottom: tab === "booking" ? "2.5px solid var(--walnut-700)" : "2.5px solid transparent",
              background: tab === "booking" ? "var(--paper)" : "transparent",
              color: tab === "booking" ? "var(--espresso-900)" : "var(--clay-600)",
              fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase",
              fontWeight: tab === "booking" ? 700 : 500, cursor: "pointer", transition: "all .15s"
            }}>PT Booking</button>
            <button onClick={() => setTab("kenko")} style={{
              flex: 1, padding: "11px 12px", border: "none",
              borderBottom: tab === "kenko" ? "2.5px solid var(--walnut-700)" : "2.5px solid transparent",
              background: tab === "kenko" ? "var(--paper)" : "transparent",
              color: tab === "kenko" ? "var(--espresso-900)" : "var(--clay-600)",
              fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase",
              fontWeight: tab === "kenko" ? 700 : 500, cursor: "pointer", transition: "all .15s"
            }}>Kenko Life Café</button>
          </div>

          <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto", flex: 1 }}>
            
            {/* Monitor */}
            <div style={{ background: "var(--sand-100)", borderRadius: "var(--r-md)", padding: 12, border: "1px solid var(--hairline)" }}>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--clay-500)", marginBottom: 8 }}>
                Engine Monitor
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "105px 1fr", gap: "6px 8px", fontSize: 12, color: "var(--espresso-900)" }}>
                <div>System Time:</div>
                <div style={{ fontFamily: "var(--f-mono)", fontWeight: 600 }}>{simTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })} ({simTime.getMonth() + 1}/{simTime.getDate()})</div>
                
                {tab === "booking" ? (
                  <>
                    <div>Cutoff State:</div>
                    <div style={{ fontWeight: 600, color: simTime.getHours() >= 20 ? "var(--terracotta-500)" : "var(--sage-500)" }}>
                      {simTime.getHours() >= 20 ? "PAST 8PM CUTOFF (RED)" : "BEFORE CUTOFF (GREEN)"}
                    </div>
                    <div>Active Step:</div>
                    <div style={{ fontWeight: 600 }}>Step {step} / 4</div>
                  </>
                ) : (
                  <>
                    <div>Cafe State:</div>
                    {(() => {
                      const mins = simTime.getHours() * 60 + simTime.getMinutes();
                      const openMins = 7 * 60;
                      const closeMins = 21 * 60;
                      const isOpen = mins >= openMins && mins < closeMins;
                      const remaining = closeMins - mins;
                      return (
                        <div style={{ fontWeight: 600, color: isOpen ? (remaining < 30 ? "var(--terracotta-500)" : "var(--sage-500)") : "var(--terracotta-500)" }}>
                          {!isOpen ? "CLOSED (RED)" : remaining < 30 ? "CLOSING SOON (₹)" : "OPEN (GREEN)"}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>
            </div>

            {/* Scenarios - BOOKING TAB */}
            {tab === "booking" && (
              <div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--clay-500)", marginBottom: 8 }}>
                  Automated Test Scenarios
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div>
                    <button onClick={handleBK01} style={qaBtnStyle()}>
                      ⚡ Run TEST BK-01 (Book Slot &gt; 24h away)
                    </button>
                    <p style={subLabelStyle()}>Setup Friday Noon + User Riya + Preselect Monday slot + go to step 3</p>
                  </div>

                  <div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={handleBK02_1959} style={{ ...qaBtnStyle(), flex: 1, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        🕒 BK-02: 19:59 Mode
                      </button>
                      <button onClick={handleBK02_2001} style={{ ...qaBtnStyle(), flex: 1, textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                        🕒 BK-02: 20:01 Mode
                      </button>
                    </div>
                    <p style={subLabelStyle()}>Toggles boundary condition system cutoff past 8PM</p>
                  </div>

                  <div>
                    <button onClick={handleBK03} style={qaBtnStyle()}>
                      ⛪ Run TEST BK-03 (Sunday PT Block)
                    </button>
                    <p style={subLabelStyle()}>Verify PT bookings on Sundays are strictly greyed out </p>
                  </div>

                  <div>
                    <button onClick={handleBK04} style={qaBtnStyle()}>
                      📄 Run TEST BK-04 (Cancellation Policy)
                    </button>
                    <p style={subLabelStyle()}>Instantly goes to step 2 review to audit 3-tier refund policy rules</p>
                  </div>

                  <div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={handleBK05_Single} style={{ ...qaBtnStyle(), flex: 1 }}>
                        📇 BK-05: EMI Single
                      </button>
                      <button onClick={handleBK05_Bulk} style={{ ...qaBtnStyle(), flex: 1 }}>
                        📇 BK-05: EMI Bulk
                      </button>
                    </div>
                    <p style={subLabelStyle()}>Tests &lt; ₹3k EMI constraint vs Bulk Package ₹33k unlock</p>
                  </div>

                  <div style={{ marginTop: 12, borderTop: "1px dashed var(--hairline-strong)", paddingTop: 10 }}>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--clay-500)", marginBottom: 8 }}>
                      Operating Tools
                    </div>
                    <button onClick={async () => {
                      addLog("⏳ Seeding started: Preparing sync...");
                      try {
                        addLog("⏳ Loading Firebase config module...");
                        const { db, handleFirestoreError, OperationType } = await import("./firebase.js");
                        if (!db) {
                          addLog("❌ Error: Firebase DB instance cannot be resolved.");
                          return;
                        }
                        addLog("✓ Firebase config module loaded successfully. Loading Firestore SDK...");
                        const { doc, setDoc } = await import("firebase/firestore");
                        addLog("✓ Firestore SDK loaded. Starting batch write for 11 master coaches...");
                        
                        const fullCoachesList = [
                          { id: "joe", name: "Joe", role: "Hypertrophy & Strength", tone: "espresso", bio: "Block-periodised hypertrophy. Muscle you can actually use. Expect rigorous form guidelines, progressive loads, and targeted accessory work.", specialties: ["Hypertrophy", "Strength", "Recovery"], initials: "JO", cert: "Strength · Hypertrophy", ptEligible: true },
                          { id: "deb", name: "Deb", role: "Strength & Recovery", tone: "walnut", bio: "Post-rehab strength and long-term recovery planning. Focuses on core control, movement fidelity, and overcoming specific joint limitations safely.", specialties: ["Strength", "Recovery", "Hyrox Prep"], initials: "DB", cert: "Strength · Recovery", ptEligible: true },
                          { id: "deepika", name: "Deepika", role: "Hyrox & Conditioning", tone: "terra", bio: "Zone 2 devotee turned Hyrox specialist. Endurance with structure, perfect technique under heavy cardiovascular fatigue, and functional strength.", specialties: ["Hyrox Prep", "Strength", "Conditioning"], initials: "DE", cert: "Hyrox · Strength", ptEligible: true },
                          { id: "lee", name: "Lee", role: "Hypertrophy & Strength", tone: "sage", bio: "Form first, always. The coach who makes the last rep look exactly like the first. Combines exercise science with meticulous programming for clean strength gains.", specialties: ["Hypertrophy", "Strength", "Recovery"], initials: "LE", cert: "Hypertrophy · Strength", ptEligible: true },
                          { id: "rahul", name: "Rahul", role: "Strength & Hyrox Prep", tone: "walnut", bio: "Competition-tested Hyrox coach. Builds high-output conditioning engines that don't quit in late rounds. Expert in raw power development and functional capacity.", specialties: ["Strength", "Hyrox Prep", "Conditioning"], initials: "RA", cert: "Strength · Hyrox · Recovery", ptEligible: true },
                          { id: "aakash", name: "Aakash", role: "Strength & Recovery", tone: "clay", bio: "Old-school strength with new-school recovery protocols. Combines structured barbell compound lifts with mobility routines to keep athletes durable long-term.", specialties: ["Strength", "Recovery", "Mobility"], initials: "AK", cert: "Strength · Recovery", ptEligible: true },
                          { id: "tarun", name: "Tarun", role: "Hyrox & Hypertrophy", tone: "clay", bio: "Hybrid athlete programming specializing in size, speed, and stamina. Balances high muscle hypertrophy programming with dynamic metabolic conditioning work.", specialties: ["Hyrox Prep", "Hypertrophy", "Strength"], initials: "TR", cert: "Hyrox · Hypertrophy", ptEligible: true },
                          { id: "santo", name: "Santo", role: "Strength & Hypertrophy", tone: "espresso", bio: "Classical strength training with a bodybuilder's eye for micro-biomechanical details. Teaches high-frequency hypertrophy, power mechanics, and conditioning.", specialties: ["Strength", "Hypertrophy", "Conditioning"], initials: "SA", cert: "Strength · Hypertrophy", ptEligible: true },
                          { id: "pilates", name: "Anisha", role: "Pilates & Mobility", tone: "sand", bio: "Clinical Pilates for posture correction, core stability, and post-injury returns. Brings precise athletic alignment and core strength focus to every class.", specialties: ["Pilates", "Mobility", "Recovery"], initials: "AN", cert: "Pilates · Mobility", ptEligible: false },
                          { id: "shahbaz", name: "Shahbaz", role: "Yoga & Breathwork", tone: "sage", bio: "Traditional hatha, vinyasa, and restorative practice. Breath-led routines engineered to develop robust mobility, mental focus, and complete active recovery.", specialties: ["Yoga", "Breathwork", "Mobility"], initials: "SH", cert: "Yoga · Breathwork", ptEligible: false },
                          { id: "shwetambari", name: "Shwetambari", role: "Founder & Owner", tone: "walnut", bio: "Pioneering athletic conditioning coach and yoga practitioner. Oversees elite programming, physical evaluations, and functional baseline screening methodologies.", specialties: ["Programming", "Evaluation", "Coaching"], initials: "SS", cert: "Master Athletic Conditioning Coach", ptEligible: false }
                        ];

                        let uploadedCount = 0;
                        for (const coach of fullCoachesList) {
                          addLog(`⏳ Syncing coach: ${coach.name}...`);
                          try {
                            const { getEnvPrefix } = await import("./firebase.js");
                            const prefix = getEnvPrefix ? getEnvPrefix() : "";
                            await setDoc(doc(db, prefix + "coaches_list", coach.id), coach, { merge: true });
                            uploadedCount++;
                          } catch (err) {
                            handleFirestoreError(err, OperationType.WRITE, `coaches_list/${coach.id}`);
                          }
                        }
                        
                        addLog(`✓ SUCCESS: Fully loaded and synchronized ${uploadedCount}/11 profiles to ${db._databaseId?.database || "m3s-prod"}.`);
                      } catch(err) {
                        console.error("Sync Seeding Error:", err);
                        addLog("❌ Seeding Error: " + err.message);
                      }
                    }} style={{ ...qaBtnStyle(), background: "var(--sage-500)" }}>
                      🌱 Sync 11 Master Coaches to DB
                    </button>
                    <p style={subLabelStyle()}>Executes Roster seeding checklist event directly from the browser runtime context</p>
                  </div>

                  <div style={{ marginTop: 12, borderTop: "1px dashed var(--hairline-strong)", paddingTop: 10 }}>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--clay-500)", marginBottom: 8 }}>
                      Database Administration
                    </div>
                    <button onClick={async () => {
                      addLog("🚀 Initiating PPE ➔ PROD Database Promotion Pipeline...");
                      try {
                        const { db, handleFirestoreError, OperationType } = await import("./firebase.js");
                        if (!db) {
                          addLog("❌ Error: Firebase DB instance cannot be resolved.");
                          return;
                        }
                        const { collection, getDocs, doc, setDoc, deleteDoc } = await import("firebase/firestore");
                        
                        const collectionsToSync = [
                          { name: 'coaches_list', label: 'Coaches Profile Roster' },
                          { name: 'admins_list', label: 'Admins List' },
                          { name: 'clients', label: 'Master Clients' },
                          { name: 'assessments', label: 'Athlete Assessments' },
                          { name: 'nutrition_plans', label: 'Nutrition & Macro Plans' },
                          { name: 'body_comp_entries', label: 'Body Composition History' },
                          { name: 'sessions', label: 'PT Slot Sessions' },
                          { name: 'ratings', label: 'Coach Feedback Stars' },
                          { name: 'session_notes', label: 'Trainer Progress Notes' },
                          { name: 'globals', label: 'Studio Settings & Configs' }
                        ];

                        for (const col of collectionsToSync) {
                          const ppeName = 'ppe_' + col.name;
                          const prodName = 'prod_' + col.name;
                          addLog(`⏳ [${col.label}] Reading PPE records...`);
                          
                          let ppeSnap;
                          try {
                            ppeSnap = await getDocs(collection(db, ppeName));
                          } catch (e) {
                            addLog(`❌ [${col.label}] Read failed on PPE collection: ${e.message}`);
                            continue;
                          }

                          if (ppeSnap.empty) {
                            addLog(`ℹ️ [${col.label}] Sandbox is empty. Skipping.`);
                            continue;
                          }

                          addLog(`🧹 [${col.label}] Scanning Live PROD target...`);
                          let prodSnap;
                          try {
                            prodSnap = await getDocs(collection(db, prodName));
                          } catch (e) {
                            addLog(`❌ [${col.label}] Read failed on PROD collection: ${e.message}`);
                            continue;
                          }

                          const deletePromises = [];
                          prodSnap.forEach(d => {
                            deletePromises.push(deleteDoc(doc(db, prodName, d.id)));
                          });

                          if (deletePromises.length > 0) {
                            addLog(`🧹 [${col.label}] Purging ${deletePromises.length} old live documents...`);
                            await Promise.all(deletePromises);
                          }

                          addLog(`🚀 [${col.label}] Writing ${ppeSnap.size} records to Live PROD...`);
                          const writePromises = [];
                          ppeSnap.forEach(d => {
                            writePromises.push(setDoc(doc(db, prodName, d.id), d.data()));
                          });
                          await Promise.all(writePromises);
                          addLog(`✅ [${col.label}] Promotion complete.`);
                        }
                        addLog("🎉 PIPELINE DEPLOYMENT SUCCESSFUL! All PPE tables promoted to PROD.");
                      } catch (err) {
                        console.error("Promotion pipeline failed:", err);
                        addLog("❌ Promotion Error: " + err.message);
                      }
                    }} style={{ ...qaBtnStyle(), background: "var(--walnut-700)" }}>
                      🚀 Push PPE Database to PROD (Deploy Live)
                    </button>
                    <p style={subLabelStyle()}>Purges target PROD collections and copies all master configurations, profiles, and logs from Sandbox PPE</p>
                  </div>

                  <div style={{ marginTop: 12, borderTop: "1px dashed var(--hairline-strong)", paddingTop: 10 }}>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--clay-500)", marginBottom: 8 }}>
                      SIMULATE WHATSAPP CONFIRMATION
                    </div>
                    <button onClick={() => {
                      if (window.__M3S_TRIGGER_WHATSAPP_SIM__) {
                        window.__M3S_TRIGGER_WHATSAPP_SIM__({
                          sender: "My Third Space",
                          phone: "9876543210",
                          message: "🏋️‍♂️ *My Third Space Booking Confirmed!*\n\nHello! This is a QA test of your PT Booking Confirmation.\n*Coach*: Deepika (Hyrox & Conditioning)\n*When*: Mon, Apr 20 at 12:00 PM IST\n*Duration*: 60 min\n*Total Paid*: ₹ 2,400\n\nSee you on the floor!"
                        });
                        addLog("✓ Simulated PT Booking WhatsApp Notification triggered!");
                      } else {
                        addLog("❌ Error: WhatsApp simulation engine is not initialized yet.");
                      }
                    }} style={{ ...qaBtnStyle(), background: "var(--sage-500)" }}>
                      💬 Trigger PT Booking WA Simulation
                    </button>
                    <p style={subLabelStyle()}>Simulates the WhatsApp message sent when a user completes a PT booking payment.</p>
                  </div>

                </div>
              </div>
            )}

            {/* Scenarios - KENKO CAFE TAB */}
            {tab === "kenko" && (
              <div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--clay-500)", marginBottom: 8 }}>
                  Automated Kenko Scenarios
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  <div>
                    <button onClick={handleKN01} style={qaBtnStyle()}>
                      🍔 Run TEST KN-01 (Add Multi-Items)
                    </button>
                    <p style={subLabelStyle()}>Adds 2× Peanut Monk, 1× Chickpea Brownie, 1× Espresso to cart. Sum ₹1,025.</p>
                  </div>

                  <div>
                    <button onClick={handleKN02} style={qaBtnStyle()}>
                      🌈 Run TEST KN-02 (FlatMap Total Check)
                    </button>
                    <p style={subLabelStyle()}>Adds 1 item from each of the 6 categories. Checks proper aggregation. Sum ₹1,145.</p>
                  </div>

                  <div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button onClick={handleKN03_Morning} style={{ ...qaBtnStyle(), flex: 1, padding: "5px" }}>
                        ☀️ 08:21 (OK)
                      </button>
                      <button onClick={handleKN03_Edge} style={{ ...qaBtnStyle(), flex: 1, padding: "5px" }}>
                        🌇 20:46 (Edge)
                      </button>
                      <button onClick={handleKN03_Closed} style={{ ...qaBtnStyle(), flex: 1, padding: "5px" }}>
                        🌙 21:15 (Closed)
                      </button>
                    </div>
                    <p style={subLabelStyle()}>KN-03 Time boundaries. Toggles slot listing & disables past elements.</p>
                  </div>

                  <div>
                    <button onClick={handleKN04} style={qaBtnStyle()}>
                      💬 Run TEST KN-04 (Guest Phone Lock)
                    </button>
                    <p style={subLabelStyle()}>Resets auth, opens cart, locks Proceed button until 10+ digits are input.</p>
                  </div>

                  <div>
                    <button onClick={handleKN05} style={qaBtnStyle()}>
                      💳 Run TEST KN-05 (Razorpay Preposition)
                    </button>
                    <p style={subLabelStyle()}>Loads cart, inputs phone + details, renders Razorpay overlay directly.</p>
                  </div>

                  <div style={{ marginTop: 12, borderTop: "1px dashed var(--hairline-strong)", paddingTop: 10 }}>
                    <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--clay-500)", marginBottom: 8 }}>
                      SIMULATE WHATSAPP CONFIRMATION
                    </div>
                    <button onClick={() => {
                      if (window.__M3S_TRIGGER_WHATSAPP_SIM__) {
                        window.__M3S_TRIGGER_WHATSAPP_SIM__({
                          sender: "Kenko Café",
                          phone: "9876543210",
                          message: "🥗 *New Kenko Order*\n\n  2× Peanut Monk — ₹520\n  1× Golden Hour Juice — ₹280\n\n*Total: ₹800*\nPickup: 12:30 PM\nCustomer WA: 9876543210\n\n*Payment Status*: PAID via Razorpay (UPI)\n*Transaction ID*: pay_test_12345"
                        });
                        addLog("✓ Simulated Kenko Cafe WhatsApp Notification triggered!");
                      } else {
                        addLog("❌ Error: WhatsApp simulation engine is not initialized yet.");
                      }
                    }} style={{ ...qaBtnStyle(), background: "var(--sage-500)" }}>
                      🥗 Trigger Kenko Café WA Simulation
                    </button>
                    <p style={subLabelStyle()}>Simulates the WhatsApp message sent when a user completes a Kenko Cafe order payment.</p>
                  </div>

                </div>
              </div>
            )}

            {/* Interactive Mask Test */}
            {tab === "booking" && (
              <div>
                <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--clay-500)", marginBottom: 8 }}>
                  TEST BK-06 (Interactive Masking)
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12 }}>
                  <div>
                    <label style={tagInputStyle()}>Test Value Email:</label>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      <input type="text" value={testEmail} onChange={e => setTestEmail(e.target.value)} style={qaInputStyle()} />
                      <div style={qaMaskOutputStyle()}>{maskContact("email", testEmail)}</div>
                    </div>
                  </div>
                  <div>
                    <label style={tagInputStyle()}>Test Value Phone:</label>
                    <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                      <input type="text" value={testPhone} onChange={e => setTestPhone(e.target.value)} style={qaInputStyle()} />
                      <div style={qaMaskOutputStyle()}>{maskContact("phone", testPhone)}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Logs stream */}
            <div>
              <div style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--clay-500)", marginBottom: 6 }}>
                Activity Log
              </div>
              <div style={{
                background: "var(--sand-50)", border: "1px solid var(--hairline)",
                fontFamily: "var(--f-mono)", fontSize: 9.5, color: "var(--espresso-800)",
                borderRadius: 6, padding: "8px 10px", minHeight: 70, maxHeight: 110, overflowY: "auto",
                lineHeight: 1.45, display: "flex", flexDirection: "column-reverse", gap: 4
              }}>
                {logs.map((log, i) => (
                  <div key={i} style={{ borderBottom: "1px solid rgba(0,0,0,0.03)", paddingBottom: 2 }}>{log}</div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

function qaBtnStyle() {
  return {
    width: "100%", padding: "7px 10px", fontSize: 11.5, fontWeight: 600,
    background: "var(--walnut-700)", color: "var(--paper)",
    border: "none", borderRadius: "var(--r-pill)", cursor: "pointer",
    textAlign: "center", transition: "all .15s", fontFamily: "var(--f-body)"
  };
}

function subLabelStyle() {
  return {
    fontSize: 9.5, color: "var(--clay-600)", margin: "4px 0 0 6px", lineHeight: 1.2
  };
}

function qaInputStyle() {
  return {
    flex: 1, padding: "5px 8px", fontSize: 11.5, border: "1px solid var(--hairline-strong)",
    borderRadius: 6, background: "var(--paper)", color: "var(--espresso-900)",
    fontFamily: "var(--f-mono)"
  };
}

function qaMaskOutputStyle() {
  return {
    flex: 1.1, padding: "5px 8px", fontSize: 11, background: "var(--sand-200)",
    color: "var(--espresso-900)", borderRadius: 6, fontWeight: 600,
    fontFamily: "var(--f-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
  };
}

function tagInputStyle() {
  return {
    fontFamily: "var(--f-mono)", fontSize: 9, textTransform: "uppercase", color: "var(--clay-600)"
  };
}

// ─── Simulated WhatsApp Message Confirmation and Interactive Client ───────────────────
function SimulatedWhatsAppNotification() {
  const [notification, setNotification] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [activeThread, setActiveThread] = useState("My Third Space");
  const [replyText, setReplyText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [badgeCount, setBadgeCount] = useState(0);

  const [threads, setThreads] = useState({
    "My Third Space": [
      { sender: "My Third Space", text: "Welcome to *My Third Space*! Your physical sanctuary and digital refuge. 🏋️‍♂️\n\nBookings, updates, and reminders will be sent to this thread.", isMe: false, time: "09:00 AM" }
    ],
    "Kenko Café": [
      { sender: "Kenko Café", text: "Welcome to *Kenko Café*! 🥗 Your order confirmations, pickup alerts, and meal tracking details will appear here.", isMe: false, time: "09:05 AM" }
    ]
  });

  useEffect(() => {
    window.__M3S_TRIGGER_WHATSAPP_SIM__ = (payload) => {
      // payload: { sender: "My Third Space" | "Kenko Café", phone: string, message: string }
      if (!payload || !payload.sender) return;

      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

      // Add to threads
      setThreads(prev => {
        const list = prev[payload.sender] || [];
        return {
          ...prev,
          [payload.sender]: [
            ...list,
            { sender: payload.sender, text: payload.message, isMe: false, time: timeStr }
          ]
        };
      });

      // Update active thread
      setActiveThread(payload.sender);

      // Show push notification
      setNotification(payload);
      setIsOpen(true);
      if (!isChatOpen) {
        setBadgeCount(prev => prev + 1);
      }

      // Play audio chime
      if (!isMuted) {
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
          osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
          gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.45);
        } catch (e) {
          console.log("Audio failed:", e);
        }
      }

      // Auto-dismiss the toast notification banner after 8 seconds
      const t = setTimeout(() => {
        setIsOpen(false);
      }, 8000);
      return () => clearTimeout(t);
    };

    return () => {
      delete window.__M3S_TRIGGER_WHATSAPP_SIM__;
    };
  }, [isMuted, isChatOpen]);

  const handleSendReply = (e) => {
    e?.preventDefault();
    if (!replyText.trim()) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    const userMsgText = replyText;

    // Append user's message
    setThreads(prev => ({
      ...prev,
      [activeThread]: [
        ...prev[activeThread],
        { sender: "Me", text: userMsgText, isMe: true, time: timeStr }
      ]
    }));
    setReplyText("");

    // Simulate smart business typing/reply
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const autoNow = new Date();
      const autoTimeStr = autoNow.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

      let businessReply = "";
      if (activeThread === "My Third Space") {
        businessReply = "Got it! Your coach has been updated. We are looking forward to having you on the gym floor! 🏋️‍♂️ Let us know if you need to make any adjustments.";
      } else {
        businessReply = "Thank you! Our kitchen team has received your response. Your fresh meal is being prepared. See you at your scheduled pickup time! 🥗";
      }

      setThreads(prev => ({
        ...prev,
        [activeThread]: [
          ...prev[activeThread],
          { sender: activeThread, text: businessReply, isMe: false, time: autoTimeStr }
        ]
      }));

      // Play subtle chime for reply received
      if (!isMuted) {
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.3);
        } catch (e) {
          console.log("Audio reply failed:", e);
        }
      }
    }, 1500);
  };

  const openChatThread = () => {
    setIsOpen(false);
    setIsChatOpen(true);
    setBadgeCount(0);
  };

  return (
    <>
      <style>{`
        @keyframes whatsAppNotificationIn {
          0% { transform: translateY(-50px) scale(0.95); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes whatsAppPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(123, 139, 111, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(123, 139, 111, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(123, 139, 111, 0); }
        }
      `}</style>

      {/* Floating Badge Button */}
      <div style={{
        position: "fixed", bottom: 85, right: 20, zIndex: 999,
        fontFamily: "var(--f-body)", display: "flex", flexDirection: "column", alignItems: "flex-end",
      }}>
        <button
          onClick={() => { setIsChatOpen(!isChatOpen); setBadgeCount(0); }}
          style={{
            background: "var(--paper)", color: "var(--espresso-900)",
            border: "1.5px solid var(--walnut-700)", borderRadius: "50%",
            width: 50, height: 50, cursor: "pointer",
            boxShadow: "0 4px 20px rgba(36,24,16,0.15)", display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
            animation: badgeCount > 0 ? "whatsAppPulse 2s infinite" : "none",
            transition: "transform 0.15s ease",
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.06)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          aria-label="Open simulated WhatsApp"
        >
          {/* Custom elegant SVG WhatsApp bubble */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--sage-500)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth="2.5"/>
          </svg>
          
          {badgeCount > 0 && (
            <span style={{
              position: "absolute", top: -4, right: -4,
              background: "var(--terracotta-500)", color: "white",
              fontSize: 10, fontFamily: "var(--f-mono)", fontWeight: 700,
              borderRadius: "50%", minWidth: 18, height: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
            }}>
              {badgeCount}
            </span>
          )}
        </button>
      </div>

      {/* ─── Push Notification Toast Banner ─── */}
      {isOpen && notification && (
        <div style={{
          position: "fixed",
          top: 24,
          right: window.innerWidth > 640 ? 24 : "5%",
          width: window.innerWidth > 640 ? 380 : "90%",
          background: "var(--paper)",
          borderRadius: "16px",
          border: "1.5px solid var(--sand-200)",
          boxShadow: "0 10px 35px -5px rgba(36,24,16,0.18)",
          padding: "16px",
          zIndex: 10000,
          fontFamily: "var(--f-body)",
          color: "var(--espresso-900)",
          animation: "whatsAppNotificationIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          cursor: "pointer",
        }}
          onClick={openChatThread}
        >
          {/* Header line */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {/* Green/Sage WhatsApp Bubble icon */}
              <div style={{
                background: "rgba(123,139,111,0.12)",
                padding: "4px 6px",
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--sage-500)" strokeWidth="2.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <span style={{ fontFamily: "var(--f-mono)", fontSize: 9.5, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--clay-600)" }}>
                WHATSAPP · Just Now
              </span>
            </div>
            
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                style={{ background: "transparent", border: "none", cursor: "pointer", padding: 2, display: "flex", opacity: 0.6 }}
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--espresso-800)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v6a3 3 0 0 0 3 3h1.586l4.707 4.707A1 1 0 0 0 20 22V4a1 1 0 0 0-1.707-.707L13.586 8H12a3 3 0 0 0-3 3z"/></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--espresso-800)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                )}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                style={{ background: "transparent", border: "none", cursor: "pointer", padding: 2, display: "flex", color: "var(--clay-600)", fontSize: 16, lineHeight: 1 }}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          </div>

          {/* Body */}
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            {/* Thread Avatar */}
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "var(--sand-100)", border: "1px solid var(--sand-200)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--f-display)", fontSize: 14, fontWeight: 600, color: "var(--walnut-700)",
              flexShrink: 0,
            }}>
              {notification.sender === "Kenko Café" ? "🥗" : "🏋️‍♂️"}
            </div>
            
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: "var(--espresso-900)" }}>
                {notification.sender}
              </div>
              <div style={{
                fontSize: 12.5, color: "var(--espresso-800)", lineHeight: 1.4, marginTop: 3,
                overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
                fontFamily: "var(--f-body)"
              }}>
                {/* Parse the first lines of message */}
                {notification.message.length > 120 ? notification.message.slice(0, 120) + "..." : notification.message}
              </div>
            </div>
          </div>

          <div style={{
            marginTop: 10, borderTop: "1px solid var(--hairline)", paddingTop: 8,
            textAlign: "center", fontSize: 11.5, fontWeight: 600, color: "var(--walnut-700)",
            fontFamily: "var(--f-mono)", letterSpacing: 0.5, textTransform: "uppercase",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6
          }}>
            <span>View simulated chat</span>
            <span style={{ fontSize: 13 }}>→</span>
          </div>
        </div>
      )}

      {/* ─── Simulated WhatsApp Chat Client Overlay/Modal ─── */}
      {isChatOpen && (
        <div style={{
          position: "fixed",
          bottom: 145,
          right: window.innerWidth > 640 ? 20 : "5%",
          width: window.innerWidth > 640 ? 380 : "90%",
          height: 480,
          background: "var(--paper)",
          borderRadius: "20px",
          border: "2px solid var(--walnut-700)",
          boxShadow: "0 15px 45px rgba(36,24,16,0.22)",
          display: "flex",
          flexDirection: "column",
          zIndex: 9998,
          overflow: "hidden",
          fontFamily: "var(--f-body)",
          animation: "whatsAppNotificationIn 0.25s ease-out",
        }}>
          
          {/* Chat Window Header */}
          <div style={{
            background: "var(--espresso-900)",
            color: "var(--paper)",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1.5px solid var(--walnut-700)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "var(--sand-100)", border: "1px solid rgba(255,253,248,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
              }}>
                {activeThread === "Kenko Café" ? "🥗" : "🏋️‍♂️"}
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{activeThread}</div>
                <div style={{ fontSize: 10.5, opacity: 0.8, display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ width: 6, height: 6, background: "var(--sage-500)", borderRadius: "50%" }} />
                  {isTyping ? "typing..." : "Active in demo"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {/* Select thread dropdown */}
              <select 
                value={activeThread} 
                onChange={(e) => setActiveThread(e.target.value)}
                style={{
                  background: "rgba(255,253,248,0.1)",
                  border: "1px solid rgba(255,253,248,0.2)",
                  color: "var(--paper)",
                  borderRadius: "8px",
                  fontSize: 11,
                  padding: "4px 8px",
                  cursor: "pointer",
                  outline: "none",
                  fontFamily: "var(--f-mono)"
                }}
              >
                <option value="My Third Space" style={{ background: "var(--espresso-900)", color: "var(--paper)" }}>M3S Core</option>
                <option value="Kenko Café" style={{ background: "var(--espresso-900)", color: "var(--paper)" }}>Kenko Café</option>
              </select>

              <button 
                onClick={() => setIsChatOpen(false)}
                style={{ background: "transparent", border: "none", color: "var(--paper)", fontSize: 20, cursor: "pointer", display: "flex" }}
                aria-label="Close Chat"
              >
                ×
              </button>
            </div>
          </div>

          {/* Chat Bubble Area with WhatsApp Neutral Wallpaper */}
          <div style={{
            flex: 1,
            background: "#efeae2", // Neutral cream classic WhatsApp wallpaper
            padding: "16px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            position: "relative",
          }}>
            {/* Subtle disclaimer banner */}
            <div style={{
              background: "rgba(255, 255, 255, 0.7)",
              alignSelf: "center",
              padding: "4px 10px",
              borderRadius: "8px",
              fontSize: 10,
              fontFamily: "var(--f-mono)",
              color: "var(--clay-600)",
              textAlign: "center",
              letterSpacing: 0.5,
              textTransform: "uppercase",
              maxWidth: "85%"
            }}>
              🔒 Simulated WhatsApp Message Engine
            </div>

            {threads[activeThread]?.map((msg, i) => (
              <div 
                key={i}
                style={{
                  alignSelf: msg.isMe ? "flex-end" : "flex-start",
                  maxWidth: "82%",
                  background: msg.isMe ? "#d9fdd3" : "var(--paper)", // True whatsapp bubble colors
                  color: "var(--espresso-900)",
                  borderRadius: msg.isMe ? "14px 14px 0 14px" : "14px 14px 14px 0",
                  padding: "10px 12px",
                  fontSize: 13,
                  lineHeight: 1.45,
                  boxShadow: "0 1.5px 3px rgba(36,24,16,0.06)",
                  position: "relative",
                  fontFamily: "var(--f-body)",
                }}
              >
                <div>
                  {formatWhatsAppMessage(msg.text)}
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 3,
                  fontSize: 9.5,
                  fontFamily: "var(--f-mono)",
                  color: "var(--clay-600)",
                  marginTop: 4,
                  textAlign: "right",
                  opacity: 0.8
                }}>
                  <span>{msg.time}</span>
                  {msg.isMe && (
                    <span style={{ color: "#53bdeb", fontSize: 10, fontWeight: 700 }}>✓✓</span> // Blue double tick!
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{
                alignSelf: "flex-start",
                background: "var(--paper)",
                borderRadius: "14px 14px 14px 0",
                padding: "10px 14px",
                fontSize: 12.5,
                color: "var(--clay-600)",
                boxShadow: "0 1.5px 3px rgba(36,24,16,0.06)",
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                fontFamily: "var(--f-mono)"
              }}>
                <span>typing</span>
                <span className="dot" style={{ animation: "bounce 1.4s infinite", animationDelay: "0s" }}>.</span>
                <span className="dot" style={{ animation: "bounce 1.4s infinite", animationDelay: "0.2s" }}>.</span>
                <span className="dot" style={{ animation: "bounce 1.4s infinite", animationDelay: "0.4s" }}>.</span>
                <style>{`
                  @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-3px); }
                  }
                `}</style>
              </div>
            )}
          </div>

          {/* Chat Window Footer Input */}
          <form 
            onSubmit={handleSendReply}
            style={{
              background: "var(--sand-100)",
              borderTop: "1px solid var(--sand-200)",
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <input 
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type a simulated message..."
              style={{
                flex: 1,
                background: "var(--paper)",
                border: "1px solid var(--sand-200)",
                borderRadius: "20px",
                padding: "8px 14px",
                fontSize: 13,
                color: "var(--espresso-900)",
                outline: "none",
                fontFamily: "var(--f-body)"
              }}
            />
            <button 
              type="submit"
              disabled={!replyText.trim() || isTyping}
              style={{
                background: replyText.trim() && !isTyping ? "var(--walnut-700)" : "var(--sand-200)",
                color: replyText.trim() && !isTyping ? "var(--paper)" : "var(--clay-500)",
                border: "none",
                borderRadius: "50%",
                width: 36,
                height: 36,
                cursor: replyText.trim() && !isTyping ? "pointer" : "not-allowed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
                padding: 0
              }}
            >
              {/* Send arrow icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}

// Simple text formatter helper
function formatWhatsAppMessage(text) {
  if (!text) return "";
  return text.split("\n").map((line, i) => {
    let formatted = line;
    // Replace *bold* with strong
    formatted = formatted.replace(/\*([^*]+)\*/g, "<strong>$1</strong>");
    // Replace _italic_ with em
    formatted = formatted.replace(/_([^_]+)_/g, "<em>$1</em>");
    // Replace ~strikethrough~ with del
    formatted = formatted.replace(/~([^~]+)~/g, "<del>$1</del>");
    
    return (
      <React.Fragment key={i}>
        {i > 0 && <br />}
        <span dangerouslySetInnerHTML={{ __html: formatted }} />
      </React.Fragment>
    );
  });
}

export { M3SLogo, Btn, Chip, Section, EyebrowTitle, Card, Hairline, Icon, ProfileMenu, Nav, MobileBottomNav, Hero, AboutM3S, Founder, Services, Testimonials, Footer, ApproachDiagram, StepGlyph, PTScene, TrainerProfile, TrainersSection, SocialSection, IGPost, MembersSection, MembersLogin, GoogleG, MembersDashboard, BCAChart, KenkoSection, MenuView, MenuItemCard, Stepper, VegDot, CartIcon, CartView, ConfirmView, WhatsAppIcon, Booking, BookingPick, SingleDaySlots, BulkPicker, BulkPricingCard, Row, EmptyState, TrainerAvatar, BookingLogin, SignedInBlock, GuestAuthBlock, RemindersBlock, BookingSummary, SummaryCTA, SumRow, BookingConfirm, BookingStepper, BookingPayment, Radio, PaymentGlyph, SumLine, BookingSuccess, CancellationPolicy, ConfirmBanner, SimulatedWhatsAppNotification };
