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
 *  ======== easylink_oad_config_docs.js ========
 */

"use strict";

// Long description for the blockSize configuration parameter
const blockSizeLongDescription = `The _Block Size_ is the number of bytes sent\
 in an OAD Block and affects the time taken to complete an over-the-air\
 download. Care must be taken when setting this to a high value in environments\
 where noise is a concern, as the chances of a block being corrupted due to\
 interference increases with the size of the block.\n\
 \n\
 __Range__: 16 to 496 bytes\n\n\
[More...](/proprietary-rf/proprietary-rf-users-guide/proprietary-rf-oad/\
oad-process.html)`;

// Long description for the blockInterval configuration parameter
const blockIntervalLongDescription = `The interval between block requests sent\
 from the client. Reducing this will reduce the time taken to finish an\
 over-the-air download.\n\
 \n\
 __Note__:\n\n\
The interval must be large enough to ensure the server can read the block from\
 external flash, send it over-the-air, and the client can write the block to\
 external flash before the next block request is sent.\n
[More...](/proprietary-rf/proprietary-rf-users-guide/proprietary-rf-oad/\
oad-process.html)`;

// Exports the long descriptions for each configurable in Oad Settings
exports = {
    blockSizeLongDescription: blockSizeLongDescription,
    blockIntervalLongDescription: blockIntervalLongDescription
};
