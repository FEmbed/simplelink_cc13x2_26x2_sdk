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
    CC2642R1FRGZ: "cc2642r",
    CC2652RB: "cc2652rb",
    CC2652PRGZ: "cc2652p"
};

// SmartRF Studio compatible device name
const DeviceName = DevNameMap[Common.Device];

if (!DeviceName) {
    throw Error(Common.Device + " is not supported by RadioConfig");
}

// True if High PA device
const HighPaDevice = DeviceName === "cc1352p" || DeviceName === "cc2652p";

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

// Mapping PHY setting names to SmartRF Studio setting file names
let SettingsMapProp = [];

// Proprietary settings for 2.4 GHz band
if (Common.HAS_24G_PROP) {
    SettingsMapProp = [
        {
            name: "2gfsk100kbps",
            description: "100 kbps, 2-GFSK, 50 kHz deviation",
            file: "setting_tc900.json"
        },
        {
            name: "2gfsk250kbps",
            description: "250 kbps, 2-GFSK, 125 kHz deviation",
            file: "setting_tc901.json"
        },
        {
            name: "2msk250kbps",
            description: "250 kbps MSK, 62.5 kHz deviation",
            file: "setting_tc902.json"
        },
        {
            name: "custom2400",
            description: "Custom PHY Setting",
            file: "setting_tc900_custom.json"
        }
    ];
}

