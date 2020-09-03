/******************************************************************************

 @file dmm_scheduler.h

 @brief Dual Mode Manager Scheduler

 Group: WCS LPC
 Target Device: cc13x2_26x2

 ******************************************************************************
 
 Copyright (c) 2019-2020, Texas Instruments Incorporated
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
/*!****************************************************************************
 *  @file  dmm_scheduler.h
 *
 *  @brief      Dual Mode Manager Scheduler
 *  
 *  DMM enables devices to run multiple wireless protocol stacks concurrently. 
 *  The DMMSch is to enable concurrent operation of multiple stacks with minimized conflicts 
 *  so that it does not cause significant performance degradation.  
 *  The DMMSch uses Application Level, Stack Level information, and Global Priority Table (GPT) when scheduling a command. 
 *  Stack Level information (provided by stack) is embedded in each RF command and it includes:
 *  - Start Type, Start Time, AllowDelay, Priority, Activity, etc.  
 *  Application Level information (provided by User via the Policy Table) includes:
 *  - Application State Name, Weight, AppliedActivity, Pause, etc.   
 *  Global Priority Table (GPT)
 *  - GPT defines relative priorities of the two stacks
 *  The DMMSch uses Start Type, Start Time, and AllowDelay (Stack Level Information) when scheduling a RF command
 *  and tries to avoid a conflict by delaying the command if allowed. 
 *  When a command conflicts with another (during scheduling or execution), 
 *  The DMMSch selects one command over the other based on the final priority of two commands as below:
 *  Final Priority = GPT (Stack level priority) +  weight (Application Level) 
 * 
 *  # DMMSch API #
 *
 *  To use the DMMSch module to schedule a tacks RF commands, the application
 *  calls the following APIs:
 *    - DMMSch_init(): Initialize the DMMSch module/task.
 *    - DMMSch_Params_init():  Initialize a DMMSch_Params structure
 *      with default values.  Then change the parameters from non-default
 *      values as needed.
 *    - DMMSch_open():  Open an instance of the DMMSch module,
 *      passing the initialized parameters.
 *    - Stack A application - DMMSch_registerClient: Passes Task_Handle and StackRole so 
 * 							  DMMSch can map the Task_Handle to the stack role 
 *    - Stack A application - Rf_open -> DMMSch_rfOpen: DMMSch overwrites the RF_Mode and 
 *                            rf patches for multi-mode operation, maps RF Handle to the stack ID,
 *                            assigns phySwitchingTime for DMM operation. 
 *                            From this point, Task_Handle, StackRole, and Stack ID are all related. 
 *    - Stack B application - DMMSch_registerClient: Passes Task_Handle and StackRole so 
 * 							  DMMSch can map the Task_Handle to the stack role 
 *    - Stack B application - Rf_open -> DMMSch_rfOpen: Rf_open -> DMMSch_rfOpen: DMMSch overwrites the RF_Mode and 
 *                            rf patches for multi-mode operation, maps RF Handle to the stack ID,
 *                            assigns phySwitchingTime for DMM operation. 
 *                            From this point, Task_Handle, StackRole, and Stack ID are all related. 
 *    - Stack A application - RF_scheduleCmd -> DMMSch_rfScheduleCmd: DMMSch adjusted timing based on policy
 *    - Stack B application - RF_scheduleCmd -> DMMSch_rfScheduleCmd: DMMSch adjusted timing based on policy
 *
 *
 ********************************************************************************/

#ifndef DMMSch_H_
#define DMMSch_H_

#include "stdint.h"

#include <ti/drivers/rf/RF.h>
#include <ti/sysbios/knl/Task.h>

#include "dmm_policy.h"


/*!
 * @brief DMM Debug Logging
 * @anchor DMM_dbgLog
 *
 * Debugging for internal use only. 
 * @{
 */
#define xDMM_DEBUG_LOGGING

