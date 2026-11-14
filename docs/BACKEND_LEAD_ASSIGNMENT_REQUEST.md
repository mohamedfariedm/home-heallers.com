# Backend Request — Assign Customer Support Leads to Dashboard Users

**Send this file only to Backend.**
**Date:** 2026-11-14
**From:** Frontend
**Screens affected:** Inbound Customer Supports, Outbound Customer Supports (and SEO, which shares the same API)

---

## 1. Context — what the pages are today

All three kanban pages (and the older table pages) read and write the **same** resource:

| Page (dashboard) | Route | `type` param | Notes |
| --- | --- | --- | --- |
| Inbound Customer Supports | `/customer-supports-operation-kanban` | `operation` | |
| Outbound Customer Supports | `/customer-supports-marketing-kanban` | `marketing` | |
| SEO Customer Supports | `/customer-supports-seo-kanban` | `seo` | same API, same permissions pattern |

In this document a **"ticket"** means one customer-support **lead** (one kanban card) from `GET /api/admin/customer-supports`.
It is **not** the chat module under `/support-tickets` (that module already has its own assign flow, which this request mirrors).

### Endpoints the pages already use

| Method | Path | Used for |
| --- | --- | --- |
| GET | `/api/admin/customer-supports?type=&page=&limit=&date_from=&date_to=&{column}_{op}=...` | Kanban board + table. Returns `data[]`, `meta`, `statistics` |
| POST | `/api/admin/customer-supports` | Create lead |
| PATCH | `/api/admin/customer-supports/{lead_id}` | Edit lead **and** move status (drag & drop) |
| DELETE | `/api/admin/customer-supports/{id}` | Delete |
| POST | `/api/admin/customer-supports/import` | Excel import |
| GET | `/api/admin/customer-supports/download-sample-sheet` | Import template |
| POST | `/api/admin/customer-supports/send-whatsapp` | Bulk WhatsApp by status |
| GET | `/api/admin/leads-qualifications/by-customer-support/{id}` | Qualification check before status change |

### How filtering works today (must keep working)

- Column filters are sent as `{column}_{op}` and, for the second condition, `{column}_{op}_and` / `{column}_{op}_or`
  (for example `status_equal=new`, `city_contain=cairo`).
- Operators: `equal`, `not_equal`, `has`, `not_has`, `contain`, `not_contain`, `begin_with`, `not_begin_with`, `end_with`, `not_end_with`.
- Date filters: `date_from`, `date_to` (the page defaults to month-to-date).
- Pagination: `page`, `limit` (kanban uses `limit=25`). Response `meta` has `total`, `per_page`, `last_page`.
- `statistics` in the same response is computed from the **filtered** set, and every countable metric carries a drill-down `link`.
- The kanban status move sends a **full PATCH** with the whole row spread into the body (see section 6).

### What there is today for "who owns a lead"

- `agent_name` — a free-text string typed in the form. It is **not** a user reference. Leave it as it is.
- `activity_logs[]` on each row with `causer_id` / `causer_name`.
- There is **no** assignee on a lead today.

---

## 2. What we need (product requirement)

1. A dashboard user can **assign** a lead to **another dashboard user** (any user that has an email and logs into the dashboard — **everyone except clients/patients**).
   The user picks the person in a dropdown; the frontend sends that person's **user id**.
2. Backend **stores who assigned and to whom**: assignee, assigner, and when.
3. Two new **filters** on the list:
   - **Assigned to** a given user — "all leads assigned to Sara".
   - **Assigned by** a given user — "all leads that Ahmed assigned to someone else".
4. Assignment must be visible on the card / row and in the activity log.

---

## 3. Data model

### 3.1 Columns on the lead (current assignment — fast filtering)

| Column | Type | Notes |
| --- | --- | --- |
| `assigned_to_id` | FK → users, nullable | Current assignee. `null` = unassigned |
| `assigned_by_id` | FK → users, nullable | User who made the **current** assignment |
| `assigned_at` | datetime, nullable | When the current assignment was made |

Add indexes on `assigned_to_id` and `assigned_by_id` (both are filter columns).

### 3.2 History table (recommended)

`customer_support_assignments`: `id`, `customer_support_id`, `assigned_to_id` (nullable = unassigned), `assigned_by_id`, `assigned_at`, optional `note`.
One row per assign / reassign / unassign. This keeps the "who assigned whom" answer even after a later reassignment and lets us add a history view later.
If Backend prefers to rely only on the existing activity log for history, that is acceptable — but the three columns in 3.1 are required.

### 3.3 Who is assignable

- Any dashboard user (a user who can sign in to the dashboard) — **exclude clients / patients / doctors-app accounts** (anything that is not a dashboard staff user).
- Must be active. Soft-deleted or deactivated users cannot be newly assigned (`422`), but must still render correctly on old leads (see `is_deleted` below).
- A user **may** assign a lead to themselves.
- No restriction by role. If Backend wants a role restriction, tell us and we will adapt the dropdown.

