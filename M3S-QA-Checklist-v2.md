# My Third Space (M3S) — QA Testing Checklist v2

**Document Status:** Passed & Signed Off  
**Authors:** Gaurav (Reviewer), Eshwarya (Product QA Lead)  
**Last Updated:** June 13, 2026  
**Purpose**: An actionable, line-item verification suite testing Phase 1 (Marketing), Phase 2 (Booking & Guardrails), and all intermediate administration and client simulator features. All simulator runs and manual test paths successfully passed.

---

## Part 1: Public Marketing & Brand Portal (Phase 1)

This suite ensures the editorial brand identity, layout aesthetics, and typographic treatments conform fully to the **Warm Earth Design System** described in `AGENTS.md`.

| Test ID | Checklist Item / Action | Target / Viewport | Steps / Verification Path | Expected Result | Checked | Status |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **M-NAV-01** | Header Navigation Sticky Behavior | Desktop (1280px+) | Scroll down the homepage to at least 800px. | Header remains pinned to the top of screen with a soft glass background blur (`backdrop-blur-md`) and a subtle hairline border at the bottom. No jumping or screen flickering. | [x] | PASS |
| **M-NAV-02** | Menu Navigation Focus Rings | Universal | Navigate through nav items using only the `Tab` key. | Each active element is framed by a clear, high-contrast, double-pixel alert focus ring. | [x] | PASS |
| **M-NAV-03** | Mobile Hamburger Toggle Drawer | Mobile (<= 640px) | Click the hamburger icon on top right. | The sliding drawer overlays smoothly, changing the toggle icon to a close ("X") character. Contains nav links followed by a distinct horizontal separation and a prominent "Account" grouping. | [x] | PASS |
| **M-HERO-01** | Brand Hero Section Styling | Universal | Open the root home URL. | Hero has Instrument Serif headings, a mono-spaced eyebrow label, and warm sand tones. Completely devoid of default Tailwind blues or generic stock gradients. | [x] | PASS |
| **M-ABOUT-01** | Core Brand Pillars Checklist | Universal | Scroll down to the "Philosophy" block. | Displays exactly four styled columns/bento blocks summarizing the studio pillars: **Move**, **Nourish**, **Rest**, and **Learn**. | [x] | PASS |
| **M-TRAIN-01**| Trainer Profiles Carousel | Universal | Hover/tap on trainor circle avatars in the grid. | Displays correct bio descriptions, specialized certifications (e.g., strength, functional movement, recovery), and active status chips. | [x] | PASS |
| **M-TEST-01** | Member Testimonial Engine | Universal | Click the slider paginator dots. | Clean, touch-optimized transition slides through true quotes from actual Bengaluru studio members. | [x] | PASS |
| **M-FOOT-01** | Dark Footer Branding Compliance| Universal | Swipe to the bottom of the portal. | Renders on an absolute Charcoal Espresso background with correct studio timings, address coordinates (HAL Stage, Indiranagar), and email links. | [x] | PASS |

---

## Part 2: Multimodal Booking & Operational Guardrails (Phase 2)

Tests the core mathematical, scheduling, and cutoff parameters of the personal training portal.

