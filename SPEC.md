# Home Services App — Product Spec

> A managed home-services dispatch app for Lebanon. Customers request a service
> (plumber, electrician, AC, painter, handyman…), we send a quote, they accept,
> and we assign a vetted provider from our own roster. Cash payment, paid to the
> provider directly at launch.

**Status:** Planning / spec (no code yet)
**Last updated:** 2026-06-16

---

## 0. The Simple MVP (build this — everything below is reference)

Keep v1 dead simple. Just enough to take a real booking and dispatch someone.

**Customer app — 4 screens:**
1. **Login** — phone number + OTP.
2. **Home** — grid of services (Plumber, Electrician, AC, Painter, Handyman).
3. **Request** — pick service, type the problem, add a photo, drop a map pin +
   landmark note, pick "ASAP / today / a day". Submit.
4. **My booking** — see status, get the quote, tap **Accept**, see who's coming.

**Admin dashboard — 2 tabs:**
1. **Dispatch** — a list of incoming requests. For each: view it → **send a price** →
   once accepted, **pick a provider** from a simple list → done. Update status as it moves.
2. **History** — past/completed jobs in a simple table: ref, service, area, **who did it**
   (provider), **price**, date, and the customer's **rating**. Search/filter by provider
   or service. (Same data, no new tables — see §17.)

**Customer rating:** after a job is marked done, the customer gets a "rate the service"
prompt (1–5 stars + optional comment). That rating shows up against the job in History.

**Behind the scenes:** you message the provider on **WhatsApp**. Customer pays **cash**.
That's the whole product.

Everything after this line (§1+) is the full detail and *later* phases — don't let it
make v1 feel big. The TBD business decisions in §16 don't block building.

---

## 1. Model & Strategy

- **Managed dispatch marketplace**, *not* an open Uber-style marketplace. We hold a
  vetted roster of providers and **manually assign** the right person to each job.
- **Customer-facing at launch.** Providers are coordinated over **WhatsApp** initially;
  a dedicated provider app comes later.
- **Quote-then-accept pricing.** No fixed prices shown up front — customer describes
  the job, we send a quote, customer accepts, then we dispatch.
- **Cash payment**, paid directly to the provider on completion. In-app payment is a
  later phase.
- **Geography:** Launch in **Beirut + suburbs** (Beirut municipal, Metn, Baabda, Aley
  fringe, etc.), expand to other regions later.

### Why this model
1. **Trust** — homeowners want a vetted person in their home; "we sent you our plumber"
   beats a stranger who signed up.
2. **No supply-liquidity problem** — even 8–10 reliable providers is a real business.
3. **Fits Lebanon** — human-in-the-loop dispatch matches how things actually work here.

---

## 2. Lebanon-Specific Requirements

These shape the design from the ground up — not afterthoughts.

- **Addresses are informal.** No reliable street numbers; people navigate by landmarks.
  → Use **GPS map pin + free-text landmark/directions + phone number**, never rely on a
  typed street address.
- **WhatsApp is the primary channel.** Confirmations, "provider on his way," reschedules
  flow through WhatsApp. Plan for **WhatsApp Business API** (or deep links at first).
- **Currency is messy.** Quote in **"fresh USD" or LBP** explicitly; store currency on
  every quote. Show amounts with currency label, never a bare number.
- **Phone-number login, not email.** **OTP via SMS/WhatsApp.**
- **Spotty connectivity & power cuts.** Keep the app light; tolerate flaky networks.
- **Bilingual — Arabic + English**, including **RTL** layout for Arabic. Bake language
  into the data model (AR/EN fields) from day one.

---

## 3. Users & Surfaces

| Surface | Who | Launch? | Tech |
|---|---|---|---|
| **Customer mobile app** | Homeowners | ✅ Yes | React Native (Expo) |
| **Admin / dispatch dashboard** | You + dispatchers | ✅ Yes | React web |
| **Provider app** | Tradespeople | ❌ Phase 2 (WhatsApp first) | RN later |

