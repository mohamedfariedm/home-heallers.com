# Work Management API Contract

**Audience:** Backend (Laravel) team  
**Frontend status:** Implemented against a mock repository (`localStorage`). Flip to live API with `NEXT_PUBLIC_WM_BACKEND=laravel`.  
**Base path:** `{NEXT_PUBLIC_API_ENDPOINT}` → typically `/api/admin`  
**Auth:** `Authorization: Bearer {auth_token}` (same as existing admin APIs)  
**Response shape:** Prefer Laravel-style `{ data, meta?, message? }`. Frontend will adapt.

---

## 1. Domain model

Hierarchy: **Department → Project → Work Item**

```
Department
  └── Project (key e.g. CARE)
        └── WorkItem (key e.g. CARE-142)
              ├── Comments
              ├── Attachments (files uploaded via existing attachment endpoint)
              ├── WorkLogs
              ├── Links (blocks / blocked_by / related_to / duplicate_of)
              ├── Activity (server-generated audit)
              └── Children (subtasks via parent_id)
```

### Enums

| Field | Values |
|-------|--------|
| Department status | `active`, `archived` |
| Project status | `active`, `on_hold`, `completed`, `archived` |
| Work item type | `task`, `bug`, `story`, `improvement` |
| Priority | `critical`, `high`, `medium`, `low` |
| Bug severity | `blocker`, `critical`, `major`, `minor`, `trivial` |
| Link type | `blocks`, `blocked_by`, `related_to`, `duplicate_of` |
| Default statuses | `new`, `in_progress`, `ready_to_test`, `testing`, `done`, `blocked`, `reopened`, `cancelled` |

Status values can be extended per workflow (HR/Support). Do **not** hardcode only the default set in DB if workflows are configurable.

---

## 2. Business rules (must be server-side)

1. **Archived departments** cannot receive new projects or work items.
2. **Archived projects** cannot receive new work items.
3. **Project key** unique, `^[A-Z][A-Z0-9]{1,9}$` (e.g. `CARE`).
4. **Work item key** = `{PROJECT_KEY}-{sequence}` (e.g. `CARE-142`). Sequence is per-project, atomic increment.
5. **Assignee** must be a member of the project **or** department (or project owner / department manager). `null` = unassigned.
6. **Status transitions** must follow the project/department workflow transition map. Reject illegal transitions with `422`.
7. **Kanban drag** and detail status change must use the **same** transition endpoint/logic.
8. **Every important mutation** writes:
   - Activity/audit row (server-generated message)
   - Status history row (on status change)
   - Assignment history row (on assign/unassign)
9. **Comments:** author can edit/delete only their own comments (soft delete OK).
10. **Mentions:** parse `@Name` in comments → store `mention_ids` → create notifications.
11. **Attachments:** file bytes go to existing attachment upload endpoint; work API only stores metadata + URLs.

---

## 3. Permissions (Spatie)

Seed these permission names (`guard_name: web`):

```
work_items.view
work_items.create
work_items.update
work_items.delete
work_items.assign
work_items.change_status
projects.manage
departments.manage
comments.create
attachments.create
reports.view
```

Return them in the login permissions payload (same as existing Spatie permissions).

---

## 4. Suggested database tables

Minimal set (names illustrative — snake_case OK):

| Table | Notes |
|-------|-------|
| `wm_departments` | name, description, manager_id, status, workflow_id |
| `wm_department_user` | department_id, user_id |
| `wm_projects` | key, name, description, department_id, owner_id, status, start_date, due_date, next_sequence, workflow_id |
| `wm_project_user` | project_id, user_id |
| `wm_work_items` | key, title, description, type, status, priority, project_id, department_id, reporter_id, assignee_id, created_by_id, due_date, parent_id, estimate fields, tags JSON, bug JSON |
| `wm_assignment_history` | work_item_id, from_assignee_id, to_assignee_id, changed_by_id, changed_at |
| `wm_status_history` | work_item_id, from_status, to_status, changed_by_id, changed_at |
| `wm_activities` | work_item_id, action, actor_id, message, meta JSON |
| `wm_comments` | work_item_id, author_id, body, mention_ids JSON, deleted_at |
| `wm_attachments` | work_item_id, name, mime_type, size, url/original, thumbnail, server_attachment_id, uploaded_by_id |
| `wm_work_logs` | work_item_id, user_id, hours, date, description |
| `wm_work_item_links` | source_id, target_id, type, created_by_id |
| `wm_saved_views` | user_id, name, filters JSON |
| `wm_notifications` | user_id, type, title, body, work_item_id, read_at |
| `wm_workflows` | name, statuses JSON, transitions JSON |

