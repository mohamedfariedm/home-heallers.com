# Home Healers Dashboard — Implementation Plan (from PDF specs)

**Sources**
- `home_healers_dashboard_modules_spec_ar.pdf` / `.md`
- `home_healers_dashboard_technical_spec_ar.pdf` / `.md`

**Related**
- Backend ask → [`home_healers_dashboard_backend_request.md`](./home_healers_dashboard_backend_request.md)
- FE work without Backend → [`home_healers_dashboard_frontend_remaining_work.md`](./home_healers_dashboard_frontend_remaining_work.md)
- Already delivered FE wiring notes → [`home_healers_dashboard_frontend_integration.md`](./home_healers_dashboard_frontend_integration.md)

---

## Goal

Turn list/kanban screens into a decision cockpit along the client journey:

**Lead → Qualify → Reservation → Session → Collect → Capacity / KPI audit**

Rules locked by the PDFs:
1. **No new dashboard endpoints** — only additive keys inside existing list `statistics`.
2. Do **not** invent Backend metrics on the Frontend.
3. Every rate card should show number + color tone + drill-down `link` when available.

---

## Current status (2026-10-31)

| Area | Status |
| --- | --- |
| Journey sidebar order | Done (FE) |
| Contact Center Top KPIs + Unknown Source + aging/failure/agents | Done (needs Backend keys already delivered) |
| Reservations rates + unassigned/same-day/upcoming + cancel reasons | Done |
| Patients active/new/returning + DQ + completeness | Mostly done |
| Doctors workload stats (sessions / by city) | Done |
| Status reason validation (leads + reservations) | Done |
| Doctor capacity / utilization / revenue per doctor | **Missing Backend** |
| Marketing CPL/CPR/ROAS | **Missing Backend** |
| Package renewal / package conversion deep metrics | **Missing Backend** |
| KPIs operational tab (not only activity logs) | **Missing Backend** + FE labels |
| Full threshold badges + sample-too-small | **FE-only remaining** |
| Executive Red Flags strip reuse | **FE-only remaining** |

---

## Phases

### Phase A — FE only (start now)
Work that uses **existing** `statistics` / UI only.  
Tracked in `home_healers_dashboard_frontend_remaining_work.md`.

1. Threshold labels on Contact Center + Reservations rate cards (`Needs Attention` / `Average` / `Excellent`).
2. Profile Completeness color by §12 thresholds.
3. Repeat Patient Rate from `with_multiple_reservations`.
4. Sample Too Small on campaign quality when volume &lt; 50 leads / &lt; 20 reservations.
5. KPIs tab copy: **User Audit** / **Doctor Activity** (+ note that Operational KPIs need Backend).
6. Empty-state copy where stats are missing.

### Phase B — Backend delivery (blocked)
Backend adds additive fields listed in `home_healers_dashboard_backend_request.md`.  
After they return an MD with final JSON shapes, FE integrates (no invented fields).

### Phase C — FE after Backend
1. Doctors capacity / utilization / demand-vs-capacity by city.
2. Revenue per doctor (collected only).
3. Late arrival + cancellation-by-doctor (if check-in model arrives).
4. Patient LTV / high-value segments if new keys arrive.
5. KPIs Operational tab widgets.
6. Optional Executive Red Flags page/section fed by the same list stats.

---

## Acceptance (PDF)

- [ ] Manager can spot marketing vs call-center vs ops vs capacity vs collection issues in &lt; 1 minute.
- [ ] Unknown Source &gt; 20% always red-flagged on Contact Center + Reservations.
- [ ] Rate cards use §12 color bands.
- [ ] Clickable metrics keep Backend `link` filters.
- [ ] No fake capacity / ROAS / LTV numbers on FE.

---

## Order of work this session

1. Publish Backend request MD + FE remaining MD + this plan.  
2. Implement Phase A FE items.  
3. Wait for Backend response MD before Phase C.
