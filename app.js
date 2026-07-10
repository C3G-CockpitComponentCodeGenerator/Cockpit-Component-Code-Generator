// =====================================
// Project State
// =====================================

let project = {
    projectName: '',
    deviceName: '',
    authorId: '',
    guid: '',

    board: 'PROMICRO',

    allocationMode: 'AUTO',

    components: [],
    expansionDevices: [],
};

let editIndex = -1;

let expansionManager = new ExpansionManager();

let currentDisplayIndex = -1;

let currentDisplayComponent = null;
let displayConfigs = [];
// =====================================
// Initialization
// =====================================
document.addEventListener('DOMContentLoaded', () => {
    populateBoards();

    const guidField = document.getElementById('guid');

    // Generate GUID for new project
    if (!guidField.value) {
        guidField.value = '{' + crypto.randomUUID() + '}';
    }
    //for (let i = 1; i <= 8; i++) {
    //    document.getElementById(`displayDigit${i}`)?.addEventListener('change', updateDecimalOptions);
    //  }

    document.getElementById('displayBrightness')?.addEventListener('input', (e) => {
        document.getElementById('brightnessValue').textContent = e.target.value;
    });

    document.getElementById('brightnessValue').textContent = document.getElementById('displayBrightness')?.value ?? '0';
    validateGUIDField();

    updateComponentOptions();

    refreshUI();

    refreshExpansionUI();

    updateExpansionAdvisor();

    initializeDisplayLayout();

    guidField.addEventListener('input', validateGUIDField);

    document.getElementById('manualAssignedDevice')?.addEventListener('change', () => {
        updateComponentOptions();
        populateManualPinDropdown();
    });
});

function generateGUID() {
    const guidField = document.getElementById('guid');

    guidField.value = '{' + crypto.randomUUID() + '}';

    validateGUIDField();
    refreshUI();
}

// =====================================
// Boards
// =====================================

function populateBoards() {
    const boardSelect = document.getElementById('board');

    boardSelect.innerHTML = '';

    Object.values(BOARDS).forEach((board) => {
        const option = document.createElement('option');

        option.value = board.id;

        option.textContent = board.name;

        boardSelect.appendChild(option);
    });
}

// =====================================
// Component Type UI
// =====================================

function updateComponentOptions() {
    //  console.log(project.expansionDevices);

    //   console.log(project.expansionDevices[0]);

    const assignedToGroup = document.getElementById('assignedToGroup');
    const type = document.getElementById('componentType').value;

    const autoAssignableTypes = ['pushbutton', 'toggle', 'encoder', 'rotaryswitch', 'led'];

    assignedToGroup.style.display =
        project.allocationMode === 'AUTO' && autoAssignableTypes.includes(type) ? 'block' : 'none';
    const manualPins = document.getElementById('manualPinOptions');

    const pinSelect = document.getElementById('manualPin');

    pinSelect.innerHTML = '';

    const board = BOARDS[project.board];
    const selectedDevice = document.getElementById('manualAssignedDevice').value;

    const usedPins = [];
    populateAssignedDeviceDropdown();

    project.components.forEach((c, index) => {
        console.log('USED PINS', usedPins);
        if (index === editIndex) {
            return;
        }
        if (c.manualPin !== undefined) {
            usedPins.push(`${c.assignedDevice}:${c.manualPin}`);
        }
        /* if (c.manualPin !== undefined) {
            usedPins.push(c.manualPin);
        }*/

        if (c.manualPinA !== undefined) {
            //  usedPins.push(c.manualPinA);
            usedPins.push(`${c.assignedDevice}:${c.manualPinA}`);
        }

        if (c.manualPinB !== undefined) {
            // usedPins.push(c.manualPinB);
            usedPins.push(`${c.assignedDevice}:${c.manualPinB}`);
        }

        if (c.manualPins) {
            // usedPins.push(...c.manualPins);
            c.manualPins.forEach((pin) => {
                usedPins.push(`${c.assignedDevice}:${pin}`);
            });
            console.log('USED PINS', usedPins);
        }
    });
    //  console.log('USED PINS', usedPins);
    //----create the rotary dropdowns----

    if (project.allocationMode === 'MANUAL' && type === 'rotaryswitch') {
        const container = document.getElementById('manualRotaryPinsContainer');

        container.innerHTML = '';

        const positions = parseInt(document.getElementById('rotaryPositions').value);

        let availablePins = [];

        if (selectedDevice === 'BOARD') {
            availablePins = board.gpioPins;
        } else {
            const mcp = project.expansionDevices.find((d) => d.id === selectedDevice);

            if (mcp) {
                availablePins = mcp.pins;
            }
        }

        for (let i = 0; i < positions; i++) {
            const label = document.createElement('label');

            label.textContent = `Position ${i + 1}`;

            const select = document.createElement('select');

            select.id = `manualRotaryPin${i}`;
            console.log('ROTARY USED PINS', usedPins);
            // board.gpioPins.forEach((pin) => {
            availablePins.forEach((pin) => {
                const pinKey = `${selectedDevice}:${pin}`;

                if (usedPins.includes(pinKey)) {
                    return;
                }

                const option = document.createElement('option');

                option.value = pin;
                option.textContent = pin;

                select.appendChild(option);
            });
            select.addEventListener('change', updateRotaryPinDropdowns);
            if (select.options.length > i) {
                select.selectedIndex = i;
            }
            container.appendChild(label);
            container.appendChild(select);
        }
        updateRotaryPinDropdowns();
    }

    board.gpioPins.forEach((pin) => {
        const pinKey = `${selectedDevice}:${pin}`;
        if (usedPins.includes(pin)) {
            return;
        }

        if (type === 'sevensegment' && (pin === board.spi.mosi || pin === board.spi.sck || pin === board.spi.miso)) {
            return;
        }

        const option = document.createElement('option');

        option.value = pin;

        option.textContent = pin;

        pinSelect.appendChild(option);
    });
    const encoderPinA = document.getElementById('manualEncoderPinA');

    const encoderPinB = document.getElementById('manualEncoderPinB');

    if (encoderPinA && encoderPinB) {
        encoderPinA.innerHTML = '';
        encoderPinB.innerHTML = '';

        const selectedDevice = document.getElementById('manualAssignedDevice').value;

        let availablePins = [];

        if (selectedDevice === 'BOARD') {
            availablePins = board.gpioPins;
        } else {
            const mcp = project.expansionDevices.find((d) => d.id === selectedDevice);

            if (mcp) {
                availablePins = mcp.pins.filter((pin) => !mcp.usedPins.includes(pin));
            }
        }
        //  console.log('AVAILABLE PINS:', availablePins);
        availablePins.forEach((pin) => {
            // console.log('USED PINS', usedPins);
            // console.log('AVAILABLE PINS', availablePins);

            if (usedPins.includes(pin)) {
                return;

                console.log('ENCODER Selected Device:', selectedDevice);
            }

            const optionA = document.createElement('option');

            optionA.value = pin;
            optionA.textContent = pin;

            encoderPinA.appendChild(optionA);

            const optionB = document.createElement('option');

            optionB.value = pin;
            optionB.textContent = pin;

            encoderPinB.appendChild(optionB);
        });

        const togglePinA = document.getElementById('manualTogglePinA');

        const togglePinB = document.getElementById('manualTogglePinB');

        if (togglePinA && togglePinB) {
            togglePinA.innerHTML = '';
            togglePinB.innerHTML = '';

            availablePins.forEach((pin) => {
                if (usedPins.includes(pin)) {
                    return;
                }

                const optionA = document.createElement('option');

                optionA.value = pin;
                optionA.textContent = pin;

                togglePinA.appendChild(optionA);

                const optionB = document.createElement('option');

                optionB.value = pin;
                optionB.textContent = pin;

                togglePinB.appendChild(optionB);
            });

            if (togglePinA.options.length > 1 && togglePinA.value === togglePinB.value) {
                togglePinB.selectedIndex = 1;
            }

            updateDualPinDropdowns('manualTogglePinA', 'manualTogglePinB');
        }

        //  updateDualPinDropdowns('manualEncoderPinA', 'manualEncoderPinB');

        if (encoderPinA.options.length > 1 && encoderPinA.value === encoderPinB.value) {
            encoderPinB.selectedIndex = 1;
        }

        updateDualPinDropdowns('manualEncoderPinA', 'manualEncoderPinB');

        //  console.log('A', encoderPinA.value, 'B', encoderPinB.value);
    }

    const usedAxisPins = project.components
        .filter((c, index) => c.manualAxisPin !== undefined && index !== editIndex)
        .map((c) => c.manualAxisPin);

    const axisSelect = document.getElementById('manualAxisPin');

    if (axisSelect) {
        axisSelect.innerHTML = '';

        board.analogPins.forEach((pin) => {
            if (usedAxisPins.includes(pin.analog)) {
                return;
            }

            const option = document.createElement('option');

            option.value = pin.analog;

            option.textContent = pin.analog;

            axisSelect.appendChild(option);
        });
    }

    manualPins.style.display =
        project.allocationMode === 'MANUAL' &&
        type !== 'axis' &&
        type !== 'encoder' &&
        type !== 'rotaryswitch' &&
        !(type === 'toggle' && parseInt(document.getElementById('togglePositions').value) === 3)
            ? 'block'
            : 'none';

    hideAllOptions();

    const togglePinOptions = document.getElementById('manualTogglePinOptions');

    togglePinOptions.style.display =
        project.allocationMode === 'MANUAL' &&
        type === 'toggle' &&
        parseInt(document.getElementById('togglePositions').value) === 3
            ? 'block'
            : 'none';
    const axisPinOptions = document.getElementById('manualAxisPinOptions');

    axisPinOptions.style.display = project.allocationMode === 'MANUAL' && type === 'axis' ? 'block' : 'none';

    const encoderPinOptions = document.getElementById('manualEncoderPinOptions');

    encoderPinOptions.style.display = project.allocationMode === 'MANUAL' && type === 'encoder' ? 'block' : 'none';

    const rotaryPinOptions = document.getElementById('manualRotaryPinOptions');
    const deviceOptions = document.getElementById('manualDeviceOptions');

    deviceOptions.style.display =
        project.allocationMode === 'MANUAL' && ['pushbutton', 'toggle', 'encoder', 'rotaryswitch', 'led'].includes(type)
            ? 'block'
            : 'none';

    // console.log('DEVICE OPTIONS', type, deviceOptions.style.display);

    rotaryPinOptions.style.display = project.allocationMode === 'MANUAL' && type === 'rotaryswitch' ? 'block' : 'none';

    let pinsRequired = 0;

    switch (type) {
        case 'encoder':
            document.getElementById('encoderOptions').style.display = 'block';

            pinsRequired = 2;

            break;

        case 'pushbutton':
            document.getElementById('pushButtonOptions').style.display = 'block';

            pinsRequired = 1;

            break;

        case 'toggle':
            document.getElementById('toggleOptions').style.display = 'block';

            const togglePositions = parseInt(document.getElementById('togglePositions').value);

            document.getElementById('togglePositionNamesContainer').style.display =
                togglePositions === 3 ? 'block' : 'none';

            pinsRequired = togglePositions === 3 ? 2 : 1;

            break;

        case 'rotaryswitch':
            document.getElementById('rotaryOptions').style.display = 'block';

            pinsRequired = parseInt(document.getElementById('rotaryPositions').value);

            break;

        case 'axis':
            document.getElementById('axisOptions').style.display = 'block';

            pinsRequired = 1;

            break;

        case 'led':
            document.getElementById('ledOptions').style.display = 'block';

            pinsRequired = 1;

            break;

        case 'sevensegment':
            document.getElementById('sevenSegmentOptions').style.display = 'block';

            pinsRequired = 3;
            updateModuleNameFields();
            break;

        case 'display':
            document.getElementById('displayOptions').style.display = 'block';

            pinsRequired = 0;

            break;
    }

    const manualPinLabel = document.getElementById('manualPinLabel');

    if (manualPinLabel) {
        manualPinLabel.textContent = type === 'sevensegment' ? 'CS Pin' : 'GPIO Pin';
    }

    //   document.getElementById('pinsRequired').innerText = pinsRequired;
    const builderPins = document.getElementById('builderPins');

    if (builderPins) {
        builderPins.innerText = pinsRequired;
    }
}

