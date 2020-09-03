/******************************************************************************

 @file  ll_privacy.h

 @brief This file contains the data structures and APIs for handling
        Bluetooth Low Energy Privacy 1.2

 Group: WCS, BTS
 Target Device: cc13x2_26x2

 ******************************************************************************
 
 Copyright (c) 2015-2020, Texas Instruments Incorporated
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
 * UNEXPECTED BEHAVIOR.
 *
 */

#ifndef LL_PRIVACY_H
#define LL_PRIVACY_H

/*******************************************************************************
 * INCLUDES
 */

#include "rf_hal.h"
#include "bcomdef.h"
#include "ll.h"
#include "ll_common.h"
#include "ll_wl.h"

/*******************************************************************************
 * MACROS
 */

#define MASK_ID_ADDRTYPE( addrType ) ((addrType) & LL_DEV_ADDR_TYPE_MASK)

#define ADDRTYPE_TO_OWNADDR( addrType )                                        \
        ( (MASK_ID_ADDRTYPE((addrType)) == LL_DEV_ADDR_TYPE_PUBLIC) ?          \
          (ownPublicAddr)                                           :          \
          (ownRandomAddr) )

/*******************************************************************************
 * CONSTANTS
 */

#define BLE_RESOLVING_LIST_SIZE      (rlSize) // Resolving List Size For Peer + Local IRK/RP/IdAddr
#define EXT_WHITE_LIST_SIZE          (2 * BLE_RESOLVING_LIST_SIZE)
#define LOCAL_RL_INDEX               0
#define EMPTY_RESOLVE_LIST_ENTRY     0xFF
#define INVALID_RESOLVE_LIST_INDEX   0xFF
#define INVALID_EXT_WHITE_LIST_INDEX 0
#define MIN_RPA_TIMEOUT              0x0001 // 1s
#define MAX_RPA_TIMEOUT              0xA1B8 // 41400s or 11.5 hours
#define DEFAULT_RPA_TIMEOUT          0x0384 // 900s or 15 mins

// Masks for MSB of Device Address
#define RANDOM_ADDR_MASK             0xC0
//
#define NON_RESOLVABLE_ADDR_MASK     0x00
#define RESOLVABLE_ADDR_MASK         0x40
#define STATIC_RANDOM_ADDR_MASK      0xC0

// White List Size
#define WL_SIZE_STANDARD             0
#define WL_SIZE_EXTENDED             1

// White List Ignore For Privacy
#define PRIV_IGNORE_WL_ENTRY         0
#define PRIV_USE_WL_ENTRY            1

#ifdef QUAL_TEST
// List size limited to 3 entries because of test case LL/CON/INI/BV-23-C
#define LOCAL_IRK_LIST_SIZE          3
#endif

/*******************************************************************************
 * TYPEDEFS
 */

// RPA TargetA Entry Configuration
// |   7..2   |    1     |    0    |
// | Reserved | addrType | bEnable |
typedef uint8 rpaTargetAConf_t;

typedef struct
{
  uint8 idAddrType;                  // Identity Address Type (Public or Random Static)
  uint8 idAddr[ B_ADDR_LEN ];        // Identity Address
  uint8 RPA[ B_ADDR_LEN ];           // Resolvable Private Address
  uint8 IRK[ KEYLEN ];               // Identity Resolving Key
  uint8 privMode;                    // Privacy Mode
} rlEntry_t;

PACKED_TYPEDEF_STRUCT
{
  uint8 offset;                      //Index which indicates the end of the standard WL and the beginning of the ExtWL
  rpaTargetAConf_t conf;             //TargetA RPA configuration
  uint8 address[ LSB_2_BYTES ];      //Least significant 16 bits of the address contained in the entry
  uint8 addressHi[ MSB_4_BYTES ];    //Most significant 32 bits of the address contained in the entry
} rpaTargetAList_t;

