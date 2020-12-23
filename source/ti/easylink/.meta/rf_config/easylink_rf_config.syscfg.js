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
 *  ======== easylink_rf_config.syscfg.js ========
 */

"use strict";

// Get common utility functions
const Common = system.getScript("/ti/easylink/easylink_common.js");

// Get RF Setting long descriptions
const docs = system.getScript("/ti/easylink/rf_config/"
    + "easylink_rf_config_docs.js");

const customPhyName = "EasyLink_Phy_Custom";
const lastPhyLockReason = "Locked because a minimum of one phy must be enabled "
    + "at all times";

// Configurables for the EasyLink RF Configuration module
const config = constructGroups(getAllPhyConfigurables(null));

// Add default phy as the last in the list
config.push({
    name: "defaultPhy",
    displayName: "Default PHY",
    description: "The default PHY modulation to be used when "
        + "EasyLink_init() is called",
    longDescription: docs.defaultPhyLongDescription,
    getDisabledOptions: generateDisabledOptions(),
    options: getBoardEasyLinkRfOptions(null), // Phy options differ b/w devices
    default: customPhyName // All devices have a custom phy option
});

// Add configurable as the first in the list
config.splice(0, 0, {
    name: "configInSrfStudio",
    displayName: "Use Legacy SmartRF Studio Settings",
    description: "Do not generate RF settings via SysConfig",
    longDescription: docs.configInSrfStudioLongDescription,
    default: false,
    onChange: onRadioConfigChange
});


// Add configurable as the first in the list
const rfDesignOptions = getRfDesignOptions(system.deviceData.deviceId);
config.splice(0, 0, {
    name: "rfDesign",
    displayName: "Based On RF Design",
    description: "Select which RF Design to use as a template",
    longDescription: docs.rfDesignLongDescription,
    options: rfDesignOptions,
    default: rfDesignOptions[0].name,
    onChange: onRadioConfigChange
});

/*
 *  ======== constructGroups ========
 *  Creates a 2.4 and sub1 group if there are both Sub-1GHz and 2.4GHz PHYs in
 *  the provided phyCheckBoxes list. If there is only one type of phy, then the
 *  same list passed to this function will be returned.
 *
 *  @param phyCheckBoxes - A list of all possible phys supported for the current
 *                         board/device in valid SysConfig check-box format
 *
 * @returns Array - Either an array containing a Sub-1GHz and 2.4GHz group or
 *                  the same array passed to this function depending on whether
 *                  two different types of phys are present
 */
function constructGroups(phyCheckBoxes)
{
    let result = phyCheckBoxes;

    // Get a list of the prop 2.4GHz phys
    const prop24Phys = _.filter(phyCheckBoxes, (phy) => (
        phy.name.includes("Phy_2_4")
    ));

    // Get a list of the prop sub-1GHz phys
    const propSub1Phys = _.filter(phyCheckBoxes, (phy) => (
        !phy.name.includes("Phy_2_4") && !(phy.name === customPhyName)
    ));

    // If there are both sub1 and 2.4 GHz phys, create separate groups for each
    if((prop24Phys.length > 0) && (propSub1Phys.length > 0))
    {
        // Find the custom phy so it can be first in the config list
        const customPhy = _.filter(phyCheckBoxes, (phy) => (
            phy.name === customPhyName
        ));

        // Construct a prop Sub-1GHz group
        const propSub1Group = {
            displayName: "Sub-1GHz Proprietary PHYs",
            config: propSub1Phys,
            collapsed: false
        };

        // Construct a prop 2.4GHz group
        const prop24Group = {
            displayName: "2.4GHz Proprietary PHYs",
            config: prop24Phys,
            collapsed: false
        };

        result = [customPhy[0], propSub1Group, prop24Group];
    }

    return(result);
}

/*
 *  ======== getAllPhyConfigurables ========
 *  Creates an array of all the device specific PHYs in valid SysConfig config
 *  format for a checkbox.
 *
 * @returns Array - array of check-boxes
 */
function getAllPhyConfigurables(inst)
{
    // Get board specific options
    const options = getBoardEasyLinkRfOptions(inst);

    return(_.map(options, (phy) => ({
        name: phy.name,
        displayName: phy.displayName,
        onChange: onRadioConfigChange,
        default: phy.name === customPhyName,
        readOnly: phy.name === customPhyName ? lastPhyLockReason : false
    })));
}

