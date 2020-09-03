/* eslint-disable guard-for-in */
/*
 * Copyright (c) 2020 Texas Instruments Incorporated - http://www.ti.com
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
 *  ======== rfdesign.syscfg.js ========
 */

"use strict";

// Common utility functions
const Common = system.getScript("/ti/devices/radioconfig/radioconfig_common.js");

// Other dependencies
const DeviceInfo = Common.getScript("device_info.js");
const Docs = Common.getScript("radioconfig_docs.js");

// Configurable prefix
const Prefix = "fb";

// Mapping official names to internal SmartRF Studio names (where these are not equal)
const LaunchPadMap = {
    "LAUNCHXL-CC1352P1": "LAUNCHXL-CC1352P",
    "LAUNCHXL-CC1352P-2": "LAUNCHXL-CC1352P-2_4GHZ",
    "LAUNCHXL-CC2652RB": "LAUNCHXL-CC26X2RB"
};

// Load board info
let TiBoard = Common.getBoardName();
let HasTiBoard = TiBoard !== null;

// Load target information database
const TargetInfo = loadTargetInfo();

// Config options containing available RF designs
const DesignData = getDesignData();
let CurrentDesign = null;
let TargetName;

// If a TI board is selected globally, select it
if (HasTiBoard) {
    // Map from LaunchPad to RF design name
    let name = TiBoard;
    if (TiBoard in LaunchPadMap) {
        name = LaunchPadMap[TiBoard];
    }

    if (name in DesignData) {
        CurrentDesign = DesignData[name];
    }
    else {
        throw Error("No such RF design: " + TiBoard);
    }
    TargetName = TiBoard;
}
else {
    // Custom design, pick the first design from the list
    CurrentDesign = Object.values(DesignData)[0];
    TargetName = DesignData.options[0].name;
}

// Create list of frequency bands that are supported by the current device
const FreqBands = getFrequencyBands();

// Frequency bands options
const OptionsSub1G = getOptionsSub1G();
const Options24G = getOptions24G();

// Front-end options
const FrontEndOptions = [
    {
        name: "XD",
        displayName: "External Bias, Differential RF"
    },
    {
        name: "ID",
        displayName: "Internal Bias, Differential RF"
    }
];

// The modules configurables
const config = [
    {
        name: "rfDesign",
        displayName: "Based On RF Design",
        description: "Select which RF design to use as template.",
        options: DesignData.options,
        default: DesignData.options[0].name,
        onChange: (inst, ui) => {
            const name = getDesignName(inst);
            TargetName = name;
            CurrentDesign = DesignData[name];

            // Update front-end settings
            inst.fe24g = CurrentDesign.fe24g;
            inst.feSub1g = CurrentDesign.feSub1g;

            // Update sub-1G selection
            inst.fbSub1g = getDefaultSub1g();

            // Special handling of CC1352P/CC2652P
            if ("pa20" in inst) {
                setHighPaAccess(inst, ui);
            }
        }
    },
    {
        name: "fbSub1g",
        displayName: "Sub-1 GHz Frequency Band",
        description: "Select which Sub-1 GHz frequency band to include in the design",
        hidden: OptionsSub1G.length === 1,
        options: OptionsSub1G,
        default: Common.isSub1gDevice() ? "fb868" : "none"
    },
    {
        name: "fb24g",
        displayName: "2.4 GHz Frequency Band",
        description: "Include 2.4 GHz frequency band in the design.",
        hidden: !Common.HAS_24G,
        options: Options24G,
        default: Common.HAS_24G ? "fb2400" : "none"
    },
    // Front-end settings
    {
        name: "feSub1g",
        displayName: "Front-end for Sub-1 GHz",
        description: "Select front-end for Sub-1 GHz bands.",
        hidden: OptionsSub1G.length === 1,
        options: FrontEndOptions,
        onChange: (inst) => {
            CurrentDesign.feSub1g = inst.feSub1g;
        },
        default: CurrentDesign.FrontEnd
    },
    {
        name: "fe24g",
        displayName: "Front-end for 2.4 GHz",
        description: "Select front-end for 2.4 GHz band.",
        hidden: !Common.HAS_24G,
        options: FrontEndOptions,
        onChange: (inst) => {
            CurrentDesign.fe24g = inst.fe24g;
        },
        default: CurrentDesign.FrontEnd
    }
];

// Added configurable for High PA
if (DeviceInfo.hasHighPaSupport()) {
    config.push({
        name: "pa20",
        displayName: "Assign High PA To Frequency Band",
        description: "Include support for High-Power Amplifier in the design.",
        onChange: onPaChange,
        options: [
            {
                name: "none",
                displayName: "None"
            },
            {
                name: "fbSub1g",
                displayName: "Sub-1 GHz"
            },
            {
                name: "fb24g",
                displayName: "2.4 GHz"
            }
        ],
        default: "fbSub1g"
    });
}

