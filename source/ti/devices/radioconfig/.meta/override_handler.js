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
 *  ======== override_handler.js ========
 *  Module to store process Override data
 */

"use strict";

// Common utility functions
const Common = system.getScript("/ti/devices/radioconfig/radioconfig_common.js");

// Other dependencies
const DevInfo = Common.getScript("device_info.js");
const RfDesign = Common.getScript("rfdesign");

// Populated during init()
let OverridePath = "/";
let Overrides = [];
let TxPowerOverrideFile = "none.json";

// Exported functions
exports = {
    init: init,
    updateTxPowerOverride: updateTxPowerOverride,
    getStructNames: getStructNames,
    generateCode: generateCode
};

/*!
 *  ======== init ========
 *  Load overrides from settings file
 *
 *  @param cmds - RF commands from settings file
 *  @phy - current PHY group
 *  @highPA - true if High PA enabled
 */
function init(cmds, phy, highPA) {
    // Override table must be re-generated for each setting
    OverridePath = DevInfo.getOverridePath(phy);
    Overrides = [];
    _.each(cmds, (gcmd) => {
        const cmd = _.cloneDeep(gcmd);
        _.merge(cmd.OverrideField, cmd.OverridePatch);
        delete gcmd.OverridePatch;

        if ("OverrideField" in cmd) {
            const block = cmd.OverrideField.Block;
            const cmdName = cmd._name;
            let ovrField;

            if (typeof (block) === "string") {
                // Single block, single entry
                const entry = {};
                const file = block;
                const path = OverridePath + file;
                entry[file] = system.getScript(path);
                entry.ptrName = cmd.OverrideField._name;
                entry.cmdName = cmdName;
                Overrides.push(entry);
            }
            else if (typeof (block) === "object") {
                // Single block, multiple entries
                const entry = {};
                entry.ptrName = cmd.OverrideField._name;
                entry.cmdName = cmdName;
                _.each(cmd.OverrideField.Block, (file) => {
                    const path = OverridePath + file;
                    entry[file] = system.getScript(path);
                });
                Overrides.push(entry);
            }
            else if (typeof block === "undefined") {
                // There is no block; only pointer names
                ovrField = cmd.OverrideField;

                // Assume array of entries
                _.each(ovrField, (item) => {
                    // Filter away TxPower overrides unless High PA is set.
                    if (item._name.includes("pRegOverrideTx") && !highPA) {
                        return;
                    }

                    const entry = {};
                    let blocks = [];

                    if (typeof item.Block === "string") {
                        blocks.push(item.Block);
                    }
                    else {
                        blocks = item.Block;
                    }

                    _.each(blocks, (file) => {
                        const path = OverridePath + file;
                        entry[file] = system.getScript(path);
                        entry.ptrName = item._name;
                        entry.cmdName = cmdName;
                        Overrides.push(entry);
                    });
                });
            }
            else {
                throw Error("Unexpected override data type");
            }
        }
    });
}

/*!
 *  ======== updateTxPowerOverrideFile ========
 *  Update the TX Power overrides according to
 *  the current TX Power setting.
 *
 *  @param ovrFile - file containing the overrides
 */
function updateTxPowerOverrideFile(ovrFile) {
    _.each(Overrides, (override) => {
        // Remove current override
        if (TxPowerOverrideFile in override) {
            delete override[TxPowerOverrideFile];
        }
        // Add new override
        TxPowerOverrideFile = ovrFile;
        const path = OverridePath + ovrFile;
        override[ovrFile] = system.getScript(path);
    });
}

/*!
 *  ======== generateCode ========
 *  Generates the contents of all Overrides arrays
 *  used by this setting.
 *
 *  @param symName - symbol name for the override
 *  @param data - data used for code generation
 *  @param custom - information on custom overrides
 */
function generateCode(symName, data, custom) {
    const ret = {
        code: "",
        stackOffset: 0
    };
    const ovrTmp = {};

    _.each(Overrides, (ovr) => {
        ovrTmp[ovr.ptrName] = ovr;
    });

    let tmpCustom = custom;
    _.each(ovrTmp, (ovr) => {
        const struct = generateStruct(ovr, data, tmpCustom);
        ret.code += struct.code;
        if (tmpCustom !== null) {
            ret.stackOffset = struct.stackOffset;
        }
        // Custom override only applies to the common structure (first in the list)
        tmpCustom = null;
    });
    ret.code = ret.code.replace(/pRegOverride/g, symName);

    return ret;
}

/*!
 *  ======== getStructNames ========
 *  Get array with the names of the override structs
 *
 *  @param symName - symbol name for the override tables
 */
function getStructNames(symName) {
    const names = [];

    _.each(Overrides, (ovr) => {
        const name = ovr.ptrName.replace("pRegOverride", symName);
        names.push(name);
    });

    // Remove duplicates
    return _.uniq(names);
}

/*!
 *  ======== updateTxPowerOverride ========
 *  Generate TX power table (PA table)
 *
 *  @param txPower - selected txPower (dBm)
 *  @param freq - frequency (MHz)
 *  @param highPA - True if using high PA
 */
function updateTxPowerOverride(txPower, freq, highPA) {
    // Find override for actual TxPower setting
    const paList = RfDesign.getPaTable(freq, highPA);
    _.each(paList, (pv) => {
        if ("Command" in pv) {
            const val = pv._text;
            if (val === txPower) {
                const block = pv.Command.OverrideField.Block;
                updateTxPowerOverrideFile(block);
            }
        }
    });
}

