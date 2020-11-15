import MQTT from "mqtt";
import Net from "net";
import ColorLed from "components/colorled";
import Color from "util/rgbcolor";
debugger;

let cled= new ColorLed();
cled.color.setColor(0,1023,0)


let mqttReady = false;

let mqtt = new MQTT({
	host: "router.casa",
	port: 1883,	
	id: "iot_" + Net.get("MAC")
})
mqtt.onReady = function () {
	trace("connection established\n");
	mqttReady=true;
	mqtt.subscribe("test/ledColor/+");
	mqtt.publish("test/ledColor", JSON.stringify(cled.color));
}


mqtt.onMessage = function (topic, data) {
	trace(`received message on topic "${topic}"\n`);
	//let msg= `${String.fromArrayBuffer(data)}\n`;
	trace(String.fromArrayBuffer(data));
	let msg= JSON.parse(String.fromArrayBuffer(data));
	cled.color.setColor(msg.r,msg.g,msg.b);
	mqtt.publish("test/ledColor", JSON.stringify(cled.color));
}

mqtt.onClose = function() {
	trace("connection lost\n");
	mqttReady= false;
};


cled.flash(1000);

