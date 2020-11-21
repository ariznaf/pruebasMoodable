import MQTT from "network/mqtt";
import Net from "net";
import Timer from "timer";
import Colorled from "aral_components/colorled";

let cled= new Colorled(12,13,14);
let flashinterval=1000;
let colorinterval=25;
let devID= "ArAl_"+Net.get("MAC");

cled.setColor(200,400,300);

debugger;

let mqttReady = false;

let mqtt = new MQTT({
	host: "router.casa",
	port: 1883,	
	id: "iot_" + Net.get("MAC")
});

mqtt.onReady = function () {
	trace("connection established\n");
	mqttReady=true;
    mqtt.subscribe("aral/colorled/state/on/"+devID+"/1");
    mqtt.subscribe("aral/colorled/state/off/"+devID+"/1");
    mqtt.subscribe("aral/colorled/state/set/"+devID+"/1");
    mqtt.subscribe("aral/colorled/state/pub/"+devID+"/1");
    mqtt.subscribe("aral/colorled/color/set/"+devID+"/1");
    mqtt.subscribe("aral/colorled/color/pub/"+devID+"/1");
    mqtt.subscribe("aral/colorled/flash/set/"+devID+"/1");
    mqtt.subscribe("aral/colorled/flash/pub/"+devID+"/1");
    let msg= JSON.stringify(cled.color);
    trace("mqtt_publish aral/colorled/color/"+devID+"/1 ="+msg+'\n');
	mqtt.publish("aral/colorled/color/"+devID+"/1", msg);
}


mqtt.onMessage = function (topic, data) {
	trace(`mqtt_received message on topic "${topic}"\n`);
	let msg= JSON.parse(String.fromArrayBuffer(data));
	switch(topic) 
	{
		case "aral/colorled/state/on/"+devID+"/1":
			cled.on();
			mqtt.publish("aral/colorled/state/"+devID+"/1", cled.state);
			break;
		case "aral/colorled/state/off/"+devID+"/1":
			cled.off();
			mqtt.publish("aral/colorled/state/"+devID+"/1", cled.state);
			break;
		case "aral/colorled/state/set/"+devID+"/1":
			msg= JSON.parse(String.fromArrayBuffer(data));
			if( msg || (msg == "on")) cled.on();
			else cled.off();
		case "aral/colorled/state/pub/"+devID+"/1":
			msg= JSON.stringify({ state: cled.state });
			mqtt.publish("aral/colorled/state/"+devID+"/1", msg);
			break;
		case "aral/colorled/color/set/"+devID+"/1":
			cled.setColor(msg.r,msg.g,msg.b);
		case "aral/colorled/color/pub/"+devID+"/1":
			msg= JSON.stringify(cled.color);
			mqtt.publish("aral/colorled/color/"+devID+"/1", msg);
			break;
		case "aral/colorled/flash/set/"+devID+"/1":
			msg= JSON.parse(String.fromArrayBuffer(data));
			flashinterval=msg.interval;
			cled.flash(flashinterval);
		case "aral/colorled/flash/pub/"+devID+"/1":
			msg= JSON.stringify({flashState: cled.isFlashing(), interval: flashinterval });
			mqtt.publish("aral/colorled/flash/"+devID+"/1", msg);
			break;				
	}
}

mqtt.onClose = function() {
	trace("connection lost\n");
	mqttReady= false;
};

cled.on();

cled.setColor(800,0,0);
Timer.delay(200);
cled.setColor(0,800,0);
Timer.delay(200);
cled.setColor(0,0,800);
Timer.delay(200);
cled.setColor(600,600,600);
cled.off();
Timer.delay(200);
cled.on();
Timer.delay(200);
cled.off();

cled.flash(flashinterval);

