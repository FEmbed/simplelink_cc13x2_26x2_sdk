/******************************************************************************

 @file  ll_config.h

 @brief This file contains the BLE link layer configuration table macros,
        constants, typedefs and externs.

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
 * UNEXPECTED BEHAVIOR.
 *
 */


#ifndef LL_CONFIG_H
#define LL_CONFIG_H

#ifdef __cplusplus
extern "C"
{
#endif

/*******************************************************************************
 * INCLUDES
 */

#include "ll_user_config.h"

/*******************************************************************************
 * MACROS
 */

#define CRC_SUFFIX_PRESENT()  (llConfigTable.rxPktSuffixPtr->suffixSel & SUFFIX_CRC_FLAG)
#define RSSI_SUFFIX_PRESENT() (llConfigTable.rxPktSuffixPtr->suffixSel & SUFFIX_RSSI_FLAG)

/*******************************************************************************
 * CONSTANTS
 */

// Receive Suffix Data Sizes
#define SUFFIX_SIZE_NONE                0
#define SUFFIX_CRC_SIZE                 3
#define SUFFIX_RSSI_SIZE                1
#if defined(BLE_V50_FEATURES) && (BLE_V50_FEATURES & (PHY_2MBPS_CFG | PHY_LR_CFG))
#define SUFFIX_STATUS_SIZE              2
#else // !BLE_V50_FEATURES
#define SUFFIX_STATUS_SIZE              1
#endif // BLE_V50_FEATURES
#define SUFFIX_TIMESTAMP_SIZE           4
#define SUFFIX_MAX_SIZE                 (SUFFIX_CRC_SIZE    +                  \
                                         SUFFIX_RSSI_SIZE   +                  \
                                         SUFFIX_STATUS_SIZE +                  \
                                         SUFFIX_TIMESTAMP_SIZE)

#define SUFFIX_FLAG_NONE                0
#define SUFFIX_CRC_FLAG                 1
#define SUFFIX_RSSI_FLAG                2
#define SUFFIX_STATUS_FLAG              4
#define SUFFIX_TIMESTAMP_FLAG           8

// Receive Suffix Flags
#if defined(BLE_VS_FEATURES) && (BLE_VS_FEATURES & SCAN_REQ_RPT_CFG)
#define ADV_SUFFIX_FLAGS                (SUFFIX_RSSI_FLAG+SUFFIX_STATUS_FLAG)       // Connect Req and Scan Req Packets
#else // !SCAN_REQ_RPT_CFG
#define ADV_SUFFIX_FLAGS                (SUFFIX_FLAG_NONE)                          // Connect Req and Scan Req Packets
#endif // SCAN_REQ_RPT_CFG
#if defined(CTRL_V50_CONFIG) && (CTRL_V50_CONFIG & AE_CFG)
#define SCAN_SUFFIX_FLAGS               (SUFFIX_RSSI_FLAG+SUFFIX_STATUS_FLAG)       // Adv and Scan Rsp Packets
#else // !AE_CFG
#define SCAN_SUFFIX_FLAGS               (SUFFIX_RSSI_FLAG)                          // Adv and Scan Rsp Packets
#endif // AE_CFG
#if defined(CTRL_V50_CONFIG) && (CTRL_V50_CONFIG & AE_CFG)
#define INIT_SUFFIX_FLAGS               (SUFFIX_STATUS_FLAG)                        // Adv Packets
#else // !AE_CFG
#define INIT_SUFFIX_FLAGS               (SUFFIX_FLAG_NONE)                          // Adv Packets
#endif // AE_CFG
#define LINK_SUFFIX_FLAGS               (SUFFIX_RSSI_FLAG + SUFFIX_TIMESTAMP_FLAG)  // Data and Control Packets

// Suffix Sizes
#if defined(BLE_VS_FEATURES) && (BLE_VS_FEATURES & SCAN_REQ_RPT_CFG)
#define ADV_SUFFIX_SIZE                 (SUFFIX_RSSI_SIZE+SUFFIX_STATUS_SIZE)
#else // !SCAN_REQ_RPT_CFG
#define ADV_SUFFIX_SIZE                 (SUFFIX_SIZE_NONE)
#endif // SCAN_REQ_RPT_CFG
#if defined(CTRL_V50_CONFIG) && (CTRL_V50_CONFIG & AE_CFG)
#define SCAN_SUFFIX_SIZE                (SUFFIX_RSSI_SIZE+SUFFIX_STATUS_SIZE)
#else // !AE_CFG
#define SCAN_SUFFIX_SIZE                (SUFFIX_RSSI_SIZE)
#endif // AE_CFG
#if defined(CTRL_V50_CONFIG) && (CTRL_V50_CONFIG & AE_CFG)
#define INIT_SUFFIX_SIZE                (SUFFIX_STATUS_SIZE)
#else // !AE_CFG
#define INIT_SUFFIX_SIZE                (SUFFIX_SIZE_NONE)
#endif // AE_CFG
#define LINK_SUFFIX_SIZE                (SUFFIX_RSSI_SIZE + SUFFIX_TIMESTAMP_SIZE)

// Number of Link Connections
#ifndef LL_MAX_NUM_BLE_CONNS
#define LL_MAX_NUM_BLE_CONNS            3
#endif

