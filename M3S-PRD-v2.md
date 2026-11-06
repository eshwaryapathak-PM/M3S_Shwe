# Product Requirements Document (PRD) v2 — My Third Space (M3S)

**Document Status:** Approved (Updated & Redone for Production Readiness)  
**Authors:** Eshwarya (Product + Build), Shwetambari (Founder, Brand), Gaurav (Partner, Reviewer)  
**Current Progress Stage:** Phase 1 & Phase 2 Core Completed; Preparing for Final Production Checks  
**Target Launch (Pilot Phase):** Late October 2026  
**Confidentiality:** Internal Studio Operations Only  

---

## 1. Executive Summary & Brand Paradigm

**My Third Space (M3S)** is a premium, minimalist personal training, wellness, and recovery studio located in Indiranagar, Bengaluru. It serves as a refuge for modern individuals—a "third space" that seamlessly integrates movement, nourishment, recovery, and lifestyle enrichment. 

This Digital Ecosystem is built from the ground up to eliminate the friction of manual booking coordination, paper-based assessments, administrative tracking, and fragmented communication via WhatsApp. The platform comprises:
1. **The Public Brand Portal & Marketing Site**: Curating the brand register.
2. **The Booking Engine & Secure Checkout**: An intuitive, policy-governed scheduling portal.
3. **The Member Mobile Dashboard & Onboarding**: Personal wellness records, the computed multi-dimensional M3S Score, and Kenko Cafe pre-orders.
4. **The Coach Workspace & Admin Matrix**: Calendar management, physical evaluation logs, studio metrics, dynamic substitute matching/reassignment, and a sandbox/live QA and simulation suite.

### The Style Register (The Warm Earth Palette)
M3S completely rejects default high-tech templates, glowing neon gradients, or clinical layouts. It features:
* **Backgrounds**: Soft Warm Sand (`#FBF7F0` / `#FFFDF8` "Paper-White").
* **Accents**: Earthy Sage Green (`#7B8B6F`) for healthy schedules, Terracotta Red (`#B86B4B`) for limits, Golden Ochre (`#C99A3F`) for premium notifications, and Charcoal Espresso (`#241810`) for deep, legible typography.
* **Typography**: Highly editorial, Italian-style serif Display typography (**Instrument Serif**) paired with a surgical, hyper-legible sans-serif Body font (**Inter**) and technical details in **JetBrains Mono**.

---

## 2. Product Development Phased Scope Matrix

The following table summarizes the alignment between the original PRD phases and the active implementation progress in the codebase.

| Phase / Module | Feature Description | Scope Group / Target | Status | Codebase Implementation Location |
|---|---|---|---|---|
| **Phase 1a** | Navigation, Footer, 404 Chrome | Core UX | **100% Completed** | `src/components.jsx` (`Nav`, `Footer`, `App`), `src/App.tsx` |
| **Phase 1b** | Brand Hero Section & Interactions| Lead Capture | **100% Completed** | `src/components.jsx` (`Hero`) |
| **Phase 1c** | About, Founder, Services, Trainer Grid | Brand Registry & Profiles | **100% Completed** | `src/components.jsx` (`AboutM3S`, `Founder`, `Services`, `TrainersSection`) |
| **Phase 2a** | Multimodal Slot Picker & Scheduling | Booking Flow | **100% Completed** | `src/components.jsx` (`Booking`, `BookingPick`), `src/booking.jsx` |
| **Phase 2b** | Next-Day 8pm Cutoff & No PT Sundays | Booking Boundaries | **100% Completed** | `src/components.jsx` (`BookingPick`, `BookingSummary`), `src/booking.jsx` |
| **Phase 3** | OTP Phone + Google Authentication | Security & Identity | **100% Completed** | `src/App.tsx` (`SignInModal`), `src/firebase.js` |
| **Phase 4** | 7-Step Onboarding Funnel (BCA/MSK) | User Profiling | **100% Completed** | `public/onboarding-flow.jsx` |
| **Phase 5** | Wallet (Credits), Active Booking Lists | Client Hub | **100% Completed** | `public/profile.jsx`, `src/components.jsx` (`BookingSuccess`) |
| **Phase 6** | Coach Day/Week/Month Schedule View | Coach Portal | **100% Completed** | `public/coach-universe.jsx` |
| **Phase 7** | Sick Leave, Backup Allocator, Sweep | Admin Controls | **100% Completed** | `public/coach-universe.jsx` (`CoachAdminQAPanel`) |
| **Phase 8** | Persistent Database & RLS | Storage Systems | **100% Completed** | `src/firebase.js`, `firestore.rules` |
| **Phase 9** | Custom Domain, Live Razorpay, Sentry | Production Polish | **In-Progress** | Configuration files & launch parameters |

---

## 3. Current Progress Review & Codebase Audit

