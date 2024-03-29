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
 *  ======== lprf_rf_design_settings.js ========
 */

/*
 * TO USE THIS FILE:
 *    This file is only meant to be used when a board is defined!
 *
 *    In your .syscfg file, you can use the following code snippet to set the
 *    rfDesign settings:
 *     // ======== RF Design ========
 *     var rfDesign = scripting.addModule("ti/devices/radioconfig/rfdesign");
 *     const rfDesignSettings = system.getScript("/ti/common/lprf_rf_design_settings.js").rfDesignSettings;
 *     for(var setting in rfDesignSettings)
 *     {
 *         rfDesign[setting] = rfDesignSettings[setting];
 *     }
 */
"use strict";

let rfDesignSettings = {};

/*!
 *  ======== getLaunchPadName ========
 *  Get the name of the board being used, return name of device if no board
 *
 *  @returns String - Name of the board with prefix /ti/boards and
 *                    suffix .syscfg.json stripped off.  If no board
 *                    was specified, the device name is returned.
 */
function getLaunchPadName()
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

    return(name);
}

// Settings for ti/devices/CCFG module
const boardSpecificRfDesignSettings = {
    CC1312R1_LAUNCHXL_RF_DESIGN_SETTINGS: {
        rfDesign: "LAUNCHXL-CC1312R1"
    },
    CC1352R1_LAUNCHXL_RF_DESIGN_SETTINGS: {
        rfDesign: "LAUNCHXL-CC1352R1"
    },
    CC1352P1_LAUNCHXL_RF_DESIGN_SETTINGS: {
        rfDesign: "LAUNCHXL-CC1352P1"
    },
    CC1352P_2_LAUNCHXL_RF_DESIGN_SETTINGS: {
        rfDesign: "LAUNCHXL-CC1352P-2"
    },
    CC1352P_4_LAUNCHXL_RF_DESIGN_SETTINGS: {
        rfDesign: "LAUNCHXL-CC1352P-4"
    },
    CC26X2R1_LAUNCHXL_RF_DESIGN_SETTINGS: {
        rfDesign: "LAUNCHXL-CC26X2R1"
    },
    CC2652RB_LAUNCHXL_RF_DESIGN_SETTINGS: {
        rfDesign: "LAUNCHXL-CC2652RB"
    },
};

// Get the LaunchPad specific CCFG Settings
if(system.deviceData.board)
{
    const boardName = getLaunchPadName();
    rfDesignSettings = Object.assign(rfDesignSettings,
        boardSpecificRfDesignSettings[boardName + "_RF_DESIGN_SETTINGS"]);
}

exports = {
    rfDesignSettings: rfDesignSettings
};
