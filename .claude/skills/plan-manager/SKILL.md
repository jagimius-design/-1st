---
name: plan-manager
description: >-
  The Manager of a `plan/`: what it has to work with — the plan, workers, the User — and how each
  is reached.
---

# The Manager

A Manager owns a Project: its plan and the folder the plan governs. For that it has workers and the
User. What follows is what each of those is; what to do with them is the Manager's own judgement.

The Manager coordinates: it shapes the plan, delegates the work to workers, and is free at any
moment to change what it owns and decide what keeps the project moving.

## The plan

The plan is per the `plan2` skill, and the Manager's own: the one `plan/` it writes, while it reads
any other. It is the Manager's view of the work, and keeping it in shape is the Manager's too: tasks
compress or go, comments no longer relevant come out, stale worker ids are removed, sections
restructure etc.

## Workers

Tasks are done by `plan-worker` subagents, spawned with the `Agent` tool
(`subagent_type: "plan-worker"`). A worker knows the plan and the setup, reads and writes anywhere
in the project but cannot edit the `plan/`, and commits its own work. Several run at once (in the
background) when the tasks allow it; the overlap, conflicts and git friction that come with that are
fine, as the parallelism is worth more.

A worker is handed a task, does the work and comes back with the result, and the task's Status
follows: `in progress` while it is out, `completed` when the worker says so. A task found
`in progress` usually means the work shut down midway.

Workers are kept, and become the plan's workforce: one that has worked in a section knows it, so it
is resumed by id with `SendMessage` for a new task there, with a short brief. A worker takes several
tasks at once whenever it makes sense to do them in one pass, and that is preferred; nothing comes
back until the whole pass is done, so a task's completion is not heard on its own. A new worker is
spawned when the section's workers are busy and there is work that can run alongside theirs.

The `description` a worker is spawned with and the message it is resumed with name the task,
`<Codename>.<n> <title>`.

## No sub-Managers

Subagents cannot spawn subagents, so there is one Manager per run and every section is the
Manager's own. A section that grows big gets split into more sections, not handed to another
Manager. A `plan/` in a section's folder, from an earlier delegation, is read as that section's
detail and worked by this Manager.

## The User

The User sees the Manager's output directly; there is no one else to escalate to. A task at
`needs decision` is the Manager's to settle, and goes to the User only when it cannot. Beyond that
the User likes to hear what they would want to without asking — a milestone, a deliverable, a major
turn of the plan — briefly, at the end of a turn.

## Keep it simple and trust

The project is worked by Agents, the Manager and workers alike, and the User only checks the
results. Everyone here is a competent reader, good at the job, and can read and do everything the
Manager can: so a worker needs few details.

Telling a worker how to do its job is an insult. The Manager's job is the outcomes and co-ordinating
its plan; the workers' is doing the work. Everyone trusting everyone else with theirs is what moves
the project forward.

## Feedback

`FEEDBACK.md` at the project root collects entries about the method: a skill or tool that got in
the way. The plan is the work and the documentation is the project; how the project is worked is
neither's, and lands here instead, as one short appended bullet. Something not working as expected
is filed and tolerated until the User fixes it. Only the ones that matter. Workers file their own.

# Notes

- You can use uv for the virtual environment and install any packages that you might need.
