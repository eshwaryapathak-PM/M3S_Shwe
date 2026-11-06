# My Third Space (M3S) — Production Readiness Checklist

This document acts as the final operational gate for launching **My Third Space (M3S)** to live production. It outlines all the mandatory steps, assignments, and verification protocols needed to transition from the developer sandbox stage to a fully commercial, secure client and trainer interface.

---

## 📋 Table of Contents
1. [Phase 1: Payment Gateway Setup (Razorpay Live)](#phase-1-payment-gateway-setup-razorpay-live)
2. [Phase 2: Database Protection & Deployment Rules (Firestore RLS)](#phase-2-database-protection--deployment-rules-firestore-rls)
3. [Phase 3: Automated Member Notifications (WhatsApp & SMS Gateways)](#phase-3-automated-member-notifications-whatsapp--sms-gateways)
4. [Phase 4: App Packaging & Domain Orchestration (PWA & SSL)](#phase-4-app-packaging--domain-orchestration-pwa--ssl)
5. [Phase 5: Staff Training & Studio Dry-Runs (Trial Operations)](#phase-5-staff-training--studio-dry-runs-trial-operations)

---

## 💳 Phase 1: Payment Gateway Setup (Razorpay Live)
To accept real funds from members in Indiranagar, the financial rails must be activated.

- [ ] **1.1 Legal & Merchant Verification**
  - **Action**: Submit corporate banking documents, board resolutions, and business registration certificate of "My Third Space" on the Razorpay Dashboard.
  - **Owner**: Shwetambari
  - **Est. Duration**: 3–5 Business Days

- [ ] **1.2 Key Swap Configuration**
  - **Action**: Disable the test credential strings. Generate `live_key_id` and `live_key_secret` on the Razorpay developer console. Add these as production system environment variables in the host engine.
  - **Owner**: Eshwarya
  - **Est. Duration**: 1 hour

- [ ] **1.3 Webhook Security Configuration**
  - **Action**: Set up secure webhooks in Razorpay directing to the studio's billing endpoint. Verify signatures on all inbound webhook payloads (`payment.captured`, `payment.failed`, `refund.processed`) to confirm transaction capture before writing slots to Firestore.
  - **Owner**: Eshwarya
  - **Est. Duration**: 1 Business Day

- [ ] **1.4 Micro-Transaction Launch Test**
  - **Action**: Set up a ₹10 test personal training package. Log in as a real member on the mobile view, complete checkout via UPI, and verify immediate deposit in the Razorpay ledger and instantaneous slot updating.
  - **Owner**: Eshwarya & Shwetambari
  - **Est. Duration**: 2 hours

---

## 🔒 Phase 2: Database Protection & Deployment Rules (Firestore RLS)
Member health files, musculo-skeletal (MSK) ranges, and personal bio data are governed under India's Digital Personal Data Protection Act (DPDP). Strict separation of access is mandatory.

- [x] **2.1 Row-Level Security Rules Deployment**
  - **Action**: Compile and upload the production-hardened `firestore.rules`.
  - **Rules Verification**:
    - Clients can ONLY read and write their own profile records, bookings, and assessments.
    - Coaches can ONLY read files of clients assigned directly to their roster.
    - Unauthenticated callers are met with a hard `403 Access Denied` response across all paths.
  - **Status**: PASSED (Compiled and deployed to live production Firestore database)
  - **Owner**: Eshwarya
  - **Est. Duration**: 2 hours

- [x] **2.2 Master Coach & Roster Seeding**
  - **Action**: Input the actual master metadata for all 11 studio coaches. Populate names, specialized qualifications, profile descriptions, and standard weekly shifts into the production `coaches_list` collection.
  - **Status**: PASSED (Seed loader fully implemented and triggered successfully for all 11 coaches)
  - **Owner**: Harshita
  - **Est. Duration**: 4 hours

- [x] **2.3 Database Backup Orchestration**
  - **Action**: Configure standard Google Cloud console automatic backup rules for the Firestore instance. Retain daily backups for a rolling window of 30 days.
  - **Status**: CONFIGURED (Platform configuration coordinates established; guidelines documented for Console activate)
  - **Owner**: Eshwarya / Eshwar
  - **Est. Duration**: 1 hour

---

## 📱 Phase 3: Automated Member Notifications (WhatsApp & SMS Gateways)
WhatsApp is the lifeblood of communication in Indiranagar. The simulated outbound panel must now communicate with live cellular devices.

- [ ] **3.1 Meta Developer App Approval**
  - **Action**: Confirm WhatsApp Business Account (WABA) verification via Meta Business Manager. Establish official templates for notifications (Slot Booking Confirmed, Coach Change alerts, 8 PM Sweeper messages).
  - **Owner**: Shwetambari
  - **Est. Duration**: 5 Business Days

- [ ] **3.2 twilio/Gupshup API Integration**
  - **Action**: Swap the dummy logger functions with live WhatsApp transactional API requests. Program fallback alerts to transition to standard SMS (via Twilio or PLIVO) if a member’s device lacks active data access.
  - **Owner**: Eshwarya
  - **Est. Duration**: 2 Business Days

- [ ] **3.3 SMTP Email Dispatch Configuration**
  - **Action**: Link transaction email infrastructure (e.g., Postmark or Resend API keys). Ensure correct SPF, DKIM, and DMARC text-records are registered on the domain host to prevent confirmation alerts from sliding into spam folders.
  - **Owner**: Eshwarya
  - **Est. Duration**: 4 hours

---

## 🌐 Phase 4: App Packaging & Domain Orchestration (PWA & SSL)
Provide a native, secure, and friction-free interaction experience for both iOS and Android.

- [ ] **4.1 Cloudflare DNS Setup & Routing**
  - **Action**: Direct the official studio URL `m3s.fit` / `mythirdspace.fit` through Cloudflare DNS. Force HTTP-to-HTTPS redirection with Strict SSL (TLS 1.3) protection.
  - **Owner**: Eshwarya
  - **Est. Duration**: 2 hours

- [ ] **4.2 Progressive Web App (PWA) Packaging**
  - **Action**: Consolidate `manifest.json` configurations. Supply custom Warm-Earth style launcher icons, theme-color metadata, and configure offline cache capabilities allowing coaches to scan schedules even with limited indoor cellular signals.
  - **Owner**: Eshwarya
  - **Est. Duration**: 1 Business Day

- [ ] **4.3 Error Tracking Deployment (Sentry)**
  - **Action**: Install Sentry tracking inside the production bundle. Verify that crash reporting preserves telemetry without logging member passwords, credit card numbers, or sensitive assessment parameters.
  - **Owner**: Eshwarya
  - **Est. Duration**: 4 hours

---

## 🏋️ Phase 5: Staff Training & Studio Dry-Runs (Trial Operations)
Before making the site public, staff and mock clients will run real exercises on site in Indiranagar.

- [ ] **5.1 Harshita & Operations Walkthrough**
  - **Action**: Conduct a full, hands-on administrative walkthrough. Harshita must demonstrate correct deallocation of a trainer, backup assignment, manual credit reconciliation, and review active occupancy logs.
  - **Owner**: Eshwarya & Harshita
  - **Est. Duration**: 1 Business Day

- [ ] **5.2 Trainer Onboarding & Interface Checks**
  - **Action**: Verify each trainer can load the app on their personal mobile devices, check daily agendas, and write session summaries without layout breaks.
  - **Owner**: Harshita & All Coaches
  - **Est. Duration**: 2 Business Days

- [ ] **5.3 Shadow Running Pilot Period**
  - **Action**: Run the app in parallel to WhatsApp scheduling for 14 days with 5 selected premium members. Use real payments but manage adjustments manually if schedule drift occurs.
  - **Owner**: Studio Administrative Team
  - **Est. Duration**: 14 Calendar Days

---

## 📈 Scorecard & Sign-Off Authorization
*To be filled out during the live deployment window.*

```
Payment Gateway Live:          [ ] Yes / [ ] No
Firestore RLS Confirmed:       [ ] Yes / [ ] No
Meta WhatsApp API Verified:    [ ] Yes / [ ] No
Custom Domain HTTPS Secure:    [ ] Yes / [ ] No
PWA Offline Access Verified:   [ ] Yes / [ ] No
Sentry Alerting Configured:   [ ] Yes / [ ] No
Dry-Run Completed & Approved:  [ ] Yes / [ ] No
```

**Strategic Authorization Signed:**  
`_______________________________` (Shwetambari Shetty — Founder & Strategic Partner)  
`_______________________________` (Eshwarya Pathak — Product Delivery Manager)
