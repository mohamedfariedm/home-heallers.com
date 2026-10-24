# Reservation update calculates a doctor bonus

Bug report from the Dashboard reservation edit flow.

**Base URL:** `https://backend.home-healers.com/api/admin`  
**Auth:** `Authorization: Bearer <admin token>`

The Dashboard does not call a bonus endpoint. Saving an existing reservation sends one request only: `PATCH /reservations/{id}`. The bonus is created inside that request on the server.

---

## Summary

Every time a reservation is updated from the Dashboard, a bonus is calculated for the doctor assigned to that reservation.

Updating a reservation must only persist the reservation. A bonus must be created only by the intended bonus rules, and only once for the same reservation / session.

---

## Steps to reproduce

1. Log in to the Dashboard.
2. Open an existing reservation that has a doctor assigned.
3. Change any field (notes, address, payment, a session time) and save.
4. Check the bonus of the assigned doctor.

**Actual:** a bonus is calculated for the assigned doctor on that save.  
**Expected:** no bonus is created or recalculated.

**Still to confirm on the server:** saving the same reservation again creates another bonus, or it only happens on the first update after the doctor is assigned.

---

## Endpoint that triggers the bug

### `PATCH /api/admin/reservations/{reservation_id}`

This is the only request the Dashboard sends when the user clicks **Update Reservation**.

`reservation_id` is the existing reservation id. The same id is also sent in the body.

The body is the full reservation, not a partial patch of the edited field. `doctor_id` and every session in `dates` are sent again even when the user did not change the doctor or the session status.

```http
PATCH /api/admin/reservations/123
Content-Type: application/json
Authorization: Bearer <token>
```

```json
{
  "reservation_id": 123,
  "service_id": 1,
  "category_id": 2,
  "doctor_id": 45,
  "sessions_count": 3,
  "session_price": 200,
  "sub_total": 600,
  "fees": 90,
  "fees_type": "15%",
  "remaining_payment": 0,
  "total_amount": 690,
  "transaction_reference": "كاش",
  "customer_tier": "عادي",
  "status": 3,
  "pain_location": "back",
  "notes": "updated note",
  "operation_notes": "",
  "rework": 0,
  "address_city": "Riyadh",
  "address_state": "Riyadh",
  "address_link": "https://maps.example.com",
  "paid": 1,
  "source_campaign": "",
  "center_id": 1,
  "patient_id": 88,
  "dates": [
    {
      "date": "2026-10-20",
      "time": "10:00",
      "time_period": "morning",
      "doctor_id": 45,
      "status": "confirmed",
      "start_time": "2026-10-20 07:00:00",
      "end_time": "2026-10-20 08:00:00"
    }
  ]
}
```

`dates[].start_time` and `dates[].end_time` are included only when that session's date and time did not change. They are stored as `Y-m-d H:i:s`.

### Fields the bonus logic is likely reading

| Field | Meaning |
| --- | --- |
| `doctor_id` | Doctor assigned to the reservation. Sent on every save when a doctor is assigned. |
| `dates[].doctor_id` | Doctor assigned to that session. Sent on every save. |
| `dates[].status` | `pending`, `confirmed`, `completed`, `cancelled`. Sent again even if it did not change. |
| `status` | Reservation status. `5` is Completed. Sent again even if it did not change. |

If the server credits a bonus whenever the payload contains an assigned doctor, or whenever a session `status` is `completed`, every save will credit a bonus. The credit must depend on a real change (doctor newly assigned, or session newly moved to `completed`), and it must be idempotent for the same reservation and session.

---

## Related endpoints

These are not the reported flow. Check them if the same observer runs on every reservation write.

| Method | Path | When the Dashboard calls it |
| --- | --- | --- |
| `POST` | `/api/admin/reservations` | Create reservation. Same body shape, without `reservation_id`. |
| `PATCH` | `/api/admin/reservations/{reservation_id}/status` | Status-only update. Body: `{ "status": number, "paid"?: boolean, "notes"?: string }`. Used by cash payment confirmation. |
| `POST` | `/api/admin/reservations/invite-doctors/{reservation_id}` | Invite doctors. Body: `{ "doctor_ids": number[] }`. |
| `GET` | `/api/admin/reservations/{reservation_id}` | Load one reservation. |
| `GET` | `/api/admin/reservations?{filters}` | Reservations list. |
| `GET` | `/api/admin/doctors/{doctor_id}` | Doctor profile, including booking `history`. Optional query: `history_date_from`, `history_date_to`. |

Doctor-target incentives are a separate flow. The Dashboard credits those only through `POST /api/admin/doctor-targets/{id}/approve`. Reservation save does not call that endpoint.

---

## Reservation status values sent by the Dashboard

| `status` | Label |
| --- | --- |
| `1` | Reviewing |
| `2` | WaitConfirm |
| `3` | Confirmed |
| `4` | Canceled |
| `5` | Completed |
| `6` | Failed |
| `7` | Draft |
| `8` | Pending Payment |

Session status (`dates[].status`): `pending`, `confirmed`, `completed`, `cancelled`.

---

## What the backend should change

1. `PATCH /api/admin/reservations/{id}` must not calculate a doctor bonus as a side effect of a general update.
2. A bonus is created only when the intended rule is met (for example, a session moves to `completed` for the first time).
3. Repeating the same update must not create another bonus for the same reservation and the same doctor.
4. Sending `doctor_id` and `dates[].status` again, with no change, must not count as a new bonus event.

---

## How to verify

1. Pick a reservation that already has `doctor_id` set. Note the doctor's current bonus total and the bonus rows tied to that `reservation_id`.
2. `PATCH /api/admin/reservations/{id}` and change only `notes`. Keep `doctor_id`, `status`, and `dates[].status` the same.
3. Bonus total and bonus rows for that reservation must be unchanged.
4. Repeat the same `PATCH`. Still unchanged.
5. Then apply the real bonus rule once (whatever the product rule is). Exactly one bonus row is created.
6. Repeat that action. No second bonus row.