/*
 *  ======== getDefaultSub1g ========
 *  Get default sub-1 GHz frequency band
 *
 */
function getDefaultSub1g() {
    if (DeviceInfo.hasHighPaSupport()) {
        // Depends on RF design
        return CurrentDesign.isOptimizedFor(433) ? "fb433" : "fb868";
    }
    return "fb868";
}

/*
 *  ======== onPaChange ========
 *  Invoked when a PA configurable is changed
 *
 *  @param inst - instance
 *
 */
function onPaChange(inst) {
    let name = getDesignName(inst);
    let hiPaSuffix = "";

    if (inst.pa20 !== "none") {
        if (name === "LAUNCHXL-CC1352P-4") {
            name = "LAUNCHXL-CC1352P-2_4GHZ";
            hiPaSuffix = "-HIGH-PA_10DBM";
        }
        else {
            hiPaSuffix = "-HIGH-PA";
        }
    }
    name += hiPaSuffix;
    CurrentDesign = DesignData[name];
}

/*
 *  ======== getOptionsSub1G ========
 *  Get frequency band options
 */
function getOptionsSub1G() {
    const opts = [];

    if (getFrequencyBandByFreq(868) !== null) {
        opts.push({
            name: "fb868",
            displayName: "770 - 930 MHz",
            description: "Select 868 MHz frequency band"
        });
    }

    if (getFrequencyBandByFreq(433) !== null) {
        opts.push({
            name: "fb433",
            displayName: "431 - 527 MHz",
            description: "Select 433 MHz frequency band"
        });
    }

    if (!Common.isSub1gOnlyDevice()) {
        opts.push({
            name: "none",
            displayName: "Not used",
            description: "No Sub-1G frequency band selected"
        });
    }
    return opts;
}

/*
 *  ======== getOptions24G ========
 *  Get frequency band options
 */
function getOptions24G() {
    const opts = [];

    if (getFrequencyBandByFreq(2400) !== null) {
        opts.push({
            name: "fb2400",
            displayName: "2400 - 2483 MHz",
            description: "Select 2.4 GHz frequency band"
        });
    }

    if (getFrequencyBandByFreq(868) !== null) {
        opts.push({
            name: "none",
            displayName: "Not used",
            description: "2.4 GHz frequency band not selected"
        });
    }
    return opts;
}

/*!
 *  ======== setHighPaAccess ========
 *  Set the frequency band assignment to high PA according to RF design.
 *
 *  @param inst - instance
 */
function setHighPaAccess(inst) {
    if (inst.rfDesign === "LAUNCHXL-CC1352P1") {
        inst.pa20 = "fbSub1g";
    }
    else {
        inst.pa20 = "fb24g";
    }
    onPaChange(inst);
}

/*!
 *  ======== getHighPaAssociation ========
 *  Get the current high PA frequency band association.
 *
 *  @param inst - instance
 */
function getHighPaAssociation(inst) {
    if ("pa20" in inst) {
        return inst.pa20;
    }
    return "none";
}

/*!
 *  ======== isFreqBandSelected ========
 *  Return true if the frequency band is included in the design.
 *
 *  @param inst - instance
 *  @param target - current target
 */
function isFreqBandSelected(inst, target) {
    const freq = target.min;
    const cfg = Prefix + getFreqBandShortName(freq);

    if (freq === 2400) {
        let use = inst.fb24g === cfg;
        if (use) {
            if (target.highPA && TargetName !== "LAUNCHXL-CC1352P-4") {
                use = false;
            }
            if (!target.highPA && TargetName === "LAUNCHXL-CC1352P-4") {
                use = false;
            }
        }
        return use;
    }
    return inst.fbSub1g === cfg;
}

/*!
 *  ======== getFreqBandShortName ========
 *  Get the short-hand name for the band og a given frequency.
 *
 *  @param freq - frequency in MHz
 */
function getFreqBandShortName(freq) {
    let name = null;
    const fb = getFrequencyBandByFreq(freq);

    if (fb !== null) {
        switch (fb.min) {
        case 420:
        case 431:
            name = "433";
            break;
        case 770:
            name = "868";
            break;
        case 2400:
            name = "2400";
            break;
        default:
            throw Error("Invalid configurable: " + Prefix + freq + " " + fb.min);
        }
    }
    return name;
}

/*!
 *  ======== getPaTableExportMethods ========
 *  Check what PA table export methods are used in the design
 *
 */
function getPaTableExportMethods() {
    const methods = {
        total: 0,
        separate: 0,
        combined: 0
    };
    const modules = system.modules;

    _.each(modules, (mod) => {
        if (mod.$name.includes("radioconfig/settings")) {
            const instances = mod.$instances;
            // Iterate module instances
            _.each(instances, (inst) => {
                const paExport = inst.codeExportConfig.paExport;
                if (paExport === "combined") {
                    methods.combined += 1;
                }
                else if (paExport !== "none") {
                    methods.separate += 1;
                }
            });
        }
    });
    methods.total = methods.separate + methods.combined;

    return methods;
}