/*
 *  ======== generateDropDownOptions ========
 *  Generates a list of options that should be disabled in the defaultPhy
 *  drop-down
 *
 * @returns Array - array of strings that should be disabled
 */
function generateDisabledOptions()
{
    return((inst) => getEnabledOrDisabledOptions(inst, false));
}

/*
 *  ======== getEnabledOrDisabledOptions ========
 *  Generates an array of the currently selected or deselected device specific
 *  PHYs
 *
 * @param inst - Instance of this module
 * @param enabledMask - Boolean, True = return enabled list, False = return
 *                      disabled list
 *
 * @returns Array - Array of the names of the PHYs enabled or disabled depending
 *                  on the value of enabledMask
 */
function getEnabledOrDisabledOptions(inst, enabledMask)
{
    const options = [];

    // Only generate the list of the settings are being generated by SysConfig
    if(!inst.configInSrfStudio)
    {
        // Find the configurable we're going to generate a disabled list from
        const phyList = getAllPhyConfigurables(inst);

        // Iterate over all the possible phy's
        let phy = null;
        for(phy of phyList)
        {
            // Check if state of PHY is the same as the list being requested
            if(inst[phy.name] === enabledMask)
            {
                options.push({
                    name: phy.name,
                    reason: "This PHY has not been enabled yet"
                });
            }
        }
    }

    return(options);
}

/*
 *  ======== getRfDesignOptions ========
 *  Generates an array of SRFStudio compatible rfDesign options based on device
 *
 * @param deviceId - device being used
 *
 * @returns Array - Array of rfDesign options, if the device isn't supported,
 *                  returns null
 */
function getRfDesignOptions(deviceId)
{
    let newRfDesignOptions = null;
    if(deviceId === "CC1352P1F3RGZ")
    {
        newRfDesignOptions = [
            {name: "LAUNCHXL-CC1352P1"},
            {name: "LAUNCHXL-CC1352P-2"},
            {name: "LAUNCHXL-CC1352P-4"}
        ];
    }
    else if(deviceId === "CC1352R1F3RGZ")
    {
        newRfDesignOptions = [{name: "LAUNCHXL-CC1352R1"}];
    }
    else if(deviceId === "CC1312R1F3RGZ")
    {
        newRfDesignOptions = [{name: "LAUNCHXL-CC1312R1"}];
    }
    else if(deviceId === "CC2642R1FRGZ")
    {
        newRfDesignOptions = [{name: "LAUNCHXL-CC26X2R1"}];
    }
    else if(deviceId === "CC2652R1FRGZ")
    {
        newRfDesignOptions = [{name: "LAUNCHXL-CC26X2R1"}];
    }
    else if(deviceId === "CC2652RB")
    {
        newRfDesignOptions = [{name: "LAUNCHXL-CC2652RB"}];
    }
    else if(deviceId === "CC2652P1FSIP")
    {
        newRfDesignOptions = [{name: "LP_CC2652PSIP"}];
    }
    else if(deviceId === "CC2652R1FSIP")
    {
        newRfDesignOptions = [{name: "LP_CC2652RSIP"}];
    }

    return(newRfDesignOptions);
}

/*
 *  ======== getPropPhySettings ========
 *  Determines which rf_defaults script to use based on device or inst.rfDesign
 *  returns the proprietary phy settings
 *
 * @param inst - Instance of this module
 * @param deviceId - device being used
 *
 * @returns Array - an array of proprietary phy settings in radioconfig format.
 *                  If device is not supported, returns null
 */
