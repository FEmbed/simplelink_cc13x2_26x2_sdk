/*
 * Copyright (c) 2019-2020 Texas Instruments Incorporated - http://www.ti.com
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
 *  ======== device_info.js ========
 *  Device information database
 */

"use strict";

// Module version
const RADIO_CONFIG_VERSION = "1.7";

// Common utility functions
const Common = system.getScript("/ti/devices/radioconfig/radioconfig_common.js");

// Global path to Radio configuration root
const ConfigPath = Common.basePath + "config/";

// Mapping SysCfg device name notation to SmartRF Studio format */
const DevNameMap = {
    // SysCfg name: SmartRF Studio name
    CC1352R1F3RGZ: "cc1352r",
    CC1352P1F3RGZ: "cc1352p",
    CC1312R1F3RGZ: "cc1312r",
    CC2652R1FRGZ: "cc2652r",
    CC2652R1FSIP: "cc2652rs",
    CC2642R1FRGZ: "cc2642r",
    CC2652RB: "cc2652rb",
    CC2652PRGZ: "cc2652p",
    CC2652P1FSIP: "cc2652ps"
};

// SmartRF Studio compatible device name
const DeviceName = DevNameMap[Common.Device];

if (!DeviceName) {
    throw Error(Common.Device + " is not supported by RadioConfig");
}

// True if High PA device
const HighPaDevice = DeviceName === "cc1352p" || DeviceName.includes("cc2652p");

// True if wBMS support
const wbmsSupport = DeviceName === "cc2642r";

/*
 * Global device information
 */
const DevInfo = {
    // Path to the configuration data for the device
    devicePath: ConfigPath + DeviceName + "/",
    phyGroup: {
        prop: {},
        ble: {},
        ieee_15_4: {}
    },
    // PHY name: "ble", "prop" or "ieee_15_4"
    phy: "",
    // Board name on SmartRF Studio format
    target: "",
    // True if device supports High PA (CC1352P and CC2652P)
    highPaSupport: HighPaDevice
};

// Load the device configuration database
const DevConfig = getDeviceConfig();

// Exported from this module
exports = {
    addPhyGroup: addPhyGroup,
    getVersionInfo: getVersionInfo,
    getConfiguration: (phy) => DevInfo.phyGroup[phy].config,
    getSettingMap: (phy) => DevInfo.phyGroup[phy].settings,
    getDeviceName: () => DeviceName,
    getParamPath: (phy) => DevInfo.phyGroup[phy].paramPath,
    getSettingPath: (phy) => getFilePathPhy("categories.json", phy),
    getRfCommandDef: (phy) => getFullPathPhy("rf_command_definitions.json", phy),
    getTargetPath: (phy) => getFilePathPhy("targets.json", phy),
    getTargetIndex: (phy) => getFullPathPhy("targets.json", phy),
    getPaSettingsPath: () => getFilePath("pasettings.json"),
    getFrontEndFile: (phy) => getFullPathPhy("frontend_settings.json", phy),
    getCmdMapping: (phy) => getFullPathPhy("param_cmd_mapping.json", phy),
    hasHighPaSupport: () => DevInfo.highPaSupport,
    getOverridePath: (phy) => getFilePathPhy("dummy_file_overrides.json", phy)
};

/*!
 *  ======== getConfiguration ========
 *  Load configuration data of a PHY group
 *
 *  @param phy - ble, prop or ieee_154
 */
function loadConfiguration(phy) {
    const fileName = DevInfo.phyGroup[phy].paramPath + "param_syscfg.json";
    const devCfg = system.getScript(fileName);
    if (wbmsSupport) {
        devCfg.configs[0].options.push(
            {
                name: "wbms2m",
                description: "wBMS, 2 Mbps"
            }
        );
    }
    return devCfg;
}

/*!
 *  ======== createSettingMap ========
 *  Create list of PHY settings for a PHY group
 *
 *  @param phy - ble, prop or ieee_154
 */
