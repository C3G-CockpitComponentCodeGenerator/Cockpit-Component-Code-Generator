function generateButtonScanner(firmwareModel) {
    const buttons = firmwareModel.inputs.filter((device) => device.componentType === 'pushbutton');

    const lines = [];

    lines.push('void CheckAllButtons()');

    lines.push('{');

    buttons.forEach((button) => {
        const pinRef = button.pins[0];

        if (pinRef.startsWith('BOARD:')) {
            const pin = pinRef.replace('BOARD:', '');

            lines.push(`    int b${button.id} = digitalRead(${pin});`);
        } else if (pinRef.startsWith('0x')) {
            const [address, pinName] = pinRef.split(':');

            const mcpName = address.replace('0x', 'mcp');

            let mcpPin = 0;

            if (pinName.startsWith('GPA')) {
                mcpPin = parseInt(pinName.replace('GPA', ''));
            } else {
                mcpPin = 8 + parseInt(pinName.replace('GPB', ''));
            }

            lines.push(`    int b${button.id} = ${mcpName}.digitalRead(${mcpPin});`);
        }

        lines.push('');

        lines.push(`    if (b${button.id} != buttonLast_${button.id})`);

        lines.push('    {');

        lines.push(`        buttonLast_${button.id} = b${button.id};`);

        lines.push('');

        lines.push(`        messenger.sendCmd(8, b${button.id} == LOW ? "${button.id},1" : "${button.id},0");`);

        lines.push('');

        lines.push('        delay(25);');

        lines.push('    }');
    });

    lines.push('}');

    return lines.join('\n');
}

function generateAxisScanner(firmwareModel) {
    const axes = firmwareModel.inputs.filter((device) => device.componentType === 'axis');

    const lines = [];

    lines.push('void CheckAllAxis()');
    lines.push('{');

    axes.forEach((axis) => {
        const pinRef = axis.pins[0];

        if (pinRef.startsWith('BOARD:')) {
            const pin = pinRef.replace('BOARD:', '');

            lines.push(`    int value${axis.id} = analogRead(${pin});`);
            lines.push('');
            lines.push(`    if (abs(value${axis.id} - axisLast_${axis.id}) >= 2)`);
            lines.push('    {');
            lines.push(`        axisLast_${axis.id} = value${axis.id};`);
            lines.push('');
            lines.push('        messenger.sendCmdStart(8);');
            lines.push(`        messenger.sendCmdArg(${axis.id});`);
            lines.push(`        messenger.sendCmdArg(value${axis.id});`);
            lines.push('        messenger.sendCmdEnd();');
            lines.push('    }');
            lines.push('');
        }
    });

    lines.push('}');

    return lines.join('\n');
}

function generateButtonVariables(firmwareModel) {
    const buttons = firmwareModel.inputs.filter((device) => device.componentType === 'pushbutton');

    return buttons.map((button) => `int buttonLast_${button.id} = -1;`).join('\n');
}

function generateAxisVariables(firmwareModel) {
    const axes = firmwareModel.inputs.filter((device) => device.componentType === 'axis');

    return axes.map((axis) => `int axisLast_${axis.id} = -1;`).join('\n');
}

function generateSwitchVariables(firmwareModel) {
    const switches = firmwareModel.inputs.filter((device) => device.componentType === 'toggle');

    return switches.map((sw) => `int switchLast_${sw.id} = -1;`).join('\n');
}

function generateRotaryVariables(firmwareModel) {
    const rotaries = firmwareModel.inputs.filter((device) => device.componentType === 'rotaryswitch');

    return rotaries.map((rotary) => `int rotaryLast_${rotary.id} = -1;`).join('\n');
}

