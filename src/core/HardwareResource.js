class HardwareResource {
    constructor(provider, identifier) {
        this.provider = provider;
        this.identifier = identifier;

        Object.freeze(this);
    }

    get id() {
        return `${this.provider}:${this.identifier}`;
    }

    toString() {
        return this.id;
    }
}