function getPropPhySettings(inst, deviceId)
{
    let phySettings = null;

    if(inst !== null)
    {
        // Get the RF Design configurable
        const rfDesign = inst.rfDesign;

        if(rfDesign === "LAUNCHXL-CC1352P-4")
        {
            phySettings = system.getScript("/ti/easylink/rf_config/"
                + "CC1352P_4_LAUNCHXL_rf_defaults.js").defaultPropPhyList;
        }
        else if(rfDesign === "LAUNCHXL-CC1352P1")
        {
            phySettings = system.getScript("/ti/easylink/rf_config/"
                + "CC1352P1_LAUNCHXL_rf_defaults.js").defaultPropPhyList;
        }
        else if(rfDesign === "LAUNCHXL-CC1352P-2")
        {
            phySettings = system.getScript("/ti/easylink/rf_config/"
                + "CC1352P_2_LAUNCHXL_rf_defaults.js").defaultPropPhyList;
        }
    }
    else if(deviceId === "CC1352P1F3RGZ")
    {
        phySettings = system.getScript("/ti/easylink/rf_config/"
            + "CC1352P1_LAUNCHXL_rf_defaults.js").defaultPropPhyList;
    }

    if(deviceId === "CC1352R1F3RGZ")
    {
        phySettings = system.getScript("/ti/easylink/rf_config/"
            + "CC1352R1_LAUNCHXL_rf_defaults.js").defaultPropPhyList;
    }
    else if(deviceId === "CC1312R1F3RGZ")
    {
        phySettings = system.getScript("/ti/easylink/rf_config/"
            + "CC1312R1_LAUNCHXL_rf_defaults.js").defaultPropPhyList;
    }
    else if(deviceId === "CC2642R1FRGZ")
    {
        phySettings = system.getScript("/ti/easylink/rf_config/"
            + "CC26X2R1_LAUNCHXL_rf_defaults.js").defaultPropPhyList;
    }
    else if(deviceId === "CC2652R1FRGZ")
    {
        phySettings = system.getScript("/ti/easylink/rf_config/"
            + "CC26X2R1_LAUNCHXL_rf_defaults.js").defaultPropPhyList;
    }
    else if(deviceId === "CC2652P1FSIP")
    {
        phySettings = system.getScript("/ti/easylink/rf_config/"
            + "LP_CC2652PSIP_rf_defaults.js").defaultPropPhyList;
    }
    else if(deviceId === "CC2652R1FSIP")
    {
        phySettings = system.getScript("/ti/easylink/rf_config/"
            + "LP_CC2652RSIP_rf_defaults.js").defaultPropPhyList;
    }

    return(phySettings);
}

/*
 *  ======== onRadioConfigChange ========
 *  Triggered on changes to:
 *     - inst.rfDesign
 *     - inst.configInSrfStudio
 *     - inst.Easylink_<phy>
 *
 * @param inst  - Module instance containing the config that changed
 * @param ui    - The User Interface object
 */
function onRadioConfigChange(inst, ui)
{
    // ======= Updates associated with state of inst.configInSrfStudio ========
    let phy = null;
    const phyList = getAllPhyConfigurables(inst);
    for(phy of phyList)
    {
        ui[phy.name].hidden = inst.configInSrfStudio;
    }

    if(inst.configInSrfStudio)
    {
        // Set the default and supported phys to custom
        inst.defaultPhy = customPhyName;

        // Disable the ability to configure phy settings via SysConfig
        ui.defaultPhy.readOnly = `Only a Custom phy can be used when `
            + `${system.getReference(inst, "configInSrfStudio")} is selected`;
    }
    else
    {
        // Allow the user to configure phy settings via SysConfig
        ui.defaultPhy.readOnly = false;
    }

    // == Updates associated with state of inst.Easylink_<phy> configurables ==
    /*
     * Need to ensure at least 1 phy is selected/enabled at all times. This is
     * done with the following logic:
     *     - If more than 1 phy is selected/enabled, unlock all phys
     *     - If only 1 phy is selected, lock that selection leaving the others
     *       unlocked
     */
    const enabledPhys = getEnabledOrDisabledOptions(inst, true);
    let defaultPhyIsValid = false;
    if(enabledPhys.length > 1)
    { // More than 1 PHY selected, unlock all PHYs
        for(phy of enabledPhys)
        {
            ui[phy.name].readOnly = false;
            if(phy.name === inst.defaultPhy)
            {
                defaultPhyIsValid = true;
            }
        }
    }
    else if(enabledPhys.length > 0)
    { // Only 1 PHY selected, lock that selection
        ui[enabledPhys[0].name].readOnly = lastPhyLockReason;
        if(enabledPhys[0].name === inst.defaultPhy)
        {
            defaultPhyIsValid = true;
        }
    }

    // If the defaultPhy is no longer enabled, set it to the first enabled PHY
    if(!defaultPhyIsValid && enabledPhys.length > 0)
    {
        inst.defaultPhy = enabledPhys[0].name;
    }
}

/*
 *  ======== getBoardEasyLinkRfOptions ========
 *  Retrieves the board/devices rfSettings from the <board_name>_rf_defaults.js
 *  file and returns an options array for the Easylink stack
 *
 *  @returns Array - an array containing one or more dictionaries with the
 *                   following keys: displayName, name
 *
 */
