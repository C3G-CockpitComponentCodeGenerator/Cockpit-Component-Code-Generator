function generateDeviceModel(project) {
    const allocationResult = allocatePins(project);

    if (!allocationResult.valid) {
        return [];
    }

    const devices = [];

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

                    displayIndex: index + 1,

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
    console.log(devices);
    console.log('DEVICE MODEL', devices);
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

function debugSPADConfig() {
    const deviceModel = generateDeviceModel(project);

    const firmwareModel = generateFirmwareModel(deviceModel);

    const config = generateSPADConfig(firmwareModel);

    console.log(config);
}

//----------------------------------------------------
// Temp Test Function
//----------------------------------------------------

function debugDeviceModel() {
    console.log(generateDeviceModel(project));
}

function debugFirmwareModel() {
    console.log('DEBUG FIRMWARE BUTTON PRESSED');

    const deviceModel = generateDeviceModel(project);

    const firmwareModel = generateFirmwareModel(deviceModel);

    console.log(firmwareModel);
}

function debugSPADConfigSection() {
    const deviceModel = generateDeviceModel(project);

    const firmwareModel = generateFirmwareModel(deviceModel);

    const configSection = generateSPADConfigSection(firmwareModel);

    console.log(configSection);
}

function debugSetupPins() {
    const deviceModel = generateDeviceModel(project);

    const firmwareModel = generateFirmwareModel(deviceModel);

    const setupPins = generateSetupPins(firmwareModel);

    console.log(setupPins);
}

function debugSetupSection() {
    const deviceModel = generateDeviceModel(project);

    const firmwareModel = generateFirmwareModel(deviceModel);

    console.log(generateSetupSection(firmwareModel));
}

function debugButtonScanner() {
    const deviceModel = generateDeviceModel(project);

    const firmwareModel = generateFirmwareModel(deviceModel);

    console.log(generateButtonScanner(firmwareModel));
}

function debugButtonVariables() {
    const deviceModel = generateDeviceModel(project);

    const firmwareModel = generateFirmwareModel(deviceModel);

    console.log(generateButtonVariables(firmwareModel));
}

function debugSwitchVariables() {
    const deviceModel = generateDeviceModel(project);

    const firmwareModel = generateFirmwareModel(deviceModel);

    console.log(generateSwitchVariables(firmwareModel));
}

function debugSwitchScanner() {
    const deviceModel = generateDeviceModel(project);

    const firmwareModel = generateFirmwareModel(deviceModel);

    console.log(generateSwitchScanner(firmwareModel));
}

function debugInputDispatcher() {
    const deviceModel = generateDeviceModel(project);

    const firmwareModel = generateFirmwareModel(deviceModel);

    console.log(generateInputDispatcher(firmwareModel));
}

function debugLoopSection() {
    const deviceModel = generateDeviceModel(project);

    const firmwareModel = generateFirmwareModel(deviceModel);

    console.log(generateLoopSection(firmwareModel));
}

function debugEncoderObjects() {
    const deviceModel = generateDeviceModel(project);

    const firmwareModel = generateFirmwareModel(deviceModel);

    console.log(generateEncoderObjects(firmwareModel));
}

function debugEncoderVariables() {
    const deviceModel = generateDeviceModel(project);

    const firmwareModel = generateFirmwareModel(deviceModel);

    console.log(generateEncoderVariables(firmwareModel));
}

function debugEncoderScanner() {
    const deviceModel = generateDeviceModel(project);

    const firmwareModel = generateFirmwareModel(deviceModel);

    console.log(generateEncoderScanner(firmwareModel));
}

function debugFirmwareMetadata() {
    const deviceModel = generateDeviceModel(project);

    const firmwareModel = generateFirmwareModel(deviceModel);

    console.log('FIRMWARE MODEL');

    console.log(firmwareModel);
}

function debugGlobalDefinitions() {
    const deviceModel = generateDeviceModel(project);

    const firmwareModel = generateFirmwareModel(deviceModel);

    console.log(generateGlobalDefinitions(firmwareModel));
}

function debugInitSection() {
    const deviceModel = generateDeviceModel(project);

    const firmwareModel = generateFirmwareModel(deviceModel);

    console.log(generateInitSection(firmwareModel));
}

function debugPingSection() {
    console.log(generatePingSection());
}

function debugScanStateSection() {
    console.log(generateScanStateSection());
}

function debugIdentifyHandler() {
    const deviceModel = generateDeviceModel(project);

    const firmwareModel = generateFirmwareModel(deviceModel);

    console.log(generateIdentifyHandler(firmwareModel));
}

function debugFirmware() {
    const deviceModel = generateDeviceModel(project);

    const firmwareModel = generateFirmwareModel(deviceModel);

    console.log(generateFirmware(firmwareModel));
}

function debugLedHandler() {
    const deviceModel = generateDeviceModel(project);

    const firmwareModel = generateFirmwareModel(deviceModel);

    console.log(generateDeviceLedHandler(firmwareModel));
}

function debugMCPObjects() {
    console.log(generateMCPObjects(project));
}
