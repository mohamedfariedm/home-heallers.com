# App Messages — Implementation Plan

> Admins manage short bilingual messages (title + description in Arabic and English).
> The **doctor (partner) app** asks for one **random active** message and gets it in the
> language it requests. Each message has an **audience** (`doctor` today, `client` later)
> that the backend sets automatically; the dashboard does not show it yet.

Companion files:
- [dashboard-api.md](dashboard-api.md) — contract + UI spec for the dashboard frontend
- [doctor-app-api.md](doctor-app-api.md) — contract for the doctor app

---

> **Status (2026-09-26):** backend and dashboard implemented. Backend files are listed in §2.6.

## 1. Decisions

| Topic | Decision |
|-------|----------|
| Feature name | **App Messages** everywhere: table `app_messages`, route `app-messages`, permission `app_messages`. |
| Languages | `title` and `description` are JSON `{ "ar": "...", "en": "..." }`. Both languages are **required**. |
| Status | `is_active` boolean. Only active messages can be returned to apps. |
| Audience | `audience` enum `doctor` \| `client`, default `doctor`. The dashboard **does not send it**; the backend forces `doctor` on create and leaves it unchanged on update. When clients get the feature, expose it in the form and add a client endpoint. No migration is needed then. |
| Dashboard response | Returns **both languages** (full JSON objects) plus `audience`, read-only. |
| App response | Returns **one language only**, taken from `Accept-Language` (`ar` \| `en`, fallback `en`). |
| Random | Uniform random over active messages for the audience. The optional `exclude_id` avoids showing the same message twice in a row. |
| Empty state | No active messages → `200` with `data: null` (not 404). The app hides the widget. |
| Payload type | JSON (no files), so create and update can use a normal `PUT`. No multipart workaround is needed. |

---

## 2. Backend (Laravel)

### 2.1 Migration — `app_messages`

| Column | Type | Notes |
|--------|------|-------|
| `id` | bigIncrements | |
| `title` | json | `{ar, en}` |
| `description` | json | `{ar, en}` |
| `audience` | string(20), default `'doctor'`, indexed | values: `doctor`, `client` |
| `is_active` | boolean, default `true` | |
| `created_by` | foreignId → admins, nullable, nullOnDelete | optional, for auditing |
| timestamps | | |

Index: `(audience, is_active)`.

### 2.2 Model — `App\Models\AppMessage`

- `$casts = ['title' => 'array', 'description' => 'array', 'is_active' => 'boolean']`
  (or `spatie/laravel-translatable` if the project already uses it for other bilingual models; keep it consistent with Onboarding Screens).
- Enum `App\Enums\AppMessageAudience { Doctor = 'doctor'; Client = 'client'; }`
- Scopes: `active()`, `forAudience(string $audience)`.

### 2.3 Admin API — `routes/api.php`, group `admin` + `auth:admin` + `permission:app_messages`

| Method | URI | Action |
|--------|-----|--------|
| GET | `/api/admin/app-messages` | index (filters: `status`, `search`; paginate when `limit` is sent) |
| GET | `/api/admin/app-messages/{id}` | show |
| POST | `/api/admin/app-messages` | store |
| PUT | `/api/admin/app-messages/{id}` | update |
| DELETE | `/api/admin/app-messages/{id}` | destroy |
| POST | `/api/admin/app-messages/{id}/toggle-active` | toggle `is_active` |

- `StoreAppMessageRequest` / `UpdateAppMessageRequest`:
  ```php
  'title'          => ['required', 'array'],
  'title.ar'       => ['required', 'string', 'max:150'],
  'title.en'       => ['required', 'string', 'max:150'],
  'description'    => ['required', 'array'],
  'description.ar' => ['required', 'string', 'max:1000'],
  'description.en' => ['required', 'string', 'max:1000'],
  'is_active'      => ['sometimes', 'boolean'],
  ```
  `audience` is **not** in the rules. `store()` sets `audience = doctor` explicitly.
- `search` matches `title->ar`, `title->en`, `description->ar` and `description->en` using `LIKE`.
- `AdminAppMessageResource` returns every field with both languages (see dashboard-api.md §3).
- Register the `app_messages` permission in the permissions seeder and assign it to super-admin.

### 2.4 Doctor app API — inside the existing **doctor** route group (doctor auth guard)

| Method | URI | Action |
|--------|-----|--------|
| GET | `/api/doctor-mobile/app-messages/random` | one random active message for audience `doctor` |

> Lives in `routes/doctor_mobile.php` (prefix `/api/doctor-mobile`, `auth:sanctum`), next to `motivation/today`.

