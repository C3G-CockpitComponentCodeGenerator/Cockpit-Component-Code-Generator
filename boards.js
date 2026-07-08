const BOARDS = {

    PROMICRO: {

        id: "PROMICRO",

        name: "Arduino Pro Micro",

        gpioPins: [
            0,1,2,3,4,5,6,7,8,9,10,
            14,15,16,
            18,19,20,21
        ],

        pwmPins: [
            3,5,6,9,10
        ],

        analogPins: [
            {
                analog: "A0",
                digital: 18
            },
            {
                analog: "A1",
                digital: 19
            },
            {
                analog: "A2",
                digital: 20
            },
            {
                analog: "A3",
                digital: 21
            }
        ],

        encoderPreferredPins: [
            0,1,
            2,3,
            18,19,
            20,21
        ],

        spi: {

            miso: 14,
            sck: 15,
            mosi: 16

        },

        displayCSPins: [
    10,9,8,7,6,5,4
],

        i2c: {

            sda: 2,
            scl: 3

        },

        recommended: {

            encoders: 4,

            displays: 2,

            max7219: 4,

            mcp23017: 4,
            
            axis: 4

        }
    },

    MEGA2560: {

        id: "MEGA2560",

        name: "Arduino Mega 2560",

        gpioPins: Array.from(
            { length: 54 },
            (_, i) => i
        ),

        pwmPins: [
            2,3,4,5,6,7,8,
            9,10,11,12,13,
            44,45,46
        ],

        analogPins: [

            { analog:"A0", digital:54 },
            { analog:"A1", digital:55 },
            { analog:"A2", digital:56 },
            { analog:"A3", digital:57 },

            { analog:"A4", digital:58 },
            { analog:"A5", digital:59 },
            { analog:"A6", digital:60 },
            { analog:"A7", digital:61 },

            { analog:"A8", digital:62 },
            { analog:"A9", digital:63 },
            { analog:"A10", digital:64 },
            { analog:"A11", digital:65 },

            { analog:"A12", digital:66 },
            { analog:"A13", digital:67 },
            { analog:"A14", digital:68 },
            { analog:"A15", digital:69 }

        ],

        encoderPreferredPins: [

            2,3,
            18,19,
            20,21

        ],

        spi: {

            miso: 50,
            mosi: 51,
            sck: 52

        },

        displayCSPins: [
    53,
    49,
    48,
    47,
    46,
    45,
    44,
    43
],

        
        i2c: {

            sda: 20,
            scl: 21

        },

        recommended: {

            encoders: 12,

            displays: 4,

            max7219: 8,

            mcp23017: 8,

            axis: 16

        }
    },

    MEGA2560PRO: {

        id: "MEGA2560PRO",

        name: "Mega 2560 Pro Mini",

        gpioPins: Array.from(
            { length: 54 },
            (_, i) => i
        ),

        pwmPins: [
            2,3,4,5,6,7,8,
            9,10,11,12,13,
            44,45,46
        ],

        analogPins: [

            { analog:"A0", digital:54 },
            { analog:"A1", digital:55 },
            { analog:"A2", digital:56 },
            { analog:"A3", digital:57 },

            { analog:"A4", digital:58 },
            { analog:"A5", digital:59 },
            { analog:"A6", digital:60 },
            { analog:"A7", digital:61 },

            { analog:"A8", digital:62 },
            { analog:"A9", digital:63 },
            { analog:"A10", digital:64 },
            { analog:"A11", digital:65 },

            { analog:"A12", digital:66 },
            { analog:"A13", digital:67 },
            { analog:"A14", digital:68 },
            { analog:"A15", digital:69 }

        ],

        encoderPreferredPins: [

            2,3,
            18,19,
            20,21

        ],

        spi: {

            miso: 50,
            mosi: 51,
            sck: 52

        },

        displayCSPins: [
    53,
    49,
    48,
    47,
    46,
    45,
    44,
    43
],

        i2c: {

            sda: 20,
            scl: 21

        },

        recommended: {

            encoders: 12,

            displays: 4,

            max7219: 8,

            mcp23017: 8,

            axis: 16

        }
    }
};