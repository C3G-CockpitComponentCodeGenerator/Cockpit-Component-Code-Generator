export function generateFirmwareModel(deviceModel) {
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
        const entry = createFirmwareEntry(device, nextId++);

        validateFirmwareEntry(entry);

        firmwareModel.registration.push(entry);

        if (entry.direction === 'INPUT') {
            firmwareModel.inputs.push(entry);
        }

        if (entry.direction === 'OUTPUT') {
            firmwareModel.outputs.push(entry);
        }
    });

    return firmwareModel;
}

function createFirmwareEntry(device, id) {
    return {
        id,

        tag: device.tag,

        label: device.label,

        direction: getDirection(device),

        type: device.spadType,

        behavior: device.inherit,

        pins: device.pins,

        encoderMode: device.encoderMode,

        positions: device.positions,

        positionNames: device.positionNames,
    };
}

function getDirection(device) {
    switch (device.componentType) {
        case 'pushbutton':
        case 'toggle':
        case 'encoder':
            return 'INPUT';

        case 'led':
            return 'OUTPUT';

        default:
            throw new Error(`Unknown component type: ${device.componentType}`);
    }
}

function validateFirmwareEntry(entry) {
    if (!entry.tag) {
        throw new Error('Firmware entry missing tag');
    }

    if (!entry.type) {
        throw new Error(`${entry.tag} missing SPAD type`);
    }

    if (!entry.behavior) {
        throw new Error(`${entry.tag} missing behavior`);
    }

    if (!entry.pins?.length) {
        throw new Error(`${entry.tag} missing pin allocation`);
    }
}
