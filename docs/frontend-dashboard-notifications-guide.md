# Admin Push Notifications — Dashboard Frontend Guide

**Audience:** Frontend developers building the admin dashboard  
**Base URL:** `{host}/api/admin`  
**Auth:** `Authorization: Bearer {admin_token}` (Sanctum)  
**Backend status:** Live

---

## Table of contents

1. [Overview](#overview)
2. [Immediate send](#immediate-send)
3. [Scheduled notifications](#scheduled-notifications)
4. [Sent history](#sent-history)
5. [FCM links on mobile](#fcm-links-on-mobile)
6. [Errors](#errors)
7. [Frontend checklist](#frontend-checklist)

---

## Overview

Admins can send **push notifications** (FCM) and **in-app inbox entries** to:

| Audience | `recipient_type` |
|----------|------------------|
| All clients + all doctors + all guests | `all` |
| All clients | `clients` |
| All doctors | `doctors` |
| All guests (anonymous app installs) | `guests` |
| One or more clients/doctors | `specific` (+ `recipients` or legacy `recipient_id`) |

**Guests** are anonymous users tracked in `app_installations` (pre-login app installs with an FCM token). They receive **push only** — no in-app inbox entry, because they are not registered clients yet.

| Mode | Behavior |
|------|----------|
| **Immediate** | API queues delivery and returns right away; logged in sent history |
| **Scheduled** | Stored in DB; dispatched automatically at `scheduled_at` |
| **Sent history** | Unified list of admin campaigns (immediate + scheduled) and system-generated notifications (reservation, payment, wallet, etc.) |

**Important:**

- Success means jobs were **queued**, not that every device received the push.
- Clients and doctors without an FCM token still get an **in-app inbox** entry.
- **Guests** always get push-only delivery (no inbox / no read tracking).
- Broadcast sends target users with a non-null `fcm_token` (clients/doctors) or valid anonymous installs (guests).
- `send-global` (`recipient_type: all`) includes clients, doctors, **and guests**.
- Scheduled notifications resolve recipients **at dispatch time** (when due), not when created.
- System notifications (`source: system`) are logged automatically when the app sends reservation/payment/wallet/doctor-attended (and similar) events. Each appears as a single-recipient entry with `created_by: null` and `type` set to the event type (e.g. `reservation_created`, `payment_success`).

---

## Immediate send

All immediate endpoints use the same request body. Pick the endpoint that matches your audience.

### Send to everyone (clients + doctors + guests)

```
POST /api/admin/notifications/send-global
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

### Send to all clients

```
POST /api/admin/notifications/send-to-clients
```

### Send to all doctors

```
POST /api/admin/notifications/send-to-doctors
```

### Send to all guests (anonymous app installs)

```
POST /api/admin/notifications/send-to-guests
```

Targets anonymous rows in `app_installations` that have a valid FCM token, no linked client, and are not uninstalled/unregistered.

### Send to specific users

```
POST /api/admin/notifications/send-to-specific
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | string | yes | Max 255 |
| `body` | string | yes | Max 1000 |
| `type` | string | no | Stored in FCM `extra_data.type` (default: `admin_notification`) |
| `lang` | `ar` \| `en` | no | Default `en` |
| `deep_link` | string | no | In-app screen/route id for mobile |
| `url` | string (URL) | no | External link (browser/webview) |
| `extra_data` | object | no | Additional FCM data (values stringified server-side) |
| `recipients` | array | yes for multi-specific | `[{ "type": "client" \| "doctor", "id": number }, ...]` |
| `recipient_id` | integer | legacy single-specific | Client or doctor id (still supported) |

**Example — global with links:**

```json
{
  "title": "عرض خاص",
  "body": "خصم 20% على جميع الخدمات هذا الأسبوع",
  "lang": "ar",
  "type": "promotion",
  "deep_link": "offers/summer-sale",
  "url": "https://homehealers.sa/offers/summer-sale",
  "extra_data": {
    "campaign_id": "42"
  }
}
```

**Example — multiple specific users:**

```json
{
  "title": "Reservation reminder",
  "body": "Your session is tomorrow at 10:00 AM",
  "recipients": [
    { "type": "client", "id": 1523 },
    { "type": "doctor", "id": 88 }
  ],
  "deep_link": "reservations/8821",
  "lang": "en"
}
```

**Example — legacy single user:**

```json
{
  "title": "Reservation reminder",
  "body": "Your session is tomorrow at 10:00 AM",
  "recipient_id": 1523,
  "deep_link": "reservations/8821",
  "lang": "en"
}
```

**Success (200):**

```json
{
  "status": true,
  "message": "Notification queued successfully",
  "data": {
    "log_id": 12,
    "queued_count": 5,
    "recipient_count": 842,
    "recipient_type": "clients"
  }
}
```

`log_id` links to the sent history entry. `queued_count` = number of background jobs queued (each job covers up to 200 recipients). `recipient_count` = number of people targeted by the send.

---

## Scheduled notifications

### List scheduled

```
GET /api/admin/notifications/scheduled?status=pending&per_page=20
```

| Query | Type | Notes |
|-------|------|-------|
| `status` | string | Optional: `pending`, `processing`, `sent`, `canceled`, `failed` |
| `per_page` | integer | Default 20 |

**Success (200):**

```json
{
  "status": true,
  "message": "Scheduled notifications fetched successfully",
  "data": {
    "notifications": [
      {
        "id": 1,
        "title": "Weekend promo",
        "body": "Book now and save",
        "type": "promotion",
        "recipient_type": "clients",
        "recipient_id": null,
        "recipients": [],
        "deep_link": "offers/weekend",
        "url": "https://homehealers.sa/offers/weekend",
        "extra_data": {},
        "lang": "en",
        "scheduled_at": "2026-07-10 09:00:00",
        "status": "pending",
        "sent_at": null,
        "queued_count": null,
        "created_by": 3,
        "creator": { "id": 3, "name": "Admin User" },
        "created_at": "2026-07-04 12:00:00",
        "updated_at": "2026-07-04 12:00:00"
      }
    ],
    "pagination": {
      "total": 1,
      "per_page": 20,
      "current_page": 1,
      "last_page": 1,
      "from": 1,
      "to": 1
    }
  }
}
```

### Create scheduled

```
POST /api/admin/notifications/scheduled
```

Same body fields as immediate send, plus:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `recipient_type` | string | yes | `all`, `clients`, `doctors`, `guests`, `specific` |
| `scheduled_at` | datetime string | yes | Must be in the future (`Y-m-d H:i:s` or ISO 8601) |
| `recipients` | array | if `recipient_type` = `specific` (multi) | `[{ "type": "client" \| "doctor", "id": number }, ...]` |
| `recipient_id` | integer | if `recipient_type` = `specific` (legacy single) | Client or doctor id |

**Example:**

```json
{
  "title": "New service launch",
  "body": "Physiotherapy at home is now available in Jeddah",
  "recipient_type": "all",
  "scheduled_at": "2026-07-10 09:00:00",
  "lang": "en",
  "deep_link": "services/physio",
  "url": "https://homehealers.sa/services/physio"
}
```

**Success (201):** returns the created scheduled notification object.

### Show one

```
GET /api/admin/notifications/scheduled/{id}
```

### Update (pending only)

```
PUT /api/admin/notifications/scheduled/{id}
```

Send only fields to change. `scheduled_at` must remain in the future.

Returns **422** if `status` is not `pending`.

### Cancel (pending only)

```
DELETE /api/admin/notifications/scheduled/{id}
```

Sets `status` to `canceled`. Returns **422** if not `pending`.

### Scheduled statuses

| Status | Meaning |
|--------|---------|
| `pending` | Waiting for `scheduled_at` |
| `processing` | Being dispatched (transient) |
| `sent` | Dispatched; see `sent_at` and `queued_count` |
| `canceled` | Canceled by admin before send |
| `failed` | Dispatch error (check server logs) |

Use `GET /scheduled` for managing **upcoming** items. Use `GET /sent` (below) for the unified **history** of everything that was actually dispatched.

---

## Sent history

Unified list of all admin notifications that were dispatched (immediate sends and scheduled sends).

### Filter options (for dashboard dropdowns)

```
GET /api/admin/notifications/sent/filter-options
```

**Success (200):**

```json
{
  "status": true,
  "message": "Sent notification filter options fetched successfully",
  "data": {
    "sources": ["immediate", "scheduled", "system"],
    "recipient_types": ["all", "clients", "doctors", "guests", "specific"],
    "statuses": ["sent", "failed"],
    "languages": ["ar", "en"],
    "types": ["promotion", "admin_notification"],
    "creators": [
      { "id": 3, "name": "Admin User" }
    ]
  }
}
```

`types` and `creators` are built from existing sent logs (dynamic).

### List sent notifications

```
GET /api/admin/notifications/sent?per_page=20&source=immediate&status=sent
```

| Query | Type | Notes |
|-------|------|-------|
| `search` | string | Search in `title` and `body` |
| `source` | string | `immediate`, `scheduled`, `system` |
| `recipient_type` | string | `all`, `clients`, `doctors`, `guests`, `specific` |
| `status` | string | `sent`, `failed` |
| `lang` | string | `ar`, `en` |
| `type` | string | Exact match on notification type |
| `created_by` | integer | Admin user id who sent it |
| `from` | date | `sent_at` on or after start of day |
| `to` | date | `sent_at` on or before end of day (`to` must be >= `from`) |
| `per_page` | integer | Default 20, max 100 |
| `page` | integer | Page number |

All filters are optional and can be combined.

**Example:**

```
GET /api/admin/notifications/sent?search=promo&source=immediate&recipient_type=clients&lang=ar&from=2026-07-01&to=2026-07-31
```

**Success (200):**

```json
{
  "status": true,
  "message": "Sent notifications fetched successfully",
  "data": {
    "filters": {
      "search": "promo",
      "source": "immediate",
      "recipient_type": "clients",
      "lang": "ar",
      "from": "2026-07-01",
      "to": "2026-07-31"
    },
    "notifications": [
      {
        "id": 12,
        "title": "Weekend promo",
        "body": "Book now and save",
        "type": "promotion",
        "recipient_type": "clients",
        "recipient_id": null,
        "recipients": [],
        "deep_link": "offers/weekend",
        "url": "https://homehealers.sa/offers/weekend",
        "extra_data": {},
        "lang": "en",
        "source": "immediate",
        "scheduled_notification_id": null,
        "scheduled_notification": null,
        "status": "sent",
        "queued_count": 3,
        "recipient_count": 842,
        "delivered_count": 840,
        "read_count": 120,
        "unread_count": 722,
        "sent_at": "2026-07-04 14:30:00",
        "created_by": 3,
        "creator": { "id": 3, "name": "Admin User" },
        "created_at": "2026-07-04 14:30:00",
        "updated_at": "2026-07-04 14:30:00"
      }
    ],
    "pagination": {
      "total": 1,
      "per_page": 20,
      "current_page": 1,
      "last_page": 1,
      "from": 1,
      "to": 1
    }
  }
}
```

### Show one sent notification

```
GET /api/admin/notifications/sent/{id}
```

Returns the same object shape as a list item. When `source` is `scheduled`, `scheduled_notification_id` and `scheduled_notification` summary are included.

### List recipients for a sent notification (who read / who didn't)

```
GET /api/admin/notifications/sent/{id}/recipients?read=0&type=doctor&search=ahmed&per_page=20
```

| Query | Type | Notes |
|-------|------|-------|
| `read` | `0` \| `1` | `1` = read only, `0` = unread only |
| `type` | string | `client`, `doctor`, or `guest` |
| `search` | string | Filter by recipient name |
| `per_page` | integer | Default 20, max 100 |
| `page` | integer | Page number |

**Success (200):**

```json
{
  "status": true,
  "message": "Sent notification recipients fetched successfully",
  "data": {
    "notification_id": 12,
    "recipients": [
      {
        "id": 88,
        "type": "doctor",
        "name": "Dr Ahmed",
        "delivered_at": "2026-07-04 14:30:05",
        "read_at": null,
        "push_status": "skipped"
      }
    ],
    "pagination": {
      "total": 1,
      "per_page": 20,
      "current_page": 1,
      "last_page": 1,
      "from": 1,
      "to": 1
    }
  }
}
```

`push_status` is one of `sent`, `failed`, or `skipped` (no FCM token). Read status comes from the linked in-app inbox row (`notifications.read_at`).

**Guest recipients** (`type: guest`) are anonymous app installs. They have no inbox row, so `read_at` is always `null`. The `name` field shows device info and `install_id` (e.g. `"Pixel 8 (abc-123-install-id)"`). `mobile` is always `null`.

### Sent log fields

| Field | Meaning |
|-------|---------|
| `source` | `immediate` (POST send-*), `scheduled` (dispatched by scheduler), or `system` (auto-logged app events: reservation, payment, wallet, etc.) |
| `status` | `sent` or `failed` |
| `queued_count` | Background jobs queued at dispatch time |
| `recipient_count` | Number of people targeted |
| `delivered_count` | Recipients with an inbox entry created (`delivered_at` set) |
| `read_count` | Recipients who marked the inbox notification as read |
| `unread_count` | `recipient_count - read_count` |
| `recipients` | For `specific` sends: the `[{type, id}, ...]` array stored on the log |
| `sent_at` | When dispatch happened |

**Note:** Only notifications sent after this feature is deployed appear in sent history. Older sends are not backfilled.

---

## FCM links on mobile

The server merges `deep_link` and `url` into the FCM data payload (`extra_data`). Mobile apps should read them when the user taps a notification:

| Key | Purpose |
|-----|---------|
| `extra_data.deep_link` | Navigate to an in-app screen (e.g. `reservations/8821`, `offers/summer-sale`) |
| `extra_data.url` | Open an external URL in browser/webview |
| `extra_data.type` | Notification category (e.g. `promotion`, `admin_notification`) |
| `extra_data.action` | Optional action hint (if provided in `extra_data`) |

**Priority suggestion for mobile:**

1. If `deep_link` is present → in-app navigation  
2. Else if `url` is present → open external URL  
3. Else → open notifications inbox / default home

In-app inbox entries store the same `extra_data` under `notification.data.extra_data`.

---

## Errors

| HTTP | When |
|------|------|
| 401 | Missing or invalid admin token |
| 404 | `recipient_id` not found (`send-to-specific`) |
| 422 | Validation failed, or update/cancel on non-pending scheduled notification |
| 500 | Server error while queueing |

**Validation error (422):**

```json
{
  "message": "The scheduled at field is required.",
  "errors": {
    "scheduled_at": ["The scheduled at field is required."]
  }
}
```

**Cancel/update blocked (422):**

```json
{
  "status": false,
  "message": "Only pending scheduled notifications can be canceled",
  "data": null
}
```

---

## Frontend checklist

- [ ] Immediate send form: title, body, lang, optional type, deep_link, url, extra_data
- [ ] Audience selector maps to the correct endpoint (`send-global`, `send-to-clients`, `send-to-doctors`, `send-to-guests`, `send-to-specific`)
- [ ] Specific send: multi-select client/doctor picker → `recipients: [{type, id}, ...]` (legacy `recipient_id` still works for one user)
- [ ] Show success toast with `queued_count`, `recipient_count`, and optional link to `log_id` in sent history
- [ ] Scheduled list page with status filter and pagination (upcoming/pending items)
- [ ] Sent history page: load filter options from `GET /sent/filter-options`, then `GET /sent` with filters (`search`, `source`, `recipient_type`, `status`, `lang`, `type`, `created_by`, date range)
- [ ] Sent detail page: `GET /sent/{id}` with `recipient_count`, `delivered_count`, `read_count`, `unread_count`
- [ ] Sent recipients list: `GET /sent/{id}/recipients` with filters (`read`, `type`, `search`)
- [ ] Create scheduled: datetime picker (future only), same content fields as immediate
- [ ] Edit/cancel actions only when `status === 'pending'`
- [ ] Display `sent_at`, `queued_count`, `recipient_count`, `delivered_count`, `read_count`, and `unread_count` for sent items
- [ ] Document for mobile team: handle `extra_data.deep_link` and `extra_data.url` on notification tap
