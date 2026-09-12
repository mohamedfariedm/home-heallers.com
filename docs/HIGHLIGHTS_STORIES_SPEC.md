# Highlights (Stories) — Portable Feature Spec & AI Context

> **Purpose of this file:** a self-contained, framework-neutral specification of an
> Instagram-style *Stories / Highlights* feature, extracted from a working Laravel +
> Orchid implementation. Hand this to an AI (or a developer) in **another project** as
> context. It describes *what the feature does and why*, the exact data model, every
> endpoint with real request/response shapes, and both the **dashboard (admin)** and
> **mobile app** flows. Adapt names/stack to the target project — the *rules* are the
> important part, not the PHP.

---

## 0. TL;DR — what we are building

- A horizontal strip of **circular avatars** on the app home screen (like Instagram Stories).
- Tapping an avatar opens a full-screen **story viewer** that plays that highlight's
  **elements** (image or video slides) one after another.
- Each element may carry **one Call-To-Action** (Add to Cart / Open product / Open category).
- Admins create & manage highlights from a **dashboard page** (not part of the mobile app).
- The app tracks **read/unread** state per element, per user (logged in) or per device (guest),
  and re-orders the strip so unread stories come first.

**Naming:** feature is called **Highlights** everywhere in code/API. "Stories" is only the
colloquial name. Keep one name across DB tables, API keys, and UI to avoid confusion.

---

## 1. Core concepts & vocabulary

| Term | Meaning |
|------|---------|
| **Highlight** | One circle in the strip. Has a cover image, a title, and 1–5 elements. |
| **Element** | One slide inside a highlight (image or video). Max **5** per highlight. |
| **CTA** | Optional button on an element: `add_to_cart`, `product_detail`, or `category`. |
| **View** | A record that a specific viewer watched a specific element. |
| **Viewer** | Either a logged-in user (`user_id`) OR a guest device (`device_id`). |
| **Read** | A highlight is *read* when the viewer has viewed **every** currently-visible element in it. |
| **Pinned** | Admin flag; pinned highlights always sort first. Max **3** pinned. |
| **visibility_type** | `always` (never expires) or `daily` (each element expires 24h after it was added). |
| **type** | `products` / `services` / `both` — controls which CTAs can be linked and which app tab shows it. |

---

## 2. Data model

Three tables. Adapt column types to your DB; the shape and constraints matter.

### 2.1 `highlights`
| Column | Type | Notes |
|--------|------|-------|
| `id` | PK | |
| `title` | JSON | Translatable map, e.g. `{"ar":"عروض","en":"Offers"}` |
| `branch_id` | FK → branches, **nullable** | `null` = global (all branches). Otherwise visible only in that branch. |
| `country_ids` | JSON array, **nullable** | `null`/`[]` = all countries. Otherwise only these country IDs. |
| `type` | enum `products` / `services` / `both` | Which product kinds its CTAs may link to. |
| `visibility_type` | enum `daily` / `always` | Expiry model (see §5). |
| `is_pinned` | bool | Max 3 across all highlights. |
| `order` | int | Manual sort within a group. |
| `is_active` | bool | Manual show/hide. **Independent** of expiry. |
| timestamps + soft delete | | |

Index: `(is_active, type, branch_id)`. Cover image stored as an attachment/media collection
(`highlight-cover`) — this is the circle avatar.

### 2.2 `highlight_elements`
| Column | Type | Notes |
|--------|------|-------|
| `id` | PK | |
| `highlight_id` | FK, cascade delete | |
| `media_type` | enum `image` / `video` | |
| `cta_type` | enum **nullable** `add_to_cart` / `product_detail` / `category` | `null` = no CTA |
| `product_id` | FK, nullable | Required when cta is `add_to_cart` / `product_detail`. |
| `category_id` | FK, nullable | Required when cta is `category` (must be a **sub**-category). |
| `order` | int | |
| `is_active` | bool | |
| timestamps + soft delete | | `created_at` drives the 24h daily expiry. |

Index: `(highlight_id, is_active, created_at)`. Media collections: `highlight-element-media`
(the image/video) and `highlight-element-thumbnail` (poster image, video only).

