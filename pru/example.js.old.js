/*
 * Copyright (c) 2016-2020 Moddable Tech, Inc.
 *
 *   This file is part of the Moddable SDK.
 * 
 *   This work is licensed under the
 *       Creative Commons Attribution 4.0 International License.
 *   To view a copy of this license, visit
 *       <http://creativecommons.org/licenses/by/4.0>
 *   or send a letter to Creative Commons, PO Box 1866,
 *   Mountain View, CA 94042, USA.
 *
 */

import { trace } from "console";
import MQTT from "mqtt";
import Net from "net";
import PWM from "pins/pwm";
import Timer from "timer";
debugger;

let mqttReady = false;
let r = new PWM({ pin: 12 });
let g = new PWM({ pin: 13 });
let b = new PWM({ pin: 14 });
let color = {
	r: 256,
	g: 1023,
	b: 512
}
let flashInterval= 1000;
let flashState= 2;

let mqtt = new MQTT({
	host: "router.casa",
	port: 1883,	
	id: "iot_" + Net.get("MAC")
})
function flashingOn()
{
	flashState= 1;
	Timer.set(id => {
		if(flashState === 1) {
			r.write(color.r);
			g.write(color.g);
			b.write(color.b);
			flashState= 0;
		} else if(flashState === 0) {
			r.write(1023);
			g.write(1023);
			b.write(1023);
			flashState= 1;
		} else Timer.clear(id);
	},flashInterval);
}
function flashingOff()
{
	flashState= 2;
}
mqtt.onReady = function () {
	trace("connection established\n");
	mqttReady=true;
	mqtt.subscribe("test/ledColor/+");
	mqtt.publish("test/ledColor", JSON.stringify(color));
}


mqtt.onMessage = function (topic, data) {
	trace(`received message on topic "${topic}"\n`);
	//let msg= `${String.fromArrayBuffer(data)}\n`;
	trace(String.fromArrayBuffer(data));
	let msg= JSON.parse(String.fromArrayBuffer(data));
	trace(msg);
	color.r= data.r;
	color.g= data.g;
	color.b= data.b;
	mqtt.publish("test/ledColor", JSON.stringify(color));

}

mqtt.onClose = function() {
	trace("connection lost\n");
	mqttReady= false;
};

flashingOn();

