/*
 * Copyright (c) 2019-2020, Texas Instruments Incorporated
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
 *  ======== UART2CC26X2.c ========
 */

#include <stdint.h>
#include <stdbool.h>

#include <ti/drivers/dpl/ClockP.h>
#include <ti/drivers/dpl/HwiP.h>
#include <ti/drivers/dpl/SemaphoreP.h>

#include <ti/drivers/Power.h>
#include <ti/drivers/power/PowerCC26X2.h>
#include <ti/drivers/dma/UDMACC26XX.h>
#include <ti/drivers/uart2/UART2CC26X2.h>
#include <ti/drivers/pin/PINCC26XX.h>

#include <ti/devices/DeviceFamily.h>
#include DeviceFamily_constructPath(inc/hw_memmap.h)
#include DeviceFamily_constructPath(inc/hw_ints.h)
#include DeviceFamily_constructPath(inc/hw_types.h)
#include DeviceFamily_constructPath(driverlib/uart.h)
#include DeviceFamily_constructPath(driverlib/sys_ctrl.h)
#include DeviceFamily_constructPath(driverlib/ioc.h)
#include DeviceFamily_constructPath(driverlib/aon_ioc.h)

#if defined(__IAR_SYSTEMS_ICC__)
#include <intrinsics.h>
#endif

#define MIN(a,b) (((a)<(b))?(a):(b))

/* Size of the TX and RX FIFOs is 32 items */
#define FIFO_SIZE 32

/* Mazimum number of bytes that DMA can transfer */
#define MAX_SIZE 1024

/* Options for DMA write and read */
#define TX_CONTROL_OPTS  (UDMA_SIZE_8 | UDMA_SRC_INC_8 | UDMA_DST_INC_NONE | \
            UDMA_ARB_4 | UDMA_MODE_BASIC)
#define RX_CONTROL_OPTS  (UDMA_SIZE_8 | UDMA_SRC_INC_NONE | UDMA_DST_INC_8 | \
            UDMA_ARB_4 | UDMA_MODE_BASIC)

/* Allocate space for DMA control. */
ALLOCATE_CONTROL_TABLE_ENTRY(dmaUart0RxControlTableEntry, UDMA_CHAN_UART0_RX);
ALLOCATE_CONTROL_TABLE_ENTRY(dmaUart0TxControlTableEntry, UDMA_CHAN_UART0_TX);
ALLOCATE_CONTROL_TABLE_ENTRY(dmaUart1RxControlTableEntry, UDMA_CHAN_UART1_RX);
ALLOCATE_CONTROL_TABLE_ENTRY(dmaUart1TxControlTableEntry, UDMA_CHAN_UART1_TX);

/* Static functions */
static void configDmaRx(UART2_Handle handle);
static void configDmaTx(UART2_Handle handle);
static void UART2CC26X2_hwiIntFxn(uintptr_t arg);
static void cancelDmaRx(UART2_Handle handle);
static void enableRX(UART2_Handle handle);
static uint_fast16_t getPowerMgrId(uint32_t baseAddr);
static void initHw(UART2_Handle handle);
static bool initIO(UART2_Handle handle);
static int  postNotifyFxn(unsigned int eventType, uintptr_t eventArg,
        uintptr_t clientArg);
static int32_t readData(UART2_Handle handle, int32_t size);
static void readSemCallback(UART2_Handle handle, void *buffer, size_t count,
        void *userArg, int_fast16_t status);
static void readDone(UART2_Handle handle);
static void writeSemCallback(UART2_Handle handle, void *buffer, size_t count,
        void *userArg, int_fast16_t status);

/* UART function table for UART2CC26X2 implementation */
const UART2_FxnTable UART2CC26X2_fxnTable = {
    UART2CC26X2_close,
    UART2CC26X2_open,
    UART2CC26X2_read,
    UART2CC26X2_readCancel,
    UART2CC26X2_write,
    UART2CC26X2_writeCancel,
    UART2CC26X2_flushRx,
};

/* Map UART2 data length to driverlib data length */
static const uint32_t dataLength[] = {
    UART_CONFIG_WLEN_5,     /* UART2_DataLen_5 */
    UART_CONFIG_WLEN_6,     /* UART2_DataLen_6 */
    UART_CONFIG_WLEN_7,     /* UART2_DataLen_7 */
    UART_CONFIG_WLEN_8      /* UART2_DataLen_8 */
};

/* Map UART2 stop bits to driverlib stop bits */
static const uint32_t stopBits[] = {
    UART_CONFIG_STOP_ONE,   /* UART2_StopBits_1 */
    UART_CONFIG_STOP_TWO    /* UART2_StopBits_2 */
};

/* Map UART2 parity type to driverlib parity type */
static const uint32_t parityType[] = {
    UART_CONFIG_PAR_NONE,   /* UART2_Parity_NONE */
    UART_CONFIG_PAR_EVEN,   /* UART2_Parity_EVEN */
    UART_CONFIG_PAR_ODD,    /* UART2_Parity_ODD */
    UART_CONFIG_PAR_ZERO,   /* UART2_Parity_ZERO */
    UART_CONFIG_PAR_ONE     /* UART2_Parity_ONE */
};

/*
 *  Map UART2CC26X2 FIFO threshold types to driverlib TX FIFO threshold
 *  defines.
 */
static const uint8_t txFifoThreshold[5] = {
    UART_FIFO_TX1_8, /* UART2CC26X2_FIFO_THRESHOLD_1_8     */
    UART_FIFO_TX2_8, /* UART2CC26X2_FIFO_THRESHOLD_2_8     */
    UART_FIFO_TX4_8, /* UART2CC26X2_FIFO_THRESHOLD_4_8     */
    UART_FIFO_TX6_8, /* UART2CC26X2_FIFO_THRESHOLD_6_8     */
    UART_FIFO_TX7_8  /* UART2CC26X2_FIFO_THRESHOLD_7_8     */
};

