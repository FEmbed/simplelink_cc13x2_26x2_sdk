/*
 * Copyright (c) 2015-2020, Texas Instruments Incorporated
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * *  Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *
 * *  Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * *  Neither the name of Texas Instruments Incorporated nor the names of
 *    its contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
 * THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
 * OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
 * EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/*
 *  =============================== Includes ==================================
 */
/* STD header files */
#include <stdint.h>
#include <stdbool.h>
#include <stdlib.h>

/* RTOS driver header files */
#include <ti/drivers/I2C.h>
#include <ti/drivers/i2c/I2CCC26XX.h>
#include <ti/drivers/pin/PINCC26XX.h>

#include <ti/drivers/dpl/DebugP.h>
#include <ti/drivers/dpl/HwiP.h>
#include <ti/drivers/dpl/SemaphoreP.h>
#include <ti/drivers/dpl/SwiP.h>

#include <ti/drivers/Power.h>
#include <ti/drivers/power/PowerCC26XX.h>

/* Driverlib header files */
#include <ti/devices/DeviceFamily.h>
#include DeviceFamily_constructPath(inc/hw_types.h)
#include DeviceFamily_constructPath(driverlib/i2c.h)
#include DeviceFamily_constructPath(driverlib/ioc.h)

/*
 *  =============================== Macros =====================================
 *
 * Specific I2C CMD MACROs that are not defined in I2C.h are defined here. Their
 * equivalent values are taken from the existing MACROs in I2C.h
 *
 */
#ifndef I2C_MASTER_CMD_BURST_RECEIVE_START_NACK
#define I2C_MASTER_CMD_BURST_RECEIVE_START_NACK \
    I2C_MASTER_CMD_BURST_SEND_START
#endif

#ifndef I2C_MASTER_CMD_BURST_RECEIVE_STOP
#define I2C_MASTER_CMD_BURST_RECEIVE_STOP \
    I2C_MASTER_CMD_BURST_RECEIVE_ERROR_STOP
#endif

#ifndef I2C_MASTER_CMD_BURST_RECEIVE_CONT_NACK
#define I2C_MASTER_CMD_BURST_RECEIVE_CONT_NACK \
    I2C_MASTER_CMD_BURST_SEND_CONT
#endif

/* Prototypes */
void I2CCC26XX_init(I2C_Handle handle);
I2C_Handle I2CCC26XX_open(I2C_Handle handle, I2C_Params *params);
int_fast16_t I2CCC26XX_transfer(I2C_Handle handle,
 I2C_Transaction *transaction, uint32_t timeout);
void I2CCC26XX_cancel(I2C_Handle handle);
void I2CCC26XX_close(I2C_Handle handle);
int_fast16_t I2CCC26XX_control(I2C_Handle handle, uint_fast16_t cmd,
    void *arg);

static int I2CCC26XX_primeTransfer(I2C_Handle handle,
    I2C_Transaction *transferMessage);
static void I2CCC26XX_blockingCallback(I2C_Handle handle,
    I2C_Transaction *msg, bool transferStatus);
static inline void I2CCC26XX_completeTransfer(I2C_Handle handle);
static void I2CCC26XX_initHw(I2C_Handle handle);
static int I2CCC26XX_initIO(I2C_Handle handle, void *pinCfg);
static int i2cPostNotify(unsigned int eventType, uintptr_t eventArg,
    uintptr_t clientArg);

/* I2C function table for I2CCC26XX implementation */
const I2C_FxnTable I2CCC26XX_fxnTable = {
    I2CCC26XX_cancel,
    I2CCC26XX_close,
    I2CCC26XX_control,
    I2CCC26XX_init,
    I2CCC26XX_open,
    I2CCC26XX_transfer
};

/*!
 *  @brief Function to cancel any in progress or queued transactions.
 *
 *  After calling the cancel function, the I2C is enabled.
 *
 *  @pre    I2CCC26XX_transfer() should have been called first.
 *          Calling context: Task
 *
 *  @param handle An I2C_Handle returned by I2C_open()
 *
 *  @note  The generic I2C API should be used when accessing the I2CCC26XX.
 *
 *  ======== I2CCC26XX_cancel ========
 */
