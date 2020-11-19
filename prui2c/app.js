import Timer from "timer";
import SMBUS from "pins/smbus";

const ADDRESS= 0x76;

const REG = {
    ID: 0xD0,
    RESET: 0xE0,
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
const RESET_CODE = 0xB6;
const MODE = {
    SLEEP: 0x00,
    FORCED: 0x01,
    NORMAL: 0x10
}

debugger;

let sensor = new SMBUS({address: ADDRESS});
let id= sensor.readByte(REG.ID);
trace("sensor id: 0x"+id.toString(16).toString(2)+'\n');
trace("status: 0b"+(sensor.readByte(REG.STATUS)&0x0F).toString(2)+'\n');
//Configure sensor as one time  (forced mode)
sensor.writeByte(REG.CTRL_MEAS,0x24| MODE.FORCED);
sensor.write(REG.CTRL_HUM,1);
//Status should be measuring
trace("status: 0b"+(sensor.readByte(REG.STATUS)&0x0F).toString(2)+'\n');

//wait for a measure to be available.
for(;;) {
    if( sensor.readByte(REG.CONFIG)&MODE.FORCED) break;
}

trace("status: 0b"+(sensor.readByte(REG.STATUS)&0x0F).toString(2)+'\n');
debugger;
let buffer= sensor.readBlock(REG.PRES,8);
let rawpress= (buffer[0]<<12|buffer[1]<<4)|buffer[2]>>4;
let rawtemp= (buffer[3]<<12|buffer[4]<<4)|buffer[5]>>4;
let rawhum= (buffer[6]<<8)| buffer[7];
trace("sensor Temperatura:"+rawtemp+'\n');
trace("sensor Presión:"+rawpress+'\n');
trace("sensor Humedad:"+rawhum+'\n');

debugger;


