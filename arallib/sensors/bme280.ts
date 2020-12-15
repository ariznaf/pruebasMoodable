import  *  as Driver  from "aral/drivers/bme280";
import Timer from "timer";

interface Sample {
    temp:number;
    hum:number;
    pres:number;
}
const enum Mode {
    sleep=0,
    forced=1,
    normal=3
}
interface Config {
    enable?: {
        temp:boolean,
        pres:boolean,
        hum: boolean
    },
    oversamp?: {
        temp:number,
        pres:number,
        hum:number
    }
    filter?: number,
    interval?:number,
    spi3w?:boolean,
    mode?: Mode
}

class Sensor  {
    #device: Driver.Device= null;
    #cfg:Driver.DeviceConfig= null;
    #calib:Driver.Calibrate= null;
    constructor(dict:Object=undefined) {
        if (dict instanceof Driver.Device) this.#device= dict;
        else this.#device= new Driver.Device(dict);
    }
    get device() {
        return this.#device;
    }
    config(dict?:Config) {
        if( dict== undefined || dict == null) {
            if(this.#cfg==null) this.#cfg= this.#device.readConfigs();
            else this.#device.writeConfigs(this.#cfg);
            return;
        };
        this.#cfg= this.#device.readConfigs();
        if( dict.enable) this.enable= dict.enable;
        if( dict.oversamp) this.overSampling= dict.oversamp;
        if( dict.filter) this.filter= dict.filter;
        if( dict.interval) this.interval= dict.interval;
        if( dict.spi3w) this.spi3w= dict.spi3w;
        if( dict.mode) this.mode= dict.mode;
        this.#device.writeConfigs(this.#cfg);
    }
    set enable(value:Config["enable"]){
        this.#cfg.overSampHum= value.hum?Driver.OVERSAMP.X1:Driver.OVERSAMP.SKIP;
        this.#cfg.overSampPress= value.pres?Driver.OVERSAMP.X1:Driver.OVERSAMP.SKIP;
        this.#cfg.overSampTemp= value.temp?Driver.OVERSAMP.X1:Driver.OVERSAMP.SKIP;
    }
    get enable() : Config["enable"] {
        let res:Config["enable"]= {
            temp: (this.#cfg.overSampTemp!=Driver.OVERSAMP.SKIP),
            pres: (this.#cfg.overSampPress!=Driver.OVERSAMP.SKIP),
            hum: (this.#cfg.overSampHum!=Driver.OVERSAMP.SKIP)
        }
        return res;
    }
    set overSampling(value:Config["oversamp"]) {
        let v= value.hum;
        if( v<= 0) v=0
        else v= v>16?Math.round(Math.log2(v))+1:4;      
        this.#cfg.overSampHum= v;
        v= value.pres;
        if( v<= 0) v=0
        else v= v>16?Math.round(Math.log2(v))+1:4;      
        this.#cfg.overSampPress= v;
        v= value.temp;
        if( v<= 0) v=0
        else v= v>16?Math.round(Math.log2(v))+1:4;      
        this.#cfg.overSampTemp= v;
    }
    get overSampling():Config["oversamp"] {
        let res:Config["oversamp"];
        let v= this.#cfg.overSampTemp;
        res.temp= v==0?0: 1<<(v-1);
        v= this.#cfg.overSampHum;
        res.hum= v==0?0: 1<<(v-1);
        v= this.#cfg.overSampPress;
        res.pres= v==0?0: 1<<(v-1);
        return res;
    }
    set filter(value:Config["filter"]){
        this.#cfg.filter= value<=1?0:value>=16?4:Math.round(Math.log2(value));

    }
    get filter():Config["filter"] {
        return 1<<this.#cfg.filter;
    }
    set interval(value:Config["interval"]) {

    }
    set spi3w(value:Config["spi3w"]) {
        this.#cfg.spi3wEnable= value;
    }
    get spi3w():Config["spi3w"] {
        return this.#cfg.spi3wEnable;
    }
    set mode(value:Config["mode"]) {
        this.#cfg.mode= value;
    }
    get mode():Config["mode"]{
        return this.#cfg.mode;
    }

    read():Promise<Sample>{
        return new Promise((resolve,reject) => {
        if(this.#cfg===null) this.#cfg= this.#device.readConfigs();
        //Perform a read in forced mode.
        if(this.#cfg.mode== Driver.MODE.FORCED) 
            this.#cfg.forceRead(this.#device);

        //wait for a measure to be available and read it when it is.
        let i=0;
        Timer.set(()=>{
            //If not available after 5 times, abort with error.
            if( i==5) {
                //If a reject method has been passed, use reject, if not, throw an exception.
                let err= new Error("Timeout waiting for BME280 device to finish measuring.")
                if (reject != null) reject(err);
                else throw(err);
                return;
            }
            i++;
            //If still reading sample, wait for next try.
            if( this.#device.isMeasuring) return;
            //Sample ready, read it an return the sample as resolved promise.
            let rawsamp= this.#device.readRaw();
            let sample= <Sample>{}, t_fine:number;
            if(this.#calib===null) this.#device.readCalibration();
    
            [sample.temp,t_fine]= this.#calib.getTemp(rawsamp);
            sample.hum= this.#calib.getHum(rawsamp,t_fine);
            sample.pres= this.#calib.getPress(rawsamp,t_fine);
            sample.temp/=100.;
            sample.hum/=1024.;
            sample.pres/=1600.;
            resolve(sample);
        },0,10);
        });
    }
}

export {Sensor , Config, Mode, Sample};
