import LoadMod from "loadmod";

export default function () {
	debugger;
	if (LoadMod.has("check")) {
		let check = LoadMod.load("check");
		check();
		if (LoadMod.has("app"))
			LoadMod.load("app");
	} else {
		trace("Device flashed. Ready to install apps.\n");
	}
}