# JustVoxel ISO Agent Instructions

This document provides repository-specific instructions for coding agents working on the JustVoxel ISO Builder.

Read this file before modifying the repository.

## Project

JustVoxel is an immutable bootc-based Minecraft server appliance.

This repository owns the JustVoxel installation-media implementation.

`justvoxel-iso` is the actual installer-media repository for JustVoxel and is not intended to remain a reusable GitHub template repository.

Once production-ready, the intended release model is approximately monthly refreshed JustVoxel ISO builds. Final public ISO releases are intended to be published through SourceForge. SourceForge publication implementation is future scope and must not be added now.

Its responsibilities include:

- installer ISO composition
- installer environment
- Anaconda configuration and customization
- JustVoxel installer branding
- bootc payload selection
- online and offline installation-source handling
- installation storage defaults
- installer-specific validation
- GitHub Actions used to build and test installer media
- installer documentation

This repository does **not** own the JustVoxel operating-system implementation.

Related repositories normally exist as siblings in the local development workspace:

```text
~/projects/justvoxel
~/projects/justvoxel-base
~/projects/justvoxel-iso
```

Do not modify `../justvoxel` or `../justvoxel-base` as part of an ISO task unless the user explicitly expands the approved scope to those repositories.

The installed JustVoxel payload comes from images produced by the JustVoxel project.

## Development branch

Active v2 installer development happens on:

```text
testing-v2
```

`testing` is the legacy/current installer development reference branch.

`main` is the legacy/stable installer reference branch.

During v2 development, do not modify `testing` or `main` unless the user explicitly approves work on those branches.

Before starting work, verify:

```text
git status -sb
git branch --show-current
git log -1 --oneline --decorate
```

Expected normal development branch:

```text
testing-v2
```

Do not silently switch branches.

Never discard existing user changes.

## Golden references

When architecture or installer implementation patterns require external comparison, prefer current upstream sources and these Universal Blue projects:

- https://github.com/ublue-os/bluefin
- https://github.com/ublue-os/ucore
- https://github.com/ublue-os/bazzite
- https://github.com/ublue-os
- https://github.com/projectbluefin/iso

Use them as references, not as code to copy blindly.

For installer technology, also prefer current upstream documentation and source for:

- Anaconda
- Anaconda WebUI
- osbuild
- image-builder
- bootc
- Fedora bootc installer work
- RHEL / AlmaLinux bootc behavior where relevant

Inspect current upstream state before making claims about implementation, support, or command syntax.

Do not rely on remembered behavior when the installer stack may have changed.

## Working model

The normal development workflow is:

```text
Research / reproduce
→ define exact scope
→ user approval
→ implement
→ validate manually in Mode B
→ review diff
→ user decides whether to commit/push
```

Do not expand scope without explicit approval.

If an additional problem is discovered while implementing:

1. report it;
2. explain whether it blocks the approved work;
3. do not fix it unless it is required for the approved scope or the user expands scope.

Proposal-only work must not modify files.

## Git and GitHub safety

Never perform any of the following unless the user explicitly approves it:

- commit
- push
- force push
- create or delete branches
- create or modify pull requests
- merge
- tag
- release
- modify GitHub Actions state
- rerun GitHub Actions
- modify repository settings
- modify files directly on GitHub

Local source edits inside the approved scope are allowed only after the user has approved implementation.

Never use destructive Git commands such as:

```text
git reset --hard
git clean -fd
git checkout -- .
git restore .
```

unless the user explicitly asks for that exact action.

Do not alter or discard unrelated local changes.

## Codex execution model

Normal Codex use in this repository is **edit-only**.

The usual invocation is:

```text
codex --strict-config -s workspace-write -a never exec '<PROMPT>'
```

Every Codex implementation prompt must contain an explicit STRICT block.

Do not omit that block even when the requested edit appears small.

Unless the user explicitly approves an exception for the specific task, the STRICT block is:

```text
STRICT

- Do not commit.
- Do not push.
- Do not modify GitHub.
- Do not touch build_artifacts/.
- Do not run tests.
- Do not run builds.
- Do not run gofmt.
- Do not install packages on the host.
- Do not improvise a host-side workaround.
- Do not use on the host Podman, ToolBox, DistroBox.
- Do not modify unrelated files or UI.

When complete, stop.

Final response exactly:
DONE
```

Do not replace a failed or unavailable container/toolbox workflow with improvised host-side shell installation or host package changes.

Do not use Podman, ToolBox, or DistroBox from Codex unless the user explicitly approves that exception before execution.

