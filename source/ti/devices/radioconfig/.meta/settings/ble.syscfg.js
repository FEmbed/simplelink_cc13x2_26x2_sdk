/*
 * Copyright (c) 2019-2020 Texas Instruments Incorporated - http://www.ti.com
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * *  Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *
 * *  Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * *  Neither the name of Texas Instruments Incorporated nor the names of
 *    its contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

/*
 *  ======== ble.syscfg.js ========
 *  Radio configuration support for BLE settings.
 */

"use strict";

/* Common utility functions */
const Common = system.getScript("/ti/devices/radioconfig/radioconfig_common.js");

/* Device information */
const DevInfo = Common.getScript("device_info.js");

/* PHY group */
const PHY_GROUP = Common.PHY_BLE;
DevInfo.addPhyGroup(PHY_GROUP);

/* Base module for RF Settings */
const RFBase = Common.getScript("radioconfig");

/* Command handler: contains RF command data */
const CmdHandler = Common.getScript("cmd_handler.js");

/* Documentation */
const BleDocs = Common.getScript("settings/ble_docs.js");
const SharedDocs = Common.getScript("settings/shared_docs.js");

/* Setting specific configurable */
const tmp = system.getScript(DevInfo.getSyscfgParams(PHY_GROUP));
const config = _.cloneDeep(tmp);

const highPaSupport = DevInfo.hasHighPaSupport();
let hasWBMS = false;

const settingSpecific = {
    displayName: "RF Settings BLE",
    description: "RF Settings BLE",
    longDescription: "RF Settings module for Bluetooth Low Energy protocol",
    validate: validate,
    hasWBMS: () => hasWBMS,
    phyGroup: PHY_GROUP,
    config: config
};

const phyOptions = getPhyOptions();
addPhyConfigurable();

/* Add high PA configurable if required */
if (highPaSupport) {
    RFBase.addTxPowerConfigHigh(config);
}

/*!
 *  ======== validate ========
 *  Validate this module's configuration
 *
 *  @param inst       - RF Settings instance to be validated
 *  @param validation - Issue reporting object
 */
function validate(inst, validation) {
    /* Validation common to all PHY groups */
    Common.validateBasic(inst, validation);
    const phyType = inst.phyType;
    hasWBMS = phyType.includes("wbms");

    if (inst.paramVisibility && !hasWBMS) {
        RFBase.validateRfParams(inst, validation, phyType, PHY_GROUP);
    }

    // Check if a wBMS setting is included
    const instances = inst.$module.$instances;
    for (let i = 0; i < instances.length && !hasWBMS; i++) {
        const vinst = instances[i];
        if (vinst.phyType.includes("wbms")) {
            hasWBMS = true;
        }
    }
}

/*
 *  ======== getPhyOptions ========
 *  Create PHY options list
 *
 *  @returns - list of PHY options for the configurable
 */
function getPhyOptions() {
    const opts = [];
    const settingMap = DevInfo.getSettingMap(PHY_GROUP);
    _.each(settingMap, (s) => {
        const phyType = s.name;
        opts.push({
            name: phyType,
            displayName: s.description
        });
    });
    return opts;
}

/*
 *  ======== addPhyConfigurable ========
 *  Add a PHY Type configurable
 *
 */
function addPhyConfigurable() {
    config.unshift({
        name: "phyType",
        displayName: "Phy Type",
        description: "Selects the PHY/setting",
        options: phyOptions,
        default: phyOptions[0].name,
        onChange: (inst, ui) => {
            const phyType = inst.phyType;
            updatePDUConfig(inst, ui);

            // Refresh the instance
            RFBase.reloadInstanceFromPhy(inst, ui, phyType, PHY_GROUP, ["txPower", "txPowerHi"]);

            // Hide whitening if wBMS setting
            hasWBMS = phyType.includes("wbms");
            ui.whitening.hidden = hasWBMS;
        }
    });
}

/*!
 *  ======== onPermissionsChange ========
 *  Change permission according to permission configurable
 */
function onPermissionsChange(inst, ui) {
    // PHY type:
    // - always ReadOnly with a Custom stack
    // - otherwise controlled by the 'permission' configurable
    const freqReadOnly = inst.permission === "ReadOnly" || inst.parent === "Custom";
    ui.phyType.readOnly = freqReadOnly;
}

/*!
 *  ======== onVisibilityChange ========
 *  Change visibility of RF parameters
 */
function onVisibilityChange(inst, ui) {
    const cmdHandler = CmdHandler.get(PHY_GROUP, inst.phyType);
    const rfData = cmdHandler.getRfData();
    const hidden = !inst.paramVisibility;

    _.each(rfData, (value, key) => {
        if (!("highPA" in inst && key.includes("txPower"))) {
            ui[key].hidden = hidden;
        }
    });
}

/*!
 *  ======== updatePDUConfig ========
 *  Either shows or hides the PDU config if the phyType supports it
 */
function updatePDUConfig(inst, ui) {
    ui.packetLengthBle.hidden = inst.phyType !== "bt5le1madvnc";
}

/*!
 *  ======== extend ========
 *  Extends BLE object to include RF Basic module
 *
 */
function extend(base) {
    /* Add permission configurable */
    RFBase.addPermission(settingSpecific.config, onPermissionsChange);

    /* Add configurable to control visibility of RF parameters */
    RFBase.addVisibilityConfig(settingSpecific.config, onVisibilityChange);

    /* Initialize state of UI elements (readOnly when appropriate) */
    Common.initLongDescription(settingSpecific.config, BleDocs.bleDocs);
    Common.initLongDescription(settingSpecific.config, SharedDocs.sharedDocs);

    /* Make sure our copy of configurables is updated */
    const cmdHandler = CmdHandler.get(PHY_GROUP, phyOptions[0].name);
    cmdHandler.initConfigurables(settingSpecific.config);
    RFBase.pruneConfig(settingSpecific.config);

    return ({...base, ...settingSpecific});
}

exports = extend(RFBase);
