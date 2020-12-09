import * as BME280 from "bme280";
import Timer from "timer";

debugger;

let sensor = new BME280.Sensor();
let id= sensor.ID;
trace("sensor id: 0x"+id.toString(16)+'\n');
if (!sensor.checkID()) {
    Error("### Device connected to the given I2C address is not a BME280")
}
trace("status: 0b"+sensor.status.toString(2)+'\n');

let rawspl= sensor.readRaw();
trace("Raw temperature read: "+rawspl.temp+"\n");
trace("Raw presssure read: "+rawspl.press+"\n");
trace("Raw humidity  read: "+rawspl.hum+"\n");
let calibrate= sensor.readCalibration(true);
Timer.repeat( id=> {
    //Write to CTRL_HUM must be made before setting CTRL_MEAS, 
    //and CTRL_MEAS must be written for changes  to become effective.
    sensor.write(BME280.CONFIG.REG.CTRL_HUM,1);
    //Configure sensor as one time  (forced mode)
    sensor.writeByte(BME280.CONFIG.REG.CTRL_MEAS,0x24| BME280.CONFIG.MODE.FORCED);
    //Status should be measuring
    trace("status: 0b"+(sensor.readByte(BME280.CONFIG.REG.STATUS)&0x0F).toString(2)+'\n');

    //wait for a measure to be available.
    for(;;) {
        if( sensor.readByte(BME280.CONFIG.REG.CTRL_MEAS)& BME280.CONFIG.MODE.FORCED) break;
    }

    trace("status: 0b"+sensor.status.toString(2)+'\n');

    let sample= sensor.readRaw();

    trace("sensor Temperatura:"+sample.temp+'\n');
    trace("sensor Presión:"+sample.press+'\n');
    trace("sensor Humedad:"+sample.hum+'\n');

    trace("AFTER CALIBRATION:\n");
    
    let temp,t_fine;
    [temp,t_fine]= calibrate.getTemp(sample);
    trace("sensor Temperatura: "+temp/100.0+" ºC\n");
    trace("sensor tfine:"+t_fine+'\n');

    let hum= calibrate.getHum(sample,t_fine);
    trace("sensor Humidity: "+(hum/1024.0).toFixed(2)+" %\n");

    let press= calibrate.getPress(sample,t_fine);
    trace("sensor Pressure:"+(press/1600.0).toFixed(3)+" hPa\n");

},1000);