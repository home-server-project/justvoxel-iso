/*
 * Copyright (C) 2026 Home Server Project
 * SPDX-License-Identifier: LGPL-2.1-or-later
 */
import cockpit from "cockpit";

import { getActivePayload, PayloadsClient } from "./payloads.js";

const DBUS_PROPERTIES = "org.freedesktop.DBus.Properties";
const PAYLOAD_INTERFACE = "org.fedoraproject.Anaconda.Modules.Payloads.Payload";
const SOURCE_INTERFACE = "org.fedoraproject.Anaconda.Modules.Payloads.Source";
const BOOTC_INTERFACE = "org.fedoraproject.Anaconda.Modules.Payloads.Source.Bootc";

export const JUSTVOXEL_IMAGE_REFS = {
    hws: "registry:ghcr.io/home-server-project/justvoxel-hws:testing",
    vm: "registry:ghcr.io/home-server-project/justvoxel-vm:testing",
};

const getClient = () => {
    const client = PayloadsClient.instance?.client;
    if (!client) {
        throw new Error("Anaconda payload service is not available");
    }
    return client;
};

const getProperty = async (client, objectPath, interfaceName, propertyName) => {
    const result = await client.call(
        objectPath,
        DBUS_PROPERTIES,
        "Get",
        [interfaceName, propertyName]
    );
    return result[0].v;
};

const findBootcSource = async (client) => {
    const activePayload = await getActivePayload();
    const sources = await getProperty(client, activePayload, PAYLOAD_INTERFACE, "Sources");

    for (const source of sources) {
        const sourceType = await getProperty(client, source, SOURCE_INTERFACE, "Type");
        if (sourceType === "BOOTC") {
            return source;
        }
    }

    throw new Error("Active Anaconda payload has no BOOTC source");
};

export const setJustVoxelEdition = async (edition) => {
    const imageRef = JUSTVOXEL_IMAGE_REFS[edition];
    if (!imageRef) {
        throw new Error("Unknown JustVoxel edition");
    }

    const client = getClient();
    const bootcSource = await findBootcSource(client);
    const current = await getProperty(client, bootcSource, BOOTC_INTERFACE, "Configuration");

    const configuration = {
        stateroot: cockpit.variant("s", current.stateroot?.v || ""),
        sourceImgRef: cockpit.variant("s", imageRef),
        targetImgRef: cockpit.variant("s", imageRef),
    };

    await client.call(
        bootcSource,
        DBUS_PROPERTIES,
        "Set",
        [
            BOOTC_INTERFACE,
            "Configuration",
            cockpit.variant("a{sv}", configuration),
        ]
    );

    return imageRef;
};
