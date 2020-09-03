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
 *  ======== ble_common.js ========
 */
"use strict";

const advParamsRanges = {
  priAdvIntMinValue:            "20",                 // Min value of Primary Advertising Interval (ms)
  priAdvIntMaxValue:            "10485759.375",       // Max value of Primary Advertising Interval (ms)
  priAdvIntMaxValueAdvData:     "40959.375",          // Max value of Advertising Interval (ms)
  advDataTXPowerMinValue:       "-127",               // Min value of TX Power (dBm)
  advDataTXPowerMaxValue:       "127",                // Max value of TX Power (dBm)
  advParamTXPowerMinValue:      "-127",               // Min value of Advertising TX Power (dBm)
  advParamTXPowerMaxValue:      "20",                 // Max value of Advertising TX Power (dBm)
  advSIDMinValue:               "0",                  // Min value of Advertising SID
  advSIDMaxValue:               "15"                  // Max value of Advertising SID
}

const connParamsRanges = {
  connectionIntMinValue:        "7.5",                // Min value of Connection Interval (ms)
  connectionIntMaxValue:        "4000",               // Max value of Connection Interval (ms)
  scanIntMinValue:              "2.5",                // Min value of Scan Interval (ms)
  scanIntMaxValue:              "40959.375",          // Max value of Scan Interval (ms)
  scanWinMinValue:              "2.5",                // Min value of Scan Window (ms)
  scanWinMaxValue:              "40959.375",          // Max value of Scan Window (ms)
  scanDurationMinValue:         "10",                 // Min value of Scan Duration (ms)
  scanDurationMaxValue:         "655350",             // Max value of Scan Duration (ms)
  connLatencyMinValue:          "0",                  // Min value of Connection Latency
  connLatencyMaxValue:          "499",                // Max value of Connection Latency
  connTimeoutMinValue:          "100",                // Min value of Connection Timeout (ms)
  connTimeoutMaxValue:          "32000",              // Min value of Connection Timeout (ms)
  maxPDUSizeMinValue:           "27",                 // Min value of MAX_PDU_SIZE
  maxPDUSizeMaxValue:           "255"                 // Max value of MAX_PDU_SIZE
}

// Maximum number of advertisement sets
const maxNumAdvSets = 20;

// Maximum length of legacy advertise data
const maxLegacyDataLen = 31;

// Maximum length of extended advertise data
const maxExtDataLen = 1650;

// Dictionary mapping a device name to default LaunchPad; used to discover the
// appropriate RF settings when a device is being used without a LaunchPad
const deviceToBoard = {
  CC1352R: "CC1352R1_LAUNCHXL",
  CC1352P1: "CC1352P1_LAUNCHXL",
  CC2642R1: "CC26X2R1_LAUNCHXL",
  CC2652R1: "CC26X2R1_LAUNCHXL",
  CC2652RB: "CC2652RB_LAUNCHXL"
};

// Settings for ti/devices/CCFG module
const bleCentralCCFGSettings = {
  CC1312R1_LAUNCHXL_CCFG_SETTINGS: {},
  CC1352R1_LAUNCHXL_CCFG_SETTINGS: {},
  CC1352P1_LAUNCHXL_CCFG_SETTINGS: {},
  CC1352P_2_LAUNCHXL_CCFG_SETTINGS: {},
  CC1352P_4_LAUNCHXL_CCFG_SETTINGS: {},
  CC26X2R1_LAUNCHXL_CCFG_SETTINGS: {},
  CC2652RB_LAUNCHXL_CCFG_SETTINGS: {
    srcClkLF: "Derived from HF XOSC"
  }
};

const boardName = getBoardOrLaunchPadName(true);
const centralRoleCcfgSettings = bleCentralCCFGSettings[boardName + "_CCFG_SETTINGS"];

/*
 * ======== validateConnInterval ========
 * Validate this inst's configuration
 *
 * @param inst       - instance to be validated
 * @param validation - object to hold detected validation issues
 * @param minValue
 */