PACKED_TYPEDEF_STRUCT
{
  uint8 *pRpaInitA;                  //Pointer to alternative address to send as InitA in a CONNECT_IND or AUX_CONNECT_REQ
  rpaTargetAList_t *pRpaTargetAList; //Pointer to a list of alternative addresses to send as TargetA in an AUX_CONNECT_RSP
} rpaCfg_t;

#ifdef QUAL_TEST
typedef struct
{
  uint8 peerAddrType;           // Peer Identity Address Type (Public or Random Static)
  uint8 peerAddr[ B_ADDR_LEN ]; // Peer Identity Address
  uint8 IRK[ KEYLEN ];          // Local Identity Resolving Key
} localIrkList_t;
#endif

/*******************************************************************************
 * LOCAL VARIABLES
 */

/*******************************************************************************
 * GLOBAL VARIABLES
 */

extern privInfo_t privInfo;
extern rlEntry_t  *resolvingList;
extern rpaCfg_t   *pRpaCfg;
/*******************************************************************************
 * GLOBAL ROUTINES
 */

extern void   LL_PRIV_Init( void );

extern uint32 LL_PRIV_Ah( uint8 *irk, uint8 *prand );

extern void   LL_PRIV_GenerateRPA( uint8 *irk, uint8 *rpa );

extern void   LL_PRIV_GenerateNRPA( uint8 *publicAddr, uint8 *nrpa );

extern void   LL_PRIV_GenerateRSA( uint8 *rsa );

extern uint8  LL_PRIV_ResolveRPA( uint8 *rpa, uint8 *irk );

extern uint8  LL_PRIV_IsRPA( uint8 rxAddrType, uint8 *rxAddr );

extern uint8  LL_PRIV_IsNRPA( uint8 rxAddrType, uint8 *rxAddr );

extern uint8  LL_PRIV_IsIDA( uint8 rxAddrType, uint8 *rxAddr );

extern uint8  LL_PRIV_IsResolvable( uint8 *rpa, rlEntry_t *resolvingList );

extern uint8  LL_PRIV_IsZeroIRK( uint8 *irk );

extern uint8  LL_PRIV_FindPeerInRL( rlEntry_t *resolvingList, uint8 idType, uint8 *idAddr );

extern void   LL_PRIV_UpdateRL( rlEntry_t *resolvingList );

extern uint8  LL_PRIV_NumberPeerRLEntries( rlEntry_t *resolvingList );

extern void   LL_PRIV_CheckRLPeerId( rlEntry_t *resolvingList, wlTable_t *pWlTable );

extern void   LL_PRIV_CheckRLPeerIdEntry( rlEntry_t *resolvingList, wlTable_t *pWlTable );

// Extended (i.e. Private) White List

extern void   LL_PRIV_SetupPrivacy( wlTable_t *pWlTable );

extern void   LL_PRIV_TeardownPrivacy( wlTable_t *pWlTable );

extern void   LL_PRIV_ClearExtWL( wlTable_t *pWlTable );

extern void   LL_PRIV_ClearAllPrivIgn( wlTable_t *pWlTable );

extern uint8  LL_PRIV_AddExtWLEntry( wlTable_t *pWlTable, uint8 *devAddr, uint8 devAddrType, uint8 setIgnore );

extern void   LL_PRIV_UpdateExtWLEntry( wlTable_t *pWlTable, uint8 *oldRPA, uint8 *newRPA );

extern uint8  LL_PRIV_FindExtWLEntry( wlTable_t *pWlTable, uint8 *devAddr, uint8 devAddrType );

extern void   LL_PRIV_SetWLSize( wlTable_t *pWlTable, uint8 wlSizeType );

#ifdef QUAL_TEST
extern void   LL_PRIV_UpdateLocalIrkList( uint8 *peerAddr, uint8 peerAddrType, uint8 *localIrk );

extern uint8 *LL_PRIV_GetLocalIrk( uint8 *peerAddr, uint8 peerAddrType);

#endif
/*******************************************************************************
 */

#endif /* LL_PRIVACY_H */


