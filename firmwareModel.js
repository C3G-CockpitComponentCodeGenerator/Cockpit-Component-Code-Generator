function generateFirmwareModel(deviceModel) {
    const firmwareModel = {
        projectName: project.projectName,

        deviceName: project.deviceName,

        authorId: project.authorId,

        guid: project.guid,

        registration: [],
        inputs: [],
        outputs: [],
    };

    let nextId = 1;

    deviceModel.forEach((device) => {
        console.log(device);

        const entry = {
            id: nextId++,

            tag: device.tag,

            label: device.label,

            componentType: device.componentType,

            // direction: "INPUT",

            direction: device.componentType === 'led' || device.componentType === 'sevensegment' ? 'OUTPUT' : 'INPUT',

            type: device.spadType,

            behavior: device.inherit,

            pins: device.pins,

            displayIndex: device.displayIndex,

            moduleIndex: device.moduleIndex,

            moduleCount: device.moduleCount,

            digits: device.displayConfig?.digits,

            usedDigits: device.displayConfig?.usedDigits,

            decimalDigit: device.displayConfig?.decimalDigit,

            reverseDigits: device.displayConfig?.reverseDigits,

            brightness: device.displayConfig?.brightness,

            suppressLeadingZeros: device.displayConfig?.suppressLeadingZeros,

            deviceCount: device.deviceCount,

            positionNames: device.positionNames || [],

            switchPositions: device.switchPositions,
        };
        console.log('FIRMWARE OUTPUT', entry);

        firmwareModel.registration.push(entry);

        if (entry.direction === 'INPUT') {
            firmwareModel.inputs.push(entry);
        }

        if (entry.direction === 'OUTPUT') {
            firmwareModel.outputs.push(entry);
        }
    });
    console.log(firmwareModel.outputs.filter((d) => d.componentType === 'sevensegment'));
    return firmwareModel;
}