function validateConnInterval(inst,validation,minValue,minName,maxValue,maxName)
{
  if(minValue > maxValue)
  {
      validation.logError("Shall be greater than or equal to connectin interval min"
                          , inst, maxName);
      validation.logError("Shall be less than or equal to connection interval max"
                          , inst, minName);
  }
  if(minValue < connParamsRanges.connectionIntMinValue || minValue > connParamsRanges.connectionIntMaxValue)
  {
      validation.logError("The Range of connection interval is " + connParamsRanges.connectionIntMinValue +
                          " ms to "+ connParamsRanges.connectionIntMaxValue +" ms", inst, minName);
  }
  if(maxValue < connParamsRanges.connectionIntMinValue || maxValue > connParamsRanges.connectionIntMaxValue)
  {
      validation.logError("The Range of connection interval is " + connParamsRanges.connectionIntMinValue +
                          " ms to " + connParamsRanges.connectionIntMaxValue + " ms" ,inst, maxName);
  }
}

/*
 * ======== validateAdvInterval ========
 * Validate the Adv Interval configuration
 *
 * @param inst       - instance to be validated
 * @param validation - object to hold detected validation issues
 * @param minValue
 */
function validateAdvInterval(inst,validation,minValue,minName,maxValue,maxName)
{
  if(minValue > maxValue)
  {
      validation.logError("Shall be greater than or equal to connectin interval min"
                          , inst, maxName);
      validation.logError("Shall be less than or equal to connection interval max"
                          , inst, minName);
  }
  if(minValue < advParamsRanges.priAdvIntMinValue || minValue > advParamsRanges.priAdvIntMaxValue)
  {
      validation.logError("The Range of connection interval is " + advParamsRanges.priAdvIntMinValue +
                          " ms to "+ advParamsRanges.priAdvIntMaxValue +" ms", inst, minName);
  }
  if(maxValue < advParamsRanges.priAdvIntMinValue || maxValue > advParamsRanges.priAdvIntMaxValue)
  {
      validation.logError("The Range of connection interval is " + advParamsRanges.priAdvIntMinValue +
                          " ms to " + advParamsRanges.priAdvIntMaxValue + " ms" ,inst, maxName);
  }
}

/*
 * ======== validateUUIDLength ========
 * Validate the UUIDs configurable length
 *
 * @param inst       - instance to be validated
 * @param validation - object to hold detected validation issues
 * @param numOfUUIDs - the number of UUIDs that where added by the user
 * @params uuid      - the name of the uuid parameter to validate
 * @length           - the length of each uuid
 */
function validateUUIDLength(inst,validation,numOfUUIDs,uuid,length)
{
  for(let i = 0; i < numOfUUIDs; i++)
  {
    if(inst["UUID" + i + uuid].toString(16).length > length)
    {
        validation.logError("The number of bytes is " + _.divide(length,2) ,inst, "UUID" + i + uuid);
    }
  }
}

/*
 * ======== validateNumOfUUIDs ========
 * Validate the number of UUIDs configurable
 *
 * @param inst       - instance to be validated
 * @param validation - object to hold detected validation issues
 * @param numOfUUIDs - the number of UUIDs that where added by the user
 * @params uuid      - the name of the uuid parameter to validate
 * @length           - the length of each uuid
 */
function validateNumOfUUIDs(inst,validation,numOfUUIDs,uuid,length)
{
  //Check if the number of UUIDs is valid
  if(inst[numOfUUIDs] < 0 || inst[numOfUUIDs] > 10)
  {
      validation.logError("Please enter a number between 0 - 10", inst, numOfUUIDs);
  }
  // Validate each UUID length
  else
  {
      validateUUIDLength(inst,validation,inst[numOfUUIDs],uuid,length);
  }
}

/*
 *  ======== addPeerAddress ========
 *  Gets an address in hex format and return it
 *  in the following format { 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa }
 *
 *  @param param  - An address in hex format
 *
 *  @returns the address in the following format: { 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa }
 */
function addPeerAddress(param)
{
  let address = "{ ";
  let prefix = "0x";

  address += prefix;
  for (let i = 0; i < param.length; i++)
  {
    address += param[i];
    if (i%2 != 0 && i < (param.length -1))
    {
      address += ", " + prefix;
    }
  }
  address += " }";

  return(address);
}

/*
 *  ======== reverseBytes ========
 *  Reverse the bytes of an hex string
 *
 *  @stringToReverse hex string to reverse its bytes
 */
function reverseBytes(stringToReverse)
{
  var str = stringToReverse.match(/.{1,2}/g);
  return str.reverse().toString(16).replace(/,/g,'');
}

/*
 *  ======== checkTXPower ========
 *  Help function for the advertisement params
 *  inst, TX Power
 *
 *  @param param
 *  @param value
 *  @returns the total length of an advertisement data
 */
