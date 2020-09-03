SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR ?= $(abspath ../../../../../..)

include $(SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR)/imports.mak

CC = "$(GCC_ARMCOMPILER)/bin/arm-none-eabi-gcc"
AR = "$(GCC_ARMCOMPILER)/bin/arm-none-eabi-ar"

OBJECTS = src_cli_cli.obj src_cli_cli_coap.obj src_cli_cli_coap_secure.obj src_cli_cli_commissioner.obj src_cli_cli_console.obj src_cli_cli_dataset.obj src_cli_cli_joiner.obj src_cli_cli_server.obj src_cli_cli_uart.obj src_cli_cli_udp.obj

NAME = libopenthread_cli_ftd

CFLAGS = -I../.. \
    -g \
    -Os \
    -std=c99 \
    -fno-exceptions \
    -fno-rtti \
    -std=gnu++98 \
    -Wno-c++14-compat \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/examples/platforms \
    -DSIMPLELINK_OPENTHREAD_SDK_BUILD=1 \
    -DSIMPLELINK_OPENTHREAD_CONFIG_CC2652=1 \
    -DMBEDTLS_CONFIG_FILE='"mbedtls-config-cc2652-gcc.h"' \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source \
    -I${WorkspaceDirPath}/libmbedcrypto_CC2652RB_LAUNCHXL_tirtos_gcc/config \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/third_party/mbedtls \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/third_party/mbedtls/repo/include \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/include \
    -DHAVE_CONFIG_H \
    -D_BSD_SOURCE=1 \
    -D_DEFAULT_SOURCE=1 \
    -march=armv7e-m \
    -mthumb \
    -mcpu=cortex-m4 \
    -mfloat-abi=hard \
    -mfpu=fpv4-sp-d16 \
    -fdata-sections \
    -ffunction-sections \
    -Wall \
    -Wextra \
    -Wshadow \
    -DOPENTHREAD_PROJECT_CORE_CONFIG_FILE='"openthread-core-cc2652-config-ide.h"' \
    -DOPENTHREAD_FTD=1 \
    -DOPENTHREAD_CONFIG_FILE='"openthread-config-cc2652-gcc-ftd.h"' \
    -I${WorkspaceDirPath}/libopenthread_ftd_CC2652RB_LAUNCHXL_tirtos_gcc/config \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/src/core \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/src \
    -gstrict-dwarf \
    "-I$(SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR)/kernel/tirtos/packages/gnu/targets/arm/libs/install-native/arm-none-eabi/include/newlib-nano" \
    "-I$(SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR)/kernel/tirtos/packages/gnu/targets/arm/libs/install-native/arm-none-eabi/include" \
    "-I$(GCC_ARMCOMPILER)/arm-none-eabi/include"

CPPFLAGS = -I../.. \
    -g \
    -Os \
    -std=c99 \
    -fno-exceptions \
    -fno-rtti \
    -std=gnu++98 \
    -Wno-c++14-compat \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/examples/platforms \
    -DSIMPLELINK_OPENTHREAD_SDK_BUILD=1 \
    -DSIMPLELINK_OPENTHREAD_CONFIG_CC2652=1 \
    -DMBEDTLS_CONFIG_FILE='"mbedtls-config-cc2652-gcc.h"' \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source \
    -I${WorkspaceDirPath}/libmbedcrypto_CC2652RB_LAUNCHXL_tirtos_gcc/config \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/third_party/mbedtls \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/third_party/mbedtls/repo/include \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/include \
    -DHAVE_CONFIG_H \
    -D_BSD_SOURCE=1 \
    -D_DEFAULT_SOURCE=1 \
    -march=armv7e-m \
    -mthumb \
    -std=c++11 \
    -mcpu=cortex-m4 \
    -mfloat-abi=hard \
    -mfpu=fpv4-sp-d16 \
    -fdata-sections \
    -ffunction-sections \
    -Wall \
    -Wextra \
    -Wshadow \
    -DOPENTHREAD_PROJECT_CORE_CONFIG_FILE='"openthread-core-cc2652-config-ide.h"' \
    -DOPENTHREAD_FTD=1 \
    -DOPENTHREAD_CONFIG_FILE='"openthread-config-cc2652-gcc-ftd.h"' \
    -I${WorkspaceDirPath}/libopenthread_ftd_CC2652RB_LAUNCHXL_tirtos_gcc/config \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/src/core \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/src \
    -gstrict-dwarf \
    "-I$(SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR)/kernel/tirtos/packages/gnu/targets/arm/libs/install-native/arm-none-eabi/include/newlib-nano" \
    "-I$(SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR)/kernel/tirtos/packages/gnu/targets/arm/libs/install-native/arm-none-eabi/include" \
    "-I$(GCC_ARMCOMPILER)/arm-none-eabi/include"


all: $(NAME).a

src_cli_cli.obj: OPENTHREAD_MAKE_PATH/src/cli/cli.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

src_cli_cli_coap.obj: OPENTHREAD_MAKE_PATH/src/cli/cli_coap.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

src_cli_cli_coap_secure.obj: OPENTHREAD_MAKE_PATH/src/cli/cli_coap_secure.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

src_cli_cli_commissioner.obj: OPENTHREAD_MAKE_PATH/src/cli/cli_commissioner.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

src_cli_cli_console.obj: OPENTHREAD_MAKE_PATH/src/cli/cli_console.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

src_cli_cli_dataset.obj: OPENTHREAD_MAKE_PATH/src/cli/cli_dataset.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

src_cli_cli_joiner.obj: OPENTHREAD_MAKE_PATH/src/cli/cli_joiner.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

src_cli_cli_server.obj: OPENTHREAD_MAKE_PATH/src/cli/cli_server.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

src_cli_cli_uart.obj: OPENTHREAD_MAKE_PATH/src/cli/cli_uart.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

src_cli_cli_udp.obj: OPENTHREAD_MAKE_PATH/src/cli/cli_udp.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

$(NAME).a: $(OBJECTS)
	@ echo creating library $@
	@ $(AR) r $@ $^

clean:
	@ echo Cleaning...
	@ $(RM) $(OBJECTS) > $(DEVNULL) 2>&1
	@ $(RM) $(NAME).a > $(DEVNULL) 2>&1
