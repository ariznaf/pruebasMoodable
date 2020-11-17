import MQTT from "mqtt";
import Net from "net";
import Colorled from "aral_components/colorled";

let cled= new Colorled(12,13,14);

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
    mqtt.subscribe("test/ledColor/+");
    let msg= JSON.stringify(cled.color);
    trace("mqtt_publish test/ledColor="+msg+'\n');
	mqtt.publish("test/ledColor", msg);
}


mqtt.onMessage = function (topic, data) {
	trace(`mqtt_received message on topic "${topic}"`);
    let msg= JSON.parse(String.fromArrayBuffer(data));
    cled.setColor(msg.r,msg.g,msg.b);
	mqtt.publish("test/ledColor", JSON.stringify(cled.color));

}

mqtt.onClose = function() {
	trace("connection lost\n");
	mqttReady= false;
};

cled.flash(1000);

