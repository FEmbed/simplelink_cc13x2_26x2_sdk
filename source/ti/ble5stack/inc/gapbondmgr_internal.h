/******************************************************************************

 @file  gapbondmgr_internal.h

 @brief This file contains internal interfaces for the gapbondmgr.

 Group: WCS, BTS
 Target Device: cc13x2_26x2

 ******************************************************************************
 
 Copyright (c) 2009-2020, Texas Instruments Incorporated
 All rights reserved.

 IMPORTANT: Your use of this Software is limited to those specific rights
 granted under the terms of a software license agreement between the user
 who downloaded the software, his/her employer (which must be your employer)
 and Texas Instruments Incorporated (the "License"). You may not use this
 Software unless you agree to abide by the terms of the License. The License
 limits your use, and you acknowledge, that the Software may not be modified,
 copied or distributed unless embedded on a Texas Instruments microcontroller
 or used solely and exclusively in conjunction with a Texas Instruments radio
 frequency transceiver, which is integrated into your product. Other than for
 the foregoing purpose, you may not use, reproduce, copy, prepare derivative
 works of, modify, distribute, perform, display or sell this Software and/or
 its documentation for any purpose.

 YOU FURTHER ACKNOWLEDGE AND AGREE THAT THE SOFTWARE AND DOCUMENTATION ARE
 PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED,
 INCLUDING WITHOUT LIMITATION, ANY WARRANTY OF MERCHANTABILITY, TITLE,
 NON-INFRINGEMENT AND FITNESS FOR A PARTICULAR PURPOSE. IN NO EVENT SHALL
 TEXAS INSTRUMENTS OR ITS LICENSORS BE LIABLE OR OBLIGATED UNDER CONTRACT,
 NEGLIGENCE, STRICT LIABILITY, CONTRIBUTION, BREACH OF WARRANTY, OR OTHER
 LEGAL EQUITABLE THEORY ANY DIRECT OR INDIRECT DAMAGES OR EXPENSES
 INCLUDING BUT NOT LIMITED TO ANY INCIDENTAL, SPECIAL, INDIRECT, PUNITIVE
 OR CONSEQUENTIAL DAMAGES, LOST PROFITS OR LOST DATA, COST OF PROCUREMENT
 OF SUBSTITUTE GOODS, TECHNOLOGY, SERVICES, OR ANY CLAIMS BY THIRD PARTIES
 (INCLUDING BUT NOT LIMITED TO ANY DEFENSE THEREOF), OR OTHER SIMILAR COSTS.

 Should you have any questions regarding your right to use this Software,
 contact Texas Instruments Incorporated at www.TI.com.

 ******************************************************************************
 
 
 *****************************************************************************/

/*********************************************************************
 *
 * WARNING!!!
 *
 * THE API'S FOUND IN THIS FILE ARE FOR INTERNAL STACK USE ONLY!
 * FUNCTIONS SHOULD NOT BE CALLED DIRECTLY FROM APPLICATIONS, AND ANY
 * CALLS TO THESE FUNCTIONS FROM OUTSIDE OF THE STACK MAY RESULT IN
 * UNEXPECTED BEHAVIOR
 *
 * These API's shall begin with a lower-case letter
 */

#ifndef GAPBONDMGR_INTERNAL_H
#define GAPBONDMGR_INTERNAL_H

#ifdef __cplusplus
extern "C"
{
#endif

/*********************************************************************
 * INCLUDES
 */
#include "bcomdef.h"
#include "gap.h"

/*********************************************************************
 * MACROS
 */

// Used calculate the index/offset in to NV space
#define CALC_NV_ID(Idx, offset)         (((((Idx) * GAP_BOND_REC_IDS) + (offset))) + BLE_NVID_GAP_BOND_START)
#define MAIN_RECORD_NV_ID(bondIdx)      (CALC_NV_ID((bondIdx), GAP_BOND_REC_ID_OFFSET))
#define LOCAL_LTK_NV_ID(bondIdx)        (CALC_NV_ID((bondIdx), GAP_BOND_LOCAL_LTK_OFFSET))
#define DEV_LTK_NV_ID(bondIdx)          (CALC_NV_ID((bondIdx), GAP_BOND_DEV_LTK_OFFSET))
#define DEV_IRK_NV_ID(bondIdx)          (CALC_NV_ID((bondIdx), GAP_BOND_DEV_IRK_OFFSET))
#define DEV_CSRK_NV_ID(bondIdx)         (CALC_NV_ID((bondIdx), GAP_BOND_DEV_CSRK_OFFSET))
#define DEV_SIGN_COUNTER_NV_ID(bondIdx) (CALC_NV_ID((bondIdx), GAP_BOND_DEV_SIGN_COUNTER_OFFSET))

// Used to calculate the GATT index/offset in to NV space
#define GATT_CFG_NV_ID(Idx)                    ((Idx) + BLE_NVID_GATT_CFG_START)

/*********************************************************************
 * CONSTANTS
 */

/**
 * @brief This parameter is only used by the Host Test app Application (network processor)
 *        The Id of this parameter is used to store the password locally.
 *        the GAP Bond manager is not storing any default password anymore,
 *        everytime a password is needed, pfnPasscodeCB_t will be call.
 *
 * @note an embedded application MUST used @ref pfnPasscodeCB_t
 *
 * size: uint32_t
 *
 * default: 0
 *
 * range: 0 - 999999
 */
#define GAPBOND_DEFAULT_PASSCODE      0x408

/*********************************************************************
 * TYPEDEFS
 */

/*********************************************************************
 * GLOBAL VARIABLES
 */

/*********************************************************************
 * FUNCTIONS
 */

extern bStatus_t gapBondMgr_syncResolvingList(void);
extern uint8_t gapBondMgr_CheckNVLen(uint8_t id, uint8_t len);

/**
 * This should only be used in osal_icall_ble.c in osalInitTasks()
 *
 * @param task_id OSAL task ID
 */
extern void GAPBondMgr_Init(uint8_t task_id, uint8_t cfg_gapBond_maxBonds, uint8_t cfg_gapBond_maxCharCfg, uint8_t cfg_gapBond_gatt_no_client, uint8_t cfg_gapBond_gatt_no_service_changed);

/**
 * This should only be used in osal_icall_ble.c in tasksArr[]
 *
 * @param  task_id OSAL task ID
 * @param  events  OSAL event received
 *
 * @return bitmask of events that weren't processed
 */
extern uint16_t GAPBondMgr_ProcessEvent(uint8_t task_id, uint16_t events);

/*********************************************************************
*********************************************************************/

#ifdef __cplusplus
}
#endif

#endif /* GAPBONDMGR_INTERNAL_H */