/*
 *  Map UART2CC26X2 FIFO threshold types to driverlib RX FIFO threshold
 *  defines.
 */
static const uint8_t rxFifoThreshold[5] = {
    UART_FIFO_RX1_8, /* UART2CC26X2_FIFO_THRESHOLD_1_8     */
    UART_FIFO_RX2_8, /* UART2CC26X2_FIFO_THRESHOLD_2_8     */
    UART_FIFO_RX4_8, /* UART2CC26X2_FIFO_THRESHOLD_4_8     */
    UART_FIFO_RX6_8, /* UART2CC26X2_FIFO_THRESHOLD_6_8     */
    UART_FIFO_RX7_8  /* UART2CC26X2_FIFO_THRESHOLD_7_8     */
};

/* Number of bytes in the RX FIFO at the corresponding FIFO threshold level */
static const uint8_t rxFifoBytes[6] = {
     4,   /* UART2CC26X2_FIFO_THRESHOLD_1_8     */
     8,   /* UART2CC26X2_FIFO_THRESHOLD_2_8     */
    16,   /* UART2CC26X2_FIFO_THRESHOLD_4_8     */
    24,   /* UART2CC26X2_FIFO_THRESHOLD_6_8     */
    28    /* UART2CC26X2_FIFO_THRESHOLD_7_8     */
};

/*
 *  ======== uartDmaEnable ========
 *  Atomic version of DriverLib UARTDMAEnable()
 */
static inline void uartDmaEnable(uint32_t ui32Base, uint32_t ui32DMAFlags)
{
    uintptr_t key;

    key = HwiP_disable();
    /* Set the requested bits in the UART DMA control register. */
    HWREG(ui32Base + UART_O_DMACTL) |= ui32DMAFlags;

    HwiP_restore(key);
}

/*
 *  ======== uartDmaDisable ========
 *  Atomic version of DriverLib UARTDMADisable()
 */
static inline void uartDmaDisable(uint32_t ui32Base, uint32_t ui32DMAFlags)
{
    uintptr_t key;

    key = HwiP_disable();
    /* Clear the requested bits in the UART DMA control register. */
    HWREG(ui32Base + UART_O_DMACTL) &= ~ui32DMAFlags;

    HwiP_restore(key);
}

/*
 *  ======== uartEnableCTS ========
 *  CTS only version of DriverLib UARTHwFlowControlEnable()
 */
static inline void uartEnableCTS(uint32_t ui32Base)
{
    HWREG(ui32Base + UART_O_CTL) |= (UART_CTL_CTSEN);
}

/*
 *  ======== uartEnableRTS ========
 *  RTS only version of DriverLib UARTHwFlowControlEnable()
 */
static inline void uartEnableRTS(uint32_t ui32Base)
{
    HWREG(ui32Base + UART_O_CTL) |= (UART_CTL_RTSEN);
}

/*
 *  ======== uartDisableCTS ========
 *  CTS only version of DriverLib UARTHwFlowControlDisable()
 */
static inline void uartDisableCTS(uint32_t ui32Base)
{
    HWREG(ui32Base + UART_O_CTL) &= ~(UART_CTL_CTSEN);
}

/*
 *  ======== uartDisableRTS ========
 *  RTS only version of DriverLib UARTHwFlowControlDisable()
 */
static inline void uartDisableRTS(uint32_t ui32Base)
{
    HWREG(ui32Base + UART_O_CTL) &= ~(UART_CTL_RTSEN);
}

/*
 *  ======== dmaChannelNum ========
 *  Get the channel number from the channel bit mask
 */
static inline uint32_t dmaChannelNum(uint32_t x) {
#if defined(__TI_COMPILER_VERSION__)
    return ((uint32_t) __clz(__rbit(x)));
#elif defined(__GNUC__)
    return ((uint32_t) __builtin_ctz(x));
#elif defined(__IAR_SYSTEMS_ICC__)
    return ((uint32_t) __CLZ(__RBIT(x)));
#else
    #error "Unsupported compiler"
#endif
}

/*
 *  ======== getRxStatus ========
 *  Get the left-most bit set in the RX error status (OE, BE, PE, FE)
 *  read from the RSR register:
 *      bit#   3   2   1   0
 *             OE  BE  PE  FE
 *  e.g., if OE and FE are both set, OE wins.  This will make it easier
 *  to convert an RX error status to a UART2 error code.
 */
static inline uint32_t getRxStatus(uint32_t x)
{
#if defined(__TI_COMPILER_VERSION__)
    return ((uint32_t) (x & (0x80000000 >> __clz(x))));
#elif defined(__GNUC__)
    return ((uint32_t) (x & (0x80000000 >> __builtin_clz(x))));
#elif defined(__IAR_SYSTEMS_ICC__)
    return ((uint32_t) (x & (0x80000000 >>  __CLZ(x))));
#else
    #error "Unsupported compiler"
#endif
}

/*
 *  ======== rxStatus2ErrorCode ========
 *  Convert RX status (OE, BE, PE, FE) to a UART2 error code.
 */
static inline int_fast16_t rxStatus2ErrorCode(uint32_t x)
{
    uint32_t status;

    status = getRxStatus(x);
    return (-((int_fast16_t)status));
}

/*
 * Function for checking whether flow control is enabled.
 */
static inline bool isFlowControlEnabled(UART2CC26X2_HWAttrs const *hwAttrs) {
    return (hwAttrs->flowControl == UART2CC26X2_FLOWCTRL_HARDWARE);
}

/*
 *  ======== UART2CC26X2_close ========
 */