function hideAllOptions() {
    const sections = [
        'toggleOptions',
        'rotaryOptions',
        'axisOptions',
        'ledOptions',
        'sevenSegmentOptions',
        'displayOptions',
    ];

    document.getElementById('pushButtonOptions').style.display = 'none';

    document.getElementById('togglePositionNamesContainer').style.display = 'none';

    document.getElementById('encoderOptions').style.display = 'none';

    sections.forEach((id) => {
        const el = document.getElementById(id);

        if (el) el.style.display = 'none';
    });
}

// =====================================
// Add / Update Component
// =====================================

function addOrUpdateComponent() {
    const type = document.getElementById('componentType').value;

    const manualPinLabel = document.getElementById('manualPinLabel');

    const component = buildComponent(type);

    if (!component) {
        return;
    }

    console.log('Manual Label:', manualPinLabel);

    if (manualPinLabel) {
        manualPinLabel.textContent = type === 'sevensegment' ? 'CS Pin' : 'GPIO Pin';
    }

    const label = document.getElementById('componentLabel').value.trim();

    if (label === '') {
        alert('Label is required');

        return;
    }

    /*  const component = buildComponent(type);

    if (!component) return; */

    const definition = COMPONENT_TYPES[component.type];

    const assigningToMCP = component.assignedDevice !== 'BOARD';

    if (assigningToMCP && !definition.mcpCompatible(component)) {
        alert(
            `This component cannot be assigned
to an MCP23017.

Component:
${definition.name}

Please assign it to:

• Main Board

Reason:
Not MCP Compatible`
        );

        return;
    }

    if (editIndex >= 0) {
        project.components[editIndex] = component;

        editIndex = -1;

        document.getElementById('cancelEditButton').style.display = 'none';
    } else {
        project.components.push(component);
    }

    const result = allocatePins(project);
    console.log(result);

    if (!result.valid) {
        if (editIndex >= 0) return;

        project.components.pop();

        console.log('Allocation Result', result);

        const error = result.errors[0];

        if (error.reason === 'ANALOG_EXHAUSTED') {
            alert(
                `No Analog Inputs Available

This board has reached its analog input limit.

MCP23017 cannot add analog inputs.

Select:
• Mega 2560
• Mega 2560 Pro Mini
• External ADC`
            );
        } else {
            const installedExpansionGPIO = expansionManager.getFreePins().length;

            const remainingShortfall = Math.max(0, result.gpioMissing - installedExpansionGPIO);

            const recommendedMCPs = Math.ceil(remainingShortfall / 16);

            if (error.reason === 'No MCP Pins Available') {
                if (error.reason === 'No MCP Pins Available') {
                    const requiredMCPs = Math.ceil(result.gpioMissing / 16);

                    alert(
                        `MCP23017 Capacity Reached

Installed MCP23017:
${expansionManager.getDevices().length}

Available MCP Pins:
${result.gpioAvailable}

Pins Required:
${result.gpioRequired}

Additional MCP Pins Needed:
${result.gpioMissing}

${
    requiredMCPs === 1
        ? 'Recommendation:\nAdd 1 additional MCP23017'
        : `Recommendation:\nAdd ${requiredMCPs} additional MCP23017 devices`
}`
                    );

                    return;
                }

                return;
            }

            alert(
                `No GPIO Capacity Remaining

Board GPIO Available:
${result.gpioAvailable}

GPIO Required:
${result.gpioRequired}

Additional GPIO Needed:
${result.gpioMissing}

Installed MCP23017:
${expansionManager.getDevices().length}

Expansion GPIO Available:
${installedExpansionGPIO}

${
    recommendedMCPs === 0
        ? 'No additional MCP23017 required.'
        : `Recommended Expansion:
${recommendedMCPs} x MCP23017`
}`
            );
        }

        return;
    }

    refreshExpansionUI();
    clearEditor();
    refreshUI();
    populateManualPinDropdown();
}

function buildComponent(type) {
    const component = {
        type,

        label: document.getElementById('componentLabel').value.trim(),

        assignedDevice:
            project.allocationMode === 'MANUAL'
                ? document.getElementById('manualAssignedDevice').value
                : document.getElementById('assignedDevice').value,
    };
    if (editIndex >= 0) {
        component.id = project.components[editIndex].id;
    } else {
        component.id = generateComponentId(type);
    }
    if (!/^[A-Za-z0-9_-]+$/.test(component.label)) {
        alert('Labels may only contain:\n\n' + 'Letters\n' + 'Numbers\n' + 'Hyphen (-)\n' + 'Underscore (_)');

        return null;
    }

    switch (type) {
        case 'encoder':
            component.encoderMode = document.getElementById('encoderMode').value;

            if (project.allocationMode === 'MANUAL') {
                console.log('A VALUE', document.getElementById('manualEncoderPinA').value);

                console.log('B VALUE', document.getElementById('manualEncoderPinB').value);
                component.manualPinA = getManualPinValue('manualEncoderPinA');

                component.manualPinB = getManualPinValue('manualEncoderPinB');
                console.log('ENCODER COMPONENT', component);
            }

            break;

        case 'pushbutton':
            component.buttonBehavior = document.getElementById('pushButtonBehavior').value;

            if (project.allocationMode === 'MANUAL') {
                component.manualPin = getManualPinValue('manualPin');
            }

            break;

        case 'toggle':
            component.positions = parseInt(document.getElementById('togglePositions').value);

            if (project.allocationMode === 'MANUAL') {
                if (component.positions === 2) {
                    //  component.manualPin = parseInt(document.getElementById('manualPin').value);
                    component.manualPin = getManualPinValue('manualPin');
                } else {
                    // component.manualPinA = parseInt(document.getElementById('manualTogglePinA').value);

                    // component.manualPinB = parseInt(document.getElementById('manualTogglePinB').value);

                    component.manualPinA = getManualPinValue('manualTogglePinA');

                    component.manualPinB = getManualPinValue('manualTogglePinB');
                }
            }

            if (component.positions === 3) {
                component.positionNames = document
                    .getElementById('togglePositionNames')
                    .value.split('\n')
                    .map((v) => v.trim())
                    .filter((v) => v !== '');

                if (component.positionNames.length > 0 && component.positionNames.length !== 3) {
                    alert(
                        `3 Position Toggle

                     Please enter exactly
                     3 position names.`
                    );

                    return null;
                }
            }

            break;

        case 'rotaryswitch':
            component.positions = parseInt(document.getElementById('rotaryPositions').value);

            console.log('ROTARY NAMES RAW', document.getElementById('rotaryPositionNames').value);

            component.positionNames = document
                .getElementById('rotaryPositionNames')
                .value.split('\n')
                .map((v) => v.trim())
                .filter((v) => v !== '');

            if (component.positionNames.length > 0 && component.positionNames.length !== component.positions) {
                alert(
                    `Rotary Switch Position Names

                    Positions:
                    ${component.positions}

                    Names Entered:
                    ${component.positionNames.length}

Please enter one name
for each position.`
                );

                return null;
            }

            if (project.allocationMode === 'MANUAL') {
                component.manualPins = [];

                for (let i = 0; i < component.positions; i++) {
                    // component.manualPins.push(parseInt(document.getElementById(`manualRotaryPin${i}`).value));
                    component.manualPins.push(getManualPinValue(`manualRotaryPin${i}`));
                }
            }
            break;

        case 'axis':
            component.axisType = document.getElementById('axisType').value;

            if (project.allocationMode === 'MANUAL') {
                component.manualAxisPin = document.getElementById('manualAxisPin').value;
            }

            break;

        /*    case 'led':
            component.ledType = document.getElementById('ledType').value;
            break; */

        case 'led':
            component.ledType = document.getElementById('ledType').value;

            if (project.allocationMode === 'MANUAL') {
                component.manualPin = getManualPinValue('manualPin');
            }

            break;

        case 'sevensegment':
            component.modules = parseInt(document.getElementById('segmentModules').value);

            for (let i = 1; i <= component.modules; i++) {
                displayConfigs[i - 1].name = document.getElementById(`moduleName${i}`).value.trim();
            }
            component.displays = JSON.parse(JSON.stringify(displayConfigs));

            if (project.allocationMode === 'MANUAL') {
                component.manualPin = parseInt(document.getElementById('manualPin').value);
            }
            break;

        case 'display':
            component.displayType = document.getElementById('displayType').value;
            break;
    }

    console.log(component);

    return component;
}

function getManualPinValue(elementId) {
    console.trace('GET MANUAL PIN', elementId);

    const element = document.getElementById(elementId);

    console.log('GET MANUAL PIN:', elementId, element);

    if (!element) {
        return null;
    }

    console.log('PIN VALUE:', element.value);

    const assignedDevice = document.getElementById('manualAssignedDevice').value;

    console.log('DEVICE:', assignedDevice);

    return assignedDevice === 'BOARD' ? parseInt(element.value) : element.value;
}
// =====================================
// Edit Component
// =====================================