```php
$lang = in_array($request->header('Accept-Language'), ['ar', 'en'])
    ? $request->header('Accept-Language') : 'en';

$message = AppMessage::active()
    ->forAudience(AppMessageAudience::Doctor->value)
    ->when($request->integer('exclude_id'), fn ($q, $id) => $q->whereKeyNot($id))
    ->inRandomOrder()
    ->first();

// If exclude_id removed the only active message, return that message anyway.
$message ??= AppMessage::active()->forAudience('doctor')->inRandomOrder()->first();
```

`AppMessageResource` (app) returns `{ id, title, description }` as **plain strings** in `$lang`.
If one language is ever empty, fall back to the other language.

`inRandomOrder()` works fine for small tables (a few hundred rows). If the table gets large, pick a random id instead.

### 2.5 Relation to `motivation_messages`
The backend already has **Motivation Messages** (`motivation_messages`, `GET doctor-mobile/motivation/today`): a single
bilingual `message` that rotates **once per day**, with no dashboard UI. App Messages is a **separate** feature
(title + description, random, audience). Both are left in place.

### 2.6 Backend files (home-healers-app)
- `database/migrations/2026_09_26_100000_create_app_messages_table.php`
- `app/Enums/AppMessageAudience.php`, `app/Models/AppMessage.php`
- `app/Http/Requests/Admin/StoreAppMessageRequest.php` (create + update)
- `app/Http/Resources/Admin/AppMessageResource.php`, `app/Http/Resources/DoctorMobile/AppMessageResource.php`
- `app/Http/Controllers/Admin/AppMessageController.php`, `app/Http/Controllers/DoctorMobile/AppMessages/AppMessageController.php`
- routes in `routes/admin.php` + `routes/doctor_mobile.php`; `app_messages` in `PermissionSeeder`; `doctor_mobile.app_messages.*` lang keys
- tests: `tests/Feature/Admin/AppMessageControllerTest.php`, `tests/Feature/DoctorMobile/AppMessageTest.php`

### 2.7 Backend tests (Feature)
- Admin CRUD happy path, and validation errors when `title.ar` / `description.en` is missing.
- `audience` sent by the dashboard is ignored; a new record is always `doctor`.
- Toggle flips `is_active`.
- A user without the `app_messages` permission gets 403.
- Random: returns only active + doctor messages; `Accept-Language: ar` returns Arabic strings; no messages → `data: null`; `exclude_id` is respected when ≥ 2 messages exist.

---

## 3. Dashboard (this repo) — files to add

Mirrors the Onboarding Screens module (commit `dfe8e21`).

| File | Purpose |
|------|---------|
| `src/types/app-messages.ts` | `AppMessage`, `AppMessageBilingual`, `AppMessageAudience` types |
| `src/framework/utils/index.ts` | add a `client.appMessages` block (all / findOne / create / update / delete / toggleActive) |
| `src/framework/app-messages.ts` | React Query hooks: `useAppMessages`, `useAppMessage`, `useCreate…`, `useUpdate…`, `useDelete…`, `useToggleAppMessageActive` |
| `src/app/shared/app-messages/permissions.ts` | `resolveAppMessagesPermissions` → permission `app_messages` |
| `src/app/shared/app-messages/message-form.tsx` | AR/EN title + description, active switch, validation |
| `src/app/[locale]/(hydrogen)/app-messages/page.tsx` | list: status filter, search, table/cards, toggle, edit, delete-with-confirm |
| `src/app/[locale]/(hydrogen)/app-messages/create/page.tsx` | create page |
| `src/app/[locale]/(hydrogen)/app-messages/[id]/edit/page.tsx` | edit page |
| `src/config/routes.ts` | `appMessages: { index, create, edit(id) }` |
| `src/layouts/hydrogen/menu-items.tsx` | menu item "App Messages" / "رسائل التطبيق", permission `app_messages` |

---

## 4. Order of work

1. **Backend**: migration, model and enum → admin CRUD + requests + resource → permission seeder → doctor random endpoint → tests.
2. Share the two contract files with the dashboard and doctor-app developers. Both can start against the contract while the backend is in progress.
3. **Dashboard**: types + client + hooks → form → list → routes/menu → test against staging.
4. **Doctor app**: API call + model → widget in the chosen screen → empty/error states.
5. QA: create messages in both languages, deactivate some, switch the app language, and confirm only active messages show in the right language.

## 5. Later: enabling clients
- Add `audience` (select: doctor/client) to the dashboard form and a column/filter to the list.
- Accept `audience` in the admin requests (`in:doctor,client`).
- Add `GET /api/client/app-messages/random` that reuses the same query with `forAudience('client')`.
