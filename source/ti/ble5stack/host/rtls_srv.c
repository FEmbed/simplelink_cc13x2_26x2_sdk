/******************************************************************************

 @file  rtls_srv.c

 @brief RTLS Services Manager

 Group: WCS, BTS
 Target Device: cc13x2_26x2

 ******************************************************************************
 
 Copyright (c) 2011-2020, Texas Instruments Incorporated
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

/*********************************************************************
 * INCLUDES
 */

#include "rtls_srv_api.h"
#include "rtls_srv_internal.h"
#include "hci.h"
#include "hci_tl.h"

/*********************************************************************
 * CONSTANTS
 */

/*********************************************************************
 * TYPEDEFS
 */

/*********************************************************************
 * GLOBAL VARIABLES
 */

/*********************************************************************
 * EXTERNAL VARIABLES
 */

/*********************************************************************
 * LOCAL VARIABLES
 */

// User Application callback
pfnAppEventHandlerCB_t gAppCB;

// Number of antennas
uint8_t gNumAnt = 0;

// Pin Handle
PIN_Handle gPinHandle = NULL;

// State of extended I/Q evet
rtlsSrv_extIqEvtState_t gExtEvtState = {0};

/*********************************************************************
 * PUBLIC FUNCTIONS
 */

/*********************************************************************
 * @brief
 *
 * Public function defined in rtls_srv_api.h
 */
bStatus_t RTLSSrv_init(uint8_t numOfRTLSConns)
{
  return TRUE;
}

/*********************************************************************
 * @brief Register user callback function with RTLS Services module
 *
 * Public function defined in rtls_srv_api.h
 */
bStatus_t RTLSSrv_register(pfnAppEventHandlerCB_t pCB)
{
  if (pCB != NULL)
  {
    gAppCB = pCB;

    return SUCCESS;
  }
  else
  {
    return FAILURE;
  }
}

/*********************************************************************
 * @brief
 *
 * Public function defined in rtls_srv_api.h
 */
bStatus_t RTLSSrv_setConnCteReceiveParams(uint16_t connHandle,
                                          uint8_t  samplingEnable,
                                          uint8_t  slotDurations,
                                          uint8_t  numAnt,
                                          uint8_t  antArray[])
{
  gNumAnt = numAnt;

  return (HCI_LE_SetConnectionCteReceiveParamsCmd(connHandle,
                                                  samplingEnable,
                                                  slotDurations,
                                                  numAnt,
                                                  antArray));
}

/*********************************************************************
 * @brief
 *
 * Public function defined in rtls_srv_api.h
 */
bStatus_t RTLSSrv_setConnCteRequestEnableCmd(uint16_t connHandle,
                                             uint8_t  enable,
                                             uint16_t interval,
                                             uint8_t  length,
                                             uint8_t  type)
{
  return (HCI_LE_SetConnectionCteRequestEnableCmd(connHandle,
                                                  enable,
                                                  interval,
                                                  length,
                                                  type));
}

/*********************************************************************
 * @brief
 *
 * Public function defined in rtls_srv_api.h
 */
bStatus_t RTLSSrv_setConnCteTransmitParams(uint16_t connHandle,
                                           uint8_t  types,
                                           uint8_t  length,
                                           uint8_t  antArray[])
{
  return (HCI_LE_SetConnectionCteTransmitParamsCmd(connHandle,
                                                   BIT_x(types),
                                                   length,
                                                   antArray));
}

/*********************************************************************
 * @brief
 *
 * Public function defined in rtls_srv_api.h
 */
bStatus_t RTLSSrv_setConnCteResponseEnableCmd(uint16_t connHandle, uint8_t  enable)
{
  return (HCI_LE_SetConnectionCteResponseEnableCmd(connHandle, enable));
}

/*********************************************************************
 * @brief
 *
 * Public function defined in rtls_srv_api.h
 */
bStatus_t RTLSSrv_readAntennaInformationCmd(void)
{
  // Read controller capabilities
  return (HCI_LE_ReadAntennaInformationCmd());
}

/*********************************************************************
 * @brief
 *
 * Public function defined in rtls_srv_api.h
 */
