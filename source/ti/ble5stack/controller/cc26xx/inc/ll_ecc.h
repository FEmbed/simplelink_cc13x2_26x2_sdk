/******************************************************************************

 @file  ll_ecc.h

 @brief This file contains the Link Layer (LL) types, constants,
        API's etc. for the Bluetooth Low Energy (BLE) Controller
        CCM encryption and decryption.

        This API is based on ULP BT LE D09R23.

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

#ifndef LL_ECC_H
#define LL_ECC_H

#ifdef __cplusplus
extern "C"
{
#endif

/*******************************************************************************
 * INCLUDES
 */

#include "bcomdef.h"
#include "ll_common.h"

/*******************************************************************************
 * MACROS
 */

/*******************************************************************************
 * CONSTANTS
 */

/*******************************************************************************
 * TYPEDEFS
 */

/*******************************************************************************
 * LOCAL VARIABLES
 */

/*******************************************************************************
 * GLOBAL VARIABLES
 */
#ifndef DEBUG_SC
extern uint8_t localPrivKeyMaterial[LL_SC_RAND_NUM_LEN]; // random private key
#else // DEBUG_SC

// Fixed Test Vector for PRAND (i.e. Private Key)
// Note: Taken from the test vector NIST256_testECDH_Bsk.
// Note: First word is length in words.
extern uint32 localPrivKeyMaterial[LL_SC_RAND_NUM_LEN/4];
#endif //DEBUG_SC

/*******************************************************************************
 * Functions
 */
/*******************************************************************************
 * @fn          ll_eccInit API
 *
 * @brief       This API is used to initiate the generation of a Diffie-
 *              Hellman key in the Controller for use over the LE transport.
 *              This command takes the remote P-256 public key as input. The
 *              Diffie-Hellman key generation uses the private key generated
 *              by LE_Read_Local_P256_Public_Key command.
 *
 *              Note: This function is only called once!
 *
 * input parameters
 *
 * @param       None.
 *
 * output parameters
 *
 * @param       None.
 *
 * @return      None.
 */
extern void ll_eccInit( void );

/*******************************************************************************
 * @fn          ll_ReadLocalP256PublicKey API
 *
 * @brief       This function is used to read the local P-256 public key from 
 *              the Controller. The Controller shall generate a new P-256 
 *              public/private key pair.
 *
 * input parameters
 *
 * @param       None.
 *
 * output parameters
 *
 * @param       publicKey - pointer to buffer to store the generated public key.
 *
 * @return      None.
 *
 */
extern int8_t ll_ReadLocalP256PublicKey( uint8 *publicKey );

/*******************************************************************************
 * @fn          ll_GenerateDHKey API
 *
 * @brief       This API is used to initiate the generation of a Diffie-
 *              Hellman key in the Controller for use over the LE transport.
 *              This command takes the remote P-256 public key as input. The
 *              Diffie-Hellman key generation uses the private key generated
 *              by LE_Read_Local_P256_Public_Key command.
 *
 *              WARNING: THIS ROUTINE WILL TIE UP THE LL FOR ABOUT 160ms!
 *
 * input parameters
 *
 * @param       publicKey: The remote P-256 public key (X-Y format).
 *
 * output parameters
 *
 * @param       dhKey - pointer to generated dhKey.
 *
 * @return      None.
 */
extern int8_t ll_GenerateDHKey( uint8 *publicKey, uint8_t *dhKey);

#ifdef __cplusplus
}
  
  
#endif

#endif /* LL_ECC_H */