### 2.3 `highlight_element_views`
| Column | Type | Notes |
|--------|------|-------|
| `id` | PK | |
| `highlight_id` | FK, cascade | Denormalized for fast per-highlight counting. |
| `highlight_element_id` | FK, cascade | |
| `user_id` | FK, nullable | Set for logged-in viewers. |
| `device_id` | string, nullable, indexed | Set **only on guest rows**; nulled once merged into a user. |
| `viewed_at` | timestamp | |

Unique keys: `(highlight_element_id, user_id)` **and** `(highlight_element_id, device_id)`.
Keeping `device_id = null` on owned rows stops the unique index colliding when several
accounts share one device.

---

## 3. Business rules (the part that actually matters)

These are the decisions that make the feature behave correctly. Re-implement them exactly.

1. **Strip ordering** (server-side, always): **pinned first** (by `order`), then **unread**
   (by `order`), then **read** last (by `order`). Ties broken by `id`. This is Instagram behavior.
2. **A highlight is `is_read`** only when *every* currently **visible** element (active +
   non-expired) has a view row for this viewer. Empty highlight ⇒ not read.
3. **Adding a new element to a fully-read highlight** flips it back to **unread** and it
   returns to its natural unread position. Old elements **keep** their view rows — the user
   just skips through them; re-sending an already-viewed element to the *viewed* endpoint is
   **idempotent** (success, no error, no duplicate row). The highlight becomes read again
   only once the new element is viewed too.
4. **Replacing an element's media** (admin uploads a new image/video for an existing element)
   ⇒ **delete that element's view rows**. It becomes unviewed for everyone (it's new content).
5. **`is_active` vs expiry are independent.** `is_active` is a manual show/hide at both
   highlight and element level. Expiry is purely time-based.
6. **Expiry is per element.** When the highlight is `visibility_type = daily`, each element
   expires **24h after its own `created_at`**. The highlight is expired when **all** its
   elements are expired. `always` never expires. Adding a new element naturally extends life
   (no reset timer).
7. **Max 5 elements** per highlight — counts active **and** inactive (soft-deleted excluded).
8. **Max 3 pinned** highlights total (the count excludes the current one on update, so
   re-saving an already-pinned highlight never trips the cap).
9. **Branch scoping:** `branch_id = null` ⇒ visible in every branch; otherwise only when the
   app resolves that branch (from lat/lng). Online/country-agnostic branches are a special
   case — don't let their stored country decide visibility.
10. **Country scoping:** `country_ids` null/empty ⇒ all countries; otherwise only the listed
    countries. Effective country is resolved in priority: explicit `country-id` header →
    user's home country → branch country (unless it's the country-agnostic online branch).
11. **Image slide duration** comes from a **global setting**
    (`highlight_image_duration_seconds`, default `15`, validation `required|integer|min:1`),
    **not** per element. Videos play to completion.
12. **CTA payloads are embedded** in the response — the product object (full product-detail
    shape) or the category object — so the app needs **no second request** when a CTA is tapped.
13. **Guest → user merge:** when an authenticated request also carries a `device_id`, the
    guest's view rows for that device are lazily merged into the user's account (dedup on
    conflict). No change to the login endpoint — merge happens on the next authed call that
    carries `device_id`.

---

## 4. Read-state & viewer model (how "read" is computed)

- A **viewer** is `user_id` (logged in) OR `device_id` (guest). Never both used to write —
  a written view row belongs to a user (with `device_id=null`) or a guest (`user_id=null`).
- On **read** (home page), the server collects the viewer's viewed element IDs in one query,
  marks each element `is_viewed`, and sets the highlight `is_read = (all visible viewed)`.
- On **write** (viewed endpoint), the server `firstOrCreate`s the view row (idempotent) and
  returns `{ is_read, remaining_elements }` for the whole highlight so the app can update the
  ring immediately without re-fetching.
- **Merge** (guest→user): move rows where `user_id IS NULL AND device_id = X` to
  `user_id = <user>, device_id = null`; if the user already viewed that element, delete the
  duplicate guest row instead.

