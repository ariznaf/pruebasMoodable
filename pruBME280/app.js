/*
 * Copyright (c)2020 Fernando Ariznavarreta
 *
 * Test for reading values from BME280 sensor through SMBUS
 *
 */


import Timer from "../../MisProyectos/pruebasModdable/pruBME280/test/timer";
import SMBUS from "../../MisProyectos/pruebasModdable/pruBME280/test/pins/smbus";

const ADDRESS= 0x76;

const REG = {
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
const STATUS= {
    MEASURING: 0b1000,
    IM_UPDATE: 0b1
}
const RESET = 0xB6;
const MODE = {
    SLEEP: 0x00,
    FORCED: 0x01,
    NORMAL: 0x10
}

debugger;
/**
 * Reads Temperature calibration data from address DIG_T y siguientes and returns a DataView.
 * returns: Dataview 
 * 
 * @param {SMBUS}  sensor   SMBUS object to read from the sensor.
 * @returns {Dataview} DataView to the 6 bytes ArrayBuffer of temp calibration data read from the sensor.
 * 
 * Calibration Data is composed of:
 *  pos 0-1: dig_T1 Uint16 [7:0]/[15:8]
 *  pos 2-3: dig_T2 Int16  [7:0]/[15:8]
 *  pos 4-5: dig_T3 Int16  [7:0]/[15:8]
 */
function readTempCalParams(sensor) {
    let buffer= new ArrayBuffer(6);
    sensor.readBlock(REG.DIG_T,6,buffer);
    return new DataView(buffer);

}

/**
 * Calculates Temperature in ºC*100 from raw temp data from the sensor.
 * also returns an integer representatios of temperature used in calculating pressure and humidity (t_fine)
 * 
 * @param DataView tempcal : Temperature data calibration table read previously from the device.
 * @param Number (uint16) raw : raw temperature read from the device 
 * @returns []  Array with two number.
 *   [0] (Int32) temperature parameter to pass to humidity and presscure calcutations.
 *   [1] (Int32) temperature calculated in ºC * 100
 **/
function calcTemp(tempcal,raw) {
    let dig_T1= tempcal.getUint16(0,true);
    let dig_T2= tempcal.getInt16(2,true);
    let dig_T3= tempcal.getInt16(4,true);
    let var1 = ((((raw >> 3) - (dig_T1 << 1))) * (dig_T2)) >> 11;
    let var2 = (((((raw >> 4) - (dig_T1)) * ((raw >> 4) - (dig_T1))) >> 12) * (dig_T3)) >> 14;
    let t_fine = var1 + var2;
    let final = (t_fine * 5 + 128) >> 8;
    return [final,t_fine];
}
/**
 * Reads Humidity calibration data from address DIG_H1 y DIG_H2 y siguientes and returns a DataView.
 * returns: Dataview 
 * 
 * @param SMBUS  sensor   SMBUS object to read from the sensor.
 * @returns Dataview  the 7 bytes ArrayBuffer of temp calibration data read from the sensor.
 * 
 * Calibration Data is composed of:
 *  pos 0:   dig_H1 Ubyte
 *  pos 1-2: dig_H2 Int16 [7:8]/[15:8]
 *  pos 3:   dig_H3 Ubyte
 *  pos 4-5: dig_H4 Int12 [11:4]/[3:0]
 *  pos 5-6: dig_H5 Int12 [3:0]/[11:4]
 *  pos 7:   dig_H6 byte
 */
function readHumCalcParams(sensor) {
    let buffer= new ArrayBuffer(8);
    sensor.readBlock(REG.DIG_H1,1,buffer);
    let buf2= new ArrayBuffer(buffer,1)
    sensor.readBlock(REG.DIG_H2,7,buf2.data);
    return new DataView(buffer);
}

/**
 * Calculates Humidity  in ºC*100 from raw temp data from the sensor.
 * also returns an integer representatios of temperature used in calculating pressure and humidity (t_fine)
 * 
 * @param DataView tempcal : Temperature data calibration table read previously from the device.
 * @param Number (uint16) raw : raw temperature read from the device 
 * @returns []  Array with two number.
 *   [0] (Int32) temperature parameter to pass to humidity and presscure calcutations.
 *   [1] (Int32) temperature calculated in ºC * 100
 **/

function calcHum(humcal,raw,t_fine) {
    let dig_H1= humcal.getUint8(0);
    let dig_H2= humcal.getInt16(1,true);
    let dig_H3= humcal.getUint8(3);
    let dig_H4= humcal.getInt16(4,false)>>4;
    let dig_H5= humcal.getInt16(5,true)>>4;
    let dig_H6= humcal.getUint8(7);
    let v_x1_u32r = t_fine - 76800;
    v_x1_u32r = (((((raw << 14) - (dig_H4 << 20) - (dig_H5 *v_x1_u32r)) + 16384) >> 15) * (((((((v_x1_u32r *dig_H6) >> 10)*
                (((v_x1_u32r * dig_H3) >> 11) + 32768)) >> 10) + 2097152) * dig_H2 +8192) >> 14));
    v_x1_u32r = (v_x1_u32r - (((((v_x1_u32r >> 15) * (v_x1_u32r >> 15)) >> 7) * dig_H1) >> 4));             
    v_x1_u32r = (v_x1_u32r < 0 ? 0 : v_x1_u32r);
    v_x1_u32r = (v_x1_u32r > 419430400 ? 419430400 : v_x1_u32r);
    return v_x1_u32r;
}

/**
 * Reads Pressure calibration data from address DIG_P and following and returns a DataView.
 * returns: Dataview 
 * 
 * @param {SMBUS}  sensor   SMBUS object to read from the sensor.
 * @returns {Dataview} DataView to the 6 bytes ArrayBuffer of temp calibration data read from the sensor.
 * 
 * Calibration Data is composed of:
 *  pos 0-1: dig_P1 Uint16 [7:0]/[15:8]
 *  pos 2-3: dig_P2 Int16  [7:0]/[15:8]
 *  ......
 *  pos 16-17: dig_P9 Int16  [7:0]/[15:8]
 */

//Reads Pressure calibration data and returns a DataView.
function readPresCalcParams(sensor) {
    let buffer= new ArrayBuffer(18);
    sensor.readBlock(REG.DIG_P,18,buffer);
    return new DataView(buffer);
}

/**
/**
 * Calculates Pressure in Pa*256 from raw pres data from the sensor.
 * it needs the raw calibration data from the sensor, the raw preassure and the temperature passed as 
 * 
 * @param DataView tempcal : Temperature data calibration table read previously from the device.
 * @param Number raw (int32) raw temperature read from the device 
 * @param Number t_fine parameter from temperature calibration used to calibrate pressure and humidity.
 *
 * @returns Number (int32) preassure calculated in Pa*256
 * 
 **/
function calcPresInt64(presCal,raw, t_fine)
{
    let dig_P1= presCal.getUint16(0,true); //This one is unsigned the other are signed.
    let dig_P2= presCal.getInt16(2,true);
    let dig_P3= presCal.getInt16(4,true);
    let dig_P4= presCal.getInt16(6,true);
    let dig_P5= presCal.getInt16(8,true);
    let dig_P6= presCal.getInt16(10,true);
    let dig_P7= presCal.getInt16(12,true);
    let dig_P8= presCal.getInt16(14,true);
    let dig_P9= presCal.getInt16(16,true);
    //Be sure var1 and var2 are 64 bits.
    let var1,var2, pressure;
    var1 = t_fine - 128000;
    var2 = var1 * var1 * dig_P6;
    var2 = var2 + ((var1 * dig_P5) << 17);
    var2 = var2 + (dig_P4 << 35);
    var1 = ((var1 * var1 * dig_P3) >> 8) + ((var1 * dig_P2) << 12);
    var1 = (((1 << 47) + var1)) * dig_P1 >> 33;
    if (var1 == 0) return Infinity;   // Don't divide by zero.
    pressure   = 1048576 - raw;
    pressure = (((pressure << 31) - var2) * 3125)/var1;
    var1 = (dig_P9 * (pressure >> 13) * (pressure >> 13)) >> 25;
    var2 = (dig_P8 * pressure) >> 19;
    pressure = ((pressure + var1 + var2) >> 8) + (dig_P7 << 4);
    return pressure;
  
}

function calcPres(presCal,raw, t_fine)
{
    let dig_P1= presCal.getUint16(0,true); //This one is unsigned the other are signed.
    let dig_P2= presCal.getInt16(2,true);
    let dig_P3= presCal.getInt16(4,true);
    let dig_P4= presCal.getInt16(6,true);
    let dig_P5= presCal.getInt16(8,true);
    let dig_P6= presCal.getInt16(10,true);
    let dig_P7= presCal.getInt16(12,true);
    let dig_P8= presCal.getInt16(14,true);
    let dig_P9= presCal.getInt16(16,true);
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
    
    p = 256* p + (var1 + var2 + dig_P7) * 16.0;
    
    return Math.round(p); 
}

let sensor = new SMBUS({address: ADDRESS});
let id= sensor.readByte(REG.ID);
trace("sensor id: 0x"+id.toString(16).toString(2)+'\n');
trace("status: 0b"+(sensor.readByte(REG.STATUS)&0x0F).toString(2)+'\n');

let tempCalData= readTempCalParams(sensor);
let presCalData= readPresCalcParams(sensor);
let humCalData= readHumCalcParams(sensor);
Timer.repeat( id=> {
    //Write to CTRL_HUM must be made before setting CTRL_MEAS, 
    //and CTRL_MEAS must be written for changes  to become effective.
    sensor.write(REG.CTRL_HUM,1);
    //Configure sensor as one time  (forced mode)
    sensor.writeByte(REG.CTRL_MEAS,0x24| MODE.FORCED);
    //Status should be measuring
    trace("status: 0b"+(sensor.readByte(REG.STATUS)&0x0F).toString(2)+'\n');

    //wait for a measure to be available.
    for(;;) {
        if( sensor.readByte(REG.CTRL_MEAS)&MODE.FORCED) break;
    }

    trace("status: 0b"+(sensor.readByte(REG.STATUS)&0x0F).toString(2)+'\n');

    let buffer= new ArrayBuffer(8);
    sensor.readBlock(REG.PRES,8,buffer);
    let data= new DataView( buffer);
    let rawpress= data.getUint32(0,false)>>12;
    let rawtemp= data.getUint32(3,false)>>12;
    let rawhum= data.getUint16(6,false);
    //free the used buffers
    buffer= data= undefined;

    trace("sensor Temperatura:"+rawtemp+'\n');
    trace("sensor Presión:"+rawpress+'\n');
    trace("sensor Humedad:"+rawhum+'\n');

    trace("AFTER CALIBRATION:\n");
    
    let temp;
    let t_fine;
    [temp,t_fine] = calcTemp(tempCalData,rawtemp);
    let press= calcPres(presCalData,rawpress,t_fine);
    let hum= calcHum(humCalData,rawhum,t_fine);

    trace("sensor Temperatura: "+temp/100.0+' ºC\n');
    trace("sensor tfine:"+t_fine+'\n');
    trace("sensor Humidity: "+hum/1024.0+' %\n');
    trace("sensor Pressure (double):"+press/25600.0+' hPa\n');
    press= calcPresInt64(presCalData,rawpress,t_fine);
    trace("sensor Pressure (int64):"+press/25600.0+' hPa\n');
},1000);
