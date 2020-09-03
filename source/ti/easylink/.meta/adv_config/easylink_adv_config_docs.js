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
 *  ======== easylink_adv_config_docs.js ========
 */

"use strict";

// Long description for the enableMultiClientMode configuration parameter
const enableMultiClientModeLongDesc = `Set Multi-client mode for an application\
 that will use multiple RF clients. Takes effect after calling\
 \`EasyLink_init()\` but can be changed at runtime via a call to\
 \`EasyLink_setCtrl()\` and a subsequent call to \`EasyLink_init()\`. For more
 information, refer to the [EasyLink MultiClient Mode API Reference](\
/proprietary-rf/proprietary-rf-users-guide/easylink/\
easylink-api-reference-cc13x2_26x2.html#c.EasyLink_Ctrl_MultiClient_Mode).\n\
\n\
__Default__: False (unchecked)\n\
\n\
__Example__: \n\nThe following code snippet sets the multi-client mode at\
 runtime via a call to \`EasyLink_setCtrl()\`:\n\
\`\`\`C
// Enable multi-client mode
uint32_t bool = 1;
EasyLink_CtrlOption setMultiClientMode = EasyLink_Ctrl_MultiClient_Mode;
EasyLink_setCtrl(setMultiClientMode, bool);

// Re-initialize the easylink parameters
EasyLink_Params easyLink_params;
EasyLink_Params_init(&easyLink_params);

// Initialize EasyLink
if(EasyLink_init(&easyLink_params) != EasyLink_Status_Success)
{
    // EasyLink_init failed, trap in a loop
    while(1);
}
\`\`\``;

// Long description for the clientEventCb configuration parameter
const clientEventCbLongDescription = `Defines the callback function provided to\
 the RF driver for client-related events. Takes effect after calling\
 \`EasyLink_init()\` and cannot be changed at runtime. For more information,\
 refer to the [RF_Params Structure Reference](/rflib/html/\
struct_r_f___params.html).\n\
\n\
__Default__: NULL\n\
\n\
__Acceptable Values__:\n\n\
Functions with valid C identifier names with the following return value and\
 parameters:\n\
\`\`\`C
void functionName(RF_Handle h, RF_ClientEvent event, void* arg);
\`\`\``;

// Long description for the clientEventMask configuration parameter
const clientEventMaskLongDescription = `Event mask used to subscribe certain\
 client events. The purpose is to keep the number of callback executions small.\
 Takes effect after calling \`EasyLink_init()\` and cannot be changed at\
 runtime. For more information, refer to the [RF_Params Structure Reference]\
(/rflib/html/struct_r_f___params.html).\n\
\n\
__Default__: RF_ClientEventNone`;

// Exports the long descriptions for each configurable in Adv Settings
exports = {
    clientEventMaskLongDescription: clientEventMaskLongDescription,
    clientEventCbLongDescription: clientEventCbLongDescription,
    enableMultiClientModeLongDesc: enableMultiClientModeLongDesc
};
