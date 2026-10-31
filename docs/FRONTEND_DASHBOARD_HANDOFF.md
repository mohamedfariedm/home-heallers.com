# Frontend Dashboard Handoff — Backend Contract

**Date:** 2026-10-31  
**Audience:** Dashboard FE (give this file to Cursor)  
**Auth:** Sanctum Bearer token on all routes below  
**Rule:** No new `/api/dashboard/*` routes. All metrics live under existing list endpoints in `statistics` (and some row fields).

### FE rules from Backend
1. If a key is **missing** from JSON → do **not** invent `0` / fake charts. Hide the widget.
2. Prefer `*_link` URLs for drill-down; remap host/query if needed — path + query are the contract.
3. Dates: `YYYY-MM-DD`. Business day timezone = **Asia/Riyadh**.
4. Money / LTV keys only appear when the user has permission `dashboard.total_revenue`.

---

## 1) Doctors workload

```http
GET /api/admin/doctors?include_statistics=true&date_from=2026-10-01&date_to=2026-10-31&page=1&limit=20
```

| Query | Meaning |
| --- | --- |
| `include_statistics=true` | Required to get `statistics` |
| `date_from` / `date_to` | **Session** dates (`reservation_dates.date`), not doctor created_at |

### Response shape (relevant parts)

```json
{
  "data": [ { "id": 1, "name": "…" } ],
  "meta": { "current_page": 1 },
  "statistics": {
    "active_doctors": 12,
    "working_doctors": 8,
    "scheduled_sessions": 40,
    "sessions_completed": 28,
    "sessions_per_working_doctor": 3.5,
    "by_doctor": [
      {
        "doctor_id": 1,
        "name": "Dr Name",
        "is_active": true,
        "scheduled_sessions": 5,
        "sessions_completed": 4,
        "cancelled_sessions": 1,
        "cancellation_rate": 16.67,
        "rating": 4.5,
        "link": "https://HOST/api/admin/reservations-calendar?doctor_id=1&date_from=2026-10-01&date_to=2026-10-31"
      }
    ],
    "by_city": [
      {
        "city_id": 1,
        "name": "Riyadh",
        "reservations_count": 10,
        "sessions_count": 20,
        "doctors_served_count": 3
      }
    ]
  }
}
```

### UI notes
- PDF red alerts for utilization **cannot** be built: Backend does **not** send `available_capacity`, `utilization_rate`, `capacity_gap`, `demand_vs_capacity_by_city`.
- `rating` may be omitted per doctor if unknown.
- `cancellation_rate` is 0–100.

---

## 2) Reservations ops + finance + cities

```http
GET /api/admin/reservations?include_statistics=true&date_from=2026-10-01&date_to=2026-10-31&page=1&limit=20
```

| Query | Meaning |
| --- | --- |
| `include_statistics=true` | Required |
| `date_from` / `date_to` | Booking cohort on `reservations.created_at` |
| `abandoned=true` | Draft/Failed list mode (existing) |
| `filter=` | Drill-downs (see table below) |

### Response `statistics`

