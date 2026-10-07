---
name: justvoxel-iso-ci
description: Change, review, or diagnose JustVoxel ISO GitHub Actions workflows, ISO build inputs, image-builder execution, payload pulls, permissions, pinned actions, checksums, artifacts, trigger paths, and CI failures.
---

# JustVoxel ISO CI

Keep installer CI narrow, deterministic, and truthful about what it proves.

## Investigation

- Inspect the exact workflow file and exact run/commit SHA that executed.
- Identify the first real failing step before editing workflow logic.
- Distinguish payload-pull, installer-image build, image-builder, ISO output, checksum, and artifact-upload failures.
- Do not treat a canceled, skipped, queued, or failed job as green.

## Workflow Rules

- Pin third-party Actions to full commit SHAs with useful version comments.
- Grant only the permissions each workflow/job needs.
- Keep build artifacts short-lived when they are development media rather than permanent releases.
- Generate and publish a checksum with the ISO.
- Keep artifact naming predictable.
- Reuse existing build logic instead of creating parallel installer pipelines without a real need.
- Do not add SourceForge publication or stable release machinery until the human explicitly opens that scope.

## Trigger Hygiene

The current v2 image build should remain scoped to files that materially affect the v2 installer, such as:

- `.github/workflows/build-installer-v2.yml`
- `installer-v2/**`

Agent instructions and repo-local skills should not trigger an ISO build.

Do not broaden triggers to documentation or unrelated legacy paths without a demonstrated reason.

## Evidence Boundaries

CI can prove that the configured ISO build pipeline succeeded and produced the expected artifact/checksum.

CI alone does not prove:

- the ISO booted;
- Anaconda started correctly;
- storage behaved correctly;
- installation completed;
- the installed system booted;
- JustVoxel runtime worked.

Keep those claims for the corresponding manual test stages.

## Stable/Future Releases

When future stable/monthly ISO release work is explicitly approved, keep it separate from development validation.

Do not invent release automation in advance.
