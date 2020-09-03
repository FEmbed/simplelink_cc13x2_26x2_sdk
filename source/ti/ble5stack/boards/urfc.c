/******************************************************************************

 @file  urfc.c

 @brief User configurable variables for the Micro BLE Stack Radio.

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

/******************************************************************************
 * INCLUDES
 */

#include "urfc.h"
#include <ti_drivers_config.h>

/******************************************************************************
 * MACROS
 */

/******************************************************************************
 * CONSTANTS
 */

// Tx Power
#define UB_NUM_TX_POWER_VALUE (sizeof(ubTxPowerVal) / sizeof(ubTxPowerVal_t))

// Default Tx Power Index
#if defined(CC13X2P)
#define DEFAULT_TX_POWER               9
#else // !CC13X2
#define DEFAULT_TX_POWER               7
#endif // CC13X2

/******************************************************************************
 * TYPEDEFS
 */

/******************************************************************************
 * LOCAL VARIABLES
 */

/******************************************************************************
 * GLOBAL VARIABLES
 */

/* RF patch function pointers */
const RF_Mode ubRfMode =
{
  .rfMode      = RF_MODE_BLE,
#if defined(CC26XX_R2) || defined(CC26X2)
  .cpePatchFxn = rf_patch_cpe_multi_protocol_rtls,
  .mcePatchFxn = 0,
  .rfePatchFxn = 0,
#else /* !CC26XX_R2 */
  .cpePatchFxn = &rf_patch_cpe_ble,
  .mcePatchFxn = 0,
  .rfePatchFxn = &rf_patch_rfe_ble,
#endif /* CC26XX_R2 */
};

// RF Override Registers
// Note: Used with CMD_RADIO_SETUP; called at boot time and after wake.
// Note: Must be in RAM as these overrides may need to be modified at runtime
//       based on temperature compensation, although it is possible this may
//       be automated in CM0 in PG2.0.
#if defined(CC26XX)
  // CC26xx Normal Package with Flash Settings for 48 MHz device
  #if defined(CC26X2)

  #define  CTE_GENERIC_RX_ENABLE        (1)
  #define  CTE_USE_RFE_RAM              (4)
  #define  CTE_FLOW_CONTROL             (6)

  // Supported CTE for generic Rx and allow using RFE Ram for sampling
  #define CTECONFIG ((1 << CTE_GENERIC_RX_ENABLE) | (1 << CTE_USE_RFE_RAM) | 1 << CTE_FLOW_CONTROL)
  // 4 us before start of sampling
  #define CTEOFFSET (4)
  // 4 MHz sampling rate on 1 Mbps packets
  #define CTE_SAMPLING_CONFIG (4)

  #define NUM_ENTRIES  3
  #define SWITCH_TIME  2

  #define ANT1         (1<<28)
  #define ANT2         (1<<29)
  #define ANT3         (1<<30)
  #define IO_MASK      (ANT1 | ANT2 | ANT3)

  uint32_t antSwitching[] =
  {
    NUM_ENTRIES | (SWITCH_TIME << 8),
    IO_MASK,
    ANT1,
    ANT2,
    ANT3
  };

  regOverride_t pOverridesCommon[] = {
    0x00158000, // S2RCFG: Capture S2R from FrontEnd, on event (CM0 will arm)
    0x000E51D0, // After FRAC
    ((CTECONFIG << 16) | 0x8BB3), // Enable CTE capture
    ((CTEOFFSET << 24) | ((CTE_SAMPLING_CONFIG | (CTE_SAMPLING_CONFIG << 4)) << 16) | 0x0BC3), // Sampling rate, offset
    0xC0040341, // Pointer to antenna switching table in next entry
    (uint32_t) antSwitching, // Pointer to antenna switching table
     END_OVERRIDE };

   regOverride_t pOverrides1Mbps[] = {
     END_OVERRIDE };

   #if defined(BLE_V50_FEATURES) && (BLE_V50_FEATURES & (PHY_2MBPS_CFG | PHY_LR_CFG))
   regOverride_t pOverrides2Mbps[] = {
     END_OVERRIDE };

   regOverride_t pOverridesCoded[] = {
     END_OVERRIDE };
   #endif // PHY_2MBPS_CFG | PHY_LR_CFG

  #else // unknown device package
    #error "***BLE USER CONFIG BUILD ERROR*** Unknown package type!"
  #endif // <board>