function editComponent(index) {
    const c = project.components[index];

    editIndex = index;

    document.getElementById('componentType').value = c.type;

    updateComponentOptions();

    if (c.manualPin !== undefined) {
        document.getElementById('manualPin').value = c.manualPin;
    }

    document.getElementById('componentLabel').value = c.label;

    if (c.positions) {
        if (c.type === 'toggle') {
            document.getElementById('togglePositions').value = c.positions;
        }

        if (c.type === 'rotaryswitch') {
            document.getElementById('rotaryPositions').value = c.positions;
        }
    }

    if (c.type === 'toggle' && c.positions === 3) {
        updateComponentOptions();

        document.getElementById('manualTogglePinA').value = c.manualPinA;

        document.getElementById('manualTogglePinB').value = c.manualPinB;
    }

    if (c.type === 'encoder') {
        updateComponentOptions();

        document.getElementById('manualEncoderPinA').value = c.manualPinA;

        document.getElementById('manualEncoderPinB').value = c.manualPinB;

        updateDualPinDropdowns('manualEncoderPinA', 'manualEncoderPinB');
    }
    if (c.type === 'rotaryswitch') {
        document.getElementById('rotaryPositionNames').value = (c.positionNames || []).join('\n');

        updateComponentOptions();

        if (c.manualPins) {
            c.manualPins.forEach((pin, index) => {
                const select = document.getElementById(`manualRotaryPin${index}`);

                if (select) {
                    select.value = pin;
                }
            });

            updateRotaryPinDropdowns();
        }
    }
    if (c.manualAxisPin) {
        document.getElementById('manualAxisPin').value = c.manualAxisPin;
    }

    if (c.ledType) document.getElementById('ledType').value = c.ledType;

    /*    if (c.type === 'sevensegment') {
        document.getElementById('segmentModules').value = c.modules || 1;
        updateModuleNameFields();

        if (c.displays) {
            displayConfigs = JSON.parse(JSON.stringify(c.displays));

            c.displays.forEach((display, index) => {
                const field = document.getElementById(`moduleName${index + 1}`);

                if (field) {
                    field.value = display.name;
                }
            });
        }
    } */
    if (c.type === 'sevensegment') {
        updateComponentOptions();

        document.getElementById('segmentModules').value = c.modules || 1;

        displayConfigs = JSON.parse(JSON.stringify(c.displays || []));

        updateModuleNameFields();

        if (typeof renderDisplayLayout === 'function') {
            renderDisplayLayout();
        }

        c.displays?.forEach((display, index) => {
            const field = document.getElementById(`moduleName${index + 1}`);

            if (field) {
                field.value = display.name;
            }
        });
    }

    if (c.displayType) document.getElementById('displayType').value = c.displayType;

    if (c.assignedDevice) {
        document.getElementById('assignedDevice').value = c.assignedDevice;
    }

    document.getElementById('addButton').innerText = 'Update Component';

    document.getElementById('cancelEditButton').style.display = 'inline-block';
}

function cancelEdit() {
    editIndex = -1;

    clearEditor();

    document.getElementById('addButton').innerText = 'Add Component';

    document.getElementById('cancelEditButton').style.display = 'none';
}

// =====================================
// Delete
// =====================================

function deleteComponent(index) {
    if (!confirm('Delete component?')) return;

    project.components.splice(index, 1);
    refreshExpansionUI();
    refreshUI();
}

// =====================================
// Clear Form
// =====================================

function clearEditor() {
    document.getElementById('componentLabel').value = '';

    document.getElementById('addButton').innerText = 'Add Component';

    document.getElementById('cancelEditButton').style.display = 'none';

    editIndex = -1;
}

