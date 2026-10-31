# Backend Request — Home Healers Dashboard (PDF Specs)

**Send this file only to Backend.**  
**Date:** 2026-10-31  
**From:** Frontend  
**Sources:** Modules Spec + Technical Spec (Home Healers dashboard PDFs)

---

## Rules (must follow)

1. **Do not create** new `/api/dashboard/...` endpoints.
2. Add metrics as **additive keys** inside existing list responses under `statistics` (same pattern already used).
3. Every countable metric should include a drill-down `link` when possible (absolute URL is OK; FE remaps query).
4. If a metric cannot be computed yet → **omit the key** (do not send fake `0`).
5. After implementation, reply with one MD: final JSON examples + filters + permissions + still-deferred list.

---

## Already delivered on Backend (do not rebuild)

| Screen | Endpoint | Already in `statistics` / rows |
| --- | --- | --- |
| Contact Center | `GET /api/admin/customer-supports` | status, sources, channels, offers, qualification, lead quality, failure reasons, follow-up aging, agents (activity), offer conversion, converted_via_lead; row: `status_reason`, `last_follow_up_at` |
| Reservations | `GET /api/admin/reservations?include_statistics=true` | by status, paid/unpaid, sources, services, categories, clients; cancel reasons; unassigned / same-day / upcoming / unscheduled; row: `status_reason` |
| Patients | `GET /api/admin/clients?include_statistics=true` | active/new/returning, completeness, DQ (missing/shared/duplicate/placeholder), optional collected booking value |
| Doctors | `GET /api/admin/doctors?include_statistics=true` | active/working doctors, scheduled/completed sessions, sessions_per_working_doctor, by_doctor, by_city |

Frontend already consumes the above. Focus only on **Missing** below.

---

## Priority 0 — Must have (blocks PDF Doctors / Ops / Finance)

### A) Doctors capacity & quality  
`GET /api/admin/doctors?include_statistics=true`  
Dates = **session** dates (`date_from` / `date_to`).

| Key | Type | Formula (PDF) |
| --- | --- | --- |
| `available_capacity` | number | SUM(available slots for active doctors in period) |
| `booked_capacity` | number | SUM(booked slots in period) |
| `utilization_rate` | number 0–100 | booked_capacity ÷ available_capacity × 100 |
| `capacity_gap` | number | required/demand sessions − available_capacity |
| `demand_vs_capacity_by_city[]` | array | `{ city, city_id?, demand, available_capacity, booked_capacity, utilization_rate, gap, link }` |
| `revenue_per_doctor` | number \| omit | Collected revenue assigned to doctor(s) ÷ active/working doctors — only if allocation rule is defined |
| `by_doctor[].cancellation_rate` | number | canceled assigned ÷ assigned × 100 |
| `by_doctor[].late_arrival_rate` | number \| omit | late sessions ÷ completed × 100 — only if check-in exists |
| `by_doctor[].rating` | number \| omit | AVG(patient rating) if reviews exist |

**Prerequisite model:** doctor availability / slots. Without slots, utilization is impossible — say so if deferred.

**PDF alerts:** utilization &lt; 50% or &gt; 95% = red; demand &gt; capacity by city = red.

---

### B) Reservations ops + packages + clear money  
`GET /api/admin/reservations?include_statistics=true`

| Key | Type | Formula / notes |
| --- | --- | --- |
| `average_time_to_assign_hours` | number \| null | AVG(assigned_at − confirmed_at) |
| `same_day_unassigned_count` + `same_day_unassigned_link` | number + link | confirmed + no doctor + session within 24h |
| `sessions_per_reservation` | number | total_sessions ÷ total_reservations |
| `package_conversion_rate` | number \| omit | package clients ÷ clients with reservation × 100 |
| `single_session_clients_count` + `link` | number + link | clients with exactly 1 session |
| `single_to_package_conversion_rate` | number \| omit | upgraded to package ÷ single-session clients × 100 |
| `package_completion_rate` | number \| omit | completed package sessions ÷ purchased package sessions × 100 |
| `renewal_rate` | number \| omit | renewed packages ÷ finished packages × 100 |
| `gross_revenue` | number \| omit | SUM invoice totals (issued) — label clearly |
| `collected_revenue` | number \| omit | SUM paid amounts only |
| `pending_revenue` | number \| omit | unpaid / pending |
| `collection_rate` | number \| omit | collected ÷ (collected + pending) × 100 |
| `completion_rate` | number \| omit | completed sessions ÷ scheduled sessions × 100 |
| `communication_channel` on reservation **row** | string \| null | PDF wants channel on reservation; today FE uses `reservation_source` |

If accounting revenue is out of scope, keep existing paid/unpaid reservation stats and mark gross/collected as deferred.

**PDF alerts:** cancellation &gt; 12% red; failure &gt; 5% red; unassigned within 24h &gt; 0 red; collection &lt; 80–85% red.

---

## Priority 1 — Call center depth + marketing (PDF Technical §§6–8)

### C) Contact Center extras  
`GET /api/admin/customer-supports` (`statistics` always present)

