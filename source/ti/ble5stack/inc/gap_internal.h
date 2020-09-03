/******************************************************************************

 @file  gap_internal.h

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

#ifndef GAP_INTERNAL_H
#define GAP_INTERNAL_H

#ifdef __cplusplus
extern "C"
{
#endif

/*********************************************************************
 * INCLUDES
 */
#include "bcomdef.h"
#include "ll.h"
#include "hci.h"
#include "l2cap.h"
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

// GAP OSAL Events
#define GAP_OSAL_TIMER_INITIATING_TIMEOUT_EVT   0x0001
#define GAP_END_ADVERTISING_EVT                 0x0002
#define GAP_CHANGE_RESOLVABLE_PRIVATE_ADDR_EVT  0x0004
#define GAP_CONN_PARAM_TIMEOUT_EVT              0x0008

#define GAP_PRIVATE_ADDR_CHANGE_RESOLUTION      0xEA60 // Timer resolution is 1 minute

#define ADV_TOKEN_HDR                           2

#if defined ( TESTMODES )
  // GAP TestModes
  #define GAP_TESTMODE_OFF                      0 // No Test mode
  #define GAP_TESTMODE_NO_RESPONSE              1 // Don't respond to any GAP message
#endif  // TESTMODES

// L2CAP Connection Parameters Update Request event
#define L2CAP_PARAM_UPDATE                      0xFFFF

/**
 * Sign Counter Initialized
 *
 * Sign counter hasn't been used yet.  Used when setting up
 * a connection's signing information.
 */
#define GAP_INIT_SIGN_COUNTER            0xFFFFFFFF

/**
 * Maximum Pairing Passcode/Passkey value.
 *
 * Range of a passkey can be 0 - 999,999.
 */
#define GAP_PASSCODE_MAX                 999999

/*********************************************************************
 * TYPEDEFS
 */

/**
 * Address types used for specifying own address type
 */
typedef enum
{
  OWN_ADDRTYPE_PUBLIC         = LL_DEV_ADDR_TYPE_PUBLIC,    //!< Use Public Addr
  OWN_ADDRTYPE_RANDOM         = LL_DEV_ADDR_TYPE_RANDOM,    //!< Use Random Addr
  OWN_ADDRTYPE_RPA_DEF_PUBLIC = LL_DEV_ADDR_TYPE_PUBLIC_ID, //!< Generate RPA, defaults to Public Addr if no local IRK
  OWN_ADDRTYPE_RPA_DEF_RANDOM = LL_DEV_ADDR_TYPE_RANDOM_ID  //!< Generate RPA, defaults to Random Addr if no local IRK
} GAP_Own_Addr_Types_t;

// Used when reading variables from the HCI during initialization.
typedef enum
{
  GAP_INITSTATE_INVALID,
  GAP_INITSTATE_BUFFERSIZE,
  GAP_INITSTATE_READY
} gapLLParamsStates_t;

typedef struct
{
  uint8                state;            // Authentication states
  uint16               connectionHandle; // Connection Handle from controller,
  smLinkSecurityReq_t  secReqs;          // Pairing Control info

  // The following are only used if secReqs.bondable == BOUND, which means that
  // the device is already bound and we should use the security information and
  // keys
  smSecurityInfo_t     *pSecurityInfo;    // BOUND - security information
  smIdentityInfo_t     *pIdentityInfo;    // BOUND - identity information
  smSigningInfo_t      *pSigningInfo;     // Signing information
} gapAuthStateParams_t;

// Callback when a connection-related event has been received on the Central.
typedef uint8(*gapProcessConnEvt_t)( uint16 cmdOpcode, hciEvt_CommandStatus_t *pMsg );

// Central connection-related callback structure - must be setup by the Central.
typedef struct
{
  gapProcessConnEvt_t pfnProcessConnEvt; // When connection-related event received
} gapCentralConnCBs_t;

