#!/usr/bin/env node

/*
 * Copyright (C) 2026 Sofus Højberg Lind
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import { OpenmeteoClient, Scope, Forecast, ForecastDay, Weather } from "./api/OpenmeteoClient.js";
import { NominatimClient, Coords } from "./api/NominatimClient.js";

const weatherClient = new OpenmeteoClient("openmeteoutil.weatherfetcher");
const coordsClient = new NominatimClient("openmeteoutil.locationfetcher");


export async function main() {

    const allArgs: string[] = process.argv.slice(2).map((a) => a.toLowerCase());

    const cities: string[] = allArgs.filter((a) => a.charAt(0).match(/^\p{L}/u));

    const args: string[] = allArgs
        .filter((a) => !a.charAt(0).match(/^\p{L}/u))
        .map((a) => a.replace(/^-+/, ""));

    if (!cities[0]) {
        console.error("Usage: openmeteoutil <city> --current|--forecast");
        process.exit(1);
    }

    const coords: Coords = await coordsClient.getCoords({ city: cities[0] });

    const scope: Scope = args.includes("forecast") ? "forecast" : "current";

    if (scope == "forecast") {

        const out = await weatherClient.getForecast(coords)
        printForecast(out)
    } else if (scope == "current") {
        const out = await weatherClient.getWeather(coords)
        printWeather(out)
    }
}

export function printWeather(data: Weather) {
    console.log(`${data.display}: ${data.temp}°C, wind ${data.wind} km/h`);
}

export function printForecast(data: Forecast) {
    console.log(`
      ${data.display}:
      `);

    let day: ForecastDay

    for (let i = 0; i < data.days.length; i++) {
        day = data.days[i];

        console.log(
            `${day.date}: ${day.min}-${day.max}°C, windgusts ${day.gusts} km/h`,
        );
    }
}

main()
