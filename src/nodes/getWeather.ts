import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from 'axios';

// Define the interface for the parameters
export interface IgetWeatherParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
		};
		city: string;
		contextStore: string;
		storeLocation: string;
		inputKey: string;
		contextKey: string;
	};
}

// Main function to get weather information and provide structured output
export const getWeather = createNodeDescriptor({
	type: "getWeather",
	defaultLabel: "Get Weather",
	preview: {
		key: "city",
		type: "text"
	},
	fields: [
		{
			key: "connection",
			label: "The API key that should be used",
			type: "connection",
			params: {
				connectionType: "api-key",
				required: true
			}
		},
		{
			key: "city",
			label: "City",
			type: "cognigyText",
			defaultValue: "Ratingen",
			params: {
				required: true
			},
		},
		{
			key: "storeLocation",
			type: "select",
			label: "Where to store the result",
			defaultValue: "input",
			params: {
				options: [
					{
						label: "Input",
						value: "input"
					},
					{
						label: "Context",
						value: "context"
					}
				],
				required: true
			},
		},
		{
			key: "inputKey",
			type: "cognigyText",
			label: "Input Key to store Result",
			defaultValue: "weather",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "weather",
			condition: {
				key: "storeLocation",
				value: "context",
			}
		},
	],
	sections: [
		{
			key: "storage",
			label: "Storage Option",
			defaultCollapsed: true,
			fields: [
				"storeLocation",
				"inputKey",
				"contextKey",
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "city" },
		{ type: "section", key: "storage" }
	],
	appearance: {
		color: "#fcb603"
	},

	function: async ({ cognigy, config }: IgetWeatherParams) => {
		const { api } = cognigy;
		const { connection, city, storeLocation, inputKey, contextKey } = config;
		const { key } = connection;

		try {
			// Fetch weather data from WeatherAPI
			const response = await axios({
				method: 'get',
				url: `http://api.weatherapi.com/v1/current.json?key=${key}&q=${encodeURI(city)}`
			});

			// Extract relevant weather information
			const weatherData = response.data;
			const temperature = weatherData.current.temp_c;
			const condition = weatherData.current.condition.text;
			const windSpeed = weatherData.current.wind_kph;
			const humidity = weatherData.current.humidity;
			const cityName = weatherData.location.name;
			const countryName = weatherData.location.country;

			// Create a structured output message
			const weatherReport = `
				Weather in ${cityName}, ${countryName}:
				- Temperature: ${temperature}°C
				- Condition: ${condition}
				- Wind Speed: ${windSpeed} km/h
				- Humidity: ${humidity}%
			`;

			// Store full data and return structured response
			if (storeLocation === "context") {
				api.addToContext(contextKey, weatherData, "simple");
			} else {
				api.addToInput(inputKey, weatherData);
			}

			// Send the structured weather report back to the user
			api.say(weatherReport);

		} catch (error) {
			const errorMessage = "I couldn't retrieve the weather data. Please try again later.";
			
			// Handle errors and store them in context or input
			if (storeLocation === "context") {
				api.addToContext(contextKey, { error: errorMessage }, "simple");
			} else {
				api.addToInput(inputKey, { error: errorMessage });
			}

			// Send error message back to the user
			api.say(errorMessage);
		}
	}
});
