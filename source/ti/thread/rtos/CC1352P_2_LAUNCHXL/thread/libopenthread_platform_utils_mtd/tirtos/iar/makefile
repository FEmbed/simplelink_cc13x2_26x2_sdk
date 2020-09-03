SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR ?= $(abspath ../../../../../..)

include $(SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR)/imports.mak

CC = "$(IAR_ARMCOMPILER)/bin/iccarm"
AR = "$(IAR_ARMCOMPILER)/bin/iarchive"

OBJECTS = examples_platforms_utils_debug_uart.obj examples_platforms_utils_mac_frame.obj

NAME = libopenthread_platform_utils_mtd

CFLAGS = -I../.. \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/third_party/openthread/examples/platforms \
    -DSIMPLELINK_OPENTHREAD_SDK_BUILD=1 \
    -DSIMPLELINK_OPENTHREAD_CONFIG_CC1352=1 \
    -DMBEDTLS_CONFIG_FILE="mbedtls-config-cc1352-iar.h" \
    -I$SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/ti/thread/rtos/CC1352P_2_LAUNCHXL/thread/libmbedcrypto/tirtos/iar/config \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/third_party/openthread/third_party/mbedtls \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/third_party/openthread/third_party/mbedtls/repo/include \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/third_party/openthread/include \
    -DHAVE_CONFIG_H \
    -D_BSD_SOURCE=1 \
    -D_DEFAULT_SOURCE=1 \
    --debug \
    --silent \
    -e \
    --aeabi \
    --thumb \
    --diag_suppress=Pa050 \
    --c++ \
    -DOPENTHREAD_PROJECT_CORE_CONFIG_FILE="openthread-core-cc1352-config-ide.h" \
    -DOPENTHREAD_MTD=1 \
    -DOPENTHREAD_CONFIG_FILE="openthread-config-cc1352-iar-mtd.h" \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/ti/thread/rtos/CC1352P_2_LAUNCHXL/thread/libopenthread_mtd/tirtos/iar/config \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/third_party/openthread/src/core \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/third_party/openthread/src

CPPFLAGS = -I../.. \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/third_party/openthread/examples/platforms \
    -DSIMPLELINK_OPENTHREAD_SDK_BUILD=1 \
    -DSIMPLELINK_OPENTHREAD_CONFIG_CC1352=1 \
    -DMBEDTLS_CONFIG_FILE="mbedtls-config-cc1352-iar.h" \
    -I$SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/ti/thread/rtos/CC1352P_2_LAUNCHXL/thread/libmbedcrypto/tirtos/iar/config \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/third_party/openthread/third_party/mbedtls \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/third_party/openthread/third_party/mbedtls/repo/include \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/third_party/openthread/include \
    -DHAVE_CONFIG_H \
    -D_BSD_SOURCE=1 \
    -D_DEFAULT_SOURCE=1 \
    --debug \
    --silent \
    -e \
    --aeabi \
    --thumb \
    --diag_suppress=Pa050 \
    --c++ \
    -DOPENTHREAD_PROJECT_CORE_CONFIG_FILE="openthread-core-cc1352-config-ide.h" \
    -DOPENTHREAD_MTD=1 \
    -DOPENTHREAD_CONFIG_FILE="openthread-config-cc1352-iar-mtd.h" \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/ti/thread/rtos/CC1352P_2_LAUNCHXL/thread/libopenthread_mtd/tirtos/iar/config \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/third_party/openthread/src/core \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/third_party/openthread/src


all: $(NAME).a

examples_platforms_utils_debug_uart.obj: OPENTHREAD_MAKE_PATH/examples/platforms/utils/debug_uart.c
	@ echo Building $@
	@ $(CC) $(CFLAGS) $< -o $@

examples_platforms_utils_mac_frame.obj: OPENTHREAD_MAKE_PATH/examples/platforms/utils/mac_frame.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -o $@

$(NAME).a: $(OBJECTS)
	@ echo creating library $@
	@ $(AR) --create $@ $^

clean:
	@ echo Cleaning...
	@ $(RM) $(OBJECTS) > $(DEVNULL) 2>&1
	@ $(RM) $(NAME).a > $(DEVNULL) 2>&1
