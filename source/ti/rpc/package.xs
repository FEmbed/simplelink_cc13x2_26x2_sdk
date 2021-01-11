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
 *  ======== package.xs ========
 */

var localCfg = xdc.loadCapsule("libmap.xs");

/*
 *  ======== getLibs ========
 */
function getLibs(prog)
{
    var base = xdc.getPackageBase(this.$name);
    var target = Program.build.target;
    var profile = Program.build.profile;
    var cgt = "";
    var btag = "";

    /* extract vendor from target name */
    var vendor = ((target.$name.match(/^ti\.targets\..*\.clang\./)) ?
        [ "", "ticlang"] : target.$name.match(/^(\w+)\.targets/));

    /* compute the vendor tag name (e.g. ti --> ccs) */
    switch (vendor != null ? vendor[1] : "") {
        case "gnu":     cgt = "gcc";     break;
        case "iar":     cgt = "iar";     break;
        case "ti":      cgt = "ccs";     break;
        case "ticlang": cgt = "ticlang"; break;
        default:
            throw new Error("unsupported target: " + target.$name);
    }

    /* compute the build tag (e.g. em4f --> m4f) */
    switch (target.suffix) {
        case "em0":   btag = "m0";   break;
        case "em4f":  btag = "m4f";  break;
        case "m4f":   btag = "m4f";  break;
        case "m33":   btag = "m33";  break;
        case "m33f":  btag = "m33f"; break;
        case "m33fg": btag = "m33f"; break;
        case "m4fg":  btag = "m4f";  break;
        case "rm4f":  btag = "m4f";  break;
        default:
            throw new Error("unsupported suffix: " + target.suffix);
    }

    /* compute library name (e.g. pcl_mtxx_tirtos_release.a) */
    var dtag = localCfg.mapLookup(Program.cpu.deviceName, localCfg.devMap);
    dtag = (dtag == "" ? "" : "_" + dtag);
    var name = "rpc" + dtag + "_" + profile + ".a";

    /* compute library path: (e.g. /.../ti/pcl/lib/ccs/m4f/<name> */
    var lib = [base, "lib", cgt, btag, name].join("/");

    /* strip duplicate '//' characters from the library list */
    return (lib.replace(/\/\/+/g, '/'));
}
