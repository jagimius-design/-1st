---
name: plan2
description: >-
  A way for Agents to break down and keep track of a Project.
---

# The plan and the `plan/` folder

A way for Agents to break a big Project into smaller chunks and keep track of it.

A Project breaks into Sections, and each Section into Tasks. Each Section owns a folder,
where most of its work lands: `<Codename>/` beside `plan/`, unless its index entry's `Folder` puts it
elsewhere under the Project root. The `plan/` folder in the Project root holds one `<Codename>.md`
per Section and a `project.md` for the Project itself. `plan/` and `project.md` are reserved names.

A Project, which is to say a `plan/`, has a Manager, who shapes the Sections. A Section too big and
different for one Manager is delegated to another: it becomes a Project of its own with a `plan/` in
its folder, keeps its line in the parent's `project.md` and loses its `.md` there.

## Layout

The code blocks below are the form of each `.md` file:

### `project.md` — a Project

```
# <Project Name>

<what the project is and where it is going>

- Manager:  The manager responsible for the plan.
- Codename: The Project's Codename
- Workers:  (optional) The workers on the project's own tasks, by id.
  - id
  - id
- Comments: (optional) Notes on the project's work as it stands. Only what's needed.

<the project's own tasks, written the same way a section's are>

## Sections

- 1 Codename
  - Responsible: The responsible Manager
  - Folder:      (optional) The folder the Section owns, when it is not `Codename/` beside `plan/`.
```

- The project's own tasks are the managing work for the folder the `plan/` sits in. Its `Codename`
  is usually the Project's name, and is the one that owns no folder, because it owns the root.
- The index carries the Sections in order. The numbers are for reading and address nothing.
- A Section whose `Responsible` is not the plan's Manager is a delegated one, and has no `.md` in
  this `plan/`.
- `Folder` is a path relative to the Project root, `ventures/shop` say: no `..`, no leading `/`.
  It moves the folder alone; the Section is still addressed by its Codename, and a delegated one
  keeps its `plan/` inside that folder.

### `<Codename>.md` — a Section

One per concept or work package.

```
# Section title

<description>: what the section is and where it is going.

- Workers:  (optional) The workers that have worked in the section, by id.
  - id
  - id
- Comments: (optional) Notes on the section's work as it stands. Only what's needed.
```

### Tasks

Each Section holds a list of standalone tasks, numbered.

```
- 1 Task title
  - Goal:        What is expected, the goal of the task.
  - Status:      not started | in progress | needs decision | completed.
  - Depends on:  (optional) What must be completed before this one can start.
  - Worker:      (optional) The one on it, by id, so also on the section's `Workers`.
  - Comments:    (optional) Notes on the task as it stands. Only what's needed.
```

- `Depends on` names a task by a chain of codenames, which is the folder path spelled in codenames:
  - the number alone, for a task of the same section: `2`.
  - the whole chain from the top project's `Codename`, for any other task: `hub.agentscope.web.2`.
- A completed task compresses to its title with `(completed)` next to it, e.g.
  `1 Task title (completed)`, once nothing depends on it and removed when no more relevant or old.

## Notes

- The field names above are the whole set.