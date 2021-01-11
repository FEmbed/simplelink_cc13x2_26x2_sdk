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
 *  ======== GetLibs.syscfg.js ========
 */

"use strict";

/*
 *  ======== moduleStatic_modules ========
 */
function moduleStatic_modules(inst)
{
    let modules = new Array();

    modules.push({
        name: "rtos",
        displayName: "RTOS",
        moduleName: "/ti/drivers/RTOS"
    });

//  Cannot require GenLibs yet, still experimental
//
//  modules.push({
//      name: "genlibs",
//      displayName: "GenLibs",
//      moduleName: "/ti/utils/build/GenLibs"
//  });

    return (modules);
}

/*
 *  ======== getLibs ========
 */
function getLibs(mod)
{
    let GenLibs = system.getScript("/ti/utils/build/GenLibs.syscfg.js");

    /* get device ID and toolchain to select appropriate libs */
    let devId = system.deviceData.deviceId;
    let toolchain = GenLibs.getToolchainDir();

    var libs = [];
    var deps = [];
    var isa = "";
    var kernel = "";
    var profile = "_release";

    /* use bench profile if any mark points have been selected */
    if ("/ti/rpc/ERPC" in system.modules) {
        let erpc = system.modules["/ti/rpc/ERPC"];

        if (erpc.$static.Bench_ClientManager_createRequest_t0 ||
            erpc.$static.Bench_ClientManager_createRequest_t1 ||
            erpc.$static.Bench_ClientManager_performRequest_t0 ||
            erpc.$static.Bench_MsgQueTransport_recv_t0 ||
            erpc.$static.Bench_MsgQueTransport_send_t1) {
            profile = "_bench";
        }
    }

    switch (devId) {
        case "CC2652R1FRGZ":
        case "MSP432E":
        case "MSP432P401R":
        case "MSP432P4111":
            isa = "m4f";

            let rtos = system.modules["/ti/drivers/RTOS"];
            if (rtos.$static.name == "TI-RTOS") {
                kernel = "_tirtos";
            }
            else if (rtos.$static.name == "FreeRTOS") {
                kernel = "_freertos";
            }
            deps.push("/ti/drivers");
            break;

        case "dragon":
            let cpuss = system.modules["/ti/soc/CPUSS"];
            if (cpuss.$static.cpuId == "CPUID_1") {
                isa = "m33f";
            }
            else if (cpuss.$static.cpuId == "CPUID_2") {
                isa = "m33";
            }
            else {
                isa = devId;
            }

            kernel = "_tirtos";

            /* add dependency if doorbell included in model */
            if ("/ti/drivers/doorbell/Doorbell" in system.modules) {
                deps.push("/ti/drivers/doorbell");
            }
            break;

        default:
            isa = devId;
            break;
    }

    /* compute library path name, relative to repository */
    libs.push("third_party/erpc/ti/lib/" + toolchain + "/" + isa +
        "/erpc" + kernel + profile + ".a");

    /* link dependency */
    if (mod.transport == "pcl") {
        deps.push("/ti/pcl");
    }
    else if (mod.transport == "uart") {
        deps.push("/ti/drivers");
    }

    /* create a GenLibs input argument */
    var linkOpts = {
        name: "/ti/rpc",
        deps: deps,
        libs: libs
    };

    return (linkOpts);
}

/*
 *  ======== base ========
 */
let base = {
    displayName: "GetLibs",
    description: "GetLibs module for ti.rpc",

    moduleStatic: {
        modules: moduleStatic_modules
    },

    templates: {
        "/ti/utils/build/GenLibs.cmd.xdt":
            { modName: "/ti/rpc/GetLibs", getLibs: getLibs }
    }
};

/* export the module */
exports = base;