function getBoardEasyLinkRfOptions(inst)
{
    const propPhySettings = getPropPhySettings(inst,
        system.deviceData.deviceId);
    const ezPhys = _.filter(propPhySettings, (phy) => (
        "easyLinkOption" in phy));

    // Construct the options array
    const options = _.map(ezPhys, (phy) => phy.easyLinkOption);

    // Add the custom phy option, regardless of device
    options.splice(0, 0, {
        name: customPhyName,
        displayName: "Custom"
    });

    return(options);
}

/*
 *  ======== addRfSettingDependency ========
 *  Creates an RF setting dependency module
 *
 * @param easyLinkPhyType  - EasyLink enum representation of the phy type
 * @returns dictionary - containing a single RF setting dependency module
 */
function addRfSettingDependency(easyLinkPhyType, propPhySettings)
{
    let radioConfigArgs = {};
    let displayName = "Custom";
    const radioConfigVarName = Common.underscoreToCamelCase(easyLinkPhyType);

    // If the PHY is custom, find the first PHY that has EasyLink support
    if(easyLinkPhyType === customPhyName)
    {
        let basePhy = _.find(propPhySettings, (i) => ("easyLinkOption" in i));

        // Cover the case when there is no supported easylink phy
        if(basePhy === undefined)
        {
            basePhy = {args: {}};
        }

        // When creating a custom PHY, these settings persist from base PHY
        const customPhyWhiteList = ["useMulti", "paExport", "cmdList_prop"];

        // Get the settings from the base phy
        radioConfigArgs = _.cloneDeep(basePhy.args);
        radioConfigArgs.codeExportConfig = {};

        const baseCodeExport = basePhy.args.codeExportConfig;

        // Extract the whitelist settings from the base PHY
        let key = null;
        for(key in basePhy.args.codeExportConfig)
        {
            if(customPhyWhiteList.includes(key))
            {
                radioConfigArgs.codeExportConfig[key] = baseCodeExport[key];
            }
        }

        radioConfigArgs.codeExportConfig.symGenMethod = "Legacy";
        radioConfigArgs.$name = "EasyLink_RF_Custom_Setting";
        radioConfigArgs.permission = "ReadWrite";
    }
    else
    {
        // Not a custom PHY
        const phy = _.find(propPhySettings, (i) => (("easyLinkOption" in i)
            && (i.easyLinkOption.name === easyLinkPhyType)));

        radioConfigArgs = _.cloneDeep(phy.args);
        radioConfigArgs.$name = "EasyLink_" + radioConfigArgs.$name;
        radioConfigArgs.permission = "ReadOnly";
        displayName = phy.easyLinkOption.displayName;
    }

    // All EasyLink Phys use a variable packet length
    radioConfigArgs.packetLengthConfig = "Variable";

    return({
        name: "radioConfig" + radioConfigVarName,
        displayName: displayName + " Radio Settings",
        moduleName: "/ti/devices/radioconfig/settings/prop",
        collapsed: true,
        group: "radioSettings",
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
function moduleInstances(inst)
{
    const dependencyModule = [];

    const propPhySettings = getPropPhySettings(inst,
        system.deviceData.deviceId);

    if(!inst.configInSrfStudio)
    {
        const phyList = getAllPhyConfigurables(inst);

        let phy = null;
        for(phy of phyList)
        {
            if(inst[phy.name])
            {
                dependencyModule.push(addRfSettingDependency(phy.name,
                    propPhySettings));
            }
        }
    }

    return(dependencyModule);
}

/*
 * ======== validate ========
 * Validate this inst's configuration
 *
 * @param inst       - RF Settings instance to be validated
 * @param validation - object to hold detected validation issues
 */
function validate(inst, validation)
{
    let enabledPhys = [];

    // Get the RF Design module
    const rfDesign = system.modules["/ti/devices/radioconfig/rfdesign"].$static;

    if(system.deviceData.board != null)
    {
        let srfStudioBoardName = Common.getDeviceOrLaunchPadName(true);
        // Convert board name to SmartRF Studio notation
        if(srfStudioBoardName.includes("_LAUNCHXL"))
        {
            srfStudioBoardName = "LAUNCHXL-"
                + srfStudioBoardName.replace("_LAUNCHXL", "");
            srfStudioBoardName = srfStudioBoardName.replace("_", "-");
        }
        else if(srfStudioBoardName.includes("LP_"))
        {
            // SIP LaunchPads; SmartRF Studio and SysConfig board
            // names are identical
        }
        else
        {
            throw new Error("Unknown board [" + srfStudioBoardName + "]");
        }

        if(srfStudioBoardName !== inst.rfDesign)
        {
            validation.logError("RF Design must align with board selection: "
                + srfStudioBoardName, inst, "rfDesign");
            return;
        }
    }

    if(inst.rfDesign !== rfDesign.rfDesign)
    {
        validation.logError(`Must match ${system.getReference(rfDesign,
            "rfDesign")} in the RF Design Module`, inst, "rfDesign");
        return;
    }

    // Get a list of the phys that are currently enabled
    if(!inst.configInSrfStudio)
    {
        enabledPhys = getEnabledOrDisabledOptions(inst, true);
    }

    // Iterate over all the enabled phys verifying the code export settings
    let phy = null;
    for(phy of enabledPhys)
    {
        // Get the radio config instance for the phy
        const rcName = "radioConfig" + Common.underscoreToCamelCase(phy.name);
        const radioConfigInst = inst[rcName];

        if((inst.rfDesign === "LAUNCHXL-CC1352P-4")
            && (phy.name === "EasyLink_Phy_200kbps2gfsk"))
        {
            validation.logError(`EasyLink stack does not support this PHY when `
                + `${system.getReference(inst, "rfDesign")} is set to `
                + `LAUNCHXL-CC1352P-4`, inst, "EasyLink_Phy_200kbps2gfsk");
            return;
        }

        // If this is a P board, need to check for PA settings
        if(inst.rfDesign.includes("CC1352P"))
        {
            // Verify combined PA table
            if(radioConfigInst.codeExportConfig.paExport !== "combined")
            {
                validation.logError("EasyLink stack requires a Combined PA "
                    + "Table", radioConfigInst.codeExportConfig, "paExport");
            }

            // Verify div setup PA command
            if(!radioConfigInst.codeExportConfig.cmdList_prop.includes(
                "cmdPropRadioDivSetupPa"
            ))
            {
                validation.logError("EasyLink stack requires the "
                    + "CMD_PROP_RADIO_DIV_SETUP_PA command",
                radioConfigInst.codeExportConfig, "cmdList_prop");
            }
        }
        else
        { // Not a P board, don't check for P settings
            // Verify radio div setup
            if(!radioConfigInst.codeExportConfig.cmdList_prop.includes(
                "cmdPropRadioDivSetup"
            ))
            {
                validation.logError("EasyLink stack requires the "
                    + "CMD_PROP_RADIO_DIV_SETUP command",
                radioConfigInst.codeExportConfig, "cmdList_prop");
            }

            // Verify active PA table
            if(radioConfigInst.codeExportConfig.paExport !== "active")
            {
                validation.logError("EasyLink stack requires an Active PA "
                    + "Table", radioConfigInst.codeExportConfig, "paExport");
            }
        }

        // If using IEEE 15.4 PHY check for TX Adv command
        if(radioConfigInst["phyType"
            + radioConfigInst.freqBand].includes("154g"))
        {
            if(!radioConfigInst.codeExportConfig.cmdList_prop.includes(
                "cmdPropTxAdv"
            ))
            {
                validation.logError("EasyLink stack requires the "
                    + "CMD_PROP_TX_ADV command",
                radioConfigInst.codeExportConfig, "cmdList_prop");
            }
        }
        else if(!radioConfigInst.codeExportConfig.cmdList_prop.includes(
            "cmdPropTx"
        ))
        { // Not using IEEE 15.4 PHY, verify Tx command
            validation.logError("EasyLink stack requires the CMD_PROP_TX "
                + "command", radioConfigInst.codeExportConfig, "cmdList_prop");
        }

        // Verify the Rx Adv command
        if(!radioConfigInst.codeExportConfig.cmdList_prop.includes(
            "cmdPropRxAdv"
        ))
        {
            validation.logError("EasyLink stack requires the CMD_PROP_RX_ADV "
                + "command", radioConfigInst.codeExportConfig, "cmdList_prop");
        }

        // Verify the FS command
        if(!radioConfigInst.codeExportConfig.cmdList_prop.includes("cmdFs"))
        {
            validation.logError("EasyLink stack requires the CMD_FS command",
                radioConfigInst.codeExportConfig, "cmdList_prop");
        }
    }
}

/*
 *  ======== rfConfig ========
 *  Define the EasyLink rfConfig properties and methods
 */
const rfConfig = {
    config: {
        displayName: "Radio",
        name: "radioSettings",
        description: "Configure PHY settings for radio operations",
        config: config
    },
    validate: validate,
    moduleInstances: moduleInstances
};

exports = rfConfig;
