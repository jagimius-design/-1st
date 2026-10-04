---
name: documentation2
description: >-
  How to document a project in-tree for the agents working it: a CLAUDE.md per folder,
  a docs/ beside it, comments, and tests.
---

# The documentation — `CLAUDE.md`, `docs/`, comments and tests

Meant for agents. All of it exists to save time and tokens: orienting, summarizing and 
pointing at what to open next, and saving time for re-investigations

It is layered — each level documents its own, collapsing into summary above and opening into detail
below, and reads correctly on its own. Nothing is said twice: what is written in one of the four
below is not written again.

## `CLAUDE.md`

One per meaningful folder. It is read to understand what is inside the folder and to decide what to
open next, so it orients and points rather than explains, and holds no detail of its own. It
usually has the following:

- A brief explanation of the folder
- The top level concepts of that folder and how they combine together
- A navigation section of every file and folder in that folder, each with a line or two on what it
  is for

## `docs/`

Each level might have a `docs/` of `.md` files, each holding something that took real time to find
out and would take as long to find out again: how an API or SDK actually behaves, what a web
exploration turned up for something that is used, etc. It is not a log or an archive.

## Comments and docstrings

The reader gets the code along with them, so a comment is there only when something cannot be
inferred from the code or when it carries an insight that saves time.

## Tests

Tests sit next to their module, one file per meaningful module in the `tests/` folder of that level,
named after it and holding one test per claim:

- Nothing is re-tested that is imported.
- A fixture is as small as its claim.
- Tests falling into groups that share no setup are two subjects in one module, and the module
  should split.

## Keeping it true

Written in the same pass as the work. When something changes the documentation around it changes
too, and what stopped being true is deleted rather than annotated. The past stays out: no changelog.

## Notes

- All of the above need to be lean, as otherwise they defeat their own purpose: no glosses, no
  restatements, no thorough explanations, and no qualifiers guarding against misreadings a competent
  reader would not make.