| Key | Type | Formula / notes |
| --- | --- | --- |
| `follow_up_rate` | number | follow_up status count ÷ total × 100 (if not already exposed as rate) |
| `new_aging_avg_hours` | number | AVG(now − created_at) WHERE status = `new` |
| `inbound_response_rate` | number | answered inbound ÷ inbound × 100 |
| `first_response_time_avg_minutes` | number | AVG(first_response_at − created_at) |
| `missed_calls_count` / `missed_calls_rate` | number | only if telephony data exists |
| `sla_breach` | already partially via `follow_up_aging` | keep/extend consistently |
| `by_agent[].owned_leads_count` | number \| omit | only if real `agent_id` ownership exists (not activity-only) |
| UTM fields on create | validation | PDF: require `source` / campaign / medium / channel; unknown → store Unknown |

Keep enforcing (already expected):
- create: `source_campaign` + `communication_channel` required  
- failed/closed: `status_reason` required (`other` → notes)

**Marketing spend (optional / confirm out of scope):**

| Key | Formula |
| --- | --- |
| `ad_spend` by campaign/channel | input or integration |
| `cpl` | ad_spend ÷ leads |
| `cpr` | ad_spend ÷ reservations |
| `roas` | collected_revenue ÷ ad_spend |

If no spend model → mark CPL/CPR/ROAS **out of scope**.

---

### D) Patients LTV / segments  
`GET /api/admin/clients?include_statistics=true`

| Key | Type | Formula |
| --- | --- | --- |
| `repeat_patient_rate` | number | patients with 2+ reservations ÷ patients in scope × 100 |
| `high_value_patients_count` + `link` | number + link | define threshold (document it) |
| `inactive_patients_count` + `link` | number + link | no booking for N days (document N) |
| `avg_days_since_last_booking` | number | |
| `ltv_avg` | number \| omit | AVG collected revenue per patient |
| `ltv_by_bucket[]` | array \| omit | buckets + counts + links |

Hide revenue/LTV keys without permission (e.g. `dashboard.total_revenue`).

---

## Priority 2 — Cities + Operational KPIs (PDF §§10–12, KPI page)

### E) City / area decision metrics  
Prefer under reservations `statistics` or existing aggregates (document which):

| Key | Formula |
| --- | --- |
| `revenue_by_city[]` | SUM collected by city + link |
| `conversion_by_city[]` | reservations ÷ leads by city |
| `cancellation_by_city[]` | canceled ÷ reservations by city |
| `sessions_by_city[]` | COUNT sessions by city |
| `unknown_location_rate` | unknown/missing city ÷ total × 100 |

### F) KPIs Operational layer (not only activity logs)

Today FE KPIs = User Audit / Doctor Activity logs. PDF needs operational risk metrics.

Add on existing activity report endpoints (or document one agreed list endpoint — still no new dashboard service):

| Key | Formula |
| --- | --- |
| `actions_per_active_user` | total_actions ÷ active_users |
| `percent_create` / `percent_update` / `percent_delete` | event share × 100 |
| `risk_actions_count` / `risk_action_rate` | deletes + bulk updates + permission changes |
| Doctor operational fields | reuse doctors capacity/sessions/utilization next to activity |

---

## Targets (Executive KPI — PDF §5)

If monthly targets exist:

| Key | Where | Formula |
| --- | --- | --- |
| `reservations_target` / `revenue_target` | settings or statistics | |
| `target_achievement_rate` | reservations or aggregates | actual ÷ target × 100 |

If no targets table → defer and say so.

---

## Data integrity (PDF mandatory rules)

Please confirm Backend enforces:

1. Lead/Reservation create cannot leave source empty → store canonical enum or `unknown` + track `% Unknown Source`.
2. Cancel/fail reservation → `status_reason` required (staff never sends `payment_timeout`).
3. Failed/closed lead → `status_reason` required.
4. Qualified lead definition remains: inside KSA + needs service + city covered + answered (or score ≥ 80).
5. Separate **Gross** vs **Collected** revenue naming if both exist.

---

## Suggested delivery order for Backend

1. **P0-A** Doctors capacity + demand_vs_capacity_by_city  
2. **P0-B** Reservations assign time, package rates, gross/collected/pending (or explicit defer)  
3. **P1-C** Contact Center aging/response/missed calls  
4. **P1-D** Patients LTV / inactive / high-value  
5. **P2-E/F** Cities + Operational KPI risk actions  
6. Marketing CPL/CPR/ROAS only if spend exists  

---

## Reply template (Backend → Frontend)

```md
# Backend Dashboard Delivery — YYYY-MM-DD

## Implemented keys
### Doctors `statistics`
```json
{
  "statistics": {
    "available_capacity": 120,
    "booked_capacity": 84,
    "utilization_rate": 70,
    "demand_vs_capacity_by_city": []
  }
}
```

### Reservations `statistics`
...

### Customers / Clients `statistics`
...

### Customer supports `statistics`
...

## Filters & link examples
...

## Permissions
...

## Still deferred (with reason)
...
```

Frontend will implement UI only after this reply MD.

---

## Contact for questions

Frontend will not invent capacity, ROAS, LTV, late arrival, or agent ownership credit without keys from this delivery.
