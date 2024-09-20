import { createExtension } from "@cognigy/extension-tools";

import { getWeather } from "./nodes/getWeather";
import { apiKeyConnection } from "./connections/apiKeyConnection";


export default createExtension({
	nodes: [
		getWeather
	],

	connections: [
		apiKeyConnection
	],

	options: {
		label: "Weather API"
	}
});