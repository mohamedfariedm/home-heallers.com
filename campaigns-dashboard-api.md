# Campaigns — Dashboard (Admin) API Contract

Backend CRUD for the campaign registry. The dashboard section is a normal admin CRUD screen on top of these endpoints. There is no mobile API in this phase.

Campaigns are not branches. There is no `center_id`. `status` is a label only: pausing or completing a campaign does not stop leads, bookings, or any other existing flow. `budget` is a planned amount in **SAR**, never actual spend. Do not add analytics, attribution, UTM, ROI, or spending UI.

---

## Conventions

- **Base URL:** `/api/admin`
- **Auth:** `Authorization: Bearer <admin token>` (Sanctum). No token → `401`.
- **Permission:** `campaigns` on every read and write. Missing → `403`.
- **Envelope:** `{ "message": "...", "data": ... }`. The list also includes Laravel `links` and `meta`.
- **Validation:** `422` `{ "message": "...", "errors": { "field": ["..."] } }`. Show `errors` inline on the matching field.
- **Writes:** `POST` create, `PUT` or `PATCH` update. Update is partial: omitted fields stay as they are.
- **Dates:** `YYYY-MM-DD`.
- **Money:** `budget` is a decimal string with two places, or `null`. Always display it with the returned `currency` (`SAR`) and the helper text “Planned budget, not actual spend.”

