SIMPLELINK_SDK_INSTALL_DIR ?= $(abspath ../../../../../../)
include $(SIMPLELINK_SDK_INSTALL_DIR)/imports.mak

CC = "$(TICLANG_ARMCOMPILER)/bin/tiarmclang"
AR = "$(TICLANG_ARMCOMPILER)/bin/tiarmar"

OBJS = spiffs_cache.obj \
	spiffs_check.obj \
	spiffs_gc.obj \
	spiffs_hydrogen.obj \
	spiffs_nucleus.obj \
	SPIFFSNVS.obj

CFLAGS = -I../../../ -I$(SIMPLELINK_SDK_INSTALL_DIR)/source \
    "-I$(TICLANG_ARMCOMPILER)/include" \
    -mcpu=cortex-m4 -mfloat-abi=hard -mfpu=fpv4-sp-d16 -Oz

ARFLAGS = -c -q

vpath %.c ../../../

%.obj: %.c
	@ $(CC) -c $(CFLAGS) $< -o $@

all: spiffs.a

clean:
	@ $(RM) $(OBJS) spiffs.a > $(DEVNULL) 2>&1

spiffs.a: $(OBJS)
	@ echo "# Archiving $@"
	@ $(AR) $(ARFLAGS) $@ $^
