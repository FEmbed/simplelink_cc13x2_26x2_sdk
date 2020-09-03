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
 *  ======== easylink_rx_config.syscfg.js ========
 */

"use strict";

// Get common utility functions
const Common = system.getScript("/ti/easylink/easylink_common.js");

// Get Rx Setting long descriptions
const docs = system.getScript("/ti/easylink/rx_config/"
    + "easylink_rx_config_docs.js");

// Configurables for the static EasyLink RX Settings group
const config = {
    displayName: "Receive",
    description: "Configure settings for receive operations",
    config: [
        {
            name: "enableAddrFilter",
            displayName: "Enable Address Filtering",
            description: "Enables the stack to filter out addresses "
                + "that are not in the address table provided",
            longDescription: docs.enableAddrFilterLongDescription,
            default: true,
            onChange: onEnableAddrFilterChange
        },
        {
            name: "addrFilters",
            displayName: "Address Filter",
            description: "Defines the addresses this device will "
                + "search for when receiving packets. Hex formatting."
                + "Comma Separated.",
            longDescription: docs.addrFiltersLongDescription,
            default: "0xAA",
            hidden: false
        },
        {
            name: "asyncRxTimeout",
            displayName: "Asynchronous Rx Timeout (ms)",
            description: "Relative time from Async Rx start to TimeOut."
                + " A value of 0 means no timeout",
            longDescription: docs.asyncRxTimeoutLongDescription,
            default: 0
        }
    ]
};


/*
 *  ======== onEnableAddrFilterChange ========
 *  Unhides or hides the address filter configurables
 *
 * @param inst  - Module instance containing the config that changed
 * @param ui    - The User Interface object
 */
function onEnableAddrFilterChange(inst, ui)
{
    // Unhide the address filter configurables
    ui.addrFilters.hidden = !inst.enableAddrFilter;
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
    // Verify that async rx timeout is an integer within range
    if(inst.asyncRxTimeout < 0)
    {
        validation.logError("Must be a positive integer value including zero",
            inst, "asyncRxTimeout");
    }
    else if(inst.asyncRxTimeout > Common.maxUint32tRatMsTime)
    {
        /*
            * In C code, the async rx timeout gets translated to RAT time
            * via equation 1. The result is then assigned to a variable
            * declared as a uint32_t. To avoid overflow the max radio inactivity
            * timeout is UINT32_MAX/4000.
            *
            * (1) UNIT_IN_RAT = UNIT_IN_MS*4000
            */
        validation.logError(`Must be an integer value less than `
            + `${Common.maxUint32tRatMsTime + 1}`, inst,
        "asyncRxTimeout");
    }
    else if(!Number.isInteger(inst.asyncRxTimeout))
    {
        validation.logError("Must be an integer value greater than zero",
            inst, "asyncRxTimeout");
    }

    // Validate the filterable addresses
    if(inst.enableAddrFilter)
    {
        // Split the addresses into an array
        const addrFilters = Common.stringToArray(inst.addrFilters);

        // Validate number of address Filters
        if(addrFilters.length > 8) // Max bound
        {
            validation.logError("Number of address filters must be less than 9",
                inst, "addrFilters");
        }

        // Iterate over all the filterable addresses
        let addr;
        let noAddrErr = true;
        for(addr of addrFilters)
        {
            // Check if the address is valid hex format
            if(!Common.isValidAddress(addr))
            {
                validation.logError("Address must be hex(0x) format", inst,
                    "addrFilters");
                break;
            }

            // Check if the address is longer than the specified address size
            if((addr.substring(2).length) / 2 > inst.addrSize)
            {
                validation.logError(`One or more address sizes is larger `
                    + `than the ${system.getReference(inst, "addrSize")}`, inst,
                "addrFilters");
                noAddrErr = false;
                break;
            }
        }

        if(!inst.enableWsnMode && noAddrErr)
        {
            validation.logInfo("Additional setup required. See detailed help "
                + "(?) for more information", inst, "addrFilters");
        }
    }
}

// Exports to the top level EasyLink module
exports = {
    config: config,
    validate: validate,
    onEnableAddrFilterChange: onEnableAddrFilterChange
};
