# Home Healers Dashboard: Frontend Integration Guide

**Audience:** Frontend team only.  
**Source of truth:** written from the final Backend code (controllers, services, repositories, requests, enums). JSON examples in Backend responses match the shapes below.

> This file mirrors the Backend-authored FE integration guide delivered 2026-09-26.  
> Related: [`home_healers_dashboard_backend_missing_apis.md`](./home_healers_dashboard_backend_missing_apis.md) (now reduced to deferred items only).

---

## 1. Overview

### Integration rules

- **No new Dashboard endpoints.** No `/api/dashboard/...`.
- Keep using **existing list APIs**. Metrics are **optional keys inside `statistics`**.
- Existing keys / `link` shapes unchanged except alias-merging on sources (§12).
- Additive metrics: ignoring unknown keys stays safe.

### Endpoints

| Screen | Endpoint | `statistics` |
|---|---|---|
| Contact Center | `GET /api/admin/customer-supports` | **Always** |
| Reservations | `GET /api/admin/reservations` | Only with `include_statistics=true` |
| Patients | `GET /api/admin/clients` | Only with `include_statistics=true` |
| Doctors | `GET /api/admin/doctors` | Only with `include_statistics=true` (**new**) |
| Calendar | `GET /api/admin/reservations-calendar` | Always |

### Permission-dependent

Clients revenue keys (`total_revenue`, `avg_revenue_per_paying_patient`, `avg_booking_value`) returned **only** with `dashboard.total_revenue`. If absent → hide widgets (do not show `0`).

```ts
const canSeeRevenue = 'total_revenue' in statistics;
```

---

## 2. Contact Center — new statistics keys

- `by_failure_reason[]` — `{ status_reason, count, failed_count, closed_count, link }`
- `follow_up_aging` — `{ open_count, avg_age_hours, never_followed_up_count, sla_breach_count, sla_breach_link, buckets[] }`
- `unset_status_count`
- `by_agent[]` — activity metrics (**not** ownership / attribution)
- `converted_via_lead` — `{ leads_count, reservations_count, sessions_count, link }`
- `offer_conversion[]` — includes `conversion_rate`

### Row fields

- `status_reason`, `last_follow_up_at` (read-only)

### Canonical values

**Status:** `new`, `possible`, `follow_up`, `negotiation`, `success`, `failed`, `closed`

**status_reason (failed/closed):**  
`price_too_high`, `wants_massage`, `wrong_number`, `no_answer`, `not_needed`, `outside_coverage`, `outside_ksa`, `wants_insurance`, `thinks_clinic_or_center`, `registered_via_app`, `inquiry_only`, `duplicate`, `other` (requires `notes`)

**source_campaign:**  
`google`, `instagram`, `facebook`, `tiktok`, `snapchat`, `twitter`, `youtube`, `whatsapp`, `call`, `website`, `mobile_application`, `referral`, `center`, `other`

**communication_channel:** `WhatsApp`, `Call`, `Lead Form`

---

## 3. Reservations — new statistics keys

- `by_cancellation_reason[]`
- `unassigned_count` + `unassigned_link` (`filter=unassigned`) — state now; ignores date range
- `same_day_count` + `same_day_link`
- `upcoming_sessions` `{ count, reservations_count, link }` — Riyadh today…+7d
- `unscheduled_sessions_count` + `unscheduled_sessions_link`

### Row: `status_reason`

Staff reasons (never send `payment_timeout`):  
`client_request`, `price_too_high`, `payment_failed`, `no_doctor_available`, `outside_coverage`, `schedule_conflict`, `patient_unreachable`, `health_condition`, `wants_insurance`, `duplicate_booking`, `test_booking`, `other` (needs operation note)

Required when status **changes to** 4 or 6.

---

## 4. Patients — new statistics keys

- `active_patients_count` / `_link` — label: "Patients with a valid booking in the selected period"
- `new_patients_count` / `returning_patients_count` (+ links)
- `profile_completeness` `{ patients_count, average_percent, buckets[], by_field[] }`
- `profiles_without_bookings_count`
- `missing_national_id_*`, `missing_mobile_*`
- `shared_mobile_*` (info — families may share)
- `duplicate_identity_*` (alias `duplicate_mobile_*` is **identity**, not phones)
- `placeholder_value_*`
- Collected Booking Value keys (permission-gated)

**National ID** optional; duplicates → 422 with `existing_patient_id` + `match`.

---

