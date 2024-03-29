# CC1352P1 SimpleLink LaunchPad Settings & Resources

The CC1352P1 LaunchPad consists of a LaunchPad board with a CC1352P1 device.

![](./images/CC1352P1_LAUNCHXL_legacy.jpg "CC1352P1 LaunchPad")

## Jumper Settings

* For any examples that use LEDs, make sure the LED's jumper settings are closed.

## Board resources used in driver examples:

The following table lists the Board names of the resources used by
the driver examples, and their corresponding pins.  Note that there may be
other resources configured in the board files that are not used by any
driver example.  Only the example resources are listed in the table.

  |Board Resource|Pin|
  |--------------|:---|
  |`Board_ADC0`|DIO23|
  |`Board_ADC1`|DIO24|
  |`Board_ADCBUF0CHANNEL0`|DIO23|
  |`Board_GPIO_BUTTON0`|DIO15|
  |`Board_GPIO_BUTTON1`|DIO14|
  |`Board_GPIO_LED0`|DIO6  (Red - must be jumpered)|
  |`Board_GPIO_LED1`|DIO7  (Green - must be jumpered)|
  |`Board_I2C_TMP`|DIO21 - `SCL`, DIO5 - `SDA`|
  |`Board_I2S0`|DIO25 - `ADO`, DIO26 - `ADI`, DIO27 - `BCLK`, DIO16 - `WCLK`|
  |`Board_PIN_LED0`|DIO6  (Red - must be jumpered)|
  |`Board_PIN_LED1`|DIO7  (Green - must be jumpered)|
  |`Board_PIN_LED2`|DIO6  (Red - must be jumpered)|
  |`Board_PIN_BUTTON0`|DIO13|
  |`Board_PIN_BUTTON1`|DIO14|
  |`Board_PWM0`|DIO6|
  |`Board_PWM1`|DIO7|
  |`Board_SD0`|DIO8 - `MISO`, DIO9 - `MOSI`, DIO10 - `CLK`, DIO19 - `CS`|
  |`Board_SPI0`|DIO8 - `MISO`, DIO9 - `MOSI`, DIO10 - `CLK`, DIO11 - `CS`|
  |`Board_SPI_MASTER`|DIO8 - `MISO`, DIO9 - `MOSI`, DIO10 - `CLK`, DIO11 - `CS`|
  |`Board_SPI_SLAVE`|DIO8 - `MISO`, DIO9 - `MOSI`, DIO10 - `CLK`, DIO11 - `CS`|
  |`Board_SPI_MASTER_READY`|DIO15|
  |`Board_SPI_SLAVE_READY`|DIO21|
  |`Board_UART0`|DIO12 - `RX`, DIO13 - `TX`|

## BoosterPacks

