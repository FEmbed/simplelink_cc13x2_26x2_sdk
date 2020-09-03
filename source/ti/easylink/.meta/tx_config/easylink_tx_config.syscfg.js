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
 *  ======== easylink_tx_config.syscfg.js ========
 */

"use strict";

// Get common utility functions
const Common = system.getScript("/ti/easylink/easylink_common.js");

// Get Tx Setting long descriptions
const docs = system.getScript("/ti/easylink/tx_config/"
    + "easylink_tx_config_docs.js");

// Configurables for the static EasyLink TX Settings group
const groupConfig = [
    {
        name: "transmitAddr",
        displayName: "Transmit Address",
        description: "Address transmitted with each packet. A value of "
            + "NULL means the application code is expected to provide the "
            + "address to the EasyLink Transmit API",
        longDescription: docs.transmitAddrLongDescription,
        default: "NULL"
    }
];

// Add the CCA settings as a sub-group
groupConfig.push({
    displayName: "CCA Settings",
    description: "Configure settings for assessing channel traffic before "
        + "transmitting",
    config: [
        {
            name: "backoffTimeunits",
            displayName: "Backoff Time Units (us)",
            description: "The back-off time units in microseconds",
            longDescription: docs.backoffTimeunitsLongDescription,
            default: 250
        },
        {
            name: "minBackoffWindow",
            displayName: "Minimum Backoff Window Multiplier",
            description: "Number multiplied by the Backoff Time Units to "
                + "calculate the minimum window",
            longDescription: docs.minBackoffWindowLongDescription,
            default: 32,
            options: [
                {name: 4},
                {name: 8},
                {name: 16},
                {name: 32},
                {name: 64}
            ]
        },
        {
            name: "maxBackoffWindow",
            displayName: "Maximum Backoff Window Multiplier",
            description: "Number multiplied by the Backoff Time Units to "
                + "calculate the maximum window",
            longDescription: docs.maxBackoffWindowLongDescription,
            default: 256,
            options: [
                {name: 32},
                {name: 64},
                {name: 128},
                {name: 256},
                {name: 512}
            ]
        },
        {
            name: "rssiThresholdDbm",
            displayName: "RSSI Threshold (dBm)",
            description: "RSSI threshold when a channel is considered "
                + "clear",
            longDescription: docs.rssiThresholdDbmLongDescription,
            default: -80
        },
        {
            name: "chIdleTimeUs",
            displayName: "Channel Idle Time (us)",
            description: "Time for which the channel RSSI must remain "
                + "below the specified threshold for the channel to be "
                + "considered idle",
            longDescription: docs.chIdleTimeUsLongDescription,
            default: 5000
        },
        {
            name: "randNumGenFxn",
            displayName: "Random Number Generation Function",
            description: "If a channel is busy, transmission will backoff "
                + "for a random period. This function generates the random "
                + "numbers for this functionality",
            longDescription: docs.randNumGenFxnLongDescription,
            default: "rand"
        }
    ]
});

/*
 * ======== validate ========
 * Validate this inst's configuration
 *
 * @param inst       - EasyLink CCA Config instance to be validated
 * @param validation - object to hold detected validation issues
 */
