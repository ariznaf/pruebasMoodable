/*
 * Copyright (c)2020 Fernando Ariznavarreta
 *
 * Test for reading values from BME280 sensor through SMBUS
 *
 */

import Timer from "timer";
import BME280 from "./bme280";

let sensor = new BME280.Sensor();
let id= sensor.ID;
let calibrate= sensor.readCalibration(sensor);
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

    trace("status: 0b"+sensor.status.toString(2)+'\n');

    let sample= sensor.readRaw();

    trace("sensor Temperatura:"+sample.temp+'\n');
    trace("sensor Presión:"+sample.press+'\n');
    trace("sensor Humedad:"+sample.hum+'\n');

    trace("AFTER CALIBRATION:\n");
    
    let temp,t_fine;
    time= Date.now() -time;
    [temp,t_fine]= calibrate.getTemp(sample);
    trace("sensor Temperatura: "+temp/100.0+" ºC time: "+time+'\n');
    trace("sensor tfine:"+t_fine+'\n');

    time= Date.now();
    let hum= calibrate.getHum(sample,t_fine);
    time= Date.now() -time;
    trace("sensor Humidity: "+(hum/1024.0).toFixed(3)+' % time: '+time+'\n');

    time= Date.now();
    let press= calibrate.getPress(sample,t_fine);
    time= Date.now() -time;
    trace("sensor Pressure (double):"+(press/25600.0).toFixed(5)+' hPa time: '+time+'\n');

},1000);