bStatus_t RTLSSrv_setCteSampleAccuracy(uint16_t connHandle,
                                       uint8_t  sampleRate1M,
                                       uint8_t  sampleSize1M,
                                       uint8_t  sampleRate2M,
                                       uint8_t  sampleSize2M,
                                       uint8_t  sampleCtrl)
{
  return (HCI_EXT_SetLocationingAccuracyCmd(connHandle,
                                            sampleRate1M,
                                            sampleSize1M,
                                            sampleRate2M,
                                            sampleSize2M,
                                            sampleCtrl));
}

/*********************************************************************
 * @brief
 *
 * Public function defined in rtls_srv_api.h
 */
PIN_Handle RTLSSrv_initAntArray(uint8_t mainAntenna)
{
  uint32_t enAntMask;
  uint32_t pinCfg;
  PIN_State pinState;
  uint8_t maskCounter = 0;
  uint32_t mainIoEntry;

  // If we already have a handle, just return it
  if (gPinHandle != NULL)
  {
    return gPinHandle;
  }

  pinCfg = PIN_TERMINATE;

  // Check that mainAntenna is one of the antennas configured in the board configuration
  if (mainAntenna > boardConfig.cteAntennaPropPtr->antPropTblSize)
  {
    return NULL;
  }
  else
  {
    mainIoEntry = boardConfig.cteAntennaPropPtr->antPropTbl[mainAntenna];
  }

  // Get antenna mask configured by the user
  enAntMask = boardConfig.cteAntennaPropPtr->antMask;

  // Check if PIN handle already exists
  if (gPinHandle == NULL)
  {
    gPinHandle = PIN_open(&pinState, &pinCfg);
  }

  // Setup pins in Antenna Mask
  while (enAntMask)
  {
    if (enAntMask & 0x1)
    {
      pinCfg = maskCounter | PIN_GPIO_OUTPUT_EN | PIN_GPIO_LOW | PIN_PUSHPULL | PIN_INPUT_DIS | PIN_DRVSTR_MED;

      if (PIN_add(gPinHandle, pinCfg) != PIN_SUCCESS)
      {
        PIN_close(gPinHandle);
        return NULL;
      }
    }

    // Setup main antenna (switch relevant pins to high)
    if (mainIoEntry & 0x1)
    {
      PIN_setOutputValue(gPinHandle, maskCounter, 1);
    }

    maskCounter++;
    enAntMask>>=1;
    mainIoEntry>>=1;
  }

  return gPinHandle;
}

/*********************************************************************
 * LOCAL FUNCTIONS
 */

/*********************************************************************
 * @fn          RTLSSrv_processHciEvent
 *
 * @brief       Process incoming HCI events: translate to RTLS Services event
 *              and dispatch to user registered callback
 *
 * @param       hciEvt - HCI event ID (specified by BT SIG)
 * @param       hciEvtSz - Size of pEvtData
 * @param       pEvtData - Data in the HCI event
 *
 * @return      TRUE if processed and safe to deallocate, FALSE if not processed.
 */
