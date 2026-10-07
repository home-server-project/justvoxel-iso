# JustVoxel ISO Agent Instructions

Read this file before modifying the repository.

## Project

JustVoxel ISO builds installation media for the JustVoxel appliance.

This repository owns:

- the installer environment;
- Anaconda configuration/customization;
- installer branding;
- bootc payload selection;
- online/offline installation-source behavior;
- installer storage defaults;
- installer-specific validation;
- GitHub Actions that build installer media;
- installer documentation.

This repository does not own the JustVoxel operating-system implementation.

Do not modify sibling JustVoxel repositories as part of an ISO task unless the human explicitly expands the approved scope.

## Active development branch

Current v2 installer development happens on:

`testing-v2`

During v2 development, `testing` and `main` are reference/legacy branches and are outside normal Codex modification scope.

Before editing, inspect:

- `git status -sb`
- `git branch --show-current`
- `git log -1 --oneline --decorate`

Do not silently switch branches.

Never discard existing user changes.

## Working model

Use this loop:

Research/reproduce -> define exact scope -> human approval -> implement -> manual validation/review -> human decides commit/push.

Proposal-only work must not modify files.

Do not expand scope without explicit approval.

If another problem is discovered:

1. decide whether it blocks the approved task;
2. report it clearly;
3. do not fix it unless it is required by the approved scope or the human expands scope.

Protect known-working behavior. Do not perform unrelated cleanup merely because nearby code could be improved.

## Codex execution model

Normal Codex implementation work in this repository is edit-only.

Unless the human explicitly approves an exception for a specific task, Codex must:

- not commit;
- not push;
- not modify GitHub;
- not create/delete/switch branches;
- not touch generated build artifacts;
- not run tests;
- not run builds;
- not run `gofmt`;
- not install packages on the host;
- not improvise host-side workarounds;
- not use Podman, ToolBox, or DistroBox on the host;
- not modify unrelated files or UI.

When a prompt uses the existing STRICT convention, preserve that contract.

Validation normally happens afterward with the human and assistant, not inside Codex execution.

## Skills

Repository-local skills live under `.agents/skills/`.

Always read this file first, then load only the skill or skills that materially apply.

Normally use one primary skill. Add one supporting skill only when the task genuinely crosses boundaries. Do not load all skills by default.

Available skills:

- `justvoxel-iso-installer`: installer architecture, image-builder/bootc integration, installer environment, payload selection, storage defaults, networking/account behavior, and edition/source rules.
- `justvoxel-iso-webui`: Anaconda WebUI customization, upstream patching, wizard flow, branding, storage UI behavior, and edition/login presentation.
- `justvoxel-iso-ci`: GitHub Actions, ISO build/publish mechanics, artifacts, checksums, workflow triggers, permissions, and CI diagnosis.
- `justvoxel-iso-review`: independent read-only verification/review of completed installer changes.

Typical routing:

- Containerfile, Anaconda config, Kickstart/defaults, image-builder, storage defaults, payload/source work -> `justvoxel-iso-installer`.
- Anaconda wizard, React overrides, patching, branding, navigation, installer UX -> `justvoxel-iso-webui`.
- Workflow/build failure or Actions changes -> `justvoxel-iso-ci`.
- Independent review after implementation -> `justvoxel-iso-review` plus the relevant domain skill.
- A WebUI change that also alters actual installer behavior -> `justvoxel-iso-webui` + `justvoxel-iso-installer`.

A skill supplements this file. It never overrides the approval, branch, Git/GitHub, or scope rules here.

## Git and GitHub safety

Read-only Git inspection is allowed when relevant.

Never perform any of the following unless the human explicitly approves that exact action:

- commit;
- push;
- force push;
- create or delete branches;
- create or modify pull requests;
- merge;
- tag;
- release;
- manually trigger, rerun, or cancel GitHub Actions;
- modify repository settings;
- modify files directly on GitHub.

Never use destructive Git commands such as:

- `git reset --hard`
- `git clean -fd`
- `git checkout -- .`
- `git restore .`

unless the human explicitly asks for that exact action.

## Architecture boundary

JustVoxel ISO is an installer factory, not another operating-system image and not a general-purpose Linux distribution.

Preserve the separation:

Installer environment -> Anaconda -> selected JustVoxel bootc payload -> installed JustVoxel appliance.

Installer-only packages, UI, accounts, and build helpers must remain in the installer environment.

Do not move installer dependencies into the installed JustVoxel image merely because the installer needs them.

Do not add runtime appliance policy here when it belongs in JustVoxel Base or the product image.

Prefer upstream Anaconda, Anaconda WebUI, image-builder, bootc, NetworkManager, systemd, and SELinux mechanisms over custom replacements.

When installer-stack behavior may have changed, inspect current upstream source/documentation instead of relying on memory.

Golden upstream references include:

- https://github.com/ublue-os/bluefin
- https://github.com/ublue-os/ucore
- https://github.com/ublue-os/bazzite
- https://github.com/ublue-os
- https://github.com/projectbluefin/iso
- Anaconda / Anaconda WebUI
- osbuild / image-builder
- bootc
- Fedora/RHEL/AlmaLinux bootc installer behavior

Use them as references, not as code to copy blindly.

## Immutable product rules

The installed JustVoxel system is image-built and immutable.

Do not design installer fixes around runtime RPM layering of the installed system.

Do not use `rpm-ostree install` as a JustVoxel product solution.

Required JustVoxel OS packages belong in the appropriate image repository.

Installer-only packages belong in the installer environment.

Do not create a custom runtime digest-resolution/update-selection layer.

## Security

Preserve:

- SELinux enforcement in the installed product unless an explicitly approved installer exception requires otherwise;
- image signature verification where designed;
- minimal GitHub Actions permissions;
- explicit privilege boundaries;
- no private keys in the repository or build configuration;
- no passwords/secrets in URLs, logs, summaries, or artifacts;
- no undocumented privileged accounts.

Do not weaken verification merely to make a build pass.

## Generated artifacts

Generated ISO files, output trees, logs, screenshots, and test artifacts are not source unless the repository explicitly says otherwise.

Do not modify or commit generated build output unless the human explicitly approves it.

## Validation and evidence

Use the narrowest relevant checks first during manual validation.

Keep these stages distinct:

1. source/configuration inspected or parsed;
2. ISO built;
3. ISO booted;
4. Anaconda started;
5. storage configuration succeeded;
6. payload installation succeeded;
7. installed system booted;
8. installed JustVoxel health/runtime verified.

Never report a later stage as proven by an earlier one.

A successful configuration parse does not prove the installer works.

A successful ISO build does not prove it boots.

A successful boot does not prove installation succeeded.

Do not claim runtime installation validation unless the relevant ISO was actually booted and the installation path was exercised.

## Documentation

Update documentation when installer behavior, architecture, supported workflow, payload selection, storage behavior, security boundary, or build process changes.

Do not preserve obsolete documentation merely because legacy code still exists.

When documentation and implementation disagree, investigate which represents the approved current design instead of silently choosing one.

## Final implementation report

After an implementation/manual-validation cycle, keep the report concise:

1. what changed;
2. main files/areas changed;
3. validation actually performed and results;
4. important blocker or unverified item;
5. current `git status -sb` and useful diff/stat when requested.

Codex completion text is not proof of correctness. Independent human-directed review follows before accepting installer behavior.
