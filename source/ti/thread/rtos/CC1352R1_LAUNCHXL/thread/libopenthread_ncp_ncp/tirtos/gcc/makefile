SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR ?= $(abspath ../../../../../..)

include $(SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR)/imports.mak

CC = "$(GCC_ARMCOMPILER)/bin/arm-none-eabi-gcc"
AR = "$(GCC_ARMCOMPILER)/bin/arm-none-eabi-ar"

OBJECTS = src_ncp_changed_props_set.obj src_ncp_example_vendor_hook.obj src_ncp_ncp_base.obj src_ncp_ncp_base_dispatcher.obj src_ncp_ncp_base_ftd.obj src_ncp_ncp_base_mtd.obj src_ncp_ncp_base_radio.obj src_ncp_ncp_spi.obj src_ncp_ncp_uart.obj src_lib_hdlc_hdlc.obj src_lib_spinel_spinel.obj src_lib_spinel_spinel_buffer.obj src_lib_spinel_spinel_decoder.obj src_lib_spinel_spinel_encoder.obj

NAME = libopenthread_ncp_ncp

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
    -DSIMPLELINK_OPENTHREAD_CONFIG_CC1352=1 \
    -DMBEDTLS_CONFIG_FILE='"mbedtls-config-cc1352-gcc.h"' \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source \
    -I${WorkspaceDirPath}/libmbedcrypto_CC1352R1_LAUNCHXL_tirtos_gcc/config \
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
    -DOPENTHREAD_FTD=1 \
    -DOPENTHREAD_SPINEL_CONFIG_OPENTHREAD_MESSAGE_ENABLE=1 \
    -DOPENTHREAD_CONFIG_FILE='"openthread-config-cc1352-gcc-ncp.h"' \
    -DOPENTHREAD_PROJECT_CORE_CONFIG_FILE='"openthread-core-cc1352-config-ide.h"' \
    -I${WorkspaceDirPath}/libopenthread_ncp_CC1352R1_LAUNCHXL_tirtos_gcc/config \
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
    -DSIMPLELINK_OPENTHREAD_CONFIG_CC1352=1 \
    -DMBEDTLS_CONFIG_FILE='"mbedtls-config-cc1352-gcc.h"' \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source \
    -I${WorkspaceDirPath}/libmbedcrypto_CC1352R1_LAUNCHXL_tirtos_gcc/config \
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
    -DOPENTHREAD_FTD=1 \
    -DOPENTHREAD_SPINEL_CONFIG_OPENTHREAD_MESSAGE_ENABLE=1 \
    -DOPENTHREAD_CONFIG_FILE='"openthread-config-cc1352-gcc-ncp.h"' \
    -DOPENTHREAD_PROJECT_CORE_CONFIG_FILE='"openthread-core-cc1352-config-ide.h"' \
    -I${WorkspaceDirPath}/libopenthread_ncp_CC1352R1_LAUNCHXL_tirtos_gcc/config \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/src/core \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/src \
    -gstrict-dwarf \
    "-I$(SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR)/kernel/tirtos/packages/gnu/targets/arm/libs/install-native/arm-none-eabi/include/newlib-nano" \
    "-I$(SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR)/kernel/tirtos/packages/gnu/targets/arm/libs/install-native/arm-none-eabi/include" \
    "-I$(GCC_ARMCOMPILER)/arm-none-eabi/include"


all: $(NAME).a

src_lib_spinel_spinel.obj: OPENTHREAD_MAKE_PATH/src/lib/spinel/spinel.c
	@ echo Building $@
	@ $(CC) $(CFLAGS) $< -c -o $@

src_ncp_changed_props_set.obj: OPENTHREAD_MAKE_PATH/src/ncp/changed_props_set.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

src_ncp_example_vendor_hook.obj: OPENTHREAD_MAKE_PATH/src/ncp/example_vendor_hook.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

src_ncp_ncp_base.obj: OPENTHREAD_MAKE_PATH/src/ncp/ncp_base.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

src_ncp_ncp_base_dispatcher.obj: OPENTHREAD_MAKE_PATH/src/ncp/ncp_base_dispatcher.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

src_ncp_ncp_base_ftd.obj: OPENTHREAD_MAKE_PATH/src/ncp/ncp_base_ftd.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

src_ncp_ncp_base_mtd.obj: OPENTHREAD_MAKE_PATH/src/ncp/ncp_base_mtd.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

src_ncp_ncp_base_radio.obj: OPENTHREAD_MAKE_PATH/src/ncp/ncp_base_radio.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

src_ncp_ncp_spi.obj: OPENTHREAD_MAKE_PATH/src/ncp/ncp_spi.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

src_ncp_ncp_uart.obj: OPENTHREAD_MAKE_PATH/src/ncp/ncp_uart.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

src_lib_hdlc_hdlc.obj: OPENTHREAD_MAKE_PATH/src/lib/hdlc/hdlc.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

src_lib_spinel_spinel_buffer.obj: OPENTHREAD_MAKE_PATH/src/lib/spinel/spinel_buffer.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

src_lib_spinel_spinel_decoder.obj: OPENTHREAD_MAKE_PATH/src/lib/spinel/spinel_decoder.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

src_lib_spinel_spinel_encoder.obj: OPENTHREAD_MAKE_PATH/src/lib/spinel/spinel_encoder.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -c -o $@

$(NAME).a: $(OBJECTS)
	@ echo creating library $@
	@ $(AR) r $@ $^

clean:
	@ echo Cleaning...
	@ $(RM) $(OBJECTS) > $(DEVNULL) 2>&1
	@ $(RM) $(NAME).a > $(DEVNULL) 2>&1
