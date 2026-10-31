# Frontend Remaining Work — No Backend Wait

**Plan:** [`home_healers_dashboard_implementation_plan.md`](./home_healers_dashboard_implementation_plan.md)  
**Backend ask (blocked items):** [`home_healers_dashboard_backend_request.md`](./home_healers_dashboard_backend_request.md)

These tasks use **existing** API `statistics` / UI only. Safe to ship before Backend Phase C.

---

## Checklist

| ID | Task | Where | Status |
| --- | --- | --- | --- |
| FE-A1 | Show tone labels (`Needs Attention` / `Average` / `Excellent`) on rate KPI cards | Contact Center, Reservations | Done |
| FE-A2 | Color Profile Completeness by PDF §12 (&lt;70 red, 70–90 amber, &gt;90 green) | Patients | Done |
| FE-A3 | Add Repeat Patient Rate from `with_multiple_reservations` | Patients | Done |
| FE-A4 | Sample Too Small badge when campaign sample &lt; 50 leads | Contact Center lead quality | Done |
| FE-A5 | Rename KPIs tabs to User Audit / Doctor Activity + short note | KPIs page | Done |
| FE-A6 | Ensure Unknown Source red flag remains on Inbound/Outbound/Reservations | Already present — verify | Done (kept) |
| FE-A7 | Empty / missing statistics friendly copy | List stats components | Later |
| FE-A8 | Executive Red Flags strip on Statistics Dashboard (compose existing aggregates) | `/` dashboard | Later (optional) |

---

## Explicitly NOT in this list

Do **not** build UI that invents:
- Doctor available capacity / utilization
- Revenue per doctor
- Late arrival
- CPL / CPR / ROAS
- Package renewal without Backend keys
- Agent ownership conversion credit

Those wait for Backend reply MD.

---

## Implementation notes

- Threshold helpers live in `src/utils/dashboard-metric-helpers.ts` (list pages) and `src/app/shared/statistics/dashboard/metric-thresholds.ts` (aggregates dashboard). Prefer sharing labels via helpers.
- Keep using Backend `link` for drill-downs; remap only legacy null-status cases already handled.
