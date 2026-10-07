---
name: justvoxel-iso-review
description: Perform an independent read-only review and verification of completed JustVoxel ISO changes by inspecting the real diff, approved scope, installer architecture, relevant checks, upstream patch risks, and actual ISO/install evidence.
---

# JustVoxel ISO Review

Review the implementation that actually exists, not the Codex completion message.

Review is read-only by default.

## Review Process

1. Inspect branch, `git status`, diff/stat, and exact changed files.
2. Compare the changes with the approved scope.
3. Read affected installer configuration, callers, patch context, workflow logic, and docs as needed.
4. Run only the manual checks that make sense for the changed area and that the human approves.
5. Separate source evidence from ISO/boot/install/runtime evidence.
6. Report concrete findings. Do not modify code unless the human separately approves a fix.

## What to Look For

Prioritize:

- wrong payload/edition selection;
- installer-only behavior leaking into the installed appliance;
- Anaconda/bootc/image-builder architecture drift;
- patch drift against pinned upstream WebUI source;
- storage or destructive-action regressions;
- login/bootstrap credential mistakes;
- networking profiles that fail after first boot;
- signature/verification weakening;
- workflow permissions or trigger mistakes;
- accidental legacy `installer/` changes during v2 work;
- unrelated cleanup or scope expansion;
- documentation claiming behavior no longer implemented.

Protect known-working installer behavior. Do not restructure working paths merely for style.

## Evidence Ladder

Keep these stages explicit:

1. source/configuration review;
2. ISO successfully built;
3. ISO successfully booted;
4. Anaconda successfully started;
5. storage configuration succeeded;
6. payload installation succeeded;
7. installed system successfully booted;
8. installed JustVoxel health/runtime verified.

A later stage must never be inferred from an earlier one.

If a stage was not exercised, say so.

## Findings

Keep findings specific:

- exact file/path and line/range when practical;
- what is wrong;
- why it matters;
- safest intended correction.

Do not invent findings to make the review look thorough.

If no meaningful finding exists, say so and identify any important stage that remains unverified.

Discovery is not permission to fix an out-of-scope issue.