#elif defined(USE_FPGA)
  regOverride_t pOverridesCommon[] = {
  #if defined(CC26X2)
    // CC2642, as update by Helge on 12/12/17: Common Overrides for BLE5
    0x000151D0,
    0x00041110,
    0x00000083,
    0x00800403,
    0x80000303,
    0x02980243,
    0x01080263,
    0x08E90AA3,
    0x00068BA3,
    0x0E490C83,
    0x00005100, // Update matched filter for wired input
    0x721C5104, // Update matched filter for wired input
    0x00725108, // Update matched filter for wired input
    0x48f450d4, // Update matched filter gain for wired input
    END_OVERRIDE };
  #endif // CC26X2

  regOverride_t pOverrides1Mbps[] = {
    0x02405320,
    0x010302A3,
    END_OVERRIDE };

  #if defined(BLE_V50_FEATURES) && (BLE_V50_FEATURES & (PHY_2MBPS_CFG | PHY_LR_CFG))
  regOverride_t pOverrides2Mbps[] = {
    0x02405320,
    0x00B502A3,
    END_OVERRIDE };

  regOverride_t pOverridesCoded[] = {
    0x01013487,
    0x02405320,
    0x069802A3,
    END_OVERRIDE };
  #endif // PHY_2MBPS_CFG | PHY_LR_CFG

  #if defined(CC13X2P)
  // high gain PA overrides
  regOverride_t pOverridesTx20[] = {
    TX20_POWER_OVERRIDE(0x1234),
    0x01C20703, // Function of loDivider, frontEnd, and PA (High)
    END_OVERRIDE };

  // default PA overrides
  regOverride_t pOverridesTxStd[] = {
    TX_STD_POWER_OVERRIDE(0x1234),
    0x05320703, // Function loDivider, frontEnd, and PA (Default)
    END_OVERRIDE };
  #endif //CC13X2P


#elif defined(CC13XX)
  #if defined(CC13X2)
  regOverride_t pOverridesCommon[] = {
    END_OVERRIDE };

  regOverride_t pOverrides1Mbps[] = {
    END_OVERRIDE };

  #if defined(BLE_V50_FEATURES) && (BLE_V50_FEATURES & (PHY_2MBPS_CFG | PHY_LR_CFG))
  regOverride_t pOverrides2Mbps[] = {
    END_OVERRIDE };

  regOverride_t pOverridesCoded[] = {
    END_OVERRIDE };
  #endif // PHY_2MBPS_CFG | PHY_LR_CFG

  #elif defined(CC13X2P)
  regOverride_t pOverridesCommon[] = {
    // List of hardware and configuration registers to override during common initialization of any Bluetooth 5 PHY format
    // Bluetooth 5: Reconfigure pilot tone length for high output power PA
    HW_REG_OVERRIDE(0x6024,0x4C20),
    // Bluetooth 5: Compensate for modified pilot tone length
    (uint32_t)0x01500263,
    END_OVERRIDE };

  regOverride_t pOverrides1Mbps[] = {
    // List of hardware and configuration registers to override when selecting Bluetooth 5, LE 1M PHY
    // Bluetooth 5: Reconfigure pilot tone length for high output power PA
    HW_REG_OVERRIDE(0x5320,0x05A0),
    // Bluetooth 5: Compensate for modified pilot tone length
    (uint32_t)0x017B02A3,
    END_OVERRIDE };

  #if defined(BLE_V50_FEATURES) && (BLE_V50_FEATURES & (PHY_2MBPS_CFG | PHY_LR_CFG))
  regOverride_t pOverrides2Mbps[] = {
    // List of hardware and configuration registers to override when selecting Bluetooth 5, LE 2M PHY
    // Bluetooth 5: Reconfigure pilot tone length for high output power PA
    HW_REG_OVERRIDE(0x5320,0x05A0),
    // Bluetooth 5: Compensate for modified pilot tone length
    (uint32_t)0x011902A3,
    END_OVERRIDE };

  regOverride_t pOverridesCoded[] = {
    // List of hardware and configuration registers to override when selecting Bluetooth 5, LE Coded PHY
    // Bluetooth 5: Reconfigure pilot tone length for high output power PA
    HW_REG_OVERRIDE(0x5320,0x05A0),
    // Bluetooth 5: Compensate for modified pilot tone length
    (uint32_t)0x07D102A3,
    END_OVERRIDE };
  #endif // PHY_2MBPS_CFG | PHY_LR_CFG

  // high gain PA overrides
  regOverride_t pOverridesTx20[] = {
    // The TX Power element should always be the first in the list
    TX20_POWER_OVERRIDE(0x003F5BB8),
    // The ANADIV radio parameter based on the LO divider (0) and front-end (0) settings
    (uint32_t)0x01C20703,
    END_OVERRIDE };

  // default PA overrides
  regOverride_t pOverridesTxStd[] = {
    // The TX Power element should always be the first in the list
    TX_STD_POWER_OVERRIDE(0x941E),
    // The ANADIV radio parameter based on the LO divider (0) and front-end (0) settings
    (uint32_t)0x05320703,
    END_OVERRIDE };

  #else // unknown board package
    #error "***BLE USER CONFIG BUILD ERROR*** Unknown board type!"
  #endif // <board>
