# App Messages — Doctor Mobile API Contract

For the **doctor (partner) app**. Admins write short encouraging messages (title + description) in
Arabic and English from the dashboard. The app asks for **one random active message** and shows it,
for example as a card on the home screen.

The backend returns only **active** messages for doctors, **already resolved to the app language**
(one `title` string and one `description` string).

> This is a **new, separate** endpoint. The existing `GET motivation/today` (one message per day) is
> unchanged. Don't mix the two.

---

## Endpoint

```
GET /api/doctor-mobile/app-messages/random
```

- **Base URL:** `https://development.home-healers.com`
- **Auth:** required, the doctor's Sanctum token (same as the other `doctor-mobile` endpoints).
- **Language:** send the `language` header (`ar` | `en`) like every other endpoint.
  `Accept-Language` also works. If both are sent, `language` is used.
  A value that doesn't start with `ar`, or no header at all, → English.

### Request

```http
GET /api/doctor-mobile/app-messages/random?exclude_id=12
Accept: application/json
Authorization: Bearer <doctor token>
language: ar
```

### Query params

| Param | Type | Required | Notes |
|-------|------|----------|-------|
| `exclude_id` | int | no | id of the message currently on screen. The server returns a **different** message. If that message is the only active one, it is returned anyway. |

---

## Response

**200: a message exists**
```json
{
  "message": "تم جلب الرسالة بنجاح.",
  "data": {
    "id": 12,
    "title": "أنت تصنع الفرق",
    "description": "كل جلسة تقدمها تقرّب مريضك خطوة من حياة أفضل. شكرًا لعطائك."
  }
}
```

Same request with `language: en`:
```json
{
  "message": "Message fetched successfully.",
  "data": {
    "id": 12,
    "title": "You make the difference",
    "description": "Every session you give brings your patient one step closer to a better life. Thank you."
  }
}
```

**200: no active messages**
```json
{ "message": "No messages available.", "data": null }
```
`data: null` is **not an error**. Hide the card.

**401: token missing / expired** → the app's normal re-login flow.

### Fields

| Field | Type | Notes |
|-------|------|-------|
| `data` | object \| null | `null` when there is no active message. |
| `data.id` | int | Stable id. Keep it and send it as `exclude_id` on the next call. |
| `data.title` | string | In the requested language. Never empty (falls back to the other language). Max 150 chars. |
| `data.description` | string | In the requested language. Never empty. Max 1000 chars; may contain line breaks. |

---

## Changes the app needs to make

1. **Model**: add `AppMessage { id, title, description }`.
2. **API call**: add `getRandomAppMessage({int? excludeId})` in the doctor API service/repository,
   using the existing Dio client (it already sends the token and the `language` header).
3. **UI**: add a message card to the home screen (or wherever product decides).
   - Title bold, description underneath, wrapped (or clamped to ~4 lines with "read more").
   - Direction follows the app locale (RTL for `ar`).
   - Optional: a small "refresh" icon that loads another message with `exclude_id`.
4. **State**: hide the card while loading the first time (or show a skeleton), when `data == null`, and on any error.
5. **Language change**: when the user switches the app language, call the endpoint again. Don't translate on the device.

### Dart example

```dart
class AppMessage {
  final int id;
  final String title;
  final String description;

  const AppMessage({required this.id, required this.title, required this.description});

  factory AppMessage.fromJson(Map<String, dynamic> json) => AppMessage(
        id: json['id'] as int,
        title: json['title'] as String? ?? '',
        description: json['description'] as String? ?? '',
      );
}

Future<AppMessage?> getRandomAppMessage({int? excludeId}) async {
  final res = await dio.get(
    '/api/doctor-mobile/app-messages/random',
    queryParameters: {if (excludeId != null) 'exclude_id': excludeId},
  );
  final data = res.data['data'];
  return data == null ? null : AppMessage.fromJson(data as Map<String, dynamic>);
}
```

---

## Scenarios the app must handle

| # | Scenario | App behavior |
|---|----------|--------------|
| 1 | Home opens, message exists | show the card with the returned title/description |
| 2 | `data: null` (admin has no active messages) | hide the card; no empty box, no error |
| 3 | Network error / 5xx / timeout | hide the card silently; never block the home screen |
| 4 | User taps "refresh" / pull-to-refresh | call again with `exclude_id=<current id>` |
| 5 | Only one active message | the same message comes back even with `exclude_id`; this is fine |
| 6 | User switches language | refetch with the new `language` header |
| 7 | Admin deactivates or deletes the message on screen | it disappears on the next call; no special handling |
| 8 | Long description / line breaks | wrap text; respect `\n` |
| 9 | 401 | normal session-expired flow |

---

## Notes

- Don't poll. Call it when the home screen opens and on refresh. Caching is optional.
  If you cache, cache per language and still refresh on the next home open.
- Don't rely on specific ids; the admin can add and delete messages at any time.
- The endpoint is read-only; the app never writes anything back.
- Test data: the backend has a seeder with 50 messages (`AppMessageSeeder`).
