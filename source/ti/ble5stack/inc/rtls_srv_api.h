/******************************************************************************

 @file  rtls_srv_api.h

 @brief This file implements the RTLS Services APIs
 Group: WCS, BTS
 Target Device: cc13x2_26x2

 ******************************************************************************
 
 Copyright (c) 2018-2020, Texas Instruments Incorporated
 All rights reserved.

 Redistribution and use in source and binary forms, with or without
 modification, are permitted provided that the following conditions
 are met:

 *  Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.

 *  Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.

 *  Neither the name of Texas Instruments Incorporated nor the names of
    its contributors may be used to endorse or promote products derived
    from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

 ******************************************************************************
 
 
 *****************************************************************************/

/**
 *  @defgroup RTLSSrv RTLSSrv
 *  @brief  This module implements the RTLS Services APIs
 *
 *  @{
 *  @file  rtls_srv_api.h
 *  @brief      RTLS Services
 */

#ifndef RTLSSRVAPI_H
#define RTLSSRVAPI_H

#ifdef __cplusplus
extern "C"
{
#endif

/*-------------------------------------------------------------------
 * INCLUDES
 */

#include "bcomdef.h"
#include <ti/drivers/PIN.h>
#include "ble_user_config.h"
#include "ll.h"

/*-------------------------------------------------------------------
 * CONSTANTS
 */

/**
 * @defgroup RTLSSrv_Constants RTLS Services constants
 *
 * Used to configure RTLS
 * RTLSSrv_setConnectionCteReceiveParams
 * RTLSSrv_setConnectionCteTransmitParams
 *
 * @{
 */

/// @brief CTE Sampling state
#define RTLSSRV_CTE_SAMPLING_NOT_INIT                   LL_CTE_SAMPLING_NOT_INIT       //!< Not Initiated
#define RTLSSRV_CTE_SAMPLING_ENABLE                     LL_CTE_SAMPLING_ENABLE         //!< Enabled
#define RTLSSRV_CTE_SAMPLING_DISABLE                    LL_CTE_SAMPLING_DISABLE        //!< Disabled

/// @brief CTE sample slot type
#define RTLSSRV_CTE_SAMPLE_SLOT_1US                     LL_CTE_SAMPLE_SLOT_1US         //!< 1 &mu;sec
#define RTLSSRV_CTE_SAMPLE_SLOT_2US                     LL_CTE_SAMPLE_SLOT_2US         //!< 2 &mu;sec

/// @brief CTE supported modes, only AoA at this point
#define RTLSSRV_CTE_SAMPLE_RATE_1US_AOD_TX              LL_CTE_SAMPLE_RATE_1US_AOD_TX  //!< Angle of Departure TX
#define RTLSSRV_CTE_SAMPLE_RATE_1US_AOD_RX              LL_CTE_SAMPLE_RATE_1US_AOD_RX  //!< Angle of Departure RX
#define RTLSSRV_CTE_SAMPLE_RATE_1US_AOA_RX              LL_CTE_SAMPLE_RATE_1US_AOA_RX  //!< Angle of Arrival RX

/// @brief CTE types
#define RTLSSRV_CTE_TYPE_AOA                            LL_CTE_TYPE_AOA            //!< Angle of Arrival

/// @brief CTE Sample Rates
#define RTLSSRV_CTE_SAMPLE_RATE_1MHZ                    CTE_SAMPLING_CONFIG_1MHZ   //!< 1 MHz
#define RTLSSRV_CTE_SAMPLE_RATE_2MHZ                    CTE_SAMPLING_CONFIG_2MHZ   //!< 2 MHz
#define RTLSSRV_CTE_SAMPLE_RATE_3MHZ                    CTE_SAMPLING_CONFIG_3MHZ   //!< 3 MHz
#define RTLSSRV_CTE_SAMPLE_RATE_4MHZ                    CTE_SAMPLING_CONFIG_4MHZ   //!< 4 MHz

/// @brief CTE Sample Size
#define RTLSSRV_CTE_SAMPLE_SIZE_8BITS                   LL_CTE_SAMPLE_SIZE_8BITS   //!< 8 bit
#define RTLSSRV_CTE_SAMPLE_SIZE_16BITS                  LL_CTE_SAMPLE_SIZE_16BITS  //!< 16 bit

/// @brief CTE Sample Control
#define RTLSSRV_CTE_SAMPLE_CONTROL_RF_DEFAULT_FILTERING CTE_SAMPLING_CONTROL_DEFAULT_FILTERING
#define RTLSSRV_CTE_SAMPLE_CONTROL_RF_RAW_NO_FILTERING  CTE_SAMPLING_CONTROL_RF_RAW_NO_FILTERING

/** @} End RTLSSrv_Constants */

/**
 * @defgroup RTLSSrv_Events RTLS Services event types
 *
 * Event types are used to parse various messages produced by RTLS Services
 * Events are passed using @ref RTLSSrv_CBs
 *
 * @{
 */

/**
 * CTE I/Q report is received
 * Used to identify @ref rtlsSrv_connectionIQReport_t
 */
#define RTLSSRV_CONNECTION_CTE_IQ_REPORT_EVT            1

/**
 * Antenna information event is received
 * Used to identify @ref rtlsSrv_antennaInfo_t
 */
#define RTLSSRV_ANTENNA_INFORMATION_EVT                 2

/**
 * Generated when a CTE request fails
 */
#define RTLSSRV_CTE_REQUEST_FAILED_EVT                  3

/**
 * Generated when an async error occurs
 */
#define RTLSSRV_ERROR_EVT                               4

/** @} End RTLSSrv_Events */


/**
 * @defgroup RTLSSrv_ErrorCodes RTLS Services error codes
 *
 * Error codes used to parse @ref RTLSSRV_ERROR_EVT
 * Errors produced by HCI are mapped to their respective HCI Error values
 *
 * @{
 */

#define RTLSSRV_CONN_HANDLE_INVALID              0x02             //!< Invalid Handle
#define RTLSSRV_OUT_OF_MEMORY                    0x07             //!< Out of Memory
#define RTLSSRV_COMMAND_DISALLOWED               0x0C             //!< Disallowed Command
#define RTLSSRV_FEATURE_NOT_SUPPORTED            0x11             //!< Unsupported Feature
#define RTLSSRV_REMOTE_FEATURE_NOT_SUPPORTED     0x1A             //!< Unsupported Remote Feature


/** @} End RTLSSrv_ErrorCodes */

/**
 * @defgroup RTLSSrv_Commands RTLS Services Commands
 *
 * Defines for commands that can return errors
 *
 * @{
 */

#define RTLSSRV_SET_CONNECTION_CTE_RECEIVE_PARAMS    0x2054             //!< Receive Parameters
#define RTLSSRV_SET_CONNECTION_CTE_TRANSMIT_PARAMS   0x2055             //!< Transmit Parameters
#define RTLSSRV_SET_CONNECTION_CTE_REQUEST_ENABLE    0x2056             //!< Enable Request
#define RTLSSRV_SET_CONNECTION_CTE_RESPONSE_ENABLE   0x2057             //!< Enable Response

/** @} End RTLSSrv_Commands */

/*-------------------------------------------------------------------
 * TYPEDEFS
 */


/**
 * @defgroup RTLSSrv_Structs RTLS Services Structures
 * @{
 */

/// @brief CTE Connection IQ Report Event @ref RTLSSRV_CONNECTION_CTE_IQ_REPORT_EVT
typedef struct
{
  uint16_t connHandle;              //!< connection handle
  uint8_t  phy;                     //!< current phy
  uint8_t  dataChIndex;             //!< index of data channel
  uint16_t rssi;                    //!< current rssi
  uint8_t  rssiAntenna;             //!< antenna ID
  uint8_t  cteType;                 //!< cte type
  uint8_t  slotDuration;            //!< sampling slot 1us or 2us
  uint8_t  status;                  //!< packet status (success or CRC error)
  uint16_t connEvent;               //!< connection event
  uint16_t sampleCount;             //!< number of samples
  uint8_t  sampleRate;              //!< sample rate of frontend: 1Mhz, 2Mhz, 3Mhz, 4Mhz
  uint8_t  sampleSize;              //!< sample size: 8 or 16 bit samples
  uint8_t  sampleCtrl;              //!< default filtering or RAW_RF
  uint8_t  numAnt;                  //!< number of antennas we are using
  int8_t   *iqSamples;              //!< list of IQ samples, format is [i,q,i,q,i,q....]
} rtlsSrv_connectionIQReport_t;

/// @brief LE CTE Antenna Information Event @ref RTLSSRV_ANTENNA_INFORMATION_EVT
typedef struct
{
  uint8_t sampleRates;              //!< sample rates supported by the controller
  uint8_t maxNumOfAntennas;         //!< maximum number of antennas supported by the controller
  uint8_t maxSwitchPatternLen;      //!< maximum size of switch pattern supported by the controller
  uint8_t maxCteLen;                //!< maximum cte length supported by the controller
} rtlsSrv_antennaInfo_t;

/// @brief LE CTE Request Failed Event @ref RTLSSRV_CTE_REQUEST_FAILED_EVT
typedef struct
{
  uint8_t status;                   //!< status
  uint16_t connHandle;              //!< connection handle
} rtlsSrv_cteReqFailed_t;

/// @brief RTLS Services error structure @ref RTLSSRV_ERROR_EVT
typedef struct
{
  uint16_t connHandle;              //!< connection handle
  uint16_t errSrc;                  //!< the command that caused the error
  uint16_t errCause;                //!< subEvt @ref RTLSSrv_ErrorCodes
} rtlsSrv_errorEvt_t;

/** @} End RTLSSrv_Structs */

/**
 * @defgroup RTLSSrv_CBs RTLS Services callbacks
 * @{
 * These are functions whose pointers are passed from the application
 * to the RTLSSrv module. The module will call the callbacks when the corresponding events
 * are sent via HCI
 */

/// @brief RTLS Services passes messages in this format
typedef struct
{
  uint8_t   evtType;              //!< Type
  uint16_t  evtSize;              //!< Size
  uint8_t   *evtData;             //!< Pointer to Event Data
} rtlsSrv_evt_t;

/**
 * RTLSSrv Callback Structure
 *
 * This must be setup by the application and passed to the RTLSSrv when RTLSSrv_Register is called
 *
 * @param evtType - is used to parse the event according to @ref RTLSSrv_Events
 * @param evtSize - size of evtData
 * @param evtData - pointer to event data structure @ref RTLSSrv_Structs
 */
typedef void (*pfnAppEventHandlerCB_t)(rtlsSrv_evt_t *pEvt);

/** @} End RTLSSrv_CBs */


/*-------------------------------------------------------------------
 * API's
 */

/**
 * Initialize RTLSSrv module
 *
 * @param numOfRTLSConns - number of connections that RTLS Srv is required to support
 *
 * @return SUCCESS/FAILURE
 */
extern bStatus_t RTLSSrv_init(uint8_t numOfRTLSConns);

/**
 * Register callback functions with RTLS Services
 *
 * @param pCB pointer to callback function structure
 *
 * @return SUCCESS/FAILURE
 */
extern bStatus_t RTLSSrv_register(pfnAppEventHandlerCB_t pCB);

/**
 * Note: RTLSSrv_initAntArray must be called before calling this functions
 *       In order to not limit users GPIO configuration, it is the users responsibility
 *       to either call RTLSSrv_initAntArray or to initialize GPIO's in another manner
 *
 * Used to:
 * 1. Enable or disable sampling received Constant Tone Extension fields on a connection
 * 2. Configure the antenna switching pattern
 * 3. Configure switching and sampling slot durations to be used
 *
 * @param connHandle - Connection handle
 * @param samplingEnable - Sample CTE on a connection and report the samples to the User Application (0 or 1)
 * @param slotDurations - Switching and sampling slots in 1 &mu;s or 2 &mu;s each (1 or 2)
 * @param numAnt - The number of Antenna IDs in the pattern (2 to 75)
 * @param antArray - List of Antenna IDs in the pattern
 *
 * @return bStatus_t - command was acked, async return status in case of an error provided by RTLS_ERROR_EVT
 */
extern bStatus_t RTLSSrv_setConnCteReceiveParams(uint16_t connHandle,
                                                 uint8_t  samplingEnable,
                                                 uint8_t  slotDurations,
                                                 uint8_t  numAnt,
                                                 uint8_t  antArray[]);

/**
 * Used to:
 * 1. Set the antenna switching pattern
 * 2. Set permitted Constant Tone Extension types used for transmitting
 *    Constant Tone Extensions requested by the peer device on a connection
 *
 * @param connHandle - Connection handle
 * @param types - CTE types (0 - Allow AoA CTE Response)
 * @param length - The number of Antenna IDs in the pattern (2 to 75)
 * @param antArray - List of Antenna IDs in the pattern
 *
 * @return bStatus_t - command was acked, async return status in case of an error provided by RTLS_ERROR_EVT
*/
extern bStatus_t RTLSSrv_setConnCteTransmitParams(uint16_t connHandle,
                                                  uint8_t  types,
                                                  uint8_t  length,
                                                  uint8_t  antArray[]);

/**
 * Start or stop initiating the CTE Request procedure on a connection
 * Note that the API enables periodically requesting CTE by using the 'interval' parameter
 *
 * @param connHandle - Connection handle
 * @param enable - Enable or disable CTE Request for a connection (1 or 0)
 * @param interval - Requested interval for initiating the CTE Request procedure in number of connection events (1 to 0xFFFF)
 * @param length - Min length of the CTE being requested in 8 &mu;s units (2 to 20)
 * @param type - Requested CTE type (0 - AoA, 1 - AoD with 1&mu;s slots, 2 - AoD with 2&mu;s slots)
 *
 * @return bStatus_t - command was acked, async return status in case of an error provided by RTLS_ERROR_EVT
*/
extern bStatus_t RTLSSrv_setConnCteRequestEnableCmd(uint16_t connHandle,
                                                    uint8_t  enable,
                                                    uint16_t interval,
                                                    uint8_t  length,
                                                    uint8_t  type);

/**
 * Enable responding to CTE requests
 *
 * @param connHandle - Connection handle
 * @param enable - Enable or disable CTE Response for a connection (1 or 0)
 *
 * @return bStatus_t - command was acked, async return status in case of an error provided by RTLS_ERROR_EVT
*/
extern bStatus_t RTLSSrv_setConnCteResponseEnableCmd(uint16_t connHandle,
                                                     uint8_t  enable);

/**
 * Read Antenna information
 *
 * @return bStatus_t - command was acked, async return status in case of an error provided by @ref RTLSSRV_ANTENNA_INFORMATION_EVT
*/
extern bStatus_t RTLSSrv_readAntennaInformationCmd(void);

/**
 * Set CTE sampling accuracy
 *
 * @param connHandle Connection handle.
 * @param sampleRate1M sample rate for PHY 1M
 *        range : 1 - least accuracy (as in 5.1 spec) to 4 - most accuracy
 * @param sampleSize1M sample size for PHY 1M
 *        range : 1 - 8 bits (as in 5.1 spec) or 2 - 16 bits (more accurate)
 * @param sampleRate2M sample rate for PHY 2M
 *        range : 1 - least accuracy (as in 5.1 spec) to 4 - most accuracy
 * @param sampleSize2M sample size for PHY 2M
 *        range : 1 - 8 bits (as in 5.1 spec) or 2 - 16 bits (more accurate)
 * @param sampleCtrl - sample control flags
 *        range : range : bit0=0 - Default filtering, bit0=1 - RAW_RF(no filtering), , bit1..7=0 - spare
 *
 * @return bStatus_t - command was acked, async return status in case of an error provided by RTLS_ERROR_EVT
*/
extern bStatus_t RTLSSrv_setCteSampleAccuracy(uint16_t connHandle,
                                              uint8_t  sampleRate1M,
                                              uint8_t  sampleSize1M,
                                              uint8_t  sampleRate2M,
                                              uint8_t  sampleSize2M,
                                              uint8_t  sampleCtrl);
/**
 * Initialize antenna array
 * To initialize a single pin, use array of length 1
 *
 * @param mainAntenna - Antenna ID to be used as main receiving antenna
 *
 * @return PIN_Handle - handle for initialized pins
 */
extern PIN_Handle RTLSSrv_initAntArray(uint8_t mainAntenna);

/**
 * RTLSSrv_processHciEvent
 *
 * This is the HCI event handler for RTLSSrv module
 * Any HCI event related to RTLS should pass through this API
 *
 * @param hciEvt - is used to parse the event according to @ref RTLSSrv_Events
 * @param hciEvtSz - size of evtData
 * @param pEvtData - pointer to event data structure @ref RTLSSrv_Structs
 *
 * @return      TRUE = success, FALSE = failure
 */
extern bStatus_t RTLSSrv_processHciEvent(uint16_t hciEvt, uint16_t hciEvtSz, uint8_t *pEvtData);

#ifdef __cplusplus
}
#endif

#endif /* RTLSSRVAPI_H */

/** @} End RTLSSrv */