// Peripheral connection-related callback structure - must be setup by the Peripheral.
typedef struct
{
  gapProcessConnEvt_t pfnProcessConnEvt;   // When connection-related event received
} gapPeripheralConnCBs_t;

/*********************************************************************
 * GLOBAL VARIABLES
 */

extern uint8 gapTaskID;

extern uint8 gapUnwantedTaskID;

extern uint8 gapAppTaskID;        // default task ID to send events

extern uint8 gapEndAppTaskID;     // end application task ID to send events

extern uint8 gapProfileRole;      // device GAP Profile Role(s)

extern GAP_Addr_Modes_t gapDeviceAddrMode; // local device address mode

// Central variables
extern gapCentralConnCBs_t *pfnCentralConnCBs;

// Peripheral variables
extern gapPeripheralConnCBs_t *pfnPeripheralConnCBs;

extern uint16 slaveConnHandle;

// Common variables
extern gapAuthStateParams_t *pAuthLink;

extern l2capParamUpdateReq_t slaveUpdateReq;

/*********************************************************************
 * GAP Task Functions
 */

extern uint8 gapProcessBLEEvents( osal_event_hdr_t *pMsg );
extern uint8 gapProcessCommandStatusEvt( hciEvt_CommandStatus_t *pMsg );
extern uint8 gapProcessConnEvt( uint16 connHandle, uint16 cmdOpcode, hciEvt_CommandStatus_t *pMsg );
extern uint8 gapProcessHCICmdCompleteEvt( hciEvt_CmdComplete_t *pMsg );
extern uint8 gapProcessOSALMsg( osal_event_hdr_t *pMsg );

/*********************************************************************
 * GAP Link Manager Functions
 */

extern bStatus_t disconnectNext(uint8 reason);
extern void gapFreeAuthLink( void );
extern void gapPairingCompleteCB( uint8 status, uint8 initiatorRole, uint16 connectionHandle, uint8 authState,
                                  smSecurityInfo_t *pEncParams, smSecurityInfo_t *pDevEncParams,
                                  smIdentityInfo_t *pIdInfo, smSigningInfo_t  *pSigningInfo );
extern void gapPasskeyNeededCB( uint16 connectionHandle, uint8 type, uint32 numComparison );
extern void gapProcessConnectionCompleteEvt( uint8 eventCode, hciEvt_BLEConnComplete_u *pPkt );
extern void gapProcessDisconnectCompleteEvt( hciEvt_DisconnComplete_t *pPkt );
extern void gapProcessRemoteConnParamReqEvt( hciEvt_BLERemoteConnParamReq_t *pPkt, uint8 accepted );
extern void gapRegisterCentralConn( gapCentralConnCBs_t *pfnCBs);
extern void gapRegisterPeripheralConn( gapPeripheralConnCBs_t *pfnCBs);
extern void gapSendBondCompleteEvent( uint8 status, uint16 connectionHandle );
extern void gapSendLinkUpdateEvent( uint8 status, uint16 connectionHandle, uint16 connInterval,
                                    uint16 connLatency, uint16 connTimeout );
extern void gapSendLinkRejectEvent( uint8 status, uint16 connectionHandle, uint16 connInterval,
                                    uint16 connLatency, uint16 connTimeout );
extern void gapSendPairingReqEvent( uint8 status, uint16 connectionHandle, uint8 ioCap, uint8 oobDataFlag,
                                    uint8 authReq, uint8 maxEncKeySize, keyDist_t keyDist );
extern void gapSendSignUpdateEvent( uint8 taskID, uint8 addrType, uint8 *pDevAddr, uint32 signCounter );
extern void gapSendSlaveSecurityReqEvent( uint8 taskID, uint16 connHandle, uint8 *pDevAddr, uint8 authReq );
extern void gapUpdateConnSignCounter( uint16 connHandle, uint32 newSignCounter );
extern void sendAuthEvent( uint8 status, uint16 connectionHandle, uint8 authState, smSecurityInfo_t *pDevEncParams );
extern void sendEstLinkEvent( uint8 status, uint8 taskID, uint8 devAddrType, uint8 *pDevAddr,
                              uint16 connectionHandle, uint8 connRole, uint16 connInterval,
                              uint16 connLatency, uint16 connTimeout, uint16 clockAccuracy );
