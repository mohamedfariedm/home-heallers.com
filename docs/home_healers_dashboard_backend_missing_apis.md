# Backend Gaps for Dashboard — Home Healers

**Status (2026-09-26):** Backend delivered the dashboard statistics gaps.  
Frontend must integrate using:

→ [`home_healers_dashboard_frontend_integration.md`](./home_healers_dashboard_frontend_integration.md)

That guide is the **source of truth** (written from final Backend code). Do not invent extra endpoints or estimate deferred metrics.

---

## Still deferred by Backend (do not display substitutes)

These cannot be solved on the Frontend. Do **not** calculate or invent estimates:

| Item | Status |
| --- | --- |
| Doctor `available_capacity`, `booked_capacity`, utilization % | Deferred — needs capacity/availability model |
| `revenue_per_doctor` | Deferred — needs earned-revenue allocation definition |
| Doctor cancellation attribution (`cancellation_by_doctor`) | Deferred |
| Doctor late arrival / check-in KPI | Deferred — no check-in data |
| Risk Actions aggregate (deletes / bulk ops) | Deferred |
| Lead ownership / assignment (`agent_id`) | Not planned — `by_agent` is activity-based only |
| Conversion attribution as credit per agent | Not provided — use factual `success_marked_count` / `reservations_created_count` |
| Invoice/accounting revenue on dashboards | Use "Collected Booking Value" from clients stats only |
| `communication_channel` on reservations | Not added — use existing `reservation_source` |
| Fixes to legacy link limitations (§6 of guide) | Not in Backend scope; FE remaps where possible (e.g. `status=` → `status_equal=null`) |

---

## Delivered — Frontend wired

### Contact Center (`customer-supports` — statistics always present)
- Row: `status_reason`, `last_follow_up_at` (shown on cards + view modal)
- Stats: `by_failure_reason`, `follow_up_aging`, `unset_status_count`, `by_agent`, `converted_via_lead`, `offer_conversion`
- Create requires canonical `source_campaign` + `communication_channel`
- `status_reason` required when status → `failed` / `closed` (`other` needs `notes`)
- Null-status drill-down remapped to `status_equal=null`

### Reservations (`?include_statistics=true`)
- Row: `status_reason` (form + table + view)
- Stats: `by_cancellation_reason`, `unassigned_count`/`link`, `same_day_count`/`link`, `upcoming_sessions`, `unscheduled_sessions_count`/`link`
- Status → 4/6 requires `status_reason` (never send `payment_timeout` from staff)
- Canonical `source_campaign` dropdown (`mobile_application`, not `application`)

### Patients (`?include_statistics=true`)
- Stats: active/new/returning, `profile_completeness`, missing fields, shared/duplicate identity, placeholders, Collected Booking Value (only if `total_revenue` key present)
- National ID optional; placeholder mobile/ID rejected client-side
- Duplicate 422 → "Open / use existing patient" via `existing_patient_id`

### Doctors (`?include_statistics=true`) — **new statistics block**
- `active_doctors`, `working_doctors`, `scheduled_sessions`, `sessions_completed`, `sessions_per_working_doctor`, `by_doctor[]`, `by_city[]`
- Dates filter **session** dates

See the Frontend Integration Guide for filters, links, JSON examples, and mapping checklist.