function checkTXPower(param,value)
{
  return param == "GAP_ADV_TX_POWER_NO_PREFERENCE" ? param : value;
}

/*
 *  ======== getChanMap ========
 *  Returns the channel map according to the selected channels
 *
 *  @param array of selected channels
 *  @returns channel map
 */
function getChanMap(value)
{
  const allChan = ["GAP_ADV_CHAN_37", "GAP_ADV_CHAN_38", "GAP_ADV_CHAN_39"];
  if(_.isEqual(value, allChan))
  {
    return "GAP_ADV_CHAN_ALL";
  }
  else if(_.isEqual(value, ["GAP_ADV_CHAN_37", "GAP_ADV_CHAN_38"]))
  {
    return "GAP_ADV_CHAN_37_38";
  }
  else if(_.isEqual(value, ["GAP_ADV_CHAN_37", "GAP_ADV_CHAN_39"]))
  {
    return "GAP_ADV_CHAN_37_39";
  }
  else if(_.isEqual(value, ["GAP_ADV_CHAN_38", "GAP_ADV_CHAN_39"]))
  {
    return "GAP_ADV_CHAN_38_39";
  }
  else if(_.isEqual(value, ["GAP_ADV_CHAN_37"]))
  {
    return "GAP_ADV_CHAN_37";
  }
  else if(_.isEqual(value, ["GAP_ADV_CHAN_38"]))
  {
    return "GAP_ADV_CHAN_38";
  }
  else if(_.isEqual(value, ["GAP_ADV_CHAN_39"]))
  {
    return "GAP_ADV_CHAN_39";
  }
}

/*
 *  ======== addZeroFromLeft ========
 *  Adds zero to the left of an Hex format number 
 *  that is uneven
 *
 *  @param hexNum
 *  @returns an Hex number
 */
function addZeroFromLeft(hexNum)
{
    if(hexNum.length % 2 != 0)
    {
        hexNum = '0' + hexNum;
    }
    return hexNum;
}

/*
 *  ======== getSelectedDataList ========
 *  Gets the full advertisement data list
 *
 *  @param inst
 *  @param config
 *  @returns the selected parameters list
 */
function getSelectedDataList(inst, config)
{
  let values = [];
  for(let i = 0; i < config.length; i++)
  {
    if(config[i].name.includes("GAP_ADTYPE") && inst[config[i].name])
    {
      values.push(config[i]);
      i++;
      while(i < config.length && !(config[i].name.includes("GAP_ADTYPE")))
      {
        values.push(config[i]);
        i++;
      }
      i--;
    }
  }
  return values;
}

/*
 *  ======== advDataTotalLength ========
 *  Calculates the total length of advertisement data
 *
 *  @param inst
 *  @param config
 *  @returns the total length of an advertisement data
 */
function advDataTotalLength(inst, config)
{
    let values = getSelectedDataList(inst, config);

    let totalLength = 0;

    for(let i =0; i < values.length; i++)
    { 
      if(values[i].name.includes("GAP_ADTYPE"))
      {
        totalLength += 2;
      }
      if(values[i].name == "advertisingFlags" || values[i].name == "TXPower")
      {
        totalLength += 1;
      }
      else if(values[i].name.includes("numOfUUIDs") && values[i].name.includes("16"))
      {
        totalLength += 2*inst[values[i].name];
      }
      else if(values[i].name.includes("numOfUUIDs") && values[i].name.includes("32"))
      {
        totalLength += 4*inst[values[i].name];
      }
      else if(values[i].name.includes("numOfUUIDs") && values[i].name.includes("128"))
      {
        totalLength += 16*inst[values[i].name];
      }
      else if(values[i].name.includes("numOf") && values[i].name.includes("Addresses"))
      {
        totalLength += 6*inst[values[i].name];
      }
      else if(values[i].name.includes("LocalName"))
      {
        totalLength += inst[values[i].name].toString().length;
      }
      else if(values[i].name.includes("ConnInterval") || values[i].name.includes("advIntValue")
              || values[i].name.includes("appearanceValue"))
      {
        totalLength += 2;
      }
      else if(values[i].name.includes("companyIdentifier") || values[i].name.includes("additionalData"))
      {
        totalLength += _.divide(addZeroFromLeft(inst[values[i].name].toString(16)).length, 2);
      }
      else if(values[i].name.includes("16SDData") && inst.GAP_ADTYPE_SERVICE_DATA)
      {
        if(values[i].name[4] < inst.numOfUUIDs16SD)
        {
          totalLength += _.divide(addZeroFromLeft(inst[values[i].name].toString(16)).length,2);
        }
      }
      else if(values[i].name.includes("32SDData") && inst.GAP_ADTYPE_SERVICE_DATA_32BIT)
      {
        if(values[i].name[4] < inst.numOfUUIDs32SD)
        {
          totalLength += _.divide(addZeroFromLeft(inst[values[i].name].toString(16)).length,2);
        }
      }
      else if(values[i].name.includes("128SDData") && inst.GAP_ADTYPE_SERVICE_DATA_128BIT)
      {
        if(values[i].name[4] < inst.numOfUUIDs128SD)
        {
          totalLength += _.divide(addZeroFromLeft(inst[values[i].name].toString(16)).length,2);
        }
      }
    }
    return totalLength;
}

