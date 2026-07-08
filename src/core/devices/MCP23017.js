
class MCP23017 extends ExpansionDevice {

    constructor(id, address) {

        super({
            id,
            type: "MCP23017",
            name: `MCP23017 (${address})`,
            communication: "I2C"
        });

        this.address = address;

        this.location = "";

        this.description = "";

        this.pins = [

            "GPA0",
            "GPA1",
            "GPA2",
            "GPA3",
            "GPA4",
            "GPA5",
            "GPA6",
            "GPA7",

            "GPB0",
            "GPB1",
            "GPB2",
            "GPB3",
            "GPB4",
            "GPB5",
            "GPB6",
            "GPB7"
        ];
    }
}