const ManualAllocator = {
    getAssignedExpansionDevice(component) {
        return expansionManager.getDevices().find((device) => device.id === component.assignedDevice);
    },

    allocateManualSinglePin(component) {
        const device = this.getAssignedExpansionDevice(component);

        if (!device) {
            return null;
        }

        const pin = component.manualPin;

        if (device.usedPins.includes(pin)) {
            return null;
        }

        device.allocatePin(pin);

        return {
            device,
            pins: [pin],
        };
    },

    allocateManualDualPins(component) {
        const device = this.getAssignedExpansionDevice(component);

        if (!device) {
            return null;
        }

        const pinA = component.manualPinA;
        const pinB = component.manualPinB;

        if (pinA === pinB) {
            return null;
        }

        if (device.usedPins.includes(pinA)) {
            return null;
        }

        if (device.usedPins.includes(pinB)) {
            return null;
        }

        device.allocatePin(pinA);
        device.allocatePin(pinB);

        return {
            device,
            pins: [pinA, pinB],
        };
    },

    allocateManualMultiplePins(component) {
        const device = this.getAssignedExpansionDevice(component);

        if (!device) {
            return null;
        }

        const pins = component.manualPins || [];

        const uniquePins = [...new Set(pins)];

        if (uniquePins.length !== pins.length) {
            return null;
        }

        for (const pin of pins) {
            if (device.usedPins.includes(pin)) {
                return null;
            }
        }

        for (const pin of pins) {
            device.allocatePin(pin);
        }

        return {
            device,
            pins,
        };
    },
};