/*!
 *  ======== generateStruct ========
 *  Generate code for the override structure
 *
 *  @override - override symbol information
 *  @data - override data
 *  @custom - custom override info
 */
function generateStruct(override, data, custom) {
    const ret = {
        code: "// Overrides for " + override.cmdName + "\n",
        stackOffset: 0
    };
    ret.code += "uint32_t " + override.ptrName + "[] =\n{\n";
    let nEntries = 0;
    const coExEnabled = Common.getCoexConfig() !== null;

    // Generate the code
    for (const key in override) {
        if (key === "cmdName" || key === "ptrName") {
            // eslint-disable-next-line no-continue
            continue;
        }
        const obuf = override[key].overridebuffer;
        if (obuf.length === 0) {
            // eslint-disable-next-line no-continue
            continue;
        }
        // 14 dBm TX Power only apply  to default override
        if (key.includes("14dbm") && override.ptrName !== "pRegOverride") {
            // eslint-disable-next-line no-continue
            continue;
        }
        // Skip Co-Ex unless available and enabled
        if (key.includes("coex")) {
            const isCoExOvr = !key.includes("non_coex");
            let generateCode;
            if (coExEnabled) {
                generateCode = isCoExOvr;
            }
            else {
                generateCode = !isCoExOvr; 
            }
            if (!generateCode) {
                // eslint-disable-next-line no-continue
                continue;
            }
        }
        // Name of override file
        ret.code += "    // " + key + "\n";

        const tmp = obuf.Element32b;
        let items = [];

        // If there is more than one element, use array
        if (Array.isArray(tmp)) {
            items = tmp;
        }
        else {
            items[0] = tmp;
        }
        // Process override array
        ret.code = processOverrideArray(items, ret.code, data);
        nEntries += items.length;
    }
    // Add app/stack specific overrides if applicable
    if (custom !== null) {
        for (let i = 0; i < custom.length; i++) {
            const path = custom[i].path;
            if (path !== "") {
                ret.code += "    // " + path + "\n";
                ret.code += "    " + custom[i].macro + "(),\n";
            }
        }
        ret.stackOffset = nEntries;
    }
    // Add termination
    ret.code += "    (uint32_t)0xFFFFFFFF\n};\n\n";

    return ret;
}

/*!
 *  ======== processOverrideArray ========
 *  Generate code for the override structure
 *
 *  @items - override items
 *  @codeParam - code structure
 *  @data - override data
 */
function processOverrideArray(items, codeParam, data) {
    let code = codeParam;
    let hasTx20 = false;

    _.each(items, (el) => {
        code += "    // " + el._comment + "\n";

        let txPowStd;
        let txPow20;
        let anaDiv;

        switch (el._type) {
        case "HW_REG_OVERRIDE":
        case "MCE_RFE_OVERRIDE":
        case "HW32_ARRAY_OVERRIDE":
        case "ADI_HALFREG_OVERRIDE":
        case "ADI_REG_OVERRIDE":
        case "ADI_2HALFREG_OVERRIDE":
        case "HPOSC_OVERRIDE":
            code += "    " + el._type + "(" + el.$ + ")";
            break;
        case "TXSTDPA":
            txPowStd = data.txPower;
            code += "    TX_STD_POWER_OVERRIDE(" + Common.int2hex(txPowStd, 4) + ")";
            break;
        case "TX20PA":
            txPow20 = data.txPowerHi;
            code += "    TX20_POWER_OVERRIDE(" + Common.int2hex(txPow20, 8) + ")";
            hasTx20 = true;
            break;
        case "ANADIV":
            anaDiv = calcAnaDiv(data, hasTx20);
            code += "    (uint32_t)" + Common.int2hex(anaDiv, 8);
            break;
        case "ELEMENT":
            code += "    (uint32_t)" + el.$;
            break;

        default:
            code += "//** ERROR: Element type not implemented: " + el._type;
            break;
        }
        code += ",\n";
    });

    return code;
}

/*!
 *  ======== calcAnaDiv ========
 *  Calculate analog divider
 *
 *  @data - front end settings
 *  @isTx20 - true if high PA applies
 */
function calcAnaDiv(data, isTx20) {
    let fsOnly = 0;
    let frontEndMode = 0;
    let txSetting = 0;

    if (isTx20) {
        frontEndMode = 255;
    }
    else {
        frontEndMode = parseInt(data.frontend);
    }

    switch (parseInt(data.loDivider)) {
    case 0:
        fsOnly = 0x0502;
        break;
    case 2:
        fsOnly = 0x0102;
        break;
    case 4:
    case 6:
    case 12:
        fsOnly = 0xF101;
        break;
    case 5:
    case 10:
    case 15:
    case 30:
        fsOnly = 0x1101;
        break;
    default:
      // Error, should not occur!
    }

    /* eslint-disable no-bitwise */
    if (frontEndMode === 255) {
        // Special value meaning 20 dBm PA
        txSetting = (fsOnly | 0x00C0) & ~0x0400;
    }
    else if (frontEndMode === 0) {
        // Differential
        txSetting = fsOnly | 0x0030;
    }
    else if (frontEndMode & 1) {
        // Single ended on RFP
        txSetting = fsOnly | 0x0010;
    }
    else {
        // Single ended on RFN
        txSetting = fsOnly | 0x0020;
    }

    return ((txSetting << 16) | 0x0703);
    /* eslint-disable no-bitwise */
}
