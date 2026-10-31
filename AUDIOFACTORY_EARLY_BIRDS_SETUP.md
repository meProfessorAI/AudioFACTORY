# AudioFACTORY — EARLY BIRDS 🕊️ (v2.0.0) Setup & Architecture Guide

## 1. Overview

The **AudioFACTORY Early Birds 🕊️** single-screen recruitment experience is built to convert visitors into registered founding testers for **AudioFACTORY v2.0.0** (`com.audiofactory.app`) and store applications securely in the authoritative Firebase project **`audiofactory-eia`**.

- **Primary Route**: `/` and `/early-birds` (and `/testers`)
- **Web Studio Route**: `/app`
- **Admin Lead Management Console**: `/admin`
- **Firebase Project ID**: `audiofactory-eia`
- **Firestore Database ID**: `ai-studio-socialnot-845fd311-8b26-4908-9a36-b5f4f288bed7`
- **Firestore Collection**: `early_birds`

---

## 2. Architecture & Security Design

### A. Single-Screen Experience
- **`src/pages/EarlyBirdsPage.tsx`**: Single-screen layout fitting within one primary viewport on desktop and a fast, zero-overflow vertical column on mobile.
- **`src/components/AudioVisualizer.tsx`**: Interactive animated Sound Sphere with rotating conic/radial gradients, pointer-reactive parallax, 32-bar dynamic violet-to-cyan waveform, `prefers-reduced-motion` support, and an interactive Web Audio API harmonic synthesizer preview.
- **`src/components/EarlyBirdsHero.tsx`**: Campaign positioning, headlines, and founding explorer benefits.
- **`src/components/EarlyBirdsForm.tsx`**: Compact embedded form with real-time email validation, confirmation matching, multi-select interest chips, Android version selector, separated consent checkboxes, and a hidden honeypot trap.
- **`src/components/SuccessState.tsx`**: Animated post-submission (`status: "applied"`) and duplicate detection (`status: "duplicate"`) states.
- **`src/components/EarlyBirdsPrivacyModal.tsx`**: Concise Privacy & Data Protection notice explaining Google Play email usage, separated consent, retention, and deletion rights.

### B. Secure Submission & Duplicate Detection
1. **Submission Endpoint**: `POST /api/early-birds/submit` (`backend/controllers/earlyBirdsController.ts` & `functions/src/submitEarlyBird.ts`).
2. **Email Normalization (`functions/src/emailNormalizer.ts`)**:
   - Trims and lowercases the input email.
   - Canonicalizes `@googlemail.com` to `@gmail.com` and strips `.` and `+subaddress` aliases so a single Google Play account cannot register duplicate entries.
3. **Deterministic Server-Salted HMAC-SHA256 Document ID**:
   - Computes `HMAC-SHA256(EARLY_BIRDS_HMAC_SECRET, "early_birds:v2.0.0:" + normalizedEmail)` (64 hex chars).
   - Never uses an unsalted hash and never exposes internal document identifiers to the client.
4. **Atomic Firestore Transaction**:
   - Executes `runTransaction(firestoreDb, ...)` on `early_birds/{hmacId}` with `serverTimestamp()`.
   - If the document already exists, returns `status: "duplicate"` without overwriting the original application or consent record.
5. **Hardened Firestore Rules (`firestore.rules`)**:
   - `allow list: if isAdmin();` — Blocks all public enumeration or querying of `early_birds`.
   - `allow create: if isValidHmacId(applicantId) && isValidEarlyBirdApplication(incoming());` — Enforces exact field whitelist, field lengths, `consent.programmeCommunication == true`, `status == 'applied'`, `selectionStatus == 'pending'`, and `createdAt == request.time`.
   - `allow update, delete: if isAdmin();` — Guarantees existing applications cannot be overwritten or deleted by public clients.

---

## 3. Environment Variables

Configure the following variables in `.env` / Vercel Project Settings (refer to `.env.example`):

```env
FIREBASE_PROJECT_ID=audiofactory-eia
EARLY_BIRDS_HMAC_SECRET=<your-strong-random-server-hmac-secret>
ENFORCE_FIREBASE_APPCHECK=false
VITE_FIREBASE_APPCHECK_SITE_KEY=<optional-recaptcha-v3-site-key>
ADMIN_USERNAME=<admin-username>
ADMIN_PASSWORD=<admin-password>
```

---

## 4. Running & Testing Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Start full-stack development server (Port 3000)**:
   ```bash
   npm run dev
   ```
3. **Run automated unit, security & live Firestore integration tests**:
   ```bash
   npx tsx --test test/*.test.ts
   ```
4. **Type-check & build for production**:
   ```bash
   npm run lint
   npm run build
   ```

---

## 5. Deployment Instructions

1. **Deploy Firestore Security Rules**:
   ```bash
   firebase deploy --only firestore:rules --project audiofactory-eia
   ```
2. **Deploy Web Application & API to Vercel (`testers.audiofactory.vercel.app` / `audiofactory.vercel.app`)**:
   ```bash
   vercel --prod
   ```
3. **Admin Lead Management**:
   - Navigate to `/admin` and authenticate with your administrator credentials.
   - Search by email/name, filter by Android version, interest, or selection status, mark invitations sent or testing completed, and export filtered applicants to CSV.