void UART2CC26X2_close(UART2_Handle handle)
{
    UART2CC26X2_Object        *object = handle->object;
    UART2CC26X2_HWAttrs const *hwAttrs = handle->hwAttrs;

    /* Disable UART and interrupts. */
    UARTIntDisable(hwAttrs->baseAddr, UART_INT_TX | UART_INT_RX |
            UART_INT_RT | UART_INT_OE | UART_INT_BE | UART_INT_PE |
            UART_INT_FE | UART_INT_CTS);

    /*
     *  Disable the UART.  Do not call driverlib function
     *  UARTDisable() since it polls for BUSY bit to clear
     *  before disabling the UART FIFO and module.
     */
    /* Disable UART FIFO */
    HWREG(hwAttrs->baseAddr + UART_O_LCRH) &= ~(UART_LCRH_FEN);
    /* Disable UART module */
    HWREG(hwAttrs->baseAddr + UART_O_CTL) &= ~(UART_CTL_UARTEN | UART_CTL_TXE |
                                      UART_CTL_RXE);

    /* Deallocate pins */
    PIN_close(object->hPin);

    HwiP_destruct(&(object->hwi));
    if (object->state.writeMode == UART2_Mode_BLOCKING) {
        SemaphoreP_destruct(&(object->writeSem));
    }
    if (object->state.readMode == UART2_Mode_BLOCKING) {
        SemaphoreP_destruct(&(object->readSem));
    }

    /* Unregister power notification objects */
    Power_unregisterNotify(&object->postNotify);

    /* Release power dependency - i.e. potentially power down serial domain. */
    Power_releaseDependency(object->powerMgrId);

    object->state.opened = false;
}

/*
 *  ======== UART2CC26X2_flushRx ========
 */
void UART2CC26X2_flushRx(UART2_Handle handle)
{
    UART2CC26X2_HWAttrs const *hwAttrs = handle->hwAttrs;

    /* Read RX FIFO until empty */
    while (((int32_t)UARTCharGetNonBlocking(hwAttrs->baseAddr)) != -1);

    /* Clear any read errors */
    UARTRxErrorClear(hwAttrs->baseAddr);
}

/*
 *  ======== UART2CC26X2_hwiIntFxn ========
 *  Hwi function that processes UART interrupts.
 */
static void UART2CC26X2_hwiIntFxn(uintptr_t arg)
{
    uint32_t                   status;
    uint32_t                   errStatus = 0;
    uint32_t                   bytesToRead;
    uint32_t                   fifoThresholdBytes;
    UART2_Handle               handle = (UART2_Handle)arg;
    UART2CC26X2_HWAttrs const *hwAttrs = handle->hwAttrs;
    UART2CC26X2_Object        *object = handle->object;
    UDMACC26XX_HWAttrs  const *hwAttrsUdma;

    hwAttrsUdma = object->udmaHandle->hwAttrs;  /* For error case */

    /* Clear interrupts */
    status = UARTIntStatus(hwAttrs->baseAddr, true);
    UARTIntClear(hwAttrs->baseAddr, status);

    if (status & (UART_INT_OE | UART_INT_BE | UART_INT_PE | UART_INT_FE)) {
        /* Handle the error */
        if (object->state.readReturnMode != UART2_ReadReturnMode_PARTIAL) {
            UARTDMADisable(hwAttrs->baseAddr, UART_DMA_RX);
            UDMACC26XX_clearInterrupt(object->udmaHandle,
                    hwAttrs->rxChannelMask);

            /* Number of bytes not yet transferred by the DMA */
            bytesToRead = uDMAChannelSizeGet(hwAttrsUdma->baseAddr,
                    dmaChannelNum(hwAttrs->rxChannelMask));
            object->bytesRead += (object->readCount - bytesToRead);
        }

        errStatus = UARTRxErrorGet(hwAttrs->baseAddr);
        object->rxStatus = rxStatus2ErrorCode(errStatus);

        readDone(handle);
    }
    else if (status & UART_INT_RT) {
        if ((object->state.readReturnMode == UART2_ReadReturnMode_PARTIAL) &&
                object->readCount > 0) {
            readData(handle, object->readCount);

            readDone(handle);
        }
    }
    else if ((status & UART_INT_RX) &&
             (object->state.readReturnMode == UART2_ReadReturnMode_PARTIAL)) {
        /* Must leave at least one byte in the fifo to get read timeout */
        fifoThresholdBytes = rxFifoBytes[hwAttrs->rxIntFifoThr];
        bytesToRead = MIN(fifoThresholdBytes - 1, object->readCount);
        readData(handle, bytesToRead);

        if (object->readCount == 0) {
            readDone(handle);
        }
    }

    /* UDMACC26XX_channelDone() checks for rxChannel bit set in REQDONE */
    if (UDMACC26XX_channelDone(object->udmaHandle, hwAttrs->rxChannelMask)) {
        UARTDMADisable(hwAttrs->baseAddr, UART_DMA_RX);
        UDMACC26XX_clearInterrupt(object->udmaHandle, hwAttrs->rxChannelMask);

        if (object->readCount != 0) {
            object->bytesRead += object->rxSize;
            object->readCount -= object->rxSize;

            if (--object->nReadTransfers == 0) {
                readDone(handle);
            }
            else {
                /* Start a new DMA transferred */
                configDmaRx(handle);
            }
        }
    }

    if (UDMACC26XX_channelDone(object->udmaHandle, hwAttrs->txChannelMask)) {
        /* Write finished */
        UARTDMADisable(hwAttrs->baseAddr, UART_DMA_TX);
        UDMACC26XX_clearInterrupt(object->udmaHandle, hwAttrs->txChannelMask);

        object->bytesWritten += object->txSize;
        object->writeCount -= object->txSize;

        if ((object->writeSize) && (--object->nWriteTransfers > 0)) {
            configDmaTx(handle);
        }
        else {
            UARTIntEnable(hwAttrs->baseAddr, UART_INT_EOT);
            if (!UARTBusy(hwAttrs->baseAddr)) {
                if ((object->writeCount == 0) && (object->writeSize > 0)) {
                    /* Disable TX */
                    HWREG(hwAttrs->baseAddr + UART_O_CTL) &= ~(UART_CTL_TXE);

                    Power_releaseConstraint(PowerCC26XX_DISALLOW_STANDBY);
                    object->state.txEnabled = false;
                    object->writeSize = 0;
                    object->writeCallback(handle, (void *)object->writeBuf,
                            object->bytesWritten, object->userArg,
                            object->txStatus);
                    UARTIntDisable(hwAttrs->baseAddr, UART_INT_EOT);
                    UARTIntClear(hwAttrs->baseAddr, UART_INT_EOT);
                }
            }
        }
    }
    if (status & (UART_INT_EOT)) {
        /* Check txEnabled in case writeCancel was called */
        if ((object->writeCount == 0) && object->state.txEnabled) {
            /* Disable TX */
            HWREG(hwAttrs->baseAddr + UART_O_CTL) &= ~(UART_CTL_TXE);

            Power_releaseConstraint(PowerCC26XX_DISALLOW_STANDBY);
            object->state.txEnabled = false;
            object->writeCallback(handle, (void *)object->writeBuf,
                    object->bytesWritten, object->userArg, object->txStatus);
        }
        UARTIntDisable(hwAttrs->baseAddr, UART_INT_EOT);
    }
}