### Admin roles (Phase 1, lightweight)
- **Owner** — full access, manage providers, services, pricing, view analytics.
- **Dispatcher** — handle the queue: send quotes, assign providers, update status.
  (Single owner role is fine at launch; design the field so roles can expand.)

---

## 4. Service Catalog

Start narrow, expand later. Each **category** has **types** (subtypes).

- **Plumber** — leak repair, blocked drain, install fixture, water heater, other
- **Electrician** — wiring fault, install fixture/outlet, breaker/panel, other
- **AC** — install, service/clean, gas refill, repair
- **Painter** — room/interior, exterior, touch-up
- **Handyman / general** — furniture assembly, mounting, small repairs, other

Each service type carries: name (AR/EN), optional **estimated price range** (internal,
to help dispatchers quote), estimated duration, active/inactive flag.

Later: cleaning, appliance repair, pest control, moving help.

---

## 5. Core Customer Flow

1. Open app → pick **service category** (then type).
2. **Describe the problem** — short text + **photos** (critical: we quote partly off these).
3. **Location** — map pin + landmark/directions text + contact phone (default to saved).
4. **Time preference** — ASAP / today / pick a day & window.
5. Submit → booking created, **status: Requested (Pending quote).**
6. *Dispatcher reviews → sends quote (amount + currency + optional note).*
7. Customer notified → **Accept / Decline**.
8. On accept → dispatcher **assigns provider** → customer notified with provider name + ETA.
9. Provider arrives, does the job. **On-site revised quote** possible (customer re-accepts).
10. Completed → **pay cash** → customer marks paid / optional **rating + review**.

---

## 6. Booking Lifecycle (status model)

```
Requested → Quoted → Accepted        → Assigned → En route → In progress → Completed → Paid
                  ↘ Declined
   (any active state) → Cancelled (by customer / provider / admin)
   Quoted/Assigned     → Revised quote → re-Accept
```

- **Requested** — submitted, awaiting dispatcher quote.
- **Quoted** — quote sent, awaiting customer decision.
- **Accepted / Declined** — customer's decision (capture `declined_reason`).
- **Assigned** — provider chosen and notified.
- **En route / In progress** — status updates (dispatcher- or provider-driven).
- **Completed** — work done.
- **Paid** — cash collected (manual confirmation at launch).
- **Cancelled** — with actor + reason (see §7).
- **Revised quote** — new amount mid-job, requires customer re-acceptance.

---

## 7. Edge Cases & Policies

- **Customer cancellation** — allowed before "En route" free; define a policy for late
  cancels (warning at launch, fee later).
- **Provider no-show / unavailable** — dispatcher reassigns; booking stays alive.
- **Admin cancellation** — e.g. no provider available in zone; notify customer with reason.
- **Reschedule** — customer or dispatcher can move the time window; re-notify both sides.
- **Revised on-site quote** — provider finds extra work → dispatcher (or provider, later)
  issues revised quote → customer re-accepts before work continues. **Designing for this
  is important** — otherwise providers settle in cash off-app and we lose all visibility.
- **No quote response** — auto-expire a quote after N hours (e.g. 24h) → status back to a
  closeable state; configurable.
- **Duplicate / spam requests** — basic rate limiting per phone.

---

## 8. Payments, Commission & Reconciliation

- **Launch: cash, paid directly to provider.** App records `payment_method = cash` and a
  manual **"paid" confirmation**.
- **Your cut — TBD (business decision).** Even with cash, decide the mechanism and track it:
  - Option A: **Provider owes you a % / flat fee** per completed job → app tracks
    "provider balance owed to platform," settled periodically.
  - Option B: You **pre-collect** (deposit/booking fee) — harder with cash.
  - Recommendation: **Option A**, track a running `commission_owed` per booking so
    reconciliation is just a report, even before any money moves through the app.
- **Future (Phase 3):** in-app card payment (Stripe or local processor), automatic
  commission split, provider payouts.

---

## 9. Trust & Safety

- **Provider vetting** — ID, references, skills verification; store vetting status on the
  provider record. This is the core of the brand promise.
