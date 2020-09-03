/******************************************************************************

 @file  linkdb_internal.h

 @brief This file contains internal linkDB interfaces and defines.

 Group: WCS, BTS
 Target Device: cc13x2_26x2

 ******************************************************************************
 
 Copyright (c) 2016-2020, Texas Instruments Incorporated
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
 */


#ifndef LINKDB_INTERNAL_H
#define LINKDB_INTERNAL_H

#ifdef __cplusplus
extern "C"
{
#endif

/*********************************************************************
 * INCLUDES
 */

/*********************************************************************
 * MACROS
 */

/*********************************************************************
 * CONSTANTS
 */

// Secure Connection Only Mode Encryption Key Size
#define SCOM_ENCRYPT_KEY_SIZE           16      //!<  Encryption Key size (128 bits)

/**
 * @defgroup LinkdDB_ChangeTypes LinkDB Change Types
 *
 * Link Database Status callback changeTypes
 * @{
 */
#define LINKDB_STATUS_UPDATE_NEW        0       //!< New connection created
#define LINKDB_STATUS_UPDATE_REMOVED    1       //!< Connection was removed
#define LINKDB_STATUS_UPDATE_STATEFLAGS 2       //!< Connection state flag changed
/** @} End LinkdDB_ChangeTypes */

/*********************************************************************
 * TYPEDEFS
 */

/// Link Security information
typedef struct
{
  uint8 srk[KEYLEN];  //!< Signature Resolving Key
  uint32 signCounter; //!< Sign Counter
} linkSec_t;

/// Encryption Params
typedef struct
{
  uint8 ltk[KEYLEN];             //!< short term key or long term key.
                                 //!< TODO: rename this to "key" for ROM freeze
  uint16 div;                    //!< Diversifier
  uint8 rand[B_RANDOM_NUM_SIZE]; //!< random number
  uint8 keySize;                 //!< encryption Key Size
} encParams_t;

/// Additional internal information pertaining to the link
typedef struct
{
  uint8 taskID;                 //!< Application that controls the link
  uint16 connectionHandle;      //!< Controller connection handle
  uint8 stateFlags;             //!< LINK_CONNECTED, LINK_AUTHENTICATED...
  uint8 addrType;               //!< Address type of connected device
  uint8 addr[B_ADDR_LEN];       //!< Other Device's address
  uint8 addrPriv[B_ADDR_LEN];   //!< Other Device's Private address
  uint8 connRole;               //!< Connection formed as Master or Slave
  uint16 connInterval;          //!< The connection's interval (n * 1.23 ms)
  uint16 MTU;                   //!< The connection's MTU size
  linkSec_t sec;                //!< Connection Security related items
  encParams_t *pEncParams;      //!< pointer to STK / LTK, ediv, rand
  uint16 connTimeout;           //!< Supervision timeout
  uint16 connLatency;           //!< Slave latency
} linkDBItem_t;

/// Function pointer used to perform specialized link database searches
typedef void (*pfnPerformFuncCB_t)
(
  linkDBItem_t *pLinkItem   //!< linkDB item
);

/// Function pointer used to register for a status callback
typedef void (*pfnLinkDBCB_t)
(
  uint16 connectionHandle,  //!< connection handle
  uint8 changeTypes         //!< @ref LinkdDB_ChangeTypes
);

/*********************************************************************
 * GLOBAL VARIABLES
 */

/// @cond NODOC
extern uint8 linkDBNumConns;
/// @endcond NODOC


/*********************************************************************
 * FUNCTIONS
 */

extern void linkDB_reportStatusChange( uint16 connectionHandle, uint8 changeType );

extern void linkDB_Init( void );

/**
 * Register with linkDB
 *
 * Register with this function to receive a callback when the status changes on
 * a connection. If the stateflag == 0, then the connection has been
 * disconnected.
 *
 * @param pFunc function pointer to callback function
 *
 * @return @ref SUCCESS if successful
 * @return @ref bleMemAllocError if no table space available
 *
 */
extern uint8 linkDB_Register( pfnLinkDBCB_t pFunc );

/**
 * Adds a record to the link database.
 *
 * @param taskID - Application task ID. OBSOLETE.
 * @param connectionHandle - new record connection handle
 * @param stateFlags - @ref LinkDB_States
 * @param addrType - @ref Addr_type
 * @param pAddr - new address
 * @param pAddrPriv - private address (only if addrType is 0x02 or 0x03)
 * @param connRole - @ref GAP_Profile_Roles
 * @param connInterval - connection's communications interval (n * 1.23 ms)
 * @param MTU - connection's MTU size
 *
 * @return      @ref SUCCESS if successful
 * @return      @ref bleIncorrectMode - hasn't been initialized.
 * @return      @ref bleNoResources - table full
 * @return      @ref bleAlreadyInRequestedMode - already exist connectionHandle
 *
 */
  extern uint8 linkDB_Add( uint8 taskID, uint16 connectionHandle,
                           uint8 stateFlags, uint8 addrType, uint8 *pAddr,
                           uint8 *pAddrPriv, uint8 connRole, uint16 connInterval,
                           uint16 MTU, uint16 connTimeout, uint16 connLatency );

/**
 * Remove a record from the link database.
 *
 * @param  pItem - pointer to the record item to remove
 *
 * @return @ref SUCCESS if successful
 * @return @ref INVALIDPARAMETER - pItem is invalid.
 */
  extern uint8 linkDB_Remove( linkDBItem_t* pItem );

/**
 * Update the stateFlags of a link record.
 *
 * @param  connectionHandle - maximum number of connections.
 * @param  newState - @ref LinkDB_States.  This value is OR'd in
 *                    to this field.
 * @param  add - TRUE to set state into flags, FALSE to remove.
 *
 * @return @ref SUCCESS if successful
 * @return @ref bleNoResources - connectionHandle not found.
 *
 */
  extern uint8 linkDB_Update( uint16 connectionHandle, uint8 newState,
                              uint8 add );

/**
 * This function is used to update the connection parameter of a link record.
 *
 * @param connectionHandle - new record connection handle
 * @param connInterval - connection's communications interval (n * 1.23 ms)
 * @param connTimeout - Connection supervision timeout.
 * @param connLatency - Number of skipped events (slave latency).
 *
 * @return SUCCESS if successful
 * @return bleNoResources - connectionHandle not found.
 */
 extern uint8 linkDB_updateConnParam ( uint16 connectionHandle,
                                       uint16 connInterval,
                                       uint16 connTimeout,
                                       uint16 connLatency );

/**
 * Update the MTU size of a link or record.
 *
 * @param  connectionHandle - controller link connection handle.
 * @param  newMtu - new MTU size.
 *
 * @return @ref SUCCESS or failure
 */
extern uint8 linkDB_UpdateMTU( uint16 connectionHandle, uint16 newMtu );

/**
 * This function is used to get the MTU size of a link.
 *
 * @param connectionHandle controller link connection handle.
 *
 * @return link MTU size
 */
extern uint16 linkDB_MTU( uint16 connectionHandle );

  /**
 * Find a link in the link database.
 *
 * Uses the connection handle to search the link database.
 *
 * @param       connectionHandle - controller link connection handle.
 *
 * @return      a pointer to the found link item
 * @return      NULL if not found
 */
extern linkDBItem_t *linkDB_Find( uint16 connectionHandle );

/**
 * Check to see if the physical link is encrypted and authenticated.
 *
 * @param  connectionHandle - controller link connection handle.
 * @param  keySize - size of encryption keys.
 * @param  mitmRequired - TRUE (yes) or FALSE (no).
 *
 * @return @ref SUCCESS if the link is authenticated
 * @return @ref bleNotConnected - connection handle is invalid
 * @return @ref LINKDB_ERR_INSUFFICIENT_AUTHEN - link is not encrypted
 * @return @ref LINBDB_ERR_INSUFFICIENT_KEYSIZE - key size encrypted is not large enough
 * @return @ref LINKDB_ERR_INSUFFICIENT_ENCRYPTION - link is encrypted, but not authenticated
 */
  extern uint8 linkDB_Authen( uint16 connectionHandle, uint8 keySize,
                              uint8 mitmRequired );

/**
 * Get the role of a physical link.
 *
 * @param  connectionHandle - controller link connection handle.
 *
 * @return @ref GAP_Profile_Roles
 * @return 0 - unknown
 */
  extern uint8 linkDB_Role( uint16 connectionHandle );

/**
 * Perform a function of each connection in the link database.
 *
 * @param cb - connection callback function.
 */
  extern void linkDB_PerformFunc( pfnPerformFuncCB_t cb );

/**
 * Aet a device into Secure Connection Only Mode.
 *
 * @param  state -  TRUE for Secure Connections Only Mode. FALSE to disable
 *         Secure Connections Only Mode.
 */
  extern void linkDB_SecurityModeSCOnly( uint8 state );

/*********************************************************************
*********************************************************************/

#ifdef __cplusplus
}
#endif

#endif /* LINKDB_INTERNAL_H */
