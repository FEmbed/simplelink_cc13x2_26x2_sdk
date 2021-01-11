#
#   Copyright (c) 2019-2020 Texas Instruments Incorporated - http://www.ti.com
#   All rights reserved.
#
#   Redistribution and use in source and binary forms, with or without
#   modification, are permitted provided that the following conditions
#   are met:
#
#   *  Redistributions of source code must retain the above copyright
#      notice, this list of conditions and the following disclaimer.
#
#   *  Redistributions in binary form must reproduce the above copyright
#      notice, this list of conditions and the following disclaimer in the
#      documentation and/or other materials provided with the distribution.
#
#   *  Neither the name of Texas Instruments Incorporated nor the names of
#      its contributors may be used to endorse or promote products derived
#      from this software without specific prior written permission.
#
#   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
#   AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,
#   THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
#   PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
#   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
#   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
#   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
#   OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
#   WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
#   OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
#   EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
#

#
#  ======== defs.mak ========
#

# SDK imports.mak defines dependency locations (e.g. toolchains)
include $(SDK_INSTALL_DIR)/imports.mak

vpath %.cpp $(ERPC_ROOT)

SOURCES = \
    erpc_c/infra/erpc_basic_codec.cpp                   \
    erpc_c/infra/erpc_client_manager.cpp                \
    erpc_c/infra/erpc_arbitrated_client_manager.cpp     \
    erpc_c/infra/erpc_crc16.cpp                         \
    erpc_c/infra/erpc_framed_transport.cpp              \
    erpc_c/infra/erpc_message_buffer.cpp                \
    erpc_c/infra/erpc_message_loggers.cpp               \
    erpc_c/infra/erpc_server.cpp                        \
    erpc_c/infra/erpc_simple_server.cpp                 \
    erpc_c/infra/erpc_transport_arbitrator.cpp          \
    erpc_c/port/erpc_port_stdlib.cpp                    \
    erpc_c/port/erpc_threading_tirtos.cpp               \
    erpc_c/setup/erpc_client_setup.cpp                  \
    erpc_c/setup/erpc_arbitrated_client_setup.cpp       \
    erpc_c/setup/erpc_server_setup.cpp                  \
    erpc_c/setup/erpc_setup_mbf_static.cpp              \
    erpc_c/setup/erpc_setup_uart_simplelink.cpp         \
    erpc_c/transports/erpc_uart_simplelink_transport.cpp

INCS = \
    -I$(ERPC_ROOT)                                      \
    -I$(ERPC_ROOT)/erpc_c/infra                         \
    -I$(ERPC_ROOT)/erpc_c/port                          \
    -I$(ERPC_ROOT)/erpc_c/setup                         \
    -I$(ERPC_ROOT)/erpc_c/transports                    \
    -I$(SDK_INSTALL_DIR)/source                         \
    -I$(SDK_INSTALL_DIR)/kernel/tirtos/packages         \
    -I$(XDC_INSTALL_DIR)/packages

OBJS = $(addprefix obj/,$(subst .cpp,.obj,$(SOURCES)))

# generate build rules for given profile
define TI_ERPC

all: erpc_tirtos_$(1).a

erpc_tirtos_$(1).a: $$(addprefix obj/$1/,$$(subst .cpp,.obj,$(SOURCES)))
	@echo "#"
	@echo "# building [$$@]"
	$$(AR) $$(ARFLAGS) $$@ $$^

obj/$1/%.obj: PROFILE := $$(shell echo $(1) | tr a-z A-Z)
obj/$1/%.obj: %.cpp
	@echo "#"
	@echo "# building [$$@]"
	$$(CC_CMD)

clean::
	@rm -f erpc_tirtos_$(1).a

ifneq (clean,$(MAKECMDGOALS))
ifeq (,$(wildcard obj/$1/erpc_c/infra))
    $(shell mkdir -p obj/$1/erpc_c/infra)
endif
ifeq (,$(wildcard obj/$1/erpc_c/port))
    $(shell mkdir -p obj/$1/erpc_c/port)
endif
ifeq (,$(wildcard obj/$1/erpc_c/setup))
    $(shell mkdir -p obj/$1/erpc_c/setup)
endif
ifeq (,$(wildcard obj/$1/erpc_c/transports))
    $(shell mkdir -p obj/$1/erpc_c/transports)
endif
endif

endef
