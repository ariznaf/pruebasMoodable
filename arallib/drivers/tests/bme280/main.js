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
let config= device.readConfigs();

function readSamples(count,delay) {
    for( let i= 1; i<=count; i++ ) {
        
        trace("##### Sample #"+i+"\n")
        //Perform a read in forced mode.
        if(config.mode== BME280.MODE.FORCED) 
            config.forceRead(device);

        //wait for a measure to be available.
        for(let i=0;i<5;i++){
            if( !device.isMeasuring ) break;
            Timer.delay(10);
        }
        if( i== 5) throw new Error("Timeout waiting for BME280 device to finish measuring.")

        let sample= device.readRaw();

        let temp,t_fine;
        [temp,t_fine]= calibrate.getTemp(sample);
        trace("Temperatura: "+temp/100.0+" ºC ("+sample.temp+") t_fine="+t_fine+"\n");

        let hum= calibrate.getHum(sample,t_fine);
        trace("Humidity: "+(hum/1024.0).toFixed(2)+" % ("+sample.hum+")\n");

        let press= calibrate.getPress(sample,t_fine);
        trace("Pressure:"+(press/1600.0).toFixed(3)+" hPa ("+sample.press+")\n");
        Timer.delay(delay);
    }
}
trace("#### Reading 3 samples in force mode, no filter, oversamplingx1\n ###")
config.overSampHum= BME280.OVERSAMP.X1;
config.overSampPress= BME280.OVERSAMP.X1;
config.overSampTemp= BME280.OVERSAMP.X1;
config.write(device); //or equivalent device.writeConfigs(config)
// Configure device as one time read in forced mode
config.mode= BME280.MODE.FORCED;
readSamples(3,2000);
trace("#### Reading 3 samples in force mode, no filter, oversamplingx4\n ###")
config.overSampHum= BME280.OVERSAMP.X4;
config.overSampPress= BME280.OVERSAMP.X4;
config.overSampTemp= BME280.OVERSAMP.X4;
config.write(device); //or equivalent device.writeConfigs(config)
// Configure device as one time read in forced mode
config.mode= BME280.MODE.FORCED;
readSamples(3,2000);
trace("#### Reading 3 samples in force mode, filter x 4 , oversamplingx4\n ###")
config.overSampHum= BME280.OVERSAMP.X4;
config.overSampPress= BME280.OVERSAMP.X4;
config.overSampTemp= BME280.OVERSAMP.X4;
config.filter= BME280.FILTER.X4;
config.write(device); //or equivalent device.writeConfigs(config)
// Configure device as one time read in forced mode
config.mode= BME280.MODE.FORCED;
readSamples(3,2000);
trace("#### Reading 3 samples in normal mode reading samples every second, filter off , oversamplingx1\n ###")
config.overSampHum= BME280.OVERSAMP.X1;
config.overSampPress= BME280.OVERSAMP.X1;
config.overSampTemp= BME280.OVERSAMP.X1;
config.filter= BME280.FILTER.OFF;
config.tstandby= BME280.TSTANDBY.T1000;
config.write(device); //or equivalent device.writeConfigs(config)
// Configure device as one time read in forced mode
config.mode= BME280.MODE.NORMAL;
readSamples(3,1000);
trace("### TEST FINISHED\n");