function isValidGUID(guid) {
    const guidRegex = /^\{[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\}$/;

    return guidRegex.test(guid);
}

function validateGUIDField() {
    const field = document.getElementById('guid');

    if (!field) return;

    if (field.value === '') {
        field.style.borderColor = '';

        return;
    }

    if (isValidGUID(field.value)) {
        field.style.borderColor = '#16a34a';
    } else {
        field.style.borderColor = '#ef4444';
    }
}
// =====================================
// Resource Tracking
// =====================================

function refreshUI() {
    project.board = document.getElementById('board').value;

    project.allocationMode = document.getElementById('allocationMode').value;

    updateComponentOptions();

    const boardSelect = document.getElementById('board');

    const allocationModeSelect = document.getElementById('allocationMode');

    const guidField = document.getElementById('guid');

    const generateGuidButton = document.getElementById('generateGuidButton');

    const projectLocked = project.components.length > 0 || expansionManager.getDevices().length > 0;

    boardSelect.disabled = projectLocked;

    allocationModeSelect.disabled = projectLocked;

    guidField.disabled = projectLocked;

    generateGuidButton.disabled = projectLocked;

    const lockNotice = document.getElementById('boardLockNotice');

    if (lockNotice) {
        lockNotice.style.visibility = projectLocked ? 'visible' : 'hidden';
    }

    project.projectName = document.getElementById('projectName').value;

    project.deviceName = document.getElementById('deviceName').value;

    project.authorId = document.getElementById('authorId').value;

    project.guid = document.getElementById('guid').value;

    const board = BOARDS[project.board];

    const allocationResult = allocatePins(project);

    const reservedCount = allocationResult.valid ? allocationResult.reservedPins.length : 0;

    const resources = calculateProjectResources(project.components);

    document.getElementById('nativeGPIO').innerText = board.gpioPins.length;

    document.getElementById('usedGPIO').innerText = reservedCount;

    document.getElementById('usedPWM').innerText = resources.pwmUsed;

    document.getElementById('usedSPI').innerText = resources.spiUsed;

    document.getElementById('usedI2C').innerText = resources.i2cUsed;

    document.getElementById('usedDisplay').innerText = resources.displayUsed;

    project.expansionDevices = expansionManager.getDevices();

    refreshComponentTable();

    // refreshAllocationTable();

    updateStatus();

    updateExpansionAdvisor();

    renderNativePinMap();
    renderMCPPinMaps();

    console.log('Allocation Mode:', project.allocationMode);
}
// =====================================
// Components Table
// =====================================

function refreshComponentTable() {
    const tbody = document.getElementById('componentTableBody');

    tbody.innerHTML = '';

    project.components.forEach((c, index) => {
        const row = document.createElement('tr');
        row.dataset.componentIndex = index;
        row.addEventListener('click', () => {
            highlightPinsForComponent(c);
        });

        row.innerHTML = `
<td>${index + 1}</td>

<td>${c.id ?? '-'}</td>

<td>${getComponentCategory(c)}</td>

<td>${getComponentName(c)}</td>

<td>${c.label}</td>

<td>${getAssignedDeviceName(c)}</td>

<td>${getComponentPinAllocation(c)}</td>

<td>
    <button
        class="btn btn-warning"
        onclick="event.stopPropagation(); editComponent(${index})">
        Edit
    </button>

    <button
        class="btn btn-danger"
        onclick="event.stopPropagation(); deleteComponent(${index})">
        Delete
    </button>
</td>
`;

        /*       row.innerHTML = `
<td>${index + 1}</td>
<td>${c.id}</td>
<td>${getComponentCategory(c)}</td>
<td>${getComponentName(c)}</td>
<td>${c.label}</td>
<td>${getComponentConfig(c)}</td>
<td>${getComponentPins(c)}</td>

<td>
    ${getAssignedDeviceName(c)}
</td>

<td>
    <button class="btn btn-warning"
    onclick="editComponent(${index})">
    Edit
    </button>

    <button class="btn btn-danger"
    onclick="deleteComponent(${index})">
    Delete
    </button>
</td>
`; */

        tbody.appendChild(row);
    });
}

function getAssignedDeviceName(component) {
    if (component.assignedDevice === 'BOARD') {
        return 'Main Board';
    }

    const device = expansionManager.getDevices().find((d) => d.id === component.assignedDevice);

    if (!device) return 'Unknown Device';

    return device.location || device.name;
}

// =====================================
// Allocation Table
// =====================================

/* function refreshAllocationTable() {
    const tbody = document.getElementById('allocationTableBody');

    tbody.innerHTML = '';

    const rows = buildAllocationRows(project);

    rows.forEach((row) => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
        <td>${row.label}</td>
        <td>${row.type}</td>
        <td>${row.pins}</td>
        `;

        tbody.appendChild(tr);
    });
} */

// =====================================
// Status
// =====================================

function updateStatus() {
    const status = document.getElementById('capacityStatus');

    const allocation = allocatePins(project);

    if (!allocation.valid) {
        status.className = 'status-error';

        status.innerText = '✗ Capacity Exceeded';

        return;
    }

    const board = BOARDS[project.board];

    const freeGPIO = board.gpioPins.length - allocation.reservedPins.length;

    if (freeGPIO <= 3) {
        status.className = 'status-warning';

        status.innerText = '⚠ Nearly Full';
    } else {
        status.className = 'status-good';

        status.innerText = '✓ Capacity OK';
    }
}

function updateBoardHealth() {
    const boardHealth = document.getElementById('boardHealth');

    if (!boardHealth) return;

    const board = BOARDS[project.board];

    const resources = calculateProjectResources(project.components);

    const allocation = allocatePins(project);

    const encoderCount = project.components.filter((c) => c.type === 'encoder').length;

    const displayCount = project.components.filter((c) => c.type === 'display').length;

    const busReserved = (resources.spiUsed > 0 ? 3 : 0) + (resources.i2cUsed > 0 ? 2 : 0);

    boardHealth.innerHTML = `

        <div class="health-section">

            <div class="health-section-title">
                Resources
            </div>

            <div class="health-grid">

                <div class="health-row">
                    <span class="health-label">
                        GPIO
                    </span>
                    <span class="health-value">
                        ${allocation.reservedPins.length}/${board.gpioPins.length}
                    </span>
                </div>

                <div class="health-row">
                    <span class="health-label">
                        Analog
                    </span>
                    <span class="health-value">
                        ${resources.analogUsed}/${board.analogPins.length}
                    </span>
                </div>

                <div class="health-row">
                    <span class="health-label">
                        PWM
                    </span>
                    <span class="health-value">
                        ${resources.pwmUsed}/${board.pwmPins.length}
                    </span>
                </div>

            </div>

        </div>

        <div class="health-section">

            <div class="health-section-title">
                Communication
            </div>

            <div class="health-grid">

                <div class="health-row">
                    <span class="health-label">
                        SPI
                    </span>
                    <span class="health-value">
                        ${resources.spiUsed}
                    </span>
                </div>

                <div class="health-row">
                    <span class="health-label">
                        I2C
                    </span>
                    <span class="health-value">
                        ${resources.i2cUsed}
                    </span>
                </div>

                <div class="health-row">
                    <span class="health-label">
                        Reserved
                    </span>
                    <span class="health-value">
                        ${busReserved}
                    </span>
                </div>

            </div>

        </div>

        <div class="health-section">

            <div class="health-section-title">
                Recommendations
            </div>

            <div class="health-grid">

                <div class="health-row">

                    <span class="health-label">
                        Encoders
                    </span>

                    <span class="
                        ${encoderCount > board.recommended.encoders ? 'health-warning' : 'health-ok'}
                    ">
                        ${encoderCount}
                    </span>

                </div>

                <div class="health-row">

                    <span class="health-label">
                        Displays
                    </span>

                    <span class="
                        ${displayCount > board.recommended.displays ? 'health-warning' : 'health-ok'}
                    ">
                        ${displayCount}
                    </span>

                </div>

            </div>

        </div>
    `;
}

function addMCP() {
    const device = expansionManager.addMCP23017();

    updateExpansionAdvisor();
    refreshUI();

    if (!device) {
        alert('Maximum MCP23017 limit reached');

        return;
    }

    refreshExpansionUI();
}

function removeExpansion(id) {
    expansionManager.removeDevice(id);

    refreshUI();

    refreshExpansionUI();

    updateExpansionAdvisor();
}

function editExpansion(id) {
    const device = expansionManager.getDevices().find((d) => d.id === id);

    if (!device) return;

    const location = prompt('Location', device.location || '');

    if (location === null) return;

    const description = prompt('Description', device.description || '');

    if (description === null) return;

    expansionManager.updateDevice(id, {
        location,
        description,
    });

    refreshExpansionUI();
}

function refreshExpansionUI() {
    const stats = document.getElementById('expansionStats');
    const container = document.getElementById('expansionList');

    if (!container) return;

    container.innerHTML = '';

    expansionManager.getDevices().forEach((device) => {
        const div = document.createElement('div');

        const usage = device.getUsage();

        const percent = Math.round((usage.used / usage.total) * 100);

        div.className = 'mcp-card';

        div.innerHTML = `

<div class="mcp-header">

    <div>

        <div class="mcp-title">
            ${device.name}
        </div>

        <div class="mcp-address">
            ${device.address}
        </div>


        ${
            device.location
                ? `
<div class="mcp-location">
 <strong>Location:</strong>
    ${device.location}
</div>
`
                : ''
        }

${
    device.description
        ? `
                <div class="mcp-description">
 <strong>Description:</strong>
    ${device.description}
</div>
`
        : ''
}

    </div>

                        </div>

<div class="mcp-stat">

    GPIO:
    <b>${usage.used}/${usage.total}</b>

</div>

<div class="mcp-progress">

    <div
        class="mcp-progress-fill"
        style="width:${percent}%">

    </div>

</div>

<div class="mcp-actions">

    <button
        class="btn btn-warning"
        onclick="editExpansion('${device.id}')">

        Edit

    </button>

    <button
        class="btn btn-danger"
        onclick="removeExpansion('${device.id}')">

        Remove

    </button>

</div>
`;

        container.appendChild(div);
    });

    const totalPins = expansionManager.getTotalPins();

    const usedPins = expansionManager.getUsedPins();

    const freePins = totalPins - usedPins;

    refreshAssignmentDevices();
}

function getTotalGPIOCapacity() {
    const board = BOARDS[project.board];

    const boardGPIO = board.gpioPins.length;

    const expansionGPIO = expansionManager.getTotalPins();

    return boardGPIO + expansionGPIO;
}

function getTotalGPIOUsed() {
    const resources = calculateProjectResources(project.components);

    return resources.gpioUsed;
}

function getRemainingGPIOCapacity() {
    return getTotalGPIOCapacity() - getTotalGPIOUsed();
}

function updateExpansionAdvisor() {
    const board = BOARDS[project.board];

    const resources = calculateProjectResources(project.components);

    const boardUsed = resources.boardGPIOUsed;

    const expansionUsed = resources.expansionGPIOUsed;

    console.log(resources);

    const availableGPIO = getTotalGPIOCapacity();

    const gpioShortfall = Math.max(0, resources.gpioUsed - availableGPIO);

    const advisor = document.getElementById('expansionAdvisor');

    if (!advisor) return;

    const boardCapacity = board.gpioPins.length;

    const expansionCapacity = expansionManager.getTotalPins();

    const totalCapacity = getTotalGPIOCapacity();

    const gpioUsed = getTotalGPIOUsed();

    const remainingCapacity = getRemainingGPIOCapacity();

    const recommendedMCPs = Math.ceil(gpioShortfall / 16);

    if (gpioShortfall === 0) {
        advisor.innerHTML = `
            <b>Expansion Advisor</b><br><br>

            Board Capacity:
            ${boardCapacity}
            <br>

            Expansion Capacity:
            ${expansionCapacity}
            <br>

            Total Capacity:
            ${totalCapacity}
            <br>

  Board GPIO Used:
${boardUsed}/${boardCapacity}
<br>

Board GPIO Remaining:
${boardCapacity - boardUsed}
<br><br>

Expansion GPIO Used:
${expansionUsed}/${expansionCapacity}
<br>

Expansion GPIO Remaining:
${expansionCapacity - expansionUsed}
<br><br>

Total GPIO Used:
${gpioUsed}/${totalCapacity}
<br>

Total GPIO Remaining:
${remainingCapacity}
            <br><br>

            No expansion required.
        `;

        return;
    }

    advisor.innerHTML = `
        <b>Expansion Advisor</b><br><br>

        Board Capacity:
        ${boardCapacity}
        <br>

        Expansion Capacity:
        ${expansionCapacity}
        <br>

        Total Capacity:
        ${totalCapacity}
        <br>

Board GPIO Used:
${boardUsed}/${boardCapacity}
<br>

Board GPIO Remaining:
${boardCapacity - boardUsed}
<br><br>

Expansion GPIO Used:
${expansionUsed}/${expansionCapacity}
<br>

Expansion GPIO Remaining:
${expansionCapacity - expansionUsed}
<br><br>

Total GPIO Used:
${gpioUsed}/${totalCapacity}
<br>

Total GPIO Remaining:
${remainingCapacity}
        <br><br>

        Additional GPIO Needed:
        ${gpioShortfall}
        <br><br>

        Recommended MCP23017:
        ${recommendedMCPs}
    `;
}

function refreshAssignmentDevices() {
    const select = document.getElementById('assignedDevice');

    if (!select) return;

    select.innerHTML = `

        <option value="BOARD">

            Main Board

        </option>

    `;

    expansionManager.getDevices().forEach((device) => {
        const option = document.createElement('option');

        option.value = device.id;

        option.textContent = `${device.location || device.name} (${device.address})`;

        select.appendChild(option);
    });
}

function debugProject() {
    console.log(document.getElementById('projectName').value);

    console.log(document.getElementById('deviceName').value);

    console.log(document.getElementById('authorId').value);

    console.log(document.getElementById('guid').value);

    refreshUI();

    console.log(project);
}

function exportFirmware() {
    const deviceModel = generateDeviceModel(project);

    const firmwareModel = generateFirmwareModel(deviceModel);
    console.log(firmwareModel);

    const firmware = generateFirmware(firmwareModel);

    const blob = new Blob([firmware], {
        type: 'text/plain',
    });

    const link = document.createElement('a');

    link.href = URL.createObjectURL(blob);

    link.download = (project.deviceName || 'Firmware') + '.ino';

    link.click();

    URL.revokeObjectURL(link.href);
}

function onSegmentDigitsChanged() {
    const digits = parseInt(document.getElementById('segmentDigits').value);

    for (let i = 1; i <= 8; i++) {
        document.getElementById(`segDigit${i}`).checked = i <= digits;
    }
    //  updateDecimalDigitOptions();
}

function updateBrightnessValue() {
    const slider = document.getElementById('segmentBrightness');

    const value = document.getElementById('segmentBrightnessValue');

    if (!slider || !value) return;

    value.innerText = slider.value;
}

function updateDualPinDropdowns(selectAId, selectBId) {
    const pinA = document.getElementById(selectAId);

    const pinB = document.getElementById(selectBId);

    if (!pinA || !pinB) {
        return;
    }

    //const selectedA = pinA.value;
    //const selectedB = pinB.value;

    let selectedA = pinA.value;
    let selectedB = pinB.value;

    Array.from(pinA.options).forEach((option) => {
        option.hidden = option.value === selectedB;
    });

    Array.from(pinB.options).forEach((option) => {
        option.hidden = option.value === selectedA;
    });

    if (pinA.value === selectedB) {
        const firstVisible = Array.from(pinA.options).find((option) => !option.hidden);

        if (firstVisible) {
            pinA.value = firstVisible.value;
        }
    }

    if (pinB.value === selectedA) {
        const firstVisible = Array.from(pinB.options).find((option) => !option.hidden);
        selectedA = pinA.value;
        selectedB = pinB.value;

        if (firstVisible) {
            pinB.value = firstVisible.value;
        }
    }
}

/*function updateRotaryPinDropdowns() {
    // const selects = document.querySelectorAll('[id^="manualRotaryPin"]');
    const selects = document.querySelectorAll('select[id^="manualRotaryPin"]');
    const selectedPins = Array.from(selects).map((s) => s.value);

    selects.forEach((select) => {
        Array.from(select.options).forEach((option) => {
            option.hidden = false;

            if (option.value !== select.value && selectedPins.includes(option.value)) {
                option.hidden = true;
            }
        });
    });
}*/

function updateRotaryPinDropdowns() {
    const selects = document.querySelectorAll('select[id^="manualRotaryPin"]');

    const selectedPins = Array.from(selects).map((s) => s.value);

    selects.forEach((select) => {
        if (!select.options) {
            return;
        }

        Array.from(select.options).forEach((option) => {
            option.hidden = false;

            if (option.value !== select.value && selectedPins.includes(option.value)) {
                option.hidden = true;
            }
        });
        if (Array.from(select.options).find((o) => o.value === select.value && o.hidden)) {
            const firstVisible = Array.from(select.options).find((o) => !o.hidden);

            if (firstVisible) {
                select.value = firstVisible.value;
            }
        }
    });
}

function updateModuleNameFields() {
    const count = parseInt(document.getElementById('segmentModules').value);

    while (displayConfigs.length < count) {
        /* displayConfigs.push({
            name: `DISPLAY${displayConfigs.length + 1}`,

            digits: 6,

            decimalDigit: 3,

            brightness: 8,

            reverseDigits: false,

            suppressLeadingZeros: false,

            usedDigits: [true, true, true, true, true, true, false, false],
        }); */
        displayConfigs.push({
            name: `DISPLAY${displayConfigs.length + 1}`,

            digits: 6,

            // Legacy property (temporary)
            decimalDigit: 3,

            // New Version 1 property
            decimalPhysicalDigit: 0,

            brightness: 8,

            reverseDigits: false,

            suppressLeadingZeros: false,

            usedDigits: [true, true, true, true, true, true, false, false],
        });
    }

    displayConfigs.length = count;

    const container = document.getElementById('moduleNamesContainer');

    container.innerHTML = '';

    for (let i = 1; i <= count; i++) {
        container.innerHTML += `
            <label>
                Module ${i} Name
            </label>

            <input
                type="text"
                id="moduleName${i}"
                value="${displayConfigs[i - 1].name}">

            <button
                type="button"
                onclick="editDisplayConfig(${i - 1})">
                Edit
            </button>
        `;
    }
}

/**
 * =====================================================================
 * Edit 7-Segment Display Configuration
 * =====================================================================
 *
 * Opens the Display Configuration dialog and restores all previously
 * saved settings.
 *
 * Responsibilities
 * ----------------
 * ✓ Restore general display settings
 * ✓ Restore physical digit layout
 * ✓ Restore decimal position
 * ✓ Refresh validation and UI
 *
 * NOTE:
 * This function restores an existing configuration.
 * It never applies the default display layout.
 *
 * Version History
 * ---------------
 * v1.0.0
 * Initial implementation.
 * =====================================================================
 */
function editDisplayConfig(index) {
    console.log('EDIT CLICKED', index);

    // ------------------------------------------------------------
    // STEP 1 - Select Display
    // ------------------------------------------------------------

    currentDisplayIndex = index;

    const display = displayConfigs[index];

    // ------------------------------------------------------------
    // STEP 2 - Restore General Settings
    // ------------------------------------------------------------

    document.getElementById('displayDigits').value = display.digits;

    document.getElementById('displayBrightness').value = display.brightness;

    document.getElementById('brightnessValue').textContent = display.brightness;

    document.getElementById('displayReverseDigits').checked = display.reverseDigits;

    document.getElementById('displaySuppressZeros').checked = display.suppressLeadingZeros;

    // ------------------------------------------------------------
    // STEP 3 - Restore Physical Digit Layout
    // ------------------------------------------------------------

    for (let i = 1; i <= 8; i++) {
        const checkbox = document.getElementById(`displayDigit${i}`);

        if (checkbox) {
            checkbox.checked = display.usedDigits[i - 1];
        }
    }

    // ------------------------------------------------------------
    // STEP 4 - Restore Decimal Position
    // ------------------------------------------------------------

    const decimalRadio = document.getElementById(`displayDecimal${display.decimalPhysicalDigit ?? 0}`);

    if (decimalRadio) {
        decimalRadio.checked = true;
    }

    // ------------------------------------------------------------
    // STEP 5 - Refresh UI
    // ------------------------------------------------------------
    // applyDefaultDisplayLayout();
    //updateDisplayLayout();
    validateDisplayLayout();
    updateDecimalRadios();
    renderDisplayPreview();

    // ------------------------------------------------------------
    // STEP 6 - Show Dialog
    // ------------------------------------------------------------

    document.getElementById('displayConfigModal').style.display = 'block';
}
/**
 * =====================================================================
 * 7-Segment Display Layout Engine
 * =====================================================================
 *
 * Synchronizes the 7-Segment configuration popup.
 *
 * Responsibilities
 * ----------------
 * ✓ Synchronize active physical digits
 * ✓ Enable / Disable decimal radio buttons
 * ✓ Maintain a valid decimal selection
 * ✓ Keep the popup synchronized with the selected digit count
 *
 * This function ONLY updates the popup UI.
 * It does NOT save configuration or generate firmware.
 *
 * Version History
 * ---------------
 * v1.0.0
 * Initial implementation for Version 1 UI redesign.
 * =====================================================================
 */
function applyDefaultDisplayLayout() {
    // ------------------------------------------------------------
    // STEP 1 - Read selected number of active digits
    // ------------------------------------------------------------

    const activeDigits = parseInt(document.getElementById('displayDigits').value);

    // ------------------------------------------------------------
    // STEP 2 - Synchronize Physical Digits
    // ------------------------------------------------------------

    // Clear all physical digit selections.
    for (let i = 1; i <= 8; i++) {
        document.getElementById(`displayDigit${i}`).checked = false;
    }

    // Enable the default physical layout.
    //
    // Default Layout
    // --------------
    // 1 Digit  -> D1
    // 2 Digits -> D2 D1
    // 3 Digits -> D3 D2 D1
    // ...
    // 8 Digits -> D8 D7 D6 D5 D4 D3 D2 D1
    //
    // The user may customise the layout afterwards.
    for (let i = 1; i <= activeDigits; i++) {
        document.getElementById(`displayDigit${i}`).checked = true;
    }

    console.log('Display Layout Update');
    console.log('Active Digits :', activeDigits);

    validateDisplayLayout();
    updateDecimalRadios();
}

/**
 * =====================================================================
 * Update 7-Segment Display Layout
 * =====================================================================
 *
 * Updates the popup after the user changes the physical digit layout.
 *
 * Responsibilities
 * ----------------
 * ✓ Read the current checkbox state
 * ✓ (Validation will be added later)
 * ✓ (Decimal synchronization will be added later)
 *
 * This function NEVER changes the user's checkbox selections.
 *
 * Version History
 * ---------------
 * v1.0.0
 * Initial implementation.
 * =====================================================================
 */
function updateDisplayLayout() {
    // ------------------------------------------------------------
    // STEP 1 - Count selected physical digits
    // ------------------------------------------------------------

    let selectedDigits = 0;

    for (let i = 1; i <= 8; i++) {
        const checkbox = document.getElementById(`displayDigit${i}`);

        if (checkbox.checked) {
            selectedDigits++;
        }
    }
    validateDisplayLayout();
    updateDecimalRadios();
    renderDisplayPreview();
    console.log(`Selected Physical Digits : ${selectedDigits}`);
}

/**
 * =====================================================================
 * Validate 7-Segment Display Layout
 * =====================================================================
 *
 * Ensures the selected physical digits match the number of active
 * digits selected by the user.
 *
 * Responsibilities
 * ----------------
 * ✓ Count selected physical digits
 * ✓ Compare against requested digit count
 * ✓ Return true when the layout is valid
 *
 * Version History
 * ---------------
 * v1.0.0
 * Initial implementation.
 * =====================================================================
 */
/**
 * =====================================================================
 * Validate 7-Segment Display Layout
 * =====================================================================
 *
 * Ensures the selected physical digits match the number of active
 * digits selected by the user.
 *
 * Responsibilities
 * ----------------
 * ✓ Count selected physical digits
 * ✓ Compare against requested digit count
 * ✓ Update layout status
 *
 * Version History
 * ---------------
 * v1.0.0
 * Initial implementation.
 * =====================================================================
 */
function validateDisplayLayout() {
    // ------------------------------------------------------------
    // STEP 1 - Read required digit count
    // ------------------------------------------------------------

    const activeDigits = parseInt(document.getElementById('displayDigits').value);

    // ------------------------------------------------------------
    // STEP 2 - Count selected physical digits
    // ------------------------------------------------------------

    let selectedDigits = 0;

    for (let i = 1; i <= 8; i++) {
        if (document.getElementById(`displayDigit${i}`).checked) {
            selectedDigits++;
        }
    }

    // ------------------------------------------------------------
    // STEP 3 - Update Status
    // ------------------------------------------------------------

    const status = document.getElementById('displayLayoutStatus');

    if (selectedDigits === activeDigits) {
        status.textContent = `✓ Layout Valid (${selectedDigits} of ${activeDigits} selected)`;
    } else {
        status.textContent = `✗ Layout Invalid (${selectedDigits} of ${activeDigits} selected)`;
    }

    console.log(`Layout Validation : ${selectedDigits}/${activeDigits}`);

    // ------------------------------------------------------------
    // STEP 4 - Enable / Disable Save Button
    // ------------------------------------------------------------
    const saveButton = document.getElementById('displaySaveButton');
    console.log('Save Button:', saveButton);
    if (saveButton) {
        saveButton.disabled = selectedDigits !== activeDigits;
    }

    return selectedDigits === activeDigits;
}

/**
 * ================================================================
 * Initialize 7-Segment Display Events
 * ================================================================
 *
 * Registers all UI events for the display configuration dialog.
 *
 * This function should be called once during application startup.
 * ================================================================
 */
/*function initializeDisplayLayout() {
    // ------------------------------------------------------------
    // Physical Digit Checkboxes
    // ------------------------------------------------------------

    for (let i = 1; i <= 8; i++) {
        document.getElementById(`displayDigit${i}`).addEventListener('change', updateDisplayLayout);
    }
} */
function initializeDisplayLayout() {
    // ------------------------------------------------------------
    // Physical Digit Checkboxes
    // ------------------------------------------------------------

    for (let i = 1; i <= 8; i++) {
        document.getElementById(`displayDigit${i}`)?.addEventListener('change', updateDisplayLayout);
    }

    // ------------------------------------------------------------
    // Decimal Position Radios
    // ------------------------------------------------------------

    for (let i = 0; i <= 8; i++) {
        document.getElementById(`displayDecimal${i}`)?.addEventListener('change', () => {
            console.log('Decimal Changed');
            renderDisplayPreview();
        });
    }

    // ------------------------------------------------------------
    // Reverse Digits
    // ------------------------------------------------------------

    document.getElementById('displayReverseDigits')?.addEventListener('change', renderDisplayPreview);

    // ------------------------------------------------------------
    // Suppress Leading Zeros
    // ------------------------------------------------------------

    document.getElementById('displaySuppressZeros')?.addEventListener('change', renderDisplayPreview);
}

function saveDisplayConfig() {
    const display = displayConfigs[currentDisplayIndex];

    const digits = parseInt(document.getElementById('displayDigits').value);

    let selectedCount = 0;
    const usedDigits = [];

    for (let i = 1; i <= 8; i++) {
        const checked = document.getElementById(`displayDigit${i}`).checked;

        usedDigits.push(checked);

        if (checked) {
            selectedCount++;
        }
    }
    // ------------------------------------------------------------
    // Validate Display Layout
    // ------------------------------------------------------------
    if (!validateDisplayLayout()) {
        return;
    }

    // ------------------------------------------------------------
    // Save Decimal Position
    // ------------------------------------------------------------

    const selectedDecimal = document.querySelector('input[name="displayDecimal"]:checked');

    display.decimalPhysicalDigit = selectedDecimal ? parseInt(selectedDecimal.value) : 0;

    display.digits = digits;

    display.brightness = parseInt(document.getElementById('displayBrightness').value);

    display.reverseDigits = document.getElementById('displayReverseDigits').checked;

    display.suppressLeadingZeros = document.getElementById('displaySuppressZeros').checked;

    display.usedDigits = usedDigits;

    closeDisplayConfig();

    console.log('DISPLAY CONFIG SAVED', displayConfigs[currentDisplayIndex]);
}

function closeDisplayConfig() {
    document.getElementById('displayConfigModal').style.display = 'none';
}

function populateAssignedDeviceDropdown() {
    const select = document.getElementById('manualAssignedDevice');

    if (!select) {
        return;
    }

    const currentValue = select.value;

    select.innerHTML = '';

    const boardOption = document.createElement('option');

    boardOption.value = 'BOARD';

    boardOption.textContent = 'Main Board';

    select.appendChild(boardOption);

    if (!project.expansionDevices) {
        return;
    }

    project.expansionDevices
        .filter((d) => d.type === 'MCP23017')
        .forEach((d) => {
            const option = document.createElement('option');

            option.value = d.id;

            option.textContent = d.name;

            select.appendChild(option);
        });
    if (currentValue) {
        select.value = currentValue;
    }
}

function populateManualPinDropdown() {
    const pinSelect = document.getElementById('manualPin');

    if (!pinSelect) {
        return;
    }

    pinSelect.innerHTML = '';

    const selectedDevice = document.getElementById('manualAssignedDevice').value;

    const usedPins = [];

    project.components.forEach((c, index) => {
        if (index === editIndex) {
            return;
        }

        if (c.manualPin !== undefined && c.manualPin !== null) {
            usedPins.push(`${c.assignedDevice}:${c.manualPin}`);
        }

        if (c.manualPinA !== undefined && c.manualPinA !== null) {
            usedPins.push(`${c.assignedDevice}:${c.manualPinA}`);
        }

        if (c.manualPinB !== undefined && c.manualPinB !== null) {
            usedPins.push(`${c.assignedDevice}:${c.manualPinB}`);
        }

        if (c.manualPins) {
            c.manualPins.forEach((pin) => {
                usedPins.push(`${c.assignedDevice}:${pin}`);
            });
        }
    });

    let availablePins = [];

    if (selectedDevice === 'BOARD') {
        availablePins = BOARDS[project.board].gpioPins;
    } else {
        const mcp = project.expansionDevices.find((d) => d.id === selectedDevice);

        if (!mcp) {
            return;
        }

        availablePins = mcp.pins;
    }

    availablePins.forEach((pin) => {
        const pinKey = `${selectedDevice}:${pin}`;

        if (usedPins.includes(pinKey)) {
            return;
        }

        const option = document.createElement('option');

        option.value = pin;
        option.textContent = pin;

        pinSelect.appendChild(option);
    });
}

function renderNativePinMap() {
    console.log('Pin map rendering...');
    const container = document.getElementById('nativePinMap');

    if (!container) return;

    container.innerHTML = '';

    const board = getSelectedBoard();

    if (!board) return;

    const allocation = allocatePins(project);

    const usedPins = allocation.reservedPins || [];

    console.log(usedPins);

    const title = document.createElement('h4');

    title.textContent = `Native GPIO (${board.name})`;

    container.appendChild(title);

    const grid = document.createElement('div');

    grid.className = 'pin-grid';

    board.gpioPins.forEach((pin) => {
        const div = document.createElement('div');

        const isUsed = usedPins.includes(String(pin));

        const isSpecial =
            pin === board.spi.miso ||
            pin === board.spi.mosi ||
            pin === board.spi.sck ||
            pin === board.i2c.sda ||
            pin === board.i2c.scl;

        if (isUsed) {
            div.className = 'pin-box pin-used';
        } else if (isSpecial) {
            div.className = 'pin-box pin-special';
        } else {
            div.className = 'pin-box pin-free';
        }
        div.textContent = pin;
        div.dataset.pin = String(pin);

        div.addEventListener('mouseenter', (e) => {
            console.log('Hovering pin', pin);
            showPinTooltip(pin, e);
        });

        div.addEventListener('mouseleave', () => {
            document.getElementById('pinTooltip').style.display = 'none';
        });

        div.addEventListener('mousemove', (e) => {
            showPinTooltip(pin, e);
        });
        div.addEventListener('click', () => {
            const assignment = getPinAssignment(pin);

            if (assignment) {
                highlightComponent(assignment);
            }
        });
        grid.appendChild(div);
    });

    container.appendChild(grid);

    if (board.analogPins?.length) {
        const analogTitle = document.createElement('h4');

        analogTitle.textContent = 'Analog Inputs';

        analogTitle.style.marginTop = '20px';

        container.appendChild(analogTitle);

        const analogGrid = document.createElement('div');

        analogGrid.className = 'pin-grid';

        board.analogPins.forEach((pinInfo) => {
            const div = document.createElement('div');

            const analogPin = pinInfo.analog;

            //   const isUsed = usedPins.includes(analogPin);
            const isUsed = usedPins.includes(analogPin) || usedPins.includes(String(pinInfo.digital));

            if (isUsed) {
                div.className = 'pin-box pin-used';
            } else {
                div.className = 'pin-box pin-free';
            }

            div.textContent = analogPin;

            div.dataset.pin = analogPin;

            div.addEventListener('mouseenter', (e) => {
                showPinTooltip(analogPin, e);
            });

            div.addEventListener('mouseleave', () => {
                document.getElementById('pinTooltip').style.display = 'none';
            });

            div.addEventListener('mousemove', (e) => {
                showPinTooltip(analogPin, e);
            });

            div.addEventListener('click', () => {
                const assignment = getPinAssignment(analogPin);

                if (assignment) {
                    highlightComponent(assignment);
                }
            });

            analogGrid.appendChild(div);
        });

        container.appendChild(analogGrid);
    }
}

function getSelectedBoard() {
    const boardId = document.getElementById('board').value;

    return BOARDS[boardId];
}

function getPinAssignment(pin) {
    const allocation = allocatePins(project);

    for (const item of allocation.allocations) {
        const found = item.pins.some((p) => {
            const pinPart = String(p).includes(':') ? String(p).split(':').pop() : String(p);

            //   return pinPart === String(pin);
            const clickedPin = String(pin);

            // Pro Micro analog translation
            const analogMap = {
                18: 'A0',
                19: 'A1',
                20: 'A2',
                21: 'A3',
            };

            //   return pinPart === clickedPin || analogMap[clickedPin] === pinPart;
            if (project.board === 'PROMICRO') {
                return pinPart === clickedPin || analogMap[clickedPin] === pinPart;
            }

            return pinPart === clickedPin;
        });

        if (found) {
            return item.component;
        }
    }

    return null;
}

/*function getMCPPinAssignment(deviceName, pinName) {
    console.log(project.components);

   
    return null;
}
// for (const component of configuredComponents) {
/* for (const component of components) {
        if (!component.pinAssignments) continue;

        for (const assignment of Object.values(component.pinAssignments)) {
            if (assignment === `${deviceName}:${pinName}`) {
                return component;
            }
        }
    }

    return null;
}*/
/*function getMCPPinAssignment(address, pinName) {
    const allocation = allocatePins(project);

    for (const item of allocation.allocations) {
        const found = item.pins.some((p) => String(p) === `${address}:${pinName}`);

        if (found) {
            return item.component;
        }
    }

    return null;
}*/

function getMCPPinAssignment(address, pinName) {
    const allocation = allocatePins(project);

    console.log('Looking for:', `${address}:${pinName}`);

    for (const item of allocation.allocations) {
        console.log('Pins:', item.pins);

        const found = item.pins.some((p) => String(p) === `${address}:${pinName}`);

        if (found) {
            console.log('FOUND!', item.component.label);
            return item.component;
        }
    }

    return null;
}

function showPinTooltip(pin, e) {
    //  console.log('showPinTooltip', pin);
    const assignment = getPinAssignment(pin);
    //  console.log('assignment', assignment);

    const tooltip = document.getElementById('pinTooltip');

    if (!assignment) {
        tooltip.style.display = 'none';
        return;
    }

    tooltip.innerHTML = `
        <strong>Pin ${pin}</strong>
        <hr>
        <div><b>Type:</b> ${assignment.type}</div>
        <div><b>Label:</b> ${assignment.label}</div>
        <div><b>Device:</b> ${assignment.assignedDevice}</div>
    `;

    tooltip.style.display = 'block';

    tooltip.style.left = e.clientX + 15 + 'px';

    tooltip.style.top = e.clientY + 15 + 'px';

    console.log(tooltip.style.display, tooltip.style.left, tooltip.style.top);
}

function renderMCPPinMaps() {
    const container = document.getElementById('mcpPinMaps');

    if (!container) return;

    container.innerHTML = '';

    if (!expansionManager || expansionManager.devices.length === 0) {
        container.innerHTML = '<div class="empty-state">No MCP23017 expansions configured.</div>';
        return;
    }

    expansionManager.devices.forEach((device) => {
        const card = createMCPPinCard(device);
        container.appendChild(card);
    });
}

function createMCPPinCard(device) {
    const card = document.createElement('div');
    card.className = 'mcp-pin-card';

    /* const address =
        typeof device.address === 'string'
            ? device.address.toUpperCase()
            : '0x' + device.address.toString(16).toUpperCase(); */

    const address = getMCPAddress(device);

    card.innerHTML = `
    <div class="mcp-header">
        MCP23017 (${address})
    </div>
`;

    card.appendChild(createMCPBank(device, 'A'));
    card.appendChild(createMCPBank(device, 'B'));

    return card;
}
function createMCPPinCard(device) {
    const card = document.createElement('div');
    card.className = 'mcp-pin-card';

    const address = getMCPAddress(device);
    /*  const address =
        typeof device.address === 'string'
            ? device.address.toUpperCase()
            : '0x' + device.address.toString(16).toUpperCase(); */

    card.innerHTML = `
    <div class="mcp-header">
        MCP23017 (${address})
    </div>
`;

    card.appendChild(createMCPBank(device, 'A'));
    card.appendChild(createMCPBank(device, 'B'));

    return card;
}
function createMCPBank(device, port) {
    const bank = document.createElement('div');
    bank.className = 'mcp-bank';

    const title = document.createElement('div');
    title.className = 'bank-title';
    title.textContent = `PORT ${port}`;

    const row = document.createElement('div');
    row.className = 'mcp-pin-row';

    const address = getMCPAddress(device);

    for (let i = 0; i < 8; i++) {
        const pinName = `GP${port}${i}`;

        const pin = document.createElement('div');

        const assignment = getMCPPinAssignment(address, pinName);

        pin.className = 'mcp-pin';

        if (assignment) {
            pin.classList.add('assigned');
        } else {
            pin.classList.add('available');
        }

        pin.textContent = pinName;
        pin.dataset.pin = `${address}:${pinName}`;

        pin.addEventListener('mouseenter', (e) => {
            showMCPPinTooltip(address, pinName, e);
        });

        pin.addEventListener('mousemove', (e) => {
            const tooltip = document.getElementById('pinTooltip');

            // if (!tooltip) return;
            if (!tooltip || tooltip.style.display !== 'block') {
                return;
            }
            tooltip.style.left = e.clientX + 15 + 'px';
            tooltip.style.top = e.clientY + 15 + 'px';
        });

        pin.addEventListener('mouseleave', () => {
            hidePinTooltip();
        });
        pin.addEventListener('click', () => {
            const assignment = getMCPPinAssignment(address, pinName);

            if (assignment) {
                highlightComponent(assignment);
            }
        });
        row.appendChild(pin);
    }

    bank.appendChild(title);
    bank.appendChild(row);

    return bank;
}

function getMCPAddress(device) {
    return typeof device.address === 'string'
        ? device.address.toLowerCase()
        : '0x' + device.address.toString(16).toLowerCase();
}

function hidePinTooltip() {
    const tooltip = document.getElementById('pinTooltip');

    if (!tooltip) return;

    tooltip.style.display = 'none';
}
function getMCPPinInfo(address, pinName) {
    const allocation = allocatePins(project);

    for (const item of allocation.allocations) {
        const found = item.pins.some((p) => String(p) === `${address}:${pinName}`);

        if (found) {
            return {
                component: item.component,
                address,
                pin: pinName,
            };
        }
    }

    return null;
}
function showMCPPinTooltip(address, pinName, e) {
    const assignment = getMCPPinAssignment(address, pinName);

    const tooltip = document.getElementById('pinTooltip');

    if (!assignment) {
        tooltip.style.display = 'none';
        return;
    }

    tooltip.innerHTML = `
        <strong>${pinName}</strong>
        <hr>
        <div><b>Type:</b> ${assignment.type}</div>
        <div><b>Label:</b> ${assignment.label}</div>
        <div><b>Expansion:</b> ${getExpansionDisplayName(address)}</div>
    `;

    tooltip.style.display = 'block';
    tooltip.style.left = e.clientX + 15 + 'px';
    tooltip.style.top = e.clientY + 15 + 'px';
}

function getExpansionDisplayName(address) {
    const device = expansionManager.devices.find((d) => getMCPAddress(d) === address);

    return device ? `${device.name}` : address;
}

function highlightComponent(component) {
    const index = project.components.findIndex((c) => c.id === component.id);

    if (index === -1) return;

    const row = document.querySelector(`[data-component-index="${index}"]`);

    console.log('Found Row', row);

    if (!row) return;

    row.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
    });

    row.classList.remove('component-highlight');

    void row.offsetWidth;

    row.classList.add('component-highlight');

    setTimeout(() => {
        row.classList.remove('component-highlight');
    }, 2000);
}

