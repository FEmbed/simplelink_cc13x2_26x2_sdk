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
 *  ======== easylink_rx_config_docs.js ========
 */

"use strict";

// Long description for the enableAddrFilter configuration parameter
const enableAddrFilterLongDescription = `Enabling address filtering causes the\
 receiver to filter packets by the addresses defined in _Addresses to Filter\
 On_. Takes effect after calling \`EasyLink_init()\` but can be changed at\
 runtime via a call to \`EasyLink_enableRxAddrFilter()\`. For more information,\
 refer to the [EasyLink_enableRxAddrFilter API Reference](/proprietary-rf/\
proprietary-rf-users-guide/easylink/\
easylink-api-reference-cc13x2_26x2.html#c.EasyLink_enableRxAddrFilter).\n\
 \n\
__Default__: True (checked)\n\
\n\
__Example__: \nThe following code snippet modifies the address filter settings\
 at runtime via a call to \`EasyLink_enableRxAddrFilter()\`. The address filter\
 is set to match on a single byte (0xAA):\n\
\n\
\`\`\`C
#define ADDR_FILTER_SIZE_IN_BYTES   1
#define ADDR_FILTER_NUM             1

uint8_t addrFilter[ADDR_FILTER_SIZE_IN_BYTES * ADDR_FILTER_NUM] = {0xAA};
if(EasyLink_enableRxAddrFilter(addrFilter, ADDR_FILTER_SIZE_IN_BYTES,\n\
    ADDR_FILTER_NUM) != EasyLink_Status_Success)
{
    // EasyLink_enableRxAddrFilter failed, trap in a loop
    while(1);
}
\`\`\`\n\
\n\
__Note__: \nThe second argument to \`EasyLink_enableRxAddrFilter()\`, the size\
 of address in bytes,must match the value of 'addrSize' in the EasyLink module.\
 By default this variable is set to 1. To change the default size, the user\
 must first call \`EasyLink_setCtrl(EasyLink_Ctrl_AddSize,\
 new_size_of_filter_addr_bytes);\`prior to enabling the receiver address\
 filter. Alternatively, the address size can be changed via SysConfig by\
 modifying the _Address Size_ parameter.`;

// Long description for the addrFilters configuration parameter
const addrFiltersLongDescription = `Defines the addresses this device will\
search for when receiving packets in hex format. If a packet is received with\
a destination address not defined in the *Addresses to Filter On* list, this\
device will ignore it.\n\
\n\
__Default__: 0xAA\n\
\n
__Range__: Maximum of 8 addresses\n
\n
___Additional Setup Required___:\n
The transmitter device's application code must be configured to transmit to\
this device. For example, if the *Address Size* = 2 bytes, and the *Addresses\
to Filter* list contains the address \`0xABCD\`, the transmitter is required\
to setup a transmission packet as follows:\n
\`\`\`C
EasyLink_TxPacket txPacket =  { {0}, 0, 0, {0} };  // Create an empty txPacket
txPacket.dstAddr[0] = 0xCD; // Set first byte of packet dest address to 0xCD
txPacket.dstAddr[1] = 0xAB; // Set second byte of packet dest address to 0xAB
\`\`\``;

// Long description for the asyncRxTimeout configuration parameter
const asyncRxTimeoutLongDescription = `Relative time from an asynchronous\
 receive operation's start to timeout. A value of 0 means no timeout. Takes\
 effect after calling \`EasyLink_init()\` but can also be configured at runtime\
 via a call to \`EasyLink_setCtrl()\`. For more information, refer to the\
 [EasyLink Async Rx Timeout API Reference](/proprietary-rf/\
proprietary-rf-users-guide/easylink/\
easylink-api-reference-cc13x2_26x2.html#c.EasyLink_Ctrl_AsyncRx_TimeOut).\n\
\n\
__Default__: 0ms\n\
\n\
__Range__: 0 to UINT32_MAX/4000\n\n\
In C code, the async rx timeout gets translated to RAT time via\
 equation 1. The result is then assigned to a variable declared as a uint32_t.\
 To avoid overflow the max async rx timeout is UINT32_MAX/4000.\n\n\
\`\`\`
(1) UNIT_IN_RAT = UNIT_IN_MS*4000
\`\`\`\n
\n\
__Example__: \n\n The following code snippet sets the asynchronous receive\
 timeout at runtime via a call to \`EasyLink_setCtrl()\`:\n\n
\`\`\`C
uint32_t timeoutMs = 1;
EasyLink_CtrlOption asyncRxTimeout = EasyLink_Ctrl_AsyncRx_TimeOut;
EasyLink_setCtrl(asyncRxTimeout, timeoutMs);
\`\`\``;

// Exports the long descriptions for each configurable in RX Settings
exports = {
    asyncRxTimeoutLongDescription: asyncRxTimeoutLongDescription,
    addrFiltersLongDescription: addrFiltersLongDescription,
    enableAddrFilterLongDescription: enableAddrFilterLongDescription
};