void I2CCC26XX_cancel(I2C_Handle handle)
{
    unsigned int key;
    I2CCC26XX_HWAttrsV1 const *hwAttrs = handle->hwAttrs;
    I2CCC26XX_Object *object = handle->object;

    key = HwiP_disable();

    /* Return if no transfer in progress */
    if (!object->headPtr) {
        HwiP_restore(key);
        return;
    }

    /* Set current transaction as canceled */
    object->currentTransaction->status = I2C_STATUS_CANCEL;

    /* Asynchronously generate a STOP condition. */
    I2CMasterControl(hwAttrs->baseAddr, I2C_MCTRL_STOP);

    HwiP_restore(key);
}

/*!
 *  @brief Function to close a given CC26XX I2C peripheral specified by the
 *         I2C handle.
 *
 *  After calling the close function, the I2C is disabled.
 *
 *  @pre    I2CCC26XX_open() has to be called first.
 *          Calling context: Task
 *
 *  @param handle An I2C_Handle returned by I2C_open()
 *
 *  @note  The generic I2C API should be used when accessing the I2CCC26XX.
 *
 *  @sa     I2CCC26XX_open(), I2C_close(), I2C_open()
 */
void I2CCC26XX_close(I2C_Handle handle)
{
    I2CCC26XX_Object            *object;
    I2CCC26XX_HWAttrsV1 const  *hwAttrs;

    /* Get the pointer to the object and hwAttrs */
    hwAttrs = handle->hwAttrs;
    object = handle->object;

    /* Check to see if a I2C transaction is in progress */
    DebugP_assert(object->headPtr == NULL);

    /* Mask I2C interrupts */
    I2CMasterIntDisable(hwAttrs->baseAddr);

    /* Disable the I2C Master */
    I2CMasterDisable(hwAttrs->baseAddr);

    /* Deallocate pins */
    PIN_close(object->hPin);

    /* Power off the I2C module */
    Power_releaseDependency(hwAttrs->powerMngrId);

    /* Destruct modules used in driver */
    HwiP_destruct(&(object->hwi));
    SwiP_destruct(&(object->swi));
    SemaphoreP_destruct(&(object->mutex));
    if (object->transferMode == I2C_MODE_BLOCKING) {
        SemaphoreP_destruct(&(object->transferComplete));
    }

    /* Unregister power post notification object */
    Power_unregisterNotify(&object->i2cPostObj);

    /* Mark the module as available */
    object->isOpen = false;

    return;
}

/*!
 *  @brief  Function for setting control parameters of the I2C driver
 *          after it has been opened.
 *
 *  @note   Currently not in use.
 */
int_fast16_t I2CCC26XX_control(I2C_Handle handle, uint_fast16_t cmd, void *arg)
{
    /* No implementation */
    return (I2C_STATUS_UNDEFINEDCMD);
}


/*
 *  ======== I2CCC26XX_hwiFxn ========
 *  Hwi interrupt handler to service the I2C peripheral
 *
 *  The handler is a generic handler for a I2C object.
 */