function highlightPin(pinId) {
    let lookupPin = String(pinId);

    if (lookupPin.startsWith('BOARD:')) {
        lookupPin = lookupPin.split(':')[1];
    }

    let pinElements = [];

    if (project.board === 'PROMICRO' && lookupPin.startsWith('A')) {
        const analogMap = {
            A0: '18',
            A1: '19',
            A2: '20',
            A3: '21',
        };

        const digitalPin = analogMap[lookupPin];

        pinElements = [
            document.querySelector(`[data-pin="${lookupPin}"]`),
            document.querySelector(`[data-pin="${digitalPin}"]`),
        ].filter(Boolean);
    } else {
        const pinElement = document.querySelector(`[data-pin="${lookupPin}"]`);

        if (pinElement) {
            pinElements.push(pinElement);
        }
    }

    console.log('Highlight Pin:', pinId);

    console.log('Lookup Pin:', lookupPin);

    console.log('Found Elements:', pinElements);

    if (!pinElements.length) return;

    pinElements.forEach((pinElement) => {
        pinElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });

        pinElement.classList.remove('pin-highlight');

        void pinElement.offsetWidth;

        pinElement.classList.add('pin-highlight');

        setTimeout(() => {
            pinElement.classList.remove('pin-highlight');
        }, 2000);
    });
}