// Proprietary settings for SUB 1GHz band
if (DeviceName === "cc1352r" || DeviceName === "cc1312r") {
    const settingsMapPropSub1G = [
        // 868 MHz
        {
            name: "2gfsk50kbps",
            description: "50 kbps, 2-GFSK",
            file: "setting_tc106.json"
        },
        {
            name: "2gfsk1mbps868",
            description: "1 Mbps, 2-GFSK, 350 kHz deviation (868 MHz)",
            file: "setting_tc782.json"
        },
        {
            name: "2gfsk1mbps915",
            description: "1 Mbps, 2-GFSK, 350 kHz deviation (915 MHz)",
            file: "setting_tc783.json"
        },
        {
            name: "2gfsk50kbps154g",
            description: "50 kbps, 2-GFSK, 15.4g",
            file: "setting_tc106_154g.json"
        },
        {
            name: "2gfsk200kbps154g",
            description: "200 kbps, 2-GFSK, 15.4g",
            file: "setting_tc146_154g.json"
        },
        {
            name: "slr5kbps2gfsk",
            description: "5 kbps, SimpleLink Long Range",
            file: "setting_tc480.json"
        },
        {
            name: "slr2500bps2gfsk",
            description: "2.5 kbps, SimpleLink Long Range",
            file: "setting_tc481.json"
        },
        {
            name: "ook48kbps",
            description: "4.8 kbps OOK (868 MHz)",
            file: "setting_tc597.json"
        },
        {
            name: "ook48kbps915",
            description: "4.8 kbps OOK (915 MHz)",
            file: "setting_tc598.json"
        },
        {
            name: "2gfsk50kbps915wsun",
            description: "50 kbps, 2-GFSK, 12.5 KHz dev., WiSUN PHY (915 MHz)",
            file: "setting_tc119.json"
        },
        {
            name: "2gfsk50kbps868wsun",
            description: "50 kbps, 2-GFSK, 12.5 KHz dev., WiSUN PHY (868 MHz)",
            file: "setting_tc120.json"
        },
        {
            name: "2gfsk100kbps50dev915wsun",
            description: "100 kbps, 2-GFSK, 50 KHz dev., WiSUN PHY (915 MHz)",
            file: "setting_tc136.json"
        },
        {
            name: "2gfsk100kbps50dev868wsun",
            description: "100 kbps, 2-GFSK, 50 Khz dev., WiSUN PHY (868 MHz)",
            file: "setting_tc137.json"
        },
        {
            name: "2gfsk100kbps25dev915wsun",
            description: "100 kbps, 2-GFSK, 25 KHz dev., WiSUN PHY, (915 MHz)",
            file: "setting_tc140.json"
        },
        {
            name: "2gfsk100kbps25dev868wsun",
            description: "100 kbps, 2-GFSK, 25 Khz dev., WiSUN PHY, (868 MHz)",
            file: "setting_tc141.json"
        },
        {
            name: "2gfsk200kbps100dev915wsun",
            description: "200 kbps, 2-GFSK, 100 KHz dev., WiSUN PHY, (915 MHz)",
            file: "setting_tc150.json"
        },
        {
            name: "2gfsk200kbps100dev868wsun",
            description: "200 kbps, 2-GFSK, 100 Khz dev., WiSUN PHY, (868 MHz)",
            file: "setting_tc151.json"
        },
        {
            name: "2gfsk48kbpstcxo",
            description: "9.6 kbps, 2-GFSK, 2.4 kHz deviation (TCXO)",
            file: "setting_tc594.json"
        },
        {
            name: "wbdsss480ksps240kbps",
            description: "WBDSSS 480 ksps, 240 kbps",
            file: "setting_tc380.json"
        },
        {
            name: "wbdsss480ksps120kbps",
            description: "WBDSSS 480 ksps, 120 kbps",
            file: "setting_tc381.json"
        },
        {
            name: "wbdsss480ksps60kbps",
            description: "WBDSSS 480 ksps, 60 kbps",
            file: "setting_tc382.json"
        },
        {
            name: "wbdsss480ksps30kbps",
            description: "WBDSSS 480 ksps, 30 kbps",
            file: "setting_tc383.json"
        },
        {
            name: "custom868",
            description: "Custom PHY Setting",
            file: "setting_tc106_custom.json"
        },
        // 433 MHz
        {
            name: "2gfsk50kbps433mhz",
            description: "50 kbps, 2-GFSK",
            file: "setting_tc112.json"
        },
        {
            name: "2gfsk50kbps433mhz154g",
            description: "50 kbps, 2-GFSK, 15.4g",
            file: "setting_tc112_154g.json"
        },
        {
            name: "2gfsk200kpbs433mhz",
            description: "200 kbps, 2-GFSK, 50 kHz deviation",
            file: "setting_tc148.json"
        },
        {
            name: "slr5kbps433mhz",
            description: "5 kbps, SimpleLink Long Range",
            file: "setting_tc440.json"
        },
        {
            name: "slr2500bps433mhz",
            description: "2.5 kbps, SimpleLink Long Range",
            file: "setting_tc441.json"
        },
        {
            name: "2gfsk48kpbs426mhz",
            description: "4.8 kbps, 2-GFSK, 2 kHz deviation",
            file: "setting_tc596.json"
        },
        {
            name: "ook48kbps433mhz",
            description: "4.8 kbps OOK",
            file: "setting_tc599.json"
        },
        {
            name: "custom433",
            description: "Custom PHY Setting",
            file: "setting_tc112_custom.json"
        }
    ];

    if (DeviceName === "cc1312r") {
        SettingsMapProp = settingsMapPropSub1G;
    }
    else {
        // CC1352R
        SettingsMapProp = SettingsMapProp.concat(settingsMapPropSub1G);
    }
}
else if (DeviceName === "cc1352p") {
    const settingsMapPropSub1G = [
        // 868 MHz
        {
            name: "2gfsk50kbps",
            description: "50 kbps, 2-GFSK",
            file: "setting_tc706.json"
        },
        {
            name: "2gfsk1mbps868",
            description: "1 Mbps, 2-GFSK, 350 kHz deviation (868 MHz)",
            file: "setting_tc784.json"
        },
        {
            name: "2gfsk1mbps915",
            description: "1 Mbps, 2-GFSK, 350 kHz deviation (915 MHz)",
            file: "setting_tc785.json"
        },
        {
            name: "2gfsk50kbps154g",
            description: "50 kbps, 2-GFSK, 15.4g",
            file: "setting_tc706_154g.json"
        },
        {
            name: "2gfsk200kbps154g",
            description: "200 kbps, 2-GFSK, 15.4g, High PA",
            file: "setting_tc746_154g.json"
        },
        {
            name: "slr5kbps2gfsk",
            description: "5 kbps, SimpleLink Long Range",
            file: "setting_tc880.json"
        },
        {
            name: "slr2500bps2gfsk",
            description: "2.5 kbps, SimpleLink Long Range",
            file: "setting_tc881.json"
        },
        {
            name: "ook48kbps",
            description: "4.8 kbps OOK",
            file: "setting_tc597.json"
        },
        {
            name: "ook48kbps915",
            description: "4.8 kbps OOK (915 MHz)",
            file: "setting_tc598.json"
        },
        {
            name: "2gfsk50kbps915wsun",
            description: "50 kbps, 2-GFSK, 12.5 KHz dev., WiSUN PHY (915 MHz)",
            file: "setting_tc719.json"
        },
        {
            name: "2gfsk50kbps868wsun",
            description: "50 kbps, 2-GFSK, 12.5 KHz dev., WiSUN PHY (868 MHz)",
            file: "setting_tc720.json"
        },
        {
            name: "2gfsk100kbps50dev915wsun",
            description: "100 kbps, 2-GFSK, 50 KHz dev., WiSUN PHY (915 MHz)",
            file: "setting_tc736.json"
        },
        {
            name: "2gfsk100kbps50dev868wsun",
            description: "100 kbps, 2-GFSK, 50 Khz dev., WiSUN PHY (868 MHz)",
            file: "setting_tc737.json"
        },
        {
            name: "2gfsk100kbps25dev915wsun",
            description: "100 kbps, 2-GFSK, 25 KHz dev., WiSUN PHY, (915 MHz)",
            file: "setting_tc740.json"
        },
        {
            name: "2gfsk100kbps25dev868wsun",
            description: "100 kbps, 2-GFSK, 25 Khz dev., WiSUN PHY, (868 MHz)",
            file: "setting_tc741.json"
        },
        {
            name: "2gfsk200kbps100dev915wsun",
            description: "200 kbps, 2-GFSK, 100 KHz dev., WiSUN PHY, (915 MHz)",
            file: "setting_tc750.json"
        },
        {
            name: "2gfsk200kbps100dev868wsun",
            description: "200 kbps, 2-GFSK, 100 Khz dev., WiSUN PHY, (868 MHz)",
            file: "setting_tc751.json"
        },
        {
            name: "wbdsss480ksps240kbps",
            description: "WBDSSS 480 ksps, 240 kbps",
            file: "setting_tc380.json"
        },
        {
            name: "wbdsss480ksps120kbps",
            description: "WBDSSS 480 ksps, 120 kbps",
            file: "setting_tc381.json"
        },
        {
            name: "wbdsss480ksps60kbps",
            description: "WBDSSS 480 ksps, 60 kbps",
            file: "setting_tc382.json"
        },
        {
            name: "wbdsss480ksps30kbps",
            description: "WBDSSS 480 ksps, 30 kbps",
            file: "setting_tc383.json"
        },
        {
            name: "custom868",
            description: "Custom PHY Setting",
            file: "setting_tc706_custom.json"
        },
        // 433 MHz
        {
            name: "2gfsk50kbps433mhz",
            description: "50 kbps, 2-GFSK",
            file: "setting_tc112.json"
        },
        {
            name: "2gfsk50kbps154g433mhz",
            description: "50 kbps, 2-GFSK, 15.4g",
            file: "setting_tc112_154g.json"
        },
        {
            name: "2gfsk200kpbs433mhz",
            description: "200 kbps, 2-GFSK, 50 kHz deviation",
            file: "setting_tc148.json"
        },
        {
            name: "slr5kbps2gfsk433mhz",
            description: "5 kbps, SimpleLink Long Range",
            file: "setting_tc440.json"
        },
        {
            name: "slr2500bps2gfsk433mhz",
            description: "2.5 kbps, SimpleLink Long Range",
            file: "setting_tc441.json"
        },
        {
            name: "2gfsk48kpbs429mhz",
            description: "4.8 kbps, 2-GFSK, 2 kHz deviation",
            file: "setting_tc596.json"
        },
        {
            name: "ook48kbps433mhz",
            description: "4.8 kbps OOK",
            file: "setting_tc599.json"
        },
        {
            name: "custom433",
            description: "Custom PHY Setting",
            file: "setting_tc112_custom.json"
        }
    ];
    SettingsMapProp = SettingsMapProp.concat(settingsMapPropSub1G);
}

