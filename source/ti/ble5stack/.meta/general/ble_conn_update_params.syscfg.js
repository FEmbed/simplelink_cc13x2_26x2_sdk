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
 *  ======== ble_conn_update_params.syscfg.js ========
 */

"use strict";

// Get conn_update_params long descriptions
const Docs = system.getScript("/ti/ble5stack/general/ble_conn_update_params_docs.js");

// Get common utility functions
const Common = system.getScript("/ti/ble5stack/ble_common.js");

const config = [
    {
        name: "upMinConnInt",
        displayName: "Update Min Connection Interval (ms)",
        default: 500,
        longDescription: Docs.upMinConnIntLongDescription
    },
    {
        name: "upMaxConnInt",
        displayName: "Update Max Connection Interval (ms)",
        default: 1000,
        longDescription: Docs.upMaxConnIntLongDescription
    },
    {
        name: "upSlaveLat",
        displayName: "Update Slave Latency",
        default: 0,
        longDescription: Docs.upSlaveLatLongDescription
    },
    {
        name: "upConnTo",
        displayName: "Update Connection Timeout (ms)",
        default: 6000,
        longDescription: Docs.upConnToLongDescription
    }
]

/*
 * ======== validate ========
 * Validate this inst's configuration
 *
 * @param inst       - Connection Update Param instance to be validated
 * @param validation - object to hold detected validation issues
 */
function validate(inst, validation)
{
    if(inst.upSlaveLat < Common.connParamsRanges.connLatencyMinValue ||
        inst.upSlaveLat > Common.connParamsRanges.connLatencyMaxValue)
    {
        validation.logError("Slave Latency range is " + Common.connParamsRanges.connLatencyMinValue 
                            + " to " + Common.connParamsRanges.connLatencyMaxValue, inst, "upSlaveLat");
    }
    if(inst.upConnTo < Common.connParamsRanges.connTimeoutMinValue ||
        inst.upConnTo > Common.connParamsRanges.connTimeoutMaxValue)
    {
        validation.logError("Connection Timeout range is " + Common.connParamsRanges.connTimeoutMinValue +
                             " ms to " + Common.connParamsRanges.connTimeoutMaxValue + " ms", inst, "upConnTo");
    }
    // Validate connection interval
    Common.validateConnInterval(inst,validation,inst.upMinConnInt,"upMinConnInt",inst.upMaxConnInt,"upMaxConnInt");
}

/*
 *  ======== connUpdateParamsModule ========
 *  Define the BLE Connection Update Params module properties and methods
 */
const connUpdateParamsModule = {
    displayName: "Connection Update Params",
    config: config,
    validate: validate
};

/*
 *  ======== exports ========
 *  Export the BLE Connection Update Params Configuration module
 */
exports = connUpdateParamsModule;