---

## 5. Expiry model (visual)

```
visibility_type = always   ──►  never expires. Element shows until admin hides it.

visibility_type = daily    ──►  each element lives 24h from its OWN created_at.

   element A (created 09:00 Mon) ── visible until 09:00 Tue
   element B (created 20:00 Mon) ── visible until 20:00 Tue
   → highlight disappears from the strip only when A AND B are both expired.
   → adding element C at 08:00 Tue keeps the highlight alive until 08:00 Wed.
```

---

## 6. API (mobile-facing)

Base assumptions: JSON API, bearer/sanctum-style auth optional on these routes. Every
response is wrapped as `{ "success": true, "data": { ... } }` (adapt to your envelope).

### 6.1 `GET /api/home_page` — highlights strip (additive key)

The highlights strip is **one additive key** on the existing home-page response. It is
returned in **both** the guest path and the logged-in path; no other key changes.

**Request (query params):**
| Param | Required | Notes |
|-------|----------|-------|
| `lat`, `lng` | yes | Used to resolve the branch. |
| `device_id` | optional | Guest read state + triggers guest→user merge after login. |
| `country-id` *(header)* | optional | Overrides resolved country for scoping/pricing. |
| `Authorization: Bearer <token>` *(header)* | optional | Logged-in viewer; else guest. |

**Response (excerpt — only the `highlights` key shown):**
```json
{
  "success": true,
  "data": {
    "highlights": [
      {
        "id": 12,
        "title": "عروض الأسبوع",
        "cover": "https://cdn.example.com/highlight-cover/12.jpg",
        "type": "products",
        "branch_id": null,
        "visibility_type": "always",
        "is_pinned": true,
        "order": 1,
        "is_read": false,
        "is_viewed": false,
        "elements": [
          {
            "id": 101,
            "media_type": "image",
            "media_url": "https://cdn.example.com/hl/101.jpg",
            "thumbnail_url": null,
            "duration_seconds": 15,
            "cta_type": "product_detail",
            "product": { "id": 55, "name": "...", "price": 30, "images": ["..."], "...": "full product-detail shape" },
            "order": 0,
            "is_viewed": true
          },
          {
            "id": 102,
            "media_type": "video",
            "media_url": "https://cdn.example.com/hl/102.mp4",
            "thumbnail_url": "https://cdn.example.com/hl/102-thumb.jpg",
            "duration_seconds": 0,
            "cta_type": "category",
            "category": { "id": 8, "name": "مشروبات", "image": "...", "parent_id": 2, "sort_order": 3 },
            "order": 1,
            "is_viewed": false
          }
        ]
      }
    ]
  }
}
```

Field notes:
- `title` is the **localized string** for the request locale (not the raw JSON map).
- `is_read` and `is_viewed` on the highlight are the **same value** (both provided because the
  mobile app asked for that name); the ring is "seen" when true.
- `duration_seconds`: images → configured setting; videos → `0` (play fully). Never null.
- `product` present only for `add_to_cart` / `product_detail`; `category` present only for `category`.
- Empty `highlights` array ⇒ the app should show its normal banner slider instead of the strip.

### 6.2 `POST /api/highlights/{highlight}/elements/{element}/viewed` — mark viewed

Called by the app **after each element is fully watched** (image: after its duration; video:
after playback ends).

- **Public route** (no auth middleware). Logged-in viewer resolved from the token; guest must
  send `device_id`.
- Validates the element belongs to the highlight → `404` otherwise.
- **Idempotent** — repeated calls (including for elements whose media was later replaced)
  always succeed.

**Request body:**
```json
{ "device_id": "abc-123-device-uuid" }
```
`device_id` is **required when unauthenticated**, optional (but recommended once, for merge)
when authenticated.

**Response:**
```json
{
  "success": true,
  "data": { "is_read": false, "remaining_elements": 2 }
}
```
`remaining_elements` = count of still-unviewed visible elements in that highlight. When it
reaches `0`, `is_read` is `true` — the app flips the ring to "seen".

**Errors:** `404` highlight/element not found; `422` validation (missing `device_id` when guest).

