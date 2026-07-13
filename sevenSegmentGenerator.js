function generateSevenSegmentIncludes(firmwareModel) {
    const displays = firmwareModel.outputs.filter((d) => d.componentType === 'sevensegment');

    if (displays.length === 0) {
        return '';
    }

    return '#include <LedControl.h>';
}

function generateSevenSegmentObjects(firmwareModel) {
    return '';
}

function generateSevenSegmentSetup(firmwareModel) {
    return '';
}

function generateSevenSegmentObjects(firmwareModel) {
    const displays = firmwareModel.outputs.filter((d) => d.componentType === 'sevensegment');

    const displayGroups = {};

    displays.forEach((display) => {
        //  console.log('DISPLAY OBJECT', display);
        console.log('DISPLAY OBJECT', JSON.parse(JSON.stringify(display)));

        const csPin = display.pins.find((p) => p.startsWith('CS:'));

        const key = csPin;

        if (!displayGroups[key]) {
            displayGroups[key] = [];
        }

        displayGroups[key].push(display);
    });

    console.log('DISPLAY GROUPS', displayGroups);

    const lines = [];

    Object.values(displayGroups).forEach((group, index) => {
        const display = group[0];

        const dinPin = display.pins.find((p) => p.startsWith('DIN:'));

        const clkPin = display.pins.find((p) => p.startsWith('CLK:'));

        const csPin = display.pins.find((p) => p.startsWith('CS:'));

        const modulesPin = display.pins.find((p) => p.startsWith('Modules:'));

        const din = dinPin.replace('DIN:', '');

        const clk = clkPin.replace('CLK:', '');

        const cs = csPin.replace('CS:', '');

        const modules = parseInt(modulesPin.replace('Modules:', ''));

        lines.push(
            `LedControl seg${index + 1}(
    ${din},
    ${clk},
    ${cs},
    ${modules}
);`
        );
    });

    displays.forEach((display, index) => {
        lines.push(
            `
const int seg${index + 1}DecimalDigit =
    ${calculateLogicalDecimalDigit(display)};

 const int seg${index + 1}DecimalPhysicalDigit =
    ${display.decimalPhysicalDigit ?? 0};  

const bool seg${index + 1}UsedDigits[8] =
{
    ${display.usedDigits.join(', ')}
};

const bool seg${index + 1}ReverseDigits =
    ${display.reverseDigits};

const bool seg${index + 1}SuppressLeadingZeros =
    ${display.suppressLeadingZeros};

int getSeg${index + 1}PhysicalDigit(
    int logicalDigit
)
{
    int count = 0;

    for(
        int i = 0;
        i < 8;
        i++
    )
    {
        if(
            seg${index + 1}UsedDigits[i]
        )
        {
            if(
                count == logicalDigit
            )
            {
                return i;
            }

            count++;
        }
    }

    return -1;
}`
        );
    });

    return lines.join('\n\n');
}

function generateSevenSegmentSetup(firmwareModel) {
    const displays = firmwareModel.outputs.filter((d) => d.componentType === 'sevensegment');

    const displayGroups = {};

    displays.forEach((display) => {
        const csPin = display.pins.find((p) => p.startsWith('CS:'));

        if (!displayGroups[csPin]) {
            displayGroups[csPin] = [];
        }

        displayGroups[csPin].push(display);
    });

    const lines = [];

    /*  Object.values(displayGroups).forEach((group, chainIndex) => {
        const brightness = group[0].brightness ?? 8;

        lines.push(
            `for(int i = 0; i < ${group.length}; i++)
{
    seg${chainIndex + 1}.shutdown(i,false);
    seg${chainIndex + 1}.setIntensity(i,${brightness});
    seg${chainIndex + 1}.clearDisplay(i);
}`
        );
    }); */
    Object.values(displayGroups).forEach((group, chainIndex) => {
        group.forEach((display, moduleIndex) => {
            const brightness = display.brightness ?? 8;

            lines.push(
                `seg${chainIndex + 1}.shutdown(${moduleIndex},false);
seg${chainIndex + 1}.setIntensity(${moduleIndex},${brightness});
seg${chainIndex + 1}.clearDisplay(${moduleIndex});`
            );
        });
    });

    return lines.join('\n\n');
}