| Test ID | Checklist Item / Action | Target / Viewport | Steps / Verification Path | Expected Result | Checked | Status |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **B-PICK-01** | Trainer-First Booking Selection | Universal | Choose a trainer first, then pick a day from the calendar. | Dynamically filters the availability grid, displaying only slots matching that trainer’s schedule. | [x] | PASS |
| **B-PICK-02** | Date-First Booking Selection | Universal | Select a date from the calendar first, then view trainers. | Shows all eligible available trainers across the selected daily timeline. | [x] | PASS |
| **B-CO-01** | Pre-8 PM Booking Verification | Universal | Simulate a time of `14:00` (2:00 PM). Schedule a session for tomorrow. | Tomorrow’s date remains fully selectable. The system allows complete multi-step checkout. | [x] | PASS |
| **B-CO-02** | Post-8 PM Next-Day Lockout | Universal | Simulate a time of `20:30` (8:30 PM). Try booking for tomorrow. | Next-day slots are hard-disabled, styled with an inactive grey background, and carry a "locked status" tip message. Days further out remain bookable. | [x] | PASS |
| **B-CO-03** | No PT Sundays Boundary | Universal | Select a Sunday in the scheduling widget. | Columns display a prominent, elegant warning stating **"NO PT SUNDAYS"** with advice pointing to group class timetables. | [x] | PASS |
| **B-AUTH-01** | Secure Sandboxed OTP Flow | Universal | Trigger Phone Login in Step 2. Input mobile number. | Inputting a phone number triggers Step 2b (Verification). Entering a 4-digit numeric coupon logs the user in and triggers the confirmation modal. | [x] | PASS |
| **B-AUTH-02** | Google OAuth Integration | Universal | Tap continuing with Google in the signup popup. | Triggers standard Firebase OAuth credentials popup. Successful sign-in populates active user profiles instantly. | [x] | PASS |
| **B-PAY-01** | Checkout Payment Submission | Universal | Select credit card or UPI method in Checkout. Click "Pay". | Triggers transaction loaders, fires fake transaction callbacks, registers the record, and advances to the Success View. | [x] | PASS |
| **B-SUC-01** | Calendar Integration Placeholder | Universal | Check "Booking Successful" screen. | Displays a confirmed status mask, correct session, trainer name, and clickable Add-to-Calendar shortcuts (`.ics` format stub). | [x] | PASS |

---

## Part 3: Member Hub & Onboarding Flow (Phases 4 - 5)

Tests the client-side profile, baseline scoring calculations, and onboarding steps.

| Test ID | Checklist Item / Action | Target / Viewport | Steps / Verification Path | Expected Result | Checked | Status |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **C-ONB-01** | Onboarding Steps Validation | Mobile / Desktop | Open `onboarding.html` and walk through steps 1-7. | All steps (Personal Details, Goals, Injury Log, BCA, Blood Work, MSK, and Review) display appropriately. | [x] | PASS |
| **C-SCORE-01**| Multi-Dimensional M3S Score | Universal | Complete the onboarding flow. Inspect dashboard score. | Score is displayed out of 100 with dynamic polar grids showing details (Move, Nourish, Rest, Learn). | [x] | PASS |
| **C-VAL-01** | Credits and Session Listing | Universal | Open member profile dashboard. | Displays accurate available PT Package Credit counter and lists correct upcoming and past workout slots with their dates. | [x] | PASS |

---

## Part 4: Admin Matrix, Deallocations & SLA Rules (Phases 6 - 8)

Tests administrative controls, conflict management, and live scenarios simulated in the QA Drawer.

| Test ID | Checklist Item / Action | Target / Viewport | Steps / Verification Path | Expected Result | Checked | Status |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **A-SICK-01** | Coach Sickness Deallocation | Universal | 1. Navigate to Studio QA Drawer.<br>2. Select active client.<br>3. Trigger "Scenario A (Before 8 PM Cancellation)". | Session status in the database changes to `reassigned_pending`. A red conflict tag is shown on the administrative calendar dashboard. | [x] | PASS |
| **A-SICK-02** | Client Notification Action | Universal | Navigate to the Simulator Client View under the QA Panel tab. | Displays an amber alert warning **"COACH CONFLICT RESOLVED"**. Provides buttons to either "Accept" the new co-trainer or "Decline & Refund Session Credit". | [x] | PASS |
| **A-SICK-03** | Alternative Coach Acceptance | Universal | In Simulator Client View, click "Accept Coach Deepika" button. | The status immediately updates back to `upcoming`. Trainer is swapped to Coach Deepika, and the chat log logs an automated calendar sync message. | [x] | PASS |
| **A-SICK-04** | Alternative Coach Rejection | Universal | In Simulator Client View, click "Decline & Refund" button. | Session status changes to `cancelled`. A credit is reimbursed to the client wallet. Message log records details. | [x] | PASS |
| **A-SWEEP-01**| Cutoff SLA Sweep Operations | Universal | Trigger "SLA FLUSH SWEEP" or Scenario B (Post 8 PM Lockout) in the QA Console. | Affected sessions that are still unassigned are automatically resolved by the sweeper, ensuring every client has an alternative trainer assigned before the deadline. | [x] | PASS |

---

## Sign-Off Log
*Verified, Validated, & Signed Off under full simulations coverage.*

**QA Lead Sign-off:**  
`Eshwarya Pathak` (QA Lead) — *Signed June 13, 2026*
