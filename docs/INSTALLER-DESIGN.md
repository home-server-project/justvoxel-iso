# JustVoxel installer design

This document describes the technical design of the JustVoxel ISO Builder.

For normal installation guidance, start with the repository README. This file is for maintainers and advanced users who want to understand how the installer is built and why the current choices exist.

## Purpose

The ISO Builder produces a short-lived unattended installer ISO for one of the JustVoxel bootc images:

- JustVoxel VM
- JustVoxel Bare Metal

The installer repository is not the source of the JustVoxel operating-system image. It builds installation media around a selected JustVoxel bootc image.

The resulting installation is the selected JustVoxel image directly. There is no intermediate general-purpose Linux installation followed by a first-boot conversion.

## Image targets

Development builds currently use the JustVoxel `:testing` images:

```text
ghcr.io/home-server-project/justvoxel-vm:testing
ghcr.io/home-server-project/justvoxel-baremetal:testing
```

Stable installation media is intended to use the corresponding `:10` images after those images are promoted from testing.

## Image resolution and verification

The workflow begins from the selected moving JustVoxel tag and resolves it to an immutable OCI digest.

The selected image can then be verified with the Home Server Project Cosign public key in this repository.

The builder uses the immutable digest as the verified payload identity while preserving the selected moving tag as the installed system's bootc tracking reference. This means the ISO contains the exact image that was resolved and verified during the workflow, while the installed system can continue following the intended JustVoxel update channel afterward.

Signature verification is enabled by default and can be disabled only through an explicit workflow option.

## Dedicated installer container

The workflow builds a dedicated installer container from the files in the `installer/` directory.

That container provides the unattended installation environment and configuration consumed by bootc-image-builder.

The JustVoxel operating-system image remains separate from the installer container. The installer exists only to place the selected JustVoxel image onto the target disk.

## bootc-image-builder

The workflow uses the upstream bootc-image-builder container to create a `bootc-installer` ISO.

The builder receives:

- the dedicated installer container
- the selected JustVoxel bootc tracking reference
- the runtime installer configuration generated from workflow inputs

The output is then normalized into a predictable JustVoxel installer filename and packaged with a SHA256 checksum.

## Installation layout

The current installer is UEFI/x86_64 oriented and uses a simple GPT layout.

Default layout:

| Mount point | Filesystem | Default |
| --- | --- | ---: |
| `/boot/efi` | EFI System Partition | 512 MiB |
| `/boot` | XFS | 1 GiB |
| `/` | XFS | minimum 32 GiB |
| swap | none | not created |

The root filesystem grows to use the remaining disk by default.

The workflow also allows root growth to be disabled. In that case the configured root size is used and remaining disk space is intentionally left unallocated for an administrator who wants to use JustVoxel storage tooling later.

The workflow rejects a root size below 32 GiB.

## Why 32 GiB is the minimum root design target

The 32 GiB value is an appliance-system minimum, not a guarantee that every Minecraft world will fit comfortably inside that space indefinitely.

The root filesystem needs working room for normal JustVoxel operations, including:

- the running bootc deployment
- retained or staged bootc deployment content
- operating-system update working space
- Podman image storage
- the active Minecraft server container image after setup
- one previous Minecraft container image retained by the JustVoxel update workflow
- logs and normal `/var` state
- temporary maintenance/import space
- Minecraft persistent data when the user chooses to keep it on the system filesystem

Bootc deployments share unchanged image content, so retained deployments are not three full independent copies of the operating system. The appliance still needs enough headroom for image changes, downloads, container content, and persistent state.

## No disk swap

The installer does not create a disk swap partition.

The installed JustVoxel image uses zram as its memory-pressure safety buffer. Zram is part of the appliance runtime policy and is not additional physical RAM.

## User identity and access

The current unattended installer creates the administrative user:

```text
voxel
```

The user is a member of the `wheel` group.

The workflow currently supports:

- password login
- SSH public-key login
- both password and SSH public-key login