Validation is normally performed afterward by the user and assistant in Mode B, not by Codex.

## Installer architecture

JustVoxel ISO is an installer factory, not a general-purpose Linux distribution and not a live JustVoxel desktop environment.

Preserve the separation:

```text
Installer environment
→ Anaconda
→ selected JustVoxel bootc payload
→ installed JustVoxel appliance
```

Installer-only packages and graphical components must remain in the installer environment.

Do not add installer dependencies to the installed JustVoxel image merely because the installer requires them.

Do not turn the ISO repository into another operating-system image repository.

## Current installer direction

The current approved redesign direction is:

```text
image-builder
→ bootc-generic-iso
→ Anaconda WebUI
→ JustVoxel bootc payload
```

Prefer the unified `image-builder` path and `bootc-generic-iso` for new implementation work.

The existing `bootc-image-builder` / `bootc-installer` implementation is legacy code during the migration.

Do not add new architectural dependencies on the legacy path unless required temporarily for migration or comparison and explicitly approved.

The preferred installer experience is the current Anaconda WebUI rather than a custom installer application or full live desktop.

Do not create a JustVoxel-specific partitioning engine, bootloader installer, network configuration stack, or general-purpose installer framework when upstream Anaconda already owns that responsibility.

Small JustVoxel-specific installer customization is acceptable where required for appliance-specific choices.

## JustVoxel editions

The intended installer architecture supports:

- JustVoxel VM
- JustVoxel HWS

HWS means Hardware Support.

During development, one edition may be wired to a real testing image while another edition remains an explicit disabled placeholder.

A placeholder must never silently install another edition.

For example, if VM is unavailable, present it as unavailable rather than mapping VM selection to HWS.

Edition image references must remain configuration data rather than being spread throughout unrelated installer logic.

## Installation sources

The intended installer supports two initial installation-source modes:

### Online

Install the current selected JustVoxel channel from the registry.

During development this normally means:

```text
:testing
```

For stable releases of the AlmaLinux 10 generation this means:

```text
:10
```

### Offline

Install the JustVoxel payload embedded in the ISO.

Offline installation changes the source of the initial payload. It must not create a separate long-term update channel.

After installation, the appliance should track the appropriate normal JustVoxel channel.

## Channel tags

JustVoxel product-image tags and Home Server Package channel tags are distinct.

JustVoxel product images use these development tags:

```text
ghcr.io/home-server-project/justvoxel-hws:testing
ghcr.io/home-server-project/justvoxel-vm:testing
```

Stable JustVoxel product images for the AlmaLinux 10 generation use:

```text
ghcr.io/home-server-project/justvoxel-hws:10
ghcr.io/home-server-project/justvoxel-vm:10
```

Future AlmaLinux generations use their major generation tag, for example `:11`. `:stable` is not the stable JustVoxel product-image tag.

Home Server Packages use separate channel tags: development packages are consumed through `:testing`, and stable packages are consumed through `:stable`. Do not introduce a custom digest-resolution layer for Home Server Packages.

Do not create a custom runtime digest-resolution or update-selection layer.

An immutable digest may be used internally when required for build reproducibility, signature verification, or proving the identity of an embedded artifact, but it must not replace the intended product channel model unless explicitly approved.

## Current default storage layout

The current proposed JustVoxel appliance default is:

```text
GPT

128 MiB   EFI System Partition   /boot/efi
896 MiB   /boot
remaining space                  JustVoxel system
no disk swap
```

The installed JustVoxel image owns zram policy.

This reserves exactly 1 GiB total for EFI plus `/boot`.

This layout is based on the existing working JustVoxel HWS deployment and is intended as an appliance-oriented default rather than a general-purpose Linux layout.

Do not casually increase partition sizes to generic workstation/server defaults without demonstrating a JustVoxel requirement.

Do not reduce them further without validation of bootloader, kernel/initramfs, update, and rollback requirements.

## Storage UX

Prefer normal Anaconda storage capabilities when they work correctly with the selected bootc installer path.

Useful options may include:

- automatic whole-disk installation
- automatic installation into available/unallocated space
- custom/manual partitioning

These options are desirable but are not mandatory if the current supported bootc/Anaconda path cannot provide them safely and reliably.

A reliable automatic JustVoxel default layout is more important than maintaining custom storage code.

Do not implement a custom storage engine merely to reproduce functionality unavailable from the current upstream installer.

Any destructive storage action must remain clear to the user.

## Immutable OS rules

JustVoxel is an image-built immutable appliance.