let SettingsMapBLE = [
    {
        name: "bt5le1m",
        description: "Bluetooth 5, 1 Mbps",
        file: "setting_bt5_le_1m.json"
    },
    {
        name: "bt5le1madvnc",
        description: "Bluetooth 5, 1 Mbps, BT4 compatible",
        file: "setting_bt5_le_1m_adv_nc.json"
    },
    {
        name: "bt5le2m",
        description: "Bluetooth 5, 2 Mbps",
        file: "setting_bt5_le_2m.json"
    },
    {
        name: "bt5lecodeds2",
        description: "Bluetooth 5, 500 kbps",
        file: "setting_bt5_le_coded_s2.json"
    },
    {
        name: "bt5lecodeds8",
        description: "Bluetooth 5, 125 kbps",
        file: "setting_bt5_le_coded_s8.json"
    }
];

if (wbmsSupport) {
    const settingsWBMS = [
        {
            name: "wbms2m",
            description: "wBMS, 2 Mbps",
            file: "setting_wbms_2m.json"
        }
    ];
    SettingsMapBLE = SettingsMapBLE.concat(settingsWBMS);
}

if (HighPaDevice) {
    const settings10dbm = [
        {
            name: "bt5le1mp10",
            description: "Bluetooth 5, 1 Mbps, 10 dBm",
            file: "setting_bt5_le_1m_10_dbm.json"
        },
        {
            name: "bt5le1madvncp10",
            description: "Bluetooth 5, 1 Mbps, BT4 compatible, 10 dBm",
            file: "setting_bt5_le_1m_adv_nc_10_dbm.json"
        },
        {
            name: "bt5le2mp10",
            description: "Bluetooth 5, 2 Mbps, 10 dBm",
            file: "setting_bt5_le_2m_10_dbm.json"
        },
        {
            name: "bt5lecodeds2p10",
            description: "Bluetooth 5, 500 kbps, 10 dBm",
            file: "setting_bt5_le_coded_s2_10_dbm.json"
        },
        {
            name: "bt5lecodeds8p10",
            description: "Bluetooth 5, 125 kbps, 10 dBm",
            file: "setting_bt5_le_coded_s8_10_dbm.json"
        }
    ];
    SettingsMapBLE = SettingsMapBLE.concat(settings10dbm);
}