function createSettingMap(phy) {
    const data = DevInfo.phyGroup[phy].config;
    const paKey = HighPaDevice ? "highPA" : "standard";

    if (phy === Common.PHY_IEEE_15_4) {
        return data.phys.ieee[paKey];
    }
    else if (phy === Common.PHY_BLE) {
        if (wbmsSupport) {
            const settingsWBMS = {
                name: "wbms2m",
                description: "wBMS, 2 Mbps",
                file: "setting_wbms_2m.json"
            };
            data.phys.ble.standard.push(settingsWBMS);
        }
        return HighPaDevice ? data.phys.ble.highPA : data.phys.ble.standard;
    }
    else if (phy === Common.PHY_PROP) {
        let settingMap = [];
        if (Common.isSub1gDevice()) {
            settingMap = data.phys.prop868[paKey].concat(data.phys.prop433[paKey]).concat(data.phys.prop169[paKey]);
        }
        if (Common.HAS_24G_PROP) {
            settingMap = settingMap.concat(data.phys.prop2400.standard);
        }
        return settingMap;
    }
    throw Error("Unknown protocol: ", phy);
}

/*!
 *  ======== getVersionInfo ========
 *  Get version information for RadioConfig and SmartRF Studio
 */
function getVersionInfo() {
    const deviceList = system.getScript(ConfigPath + "device_list.json");

    const smartRFDataVersion = deviceList.devicelist.version;
    return {moduleVersion: RADIO_CONFIG_VERSION, dataVersion: smartRFDataVersion};
}

/*!
 *  ======== getDeviceConfig ========
 *  Create a device configuration database.
 *
 *  Grouped by the PHY's that are available for the current device.
 */
function getDeviceConfig() {
    const files = system.getScript(DevInfo.devicePath + "device_config.json").configFiles.path;
    const fileLists = {
        default: [],
        ble: [],
        prop: [],
        ieee_15_4: []
    };

    _.each(files, (value) => {
        const entry = {
            path: value.$,
            file: value._file
        };

        let list;
        if ("_phy" in value) {
            const phy = value._phy;
            list = fileLists[phy];
        }
        else {
            list = fileLists.default;
        }

        if ("_version" in value) {
            // Versioned: remove base entry
            // assuming base entry is immediately before versioned entry
            list.pop();
        }
        list.push(entry);
    });

    return fileLists;
}

/*!
 *  ======== getFullPathPhy ========
 *  Return the path including the file name
 *
 * @param file - name of the file which path is to be determined
 * @param phy - ble, prop or ieee_154
 */
function getFullPathPhy(file, phy) {
    return getFilePathPhy(file, phy) + file;
}

/*!
 *  ======== getFilePath ========
 *  Return the path of a file.
 *
 * @param file - name of the file which path is to be determined
 */
function getFilePath(file) {
    return getFilePathPhy(file, DevInfo.phy);
}

/*!
 *  ======== getFilePathPhy ========
 *  Return the path of a file, restricted by PHY as filter
 *
 * @param file - name of the file which path is to be determined
 */
function getFilePathPhy(file, phy) {
    const fileList = DevConfig[phy].concat(DevConfig.default);

    // Get the file-object in the file list
    const correctFile = _.find(fileList, ["file", file]);

    if (_.isUndefined(correctFile)) {
        throw Error("No PHY path for " + phy + "/" + file);
    }

    return ConfigPath + correctFile.path + "/";
}

/*!
*  ======== addPhyGroup ========
*  Initialize the database for the specified PHY group
*
*  @param phy - PHY group short name (prop, ble, or ieee_15_4)
*/
function addPhyGroup(phy) {
    const phyPath = getFilePathPhy("rf_command_definitions.json", phy);
    const phyDir = phyPath.slice(0, -1);
    let paramPath;
    if (DeviceName === "cc2652p" && phy === Common.PHY_PROP) {
        paramPath = getFilePathPhy("categories.json", phy) + "../";
    }
    else {
        paramPath = getFilePathPhy("param_definition.json", phy);
    }

    const phyInfo = {
        phy: phy,
        phyPath: phyPath,
        phyDir: phyDir,
        paramPath: paramPath
    };
    DevInfo.phyGroup[phy] = phyInfo;
    DevInfo.phy = phy;
    phyInfo.config = loadConfiguration(phy);
    phyInfo.settings = createSettingMap(phy);
}
