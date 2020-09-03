/*
 * Copyright (c) 2019 Texas Instruments Incorporated - http://www.ti.com
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
 *  ======== dmm_common.js ========
 */

"use strict";

const docs = system.getScript("/ti/dmm/dmm_docs.js");
const easylinkUtil = system.getScript("/ti/easylink/easylink_common.js");

// Max number of application states
const maxAppStatesSupported = 32;

// DMM allows more than 32 policies, but above 32 policies in practice would
// not be used in general
const maxDMMPoliciesSupported = 32;

// Max number of stack roles
const maxStackRoles = 2;

// Function argument options labeled for readability
const options = {
    HIDDEN: true,
    NOT_HIDDEN: false,
    TEXT: true,
    BOOLEAN: false
};

const stackDisplayNames = {
    ti154Collector: "15.4 Collector",
    ti154Sensor: "15.4 Sensor",
    blePeripheral: "BLE Peripheral",
    custom1: "Custom 1",
    custom2: "Custom 2",
    rxAlwaysOn: "RX Always On",
    wsnNode: "WSN Node",
    zigbeeEndDevice: "Zigbee End Device",
    zigbeeRouter: "Zigbee Router",
    zigbeeCoordinator: "Zigbee Coordinator"
};

// Settings for ti/devices/CCFG module
const dmmCCFGSettings = {
    CC1312R1_LAUNCHXL_CCFG_SETTINGS: {},
    CC1352R1_LAUNCHXL_CCFG_SETTINGS: {},
    CC1352P1_LAUNCHXL_CCFG_SETTINGS: {},
    CC1352P_2_LAUNCHXL_CCFG_SETTINGS: {},
    CC1352P_4_LAUNCHXL_CCFG_SETTINGS: {},
    CC26X2R1_LAUNCHXL_CCFG_SETTINGS: {},
    CC2652RB_LAUNCHXL_CCFG_SETTINGS: {}
};

const boardName = easylinkUtil.getDeviceOrLaunchPadName(true);
const ccfgSettings = dmmCCFGSettings[boardName + "_CCFG_SETTINGS"];

/**
 *  ======== stackRoles ========
 *  Returns the protocol stack roles configurable object
 *
 *  @param isHidden  - Indicates if the configurable should be hidden by default
 *  @returns         - The protocol stack roles configurable object
 */
function stackRoles(isHidden)
{
    return({
        name: "stackRoles",
        displayName: "Protocol Stack Roles",
        description: docs.stackRoles.description,
        longDescription: docs.stackRoles.longDescription,
        default: ["custom1", "custom2"],
        hidden: isHidden,
        options: [{
            name: "ti154Collector",
            displayName: stackDisplayNames.ti154Collector
        },
        {
            name: "ti154Sensor",
            displayName: stackDisplayNames.ti154Sensor
        },
        {
            name: "blePeripheral",
            displayName: stackDisplayNames.blePeripheral
        },
        {
            name: "custom1",
            displayName: stackDisplayNames.custom1
        },
        {
            name: "custom2",
            displayName: stackDisplayNames.custom2
        },
        {
            name: "rxAlwaysOn",
            displayName: stackDisplayNames.rxAlwaysOn
        },
        {
            name: "wsnNode",
            displayName: stackDisplayNames.wsnNode
        },
        {
            name: "zigbeeEndDevice",
            displayName: stackDisplayNames.zigbeeEndDevice
        },
        {
            name: "zigbeeRouter",
            displayName: stackDisplayNames.zigbeeRouter
        },
        {
            name: "zigbeeCoordinator",
            displayName: stackDisplayNames.zigbeeCoordinator
        }]
    });
}

/*
 *  ======== exports ========
 *  Export common components
 */
exports = {
    stackRoles: stackRoles,
    options: options,
    stackDisplayNames: stackDisplayNames,
    ccfgSettings: ccfgSettings,
    maxAppStatesSupported: maxAppStatesSupported,
    maxStackRoles: maxStackRoles,
    maxDMMPoliciesSupported: maxDMMPoliciesSupported
};