/*!
 *  ======== validate ========
 *  Validate this module's configuration
 *
 *  @param rfinst - RF Design instance to be validated
 *  @param validation - Issue reporting object
 */
function validate(rfinst, validation) {
    // Validate RF design selection versus system board selection
    if (HasTiBoard) {
        if (TiBoard !== rfinst.rfDesign) {
            Common.logError(validation, rfinst, "rfDesign",
                "RF Design must align with board selection: " + TiBoard);
            return;
        }
    }

    // Validate High PA selection
    const useHpa = getHighPaAssociation(rfinst) !== "none";

    if (useHpa) {
        if (rfinst.fb24g === "none" && rfinst.pa20 === "fb24g") {
            Common.logWarning(validation, rfinst, "pa20",
                "The High Power Output selection requires the 2.4 GHz band to be included.");
            return;
        }
        if (rfinst.fbSub1g === "none" && rfinst.pa20 === "fbSub1g") {
            Common.logWarning(validation, rfinst, "fbSub1g",
                "The High Power Output selection requires a Sub-1 GHz band to be included.");
            return;
        }
    }

    // Check consistency between used of Power Amplifiers and frequency bands
    const modules = system.modules;

    // Check if settings selection align with frequency band selection
    _.each(modules, (mod) => {
        if (mod.$name.includes("radioconfig/settings")) {
            const instances = mod.$instances;
            // Iterate module instances
            _.each(instances, (inst) => {
                let freqBand;
                if ("freqBand" in inst) {
                    // Proprietary
                    freqBand = parseInt(inst.freqBand);
                }
                else {
                    // BLE or IEEE 802.15.4
                    freqBand = 2400;
                }
                const phyType = Common.getPhyType(inst);

                // Validate selected settings versus selected frequency bands
                switch (freqBand) {
                case 433:
                    if (rfinst.fbSub1g !== "fb433") {
                        Common.logError(validation, inst, "freqBand",
                            "The 433 MHz band is not supported in this RF design");
                        Common.logError(validation, rfinst, "fbSub1g", "RF Stack uses PHY " + phyType
                            + ", designed for the 433 MHz frequency band");
                        return;
                    }
                    break;
                case 868:
                    if (rfinst.fbSub1g !== "fb868") {
                        Common.logError(validation, inst, "freqBand",
                            "The 868 MHz band is not supported in this RF design");
                        Common.logError(validation, rfinst, "fbSub1g", "RF Stack uses PHY " + phyType
                            + ", designed for the 868 MHz frequency band");
                        return;
                    }
                    break;
                case 2400:
                    if (rfinst.fb24g === "none") {
                        if ("frequency" in inst) {
                            Common.logError(validation, inst, "frequency",
                                "The 2400 MHz band is not supported in this RF design");
                        }
                        Common.logError(validation, rfinst, "fb24g", "RF Stack uses PHY " + phyType
                            + ", designed for the 2.4 GHz frequency band");
                        return;
                    }
                    break;
                default:
                    throw Error("Frequency band not supported: " + freqBand);
                }

                // Validate High PA RF design versus combined PA table
                if (useHpa) {
                    if (inst.codeExportConfig.paExport === "combined") {
                        if (rfinst.pa20 === "none") {
                            const msg = "Combined PA tables without High PA is not possible";
                            Common.logError(validation, rfinst, "pa20", msg);
                            Common.logError(validation, inst.codeExportConfig, "paExport", msg);
                            return;
                        }
                    }
                    // Check if High PA for the frequency band is allowed
                    if (rfinst.pa20 !== "fb24g" && freqBand === 2400 && inst.highPA) {
                        Common.logError(validation, rfinst, "pa20",
                            "RF design does not support high PA for 2.4 GHz frequency band. Required by: " + phyType);
                        Common.logError(validation, inst, "highPA",
                            "High PA for the " + freqBand + " frequency band is not part of the RF Design");
                    }
                    if (rfinst.pa20 !== "fbSub1g" && freqBand < 1000 && inst.highPA) {
                        Common.logError(validation, rfinst, "pa20",
                            "RF design does not support high PA for Sub-1 GHz frequency band. Required by:" + phyType);
                        Common.logError(validation, inst, "highPA",
                            "High PA for the " + freqBand + " frequency band is not part of the RF Design");
                    }
                }
                else if (inst.highPA) {
                    Common.logError(validation, inst, "highPA", "High PA not supported in the RF Design");
                }
            });
        }
    });
}

/*!
 *  ======== getTargetInfo ========
 *
 *  Get target information data for the currently selected design.
 *
 */
function getTargetInfo() {
    return CurrentDesign;
}

/*!
 *  ======== getTxPowerOptions ========
 *  Get list of available Tx power values for a given frequency.
 *
 *  @param freq - selected frequency (kHz)
 *  @param highPA - set if using high PA table
 */
