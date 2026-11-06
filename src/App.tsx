/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Nav, Hero, AboutM3S, Founder, Services, 
  TrainersSection, Booking, KenkoSection, 
  SocialSection, Testimonials, Footer,
  SimulatedWhatsAppNotification
} from './components.jsx';
import { loginWithGoogle, logout, auth } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

const TWEAK_DEFAULTS = {
  "primaryTone": "sage",
  "displayFont": "instrument",
  "heroVariant": "third-space",
  "bookingMode": "trainer"
};

const AUTH_KEY = "m3s.user";
function loadUser() {
  try { const raw = localStorage.getItem(AUTH_KEY); return raw ? JSON.parse(raw) : null; }
  catch { return null; }
}
function saveUser(u: any) { localStorage.setItem(AUTH_KEY, JSON.stringify(u)); }
function clearUser() { localStorage.removeItem(AUTH_KEY); }

function SignInModal({ open, onClose, onSignIn }: any) {
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(30);

  useEffect(() => {
    let timer: any;
    if (open && step === "otp" && resendSeconds > 0) {
      timer = setTimeout(() => {
        setResendSeconds(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [open, step, resendSeconds]);
  
  if (!open) return null;
  
  const submitPhone = (e: any) => { 
    e.preventDefault(); 
    if (phone.trim().length < 5) return;
    setStep("otp");
    setResendSeconds(30);
    setOtpDigits(["", "", "", ""]);
  };

  const submitOtp = (e: any) => { 
    e.preventDefault(); 
    const fullOtp = otpDigits.join("");
    if (fullOtp.length < 4) return;
    onSignIn({ name: "Member", phone: phone.trim() }); 
    setStep("phone");
    setPhone("");
    setOtpDigits(["", "", "", ""]);
  };

  const closeReset = () => {
    onClose();
    setStep("phone");
    setPhone("");
    setOtpDigits(["", "", "", ""]);
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const user = await loginWithGoogle();
      onSignIn({ name: user.displayName || "Member", email: user.email, phone: user.phoneNumber || "", uid: user.uid });
      closeReset();
    } catch (err) {
      console.error(err);
      alert("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    const cleanVal = val.replace(/\D/g, "");
    if (!cleanVal) {
      const newDigits = [...otpDigits];
      newDigits[index] = "";
      setOtpDigits(newDigits);
      return;
    }

    const newDigits = [...otpDigits];
    const digits = cleanVal.split("").slice(0, 4 - index);
    for (let i = 0; i < digits.length; i++) {
      newDigits[index + i] = digits[i];
    }
    setOtpDigits(newDigits);

    // Auto-focus next box if possible
    const nextIndex = Math.min(3, index + digits.length);
    if (nextIndex !== index) {
      const nextEl = document.getElementById(`m3s-otp-${nextIndex}`);
      if (nextEl) (nextEl as HTMLInputElement).focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otpDigits[index] && index > 0) {
        const newDigits = [...otpDigits];
        newDigits[index - 1] = "";
        setOtpDigits(newDigits);
        const prevEl = document.getElementById(`m3s-otp-${index - 1}`);
        if (prevEl) (prevEl as HTMLInputElement).focus();
      } else {
        const newDigits = [...otpDigits];
        newDigits[index] = "";
        setOtpDigits(newDigits);
      }
    }
  };

  const isOtpComplete = otpDigits.every(d => d !== "");

  return (
    <div className="signin-overlay" onClick={closeReset}>
      <div className="signin-card" onClick={e => e.stopPropagation()} style={{ borderRadius: '24px', padding: '44px 36px 36px', border: '1.5px solid var(--sand-200)', boxShadow: '0 20px 40px -15px rgba(36,24,16,0.15)' }}>
        <button className="signin-close" onClick={closeReset} aria-label="Close" style={{ top: '18px', right: '18px' }}>×</button>
        
        {/* Custom beautiful Google/M3S three dots icon container */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '50%', 
            background: 'var(--espresso-900)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '5px' 
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EA4335' }} />
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34A853' }} />
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4285F4' }} />
          </div>
        </div>

        {step === "phone" ? (
          <>
            <h2 style={{ textAlign: 'center', fontSize: '30px', fontFamily: 'var(--f-display)', fontStyle: 'italic', color: 'var(--espresso-900)', fontWeight: 400 }}>Welcome to M3S.</h2>
            <p className="lead" style={{ textAlign: 'center', marginTop: '6px', marginBottom: '28px', fontSize: '13.5px', color: 'var(--clay-600)' }}>Sign in or sign up to access your third space.</p>
            
            <form onSubmit={submitPhone}>
              <div className="m3s-field" style={{ position: 'relative', width: '100%', marginBottom: '18px' }}>
                <input 
                  autoFocus 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder=" " 
                  type="text"
                  required
                  style={{
                    width: '100%',
                    height: '52px',
                    padding: '14px 16px',
                    fontFamily: 'var(--f-body)',
                    fontSize: '15px',
                    color: 'var(--espresso-900)',
                    background: 'var(--paper)',
                    border: '1px solid var(--hairline-strong)',
                    borderRadius: '10px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.15s, box-shadow 0.15s'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = 'var(--walnut-700)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(94,66,40,0.1)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = 'var(--hairline-strong)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <label style={{
                  position: 'absolute',
                  left: '16px',
                  top: '16px',
                  background: 'var(--paper)',
                  padding: '0 4px',
                  color: 'var(--clay-600)',
                  fontSize: '14px',
                  pointerEvents: 'none',
                  transition: 'all 0.15s ease'
                }}>Email or Phone Number</label>
                <style>{`
                  .m3s-field input:focus ~ label,
                  .m3s-field input:not(:placeholder-shown) ~ label {
                    top: -8px;
                    font-size: 11px;
                    color: var(--walnut-700);
                    font-weight: 500;
                  }
                `}</style>
              </div>
              
              <div style={{ marginTop: -10, marginBottom: 20, fontSize: '12px', color: "var(--clay-600)", fontFamily: "var(--f-body)", lineHeight: '1.4' }}>
                * Standard message rates may apply.
              </div>
              <button type="submit" className="signin-cta" style={{ height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: 0, fontSize: '14.5px', fontWeight: '600' }}>
                Send Verification Code
              </button>
            </form>
            
            <div className="signin-divider" style={{ margin: '20px 0' }}><span>or</span></div>
            
            <button className="signin-google" onClick={handleGoogleSignIn} disabled={loading} style={{ height: '48px', border: '1px solid var(--hairline-strong)', borderRadius: 'var(--r-pill)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '14px', fontWeight: '500', color: 'var(--espresso-900)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0012 23z"/><path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18A11 11 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.83z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.83C6.71 7.31 9.14 5.38 12 5.38z"/></svg>
              {loading ? "Signing in..." : "Continue with Google Account"}
            </button>
            <div className="signin-foot" style={{ marginTop: '24px' }}>
              New here? <a onClick={(e) => { e.preventDefault(); closeReset(); window.location.href = "onboarding.html"; }} style={{ fontWeight: '600' }}>Get started →</a>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ textAlign: 'center', fontSize: '28px', fontFamily: 'var(--f-display)', fontStyle: 'italic', color: 'var(--espresso-900)', fontWeight: 400 }}>Enter Verification Code</h2>
            <p className="lead" style={{ textAlign: 'center', marginTop: '6px', marginBottom: '12px', fontSize: '13.5px', color: 'var(--clay-600)', lineHeight: '1.5' }}>
              We've sent a 4-digit code to <strong style={{ color: 'var(--espresso-900)' }}>{phone}</strong>
            </p>
            
            <form onSubmit={submitOtp}>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', margin: '24px 0' }}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`m3s-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    autoFocus={idx === 0}
                    onChange={e => handleDigitChange(idx, e.target.value)}
                    onKeyDown={e => handleDigitKeyDown(idx, e)}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      padding: '0',
                      border: digit ? '2.5px solid var(--walnut-700)' : '1.5px solid var(--sand-200)',
                      background: 'var(--sand-50)',
                      color: 'var(--espresso-900)',
                      fontFamily: 'var(--f-mono)',
                      fontSize: '22px',
                      fontWeight: '700',
                      textAlign: 'center',
                      outline: 'none',
                      boxSizing: 'border-box',
                      boxShadow: digit ? '0 0 0 3px rgba(94,66,40,0.08)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = 'var(--walnut-700)';
                      e.target.style.background = 'var(--paper)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(94,66,40,0.12)';
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = digit ? 'var(--walnut-700)' : 'var(--sand-200)';
                      e.target.style.background = 'var(--sand-50)';
                      e.target.style.boxShadow = digit ? '0 0 0 3px rgba(94,66,40,0.08)' : 'none';
                    }}
                  />
                ))}
              </div>
              
              <button 
                type="submit" 
                disabled={!isOtpComplete}
                className="signin-cta" 
                style={{ 
                  height: '48px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: 0, 
                  fontSize: '14.5px', 
                  fontWeight: '600',
                  opacity: isOtpComplete ? 1 : 0.6,
                  cursor: isOtpComplete ? 'pointer' : 'not-allowed',
                  background: isOtpComplete ? 'var(--walnut-700)' : 'var(--sand-200)',
                  color: isOtpComplete ? 'var(--paper)' : 'var(--clay-600)'
                }}
              >
                Verify Code
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--clay-600)', fontFamily: 'var(--f-body)' }}>
                {resendSeconds > 0 ? (
                  <span>Didn't get a code? Resend in <strong style={{ color: 'var(--walnut-700)' }}>{resendSeconds}s</strong></span>
                ) : (
                  <span>
                    Didn't get a code?{' '}
                    <button 
                      type="button"
                      onClick={() => {
                        setResendSeconds(30);
                        alert("A new simulated passcode has been dispatched. Enter any 4-digit code to log in for this demo!");
                      }}
                      style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: 'var(--walnut-700)', 
                        fontWeight: '600', 
                        cursor: 'pointer', 
                        textDecoration: 'underline',
                        padding: 0,
                        fontFamily: 'var(--f-body)',
                        fontSize: '13px'
                      }}
                    >
                      Resend Code
                    </button>
                  </span>
                )}
              </div>

              <div style={{ textAlign: "center", marginTop: "16px", fontSize: "13px" }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setStep("phone"); }} style={{ color: "var(--walnut-700)", fontWeight: 600, textDecoration: 'none' }}>← Go back</a>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [tweaks, setTweaks] = useState(TWEAK_DEFAULTS);
  const [active, setActive] = useState("home");
  const [user, setUser] = useState(loadUser);
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const u = { name: firebaseUser.displayName || "Member", email: firebaseUser.email, phone: firebaseUser.phoneNumber || "", uid: firebaseUser.uid };
        saveUser(u);
        setUser(u);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("signed_up") === "1") {
      const fresh = loadUser();
      if (fresh) setUser(fresh);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const handleSignIn = (u: any) => { saveUser(u); setUser(u); setSignInOpen(false); };
  const handleSignOut = async () => { 
    try {
      await logout();
    } catch (e) {
      console.error(e);
    }
    clearUser(); 
    setUser(null); 
  };
  const handleMyProfile = () => { window.location.href = "profile.html"; };


  useEffect(() => {
    const ids = ["home", "about", "founder", "services", "trainers", "book", "kenko", "social"];
    const onScroll = () => {
      const top = window.scrollY + 140;
      for (let i = ids.length - 1; i >= 0; i--) {
        const el = document.getElementById(ids[i]);
        if (el && el.offsetTop <= top) { setActive(ids[i]); return; }
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const tones: any = {
      walnut: { p: "#5E4228", h: "#3E2C1C" },
      terra:  { p: "#B86B4B", h: "#7a3f26" },
      sage:   { p: "#7B8B6F", h: "#4a5a41" },
      clay:   { p: "#A8825A", h: "#5E4228" },
    };
    const t = tones[tweaks.primaryTone] || tones.walnut;
    root.style.setProperty("--walnut-700", t.p);
    root.style.setProperty("--espresso-800", t.h);

    const fonts: any = {
      instrument: '"Instrument Serif", Georgia, serif',
      playfair:   '"Playfair Display", Georgia, serif',
      cormorant:  '"Cormorant Garamond", Georgia, serif',
    };
    root.style.setProperty("--f-display", fonts[tweaks.displayFont] || fonts.instrument);
  }, [tweaks]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
  };

  return (
    <>
      <Nav
        active={active}
        onNav={scrollTo}
        onBook={() => scrollTo("book")}
        user={user}
        onSignIn={() => setSignInOpen(true)}
        onSignOut={handleSignOut}
        onMyProfile={handleMyProfile}
      />
      <Hero
        variant={tweaks.heroVariant}
        isLoggedIn={!!user}
        onExplore={() => scrollTo("about")}
        onBook={() => scrollTo("book")}
        onGetStarted={() => { window.location.href = "onboarding.html"; }}
      />
      <AboutM3S />
      <Founder />
      <Services onBook={() => scrollTo("book")} />
      <TrainersSection />
      <Booking initialMode={tweaks.bookingMode} user={user} onSignIn={handleSignIn} />
      <KenkoSection user={user} />
      <SocialSection />
      <Testimonials />
      <Footer />

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} onSignIn={handleSignIn} />
      <SimulatedWhatsAppNotification />
    </>
  );
}
