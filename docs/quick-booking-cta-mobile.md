# Quick Booking CTA — Mobile Integration

> **ملخص:** ضفنا نوع CTA جديد اسمه `quick_booking` في الداشبورد (الستوريز، البانر، النوتيفيكيشن).
> لما الموبايل يلاقي `type = "quick_booking"` يفتح **شاشة الحجز السريع** على طول.
> مفيش `deep_link` ولا `url` معاه — الـ `type` لوحده كفاية.

---

## 1. The new value

| Field | Value |
|---|---|
| `type` (CTA / notification type) | **`quick_booking`** |
| `deep_link` | not sent |
| `url` | not sent |
| Expected action | Open the **Quick Booking** screen. No entity id needed. |

It sits next to the existing types (`offers`, `doctors`, `categories`), so the same `NotificationNavigator.parseFromData(...)` entry point should handle it: add one `case "quick_booking"`.

> An admin *may* still attach custom key/value `extra_data`. Those keys show up flat inside the same map. Ignore any you don't need.

---

## 2. Endpoints where it appears

Base prefix for the client app: **`/api/application`**

| # | Source | Endpoint | Auth | Where to read the type |
|---|---|---|---|---|
| 1 | Stories / Highlights | `GET /api/application/highlights` | Public (guests identified by `X-Install-Id`) | `data[].elements[].cta.type` |
| 2 | Banners | `GET /api/application/banners` | Public | `data.banners[].cta.type` |
| 3 | Push notification (FCM) | — (FCM `data` payload) | — | `data.type` |
| 4 | Notifications inbox | `GET /api/application/notifications` | Client token (Sanctum) | `data.notifications[].type` (also `extra_data.type`) |
| 5 | Doctor app inbox *(only if an admin targets doctors)* | `GET /api/doctor-mobile/notifications` | Doctor token | `type` / `extra_data.type` |

---

## 3. Payload examples

### 3.1 Highlights — `GET /api/application/highlights`

```jsonc
{
  "id": 15,
  "title": "Weekly Offers",
  "elements": [
    {
      "id": 42,
      "media_type": "image",
      "media_url": "https://…/slide.jpg",
      "duration_seconds": 5,
      "order": 0,
      "is_viewed": false,
      "cta": {
        "type": "quick_booking"      // ← no deep_link / url
      }
    }
  ]
}
```

### 3.2 Banners — `GET /api/application/banners`

```jsonc
{
  "message": "Banners fetched successfully",
  "data": {
    "banners": [
      {
        "type": "mobile",
        "image": "https://…/banner.jpg",
        "order": 0,
        "cta": {
          "type": "quick_booking"
        }
      }
    ]
  }
}
```

### 3.3 Push notification — FCM `data` payload

Sent from the dashboard **Send now** and **Scheduled** screens. As with the other types, every value is a string.

```jsonc
{
  "notification": { "title": "Book in seconds", "body": "Try quick booking now" },
  "data": {
    "type": "quick_booking"
  }
}
```

Tapping the push should open the Quick Booking screen, whether the app was in the foreground, in the background or terminated.

### 3.4 Notifications inbox — `GET /api/application/notifications`

```jsonc
{
  "status": true,
  "data": {
    "notifications": [
      {
        "id": "9c1e…",
        "type": "quick_booking",
        "action": null,
        "title": "Book in seconds",
        "body": "Try quick booking now",
        "extra_data": { "type": "quick_booking" },
        "read_at": null,
        "created_at": "2026-09-29 10:00:00"
      }
    ]
  }
}
```

Tapping the item in the inbox should do the same as tapping the push.

---

## 4. Mobile checklist

- [ ] `NotificationNavigator`: handle `type == "quick_booking"` → open the Quick Booking screen.
- [ ] Don't require `deep_link` / `url` for this type: they are absent, not empty strings.
- [ ] Stories: CTA button on a slide with `cta.type == "quick_booking"`.
- [ ] Banners: tapping a banner with `cta.type == "quick_booking"`.
- [ ] Push tap works in all app states (foreground, background, terminated).
- [ ] Inbox item tap.
- [ ] **Guest users** (stories and banners are public): decide whether Quick Booking opens directly or asks the user to log in first.
- [ ] **Doctor app:** if a doctor gets this type (the admin chose "Everyone" or "All doctors"), ignore it without crashing.
- [ ] Older app versions: unknown types should fall back to a no-op. Check that this is already the case.