// Number of TX Data Entries
#define MAX_NUM_TX_ENTRIES              8

// Number Data Entries
#define NUM_RX_DATA_ENTRIES             4

#ifndef MAX_NUM_WL_ENTRIES
#define MAX_NUM_WL_ENTRIES              16  // at 8 bytes per WL entry
#endif                                  
                                        
#ifndef MAX_NUM_RL_ENTRIES              
#define MAX_NUM_RL_ENTRIES              10  // at 60 bytes per RL entry
#endif                                  
                                        
#ifndef MAX_NUM_MST_PKTS                
#define MAX_NUM_MST_PKTS                UNLIMITED_PKTS_PER_EVENT
#endif // !MAX_NUM_MST_PKTS             
                                        
#ifndef MAX_NUM_SLA_PKTS                
#define MAX_NUM_SLA_PKTS                UNLIMITED_PKTS_PER_EVENT
#endif // !MAX_NUM_SLA_PKTS

#ifndef CONN_CUTOFF_IN_PERCENT
#define CONN_CUTOFF_IN_PERCENT          95 // in percent of CI wanted
#endif // CONN_CUTOFF_IN_PERCENT

#ifndef EXTENDED_STACK_SETTINGS
#define EXTENDED_STACK_SETTINGS         0
#endif


// Max Data Size
// Note: When greater than 27, fragmenation is used.
#define MAX_DATA_SIZE                   27

// Number Scan Entries
#define NUM_RX_SCAN_ENTRIES             4

// Packets Per Event
#define UNLIMITED_PKTS_PER_EVENT        0
#define ONE_PKT_PER_EVENT               1

#define LL_STARTUP_MARGIN               2100

// RF Operation Pointer and RF Front End Settings for Reset and Wake
#define RF_OP_PTR_LOCATION              0x210000EC
//
#define RF_SETUP_CONFIG_ON_RESET        0x0000
#define RF_SETUP_CONFIG_ON_WAKE         0x02D0

// Crypto Driver Mode
#define CRYPTO_DRV_MODE_POLLING         0
#define CRYPTO_DRV_MODE_BLOCKING        1

/*******************************************************************************
 * TYPEDEFS
 */

// This structure is used to specify Slave RF timing margins. All values are
// in Radio Timer ticks (i.e. 250ns ticks).
//
// preRfMargin: This is the amount of time to subtract from the RF operation's
//              start time (i.e. how much earlier the RF operation will start),
//              and is used to account for the Frequency Synthesizer Calibration
//              time and Rx settle time (i.e. Rx Ramp time) such that the radio
//              is ready to receive.
// postRfMargin This is the amount of time to add to the duration of Rx while
//              waiting for packet synch. This effectively extends the receive
//              window.
PACKED_TYPEDEF_STRUCT
{
  uint8 preRfMargin;
  uint8 postRfMargin;
} slvRfMargin_t;

PACKED_TYPEDEF_STRUCT
{
  uint8 suffixSel;
  uint8 suffixSize;
} pktSuffix_t;

//PACKED typedef uint8 pktSize_t;
typedef uint8 pktSize_t;

//PACKED typedef uint8 wlSize_t;
typedef uint8 wlSize_t;

//PACKED typedef uint8 rlSize_t;
typedef uint8 rlSize_t;

PACKED_TYPEDEF_STRUCT
{
  uint8 maxMstPktsPerEvt;
  uint8 maxSlvPktsPerEvt;
} maxPktsPerEvt_t;

typedef void (patchCM0_t)(void);

PACKED_TYPEDEF_STRUCT
{
  uint16 resetRfCfgVal;
  uint16 wakeRfCfgVal;
} rfCfgVal_t;

//PACKED typedef uint32 rfOp_t;
typedef uint32 rfOp_t;

PACKED_TYPEDEF_STRUCT
{
  const uint8           *placeHolder0;
  patchCM0_t            *patchCM0Ptr;
  const rfOp_t          *rfOpPtr;
  const rfCfgVal_t      *rfCfgValPtr;
  const uint8           *placeHolder1;
  const pktSuffix_t     *rxPktSuffixPtr;
  const pktSuffix_t     *advPktSuffixPtr;
  const pktSuffix_t     *scanPktSuffixPtr;
  const pktSuffix_t     *initPktSuffixPtr;
  const maxPktsPerEvt_t *maxPktsPerEvtPtr;
  const uint8           *cryptoMode;
  const uint8           *ecdhMode;
  const uint32          *connEvtCutoff;
  const uint16          *advExtPrimLoopOffsetUs;
  const uint16          *advExtSecLoopOffsetUs;
  const llUserCfg_t     *userCfgPtr;
} llCfgTable_t;

/*******************************************************************************
 * LOCAL VARIABLES
 */


/*******************************************************************************
 * GLOBAL VARIABLES
 */

extern uint8 numTxDataBufs;
extern uint8 maxNumTxDataBufs;

extern uint8 maxNumConns;
extern uint16 maximumPduSize;
extern uint8 rfFeModeBias;
extern uint8 wlSize;
extern uint8 rlSize;
extern uint32 extStackSettings;

extern uint16  llUserConfig_maxPduSize;
extern const llCfgTable_t llConfigTable;

#ifdef __cplusplus
}
#endif

#endif /* LL_CONFIG_H */