It rejects a configuration where neither access path is enabled.

When SSH-key installation is selected, the workflow reads one OpenSSH public key from the `SSH_PUBLIC_KEY` repository secret and validates it before building the ISO.

Only the public key belongs in the builder. Private SSH keys must remain on the user's own computer.

See [SSH.md](SSH.md) for the user-facing SSH guide.

## Current password behavior

Development installer builds currently support temporary password login for the `voxel` user through the workflow option.

The current default development password is `voxel` when password login is enabled.

That password is intended only as a first-access path during development/testing and should be changed after the first successful boot.

If password login is disabled, the workflow generates an unusable random password hash so no known password is installed.

## Installer workflow inputs

The current GitHub Actions workflow exposes these main choices:

- install target: VM or Bare Metal
- image signature verification
- temporary password login
- SSH public-key installation
- timezone
- keyboard layout
- EFI partition size
- `/boot` partition size
- root size/minimum
- whether root grows to consume remaining disk space

The workflow validates these values before building the ISO.

## Destructive installation model

The installer is intentionally simple and destructive to the selected installation disk.

For a VM, the recommended installation path is to create the VM initially with one blank installation disk. Additional backup storage can be attached after the operating system is installed.

For Bare Metal, the safest procedure is to disconnect non-target storage devices before booting the unattended installer whenever practical.

The goal is to keep complex storage design out of the installer. Additional disks, partitions, backup targets, and Minecraft data migration belong to the installed appliance and `mjust` storage workflows.

## VM storage recommendation

The current VM recommendation is:

- 40 GiB primary virtual disk or larger
- one additional virtual disk for backups after installation

Thin provisioning may allow a virtual disk to be provisioned at that size without consuming the full physical capacity immediately.

Network backup storage through NFS or SMB/CIFS is also supported by the JustVoxel VM appliance after installation.

## Bare Metal storage recommendation

For Bare Metal, 32 GiB remains the installer minimum, but larger system storage is strongly preferred.

A 64 GB or larger system device gives more comfortable working space. A 128 GB or larger SSD/NVMe gives substantially more room when Minecraft data also remains on the system disk.

Minecraft data and backups can later be placed on supported separate storage through the installed JustVoxel appliance.

## Minecraft workload boundary

The installer installs the JustVoxel operating-system image only.

It does not embed Minecraft server binaries, Mojang server software, a pre-created world, or pre-accepted Minecraft EULA state.

After JustVoxel boots, the administrator performs first setup through the appliance management layer. The separate Paper-based Minecraft server workload is then configured and deployed as a container according to the JustVoxel runtime policy.

This keeps the operating-system image, installation media, and Minecraft workload clearly separated.

## Artifact model

The workflow uploads the resulting ISO as a GitHub Actions artifact with a one-day retention period.

Current artifact names are based on the selected target:

```text
justvoxel-vm-installer
justvoxel-baremetal-installer
```

The downloaded artifact contains the installer ISO and `SHA256SUMS`.

The ISO itself is named:

```text
justvoxel-vm-installer.iso
justvoxel-baremetal-installer.iso
```

The ISO repository is intentionally an ISO factory rather than a long-term installer archive. When an artifact expires, the expected workflow is to build a fresh installer containing the currently selected and verified JustVoxel image.

## Build summary

The workflow records useful build information in the GitHub Actions run summary, including the selected target, exact resolved image digest, bootc tracking reference, access method, timezone, keyboard layout, partition settings, and artifact location.

## Documentation boundary

The documentation is split deliberately:

- repository README — normal installation path and requirements
- [SSH.md](SSH.md) — SSH key creation and access guidance for new users
- this document — installer implementation and design reasoning
- [JustVoxel](https://github.com/home-server-project/justvoxel) — appliance architecture, runtime, `mjust`, storage, backup, restore, and system management

Installation belongs here. Day-to-day appliance administration belongs in the JustVoxel repository.