---

## 5. Default workflows (seed)

### Development (`wf-default-dev`)

Statuses: `new → in_progress → ready_to_test → testing → done` (+ `blocked`, `reopened`, `cancelled`)

Transitions:

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

### HR (`wf-hr`)

`new → under_review → approved → completed` (+ `cancelled`)

### Support (`wf-support`)

`open → investigating → waiting_customer → resolved → closed` (+ `cancelled`)

Resolve workflow for a work item: **project.workflow_id → department.workflow_id → default Development**.

---

## 6. API endpoints

All under `/work/...` relative to admin API base.

### 6.1 Departments

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/work/departments` | `departments.manage` or `work_items.view` | List departments |
| `GET` | `/work/departments/{id}` | same | Get one |
| `POST` | `/work/departments` | `departments.manage` | Create |
| `PATCH` | `/work/departments/{id}` | `departments.manage` | Update |
| `POST` | `/work/departments/{id}/archive` | `departments.manage` | Set status=`archived` |

**Create/Update body:**

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
  "description": "...",
  "manager_id": 1,
  "member_ids": [1, 2, 3],
  "status": "active",
  "workflow_id": "wf-default-dev",
  "created_at": "2026-08-08T10:00:00.000Z",
  "updated_at": "2026-08-08T10:00:00.000Z"
}
```

---

### 6.2 Projects

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/work/projects` | `projects.manage` or `work_items.view` | List (`?department_id=`) |
| `GET` | `/work/projects/{id}` | same | Get one |
| `POST` | `/work/projects` | `projects.manage` | Create |
| `PATCH` | `/work/projects/{id}` | `projects.manage` | Update |

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

Notes:
- `key` immutable after create (or only Admin can change; frontend currently disables edit of key).
- Initialize `next_sequence = 1`.

---

### 6.3 Work items

| Method | Path | Permission | Description |
|--------|------|------------|-------------|
| `GET` | `/work/items` | `work_items.view` | List + filters |
| `GET` | `/work/items/{idOrKey}` | `work_items.view` | Get by id **or** key (`CARE-142`) |
| `POST` | `/work/items` | `work_items.create` | Create (status starts `new`) |
| `PATCH` | `/work/items/{id}` | `work_items.update` | Update fields |
| `DELETE` | `/work/items/{id}` | `work_items.delete` | Delete |
| `POST` | `/work/items/{id}/assign` | `work_items.assign` | Assign / unassign |
| `POST` | `/work/items/{id}/transition` | `work_items.change_status` | Status change |

#### List filters (query params)

| Param | Type | Notes |
|-------|------|-------|
| `q` | string | Search key/title/description/tags |
| `project_id` | id | |
| `department_id` | id | |
| `type` | enum | |
| `status` | string | |
| `priority` | enum | |
| `assignee_id` | id | |
| `reporter_id` | id | |
| `my_work` | `1` | Alias: assignee = current user |
| `unassigned` | `1` | assignee is null |
| `overdue` | `1` | due_date < now and not done/cancelled |
| `due_from` / `due_to` | ISO date | |
| `created_from` / `created_to` | ISO date | |
| `parent_id` | id | |
| `tags[]` | string[] | |
| `page` / `limit` | pagination | Return `meta.total` |

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

- `bug` required/used only when `type = bug`.
- Server sets: `key`, `department_id` (from project), `reporter_id`, `created_by_id`, `status = new`.
- On create with assignee → write assignment history + notify assignee.

#### Assign body

```json
{
  "assignee_id": 2
}
```

Use `assignee_id: null` to unassign. Validate membership. Write assignment history + activity + notification.

#### Transition body

```json
{
  "to_status": "in_progress"
}
```

Validate against workflow. Write status history + activity. If `to_status = reopened`, activity action = `reopened`. Notify assignee/reporter (except actor).

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
  "due_date": "2026-08-15T00:00:00.000Z",
  "estimate": {
    "original_hours": 8,
    "remaining_hours": 3,
    "completed_hours": 5
  },
  "tags": ["api"],
  "parent_id": 100,
  "bug": null,
  "created_at": "...",
  "updated_at": "..."
}
```

