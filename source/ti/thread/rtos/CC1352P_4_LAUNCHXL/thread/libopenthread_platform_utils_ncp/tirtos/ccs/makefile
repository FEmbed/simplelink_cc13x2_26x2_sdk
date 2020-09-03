SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR ?= $(abspath ../../../../../..)

include $(SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR)/imports.mak

CC = "$(CCS_ARMCOMPILER)/bin/armcl"
AR = "$(CCS_ARMCOMPILER)/bin/armar"

OBJECTS = examples_platforms_utils_debug_uart.obj examples_platforms_utils_mac_frame.obj

NAME = libopenthread_platform_utils_ncp

CFLAGS = -I../.. \
    -O4 \
    --opt_for_speed=0 \
    -mv7M4 \
    --abi=eabi \
    -me \
    --c99 \
    --gcc \
    --float_operations_allowed=none \
    --printf_support=nofloat \
    --gen_func_subsections=on \
    --embedded_constants=on \
    --wchar_t=16 \
    --enum_type=packed \
    --gen_data_subsections=on \
    --common=on \
    --plain_char=unsigned \
    --diag_suppress=23000 \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/examples/platforms \
    -DSIMPLELINK_OPENTHREAD_SDK_BUILD=1 \
    -DSIMPLELINK_OPENTHREAD_CONFIG_CC1352=1 \
    -DMBEDTLS_CONFIG_FILE='"mbedtls-config-cc1352-ccs.h"' \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source \
    -I${WorkspaceDirPath}/libmbedcrypto_CC1352P_4_LAUNCHXL_tirtos_ccs/config \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/third_party/mbedtls \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/third_party/mbedtls/repo/include \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/include \
    -DHAVE_CONFIG_H \
    -D_BSD_SOURCE=1 \
    -D_DEFAULT_SOURCE=1 \
    -DOPENTHREAD_PROJECT_CORE_CONFIG_FILE='"openthread-core-cc1352-config-ide.h"' \
    -DOPENTHREAD_FTD=1 \
    -DOPENTHREAD_CONFIG_FILE='"openthread-config-cc1352-ccs-ncp.h"' \
    -I${WorkspaceDirPath}/libopenthread_ncp_CC1352P_4_LAUNCHXL_tirtos_ccs/config \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/src/core \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/src \
    --silicon_version=7M4 \
    --code_state=16 \
    --little_endian \
    --display_error_number \
    --diag_warning=255 \
    --diag_wrap=off \
    --float_support=FPv4SPD16 \
    --symdebug:dwarf \
    "-I$(CCS_ARMCOMPILER)/include"

CPPFLAGS = -I../.. \
    -O4 \
    --opt_for_speed=0 \
    -mv7M4 \
    --abi=eabi \
    -me \
    --c99 \
    --gcc \
    --float_operations_allowed=none \
    --printf_support=nofloat \
    --gen_func_subsections=on \
    --embedded_constants=on \
    --wchar_t=16 \
    --enum_type=packed \
    --gen_data_subsections=on \
    --common=on \
    --plain_char=unsigned \
    --diag_suppress=23000 \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/examples/platforms \
    -DSIMPLELINK_OPENTHREAD_SDK_BUILD=1 \
    -DSIMPLELINK_OPENTHREAD_CONFIG_CC1352=1 \
    -DMBEDTLS_CONFIG_FILE='"mbedtls-config-cc1352-ccs.h"' \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source \
    -I${WorkspaceDirPath}/libmbedcrypto_CC1352P_4_LAUNCHXL_tirtos_ccs/config \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/third_party/mbedtls \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/third_party/mbedtls/repo/include \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/include \
    -DHAVE_CONFIG_H \
    -D_BSD_SOURCE=1 \
    -D_DEFAULT_SOURCE=1 \
    -DOPENTHREAD_PROJECT_CORE_CONFIG_FILE='"openthread-core-cc1352-config-ide.h"' \
    -DOPENTHREAD_FTD=1 \
    -DOPENTHREAD_CONFIG_FILE='"openthread-config-cc1352-ccs-ncp.h"' \
    -I${WorkspaceDirPath}/libopenthread_ncp_CC1352P_4_LAUNCHXL_tirtos_ccs/config \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/src/core \
    -I${COM_TI_SIMPLELINK_CC13X2_26X2_SDK_INSTALL_DIR}/source/third_party/openthread/src \
    --silicon_version=7M4 \
    --code_state=16 \
    --little_endian \
    --display_error_number \
    --diag_warning=255 \
    --diag_wrap=off \
    --float_support=FPv4SPD16 \
    --symdebug:dwarf \
    "-I$(CCS_ARMCOMPILER)/include"


all: $(NAME).a

examples_platforms_utils_debug_uart.obj: OPENTHREAD_MAKE_PATH/examples/platforms/utils/debug_uart.c
	@ echo Building $@
	@ $(CC) $(CFLAGS) $< --output_file=$@

examples_platforms_utils_mac_frame.obj: OPENTHREAD_MAKE_PATH/examples/platforms/utils/mac_frame.cpp
	@ echo Building $@
	@ $(CC) $(CPPFLAGS) $< --output_file=$@

$(NAME).a: $(OBJECTS)
	@ echo creating library $@
	@ $(AR) r $@ $^

clean:
	@ echo Cleaning...
	@ $(RM) $(OBJECTS) > $(DEVNULL) 2>&1
	@ $(RM) $(NAME).a > $(DEVNULL) 2>&1