bStatus_t RTLSSrv_processHciEvent(uint16_t hciEvt, uint16_t hciEvtSz, uint8_t *pEvtData)
{
  uint8_t safeToDealloc = TRUE;

  // If the event is empty or the user has not registered a callback, the function fails
  if (pEvtData == NULL || gAppCB == NULL)
  {
    return safeToDealloc;
  }

  // Process the HCI event and report to the application
  switch (hciEvt)
  {
    case HCI_BLE_CONNECTION_IQ_REPORT_EVENT:
    {
      safeToDealloc = RTLSSrv_handleConnIqEvent(pEvtData);
    }
    break;

    case HCI_BLE_EXT_CONNECTION_IQ_REPORT_EVENT:
    {
      safeToDealloc = RTLSSrv_handleExtConnIqEvent(pEvtData);
    }
    break;

    case HCI_BLE_CTE_REQUEST_FAILED_EVENT:
    {
      safeToDealloc = RTLSSrv_handleCteReqFail(pEvtData);
    }
    break;

    case HCI_LE_READ_ANTENNA_INFORMATION:
    {
      safeToDealloc = RTLSSrv_handleReadAntInfo(pEvtData);
    }
    break;

    // We only want to catch these events if they had errors
    // In case of success don't do anything since in the current implementation
    // We are called through GAP which will free pEvtData on it's own
    case HCI_LE_SET_CONNECTION_CTE_RECEIVE_PARAMS:
    case HCI_LE_SET_CONNECTION_CTE_TRANSMIT_PARAMS:
    case HCI_LE_SET_CONNECTION_CTE_REQUEST_ENABLE:
    case HCI_LE_SET_CONNECTION_CTE_RESPONSE_ENABLE:
    {
      if (pEvtData[0] != SUCCESS)
      {
        uint16_t errCause = pEvtData[0];
        uint16_t connHandle = BUILD_UINT16(pEvtData[1], pEvtData[2]);

        // Translate the error to RTLS Services format
        RTLSSrv_handleError(hciEvt, errCause, connHandle);
      }
    }
    break;

    default:
      break;
  }

  return safeToDealloc;
}

/*********************************************************************
 * @fn          RTLSSrv_handleError
 *
 * @brief       Handles errors by translating from HCI format to RTLS Services format
 *              Errors may result from incorrect user usage of API's
 *
 * @param       errSrc - which command/opcode caused the error
 * @param       errCause - what was the actual error
 * @param       connHandle - connection handle on which the error happened
 *
 * @return      TRUE = success, FALSE = failure
 */
bStatus_t RTLSSrv_handleError(uint16_t errSrc, uint16_t errCause, uint16_t connHandle)
{
  rtlsSrv_errorEvt_t *pErrEvt;

  // No point in doing anything if no user callback
  if (gAppCB == NULL)
  {
    return FALSE;
  }

  if ((pErrEvt = (rtlsSrv_errorEvt_t*)RTLSSrv_malloc(sizeof(rtlsSrv_errorEvt_t))) == NULL)
  {
    return FALSE;
  }

  pErrEvt->connHandle = connHandle;

  // @ref RTLSSrv_Commands commands are defined exactly as HCI commands
  // This saves the need to translate to RTLS Services specific opcodes
  pErrEvt->errSrc = errSrc;

  // @ref RTLSSrv_ErrorCodes the codes are defined exactly as HCI error codes
  pErrEvt->errCause = errCause;

  // Send the error event to the application
  return (RTLSSrv_callAppCb(RTLSSRV_ERROR_EVT, sizeof(rtlsSrv_errorEvt_t), (uint8 *)pErrEvt));
}

/*********************************************************************
 * @fn          RTLSSrv_callAppCb
 *
 * @brief       Allocate and send a message to the application
 *
 * @param       evtType - opcode of the event
 * @param       evtSize - size of evtData
 * @param       evtData - actual information to pass
 *
 * @return      TRUE = success, FALSE = failure
 */
bStatus_t RTLSSrv_callAppCb(uint8_t evtType, uint16_t evtSize, uint8_t *pEvtData)
{
  rtlsSrv_evt_t *pEvt;

  // No point in doing anything if no user callback
  if (gAppCB == NULL)
  {
    return FALSE;
  }

  // Allocate the event - will be freed by the user application
  if ((pEvt = (rtlsSrv_evt_t *)RTLSSrv_malloc(sizeof(rtlsSrv_evt_t))) == NULL)
  {
    return FALSE;
  }

  // Load event info
  pEvt->evtType = evtType;
  pEvt->evtSize = evtSize;
  pEvt->evtData = pEvtData;

  // Call user registered callback
  gAppCB(pEvt);

  return TRUE;
}

/*********************************************************************
 * @fn          RTLSSrv_handleConnIqEvent
 *
 * @brief       Handle a Connection IQ Event sent by HCI
 *
 * @param       evtData - actual information to pass
 *
 * @return      TRUE if processed and safe to deallocate, FALSE if not processed.
 */
