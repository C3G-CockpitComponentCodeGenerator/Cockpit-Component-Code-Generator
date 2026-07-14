const COMPONENT_TYPES = {
    // ==========================
    // INPUTS
    // ==========================

    encoder: {
        category: 'input',

        name: 'Rotary Encoder',

        priority: 1,

        resourceType: 'gpio',

        getPins(component) {
            return 2;
        },

        getConfig(component) {
            return '-';
        },
        mcpCompatible(component) {
            return true;
        },
    },

    pushbutton: {
        category: 'input',

        name: 'Push Button',

        priority: 3,

        resourceType: 'gpio',

        getPins(component) {
            return 1;
        },

        getConfig(component) {
            return '-';
        },

        mcpCompatible(component) {
            return true;
        },
    },

    toggle: {
        category: 'input',

        name: 'Toggle Switch',

        priority: 3,

        resourceType: 'gpio',

        getPins(component) {
            if (component.positions === 3) return 2;

            return 1;
        },

        getConfig(component) {
            return `${component.positions} Position`;
        },

        mcpCompatible(component) {
            return true;
        },
    },

    rotaryswitch: {
        category: 'input',

        name: 'Rotary Switch',

        priority: 2,

        resourceType: 'gpio',

        getPins(component) {
            return component.positions;
        },

        getConfig(component) {
            return `${component.positions} Position`;
        },

        mcpCompatible(component) {
            return true;
        },
    },

    axis: {
        category: 'input',

        name: 'Axis',

        priority: 2,

        resourceType: 'analog',

        getPins(component) {
            return 1;
        },

        getConfig(component) {
            return component.axisType || 'Potentiometer';
        },

        mcpCompatible(component) {
            return false;
        },
    },

    // ==========================
    // OUTPUTS
    // ==========================

    led: {
        category: 'output',

        name: 'LED',

        priority: 4,

        resourceType: 'gpio',

        getPins(component) {
            return 1;
        },

        getConfig(component) {
            return component.ledType || 'Standard';
        },

        mcpCompatible(component) {
            return component.ledType !== 'PWM';
        },
    },

    sevensegment: {
        category: 'output',

        name: '7 Segment Display',

        priority: 4,

        resourceType: 'spi',

        getPins(component) {
            // MAX7219 always uses
            // DIN + CLK + CS

            return 1;
        },

        getConfig(component) {
            return `${component.modules} Modules`;
        },

        /*  getConfig(component) {
         return `${component.digits} Digits`;
       }, */

        mcpCompatible(component) {
            return false;
        },
    },

    display: {
        category: 'output',

        name: 'Display',

        priority: 4,

        resourceType: 'display',

        getPins(component) {
            switch (component.displayType) {
                case 'OLED_I2C':
                    return 0;

                case 'LCD_I2C':
                    return 0;

                case 'LCD_PARALLEL':
                    return 6;

                case 'TFT':
                    return 8;

                default:
                    return 0;
            }
        },

        getConfig(component) {
            switch (component.displayType) {
                case 'OLED_I2C':
                    return 'OLED I2C';

                case 'LCD_I2C':
                    return 'LCD I2C';

                case 'LCD_PARALLEL':
                    return 'LCD Parallel';

                case 'TFT':
                    return 'TFT';

                default:
                    return '-';
            }
        },

        mcpCompatible(component) {
            return false;
        },
    },
};

// ====================================
// Helper Functions
// ====================================

function getComponentPins(component) {
    return COMPONENT_TYPES[component.type].getPins(component);
}

function getComponentConfig(component) {
    return COMPONENT_TYPES[component.type].getConfig(component);
}

function getComponentCategory(component) {
    return COMPONENT_TYPES[component.type].category;
}

function getComponentName(component) {
    return COMPONENT_TYPES[component.type].name;
}

function calculateProjectResources(components) {
    let gpioUsed = 0;
    let analogUsed = 0;
    let pwmUsed = 0;

    let spiUsed = 0;
    let i2cUsed = 0;
    let displayUsed = 0;

    let boardGPIOUsed = 0;
    let expansionGPIOUsed = 0;

    components.forEach((component) => {
        const definition = COMPONENT_TYPES[component.type];

        const pins = definition.getPins(component);

        if (component.type === 'sevensegment') {
            displayUsed += component.modules || 1;
        }

        switch (definition.resourceType) {
            case 'gpio':
                gpioUsed += pins;

                if (component.assignedDevice === 'BOARD') {
                    boardGPIOUsed += pins;
                } else {
                    expansionGPIOUsed += pins;
                }

                break;

            case 'analog':
                analogUsed += pins;
                break;

            case 'spi':
                spiUsed += 1;
                break;

            case 'display':
                if (component.type === 'sevensegment') {
                    displayUsed += component.modules || 1;
                } else {
                    displayUsed += 1;
                }

                break;
        }

        // PWM LEDs

        if (component.type === 'led' && component.ledType === 'PWM') {
            pwmUsed++;
        }

        // I2C Displays

        if (
            component.type === 'display' &&
            (component.displayType === 'OLED_I2C' || component.displayType === 'LCD_I2C')
        ) {
            i2cUsed++;
        }
    });

    return {
        gpioUsed,

        boardGPIOUsed,

        expansionGPIOUsed,

        analogUsed,
        pwmUsed,

        spiUsed,
        i2cUsed,
        displayUsed,
    };
}
