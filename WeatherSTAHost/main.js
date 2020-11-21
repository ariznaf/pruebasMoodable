import LoadMod from "loadmod";
import WiFi from "wifi";
import Net from "net";

export default function () {
	debugger;
	if (!LoadMod.has("check") || !LoadMod.has("app"))
		return trace("Host installed. Ready for mods.\n");

	(LoadMod.load("check"))();

	if (LoadMod.has("mod/config")) {
		const config = LoadMod.load("mod/config");
		if (config.ssid) {
			trace(`Wi-Fi trying to connect to "${config.ssid}"\n`);

			WiFi.mode = 1;

			let monitor = new WiFi({ssid: config.ssid, password: config.password}, function(msg, code) {
			   switch (msg) {
				   case WiFi.gotIP:
						trace(`IP address ${Net.get("IP")}\n`);
						monitor.close();

						LoadMod.load("app");
						break;

					case WiFi.connected:
						trace(`Wi-Fi connected to "${Net.get("SSID")}"\n`);
						break;

					case WiFi.disconnected:
						trace((-1 === code) ? "Wi-Fi password rejected\n" : "Wi-Fi disconnected\n");
						break;
				}
			});
			return;
		}
	}

	LoadMod.load("app");
}