---

## 7. Mobile app flow

1. On home load, call `GET /home_page` with `lat`, `lng`, and (if available) `device_id`.
2. If `highlights` is non-empty → render the circular strip; else render the banner slider.
3. **Ring state** per highlight comes from `is_read`/`is_viewed`: solid/gradient ring = unread,
   grey ring = read. The server already ordered them (pinned → unread → read); render as-is.
4. Tapping a highlight opens the full-screen viewer, resuming from the **first unviewed element**.
5. For each element: image auto-advances after `duration_seconds`; video plays to completion.
6. When an element finishes, call the **viewed** endpoint for it (send `device_id` if guest).
   Use the returned `is_read`/`remaining_elements` to update the ring live.
7. **CTA tap:** all embedded payloads are already in the response — no fetch needed.
   - `add_to_cart` → add the embedded `product` to cart.
   - `product_detail` → open the embedded `product`'s detail screen.
   - `category` → open the embedded `category` listing.
   - Any CTA tap **closes** the viewer; the back button must **not** return into the viewer.
8. **Guest→login:** keep sending `device_id` on at least the first authed `home_page` call so
   the server merges guest view history into the account (read state survives login).

---

## 8. Dashboard (admin) flow

The admin UI is a set of server-rendered pages + Ajax (not part of the mobile app), gated by a
single permission (e.g. `platform.highlights.manage`). Every controller action checks it.

### 8.1 Index page
Table of highlights: cover thumbnail, title, branch (or "Global"), type badge, visibility type,
pinned badge, order, **elements count (x/5)**, active toggle, **expiry status badge**
(Active / Expired computed per §5), created_at, actions (edit / delete).

### 8.2 Create page (highlight fields only)
Elements are added on the edit page after first save. Fields:
1. `visibility_type` — Daily (24h) / Always
2. `branch_id` — "All branches (Global)" or a specific branch
3. `country_ids[]` — none (all countries) or a set of countries
4. `type` — Products / Services / Both
5. `title_ar`, `title_en`
6. Cover image (**required**)
7. `is_pinned` (max 3 — server-validated, count excludes current)
8. `order` (int)
9. `is_active`

Validation: `title_ar`/`title_en` required; `visibility_type ∈ {daily,always}`;
`type ∈ {products,services,both}`; `branch_id` nullable+exists; `country_ids.*` int+exists; a
chosen branch must belong to a selected country (if any) else reject. On save → redirect to edit.

### 8.3 Edit page (highlight fields + Elements manager)
Same fields, plus an **Elements manager** (Ajax CRUD, max 5). Per element:
- `media_type` (image/video).
- Media upload. **Front-end validation:** video duration ≤ 2 min (read via JS `video.duration`
  before upload) and size ≤ ~150MB; image ≤ 5MB + mime. Server re-validates mime + size.
- If video → a **thumbnail** image input appears.
- `cta_type` select, options **translated**: None / Add to Cart / Product Detail / Category.
  - Add to Cart / Product Detail → searchable **product** dropdown (Ajax), filtered by the
    highlight `type` (`products`→product, `services`→service, `both`→either), active, and
    `perBranch` when the highlight has a specific branch.
  - Category → **sub-category** dropdown (Ajax): sub-categories only, active, per-branch, and
    (for `products`) only those that actually contain available products.
- `order`, `is_active` toggle, expired badge (daily).

**Rule reminder:** replacing an element's media on update ⇒ delete that element's view rows (§3.4).

### 8.4 Admin Ajax endpoints (server-side, dashboard only)
| Method + Path | Purpose |
|---------------|---------|
| `GET  admin/highlights` | Index list |
| `GET  admin/highlights/create` | Create form |
| `POST admin/highlights` | Store highlight |
| `GET  admin/highlights/{id}/edit` | Edit form |
| `PUT  admin/highlights/{id}` | Update highlight |
| `DELETE admin/highlights/{id}` | Soft-delete highlight |
| `POST admin/highlights/{id}/toggle-active` | Toggle highlight active |
| `POST admin/highlights/{id}/elements` | Create element (JSON, multipart) |
| `POST admin/highlights/{id}/elements/{elementId}` | Update element |
| `DELETE admin/highlights/{id}/elements/{elementId}` | Delete element |
| `POST admin/highlights/{id}/elements/{elementId}/toggle-active` | Toggle element active |
| `GET  admin/highlights/search-products?q=&branch_id=&type=` | Product picker |
| `GET  admin/highlights/subcategories?branch_id=&type=` | Sub-category picker |

