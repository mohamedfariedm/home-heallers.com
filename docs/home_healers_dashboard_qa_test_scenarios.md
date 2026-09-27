# Home Healers Dashboard — QA Test Scenarios

**Audience:** Testers  
**Date:** 2026-09-26  
**Scope:** Frontend changes for the Backend dashboard statistics + validation guide  
**Related docs:**
- `docs/home_healers_dashboard_frontend_integration.md`
- `docs/home_healers_dashboard_backend_missing_apis.md`

---

## What changed (summary for testers)

| Area | What to expect |
|---|---|
| **Inbound / Outbound (Contact Center)** | New statistics cards (failure reasons, follow-up aging, SLA, agents, offer conversion, converted leads). Lead form requires source + channel. Failed/Closed require status reason. Cards show status reason + last follow-up. |
| **Reservations** | New ops cards (unassigned, same-day, upcoming sessions, unscheduled). Cancellation reasons chart. Cancel/Fail requires status reason. Source dropdown uses canonical values (`mobile_application`, not `application`). Status reason shown in table + view. |
| **Patients / Clients** | New patient metrics (active/new/returning, completeness, data quality). Collected Booking Value only if user has permission. National ID optional. Placeholder mobile/ID blocked. Duplicate National ID offers “open existing patient”. |
| **Doctors** | New statistics block on doctors page (active/working doctors, sessions, per-doctor table, by city). |
| **Not in this release** | Doctor capacity/utilization, revenue per doctor, late arrival, risk actions, lead ownership credit — **do not expect these**. |

---

## Preconditions

1. Login as an admin user with permissions:
   - `customer_supports` and/or `customer_supports_operation`
   - `reservations`
   - `Clients`
   - `doctors`
2. For revenue tests: one user **with** `dashboard.total_revenue`, one user **without** it.
3. Prefer a date range that has data (e.g. current month). Asia/Riyadh business days matter for Patients stats.
4. Backend must already expose the new `statistics` keys (this FE release depends on that).

---

## A. Contact Center — Inbound (`type=operation`) & Outbound (`type=marketing`)

### A1. Statistics dashboard (both screens)

| # | Scenario | Steps | Expected |
|---|---|---|---|
| A1.1 | Page loads with stats | Open Inbound / Outbound | Statistics cards load (no crash if some keys empty) |
| A1.2 | Failure / closure reasons | Find “by failure reason” cards/section | Reasons like price too high, no answer, etc. Click a card → list filters to failed/closed + that reason |
| A1.3 | Unclassified reason | If historical failed/closed without reason exist | Card “Unclassified” → filter `status_reason = null` |
| A1.4 | Follow-up aging buckets | Find aging section (0-24h, 1-3d, 3-7d, >7d) | Counts show; click bucket → open leads filtered by age |
| A1.5 | SLA breach | If `sla_breach_count` > 0 | Red/highlight card; click → filtered open leads beyond SLA |
| A1.6 | Never followed up / avg age | Check aging summary | Shows never-followed-up count + average age hours |
| A1.7 | Leads without status | If unset status exists | Note/count shown; those leads excluded from aging |
| A1.8 | Null status card drill-down | Click “No Status” / null status card | List filters with `status_equal=null` (not empty `status=` that shows everything) |
| A1.9 | Converted via lead | Find support→reservation conversion card | Shows leads / reservations / sessions; click → converted leads |
| A1.10 | Offer conversion | Find offer conversion cards/table | Per offer: leads, converted, rate %; click → filter by offer |
| A1.11 | Agent performance | Find agent activity cards/table | Columns: supports, contact actions, success marked, reservations created. Click agent → leads contacted by that agent in period |
| A1.12 | Source / channel charts | Existing source & channel breakdown | Still work; known aliases may merge (e.g. Google/google) |

### A2. Lead card / view (row fields)

| # | Scenario | Steps | Expected |
|---|---|---|---|
| A2.1 | Status reason on card | Open a failed/closed lead card | Shows status reason (e.g. “price too high”) |
| A2.2 | Last follow-up on card | Lead that was contacted | Shows “Last follow-up: …” timestamp |
| A2.3 | View modal | Open lead details | Status reason + last follow-up fields present |

### A3. Create / edit lead form