/*
 *  ======== UART2CC26X2_open ========
 */
UART2_Handle UART2CC26X2_open(uint_least8_t index, UART2_Params *params)
{
    UART2_Handle               handle = NULL;
    uintptr_t                  key;
    UART2CC26X2_Object        *object;
    UART2CC26X2_HWAttrs const *hwAttrs;
    HwiP_Params                hwiParams;


    if (index < UART2_count) {
        handle = (UART2_Handle)&(UART2_config[index]);
        hwAttrs = handle->hwAttrs;
        object = handle->object;
    }
    else {
        return (NULL);
    }

    /* Check for callback when in UART_MODE_CALLBACK */
    if (((params->readMode == UART2_Mode_CALLBACK) &&
            (params->readCallback == NULL)) ||
            ((params->writeMode == UART2_Mode_CALLBACK) &&
                    (params->writeCallback == NULL))) {
        return (NULL);
    }

    key = HwiP_disable();

    if (object->state.opened) {
        HwiP_restore(key);

        return (NULL);
    }
    object->state.opened = true;

    HwiP_restore(key);

    object->state.txEnabled      = false;
    object->state.readMode       = params->readMode;
    object->state.writeMode      = params->writeMode;
    object->state.readReturnMode = params->readReturnMode;
    object->readCallback         = params->readCallback;
    object->writeCallback        = params->writeCallback;
    object->baudRate             = params->baudRate;
    object->stopBits             = params->stopBits;
    object->dataLength           = params->dataLength;
    object->parityType           = params->parityType;
    object->userArg              = params->userArg;

    /* Set UART transaction variables to defaults. */
    object->writeBuf             = NULL;
    object->readBuf              = NULL;
    object->writeCount           = 0;
    object->readCount            = 0;
    object->writeSize            = 0;
    object->readSize             = 0;
    object->nWriteTransfers      = 0;
    object->nReadTransfers       = 0;
    object->rxStatus             = 0;
    object->txStatus             = 0;

    /* Determine the Power resource Id from the UART base address */
    object->powerMgrId = getPowerMgrId(hwAttrs->baseAddr);
    if (object->powerMgrId >= PowerCC26X2_NUMRESOURCES) {
        return (NULL);
    }

    /* Register power dependency - i.e. power up and enable clock for UART. */
    Power_setDependency(object->powerMgrId);

    UARTDisable(hwAttrs->baseAddr);

    /* Configure IOs, make sure it was successful */
    if (!initIO(handle)) {
        /* Another driver or application already using these pins. */
        /* Release power dependency */
        Power_releaseDependency(object->powerMgrId);
        /* Mark the module as available */
        object->state.opened = false;
        return (NULL);
    }

    /* Always succeeds */
    object->udmaHandle = UDMACC26XX_open();

    /*
     *  Initialize the UART hardware module.  Enable the UART and FIFO,
     *  but do not enable RX or TX yet.
     */
    initHw(handle);

    /* Register notification function */
    Power_registerNotify(&object->postNotify, PowerCC26XX_AWAKE_STANDBY,
            postNotifyFxn, (uintptr_t)handle);

    /* Create Hwi object for this UART peripheral. */
    HwiP_Params_init(&hwiParams);
    hwiParams.arg = (uintptr_t)handle;
    hwiParams.priority = hwAttrs->intPriority;
    HwiP_construct(&(object->hwi), hwAttrs->intNum, UART2CC26X2_hwiIntFxn,
            &hwiParams);

    /* If read mode is blocking create a semaphore and set callback. */
    if (object->state.readMode == UART2_Mode_BLOCKING) {
        SemaphoreP_constructBinary(&(object->readSem), 0);
        object->readCallback = &readSemCallback;
    }

    /* If write mode is blocking create a semaphore and set callback. */
    if (object->state.writeMode == UART2_Mode_BLOCKING) {
        SemaphoreP_constructBinary(&(object->writeSem), 0);
        object->writeCallback = &writeSemCallback;
    }

    /* Set rx src and tx dst addresses in open, since these won't change */
    if (hwAttrs->baseAddr == UART0_BASE) {
        object->rxDmaEntry = &dmaUart0RxControlTableEntry;
        object->txDmaEntry = &dmaUart0TxControlTableEntry;
    }
    else {
        object->rxDmaEntry = &dmaUart1RxControlTableEntry;
        object->txDmaEntry = &dmaUart1TxControlTableEntry;
    }
    object->rxDmaEntry->pvSrcEndAddr = (void *)(hwAttrs->baseAddr + UART_O_DR);
    object->txDmaEntry->pvDstEndAddr = (void *)(hwAttrs->baseAddr + UART_O_DR);

    /* UART opened successfully */
    return (handle);
}

/*
 *  ======== UART2CC26X2_read ========
 */
