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
 *  ======== easylink.syscfg.js ========
 */

"use strict";

// Get common utility functions
const Common = system.getScript("/ti/easylink/easylink_common.js");

// Get EasyLink Setting long descriptions
const docs = system.getScript("/ti/easylink/easylink_docs.js");

// Get the Tx settings script
const txScript = system.getScript("/ti/easylink/tx_config/"
    + "easylink_tx_config");

// Get Rx Settings script
const rxScript = system.getScript("/ti/easylink/rx_config/"
    + "easylink_rx_config");

// Get Adv Settings script
const advScript = system.getScript("/ti/easylink/adv_config/"
    + "easylink_adv_config");

// Get Radio Settings script
const radioScript = system.getScript("/ti/easylink/rf_config/"
+ "easylink_rf_config");

// Get OAD Settings script
const oadScript = system.getScript("/ti/easylink/oad_config/"
+ "easylink_oad_config");

// Stores the state of the enableAddrFilter configurable
let prevEnableAddrFilter = true;

// Static implementation of EasyLink module
const moduleStatic = {

    // Configurables for the static EasyLink module
    config: [
        {
            name: "addrSize",
            displayName: "Address Size (bytes)",
            description: "Defines the address size used for all Tx/Rx "
                + "operations",
            longDescription: docs.addrSizeLongDescription,
            default: 1,
            options: [
                {
                    displayName: "Not Using an Address",
                    name: 0
                },
                {name: 1},
                {name: 2},
                {name: 3},
                {name: 4},
                {name: 5},
                {name: 6},
                {name: 7},
                {name: 8}
            ],
            hidden: false,
            onChange: onAddrSizeChange
        },
        {
            name: "maxDataLength",
            displayName: "Maximum Data Length (bytes)",
            description: "Defines the largest Tx/Rx payload that the "
                    + "interface can support. Maximum of 512 bytes.",
            longDescription: docs.maxDataLengthLongDescription,
            default: 128
        },
        {
            name: "radioInactivityTimeout",
            displayName: "Radio Inactivity Timeout (ms)",
            description: "Defines the time for the radio to return to idle "
                + "after inactivity",
            longDescription: docs.radioInactivityTimeoutLongDesc,
            default: 1
        },
        radioScript.config,
        rxScript.config,
        txScript.config,
        oadScript.config,
        advScript.config,
        {
            name: "enableOad",
            displayName: "Enable OAD",
            description: "Enable/Disable OAD functionality. Always hidden.",
            onChange: onEnableOadChange,
            hidden: true,
            default: false
        },
        {
            name: "enableWsnMode",
            displayName: "Enable WSN Mode",
            description: "When enabled, all configurables except the Maximum "
                + "Data length will be read-only",
            hidden: true,
            default: false,
            onChange: onEnableWsnModeChange
        }
    ],

    validate: validate,
    moduleInstances: moduleInstances,
    modules: modules
};

/*
 *  ======== onAddrSizeChange ========
 *  If addrSize = 0, disables address filtering. Else, adds or removes
 *  padding to addresses with a size different from addrSize
 *
 * @param inst  - Module instance containing the config that changed
 * @param ui    - The User Interface object
 */
function onAddrSizeChange(inst, ui)
{
    // If address size is 0, disable and lock address filtering
    if(inst.addrSize === 0)
    {
        prevEnableAddrFilter = inst.enableAddrFilter;
        inst.enableAddrFilter = false;
        ui.enableAddrFilter.readOnly = `Address filtering is disabled when the `
            + `${system.getReference(inst, "addrSize")} is 0`;
    }
    else if(ui.enableAddrFilter.readOnly)
    {
        // Transition from address size of 0 to non-zero.
        // Restore previous enableAddrFilter setting
        ui.enableAddrFilter.readOnly = false;
        inst.enableAddrFilter = prevEnableAddrFilter;
    }

    // If address filtering is enabled, pad addresses in addrFilters array
    if(inst.enableAddrFilter)
    {
        // Set the addrFilters array to the new addresses
        inst.addrFilters = padAddresses(Common.stringToArray(inst.addrFilters),
            inst.addrSize);
    }

    // Pad the tx address
    if(inst.transmitAddr !== "NULL")
    {
        inst.transmitAddr = padAddresses([inst.transmitAddr], inst.addrSize);
    }

    // Changes also affect address filtering so onChange function must be called
    rxScript.onEnableAddrFilterChange(inst, ui);
}

/*
 *  ======== onEnableWsnModeChange ========
 *  Sets the enableAddrFilter, addrSize, and addrFilters to read-only
 *
 * @param inst  - Module instance containing the config that changed
 * @param ui    - The User Interface object
 */
function onEnableWsnModeChange(inst, ui)
{
    const readOnlyReason = "Address filtering must be manually configured in "
        + "the application code for a WSN project";
    ui.enableAddrFilter.readOnly = readOnlyReason;
    ui.addrSize.readOnly = readOnlyReason;
    ui.addrFilters.readOnly = readOnlyReason;
}

/*
 *  ======== onEnableOadChange ========
 *  Hides or unhides the oad configurables based on enableOad configurable
 *
 * @param inst  - Module instance containing the config that changed
 * @param ui    - The User Interface object
 */
function onEnableOadChange(inst, ui)
{
    let element = null;
    for(element of oadScript.config.config)
    {
        ui[element.name].hidden = !inst.enableOad;
    }
}