#ifdef DMM_DEBUG_LOGGING
#include <xdc/runtime/Log.h>
#define DMM_dbgLog0(str)                     Log_info0(str)
#define DMM_dbgLog1(str, a0)                 Log_info1(str, a0)
#define DMM_dbgLog2(str, a0, a1)             Log_info2(str, a0, a1)
#define DMM_dbgLog3(str, a0, a1, a2)         Log_info3(str, a0, a1, a2)
#define DMM_dbgLog4(str, a0, a1, a2, a3)     Log_info4(str, a0, a1, a2, a3)
#define DMM_dbgLog5(str, a0, a1, a2, a3, a4) Log_info5(str, a0, a1, a2, a3, a4)
#else
#define DMM_dbgLog0(str)
#define DMM_dbgLog1(str, a0)
#define DMM_dbgLog2(str, a0, a1)
#define DMM_dbgLog3(str, a0, a1, a2)
#define DMM_dbgLog4(str, a0, a1, a2, a3)
#define DMM_dbgLog5(str, a0, a1, a2, a3, a4)
#endif
/** @} */

/** @brief RF parameter struct
 *  DMM Scheduler parameters are used with the DMMSch_open() and DMMSch_Params_init() call.
 */
typedef struct {
    DMMPolicy_StackRole stackRoles[DMMPOLICY_NUM_STACKS];       ///< Define the stacks that are supported by the scheduler
    DMMPolicy_StackCmdIndexTable *indexTable;                   ///< Define the index table for the scheduler
} DMMSch_Params;

/** @brief DMM Conflict struct
 *  DMM Conflict Status
 */
typedef enum
{
    DMM_NoConflict  = 0,        ///< used to define where there is no conflict in commands. 
    DMM_ConflictWithPrev,       ///< used to define where there is a conflict with the previous command. 
    DMM_ConflictWithNext,       ///< used to define where there is a conflict with the next command. 
    DMM_ConfictWithBoth,        ///< used to define where there is a conflict with both previous and next command. 
} DMM_ConflictStatus;

/*!
 * @brief Define to flush all commands
 *
 * Default option to flush all commands for a specific client for a conflict 
 */
#define CONFLICT_FLUSH_ALL       1

/**
 *  @brief Defines the preemption callback.
 *
 *  The function is invoked when a preemption occurs in DMM Scheduler.
 *
 *  The arguments are:
 *      - \a stackRolePreempted stack role for command was preempted.
 */
typedef void (*DMMSch_PreemptionCb)(DMMPolicy_StackRole stackRolePreempted);

/** @brief  Function to initialize the DMMSch_Params struct to its defaults
 *
 *  @param  params      An pointer to RF_Params structure for
 *                      initialization
 *
 *  Defaults values are:
 */
extern void DMMSch_Params_init(DMMSch_Params *params);

/** @brief  Function that initializes the DMMSch module
 *
 */
extern void DMMSch_init(void);

/** @brief  allows policy manager to register a callback on command preemption
 *
 *  @param  dmmSchPreemptionCb     callback to register
 */
extern void DMMSch_registerPreemptionCb(DMMSch_PreemptionCb dmmSchPreemptionCb);

/** @brief  Function to open the DMMSch module
 *
 *  @param  params      An pointer to RF_Params structure for initialization
 */
extern void DMMSch_open(DMMSch_Params *params);

/** @brief  Register an DMM Scheduler client
 *
 *  @param  pTaskHndl Task handle that the stack is running in, used to map the
 *                    RF Client handle to a stack role
 *
 *  @param  StackRole   stack role associated with Task handle
 */
extern void DMMSch_registerClient(Task_Handle* pTaskHndl, DMMPolicy_StackRole StackRole);

/** @brief              Intercepts calls from a stack to RF_postCmd (re-mapped to DMMSch_rfOpen),
 *                      The DMMSch module uses this to tie
 *
 * @param pObj          pointer to RF Object
 * @param pRfMode       pointer to RF Mode
 * @param pOpSetup      pointer to Radio Setup
 * @param params        pointer to RF params
 *
 * @return       An pointer to RF_Params structure for initialization
 */
extern RF_Handle DMMSch_rfOpen(RF_Object *pObj, RF_Mode *pRfMode, RF_RadioSetup *pOpSetup, RF_Params *params);