int_fast16_t UART2CC26X2_read(UART2_Handle handle, void *buffer,
        size_t size, size_t *bytesRead, uint32_t timeout)
{
    uintptr_t                  key;
    UART2CC26X2_Object        *object = handle->object;
    UART2CC26X2_HWAttrs const *hwAttrs = handle->hwAttrs;
    int                        status = UART2_STATUS_SUCCESS;
    unsigned char             *buf = (unsigned char *)buffer;
    int32_t                    data;
    size_t                     nBytesRead;
    size_t                    *pNBytesRead;
    uint32_t                   errStatus;

    pNBytesRead = (bytesRead == NULL) ? &nBytesRead : bytesRead;
    *pNBytesRead = 0;

    /* Check for Rx error since the last read */
    errStatus = UARTRxErrorGet(hwAttrs->baseAddr);
    status = rxStatus2ErrorCode(errStatus);
    UARTRxErrorClear(hwAttrs->baseAddr); /* Clear receive errors */

    if (status != UART2_STATUS_SUCCESS) {
        object->readSize = 0;
        return (status);
    }

    key = HwiP_disable();

    if (object->readSize) {
        /* Another read is ongoing */
        HwiP_restore(key);
        return (UART2_STATUS_EINUSE);
    }

    /* Save the data to be read and restore interrupts. */
    object->readBuf = (unsigned char *)buffer;
    object->readSize = size;
    object->readCount = size; /* Number remaining to be read */
    object->bytesRead = 0;    /* Number of bytes read */
    object->rxStatus = 0;     /* Clear receive errors */

    HwiP_restore(key);

    /* Enable RX and set the Power constraint */
    enableRX(handle);

    if (object->state.readMode == UART2_Mode_POLLING) {
        while (size) {
            data = UARTCharGetNonBlocking(hwAttrs->baseAddr);
            if (data == -1) {
                break;
            }
            /* Convert error code in upper bytes of data to a UART2 status */
            status = rxStatus2ErrorCode((data >> 8) & 0xF);
            if (status < 0) {
                break;
            }
            *buf++ = data & 0xFF;
            size--;
        }
        *pNBytesRead = object->readSize - size;

        /* Set readSize to 0 to allow another read */
        object->readCount = 0;
        object->readSize = 0;

        return (status);
    }

    Power_setConstraint(PowerCC26XX_DISALLOW_STANDBY);

    /*
     *  Don't use DMA for return partial mode, since we have to leave
     *  one byte in the FIFO to get the read timeout.
     */
    if (object->state.readReturnMode == UART2_ReadReturnMode_PARTIAL) {
        /* Enable RX and error interrupts */
        UARTIntEnable(hwAttrs->baseAddr, UART_INT_RX | UART_INT_RT |
                UART_INT_OE | UART_INT_BE | UART_INT_PE | UART_INT_FE);
    }
    else {
        /* Can transfer maximum of 1024 bytes in one DMA transfer */
        object->nReadTransfers = (object->readSize + MAX_SIZE - 1) / MAX_SIZE;
        configDmaRx(handle);
    }

    if (object->state.readMode == UART2_Mode_BLOCKING) {
        if (SemaphoreP_OK != SemaphoreP_pend(&(object->readSem), timeout)) {
            key = HwiP_disable();
            if (object->readSize == 0) {
                /* Interrupt occurred just after SemaphoreP_pend() timeout */
                status = object->rxStatus;
                SemaphoreP_pend(&(object->readSem), SemaphoreP_NO_WAIT);
                HwiP_restore(key);
            }
            else {
                status = UART2_STATUS_ETIMEOUT;

                /* Set readCount to 0 to prevent ISR from doing more work */
                object->readCount = 0;
                HwiP_restore(key);

                cancelDmaRx(handle);

                /* Release the power constraint */
                Power_releaseConstraint(PowerCC26XX_DISALLOW_STANDBY);
            }
        }
        else {
            status = object->rxStatus;
        }

        *pNBytesRead = object->bytesRead;
        object->readSize = 0;  /* Allow the next read */
    }
    else {
        /* ISR will do the work */
    }

    return (status);
}

/*
 *  ======== UART2CC26X2_readCancel ========
 */
void UART2CC26X2_readCancel(UART2_Handle handle)
{
    UART2CC26X2_Object *object = handle->object;
    uintptr_t           key;

    if (object->state.readMode == UART2_Mode_POLLING) {
        return;
    }

    key = HwiP_disable();

    cancelDmaRx(handle);

    if (object->readSize == 0) {
        HwiP_restore(key);
        return;
    }

    /* Release the power constraint */
    Power_releaseConstraint(PowerCC26XX_DISALLOW_STANDBY);

    object->readSize = 0;
    object->rxStatus = UART2_STATUS_ECANCELLED;

    HwiP_restore(key);

    object->readCallback(handle, object->readBuf, object->bytesRead,
            object->userArg, UART2_STATUS_ECANCELLED);
}

/*
 *  ======== UART2CC26X2_write ========
 */
