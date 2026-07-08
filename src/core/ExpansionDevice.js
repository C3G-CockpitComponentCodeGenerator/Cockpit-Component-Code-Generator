class ExpansionDevice {

    constructor(config) {

        this.id = config.id;
        this.type = config.type;
        this.name = config.name;
        this.communication = config.communication;

        this.pins = [];
        this.usedPins = [];
    }

    getFreePins() {

        return this.pins.filter(
            pin => !this.usedPins.includes(pin)
        );
    }

    allocatePin(pin) {

        if (!this.usedPins.includes(pin)) {

            this.usedPins.push(pin);

            return true;
        }

        return false;
    }

    releasePin(pin) {

        this.usedPins =
            this.usedPins.filter(
                p => p !== pin
            );
    }

    resetPins() {

        this.usedPins = [];
    }

    getUsage() {

        return {

            used:
                this.usedPins.length,

            total:
                this.pins.length
        };
    }
}