/*
 * Copyright (c) 2018 Texas Instruments Incorporated - http://www.ti.com
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
 */

"use strict";

// Get ble long descriptions
const Docs = system.getScript("/ti/ble5stack/ble_docs.js");

//Get Radio Script
const radioScript = system.getScript("/ti/ble5stack/rf_config/"
                            + "ble_rf_config");
//Get General Script
const generalScript = system.getScript("/ti/ble5stack/general/"
                            + "ble_general");
//Get Bond Manager Script
const bondMgrScript = system.getScript("/ti/ble5stack/bondManager/"
                            + "ble_bondmgr");

//Get Central Script
const centralScript = system.getScript("/ti/ble5stack/central/"
                            + "ble_central");

//Get Observer Script
const observerScript = system.getScript("/ti/ble5stack/observer/"
                            + "ble_observer");

//Get Peripheral Script
const peripheralScript = system.getScript("/ti/ble5stack/peripheral/"
                            + "ble_peripheral");

//Get broadcaster Script
const broadcasterScript = system.getScript("/ti/ble5stack/broadcaster/"
                            + "ble_broadcaster");

//Get Adv Settings Script
const advSetScript = system.getScript("/ti/ble5stack/adv_config/"
                            + "ble_adv_config");

// Get common Script
const Common = system.getScript("/ti/ble5stack/ble_common.js");

// Get DeviceFamily and LP Name
const devFamily = Common.device2DeviceFamily(system.deviceData.deviceId);
const LPName = Common.getBoardOrLaunchPadName(true);

//static implementation of the BLE module
const moduleStatic = {
    
    //configurables for the static BLE module
    config: [
        {
            name: "lockProject",
            displayName: "Lock Project",
            default: false,
            hidden: true,
            onChange: onLockProjectChange
        },
        {
            name: "deviceRole",
            displayName: "Device Role",
            description: "The BLE device role",
            default: "PERIPHERAL_CFG",
            readOnly: false,
            onChange: ondeviceRoleChange,
            longDescription: Docs.deviceRoleLongDescription,
            options: [
                {
                    displayName: "Observer",
                    name: "OBSERVER_CFG"
                },
                {
                    displayName: "Broadcaster",
                    name: "BROADCASTER_CFG"
                },
                {
                    displayName: "Peripheral",
                    name: "PERIPHERAL_CFG"
                },
                {
                    displayName: "Central",
                    name: "CENTRAL_CFG"
                },
                {
                    displayName: "Central + Broadcaster",
                    name: "CENTRAL_CFG+BROADCASTER_CFG"
                },
                {
                    displayName: "Peripheral + Observer",
                    name: "PERIPHERAL_CFG+OBSERVER_CFG"
                },
                {
                    displayName: "Peripheral + Central",
                    name: "PERIPHERAL_CFG+CENTRAL_CFG"
                }
            ]
        },
        {
            name: "bondManager",
            displayName: "Bond Manager",
            description: "The Gap Bond Manager is always enabled",
            longDescription: Docs.bondManagerLongDescription,
            default: true,
            readOnly: true
        },
        {
            name: "gattDB",
            displayName: "GATT Database Off Chip",
            description: "Indicates that the GATT database is maintained off the chip on the"
                            + "Application Processor (AP)",
            longDescription: Docs.gattDBLongDescription,
            default: false
        },
        {
            name: "gattNoClient",
            displayName: "GATT No Client",
            description: "The app must have GATT client functionality "
                       + "to read the Resolvable Private Address Only "
                       + "characteristic and the Central Address Resolution "
                       + "characteristic. To enable it, Uncheck GATT "
                       + "No Client.",
            longDescription: Docs.gattNoClientLongDescription,
            default: false,
            hidden: false
        },
        {
            name: "L2CAPCOC",
            displayName: "L2CAP Connection Oriented Channels",
            default: false,
            longDescription: Docs.L2CAPCOCLongDescription
        },
        {
            name: "delayingAttReadReq",
            displayName: "Delaying An ATT Read Request",
            longDescription: Docs.delayingAttReadReqLongDescription,
            default: false,
            hidden: false
        },
        {
            name: "trensLayer",
            displayName: "Transport Layer",
            default:"HCI_TL_NONE",
            description: "When using PTM configuration please choose HCI_TL_NONE",
            longDescription: Docs.trensLayerLongDescription,
            hidden: true,
            options: [
                {
                    displayName: "None",
                    name: "HCI_TL_NONE"
                },
                {
                    displayName: "Full",
                    name: "HCI_TL_FULL"
                }
            ]
        },
        {
            name: "enableGattBuilder",
            displayName: "Enable GATT Builder",
            default: false,
            hidden: true,
            onChange: onEnableGattBuildeChange
        },
        {
            name: "gattBuilder",
            displayName: "Custom GATT",
            description: "Adding services and characteristic ",
            default: false,
            hidden: true
        },
        radioScript.config,
        generalScript.config,
        bondMgrScript.config,
        advSetScript.config,
        centralScript.config,
        observerScript.config,
        peripheralScript.config,
        broadcasterScript.config
    ],

    validate: validate,
    moduleInstances: moduleInstances,
    modules: modules
}

