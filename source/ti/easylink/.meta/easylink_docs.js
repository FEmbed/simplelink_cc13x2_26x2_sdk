
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
 *  ======== easylink_docs.js ========
 */

"use strict";

// Long description for the addrSize configuration parameter
const addrSizeLongDescription = `Defines the address size used for all Tx/Rx\
 operations. Takes effect after calling \`EasyLink_init()\` but can be changed\
 at runtime via a call to \`EasyLink_setCtrl()\`. For more information, refer\
 to the [EasyLink_setCtrl API Reference](/proprietary-rf/\
proprietary-rf-users-guide/easylink/\
easylink-api-reference-cc13x2_26x2.html#c.EasyLink_setCtrl).\n\
\n\
__Default__: 1\n\
\n\
__Range__:\n
Value | Description
--- | ---
Not Using an Address | Address size is set to 0 and no address is used for rx/\
tx operations. Address filtering is also disabled.
1 | Address size is set to 1
2 | Address size is set to 2
4 | Address size is set to 4
8 | Address size is set to 8
\n\
__Example__: \nThe following code snippet is an example of modifying the\
 address size at runtime via a call to \`EasyLink_setCtrl()\`:\n\
\`\`\`C
uint32_t addrSizeBytes = 4;
EasyLink_CtrlOption addrSize = EasyLink_Ctrl_AddSize;
EasyLink_setCtrl(addrSize, addrSizeBytes);
\`\`\``;

// Long description for the maxDataLength configuration parameter
const maxDataLengthLongDescription = `Defines the largest Tx/Rx payload that\
 the interface can support. Takes effect after calling \`EasyLink_init()\` and\
 cannot be changed at runtime. For more information, refer to the\
 [EASYLINK_MAX_DATA_LENGTH API Reference](/proprietary-rf/\
proprietary-rf-users-guide/\
easylink/easylink-api-reference-cc13x2_26x2.html#c.EASYLINK_MAX_DATA_LENGTH)\n\
\n\
__Default__: 128\n\
\n\
__Range__: 1 to 512 bytes`;

// Long description for the radioInactivityTimeout configuration parameter
const radioInactivityTimeoutLongDesc = `Defines the time for the radio to\
 return to idle after inactivity. Takes effect after calling\
 \`EasyLink_init()\` but can also be configured at runtime via a call to\
 \`EasyLink_setCtrl()\`. For more information, refer to the [EasyLink Idle\
 Timeout API Reference](/proprietary-rf/proprietary-rf-users-guide/easylink/\
    easylink-api-reference-cc13x2_26x2.html#c.EasyLink_Ctrl_Idle_TimeOut).\n\
\n\
__Default__: 1ms\n\
\n\
__Range__: 1 to UINT32_MAX/4000\n\n\
In C code, the radio inactivity timeout gets translated to RAT time via\
 equation 1. The result is then assigned to a variable declared as a uint32_t.\
 To avoid overflow the max radio inactivity timeout is UINT32_MAX/4000.\n\n\
\`\`\`
(1) UNIT_IN_RAT = UNIT_IN_MS*4000
\`\`\`
\n\n\
__Example__: \n\n The following code snippet sets the idle timeout at runtime\
 via a call to \`EasyLink_setCtrl()\`:\n
\`\`\`C
uint32_t timeoutMs = 1;
EasyLink_CtrlOption idleTimeout = EasyLink_Ctrl_Idle_TimeOut;
EasyLink_setCtrl(idleTimeout, timeoutMs);
\`\`\``;

// Long description for the EasyLink module
const easyLinkLongDescription = `The [__EasyLink API__][1] is intended to\
 abstract the RF Driver in order to give a simple API for customers to use as\
 is or extend to suit their application use cases.

* [Usage Synopsis][2]
* [Examples][3]

[1]: /proprietary-rf/proprietary-rf-users-guide/easylink\
/easylink-api-reference-cc13x2_26x2.html
[2]: /proprietary-rf/proprietary-rf-users-guide/proprietary-rf-guide\
/index-cc13x2_26x2.html
[3]: /proprietary-rf/proprietary-rf-users-guide/proprietary-rf-guide\
/examples-cc13x2_26x2.html`;


// Exports the long descriptions for each configurable in Easylink Settings
exports = {
    radioInactivityTimeoutLongDesc: radioInactivityTimeoutLongDesc,
    maxDataLengthLongDescription: maxDataLengthLongDescription,
    addrSizeLongDescription: addrSizeLongDescription,
    easyLinkLongDescription: easyLinkLongDescription
};