#else // unknown platform
  #error "ERROR: Unknown platform!"
#endif // <board>

//
// Tx Power Table Used Depends on Device Package
//
const ubTxPowerVal_t ubTxPowerVal[] = {
#if defined(USE_FPGA)
  // Differential Output (same as CC2650EM_7ID for now)
    { TX_POWER_MINUS_21_DBM, 0x06C7 },
    { TX_POWER_MINUS_18_DBM, 0x06C9 },
    { TX_POWER_MINUS_15_DBM, 0x0C88 },
    { TX_POWER_MINUS_12_DBM, 0x108A },
    { TX_POWER_MINUS_9_DBM,  0x0A8D },
    { TX_POWER_MINUS_6_DBM,  0x204D },
    { TX_POWER_MINUS_3_DBM,  0x2851 },
    { TX_POWER_0_DBM,        0x3459 },
    { TX_POWER_1_DBM,        0x385C },
    { TX_POWER_2_DBM,        0x440D },
    { TX_POWER_3_DBM,        0x5411 },
    { TX_POWER_4_DBM,        0x6C16 },
    { TX_POWER_5_DBM,        0x941E }
#elif defined(CC26XX)
  #if defined(CC26X2)
  // Differential Output
    { TX_POWER_MINUS_21_DBM, 0x06C7 },
    { TX_POWER_MINUS_18_DBM, 0x06C9 },
    { TX_POWER_MINUS_15_DBM, 0x0C88 },
    { TX_POWER_MINUS_12_DBM, 0x108A },
    { TX_POWER_MINUS_9_DBM,  0x0A8D },
    { TX_POWER_MINUS_6_DBM,  0x204D },
    { TX_POWER_MINUS_3_DBM,  0x2851 },
    { TX_POWER_0_DBM,        0x3459 },
    { TX_POWER_1_DBM,        0x385C },
    { TX_POWER_2_DBM,        0x440D },
    { TX_POWER_3_DBM,        0x5411 },
    { TX_POWER_4_DBM,        0x6C16 },
    { TX_POWER_5_DBM,        0x941E }
  #else // unknown board package
    #error "***BLE USER CONFIG BUILD ERROR*** Unknown CC26x2 board type!"
  #endif // <board>
#elif defined(CC13XX)
  #if defined(CC13X2)
  // Tx Power Values (Pout, Tx Power)
      { TX_POWER_MINUS_21_DBM, 0x06C7 },
      { TX_POWER_MINUS_18_DBM, 0x06C9 },
      { TX_POWER_MINUS_15_DBM, 0x0C88 },
      { TX_POWER_MINUS_12_DBM, 0x108A },
      { TX_POWER_MINUS_9_DBM,  0x0A8D },
      { TX_POWER_MINUS_6_DBM,  0x204D },
      { TX_POWER_MINUS_3_DBM,  0x2851 },
      { TX_POWER_0_DBM,        0x3459 },
      { TX_POWER_1_DBM,        0x385C },
      { TX_POWER_2_DBM,        0x440D },
      { TX_POWER_3_DBM,        0x5411 },
      { TX_POWER_4_DBM,        0x6C16 },
      { TX_POWER_5_DBM,        0x941E }
 #elif defined(CC13X2P)
 // Tx Power Values (Pout, Tx Power)
     {TX_POWER_MINUS_21_DBM, RF_TxPowerTable_DefaultPAEntry( 7, 3, 0,  3) },    // 0x000006C7
     {TX_POWER_MINUS_18_DBM, RF_TxPowerTable_DefaultPAEntry( 9, 3, 0,  3) },    // 0x000006C9
     {TX_POWER_MINUS_15_DBM, RF_TxPowerTable_DefaultPAEntry( 8, 2, 0,  6) },    // 0x00000C88
     {TX_POWER_MINUS_12_DBM, RF_TxPowerTable_DefaultPAEntry(10, 2, 0,  8) },    // 0x0000108A
     {TX_POWER_MINUS_10_DBM, RF_TxPowerTable_DefaultPAEntry(12, 2, 0, 11) },    // 0x0000168C
     {TX_POWER_MINUS_9_DBM,  RF_TxPowerTable_DefaultPAEntry(13, 2, 0,  5) },    // 0x00000A8D
     {TX_POWER_MINUS_6_DBM,  RF_TxPowerTable_DefaultPAEntry(13, 1, 0,  6) },    // 0x0000204D
     {TX_POWER_MINUS_5_DBM,  RF_TxPowerTable_DefaultPAEntry(14, 1, 0, 17) },    // 0x0000224E
     {TX_POWER_MINUS_3_DBM,  RF_TxPowerTable_DefaultPAEntry(17, 1, 0, 20) },    // 0x00002851
     {TX_POWER_0_DBM,        RF_TxPowerTable_DefaultPAEntry(25, 1, 0, 26) },    // 0x00003459
     {TX_POWER_1_DBM,        RF_TxPowerTable_DefaultPAEntry(28, 1, 0, 28) },    // 0x0000385C
     {TX_POWER_2_DBM,        RF_TxPowerTable_DefaultPAEntry(13, 0, 0, 34) },    // 0x0000440D
     {TX_POWER_3_DBM,        RF_TxPowerTable_DefaultPAEntry(17, 0, 0, 42) },    // 0x00005411
     {TX_POWER_4_DBM,        RF_TxPowerTable_DefaultPAEntry(22, 0, 0, 54) },    // 0x00006C16
     {TX_POWER_5_DBM,        RF_TxPowerTable_DefaultPAEntry(30, 0, 0, 74) },    // 0x0000941E
     {TX_POWER_6_DBM,        RF_TxPowerTable_HighPAEntry(46, 0, 1, 26,  7) },   // 0x8007352E
     {TX_POWER_9_DBM,        RF_TxPowerTable_HighPAEntry(40, 0, 1, 39, 41) },   // 0x80294F28
     {TX_POWER_10_DBM,       RF_TxPowerTable_HighPAEntry(23, 2, 1, 65,  5) },   // 0x80058397
     {TX_POWER_11_DBM,       RF_TxPowerTable_HighPAEntry(24, 2, 1, 29,  7) },   // 0x80073B98
     {TX_POWER_12_DBM,       RF_TxPowerTable_HighPAEntry(19, 2, 1, 16, 25) },   // 0x80192193
     {TX_POWER_13_DBM,       RF_TxPowerTable_HighPAEntry(27, 2, 1, 19, 13) },   // 0x800D279B
     {TX_POWER_14_DBM,       RF_TxPowerTable_HighPAEntry(24, 2, 1, 19, 27) },   // 0x801B2798
     {TX_POWER_15_DBM,       RF_TxPowerTable_HighPAEntry(23, 2, 1, 20, 39) },   // 0x80272997
     {TX_POWER_16_DBM,       RF_TxPowerTable_HighPAEntry(34, 2, 1, 26, 23) },   // 0x801735A2
     {TX_POWER_17_DBM,       RF_TxPowerTable_HighPAEntry(38, 2, 1, 33, 25) },   // 0x801943A6
     {TX_POWER_18_DBM,       RF_TxPowerTable_HighPAEntry(30, 2, 1, 37, 53) },   // 0x80354B9E
     {TX_POWER_19_DBM,       RF_TxPowerTable_HighPAEntry(36, 2, 1, 57, 59) },   // 0x803B73A4
     {TX_POWER_20_DBM,       RF_TxPowerTable_HighPAEntry(56, 2, 1, 45, 63) } }; // 0x803F5BB8
  #else // unknown board package
    #error "***BLE USER CONFIG BUILD ERROR*** Unknown CC135x board type!"
  #endif // <board>
#else // unknown platform
  #error "ERROR: Unknown platform!"
#endif // <board>
 };

/* RF frontend mode bias */
const uint8_t ubFeModeBias = RF_FE_MODE_AND_BIAS;

/* Overrides for CMD_RADIO_SETUP */
regOverride_t *ubRfRegOverride = pOverridesCommon;

/* Tx Power Table */
const ubTxPowerTable_t ubTxPowerTable = { ubTxPowerVal, UB_NUM_TX_POWER_VALUE };

/*******************************************************************************
 */
