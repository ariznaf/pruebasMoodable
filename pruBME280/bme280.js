import SMBUS from "pins/smbus";
debugger;
const CONFIG = Object.freeze({
    ADDRESS: 0x76,
    ALTADDRESS:  0x77,
    CHPID: 0x60,
    RESETCODE : 0xB6,
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
    },
    STATUS : {
        MEASURING: 0b1000,
        IM_UPDATE: 0b1
    },
    MODE : {
        SLEEP: 0x00,
        FORCED: 0x01,
        NORMAL: 0x10
    }
},true);

/**
 * @description Implements driver to access BME280 data, a sensor that provides high precision temperature, pression and humidity.
 * @class BME280
 * @extends SMBUS
 */
class Sensor extends SMBUS {
    /**
     * @description Creates a I2C connection with the sensor.
     * BME280 may Have two different adresses fixed by wiring: CONFIG.ADDRESS (0x76) of CONFIG.ALTADDRESS (0x77).
     * 
     * If no address is give, it uses 0x76 that is the default address of the device.
     * 0x77 is used too by the BMP280, which is compatible with BME280 but has no Humidity registers.
     * @param {Number} dict {Object} SMBUS dictionary with options to configure SMBUS. I none is passed, one is created with the default address.
     * Is passed dictrionary has no address entry, one is created with default address.
     * 
     */
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
        return this.readByte(CONFIG.REG.ID);
    }

    /**
     * @description checks if the chip ID at the I2C address is a BME280
     * @returns {boolean} true if the chip is a BME280, false otherwise
     */
    checkID() {
        return this.ID == CONFIG.CHPID;
    }

    /**
     * @description Gets the status register from the device.
     * @returns {} Returns the status register of the BM
     */
    get status() {
        return(this.readByte(CONFIG.REG.STATUS));
    }

    /**
     * Read all channels from the sensor
     */
    readRaw() {
        return new RawSample(this);
    }
    /**
     * Resets the chip to poweron state.
     */
    reset()
    {
        this.writeByte(CONFIG.REG.RESET,CONFIG.RESETCODE);
    }
        /**
     * @description Reads Temperature calibration data from sensor and returns a TempCal object.
     * 
     * @returns {TempCal} object  with temperature calibration data from the sensor. Use it to convert raw data to engineering units.
     */
    readCalibration(press=false) {
        return new Calibrate(this,press);
    }
}
Object.freeze(Sensor,true);

class RawSample {
    #data;
    constructor( sensor ) {
        let buffer= new ArrayBuffer(8);
        sensor.readBlock(CONFIG.REG.PRES,8,buffer);
        this.#data= new DataView( buffer);
    }
    get press() {
        let rawpress= this.#data.getUint32(0,false)>>12;
        //If the sensor is not configured to read pressure, it returns 0x8000, let's convert it to NAN
        trace("rawpress: "+rawpress.toString(16)+"\n");
        if( rawpress == -0x8_0000 ) rawpress= Number.NaN;
        return rawpress;
    }
    get  temp() {
        let rawtemp= this.#data.getUint32(3,false)>>12;
        //If the sensor is not configured to read temperature, it returns 0x800, let's convert it to NAN
        trace("rawtemp: "+rawtemp.toString(16)+"\n");
        if( rawtemp == -0x8_0000 ) rawtemp= Number.NaN;
        return rawtemp;
    }
    get hum() {
        let rawhum= this.#data.getUint16(6,false);
        //If the sensor is not configured to read humidity, it returns 0x8000, let's convert it to NAN
        trace("rawhum: "+rawhum.toString(16)+"\n");
        if( rawhum == 0x8000) rawhum= Number.NaN;
        return rawhum;
    }
}
Object.freeze(RawSample,true);