static void I2CCC26XX_hwiFxn(uintptr_t arg)
{
    I2C_Handle handle = (I2C_Handle) arg;
    I2CCC26XX_Object *object = handle->object;
    I2CCC26XX_HWAttrsV1 const *hwAttrs = handle->hwAttrs;
    uint32_t command = I2C_MCTRL_RUN;

    /* Clear the interrupt */
    I2CMasterIntClear(hwAttrs->baseAddr);

    /*
     * Check if the Master is busy. If busy, the MSTAT is invalid as
     * the controller is still transmitting or receiving. In that case,
     * we should wait for the next interrupt.
     */
    if (I2CMasterBusy(hwAttrs->baseAddr)) {
        return;
    }

    uint32_t status = HWREG(I2C0_BASE + I2C_O_MSTAT);

    /* Current transaction is cancelled */
    if (object->currentTransaction->status == I2C_STATUS_CANCEL) {
        I2CMasterControl(hwAttrs->baseAddr, I2C_MCTRL_STOP);
        I2CCC26XX_completeTransfer(handle);
        return;
    }

    /* Handle errors. ERR bit is not set if arbitration lost */
    if (status & (I2C_MSTAT_ERR | I2C_MSTAT_ARBLST)) {
        /* Decode interrupt status */
        if (status & I2C_MSTAT_ARBLST) {
            object->currentTransaction->status = I2C_STATUS_ARB_LOST;
        }
        /*
         * The I2C peripheral has an issue where the first data byte
         * is always transmitted, regardless of the ADDR NACK. Therefore,
         * we should check this error condition first.
         */
        else if (status & I2C_MSTAT_ADRACK_N) {
            object->currentTransaction->status = I2C_STATUS_ADDR_NACK;
        }
        else {
            /* Last possible bit is the I2C_MSTAT_DATACK_N */
            object->currentTransaction->status = I2C_STATUS_DATA_NACK;
        }

        /*
         * The CC13X2 / CC26X2 I2C peripheral does not have an explicit STOP
         * interrupt bit. Therefore, if an error occurred, we send the STOP
         * bit and complete the transfer immediately.
         */
        I2CMasterControl(hwAttrs->baseAddr, I2C_MCTRL_STOP);
        I2CCC26XX_completeTransfer(handle);
    }
    else if (object->writeCount) {
        object->writeCount--;

        /* Is there more to transmit */
        if (object->writeCount) {
            I2CMasterDataPut(hwAttrs->baseAddr, *(object->writeBuf++));
        }
        /* If we need to receive */
        else if (object->readCount) {

            /* Place controller in receive mode */
            I2CMasterSlaveAddrSet(hwAttrs->baseAddr,
                object->currentTransaction->slaveAddress, true);

            if (object->readCount > 1) {
                /* RUN and generate ACK to slave */
                command |= I2C_MCTRL_ACK;
            }

            /* RUN and generate a repeated START */
            command |= I2C_MCTRL_START;
        }
        else {
            /* Send STOP */
            command = I2C_MCTRL_STOP;
        }

        I2CMasterControl(hwAttrs->baseAddr, command);
    }
    else if (object->readCount) {
        object->readCount--;

        /* Read data */
        *(object->readBuf++) = I2CMasterDataGet(hwAttrs->baseAddr);

        if (object->readCount > 1) {
            /* Send ACK and RUN */
            command |= I2C_MCTRL_ACK;
        }
        else if (object->readCount < 1) {
            /* Send STOP */
            command = I2C_MCTRL_STOP;
        }
        else {
            /* Send RUN */
        }

        I2CMasterControl(hwAttrs->baseAddr, command);
    }
    else {
        I2CMasterControl(hwAttrs->baseAddr, I2C_MCTRL_STOP);
        object->currentTransaction->status = I2C_STATUS_SUCCESS;
        I2CCC26XX_completeTransfer(handle);
    }

    return;
}

/*
 *  ======== I2CCC26XX_swiFxn ========
 *  SWI interrupt handler to service the I2C peripheral
 *
 *  Takes care of cleanup and the callback in SWI context after an I2C transfer
 */