extern void sendTerminateEvent( uint8 status, uint8 taskID, uint16 connectionHandle, uint8 reason );
extern void gapConnEvtNoticeCB( Gap_ConnEventRpt_t *pReport );
extern void gapSendBondLostEvent( uint16 connHandle, uint8 *pDevAddr );

/*********************************************************************
 * GAP Configuration Manager Functions
 */

extern GAP_Addr_Modes_t gapGetDevAddressMode( void );
extern gapLLParamsStates_t gapGetState( void );
extern uint32 gapGetSignCounter( void );
extern uint8 *gapGetSRK( void );
extern GAP_Own_Addr_Types_t gapHost2CtrlOwnAddrType( GAP_Addr_Modes_t addrMode );
extern  void gapIncSignCounter( void );
extern uint8 gapReadBufSizeCmdStatus( uint8 *pCmdStat );
extern void gapSendDeviceInitDoneEvent( uint8 status );
extern bStatus_t gap_ParamsInit(uint8 profileRole);
extern void gap_PrivacyInit(uint8 *pIRK);
extern void gap_SecParamsInit(uint8 *pSRK, uint32 *pSignCounter);
extern void gap_PeriConnRegister(void);
extern void gap_CentConnRegister(void);
// This should be a lower-case API but this would require patching gap_PrivacyInit
// Do this for the next ROM
extern void GAP_UpdateResolvingList(uint8_t *pIRK);
extern void GAP_UpdateResolvingList_noGAPBondMgr(uint8_t *pIRK);

/*********************************************************************
 * GAP Device Manager Functions
 */

extern void gapClrState( uint8 state_flag );
extern uint8 *gapFindADType( uint8 adType, uint8 *pAdLen, uint16 dataLen, uint8 *pDataField );
extern uint8 gapIsAdvertising( void );
extern uint8 gapIsScanning( void );
extern uint8 gapIsInitiating( void );
extern void gapSetState( uint8 state_flag );
extern uint8 gapValidADType( uint8 adType );

/*********************************************************************
 * GAP Peripheral Link Manager Functions
 */

extern uint8 gapL2capConnParamUpdateReq( void );
extern uint8 gapPeriProcessConnEvt( uint16 cmdOpcode, hciEvt_CommandStatus_t *pMsg );
extern void gapPeriProcessConnUpdateCmdStatus( uint8 status );
extern void gapPeriProcessConnUpdateCompleteEvt( hciEvt_BLEConnUpdateComplete_t *pPkt );
extern void gapPeriProcessConnUpdateRejectEvt( hciEvt_BLEConnUpdateComplete_t *pPkt );
extern uint8 gapPeriProcessSignalEvt( l2capSignalEvent_t *pCmd );

/*********************************************************************
 * GAP Central Link Manager Functions
 */

extern uint8 gapCentProcessConnEvt( uint16 cmdOpcode, hciEvt_CommandStatus_t *pMsg );
extern void gapCentProcessConnUpdateCompleteEvt( hciEvt_BLEConnUpdateComplete_t *pPkt );
extern void gapCentProcessConnUpdateRejectEvt( hciEvt_BLEConnUpdateComplete_t *pPkt );
extern uint8 gapCentProcessSignalEvt( l2capSignalEvent_t *pCmd );
extern void gapProcessCreateLLConnCmdStatus( uint8 status );
extern void gapTerminateConnComplete( void );

/*********************************************************************
*********************************************************************/

#ifdef __cplusplus
}
#endif

#endif /* GAP_INTERNAL_H */