/*
 * ======== validate ========
 * Validate this inst's configuration
 *
 * @param inst       - BLE instance to be validated
 * @param validation - object to hold detected validation issues
 */
function validate(inst, validation)
{
    radioScript.validate(inst, validation);
    generalScript.validate(inst, validation);
    bondMgrScript.validate(inst, validation);
    advSetScript.validate(inst, validation);
    centralScript.validate(inst, validation);
    observerScript.validate(inst, validation);
    peripheralScript.validate(inst, validation);
    broadcasterScript.validate(inst, validation);

    // When using CC2652RB (BAW) device and the BLE role is central/observer/multi_role
    // the LF src clock (srcClkLF) should be different from "LF RCOSC".
    // Therefore, throwing a warning on the CCFG srcClkLF configurable.
    if(system.modules["/ti/devices/CCFG"] && system.deviceData.device == "CC2652RB")
    {
        if((inst.deviceRole != "BROADCASTER_CFG" && inst.deviceRole != "PERIPHERAL_CFG")
            && system.modules["/ti/devices/CCFG"].$static.srcClkLF == "LF RCOSC")
        {
            validation.logWarning("Only BLE Broadcaster and Peripheral roles should use LF RCOSC for CC2652RB device",
                                    system.modules["/ti/devices/CCFG"].$static, "srcClkLF");
        }
    }
}

/*
 *  ======== ondeviceRoleChange ========
 * Change the bond manager value when changing the role combination
 * Broadcaster and observer are not using Bond Manager
 * @param inst  - Module instance containing the config that changed
 * @param ui    - The User Interface object
 */
function ondeviceRoleChange(inst,ui)
{
    if(inst.deviceRole == "BROADCASTER_CFG" || inst.deviceRole == "OBSERVER_CFG")
    {
        inst.maxConnNum = 0;
        inst.maxPDUNum = 0;
        inst.bondManager = false;
        // Hide Bond Manager
        inst.hideBondMgrGroup = true;
        Common.hideGroup(Common.getGroupByName(inst.$module.config, "bondMgrConfig"), inst.hideBondMgrGroup, ui);

        // Change Device Name
        inst.deviceRole == "BROADCASTER_CFG" ? inst.deviceName = "Simple Broadcaster": inst.deviceName = "Simple Observer";
    }
    else
    {
        inst.maxConnNum = 8;
        inst.maxPDUNum = 5;
        inst.bondManager = true;
        // Show Bond Manager
        inst.hideBondMgrGroup = false;
        Common.hideGroup(Common.getGroupByName(inst.$module.config, "bondMgrConfig"), inst.hideBondMgrGroup, ui);

        // Change Device Name
        if(inst.deviceRole == "PERIPHERAL_CFG")
        {
            inst.deviceName = "Simple Peripheral";
        }
        else if(inst.deviceRole == "CENTRAL_CFG")
        {
            inst.deviceName = "Simple Central";
        }
        else
        {
            inst.deviceName = "Multi Role";
        }
    }

    // Use ptm only in the relevant roles
    if(_.isEqual(inst.deviceRole, "PERIPHERAL_CFG"))
    {
        inst.ptm = false;
        ui.ptm.hidden = false;
    }
    else
    {
        ui.ptm.hidden = true;
    }

    // Enable bondFailAction only when using Central role
    if(inst.deviceRole.includes("CENTRAL_CFG"))
    {
        ui.bondFailAction.hidden = false;
    }
    else
    {
        ui.bondFailAction.hidden = true;
    }

    // Enable peerConnParamUpdateRejectInd only when using Central or Peripheral role combinations
    if(inst.deviceRole == "BROADCASTER_CFG" || inst.deviceRole == "OBSERVER_CFG")
    {
        ui.peerConnParamUpdateRejectInd.hidden = true;
    }
    else
    {
        ui.peerConnParamUpdateRejectInd.hidden = false;
    }

    // Hide/UnHide Peripheral Group
    inst.deviceRole.includes("PERIPHERAL_CFG") ? inst.hidePeripheralGroup = false : inst.hidePeripheralGroup = true;
    Common.hideGroup(Common.getGroupByName(inst.$module.config, "peripheralConfig"), inst.hidePeripheralGroup, ui);

    // Hide/UnHide Broadcaster Group
    inst.deviceRole.includes("BROADCASTER_CFG") || inst.deviceRole.includes("PERIPHERAL_CFG") ? inst.hideBroadcasterGroup = false : inst.hideBroadcasterGroup = true;
    Common.hideGroup(Common.getGroupByName(inst.$module.config, "broadcasterConfig"), inst.hideBroadcasterGroup, ui);

    // Hide/UnHide Central Group
    inst.deviceRole.includes("CENTRAL_CFG") ? inst.hideCentralGroup = false : inst.hideCentralGroup = true;
    Common.hideGroup(Common.getGroupByName(inst.$module.config, "centralConfig"), inst.hideCentralGroup, ui);

    // Hide/UnHide Observer Group
    inst.deviceRole.includes("OBSERVER_CFG") || inst.deviceRole.includes("CENTRAL_CFG") ? inst.hideObserverGroup = false : inst.hideObserverGroup = true;
    Common.hideGroup(Common.getGroupByName(inst.$module.config, "observerConfig"), inst.hideObserverGroup, ui);

}

