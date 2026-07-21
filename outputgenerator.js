function generateDeviceLedHandler(firmwareModel) {
    if (firmwareModel.outputs.length === 0) {
        return '';
    }

    const lines = [];

    lines.push('void onDeviceLed()');

    lines.push('{');

    lines.push('    int32_t ledID = messenger.readInt32Arg();');

    lines.push('    int32_t ledVal = messenger.readInt32Arg();');

    lines.push('');

    lines.push('    switch (ledID)');

    lines.push('    {');

    firmwareModel.outputs
        .filter((output) => output.componentType === 'led')
        .forEach((output) => {
            const pinRef = output.pins[0];

            lines.push(`        case ${output.id}:`);

            if (pinRef.startsWith('BOARD:')) {
                const pin = pinRef.replace('BOARD:', '');

                lines.push(`            digitalWrite(${pin}, ledVal ? HIGH : LOW);`);
            } else if (pinRef.startsWith('0x')) {
                const [address, pinName] = pinRef.split(':');

                const mcpName = address.replace('0x', 'mcp');

                let mcpPin = 0;

                if (pinName.startsWith('GPA')) {
                    mcpPin = parseInt(pinName.replace('GPA', ''));
                } else {
                    mcpPin = 8 + parseInt(pinName.replace('GPB', ''));
                }

                lines.push(`            ${mcpName}.digitalWrite(${mcpPin}, ledVal ? HIGH : LOW);`);
            }

            lines.push('            break;');

            lines.push('');
        });

    lines.push('        default:');

    lines.push('            break;');
    lines.push('    }');

    lines.push('}');

    return lines.join('\n');
}

function generateReadExpression(pinRef) {
    if (pinRef.startsWith('BOARD:')) {
        const pin = pinRef.replace('BOARD:', '');

        return `digitalRead(${pin})`;
    }

    if (pinRef.startsWith('0x')) {
        const [address, pinName] = pinRef.split(':');

        const mcpName = address.replace('0x', 'mcp');

        let mcpPin = 0;

        if (pinName.startsWith('GPA')) {
            mcpPin = parseInt(pinName.replace('GPA', ''));
        } else {
            mcpPin = 8 + parseInt(pinName.replace('GPB', ''));
        }

        return `${mcpName}.digitalRead(${mcpPin})`;
    }

    return 'HIGH';
}