/**
* Positions of the calibration parameters in the buffer read from the Calibration table of the device.
*  pos 0-1:    dig_T1 Uint16 [7:0]/[15:8]
*  pos 2-3:    dig_T2 Int16  [7:0]/[15:8]
*  pos 4-5:    dig_T3 Int16  [7:0]/[15:8]
*  pos 6:      dig_H1 Ubyte
*  pos 7-8:    dig_H2 Int16 [7:8]/[15:8]
*  pos 9:      dig_H3 Ubyte
*  pos 10-11:  dig_H4 Int12 [11:4]/[3:0]
*  pos 11-12:  dig_H5 Int12 [3:0]/[11:4]
*  pos 13:     dig_H6 byte
*  pos 14-15:  dig_P1 Uint16 [7:0]/[15:8]
*  pos 16-17:  dig_P2 Int16 [7:0]/[15:8]
*  pos 18-19:  dig_P3 Int16 [7:0]/[15:8]
*  pos 20-21:  dig_P4 Int16 [7:0]/[15:8]
*  pos 22-23:  dig_P5 Int16 [7:0]/[15:8]
*  pos 24-25:  dig_P6 Int16 [7:0]/[15:8]
*  pos 26-27:  dig_P7 Int16 [7:0]/[15:8]
*  pos 28-29:  dig_P8 Int16 [7:0]/[15:8]
*  pos 30-31:  dig_P9 Int16 [7:0]/[15:8]
*/
const CALDIG = Object.freeze({
    dig_T1: 0,
    dig_T2: 2,
    dig_T3: 4,
    dig_H1: 6,
    dig_H2: 7,
    dig_H3: 9,
    dig_H4: 10,
    dig_H5: 11,
    dig_P1: 13,
    dig_P2: 15,
    dig_P3: 17,
    dig_P4: 19,
    dig_P5: 21,
    dig_P6: 23,
    dig_P7: 25,
    dig_P8: 27,
    dig_P9: 29
},true);


/**
 * @description This class is used to implement reading temperature calibration data from the sensor, and apply the
 * calibration params to the raw temperature data read from the sensor and transform it to engineering units.
 */
class Calibrate {
    //Dataview of 31 bytes (13 if pressure is not read) read from the sensor wit calibration data.
    #param=null;
    /**
    * @description Reads Temperature calibration data from address DIG_T and saves them internally for calibration in a
    * DataView of a buffer of 31 bytes (13 if pressure is not read).
    * @param {Sensor}  sensor   to be read.
    * @param {boolean} press true if pressure calibration params is to be read too (default: false). Temperature and humidity params are alway read.
    */
    constructor(sensor,press=false) {
        let buffer= new ArrayBuffer(press?31:13);
        let data= new Uint8Array(buffer);
        //read temperature parameters to the param 
        sensor.readBlock(CONFIG.REG.DIG_T,6,buffer);

        //read humidity params and copy it to the corresponding param table positions.
        //read the single byte dig_H1 and copy it directly to the corresponding buffer position.
        data[CALDIG.dig_H1]=sensor.readByte(CONFIG.REG.DIG_H1);

        //Read rest of parameters (dig_H2 to dig_H6) in a buffer and copy them to the appropiate buffer position.
        let newbuf= sensor.readBlock(CONFIG.REG.DIG_H2,6);
        data.set(newbuf,CALDIG.dig_H2);


        //If press calibration data is to be read, read it from the sensor and copy it to the destination table.
        if(press) {
            newbuf= sensor.readBlock(CONFIG.REG.DIG_P,18);
            data.set(newbuf,CALDIG.dig_P1)
        }
        this.#param= new DataView(buffer);
    }
    /**
     * @description Calculates Temperature in ºC from raw temp data from the sensor.
     * also returns an integer representatios of temperature used in calculating pressure and humidity (t_fine)
     * 
     * @param {RawSample} raw : raw temperature read from the device 
     * @returns {Array}  Array with two numbers:
     *   [0] (Number) temperature (int32) calculated in ºC*100 in integer form (100 represents 1 ºC)
     *   [1] (Number) temperature (int32) parameter to pass to humidity and pressure calcutations.
     **/
    getTemp(rawSample) {
        let raw= rawSample.temp;
        if(raw == Number.NaN) return Number.NaN;
        let dig_T1= this.#param.getUint16(CALDIG.dig_T1,true);
        let dig_T2= this.#param.getInt16(CALDIG.dig_T2,true);
        let dig_T3= this.#param.getInt16(CALDIG.dig_T3,true);
        let var1 = ((((raw >> 3) - (dig_T1 << 1))) * (dig_T2)) >> 11;
        let var2 = (((((raw >> 4) - (dig_T1)) * ((raw >> 4) - (dig_T1))) >> 12) * (dig_T3)) >> 14;
        let t_fine = var1 + var2;
        let final = (t_fine * 5 + 128) >> 8;
        return [final,t_fine];
    }
    /**
     * @description Calculates Humidity  in % from raw temp data from the sensor (and the t_fine value)
     * also returns an integer representatios of temperature used in calculating pressure and humidity (t_fine)
     * 
     * @param {RawSample} raw (uint16) raw : raw temperature read from the device 
     * @param {Number} t_fine (int16) The t_fine temperature param returned previously by readTemp used in calibrations calculus.
     * @returns {Number} Humidity (int32) in %*1024 in integer form (1024 represents 1% humidity, NAN if sensor is not configured to read humidity)
     **/
    getHum(rawSample,t_fine) {
        let raw= rawSample.hum;
        if(raw== Number.NaN) return Number.NaN;
        let dig_H1= this.#param.getUint8(CALDIG.dig_H1);
        let dig_H2= this.#param.getInt16(CALDIG.dig_H2,true);
        let dig_H3= this.#param.getUint8(CALDIG.dig_H3);
        let dig_H5= this.#param.getInt16(CALDIG.dig_H5,true)>>4;
        this.#param.setUint8(CALDIG.dig_H5,this.#param.getUint8(CALDIG.dig_H5)<<4);
        let dig_H4= this.#param.getInt16(CALDIG.dig_H4,false)>>4;
        let dig_H6= this.#param.getUint8(CALDIG.dig_H6);

        let var1 = t_fine - 76800;
        var1 = (((((raw << 14) - (dig_H4 << 20) - (dig_H5 *var1)) + 16384) >> 15) * (((((((var1 *dig_H6) >> 10)*
                    (((var1 * dig_H3) >> 11) + 32768)) >> 10) + 2097152) * dig_H2 +8192) >> 14));
        var1 = (var1 - (((((var1 >> 15) * (var1 >> 15)) >> 7) * dig_H1) >> 4));             
        var1 = (var1 < 0 ? 0 : var1);
        var1 = (var1 > 419430400 ? 419430400 : var1);
        return (var1>>12);
    }