int_fast16_t UART2CC26X2_write(UART2_Handle handle, const void *buffer,
        size_t size, size_t *bytesWritten, uint32_t timeout)
{
    UART2CC26X2_Object        *object = handle->object;
    UART2CC26X2_HWAttrs const *hwAttrs = handle->hwAttrs;
    uintptr_t                  key;
    int                        status = UART2_STATUS_SUCCESS;
    uint32_t                   writeCount;
    unsigned char             *buf = (unsigned char *)buffer;
    size_t                     nBytesWritten;
    size_t                    *pNBytesWritten;

    if (size == 0) {
        return (UART2_STATUS_EINVALID);
    }

    pNBytesWritten = (bytesWritten == NULL) ? &nBytesWritten : bytesWritten;

    key = HwiP_disable();

    /*
     *  Make sure any previous write has finished.  If TX is still
     *  enabled, the write has not yet finished.
     *  In blocking mode, UART2_cancel() may have posted the semaphore,
     *  so we use writeSize to ensure that there are no on-going writes.
     *  This ensures that we can return the txStatus to the caller without
     *  it having been reset to 0 by a pre-empting thread.
     */
    if (object->state.txEnabled ||
            (object->writeSize &&
                    (object->state.writeMode == UART2_Mode_BLOCKING))) {
        HwiP_restore(key);
        return (UART2_STATUS_EINUSE);
    }

    /* Save the data to be written and restore interrupts. */
    object->writeBuf = buffer;
    object->writeSize = size;
    object->writeCount = size;
    object->bytesWritten = 0;

    object->state.txEnabled = true;
    object->txStatus = UART2_STATUS_SUCCESS;

    /* Enable TX - interrupts must be disabled */
    HWREG(hwAttrs->baseAddr + UART_O_CTL) |= UART_CTL_TXE;

    HwiP_restore(key);

    if (object->state.writeMode == UART2_Mode_POLLING) {
        writeCount = 0;
        while (size) {
            if (!UARTCharPutNonBlocking(hwAttrs->baseAddr, *buf)) {
                break;
            }
            buf++;
            writeCount++;
            size--;
        }
        *pNBytesWritten = writeCount;
        object->state.txEnabled = false;
        return (status);
    }

    /* Set constraints to guarantee transaction */
    Power_setConstraint(PowerCC26XX_DISALLOW_STANDBY);

    object->nWriteTransfers = (object->writeSize + MAX_SIZE - 1) / MAX_SIZE;
    configDmaTx(handle);

    /* If writeMode is blocking, block and get the state. */
    if (object->state.writeMode == UART2_Mode_BLOCKING) {
        /* Pend on semaphore and wait for Hwi to finish. */
        if (SemaphoreP_OK != SemaphoreP_pend(&(object->writeSem), timeout)) {
            /* Semaphore timed out, make the write empty */
            key = HwiP_disable();
            UARTIntDisable(hwAttrs->baseAddr, UART_INT_TX | UART_INT_EOT);
            UARTIntClear(hwAttrs->baseAddr, UART_INT_TX | UART_INT_EOT);

            if (object->state.txEnabled) {

                /* Disable TX */
                HWREG(hwAttrs->baseAddr + UART_O_CTL) &= ~(UART_CTL_TXE);

                Power_releaseConstraint(PowerCC26XX_DISALLOW_STANDBY);
                object->state.txEnabled = false;
                object->txStatus = UART2_STATUS_ETIMEOUT;
            }
            HwiP_restore(key);
        }
        status = object->txStatus; /* UART2_cancel() may have posted sem */
        *pNBytesWritten = object->bytesWritten;
        object->writeSize = 0;  /* Allow the next UART2_write */
        object->state.txEnabled = false;
    }

    return (status);
}

/*
 *  ======== UART2CC26X2_writeCancel ========
 */
void UART2CC26X2_writeCancel(UART2_Handle handle)
{
    UART2CC26X2_Object        *object = handle->object;
    UART2CC26X2_HWAttrs const *hwAttrs = handle->hwAttrs;
    UDMACC26XX_HWAttrs  const *hwAttrsUdma;
    uintptr_t                  key;
    uint32_t                   bytesRemaining;

    hwAttrsUdma = object->udmaHandle->hwAttrs;

    key = HwiP_disable();

    UARTDMADisable(hwAttrs->baseAddr, UART_DMA_TX);
    UDMACC26XX_channelDisable(object->udmaHandle, hwAttrs->txChannelMask);
    UDMACC26XX_clearInterrupt(object->udmaHandle, hwAttrs->txChannelMask);

    /* Return if there is no write */
    if ((object->writeSize == 0) && !object->state.txEnabled) {
        HwiP_restore(key);
        return;
    }

    object->state.txEnabled = false;

    bytesRemaining = uDMAChannelSizeGet(hwAttrsUdma->baseAddr,
            hwAttrs->txChannelMask >> 1);

    object->bytesWritten += object->writeCount - bytesRemaining;
    Power_releaseConstraint(PowerCC26XX_DISALLOW_STANDBY);
    object->writeSize = 0;
    object->txStatus = UART2_STATUS_ECANCELLED;

    HwiP_restore(key);

    object->writeCallback(handle, (void *)object->writeBuf,
            object->bytesWritten, object->userArg, UART2_STATUS_ECANCELLED);
}

/*
 *  ======== cancelDmaRx ========
 */
static void cancelDmaRx(UART2_Handle handle)
{
    UART2CC26X2_Object        *object = handle->object;
    UART2CC26X2_HWAttrs const *hwAttrs = handle->hwAttrs;
    UDMACC26XX_HWAttrs  const *hwAttrsUdma;
    uintptr_t                  key;
    uint32_t                   bytesRemaining;

    hwAttrsUdma = object->udmaHandle->hwAttrs;

    if ((object->state.readReturnMode == UART2_ReadReturnMode_PARTIAL) ||
            (object->state.readMode == UART2_Mode_POLLING)) {
        return;
    }

    key = HwiP_disable();

    /*
     *  Disable the uDMA channel before disabling UART_DMA_RX.  When
     *  UART_DMA_RX was disabled before the uDMA channel, the last
     *  input character on canceling the DMA was sometimes duplicated
     *  up to 3 times.
     */
    UDMACC26XX_channelDisable(object->udmaHandle, hwAttrs->rxChannelMask);
    UARTDMADisable(hwAttrs->baseAddr, UART_DMA_RX);
    UDMACC26XX_clearInterrupt(object->udmaHandle, hwAttrs->rxChannelMask);

    /* Return if there is no read */
    if (object->readSize == 0) {
        HwiP_restore(key);
        return;
    }

    bytesRemaining = uDMAChannelSizeGet(hwAttrsUdma->baseAddr,
            dmaChannelNum(hwAttrs->rxChannelMask));

    object->bytesRead += object->readCount - bytesRemaining;

    HwiP_restore(key);
}