```json
{
  "statistics": {
    "by_status": {
      "confirmed": { "count": 10, "sessions_count": 20, "link": "…" }
    },
    "seen_count": 5,
    "unseen_count": 5,
    "total_count": 10,
    "paid_statistics": { "count": 4, "total_amount": 4000, "link": "…" },
    "unpaid_statistics": { "count": 3, "total_amount": 3000, "link": "…" },
    "cash_pending_statistics": { "count": 1, "total_amount": 500, "link": "…" },
    "remaining_payment_statistics": { "count": 2, "total_remaining": 800, "link": "…" },
    "by_source_campaign": [],
    "by_service": [],
    "by_category": [],
    "customers": {
      "total_unique_customers": { "count": 8, "link": "…" },
      "multiple_bookings": {
        "customers_count": 2,
        "total_reservations": 5,
        "total_sessions": 10,
        "reservations_link": "…",
        "clients_link": "…"
      }
    },

    "by_cancellation_reason": [
      {
        "status_reason": "client_request",
        "count": 2,
        "canceled_count": 1,
        "failed_count": 1,
        "link": "https://HOST/api/admin/reservations?status_equal=4,6&status_reason_equal=client_request"
      }
    ],
    "unassigned_count": 2,
    "unassigned_link": "https://HOST/api/admin/reservations?filter=unassigned",
    "same_day_count": 1,
    "same_day_link": "https://HOST/api/admin/reservations?filter=same_day&date_from=…&date_to=…",
    "same_day_unassigned_count": 0,
    "same_day_unassigned_link": "https://HOST/api/admin/reservations?filter=same_day_unassigned",
    "upcoming_sessions": {
      "count": 5,
      "reservations_count": 3,
      "link": "https://HOST/api/admin/reservations-calendar?date_from=2026-10-31&date_to=2026-11-07&status=pending,confirmed"
    },
    "unscheduled_sessions_count": 1,
    "unscheduled_sessions_link": "https://HOST/api/admin/reservations?filter=unscheduled_sessions",
    "sessions_per_reservation": 2.5,
    "package_conversion_rate": 40,
    "single_session_clients_count": 3,
    "single_session_clients_link": "https://HOST/api/admin/reservations?filter=single_session_clients",
    "package_completion_rate": 66.67,
    "completion_rate": 70,

    "sessions_by_city": [
      { "city_id": 1, "city": "Riyadh", "sessions_count": 20, "link": "…" }
    ],
    "cancellation_by_city": [
      {
        "city_id": 1,
        "city": "Riyadh",
        "reservations_count": 10,
        "canceled_count": 2,
        "cancellation_rate": 20,
        "link": "…"
      }
    ],
    "unknown_location_rate": 5,
    "conversion_by_city": [
      {
        "city_id": 1,
        "city": "Riyadh",
        "leads_count": 50,
        "reservations_count": 10,
        "conversion_rate": 20,
        "link": "…"
      }
    ],

    "gross_revenue": 10000,
    "collected_revenue": 8000,
    "pending_revenue": 1500,
    "collection_rate": 84.21,
    "revenue_by_city": [
      { "city_id": 1, "city": "Riyadh", "collected_revenue": 5000, "link": "…" }
    ]
  }
}
```

### Money keys (permission)
Present only with `dashboard.total_revenue`:
- `gross_revenue`, `collected_revenue`, `pending_revenue`, `collection_rate`, `revenue_by_city`

Definitions:
- **Gross** = SUM `total_amount` (excludes canceled/failed/draft)
- **Collected** = paid only
- **Pending** = `pending` + `cash_pending`
- **Collection rate** = collected ÷ (collected + pending) × 100

### Row field (list item)

```json
{
  "id": 99,
  "status": 3,
  "status_reason": null,
  "reservation_source": "Dashboard",
  "communication_channel": "whatsapp",
  "lead_id": 12
}
```

`communication_channel` comes from the linked lead; may be `null`.

### Reservation drill-down `filter=` values

| `filter` | Meaning |
| --- | --- |
| `unassigned` | Open reservation with no doctor (res or session) |
| `same_day` | First session date = Riyadh booking day |
| `same_day_unassigned` | Confirmed + no doctor + session start within next 24h |
| `unscheduled_sessions` | Open + session without date |
| `single_session_clients` | Clients whose SUM(sessions_count) = 1 |

### PDF alerts FE can wire (when keys exist)
- Cancellation rate > 12% → red (derive from `by_status.canceled` / total if needed)
- `same_day_unassigned_count` > 0 → red
- `collection_rate` < 80–85 → red (if key present)

### NOT available on reservations
- `average_time_to_assign_hours`
- `renewal_rate`
- `single_to_package_conversion_rate`

---

## 3) Patients / clients

```http
GET /api/admin/clients?include_statistics=true&date_from=2026-10-01&date_to=2026-10-31&page=1&limit=20
```

Period = reservation **created_at** in Asia/Riyadh business days.

### Response `statistics`

