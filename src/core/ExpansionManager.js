
class ExpansionManager {

    constructor() {

        this.devices = [];
    }

    getDevices() {

        return this.devices;
    }

    addMCP23017() {

        const address =
            this.getNextAddress();

        if (!address)
            return null;

        const device =
    new MCP23017(
        `MCP_${Date.now()}_${Math.random()}`,
        address
    );

        this.devices.push(device);

        return device;
    }

    removeDevice(id) {

        this.devices =
            this.devices.filter(
                d => d.id !== id
            );
    }

    updateDevice(
    id,
    data
) {

    const device =
        this.devices.find(
            d => d.id === id
        );

    if (!device)
        return false;

    Object.assign(
        device,
        data
    );

    return true;
}

resetAllocations() {

    this.devices.forEach(
        device =>
            device.resetPins()
    );
}

    getNextAddress() {

        const addresses = [

            "0x20",
            "0x21",
            "0x22",
            "0x23",
            "0x24",
            "0x25",
            "0x26",
            "0x27"
        ];

        const used =
            this.devices.map(
                d => d.address
            );

        return addresses.find(
            a => !used.includes(a)
        );
    }

    getTotalPins() {

        return this.devices.reduce(
            (sum, d) =>
                sum + d.pins.length,
            0
        );
    }

    getUsedPins() {

        return this.devices.reduce(
            (sum, d) =>
                sum + d.usedPins.length,
            0
        );
    }

    getFreePins() {

        return this.devices.flatMap(
            d => d.getFreePins()
        );
    }
}