static void I2CCC26XX_swiFxn(uintptr_t arg0, uintptr_t arg1){
    I2C_Handle handle = (I2C_Handle) arg0;
    I2CCC26XX_Object *object = handle->object;
    int_fast16_t status;

    /*
     *  If this current transaction was canceled, we need to cancel
     *  any queued transactions
     */
    if (object->currentTransaction->status == I2C_STATUS_CANCEL) {

        /*
         * Allow callback to run. If in CALLBACK mode, the application
         * may initiate a transfer in the callback which will call
         * primeTransfer().
         */
        object->transferCallbackFxn(handle, object->currentTransaction, false);
        object->currentTransaction->status = I2C_STATUS_CANCEL;

        /* release the constraint to disallow standby */
        Power_releaseConstraint(PowerCC26XX_DISALLOW_STANDBY);

        /* also dequeue and call the transfer callbacks for any queued transfers */
        while (object->headPtr != object->tailPtr) {
            object->headPtr = object->headPtr->nextPtr;
            object->headPtr->status = I2C_STATUS_CANCEL;
            object->transferCallbackFxn(handle, object->headPtr, false);
            object->headPtr->status = I2C_STATUS_CANCEL;
            Power_releaseConstraint(PowerCC26XX_DISALLOW_STANDBY);
        }

        /* clean up object */
        object->currentTransaction = NULL;
        object->headPtr = NULL;
        object->tailPtr = NULL;
    }
    else if (object->currentTransaction->status == I2C_STATUS_TIMEOUT) {
        /*
         * This can only occur in BLOCKING mode. No need to call the blocking
         * callback as the Semaphore has already timed out.
         */
        object->headPtr = NULL;
        object->tailPtr = NULL;

        /* Release standby disallow constraint. */
        Power_releaseConstraint(PowerCC26XX_DISALLOW_STANDBY);
    }
    /* See if we need to process any other transactions */
    else if (object->headPtr == object->tailPtr) {

        /* No other transactions need to occur */
        object->headPtr = NULL;
        object->tailPtr = NULL;

        /*
         * Allow callback to run. If in CALLBACK mode, the application
         * may initiate a transfer in the callback which will call
         * primeTransfer().
         */
        object->transferCallbackFxn(handle, object->currentTransaction,
            (object->currentTransaction->status == I2C_STATUS_SUCCESS));

        /* Release standby disallow constraint. */
        Power_releaseConstraint(PowerCC26XX_DISALLOW_STANDBY);
    }
    else {
        /* Another transfer needs to take place */
        object->headPtr = object->headPtr->nextPtr;

        /*
         * Allow application callback to run. The application may
         * initiate a transfer in the callback which will add an
         * additional transfer to the queue.
         */
        object->transferCallbackFxn(handle, object->currentTransaction,
            (object->currentTransaction->status == I2C_STATUS_SUCCESS));

        status = I2CCC26XX_primeTransfer(handle, object->headPtr);

        /* Call back now if not able to start transfer */
        if (status != I2C_STATUS_SUCCESS) {
            /* Transaction status set in primeTransfer() */
            SwiP_post(&(object->swi));
        }
    }
}

/*
 *  ======== I2CCC26XX_init ========
 */
void I2CCC26XX_init(I2C_Handle handle)
{
}

/*!
 *  @brief Function to initialize a given I2C CC26XX peripheral specified by the
 *         particular handle. The parameter specifies which mode the I2C
 *         will operate.
 *
 *  After calling the open function, the I2C is enabled. If there is no active
 *  I2C transactions, the device can enter standby.
 *
 *  @pre    The I2CCC26XX_Config structure must exist and be persistent before this
 *          function can be called. I2CCC26XX has been initialized with I2CCC26XX_init().
 *          Calling context: Task
 *
 *  @param  handle   An I2C_Handle
 *
 *  @param  params   Pointer to a parameter block, if NULL it will use default values.
 *
 *  @return A I2C_Handle on success, or a NULL on an error or if it has been
 *          already opened.
 *
 *  @note  The generic I2C API should be used when accessing the I2CCC26XX.
 *
 *  @sa     I2CCC26XX_close(), I2CCC26XX_init(), I2C_open(), I2C_init()
 */
