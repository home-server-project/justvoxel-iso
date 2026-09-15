# JustVoxel ISO Builder

Build a lightweight unattended installer ISO for [JustVoxel](https://github.com/home-server-project/justvoxel), the Home Server Project's immutable Minecraft server appliance.

> **Development status:** this repository is being prepared as the JustVoxel ISO factory. The intended design follows the proven Pasiv Black Box ISO-builder approach: a short-lived bootc installer ISO built in GitHub Actions, without a desktop environment or full graphical interactive installer.

The final builder will let the administrator choose between the two JustVoxel appliance images:

- **VM — Virtual machine / hypervisor**
- **Bare Metal — Physical hardware**

The installed operating system comes from the selected JustVoxel bootc image. This repository is an installer factory, not the source of the JustVoxel operating-system image itself.

## Planned image targets

Stable installer builds are intended to install one of:

```text
ghcr.io/home-server-project/justvoxel-vm:10
ghcr.io/home-server-project/justvoxel-baremetal:10
```

Development testing uses the corresponding `:testing` images.

The ISO workflow is planned to resolve the selected moving tag to an immutable digest, verify the selected JustVoxel image with the project Cosign public key, embed that exact image content into the installer, and preserve the selected tag as the installed system's future bootc update tracking reference.

## Installation model

JustVoxel deliberately uses a simple unattended installer rather than a desktop-based graphical installer.

The planned installer remains UEFI/x86_64 oriented and uses a simple GPT layout:

| Mount point | Filesystem | Default |
| --- | --- | ---: |
| `/boot/efi` | EFI System Partition | 512 MiB |
| `/boot` | XFS | 1 GiB |
| `/` | XFS | minimum 32 GiB, grows by default |
| swap | none | not created |

The root filesystem grows to use the remaining installation disk by default. A future workflow option will retain the ability to disable root growth, leaving unused disk space unallocated for an administrator who deliberately wants to create another partition later with JustVoxel storage tooling.

## Why the root minimum is 32 GiB

The 32 GiB root minimum is an **appliance-system minimum**, not a statement that every Minecraft world will fit comfortably inside 32 GiB forever.

JustVoxel needs room for more than one static OS image. A healthy bootc lifecycle may temporarily involve:

- the currently booted deployment
- the previous deployment retained for rollback
- a newer deployment staged for the next boot
- changed image content downloaded while an update is prepared

Bootc deployments share unchanged content, so this does not mean three complete independent copies of the operating system. The appliance still needs enough free space for larger AlmaLinux/JustVoxel updates and staging operations.

Root storage also holds normal appliance state such as:

- Podman image storage
- the active Minecraft container image
- one previous Minecraft container image retained by JustVoxel for rollback safety
- Paper/plugins and runtime files
- logs and normal `/var` state
- temporary update/import working space
- Minecraft persistent data when the administrator chooses to keep the world on the system filesystem

For that reason, the project currently treats **32 GiB root as the minimum safe design target**, with additional space strongly preferred.

## VM disk recommendation

For a VM, the current recommendation is:

- **40 GiB primary virtual disk or larger**
- **one additional virtual disk for backups**

The second virtual disk is the recommended backup layout because it is simple, portable across hypervisors, and keeps the backup target separate from the primary virtual disk.

NFS and SMB/CIFS backup targets are also supported by the JustVoxel VM image.

A thin-provisioned 40 GiB virtual disk does not necessarily consume 40 GiB of physical storage immediately on the hypervisor.

For a very small test VM, smaller storage may technically boot, but it is not the supported design target because it leaves too little working room for bootc updates, retained deployments, container images, logs, and Minecraft data.

## Bare Metal storage recommendation

For Bare Metal, **32 GiB root remains the minimum design target**, but larger system storage is preferable.

A 64 GB or larger system device provides more comfortable room when Minecraft data also stays on the OS disk. A 128 GB or larger SSD/NVMe gives considerably more flexibility for world growth, bootc updates, and future storage layout choices.

JustVoxel can also place Minecraft persistent data on separate local storage and can use separate internal storage, USB storage, NFS, or SMB/CIFS for backups.

## Minecraft world size is not fixed

Minecraft storage use is workload-dependent.

A new small family server may use relatively little persistent storage, but world data grows as players explore new terrain. More players, longer server lifetime, large exploration distances, additional dimensions, plugins, generated maps, and other server-side data can all increase the persistent-data footprint.

Because of that, JustVoxel **cannot promise that a 32 GiB root filesystem will remain sufficient for the Minecraft world itself**.

The 32 GiB number is intended to give the appliance operating system, bootc deployments, Podman, and a modest Minecraft installation enough operating room. It is not a maximum-world-size recommendation.

Administrators expecting a long-lived or heavily explored world should use a larger system disk or place Minecraft persistent data on separate storage.

## Backup storage is separate from world storage

Minecraft data and Minecraft backups are independent storage choices.

For VM, the preferred layout is:

- primary virtual disk — JustVoxel OS and Minecraft data
- secondary virtual disk — Minecraft backups

For Bare Metal, backup targets may include:

- another internal disk
- an external USB disk or USB stick
- an existing dedicated partition
- a new partition created from already-unallocated space
- NFS
- SMB/CIFS
- a normal directory on the system filesystem

A backup partition on the same physical disk can help with some reinstall or configuration mistakes, but it does not protect against failure of that physical disk. A separate disk, USB device, second virtual disk with independent hypervisor protection, or network share gives a stronger failure boundary.

## Practical CPU and memory guidance

JustVoxel is lightweight as an operating-system appliance, but Minecraft itself benefits from decent CPU performance and enough RAM.

These values are **practical project guidance**, not hard protocol limits, and will be refined during VM and Bare Metal validation.

### Small family server

A sensible starting point is:

- modern x86_64 CPU
- **4 vCPU / CPU threads available to the VM or appliance**
- **8 GiB RAM minimum practical target**
- fast SSD/NVMe storage preferred for the Minecraft world

With 8 GiB host RAM, the current JustVoxel setup logic suggests approximately a 4 GiB Java heap and 6 GiB Minecraft-container memory limit.

### Recommended comfortable target

For a server expected to handle several players, plugins, cross-play, exploration, backups, and normal maintenance comfortably:

- modern CPU with strong single-thread performance
- **4-6 or more CPU threads available**
- **16 GiB RAM**
- SSD/NVMe-backed Minecraft data

With 16 GiB host RAM, current JustVoxel setup logic suggests approximately a 6 GiB Java heap and 8 GiB Minecraft-container memory limit.

More CPU/RAM does not replace the need for sensible Minecraft configuration. Server view distance, simulation distance, plugins, world generation, and player behavior can materially change resource use.

## VM versus Bare Metal

Choose **VM — Virtual machine / hypervisor** for environments such as:

- KVM/libvirt
- Proxmox
- VMware
- Hyper-V
- VirtualBox
- similar hypervisors

The VM image contains the Minecraft appliance core plus lightweight guest integration and intentionally excludes physical-hardware administration packages that do not make sense inside a VM.

Choose **Bare Metal — Physical hardware** when JustVoxel is installed directly on a physical machine.

The Bare Metal image adds physical-machine administration support including SMART/NVMe tooling, sensors, NUT, USB/PCI diagnostics, firmware tooling, Wi-Fi/firmware support, CPU microcode support, hdparm, and related utilities.

## Planned default identity

The planned unattended installer defaults are:

```text
hostname: justvoxel
user:     voxel
groups:   wheel
```

Root login remains locked.

The ISO-builder workflow is planned to retain the same access model proven by the Pasiv Black Box builder:

- temporary default password login may be enabled
- SSH public-key login may be injected from a repository secret
- the workflow must reject a configuration that would create no usable login method

The default password, when enabled, is intended only for first access and should be changed immediately after the first successful boot.

## Destructive installer model

The planned installer intentionally keeps the same simple safety model as the Pasiv Black Box ISO builder.

For a VM, create the VM initially with **one blank installation disk**. Add the backup virtual disk after the operating-system installation if desired.

For Bare Metal, the safest installation procedure is to disconnect every non-target storage device before booting the unattended ISO.

This avoids asking the installer to guess which of several disks contains data that must be preserved.

After JustVoxel is installed and verified, additional storage can be attached/reconnected and managed through `mjust`.

## Planned ISO-builder options

The builder is intended to keep the useful controls from the Pasiv Black Box ISO project while adding JustVoxel image selection.

Planned workflow options include:

- **Install target:** VM or Bare Metal
- verify selected image signature
- enable/disable temporary password login
- optional SSH public key from repository secret
- timezone
- keyboard layout
- EFI partition size
- `/boot` partition size
- root minimum size
- grow root to remaining disk space

The installer should stay intentionally simple. Advanced storage design belongs to the installed JustVoxel appliance and `mjust`, not to a large graphical installer environment.

## Short-lived ISO artifacts

The intended builder behavior is to produce the installer ISO and `SHA256SUMS` as a short-lived GitHub Actions artifact.

The ISO repository is an **ISO factory, not a permanent ISO archive**. The planned artifact-retention policy is one day; when an artifact expires, the correct workflow is to build a fresh ISO containing the current verified JustVoxel image.

## Planned artifact names

The selected target should be obvious from the downloaded file:

```text
justvoxel-vm-installer.iso
justvoxel-baremetal-installer.iso
```

The workflow summary should also report the selected variant, exact embedded image digest, bootc tracking reference, partition settings, and login method.

## Project repositories

- [JustVoxel](https://github.com/home-server-project/justvoxel) — appliance images, Minecraft runtime, `mjust`, storage and management logic
- [JustVoxel ISO Builder](https://github.com/home-server-project/justvoxel-iso) — lightweight installer ISO factory

The ISO Builder is intended to become a GitHub template repository so users can create their own builder repository, configure an SSH public-key secret if desired, and build a personal JustVoxel installer without maintaining an ISO locally.

## Current next step

Before the ISO workflow itself is treated as ready, the existing JustVoxel VM image and storage/migration flows should be validated in disposable VMs. The ISO builder can then be implemented against behavior that has already been proven rather than assumptions about the appliance.