function highlightPinsForComponent(component) {
    console.log(component);
    console.log(allocatePins(project).allocations);
    const allocation = allocatePins(project);

    const item = allocation.allocations.find((a) => a.component.id === component.id);

    console.log('Component Clicked:', component);
    console.log('Allocation:', item);

    if (!item) return;

    item.pins.forEach((pin) => {
        highlightPin(pin);
    });
}

function generateComponentId(type) {
    const ranges = {
        pushbutton: 1000,
        led: 2000,
        encoder: 3000,
        displays: 4000,
        sevensegment: 400,
        toggle: 5000,
        switch3: 6000,
        rotaryswitch: 7000,
        axis: 8000,
    };

    const start = ranges[type];

    if (!start) {
        return Date.now();
    }

    const ids = project.components.filter((c) => c.type === type && typeof c.id === 'number').map((c) => c.id);

    if (ids.length === 0) {
        return start;
    }

    return Math.max(...ids) + 1;
}
function getComponentPinAllocation(component) {
    const allocation = allocatePins(project);

    const item = allocation.allocations.find((a) => a.component.id === component.id);

    if (!item) {
        return '-';
    }

    return item.pins.join(', ');
}

function generateArduinoCode() {
    try {
        addBuildLog('Validating configuration...');

        const deviceModel = generateDeviceModel(project);

        addBuildLog('Building firmware model...');

        const firmwareModel = generateFirmwareModel(deviceModel);

        addBuildLog('Generating Arduino code...');

        const ino = generateFirmware(firmwareModel);

        project.generatedINO = ino;

        addBuildLog('Arduino code generated successfully.', 'SUCCESS');

        setGenerationStatus('Generation Successful', 'success');

        console.log(ino);
    } catch (err) {
        console.error(err);

        addBuildLog(err.message, 'ERROR');

        setGenerationStatus('Generation Failed', 'error');
    }
}