I2C_Handle I2CCC26XX_open(I2C_Handle handle, I2C_Params *params)
{
    union {
        HwiP_Params              hwiParams;
        SwiP_Params              swiParams;
    } paramsUnion;
    uintptr_t                       key;
    I2CCC26XX_Object               *object;
    I2CCC26XX_HWAttrsV1 const      *hwAttrs;

    /* Get the pointer to the object and hwAttrs */
    object = handle->object;
    hwAttrs = handle->hwAttrs;

    /* Check for valid bit rate */
    DebugP_assert(params->bitRate <= I2C_400kHz);

    /* Determine if the device index was already opened */
    key = HwiP_disable();
    if(object->isOpen == true){
        HwiP_restore(key);
        return (NULL);
    }

    /* Mark the handle as being used */
    object->isOpen = true;
    HwiP_restore(key);

    /* Power on the I2C module */
    Power_setDependency(hwAttrs->powerMngrId);

    /* Configure the IOs.*/
    if (I2CCC26XX_initIO(handle, params->custom)) {
      /* Mark the module as available */
      key = HwiP_disable();
      object->isOpen = false;
      HwiP_restore(key);
      /* Release dependency if open fails */
      Power_releaseDependency(hwAttrs->powerMngrId);
      /* Signal back to application that I2C driver was not successfully opened */
      return (NULL);
    }

    /* Save parameters */
    object->transferMode = params->transferMode;
    object->transferCallbackFxn = params->transferCallbackFxn;
    object->bitRate = params->bitRate;

    /* Disable and clear interrupts possible from soft resets */
    I2CMasterIntDisable(hwAttrs->baseAddr);
    I2CMasterIntClear(hwAttrs->baseAddr);

    /* Create Hwi object for this I2C peripheral */
    HwiP_Params_init(&paramsUnion.hwiParams);
    paramsUnion.hwiParams.arg = (uintptr_t)handle;
    paramsUnion.hwiParams.priority = hwAttrs->intPriority;
    HwiP_construct(&(object->hwi), hwAttrs->intNum, I2CCC26XX_hwiFxn, &paramsUnion.hwiParams);

    /* Create Swi object for this I2C peripheral */
    SwiP_Params_init(&(paramsUnion.swiParams));
    paramsUnion.swiParams.arg0 = (uintptr_t)handle;
    paramsUnion.swiParams.priority = hwAttrs->swiPriority;
    SwiP_construct(&(object->swi), I2CCC26XX_swiFxn, &(paramsUnion.swiParams));

    /*
     * Create thread safe handles for this I2C peripheral
     * Semaphore to provide exclusive access to the I2C peripheral
     */
    SemaphoreP_constructBinary(&(object->mutex), 1);

    /*
     * Store a callback function that posts the transfer complete
     * semaphore for synchronous mode
     */
    if (object->transferMode == I2C_MODE_BLOCKING) {
        /* Semaphore to cause the waiting task to block for the I2C to finish */
        SemaphoreP_constructBinary(&(object->transferComplete), 0);
        /* Store internal callback function */
        object->transferCallbackFxn = I2CCC26XX_blockingCallback;
    }
    else {
        /* Check to see if a callback function was defined for async mode */
        DebugP_assert(object->transferCallbackFxn != NULL);
    }

    /* Clear the head pointer */
    object->headPtr = NULL;
    object->tailPtr = NULL;

    /* Initialize the I2C hardware module */
    I2CCC26XX_initHw(handle);

    /* Register notification functions */
    Power_registerNotify(&object->i2cPostObj, PowerCC26XX_AWAKE_STANDBY,
        (Power_NotifyFxn)i2cPostNotify, (uint32_t)handle);

    /* Return the address of the handle */
    return (handle);
}

/*
 *  ======== I2CCC26XX_primeTransfer =======
 */
static int_fast16_t I2CCC26XX_primeTransfer(I2C_Handle handle,
    I2C_Transaction *transaction)
{
    I2CCC26XX_Object *object = handle->object;

    I2CCC26XX_HWAttrsV1 const *hwAttrs = handle->hwAttrs;
    int_fast16_t status = I2C_STATUS_SUCCESS;

    /* Store the new internal counters and pointers */
    object->currentTransaction = transaction;

    object->writeBuf = transaction->writeBuf;
    object->writeCount = transaction->writeCount;
    object->readBuf = transaction->readBuf;
    object->readCount = transaction->readCount;

    /*
     * Transaction is incomplete unless the stop condition occurs AND
     * all bytes have been sent and received. This condition is checked
     * in the hardware interrupt.
     */
    object->currentTransaction->status = I2C_STATUS_INCOMPLETE;

    /* Determine if the bus is in use by another I2C Master */
    if (I2CMasterBusBusy(hwAttrs->baseAddr)) {
        transaction->status = I2C_STATUS_BUS_BUSY;
        status = I2C_STATUS_BUS_BUSY;
    }
    /* Start transfer in Transmit */
    else if (object->writeCount) {

        I2CMasterIntEnable(hwAttrs->baseAddr);

        /* Specify slave address and transmit mode */
        I2CMasterSlaveAddrSet(hwAttrs->baseAddr,
            object->currentTransaction->slaveAddress, false);

        I2CMasterDataPut(hwAttrs->baseAddr, *((object->writeBuf)++));
        I2CMasterControl(hwAttrs->baseAddr, I2C_MASTER_CMD_BURST_SEND_START);
    }
    else {

        I2CMasterIntEnable(hwAttrs->baseAddr);

        /* Specify slave address and receive mode */
        I2CMasterSlaveAddrSet(hwAttrs->baseAddr,
            object->currentTransaction->slaveAddress, true);

        if (object->readCount == 1) {
            /* Send START, read 1 data byte, and NACK */
            I2CMasterControl(hwAttrs->baseAddr,
                I2C_MASTER_CMD_BURST_RECEIVE_START_NACK);
        }
        else {
            /* Start the I2C transfer in master receive mode */
            I2CMasterControl(hwAttrs->baseAddr,
                I2C_MASTER_CMD_BURST_RECEIVE_START);
        }
    }

    return (status);
}