function getTxPowerOptions(freq, highPA) {
    const ret = [];

    const paList = getPaTable(freq, highPA);
    _.each(paList, (pv) => {
        const item = {};
        item.name = pv._text;
        ret.push(item);
    });

    return ret;
}

/*!
 *  ======== getTxPowerOptionsDefault ========
 *  Get list of available Tx power values for a given frequency,
 *  using default target.
 *
 *  @param freq - selected frequency (kHz)
 *  @param highPA - set if using high PA table
 */
function getTxPowerOptionsDefault(freq, highPA) {
    // Fake the target name to get the PA table for the default target
    const tgtNameTmp = TargetName;
    if (freq >= 2400 && TargetName === "LAUNCHXL-CC1352P-4") {
        TargetName = "LAUNCHXL-CC1352P1";
    }

    const paList = getPaTable(freq, highPA);

    // Restore current target name
    TargetName = tgtNameTmp;

    // Iterate the TX power list
    const ret = [];
    _.each(paList, (pv) => {
        const item = {};
        item.name = pv._text;
        ret.push(item);
    });

    return ret;
}

/*!
 *  ======== getPaTable ========
 *  Get a PA table by frequency and PA state (high, default)
 *
 *  @param freq - selected frequency (kHz)
 *  @param highPA - set if using high PA table
 */
function getPaTable(freq, highPA) {
    const fb = getFrequencyBandByFreq(freq);
    if (fb === null) {
        return null;
    }
    return highPA ? fb.paTableHi : fb.paTable;
}

/*!
 *  ======== loadTargetInfo ========
 *
 *  Load target information data
 *
 */
function loadTargetInfo() {
    // Determine which frequency bands and target configurations are supported
    const tiProp = DeviceInfo.getTargetIndex("prop");

    const tgtIndexFiles = Array(
        {
            name: "prop",
            file: tiProp
        }
    );

    const tiBle = DeviceInfo.getTargetIndex("ble");
    if (tiProp !== tiBle) {
        tgtIndexFiles.push(
            {
                name: "ble",
                file: tiBle
            }
        );
    }

    const targetIndex = [];
    tgtIndexFiles.forEach(loadTargetIndex);

    function loadTargetIndex(index) {
        // Where the target files are stored
        const phyGroup = index.name;
        const TargetPath = DeviceInfo.getTargetPath(phyGroup);
        const PaPath = DeviceInfo.getPaSettingsPath(phyGroup);

        // Load target index
        const file = index.file;
        const rawIndex = _.cloneDeep(system.getScript(file));

        // Generated database for later use
        const database = {};
        database.FILE = file;
        database.IDX = 0;
        database.PHY_GROUP = phyGroup;

        // Construct uniform target list
        const targetData = [];
        if ("targets" in rawIndex) {
            let targetList;

            if ("VirtualTarget" in rawIndex.targets) {
                const targets = Common.forceArray(rawIndex.targets.VirtualTarget);
                for (let i = 0; i < targets.length; i++) {
                    const target = Common.forceArray(targets[i].Target);
                    targets[i].Target = target;
                }
                targetList = targets;
            }
            else {
                // Assume that 'Target' exists
                const tmp = Common.forceArray(rawIndex.targets.Target);
                const target = {_name: "unknown", Target: tmp};
                targetList = [target];
            }
            targetList.forEach(loadTargetData);
            database.TARGET_LIST = targetList;
            database.TARGET_DATA = targetData;
        }
        else {
            throw Error("No targets found!");
        }

        targetIndex.push(database);

        // Load target information for all targets
        function loadTargetData(targetList) {
            for (let i = 0; i < targetList.Target.length; i++) {
                // Load target data
                const targetFile = TargetPath + targetList.Target[i];
                const data = _.cloneDeep(system.getScript(targetFile));
                const targetName = data.target.Name;
                const highPaTarget = targetName.includes("HIGH-PA");
                const paSuffix = highPaTarget ? "P" : "";
                const onlySub1G = targetName.includes("CC1312R1");

                // Load PA table
                const paTable = _.cloneDeep(system.getScript(PaPath + "pasettings.json"));

                // Load frequency ranges with PA tables
                const freqRanges = {};
                const rfDesigns = Common.forceArray(paTable.patables.RfDesign);
                for (let j = 0; j < rfDesigns.length; j++) {
                    const rfDesign = rfDesigns[j];

                    // Filter on RF Design
                    if (rfDesign._name === data.target.RfDesign) {
                        const freqRangeArr = _.cloneDeep(Common.forceArray(rfDesign.FrequencyRange));
                        for (let k = 0; k < freqRangeArr.length; k++) {
                            const fr = freqRangeArr[k];
                            const range = {
                                paTable: fr.PaSettingTable.PaSetting,
                                min: parseInt(fr.Min),
                                max: parseInt(fr.Max),
                                hiPa: highPaTarget
                            };
                            const name = fr.Min + "-" + fr.Max + paSuffix;

                            // Workaround: do not show 2.4 GHz for CC1312
                            if (!(onlySub1G && range.min === 2400)) {
                                freqRanges[name] = range;
                            }
                        }
                    }
                }
                data.target.FREQ_RANGES = _.cloneDeep(freqRanges);
                data.target.feSub1g = data.target.FrontEnd;
                data.target.fe24g = data.target.FrontEnd;

                // Add to index
                targetData[targetName] = _.cloneDeep(data.target);
                targetList._name = targetName;
            }
        }
    }
    return targetIndex;
}