function generateSwitchScanner(firmwareModel) {
    const switches = firmwareModel.inputs.filter((device) => device.componentType === 'toggle');

    const lines = [];

    lines.push('void CheckAllSwitches()');

    lines.push('{');

    switches.forEach((sw) => {
        lines.push('');

        if (sw.type === 'SWITCH') {
            const pinRef = sw.pins[0];

            let readExpr = '';

            if (pinRef.startsWith('BOARD:')) {
                const pin = pinRef.replace('BOARD:', '');

                readExpr = `digitalRead(${pin})`;
            } else if (pinRef.startsWith('0x')) {
                const [address, pinName] = pinRef.split(':');

                const mcpName = address.replace('0x', 'mcp');

                let mcpPin = 0;

                if (pinName.startsWith('GPA')) {
                    mcpPin = parseInt(pinName.replace('GPA', ''));
                } else {
                    mcpPin = 8 + parseInt(pinName.replace('GPB', ''));
                }

                readExpr = `${mcpName}.digitalRead(${mcpPin})`;
            }

            lines.push(`    int state_${sw.id} = ${readExpr} == LOW ? 1 : 0;`);

            lines.push('');

            lines.push(`    if (state_${sw.id} != switchLast_${sw.id})`);

            lines.push('    {');

            lines.push(`        switchLast_${sw.id} = state_${sw.id};`);

            lines.push('');

            lines.push(`        messenger.sendCmd(8, "${sw.id}," + String(state_${sw.id}));`);

            lines.push('    }');
        }

        if (sw.type === 'SWITCH3') {
            let readExprA = '';
            let readExprB = '';

            // ---------- PIN A ----------

            const pinRefA = sw.pins[0];

            if (pinRefA.startsWith('BOARD:')) {
                const pinA = pinRefA.replace('BOARD:', '');

                readExprA = `digitalRead(${pinA})`;
            } else if (pinRefA.startsWith('0x')) {
                const [address, pinName] = pinRefA.split(':');

                const mcpName = address.replace('0x', 'mcp');

                let mcpPin = 0;

                if (pinName.startsWith('GPA')) {
                    mcpPin = parseInt(pinName.replace('GPA', ''));
                } else {
                    mcpPin = 8 + parseInt(pinName.replace('GPB', ''));
                }

                readExprA = `${mcpName}.digitalRead(${mcpPin})`;
            }

            // ---------- PIN B ----------

            const pinRefB = sw.pins[1];

            if (pinRefB.startsWith('BOARD:')) {
                const pinB = pinRefB.replace('BOARD:', '');

                readExprB = `digitalRead(${pinB})`;
            } else if (pinRefB.startsWith('0x')) {
                const [address, pinName] = pinRefB.split(':');

                const mcpName = address.replace('0x', 'mcp');

                let mcpPin = 0;

                if (pinName.startsWith('GPA')) {
                    mcpPin = parseInt(pinName.replace('GPA', ''));
                } else {
                    mcpPin = 8 + parseInt(pinName.replace('GPB', ''));
                }

                readExprB = `${mcpName}.digitalRead(${mcpPin})`;
            }
            //--

            lines.push(`    int state_${sw.id};`);

            lines.push('');

            lines.push(`    if (${readExprA} == LOW)`);

            lines.push(`        state_${sw.id} = 0;`);

            lines.push(`    else if (${readExprB} == LOW)`);

            lines.push(`        state_${sw.id} = 2;`);

            lines.push(`    else`);

            lines.push(`        state_${sw.id} = 1;`);

            lines.push('');

            lines.push(`    if (state_${sw.id} != switchLast_${sw.id})`);

            lines.push('    {');

            lines.push(`        switchLast_${sw.id} = state_${sw.id};`);

            lines.push('');

            lines.push(`        messenger.sendCmd(8, "${sw.id}," + String(state_${sw.id}));`);

            lines.push('    }');
        }
    });

    lines.push('}');

    return lines.join('\n');
}

function generateEncoderObjects(firmwareModel) {
    const encoders = firmwareModel.inputs.filter((device) => device.componentType === 'encoder');

    return encoders
        .filter((encoder) => encoder.pins[0].startsWith('BOARD:'))
        .map((encoder) => {
            const pinA = encoder.pins[0].replace('BOARD:', '');

            const pinB = encoder.pins[1].replace('BOARD:', '');

            return `Encoder enc${encoder.id}(${pinA}, ${pinB});`;
        })
        .join('\n');
}

function generateEncoderVariables(firmwareModel) {
    const encoders = firmwareModel.inputs.filter((device) => device.componentType === 'encoder');

    return encoders.map((encoder) => `long oldPos${encoder.id} = -999;`).join('\n');
}

function generateEncoderScanner(firmwareModel) {
    const encoders = firmwareModel.inputs.filter((device) => device.componentType === 'encoder');

    const lines = [];

    lines.push('void CheckAllEncoders()');

    lines.push('{');

    encoders.forEach((encoder) => {
        lines.push('');

        lines.push(`    long p${encoder.id} = enc${encoder.id}.read() / 4;`);

        lines.push('');

        lines.push(`    if (p${encoder.id} != oldPos${encoder.id})`);

        lines.push('    {');

        lines.push(
            `        messenger.sendCmd(8, p${encoder.id} > oldPos${encoder.id} ? "${encoder.id},1" : "${encoder.id},-1");`
        );

        lines.push('');

        lines.push(`        oldPos${encoder.id} = p${encoder.id};`);

        lines.push('    }');
    });

    lines.push('}');

    return lines.join('\n');
}

function generateRotaryScanner(firmwareModel) {
    const rotaries = firmwareModel.inputs.filter((device) => device.componentType === 'rotaryswitch');

    const lines = [];

    lines.push('void CheckAllRotaries()');

    lines.push('{');

    rotaries.forEach((rotary) => {
        lines.push('');

        lines.push(`    int currentState_${rotary.id} = -1;`);

        lines.push('');

        rotary.pins.forEach((pinRef, index) => {
            const readExpr = generateReadExpression(pinRef);

            if (index === 0) {
                lines.push(`    if (${readExpr} == LOW)`);
            } else {
                lines.push(`    else if (${readExpr} == LOW)`);
            }

            lines.push(`        currentState_${rotary.id} = ${index};`);
        });

        lines.push('');

        lines.push(`    if (currentState_${rotary.id} != -1 && currentState_${rotary.id} != rotaryLast_${rotary.id})`);

        lines.push('    {');

        lines.push(`        rotaryLast_${rotary.id} = currentState_${rotary.id};`);

        lines.push('');

        lines.push(`        messenger.sendCmd(8, "${rotary.id}," + String(currentState_${rotary.id}));`);

        lines.push('    }');
    });

    lines.push('}');

    return lines.join('\n');
}