/*!
 *  @brief Function to start a transfer from the CC26XX I2C peripheral specified
 *         by the I2C handle.
 *
 *  This function is used for both transmitting and receiving data. If the I2C
 *  is configured in ::I2C_MODE_CALLBACK mode, it is possible to chain transactions
 *  together and receive a callback when all transactions are done.
 *  When active I2C transactions exist, the device might enter idle, not standby.
 *
 *  @pre    I2CCC26XX_open() has to be called first.
 *          Calling context: Hwi and Swi (only if using ::I2C_MODE_CALLBACK), Task
 *
 *  @param handle An I2C_Handle returned by I2C_open()
 *
 *  @param transaction Pointer to a I2C transaction object
 *
 *  @param timeout Timeout (in ClockP ticks) to wait for the transaction
 *
 *  @return I2C_STATUS_SUCCESS on successful transfer.
 *          I2C_STATUS_ERROR on an error, such as a I2C bus fault
 *          or I2C_STATUS_TIMEOUT on a timeout.
 *
 *  @note  The generic I2C API should be used when accessing the I2CCC26XX.
 *
 *  @sa    I2CCC26XX_open(), I2C_transfer()
 */
int_fast16_t I2CCC26XX_transfer(I2C_Handle handle,
                        I2C_Transaction *transaction, uint32_t timeout)
{
    int_fast16_t                ret;
    uintptr_t                   key;
    I2CCC26XX_Object           *object;
    I2CCC26XX_HWAttrsV1 const  *hwAttrs;

    /* Get the pointer to the object and hwAttrs */
    object = handle->object;
    hwAttrs = handle->hwAttrs;

    /* Check if anything needs to be written or read */
    if ((transaction->writeCount == 0) && (transaction->readCount == 0)) {
        transaction->status = I2C_STATUS_INVALID_TRANS;
        /* Nothing to write or read */
        return (transaction->status);
    }

    key = HwiP_disable();

    /* If callback mode, determine if transfer in progress */
    if (object->transferMode == I2C_MODE_CALLBACK && object->headPtr) {

        /*
         * Queued transactions are being canceled. Can't allow additional
         * transactions to be queued.
         */
        if (object->headPtr->status == I2C_STATUS_CANCEL) {
            transaction->status = I2C_STATUS_INVALID_TRANS;
            ret = transaction->status;
        }
        /* Transfer in progress */
        else {

            /*
             * Update the message pointed by the tailPtr to point to the next
             * message in the queue
             */
            object->tailPtr->nextPtr = transaction;

            /* Update the tailPtr to point to the last message */
            object->tailPtr = transaction;

            /* Set queued status */
            transaction->status = I2C_STATUS_QUEUED;

            ret = I2C_STATUS_SUCCESS;
        }

        HwiP_restore(key);
        return (ret);
    }

    /* Store the headPtr indicating I2C is in use */
    object->headPtr = transaction;
    object->tailPtr = transaction;

    /* In blocking mode, transactions can queue on the I2C mutex */
    transaction->status = I2C_STATUS_QUEUED;

    HwiP_restore(key);

    /* Get the lock for this I2C handle */
    if (SemaphoreP_pend(&(object->mutex), SemaphoreP_NO_WAIT)
        == SemaphoreP_TIMEOUT) {

        /* We were unable to get the mutex in CALLBACK mode */
        if (object->transferMode == I2C_MODE_CALLBACK) {
            /*
             * Recursively call transfer() and attempt to place transaction
             * on the queue. This may only occur if a thread is preempted
             * after restoring interrupts and attempting to grab this mutex.
             */
            return (I2CCC26XX_transfer(handle, transaction, timeout));
        }

        /* Wait for the I2C lock. If it times-out before we retrieve it, then
         * return false to cancel the transaction. */
        if(SemaphoreP_pend(&(object->mutex), timeout) == SemaphoreP_TIMEOUT) {
            transaction->status = I2C_STATUS_TIMEOUT;
            return (I2C_STATUS_TIMEOUT);
        }
    }

    if (object->transferMode == I2C_MODE_BLOCKING) {
       /*
        * In the case of a timeout, It is possible for the timed-out transaction
        * to call the hwi function and post the object->transferComplete Semaphore
        * To clear this, we simply do a NO_WAIT pend on (binary)
        * object->transferComplete, so that it resets the Semaphore count.
        */
        SemaphoreP_pend(&(object->transferComplete), SemaphoreP_NO_WAIT);
    }

    /* Set standby disallow constraint. */
    Power_setConstraint(PowerCC26XX_DISALLOW_STANDBY);

    /*
     * I2CCC26XX_primeTransfer is a longer process and
     * protection is needed from the I2C interrupt
     */
    HwiP_disableInterrupt(hwAttrs->intNum);
    ret = I2CCC26XX_primeTransfer(handle, transaction);
    HwiP_enableInterrupt(hwAttrs->intNum);

    if (ret != I2C_STATUS_SUCCESS) {

        if (object->transferMode == I2C_MODE_BLOCKING) {
            /* Release standby disallow constraint. */
            Power_releaseConstraint(PowerCC26XX_DISALLOW_STANDBY);
        }
    }
    else if (object->transferMode == I2C_MODE_BLOCKING) {
        /* Wait for the primed transfer to complete */
        if (SemaphoreP_pend(&(object->transferComplete), timeout)
            == SemaphoreP_TIMEOUT) {

            key = HwiP_disable();

            /*
             * Protect against a race condition in which the transfer may
             * finish immediately after the timeout. If this occurs, we
             * will preemptively consume the semaphore on the next initiated
             * transfer.
             */
            if (object->headPtr) {

                /*
                 * It's okay to call cancel here since this is blocking mode.
                 * Cancel will generate a STOP condition and immediately
                 * return.
                 */
                I2CCC26XX_cancel(handle);

                HwiP_restore(key);

                /*
                 *  We must wait until the STOP interrupt occurs. When this
                 *  occurs, the semaphore will be posted. Since the STOP
                 *  condition will finish the current burst, we can't
                 *  unblock the object->mutex until this occurs.
                 *
                 *  This may block forever if the slave holds the clock line--
                 *  rendering the I2C bus un-usable.
                 */
                SemaphoreP_pend(&(object->transferComplete),
                    SemaphoreP_WAIT_FOREVER);

                transaction->status = I2C_STATUS_TIMEOUT;
            }
            else {
                HwiP_restore(key);
            }
        }

        ret = transaction->status;
    }

    /* Release the lock for this particular I2C handle */
    SemaphoreP_post(&(object->mutex));

    /* Return status */
    return (ret);
}