/*!
 *  ======== getFrontEnd ========
 *
 *  Get the current front-end selection by frequency band
 *
 */
function getFrontEnd(freqBand) {
    if (freqBand === 2400) {
        return CurrentDesign.fe24g;
    }
    return CurrentDesign.feSub1g;
}

/*!
 *  ======== getFrequencyBands ========
 *
 *  Get the frequency bands that are supported by the currently selected device.
 *
 */
function getFrequencyBands() {
    const freqBands = {};
    TargetInfo.forEach((ti) => {
        const tmp = {
            min: 0,
            max: 0,
            highPA: false,
            paTable: null,
            paTableHi: null
        };
        let frName = null;

        // Each virtual target
        for (const td in ti.TARGET_DATA) {
            // Eg. default and high PA
            const freqRanges = ti.TARGET_DATA[td].FREQ_RANGES;
            for (const fr in freqRanges) {
                const data = freqRanges[fr];
                tmp.min = data.min;
                tmp.max = data.max;
                tmp.highPA = data.hiPa;
                insertTaTable(tmp, data);
                frName = fr.replace("P", "");

                if (frName in freqBands) {
                    insertTaTable(freqBands[frName], data);
                }
                else {
                    freqBands[frName] = _.cloneDeep(tmp);
                }
            }
        }
    });

    function insertTaTable(dest, data) {
        if (data.hiPa) {
            dest.paTableHi = data.paTable;
        }
        else {
            dest.paTable = data.paTable;
        }
    }
    return freqBands;
}

/*!
 *  ======== getDesignData ========
 *
 *  Get the available RF design data for the current device.
 *
 */
function getDesignData() {
    const rfDesign = {};
    TargetInfo.forEach((ti) => {
        for (const td in ti.TARGET_DATA) {
            const data = ti.TARGET_DATA[td];
            // Workaround for inconsistency in virtual target name
            const name = td.replace("2_4-GHZ", "2_4GHZ");

            rfDesign[name] = data;
            data.highPA = td.includes("HIGH-PA");
            data.isOptimizedFor = (freq) => {
                // Search in description
                const searchStr = {
                    868: "770",
                    433: "431",
                    2400: "2.4"
                };
                let ret = getDescription(data).includes(searchStr[freq]);
                if (!ret) {
                    // Description does not contain information on 433 MHz band, handle separately
                    ret = freq === 433
                        && (td === "LAUNCHXL-CC1352R1" || td.includes("CC1312R1") || td === "LAUNCHXL-CC1352P-4");
                }
                return ret;
            };
        }
    });

    // Add dropdown options
    const options = [];
    for (const td in rfDesign) {
        if (!(td.includes("HIGH-PA") || td === "LAUNCHXL-CC1352R1-2_4GHZ")) {
            const map = _.invert(LaunchPadMap);
            let name;
            if (td in map) {
                name = map[td];
            }
            else {
                name = td;
            }
            // Process description
            const descr = getDescription(rfDesign[td]);

            options.push(
                {
                    name: name,
                    description: descr
                }
            );
        }
    }
    rfDesign.options = options;

    function getDescription(data) {
        let descr = data.Description;
        if (typeof descr === "object") {
            // Contains HTML: get first part of description as tool-tip
            // Ignore further details to avoid excessively large tool-tip
            descr = descr.p[0];
        }
        return descr;
    }
    return rfDesign;
}

/*!
 *  ======== getDesignName ========
 *
 *  Get the internal RF design name
 *
 */
function getDesignName(inst) {
    if (inst.rfDesign in LaunchPadMap) {
        return LaunchPadMap[inst.rfDesign];
    }
    return inst.rfDesign;
}

/*!
 *  ======== getFrequencyBandByFreq ========
 *
 *  Return the frequency band info by frequency.
 *
 */
function getFrequencyBandByFreq(freq) {
    // Special case for P4 launchpad
    let lFreq;
    if (freq >= 2400 && TargetName === "LAUNCHXL-CC1352P-4") {
        lFreq = 2499;
    }
    else {
        lFreq = freq;
    }

    for (const fr in FreqBands) {
        const fb = FreqBands[fr];
        if (lFreq >= fb.min && lFreq <= fb.max) {
            return fb;
        }
    }
    return null;
}

/*!
 *  ======== generatePaTableCode ========
 *  Generate PA-table code
 *
 *  @param paList - list of PA settings
 *  @param combined - true if default and high output PA settings are combined
 */