---

### 6.4 Comments

| Method | Path | Permission |
|--------|------|------------|
| `GET` | `/work/items/{id}/comments` | `work_items.view` |
| `POST` | `/work/items/{id}/comments` | `comments.create` |
| `PATCH` | `/work/comments/{commentId}` | own comment |
| `DELETE` | `/work/comments/{commentId}` | own comment |

**Create body:** `{ "body": "Started work. @Sara please review" }`

Server:
- Parse mentions → `mention_ids`
- Activity `comment_added`
- Notify mentioned users + assignee

---

### 6.5 Attachments

**Upload file bytes** (already exists):

`POST {NEXT_PUBLIC_ATTACHMENT_URL}`  
`multipart/form-data` field: `attachment[]`  
Returns `{ data: [{ id, original, thumbnail, ... }] }`

**Link to work item:**

| Method | Path | Permission |
|--------|------|------------|
| `GET` | `/work/items/{id}/attachments` | `work_items.view` |
| `POST` | `/work/items/{id}/attachments` | `attachments.create` |
| `DELETE` | `/work/attachments/{attachmentId}` | `attachments.create` or owner/admin |

**Create body (metadata only):**

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

---

### 6.6 Activity

| Method | Path |
|--------|------|
| `GET` | `/work/items/{id}/activities` |

**Do not** let the frontend invent history. Backend generates messages like:

```
Ahmed Hassan created CARE-152
Ahmed Hassan assigned CARE-152 to Mohamed Ali
Mohamed Ali changed new → in_progress
```

---

### 6.7 Work logs / estimates

| Method | Path |
|--------|------|
| `GET` | `/work/items/{id}/work-logs` |
| `POST` | `/work/items/{id}/work-logs` |

**Body:**

```json
{
  "hours": 2,
  "date": "2026-08-08",
  "description": "Implemented payment validation"
}
```

On create: increase `completed_hours`, decrease `remaining_hours` (floor at 0), write activity `work_logged`.

Estimates also updatable via `PATCH /work/items/{id}` (`estimate` object).

---

### 6.8 Links & subtasks

| Method | Path |
|--------|------|
| `GET` | `/work/items/{id}/links` |
| `POST` | `/work/items/{id}/links` |
| `DELETE` | `/work/links/{linkId}` |
| `GET` | `/work/items/{id}/children` |

**Create link body:**

```json
{
  "target_id": 119,
  "type": "blocked_by"
}
```

When `blocks` / `blocked_by` is created, also create the inverse link (or return both virtually). Reject self-links.

Subtasks: set `parent_id` on create/update. `GET .../children` returns items where `parent_id = {id}`.

---

### 6.9 Saved views

| Method | Path |
|--------|------|
| `GET` | `/work/saved-views` | current user |
| `POST` | `/work/saved-views` | `{ "name": "My Open Bugs", "filters": { ... } }` |
| `DELETE` | `/work/saved-views/{id}` | owner only |

---

### 6.10 Notifications

| Method | Path |
|--------|------|
| `GET` | `/work/notifications` |
| `POST` | `/work/notifications/{id}/read` |
| `POST` | `/work/notifications/read-all` |

