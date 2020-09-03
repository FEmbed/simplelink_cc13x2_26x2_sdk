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

const configInSrfStudioLongDescription = `By selecting this, SysConfig _will\
 not_ generate RF Settings code to be used by EasyLink. Instead, the EasyLink\
 stack will expect a ti_radio_config.h and ti_radio_config.c file to be\
 present in the application. These can be generated via the SmartRF\
 Studio application independent of SysConfig.\n\n If this option is selected,\
 the EasyLink Stack assumes that a Custom PHY is being used with the default\
 names provided by the SmartRF Studio code export feature.\n\
 \n\
 __Default__: False (unchecked)`;

const defaultPhyLongDescription = `The PHY the EasyLink stack will default to\
 when \`EasyLink_init()\` is called. To select a PHY from this drop-down, it\
 must first be enabled by selecting the corresponding checkbox above.\n\
 \n\
 __Default__: Custom`;

const rfDesignLongDescription = `The user must select an existing TI RF design\
 to reference for radio configuration. This value must match the Based on RF\
 Design parameter in the RF Design module.
\n\
__Default__: The RF design reference selected in this project is automatically\
 configured based on the example. Please move to a custom board or see the\
 other examples provided in the SDK if another reference board is desired.`;

// Exports the long descriptions for each configurable in Radio Settings
exports = {
    configInSrfStudioLongDescription: configInSrfStudioLongDescription,
    defaultPhyLongDescription: defaultPhyLongDescription,
    rfDesignLongDescription: rfDesignLongDescription
};