function previewFirmware() {
    try {
        clearBuildLog();

        addBuildLog('Generating device model...');
        setGenerationStatus('Generating Firmware...', 'working');
        const deviceModel = generateDeviceModel(project);

        addBuildLog('Generating firmware model...');

        const firmwareModel = generateFirmwareModel(deviceModel);

        addBuildLog('Generating Arduino firmware...');

        const firmware = generateFirmware(firmwareModel);

        project.generatedFirmware = firmware;

        document.getElementById('generatedCodePreview').textContent = firmware;

        addBuildLog(`Generated ${firmware.length} bytes of firmware.`, 'SUCCESS');
        addBuildLog(`Generated ${firmware.split('\n').length} lines of firmware.`, 'SUCCESS');
        addBuildLog(`${project.components.length} components configured.`, 'INFO');
        addBuildLog(`${expansionManager.getDevices().length} MCP23017 installed.`, 'INFO');
        setGenerationStatus('Generation Successful', 'success');
    } catch (err) {
        console.error(err);

        addBuildLog(err.message, 'ERROR');

        setGenerationStatus('Generation Failed', 'error');
        //setGenerationStatus(`${firmware.length} bytes generated`, 'success');
    }
}

function clearBuildLog() {
    const log = document.getElementById('buildLog');

    if (!log) return;

    log.textContent = '[INFO] Ready.';
}

function addBuildLog(message, type = 'INFO') {
    const log = document.getElementById('buildLog');

    if (!log) return;

    const time = new Date().toLocaleTimeString();

    log.textContent += `\n[${type}] ${time} - ${message}`;

    log.parentElement.scrollTop = log.parentElement.scrollHeight;
}

function setGenerationStatus(message, state) {
    const status = document.getElementById('generationStatus');

    if (!status) return;

    status.textContent = message;

    status.className = `generation-status ${state}`;
}

/**
 * =====================================================================
 * Update Decimal Radio Buttons
 * =====================================================================
 *
 * Synchronizes the decimal radio buttons with the selected
 * physical display layout.
 *
 * Responsibilities
 * ----------------
 * ✓ Enable decimal radios for active digits
 * ✓ Disable decimal radios for inactive digits
 * ✓ Keep "None" always enabled
 *
 * NOTE:
 * This function does NOT change the selected decimal yet.
 *
 * Version History
 * ---------------
 * v1.0.0
 * Initial implementation.
 * =====================================================================
 */
function updateDecimalRadios() {
    // ------------------------------------------------------------
    // STEP 1 - Enable / Disable Decimal Radios
    // ------------------------------------------------------------
    console.log('updateDecimalRadios()');
    for (let i = 1; i <= 8; i++) {
        const digitCheckbox = document.getElementById(`displayDigit${i}`);

        const decimalRadio = document.getElementById(`displayDecimal${i}`);

        decimalRadio.disabled = !digitCheckbox.checked;
    }

    // ------------------------------------------------------------
    // STEP 2 - "None" is always available
    // ------------------------------------------------------------

    document.getElementById('displayDecimal0').disabled = false;

    console.log('Decimal radios updated.');

    // ------------------------------------------------------------
    // STEP 3 - Ensure Current Decimal Selection Is Valid
    // ------------------------------------------------------------

    let selectedRadio = document.querySelector('input[name="displayDecimal"]:checked');

    if (selectedRadio && selectedRadio.disabled) {
        document.getElementById('displayDecimal0').checked = true;

        console.log('Decimal moved to None.');
    }
    renderDisplayPreview();
}

/**
 * =====================================================================
 * Render Live Display Preview
 * =====================================================================
 *
 * Generates a live preview of the configured 7-Segment display.
 *
 * Version History
 * ---------------------------------------------------------------------
 * v1.0.0
 * Initial Preview Engine
 * =====================================================================
 */
function renderDisplayPreview() {
    // ------------------------------------------------------------
    // Build Preview
    // ------------------------------------------------------------

    // let preview = '';

    // ------------------------------------------------------------
    // Read Current Display Settings
    // ------------------------------------------------------------

    const reverse = document.getElementById('displayReverseDigits').checked;

    const suppressLeadingZeros = document.getElementById('displaySuppressZeros').checked;

    const selectedDecimal = document.querySelector('input[name="displayDecimal"]:checked');

    const decimalPhysicalDigit = selectedDecimal ? parseInt(selectedDecimal.value) : 0;

    // ------------------------------------------------------------
    // Test Value
    // ------------------------------------------------------------

    //   let preview = buildPreviewCharacters();

    let preview = buildPreviewCharacters();

    preview = applyReverse(preview);

    preview = applyDecimal(preview);

    preview = applySuppressLeadingZeros(preview);

    //  document.getElementById('displayPreview').textContent = preview;
    document.getElementById('displayPreview').innerHTML = generateDisplaySVG(preview);
}

