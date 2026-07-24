function generateDeviceModel(project) {
    const allocationResult = allocatePins(project);

    if (!allocationResult.valid) {
        return [];
    }

    const devices = [];
    let nextDisplayIndex = 1;

    allocationResult.allocations.forEach((allocation) => {
        const component = allocation.component;

        const spad = getSPADDefinition(component);
        if (component.type === 'sevensegment' && component.displays) {
            component.displays.forEach((display, index) => {
                devices.push({
                    label: display.name,

                    tag: spad.tagPrefix + sanitizeTag(display.name),

                    componentType: component.type,

                    spadType: spad.spadType,

                    inherit: spad.inherit,

                    pins: allocation.pins.map((pin) => {
                        if (typeof pin === 'string') {
                            return pin;
                        }

                        return `BOARD:${pin}`;
                    }),

                    // displayIndex: index + 1,
                    displayIndex: nextDisplayIndex++,

                    moduleIndex: index,

                    displayConfig: display,

                    moduleCount: component.modules,
                });
            });

            return;
        }

        devices.push({
            label: component.label,
            tag: spad.tagPrefix + sanitizeTag(component.label),

            componentType: component.type,

            spadType: spad.spadType,

            inherit: spad.inherit,

            pins: allocation.pins.map((pin) => {
                if (typeof pin === 'string') {
                    return pin;
                }

                return `BOARD:${pin}`;
            }),

            encoderMode: component.encoderMode,

            positions: component.positions,

            switchPositions: component.positions,

            positionNames: component.positionNames || [],

            deviceCount: component.deviceCount,
        });
    });

    return devices;
}

function getSPADDefinition(component) {
    switch (component.type) {
        case 'pushbutton':
            return {
                spadType: 'PUSHBUTTON',

                inherit: component.buttonBehavior === 'ADVANCED' ? 'SPAD_PUSHBUTTON' : 'SPAD_SIMPLEBUTTON',

                tagPrefix: 'I_',
            };

        case 'encoder':
            return {
                spadType: 'ENCODER',

                inherit: 'SPAD_ENCODER',

                tagPrefix: 'E_',
            };

        case 'rotaryswitch':
            return {
                spadType: 'ROTARY',

                inherit: '',

                tagPrefix: 'R_',
            };

        case 'led':
            return {
                spadType: 'LED',

                inherit: 'SPAD_LED',

                tagPrefix: 'L_',
            };

        case 'toggle':
            return {
                spadType: component.positions === 3 ? 'SWITCH3' : 'SWITCH',

                inherit: 'SPAD_SWITCH',

                tagPrefix: 'S_',
            };

        case 'sevensegment':
            return {
                spadType: 'DISPLAY',

                inherit: 'SPAD_DISPLAY',

                tagPrefix: 'D_',
            };

        case 'axis':
            return {
                spadType: 'AXIS',

                inherit: 'SPAD_AXIS',

                tagPrefix: 'A_',
            };

        default:
            return {
                spadType: 'UNKNOWN',

                inherit: '',

                tagPrefix: 'X_',
            };
    }
}

//----------------------------------------------------
// Helper Function
//----------------------------------------------------
function sanitizeTag(text) {
    return text
        .toUpperCase()
        .replace(/\s+/g, '_')
        .replace(/[^A-Z0-9_]/g, '');
}