### 3.1 What is Fully Built
1. **Public Marketing Portal**: Complete presentation of the brand philosophy (Move, Nourish, Rest, Learn), Shwetambari’s biography, individual specialties, interactive testimonial sliders, and social layout grids.
2. **Dynamic 2-Way Scheduling Engine**: Supports choosing by Date/Time *or* Trainer first. Displays dynamic visual slot grids showing available, booked, and past blocks across 7 forward-looking days.
3. **Hard-Armed Operational Boundaries**:
   * **8 PM Cutoff Rule**: Disables scheduling next-day slots after 20:00 local time to prevent late-night bookings that shock trainer agendas.
   * **No PT Sunday Constraint**: Replaces scheduling blocks with group fitness highlights on Sundays.
4. **Secure Multi-Method Auth**: Supports both 4-digit Sandbox OTP Phone auth and production-grade Google Authentication with standard Firebase sessions.
5. **Progressive Onboarding**: Solicits contact details, goals, injuries, physical evaluations, MSK ranges, and computes a baseline M3S fitness score.
6. **Unified Client Hub & Personal Wallet**: Allows members to track session history, view credits, and monitor MSK / BCA trendlines dynamically.
7. **Comprehensive Coach Universe (`coach-universe.jsx`)**: Include detailed timetables, member profile drawers, and chat histories.
8. **Operational Contingency Controls**:
   * **Deallocation & Substitute Allocation**: Managers can mark a coach "sick", which instantly alerts affected clients, changes block status to `pending_decline`, and invites alternative-trainer assignments.
   * **Cutoff SLA Sweep**: Automatically takes care of unassigned conflicting sessions at the 8 PM threshold to assign alternative coaches.

---

## 4. Pending Actions Prior to Production Launch

To successfully transition from the Sandbox environment to the live production server for the Indiranagar studio launch, the following strategic tasks must be resolved.

### 4.1 Financial Integration (Razorpay Live)
* **Goal**: Switch the Razorpay payment gateway from Sandbox to Live Production credentials.
* **Tasks**:
  1. Complete Razorpay merchant KYC verification for "My Third Space" business entity.
  2. Implement backend handlers or webhooks to listen for `payment.authorized` and `payment.captured` events safely to prevent fraudulent booking claims.
  3. Swap checkout client key IDs in the payment page.

### 4.2 Production Infrastructure & Database Partitioning
* **Goal**: Deploy real rules and perform initial schema migrations on production Firestore with robust security.
* **Tasks**:
  1. Review `firestore.rules` to ensure **Row-Level Security (RLS)** is strictly applied, preventing Client A from reading Client B's medical, MSK, or personal assessments.
  2. Seed the production database with active trainer profiles (the 11 studio coaches), initial credit balances, and operational schedule boundaries.
  3. Set up Firestore daily database backup configurations.

### 4.3 Notification Channels (WhatsApp & Email Gateway)
* **Goal**: Connect live messaging. Currently, outbound logs are stored in a simulated workspace panel.
* **Tasks**:
  1. Integrate the WhatsApp Business API (via Twilio, Gupshup, or Meta directly) using the approved template formats (e.g. "Hi {{1}}, Coach {{2}} has been confirmed for your session tomorrow at {{3}}.").
  2. Set up transaction transactional email notifications (via Resend, SendGrid, or Postmark) for digital booking invoices, signup confirmations, and policy notices.

### 4.4 App Packaging & Domain Routing
* **Goal**: Tie the application to its official online home.
* **Tasks**:
  1. Point the custom domain `mythirdspace.fit` (or `m3s.fit`) via Cloudflare DNS to the Cloud Run / Vercel instance.
  2. Configure a Progressive Web App (PWA) manifest so coaches and members can "Install" the app on their mobile home screens with a beautiful launch icon.
  3. Ensure modern secure browser cookies (`Secure; HttpOnly; SameSite=Strict`) are enforced across all authenticated endpoints.

---

## 5. Operations & Contingency Logic Rules

To preserve operational trust, the booking system applies strict operational states:

1. **Member Cancellation Policy**:
   * **> 8 Hours Before**: Free cancellation. The session is refunded 1 PT credit automatically back to their wallet.
   * **4 - 8 Hours Before**: Late cancel (50% retention). Reimburses 0.5 credits (or docks fee as per studio parameters).
   * **< 4 Hours Before**: No-refund threshold. 1 credit is lost.
2. **Coach Sickness Flow**:
   * If a coach is checked as "Sick", all their scheduled bookings for the next 24 hours are placed in a `pending_decline` status.
   * The system immediately fires a WhatsApp notification asking the client to choose:
     * **Option A**: Accept an alternative, verified co-trainer allocated by studio managers.
     * **Option B**: Reject the substitute, void the slot, and claim an immediate full refund of 1 PT Package Credit.
3. **8 PM Sweeper SLA**:
   * If any `pending_decline` session remains uncoordinated by clients at 8:00 PM, the automated sweep triggers to assign an available substitute trainer of equivalent certification level, protecting the member's workout window and maintaining coach floor utilization.

---

*End of PRD v2.*