/*
 *  ======== advDataHexValues ========
 *  Gets Hex format number and return it
 *  in the following format 0xaa,\n 0xaa,\n ....
 *
 *  @param param  - Hex format number
 *
 *  @returns the Hex format number in the following format: 0xaa,\n 0xaa,\n ....
 */
function advDataHexValues(param)
{
  let address = "";
  let prefix = "0x";

  address += prefix;
  for (let i = 0; i < param.length; i++)
  {
    address += param[i];
    if (i%2 != 0)
    {
      address += ",\n"
      if(i < (param.length -1))
        {
          address += "  " + prefix;
        }
    }
  }

  return(address);
}

/*!
 *  ======== device2DeviceFamily ========
 *  Map a pimux deviceID to a TI-driver device family string
 *
 *  @param deviceId  - a pinmux deviceId (system.deviceData)
 *
 *  @returns String - the corresponding "DeviceFamily_xxxx" string
 *                    used by driverlib header files.
 */
function device2DeviceFamily(deviceId)
{
    let driverString = null;

    /* Determine libraries required by device name. */
    if(deviceId.match(/CC13.2/))
    {
        driverString = "DeviceFamily_CC13X2";
    }
    else if(deviceId.match(/CC13.0/))
    {
        driverString = "DeviceFamily_CC13X0";
    }
    else if(deviceId.match(/CC26.0R2/))
    {
        driverString = "DeviceFamily_CC26X0R2";
    }
    else if(deviceId.match(/CC26.2/))
    {
        driverString = "DeviceFamily_CC26X2";
    }
    else if(deviceId.match(/CC26.0/))
    {
        driverString = "DeviceFamily_CC26X0";
    }
    else if(deviceId.match(/CC3220/))
    {
        driverString = "DeviceFamily_CC3220";
    }
    else if(deviceId.match(/MSP432E.*/))
    {
        driverString = "DeviceFamily_MSP432E401Y";
    }
    else if(deviceId.match(/MSP432P4.1.I/)
            || deviceId.match(/MSP432P4111/))
    {
        driverString = "DeviceFamily_MSP432P4x1xI";
    }
    else if(deviceId.match(/MSP432P4.1.T/))
    {
        driverString = "DeviceFamily_MSP432P4x1xT";
    }
    else if(deviceId.match(/MSP432P401/))
    {
        driverString = "DeviceFamily_MSP432P401x";
    }
    else
    {
        driverString = "";
    }

    return(driverString);
}

/*!
 *  ======== getBoardOrLaunchPadName ========
 *  Get the name of the board (or device)
 *
 *  @param convertToBoard - Boolean. When true, return the associated LaunchPad
 *                          name if a device is being used without a LaunchPad
 *
 *  @returns String - Name of the board with prefix /ti/boards and
 *                    suffix .syscfg.json stripped off.  If no board
 *                    was specified, the device name is returned.
 */
function getBoardOrLaunchPadName(convertToBoard)
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
    if(convertToBoard && !name.includes("LAUNCHXL"))
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

/*
 * ======== getRadioScript ========
 * Determines which rf_defaults script to use based on device or rfDesign
 *
 * @param rfDesign - the value of rfDesign parameter
 * @param deviceId - device being used
 *
 * @returns radioSettings - the rf_defaults script according to the selected
 *                          device/reDesign.
 *                          If device is not supported, returns null
 */