function generatePaTableCode(paList, combined) {
    let code = "";
    let val = -100;

    // Generate code
    _.eachRight(paList, (pv) => {
        const paEntry = generatePaEntryString(pv);
        if ("Option" in pv && !combined) {
            code += "    // This setting requires CCFG_FORCE_VDDR_HH = 1.\n";
        }

        const dbm = parseFloat(pv._text);
        if (!Number.isInteger(dbm)) {
            code += "    // The original PA value (" + pv._text + " dBm) has been rounded to an integer value.\n";
        }
        let iDbm = combined ? Math.floor(dbm) : Math.round(dbm);
        if (iDbm === val) {
            iDbm += 1;
        }

        const str = "    {" + iDbm + ", " + paEntry + " },\n";
        code += str;
        val = iDbm;
    });
    return code;
}

/*!
 *  ======== generatePaEntryString ========
 *  Generate the PA entry code string
 *
 *  @param pv - PA table entry
 */
/* eslint-disable no-bitwise */
function generatePaEntryString(pv) {
    const value = parseInt(pv.Value, 16);
    const highPA = value === 0xFFFF;
    const val = highPA ? pv.TxHighPa : value;
    const bias = val & 0x3f; /* bit 0..5 */
    const gain = (val >> 6) & 0x03; /* bit 6..7 */
    const boost = (val >> 8) & 0x01; /* bit 8 */
    const coefficient = (val >> 9) & 0x7f; /* bit 9..15 */
    let paEntry;

    if (highPA) {
        const ldoTrim = (val >> 16) & 0x3f; /* bit 16..21 */
        paEntry = "RF_TxPowerTable_HIGH_PA_ENTRY(" + bias + ", " + gain + ", "
      + boost + ", " + coefficient + ", " + ldoTrim + ")";
    }
    else {
        paEntry = "RF_TxPowerTable_DEFAULT_PA_ENTRY(" + bias + ", " + gain + ", "
      + boost + ", " + coefficient + ")";
    }
    return paEntry;
}
/* eslint-enable no-bitwise */

/*!
 *  ======== generateTxPowerCode ========
 *  Generate TX Power table (PA table)
 *
 *  @param inst - module instance
 *  @param target - target data
 *  @param nTable - the number (index) of this table
 */
function generateTxPowerCode(inst, target, nTable) {
    const paExport = getPaTableExportMethods();

    if (paExport.total > 0) {
        const typeName = "RF_TxPowerTable_Entry ";
        const tableTerminate = "    RF_TxPowerTable_TERMINATION_ENTRY\n};\n";

        // Generate code for high PA
        const highPaSupported = isHighPaSupported(inst, target.min);

        // Standard PA table
        let info = getPaTableInfo(target, false);

        let code = "\n// " + info.description + "\n";
        code += typeName + info.symTxPower + "[" + info.symTxPowerSize + "] =\n{\n";
        code += generatePaTableCode(target.paTable, false);
        code += tableTerminate;

        if (highPaSupported) {
            if (paExport.separate > 0) {
                // High PA table
                info = getPaTableInfo(target, true);

                code += "\n// " + info.description + "\n";
                code += typeName + info.symTxPower
                    + "[" + info.symTxPowerSize + "] =\n{\n";
                code += generatePaTableCode(target.paTableHi, false);
                code += tableTerminate;
            }
            if (paExport.combined > 0) {
                // Combined PA table
                const infoStd = getPaTableInfo(target, false);
                const infoHiPa = getPaTableInfo(target, true);
                const paTable = combinePaTable(target.paTable, target.paTableHi);
                const codeComb = generatePaTableCode(paTable, true);

                info = mergePaTableInfo(infoStd, infoHiPa);
                code += "\n// " + info.description + "\n";
                code += typeName + info.symTxPower + "[" + info.symTxPowerSize + "] =\n{\n";
                code += codeComb;
                code += tableTerminate;
            }
        }

        if (nTable === 1) {
            // Add header to the first PA table
            return Docs.txPowerDescription + code;
        }
        return code;
    }
    return null;
}

/*!
 *  ======== generateTxPowerHeader ========
 *  Generate TX Power table header (PA table)
 *
 *  @param inst - module instance
 *  @param target - target data
 */
