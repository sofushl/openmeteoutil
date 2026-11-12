/*
 * Copyright (C) 2026 Sofus Højberg Lind
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

export { cacheFirst, putCache } from "./cache.js";
export { getCoordsFromCity } from "./cityFetcher.js";
export type { Coords } from "./cityFetcher.js";
export { getForecast, getWeather } from "./weatherFetcher.js";
export type {
    Scope,
    WeatherData,
    WeatherDayData,
    WeatherWeekData,
} from "./weatherFetcher.js";
