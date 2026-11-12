#!/usr/bin/env node

/*
 * Copyright (C) 2026 Sofus Højberg Lind
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import { cacheFirst } from "./cache.js";
import { Scope, type WeatherData, type WeatherWeekData, type WeatherDayData } from "./weatherFetcher.js";


export async function main() {

    const allArgs: string[] = process.argv.slice(2).map((a) => a.toLowerCase());

    const cities: string[] = allArgs.filter((a) => a.charAt(0).match(/[a-z]/i));

    const args: string[] = allArgs
        .filter((a) => !a.charAt(0).match(/[a-z]/i))
        .map((a) => a.replace(/^-+/, ""));

    if (!cities[0]) {
        console.error("Usage: openmeteoutil <city> --current|--forecast");
        process.exit(1);
    }

    const scope: Scope = args.includes("forecast") ? "forecast" : "current";

    let ret;
    try {
        ret = await cacheFirst(cities[0], scope);
    } catch (e) {
        console.error("Error: " + (e as Error).message);
        process.exit(1);
    }

    if (ret.age > 0) {
        console.log("Printing from cache, age (ms): " + ret.age);
    } else {
        console.log("Fetched data:");
    }

    const out = ret.out

    if (scope == "forecast") {
        printForecast(out as WeatherWeekData)
    } else if (scope == "current") {
        printWeather(out as WeatherData)
    }
}

export function printWeather(data: WeatherData) {
    console.log(`${data.display}: ${data.temp}°C, wind ${data.wind} km/h`);
}

export function printForecast(data: WeatherWeekData) {
    console.log(`
      ${data.display}:
      `);

    let day: WeatherDayData;

    for (let i = 0; i < data.days.length; i++) {
        day = data.days[i];

        console.log(
            `${day.date}: ${day.min}-${day.max}°C, windgusts ${day.gusts} km/h`,
        );
    }
}

main()