function getRadioScript(rfDesign, deviceId)
{
    let radioSettings = null;

    if(rfDesign !== null)
    {
        if(rfDesign === "LAUNCHXL-CC1352P-4")
        {
            radioSettings = system.getScript("/ti/ble5stack/rf_config/"
                + "CC1352P_4_LAUNCHXL_rf_defaults.js");
        }
        else if(rfDesign === "LAUNCHXL-CC1352P1")
        {
            radioSettings = system.getScript("/ti/ble5stack/rf_config/"
                + "CC1352P1_LAUNCHXL_rf_defaults.js");
        }
        else if(rfDesign === "LAUNCHXL-CC1352P-2")
        {
            radioSettings = system.getScript("/ti/ble5stack/rf_config/"
                + "CC1352P_2_LAUNCHXL_rf_defaults.js");
        }
    }
    else if(deviceId === "CC1352P1F3RGZ")
    {
        radioSettings = system.getScript("/ti/ble5stack/rf_config/"
            + "CC1352P1_LAUNCHXL_rf_defaults.js");
    }

    if(deviceId === "CC1352R1F3RGZ")
    {
        radioSettings = system.getScript("/ti/ble5stack/rf_config/"
            + "CC1352R1_LAUNCHXL_rf_defaults.js");
    }
    else if(deviceId === "CC2642R1FRGZ")
    {
        radioSettings = system.getScript("/ti/ble5stack/rf_config/"
            + "CC26X2R1_LAUNCHXL_rf_defaults.js");
    }
    else if(deviceId === "CC2652R1FRGZ")
    {
        radioSettings = system.getScript("/ti/ble5stack/rf_config/"
            + "CC26X2R1_LAUNCHXL_rf_defaults.js");
    }
    else if(deviceId === "CC2652RB")
    {
        radioSettings = system.getScript("/ti/ble5stack/rf_config/"
            + "CC2652RB_LAUNCHXL_rf_defaults.js");
    }

    return(radioSettings);
}

/*
 *  ======== hideGroup ========
 *  Hide or UnHide an entire group
 *
 *  @param group   - The group config
 *  @param toHide  - True(Hide)/false(UnHide)
 *  @param ui      - The User Interface object
 */
function hideGroup(group, toHide, ui)
{
  let namesArray = _.map(group,function(n) {return n.name});
  _.each(namesArray, (cfg) => {cfg.includes("hide") ||
         cfg.includes("numOfDefAdvSets") ? true : ui[cfg].hidden = toHide;});
}

/*
 *  ======== getGroupByName ========
 *  Get a list of groups and a group name.
 *  Returns the group config array.
 *
 *
 *  @param groupList   - List of groups
 *  @param groupName   - The name of the group to return
 */
function getGroupByName(groupList, groupName)
{
  for(let i = 0; i < groupList.length; i++)
  {
    if(groupList[i].name == groupName)
    {
      return groupList[i].config;
    }
  }
}

function decimalToHexString(number)
{
  if (number < 0)
  {
    number = 0xFFFFFFFF + number + 1;
  }

  return '0x' + number.toString(16).toUpperCase();
}

exports = {
    advParamsRanges: advParamsRanges,
    connParamsRanges: connParamsRanges,
    maxNumAdvSets: maxNumAdvSets,
    maxLegacyDataLen: maxLegacyDataLen,
    maxExtDataLen: maxExtDataLen,
    addPeerAddress: addPeerAddress,
    reverseBytes: reverseBytes,
    checkTXPower: checkTXPower,
    centralRoleCcfgSettings: centralRoleCcfgSettings,
    getChanMap: getChanMap,
    getSelectedDataList: getSelectedDataList,
    validateConnInterval: validateConnInterval,
    validateAdvInterval: validateAdvInterval,
    validateUUIDLength: validateUUIDLength,
    validateNumOfUUIDs: validateNumOfUUIDs,
    advDataTotalLength: advDataTotalLength,
    addZeroFromLeft: addZeroFromLeft,
    advDataHexValues: advDataHexValues,
    getBoardOrLaunchPadName: getBoardOrLaunchPadName,
    device2DeviceFamily: device2DeviceFamily,
    getRadioScript: getRadioScript,
    hideGroup: hideGroup,
    getGroupByName: getGroupByName,
    decimalToHexString: decimalToHexString
};
