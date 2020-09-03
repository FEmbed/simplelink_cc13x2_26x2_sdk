/*
 * Copyright (c) 2020, Texas Instruments Incorporated
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

#include <ti/drivers/rf/RF.h>
#include <ti/drivers/pin/PINCC26XX.h>
#include <ti/devices/DeviceFamily.h>
#include DeviceFamily_constructPath(driverlib/rf_bt5_coex.h)

#include "CC1352P_2_LAUNCHXL.h"

/*
 * Board-specific callback function to set the correct GPIO's for coex.
 *
 * This function is called by the driver on global driver events.
 * It contains a default implementation to set the correct IOMUX.
 * This function is defined further down is this file.
*/
extern void rfDriverCallback(RF_Handle client, RF_GlobalEvent events, void* arg);

/*
 * CoEx configuration structure.
 *
 * This structure controls the configuration options for the coexistence feature.
 * The radio core override list will have a pointer to this structure, and
 * act according to the settings specified in this structure.
*/
extern rfCoreHal_bleCoExConfig_t coexConfig;

/*
 * ISR to handle deasserted GRANT signal during RF activity.
 *
 * This ISR is enabled during RF activity, within RF_GlobalEventCmdStart and
 * RF_GlobalEventCmdStop, and is triggered by deassertion of the GRANT signal.
 * This is to abort any ongoing RF command chain if GRANT is revoked.
*/
extern void rfDriverISR(PIN_Handle handle, PIN_Id pinId);

const RFCC26XX_HWAttrsV2 RFCC26XX_hwAttrs = {
    .hwiPriority        = ~0,     /* Lowest HWI priority */
    .swiPriority        = 0,      /* Lowest SWI priority */
    .xoscHfAlwaysNeeded = true,   /* Keep XOSC dependency while in standby */
    
    /* Register the board specific callback */
    .globalCallback     = &rfDriverCallback,

    /* Subscribe callback to relevant events */
    .globalEventMask    = (RF_GlobalEventInit | RF_GlobalEventCmdStart | RF_GlobalEventCmdStop)
};

/*
 * ========= Coex =========
 */
// Coex pins
#define Board_RF_COEX_REQUEST   CC1352P_2_LAUNCHXL_DIO23_ANALOG
#define Board_RF_COEX_PRIORITY  CC1352P_2_LAUNCHXL_DIO25_ANALOG
#define Board_RF_COEX_GRANT     CC1352P_2_LAUNCHXL_DIO26_ANALOG

static PIN_Handle coexPins;
static PIN_State coexState;
static RF_Cmd* pCurrentCmd;

/*
 * ======== CC1352P_2_LAUNCHXL_rfDriverCallback ========
 * Set up the IOMUX with Radio core coex signals.
 *
 * Signal   | Radio Core
 * =========|============
 * REQUEST  | RFC_GPO3
 * PRIORITY | RFC_GPO2
 * GRANT    | RFC_GPI1
*/
void rfDriverCallback(RF_Handle client, RF_GlobalEvent events, void *arg)
{
    pCurrentCmd = (RF_Cmd*)arg;

    if (events & RF_GlobalEventInit) {
        // Initialize coex pins
        PIN_Config coexPinConfig[] = {
            Board_RF_COEX_REQUEST | PIN_GPIO_OUTPUT_EN | PIN_GPIO_LOW | PIN_PUSHPULL | PIN_DRVSTR_MAX,
            Board_RF_COEX_PRIORITY | PIN_GPIO_OUTPUT_EN | PIN_GPIO_LOW | PIN_PUSHPULL | PIN_DRVSTR_MAX,
            Board_RF_COEX_GRANT | PIN_INPUT_EN | PIN_PULLUP | PIN_INV_INOUT,
            PIN_TERMINATE
        };
        coexPins = PIN_open(&coexState, coexPinConfig);

        // Configure default coex pin muxing
        PINCC26XX_setMux(coexPins, Board_RF_COEX_REQUEST, PINCC26XX_MUX_RFC_GPO3);
        PINCC26XX_setMux(coexPins, Board_RF_COEX_PRIORITY, PINCC26XX_MUX_RFC_GPO2);
        PINCC26XX_setMux(coexPins, Board_RF_COEX_GRANT, PINCC26XX_MUX_RFC_GPI1);

        // Register interrupt callback
        PIN_registerIntCb(coexPins, &rfDriverISR);
    }
    else if (events & RF_GlobalEventCmdStart) {
        if (pCurrentCmd->coexPriority != RF_PriorityCoexDefault){
            // Override CoEx PRIORITY value
            coexConfig.overrideConfig.bUseOverridePriority = 1;
            coexConfig.overrideConfig.overridePriority = (uint8_t)(pCurrentCmd->coexPriority == RF_PriorityCoexHigh);
        }

        if ((pCurrentCmd->coexRequest != RF_RequestCoexDefault) &&
            (coexConfig.coExEnable.bRequestForChain == 0)){
            // Override CoEx REQUEST behavior in RX
            coexConfig.overrideConfig.bUseOverrideRequestForRx = 1;
            coexConfig.overrideConfig.overrideRequestForRx = (uint8_t)(pCurrentCmd->coexRequest == RF_RequestCoexAssertRx);
        }
        // Enable interrupt on GRANT pin deasserted
        PIN_setInterrupt(coexPins, Board_RF_COEX_GRANT | PINCC26XX_IRQ_NEGEDGE);
    }
    else if (events & RF_GlobalEventCmdStop) {
        if (pCurrentCmd->coexPriority != RF_PriorityCoexDefault) {
            // Clear use of CoEx PRIORITY override value
            coexConfig.overrideConfig.bUseOverridePriority = 0;
        }

        if ((pCurrentCmd->coexRequest != RF_RequestCoexDefault) &&
            (coexConfig.coExEnable.bRequestForChain == 0)){
            // Clear use of override value for CoEx REQUEST behavior in RX
            coexConfig.overrideConfig.bUseOverrideRequestForRx = 0;
        }
        // Disable interrupt on GRANT pin
        PIN_setInterrupt(coexPins, Board_RF_COEX_GRANT | PINCC26XX_IRQ_DIS);
    }
    else if (events & RF_GlobalEventCoexControl) {
        coexConfig.coExEnable.bCoExEnable = *(uint8_t *)arg;
    }
}

void rfDriverISR(PIN_Handle handle, PIN_Id pinId)
{
    if ((pinId == Board_RF_COEX_GRANT) && (coexConfig.rfCoreCoExStatus.bRequestAsserted == 1) &&
        (coexConfig.rfCoreCoExStatus.bIgnoreGrantInRxAsserted == 0)) {
        // Abort current cmd
        RF_cancelCmd(pCurrentCmd->pClient, pCurrentCmd->ch, 0);
    }
}