**Element create/update response (JSON):**
```json
{
  "success": true,
  "message": "Element saved",
  "element": {
    "id": 101, "media_type": "image", "media_url": "...", "thumbnail_url": null,
    "cta_type": "product_detail", "product_id": 55, "product_name": "...",
    "category_id": null, "category_name": null,
    "order": 0, "is_active": true, "is_expired": false, "created_at": "2026-09-12 10:00:00"
  }
}
```
Element validation errors return `422` with a message (e.g. max-5-elements, missing product for CTA).

---

## 9. Server-side validation summary

**Highlight (store/update):**
- `title_ar`, `title_en`: required strings (max 255).
- `visibility_type`: required ∈ `{daily, always}`.
- `type`: required ∈ `{products, services, both}`.
- `branch_id`: nullable, exists.
- `country_ids`: nullable array; each entry int + exists; a specific branch must belong to a
  selected country.
- `is_pinned`: reject if already 3 pinned (excluding current).
- `cover`: required on create, nullable on update; image, max 5MB.

**Element (store/update):**
- `media_type`: required ∈ `{image, video}`.
- `media`: required on create; file; video mime `mp4/quicktime/webm/mkv` ≤ ~150MB, image ≤ 5MB.
- `thumbnail`: nullable image ≤ 5MB (used for video).
- `cta_type`: nullable ∈ `{add_to_cart, product_detail, category}`.
- `product_id`: required + exists + active when cta ∈ `{add_to_cart, product_detail}`.
- `category_id`: required + exists (active sub-category) when cta = `category`.
- Max 5 elements per highlight (counts inactive).

---

## 10. QA / acceptance checklist

- [ ] New highlight appears first as **unread**; existing highlights keep their read state.
- [ ] Pinned + read highlight still ranks **before** unpinned + unread.
- [ ] Ordering inside each group follows `order`.
- [ ] `is_read` flips true only after **all** visible elements are viewed.
- [ ] Adding a 6th element rejected (including when some are inactive).
- [ ] Adding an element to a read highlight → highlight unread, old views intact, viewed
      endpoint idempotent for old elements.
- [ ] Replacing element media wipes only that element's views.
- [ ] Daily: element older than 24h disappears; highlight with all elements expired disappears;
      `always` never expires.
- [ ] Branch scoping: global visible everywhere; branch highlight only in its branch.
- [ ] Country scoping: null = all; specific list filters correctly per resolved country.
- [ ] Max 3 pinned enforced (excluding current on update).
- [ ] Guest flow: views by `device_id`; after login with `device_id`, read state preserved
      (merge), no duplicates.
- [ ] `home_page`: `highlights` key present in guest AND logged-in paths; no other key changed.
- [ ] Image duration setting rejects 0, negatives, empty, non-integers.
- [ ] Permission: admin page returns 403 without the manage permission.

---

## 11. Porting notes (for the AI implementing this elsewhere)

- Keep the **three-table** model and the **viewer = user_id OR device_id** idea; they are the
  backbone. Everything else (Blade, Orchid, Laravel media library) is stack-specific dressing.
- The **ordering + read-state** logic (§3.1–3.3, §4) is the single most error-prone part —
  implement and test it first.
- Return **embedded CTA payloads** (§3.12) so the app never makes a second call from the viewer.
- Make the **viewed** endpoint idempotent from day one; the app will retry.
- Put image duration in a **global config**, not per element.
- If your target project has no branch/country concept, drop `branch_id`/`country_ids` and treat
  every highlight as global — the rest is unaffected.
- Adapt the response envelope (`{success,data}`) and auth scheme to the target project's norms.