bStatus_t RTLSSrv_handleConnIqEvent(uint8_t *pEvtData)
{
  uint8 safeToDealloc = TRUE;
  rtlsSrv_connectionIQReport_t *pRtlsEvt;
  hciEvt_BLECteConnectionIqReport_t *pHciEvt = (hciEvt_BLECteConnectionIqReport_t *)pEvtData;
  uint8_t status = FALSE;

  if ((pRtlsEvt = (rtlsSrv_connectionIQReport_t *)RTLSSrv_malloc(sizeof(rtlsSrv_connectionIQReport_t))) == NULL)
  {
    // We could not allocate, return that we failed
    return safeToDealloc;
  }

  if ((pRtlsEvt->iqSamples = (int8_t *)RTLSSrv_malloc(pHciEvt->sampleCount*2)) == NULL)
  {
    // We could not allocate, return that we failed and free previously allocated data
    RTLSSrv_free(pRtlsEvt);

    return safeToDealloc;
  }

  // Make the conversion from HCI event to RTLS Services event
  pRtlsEvt->connEvent    = pHciEvt->connEvent;
  pRtlsEvt->connHandle   = pHciEvt->connHandle;
  pRtlsEvt->cteType      = pHciEvt->cteType;
  pRtlsEvt->dataChIndex  = pHciEvt->dataChIndex;
  pRtlsEvt->phy          = pHciEvt->phy;
  pRtlsEvt->rssi         = pHciEvt->rssi;
  pRtlsEvt->rssiAntenna  = pHciEvt->rssiAntenna;
  pRtlsEvt->sampleCount  = pHciEvt->sampleCount;
  pRtlsEvt->sampleCtrl   = RTLSSRV_CTE_SAMPLE_CONTROL_RF_DEFAULT_FILTERING;
  pRtlsEvt->slotDuration = pHciEvt->slotDuration;
  pRtlsEvt->status       = pHciEvt->status;

  // Copy samples
  memcpy(pRtlsEvt->iqSamples, pHciEvt->iqSamples, pHciEvt->sampleCount*2);

  // Number of antennas is kept internally by RTLS Services
  pRtlsEvt->numAnt       = gNumAnt;

  // Sample rate and size are default when receiving the default HCI_BLE_CONNECTION_IQ_REPORT_EVENT
  pRtlsEvt->sampleRate   = RTLSSRV_CTE_SAMPLE_RATE_1MHZ;
  pRtlsEvt->sampleSize   = RTLSSRV_CTE_SAMPLE_SIZE_8BITS;

  // Send event to user registered callback
  status = RTLSSrv_callAppCb(RTLSSRV_CONNECTION_CTE_IQ_REPORT_EVT, sizeof(rtlsSrv_connectionIQReport_t), (uint8_t *)pRtlsEvt);
  if (status == FALSE)
  {
    // We could not allocate, return that we failed and free previously allocated data
    RTLSSrv_free(pRtlsEvt->iqSamples);
    RTLSSrv_free(pRtlsEvt);
  }

  return safeToDealloc;
}

/*********************************************************************
 * @fn          RTLSSrv_handleExtConnIqEvent
 *
 * @brief       Handle an Extended Connection IQ Event sent by HCI
 *
 * @param       evtData - actual information to pass
 *
 * @return      TRUE if processed and safe to deallocate, FALSE if not processed.
 */
