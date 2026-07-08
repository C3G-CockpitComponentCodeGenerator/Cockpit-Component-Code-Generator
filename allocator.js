function allocatePins(project) {
    const board = BOARDS[project.board];

    const reservedPins = new Set();

    const allocations = [];

    const errors = [];
    // const device = getAssignedExpansionDevice(component);

    //  console.log(device);

    expansionManager.resetAllocations();

    // =====================================
    // Helpers
    // =====================================

    function getNextFreeMCPPin() {
        const devices = expansionManager.getDevices();

        for (const device of devices) {
            const freePins = device.getFreePins();

            if (freePins.length > 0) {
                return {
                    device,
                    pin: freePins[0],
                };
            }
        }

        return null;
    }

    function allocateMCPPin() {
        const result = getNextFreeMCPPin();

        if (!result) return null;

        console.log('Allocating', result.pin, 'from', result.device.address);

        result.device.allocatePin(result.pin);

        return result;
    }

    function reservePin(pin) {
        reservedPins.add(String(pin));
    }

    function isReserved(pin) {
        return reservedPins.has(String(pin));
    }

    function getFreeGPIO() {
        return board.gpioPins.filter((pin) => !isReserved(pin));
    }

    // =====================================
    // STEP 1
    // Reserve SPI Pins
    // =====================================

    const hasSPI = project.components.some((c) => c.type === 'sevensegment');

    if (hasSPI) {
        reservePin(board.spi.miso);
        reservePin(board.spi.mosi);
        reservePin(board.spi.sck);
    }

    // =====================================
    // STEP 2
    // Reserve I2C Pins
    // =====================================

    const hasI2C = project.components.some(
        (c) => c.type === 'display' && (c.displayType === 'OLED_I2C' || c.displayType === 'LCD_I2C')
    );

    if (hasI2C) {
        reservePin(board.i2c.sda);
        reservePin(board.i2c.scl);
    }

    // =====================================
    // STEP 3
    // Allocate Axis First
    // =====================================

    const axisComponents = project.components.filter((c) => c.type === 'axis');

    for (const axis of axisComponents) {
        let analogPin;

        if (project.allocationMode === 'MANUAL') {
            analogPin = board.analogPins.find((p) => p.analog === axis.manualAxisPin);

            if (analogPin && isReserved(analogPin.digital)) {
                errors.push({
                    component: axis,

                    reason: 'Analog Pin Already Used',
                });

                return {
                    valid: false,
                    errors,
                };
            }
        } else {
            analogPin = board.analogPins.find((p) => !isReserved(p.digital));
        }

        if (!analogPin) {
            errors.push({
                component: axis,

                reason: 'ANALOG_EXHAUSTED',
            });

            return {
                valid: false,
                errors,
            };
        }

        reservePin(analogPin.digital);

        allocations.push({
            component: axis,

            pins: [analogPin.analog],
        });
    }

    // =====================================
    // STEP 4
    // Encoders
    // =====================================

    const encoders = project.components.filter((c) => c.type === 'encoder');

    for (const encoder of encoders) {
        console.log('ENCODER IN ALLOCATOR', encoder);
        const assigned = [];

        const useMCP = String(encoder.assignedDevice || '').startsWith('MCP');

        if (project.allocationMode === 'MANUAL') {
            //    const useMCP = String(encoder.assignedDevice || '').startsWith('MCP');
            const pinA = encoder.manualPinA;

            const pinB = encoder.manualPinB;

            if (pinA === pinB) {
                errors.push({
                    component: encoder,

                    reason: 'Encoder Pins Must Be Different',
                });

                return {
                    valid: false,
                    errors,
                };
            }

            if (isReserved(pinA)) {
                errors.push({
                    component: encoder,

                    reason: 'Encoder Pin A Already Used',
                });

                return {
                    valid: false,
                    errors,
                };
            }

            if (useMCP) {
                const allocation = ManualAllocator.allocateManualDualPins(encoder);

                if (!allocation) {
                    errors.push({
                        component: encoder,
                        reason: 'MCP Pins Already Used',
                    });

                    return {
                        valid: false,
                        errors,
                    };
                }

                assigned.push(`${allocation.device.address}:${pinA}`);

                assigned.push(`${allocation.device.address}:${pinB}`);
            } else {
                if (isReserved(pinB)) {
                    errors.push({
                        component: encoder,

                        reason: 'Encoder Pin B Already Used',
                    });

                    return {
                        valid: false,
                        errors,
                    };
                }

                reservePin(pinA);
                assigned.push(`BOARD:${pinA}`);

                reservePin(pinB);
                assigned.push(`BOARD:${pinB}`);
            }
        } else {
            const candidatePins = [...board.encoderPreferredPins, ...getFreeGPIO()].filter(
                (value, index, array) => array.indexOf(value) === index
            );

            for (let i = 0; i < 2; i++) {
                const pin = candidatePins.find((p) => !isReserved(p));

                if (pin === undefined) {
                    errors.push({
                        component: encoder,

                        reason: 'No Encoder Pins Available',
                    });

                    return {
                        valid: false,
                        errors,
                    };
                }

                reservePin(pin);

                assigned.push(pin);
            }
        }

        allocations.push({
            component: encoder,

            pins: assigned,
        });
    }

    // =====================================
    // STEP 5
    // PWM LEDs
    // =====================================

    const pwmLeds = project.components.filter((c) => c.type === 'led' && c.ledType === 'PWM');

    for (const led of pwmLeds) {
        const pin = board.pwmPins.find((p) => !isReserved(p));

        if (pin === undefined) {
            errors.push({
                component: led,

                reason: 'No PWM Pins Available',
            });

            return {
                valid: false,
                errors,
            };
        }

        reservePin(pin);

        allocations.push({
            component: led,

            pins: [pin],
        });
    }

    // =====================================
    // STEP 6
    // Everything Else
    // =====================================

    const remaining = project.components.filter(
        (c) => c.type !== 'axis' && c.type !== 'encoder' && !(c.type === 'led' && c.ledType === 'PWM')
    );

    for (const component of remaining) {
        // SPI devices

        if (component.type === 'sevensegment') {
            let csPin;

            if (project.allocationMode === 'MANUAL') {
                csPin = component.manualPin;

                if (isReserved(csPin)) {
                    errors.push({
                        component,

                        reason: 'CS Pin Already Used',
                    });

                    return {
                        valid: false,
                        errors,
                    };
                }
            } else {
                csPin = board.displayCSPins?.find((pin) => getFreeGPIO().includes(pin));

                if (csPin === undefined) {
                    csPin = getFreeGPIO()[0];
                }
            }

            reservePin(csPin);

            allocations.push({
                component,

                pins: [
                    `DIN:${board.spi.mosi}`,
                    `CLK:${board.spi.sck}`,
                    `CS:${csPin}`,
                    `Modules:${component.modules || 1}`,
                ],
            });
            continue;
        }

        // I2C Displays

        if (component.type === 'display') {
            allocations.push({
                component,

                pins: [`I2C (${board.i2c.sda}/${board.i2c.scl})`],
            });

            continue;
        }

        // Generic GPIO

        const needed = getComponentPins(component);

        console.log('Component:', component.label, 'AssignedDevice:', component.assignedDevice);

        const useMCP = String(component.assignedDevice || '').startsWith('MCP');

        console.log('useMCP:', useMCP);

        const assigned = [];

        if (project.allocationMode === 'MANUAL' && component.type === 'toggle' && component.positions === 3) {
            const pinA = component.manualPinA;

            const pinB = component.manualPinB;

            if (pinA === pinB) {
                errors.push({
                    component,

                    reason: 'Toggle Pins Must Be Different',
                });

                return {
                    valid: false,
                    errors,
                };
            }

            if (isReserved(pinA)) {
                errors.push({
                    component,

                    reason: 'Toggle Pin A Already Used',
                });

                return {
                    valid: false,
                    errors,
                };
            }

            if (useMCP) {
                const allocation = ManualAllocator.allocateManualDualPins(component);

                if (!allocation) {
                    errors.push({
                        component,
                        reason: 'MCP Pins Already Used',
                    });

                    return {
                        valid: false,
                        errors,
                    };
                }

                allocations.push({
                    component,
                    pins: [`${allocation.device.address}:${pinA}`, `${allocation.device.address}:${pinB}`],
                });
            } else {
                reservePin(pinA);

                if (isReserved(pinB)) {
                    errors.push({
                        component,
                        reason: 'Toggle Pin B Already Used',
                    });

                    return {
                        valid: false,
                        errors,
                    };
                }

                reservePin(pinB);

                allocations.push({
                    component,
                    pins: [`BOARD:${pinA}`, `BOARD:${pinB}`],
                });
            }

            continue;
        }

        if (project.allocationMode === 'MANUAL' && component.type === 'rotaryswitch') {
            const pins = component.manualPins || [];

            const useMCP = String(component.assignedDevice || '').startsWith('MCP');

            if (pins.length !== component.positions) {
                errors.push({
                    component,

                    reason: 'Rotary Pin Count Mismatch',
                });

                return {
                    valid: false,
                    errors,
                };
            }

            if (useMCP) {
                const allocation = ManualAllocator.allocateManualMultiplePins(component);

                if (!allocation) {
                    errors.push({
                        component,
                        reason: 'MCP Pins Already Used',
                    });

                    return {
                        valid: false,
                        errors,
                    };
                }

                allocations.push({
                    component,
                    pins: allocation.pins.map((pin) => `${allocation.device.address}:${pin}`),
                });
            } else {
                for (const pin of pins) {
                    if (isReserved(pin)) {
                        errors.push({
                            component,
                            reason: `Rotary Pin ${pin} Already Used`,
                        });

                        return {
                            valid: false,
                            errors,
                        };
                    }

                    reservePin(pin);
                }

                allocations.push({
                    component,
                    pins: pins.map((pin) => `BOARD:${pin}`),
                });
            }

            continue;
        }

        for (let i = 0; i < needed; i++) {
            // const mcpAllocation = useMCP ? allocateMCPPin() : null;
            let mcpAllocation = null;

            if (useMCP && project.allocationMode === 'AUTO') {
                mcpAllocation = allocateMCPPin();
            }

            let pin;

            if (
                project.allocationMode === 'MANUAL' &&
                (component.type === 'pushbutton' ||
                    component.type === 'led' ||
                    (component.type === 'toggle' && component.positions === 2))
            ) {
                if (isReserved(component.manualPin)) {
                    errors.push({
                        component,

                        reason: 'Pin Already Used',
                    });

                    return {
                        valid: false,
                        errors,
                    };
                }
                pin = component.manualPin;
            } else {
                pin = useMCP ? mcpAllocation?.pin : getFreeGPIO()[0];
            }
            if (pin === undefined) {
                const freePins = useMCP
                    ? expansionManager.getFreePins().length + assigned.length
                    : getFreeGPIO().length + assigned.length;

                const freeGPIO = getFreeGPIO().length;

                errors.push({
                    component,

                    reason: useMCP ? 'No MCP Pins Available' : 'No GPIO Available',
                });

                return {
                    valid: false,

                    errors,

                    capacityType: useMCP ? 'MCP' : 'BOARD',

                    gpioAvailable: freePins,

                    gpioRequired: needed,

                    gpioMissing: Math.max(0, needed - freePins),
                };
            }

            if (!useMCP) {
                reservePin(pin);
            }
            let mcpAddress = null;

            if (useMCP) {
                if (project.allocationMode === 'MANUAL') {
                    // const device = ManualAllocator.getAssignedExpansionDevice(component);

                    // mcpAddress = device?.address;
                    const manualAllocation = ManualAllocator.allocateManualSinglePin(component);

                    if (!manualAllocation) {
                        errors.push({
                            component,
                            reason: 'MCP Pin Already Used',
                        });

                        return {
                            valid: false,
                            errors,
                        };
                    }

                    mcpAddress = manualAllocation.device.address;
                } else {
                    mcpAddress = mcpAllocation?.device.address;
                }
            }
            // assigned.push(useMCP ? `${mcpAllocation.device.address}:${pin}` : `BOARD:${pin}`);
            assigned.push(useMCP ? `${mcpAddress}:${pin}` : `BOARD:${pin}`);
        }

        allocations.push({
            component,

            pins: assigned,
        });
    }

    return {
        valid: true,

        allocations,

        reservedPins: [...reservedPins],
    };
}

// ===================================
// Capacity Validation
// ===================================

function validateProject(project) {
    const result = allocatePins(project);

    return result.valid;
}

// ===================================
// Allocation Table Builder
// ===================================

function buildAllocationRows(project) {
    const result = allocatePins(project);

    console.log(result.allocations);

    if (!result.valid) return [];

    return result.allocations.map((a) => {
        return {
            label: a.component.label,

            type: getComponentName(a.component),

            pins: a.pins.join(', '),
        };
    });
}