    /**
     * @description Calculates Pressure in hPafrom raw temp data from the sensor (and the t_fine value)
     * also returns an integer representatios of temperature used in calculating pressure and humidity (t_fine)
     * 
     * @param {Number} raw (uint16) raw : raw temperature read from the device 
     * @param {Number} t_fine (int16) The t_fine temperature param returned previously by readTemp used in calibrations calculus.
     * @returns {Number} Pressure (int32) in Pa*16  (16 represent 1 Pa, NAN if sensor is not configured to read humidity or pressure calibration parameters have not been read)
     **/
    getPress(rawSample,t_fine) {
        let raw= rawSample.press;
        if((raw== Number.NaN)||(this.#param.byteCount < 31)) return Number.NaN;

        let dig_P1= this.#param.getUint16(CALDIG.dig_P1,true); //This one is unsigned the other are signed.
        let dig_P2= this.#param.getInt16(CALDIG.dig_P2,true);
        let dig_P3= this.#param.getInt16(CALDIG.dig_P3,true);
        let dig_P4= this.#param.getInt16(CALDIG.dig_P4,true);
        let dig_P5= this.#param.getInt16(CALDIG.dig_P5,true);
        let dig_P6= this.#param.getInt16(CALDIG.dig_P6,true);
        let dig_P7= this.#param.getInt16(CALDIG.dig_P7,true);
        let dig_P8= this.#param.getInt16(CALDIG.dig_P8,true);
        let dig_P9= this.#param.getInt16(CALDIG.dig_P9,true);
        //Be sure var1 and var2 are 64 bits.
        let var1,var2, p;
        var1 = (t_fine/2.0) - 64000.0;
        var2 = var1 * var1 * dig_P6 / 32768.0;
        var2 = var2 + var1 * dig_P5 * 2.0;
        var2 = (var2/4.0)+ (dig_P4 * 65536.0);
        var1 = ((dig_P3) * var1 * var1 / 524288.0 + dig_P2 * var1) / 524288.0;
        var1 = (1.0 + var1 / 32768.0)*dig_P1;
        
        if (var1 == 0.0) return Infinity; // avoid exception caused by division by zero
            
        p = 1048576.0 - raw;
        p = (p - (var2 / 4096.0)) * 6250.0 / var1;
        var1 = dig_P9 * p * p / 2147483648.0;
        var2 = p * dig_P8 / 32768.0;
        

        return Math.round(p*16+ var1 + var2 + dig_P7);
    }
}
Object.freeze(Calibrate,true);

export {CONFIG,Sensor, RawSample, Calibrate};
