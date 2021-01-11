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
 */

/*
 *  ======== rpc.component.js ========
 *  Define the SysConfig modules in this component
 */

"use strict";

let topModules;
let displayName = "RPC Infrastructure";
let description =
    "Integrate Remote Procedure Call implementations into embedded " +
    "systems using various physical transports. Supports both third " +
    "party and custom components.";

let deviceId = system.deviceData.deviceId;

if (deviceId == "dragon") {
    topModules = [
        {
            displayName: displayName,
            description: description,
            modules: [
                "/ti/rpc/ERPC",
                "/ti/rpc/SecMsg"
            ]
        }
    ];
}
else {
    topModules = [
        {
            displayName: displayName,
            description: description,
            modules: [
                "/ti/rpc/ERPC"
            ]
        }
    ];
}

let templates = [
    {
        "name": "/ti/rpc/Config.c.xdt",
        "outputPath": "ti_rpc_config.c"
    },
    {
        "name": "/ti/rpc/Config.h.xdt",
        "outputPath": "ti_rpc_config.h"
    },
    {
        "name": "/ti/rpc/ERPC.cpp.xdt",
        "outputPath": "ti_rpc_erpc.cpp"
    },
    {
        "name": "/ti/rpc/ERPC.h.xdt",
        "outputPath": "ti_rpc_erpc.h"
    },
    {
        "name": "/ti/rpc/Makefile.erpc.xdt",
        "outputPath": "rpc/Makefile.erpc"
    },
    {
        "name": "/ti/rpc/erpc.js.xdt",
        "outputPath": "rpc/erpc.js"
    },
    {
        "name": "/ti/rpc/rpc.gv.xdt",
        "outputPath": "rpc/rpc.gv"
    },
    {
        "name": "/ti/rpc/model.gv.xdt",
        "outputPath": "rpc/model.gv"
    }
];

exports = {
    topModules,
    templates
};
