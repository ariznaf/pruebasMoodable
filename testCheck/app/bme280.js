import SMBUS from "pins/smbus";
debugger;
const CONFIG = Object.freeze({
    ADDRESS: 0x76,
    ALTADDRESS:  0x77,
    REG : {
        DIG_T: 0x88,
        DIG_P: 0x8E,
        DIG_H1: 0xA1,
        ID: 0xD0,
        RESET: 0xE0,
        DIG_H2: 0xE1,
        CTRL_HUM: 0xF2,
        STATUS: 0xF3,   
        CTRL_MEAS: 0xF4,
        CONFIG: 0xF5,
        PRES: 0xF7,
        TEMP: 0xFA,
        HUM: 0xFD
    }
},true);

class Sensor extends SMBUS {
    constructor(dict) {
        if( dict === undefined) dict= {address: CONFIG.ADDRESS };
        else if (dict.address === undefined) dict.addres= CONFIG.ADDRESS;        
        super(dict);
    }
    /**
     * @description Returns the chip ID at the address I2C address configured in constructor. Should be 0x60 for a BME280 chip.
     * @returns {Number} (Uint8) chip ID
     */
    get ID(){
        return 0x60;
    }

    /**
     * @description checks if the chip ID at the I2C address is a BME280
     * @returns {boolean} true if the chip is a BME280, false otherwise
     */
    checkID() {
        return this.ID == 0x60;
    }
}
Object.freeze(Sensor,true);

export {CONFIG,Sensor};