function generateTxPowerHeader(inst, target) {
    const paExport = getPaTableExportMethods();

    if (paExport.total > 0) {
        // Struct declaration
        const typeName = "extern RF_TxPowerTable_Entry ";

        // Need to generate code for high PA ?
        const highPaSupported = isHighPaSupported(inst, target.min);

        // Standard PA table (always present)
        let info = getPaTableInfo(target, false);
        let codeSz = "#define " + info.symTxPowerSize + " " + (info.paTable.length + 1)
            + " // " + info.description + "\n";
        let code = typeName + info.symTxPower + "[]; // " + info.description + "\n";

        if (highPaSupported) {
            if (paExport.separate > 0) {
                // High PA table
                info = getPaTableInfo(target, true);
                codeSz += "#define " + info.symTxPowerSize + " " + (info.paTable.length + 1)
                    + " // " + info.description + "\n";
                code += typeName + info.symTxPower + "[]; // " + info.description + "\n";
            }
            if (paExport.combined > 0) {
                // Combined PA table
                const infoStd = getPaTableInfo(target, false);
                const infoHiPa = getPaTableInfo(target, true);
                const paList = combinePaTable(target.paTable, target.paTableHi);

                info = mergePaTableInfo(infoStd, infoHiPa);
                codeSz += "#define " + info.symTxPowerSize + " " + (paList.length + 1)
                    + " // " + info.description + "\n";
                code += typeName + info.symTxPower + "[]; // " + info.description + "\n";
            }
        }
        const fbName = getFreqBandShortName(target.min);

        return {
            support: "#define SUPPORT_FREQBAND_" + fbName + "\n",
            define: codeSz,
            struct: code
        };
    }
    return null;
}

/*!
 *  ======== combinePaTable ========
 *  Merge PA tables for default and HIGH PA
 *
 *  @param paListStd - settings for default TX power
 *  @param paListHi - settings for high TX power
 */
function combinePaTable(paListStd, paListHi) {
    const paListComb = _.cloneDeep(paListHi.concat(paListStd));
    const ret = [];
    let high = -100;

    _.eachRight(paListComb, (item) => {
        const val = parseFloat(item._text);
        // Throw away items that break the ascending order
        if (val > high) {
            ret.unshift(item);
            high = val;
            item._text = val;
        }
    });
    return ret;
}

/*!
 *  ======== isHighPaSupported ========
 *  Return true a combined table is possible
 *
 *  @param inst - module instance
 *  @param freq - frequency from which to determine if a table is required
 */
function isHighPaSupported(inst, freq) {
    if (inst.fb24g !== "none" && inst.pa20 === "fb24g" && freq > 2000) {
        return true;
    }
    if (inst.fbSub1g !== "none" && inst.pa20 === "fbSub1g" && freq < 1000) {
        return true;
    }
    return false;
}

/*!
 *  ======== getPaTableInfo ========
 *  Get the suffix and info string for the PA table name, a function of the transmit power.
 *  (e.g. Tx5, Tx13, Tx20).
 *
 *  @param target - virtual target to operate on
 *  @param highPa - if of generating symbols for High PA
*/
function getPaTableInfo(target, highPa) {
    // Get the first entry of the PA table, this determines which PA table we use
    const fbName = getFreqBandShortName(target.min);
    const paTable = highPa ? target.paTableHi : target.paTable;
    const paDefault = paTable[0];
    let pa = paDefault._text;

    if (pa > 12 && pa < 15) {
        pa = "13";
    }
    const ret = {
        paTable: paTable,
        pa: pa,
        fbName: fbName
    };

    ret.description = fbName + " MHz, " + pa + " dBm";
    ret.symTxPower = "txPowerTable_" + fbName + "_pa" + pa;
    ret.symTxPowerSize = ret.symTxPower.toUpperCase() + "_SIZE";

    return ret;
}

/*!
 *  ======== mergePaTableInfo ========
 *  Merge the PA table info for combined PA tables.
 *
 *  @param infoStd - information from standard PA table
 *  @param infoHigh - information from high power PA table
*/
function mergePaTableInfo(infoStd, infoHigh) {
    const ret = {...infoStd};

    ret.description = infoStd.fbName + " MHz, " + infoStd.pa + " + " + infoHigh.pa + " dBm";
    ret.symTxPower = "txPowerTable_" + infoStd.fbName + "_pa" + infoStd.pa + "_" + infoHigh.pa;
    ret.symTxPowerSize = ret.symTxPower.toUpperCase() + "_SIZE";

    return ret;
}

/*!
 *  ======== genPaTableName ========
 *  Create a PA table name from PA and frequency band
 *
 *  @param fbName - frequency band id (433, 868, 2400)
 *  @param pa - PA id ("5", "13", "20")
 *  @param paHigh - PA id for combined table
*/
function genPaTableName(fbName, pa, paHigh) {
    let name = "txPowerTable_";

    const pa1 = modifyPaName(pa);
    const pa2 = modifyPaName(paHigh);
    name += fbName + "_pa" + pa1;

    if (pa2 !== null) {
        name += "_" + pa2;
    }
    return name;
}

/*!
 *  ======== modifyPaName ========
 *
 *  Check if a PA name needs modification, change it if necessary.
 *
 *  @param - paOrig original name (any dBm value)
 *
 *  @return - PA id ("5", "10", "13", "20")
*/
function modifyPaName(paOrig) {
    let pa = paOrig;
    if (TargetName === "LAUNCHXL-CC1352P-4") {
        if (pa === "20") {
            pa = "10";
        }
    }
    if (pa > 12 && pa < 15) {
        pa = "13";
    }
    return pa;
}

