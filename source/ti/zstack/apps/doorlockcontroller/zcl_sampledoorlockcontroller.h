/**************************************************************************************************
  Filename:       zcl_sampledoorlockcontroller.h
  Revised:        $Date: 2013-02-28 15:45:01 -0800 (Thu, 28 Feb 2013) $
  Revision:       $Revision: 33335 $

  Description:    This file contains the Zigbee Cluster Library Home
                  Automation Sample Application.


  Copyright 2013 Texas Instruments Incorporated. All rights reserved.

  IMPORTANT: Your use of this Software is limited to those specific rights
  granted under the terms of a software license agreement between the user
  who downloaded the software, his/her employer (which must be your employer)
  and Texas Instruments Incorporated (the "License").  You may not use this
  Software unless you agree to abide by the terms of the License. The License
  limits your use, and you acknowledge, that the Software may not be modified,
  copied or distributed unless embedded on a Texas Instruments microcontroller
  or used solely and exclusively in conjunction with a Texas Instruments radio
  frequency transceiver, which is integrated into your product.  Other than for
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
**************************************************************************************************/

#ifndef ZCL_SAMPLEDOORLOCKCONTROLLER_H
#define ZCL_SAMPLEDOORLOCKCONTROLLER_H

#ifdef __cplusplus
extern "C"
{
#endif

/*********************************************************************
 * INCLUDES
 */
#include "zcl.h"
#include "nvintf.h"
#include "cui.h"
/*********************************************************************
 * CONSTANTS
 */
#define SAMPLEDOORLOCKCONTROLLER_ENDPOINT           8

// Application Events
#define SAMPLEDOORLOCKCONTROLLER_POLL_CONTROL_TIMEOUT_EVT     0x0001
#define SAMPLEDOORLOCKCONTROLLER_PIN_SAVE_TIMEOUT             0x0002
#define SAMPLEAPP_END_DEVICE_REJOIN_EVT                       0x0004
#define SAMPLEAPP_DISCOVERY_TIMEOUT_EVT                       0x0008

// Green Power Events
#define SAMPLEAPP_PROCESS_GP_DATA_SEND_EVT              0x0100
#define SAMPLEAPP_PROCESS_GP_EXPIRE_DUPLICATE_EVT       0x0200
#define SAMPLEAPP_PROCESS_GP_TEMP_MASTER_EVT            0x0400

// NV PIN Information
#define DLSAPP_NV_DOORLOCK_PIN          0x0010
#define DLSAPP_NV_DOORLOCK_PIN_LEN      5
#define DLSAPP_MAX_PIN_SIZE             4

#define SAMPLEAPP_END_DEVICE_REJOIN_DELAY 1000

/*********************************************************************
 * MACROS
 */

/*********************************************************************
 * TYPEDEFS
 */

/*********************************************************************
 * VARIABLES
 */
extern SimpleDescriptionFormat_t zclSampleDoorLockController_SimpleDesc;

extern CONST zclAttrRec_t zclSampleDoorLockController_Attrs[];

extern CONST uint8_t zclSampleDoorLockController_NumAttributes;

extern uint8_t  zclSampleDoorLockController_OnOff;

extern uint16_t zclSampleDoorLockController_IdentifyTime;

/*********************************************************************
 * FUNCTIONS
 */

/*
 *  Reset all writable attributes to their default values.
 */
extern void zclSampleDoorLockController_ResetAttributesToDefaultValues(void);

extern void zclSampleDoorLockController_UiActionEnterPin(const char _input, char* _lines[3], CUI_cursorInfo_t * _curInfo);
extern void zclSampleDoorLockController_UiActionDoorLockDiscovery(const int32_t _itemEntry);
extern void zclSampleDoorLockController_UiActionLock(const int32_t _itemEntry);
extern void zclSampleDoorLockController_UiActionUnlock(const int32_t _itemEntry);
/*********************************************************************
*********************************************************************/

#ifdef __cplusplus
}
#endif

#endif /* ZCL_SAMPLEDOORLOCKCONTROLLER_H */