---

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/campaigns` | Paginated list. Search, status, platform, sort |
| GET | `/campaigns/{id}` | One campaign |
| POST | `/campaigns` | Create |
| PUT / PATCH | `/campaigns/{id}` | Partial update |
| DELETE | `/campaigns/{id}` | Soft delete |

There is no restore endpoint. A deleted campaign disappears from the list and detail, and its source key stays reserved.

---

## Campaign object

```jsonc
{
  "id": 12,
  "name": "Ramadan Home Visits",
  "source_campaign": "ramadan 2026",
  "platform": "meta",          // or null
  "start_date": "2026-03-01",  // or null
  "end_date": "2026-03-30",    // or null
  "budget": "1500.50",         // or null. Planned SAR, not spend
  "currency": "SAR",
  "status": "active",
  "description": "Planned March push", // or null
  "created_at": "2026-11-14 10:00:00",
  "updated_at": "2026-11-14 10:05:00"
}
```

### `status`

| Value | Suggested label |
|-------|-----------------|
| `draft` | Draft |
| `active` | Active |
| `paused` | Paused |
| `completed` | Completed |

Omitted on create → `draft`. These values do not gate any operational flow. Do not disable other screens when a campaign is paused or completed.

### `platform` (optional)

| Value | Suggested label |
|-------|-----------------|
| `meta` | Meta |
| `google` | Google |
| `tiktok` | TikTok |
| `website` | Website |
| `application` | Application |
| `other` | Other |

Empty selection is stored as `null`. Platform does not control attribution.

### `source_campaign`

Stored normalized:

- leading and trailing whitespace removed
- repeated internal spaces collapsed to one space
- lowercased

`Ramadan   2026` and ` ramadan 2026 ` are the same key: `ramadan 2026`. The display name is `name`. Changing `name` never changes `source_campaign`.

---

## Screens

### List

Columns: name, source campaign, platform, start date, end date, budget (SAR), status, updated date, actions.

- Search box matches **name or source key**.
- Filters: status, platform. Combine them with search.
- Sortable fields: `name`, `source_campaign`, `platform`, `start_date`, `end_date`, `budget`, `status`, `updated_at`, `created_at`. Default is `updated_at` descending.
- Row actions: view, edit, delete. Delete asks for confirmation first.
- States the screen must render: loading, empty, error, and permission denied (`403`).
- Do not show analytics, lead counts, reservation counts, or a spend figure.

```
GET /api/admin/campaigns?search=ramadan&status=active&platform=meta&sort=name&direction=asc&limit=20&page=1
```

| Query | Notes |
|-------|-------|
| `search` | Optional. Name or source key |
| `status` | Optional. One of the status values |
| `platform` | Optional. One of the platform values |
| `sort` | Optional. Default `updated_at` |
| `direction` | `asc` or `desc`. Default `desc` |
| `limit` | Optional. Default 20, max 100 |
| `page` | Optional. Default 1 |

**200**

```jsonc
{
  "message": "Campaigns fetched successfully",
  "data": [ { /* campaign */ } ],
  "links": { "first": "...", "last": "...", "prev": null, "next": null },
  "meta": { "current_page": 1, "last_page": 1, "per_page": 20, "total": 1 }
}
```

An unknown `status`, `platform`, `sort`, or `direction` is `422`.

### Create / edit

Required and marked as required: `name`, `source_campaign`. On create, `status` may be omitted (`draft`).

| Field | Create | Edit |
|-------|--------|------|
| `name` | required, max 255 | optional; empty is rejected |
| `source_campaign` | required, max 255, unique after normalization | optional; a real change needs confirmation (below) |
| `platform` | optional | optional; send `null` or `""` to clear |
| `start_date` | optional `YYYY-MM-DD` | optional; send `null` to clear |
| `end_date` | optional; on/after start when both exist | same, compared with the stored start/end when only one side is sent |
| `budget` | optional, ≥ 0, up to 2 decimal places, max `9999999999.99` | optional; send `null` to clear |
| `status` | optional, default `draft` | optional |
| `description` | optional, max 5000 | optional; send `null` or `""` to clear |

Validate in the form, then show backend `errors` on the field if the API returns `422`. Keep the existing unsaved-changes guard if the dashboard already uses one on other forms.

**Create 201**

```jsonc
{
  "message": "Campaign created successfully",
  "data": { /* campaign */ }
}
```

**Update 200**

```jsonc
{
  "message": "Campaign updated successfully",
  "data": { /* campaign */ }
}
```

When the source key actually changes, `message` is:

`Campaign updated successfully. Changing the source key may affect future attribution.`

### Source key warning

On an existing campaign, if the user edits `source_campaign` to a different normalized value:

1. Show a warning before save: future attribution may be affected. This phase does not migrate existing leads or reservations.
2. Send the new key only after the user confirms, with `confirm_source_campaign_change: true`.
3. Without that flag the API returns `422` on `source_campaign` and does not save the key.
4. Sending the same key (including different case or surrounding spaces) does not need the flag.
5. Saving a new `name` alone must not send a changed `source_campaign`.

```jsonc
{
  "source_campaign": "new key",
  "confirm_source_campaign_change": true
}
```

### Details

Show the campaign fields and status. Actions: Edit and Delete, only if the user has `campaigns`. No analytics block and no fabricated spend.

**200** `{ "message": "Campaign fetched successfully", "data": { /* campaign */ } }`

**404** `{ "message": "Campaign not found" }` for a missing or already deleted id.

### Delete

Confirm in the UI, then:

```
DELETE /api/admin/campaigns/{id}
```

**200** `{ "message": "Campaign deleted successfully" }`

The row is soft-deleted. Leads, reservations, and statistics are not deleted or rewritten. After success, leave the list (the row is gone) or the previous screen. Do not offer Restore.

---

## Corner cases

| Case | API behavior | Dashboard |
|------|----------------|-----------|
| Name or source key empty / spaces only | `422` | Keep the user on the form |
| Same key with different case or extra spaces | Second create is `422`. The stored key is the normalized one | Show the `source_campaign` error |
| Key used by a soft-deleted campaign | `422`. The key stays reserved | Show the API error. Do not offer reuse |
| End date before start date | `422` on `end_date`. Same calendar day is valid | Inline error |
| Only one of the two dates | Valid | Allow empty on either side |
| Edit start date past the stored end date | `422` even if end date was not in the payload | Inline error |
| Negative budget | `422` | Inline error |
| Budget `0` | Valid. Display `0.00 SAR` | Still label it as planned budget |
| Budget empty | Stored `null` | Show an empty budget, not `0` and not spend |
| More than 2 decimal places | `422` | Inline error |
| Unknown status or platform | `422` | Use the lists above; do not free-type |
| Status `paused` or `completed` | Saved as a label only | No extra blocking UI |
| Rename only | Source key unchanged | Do not show the source-key warning |
| Source key change without confirmation | `422`, key unchanged | Warning dialog, then resend with the flag |
| Delete | Campaign hidden; leads and reservations untouched | Confirmation dialog, then remove the row |
| `401` | Not logged in | Existing auth redirect |
| `403` | Authenticated without `campaigns` | Permission-denied state. Hide create, edit, and delete |
| `404` | Missing or deleted id | Not-found state |
| Empty list | `200` with `data: []` | Empty state |
| Request failure | Network / `5xx` | Error state with retry |

---

## Out of scope

Do not build campaign analytics, lead or reservation attribution, spending entries, ad-platform integrations, UTM fields, ROI/ROAS, reports, or backfills. Do not change the existing lead, reservation, or statistics screens as part of this section.