- **Ratings & reviews** — per completed booking; surface low performers to the owner.
- **Liability / damage** — Terms of Service must address damage, disputes, and limits of
  platform liability. Decide on any guarantee/insurance stance before launch.
- **Customer support & disputes** — in-app "Contact us / report a problem" → routes to
  WhatsApp/owner. Track disputes against bookings.
- **Review moderation** — ability to hide abusive reviews.

---

## 10. Notifications Matrix

| Event | Push | WhatsApp | SMS (fallback) |
|---|---|---|---|
| OTP login | — | ✅ | ✅ |
| Quote ready | ✅ | ✅ | optional |
| Provider assigned (+ETA) | ✅ | ✅ | — |
| Provider en route | ✅ | ✅ | — |
| Reschedule / cancel | ✅ | ✅ | optional |
| Revised quote | ✅ | ✅ | — |
| Job completed / payment reminder | ✅ | optional | — |
| Rating request | ✅ | optional | — |

- **Notification consent** captured at onboarding.
- WhatsApp via **Business API**; push via **Expo Push**; SMS via a local gateway.

---

## 11. Data Model

**Customer** — id, name, phone (unique), language (ar/en), notification consent, created_at.

**Location** — id, customer_id, label (home/office), geo (lat/lng), landmark_text,
contact_phone, zone.

**Provider** — id, name, phone, skills[] (category/type), zones_covered[], availability
schedule, vetting_status, active, rating_avg, commission_terms, created_at.

**ServiceCategory** — id, name_ar, name_en, icon, active.

**ServiceType** — id, category_id, name_ar, name_en, est_price_min/max (internal),
est_duration, active.

**Booking** — id, ref_no, customer_id, service_type_id, description, photos[], location
(snapshot), requested_time_pref, status, assigned_provider_id, created_at, timestamps per
status. Quote fields: quote_amount, quote_currency (USD/LBP), quote_note, quoted_at,
accepted_at, declined_reason, revised_quote_amount, payment_method (cash), paid_at,
commission_owed.

**Review** — id, booking_id, rating (1–5), comment, created_at, hidden.

**Zone** — id, name, (optional soft boundary). Used to match providers to a pin; soft
filter at launch, not a hard polygon.

**(Optional) Quote** — its own record if we want full quote history/revisions; a few fields
on Booking are sufficient for MVP.

---

## 12. Screens

### Customer app
- Onboarding: language pick → phone OTP → notification consent
- Home: service categories grid + "my bookings"
- Service type selection
- Request form: description + photo upload
- Location: map pin + landmark + phone (saved locations)
- Time preference
- Review & submit
- Booking detail / status tracker (live status, quote accept/decline, provider info)
- Booking history / repeat booking
- Quote screen (accept / decline, and revised-quote re-accept)
- Rating & review
- Profile: saved locations, language, support/contact

### Admin / dispatch dashboard
- Live request queue (Requested → needs quote)
- Booking detail: photos, location/map, customer info → **send quote**
- Quoted/accepted queue → **assign provider** (filter by skill + zone + availability + load)
- Job status board (kanban by status)
- Provider management: roster, skills, zones, availability, vetting, active toggle
- Service catalog management (categories/types, price ranges)
- Reviews moderation
- Reports/analytics (see §13)
- Commission/reconciliation report

---

## 13. Analytics & KPIs

- Bookings per day/week; by category; by zone
- Quote → accept conversion rate; average quote response time
- Average time-to-assign; completion rate; cancellation rate (by actor)
- Provider utilization & ratings
- Revenue / commission owed (for reconciliation)
- Repeat-customer rate

---

## 14. Tech Stack

- **Mobile:** React Native (**Expo**) — one codebase, OTA updates, fast iteration.
- **Backend:** **Supabase** (Postgres + Auth + Storage + Realtime) — fits well, generous
  free tier, phone OTP built in, realtime for the dispatch board.
- **Admin dashboard:** React web app on the same backend.
- **Maps:** Google Maps.
- **Notifications:** Expo Push + WhatsApp Business API + local SMS gateway.
- **Photo storage:** Supabase Storage.

