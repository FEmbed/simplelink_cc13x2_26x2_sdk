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
/**
 * Validate this module's configuration
 *
 * @param {object} inst - Watchdog instance to be validated
 * @param {object} vo   - Issue reporting object
 */
function validate(inst, vo)
{
	 // Validate uuid Value length
	if(inst.uuidSize == '16-bit')
	{
		if(inst.uuid.toString(16).length > 4)
		{
			vo["uuid"].errors.push("Uuid is bigger than 16 bit.");
		}
	}

	if(inst.uuidSize == '128-bit')
	{
		if(inst.uuid.toString(16).length > 16)
		{
			vo["uuid"].errors.push("Uuid is bigger than 128 bit.");
		}
	}

	if(inst.userReadCBfunc){
		if(!alphanumeric(inst.userReadCBfunc)){
			vo["userReadCBfunc"].errors.push("Read attribute CB function name should only contain alphabet or digits.");
		}
	}
	if(inst.userWriteCBfunc){
		if(!alphanumeric(inst.userWriteCBfunc)){
			vo["userWriteCBfunc"].errors.push("Write attribute CB function name should only contain alphabet or digits.");
		}
	}
	if(inst.name == ''){
		vo["name"].errors.push("Please insert service name.");
	}
	if(inst.name)
	{
		if(!alphanumeric(inst.name))
		{
			vo["name"].errors.push("Characteristic name should only contain alphabet or digits.");
		}
	}

	let serviceMod  = system.modules['/ti/ble5stack/gatt_services/Service'];
	let counter = 0;
	for (let i = 0; i < serviceMod.$instances.length; i++) {
		if(serviceMod.$instances[i].uuid == inst.uuid){
			counter ++;
			if(counter > 1){
				vo["uuid"].errors.push("This UUID is taken by another service/characteristic.");
				break;
			}
		}
		for (let cidx = 0; cidx < serviceMod.$instances[i].characteristics.length; ++ cidx) {
			if(serviceMod.$instances[i].characteristics[cidx].uuid == inst.uuid) {
				counter ++;
				if(counter > 1) {
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
        name         : 'name',
        displayName  : 'Service Name',
        default      : ""
	},
    {
        name       : 'uuidSize',
        displayName: 'Service UUID Size',
        default    : '16-bit',
        options    : [
            { name: '16-bit'  },
            { name: '128-bit' }
        ]
    },
    {
        name         : 'uuid',
        displayName  : 'Service UUID',
        default      : 0,
        displayFormat: 'hex'
	},
    {
        name         : 'userWriteCBfunc',
        displayName  : 'Write attribute CB function',
        default      : ''
	},
    {
        name         : 'userReadCBfunc',
        displayName  : 'Read attribute CB function',
        default      : ''
	}
];

function moduleInstances(inst) {
    return [
        {
            name            : 'characteristics',
            displayName     : inst.$name + ' - Characteristics',
            useArray        : true,
            moduleName      : '/ti/ble5stack/gatt_services/Characteristic',
            collapsed       : false,

        }
    ];
}

// Define the common/portable base Watchdog
exports = {
    displayName          : 'Services',
    description          : 'Service',
    defaultInstanceName  : 'Service_',
    config               : config,
    validate             : validate,
    maxInstances         : 100,
    moduleInstances      : moduleInstances,
    templates            : {
        "/ti/ble5stack/templates/services.h.xdt":
        "/ti/ble5stack/templates/services.h.xdt",

        "/ti/ble5stack/templates/services.c.xdt":
        "/ti/ble5stack/templates/services.c.xdt"
    }
};