/*
 *  ======== configDmaRx ========
 */
static void configDmaRx(UART2_Handle handle)
{
    UART2CC26X2_Object        *object = handle->object;
    UART2CC26X2_HWAttrs const *hwAttrs = handle->hwAttrs;
    volatile                   tDMAControlTable *rxDmaEntry;
    uint32_t                   rxSize;

    rxDmaEntry = object->rxDmaEntry;
    rxDmaEntry->ui32Control = RX_CONTROL_OPTS;

    rxSize = MIN(object->readCount, MAX_SIZE);
    object->rxSize = rxSize;

    rxDmaEntry->pvDstEndAddr = (void *)(object->readBuf +
            object->bytesRead + rxSize - 1);

    /* Set the size in the control options */
    rxDmaEntry->ui32Control |= UDMACC26XX_SET_TRANSFER_SIZE(rxSize);

    UDMACC26XX_channelEnable(object->udmaHandle, hwAttrs->rxChannelMask);

    uartDmaEnable(hwAttrs->baseAddr, UART_DMA_RX);
}

/*
 *  ======== configDmaTx ========
 */
static void configDmaTx(UART2_Handle handle)
{
    UART2CC26X2_Object        *object = handle->object;
    UART2CC26X2_HWAttrs const *hwAttrs = handle->hwAttrs;
    volatile                   tDMAControlTable *txDmaEntry;
    uint32_t                   txSize;

    txDmaEntry = object->txDmaEntry;
    txDmaEntry->ui32Control = TX_CONTROL_OPTS;

    /* TransferSize must be <= 1024 */
    txSize = MIN(object->writeCount, MAX_SIZE);
    object->txSize = txSize;

    txDmaEntry->pvSrcEndAddr = (void *)(object->writeBuf +
            object->bytesWritten + txSize - 1);

    /* Set the size in the control options */
    txDmaEntry->ui32Control |= UDMACC26XX_SET_TRANSFER_SIZE(txSize);

    UDMACC26XX_channelEnable(object->udmaHandle, hwAttrs->txChannelMask);
    uartDmaEnable(hwAttrs->baseAddr, UART_DMA_TX);
}

/*
 *  ======== enableRX ========
 */
static void enableRX(UART2_Handle handle)
{
    UART2CC26X2_HWAttrs const *hwAttrs = handle->hwAttrs;
    uintptr_t                  key;

    key = HwiP_disable();

    /* Enable RX but not interrupts, since we may be using DMA */
    HWREG(hwAttrs->baseAddr + UART_O_CTL) |= UART_CTL_RXE;

    HwiP_restore(key);
}

/*
 *  ======== getPowerMgrId ========
 */
static uint_fast16_t getPowerMgrId(uint32_t baseAddr)
{
    switch (baseAddr) {
        case UART0_BASE:
            return (PowerCC26XX_PERIPH_UART0);
        case UART1_BASE:
            return (PowerCC26X2_PERIPH_UART1);
        default:
            return ((uint_fast16_t)(~0U));
    }
}

/*
 *  ======== initHw ========
 */
static void initHw(UART2_Handle handle)
{
    ClockP_FreqHz              freq;
    UART2CC26X2_Object        *object = handle->object;
    UART2CC26X2_HWAttrs const *hwAttrs = handle->hwAttrs;

    /*
     *  Configure frame format and baudrate.  UARTConfigSetExpClk() disables
     *  the UART and does not re-enable it, so call this function first.
     */
    ClockP_getCpuFreq(&freq);
    UARTConfigSetExpClk(hwAttrs->baseAddr, freq.lo, object->baudRate,
                        dataLength[object->dataLength] |
                        stopBits[object->stopBits] |
                        parityType[object->parityType]);

    /* Clear all UART interrupts */
    UARTIntClear(hwAttrs->baseAddr, UART_INT_OE | UART_INT_BE | UART_INT_PE |
                                    UART_INT_FE | UART_INT_RT | UART_INT_TX |
                                    UART_INT_RX | UART_INT_CTS);

    /* Set TX interrupt FIFO level and RX interrupt FIFO level */
    UARTFIFOLevelSet(hwAttrs->baseAddr, txFifoThreshold[hwAttrs->txIntFifoThr],
            rxFifoThreshold[hwAttrs->rxIntFifoThr]);

    /*
     * If Flow Control is enabled, configure hardware flow control
     * for CTS and/or RTS.
     */
    if (isFlowControlEnabled(hwAttrs) && (hwAttrs->ctsPin != PIN_UNASSIGNED)) {
        uartEnableCTS(hwAttrs->baseAddr);
    }
    else {
        uartDisableCTS(hwAttrs->baseAddr);
    }

    if (isFlowControlEnabled(hwAttrs) && (hwAttrs->rtsPin != PIN_UNASSIGNED)) {
        uartEnableRTS(hwAttrs->baseAddr);
    }
    else {
        uartDisableRTS(hwAttrs->baseAddr);
    }

    /* Enable UART FIFOs */
    HWREG(hwAttrs->baseAddr + UART_O_LCRH) |= UART_LCRH_FEN;

    /* Enable the UART module, but not RX or TX */
    HWREG(hwAttrs->baseAddr + UART_O_CTL) |= UART_CTL_UARTEN;

    if ((hwAttrs->rxChannelMask > 0) && (hwAttrs->txChannelMask > 0)) {
        /* Prevent DMA interrupt on UART2CC26X2_open() */
        uartDmaDisable(hwAttrs->baseAddr, UART_DMA_RX);
        UDMACC26XX_channelDisable(object->udmaHandle, hwAttrs->rxChannelMask);
        UDMACC26XX_clearInterrupt(object->udmaHandle, hwAttrs->rxChannelMask);

        /* Disable the alternate DMA structure */
        UDMACC26XX_disableAttribute(object->udmaHandle,
                dmaChannelNum(hwAttrs->rxChannelMask), UDMA_ATTR_ALTSELECT);
        UDMACC26XX_disableAttribute(object->udmaHandle,
                dmaChannelNum(hwAttrs->txChannelMask), UDMA_ATTR_ALTSELECT);
    }
}