| # | Scenario | Steps | Expected |
|---|---|---|---|
| A3.1 | Create without source | Create lead, leave Source empty, submit | Validation error — source required |
| A3.2 | Create without channel | Leave Communication Channel empty | Validation error — channel required |
| A3.3 | Canonical source list | Open Source dropdown | Values: google, instagram, facebook, tiktok, snapchat, twitter, youtube, whatsapp, call, website, **mobile_application**, referral, center, other |
| A3.4 | Channel list | Open channel dropdown | Exactly: WhatsApp, Call, Lead Form |
| A3.5 | Status → Failed without reason | Set status Failed, no reason | Error — status reason required |
| A3.6 | Status → Closed without reason | Same for Closed | Error — status reason required |
| A3.7 | Reason = Other without notes | Failed + Other, empty notes | Error — notes required |
| A3.8 | Happy path Failed | Failed + valid reason (+ notes if Other) | Saves successfully; reason stored |
| A3.9 | Drag/drop to Failed/Closed (Kanban) | Drag card to Failed or Closed column | Reason modal appears; confirm with reason; card moves |
| A3.10 | Cancel reason modal | Open reason modal, cancel | Card stays in previous column |
| A3.11 | Non-terminal status clears reason | Change Failed → New | Reason cleared / ignored |

---

## B. Reservations

### B1. Statistics

| # | Scenario | Steps | Expected |
|---|---|---|---|
| B1.1 | Stats load | Open Reservations with date filters | Statistics appear (`include_statistics` is used by FE) |
| B1.2 | Cancellation reasons | Find cancellation/fail reasons chart | Reasons listed; click → list filtered to status 4,6 + reason |
| B1.3 | Unassigned card | Click Unassigned | Shows open reservations missing doctor (reservation or session). **Ignores date range** |
| B1.4 | Same-day card | Click Same-day | Reservations whose first session is same Riyadh day as creation; respects date range |
| B1.5 | Upcoming sessions | Click Upcoming | Goes to calendar for today…today+7, pending/confirmed. Count may be ≤ calendar rows (calendar ignores parent status) |
| B1.6 | Unscheduled sessions | Click Unscheduled | Open reservations with undated non-cancelled sessions |
| B1.7 | Existing payment / status cards | Smoke-test paid/unpaid/status | Still work |

### B2. Reservation form / validation

| # | Scenario | Steps | Expected |
|---|---|---|---|
| B2.1 | Cancel without reason | Edit reservation → Status = Canceled, no reason | Validation blocks save |
| B2.2 | Fail without reason | Status = Failed, no reason | Validation blocks save |
| B2.3 | Reason dropdown | Set Cancel/Fail | Status reason dropdown appears (staff reasons only — **no payment_timeout** selectable for new cancel) |
| B2.4 | Other + empty operation notes | Reason = Other, empty operation notes | Error — operation notes required |
| B2.5 | Happy path cancel | Cancel + client_request (or other with notes) | Saves; reason shown in table/view |
| B2.6 | Leave cancel status | Change from Canceled → Confirmed | Reason field hidden/cleared on save |
| B2.7 | Source required (no lead) | Create reservation without linked lead, empty source | Error — source required |
| B2.8 | Source with lead | Create from lead (lead_id present) | Source optional / inherited from lead |
| B2.9 | Canonical sources | Open Source Campaign | Includes **Mobile Application** (`mobile_application`), not bare `application`; no Telegram |
| B2.10 | Guest National ID optional | New guest patient | National ID labeled optional; empty allowed |
| B2.11 | Placeholder mobile | Guest mobile `0500000000` | Client validation rejects |
| B2.12 | Invalid / placeholder National ID | Enter `1234567890` or `1111111111` | Rejected; leave empty if unknown |
| B2.13 | View / table status reason | Open canceled reservation | Status reason badge/text visible |

### B3. Status patch (if used elsewhere)

| # | Scenario | Steps | Expected |
|---|---|---|---|
| B3.1 | Change status via API-backed status action to 4/6 | If UI uses status endpoint | Must send `status_reason`; `payment_timeout` rejected by Backend |

---

## C. Patients / Clients

### C1. Statistics

