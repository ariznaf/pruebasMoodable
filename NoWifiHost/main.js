import LoadMod from "loadmod";

export default function () {
	debugger;
	if (!LoadMod.has("check") || !LoadMod.has("app"))
		return trace("Host installed. Ready for mods.\n");

	(LoadMod.load("check"))();
	LoadMod.load("app");
}