## 5. Doctors — new `statistics` block

- `active_doctors`, `working_doctors`
- `scheduled_sessions`, `sessions_completed`, `sessions_per_working_doctor`
- `by_doctor[]`, `by_city[]` (served demand only)

**Do not display:** capacity, utilization, revenue_per_doctor, late arrival, cancellation attribution.

`date_from`/`date_to` = **session dates**.

---

## 6. Filters (highlights)

| Purpose | Example |
|---|---|
| Lead reasons | `status_equal=failed,closed&status_reason_equal=no_answer` |
| Null reason | `status_reason_equal=null` |
| Agent contacts | `contacted_by=12&contacted_from=…&contacted_to=…` |
| Aging / SLA | `follow_up_aging=1-3d`, `sla_breach=1` |
| Converted | `converted=1` |
| Unassigned / same-day / unscheduled | `filter=unassigned\|same_day\|unscheduled_sessions` |
| Patients | `filter=active_patients\|new_patients\|returning_patients\|…` |

Links are absolute `APP_URL` URLs — use path+query with Bearer client, or map query params into screen filters.

---

## 9. Frontend validation (UX)

| Resource | Rule |
|---|---|
| Lead create | Require `source_campaign` + `communication_channel` |
| Lead failed/closed | Require `status_reason`; `other` → `notes` |
| Reservation → 4/6 | Require `status_reason`; never `payment_timeout`; `other` → notes/operation_notes |
| Reservation create | `source_campaign` required unless `lead_id` |
| Patient | Mobile required; national ID optional + format; handle duplicate 422 |

---

## 11. Mapping checklist (implemented in FE)

| Area | Status |
|---|---|
| Contact Center Top KPIs + aging + failure reasons + agents + offer conversion + converted_via_lead | Wired in `kanban-statistics-cards.tsx` |
| Status reason modal on kanban Failed/Closed | `status-reason-modal.tsx` + `use-kanban-status-change.tsx` |
| Lead form `status_reason` + schema | `suport-form.tsx` / `suport-form.schema.ts` |
| Reservations ops cards + cancellation reasons | `reservation-statistics.tsx` |
| Patients quality / active / revenue | `client-statistics.tsx` |
| Doctors workload stats | `doctor-statistics.tsx` + `include_statistics=true` |
| Canonical source/status option lists | `dashboard-enums.ts` + kanban options |

---

## 12. Breaking changes (must handle)

1. Lead create requires source + channel → 422  
2. Lead status must be one of 7 values  
3. Lead `status_reason` required on failed/closed  
4. Reservation cancel/fail requires `status_reason`  
5. Reservation create requires source unless `lead_id`  
6. Patient national ID optional + validated; duplicate returns `existing_patient_id`  
7. Source aliases merged in statistics charts  
8. Clients stats use Asia/Riyadh days  

---

## 13. Deferred (do not invent)

- Doctor capacity / utilization / revenue_per_doctor  
- Doctor cancellation attribution / late arrival  
- Risk actions aggregate  
- Lead ownership / conversion credit  
- Invoice accounting revenue on these dashboards  
- `communication_channel` on reservations  

---

## FE implementation notes

Enums live in `src/config/dashboard-enums.ts`.  
Shared additive types in `src/types/dashboard-statistics.ts`.  

### Wired on Frontend (checklist)

| Area | Done |
|---|---|
| Contact Center new stats widgets + agent table | Yes |
| Lead `status_reason` / channel / source validation | Yes |
| Lead row `status_reason` + `last_follow_up_at` display | Yes |
| Null-status link → `status_equal=null` | Yes |
| Reservation new ops stats + cancel reasons chart | Yes |
| Reservation form `status_reason` on status 4/6 | Yes |
| Canonical reservation `source_campaign` options | Yes |
| Patients active/new/returning + completeness + DQ | Yes |
| Collected Booking Value (hide if key absent) | Yes |
| Patient duplicate National ID → open existing | Yes |
| Placeholder mobile / National ID client validation | Yes |
| Doctors workload stats + by_doctor / by_city | Yes |

### Deferred — cannot invent on FE

Capacity/utilization, revenue_per_doctor, doctor cancel attribution, late arrival, risk actions, ownership/conversion credit, invoice accounting revenue, reservation `communication_channel`.

For full JSON response examples, use live Backend responses with seeded data (`date_from`/`date_to` as in Backend guide §10) — shapes match the TypeScript interfaces above.

