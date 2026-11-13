/*
 * Copyright (C) 2026 Sofus Højberg Lind
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import { Coords } from "./NominatimClient.js";
import { z } from "zod";
import { HttpClient } from "./HttpClient.js";
import { Cache } from "../Cache.js";

const apiLink = (
    { lat, lon }: Omit<Coords, "display" | "city">,
    scope: Scope,
): string => {
    return `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&${scope === "current"
        ? "current=temperature_2m,wind_speed_10m"
        : scope === "forecast"
            ? "daily=temperature_2m_max,temperature_2m_min,wind_gusts_10m_max"
            : ""
        }&timezone=auto`;
};

export type Scope = "forecast" | "current";

export type Weather = {
    display?: string;
    time: number;
    temp: number;
    wind: number;
};

export type ForecastDay = {
    date: string;
    max: number;
    min: number;
    gusts: number;
};

export type Forecast = {
    days: ForecastDay[];
    time: number;
    display?: string;
};

const CurrentCache = new Cache<Weather>("current.json");
const ForecastCache = new Cache<Forecast>("forecast.json");

const CurrentSchema = z.object({
    current: z.object({ temperature_2m: z.number(), wind_speed_10m: z.number() }),
});

const ForecastSchema = z.object({
    daily: z.object({
        time: z.array(z.string()),
        temperature_2m_max: z.array(z.number()),
        temperature_2m_min: z.array(z.number()),
        wind_gusts_10m_max: z.array(z.number()),
    }),
});

export class OpenmeteoClient extends HttpClient {
    outdatedForecast: number;
    outdatedWeather: number;

    constructor(user_agent: string, outdatedForecast: number = 4 * 60 * 60 * 1000, outdatedWeather: number = 10 * 60 * 1000) {
        super(user_agent);
        this.outdatedWeather = outdatedWeather;
        this.outdatedForecast = outdatedForecast;
    }

    async getWeather({
        lat,
        lon,
        display,
        city,
    }: Coords): Promise<Weather> {
        const cache = await CurrentCache.get();
        const value = cache[city];

        if (value && Date.now() - value.time < this.outdatedWeather)
            return value

        const data = await this.get(CurrentSchema, apiLink({ lat: lat, lon: lon }, "current"))

        const out: Weather = {
            time: Date.now(),
            temp: Number(data.current.temperature_2m),
            wind: Number(data.current.wind_speed_10m),
            display: display,
        };

        await CurrentCache.put(city, out);

        return out;
    }

    async getForecast({
        lat,
        lon,
        display,
        city,
    }: Coords): Promise<Forecast> {
        const cache = await ForecastCache.get();
        const value = cache[city];

        if (value && Date.now() - value.time < this.outdatedForecast)
            return value


        const data = await this.get(ForecastSchema, apiLink({ lat: lat, lon: lon }, "forecast"));

        const outWeatherData: ForecastDay[] = [];

        for (let i = 0; i < 7; i++) {
            outWeatherData.push({
                date: data.daily.time[i],

                max: Number(data.daily.temperature_2m_max[i]),

                min: Number(data.daily.temperature_2m_min[i]),

                gusts: Number(data.daily.wind_gusts_10m_max[i]),
            });
        }

        const out: Forecast = {
            time: Date.now(),
            days: outWeatherData,
            display: display,
        };

        await ForecastCache.put(city, out);

        return out;
    }
}
