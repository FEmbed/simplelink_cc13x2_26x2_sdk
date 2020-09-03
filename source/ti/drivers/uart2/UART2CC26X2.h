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
/** ============================================================================
 *  @file       UART2CC26X2.h
 *
 *  @brief      UART driver implementation for a CC26X2 UART controller
 *
 *  The UART header file should be included in an application as follows:
 *  @code
 *  #include <ti/drivers/UART2.h>
 *  #include <ti/drivers/uart2/UART2CC26X2.h>
 *  @endcode
 *
 *  Refer to @ref UART2.h for a complete description of APIs and examples
 *  of use.
 *
 *  ============================================================================
 */

#ifndef ti_drivers_uart2_UART2CC26X2__include
#define ti_drivers_uart2_UART2CC26X2__include

#include <stddef.h>
#include <stdint.h>

#include <stdint.h>
#include <stdbool.h>

#include <ti/devices/DeviceFamily.h>
#include DeviceFamily_constructPath(inc/hw_types.h)
#include DeviceFamily_constructPath(driverlib/udma.h)

#include <ti/drivers/dpl/HwiP.h>
#include <ti/drivers/dpl/SemaphoreP.h>
#include <ti/drivers/UART2.h>
#include <ti/drivers/pin/PINCC26XX.h>
#include <ti/drivers/dma/UDMACC26XX.h>

