import {Sensor, Config, Mode, Sample} from "../bme280";

let sensor= new Sensor();

function showSample(sample:Sample) {
    trace("Temperature: "+sample.temp+" ºC");
    trace("Humidity: "+sample.hum+" %");
    trace("Preassure: "+sample.pres+" hPa");

}
sensor.config({
    enable: {
        temp: true,
        pres: true,
        hum: true
    },
    mode: Mode.forced
});

sensor.read().then(showSample);