```json
{
  "statistics": {
    "by_status": {
      "3": { "status": 3, "label": "Confirmed", "users_count": 5, "link": "…" }
    },
    "with_coupon": { "users_count": 2, "link": "…" },
    "with_multiple_reservations": { "users_count": 3, "link": "…" },
    "with_multiple_dates_same_reservation": { "users_count": 1, "link": "…" },

    "active_patients_count": 10,
    "active_patients_link": "…?filter=active_patients",
    "new_patients_count": 4,
    "new_patients_link": "…?filter=new_patients",
    "returning_patients_count": 6,
    "returning_patients_link": "…?filter=returning_patients",

    "profile_completeness": {
      "patients_count": 10,
      "average_percent": 72.5,
      "buckets": [
        { "bucket": "0-49", "count": 2, "link": "…?filter=profile_completeness&completeness_bucket=0-49" }
      ],
      "by_field": [
        { "field": "national_id", "complete_count": 8, "missing_or_invalid_count": 2, "link": "…" }
      ]
    },
    "profiles_without_bookings_count": 0,
    "missing_national_id_count": 2,
    "missing_national_id_link": "…",
    "missing_mobile_count": 1,
    "missing_mobile_link": "…",
    "shared_mobile_count": 1,
    "shared_mobile_link": "…?filter=shared_mobile",
    "duplicate_identity_count": 0,
    "duplicate_identity_link": "…?filter=duplicate_identity",
    "duplicate_mobile_count": 0,
    "duplicate_mobile_link": "…?filter=duplicate_identity",
    "placeholder_value_count": 0,
    "placeholder_value_link": "…?filter=placeholder_values",

    "repeat_patient_rate": 35.5,
    "inactive_patients_count": 12,
    "inactive_patients_link": "…?filter=inactive_patients",
    "avg_days_since_last_booking": 41.2,

    "total_revenue": 5000,
    "avg_revenue_per_paying_patient": 2500,
    "avg_booking_value": 1250,
    "high_value_patients_count": 2,
    "high_value_patients_link": "…?filter=high_value_patients",
    "ltv_avg": 2500,
    "ltv_by_bucket": [
      { "bucket": "0-999", "count": 3, "link": "…?filter=ltv_bucket&ltv_bucket=0-999" },
      { "bucket": "1000-4999", "count": 5, "link": "…?filter=ltv_bucket&ltv_bucket=1000-4999" },
      { "bucket": "5000+", "count": 2, "link": "…?filter=ltv_bucket&ltv_bucket=5000+" }
    ]
  }
}
```

### Documented thresholds
| Metric | Threshold |
| --- | --- |
| Inactive | no valid booking for **90 days** |
| High value | collected booking value ≥ **5000 SAR** |

Money / LTV / high-value keys require `dashboard.total_revenue`.

### Client drill-down `filter=` values

| `filter` | Extra query |
| --- | --- |
| `active_patients` | — |
| `new_patients` | — |
| `returning_patients` | — |
| `inactive_patients` | — |
| `high_value_patients` | — |
| `ltv_bucket` | `ltv_bucket=0-999` \| `1000-4999` \| `5000+` |
| `profile_completeness` | `completeness_bucket=0-49` \| `50-74` \| `75-100` |
| `profile_field_missing` | `profile_field=national_id` \| `date_of_birth` \| `gender` \| `city_id` \| `mobile` |
| `shared_mobile` / `duplicate_identity` / `placeholder_values` | — |
| `multiple_bookings` / `multiple_dates` | existing |

---

## 4) Contact Center (customer supports)

```http
GET /api/admin/customer-supports?type=marketing&date_from=2026-10-01&date_to=2026-10-31&page=1&limit=20
```

`statistics` is **always** returned (no `include_statistics` flag).

### Response `statistics` (dashboard-relevant)

