# Highlights (Stories) — Dashboard (Admin) API Documentation

Admin/back-office API for managing the Instagram-style **Highlights** shown on the client app
home screen. A highlight is one circle in the strip: a cover image, a title, and **1–5
elements** (image/video slides). Each element may carry **one CTA** shaped exactly like a
push-notification payload.

- **Base URL:** `https://development.home-healers.com`
- **API prefix:** `/api/admin`
- **Auth:** `Authorization: Bearer <admin token>` (Sanctum). Get it from `POST /api/admin/login` (`data.token`).
- **Permission:** every endpoint requires the `highlights` permission → otherwise `403 Forbidden`. No token → `401 Unauthorized`.
- **Envelope:** `{ "message": "...", "data": ... }`. All resource payloads are returned as an **array under `data`** (even single items → `data[0]`).
- **Locale:** send `language: ar|en`. Titles are stored bilingually and always returned as `{ "ar": ..., "en": ... }`.

---

## Core rules the dashboard must respect / display

| Rule | Detail |
|------|--------|
| **Max 5 elements** per highlight | Counts active **and** inactive (soft-deleted excluded). 6th → `422`. |
| **Max 3 pinned** highlights total | The cap **excludes the current highlight** on update, so re-saving an already-pinned one never trips it. Exceeding → `422`. |
| **`visibility_type`** | `always` = never expires. `daily` = each element expires **24h after its own `created_at`**; the highlight is "expired" only when **all** elements are expired. |
| **`is_active` vs expiry** | Independent. `is_active` is a manual show/hide (highlight- and element-level); expiry is purely time-based. |
| **Replacing element media** | Uploading a new `media` file on element update **deletes that element's view rows** — it becomes unviewed for everyone (new content). |
| **CTA is notification-shaped** | `cta_type` + `deep_link` + `url` + `extra_data` — same vocabulary as the dashboard push-notification composer. All optional. |
| **Image duration** | Global setting (`highlight_image_duration_seconds`), not per element. Videos play to completion. |
| **Ordering** (client side) | The client strip is ordered pinned → unread → read; the dashboard just controls `is_pinned` and `order`. |

---

## Highlight endpoints

### 1. `GET /api/admin/highlights` — list

Query params (all optional):

| Param | Notes |
|-------|-------|
| `search` | Matches `title` (ar/en). |
| `is_active` | `1` / `0`. |
| `is_pinned` | `1` / `0`. |
| `visibility_type` | `always` / `daily`. |
| `limit` | Page size, 1–100 (default 20). |
| `page` | Page number. |

**Response `200`** — paginated (Laravel resource-collection pagination: `data`, `links`, `meta`).

```json
{
  "message": "Highlights fetched successfully",
  "data": [
    {
      "id": 12,
      "title": { "ar": "عروض الأسبوع", "en": "Weekly Offers" },
      "cover": "https://development.home-healers.com/storage/.../cover.jpg",
      "country_ids": [1, 3],
      "visibility_type": "always",
      "is_pinned": true,
      "order": 1,
      "is_active": true,
      "elements_count": 2,
      "is_expired": false,
      "created_at": "2026-09-12 10:00:00",
      "elements": [ /* see element shape below */ ]
    }
  ],
  "links": { "first": "...", "last": "...", "prev": null, "next": "..." },
  "meta": { "current_page": 1, "last_page": 3, "per_page": 20, "total": 45 }
}
```

- `elements_count` — total elements (active + inactive), for the **x/5** badge.
- `is_expired` — computed per §rules (only meaningful for `daily`), for the Active/Expired badge.

### 2. `GET /api/admin/highlights/{id}` — show

Returns one highlight (with `elements`) at `data[0]`. `404` if not found.

### 3. `POST /api/admin/highlights` — create

**`multipart/form-data`** (cover is required).

| Field | Rules |
|-------|-------|
| `title_ar` | required, string, ≤255 |
| `title_en` | required, string, ≤255 |
| `visibility_type` | required, `always` \| `daily` |
| `country_ids[]` | nullable array; each `integer` + `exists:countries,id`. Omit/empty = **all countries**. |
| `is_pinned` | nullable boolean (max 3 enforced) |
| `order` | nullable integer ≥0 |
| `is_active` | nullable boolean (default `true`) |
| `cover` | **required**, image (`jpeg,png,webp,gif`), ≤5 MB |

**Response `200`** → created highlight at `data[0]`.

**Errors:** `422` validation (missing title/cover, invalid `visibility_type`, `is_pinned` over cap), `403` no permission.

### 4. `PUT /api/admin/highlights/{id}` — update

Same fields as create, all `sometimes` (send only what changes); `cover` is **nullable** here.
To **replace the cover** you must send a file, so use method spoofing:
`POST` with `_method=PUT` in `multipart/form-data`. Field-only updates can use a plain `PUT` JSON body.

**Response `200`** → updated highlight at `data[0]`. Pinned cap excludes the current highlight.

### 5. `DELETE /api/admin/highlights/{id}` — soft delete

**Response `200`**: `{ "message": "Highlight deleted successfully" }`. `404` if not found.

