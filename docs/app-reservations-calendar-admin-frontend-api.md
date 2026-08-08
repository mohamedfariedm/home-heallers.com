# Admin Frontend — Reservations Calendar API Contract

> Frontend integration guide for the **Sessions Calendar** view.
>
> This document describes the REST API for listing all reservation sessions (`reservation_dates`) system-wide for a given month or day. A frontend developer should be able to build the calendar UI from this document alone.

---

## Table of Contents

1. [Overview](#overview)
2. [Base URL & conventions](#base-url--conventions)
3. [Authentication & permissions](#authentication--permissions)
4. [Admin API endpoint](#admin-api-endpoint)
   - [GET reservations-calendar](#get-apiadminreservations-calendar)
5. [Response reference](#response-reference)
6. [TypeScript interfaces](#typescript-interfaces)
7. [Frontend examples](#frontend-examples)
8. [Calendar rendering notes](#calendar-rendering-notes)
9. [Errors & empty states](#errors--empty-states)

---

## Overview

The reservations calendar endpoint returns **one row per session** (not per reservation). A single reservation with 5 sessions appears as 5 separate calendar entries if those sessions fall within the requested month or day.

Each entry includes:

| Group | What it shows |
|-------|---------------|
| **Session** | Date, time, session status |
| **Reservation** | Booking id, reservation status, sessions count, type |
| **Patient** | Registered client or guest fallback |
| **Doctor** | Session doctor, falling back to reservation doctor |
| **Service** | Service name from the parent reservation |

---

## Base URL & conventions

| Item | Value |
|------|-------|
| Admin base URL | `/api/admin` |
| Content type | JSON (`Accept: application/json`) |
| Field naming | `snake_case` |
| Dates in query params | `YYYY-MM-DD` (day) or `YYYY-MM` (month) |
| Times in response | `HH:mm` (24-hour) |

### Standard success envelope

When no pagination is used (default):

```json
{
  "data": [ ],
  "message": "Reservation calendar fetched successfully"
}
```

When `limit` is provided, Laravel pagination meta is included alongside `data`:

```json
{
  "data": [ ],
  "links": { },
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 50,
    "total": 12
  },
  "message": "Reservation calendar fetched successfully"
}
```

---

## Authentication & permissions

| Requirement | Value |
|-------------|-------|
| Auth scheme | Laravel Sanctum bearer token |
| Header | `Authorization: Bearer <admin_token>` |
| Required permission | `reservations` |

- **Missing/invalid token** → `401 Unauthorized`
- **Authenticated but lacking permission** → `403 Forbidden`

Obtain the token via existing admin login:

```
POST /api/admin/login
```

---

## Admin API endpoint

### GET `/api/admin/reservations-calendar`

Returns all sessions for a month or a single day, ordered by date then time ascending.

**Default behavior:** when neither `date` nor `month` is provided, returns all sessions in the **current month**.

```
GET /api/admin/reservations-calendar
GET /api/admin/reservations-calendar?month=2026-08
GET /api/admin/reservations-calendar?date=2026-08-08
GET /api/admin/reservations-calendar?month=2026-08&status=confirmed&doctor_id=12
Authorization: Bearer <token>
Accept: application/json
```

#### Query parameters

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `month` | `YYYY-MM` | No | Current month | Filter sessions within the given month |
| `date` | `YYYY-MM-DD` | No | — | Filter sessions on a single day. Takes precedence over `month` when both are sent |
| `status` | string | No | — | Filter by session status: `pending`, `confirmed`, `completed`, `cancelled`, `failed` |
| `doctor_id` | integer | No | — | Filter by session-level doctor id (`reservation_dates.doctor_id`) |
| `limit` | integer | No | — | If set, paginate results (1–500). Omit to return all matching sessions |
| `page` | integer | No | `1` | Page number when `limit` is used |

#### Filter priority

1. If `date` is provided → return sessions for that day only
2. Else if `month` is provided → return sessions for that month
3. Else → return sessions for the current month

#### Example response

```json
{
  "data": [
    {
      "id": 12,
      "reservation_id": 5,
      "date": "2026-08-08",
      "time": "10:00",
      "start_time": "2026-08-08 10:00:00",
      "end_time": "2026-08-08 11:00:00",
      "time_period": "morning",
      "status": "confirmed",
      "status_label": "Confirmed",
      "reservation": {
        "id": 5,
        "status": 3,
        "status_label": "Confirmed",
        "sessions_count": 6,
        "type": "home"
      },
      "patient": {
        "id": 9,
        "name": "Ali Ahmed",
        "mobile": "0500000000"
      },
      "doctor": {
        "id": 2,
        "name": "Dr. Sara"
      },
      "service": {
        "id": 1,
        "name": "Physiotherapy"
      }
    }
  ],
  "message": "Reservation calendar fetched successfully"
}
```

---

## Response reference

### Session fields (top level)

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Session row id (`reservation_dates.id`) |
| `reservation_id` | integer | Parent reservation id |
| `date` | string | Session date (`YYYY-MM-DD`) |
| `time` | string\|null | Session time (`HH:mm`) |
| `start_time` | string\|null | Full datetime if set |
| `end_time` | string\|null | Full datetime if set |
| `time_period` | string\|null | e.g. `morning`, `afternoon` |
| `status` | string | Session status (string enum) |
| `status_label` | string | Localized session status label |

### `reservation` object

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Reservation id |
| `status` | integer | Reservation-level status (integer enum) |
| `status_label` | string | Localized reservation status label |
| `sessions_count` | integer | Total planned sessions for the booking |
| `type` | string\|null | Reservation type |

#### Reservation status values

| Value | Meaning |
|-------|---------|
| `1` | Reviewing |
| `2` | Awaiting Confirmation |
| `3` | Confirmed |
| `4` | Canceled |
| `5` | Completed |
| `6` | Failed |
| `8` | Pending Payment |

### `patient` object

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer\|null | Client id; `null` for guest bookings |
| `name` | string\|null | Patient or guest name |
| `mobile` | string\|null | Patient or guest mobile |

**Guest fallback:** When the reservation has no linked client (`is_guest` or guest fields populated), `patient.id` is `null` and `name`/`mobile` come from `guest_name` / `guest_mobile` on the reservation.

### `doctor` object

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Doctor id |
| `name` | string | Doctor display name |

**Doctor resolution:** Uses the session-level doctor (`reservation_dates.doctor_id`) when set; otherwise falls back to the reservation's assigned doctor (`reservations.doctor_id`).

### `service` object

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Service id |
| `name` | string | Service name (may be localized) |

---

## TypeScript interfaces

```typescript
type SessionStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'failed';

type ReservationStatusCode = 1 | 2 | 3 | 4 | 5 | 6 | 8;

interface CalendarPatient {
  id: number | null;
  name: string | null;
  mobile: string | null;
}

interface CalendarDoctor {
  id: number;
  name: string;
}

interface CalendarService {
  id: number;
  name: string;
}

interface CalendarReservationSummary {
  id: number;
  status: ReservationStatusCode;
  status_label: string;
  sessions_count: number;
  type: string | null;
}

interface ReservationCalendarSession {
  id: number;
  reservation_id: number;
  date: string;
  time: string | null;
  start_time: string | null;
  end_time: string | null;
  time_period: string | null;
  status: SessionStatus;
  status_label: string;
  reservation: CalendarReservationSummary;
  patient: CalendarPatient | null;
  doctor: CalendarDoctor | null;
  service: CalendarService | null;
}

interface ReservationCalendarResponse {
  data: ReservationCalendarSession[];
  message: string;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
```

---

## Frontend examples

### Fetch current month sessions (default)

```typescript
async function fetchCalendarSessions(
  token: string,
  options?: { month?: string; date?: string }
): Promise<ReservationCalendarSession[]> {
  const params = new URLSearchParams();
  if (options?.date) {
    params.set('date', options.date);
  } else if (options?.month) {
    params.set('month', options.month);
  }

  const response = await fetch(
    `/api/admin/reservations-calendar?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Calendar request failed: ${response.status}`);
  }

  const json: ReservationCalendarResponse = await response.json();
  return json.data;
}
```

### Fetch a specific month

```typescript
const sessions = await fetchCalendarSessions(token, { month: '2026-08' });
```

### Fetch a single day

```typescript
const sessions = await fetchCalendarSessions(token, { date: '2026-08-08' });
```

### Filter by doctor and status

```typescript
const params = new URLSearchParams({
  date: '2026-08-08',
  status: 'confirmed',
  doctor_id: '12',
});

const response = await fetch(
  `/api/admin/reservations-calendar?${params.toString()}`,
  { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
);
```

### Paginated month view (large datasets)

```typescript
const params = new URLSearchParams({
  month: '2026-08',
  limit: '50',
  page: '1',
});
```

---

## Calendar rendering notes

1. **One card/event per session** — Use `data[].id` as the unique key, not `reservation_id`.
2. **Month navigation** — Change the `month` query param when the user switches months (e.g. `2026-08`).
3. **Day drill-down** — Use the `date` query param to load a single day; it overrides `month` when both are sent.
4. **Default to current month** — Omitting both `date` and `month` returns all sessions in the current month.
5. **Sort order** — Results are pre-sorted by `date` then `time` ascending; no client-side sort required.
6. **Two status layers** — Display session status (`status`) for the calendar chip/color. Use `reservation.status` only when you need booking-level context (e.g. tooltip or detail drawer).
7. **Guest patients** — When `patient.id === null`, treat as a guest booking; still show `patient.name` and `patient.mobile`.
8. **Doctor display** — Always use the top-level `doctor` field; it already resolves session vs reservation doctor.
9. **Link to reservation detail** — Use `reservation_id` to navigate to the existing reservation detail page (`GET /api/admin/reservations/{id}`).

---

## Errors & empty states

| HTTP status | Meaning | Frontend action |
|-------------|---------|-----------------|
| `200` + empty `data` | No sessions on that day | Show empty calendar state |
| `401` | Not authenticated | Redirect to login |
| `403` | Missing `reservations` permission | Show access denied |
| `422` | Invalid query params (bad date format, invalid status, etc.) | Show validation errors from response |

### Validation error example

```json
{
  "message": "The date field must match the format Y-m-d.",
  "errors": {
    "date": ["The date field must match the format Y-m-d."]
  }
}
```

---

## Related endpoints

| Endpoint | Use case |
|----------|----------|
| `GET /api/admin/reservations` | Full reservation list (filters by booking `created_at`, not session date) |
| `GET /api/admin/reservations/{id}` | Reservation detail with all sessions |
| `GET /api/admin/doctors/{id}?history_date_from=...` | Doctor-specific history (reservation-centric) |

For a system-wide session calendar, **`GET /api/admin/reservations-calendar`** is the correct endpoint.