```json
{
  "statistics": {
    "total": 100,
    "by_status": [
      { "status": "new", "count": 20, "link": "…" }
    ],
    "by_source_campaign": [],
    "lead_quality_by_source_campaign": [],
    "by_leads_qualification": [],
    "by_communication_channel": [],
    "by_offer": [],
    "by_city": [],
    "by_state": [],
    "by_rework": [],
    "by_communication_times": [],
    "clients_with_mobile_and_reservation": 10,
    "clients_with_mobile_and_multiple_reservations": 3,

    "by_failure_reason": [
      {
        "status_reason": "price",
        "count": 4,
        "failed_count": 3,
        "closed_count": 1,
        "link": "…"
      }
    ],
    "follow_up_aging": {
      "open_count": 20,
      "avg_age_hours": 18.5,
      "never_followed_up_count": 4,
      "sla_breach_count": 2,
      "sla_breach_link": "…?sla_breach=1",
      "buckets": [
        { "bucket": "0-24h", "count": 8, "link": "…?follow_up_aging=0-24h" }
      ]
    },
    "unset_status_count": 3,
    "follow_up_rate": 22.5,
    "new_aging_avg_hours": 6.2,
    "first_response_time_avg_minutes": 45.0,
    "by_agent": [
      {
        "agent_id": 7,
        "name": "Agent",
        "roles": ["Operations"],
        "supports_count": 10,
        "contact_actions_count": 25,
        "success_marked_count": 3,
        "reservations_created_count": 2,
        "link": "…"
      }
    ],
    "converted_via_lead": {
      "leads_count": 15,
      "reservations_count": 20,
      "sessions_count": 40,
      "link": "…?converted=1"
    },
    "offer_conversion": [
      {
        "offer": "Package A",
        "leads_count": 10,
        "converted_leads": 4,
        "reservations_count": 5,
        "sessions_count": 12,
        "conversion_rate": 40,
        "link": "…"
      }
    ]
  }
}
```

### Notes
- `first_response_time_avg_minutes` = proxy from `first_call_time`; **omit key** if no data → hide widget.
- `new_aging_avg_hours` likewise may be omitted.
- `by_agent` is **activity**, not ownership — do **not** show “owned leads”.
- No `missed_calls_*`, `inbound_response_rate`, CPL/CPR/ROAS.

### Create validation (admin)
Required: `source_campaign` (canonical), `communication_channel`.  
Failed/closed: `status_reason` required; `other` needs notes.

---

## 5) Operational KPIs (user activity report)

```http
GET /api/admin/reports/user-activity?date_from=2026-10-01&date_to=2026-10-31
```

### Extra keys on existing `statistics`

```json
{
  "statistics": {
    "total_users": 5,
    "total_actions": 100,
    "actions_per_active_user": 20,
    "percent_create": 30,
    "percent_update": 60,
    "percent_delete": 10,
    "risk_actions_count": 12,
    "risk_action_rate": 12,
    "today": 4,
    "this_week": 20,
    "this_month": 100,
    "by_event": [],
    "by_log_name": []
  }
}
```

---

## Keys Backend will NEVER send (do not mock)

| Area | Keys |
| --- | --- |
| Doctors capacity | `available_capacity`, `booked_capacity`, `utilization_rate`, `capacity_gap`, `demand_vs_capacity_by_city`, `revenue_per_doctor`, `late_arrival_rate` |
| Reservations | `average_time_to_assign_hours`, `renewal_rate`, `single_to_package_conversion_rate` |
| Contact center | `missed_calls_count`, `missed_calls_rate`, `inbound_response_rate`, `ad_spend`, `cpl`, `cpr`, `roas`, `by_agent[].owned_leads_count` |
| Org targets | `reservations_target`, `revenue_target`, `target_achievement_rate` |

---

## Cursor prompt (paste this)

```text
Implement Home Healers admin dashboard UI using ONLY docs/FRONTEND_DASHBOARD_HANDOFF.md as the API contract.

Rules:
- Use existing admin list endpoints; never call /api/dashboard/*.
- Pass include_statistics=true for doctors, reservations, clients.
- Customer-supports already returns statistics.
- If a statistics key is missing, hide the widget (do not fake 0).
- Use *_link fields for drill-downs.
- Gate money/LTV/high-value widgets on permission dashboard.total_revenue.
- Do not build capacity/utilization/ROAS/assign-time/missed-calls widgets.
- date_from/date_to: doctors = session dates; reservations/clients/leads = booking/lead created period (Asia/Riyadh business day).
```

---

## Related Backend doc

Full deferred list + formulas: [`BACKEND_DASHBOARD_DELIVERY.md`](./BACKEND_DASHBOARD_DELIVERY.md)
