function generateSPADConfig(firmwareModel) {

    return firmwareModel.registration
        .map(generateSPADDevice)
        .join("\n\n");
}

function generateSPADDevice(device) {

    const lines = [

        "//----- CREATE " + device.type + " -----",
        "",

        "messenger.sendCmdStart(0);",

        `messenger.sendCmdArg("${device.direction}");`,

        `messenger.sendCmdArg(${device.id});`,

        `messenger.sendCmdArg("${device.label}");`,

        `messenger.sendCmdArg("${device.type}");`,

        `messenger.sendCmdArg("${device.behavior}");`
    ];

    if (
        device.type === "SWITCH3" &&
        device.positionNames &&
        device.positionNames.length === 3
    ) {

        lines.push(
            `messenger.sendCmdArg("POS_NAMES=${device.positionNames.join("#")}");`
        );
    }
if (
    device.type === "ROTARY" &&
    device.positionNames &&
    device.positionNames.length > 0
) {

    lines.push(
        `messenger.sendCmdArg("POS_NAMES=${device.positionNames.join("#")}");`
    );

    lines.push(
        `messenger.sendCmdArg("POS_VALUES=${device.positionNames.map((_, i) => i).join("#")}");`
    );
}

if (
    device.componentType ===
    "sevensegment"
) {

    lines.push(
        `messenger.sendCmdArg("LENGTH=${device.digits}");`
    );

    lines.push(
        `messenger.sendCmdArg("ROWS=1");`
    );

    lines.push(
        `messenger.sendCmdArg("WIDTH=133");`
    );

    lines.push(
        `messenger.sendCmdArg("HEIGHT=40");`
    );
}
    lines.push(
        "messenger.sendCmdEnd();"
    );

    return lines.join("\n");
}

function generateSPADConfigSection(firmwareModel) {

    const devices =
        generateSPADConfig(firmwareModel);

    return [

        'if (strcmp(szRequest, "CONFIG") == 0) {',

        '',

        '    messenger.sendCmdStart(0);',
        '    messenger.sendCmdArg("OPTION");',
        '    messenger.sendCmdArg("ISGENERIC=1");',
        '    messenger.sendCmdArg("PAGESUPPORT=1");',
        '    messenger.sendCmdArg("NO_DISPLAY_CLEAR=1");',
        '    messenger.sendCmdEnd();',

        '',

        devices,

        '',

        '    messenger.sendCmd(0, "CONFIG");',
        '    return;',
        '}'

    ].join("\n");
}