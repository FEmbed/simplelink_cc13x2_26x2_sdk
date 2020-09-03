/******************************************************************************

 @file  gap_scanner_internal.h

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

#ifndef GAP_SCANNER_INTERNAL_H
#define GAP_SCANNER_INTERNAL_H

#ifdef __cplusplus
extern "C"
{
#endif

/*********************************************************************
 * INCLUDES
 */
#include "bcomdef.h"
#include "ll.h"
#include "gap_scanner.h"

/*********************************************************************
 * MACROS
 */

#ifndef status_t
  #define status_t bStatus_t
#endif

// Masks to split type and status in evtType field of @ref GapScan_Evt_AdvRpt_t
#define ADV_RPT_EVT_TYPE_MASK   (ADV_RPT_EVT_TYPE_CONNECTABLE | \
                                 ADV_RPT_EVT_TYPE_SCANNABLE |   \
                                 ADV_RPT_EVT_TYPE_DIRECTED |    \
                                 ADV_RPT_EVT_TYPE_SCAN_RSP |    \
                                 ADV_RPT_EVT_TYPE_LEGACY)
#define ADV_RPT_EVT_STATUS_MASK (ADV_RPT_EVT_STATUS_MORE_DATA | \
                                 ADV_RPT_EVT_STATUS_TRUNCATED)

/*********************************************************************
 * CONSTANTS
 */

/*********************************************************************
 * TYPEDEFS
 */

/// Advertising Report Fragment
typedef struct GapScan_AdvRptFrag_s GapScan_AdvRptFrag_t;

/// Advertising report fragment
struct GapScan_AdvRptFrag_s {
  /// Pointer to next  advertising report fragment
  GapScan_AdvRptFrag_t* pNext;
  uint8_t               dataLen;  //!< data length
  uint8_t*              pData;    //!< pointer to data
};

/// Advertising Report Session
typedef struct {
  GapScan_AdvRptFrag_t* pFragHead;  //!< pointer to fragment head
  GapScan_AdvRptFrag_t* pFragCurr;  //!< pointer to current fragment
  GapScan_Evt_AdvRpt_t* pDefrag;    //!< pointer to defragmented data
} GapScan_AdvRptSession_t;

/// Scan Session End Event
typedef struct {
  osal_event_hdr_t         hdr;      //!< GAP_MSG_EVENT and status
  uint8_t                  opcode;   //!< GAP_SCAN_SESSION_END_EVENT
  GapScan_AdvRptSession_t* pSession; //!< Advertising report session to complete
} GapScan_SessionEndEvent_t;
  
// Lookup for a GAP Scanner parameter.
// note: Min/max work only for uint8-type parameters
typedef struct {
  uint8_t  offset;
  uint8_t  len;
  uint8_t  min;
  uint8_t  max;
} gapScan_ParamLookup_t;

/*********************************************************************
 * GLOBAL VARIABLES
 */

/*********************************************************************
 * GAP Scanner Functions
 */
extern bStatus_t gapScan_init(void);

/*********************************************************************
*********************************************************************/

#ifdef __cplusplus
}
#endif

#endif /* GAP_SCANNER_INTERNAL_H */
