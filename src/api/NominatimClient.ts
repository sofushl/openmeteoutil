/*
 * Copyright (C) 2026 Sofus Højberg Lind
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import { z } from "zod";
import { HttpClient } from "./HttpClient.js";
import { Cache } from "../Cache.js";

export type Location = {
    city: string;
    state?: string;
    country?: string;
};

const NominatimScheme = z.array(z.object({
    lat: z.coerce.number(),
    lon: z.coerce.number(),
    display_name: z.string(),
}));

export type Coords = {
    lat: number;
    lon: number;
    display: string;
    city: string;
};

const CoordCache = new Cache<Coords>("cities.json");

const apiLink = ({ city, state = "", country = "" }: Location): string =>
    `https://nominatim.openstreetmap.org/search?` +
    `city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&country=${encodeURIComponent(country)}` +
    `&format=json&limit=1`;

const cacheKey = ({ city, state = "", country = "" }: Location): string =>
    country + ":" + state + ":" + city;

export class NominatimClient extends HttpClient {
    constructor(user_agent: string) {
        super(user_agent)
    }

    async getCoords(input: Location): Promise<Coords> {
        const cache = await CoordCache.get();
        const value = cache[cacheKey(input)];

        if (value) return value

        const data = await this.get(NominatimScheme, apiLink(input))

        if (!data.length) throw new Error("Response was empty");

        const result = {
            lat: data[0].lat,
            lon: data[0].lon,
            display: data[0].display_name,
            city: input.city,
        }

        await CoordCache.put(cacheKey(input), result);

        return result;
    }
}
