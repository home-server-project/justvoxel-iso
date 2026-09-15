# JustVoxel ISO Builder

JustVoxel ISO Builder creates unattended installation media for [JustVoxel](https://github.com/home-server-project/justvoxel), the Home Server Project's immutable server appliance for running and managing a separate Minecraft server workload.

> **Development status:** the installer is under active development on the `testing` branch. Current builds install JustVoxel `:testing` images and are intended for VM and hardware validation before stable release.

## What this repository does

This repository builds the installer ISO. It is not the source of the JustVoxel operating-system image itself.

The installer places one selected JustVoxel bootc image directly onto the target disk:

- **JustVoxel VM** — for virtual machines and hypervisors
- **JustVoxel Bare Metal** — for physical hardware

The installed system is JustVoxel from the first boot. There is no general-purpose Linux installation followed by a conversion step.

The installer installs the JustVoxel operating system only. It does **not** contain Minecraft server binaries, Mojang server software, a pre-created world, or pre-accepted Minecraft EULA state. The separate Paper-based Minecraft server workload is configured and deployed later through JustVoxel setup.

## Before you start

You should be comfortable with basic computer tasks such as creating a VM or bootable USB, choosing a disk, finding a machine's IP address, and following installation instructions.

You do not need deep Linux administration knowledge to use JustVoxel.

### Current platform target

The current installer is designed for:

- x86_64 / amd64 systems
- UEFI boot
- a dedicated installation disk that may be erased
- VM or Bare Metal installation

## Recommended hardware

JustVoxel itself is lightweight, but the separate Minecraft server workload benefits from reasonable CPU, RAM, and fast storage.

### Memory

- **Minimum recommended:** 8 GiB RAM
- **Recommended for normal use:** 12–16 GiB RAM

Systems below 8 GiB are not deliberately blocked, but Minecraft performance may be limited depending on player count, world size, plugins, view distance, simulation distance, cross-play, and other workload choices.

### CPU

A sensible starting point is a modern x86_64 CPU with about 4 available CPU threads or vCPUs.

Minecraft benefits strongly from good single-thread CPU performance. More players, plugins, world generation, and cross-play may benefit from additional CPU resources.

### Storage

The installer requires at least a 32 GiB root filesystem.

For a VM, the current recommendation is:

- 40 GiB primary virtual disk or larger
- a second virtual disk for backups after installation, or network backup storage

For Bare Metal, 64 GB or larger system storage is more comfortable, and 128 GB or larger SSD/NVMe storage gives more room if Minecraft data will also remain on the system disk.

The 32 GiB minimum is an appliance-system minimum, not a guarantee that every long-lived Minecraft world will fit on the system disk forever.

For the technical reasoning behind the disk layout and minimum, see [`docs/INSTALLER-DESIGN.md`](docs/INSTALLER-DESIGN.md).

## Choose VM or Bare Metal

Choose **VM** when JustVoxel will run inside a hypervisor such as:

- KVM/libvirt
- Proxmox
- VMware
- Hyper-V
- VirtualBox
- similar virtual-machine platforms

Choose **Bare Metal** when JustVoxel will be installed directly on a physical computer.

Both variants use the same core appliance and the same normal JustVoxel management experience. Bare Metal adds physical-machine administration support that is unnecessary inside a VM.

## Decide how you will log in

The current installer workflow supports:

- temporary password login
- SSH public-key login
- both password and SSH public-key login

The workflow refuses to build an installer with no usable login method.

The installed administrative user is:

```text
voxel
```

If password login is enabled in the current development workflow, the temporary default password is also `voxel`. Change it after the first successful boot.

SSH is recommended for normal remote administration. If you do not already know how SSH keys work, use the beginner guide:

[`docs/SSH.md`](docs/SSH.md)

Only a public SSH key belongs in the builder. Never upload your private SSH key.

## Build the installer ISO

The current development workflow is **Build JustVoxel installer ISO** under GitHub Actions.

For project testing, run the workflow from the `testing` branch.

If you are using your own fork or repository copy, enable GitHub Actions if GitHub asks you to do so first.

Before running the workflow, add the `SSH_PUBLIC_KEY` repository secret only if you want the ISO to install your SSH public key.

Then open the workflow and choose the installation options.

Important choices include:

- VM or Bare Metal target
- image signature verification
- password login on or off
- SSH-key installation on or off
- timezone
- keyboard layout
- EFI partition size
- `/boot` size
- root size
- whether root grows to fill remaining disk space

For most users, the defaults are the correct starting point.

The development workflow currently resolves and installs the corresponding JustVoxel `:testing` image.

## Download the finished ISO

When the workflow succeeds, download the GitHub Actions artifact for the selected target.

Current artifact names are:

```text
justvoxel-vm-installer
justvoxel-baremetal-installer
```

The artifact contains the installer ISO and a SHA256 checksum file.

The ISO itself is named:

```text
justvoxel-vm-installer.iso
justvoxel-baremetal-installer.iso
```

Artifacts are retained for **1 day**. If the artifact has expired, build a fresh ISO rather than treating this repository as a permanent ISO archive.

## Installation warning

The installer is destructive to the selected installation disk.

Anything on that target disk may be lost.

For a VM, the safest starting layout is one blank virtual disk for the operating-system installation. Add a second virtual disk for backups after JustVoxel is installed if you want that layout.

For Bare Metal, disconnect non-target storage devices before installation whenever practical. This reduces the chance of selecting or exposing a disk that contains data you want to keep.

Keep backups of anything important before installing an operating system.

## Install in a VM

A simple VM installation flow is:

1. Create a new x86_64 UEFI virtual machine.
2. Give it at least 8 GiB RAM for a realistic JustVoxel test or deployment.
3. Give it about 4 vCPUs as a practical starting point.
4. Create one blank 40 GiB or larger primary virtual disk.
5. Attach the JustVoxel VM installer ISO.
6. Boot from the ISO.
7. Allow the unattended installation to complete.
8. Power off or reboot as instructed by the installer environment.
9. Detach the installer ISO so the VM boots from its installed disk.
10. Add a separate backup virtual disk afterward if desired.

After the installed system boots, connect to JustVoxel and continue with first setup.

## Install on physical hardware

A simple Bare Metal installation flow is:

1. Back up any important data from the target computer.
2. Disconnect non-target storage devices whenever practical.
3. Write the Bare Metal installer ISO to a USB drive with a normal ISO-writing tool.
4. Boot the machine from that USB drive in UEFI mode.
5. Allow the unattended installation to complete.
6. Remove the installer USB before the installed system boots again if necessary.
7. Reconnect additional storage only after the JustVoxel operating system has been installed and verified.

Additional storage can then be configured through JustVoxel rather than through a complicated installer storage screen.

## First boot

After installation, let JustVoxel boot from its system disk.

Find the appliance IP address from your router, hypervisor, DHCP server, or local console.

If you installed an SSH key, connect with:

```text
ssh voxel@SERVER_IP
```

If you used the temporary development password, log in as `voxel` and change that password after first access.

Then run:

```text
mjust
```

The interactive JustVoxel interface will guide you through appliance setup and normal administration.

Minecraft/Paper is still a separate workload at this point. It is not preinstalled as Minecraft server binaries in the JustVoxel OS image. The active server workload is created later through the JustVoxel setup flow after the administrator accepts the Minecraft EULA.

## Storage after installation

Installation and application storage are deliberately separate concerns.

The installer creates the JustVoxel system disk. After installation, `mjust` can manage supported storage choices for Minecraft data and backups, including supported local storage and NFS/SMB network targets.

For normal storage administration, use the main JustVoxel documentation:

[JustVoxel storage guide](https://github.com/home-server-project/justvoxel/blob/testing/docs/STORAGE.md)

## Why the installer stays simple

The installer is meant to answer one question safely: how do I get JustVoxel onto this VM or physical computer?

It does not try to become a full storage-management environment or a general-purpose Linux installer.

Advanced storage layout, Minecraft data placement, backup targets, migration, server configuration, and operating-system maintenance belong to the installed JustVoxel appliance and `mjust`.

That keeps installation easier to understand and keeps day-to-day administration in one place after the machine is running.

## Technical installer details

Normal users do not need to understand how the ISO is assembled.

Maintainers and advanced users can read [`docs/INSTALLER-DESIGN.md`](docs/INSTALLER-DESIGN.md) for:

- bootc image resolution and tracking
- Cosign verification
- bootc-image-builder behavior
- installer-container design
- partition-layout reasoning
- access validation
- artifact behavior
- the separation between installation media, the JustVoxel OS image, and the later Minecraft workload

## Project documentation

- [JustVoxel](https://github.com/home-server-project/justvoxel) — appliance overview and source
- [JustVoxel mjust guide](https://github.com/home-server-project/justvoxel/blob/testing/docs/MJUST.md) — appliance administration
- [JustVoxel architecture](https://github.com/home-server-project/justvoxel/blob/testing/docs/ARCHITECTURE.md) — why the system is built this way
- [`docs/SSH.md`](docs/SSH.md) — create and use an SSH key
- [`docs/INSTALLER-DESIGN.md`](docs/INSTALLER-DESIGN.md) — installer internals and design reasoning

## Development and stable channels

Current ISO development uses JustVoxel `:testing` images.

Stable installer media is intended to use:

```text
ghcr.io/home-server-project/justvoxel-vm:10
ghcr.io/home-server-project/justvoxel-baremetal:10
```

Stable use should wait for the JustVoxel images and installer path to complete validation and promotion.
