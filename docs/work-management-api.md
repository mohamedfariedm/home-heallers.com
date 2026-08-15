# Work Management API Contract

> Frontend integration guide for the **Work Management** module (admin dashboard).
>
> Backend status: **Live** — all endpoints below are implemented under `/api/admin/work`.
>
> A frontend developer should be able to wire the module from this document alone.

---

## Table of Contents

1. [Overview](#overview)
2. [Base URL & Conventions](#base-url--conventions)
3. [Authentication & Permissions](#authentication--permissions)
4. [Domain Model](#domain-model)
5. [Enums & Workflows](#enums--workflows)
6. [API Endpoints](#api-endpoints)
   - [Departments](#departments)
   - [Projects](#projects)
   - [Work Items](#work-items)
   - [Comments](#comments)
   - [Attachments](#attachments)
   - [Activity Feed](#activity-feed)
   - [Work Logs](#work-logs)
   - [Links & Subtasks](#links--subtasks)
   - [Saved Views](#saved-views)
   - [Notifications (work module)](#notifications-work-module)
   - [Workflows](#workflows)
   - [Dashboard KPIs](#dashboard-kpis)
7. [Attachment Upload Flow](#attachment-upload-flow)
8. [Global Dashboard Notifications (bell icon)](#global-dashboard-notifications-bell-icon)
9. [Business Rules (server-enforced)](#business-rules-server-enforced)
10. [Pagination & List Response Shape](#pagination--list-response-shape)
11. [TypeScript Interfaces](#typescript-interfaces)
12. [Frontend Integration Checklist](#frontend-integration-checklist)
13. [Error Handling](#error-handling)

---

## Overview

Work Management is a Jira-like module for internal admin users:

```
Department → Project → Work Item
                          ├── Comments (+ @mentions)
                          ├── Attachments (metadata; bytes via existing upload API)
                          ├── Work Logs
                          ├── Links (blocks / blocked_by / related_to / duplicate_of)
                          ├── Activity (server-generated audit)
                          ├── Subtasks (parent_id)
                          └── Notifications
```

**Switch from mock to live API:**

Set `NEXT_PUBLIC_WM_BACKEND=laravel` and point API calls to `/api/admin/work/...`.

---

## Base URL & Conventions

| Item | Value |
|------|-------|
| Base URL | `/api/admin` |
| Work prefix | `/api/admin/work` |
| Auth header | `Authorization: Bearer {token}` |
| Content-Type | `application/json` |
| Field casing | **snake_case** in all JSON (backend returns snake_case; map to camelCase in your adapter if needed) |
| Timestamps | ISO 8601 strings (e.g. `2026-08-15T10:00:00.000000Z`) |
| Dates | `YYYY-MM-DD` for date-only fields (`due_date`, work log `date`, project dates) |
| Single-resource responses | Wrapped in `{ data: [item], message: "..." }` (array with one element) |
| List responses | `{ data: [...], meta: {...}, links: {...}, message: "..." }` |
| KPI response | `{ data: { ...kpis }, message: "..." }` |
| Delete responses | `{ message: "..." }` only |

---

## Authentication & Permissions

Login: `POST /api/admin/login` → returns `data.permissions[]` (Spatie permission objects with `name` field).

Work Management permission names (guard: `web`):

| Permission | Used for |
|------------|----------|
| `work_items.view` | List/read work items, comments, attachments, activity, links, children, workflows |
| `work_items.create` | Create work items |
| `work_items.update` | Update work items, work logs, links |
| `work_items.delete` | Delete work items |
| `work_items.assign` | Assign / unassign |
| `work_items.change_status` | Status transitions (Kanban drag + detail panel) |
| `projects.manage` | Create/update projects; see `next_sequence` on project |
| `departments.manage` | Create/update/archive departments; upsert workflows |
| `comments.create` | Add comments |
| `attachments.create` | Link attachment metadata; delete attachments |
| `reports.view` | Dashboard KPIs |

Missing permission → `403 Forbidden`.

---

## Domain Model

### Hierarchy

| Entity | Key fields |
|--------|------------|
| **Department** | `id`, `name`, `manager_id`, `member_ids[]`, `status`, `workflow_id` |
| **Project** | `id`, `key` (e.g. `CARE`), `name`, `department_id`, `owner_id`, `member_ids[]`, `status`, `workflow_id`, `next_sequence` |
| **Work Item** | `id`, `key` (e.g. `CARE-142`), `title`, `type`, `status`, `priority`, `project_id`, `assignee_id`, `estimate`, `bug`, `tags`, `parent_id` |

### Work item key format

`{PROJECT_KEY}-{sequence}` — e.g. `CARE-1`, `CARE-2`. Sequence is per-project, atomic on the server.

---

## Enums & Workflows

### Static enums

| Field | Values |
|-------|--------|
| Department status | `active`, `archived` |
| Project status | `active`, `on_hold`, `completed`, `archived` |
| Work item type | `task`, `bug`, `story`, `improvement` |
| Priority | `critical`, `high`, `medium`, `low` |
| Bug severity | `blocker`, `critical`, `major`, `minor`, `trivial` |
| Link type | `blocks`, `blocked_by`, `related_to`, `duplicate_of` |

### Workflow-driven statuses

`status` is **not** a fixed enum — it depends on the resolved workflow:

```
project.workflow_id → department.workflow_id → wf-default-dev
```

Fetch workflow for a project: `GET /work/projects/{projectId}/workflow`

#### Seeded workflows

| ID | Name | Statuses |
|----|------|----------|
| `wf-default-dev` | Development | `new`, `in_progress`, `ready_to_test`, `testing`, `done`, `blocked`, `reopened`, `cancelled` |
| `wf-hr` | HR | `new`, `under_review`, `approved`, `completed`, `cancelled` |
| `wf-support` | Support | `open`, `investigating`, `waiting_customer`, `resolved`, `closed`, `cancelled` |

**Frontend must:**
- Render Kanban columns from `workflow.statuses`
- Only offer transitions listed in `workflow.transitions[currentStatus]`
- Use `POST /work/items/{id}/transition` for both Kanban drag and detail status change

Example transitions (`wf-default-dev`):

```json
{
  "new": ["in_progress", "blocked", "cancelled"],
  "in_progress": ["ready_to_test", "blocked", "cancelled", "new"],
  "ready_to_test": ["testing", "in_progress", "cancelled"],
  "testing": ["done", "reopened", "ready_to_test"],
  "done": ["reopened"],
  "blocked": ["new", "in_progress", "cancelled"],
  "reopened": ["in_progress", "ready_to_test", "cancelled"],
  "cancelled": ["new", "reopened"]
}
```

Illegal transition → `422` with `{ "message": "...", "errors": { "to_status": ["Illegal status transition."] } }`.

---

## API Endpoints

### Departments

| Method | Path | Permission |
|--------|------|------------|
| `GET` | `/work/departments` | `departments.manage` **or** `work_items.view` |
| `GET` | `/work/departments/{id}` | same |
| `POST` | `/work/departments` | `departments.manage` |
| `PATCH` | `/work/departments/{id}` | `departments.manage` |
| `POST` | `/work/departments/{id}/archive` | `departments.manage` |

**Create / Update body:**

```json
{
  "name": "Engineering",
  "description": "Product engineering",
  "manager_id": 1,
  "member_ids": [1, 2, 3],
  "workflow_id": "wf-default-dev",
  "status": "active"
}
```

**Response item:**

```json
{
  "id": 1,
  "name": "Engineering",
  "description": "Product engineering",
  "manager_id": 1,
  "member_ids": [1, 2, 3],
  "status": "active",
  "workflow_id": "wf-default-dev",
  "created_at": "2026-08-08T10:00:00.000000Z",
  "updated_at": "2026-08-08T10:00:00.000000Z"
}
```

**List filters:** `?status=active`, `?q=search term`, `?limit=50&page=1`

---

### Projects

| Method | Path | Permission |
|--------|------|------------|
| `GET` | `/work/projects` | `projects.manage` **or** `work_items.view` |
| `GET` | `/work/projects/{id}` | same |
| `POST` | `/work/projects` | `projects.manage` |
| `PATCH` | `/work/projects/{id}` | `projects.manage` |
| `GET` | `/work/projects/{projectId}/workflow` | `work_items.view` |

**Create body:**

```json
{
  "key": "CARE",
  "name": "Care Platform",
  "description": "...",
  "department_id": 1,
  "owner_id": 1,
  "member_ids": [1, 2, 3],
  "start_date": "2026-01-01",
  "due_date": "2026-12-31",
  "status": "active",
  "workflow_id": null
}
```

- `key` must match `^[A-Z][A-Z0-9]{1,9}$`, unique, **immutable** after create.
- `next_sequence` is server-managed (visible only with `projects.manage` permission).

**List filters:** `?department_id=1`, `?status=active`, `?q=search`

---

### Work Items

| Method | Path | Permission |
|--------|------|------------|
| `GET` | `/work/items` | `work_items.view` |
| `GET` | `/work/items/{idOrKey}` | `work_items.view` |
| `POST` | `/work/items` | `work_items.create` |
| `PATCH` | `/work/items/{id}` | `work_items.update` |
| `DELETE` | `/work/items/{id}` | `work_items.delete` |
| `POST` | `/work/items/{id}/assign` | `work_items.assign` |
| `POST` | `/work/items/{id}/transition` | `work_items.change_status` |
| `GET` | `/work/items/{id}/children` | `work_items.view` |

#### List filters (query params)

| Param | Type | Notes |
|-------|------|-------|
| `q` | string | Search key, title, description, tags |
| `project_id` | number | |
| `department_id` | number | |
| `type` | enum | `task`, `bug`, `story`, `improvement` |
| `status` | string | Workflow-specific status slug |
| `priority` | enum | |
| `assignee_id` | number | |
| `reporter_id` | number | |
| `my_work` | `1` | Assignee = current user |
| `unassigned` | `1` | `assignee_id` is null |
| `overdue` | `1` | Due date passed, not in terminal status |
| `due_from` / `due_to` | date | `YYYY-MM-DD` |
| `created_from` / `created_to` | date | `YYYY-MM-DD` |
| `parent_id` | number | Subtasks of this parent |
| `tags[]` | string[] | Repeat param or array |
| `limit` / `page` | number | Pagination |

#### Create body

```json
{
  "title": "Implement checkout API",
  "description": "...",
  "type": "task",
  "priority": "high",
  "project_id": 1,
  "assignee_id": 2,
  "due_date": "2026-08-15",
  "tags": ["api", "checkout"],
  "parent_id": null,
  "estimate": {
    "original_hours": 8,
    "remaining_hours": 8,
    "completed_hours": 0
  },
  "bug": {
    "steps_to_reproduce": "...",
    "expected_result": "...",
    "actual_result": "...",
    "environment": "Staging",
    "severity": "major"
  }
}
```

Server sets: `key`, `department_id`, `reporter_id`, `created_by_id`, initial `status` (from workflow).

- `bug` object only when `type = bug`.
- `parent_id` must belong to the **same project** (422 if not).

#### Update body

Same fields as create (except `project_id`, `assignee_id`). Use dedicated assign/transition endpoints for those.

Updating writes an activity row: `"Admin User updated CARE-1 (priority, due_date)"`.

#### Assign body

```json
{ "assignee_id": 2 }
```

Use `assignee_id: null` to unassign. Assignee must be project member, department member, project owner, or department manager.

#### Transition body

```json
{ "to_status": "in_progress" }
```

#### Work item response

```json
{
  "id": 101,
  "key": "CARE-101",
  "title": "Implement checkout API",
  "description": "...",
  "type": "task",
  "status": "in_progress",
  "priority": "high",
  "project_id": 1,
  "department_id": 1,
  "reporter_id": 1,
  "assignee_id": 2,
  "created_by_id": 1,
  "due_date": "2026-08-15T00:00:00.000000Z",
  "estimate": {
    "original_hours": 8,
    "remaining_hours": 3,
    "completed_hours": 5
  },
  "tags": ["api"],
  "parent_id": null,
  "bug": null,
  "created_at": "...",
  "updated_at": "..."
}
```

**Lookup by key:** `GET /work/items/CARE-101` works (numeric id also works).

---

### Comments

| Method | Path | Permission / Auth |
|--------|------|-------------------|
| `GET` | `/work/items/{id}/comments` | `work_items.view` |
| `POST` | `/work/items/{id}/comments` | `comments.create` |
| `PATCH` | `/work/comments/{commentId}` | Author only |
| `DELETE` | `/work/comments/{commentId}` | Author only |

**Create body:**

```json
{ "body": "Started work. @Mohamed Ali please review" }
```

**Response:**

```json
{
  "id": 5,
  "work_item_id": 101,
  "author_id": 1,
  "body": "Started work. @Mohamed Ali please review",
  "mention_ids": [2],
  "created_at": "...",
  "updated_at": "..."
}
```

**Mention parsing:**
- Format: `@Display Name` in comment body.
- Server matches against **project members, department members, reporter, and assignee** only (not all users).
- Matched user IDs stored in `mention_ids`; mentioned users receive notifications.

Non-author edit/delete → `403`.

---

### Attachments

Metadata only — file bytes use the existing upload API (see [Attachment Upload Flow](#attachment-upload-flow)).

| Method | Path | Permission |
|--------|------|------------|
| `GET` | `/work/items/{id}/attachments` | `work_items.view` |
| `POST` | `/work/items/{id}/attachments` | `attachments.create` |
| `DELETE` | `/work/attachments/{attachmentId}` | `attachments.create` or uploader |

**Link metadata body (after upload):**

```json
{
  "name": "screenshot.png",
  "mime_type": "image/png",
  "size": 245001,
  "original": "https://cdn.../screenshot.png",
  "thumbnail": "https://cdn.../screenshot_thumb.png",
  "server_attachment_id": 987
}
```

**Response:**

```json
{
  "id": 1,
  "work_item_id": 101,
  "name": "screenshot.png",
  "mime_type": "image/png",
  "size": 245001,
  "original": "https://...",
  "thumbnail": "https://...",
  "server_attachment_id": 987,
  "uploaded_by_id": 1,
  "created_at": "...",
  "updated_at": "..."
}
```

---

### Activity Feed

| Method | Path | Permission |
|--------|------|------------|
| `GET` | `/work/items/{id}/activities` | `work_items.view` |

**Do not invent history on the frontend.** Server generates messages like:

```
Admin User created CARE-152
Admin User assigned CARE-152 to Mohamed Ali
Mohamed Ali changed new → in_progress
Admin User updated CARE-152 (priority)
Admin User deleted CARE-152
```

**Activity actions:** `created`, `assigned`, `unassigned`, `status_changed`, `reopened`, `updated`, `deleted`, `comment_added`, `attachment_added`, `work_logged`, `link_added`

**Response item:**

```json
{
  "id": 1,
  "work_item_id": 101,
  "action": "status_changed",
  "actor_id": 2,
  "message": "Mohamed Ali changed new → in_progress",
  "meta": null,
  "created_at": "...",
  "updated_at": "..."
}
```

For `updated` actions, `meta.changed_fields` contains the list of changed field names.

---

### Work Logs

| Method | Path | Permission |
|--------|------|------------|
| `GET` | `/work/items/{id}/work-logs` | `work_items.view` |
| `POST` | `/work/items/{id}/work-logs` | `work_items.update` |

**Create body:**

```json
{
  "hours": 2,
  "date": "2026-08-08",
  "description": "Implemented payment validation"
}
```

On create: server increases `estimate.completed_hours`, decreases `estimate.remaining_hours` (floors at 0), writes `work_logged` activity.

Estimates can also be updated via `PATCH /work/items/{id}` with an `estimate` object.

---

### Links & Subtasks

| Method | Path | Permission |
|--------|------|------------|
| `GET` | `/work/items/{id}/links` | `work_items.view` |
| `POST` | `/work/items/{id}/links` | `work_items.update` |
| `DELETE` | `/work/links/{linkId}` | `work_items.update` |
| `GET` | `/work/items/{id}/children` | `work_items.view` |

**Create link body:**

```json
{
  "target_id": 119,
  "type": "blocked_by"
}
```

- `blocks` / `blocked_by` auto-create the inverse link on the server.
- Self-links rejected with `422`.
- Deleting a link removes its inverse too.

**Subtasks:** set `parent_id` on create/update. `GET .../children` returns items where `parent_id = {id}`.

---

### Saved Views

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/work/saved-views` | Current user |
| `POST` | `/work/saved-views` | Current user |
| `DELETE` | `/work/saved-views/{id}` | Owner only |

**Create body:**

```json
{
  "name": "My Open Bugs",
  "filters": {
    "type": "bug",
    "status": "new",
    "priority": "critical"
  }
}
```

`filters` is an opaque JSON object — store the same keys you pass to `GET /work/items`.

---

### Notifications (work module)

Dedicated inbox for work events. Separate from the global admin bell (see below).

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/work/notifications` | Current user |
| `POST` | `/work/notifications/{id}/read` | Owner only |
| `POST` | `/work/notifications/read-all` | Current user |

**Response item:**

```json
{
  "id": 1,
  "user_id": 2,
  "type": "assigned",
  "title": "Work item assigned",
  "body": "You were assigned to CARE-101: Implement checkout API",
  "work_item_id": 101,
  "read_at": null,
  "created_at": "...",
  "updated_at": "..."
}
```

**Notification types:** `assigned`, `mentioned`, `status_changed`, `reopened`, `commented`, `due_soon`

Cross-user read → `403`.

---

### Workflows

| Method | Path | Permission |
|--------|------|------------|
| `GET` | `/work/workflows` | `work_items.view` |
| `GET` | `/work/workflows/{id}` | `work_items.view` |
| `GET` | `/work/projects/{projectId}/workflow` | `work_items.view` |
| `PUT` | `/work/workflows/{id}` | `departments.manage` |

**Workflow response:**

```json
{
  "id": "wf-default-dev",
  "name": "Development",
  "statuses": ["new", "in_progress", "ready_to_test", "testing", "done", "blocked", "reopened", "cancelled"],
  "transitions": {
    "new": ["in_progress", "blocked", "cancelled"]
  },
  "created_at": "...",
  "updated_at": "..."
}
```

---

### Dashboard KPIs

| Method | Path | Permission |
|--------|------|------------|
| `GET` | `/work/dashboard/kpis` | `reports.view` |

**Response (`data` object):**

```json
{
  "open_work": 12,
  "in_progress": 4,
  "ready_to_test": 2,
  "overdue": 1,
  "critical_bugs": 3,
  "completed_this_week": 5,
  "by_status": [{ "status": "new", "count": 3 }],
  "by_severity": [{ "severity": "major", "count": 2 }],
  "by_department": [{ "department_id": 1, "name": "Engineering", "count": 8 }],
  "by_assignee": [{ "user_id": 2, "name": "Mohamed Ali", "count": 4 }],
  "completed_trend": [{ "date": "2026-08-02", "count": 1 }]
}
```

KPI clicks should open filtered `/work/items` using the list filters — no special endpoint needed.

---

## Attachment Upload Flow

Two-step process:

### Step 1 — Upload file bytes (existing API)

```
POST /api/admin/attachments
Content-Type: multipart/form-data
Authorization: Bearer {token}

Field: attachment[]  (array of files)
```

**Response:**

```json
{
  "status": 200,
  "msg": "The Attachments List",
  "data": [
    {
      "id": 987,
      "original": "https://.../file.png",
      "thumbnail": "https://.../file_thumb.png"
    }
  ]
}
```

### Step 2 — Link metadata to work item

```
POST /api/admin/work/items/{workItemId}/attachments
```

```json
{
  "name": "file.png",
  "mime_type": "image/png",
  "size": 245001,
  "original": "https://.../file.png",
  "thumbnail": "https://.../file_thumb.png",
  "server_attachment_id": 987
}
```

---

## Global Dashboard Notifications (bell icon)

Work events **also** push into the existing admin notification bell at `/api/admin/dashboard-notifications`.

When a work notification is created (assign, mention, status change, comment, due soon), the backend:

1. Writes to `wm_notifications` (work module inbox above)
2. Writes to Laravel `notifications` table (global bell)
3. Sends FCM web push if the user has registered push tokens

**Global bell API** (already documented in `docs/frontend-dashboard-notifications-guide.md`):

| Method | Path |
|--------|------|
| `GET` | `/api/admin/dashboard-notifications` |
| `GET` | `/api/admin/dashboard-notifications/unread-count` |
| `POST` | `/api/admin/dashboard-notifications/{id}/mark-as-read` |
| `POST` | `/api/admin/dashboard-notifications/mark-all-as-read` |

Work notification events appear with `event` / `type` like `work.assigned`, `work.mentioned`, etc.

**Click action:** `{ type: "route", entity: "work_item", id: 101 }`  
Resolves to: `{FIREBASE_WEB_CLICK_BASE_URL}/work_item/101`

You can show work notifications in **either** inbox (or both). Recommended:
- Work module page → use `/work/notifications`
- Global admin header bell → use `/dashboard-notifications` (includes work events)

---

## Business Rules (server-enforced)

The frontend should mirror these for good UX, but the server is authoritative:

1. Archived departments cannot receive new projects or work items.
2. Archived projects cannot receive new work items.
3. Project key unique, regex `^[A-Z][A-Z0-9]{1,9}$`, immutable after create.
4. Assignee must be project/department member (or owner/manager), or `null`.
5. Status transitions must follow workflow map → illegal = `422`.
6. Kanban drag and detail status change use the **same** `POST .../transition` endpoint.
7. Comments: author-only edit/delete.
8. Mentions: `@Name` matched against project/dept members + reporter/assignee.
9. `parent_id` must be in the same project.
10. `blocks`/`blocked_by` links auto-create inverse; self-links rejected.
11. Activity/audit, status history, assignment history written server-side on every mutation.

---

## Pagination & List Response Shape

All list endpoints support `?limit=` (default 100) and `?page=`.

```json
{
  "data": [ /* items */ ],
  "links": {
    "first": "...",
    "last": "...",
    "prev": null,
    "next": "..."
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 3,
    "per_page": 100,
    "to": 100,
    "total": 250
  },
  "message": "Work items fetched successfully"
}
```

---

## TypeScript Interfaces

```typescript
// Adapter: map snake_case API → camelCase app types

interface Department {
  id: number;
  name: string;
  description: string | null;
  manager_id: number | null;
  member_ids: number[];
  status: 'active' | 'archived';
  workflow_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: number;
  key: string;
  name: string;
  description: string | null;
  department_id: number;
  owner_id: number | null;
  member_ids: number[];
  start_date: string | null;
  due_date: string | null;
  status: 'active' | 'on_hold' | 'completed' | 'archived';
  workflow_id: string | null;
  next_sequence?: number; // only with projects.manage
  created_at: string;
  updated_at: string;
}

interface WorkItemEstimate {
  original_hours: number;
  remaining_hours: number;
  completed_hours: number;
}

interface WorkItemBug {
  steps_to_reproduce?: string;
  expected_result?: string;
  actual_result?: string;
  environment?: string;
  severity?: 'blocker' | 'critical' | 'major' | 'minor' | 'trivial';
}

interface WorkItem {
  id: number;
  key: string;
  title: string;
  description: string | null;
  type: 'task' | 'bug' | 'story' | 'improvement';
  status: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  project_id: number;
  department_id: number;
  reporter_id: number;
  assignee_id: number | null;
  created_by_id: number;
  due_date: string | null;
  estimate: WorkItemEstimate | null;
  tags: string[];
  parent_id: number | null;
  bug: WorkItemBug | null;
  created_at: string;
  updated_at: string;
}

interface Comment {
  id: number;
  work_item_id: number;
  author_id: number;
  body: string;
  mention_ids: number[];
  created_at: string;
  updated_at: string;
}

interface WorkAttachment {
  id: number;
  work_item_id: number;
  name: string;
  mime_type: string | null;
  size: number | null;
  original: string | null;
  thumbnail: string | null;
  server_attachment_id: number | null;
  uploaded_by_id: number;
  created_at: string;
  updated_at: string;
}

interface Activity {
  id: number;
  work_item_id: number;
  action: string;
  actor_id: number;
  message: string;
  meta: { changed_fields?: string[] } | null;
  created_at: string;
  updated_at: string;
}

interface WorkLog {
  id: number;
  work_item_id: number;
  user_id: number;
  hours: number;
  date: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface WorkItemLink {
  id: number;
  source_id: number;
  target_id: number;
  type: 'blocks' | 'blocked_by' | 'related_to' | 'duplicate_of';
  created_by_id: number;
  created_at: string;
  updated_at: string;
}

interface SavedView {
  id: number;
  user_id: number;
  name: string;
  filters: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

interface WorkNotification {
  id: number;
  user_id: number;
  type: 'assigned' | 'mentioned' | 'status_changed' | 'reopened' | 'commented' | 'due_soon';
  title: string;
  body: string | null;
  work_item_id: number | null;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

interface Workflow {
  id: string;
  name: string;
  statuses: string[];
  transitions: Record<string, string[]>;
  created_at: string;
  updated_at: string;
}

interface DashboardKpis {
  open_work: number;
  in_progress: number;
  ready_to_test: number;
  overdue: number;
  critical_bugs: number;
  completed_this_week: number;
  by_status: { status: string; count: number }[];
  by_severity: { severity: string; count: number }[];
  by_department: { department_id: number; name: string; count: number }[];
  by_assignee: { user_id: number; name: string; count: number }[];
  completed_trend: { date: string; count: number }[];
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  message: string;
}
```

---

## Frontend Integration Checklist

- [ ] Set `NEXT_PUBLIC_WM_BACKEND=laravel`
- [ ] Map snake_case API responses to camelCase (or use snake_case consistently)
- [ ] Gate UI actions by permission names from login payload
- [ ] Fetch project workflow before rendering Kanban / status dropdown
- [ ] Use `POST /items/{id}/transition` for Kanban drag (not PATCH status)
- [ ] Use `POST /items/{id}/assign` for assignee changes (not PATCH)
- [ ] Support lookup by key: `GET /items/CARE-142`
- [ ] Two-step attachment: upload bytes → link metadata
- [ ] Parse `@Name` mentions in comment composer; show mentionable users from project/dept members
- [ ] Show activity feed from server (never fabricate history)
- [ ] Wire work notifications inbox (`/work/notifications`) and/or global bell
- [ ] KPI cards link to filtered work item list
- [ ] Handle `422` on illegal transitions and invalid assignee/parent

---

## Error Handling

| Status | Meaning |
|--------|---------|
| `401` | Missing/invalid token |
| `403` | Missing permission or not resource owner (comment, saved view, notification) |
| `404` | Resource not found |
| `422` | Validation error — `{ message, errors: { field: ["..."] } }` |

Common 422 cases:
- Duplicate project key
- Assignee not a member
- Illegal status transition
- Parent in different project
- Self-link
- Create under archived department/project

---

*Generated from the live Laravel Work Management backend — Aug 2026.*
