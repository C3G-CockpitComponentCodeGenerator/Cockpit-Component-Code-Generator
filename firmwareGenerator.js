function generateFirmware(firmwareModel) {
    return [
        '// GENERATED FIRMWARE',

        '#include <CmdMessenger.h>',
        '#include <Encoder.h>',
        '#include <string.h>',
        generateMCPIncludes(project),
        '',
        generateSevenSegmentIncludes(firmwareModel),

        'CmdMessenger messenger(Serial);',
        '',

        generateGlobalDefinitions(firmwareModel),

        '',
        generateMCPObjects(project),

        '',

        generateSevenSegmentObjects(firmwareModel),

        '',

        generateRuntimeGlobals(),

        '',

        generateButtonVariables(firmwareModel),

        '',

        generateAxisVariables(firmwareModel),

        '',

        generateSwitchVariables(firmwareModel),

        '',

        generateEncoderVariables(firmwareModel),

        '',

        generateRotaryVariables(firmwareModel),
        '',

        generateEncoderObjects(firmwareModel),

        '',

        generateAttachCallbacks(firmwareModel),

        '',
        generateUnknownCommandHandler(),

        '',

        generateSpadEventHandler(),

        '',

        generateDeviceLedHandler(firmwareModel),

        '',

        generateDisplayUpdateHandler(firmwareModel),

        generateSetupSection(firmwareModel),

        '',

        generateButtonScanner(firmwareModel),

        '',

        generateSwitchScanner(firmwareModel),

        '',

        generateEncoderScanner(firmwareModel),

        '',
        generateAxisScanner(firmwareModel),

        '',

        generateRotaryScanner(firmwareModel),
        '',

        generateInputDispatcher(firmwareModel),

        '',

        generateIdentifyHandler(firmwareModel),

        '',

        generateLoopSection(firmwareModel),
    ].join('\n');
}