### Non-functional
- Light payloads, offline-tolerant UI, retry on flaky networks.
- Security: phone-OTP auth, row-level security on bookings/locations, signed photo URLs.
- Privacy & legal: Terms of Service, Privacy Policy, **account deletion** (app-store
  requirement), notification consent.

### Indicative running costs (low at launch)
- Supabase free → ~$25/mo as you grow; Google Maps within free tier early; WhatsApp
  Business API per-conversation pricing; SMS per-message; Expo free.

---

## 15. Roadmap & Effort

- **Phase 0 — Manual validation (recommended, ~2–3 weeks, near-zero cost):**
  Run on **Google Form + WhatsApp + spreadsheet**. Take real bookings, dispatch manually.
  Learn pricing, demand mix, and conversion before building.
- **Phase 1 — MVP:** Customer app + dispatch dashboard, quote→accept→assign, cash,
  WhatsApp coordination, ratings. *This spec.*
- **Phase 2 — Provider app:** in-app status updates, on-site revised quotes, availability
  self-management; replace WhatsApp coordination.
- **Phase 3 — Monetization & automation:** in-app payments + commission split, automated
  assignment suggestions, promos/referrals, expand regions & categories.

---

## 16. Open Decisions (TBD)

1. **Your cut** — % commission vs flat dispatch fee vs subscription (track `commission_owed`
   regardless). → §8
2. **Number of providers** at launch — affects dispatch load, not the spec.
3. **Pricing inputs** — do you set internal price ranges per service type to guide quotes?
4. **Liability/guarantee stance** — any workmanship guarantee or insurance? → §9
5. **Quote expiry window** (e.g. 24h). → §7
6. **Late-cancellation policy.** → §7

---

## 17. Simple MVP Schema (build these 5 tables)

Just what §0 needs. Everything maps cleanly to Supabase/Postgres. IDs are UUIDs,
timestamps default to now().

**customers**
| column | type | notes |
|---|---|---|
| id | uuid (pk) | |
| phone | text (unique) | login identity |
| name | text | optional at first |
| language | text | 'ar' / 'en', default 'ar' |
| created_at | timestamptz | |

**services** (the catalog — seed it once, rarely changes)
| column | type | notes |
|---|---|---|
| id | uuid (pk) | |
| name_en | text | "Plumber" |
| name_ar | text | "سبّاك" |
| active | bool | default true |

**providers**
| column | type | notes |
|---|---|---|
| id | uuid (pk) | |
| name | text | |
| phone | text | you WhatsApp this |
| skills | text[] | service ids/names they do |
| zones | text[] | areas they cover (free text at first) |
| active | bool | default true |

**bookings** (the heart of it)
| column | type | notes |
|---|---|---|
| id | uuid (pk) | |
| ref_no | text | short human code, e.g. "HS-1042" |
| customer_id | uuid (fk) | |
| service_id | uuid (fk) | |
| description | text | the problem |
| photo_url | text | one photo is enough for v1 |
| lat / lng | float | map pin |
| landmark | text | directions note |
| contact_phone | text | who to call on site |
| time_pref | text | 'asap' / 'today' / a date |
| status | text | see §6 status list |
| quote_amount | numeric | |
| quote_currency | text | 'USD' / 'LBP' |
| provider_id | uuid (fk, null) | assigned later |
| created_at | timestamptz | |

**reviews** (optional for v1, trivial to add)
| column | type | notes |
|---|---|---|
| id | uuid (pk) | |
| booking_id | uuid (fk) | |
| rating | int | 1–5 |
| comment | text | optional |

That's the entire data layer for the MVP. Notes:
- **No separate locations table** at first — the pin/landmark/phone live right on the
  booking. Add saved locations only if customers ask.
- **No quotes table** — the quote is just three fields on the booking. Revised quotes
  come in a later phase.
- **status** as plain text is fine; enforce the §6 values in app code, not the DB, to
  stay flexible early.
