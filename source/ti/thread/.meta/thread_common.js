/*
 * Copyright (c) 2018, Texas Instruments Incorporated
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
 */

/*
 *  =========================== thread_common.js ===========================
 *  Common constants and functions shared within the SysConfig Thread module
 */

"use strict";

/* Poll period bounds (ms) */
const POLL_PERIOD_MAX = 0x3FFFFFF;
const POLL_PERIOD_WARN_MIN = 10;

/* PSKd length bounds in number of characters (bytes) */
const PSKD_MIN_LEN = 6;
const PSKD_MAX_LEN = 32;

/* Extended address (device ID) length (bytes) */
const EXT_ADDR_LEN = 8;

/* PAN ID length (bytes) */
const PAN_ID_LEN = 2;

/* Extended PAN ID length (bytes) */
const EXT_PAN_ID_LEN = 8;

/* Master key length (bytes) */
const MASTER_KEY_LEN = 16;

/* Network name (UTF-8) max length (bytes) */
const NETWORK_NAME_MAX_LEN = 16;

// Dictionary mapping a device name to default LaunchPad; used to discover the
// appropriate RF settings when a device is being used without a LaunchPad
const deviceToBoard = {
    CC1352R: "CC1352R1_LAUNCHXL",
    CC1352P: "CC1352P1_LAUNCHXL",
    CC2652R1: "CC26X2R1_LAUNCHXL",
    CC2652RB: "CC2652RB_LAUNCHXL"
};

/*!
 *  ======== getDeviceOrLaunchPadName ========
 *  Get the name of the board (or device)
 *
 *  @param convertToBoard - Boolean. When true, return the associated LaunchPad
 *                          name if a device is being used without a LaunchPad
 *
 *  @returns String - Name of the board with prefix /ti/boards and
 *                    suffix .syscfg.json stripped off.  If no board
 *                    was specified, the device name is returned.
 */
function getDeviceOrLaunchPadName(convertToBoard)
{
    let name = system.deviceData.deviceId;

    if(system.deviceData.board != null)
    {
        name = system.deviceData.board.source;

        /* Strip off everything up to and including the last '/' */
        name = name.replace(/.*\//, "");

        /* Strip off everything after and including the first '.' */
        name = name.replace(/\..*/, "");
    }

    // Check if this is a standalone device without a LaunchPad
    if(convertToBoard && !name.includes("_LAUNCHXL") && !name.includes("LP_"))
    {
        // Find the LaunchPad name in deviceToBoard dictionary
        let key = null;
        for(key in deviceToBoard)
        {
            if(name.includes(key))
            {
                name = deviceToBoard[key];
                break;
            }
        }
    }

    return(name);
}

// Settubgs fir ti/devices/CCFG module
const threadCCFGSettings = {
    CC1352R1_LAUNCHXL_CCFG_SETTINGS: {
        forceVddr: true
    },
    CC1352P1_LAUNCHXL_CCFG_SETTINGS: {
    },
    CC1352P_2_LAUNCHXL_CCFG_SETTINGS: {
        forceVddr: true
    },
    CC1352P_4_LAUNCHXL_CCFG_SETTINGS: {
    },
    CC26X2R1_LAUNCHXL_CCFG_SETTINGS: {
    },
    CC2652RB_LAUNCHXL_CCFG_SETTINGS: {
    },
    LP_CC2652PSIP_CCFG_SETTINGS: {
    },
    LP_CC265RPSIP_CCFG_SETTINGS: {
    }
};

const boardName = getDeviceOrLaunchPadName(true);
const ccfgSettings = threadCCFGSettings[boardName + "_CCFG_SETTINGS"];

exports = {
    POLL_PERIOD_MAX: POLL_PERIOD_MAX,
    POLL_PERIOD_WARN_MIN: POLL_PERIOD_WARN_MIN,
    PSKD_MIN_LEN: PSKD_MIN_LEN,
    PSKD_MAX_LEN: PSKD_MAX_LEN,
    EXT_ADDR_LEN: EXT_ADDR_LEN,
    PAN_ID_LEN: PAN_ID_LEN,
    EXT_PAN_ID_LEN: EXT_PAN_ID_LEN,
    MASTER_KEY_LEN: MASTER_KEY_LEN,
    NETWORK_NAME_MAX_LEN: NETWORK_NAME_MAX_LEN,
    getDeviceOrLaunchPadName: getDeviceOrLaunchPadName,
    ccfgSettings: ccfgSettings
};