Do not design installer fixes around runtime RPM layering of the installed system.

Do not use `rpm-ostree install` as a JustVoxel product solution.

Required JustVoxel OS packages belong in the appropriate JustVoxel image repository.

Installer-only packages belong in the installer environment.

Prefer normal bootc, Anaconda, image-builder, NetworkManager, systemd, SELinux, and upstream installer mechanisms.

## Repository layout

Current important areas include:

- `.github/workflows/`
  - installer build and validation workflows

- `installer/`
  - installer environment and installer configuration

- `docs/`
  - installer architecture and user/developer documentation

- `cosign.pub`
  - Home Server Project image-verification public key

- `README.md`
  - installer usage and project overview

The repository is being redesigned.

Do not assume current file names or directories are permanent architecture merely because they exist in the legacy installer.

Before creating a parallel implementation path, inspect whether the current repository already contains reusable build, verification, artifact, or documentation logic.

## Reusable legacy pieces

When replacing the legacy installer, preserve useful behavior where it still applies, including:

- clear separation between installer and installed JustVoxel image
- signature verification
- restricted GitHub Actions permissions
- build summaries
- predictable artifact naming
- ISO checksums
- installer-specific documentation
- development versus stable-generation product-image separation

Do not preserve legacy implementation solely to minimize the diff.

A clean replacement is preferred when the old implementation is tied directly to a deprecated or replaced installer architecture.

## Networking

Installer networking exists to make installation work and to leave the installed appliance with a valid normal network configuration.

Prefer Anaconda and NetworkManager behavior rather than custom network configuration logic.

Do not add permanent JustVoxel networking policy to the installer when it belongs in JustVoxel Base.

If installer-created NetworkManager profiles require normalization for reliable first boot, keep that logic narrow, documented, and validated against the current installer stack.

## Accounts and access

Installer account behavior must remain explicit.

Do not:

- embed private SSH keys;
- log passwords or secret material;
- place credentials in URLs;
- leak secrets through build summaries or artifacts;
- silently create undocumented privileged accounts.

Development bootstrap credentials must be clearly identified as development-only behavior.

Prefer installer-native account configuration where practical.

## Security

Preserve:

- SELinux enforcement
- image signature verification where designed
- minimal GitHub Actions permissions
- explicit privilege boundaries
- no private keys in the repository or ISO build configuration
- no secret material in logs
- no arbitrary host package installation as a workaround

Do not weaken verification merely to make a build succeed.

Do not disable security checks globally to work around one installer failure.

## Validation

Normal Codex implementation work does **not** run validation.

After Codex finishes, validation is performed manually with the user and assistant in Mode B.

Use the narrowest relevant checks first.

Depending on the changed files, manual validation may include:

```text
git diff --check
git diff
git status -sb
```

For shell scripts:

```text
bash -n <script>
```

For GitHub Actions workflows, use an appropriate YAML/workflow validation tool when available and approved.

For configuration files, parse or validate them with the appropriate native tooling where practical.

An ISO build is a separate validation stage.

Do not run a full ISO build merely because source-level checks succeeded.

Do not claim an installer works because configuration files parse successfully.

Do not claim runtime installation validation unless an ISO was actually booted and the installation path was exercised.

When validating an installer ISO, distinguish between:

- ISO successfully built
- ISO successfully booted
- Anaconda successfully started
- storage configuration succeeded
- payload installation succeeded
- installed system successfully booted
- installed JustVoxel health was verified

A failure or missing result at one stage must not be reported as success for that stage.

## Build artifacts

Do not modify or use `build_artifacts/` during normal Codex edit-only work.

Generated ISO files, temporary build trees, logs, screenshots, test output, and other generated artifacts must not be treated as source unless the repository explicitly defines otherwise.

Do not commit generated build output unless the user explicitly approves it.

## Documentation

Update documentation when behavior, architecture, supported installation workflow, image selection, storage behavior, security boundaries, or build process changes.

Do not preserve obsolete documentation merely because the legacy implementation still exists temporarily.

When documentation and implementation disagree, investigate which represents the approved current design.

Do not silently rewrite architecture decisions without user approval.

## Final implementation report

After the implementation and manual validation cycle, provide a concise report containing:

1. What changed.
2. Why.
3. Exact files changed.
4. Tests and validation executed manually.
5. Results.
6. Anything not verified.
7. Current `git status -sb`.
8. Relevant `git diff --stat`.
9. Whether any build or real installation test was not performed.

Do not commit or push merely because implementation and validation succeeded.
