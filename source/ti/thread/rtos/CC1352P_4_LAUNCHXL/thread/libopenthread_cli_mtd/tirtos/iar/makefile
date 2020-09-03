SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR ?= $(abspath ../../../../../..)

include $(SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR)/imports.mak

CC = "$(IAR_ARMCOMPILER)/bin/iccarm"
AR = "$(IAR_ARMCOMPILER)/bin/iarchive"

OBJECTS = src_cli_cli.obj src_cli_cli_coap.obj src_cli_cli_coap_secure.obj src_cli_cli_commissioner.obj src_cli_cli_console.obj src_cli_cli_dataset.obj src_cli_cli_joiner.obj src_cli_cli_server.obj src_cli_cli_uart.obj src_cli_cli_udp.obj

NAME = libopenthread_cli_mtd

CFLAGS = -I../.. \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/third_party/openthread/examples/platforms \
    -DSIMPLELINK_OPENTHREAD_SDK_BUILD=1 \
    -DSIMPLELINK_OPENTHREAD_CONFIG_CC1352=1 \
    -DMBEDTLS_CONFIG_FILE="mbedtls-config-cc1352-iar.h" \
    -I$SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/ti/thread/rtos/CC1352P_4_LAUNCHXL/thread/libmbedcrypto/tirtos/iar/config \
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
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/ti/thread/rtos/CC1352P_4_LAUNCHXL/thread/libopenthread_mtd/tirtos/iar/config \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/third_party/openthread/src/core \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/third_party/openthread/src

CPPFLAGS = -I../.. \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/third_party/openthread/examples/platforms \
    -DSIMPLELINK_OPENTHREAD_SDK_BUILD=1 \
    -DSIMPLELINK_OPENTHREAD_CONFIG_CC1352=1 \
    -DMBEDTLS_CONFIG_FILE="mbedtls-config-cc1352-iar.h" \
    -I$SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/ti/thread/rtos/CC1352P_4_LAUNCHXL/thread/libmbedcrypto/tirtos/iar/config \
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
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/ti/thread/rtos/CC1352P_4_LAUNCHXL/thread/libopenthread_mtd/tirtos/iar/config \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/third_party/openthread/src/core \
    -I$COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR$/source/third_party/openthread/src


all: $(NAME).a

src_cli_cli.obj: OPENTHREAD_MAKE_PATH/src/cli/cli.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -o $@

src_cli_cli_coap.obj: OPENTHREAD_MAKE_PATH/src/cli/cli_coap.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -o $@

src_cli_cli_coap_secure.obj: OPENTHREAD_MAKE_PATH/src/cli/cli_coap_secure.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -o $@

src_cli_cli_commissioner.obj: OPENTHREAD_MAKE_PATH/src/cli/cli_commissioner.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -o $@

src_cli_cli_console.obj: OPENTHREAD_MAKE_PATH/src/cli/cli_console.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -o $@

src_cli_cli_dataset.obj: OPENTHREAD_MAKE_PATH/src/cli/cli_dataset.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -o $@

src_cli_cli_joiner.obj: OPENTHREAD_MAKE_PATH/src/cli/cli_joiner.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -o $@

src_cli_cli_server.obj: OPENTHREAD_MAKE_PATH/src/cli/cli_server.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -o $@

src_cli_cli_uart.obj: OPENTHREAD_MAKE_PATH/src/cli/cli_uart.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -o $@

src_cli_cli_udp.obj: OPENTHREAD_MAKE_PATH/src/cli/cli_udp.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< -o $@

$(NAME).a: $(OBJECTS)
	@ echo creating library $@
	@ $(AR) --create $@ $^

clean:
	@ echo Cleaning...
	@ $(RM) $(OBJECTS) > $(DEVNULL) 2>&1
	@ $(RM) $(NAME).a > $(DEVNULL) 2>&1