/**
 *  @brief  Handles calls from a stack to RF_postCmd (re-mapped to DMMSch_postCmd),
 *  adjusts timing as necessary and schedules then accordingly with RF_scheduleCmd.
 *
 *  @sa RF_pendCmd(), RF_runCmd(), RF_scheduleCmd(), RF_RF_cancelCmd(), RF_flushCmd(), RF_getCmdOp()
 *
 *  @param h         Driver handle previously returned by RF_open()
 *  @param pOp       Pointer to the RF operation command.
 *  @param ePri      Priority of this RF command (used for arbitration in multi-client systems)
 *  @param pCb       Callback function called during command execution and upon completion.
 *                   If RF_postCmd() fails, no callback is made.
 *  @param bmEvent   Bitmask of events that will trigger the callback or that can be pended on.
 *  @return          A handle to the RF command. Return value of RF_ALLOC_ERROR indicates error.
 */
extern RF_CmdHandle DMMSch_rfPostCmd(RF_Handle h, RF_Op* pOp, RF_Priority ePri, RF_Callback pCb, RF_EventMask bmEvent);

/**
 *  @brief  Handles calls from a stack to RF_scheduleCmd (re-mapped to DMMSch_scheduleCmd),
 *          adjusts timing as necessary and schedules then accordingly with RF_scheduleCmd.
 *
 *  @param h         Handle previously returned by RF_open()
 *  @param pOp       Pointer to the RF_Op. Must normally be in persistent and writeable memory
 *  @param pSchParams Pointer to the schedule command parameter structure
 *  @param pCb       Callback function called upon command completion (and some other events).
 *                   If RF_scheduleCmd() fails no callback is made
 *  @param bmEvent   Bitmask of events that will trigger the callback.
 *  @return          A handle to the RF command. Return value of RF_ALLOC_ERROR indicates error.
 */
extern RF_CmdHandle DMMSch_rfScheduleCmd(RF_Handle h, RF_Op* pOp, RF_ScheduleCmdParams *pSchParams, RF_Callback pCb, RF_EventMask bmEvent);

/** @brief  Handles calls from a stack to RF_runCmd (re-mapped to DMMSch_runCmd),
 *          adjusts timing as necessary and schedules then accordingly with RF_scheduleCmd.
 *
 *  @param h         Driver handle previously returned by RF_open()
 *  @param pOp       Pointer to the RF operation command.
 *  @param ePri      Priority of this RF command (used for arbitration in multi-client systems)
 *  @param pCb       Callback function called during command execution and upon completion.
 *                   If RF_runCmd() fails, no callback is made.
 *  @param bmEvent   Bitmask of events that will trigger the callback or that can be pended on.
 *  @return          The relevant termination event.
 */
extern RF_EventMask DMMSch_rfRunCmd(RF_Handle h, RF_Op* pOp, RF_Priority ePri, RF_Callback pCb, RF_EventMask bmEvent);

/**
 *  @brief  Handles calls from a stack to RF_runScheduleCmd (re-mapped to DMMSch_runScheduleCmd),
 *          adjusts timing as necessary and schedules then accordingly with RF_scheduleCmd.
 *
 *  @param h         Handle previously returned by RF_open()
 *  @param pOp       Pointer to the RF_Op. Must normally be in persistent and writeable memory
 *  @param pSchParams Pointer to the schdule command parameter structure
 *  @param pCb       Callback function called upon command completion (and some other events).
 *                   If RF_runScheduleCmd() fails, no callback is made.
 *  @param bmEvent   Bitmask of events that will trigger the callback.
 *  @return          The relevant command completed event.
 */
extern RF_EventMask DMMSch_rfRunScheduleCmd(RF_Handle h, RF_Op* pOp, RF_ScheduleCmdParams *pSchParams, RF_Callback pCb, RF_EventMask bmEvent);