/*
 *  ======== initIO ========
 */
static bool initIO(UART2_Handle handle)
{
    UART2CC26X2_Object        *object = handle->object;
    UART2CC26X2_HWAttrs const *hwAttrs = handle->hwAttrs;
    PIN_Config                 uartPinTable[5];
    uint32_t                   pinCount = 0;

    /* Build local list of pins, allocate through PIN driver and map ports */
    uartPinTable[pinCount++] = hwAttrs->rxPin | PIN_INPUT_EN;

    /*
     *  Make sure UART_TX pin is driven high after calling PIN_open(...) until
     *  we've set the correct peripheral muxing in PINCC26XX_setMux(...).
     *  This is to avoid falling edge glitches when configuring the
     *  UART_TX pin.
     */
    uartPinTable[pinCount++] = hwAttrs->txPin | PIN_INPUT_DIS | PIN_PUSHPULL |
            PIN_GPIO_OUTPUT_EN | PIN_GPIO_HIGH;

    if (isFlowControlEnabled(hwAttrs)) {
        if (hwAttrs->ctsPin != PIN_UNASSIGNED) {
            uartPinTable[pinCount++] = hwAttrs->ctsPin | PIN_INPUT_EN;
        }

        if (hwAttrs->rtsPin != PIN_UNASSIGNED) {
            /* Avoiding glitches on the RTS, see comment for TX pin above. */
            uartPinTable[pinCount++] = hwAttrs->rtsPin | PIN_INPUT_DIS |
                    PIN_PUSHPULL | PIN_GPIO_OUTPUT_EN | PIN_GPIO_HIGH;
        }
    }

    /* Terminate pin list */
    uartPinTable[pinCount] = PIN_TERMINATE;

    /* Open and assign pins through pin driver */
    object->hPin = PIN_open(&object->pinState, uartPinTable);

    if (!object->hPin) {
        return (false);
    }

    /* Set IO muxing for the UART pins */
    PINCC26XX_setMux(object->hPin, hwAttrs->rxPin,
            (hwAttrs->baseAddr == UART0_BASE ?
                    IOC_PORT_MCU_UART0_RX : IOC_PORT_MCU_UART1_RX));
    PINCC26XX_setMux(object->hPin, hwAttrs->txPin,
            (hwAttrs->baseAddr == UART0_BASE ?
                    IOC_PORT_MCU_UART0_TX : IOC_PORT_MCU_UART1_TX));

    if (isFlowControlEnabled(hwAttrs)) {
        if (hwAttrs->ctsPin != PIN_UNASSIGNED) {
            PINCC26XX_setMux(object->hPin, hwAttrs->ctsPin,
                    (hwAttrs->baseAddr == UART0_BASE ?
                            IOC_PORT_MCU_UART0_CTS : IOC_PORT_MCU_UART1_CTS));
        }

        if (hwAttrs->rtsPin != PIN_UNASSIGNED) {
            PINCC26XX_setMux(object->hPin, hwAttrs->rtsPin,
                    (hwAttrs->baseAddr == UART0_BASE ?
                            IOC_PORT_MCU_UART0_RTS : IOC_PORT_MCU_UART1_RTS));
        }
    }

    return (true);
}

/*
 *  ======== postNotifyFxn ========
 *  Called by Power module when waking up from LPDS.
 */
static int postNotifyFxn(unsigned int eventType, uintptr_t eventArg,
        uintptr_t clientArg)
{
    /* Reconfigure the hardware if returning from sleep */
    if (eventType == PowerCC26XX_AWAKE_STANDBY) {
        initHw((UART2_Handle) clientArg);
    }

    return (Power_NOTIFYDONE);
}

/*
 *  ======== readData ========
 */
static int32_t readData(UART2_Handle handle, int32_t size)
{
    UART2CC26X2_Object         *object = handle->object;
    UART2CC26X2_HWAttrs const  *hwAttrs = handle->hwAttrs;;
    int32_t                     data;

    if (size > object->readCount) {
        size = object->readCount;
    }

    while (size) {
        data = UARTCharGetNonBlocking(hwAttrs->baseAddr);
        if (data == -1) {
            break;
        }
        *(object->readBuf + object->bytesRead) = (uint8_t)(data & 0xFF);
        object->bytesRead++;
        object->readCount--;
        size--;
    }

    return (size);
}

/*
 *  ======== readDone ========
 *  Called from the ISR only.
 */
static void readDone(UART2_Handle handle)
{
    UART2CC26X2_Object *object = handle->object;
    size_t              count;

    if (object->readSize == 0) {
        return;
    }

    count = object->bytesRead;

    Power_releaseConstraint(PowerCC26XX_DISALLOW_STANDBY);

    /* Set readSize to 0 to allow UART2_read() to be called */
    object->readSize = 0;

    object->readCallback(handle, object->readBuf, count, object->userArg,
            object->rxStatus);
}

/*
 *  ======== readSemCallback ========
 *  Simple callback to post a semaphore for the blocking mode.
 */
static void readSemCallback(UART2_Handle handle, void *buffer, size_t count,
        void *userArg, int_fast16_t status)
{
    UART2CC26X2_Object *object = handle->object;

    SemaphoreP_post(&(object->readSem));
}

/*
 *  ======== writeSemCallback ========
 *  Simple callback to post a semaphore for the blocking mode.
 */
static void writeSemCallback(UART2_Handle handle, void *buffer, size_t count,
        void *userArg, int_fast16_t status)
{
    UART2CC26X2_Object *object = handle->object;

    SemaphoreP_post(&(object->writeSem));
}