/**
 * =====================================================================
 * Build Preview Characters
 * =====================================================================
 *
 * Creates the preview string based on the active physical digits.
 *
 * Example
 * -------
 * --------
 * -123456-
 * --1234--
 *
 * No decimal.
 * No reverse.
 * =====================================================================
 */
function buildPreviewCharacters() {
    let preview = '';

    // const testDigits = ['1', '2', '3', '4', '5', '6', '7', '8'];
    const testValue = '12345678';

    let testDigits = testValue.split('');

    let digitIndex = 0;

    for (let physical = 8; physical >= 1; physical--) {
        const enabled = document.getElementById(`displayDigit${physical}`).checked;

        if (enabled) {
            preview += testDigits[digitIndex];

            digitIndex++;
        } else {
            preview += '-';
        }
    }

    return preview;
}

/**
 * =====================================================================
 * Apply Decimal Point
 * =====================================================================
 *
 * Inserts the decimal point into the preview string based on the
 * selected physical digit.
 *
 * Example
 * -------
 * -123456-
 *
 * Decimal = D4
 *
 * Result
 * ------
 * -123.456-
 * =====================================================================
 */
function applyDecimal(preview) {
    const selectedDecimal = document.querySelector('input[name="displayDecimal"]:checked');

    const decimalPhysicalDigit = selectedDecimal ? parseInt(selectedDecimal.value) : 0;

    let result = '';

    let physical = 8;

    for (const ch of preview) {
        result += ch;

        if (physical === decimalPhysicalDigit && ch !== '-') {
            result += '.';
        }

        physical--;
    }

    return result;
}

/**
 * =====================================================================
 * Apply Reverse Display
 * =====================================================================
 *
 * Reverses only the active display characters.
 *
 * Example
 * -------
 * -123456-
 *
 * becomes
 *
 * -654321-
 *
 * Inactive positions remain fixed.
 * =====================================================================
 */
function applyReverse(preview) {
    if (!document.getElementById('displayReverseDigits').checked) {
        return preview;
    }

    // ------------------------------------------------------------
    // Collect active characters
    // ------------------------------------------------------------

    const active = [];

    for (const ch of preview) {
        if (ch !== '-' && ch !== '.') {
            active.push(ch);
        }
    }

    active.reverse();

    // ------------------------------------------------------------
    // Rebuild Preview
    // ------------------------------------------------------------

    let result = '';

    let index = 0;

    for (const ch of preview) {
        if (ch === '-') {
            result += '-';
        } else if (ch === '.') {
            result += '.';
        } else {
            result += active[index++];
        }
    }

    return result;
}

/**
 * =====================================================================
 * Apply Suppress Leading Zeros
 * =====================================================================
 *
 * Replaces leading zeros with inactive digits.
 *
 * Example
 * -------
 * -001.234-
 *
 * becomes
 *
 * --1.234-
 * =====================================================================
 */
function applySuppressLeadingZeros(preview) {
    // ------------------------------------------------------------
    // Feature Disabled
    // ------------------------------------------------------------

    if (!document.getElementById('displaySuppressZeros').checked) {
        return preview;
    }

    let result = '';
    let suppress = true;

    for (const ch of preview) {
        // Keep inactive positions
        if (ch === '-') {
            result += '-';
            continue;
        }

        // Keep decimal point
        if (ch === '.') {
            result += '.';
            continue;
        }

        // Suppress leading zeros
        if (suppress && ch === '0') {
            result += '-';
            continue;
        }

        // First non-zero digit found
        suppress = false;

        result += ch;
    }

    return result;
}

/**
 * =====================================================================
 * Generate SVG Display
 * =====================================================================
 *
 * Generates the SVG representation of the display preview.
 *
 * Version History
 * ---------------------------------------------------------------------
 * v1.0.0
 * Initial SVG Renderer
 * =====================================================================
 */
function generateDisplaySVG(preview) {
    return `
        <svg
            width="100%"
            height="80"
            viewBox="0 0 420 80"
            xmlns="http://www.w3.org/2000/svg">

            <!-- Module Background -->

            <rect
                x="2"
                y="2"
                width="416"
                height="76"
                rx="8"
                fill="#141414"
                stroke="#3a3a3a"
                stroke-width="2"/>

            <!-- Temporary Text -->


${renderDigit(
    {
        character: preview[0],
        decimal: false,
        brightness: 8,
        enabled: true,
    },
    30,
    CURRENT_THEME
)}
${generateDigitSVG(preview[1], 75)}
${generateDigitSVG(preview[2], 120)}
${generateDigitSVG(preview[3], 165)}
${generateDigitSVG(preview[4], 210)}
${generateDigitSVG(preview[5], 255)}
${generateDigitSVG(preview[6], 300)}
${generateDigitSVG(preview[7], 345)}
${generateDigitSVG(preview[8] ?? '', 390)}

        </svg>
    `;
}

/**
 * =====================================================================
 * 7-Segment Colour Map
 * =====================================================================
 *
 *  */
//const SEGMENT_ON = '#FFC000';

//const SEGMENT_OFF = '#242424';

//const MODULE_BACKGROUND = '#141414';

//const MODULE_BORDER = '#444444';

// =====================================================================
// SVG Display Renderer Constants
// =====================================================================

// Module

const MODULE_WIDTH = 420;
const MODULE_HEIGHT = 80;

const MODULE_PADDING = 12;

// Digits

const DIGIT_WIDTH = 40;
const DIGIT_HEIGHT = 64;

const DIGIT_SPACING = 10;

// Segment Geometry

const SEGMENT_THICKNESS = 6;
const SEGMENT_CHAMFER = 3;

// Colours

const SEGMENT_ON = '#FFC000'; // Amber
const SEGMENT_OFF = '#2A2A2A';

const MODULE_BACKGROUND = '#141414';
const MODULE_BORDER = '#3A3A3A';

const DISPLAY_THEMES = {
    amber: {
        on: '#FFC000',

        off: '#2A2A2A',
    },

    blue: {
        on: '#33CCFF',

        off: '#2A2A2A',
    },
};

const CURRENT_THEME = DISPLAY_THEMES.amber;

// =====================================================================
// Master Segment Geometry
// =====================================================================

const SEGMENT_POINTS = {
    A: '8,6 12,2 48,2 52,6 48,10 12,10',

    B: '',

    C: '',

    D: '',

    E: '',

    F: '',

    G: '',
};

// const MASTER_SEGMENT_PATH = 'M6,4 L10,0 L42,0 L46,4 L42,8 L10,8 Z';

/*const SEGMENT_LAYOUT = {
    A: { x: 0, y: 0, rotation: 0 },

    B: { x: 44, y: 4, rotation: 90 },

    C: { x: 44, y: 48, rotation: 90 },

    D: { x: 0, y: 88, rotation: 0 },

    E: { x: 0, y: 48, rotation: 90 },

    F: { x: 0, y: 4, rotation: 90 },

    G: { x: 0, y: 44, rotation: 0 },
}; */
// =====================================================================
// Master SVG Segment Library
// =====================================================================

const SEGMENT_HORIZONTAL_PATH = '';

const SEGMENT_VERTICAL_PATH = '';

/**
 * =====================================================================
 * 7-Segment Character Map
 * =====================================================================
 *
 * Segment Naming
 *
 *      A
 *    -----
 * F |     | B
 *   |  G  |
 *    -----
 * E |     | C
 *   |     |
 *    -----
 *      D
 *
 * =====================================================================
 */

const SEGMENT_MAP = {
    0: ['A', 'B', 'C', 'D', 'E', 'F'],

    1: ['B', 'C'],

    2: ['A', 'B', 'G', 'E', 'D'],

    3: ['A', 'B', 'C', 'D', 'G'],

    4: ['F', 'G', 'B', 'C'],

    5: ['A', 'F', 'G', 'C', 'D'],

    6: ['A', 'F', 'G', 'E', 'C', 'D'],

    7: ['A', 'B', 'C'],

    8: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],

    9: ['A', 'B', 'C', 'D', 'F', 'G'],

    '-': ['G'],

    ' ': [],
};
/**
 * =====================================================================
 * Generate 7-Segment Digit
 * =====================================================================
 *
 * Generates a single SVG digit.
 *
 * Version 1
 * ----------
 * Temporary text renderer.
 * =====================================================================
 */

function drawSegment(points, active, colorOn, colorOff) {
    return `
        <polygon
            points="${points}"
            fill="${active ? colorOn : colorOff}"
        />
    `;
}

/**
 * =====================================================================
 * Render SVG Segment
 * =====================================================================
 *
 * Renders one 7-segment LED using the master segment path and layout.
 * =====================================================================
 */
/*function renderSegment(segmentName, active, colorOn, colorOff) {
    const layout = SEGMENT_LAYOUT[segmentName];

    return `
        <path
            d="${MASTER_SEGMENT_PATH}"
            transform="
                translate(${layout.x},${layout.y})
                rotate(${layout.rotation},26,4)
            "
            fill="${active ? colorOn : colorOff}"
        />
    `;
} */

function renderHorizontalSegment(active, colorOn, colorOff) {}

function renderVerticalSegment(active, colorOn, colorOff) {}

/**
 * =====================================================================
 * Render Digit
 * =====================================================================
 *
 * Renders one complete 7-segment digit.
 * =====================================================================
 */
function renderDigit(digit, x, theme) {
    const activeSegments = SEGMENT_MAP[digit.character] ?? [];

    return `
        <g transform="translate(${x},8)">

            ${renderSegment('A', activeSegments.includes('A'), theme.on, theme.off)}

            ${renderSegment('B', activeSegments.includes('B'), theme.on, theme.off)}

            ${renderSegment('C', activeSegments.includes('C'), theme.on, theme.off)}

            ${renderSegment('D', activeSegments.includes('D'), theme.on, theme.off)}

            ${renderSegment('E', activeSegments.includes('E'), theme.on, theme.off)}

            ${renderSegment('F', activeSegments.includes('F'), theme.on, theme.off)}

            ${renderSegment('G', activeSegments.includes('G'), theme.on, theme.off)}

        </g>
    `;
}

function generateDigitSVG(character, x, color) {
    const activeSegments = SEGMENT_MAP[character] ?? [];

    const A = activeSegments.includes('A');

    return `
      <g transform="translate(${x},0)">
  
  ${renderSegment('A', A, color, SEGMENT_OFF)}
</g>
    `;
}