### 6. `POST /api/admin/highlights/{id}/toggle-active`

Flips `is_active`. Returns the updated highlight at `data[0]`.

---

## Element endpoints

Element shape (returned by all element endpoints at `data[0]`, and inside a highlight's `elements`):

```json
{
  "id": 101,
  "highlight_id": 12,
  "media_type": "image",
  "media_url": "https://development.home-healers.com/storage/.../101.jpg",
  "thumbnail_url": null,
  "cta_type": "product_detail",
  "deep_link": "homehealers://doctors/55",
  "url": null,
  "extra_data": { "reservation_id": 9, "action": "open" },
  "order": 0,
  "is_active": true,
  "is_expired": false,
  "created_at": "2026-09-12 10:05:00"
}
```

### 7. `POST /api/admin/highlights/{id}/elements` — add element

**`multipart/form-data`.** Rejected with `422` if the highlight already has 5 elements.

| Field | Rules |
|-------|-------|
| `media_type` | required, `image` \| `video` |
| `media` | **required**, file ≤150 MB, mimes `jpeg,png,webp,gif,mp4,mov,webm,mkv` |
| `thumbnail` | nullable image (`jpeg,png,webp,gif`) ≤5 MB — poster for videos |
| `cta_type` | nullable string ≤50 — the notification type (`route`, `chat`, `product_detail`, `reservation_created`, …) |
| `deep_link` | nullable string ≤255 |
| `url` | nullable valid URL ≤2000 |
| `extra_data` | nullable array/object — arbitrary keys (`reservation_id`, `action`, `screen`, `route`, …). Send as `extra_data[key]=value` in form-data. |
| `order` | nullable integer ≥0 |
| `is_active` | nullable boolean (default `true`) |

> **CTA note:** all four CTA fields are optional. Leave them empty for a slide with no button.
> Whatever you set is emitted to the app as a flat `cta` map that its notification navigator consumes directly.

**Response `200`** → created element at `data[0]`.

### 8. `POST /api/admin/highlights/{id}/elements/{elementId}` — update element

**`multipart/form-data`** (route is `POST`, no spoofing needed). Send only what changes; every field is optional.

- Sending a new **`media`** file → old media replaced **and this element's view rows are deleted** (unviewed for everyone).
- Sending a new **`thumbnail`** file → replaces the poster.

**Response `200`** → updated element at `data[0]`. `404` if the element doesn't belong to the highlight.

### 9. `DELETE /api/admin/highlights/{id}/elements/{elementId}` — soft delete element

**Response `200`**: `{ "message": "Element deleted successfully" }`.

### 10. `POST /api/admin/highlights/{id}/elements/{elementId}/toggle-active`

Flips the element's `is_active`. Returns the updated element at `data[0]`.

---

## Global settings

### 11. `GET /api/admin/highlights/settings`

```json
{ "message": "Highlight settings fetched successfully", "data": { "highlight_image_duration_seconds": 15 } }
```

### 12. `PUT /api/admin/highlights/settings`

Body: `{ "highlight_image_duration_seconds": 10 }` — `required|integer|min:1`. `0`/negatives/empty → `422`.
Applies to **all** image slides across every highlight (videos ignore it).

---

## Endpoint summary

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/api/admin/highlights` | List (search/filter/paginate) |
| `POST` | `/api/admin/highlights` | Create highlight (cover required) |
| `GET` | `/api/admin/highlights/{id}` | Show one |
| `PUT` | `/api/admin/highlights/{id}` | Update highlight |
| `DELETE` | `/api/admin/highlights/{id}` | Soft delete |
| `POST` | `/api/admin/highlights/{id}/toggle-active` | Toggle highlight active |
| `POST` | `/api/admin/highlights/{id}/elements` | Add element (max 5) |
| `POST` | `/api/admin/highlights/{id}/elements/{elementId}` | Update element (media replace wipes views) |
| `DELETE` | `/api/admin/highlights/{id}/elements/{elementId}` | Delete element |
| `POST` | `/api/admin/highlights/{id}/elements/{elementId}/toggle-active` | Toggle element active |
| `GET` | `/api/admin/highlights/settings` | Read image-slide duration |
| `PUT` | `/api/admin/highlights/settings` | Update image-slide duration |

---

## Suggested dashboard UI flow

1. **Index page** — table: cover thumb, title, visibility badge, pinned badge, `order`,
   **elements x/5** (`elements_count`), active toggle, **Active/Expired** badge (`is_expired`), created_at, actions.
2. **Create** — highlight fields only (cover required). On save → open the edit page.
3. **Edit** — highlight fields + an **Elements manager** (Ajax add/update/delete, max 5):
   - `media_type`, media upload (front-end: video ≤2 min & ≤~150 MB, image ≤5 MB; server re-validates).
   - If video → show a thumbnail input.
   - CTA section: `cta_type` (free/select of your notification types), `deep_link`, `url`, and `extra_data` key/value rows.
   - `order`, `is_active` toggle, expired badge (daily).
4. **Pinned/element caps** are server-enforced (`422`) — surface the message inline.
5. A global **Settings** control for `highlight_image_duration_seconds`.