function validate(inst, validation)
{
    // Validate the random number function
    if(Common.isCName(inst.randNumGenFxn))
    {
        if(inst.randNumGenFxn === "")
        {
            validation.logError("Empty function name not allowed, use 'rand' "
                + "as default instead", inst, "randNumGenFxn");
        }
    }
    else
    {
        validation.logError("'" + inst.randNumGenFxn + "' is not a valid a C "
            + "identifier", inst, "randNumGenFxn");
    }

    // Verify the TX address
    if(inst.transmitAddr === "")
    {
        validation.logError("Empty tx address not allowed, use 'NULL' instead",
            inst, "transmitAddr");
    }
    else if(inst.transmitAddr !== "NULL")
    {
        // Check if the address is valid hex format
        if(!Common.isValidAddress(inst.transmitAddr))
        {
            validation.logError("Address must be hex(0x) format", inst,
                "transmitAddr");
        }

        // Check if the address is longer than the specified address size
        if((inst.transmitAddr.substring(2).length) / 2 > inst.addrSize)
        {
            validation.logError(`The transmit address size can't be larger `
                + `than the ${system.getReference(inst, "addrSize")}`, inst,
            "transmitAddr");
        }
    }
    else
    {
        validation.logInfo("When set to 'NULL', the application code is "
            + "expected to provide a TX Address", inst, "transmitAddr");
    }

    validation.logInfo(`Effective Minimum Backoff Window: `
        + `${inst.minBackoffWindow * inst.backoffTimeunits}us`, inst,
    "minBackoffWindow");

    validation.logInfo(`Effective Maximum Backoff Window: `
        + `${inst.maxBackoffWindow * inst.backoffTimeunits}us`, inst,
    "maxBackoffWindow");

    // Validate backoff time units is an integer within range
    if(inst.backoffTimeunits < 1) // Min bound
    {
        validation.logError("Must be an integer value greater than 0", inst,
            "backoffTimeunits");
    }
    else if(inst.backoffTimeunits
        > (Common.maxUint32t / (4 * inst.maxBackoffWindow)))
    {
        /*
        * In C code, the backoff time units gets translated to RAT time via
        * equation 1. Then the actual backoff window is generated via
        * equation 2. The resulting BACKOFF_WINDOW_RAT is then assigned to a
        * variable declared as a uint32_t. To avoid overflow the max backoff
        * time unit is UINT32_MAX/(4*MAX_BACKOFF_WINDOW).
        *
        * (1) UNIT_IN_RAT = UNIT_IN_US*4
        * (2) BACKOFF_WINDOW_RAT = UNIT_IN_RAT * RAND
        *      - where MIN_BACKOFF_WINDOW < RAND < MAX_BACKOFF_WINDOW
        */
        validation.logError(`Must be an integer value less than `
            + `${Math.floor(Common.maxUint32t / (4 * inst.maxBackoffWindow))
            + 1}`, inst, "backoffTimeunits");
    }
    else if(!Number.isInteger(inst.backoffTimeunits))
    {
        validation.logError("Must be an integer value greater than 0", inst,
            "backoffTimeunits");
    }

    // Validate min and max CCA backoff windows
    if(inst.minBackoffWindow >= inst.maxBackoffWindow)
    {
        validation.logError("The minimum backoff exponent must be lesser "
            + "than the maximum backoff exponent", inst,
        "minBackoffWindow");

        validation.logError("The maximum backoff exponent must be greater "
            + "than the minimum backoff exponent", inst,
        "maxBackoffWindow");
    }

    // Validate that the rssiThresholdDbm is an integer within int8_t range
    if(!Number.isInteger(inst.rssiThresholdDbm))
    {
        validation.logError("Must be an integer value", inst,
            "rssiThresholdDbm");
    }
    else if(inst.rssiThresholdDbm > Common.maxInt8t) // Max bound
    {
        /*
        * In C code, the rssi threshold sets the EasyLink_cmdPropCs.rssiThr
        * value which is a int8_t. Therefore the max value is maxInt8_t
        */
        validation.logError("Must be an integer value less than 128 "
            + "(max int8_t)", inst, "rssiThresholdDbm");
    }
    else if(inst.rssiThresholdDbm < Common.minInt8t) // Min bound
    {
        /*
        * In C code, the rssi threshold sets the EasyLink_cmdPropCs.rssiThr
        * value which is a int8_t. Therefore the min value is minInt8_t
        */
        validation.logError("Must be an integer value greater than -129 "
            + "(min int8_t)", inst, "rssiThresholdDbm");
    }

    // Validate that the channel idle time is an integer within range
    if(!Number.isInteger(inst.chIdleTimeUs))
    {
        validation.logError("Must be an integer value", inst,
            "chIdleTimeUs");
    }
    else if(inst.chIdleTimeUs > Common.maxUint32tRatUsTime) // Max bound
    {
        /*
        * In C code, the channel idle time gets translated to RAT time via
        * EasyLink_us_To_RadioTime(us) (us*(4000000/1000000)).
        *
        * The result is used to set a uint32_t variable. Therefore the max
        * value is maxUint32_t/4
        */
        validation.logError(`Must be an integer value less than `
            + `${Common.maxUint32tRatUsTime + 1}`, inst, "chIdleTimeUs");
    }
    else if(inst.chIdleTimeUs < 0) // Min bound
    {
        /*
        * In C code, the channel idle time gets translated to RAT time via
        * EasyLink_us_To_RadioTime(us) (us*(4000000/1000000)).
        *
        * The result is used to set a uint32_t variable. Therefore the min
        * value is 0
        */
        validation.logError("Must be a positive integer value including "
            + "zero", inst, "chIdleTimeUs");
    }
}

// Exports to the top level EasyLink module
exports = {
    config: {
        displayName: "Transmit",
        description: "Configure settings for transmit operations",
        config: groupConfig
    },
    validate: validate
};
