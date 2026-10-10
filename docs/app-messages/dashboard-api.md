# Dashboard — App Messages API Contract & UI Spec

> For the **dashboard frontend** developer. Build the App Messages screens from this file
> alone. Follow the existing **Onboarding Screens** module (`src/framework/onboarding-screens.ts`,
> `src/app/shared/onboarding-screens/*`) for structure and style.

---

## 1. What the feature is

- The admin creates short messages. Each message has a **title** and a **description**, in both **Arabic and English**.
- Each message is **active** or **inactive**. Only active messages are sent to the apps.
- The doctor (partner) app shows **one random active message**.
- Messages have an `audience` field (`doctor` today). **Do not show it in the form.**
  The backend sets it to `doctor` automatically. It is returned in responses, so you can ignore it for now.

## 2. Conventions

| Item | Value |
|------|-------|
| Base URL | `/api/admin` (already `NEXT_PUBLIC_API_ENDPOINT`) |
| Content type | JSON for both requests and responses (no files, so no multipart) |
| Auth | Bearer token (existing axios interceptor) |
| Permission | `app_messages` |
| Languages | The dashboard always receives **both** `ar` and `en`, whatever the UI language is |

## 3. Resource shape

```json
{
  "id": 7,
  "title":       { "ar": "يوم موفق", "en": "Have a great day" },
  "description": { "ar": "مرضاك بانتظارك...", "en": "Your patients are waiting..." },
  "audience": "doctor",
  "is_active": true,
  "created_at": "2026-09-26T10:15:00.000000Z",
  "updated_at": "2026-09-26T10:15:00.000000Z"
}
```

```ts
// src/types/app-messages.ts
export interface AppMessageBilingual { ar: string; en: string; }
export type AppMessageAudience = 'doctor' | 'client';
export type AppMessageLang = 'ar' | 'en';

export interface AppMessage {
  id: number;
  title: AppMessageBilingual;
  description: AppMessageBilingual;
  audience: AppMessageAudience;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppMessageInput {
  title: AppMessageBilingual;
  description: AppMessageBilingual;
  is_active?: boolean;
}
```

## 4. Endpoints

### 4.1 List — `GET /api/admin/app-messages`

| Query | Type | Notes |
|-------|------|-------|
| `status` | `active` \| `inactive` | optional; omit for all |
| `search` | string | optional; matches title/description in both languages |
| `limit` | int | optional; when sent the response is paginated |
| `page` | int | with `limit` |

Without `limit`:
```json
{ "data": [ /* AppMessage[] */ ], "message": "App messages fetched successfully" }
```
With `limit` (Laravel paginator):
```json
{ "data": [ ], "links": { }, "meta": { "current_page": 1, "last_page": 3, "per_page": 15, "total": 40 } }
```
Ordered by newest first.

### 4.2 Show — `GET /api/admin/app-messages/{id}`
`{ "data": AppMessage }` · `404` if not found.

### 4.3 Create — `POST /api/admin/app-messages`
```json
{
  "title":       { "ar": "يوم موفق", "en": "Have a great day" },
  "description": { "ar": "…", "en": "…" },
  "is_active": true
}
```
→ `201 { "data": AppMessage, "message": "..." }`
**Do not send `audience`.** It is ignored and always saved as `doctor`.

### 4.4 Update — `PUT /api/admin/app-messages/{id}`
Same body as create. → `200 { "data": AppMessage }`

### 4.5 Delete — `DELETE /api/admin/app-messages/{id}`
→ `200 { "message": "..." }`

### 4.6 Toggle active — `POST /api/admin/app-messages/{id}/toggle-active`
No body. → `200 { "data": AppMessage }` (with the new `is_active`)

### 4.7 Validation (422)

| Field | Rule |
|-------|------|
| `title.ar`, `title.en` | required, string, max 150 |
| `description.ar`, `description.en` | required, string, max 1000 |
| `is_active` | optional boolean (default `true`) |

Error shape (already handled by the global interceptor in `request.ts`):
```json
{ "message": "The title.ar field is required.", "errors": { "title.ar": ["The title.ar field is required."] } }
```
Map `errors["title.ar"]` etc. to the matching input.

## 5. Client & hooks

```ts
// src/framework/utils/index.ts — inside class Client
appMessages = {
  all: (param = '') => HttpClient.get(`/app-messages${param ? `?${param}` : ''}`),
  findOne: (id: string | number) => HttpClient.get(`/app-messages/${id}`),
  create: (input: AppMessageInput) => HttpClient.post('/app-messages', input),
  update: ({ id, data }: { id: string | number; data: AppMessageInput }) =>
    HttpClient.put(`/app-messages/${id}`, data),
  delete: (id: string | number) => HttpClient.delete(`/app-messages/${id}`),
  toggleActive: (id: string | number) =>
    HttpClient.post(`/app-messages/${id}/toggle-active`, {}),
};
```

`src/framework/app-messages.ts`: `useAppMessages(filters)`, `useAppMessage(id)`,
`useCreateAppMessage`, `useUpdateAppMessage`, `useDeleteAppMessage`, `useToggleAppMessageActive`.
Use the query key root `routes.appMessages.index`, invalidate it on every mutation, and show a toast on success and on error
(same as `onboarding-screens.ts`).

## 6. Screens

### Routes & menu
```ts
// src/config/routes.ts
appMessages: {
  index: '/app-messages',
  create: '/app-messages/create',
  edit: (id: string | number) => `/app-messages/${id}/edit`,
},
```
Menu item: `name: 'App Messages'`, `nameAr: 'رسائل التطبيق'`, icon e.g. `PiChatCircleTextDuotone`,
`permissions: 'app_messages'`.

### List page `/app-messages`
- Header with a **New Message** button (only if `create` permission).
- Status filter: **All / Active / Inactive** (segmented, same as Onboarding Screens) + search input (debounced, ~400 ms).
- Table or cards. Columns: Title (in the current UI language, with the other language shown smaller underneath),
  Description (truncated to 2 lines), Status switch (calls toggle), Updated at, Actions (Edit, Delete).
- Delete asks for confirmation in a modal.
- Empty state: "No messages yet". Add a hint that the doctor app hides the message card when no message is active.
- 403 → "You don't have permission…" (same pattern as Onboarding Screens).

### Create / Edit form
- Two sections (or tabs): **العربية** (`dir="rtl"`) and **English** (`dir="ltr"`).
  Each has a Title `Input` and a Description `Textarea`.
- A single **Active** `Switch` (default on).
- Client-side validation matches §4.7. Show character counters (150 / 1000).
- Optional: a small preview card that shows the message the way the app will show it, with an AR/EN switch.
- On success, redirect to the list.
- **No audience field.**

## 7. Checklist
- [ ] types, client block, hooks
- [ ] permissions resolver (`app_messages`)
- [ ] list page: filter + search + toggle + delete confirm
- [ ] create / edit pages + form with AR/EN validation
- [ ] routes + menu item (en/ar names)
- [ ] 422 errors mapped to fields; 403/404 states
