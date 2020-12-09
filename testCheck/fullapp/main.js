import * as BME280 from "bme280";

debugger;

let sensor = new BME280.Sensor();
let id= sensor.ID;
trace("sensor id: 0x"+id.toString(16)+'\n');
if (!sensor.checkID()) {
    Error("Device connected to the given I2C address is not a BME280")
}

