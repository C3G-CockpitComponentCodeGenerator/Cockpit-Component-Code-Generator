function generateSetupPins(firmwareModel) {
    const inputPins = firmwareModel.inputs.map(generateInputPinSetup).join('\n');

    const outputPins = firmwareModel.outputs.map(generateOutputPinSetup).join('\n');

    return [inputPins, outputPins].join('\n');
}

function generateInputPinSetup(device) {
    const lines = [];

    device.pins.forEach((pin) => {
        // BOARD GPIO

        if (typeof pin === 'string' && pin.startsWith('BOARD:')) {
            const gpio = pin.replace('BOARD:', '');

            lines.push(`pinMode(${gpio}, INPUT_PULLUP);`);

            return;
        }

        // MCP GPIO

        if (typeof pin === 'string' && pin.startsWith('0x')) {
            const [address, pinName] = pin.split(':');

            const mcpName = address.replace('0x', 'mcp');

            let mcpPin = 0;

            if (pinName.startsWith('GPA')) {
                mcpPin = parseInt(pinName.replace('GPA', ''));
            } else if (pinName.startsWith('GPB')) {
                mcpPin = 8 + parseInt(pinName.replace('GPB', ''));
            }

            lines.push(`${mcpName}.pinMode(${mcpPin}, INPUT_PULLUP);`);
        }
    });

    return lines.join('\n');
}

function generateSetupSection(firmwareModel) {
    const pinSetup = generateSetupPins(firmwareModel);

    const mcpSetup = generateMCPSetup(project);

    return [
        'void setup()',
        '{',

        '    Serial.begin(115200);',
        '',
        generateSevenSegmentSetup(firmwareModel),
        mcpSetup,
        '',

        pinSetup,
        '',

        '    attachCommandCallbacks();',

        '}',
    ].join('\n');
}

function generateOutputPinSetup(device) {
    const lines = [];

    device.pins.forEach((pinRef) => {
        // ---------- BOARD ----------
        if (typeof pinRef === 'string' && pinRef.startsWith('BOARD:')) {
            const gpio = pinRef.replace('BOARD:', '');

            lines.push(`pinMode(${gpio}, OUTPUT);`);

            lines.push(`digitalWrite(${gpio}, LOW);`);
        }

        // ---------- MCP ----------
        else if (typeof pinRef === 'string' && pinRef.startsWith('0x')) {
            const [address, pinName] = pinRef.split(':');

            const mcpName = address.replace('0x', 'mcp');

            let mcpPin = 0;

            if (pinName.startsWith('GPA')) {
                mcpPin = parseInt(pinName.replace('GPA', ''));
            } else {
                mcpPin = 8 + parseInt(pinName.replace('GPB', ''));
            }

            lines.push(`${mcpName}.pinMode(${mcpPin}, OUTPUT);`);

            lines.push(`${mcpName}.digitalWrite(${mcpPin}, LOW);`);
        }
    });

    return lines.join('\n');
}
