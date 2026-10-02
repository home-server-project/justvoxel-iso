# JustVoxel WebUI source overrides

The installer Containerfile builds Anaconda WebUI 68 from
`rhinstaller/anaconda-webui` commit
`a8745f07a18f303375351f3ba577d73108f5163d`, with Cockpit helpers from
`92e0108df1034207bcf7852c7747707d7da044ac`.
The upstream WebUI gitlink pins `rhinstaller/node-cache` to
`1a725c2d19e1bd6ed77702953fd7c97160a9a037`; its `.package-lock.json` is the
lockfile that upstream's `tools/node-modules make_package_lock_json` copies.
The builder extracts that lockfile, confirms the matching package manifest,
and uses `npm ci`. Build tools and sources stay in the Fedora 44 builder stage.
Only `dist/` replaces `/usr/share/cockpit/anaconda-webui/` in the final stage;
the distro RPM continues to provide Firefox and Anaconda/Cockpit integration.

`justvoxel.patch` modifies only wizard composition, the storage-editor launcher
and its prop plumbing, Installation method choices, and the review Account row.
`src/components/justvoxel/JustVoxelPages.jsx` supplies the edition and login
information pages. Upstream source headers remain intact when the patch applies.
No upstream repository, dependencies, or compiled assets are vendored here.

Visible navigation is Welcome, Date and time, JustVoxel edition, Installation
method, Login information, and Review and install. Installation progress keeps
upstream's final non-navigation behavior. `90-justvoxel.conf` hides both storage
configuration pages and the stock account/software pages.

HWS is preselected; VM is disabled and never changes the payload. Login
information and the review Account value describe the development voxel/voxel
bootstrap account. Neither page writes user configuration; account creation,
locked root, and mandatory first-login password change remain in
`interactive-defaults.ks`.

Manual partitioning uses the same launch hook as the existing kebab-menu entry.
It preserves the upstream confirmation warning, Cockpit editor, and
`CheckStorageDialog` return path. A valid configured layout remains the upstream
`use-configured-storage` manual scenario. Technical manual scenarios are not
duplicated as radio choices; other automatic scenarios retain their upstream
availability rules. Selecting Manual partitioning again reopens the editor.

Automatic partitioning uses GPT and plain ext4 root, growing from 8 GiB without
a maximum, with no separate home or disk swap. Anaconda/Blivet supplies the
platform boot partitions and their sizes. Encryption is not enabled by default.
The installer environment's NAME/PRETTY_NAME presentation fields supply product
text while Fedora platform identity and the installed payload remain unchanged.

This edit-only change has not been built, tested, or booted. Review and manual
Mode B validation must cover the wizard order, product text, Firefox chrome,
backgrounds, bootstrap account, blank-disk automatic layout, and the storage
editor warning/validation/return behavior before accepting the next ISO.
