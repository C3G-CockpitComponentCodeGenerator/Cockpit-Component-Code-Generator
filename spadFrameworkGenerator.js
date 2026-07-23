function generateGlobalDefinitions(firmwareModel) {
    const lines = [];

    lines.push(`String authkey = "${firmwareModel.authorId}";`);

    lines.push('');

    lines.push(`String guid = "${firmwareModel.guid}";`);

    return lines.join('\n');
}

function generateInitSection(firmwareModel) {
    const lines = [];

    lines.push('if (strcmp(szRequest, "INIT") == 0)');

    lines.push('{');

    lines.push('    messenger.sendCmdStart(0);');

    lines.push('    messenger.sendCmdArg("SPAD");');

    lines.push('    messenger.sendCmdArg(guid);');

    lines.push(`    messenger.sendCmdArg("${firmwareModel.deviceName}");`);

    lines.push('    messenger.sendCmdArg(2);');

    lines.push('    messenger.sendCmdArg("1");');

    lines.push('    messenger.sendCmdArg("AUTHOR=" + authkey);');

    lines.push('    messenger.sendCmdEnd();');

    lines.push('    return;');

    lines.push('}');

    return lines.join('\n');
}

function generatePingSection() {
    const lines = [];

    lines.push('if (strcmp(szRequest, "PING") == 0)');

    lines.push('{');

    lines.push('    messenger.sendCmdStart(0);');

    lines.push('    messenger.sendCmdArg("PONG");');

    lines.push('    messenger.sendCmdArg(messenger.readInt32Arg());');

    lines.push('    messenger.sendCmdEnd();');

    lines.push('    return;');

    lines.push('}');

    return lines.join('\n');
}

function generateScanStateSection() {
    const lines = [];

    lines.push('if (strcmp(szRequest, "SCANSTATE") == 0)');

    lines.push('{');

    lines.push('    messenger.sendCmdStart(0);');

    lines.push('    messenger.sendCmdArg("STATESCAN");');

    lines.push('    messenger.sendCmdEnd();');

    lines.push('    return;');

    lines.push('}');

    return lines.join('\n');
}

function generateIdentifyHandler(firmwareModel) {
    const lines = [];

    lines.push('void onIdentifyRequest()');

    lines.push('{');

    lines.push('    char *szRequest = messenger.readStringArg();');

    lines.push('');

    lines.push(generateInitSection(firmwareModel));

    lines.push('');

    lines.push(generateScanStateSection());

    lines.push('');

    lines.push(generatePingSection());

    lines.push('');

    lines.push(generateSPADConfigSection(firmwareModel));

    lines.push('');

    lines.push('}');

    return lines.join('\n');
}

function generateRuntimeGlobals() {
    return ['bool isReady = false;', 'bool isStarted = false;'].join('\n');
}

function generateAttachCallbacks(firmwareModel) {
    const lines = [
        'void attachCommandCallbacks()',
        '{',

        '    messenger.sendCmd(3, "ATTACHING CALLBACKS!");',

        '    messenger.attach(0, onIdentifyRequest);',

        '    messenger.attach(2, onSpadEvent);',

        '    messenger.attach(3, onUnknownCommand);',
    ];

    if (firmwareModel.outputs.length > 0) {
        lines.push('    messenger.attach(6, onDeviceLed);');
    }

    const hasDisplay = firmwareModel.outputs.some((d) => d.componentType === 'sevensegment');

    if (hasDisplay) {
        lines.push('    messenger.attach(7, onDisplayUpdate);');
    }

    lines.push('}');

    return lines.join('\n');
}

function generateUnknownCommandHandler() {
    return ['void onUnknownCommand()', '{', '    messenger.sendCmd(3, "UNKNOWN COMMAND");', '}'].join('\n');
}

function generateSpadEventHandler() {
    return [
        'void onSpadEvent()',
        '{',

        '    char *szEvent = messenger.readStringArg();',

        '',

        '    if (strcmp(szEvent, "START") == 0)',
        '    {',
        '        isStarted = true;',
        '        return;',
        '    }',

        '',

        '    if (strcmp(szEvent, "END") == 0)',
        '    {',
        '        isStarted = false;',
        '        return;',
        '    }',

        '}',
    ].join('\n');
}
