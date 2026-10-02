/*
 * Copyright (C) 2026 Home Server Project
 * SPDX-License-Identifier: LGPL-2.1-or-later
 */
import cockpit from "cockpit";

import React, { useEffect } from "react";
import { Content } from "@patternfly/react-core/dist/esm/components/Content/index.js";
import { DescriptionList, DescriptionListDescription, DescriptionListGroup, DescriptionListTerm } from "@patternfly/react-core/dist/esm/components/DescriptionList/index.js";
import { Form, FormGroup } from "@patternfly/react-core/dist/esm/components/Form/index.js";
import { Radio } from "@patternfly/react-core/dist/esm/components/Radio/index.js";
import { Title } from "@patternfly/react-core/dist/esm/components/Title/index.js";
import { Stack } from "@patternfly/react-core/dist/esm/layouts/Stack/index.js";

const _ = cockpit.gettext;

const useAlwaysValid = (setIsFormValid) => {
    useEffect(() => {
        setIsFormValid(true);
    }, [setIsFormValid]);
};

const JustVoxelEdition = ({ idPrefix, setIsFormValid }) => {
    useAlwaysValid(setIsFormValid);

    // This page never changes the bootc source: this build contains HWS only.
    return (
        <Form onSubmit={event => event.preventDefault()}>
            <FormGroup label={_("Choose your JustVoxel edition")} isStack>
                <Radio
                  id={idPrefix + "-hws"}
                  name="justvoxel-edition"
                  label="JustVoxel HWS 10"
                  description={_("Hardware Support edition.")}
                  isChecked
                  onChange={() => {}}
                />
                <Radio
                  id={idPrefix + "-vm"}
                  name="justvoxel-edition"
                  label="JustVoxel VM 10"
                  description={_("Not available in this build")}
                  isChecked={false}
                  isDisabled
                />
            </FormGroup>
        </Form>
    );
};

const LoginInformation = ({ setIsFormValid }) => {
    useAlwaysValid(setIsFormValid);

    // Informational only: interactive-defaults.ks owns all account settings.
    return (
        <Stack hasGutter>
            <Title headingLevel="h3">{_("Default administrator account")}</Title>
            <DescriptionList isHorizontal>
                <DescriptionListGroup>
                    <DescriptionListTerm>{_("Username")}</DescriptionListTerm>
                    <DescriptionListDescription>voxel</DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                    <DescriptionListTerm>{_("Initial password")}</DescriptionListTerm>
                    <DescriptionListDescription>voxel</DescriptionListDescription>
                </DescriptionListGroup>
            </DescriptionList>
            <Content>
                <Content component="p">{_("The password must be changed at first login.")}</Content>
                <Content component="p">{_("Root password login is disabled.")}</Content>
                <Content component="p">{_("These are development bootstrap credentials.")}</Content>
            </Content>
        </Stack>
    );
};

export class EditionPage {
    constructor () {
        this.component = JustVoxelEdition;
        this.id = "anaconda-screen-justvoxel-edition";
        this.label = _("JustVoxel edition");
        this.title = _("JustVoxel edition");
    }
}

export class LoginInformationPage {
    constructor () {
        this.component = LoginInformation;
        this.id = "anaconda-screen-justvoxel-login";
        this.label = _("Login information");
        this.title = _("Login information");
    }
}