function generateDisplayUpdateHandler(firmwareModel) {
    const displays = firmwareModel.outputs.filter((d) => d.componentType === 'sevensegment');

    const displayGroups = {};

    displays.forEach((display) => {
        const csPin = display.pins.find((p) => p.startsWith('CS:'));

        if (!displayGroups[csPin]) {
            displayGroups[csPin] = [];
        }

        displayGroups[csPin].push(display);
    });

    const displayRouting = {};

    Object.values(displayGroups).forEach((group, chainIndex) => {
        group.forEach((display) => {
            displayRouting[display.id] = {
                chain: chainIndex + 1,
                module: display.moduleIndex,
                // module: display.moduleCount - display.moduleIndex - 1,
            };
            console.log(display.label, '-> Chain:', chainIndex + 1, 'Module:', display.moduleIndex);
        });
        //  console.log(display.label, display.id, display.moduleIndex, display.moduleCount);
    });

    console.log('DISPLAY ROUTING', displayRouting);

    const clearDisplayCode = displays
        .map((display) => {
            const route = displayRouting[display.id];

            const condition = display.id === displays[0].id ? 'if' : 'else if';

            return `
    ${condition}(displayIndex == ${display.id})
    {
        seg${route.chain}.clearDisplay(
            ${route.module}
        );
    }`;
        })
        .join('');

    if (displays.length === 0) {
        return '';
    }

    const setDigitCode = displays
        .map((display, index) => {
            // const route = displayRouting[display.id];
            const route = displayRouting[display.id];
            const condition = index === 0 ? 'if' : 'else if';

            return `
             ${condition}(displayIndex == ${display.id})
            {
               int logicalDigit =
    digitPos;

if(
    seg${index + 1}ReverseDigits
)
{
    logicalDigit =
        totalDigits - 1 - digitPos;
}

int physicalDigit =
    getSeg${index + 1}PhysicalDigit(
        logicalDigit
    );

if(
    physicalDigit >= 0
)
{
    bool decimal = false;

    int displayDigit =
        logicalDigit + 1;

    if(
        displayDigit ==
        seg${index + 1}DecimalDigit
    )
    {
        decimal = true;
    }

    if(
        !seg${index + 1}SuppressLeadingZeros ||
        !suppressDigit
    )
    {
seg${route.chain}.setDigit(
    ${route.module},
    physicalDigit,
            value[i] - '0',
            decimal
        );
    }
}
            }`;
        })
        .join('');

    return `
void onDisplayUpdate()
{
   int32_t displayIndex =
    messenger.readInt32Arg(); // displayIndex
    messenger.readInt32Arg(); // row
    messenger.readInt32Arg(); // command

    char *value =
        messenger.readStringArg();

        ${clearDisplayCode}
    int len =
        strlen(value);

        int totalDigits = 0;

for(
    int x = 0;
    x < len;
    x++
)
{
    if(
        value[x] >= '0' &&
        value[x] <= '9'
    )
    {
        totalDigits++;
    }
}

bool allDigitsZero = true;

for(
    int x = 0;
    x < len;
    x++
)
{
    if(
        value[x] >= '1' &&
        value[x] <= '9'
    )
    {
        allDigitsZero = false;
        break;
    }
}
    int digitPos = 0;

    for(
        int i = len - 1;
        i >= 0;
        i--
    )
    {
        if(value[i] == '.')
        {
            continue;
        }

        if(
            value[i] >= '0' &&
            value[i] <= '9'
        )
        {
        
        bool suppressDigit = false;
        if(
    value[i] == '0'
)
{
    bool allHigherDigitsZero = true;

    for(
        int j = 0;
        j < i;
        j++
    )
    {
        if(
            value[j] >= '1' &&
            value[j] <= '9'
        )
        {
            allHigherDigitsZero = false;
            break;
        }
    }

    if(
        allHigherDigitsZero
    )
    {
        suppressDigit = true;
    }
}

if(
    allDigitsZero &&
    digitPos == 0
)
{
    suppressDigit = false;
}

        ${setDigitCode}

            digitPos++;

            if(digitPos >= 8)
{
    break;
}
        }
    }
}
`;
}

function calculateLogicalDecimalDigit(display) {
    // ------------------------------------------------------------
    // No Decimal
    // ------------------------------------------------------------

    if (display.decimalPhysicalDigit === 0) {
        return 0;
    }

    let logical = 0;

    if (!display.reverseDigits) {
        // Count active digits from D1 → D8

        for (let digit = 1; digit <= 8; digit++) {
            if (display.usedDigits[digit - 1]) {
                logical++;

                if (digit === display.decimalPhysicalDigit) {
                    return logical;
                }
            }
        }
    } else {
        // Count active digits from D8 → D1

        for (let digit = 8; digit >= 1; digit--) {
            if (display.usedDigits[digit - 1]) {
                logical++;

                if (digit === display.decimalPhysicalDigit) {
                    return logical;
                }
            }
        }
    }

    return 0;
}
