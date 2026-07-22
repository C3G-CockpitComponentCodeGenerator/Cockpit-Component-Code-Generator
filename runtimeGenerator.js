function generateInputDispatcher(firmwareModel) {
    const lines = [];

    lines.push('void CheckAllInputs()');

    lines.push('{');

    const hasButtons = firmwareModel.inputs.some((d) => d.componentType === 'pushbutton');

    const hasSwitches = firmwareModel.inputs.some((d) => d.componentType === 'toggle');

    const hasEncoders = firmwareModel.inputs.some((d) => d.componentType === 'encoder');

    const hasRotaries = firmwareModel.inputs.some((d) => d.componentType === 'rotaryswitch');

    const hasAxis = firmwareModel.inputs.some((device) => device.componentType === 'axis');

    if (hasButtons) {
        lines.push('    CheckAllButtons();');
    }

    if (hasSwitches) {
        lines.push('    CheckAllSwitches();');
    }

    if (hasEncoders) {
        lines.push('    CheckAllEncoders();');
    }

    if (hasAxis) {
        lines.push('    CheckAllAxis();');
    }

    if (hasRotaries) {
        lines.push('    CheckAllRotaries();');
    }

    lines.push('}');

    return lines.join('\n');
}

function generateLoopSection(firmwareModel) {
    return [
        'void loop()',
        '{',

        '    if (isStarted)',
        '    {',

        '        CheckAllInputs();',

        '    }',

        '',

        '    messenger.feedinSerialData();',

        '}',
    ].join('\n');
}
