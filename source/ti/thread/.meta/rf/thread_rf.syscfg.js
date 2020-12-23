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
 * =========================== thread_rf.syscfg.js ===========================
 *
 * Submodule definition for the SysConfig Thread RF submodule
 */

"use strict";

const deviceId = system.deviceData.deviceId;

// Get RF command handler
const CmdHandler = system.getScript("/ti/devices/radioconfig/cmd_handler.js");

// Get RF design functions
const RfDesign = system.getScript("/ti/devices/radioconfig/rfdesign");

// Get radio config module functions
const RadioConfig = system.getScript("/ti/devices/radioconfig/radioconfig_common.js");

/* Description text for configurables */
const channelDescription = `The default IEEE 802.15.4 frequency channel for \
the device`;

const channelLongDescription = `The default IEEE 802.15.4 frequency channel \
for the device

**Default Channel:** 14

**Range:** Channel 11-26`;

const txpowerDescription = `The default transmit power in dBm`;

const txpowerLongDescription = `The default transmit power in dBm\

**Default Power:** 0`;

/* RadioConfig module definition and default configurations */
function moduleInstances(inst)
{
    const cmdList = [
        "cmdIeeeTx",
        "cmdIeeeRx",
        "cmdIeeeCsma",
        "cmdIeeeEdScan",
        "cmdIeeeRxAck",
        "cmdTxTest"
    ];

    const radioConfigArgs = {
        frequency: 2405 + (5 * (inst.channel - 11)),
        codeExportConfig: {
            symGenMethod: "Legacy",
            paExport: "active",
            useConst: true,
            cmdList_ieee_15_4: cmdList
        }
    };

    const radioConfigModule = {
        name: "radioConfig",
        displayName: "Advanced Radio Settings",
        moduleName: "/ti/devices/radioconfig/settings/ieee_15_4",
        readOnly: true,
        collapsed: true,
        args: radioConfigArgs
    };

    var boardName = RadioConfig.getBoardName();

    /* Special handling for the P-4 2.4GHz front end characterization settings */
    if(boardName.match(/LAUNCHXL-CC1352P-4/))
    {
        radioConfigArgs.phyType = "ieee154p10";
    }

    // Add high PA options if present
    if(deviceId.match(/CC(2652R|1352R1)/))
    {
        cmdList.push("cmdRadioSetup");
        // set TX power to the max value, this config is not important because
        // it is reset by TI-OpenThread initialization code
        // freq = 2405; just a value in 2.4GHz
        // paEnable = false; to force normal PA options
        radioConfigArgs.txPower = RfDesign.getTxPowerOptions(2405, false)[0].name;
    }
    else if(deviceId.match(/CC(2652P|1352P)/))
    {
        cmdList.push("cmdRadioSetupPa");
        radioConfigArgs.highPA = true;
        radioConfigArgs.codeExportConfig.paExport = "combined";
        // set TX power to the max value, this config is not important because
        // it is reset by TI-OpenThread initialization code
        // freq = 2405; just a value in 2.4GHz
        // paEnable = true; to force high PA options
        radioConfigArgs.txPowerHi = RfDesign.getTxPowerOptions(2405, true)[0].name;
    }
    else
    {
        throw new Error("Could not match platform to any known platform types");
    }

    return([radioConfigModule]);
}

/*!
 * ======== getTxPowerConfigOptions ========
 *
 * Get list of available Tx power values
 *
 * @returns a list of available transmit power options from the radio config
 */
function getTxPowerConfigOptions()
{
    let txPowerValueList = [];
    const tmp = system.getScript("/ti/devices/radioconfig/settings/ieee_15_4");
    const rfSettings = _.cloneDeep(tmp.config);

    // Get the command handler for this phy instance
    const cmdHandler = CmdHandler.get(RadioConfig.PHY_IEEE_15_4, "ieee154");
    const freq = cmdHandler.getFrequency();

    // Regular PA options
    txPowerValueList = _.concat(txPowerValueList, RfDesign.getTxPowerOptions(freq, false));
    // High PA options (if available)
    txPowerValueList = _.concat(txPowerValueList, RfDesign.getTxPowerOptions(freq, true));

    // Round all tx power values
    _.forEach(txPowerValueList, (option) =>
    {
        option.name = _.round(option.name);
    });

    // Remove any duplicates
    txPowerValueList = _.uniqBy(txPowerValueList, "name");

    // Sort values in descending order
    txPowerValueList = _.orderBy(txPowerValueList, "name", "desc");

    return(txPowerValueList);
}

/*!
 * ======== rfModule ========
 *
 * Syscfg submodule for TI-OpenThread RF
 */
const rfModule = {
    config: [
        {
            name: "channel",
            displayName: "Default Channel",
            description: channelDescription,
            longDescription: channelLongDescription,
            default: 14,
            options: [
                {name: 11, displayName: "11 - 2405 MHz"},
                {name: 12, displayName: "12 - 2410 MHz"},
                {name: 13, displayName: "13 - 2415 MHz"},
                {name: 14, displayName: "14 - 2420 MHz"},
                {name: 15, displayName: "15 - 2425 MHz"},
                {name: 16, displayName: "16 - 2430 MHz"},
                {name: 17, displayName: "17 - 2435 MHz"},
                {name: 18, displayName: "18 - 2440 MHz"},
                {name: 19, displayName: "19 - 2445 MHz"},
                {name: 20, displayName: "20 - 2450 MHz"},
                {name: 21, displayName: "21 - 2455 MHz"},
                {name: 22, displayName: "22 - 2460 MHz"},
                {name: 23, displayName: "23 - 2465 MHz"},
                {name: 24, displayName: "24 - 2470 MHz"},
                {name: 25, displayName: "25 - 2475 MHz"},
                {name: 26, displayName: "26 - 2480 MHz"}
            ]
        },
        {
            name: "txpower",
            displayName: "Default Power",
            description: txpowerDescription,
            longDescription: txpowerLongDescription,
            options: getTxPowerConfigOptions(),
            default: 0
        }
    ],
    moduleInstances: moduleInstances
};

/* Validation function for the RF submodule */
function validate(inst, validation)
{
    // Get the RF Design module
    const rfDesign = system.modules["/ti/devices/radioconfig/rfdesign"].$static;

    if(rfDesign.rfDesign === "LAUNCHXL-CC1352P4" || rfDesign.rfDesign === "LAUNCHXL-CC1352P1")
    {
       validation.logError(`Thread stack does not support this board configuration`, rfDesign, "rfDesign");
    }
}

exports = rfModule;
