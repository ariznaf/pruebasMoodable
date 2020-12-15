{
	"modules": {
		"*": [
			"./app",
			"../../bme280"
		]
	},
	"preload": [
		"bme280"
	],
	"strip": [
		"Atomics",
		"eval",
		"Function",
		"Generator",
		"Map",
		"Proxy",
		"Reflect",
		"RegExp",
		"Set",
		"SharedArrayBuffer",
		"WeakMap",
		"WeakSet"
	],
	"build": {
		"NAME": "testBMEapp"
	}
}