---

## 4. New endpoints

Base URL `/api/admin`, Sanctum bearer token, standard envelope `{ "message", "data" }`, `422` for validation errors, `403` for missing permission.

### 4.1 `GET /customer-supports/assignable-users`

Feeds both the **Assign** dropdown and the two **filter** dropdowns. (Mirrors the existing `GET /support-tickets/agents`.)

Query params (all optional):

| Param | Notes |
| --- | --- |
| `search` | name or email, partial match |
| `limit` | default 100 |
| `include_inactive` | `1` to include inactive / deleted users. Used **only** by the filter dropdowns, so an old assigner can still be selected. Default `0` |

Response:

```jsonc
{
  "message": "ok",
  "data": [
    {
      "id": 14,
      "name": "Sara Ali",
      "email": "sara@example.com",
      "roles": ["Customer Support"],
      "is_active": true,
      "is_deleted": false,
      "open_assigned_count": 12   // optional, nice to have
    }
  ]
}
```

Permission: user must hold **any** of `customer_supports_{inbound|outbound|seo}_assign` or `..._filter`.

### 4.2 `POST /customer-supports/{id}/assign`

Body:

```json
{ "assigned_to_id": 14, "note": "Please follow up today" }
```

| Field | Rules |
| --- | --- |
| `assigned_to_id` | required key. Integer user id, or `null` to **unassign** |
| `note` | optional string, max 500. Stored in the history / activity log |

Behaviour:

- `assigned_by_id` is **always the authenticated user**. The client never sends it.
- Sets `assigned_to_id`, `assigned_by_id`, `assigned_at = now()`.
- `null` → clears `assigned_to_id`; keep `assigned_by_id` / `assigned_at` as the unassign actor / time (or clear all three — tell us which, we render both).
- Same assignee as today → `200`, no change, **no** new history / log row (idempotent).
- Reassigning to a different user replaces the current assignment (history row is added).
- Validation `422`: `assigned_to_id` must be an existing, active, non-client dashboard user.
- `404` if the lead does not exist (or is outside the caller's scope).
- Must also work for leads of every `type` (`operation`, `marketing`, `seo`) with the matching permission (section 7).

Response `200`: the **full updated lead row** (same shape as a list row, including the new `assignment` object from 5.1):

```jsonc
{
  "message": "Lead assigned successfully",
  "data": { "id": 981, "name": "...", "status": "new", "assignment": { /* see 5.1 */ } }
}
```

### 4.3 `POST /customer-supports/bulk-assign` — priority 2 (nice to have)

Body `{ "lead_ids": [981, 982, 990], "assigned_to_id": 14, "note": "..." }`. Same rules as 4.2 applied per lead (same permission check per lead's type).
Response: `{ "message", "data": { "assigned": 3, "skipped": [{ "lead_id": 990, "reason": "..." }] } }`.
Frontend will ship single-lead assign first, so this can follow.

---

## 5. Changes to the existing list endpoint

`GET /api/admin/customer-supports` — **additive only**. Nothing existing may change or be renamed.

### 5.1 New data on every row (and on the single-lead response)

```jsonc
{
  "id": 981,
  "name": "Mona Hassan",
  "status": "new",
  "assigned_to_id": 14,
  "assigned_by_id": 3,
  "assigned_at": "2026-11-14 10:20:00",
  "assignment": {
    "assigned_to": { "id": 14, "name": "Sara Ali", "email": "sara@example.com", "is_deleted": false },
    "assigned_by": { "id": 3,  "name": "Ahmed Samy", "email": "ahmed@example.com", "is_deleted": false },
    "assigned_at": "2026-11-14 10:20:00"
  }
}
```

- Unassigned lead: `assigned_to_id: null`, `assignment: null`.
- Use the same datetime format as the other row timestamps (`created_at`, `updated_at`).
- `is_deleted: true` for users that were soft-deleted, still with `name` filled, so history never shows a blank.
- Eager-load assignee / assigner to avoid N+1 on 25-row pages.

### 5.2 New filters

Sent as **plain query params** (not the `{column}_{op}` pattern):

| Param | Value | Meaning |
| --- | --- | --- |
| `assigned_to_id` | user id, or comma-separated ids (`14,21`) | Leads currently assigned **to** these users |
| `assigned_by_id` | user id, or comma-separated ids | Leads whose current assignment was made **by** these users |
| `assignment_state` | `assigned` \| `unassigned` | Has / has no assignee |
| `exclude_self_assigned` | `1` | Optional. With `assigned_by_id=X`, drop leads where `assigned_to_id = X`, so the result is strictly "X assigned it to **someone else**" |

Rules:

- All of them combine with each other and with every existing filter (`type`, `date_from` / `date_to`, status, column filters, ...) using **AND**.
- `assigned_to_id=14&assigned_by_id=3` → leads Ahmed (3) assigned to Sara (14).
- An unknown / invalid id returns an empty list, not a `500`.
- The date filter keeps its current meaning (lead date). We are **not** adding an "assigned date" filter now.
- Filters apply to `data`, `meta.total` / `last_page`, **and** `statistics`.
- The **Excel export** triggered from the page must honour the same params.

### 5.3 Statistics (additive keys inside `statistics`)

| Key | Type | Notes |
| --- | --- | --- |
| `by_assignee[]` | `{ user_id, name, is_deleted, count, link }` | Count per current assignee over the filtered set |
| `unassigned_count` | number + `unassigned_link` | Leads with no assignee |

`link` follows the existing drill-down convention (frontend remaps the query), for example `...?type=operation&assigned_to_id=14`.
If a key cannot be computed, **omit it** (do not send a fake `0`), same rule as the existing dashboard statistics.

---

## 6. Important: the status-move PATCH must not touch assignment

The kanban drag & drop calls `PATCH /customer-supports/{lead_id}` with the **entire row spread into the body** plus the new `status`.
Once rows contain `assigned_to_id`, `assigned_by_id`, `assigned_at` and `assignment`, those fields will come back in that body.

Please make sure `PATCH` and `POST /customer-supports`:

- **Ignore** (do not validate, do not fail on) `assigned_to_id`, `assigned_by_id`, `assigned_at`, `assignment`.
- Never let a normal edit change the assignee or the assigner. **Assignment only changes through `POST /{id}/assign`** (and bulk-assign).

Otherwise any drag & drop could silently reassign a lead or overwrite who assigned it.

---

## 7. Permissions

Same naming pattern as the existing keys (`customer_supports_inbound`, `customer_supports_inbound_move_status`, ...).

| New permission key | Allows |
| --- | --- |
| `customer_supports_inbound_assign` | Assign / unassign **operation** leads |
| `customer_supports_outbound_assign` | Assign / unassign **marketing** leads |
| `customer_supports_seo_assign` | Assign / unassign **seo** leads |

- Add them to the role-permissions screen so admins can grant them.
- Filtering by assignee / assigner uses the **existing** `customer_supports_{scope}_filter` permission. No new filter permission.
- Please include the new keys in the permissions list the frontend already reads for the logged-in user.

---

## 8. Activity log

On assign / reassign / unassign, write an activity-log entry on the lead (same `activity_logs[]` shape the card already shows):

```jsonc
{
  "description": "assigned",              // assigned | reassigned | unassigned
  "causer_id": 3,
  "causer_name": "Ahmed Samy",
  "changes": {
    "old":        { "assigned_to_id": 9,  "assigned_to_name": "Omar Nabil" },
    "attributes": { "assigned_to_id": 14, "assigned_to_name": "Sara Ali" }
  },
  "created_at": "2026-11-14T10:20:00.000000Z"
}
```

Include the **names** next to the ids — the activity-log modal prints raw values, so ids alone would look meaningless.

---

## 9. Optional — notify the assignee (priority 3)

If the push / Firebase notification infrastructure is easy to reuse: send a dashboard notification to the new assignee,
"X assigned you a lead: {lead name}", with a deep link to the correct page (inbound / outbound / seo) and the lead id.
Not required for the first release.

---

## 10. Summary checklist for Backend

**P0 — blocks the feature**

- [ ] Add `assigned_to_id`, `assigned_by_id`, `assigned_at` (+ indexes) on customer supports
- [ ] `GET /customer-supports/assignable-users`
- [ ] `POST /customer-supports/{id}/assign` (assign, reassign, unassign with `null`)
- [ ] Add assignment fields + `assignment` object to list rows and single-lead responses
- [ ] Filters `assigned_to_id`, `assigned_by_id`, `assignment_state` (applied to data, meta, statistics, export)
- [ ] `PATCH` / `POST` ignore assignment fields (section 6)
- [ ] Permissions `customer_supports_{inbound|outbound|seo}_assign`

**P1**

- [ ] History table `customer_support_assignments` (or activity-log only)
- [ ] Activity-log entries with names (section 8)
- [ ] `exclude_self_assigned` flag
- [ ] `statistics.by_assignee` and `unassigned_count`

**P2 / P3**

- [ ] `POST /customer-supports/bulk-assign`
- [ ] Push notification to the assignee

## 11. Please reply with

One MD file containing: final JSON examples of the three responses (assignable-users, assign, list row), the exact filter param names, the new permission keys, the unassign behaviour you chose in 4.2 (what happens to `assigned_by_id` / `assigned_at`), and anything deferred.
