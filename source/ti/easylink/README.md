EasyLink Application Programming Interface
==========================================

Overview
--------
The EasyLink API should be used in application code. The EasyLink API is
intended to abstract the RF Driver in order to give a simple API for
customers to use as is or extend to suit their application use cases.

General Behavior
----------------
Before using the EasyLink API:
- The EasyLink Layer is initialized by calling EasyLink_init(). This
  initializes and opens the RF driver and configuring a modulation scheme
  passed to EasyLink_init().
- The RX and TX can operate independently of each other.

The following is true for receive operation:
- RX is enabled by calling EasyLink_receive() or EasyLink_receiveAsync().
- Entering RX can be immediate or scheduled.
- EasyLink_receive() is blocking and EasyLink_receiveAsync() is non-blocking.
- the EasyLink API does not queue messages so calling another API function
  while in EasyLink_receiveAsync() will return ::EasyLink_Status_Busy_Error
- an Async operation can be cancelled with EasyLink_abort()

The following apply for transmit operation:
- TX is enabled by calling EasyLink_transmit() or EasyLink_transmitAsync().
- TX can be immediate or scheduled.
- EasyLink_transmit() is blocking and EasyLink_transmitAsync() is non-blocking
- EasyLink_transmit() for a scheduled command, or if TX can not start
- the EasyLink API does not queue messages so calling another API function
  while in EasyLink_transmitAsync() will return ::EasyLink_Status_Busy_Error
- an Async operation can be cancelled with EasyLink_abort()

Error handling
--------------
The EasyLink API will return ::EasyLink_Status containing success or error
code. The EasyLink_Status code are:

- EasyLink_Status_Success
- EasyLink_Status_Config_Error
- EasyLink_Status_Param_Error
- EasyLink_Status_Mem_Error
- EasyLink_Status_Cmd_Error
- EasyLink_Status_Tx_Error
- EasyLink_Status_Rx_Error
- EasyLink_Status_Rx_Timeout
- EasyLink_Status_Busy_Error
- EasyLink_Status_Aborted

Power Management
----------------
The TI-RTOS power management framework will try to put the device into the most
power efficient mode whenever possible. Please see the technical reference
manual for further details on each power mode.

The EasyLink Layer uses the power management offered by the RF driver Refer to the RF
drive documentation for more details.

Supported Functions
-------------------

| Generic API function          | Description                                        |
|-------------------------------|----------------------------------------------------|
| EasyLink_init()               | Init's and opens the RF driver and configures the  |
|                               | specified settings based on EasyLink_Params struct |
| EasyLink_transmit()           | Blocking Transmit                                  |
| EasyLink_transmitAsync()      | Non-blocking Transmit                              |
| EasyLink_transmitCcaAsync()   | Non-blocking Transmit with Clear Channel Assessment|
| EasyLink_receive()            | Blocking Receive                                   |
| EasyLink_receiveAsync()       | Non-blocking Receive                                |
| EasyLink_abort()              | Aborts a non blocking call                         |
| EasyLink_enableRxAddrFilter() | Enables/Disables RX filtering on the Addr          |
| EasyLink_getIeeeAddr()        | Gets the IEEE Address                              |
| EasyLink_setFrequency()       | Sets the frequency                                 |
| EasyLink_getFrequency()       | Gets the frequency                                 |
| EasyLink_setRfPower()         | Sets the Tx Power                                  |
| EasyLink_getRfPower()         | Gets the Tx Power                                  |
| EasyLink_getRssi()            | Gets the RSSI                                      |
| EasyLink_getAbsTime()         | Gets the absolute time in RAT ticks                |
| EasyLink_setCtrl()            | Set RF parameters, test modes or EasyLink options  |
| EasyLink_getCtrl()            | Get RF parameters or EasyLink options              |


Frame Structure
---------------
The EasyLink implements a basic header for transmitting and receiving data. This header supports
addressing for a star or point-to-point network with acknowledgments.

### Packet structure

 | 1B Length | 1-64b Dst Address |         Payload         |
 |-----------|-------------------|-------------------------|

Changelog
---------

### Older Versions

- Please refer to the git log for details on older revisions of EasyLink

### Version 2.40.01

- released with simplelink_cc13xx_sdk_2_20_00_00
- added support for CC1352P board variants

### Version 2.40.02

- released with simplelink_cc13xx_sdk_2_30_00_00
- fixed error in EasyLink_setFrequency where the status of the Fs command is
  not checked prior to returning to the callee function
- EasyLink_setCtrl() will correctly modify the inactivity timeout RF parameter
  based on whether the EasyLink module was initialized or not

### Version 2.40.03

- released with simplelink_cc13xx_sdk_2_40_00_00
- added word alignment for the address filter table array; failure to align
  to the right boundary was causing the address filtering to not work
- added support for 200 Kbps 2-GFSK mode for all CC13x2
- updates to facilitate EasyLink configuration via the System Configuration Tool
- addition of easylink_config.h and easylink_config.c files to increase
  configurability of the EasyLink API behavior
- removal of hard coded references to RF Command names from EasyLink source
- addition of EasyLink_rfSetting struct
- addition of EasyLink_supportedPhys array in easylink_config.c
- addition of EasyLink_numSupportedPhys integer in easylink_config.c
- addition of the following defines in easylink_config.h:
    - EASYLINK_ADDR_SIZE
    - EASYLINK_ENABLE_ADDR_FILTERING
    - EASYLINK_NUM_ADDR_FILTER
    - EASYLINK_IDLE_TIMEOUT
    - EASYLINK_ENABLE_MULTI_CLIENT
    - EASYLINK_ASYNC_RX_TIMEOUT
- restricted address filter sizes to 0, 1, 2, 4 and 8 bytes

### Version 2.50.01

- Added the following defines to simplify address handling in easylink_config.h
    - EASYLINK_DEFAULT_ADDR
    - EASYLINK_USE_DEFAULT_ADDR

### Version 2.60.00

- Added CCA support for CC2640R2
- Reverted the restriction of address filter sizes made in v2.40.03
    - Now the address can be any value in the range [0, EASYLINK_MAX_ADDR_SIZE]

### Version 2.70.00

- Updated name of easyink_config.h/c to ti_easylink_config.h/c

### Version 2.80.00

- Added support for CC2652R1 device (CC26X2R1_LAUNCHXL)
- Added support for 2.4GHz band 250kbps-2GFSK and 100kbps-2GFSK PHYs for the
  following boards/devices:
      - CC1352R1_LAUNCHXL
      - CC1352P1_LAUNCHXL
      - CC1352P_2_LAUNCHXL + CC2652P
      - CC1352P_4_LAUNCHXL
      - CC26X2R1_LAUNCHXL

### Version 3.10.00

- Added support for CC1352P_4_LAUNCHXL
- Added support for custom boards in SysConfig

### Version 3.10.01

- Added support for calling RF_runScheduleCmd() based on rfModeMultiClient

### Version 3.20.00

- Added freertos support
- Added support for LP-CC2652RSIP and LP-CC2652PSIP modules
- Fixed security vulnerability where received packet length was not being
  verified before copying