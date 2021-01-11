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
 *  ======== zigbee_rcmcg_config.syscfg.js ========
 */

"use strict";

/* Get common utility functions */
const Common = system.getScript("/ti/zstack/zstack_common.js");

/* Get Clusters and Commands from ZCL.js */
const clusters = system.getScript("/ti/zstack/stack/zcl/ZCL.js").ZCL.clusters;

/* Get rcmcg long descriptions */
const docs = system.getScript("/ti/zstack/app/rec_config/rcmcg_config/zigbee_rcmcg_config_docs.js");

/* Configurables for the Zigbee Application Mandatory Commands module */
const rcmcgModule = {
    displayName: "Mandatory Commands Generated",
    config: [],
};

let rcmcgServerDropDowns = [];
let rcmcgClientDropDowns = [];
let rcmcgServerAlwaysHidden = [];
let rcmcgClientAlwaysHidden = [];
for (let i in clusters) {
  let cluster = clusters[i];

  let tempClientCommandDefault = [];
  let tempClientCommandOptions = [];
  if (cluster.server && cluster.server.command) {
    for (let j=0; j<cluster.server.command.length; j++) {
      let command = cluster.server.command[j];
      if (command._required == "true") {
        tempClientCommandDefault.push(command._id);
        tempClientCommandOptions.push({name: command._id, displayName: command._name});
      }
    }
  }
  rcmcgModule.config.push({
    name: cluster._id + "rcmcgClient",
    displayName: cluster._name + " Client Commands Generated",
    description: "Mandatory Zigbee Client Commands Generated for the " + cluster._name + " cluster.",
    longDescription: docs.manCommandsLongDescription,
    default: tempClientCommandDefault,
    options: tempClientCommandOptions,
    hidden: true,
    minSelections: 0
  })
  rcmcgClientDropDowns.push(cluster._id + "rcmcgClient");
  if (tempClientCommandOptions.length == 0) { rcmcgClientAlwaysHidden.push(cluster._id + "rcmcgClient"); }

  let tempServerCommandDefault = [];
  let tempServerCommandOptions = [];
  if (cluster.client && cluster.client.command) {
    for (let j=0; j<cluster.client.command.length; j++) {
      let command = cluster.client.command[j];
      if (command._required == "true") {
        tempServerCommandDefault.push(command._id);
        tempServerCommandOptions.push({name: command._id, displayName: command._name});
      }
    }
  }
  rcmcgModule.config.push({
    name: cluster._id + "rcmcgServer",
    displayName: cluster._name + " Server Commands Generated",
    description: "Mandatory Zigbee Server Commands Generated for the " + cluster._name + " cluster.",
    longDescription: docs.manCommandsLongDescription,
    default: tempServerCommandDefault,
    options: tempServerCommandOptions,
    hidden: true,
    minSelections: 0
  })
  rcmcgServerDropDowns.push(cluster._id + "rcmcgServer");
  if (tempServerCommandOptions.length == 0) { rcmcgServerAlwaysHidden.push(cluster._id + "rcmcgServer"); }
}

/* Function to handle changes in the recommended server clusters */
function rcmcgOnServerClusterChange(inst, ui)
{
  for (let i in rcmcgServerDropDowns) { ui[rcmcgServerDropDowns[i]].hidden = true; }

  let clusterIDs = inst[inst.zigbeeDeviceType + "recServer"];
  for (let i in clusterIDs) { ui[clusterIDs[i] + "rcmcgServer"].hidden = false; }

  for (let i in rcmcgServerAlwaysHidden) { ui[rcmcgServerAlwaysHidden[i]].hidden = true; }
}

/* Function to handle changes in the recommended client clusters */
function rcmcgOnClientClusterChange(inst, ui)
{
  for (let i in rcmcgClientDropDowns) { ui[rcmcgClientDropDowns[i]].hidden = true; }

  let clusterIDs = inst[inst.zigbeeDeviceType + "recClient"];
  for (let i in clusterIDs) { ui[clusterIDs[i] + "rcmcgClient"].hidden = false; }

  for (let i in rcmcgClientAlwaysHidden) { ui[rcmcgClientAlwaysHidden[i]].hidden = true; }
}

/* Exports to the top level of the Zigbee Application submodule */
exports = {
  rcmcgModule: rcmcgModule,
  rcmcgOnServerClusterChange: rcmcgOnServerClusterChange,
  rcmcgOnClientClusterChange: rcmcgOnClientClusterChange
};