The following examples require BoosterPacks.

  |Example|BoosterPack|
  |-------|:------------|
  |display|[BOOSTXL-SHARP128 LCD & SDCard BoosterPack](http://www.ti.com/tool/boostxl-sharp128)|
  |i2ctmp116|[BP-BASSENSORSMKII BoosterPack](http://www.ti.com/tool/BP-BASSENSORSMKII)|
  |i2copt3001\_cpp|[BP-BASSENSORSMKII BoosterPack](http://www.ti.com/tool/BP-BASSENSORSMKII)|
  |i2secho|[CC3200AUDBOOST](http://www.ti.com/tool/CC3200AUDBOOST)|
  |portable|[BP-BASSENSORSMKII BoosterPack](http://www.ti.com/tool/BP-BASSENSORSMKII)|
  |sdraw|[BOOSTXL-SHARP128 LCD & SDCard BoosterPack](http://www.ti.com/tool/boostxl-sharp128)|

### BOOSTXL-SHARP128 LCD & SDCard BoosterPack Modifications

>For the __sdraw__ example, make the following modification:

On the BOOSTXL_SHARP128, remove resistor `R16` and solder it on at `R17` to
enable the alternate SD_CS pin connected to DIO14. When using the SD card in
this manner, BTN-2 will no longer be available as it is also connected to
DIO14.

As an alternative to moving the resistor on the BOOSTXL_SHARP128, you can
jumper wire the following on the LaunchPad:
* `J1.8` to `DIO14`

### BP-BASSENSORSMKII BoosterPack Modifications

>For the __i2ctmp116__ and __portable__ examples make the following modification:

Jumper wire the following on the LaunchPad:
* `3V3` to `DIO30`

>For the __i2copt3001_cpp__ example, the O\_V+ pin on the BP-BASSENSORSMKII BoosterPack must
be rerouted due to a conflict with DIO29. Make the following modifications:

Jumper wire the following on the LaunchPad:
* `DIO29 (O_V+)` to `DIO11`

### CC3200AUDBOOST BoosterPack Modifications

  * The BoostPack's `DIN` signal pin is not compatible with this LaunchPad.
    Use one of the following modification(s) to enable the CC3200 Audio
    BoosterPack's usage with the __i2secho__ example.
  * Bend down the two pins below `DIO30`. Additionally bend down `DIO28-30`.
    Be sure that the bent pin(s) do not make contact with the IC or any other
    component, bend them enough to make sure they don't connect to the CC3200
    Audio BoosterPack.
    to the CC3200 Audio BoosterPack.
  * Attach the CC3200 Audio BoosterPack to the CC1312R1_LAUNCHXL
  * Run jumper wires between the following pins on the CC3200 Audio BoosterPack:
    - DIN: `P3.3` and `P3.9`
    - DOUT: `P3.4` and `P3.10`
    - BCLK: `P3.5` and `P3.8`
    - FSYNC/WCLK: `P4.9` and `P3.7`
  * See [Audio BP User Guide][cc3200audboost-user-guide], Figure 2-1 for
    information on where these pins are located.
  * See below for a diagram.

![CC3200 Audio BoosterPack Jumper Wire Diagram](images/cc3200audboost_cc13x2_jumpers_annotated.png)

## Peripherals Used

The following list shows which CC1352P1_LAUNCHXL peripherals are used by
driver and kernel applications. Driver examples control which peripherals (and which ports) are used.

* __TI-RTOS Kernel (SYS/BIOS)__
    * Uses the CC13xx's RTC timer and that timer's associated interrupts. The TI-RTOS Kernel manages the Interrupt Vector Table.
* __TI-RTOS Drivers__
    * __ADC:__ A CC13xx/CC26xx specific driver that uses the onboard ADC peripheral.
    * __Crypto:__ A CC13xx/CC26xx specific driver that uses the onboard AES Crypto processor.
    * __GPIO:__ The GPIO driver is used in various examples to drive `BOARD_GPIO_LED0`, and to monitor the `BOARD_GPIO_BUTTON0` and `BOARD_GPIO_BUTTON1` buttons.
    * __I<sup>2</sup>C:__ The I<sup>2</sup>C driver is used to manage the`Board_I2C0` I<sup>2</sup>C instance.
    * __I2S:__ The I2S driver is used to manage the `Board_I2S0` I2S instance.
    * __NVS:__ The `Board_NVSINTERNAL` region uses on-chip flash memory. This NVS region is defined in the example application's board file.
    * __NVS SPI:__ The `Board_NVSEXTERNAL` region uses off-chip SPI flash memory. This NVS region is defined in the example application's board file.
    * __PIN:__ A CC13xx/CC26xx specific driver PIN driver that uses 2 output pins for the onboard `BOARD_PIN_LED0` and `BOARD_PIN_LED1` and 2 input pins for buttons `Board_PIN_BUTTON0` and `Board_PIN_BUTTON1`.
    * __RF:__ The RF driver uses the on-chip radio module on CC13xx devices.
    * __SD:__ The SD driver is built on the GPIO and SPI drivers to communicate with an SD card via SPI.  `Board_SD0` uses `Board_SPI0` to send data to-and-from the SD card.
    * __SPI:__ The SPI driver uses SPI0 for `Board_SPI0` SPI instance.
    * __UART:__ The UART driver uses UART0, which is attached to the onboard emulator to facilitate serial communications.
    * __Watchdog:__ The Watchdog driver example uses the Watchdog Timer WDT peripheral (`Board_WATCHDOG0`).

[cc3200audboost-user-guide]: http://www.ti.com/lit/pdf/swru383
