/******************************************************************************

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

/**
 *  @defgroup LinkDB LinkDB
 *  This module implements the Link Database Module
 *  @{
 *  @file  linkdb.h
 *  LinkDB layer interface
 */

#ifndef LINKDB_H
#define LINKDB_H

#ifdef __cplusplus
extern "C"
{
#endif

/*********************************************************************
 * INCLUDES
 */

#include "ll_common.h"

/*********************************************************************
 * MACROS
 */

/**
 * Check to see if a physical link is up (connected).
 *
 * @param connectionHandle controller link connection handle.
 *
 * @return TRUE if the link is up
 * @return FALSE, otherwise.
 */
#define linkDB_Up( connectionHandle )  linkDB_State( (connectionHandle), LINK_CONNECTED )

/**
 * Check to see if the physical link is encrypted.
 *
 * @param connectionHandle controller link connection handle.
 *
 * @return TRUE if the link is encrypted
 * @return FALSE, otherwise.
 */
#define linkDB_Encrypted( connectionHandle )  linkDB_State( (connectionHandle), LINK_ENCRYPTED )

/**
 * Check to see if the physical link is authenticated.
 *
 * @param connectionHandle controller link connection handle.
 *
 * @return TRUE if the link is authenticated
 * @return FALSE, otherwise.
 */
#define linkDB_Authenticated( connectionHandle )  linkDB_State( (connectionHandle), LINK_AUTHENTICATED )

/**
 * Check to see if the physical link is bonded.
 *
 * @param connectionHandle controller link connection handle.
 *
 * @return TRUE if the link is bonded
 * @return FALSE, otherwise.
 */
#define linkDB_Bonded( connectionHandle )  linkDB_State( (connectionHandle), LINK_BOUND )

/*********************************************************************
 * CONSTANTS
 */

/**
 * @defgroup GapInit_Constants GapInit Constants
 *
 * Other defines used in the GapInit module
 * @{
 */

/**
 * @defgroup LinkDB_Conn_Handle LinkDB Connection Handle
 * @{
 */
/// Terminates all links
#define LINKDB_CONNHANDLE_ALL                  LL_CONNHANDLE_ALL
/// Loopback connection handle, used to loopback a message
#define LINKDB_CONNHANDLE_LOOPBACK             LL_CONNHANDLE_LOOPBACK
/// Invalid connection handle, used for no connection handle
#define LINKDB_CONNHANDLE_INVALID              LL_CONNHANDLE_INVALID
/** @} End LinkDB_Conn_Handle */

/**
 * @defgroup LinkDB_States LinkDB Connection State Flags
 * @{
 */
#define LINK_NOT_CONNECTED              0x00    //!< Link isn't connected
#define LINK_CONNECTED                  0x01    //!< Link is connected
#define LINK_AUTHENTICATED              0x02    //!< Link is authenticated
#define LINK_BOUND                      0x04    //!< Link is bonded
#define LINK_ENCRYPTED                  0x10    //!< Link is encrypted
#define LINK_SECURE_CONNECTIONS         0x20    //!< Link uses Secure Connections
#define LINK_IN_UPDATE                  0x40    //!< Link is in update procedure
#define LINK_PAIR_TIMEOUT               0x80    //!< Pairing attempt has been timed out
/** @} End LinkDB_States  */

/**
 * @defgroup LinkdDB_AuthErrors Link Authentication Errors
 * @{
 */
#define LINKDB_ERR_INSUFFICIENT_AUTHEN      0x05  //!< Link isn't even encrypted
#define LINBDB_ERR_INSUFFICIENT_KEYSIZE     0x0c  //!< Link is encrypted but the key size is too small
#define LINKDB_ERR_INSUFFICIENT_ENCRYPTION  0x0f  //!< Link is encrypted but it's not authenticated
/** @} End LinkdDB_AuthErrors  */


/** @} End GapInit_Constants */

/*********************************************************************
 * STRUCTURES
 */

/**
 * @defgroup LinkDB_Structures LinkDB Structures
 *
 * Data structures used in the LinkDB module
 * @{
 */

/// Information pertaining to the linklinkDB info
typedef struct
{
  uint8 stateFlags;             //!< @ref LinkDB_States
  uint8 addrType;               //!< Address type of connected device
  uint8 addr[B_ADDR_LEN];       //!< Other Device's address
  uint8 addrPriv[B_ADDR_LEN];   //!< Other Device's Private address
  uint8 connRole;               //!< Connection formed as Master or Slave
  uint16 connInterval;          //!< The connection's interval (n * 1.23 ms)
  uint16 MTU;                   //!< The connection's MTU size
  uint16 connTimeout;           //!< current connection timeout
  uint16 connLatency;           //!< current connection latency
} linkDBInfo_t;

/** @} End LinkDB_Structures  */

/*********************************************************************
 * PUBLIC FUNCTIONS
 */

/**
 * Return the number of active connections
 *
 * @return the number of active connections
 */
extern uint8 linkDB_NumActive( void );

/**
 * Return the maximum number of connections supported.
 *
 * @return the number of connections supported
 */
extern uint8 linkDB_NumConns( void );

/**
 * Get information about a link
 *
 * Copies all of the link information into pInfo.  Uses the connection handle to
 * search the link database.
 *
 * @param connectionHandle controller link connection handle.
 * @param pInfo output parameter to copy the link information
 *
 * @return @ref SUCCESS
 * @return @ref FAILURE connection wasn't found
 */
  extern uint8 linkDB_GetInfo( uint16 connectionHandle, linkDBInfo_t *pInfo );

/**
 * Check to see if a physical link is in a specific state.
 *
 * @param connectionHandle controller link connection handle.
 * @param state @ref LinkDB_States state to look for.
 *
 * @return TRUE if the link is found and state is set in state flags.
 * @return FALSE otherwise.
 */
  extern uint8 linkDB_State( uint16 connectionHandle, uint8 state );

/*********************************************************************
*********************************************************************/

#ifdef __cplusplus
}
#endif

#endif /* LINKDB_H */

/** @} End LinkDB */