/*
 *  ======== onLockProjectChange ========
 * Lock or unlock the deviceRole configurable,
 * disable/enable the option to change the deviceRole.
 * @param inst  - Module instance containing the config that changed
 * @param ui    - The User Interface object
 */
function onLockProjectChange(inst,ui)
{
    inst.lockProject ? ui.deviceRole.readOnly = "Only this role is supported" :
                       ui.deviceRole.readOnly = false;
}

/*
 *  ======== onEnableGattBuildeChange ========
 * Lock or unlock the enableGattBuilder configurable,
 * disable/enable the option to change the enableGattBuilder.
 * @param inst  - Module instance containing the config that changed
 * @param ui    - The User Interface object
 */
function onEnableGattBuildeChange(inst,ui)
{
    inst.enableGattBuilder ? ui.gattBuilder.hidden = false :
                             ui.gattBuilder.hidden = true;
}

/*
 *  ======== moduleInstances ========
 *  Determines what modules are added as non-static submodules
 *
 *  @param inst  - Module instance containing the config that changed
 *  @returns     - Array containing dependency modules
 */
function moduleInstances(inst)
{
    let dependencyModule = [];

    dependencyModule = radioScript.moduleInstances(inst);
    dependencyModule = dependencyModule.concat(centralScript.moduleInstances(inst));
    dependencyModule = dependencyModule.concat(peripheralScript.moduleInstances(inst));
    dependencyModule = dependencyModule.concat(broadcasterScript.moduleInstances(inst));
    if(inst.gattBuilder)
    {
        dependencyModule.push(
        {
            name            : 'services',
            displayName     : 'Services',
            useArray        : true,
            moduleName      : '/ti/ble5stack/gatt_services/Service',
            collapsed       : true,
        });
    }
    return(dependencyModule);
}

/*
 *  ======== modules ========
 *  Determines what modules are added as static submodules
 *
 *  @param inst  - Module instance containing the config that changed
 *  @returns     - Array containing a static dependency modules
 */
function modules(inst)
{
    const dependencyModule = [];

    // Pull in Multi-Stack validation module
    dependencyModule.push({
        name: "multiStack",
        displayName: "Multi-Stack Validation",
        moduleName: "/ti/easylink/multi_stack_validate",
        hidden: true
    });

    return(dependencyModule);
}

/*
 *  ======== bleModule ========
 *  Define the BLE module properties and methods
 */
const bleModule = {
    displayName: "BLE",
    longDescription: "The BLE stack module is intended to simplify the stack "
                    + "configuration for the user. This module can be used "
                    + "only with the following applications:\n"
                    + "multi_role, simple_broadcaster, simple_central and "
                    + "simple_peripheral. For more information, refer to "
                    + "the [BLE User's Guide](ble5stack/ble_user_guide/html/"
                    + "ble-stack-5.x/overview.html).",
    moduleStatic: moduleStatic,
    templates: {
        "/ti/ble5stack/templates/ble_config.h.xdt":
        "/ti/ble5stack/templates/ble_config.h.xdt",

        "/ti/ble5stack/templates/ble_config.c.xdt":
        "/ti/ble5stack/templates/ble_config.c.xdt",

        "/ti/ble5stack/templates/build_config.opt.xdt":
        "/ti/ble5stack/templates/build_config.opt.xdt",

        "/ti/ble5stack/templates/ble_app_config.opt.xdt":
        "/ti/ble5stack/templates/ble_app_config.opt.xdt"
    }
};

/*
 *  ======== exports ========
 *  Export the BLE module
 */
exports = bleModule;