const SettingsMap154 = [
    {
        name: "ieee154",
        description: "IEEE 802.15.4, 250 kbps",
        file: "setting_ieee_802_15_4.json"
    }
];

if (HighPaDevice) {
    const setting10dbm = {
        name: "ieee154p10",
        description: "IEEE 802.15.4, 250 kbps, 10 dBm",
        file: "setting_ieee_802_15_4_10_dbm.json"
    };
    SettingsMap154.push(setting10dbm);
}

// Exported from this module
exports = {
    addPhyGroup: addPhyGroup,
    getVersionInfo: getVersionInfo,
    getSettingMap: function(phy) {
        if (phy === Common.PHY_IEEE_15_4) {
            return SettingsMap154;
        }
        else if (phy === Common.PHY_BLE) {
            return SettingsMapBLE;
        }
        else if (phy === Common.PHY_PROP) {
            return SettingsMapProp;
        }
        throw Error("Unknown protocol: ", phy);
    },
    getDeviceName: function() {
        return DeviceName;
    },
    getParamPath: function(phy) {
        return DevInfo.phyGroup[phy].paramPath;
    },
    getSettingPath: function(phy) {
        return getFilePathPhy("categories.json", phy);
    },
    getRfCommandDef: function(phy) {
        return getFullPathPhy("rf_command_definitions.json", phy);
    },
    getTargetPath: function(phy) {
        return getFilePathPhy("targets.json", phy);
    },
    getTargetIndex: function(phy) {
        return getFullPathPhy("targets.json", phy);
    },
    getPaSettingsPath: function() {
        return getFilePath("pasettings.json");
    },
    getFrontEndFile: function(phy) {
        return getFullPathPhy("frontend_settings.json", phy);
    },
    getCmdMapping: function(phy) {
        return getFullPathPhy("param_cmd_mapping.json", phy);
    },
    getSyscfgParams: function(phy) {
        return DevInfo.phyGroup[phy].paramPath + "param_syscfg.json";
    },
    hasHighPaSupport: function() {
        return DevInfo.highPaSupport;
    },
    getOverridePath: function(phy) {
        return getFilePathPhy("dummy_file_overrides.json", phy);
    }
};

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
    const paramPath = getFilePathPhy("param_definition.json", phy);

    const phyInfo = {
        phy: phy,
        phyPath: phyPath,
        phyDir: phyDir,
        paramPath: paramPath
    };
    DevInfo.phyGroup[phy] = phyInfo;
    DevInfo.phy = phy;
}
