---
name: justvoxel-iso-installer
description: Change or review JustVoxel ISO v2 installer architecture, installer environment, image-builder/bootc integration, Anaconda configuration, payload selection, edition/source rules, storage defaults, networking handoff, accounts, and other installer behavior outside the custom WebUI itself.
---

# JustVoxel ISO Installer

Keep the installer small, upstream-based, and separate from the installed JustVoxel appliance.

## Current v2 Direction

Prefer the approved v2 path:

image-builder -> bootc-generic-iso -> Anaconda WebUI -> selected JustVoxel bootc payload.

The legacy `installer/` and old bootc-image-builder/bootc-installer implementation are reference/migration material.

Do not add new architectural dependencies on the legacy path unless the human explicitly approves a temporary migration need.

## Responsibility Boundary

The installer exists to place the selected JustVoxel image onto the target disk.

Do not:

- turn this repository into another OS-image repository;
- move installer-only packages into JustVoxel Base/HWS/VM;
- create a custom partitioning engine, bootloader installer, network stack, or general-purpose installer framework when Anaconda already owns that responsibility;
- add Minecraft server binaries, worlds, or EULA state to the installer.

Prefer upstream mechanisms and make JustVoxel-specific changes only where the appliance actually needs them.

## Editions

The intended editions are:

- JustVoxel VM;
- JustVoxel HWS (Hardware Support).

During development, an edition may be unavailable.

An unavailable edition must be shown as unavailable. Never silently map one edition selection to another payload.

Keep edition image references centralized/configurable rather than scattered through unrelated logic.

## Payload Sources and Tags

Support the intended distinction:

Online:
- install the selected moving product channel from the registry.

Offline:
- install the exact payload embedded in the ISO.

Offline affects only the initial payload source. It must not create a separate long-term update channel.

Development product images use `:testing`.

Stable JustVoxel product images for the AlmaLinux 10 generation use the generation tag such as `:10`, not `:stable`.

Home Server Packages use their own channel convention: development `:testing`, stable `:stable`.

An immutable digest may be used internally for reproducibility/signature proof, but do not replace the intended product channel model with a custom digest resolver.

## Storage Defaults

Treat current source as authoritative and verify it before changing values.

The current v2 appliance-oriented platform defaults are:

- GPT;
- 128 MiB EFI System Partition;
- 896 MiB `/boot`;
- remaining supported system space for JustVoxel root;
- no disk swap;
- installed JustVoxel owns zram policy.

Do not inflate these to generic workstation/server defaults without a demonstrated JustVoxel requirement.

Do not reduce them without validating bootloader, kernel/initramfs, update, and rollback needs.

Prefer Anaconda storage capabilities when they work correctly.

A reliable automatic appliance layout is more important than recreating every general-purpose storage option.

Any destructive storage action must remain obvious to the user.

## Networking

Installer networking exists to complete installation and leave a valid normal machine-specific network configuration.

Prefer Anaconda and NetworkManager behavior.

Do not add permanent appliance networking policy that belongs in JustVoxel Base.

If installer-generated profiles need narrow normalization for reliable first boot, keep it targeted and validate it against the current installer stack.

## Accounts and Access

Keep installer account behavior explicit.

Development bootstrap credentials must be clearly marked as development-only.

Prefer installer-native account handling where practical.

Never embed private SSH keys, leak credentials, or silently create undocumented privileged accounts.

## Source of Truth

For current behavior, inspect:

- `installer-v2/Containerfile`
- `installer-v2/90-justvoxel.conf`
- `installer-v2/interactive-defaults.ks`
- `installer-v2/iso.yaml`
- `installer-v2/anaconda-overrides/`
- the current v2 workflow

Do not assume README/design documentation is current when implementation has moved faster than docs.