bStatus_t RTLSSrv_handleExtConnIqEvent(uint8_t *pEvtData)
{
  uint8 safeToDealloc = TRUE;
  hciEvt_BLEExtCteConnectionIqReport_t *pHciEvt = (hciEvt_BLEExtCteConnectionIqReport_t *)pEvtData;
  uint8_t status = FALSE;
  uint16_t offset;

  // If the event has not started yet
  if (gExtEvtState.evtStarted == FALSE)
  {
    // Session must starts with event index 0
    if (pHciEvt->eventIndex != 0)
    {
      return safeToDealloc;
    }
    gExtEvtState.evtIndex = pHciEvt->eventIndex;

    // Mark that the event has started
    gExtEvtState.evtStarted = TRUE;

    // Set expected data size
    gExtEvtState.remainingDataSize = pHciEvt->totalDataLen;

    // Allocate memory for the event
    if ((gExtEvtState.pTmpExtIqEvt = (rtlsSrv_connectionIQReport_t *)RTLSSrv_malloc(sizeof(rtlsSrv_connectionIQReport_t))) == NULL)
    {
      // We could not allocate, return that we failed
      return safeToDealloc;
    }

    // Allocate memory for IQ samples
    if ((gExtEvtState.pTmpExtIqEvt->iqSamples = (int8_t *)RTLSSrv_malloc(pHciEvt->totalDataLen*2)) == NULL)
    {
      // We could not allocate, return that we failed and free previously allocated data
      RTLSSrv_free(gExtEvtState.pTmpExtIqEvt);

      return safeToDealloc;
    }

    // Make the conversion from HCI event to RTLS Services event
    gExtEvtState.pTmpExtIqEvt->connEvent    = pHciEvt->connEvent;
    gExtEvtState.pTmpExtIqEvt->connHandle   = pHciEvt->connHandle;
    gExtEvtState.pTmpExtIqEvt->cteType      = pHciEvt->cteType;
    gExtEvtState.pTmpExtIqEvt->dataChIndex  = pHciEvt->dataChIndex;
    gExtEvtState.pTmpExtIqEvt->phy          = pHciEvt->phy;
    gExtEvtState.pTmpExtIqEvt->rssi         = pHciEvt->rssi;
    gExtEvtState.pTmpExtIqEvt->rssiAntenna  = pHciEvt->rssiAntenna;
    gExtEvtState.pTmpExtIqEvt->slotDuration = pHciEvt->slotDuration;
    gExtEvtState.pTmpExtIqEvt->status       = pHciEvt->status;

    // Sample Rate and size given by HCI EXT IQ event
    gExtEvtState.pTmpExtIqEvt->sampleRate   = pHciEvt->sampleRate;
    gExtEvtState.pTmpExtIqEvt->sampleSize   = pHciEvt->sampleSize;
    gExtEvtState.pTmpExtIqEvt->sampleCtrl   = pHciEvt->sampleCtrl;

    // Number of antennas is kept internally by RTLS Services
    gExtEvtState.pTmpExtIqEvt->numAnt       = gNumAnt;

    // Set sample count to be totalDataLen (true when each sample is 8 bit)
    gExtEvtState.pTmpExtIqEvt->sampleCount  = pHciEvt->totalDataLen;

    // Adjust amount of samples in case sample size is 16 bit
    if (gExtEvtState.pTmpExtIqEvt->sampleSize == RTLSSRV_CTE_SAMPLE_SIZE_16BITS)
    {
      gExtEvtState.pTmpExtIqEvt->sampleCount /= 2;
    }
  }
  else // already started
  {
    // already started, check consecutive event index
    if (pHciEvt->eventIndex != (gExtEvtState.evtIndex + 1))
    {
      // Ignore this session
      gExtEvtState.evtStarted = FALSE;
      gExtEvtState.evtIndex = 0;

      // Free all session allocations
      RTLSSrv_free(gExtEvtState.pTmpExtIqEvt->iqSamples);
      RTLSSrv_free(gExtEvtState.pTmpExtIqEvt);

      return safeToDealloc;
    }

    gExtEvtState.evtIndex = pHciEvt->eventIndex;
  }
  // Set the offset in the assembled packet
  // We know that HCI will send packets as large as HCI_CTE_MAX_SAMPLES_PER_EVENT
  // Only the last packet may differ in size - we don't care about that either, it will just be placed last (indices start from 0)
  offset = pHciEvt->eventIndex * HCI_CTE_MAX_SAMPLES_PER_EVENT * 2;

  // Copy samples
  memcpy(gExtEvtState.pTmpExtIqEvt->iqSamples + offset, pHciEvt->iqSamples, pHciEvt->dataLen*2);

  // Count how many samples we have remaining
  gExtEvtState.remainingDataSize -= pHciEvt->dataLen;

  // If no more samples remaining
  if (gExtEvtState.remainingDataSize == 0)
  {
    // Send event to user registered callback
    status = RTLSSrv_callAppCb(RTLSSRV_CONNECTION_CTE_IQ_REPORT_EVT, sizeof(rtlsSrv_connectionIQReport_t), (uint8_t *)gExtEvtState.pTmpExtIqEvt);
    if (status == FALSE)
    {
      // Free all session allocations
      RTLSSrv_free(gExtEvtState.pTmpExtIqEvt->iqSamples);
      RTLSSrv_free(gExtEvtState.pTmpExtIqEvt);
    }

    // Mark that the event has ended and data was sent to the user
    gExtEvtState.evtStarted = FALSE;
    gExtEvtState.evtIndex = 0;
  }

  return safeToDealloc;
}

