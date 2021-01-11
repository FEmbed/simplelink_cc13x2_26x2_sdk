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
 *  ======== libmap.xs ========
 *  Map device name to library name
 *
 *  The device map of library names is used by both the build model and
 *  the configuration model. Placing the map in a script file allows each
 *  model to load it as a capsule.
 */

/*
 *  ======== devMap ========
 *  Map device name to library name
 *
 *  <library>: [ "<dev1>", "<dev2>", ... ]
 *  <library>: [ "", ".+" ]               map null or any device
 */
var devMap = {
    mtxx: [ "MTL1" ],
    nil: [ "", "\.\+" ]                 /* must be last */
}

/*
 *  ======== mapLookup ========
 *  Return the key for the given name in the given map
 *
 *  key = mapLookup(name, map)
 *
 *  Iterate over each key of the given map (in definition order). For each
 *  key, iterate over the array of values. For each value, construct a
 *  regular expression anchored at the start. Test the given name against
 *  the RE. The name must match the RE, but the entire name need not be
 *  consumed. This allows a less specific value to match a more verbose
 *  name (e.g. name="MTL1_x1" will match val="MTL1").
 *
 *  map = {
 *      key1: [ "val1", "val2", ... ],
 *      key2: [ "val1", "val2", ... ],
 *      :
 *      keyN: [ "", "\.\+" ]
 *  }
 */
function mapLookup(name, map)
{
    if (name == null) name = "";

    for (var prop in map) {
        for (var i = 0; i < map[prop].length; i++) {
            var propRE = new RegExp("^" + map[prop][i]);
            if (name.match(propRE)) {
                return (prop == "nil" ? "" : prop);
            }
        }
    }

    throw new Error("mapLookup() failed: name=" + name);
}
