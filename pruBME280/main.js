import * as BME280 from "bme280";
import Timer from "timer";

debugger;

let device = new BME280.Device();
let id= device.ID;
trace("device id: 0x"+id.toString(16)+'\n');
if (!device.checkID()) {
    Error("### Device connected to the given I2C address is not a BME280")
}
trace("status: 0b"+device.status.toString(2)+'\n');

let rawspl= device.readRaw();
trace("Raw temperature read: "+rawspl.temp+"\n");
trace("Raw presssure read: "+rawspl.press+"\n");
trace("Raw humidity  read: "+rawspl.hum+"\n");
let calibrate= device.readCalibration(true);
Timer.repeat( id=> {
    //Write to CTRL_HUM must be made before setting CTRL_MEAS, 
    //and CTRL_MEAS must be written for changes  to become effective.
    device.write(BME280.DEFINES.REG.CTRL_HUM,1);
    //Configure device as one time  (forced mode)
    device.writeByte(BME280.DEFINES.REG.CTRL_MEAS,0x24| BME280.DEFINES.MODE.FORCED);
    //Status should be measuring
    trace("status: 0b"+(device.readByte(BME280.DEFINES.REG.STATUS)&0x0F).toString(2)+'\n');

    //wait for a measure to be available.
    for(;;) {
        if( device.readByte(BME280.DEFINES.REG.CTRL_MEAS)& BME280.DEFINES.MODE.FORCED) break;
    }

    trace("status: 0b"+device.status.toString(2)+'\n');

    let sample= device.readRaw();

    trace("device Temperatura:"+sample.temp+'\n');
    trace("device Presión:"+sample.press+'\n');
    trace("device Humedad:"+sample.hum+'\n');

    trace("AFTER CALIBRATION:\n");
    
    let temp,t_fine;
    [temp,t_fine]= calibrate.getTemp(sample);
    trace("device Temperatura: "+temp/100.0+" ºC\n");
    trace("device tfine:"+t_fine+'\n');

    let hum= calibrate.getHum(sample,t_fine);
    trace("device Humidity: "+(hum/1024.0).toFixed(2)+" %\n");

    let press= calibrate.getPress(sample,t_fine);
    trace("device Pressure:"+(press/1600.0).toFixed(3)+" hPa\n");

},1000);