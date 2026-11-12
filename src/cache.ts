/*
 * Copyright (C) 2026 Sofus Højberg Lind
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import {
    getForecast,
    getWeather,
    Scope,
    WeatherData,
    WeatherWeekData,
} from "./weatherFetcher.js";
import { Coords, getCoordsFromCity } from "./cityFetcher.js";
import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import { homedir } from "os";

type Cache = {
    current: { [cities: string]: WeatherData };
    forecast: { [cities: string]: WeatherWeekData };
};

type CacheReturn = {
    age: number;
    out: WeatherData | WeatherWeekData;
};

let cachePromise: Promise<Cache> | undefined;
const getCache = () => (cachePromise ??= loadCache());

const filePath = join(homedir(), ".cache", "openmeteoutil", "cache.json");

async function loadCache(): Promise<Cache> {
    try {
        const content = await readFile(filePath, "utf-8");
        return JSON.parse(content);
    } catch {
        return {
            current: {},
            forecast: {},
        };
    }
}

async function saveCache(cache: Cache): Promise<void> {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(cache, null, 2), "utf-8");
}

export async function putCache(
    scope: Scope,
    city: string,
    data: WeatherWeekData | WeatherData,
) {
    const cache = await getCache();
    cache[scope][city] = data;
    await saveCache(cache);
}

async function doRequest(city: string, scope: Scope): Promise<CacheReturn["out"]> {
    const coords: Coords = await getCoordsFromCity({ city: city });

    switch (scope) {
        case "forecast":
            return getForecast(coords);

        case "current":
            return getWeather(coords);

        default:
            throw new Error("invalid scope: " + scope);
    }
}

export async function cacheFirst(
    city: string,
    scope: Scope,
): Promise<CacheReturn> {
    const cache = await getCache();

    if (!cache[scope][city]) {
        return { age: 0, out: await doRequest(city, scope) };
    }

    const outdatedTimeForecast: number = 4 * 60 * 60 * 1000;
    const outdatedTimeCurrent: number = 10 * 60 * 1000;
    let timeLeft: number;
    let age: number;

    switch (scope) {
        case "forecast":
            age = Date.now() - cache.forecast[city].time;
            timeLeft = outdatedTimeForecast - age;
            if (timeLeft < 0) {
                const coords: Coords = await getCoordsFromCity({ city: city });
                return {
                    age: 0, out: await getForecast(coords),
                };
            }

            return {
                age, out: cache.forecast[city]
            }

        case "current":
            age = Date.now() - cache.current[city].time;
            timeLeft = outdatedTimeCurrent - age;
            if (timeLeft < 0) {
                const coords: Coords = await getCoordsFromCity({ city: city });
                return {
                    age: 0,
                    out: await getWeather(coords),
                }
            }

            return {
                age,
                out: cache.current[city]
            };

        default:
            throw new Error("invalid scope: " + scope);
    }
}