#ifdef __cplusplus
extern "C" {
#endif

/*!
 * @brief No hardware flow control
 */
#define UART2CC26X2_FLOWCTRL_NONE 0

/*!
 * @brief Hardware flow control
 */
#define UART2CC26X2_FLOWCTRL_HARDWARE 1

/*! Size of the TX and RX FIFOs is 32 items */
#define UART2CC26X2_FIFO_SIZE 32

/*!
 *  @brief    UART TX/RX interrupt FIFO threshold select
 *
 *  Defined FIFO thresholds for generation of both TX interrupt and RX
 *  interrupt.  If the RX and TX FIFO and thresholds are not set in the
 *  HwAttrs, the RX interrupt FIFO threshold is set to 1/8 full, and the
 *  TX interrupt FIFO threshold is set to 1/8 full.
 */
typedef enum {
    UART2CC26X2_FIFO_THRESHOLD_1_8 = 0,     /*!< FIFO threshold of 1/8 full */
    UART2CC26X2_FIFO_THRESHOLD_2_8 = 1,     /*!< FIFO threshold of 2/8 full */
    UART2CC26X2_FIFO_THRESHOLD_4_8 = 2,     /*!< FIFO threshold of 4/8 full */
    UART2CC26X2_FIFO_THRESHOLD_6_8 = 3,     /*!< FIFO threshold of 6/8 full */
    UART2CC26X2_FIFO_THRESHOLD_7_8 = 4      /*!< FIFO threshold of 7/8 full */
} UART2CC26X2_FifoThreshold;

/* UART2CC26X2 functions */
extern void UART2CC26X2_close(UART2_Handle handle);
extern void UART2CC26X2_flushRx(UART2_Handle handle);
extern UART2_Handle UART2CC26X2_open(uint_least8_t, UART2_Params *params);
extern int_fast16_t UART2CC26X2_read(UART2_Handle handle, void *buffer,
        size_t size, size_t *bytesRead, uint32_t timeout);
extern void UART2CC26X2_readCancel(UART2_Handle handle);
extern int_fast16_t UART2CC26X2_write(UART2_Handle handle,
        const void *buffer, size_t size, size_t *bytesWritten,
        uint32_t timeout);
extern void UART2CC26X2_writeCancel(UART2_Handle handle);

/* UART2 function table pointer */
extern const UART2_FxnTable UART2CC26X2_fxnTable;

/*!
 *  @brief      UART2CC26X2 Hardware attributes
 *
 *  The fields, baseAddr and intNum are used by driverlib
 *  APIs and therefore must be populated by
 *  driverlib macro definitions. These definitions are found under the
 *  device family in:
 *      - inc/hw_memmap.h
 *      - inc/hw_ints.h
 *      - driverlib/uart.h
 *
 *  intPriority is the UART peripheral's interrupt priority, as defined by the
 *  underlying OS.  It is passed unmodified to the underlying OS's interrupt
 *  handler creation code, so you need to refer to the OS documentation
 *  for usage.  For example, for SYS/BIOS applications, refer to the
 *  ti.sysbios.family.arm.m3.Hwi documentation for SYS/BIOS usage of
 *  interrupt priorities.  If the driver uses the ti.dpl interface
 *  instead of making OS calls directly, then the HwiP port handles the
 *  interrupt priority in an OS specific way.  In the case of the SYS/BIOS
 *  port, intPriority is passed unmodified to Hwi_create().
 *  The CC26x2 uses three of the priority bits, meaning ~0 has the same
 *  effect as (7 << 5).
 *
 *        (7 << 5) will apply the lowest priority.
 *        (1 << 5) will apply the highest priority.
 *
 *  Setting the priority to 0 is not supported by this driver.  HWI's with
 *  priority 0 ignore the HWI dispatcher to support zero-latency interrupts,
 *  thus invalidating the critical sections in this driver.
 *
 *  A sample structure is shown below:
 *  @code
 *  const UART2CC26X2_HWAttrs uartCC26X2HWAttrs[] = {
 *      {
 *          .baseAddr     = UARTA0_BASE,
 *          .intNum       = INT_UART0_COMB,
 *          .intPriority  = (~0),
 *          .flowControl  = UART2CC26X2_FLOWCTRL_NONE,
 *          .rxPin        = IOID_2,
 *          .txPin        = IOID_3,
 *          .ctsPin       = PIN_UNASSIGNED,
 *          .rtsPin       = PIN_UNASSIGNED,
 *          .rxChannelMask  = 1 << UDMA_CHAN_UART0_RX,
 *          .txChannelMask  = 1 << UDMA_CHAN_UART0_TX,
 *          .txIntFifoThr = UART2CC26X2_FIFO_THRESHOLD_1_8,
 *          .rxIntFifoThr = UART2CC26X2_FIFO_THRESHOLD_4_8,
 *      },
 *      {
 *          .baseAddr     = UART1_BASE,
 *          .intNum       = INT_UART1_COMB,
 *          .intPriority  = (~0),
 *          .flowControl  = UART2CC26X2_FLOWCTRL_NONE,
 *          .rxPin        = PIN_UNASSIGNED,
 *          .txPin        = PIN_UNASSIGNED,
 *          .ctsPin       = PIN_UNASSIGNED,
 *          .rtsPin       = PIN_UNASSIGNED,
 *          .rxChannelMask  = 1 << UDMA_CHAN_UART1_RX,
 *          .txChannelMask  = 1 << UDMA_CHAN_UART1_TX,
 *          .txIntFifoThr = UART2CC26X2_FIFO_THRESHOLD_1_8,
 *          .rxIntFifoThr = UART2CC26X2_FIFO_THRESHOLD_4_8,
 *      },
 *  };
 *  @endcode
 *
 *  To enable flow control, the .ctsPin and/or .rtsPin must be assigned.
 *  In addition, .flowControl must be set to UART2CC26X2_FLOWCTL_HARDWARE.
 */
typedef struct {
    /*! UART Peripheral's base address */
    uint32_t        baseAddr;
    /*! UART Peripheral's interrupt vector */
    int             intNum;
    /*! UART Peripheral's interrupt priority */
    uint8_t         intPriority;
    /*! Hardware flow control setting */
    uint32_t        flowControl;
    /*! UART RX pin assignment */
    uint8_t         rxPin;
    /*! UART TX pin assignment */
    uint8_t         txPin;
    /*! UART clear to send (CTS) pin assignment */
    uint8_t         ctsPin;
    /*! UART request to send (RTS) pin assignment */
    uint8_t         rtsPin;
    /*! Mask for UDMA channel number for RX data (1 << channel number) */
    uint32_t        rxChannelMask;
    /*! Mask for UDMA channel number for TX data (1 << channel number) */
    uint32_t        txChannelMask;
    /*! UART TX interrupt FIFO threshold select */
    UART2CC26X2_FifoThreshold txIntFifoThr;
    /*! UART RX interrupt FIFO threshold select */
    UART2CC26X2_FifoThreshold rxIntFifoThr;
} UART2CC26X2_HWAttrs;

/*!
 *  @brief      UART2CC26X2 Object
 *
 *  The application must not access any member variables of this structure!
 */
typedef struct {
    /* UART2 state variable */
    struct {
        bool             opened:1;         /* Has the obj been opened */
        UART2_Mode       readMode;         /* Mode for read calls */
        UART2_Mode       writeMode;        /* Mode for write calls */
        UART2_ReadReturnMode readReturnMode:1; /* RX return mode (partial/full) */
        /* Flag to indicate ongoing transmit */
        bool             txEnabled:1;
    } state;

    HwiP_Struct          hwi;              /* Hwi object for interrupts */
    uint32_t             baudRate;         /* Baud rate for UART */
    UART2_DataLen        dataLength;       /* Data length for UART */
    UART2_StopBits       stopBits;         /* Stop bits for UART */
    UART2_Parity         parityType;       /* Parity bit type for UART */
    int32_t              rxStatus;         /* RX status */
    int32_t              txStatus;         /* TX status */
    void                *userArg;          /* User supplied arg for callbacks */
    UDMACC26XX_Handle    udmaHandle;       /* For setting power dependency */
    volatile tDMAControlTable    *rxDmaEntry;
    volatile tDMAControlTable    *txDmaEntry;

    /* UART read variables */
    unsigned char       *readBuf;          /* Buffer data pointer */
    size_t               readSize;         /* Number of bytes to read */
    uint32_t             nReadTransfers;   /* Number of DMA transfers needed */
    size_t               readCount;        /* Number of bytes left to read */
    size_t               rxSize;           /* # of bytes to read in DMA xfer */
    size_t               bytesRead;        /* Number of bytes read */
    SemaphoreP_Struct    readSem;          /* UART read semaphore */
    UART2_Callback       readCallback;     /* Pointer to read callback */

    /* UART write variables */
    const unsigned char *writeBuf;         /* Buffer data pointer */
    size_t               writeSize;        /* Number of bytes to write*/
    uint32_t             nWriteTransfers;  /* Number of DMA transfers needed */
    size_t               writeCount;       /* Number of bytes left to write */
    size_t               txSize;           /* # of bytes to write with DMA */
    size_t               bytesWritten;     /* Number of bytes written */
    SemaphoreP_Struct    writeSem;         /* UART write semaphore*/
    UART2_Callback       writeCallback;    /* Pointer to write callback */

    /* PIN driver state object and handle */
    PIN_State            pinState;
    PIN_Handle           hPin;

    /* For Power management */
    Power_NotifyObj      postNotify;
    unsigned int         powerMgrId;       /* Determined from base address */
} UART2CC26X2_Object, *UART2CC26X2_Handle;

#ifdef __cplusplus
}
#endif

#endif /* ti_drivers_uart2_UART2CC26X2__include */
