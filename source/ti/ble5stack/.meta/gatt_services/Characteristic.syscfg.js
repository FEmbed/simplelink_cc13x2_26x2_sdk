"use strict";

const Common = system.getScript("/ti/ble5stack/ble_common.js");
// Function to check if a string contains only letters, numbers and underscore.
function alphanumeric(inputtxt)
{
	var letterNumber = /^[a-zA-Z0-9_]+$/;
	if(inputtxt.match(letterNumber))
	{
	   return true;
	}
	else
	{
	   return false;
	}
}

function hexOrComma(str)
{
	var regexp = /^[0-9a-fA-F,]+$/;
	if (str.match(regexp))
	{
		return true;
	}
	else
	{
		return false;
	}
}

/**
 * Validate this module's configuration
 *
 * @param {object} inst - Watchdog instance to be validated
 * @param {object} vo   - Issue reporting object
 */
function validate(inst, vo)
{
	//Validate name
	if(inst.name == '')
	{
		vo["name"].errors.push("Please insert characteristic name.");
	}

	if(inst.name)
	{
		if(!alphanumeric(inst.name))
		{
			vo["name"].errors.push("Characteristic name should only contain alphabet or digits.");
		}
	}
	// Validate uuid Value length
	if(inst.uuidSize == '16-bit')
	{
		if(inst.uuid.toString(16).length > 4)
		{
			vo["uuid"].errors.push("Uuid is bigger than 16 bit.");
		}
	}
	else if(inst.uuidSize == '128-bit')
	{
		if(inst.uuid.toString(16).length > 32)
		{
			vo["uuid"].errors.push("Uuid is bigger than 128 bit.");
		}
	}
	//Validate value length and value
	if(inst.bytes < 0)
	{
		vo["bytes"].errors.push("Value length must be a positive number.");
	}
	if(inst.bytes > 512)
	{
		vo["bytes"].errors.push("Value length is a maximum of 512 bytes.");
	}
    if(inst.bytes > 0 && inst.value == '')
	{
		vo["value"].errors.push("Please insert a value.");
	}
	else if(inst.bytes == 0 && inst.value != '')
	{
		vo["value"].errors.push("No value is allowed when value length equals to 0.");
	}
	if(inst.value){
		if(!hexOrComma(inst.value))
		{
			vo["value"].errors.push("Values should be only Hexadecimal characters divided by a colon (',').");
		}
	}

	let serviceMod  = system.modules['/ti/ble5stack/gatt_services/Service'];
	let counter = 0;
	for (let i = 0; i < serviceMod.$instances.length; i++) {
		if(serviceMod.$instances[i].uuid.toString().toLowerCase() == inst.uuid.toString().toLowerCase()){
			counter ++;
			if(counter > 1) {
				vo["uuid"].errors.push("This UUID is taken by another service/characteristic.");
				break;
			}
		}
		for (let cidx = 0; cidx < serviceMod.$instances[i].characteristics.length;  ++cidx) {
			if(serviceMod.$instances[i].characteristics[cidx].uuid.toString().toLowerCase() == inst.uuid.toString().toLowerCase()) {
				counter ++;
				if(counter > 1){
					vo["uuid"].errors.push("This UUID is taken by another service/characteristic.");
					break;
				}
			}
		}
	}

	counter = 0;
	for (let i = 0; i < serviceMod.$instances.length; i++) {
		if(serviceMod.$instances[i].name.toLowerCase() == inst.name.toLowerCase()){
			counter ++;
			if(counter > 1){
				vo["name"].errors.push("This name is taken by another service/characteristic.");
				break;
			}
		}

		for (let cidx = 0; cidx < serviceMod.$instances[i].characteristics.length; ++ cidx) {
			if(serviceMod.$instances[i].characteristics[cidx].name.toLowerCase() == inst.name.toLowerCase()) {
			counter ++;
				if(counter > 1) {
					vo["name"].errors.push("This name is taken by another service/characteristic.");
					break;
				}
			}
		}
	}
}

let config = [
    {
        name       : 'name',
        displayName: 'Characteristic Name',
        default    : ''
    },
	{
        name       : 'description',
        displayName: 'Characteristic description',
        default    : ''
    },
    {
        name       : 'uuidSize',
        displayName: 'Characteristic UUID Size',
        default    : '16-bit',
        options    : [
            { name: '16-bit'  },
            { name: '128-bit' }
        ]
    },
    {
        name         : 'uuid',
        displayName  : 'Characteristic UUID',
        default      : system.utils.bigInt("00",32),
        displayFormat: 'hex'
    },
    {
        name         : 'bytes',
        displayName  : 'Value length (bytes).',
        default      : 1
    },
	{
        name         : 'value',
        displayName  : 'Value',
		default		 :	'',
		longDescription:`Please enter the value byte by byte, seperated with a comma (','), in Hexadecimal characters. No spaces and other characters are allowed. for example- 00,0F,22.`

	},
    {
        name            : 'properties',
        displayName     : 'Properties (shown in declaration)',
        default         : [],
        minSelections   : 0,
        options         : [
            { name: 'GATT_PROP_READ'  },
            { name: 'GATT_PROP_WRITE'  },
            { name: 'GATT_PROP_WRITE_NO_RSP'  },
            { name: 'GATT_PROP_NOTIFY'  }
        ]
    },
    {
        name            : 'permissions',
        displayName     : 'Permissons (for ATT requests)',
        default         : [],
        minSelections   : 0,
        options         : [
            { name: 'GATT_PERMIT_READ'  },
            { name: 'GATT_PERMIT_WRITE' }
        ]
    }
];


// Define the common/portable base Watchdog
exports = {
    displayName          : "Characteristic",
    description          : 'Characteristic',
    defaultInstanceName  : 'Characteristic_',
    config               : config,
    validate             : validate

};
