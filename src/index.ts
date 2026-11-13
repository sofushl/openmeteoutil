/*
 * Copyright (C) 2026 Sofus Højberg Lind
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

export { NominatimClient } from "./api/NominatimClient.js";
export type {
    Coords,
    Location
} from "./api/NominatimClient.js";
export { OpenmeteoClient } from "./api/OpenmeteoClient.js";
export type {
    Weather,
    Forecast,
    ForecastDay,
} from "./api/OpenmeteoClient.js";
