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
 *  ======== easylink_tx_config_docs.js ========
 */

"use strict";

// Get common utility functions
const Common = system.getScript("/ti/easylink/easylink_common.js");

// Long description for the minBackoffWindow configuration parameter
const minBackoffWindowLongDescription = `The \`EasyLink_transmitCcaAsync()\`\
 API will check for a clear channel prior to transmission. If the channel is\
 busy it will backoff for a random period, in time units of\
 _Backoff Time Units_, before reassessing. It does this a certain number\
 (_Maximum Backoff Window_ - _Minimum Backoff Window_) of times before quitting\
 unsuccessfully and running to the callback. For more information, refer to the\
 [EasyLink_transmitCcaAsync() API Reference](/proprietary-rf/\
proprietary-rf-users-guide/easylink/\
easylink-api-reference-cc13x2_26x2.html#c.EasyLink_transmitCcaAsync).\n\
\n\
__Default__: 32`;

// Long description for the maxBackoffWindow configuration parameter
const maxBackoffWindowLongDescription = `The \`EasyLink_transmitCcaAsync()\`\
 API will check for a clear channel prior to transmission. If the channel is\
 busy it will backoff for a random period, in time units of\
 _Backoff Time Units_, before reassessing. It does this a certain number\
 (_Maximum Backoff Window_ - _Minimum Backoff Window_) of times before quitting\
 unsuccessfully and running to the callback. For more information, refer to the\
 [EasyLink_transmitCcaAsync() API Reference](/proprietary-rf/\
proprietary-rf-users-guide/easylink/\
easylink-api-reference-cc13x2_26x2.html#c.EasyLink_transmitCcaAsync).\n\
\n\
__Default__: 256`;

// Long description for the backoffTimeUnits configuration parameter
const backoffTimeunitsLongDescription = `The \`EasyLink_transmitCcaAsync()\`\
 API will check for a clear channel prior to transmission. If the channel is\
 busy it will backoff for a random period, in time units of\
 _Backoff Time Units_, before reassessing.\n\n It's recommended to choose a\
 backoff unit that is an integral multiple of your symbol rate (e.g. symbol\
 rate = 50kbps, 1/50k = 20us, choose a backoff time unit that is a multiple of\
 20us). For more information, refer to the [EasyLink_transmitCcaAsync() API\
 Reference](/proprietary-rf/proprietary-rf-users-guide/easylink/\
easylink-api-reference-cc13x2_26x2.html#c.EasyLink_transmitCcaAsync).\n\
\n\
__Default__: 250us\n\
\n\
__Range__: 1 to UINT32_MAX/(4*MAX_BACKOFF_WINDOW)\n\n\
In C code, the backoff time units gets translated to RAT time via equation 1.\
 Then the actual backoff window is generated via equation 2. The resulting\
 BACKOFF_WINDOW_RAT is then assigned to a variable declared as a uint32_t.\
 To avoid overflow the max backoff time unit is\
 UINT32_MAX/(4*MAX_BACKOFF_WINDOW).\n\n\
\`\`\`
(1) UNIT_IN_RAT = UNIT_IN_US*4
(2) BACKOFF_WINDOW_RAT = UNIT_IN_RAT * RAND
     - where MIN_BACKOFF_WINDOW < RAND < MAX_BACKOFF_WINDOW
\`\`\``;

// Long description for the rssiThresholdDbm configuration parameter
const rssiThresholdDbmLongDescription = `The \`EasyLink_transmitCcaAsync()\`\
 API will check for a clear channel prior to transmission. If the channel is\
 busy it will backoff. The _RSSI Threshold (dBm)_ defines the level at or below\
 which a channel is considered clear. For more information, please refer to the\
 [EasyLink_transmitCcaAsync() API Reference](/proprietary-rf/\
proprietary-rf-users-guide/easylink/\
easylink-api-reference-cc13x2_26x2.html#c.EasyLink_transmitCcaAsync).\n\
\n\
__Default__: -80dBm\n\n\
__Range__: -128 to 127\n\n\
In C code, the rssi threshold sets the \`EasyLink_cmdPropCs.rssiThr\` value\
 which is declared as an int8_t. Therefore the min and max value is INT8_MIN\
 and INT8_MAX respectively.`;

// Long description for the chIdleTimeUs configuration parameter
const chIdleTimeUsLongDescription = `The \`EasyLink_transmitCcaAsync()\`\
 API will check for a clear channel prior to transmission. The channel must\
 stay below the _RSSI Threshold (dBm)_ for the _Channel Idle Time (us)_ before\
 it is considered idle. For more information, please refer to the\
 [EasyLink_transmitCcaAsync() API Reference](/proprietary-rf/\
proprietary-rf-users-guide/easylink/\
easylink-api-reference-cc13x2_26x2.html#c.EasyLink_transmitCcaAsync).\n\
\n\
__Default__: 5000us\n\
\n\
__Range__: 0 to ${Common.maxUint32tRatUsTime}\n\n\
In C code, the channel idle time gets translated to RAT time via the equation\
 1. The result is used to set a variable declared as uint32_t. Therefore the\
 max value is UINT32_MAX/4 = ${Common.maxUint32tRatUsTime}\n\
 \n\
 \`\`\`
(1) UNIT_IN_RAT = UNIT_IN_US*4
\`\`\``;

// Long description for the randNumGenFxn configuration parameter
const randNumGenFxnLongDescription = `The \`EasyLink_transmitCcaAsync()\`\
 API will check for a clear channel prior to transmission. If the channel is\
 busy it will backoff for a random period. The _Random Number Generation\
 Function_ will be used for this period. For more information, refer to the\
 [EasyLink_Params API Reference](/proprietary-rf/proprietary-rf-users-guide/\
easylink/easylink-api-reference-cc13x2_26x2.html#c.EasyLink_Params::pGrnFxn).\n\
\n\
__Default__: \`rand\`\n\
\n\
__Acceptable Values__:\n\n\
Functions with valid C identifier names with the following return value and\
 parameters:\n\
\`\`\`C
uint32_t rand(void);
\`\`\``;

// Long description for the transmitDestAddr configuration parameter
const transmitAddrLongDescription = `Defines the address that will accompany\
 each packet sent from this device. It can also be thought of as this device's\
 __own address__.\n\
\n\
__Default__: NULL\n\
\n\
__Acceptable Values__: Hex Formatted Addresses`;

// Exports the long descriptions for each configurable in TX Settings
exports = {
    transmitAddrLongDescription: transmitAddrLongDescription,
    randNumGenFxnLongDescription: randNumGenFxnLongDescription,
    chIdleTimeUsLongDescription: chIdleTimeUsLongDescription,
    rssiThresholdDbmLongDescription: rssiThresholdDbmLongDescription,
    backoffTimeunitsLongDescription: backoffTimeunitsLongDescription,
    maxBackoffWindowLongDescription: maxBackoffWindowLongDescription,
    minBackoffWindowLongDescription: minBackoffWindowLongDescription
};
