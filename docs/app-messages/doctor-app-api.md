# Doctor (Partner) App — Random App Message API

> For the **doctor app** developer. The app requests one random active message from the
> server and shows it, for example as a card on the home screen. Admins write the messages in the
> dashboard in Arabic and English. The server returns **only the language the app asks for**.

---

## 1. Endpoint

```
GET /api/doctor-mobile/app-messages/random
```

> Same base path and Sanctum auth as the other doctor-app endpoints (e.g. `motivation/today`).

### Headers

| Header | Value | Notes |
|--------|-------|-------|
| `Authorization` | `Bearer <doctor token>` | required |
| `Accept` | `application/json` | |
| `language` or `Accept-Language` | `ar` \| `en` | the app's current language (`language` wins if both are sent). Anything not starting with `ar` → `en` |

### Query params

| Param | Type | Required | Notes |
|-------|------|----------|-------|
| `exclude_id` | int | no | id of the message currently on screen, so the next call returns a different one. If that is the only active message, it is returned anyway. |

## 2. Responses

### 200 — a message exists
```json
{
  "data": {
    "id": 7,
    "title": "Have a great day",
    "description": "Your patients are waiting for you. Keep up the great work!"
  },
  "message": "Message fetched successfully"
}
```
`title` and `description` are **plain strings** in the requested language, not `{ar, en}` objects.

### 200 — no active messages
```json
{ "data": null, "message": "No messages available" }
```
→ Hide the message card. **This is not an error.**

### Errors
| Status | When | App behavior |
|--------|------|--------------|
| 401 | token missing or expired | the app's normal re-login flow |
| 5xx / network | — | hide the card silently; do not block the screen |

## 3. Model (Dart example)

```dart
class AppMessage {
  final int id;
  final String title;
  final String description;

  AppMessage({required this.id, required this.title, required this.description});

  factory AppMessage.fromJson(Map<String, dynamic> j) => AppMessage(
        id: j['id'] as int,
        title: j['title'] as String? ?? '',
        description: j['description'] as String? ?? '',
      );
}

// data may be null
final msg = res['data'] == null ? null : AppMessage.fromJson(res['data']);
```

## 4. Behavior rules

1. Call the endpoint when the screen that shows the message opens (for example the home screen). Use pull-to-refresh
   if the screen has it. Don't poll.
2. When calling again while a message is on screen, send `exclude_id=<current id>`.
3. **When the user changes the app language**, call again with the new `Accept-Language`.
   Don't translate on the device; the server returns the right text.
4. The server returns only active messages. If the admin deactivates a message, it stops appearing on the next call.
5. Text length: title ≤ 150 characters, description ≤ 1000 characters. Allow the description to wrap
   (or clamp to ~4 lines with "read more").
6. Use `Directionality` from the app locale (RTL for `ar`).

## 5. Checklist
- [ ] API call with `Accept-Language` + optional `exclude_id`
- [ ] `AppMessage` model, null-safe `data`
- [ ] message card UI (AR RTL / EN LTR)
- [ ] hide the card on `data: null` or error
- [ ] refetch on language change / pull-to-refresh
