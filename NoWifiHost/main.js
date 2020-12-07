import LoadMod from "loadmod";

export default function () {
	debugger;
	if (!LoadMod.has("check") || !LoadMod.has("app"))
		return trace("Host installed. No apps loaded. Ready to install apps.\n");

	(LoadMod.load("check"))();
	LoadMod.load("app");
}