/*
 *  ======== I2CCC26XX_completeTransfer ========
 *  This function may be invoked in the context of the HWI.
 */
static inline void I2CCC26XX_completeTransfer(I2C_Handle handle)
{
    I2CCC26XX_Object *object = handle->object;
    I2CCC26XX_HWAttrsV1 const * hwAttrs = handle->hwAttrs;

    /* Disable and clear any interrupts */
    I2CMasterIntDisable(hwAttrs->baseAddr);
    I2CMasterIntClear(hwAttrs->baseAddr);

    SwiP_post(&(object->swi));
}

/*
 *  ======== I2CCC26XX_blockingCallback ========
 */
static void I2CCC26XX_blockingCallback(I2C_Handle handle,
   I2C_Transaction *msg, bool transferStatus)
{
    I2CCC26XX_Object *object = handle->object;

    SemaphoreP_post(&(object->transferComplete));
}

/*
 *  ======== I2CCC26XX_initHw ========
 *  This functions initializes the I2C hardware module.
 *
 *  @pre    Function assumes that the I2C handle is pointing to a hardware
 *          module which has already been opened.
 */
static void I2CCC26XX_initHw(I2C_Handle handle) {
    I2CCC26XX_Object *object = handle->object;
    I2CCC26XX_HWAttrsV1 const  *hwAttrs = handle->hwAttrs;
    ClockP_FreqHz freq;

    /* Disable and clear interrupts */
    I2CMasterIntDisable(hwAttrs->baseAddr);
    I2CMasterIntClear(hwAttrs->baseAddr);

    /* Set the I2C configuration */
    ClockP_getCpuFreq(&freq);
    I2CMasterInitExpClk(hwAttrs->baseAddr, freq.lo,
        object->bitRate > I2C_100kHz);

    /* Enable the I2C Master for operation */
    I2CMasterEnable(hwAttrs->baseAddr);
}