/*!
 *  ======== getTxPowerValueByDbm ========
 *  Get raw TX power value based on frequency, high PA and dbm
 *
 *  @param freqStr - selected frequency (kHz), represented as string
 *  @param highPA - use high PA settings
 *  @param dbm - value in dBm
 *
 *  @return - raw data value or null if not found
 */
function getTxPowerValueByDbm(freqStr, highPA, dbm) {
    const freq = parseFloat(freqStr);

    // Pick settings according to PA
    const fb = getFrequencyBandByFreq(freq);
    if (fb === null) {
        return null;
    }
    const paList = highPA ? fb.paTableHi : fb.paTable;

    for (const i in paList) {
        const pa = paList[i];
        if (pa._text === dbm) {
            let raw;
            if ("TxHighPa" in pa) {
                raw = pa.TxHighPa;
            }
            else {
                raw = pa.Value;
            }
            return raw;
        }
    }
    return null;
}

/*!
 *  ======== getTxPowerDbmByRegValue ========
 *  Get dBm value based on frequency and raw register value
 *
 *  @param freqStr - selected frequency (kHz), represented as string
 *  @param raw - raw register value
 *
 *  @return - value in dBm
 */
function getTxPowerDbmByRegValue(freqStr, raw) {
    const freq = parseFloat(freqStr);

    // Pick settings according to PA
    const fb = getFrequencyBandByFreq(freq);
    const paList = fb.paTable;

    for (const i in paList) {
        const pa = paList[i];
        if (pa.Value === raw) {
            return pa._text;
        }
    }
    // Return the highest value if nothing else is found
    return paList[0]._text;
}

/*!
 *  ======== getTxPowerValueByDbm ========
 *  Get TX Power default value for a given frequency and PA selection
 *
 *  @param freqStr - selected frequency (kHz), represented as string
 *  @param highPA - use high PA settings
 *
 *  @return - raw TxPower value
 */
function getTxPowerValueDefault(freqStr, highPA) {
    const freq = parseFloat(freqStr);
    let ret;

    // Pick settings according to PA
    const fb = getFrequencyBandByFreq(freq);
    const paList = highPA ? fb.paTableHi : fb.paTable;
    const pa = paList[0];

    if ("TxHighPa" in pa) {
        ret = pa.TxHighPa;
    }
    else {
        ret = pa.Value;
    }
    return ret;
}

/*!
 *  ======== generateFrontEndCode ========
 *  Generate defines for a Front-end
 *
 *  @param inst - Rf Design instance
 */
function generateFrontEndCode(inst) {
    let frontEndCode = "";

    if (inst.fbSub1g !== "none") {
        frontEndCode += getFrontEndCode(inst.feSub1g, "SUB1G");
    }
    if (inst.fb24g !== "none") {
        frontEndCode += getFrontEndCode(inst.fe24g, "24G");
    }
    return frontEndCode;

    function getFrontEndCode(fe, id) {
        let code = "";
        if (fe.includes("D")) {
            code += "#define FRONTEND_" + id + "_DIFF_RF\n";
        }
        else {
            code += "#define FRONTEND_" + id + "_SE_RF\n";
        }
        if (fe.includes("X")) {
            code += "#define FRONTEND_" + id + "_EXT_BIAS\n";
        }
        else {
            code += "#define FRONTEND_" + id + "_INT_BIAS\n";
        }
        return code;
    }
}

/*!
 *  ======== moduleInstances ========
 *  Executed when the module is instantiated
 *
 *  @param mod - module instance
 */
function moduleInstances(mod) {
    TiBoard = Common.getBoardName();
    HasTiBoard = TiBoard !== null;

    return [];
}

/*
 *  ======== moduleStatic ========
 *  Define the module's static configurables
 */
const moduleStatic = {
    config: config,
    validate: validate,
    moduleInstances: moduleInstances
};

/*
 *  ======== module ========
 *  Define the module
 */
const module = {
    displayName: "RF Design",
    description: "RF Design",
    longDescription: Docs.rfDesignDescription,
    moduleStatic: moduleStatic,
    prefix: Prefix,
    isFreqBandSelected: isFreqBandSelected,
    getFreqBandShortName: getFreqBandShortName,
    getTargetInfo: getTargetInfo,
    getHighPaAssociation: getHighPaAssociation,
    getFrontEnd: getFrontEnd,
    getPaTable: getPaTable,
    genPaTableName: genPaTableName,
    getTxPowerOptions: getTxPowerOptions,
    getTxPowerOptionsDefault: getTxPowerOptionsDefault,
    getTxPowerValueByDbm: getTxPowerValueByDbm,
    getTxPowerDbmByRegValue: getTxPowerDbmByRegValue,
    freqBands: FreqBands,
    generateTxPowerCode: generateTxPowerCode,
    generateTxPowerHeader: generateTxPowerHeader,
    generateFrontEndCode: generateFrontEndCode,
    getTxPowerValueDefault: getTxPowerValueDefault
};

exports = module;