/**
 *  @brief  Abort/stop/cancel single command in command queue.
 *
 *  If command is running, aborts/stops it and posts callback for the
 *  aborted/stopped command. <br>
 *  If command has not yet run, cancels it it and posts callback for the
 *  cancelled command. <br>
 *  If command has already run or been aborted/stopped/cancelled, has no effect.<br>
 *  If RF_cancelCmd is called from a Swi context with same or higher priority
 *  than RF Driver Swi, when the RF core is powered OFF -> the cancel callback will be delayed
 *  until the next power-up cycle.<br>
 *
 *  @note Calling context : Task/SWI
 *
 *  @param h            Handle previously returned by RF_open()
 *  @param ch           Command handle previously returned by RF_postCmd().
 *  @param mode         1: Stop gracefully, 0: abort abruptly
 *  @return             RF_Stat indicates if command was successfully completed
 */
extern RF_Stat DMMSch_rfCancelCmd(RF_Handle h, RF_CmdHandle ch, uint8_t mode);

/**
 *  @brief  Abort/stop/cancel command and any subsequent commands in command queue.
 *
 *  If command is running, aborts/stops it and then cancels all later commands in queue.<br>
 *  If command has not yet run, cancels it and all later commands in queue.<br>
 *  If command has already run or been aborted/stopped/cancelled, has no effect.<br>
 *  The callbacks for all cancelled commands are issued in chronological order.<br>
 *  If RF_flushCmd is called from a Swi context with same or higher priority
 *  than RF Driver Swi, when the RF core is powered OFF -> the cancel callback will be delayed
 *  until the next power-up cycle.<br>
 *
 *  @note Calling context : Task/SWI
 *
 *  @param h            Handle previously returned by RF_open()
 *  @param ch           Command handle previously returned by RF_postCmd().
 *  @param mode         1: Stop gracefully, 0: abort abruptly
 *  @return             RF_Stat indicates if command was successfully completed
 */
extern RF_Stat DMMSch_rfFlushCmd(RF_Handle h, RF_CmdHandle ch, uint8_t mode);

/**
 *  @brief Send any Immediate command. <br>
 *
 *  Immediate Comamnd is send to RDBELL, if radio is active and the RF_Handle points
 *  to the current client. <br>
 *  In other appropriate RF_Stat values are returned. <br>
 *
 *  @note Calling context : Task/SWI/HWI
 *
 *  @param h            Handle previously returned by RF_open()
 *  @param pCmdStruct   Pointer to the immediate command structure
 *  @return             RF_Stat indicates if command was successfully completed
*/
extern RF_Stat DMMSch_rfRunImmediateCmd(RF_Handle h, uint32_t* pCmdStruct);

/**
 *  @brief Send any Direct command. <br>
 *
 *  Direct Comamnd value is send to RDBELL immediately, if radio is active and
 *  the RF_Handle point to the current client. <br>
 *  In other appropriate RF_Stat values are returned. <br>
 *
 *  @note Calling context : Task/SWI/HWI
 *
 *  @param h            Handle previously returned by RF_open()
 *  @param cmd          Direct command value.
 *  @return             RF_Stat indicates if command was successfully completed.
*/
extern RF_Stat DMMSch_rfRunDirectCmd(RF_Handle h, uint32_t cmd);


/** @brief  Turn on Block mode
 *
 *  @param  stackRole   stack role associated with Task handle
 *  @return true: success, false: the stack role cannot be found
 */
extern bool DMMSch_setBlockModeOn(DMMPolicy_StackRole stackRole);

/** @brief  Turn off Block mode
 *
 *  @param  stackRole   stack role associated with Task handle
 *  @return true: success, false: the stack role cannot be found
 */
extern bool DMMSch_setBlockModeOff(DMMPolicy_StackRole stackRole);

/** @brief  Get Block mode status
 *
 *  @param  stackRole   stack role associated with Task handle
 *  @return true: Block Mode is On, False: Block Mode is Off
 */
extern bool DMMSch_getBlockModeStatus(DMMPolicy_StackRole stackRole);

/**
 *  @brief Request access RF API that should not be used in DMM <br>
*/
extern RF_Stat DMMSch_rfRequestAccess(RF_Handle h, RF_AccessParams *pParams);

#endif /* DMMSch_H_ */