/*********************************************************************
 * @fn          RTLSSrv_handleCteReqFail
 *
 * @brief       Handle a failed CTE request
 *
 * @param       pEvtData - actual information to pass
 *
 * @return      TRUE if processed and safe to deallocate, FALSE if not processed.
 */
bStatus_t RTLSSrv_handleCteReqFail(uint8_t *pEvtData)
{
  uint8 safeToDealloc = TRUE;
  uint8_t status = FALSE;
  rtlsSrv_cteReqFailed_t *pRtlsEvt;
  hciEvt_BLECteRequestFailed_t *pHciEvt = (hciEvt_BLECteRequestFailed_t *)pEvtData;

  if ((pRtlsEvt = (rtlsSrv_cteReqFailed_t *)RTLSSrv_malloc(sizeof(rtlsSrv_cteReqFailed_t))) == NULL)
  {
    // We could not allocate, return that we failed
    return safeToDealloc;
  }

  // Make the conversion from HCI event to RTLS Services event
  pRtlsEvt->connHandle = pHciEvt->connHandle;
  pRtlsEvt->status = pHciEvt->status;

  // Send event to user registered callback
  status = RTLSSrv_callAppCb(RTLSSRV_CTE_REQUEST_FAILED_EVT, sizeof(rtlsSrv_cteReqFailed_t), (uint8_t *)pRtlsEvt);
  if (status == FALSE)
  {
    // Free all session allocations
    RTLSSrv_free(pRtlsEvt);
  }

  return safeToDealloc;
}

/*********************************************************************
 * @fn          RTLSSrv_handReadAntInfo
 *
 * @brief       Handle read antenna info event
 *
 * @param       pEvtData - actual information to pass
 *
 * @return      TRUE if processed and safe to deallocate, FALSE if not processed.
 */
bStatus_t RTLSSrv_handleReadAntInfo(uint8_t *pEvtData)
{
  uint8 safeToDealloc = TRUE;
  uint8_t status = FALSE;

  // The spec defines the following structure:
  // antennaInfo[0]: status
  // antennaInfo[1]: sampleRates
  // antennaInfo[2]: maxNumOfAntennas
  // antennaInfo[3]: maxSwitchPatternLen
  // antennaInfo[4]: maxCteLen
  // This event cannot fail, we just want to see that there is no garbage here
  if (pEvtData[0] == SUCCESS)
  {
    rtlsSrv_antennaInfo_t *pRtlsEvt;

    if ((pRtlsEvt = (rtlsSrv_antennaInfo_t *)RTLSSrv_malloc(sizeof(rtlsSrv_antennaInfo_t))) == NULL)
    {
      // We could not allocate, return that we failed
      return safeToDealloc;
    }

    // Make the conversion from HCI command complete to RTLS Services event
    pRtlsEvt->sampleRates = pEvtData[1];
    pRtlsEvt->maxNumOfAntennas = pEvtData[2];
    pRtlsEvt->maxSwitchPatternLen = pEvtData[3];
    pRtlsEvt->maxCteLen = pEvtData[4];

    // Send event to user registered callback
    status = RTLSSrv_callAppCb(RTLSSRV_ANTENNA_INFORMATION_EVT, sizeof(rtlsSrv_antennaInfo_t), (uint8_t *)pRtlsEvt);
    if (status == FALSE)
    {
      // Free all session allocations
      RTLSSrv_free(pRtlsEvt);
    }
  }

  return safeToDealloc;
}