/*
 *  ======== I2CCC26XX_initIO ========
 *  This functions initializes the I2C IOs.
 *
 *  @pre    Function assumes that the I2C handle is pointing to a hardware
 *          module which has already been opened.
 */
static int I2CCC26XX_initIO(I2C_Handle handle, void *pinCfg) {
    I2CCC26XX_Object            *object;
    I2CCC26XX_HWAttrsV1 const  *hwAttrs;
    I2CCC26XX_I2CPinCfg         i2cPins;
    PIN_Config                  i2cPinTable[3];
    uint32_t i=0;

    /* Get the pointer to the object and hwAttrs */
    object = handle->object;
    hwAttrs = handle->hwAttrs;

    /* If the pinCfg pointer is NULL, use hwAttrs pins */
    if (pinCfg == NULL) {
        i2cPins.pinSDA = hwAttrs->sdaPin;
        i2cPins.pinSCL = hwAttrs->sclPin;
    } else {
        i2cPins.pinSDA = ((I2CCC26XX_I2CPinCfg *)pinCfg)->pinSDA;
        i2cPins.pinSCL = ((I2CCC26XX_I2CPinCfg *)pinCfg)->pinSCL;
    }

    /* Handle error */
    if(i2cPins.pinSDA == PIN_UNASSIGNED || i2cPins.pinSCL == PIN_UNASSIGNED) {
        return (I2C_STATUS_ERROR);
    }
    /* Configure I2C pins SDA and SCL*/
    i2cPinTable[i++] = i2cPins.pinSDA | PIN_INPUT_EN | PIN_PULLUP | PIN_OPENDRAIN;
    i2cPinTable[i++] = i2cPins.pinSCL | PIN_INPUT_EN | PIN_PULLUP | PIN_OPENDRAIN;
    i2cPinTable[i++] = PIN_TERMINATE;

    /* Allocate pins*/
    object->hPin = PIN_open(&object->pinState, i2cPinTable);

    if (!object->hPin) {
        return (I2C_STATUS_ERROR);
    }

    /* Set IO muxing for the I2C pins */
    PINCC26XX_setMux(object->hPin, i2cPins.pinSDA, IOC_PORT_MCU_I2C_MSSDA);
    PINCC26XX_setMux(object->hPin, i2cPins.pinSCL, IOC_PORT_MCU_I2C_MSSCL);

    return (I2C_STATUS_SUCCESS);
}

/*
 *  ======== i2cPostNotify ========
 *  This functions is called to notify the I2C driver of an ongoing transition
 *  out of sleep mode.
 *
 *  @pre    Function assumes that the I2C handle (clientArg) is pointing to a
 *          hardware module which has already been opened.
 */
static int i2cPostNotify(unsigned int eventType, uintptr_t eventArg, uintptr_t clientArg)
{

    /* reconfigure the hardware if returning from sleep*/
    if (eventType == PowerCC26XX_AWAKE_STANDBY) {
         I2CCC26XX_initHw((I2C_Handle)clientArg);
    }

    return (Power_NOTIFYDONE);
}