Create notifications when:
- assigned
- mentioned in comment
- status changed on followed/assigned work
- commented (assignee)
- reopened
- due soon (scheduler / cron)

Optional: also push into existing `/dashboard-notifications` + FCM later.

---

### 6.11 Workflows

| Method | Path |
|--------|------|
| `GET` | `/work/workflows` |
| `GET` | `/work/workflows/{id}` |
| `GET` | `/work/projects/{projectId}/workflow` |
| `PUT` | `/work/workflows/{id}` | upsert |

**Workflow payload:**

```json
{
  "id": "wf-default-dev",
  "name": "Development",
  "statuses": ["new", "in_progress", "ready_to_test", "testing", "done", "blocked", "reopened", "cancelled"],
  "transitions": {
    "new": ["in_progress", "blocked", "cancelled"]
  }
}
```

---

### 6.12 Dashboard KPIs

| Method | Path | Permission |
|--------|------|------------|
| `GET` | `/work/dashboard/kpis` | `reports.view` |

**Response:**

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

KPI click on frontend opens filtered `/work/items` — no special endpoint needed beyond list filters.

---

## 7. Naming convention (camelCase vs snake_case)

Frontend TypeScript currently uses **camelCase** (`assigneeId`, `projectId`).  
Laravel typically returns **snake_case**.

**Agreement options (pick one):**
1. Backend returns snake_case; frontend adapter maps fields (recommended Laravel style), **or**
2. Backend returns camelCase via Laravel API Resources.

Either is fine — document the choice. Do **not** mix within the same resource.

---

## 8. Suggested implementation phases for backend

### Phase A — Foundation (unblocks frontend swap)
1. Departments CRUD + archive  
2. Projects CRUD + key uniqueness + sequence  
3. Work items CRUD + list filters  
4. Assign + transition + status/assignment history + activities  
5. Seed workflows + Spatie permissions  

### Phase B — Collaboration
6. Comments + mentions + notifications  
7. Attachments metadata endpoints (reuse existing upload)  
8. Full activity feed  

### Phase C — Structure & time
9. Work logs + estimate updates  
10. Parent/child  
11. Links  

### Phase D — Product polish
12. Saved views  
13. Dashboard KPIs  
14. Due-soon cron  
15. Optional FCM / dashboard-notifications bridge  

---

## 9. Frontend switchover

When Phase A is live:

1. Implement `LaravelWorkManagementRepository` methods using `client.workManagement.*` in `src/framework/utils/index.ts` (stubs already exist; expand as endpoints land).
2. Set `NEXT_PUBLIC_WM_BACKEND=laravel`.
3. Keep mock available for local UI work without API.

Existing attachment upload stays:

```
POST NEXT_PUBLIC_ATTACHMENT_URL
FormData: attachment[]
Authorization: Bearer {token}
```

---

## 10. Acceptance checks for Phase A

- [ ] Create department with manager + members  
- [ ] Archive department → cannot create project/work under it  
- [ ] Create project `CARE` → reject duplicate key  
- [ ] Create work item → gets `CARE-1`, then `CARE-2`  
- [ ] Assign only allowed members; unassign works  
- [ ] Illegal status transition returns 422  
- [ ] Legal transition writes status history + activity  
- [ ] `GET /work/items/CARE-1` works by key  
- [ ] Filters combine (`type=bug&priority=critical&overdue=1`)  
- [ ] Login returns new WM permission names  

---

## 11. Contact / code references (frontend)

| Area | Path |
|------|------|
| Domain types | `src/types/work-management.ts` |
| Repository contract | `src/lib/work-management/repository.ts` |
| Default workflows | `src/lib/work-management/workflow.ts` |
| Permissions | `src/lib/work-management/permissions.ts` |
| API client stubs | `src/framework/utils/index.ts` → `workManagement` |
| Attachment upload helper | `src/lib/work-management/upload-attachment.ts` |

---

*Generated from the Home Heller Work Management frontend contract — Aug 2026.*