| # | Scenario | Steps | Expected |
|---|---|---|---|
| C1.1 | Active patients | Click Active | Patients with ≥1 valid booking in period (not canceled/failed/pending payment) |
| C1.2 | New vs returning | Check New + Returning | **New + Returning = Active** (when date_from set) |
| C1.3 | Profile completeness | Gauge / average % | Shows average; buckets 0-49 / 50-74 / 75-100 clickable |
| C1.4 | Field quality | Missing National ID / mobile / by_field | Drill-downs open filtered patient list |
| C1.5 | Never booked | Profiles without bookings count | Informational count |
| C1.6 | Shared mobile | Click shared mobile | Info signal (families may share) — not an error |
| C1.7 | Duplicate identity | Click duplicate identity | Patients with same valid National ID on >1 record |
| C1.8 | Placeholder cleanup | Click placeholder values | Fake mobiles / fake IDs |
| C1.9 | Revenue WITH permission | User has `dashboard.total_revenue` | Shows Collected Booking Value + averages |
| C1.10 | Revenue WITHOUT permission | User without that permission | Revenue widgets **hidden** (not `0`, not `—`) |
| C1.11 | Existing cards | Coupon / multiple bookings / multiple dates | Still work |

### C2. Patient form

| # | Scenario | Steps | Expected |
|---|---|---|---|
| C2.1 | National ID optional | Create patient, leave National ID empty | Saves OK |
| C2.2 | Valid National ID | 10 digits starting with 1 or 2 | Saves OK |
| C2.3 | Invalid format | e.g. 9 digits or starts with 3 | Client validation error |
| C2.4 | Placeholder ID | `1234567890` or repeated digit | Rejected |
| C2.5 | Placeholder mobile | `0500000000` | Rejected |
| C2.6 | Shared mobile allowed | Mobile already used by another patient | **Allowed** (no uniqueness error for mobile alone) |
| C2.7 | Duplicate National ID | Use National ID of existing patient | 422 → banner with link **Open / use existing patient #ID** |
| C2.8 | Open existing | Click that link | Navigates to existing patient; modal closes |

---

## D. Doctors

| # | Scenario | Steps | Expected |
|---|---|---|---|
| D1 | Stats appear | Open Doctors with dates + statistics | Cards: active doctors, working doctors, scheduled, completed, sessions/working doctor |
| D2 | Active vs working | Compare numbers | Active = admin status active; Working = had dated sessions in period |
| D3 | Per-doctor table | Check by_doctor | Name, scheduled, completed, cancelled sessions; link opens calendar for that doctor + dates |
| D4 | By city | Check by_city | Reservations / sessions / doctors served per city (no drill-down link) |
| D5 | No capacity estimates | Scan page | **No** utilization %, available capacity, revenue per doctor, late arrival |

---

## E. Cross-cutting / regression

| # | Scenario | Steps | Expected |
|---|---|---|---|
| E1 | Date filters | Change date_from / date_to on each screen | Stats refresh; Patients use Riyadh days (midnight-edge counts may differ from Reservations) |
| E2 | Permissions | User missing a module permission | That screen blocked as before |
| E3 | Empty data | Narrow date range with no data | Cards show 0 / empty arrays — no JS crash |
| E4 | Pagination | After drill-down click | Lands on page 1 of filtered list |
| E5 | Locale | Switch AR/EN if available | Labels readable; no broken layout |
| E6 | Import sheets (if used) | Import leads/reservations with bad status_reason / source | Row errors returned (Backend); FE shows import errors |

---

## F. Do NOT test / out of scope (deferred)

Tell testers these are **intentionally missing**:

- Doctor available/booked capacity or utilization %
- Revenue per doctor
- “Cancelled by doctor” KPI / late arrival / check-in
- Risk Actions aggregate (bulk deletes)
- Lead ownership assignment field
- Agent conversion **credit** (only factual activity counts exist)
- Invoice/ZATCA accounting revenue on these dashboards (only “Collected Booking Value”)
- `communication_channel` on reservations

---

## Suggested smoke path (30–45 min)

1. **Outbound** → check aging + failure reasons + agent card → create failed lead with reason.  
2. **Reservations** → check unassigned/upcoming → cancel a booking with reason → confirm reason in table.  
3. **Patients** → check active/new/returning → create patient with duplicate National ID → open existing.  
4. **Doctors** → confirm stats + by_doctor link to calendar.  
5. **Permission** → login without `dashboard.total_revenue` → revenue cards hidden on Patients.

---

## Bug report template (for testers)

```
Screen:
Date range / filters:
User / permissions:
Steps:
Expected:
Actual:
Screenshot / network (statistics JSON or 422 body):
```

**Tip:** In Network tab, inspect list responses:
- Contact Center: `statistics` always present  
- Reservations / Clients / Doctors: need `include_statistics=true` (FE should send this)
