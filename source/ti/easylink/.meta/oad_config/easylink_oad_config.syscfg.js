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
 *  ======== easylink_oad_config.syscfg.js ========
 */

"use strict";

// Get common utility functions
const Common = system.getScript("/ti/easylink/easylink_common.js");

// Get Oad Setting long descriptions
const docs = system.getScript("/ti/easylink/oad_config/"
    + "easylink_oad_config_docs.js");

// Map of Phys that have been tested with OAD and their default block req rate
const blockReqRateMap = {
    EasyLink_Phy_5kbpsSlLr: 1600,
    EasyLink_Phy_50kbps2gfsk: 160,
    EasyLink_Phy_Custom: 160
};

// Configurables for the EasyLink OAD Configuration module
const config = {
    displayName: "OAD",
    name: "oadSettings",
    description: "Configure settings for Over-the-Air Downloads",
    config: [
        {
            name: "blockSize",
            displayName: "Block Size (bytes)",
            description: "The number of bytes sent in an OAD Block",
            longDescription: docs.blockSizeLongDescription,
            default: 64,
            hidden: true
        },
        {
            name: "blockInterval",
            displayName: "Block Interval (ms)",
            description: "The interval between block requests sent from client",
            longDescription: docs.blockIntervalLongDescription,
            default: 160,
            hidden: true
        }
    ]
};

/*
 *  ======== moduleInstances ========
 *  Determines what modules are added as non-static sub-modules
 *
 *  @param inst  - Module instance containing the config that changed
 *  @returns     - Array containing dependency modules
 */
function moduleInstances(inst)
{
    const dependencyModule = [];

    if(inst.enableOad)
    {
        dependencyModule.push({
            name: "oadModule",
            moduleName: "/ti/easylink/oad_config/easylink_oad_mod.js",
            group: "oadSettings"
        });
    }

    return(dependencyModule);
}

/*
 * ======== validate ========
 * Validate this inst's configuration
 *
 * @param inst       - EasyLink OAD Configuration instance to be validated
 * @param validation - object to hold detected validation issues
 */
function validate(inst, validation)
{
    const easylinkPhys = Common.getDropDownOptions(inst, "defaultPhy");

    // Create a list of phys that are currently enabled/selected
    const enabledPhys = [];
    let opt = null;
    for(opt of easylinkPhys)
    {
        if(inst[opt])
        {
            enabledPhys.push(opt);
        }
    }

    let phy = null;
    for(phy of enabledPhys)
    {
        if(!blockReqRateMap[phy])
        {
            validation.logInfo("EasyLink OAD has only been tested using the "
                + "Sub-1GHz: 2GFSK, 50Kbps and Sub-1GHz: SLR, 5kbps PHYs",
            inst, "blockSize");
            break;
        }
    }

    // Verify block size is between 16 and 496 bytes
    if(inst.blockSize > 496)
    {
        validation.logError("Maximum block size is 496", inst, "blockSize");
    }
    else if(inst.blockSize < 16)
    {
        validation.logError("Minimum block size is 16", inst, "blockSize");
    }
}

/*
 *  ======== oadConfigGroup ========
 *  Define the EasyLink OAD Configuration group properties and methods
 */
const oadConfigGroup = {
    config: config,
    validate: validate,
    moduleInstances: moduleInstances
};

/*
 *  ======== exports ========
 *  Export the EasyLink OAD Configuration definition
 */
exports = oadConfigGroup;
