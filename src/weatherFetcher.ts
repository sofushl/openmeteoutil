/*
 * Copyright (C) 2026 Sofus Højberg Lind
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */


import { putCache } from "./cache.js";
import { Coords } from "./cityFetcher.js";

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

export type WeatherData = {
    display?: string;
    time: number;
    temp: number;
    wind: number;
};

export type WeatherDayData = {
    date: string;
    max: number;
    min: number;
    gusts: number;
};

export type WeatherWeekData = {
    days: WeatherDayData[];
    time: number;
    display?: string;
};

type CurrentApiResponse = {
    current: { temperature_2m: number; wind_speed_10m: number };
};
type WeekApiResponse = {
    daily: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        wind_gusts_10m_max: number[];
    };
};

async function getData<T>(link: string): Promise<T> {
    let response: Response;
    try {
        response = await fetch(link, {
            headers: {
                "User-Agent": "Weathercli.weathergetter",
            },
        });
    } catch (e) {
        throw new Error("Could not reach weather API: " + (e as Error).message);
    }

    if (!response.ok) {
        throw new Error(`Weather API returned status ${response.status}`);
    }

    const data = await response.json();

    return data as T;
}

export async function getWeather({
    lat,
    lon,
    display,
    city,
}: Coords): Promise<WeatherData> {
    const data = await getData<CurrentApiResponse>(
        apiLink({ lat: lat, lon: lon }, "current"),
    );

    const out: WeatherData = {
        time: Date.now(),
        temp: Number(data.current.temperature_2m),
        wind: Number(data.current.wind_speed_10m),
        display: display,
    };

    await putCache("current", city, out);

    return out;
}

export async function getForecast({
    lat,
    lon,
    display,
    city,
}: Coords): Promise<WeatherWeekData> {
    const data = await getData<WeekApiResponse>(
        apiLink({ lat: lat, lon: lon }, "forecast"),
    );

    let outWeatherData: WeatherDayData[] = [];

    for (let i = 0; i < 7; i++) {
        outWeatherData.push({
            date: data.daily.time[i],

            max: Number(data.daily.temperature_2m_max[i]),

            min: Number(data.daily.temperature_2m_min[i]),

            gusts: Number(data.daily.wind_gusts_10m_max[i]),
        });
    }

    const out: WeatherWeekData = {
        time: Date.now(),
        days: outWeatherData,
        display: display,
    };

    await putCache("forecast", city, out);

    return out;
}
