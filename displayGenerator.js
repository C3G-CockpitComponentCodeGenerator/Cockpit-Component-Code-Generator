//====================================================
// Display Includes
//====================================================
function generateDisplayIncludes(firmwareModel) {
    const displays = firmwareModel.outputs.filter((d) => d.componentType === 'display');

    if (displays.length === 0) {
        return '';
    }
    return [
        '#include <Wire.h>',
        '#include <Adafruit_GFX.h>',
        '#include <Adafruit_SSD1306.h>',
        '#include "DisplayManager.h"',
    ].join('\n');
}

//====================================================
// Display Objects
//====================================================
function generateDisplayObjects(firmwareModel) {
    const displays = firmwareModel.outputs.filter((d) => d.componentType === 'display');

    if (displays.length === 0) {
        return '';
    }

    return [
        '//====================================================',
        '// Display Objects',
        '//====================================================',
        'Adafruit_SSD1306 display(128, 64, &Wire, -1);',
        'DisplayManagerClass DisplayManager;',
    ].join('\n');
}

//====================================================
// Display Setup
//====================================================
function generateDisplaySetup(firmwareModel) {
    const displays = firmwareModel.outputs.filter((d) => d.componentType === 'display');

    if (displays.length === 0) {
        return '';
    }

    return [
        '    Wire.begin();',
        '',
        '    display.begin(SSD1306_SWITCHCAPVCC, 0x3C);',
        '    display.clearDisplay();',
        '    display.display();',
        '',
        '    DisplayManager.begin(&display);',
    ].join('\n');
}

//====================================================
// Callback Registration
//====================================================

//====================================================
// Display Update
//====================================================

//====================================================
// SPAD Configuration
//====================================================

//====================================================
// SPAD Configuration
//====================================================
