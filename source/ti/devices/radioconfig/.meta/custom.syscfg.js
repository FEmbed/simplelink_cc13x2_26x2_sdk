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
 *  ======== custom.syscfg.js ========
 */

"use strict";

// Common utility functions
const Common = system.getScript("/ti/devices/radioconfig/radioconfig_common.js");

// Other dependencies
const DeviceInfo = Common.getScript("device_info.js");
const CmdHandler = Common.getScript("cmd_handler.js");
const Docs = Common.getScript("radioconfig_docs.js");

// Manage PHY support
const hasProp = Common.HAS_PROP || Common.HAS_24G_PROP;
const hasBle = Common.HAS_BLE;
const hasIeee = Common.HAS_IEEE_15_4;

// Multi-stack validation module
const msValidationModule = "/ti/easylink/multi_stack_validate";
let msValidationPresent = true;
try {
    system.getScript(msValidationModule);
}
catch (err) {
    msValidationPresent = false;
}

// PHY information, grouped protocol/frequency band
const PhyInfo = {
    ble: {
        displayName: "BLE",
        protocol: Common.PHY_BLE,
        settings: []
    },
    ieee: {
        displayName: "IEEE 802.15.4",
        protocol: Common.PHY_IEEE_15_4,
        settings: []
    }
};

if (Common.HAS_PROP) {
    PhyInfo.prop1 = {
        displayName: "Proprietary (169 MHz)",
        protocol: Common.PHY_PROP,
        settings: []
    };
    PhyInfo.prop4 = {
        displayName: "Proprietary (420 - 527 MHz)",
        protocol: Common.PHY_PROP,
        settings: []
    };
    PhyInfo.prop8 = {
        displayName: "Proprietary (779 - 930 MHz)",
        protocol: Common.PHY_PROP,
        settings: []
    };
}

if (Common.HAS_24G_PROP) {
    PhyInfo.prop2 = {
        displayName: "Proprietary (2400 - 2480 MHz)",
        protocol: Common.PHY_PROP,
        settings: []
    };
}

// Add PHY settings depending on device name
if (hasProp) {
    const cfgs = DeviceInfo.getConfiguration(Common.PHY_PROP).configs;

    // PHY types are in positions 1 to 4 in the config array
    for (let i = 1; i <= 4; i++) {
        const cfg = cfgs[i];
        if (cfg.name === "phyType868" && "prop8" in PhyInfo) {
            PhyInfo.prop8.settings = cfg.options;
        }
        if (cfg.name === "phyType433" && "prop4" in PhyInfo) {
            PhyInfo.prop4.settings = cfg.options;
        }
        if (cfg.name === "phyType169" && "prop1" in PhyInfo) {
            PhyInfo.prop1.settings = cfg.options;
        }
        if (cfg.name === "phyType2400" && "prop2" in PhyInfo) {
            PhyInfo.prop2.settings = cfg.options;
        }
    }
}

if (hasBle) {
    const cfgs = DeviceInfo.getConfiguration(Common.PHY_BLE).configs;
    PhyInfo.ble.settings = cfgs[0].options;
}

if (hasIeee) {
    const cfgs = DeviceInfo.getConfiguration(Common.PHY_IEEE_15_4).configs;
    PhyInfo.ieee.settings = cfgs[0].options;
}

// Create configurables with checkbox options list
const config = [];

_.each(PhyInfo, (pi, key) => {
    const opts = pi.settings;

    if (opts.length > 0) {
        config.push({
            name: key,
            displayName: pi.displayName,
            description: "Select PHY settings to be included in the generated code",
            placeholder: "No " + pi.displayName + " PHY selected",
            minSelections: 0,
            options: pi.settings,
            default: []
        });
    }
});

/*
 *  ======== addRfSettingDependency ========
 *  Creates an RF setting dependency module
 *
 * @param phyGroup - PROP, BLE, IEEE 802.15.4
 * @param phy  - added PHY
 * @param displayName  - PHY name to display
 *
 * @returns dictionary - containing a single RF setting dependency module
 */
function addRfSettingDependency(phyGroup, phy, displayName) {
    const cmdHandler = CmdHandler.get(phyGroup, phy);
    const basePath = Common.basePath;
    const radioConfigArgs = {};
    let modName;

    // Set up module names and arguments
    if (phyGroup === Common.PHY_PROP) {
        const freqBand = cmdHandler.getFrequencyBand();
        if (freqBand === 868) {
            radioConfigArgs.freqBand = "868";
            radioConfigArgs.phyType868 = phy;
        }
        else if (freqBand === 433) {
            radioConfigArgs.freqBand = "433";
            radioConfigArgs.phyType433 = phy;
        }
        else if (freqBand === 169) {
            radioConfigArgs.freqBand = "169";
            radioConfigArgs.phyType169 = phy;
        }
        else if (freqBand === 2400) {
            radioConfigArgs.freqBand = "2400";
            radioConfigArgs.phyType2400 = phy;
        }
        modName = basePath + "settings/prop";
    }
    else if (phyGroup === Common.PHY_BLE) {
        modName = basePath + "settings/ble";
        radioConfigArgs.phyType = phy;
    }
    else if (phyGroup === Common.PHY_IEEE_15_4) {
        modName = basePath + "settings/ieee_15_4";
        radioConfigArgs.phyType = phy;
    }

    // Set parent NOT to be a protocol stack
    radioConfigArgs.parent = "Custom";

    // Force an update of the permissions configurable
    radioConfigArgs.permission = "ReadWrite";

    return ({
        name: "radioConfig" + phy,
        displayName: displayName,
        moduleName: modName,
        collapsed: true,
        args: radioConfigArgs
    });
}

/*
 *  ======== moduleInstances ========
 *  Determines what modules are added as non-static sub-modules
 *
 *  @param inst  - Module instance containing the config that changed
 *  @returns     - Array containing dependency modules
 */
function moduleInstances(inst) {
    const dependencyModule = [];
    // Iterate each PHY group
    _.each(PhyInfo, (pi, key) => {
        const pg = pi.protocol;
        const selected = inst[key];
        // Iterate each PHY setting in the group
        _.each(pi.settings, (phy) => {
            // Add module if selected
            if (selected.includes(phy.name)) {
                dependencyModule.push(addRfSettingDependency(pg, phy.name, phy.displayName));
            }
        });
    });
    return dependencyModule;
}

/*
 *  ======== modules ========
 *  Determines what modules are added as static sub-modules
 *
 *  @returns - Array containing dependency modules
 */
function modules() {
    // Pull in Multi-Stack validation module
    if (msValidationPresent) {
        return [
            {
                name: "multiStack",
                displayName: "Multi-Stack Validation",
                moduleName: msValidationModule,
                hidden: true
            }
        ];
    }
    return [];
}

/*
 *  ======== moduleStatic ========
 *  Define the Custom RF module as static
 */
const moduleStatic = {
    config: config,
    modules: modules,
    moduleInstances: moduleInstances
};

/*
 *  ======== module ========
 *  Define the Custom module properties and methods
 */
const module = {
    displayName: "Custom",
    description: "Custom Radio Configuration",
    longDescription: Docs.customDescription,
    moduleStatic: moduleStatic
};

exports = module;
