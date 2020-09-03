/******************************************************************************

 @file  gap_advertiser_internal.h

 @brief This file contains internal interfaces for the GAP.

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

#ifndef GAP_ADV_INTERNAL_H
#define GAP_ADV_INTERNAL_H

#ifdef __cplusplus
extern "C"
{
#endif

/*********************************************************************
 * INCLUDES
 */
#include "bcomdef.h"
#include "ll.h"
#include "gap.h"

/*********************************************************************
 * MACROS
 */

#ifndef status_t
  #define status_t bStatus_t
#endif

/*********************************************************************
 * CONSTANTS
 */

/*********************************************************************
 * TYPEDEFS
 */
/** Advertising and Scan Response Data **/
typedef struct
{
  uint8   dataLen;                  // Number of bytes used in "dataField"
  uint8   dataField[B_MAX_ADV_LEN]; // Data field of the advertisement or SCAN_RSP
} gapAdvertisingData_t;

typedef struct
{
  uint8   dataLen;       // length (in bytes) of "dataField"
  uint8   dataField[1];  // This is just a place holder size
                         // The dataField will be allocated bigger
} gapAdvertRecData_t;

// Temporary advertising record
typedef struct
{
  uint8  eventType;               // Avertisement or SCAN_RSP
  uint8  addrType;                // Advertiser's address type
  uint8  addr[B_ADDR_LEN];        // Advertiser's address
  gapAdvertRecData_t *pAdData;    // Advertising data field. This space is allocated.
  gapAdvertRecData_t *pScanData;  // SCAN_RSP data field. This space is allocated.
} gapAdvertRec_t;

typedef enum
{
  GAP_ADSTATE_SET_PARAMS,     // Setting the advertisement parameters
  GAP_ADSTATE_SET_MODE,       // Turning on advertising
  GAP_ADSTATE_ADVERTISING,    // Currently Advertising
  GAP_ADSTATE_ENDING          // Turning off advertising
} gapAdvertStatesIDs_t;

// Lookup for a GAP Scanner parameter.
// Note: Offset is offset into controller aeSetParamCmd_t structure
// There is no need for range checking in the host as it is done in the
// controller
typedef struct {
  uint8_t  offset;
  uint8_t  len;
} gapAdv_ParamLookup_t;

/// Advertiser remove set Event
typedef struct {
  osal_event_hdr_t hdr;       //!< GAP_MSG_EVENT and status
  uint8_t          opcode;    //!< GAP_ADV_REMOVE_SET_EVENT
  uint8_t          handle;    //!< Handle of the adv set to remove
  aeSetParamCmd_t* pAdvParam; //!< pointer of the parameter to free
} gapAdv_removeAdvEvent_t;

/*********************************************************************
 * GLOBAL VARIABLES
 */

/*********************************************************************
 * GAP Advertiser Functions
 */
extern bStatus_t gapAdv_init(void);
extern void      gapAdv_controllerCb(uint8 cBackID, void *pParams);
extern bStatus_t gapAdv_searchForBufferUse(uint8 *pBuf, advSet_t *pAdvSet);
extern void      gapAdv_processRemoveSetEvt(uint8_t handle, 
                                            aeSetParamCmd_t* pAdvParam);

/*********************************************************************
*********************************************************************/

#ifdef __cplusplus
}
#endif

#endif /* GAP_INTERNAL_H */