function padAddresses(addrList, addressSize)
{
    let addrString = "";

    // Iterate over all the filterable addresses
    let addr = null;
    for(addr of addrList)
    {
        let addrNoPref = addr.substring(2); // Remove the 0x prefix

        // Add 0 padding to addresses less than addrSize
        while(((addrNoPref.length) / 2) < addressSize)
        {
            addrNoPref = "0" + addrNoPref;
        }

        // Remove 0 padding from addresses greater than addrSize
        while(((addrNoPref.length) / 2 > addressSize)
            && (addrNoPref.substring(0, 1) === "0"))
        {
            addrNoPref = addrNoPref.substring(1);
        }

        // Add the newly constructed address to the string
        addrString = addrString + "0x" + addrNoPref + ", ";
    }

    // Remove the last comma
    addrString = addrString.substring(0, addrString.length - 2);

    return(addrString);
}

/*
 *  ======== moduleInstances ========
 *  Determines what modules are added as non-static children
 *
 *  @param inst  - Module instance containing the config that changed
 *  @returns     - Array containing dependency modules
 */
function moduleInstances(inst)
{
    // Run get modules for Radio and OAD groups
    let dependencyModule = radioScript.moduleInstances(inst);
    dependencyModule = dependencyModule.concat(oadScript.moduleInstances(inst));

    return(dependencyModule);
}

/*
 *  ======== modules ========
 *  Determines what modules are added as static children
 *
 *  @param inst  - Module instance containing the config that changed
 *  @returns     - Array containing a static dependency modules
 */
function modules(inst)
{
    const dependencyModule = [];

    // Pull in static RF driver
    dependencyModule.push({
        name: "RF",
        displayName: "RF Driver",
        moduleName: "/ti/drivers/RF"
    });

    dependencyModule.push({
        name: "rfDesign",
        displayName: "RF Design",
        moduleName: "/ti/devices/radioconfig/rfdesign"
    });

    // Pull in Multi-Stack validation module
    dependencyModule.push({
        name: "multiStack",
        displayName: "Multi-Stack Validation",
        moduleName: "/ti/common/multi_stack_validate",
        hidden: true
    });

    return(dependencyModule);
}

/*
 * ======== validate ========
 * Validate this inst's configuration
 *
 * @param inst       - EasyLink instance to be validated
 * @param validation - object to hold detected validation issues
 */
function validate(inst, validation)
{
    // Call validation methods of all groups
    rxScript.validate(inst, validation);
    txScript.validate(inst, validation);
    advScript.validate(inst, validation);
    radioScript.validate(inst, validation);
    oadScript.validate(inst, validation);

    // Verify that the RF module is using the board hardware
    if(system.deviceData.board && system.deviceData.board.components.RF)
    {
        const RF = system.modules["/ti/drivers/RF"];

        if(RF.$static.$hardware !== system.deviceData.board.components.RF)
        {
            validation.logWarning("EasyLink stack requires the use of the RF "
                + "Antenna Switch hardware", RF.$static, "$hardware");
        }
    }

    if(inst.enableWsnMode)
    {
        validation.logInfo("This example requires strict address size and "
            + "filter settings. Directly edit these parameters in the "
            + "application's source code to differ from the defaults seen here",
        inst, "enableAddrFilter");
    }

    // Validate Max Data Length
    if(inst.maxDataLength < 1) // Min bound
    {
        validation.logError("Must be an integer value greater than 0", inst,
            "maxDataLength");
    }
    else if(inst.maxDataLength > 512) // Max bound
    {
        validation.logError("Must be an integer value less than 513 bytes",
            inst, "maxDataLength");
    }
    else if(!Number.isInteger(inst.maxDataLength))
    {
        validation.logError("Must be an integer value greater than 0", inst,
            "maxDataLength");
    }

    // Show additional information if address size is changed from default
    if(inst.addrSize > 1)
    {
        validation.logInfo(`Any device attempting to communicate with this
             device must also be configured to use an address size of
             ${inst.addrSize}`, inst, "addrSize");
    }

    // Verify that radio inactivity timeout is an integer within range
    if(inst.radioInactivityTimeout < 1)
    {
        validation.logError("Must be an integer value greater than zero",
            inst, "radioInactivityTimeout");
    }
    else if(inst.radioInactivityTimeout > Common.maxUint32tRatMsTime)
    {
        /*
         * In C code, the radio inactivity timeout gets translated to RAT time
         * via equation 1. The result is then assigned to a variable
         * declared as a uint32_t. To avoid overflow the max radio inactivity
         * timeout is UINT32_MAX/4000.
         *
         * (1) UNIT_IN_RAT = UNIT_IN_MS*4000
         */
        validation.logError(`Must be an integer value less than `
            + `${Common.maxUint32tRatMsTime + 1}`, inst,
        "radioInactivityTimeout");
    }
    else if(!Number.isInteger(inst.radioInactivityTimeout))
    {
        validation.logError("Must be an integer value greater than zero",
            inst, "radioInactivityTimeout");
    }
}

/*
 *  ======== easyLinkModule ========
 *  Define the EasyLink module properties and methods
 */
const easyLinkModule = {
    displayName: "EasyLink",
    description: "EasyLink Stack Configuration",
    longDescription: docs.easyLinkLongDescription,
    moduleStatic: moduleStatic,
    templates: {
        "/ti/easylink/templates/ti_easylink_config.h.xdt":
            `/ti/easylink/templates/ti_easylink_config.h.xdt`,
        "/ti/easylink/templates/ti_easylink_config.c.xdt":
            `/ti/easylink/templates/ti_easylink_config.c.xdt`
    }
};

/*
 *  ======== exports ========
 *  Export the EasyLink module definition
 */
exports = easyLinkModule;
