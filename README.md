# openmeteoutil
Simple Open-Meteo interface using OpenStreetMap (Nominatim) for city lookup.
Written in TypeScript for training purposes.

## CLI
```bash
npx openmeteoutil <city> --current   # current weather (default)
npx openmeteoutil <city> --forecast  # 7-day forecast
```
Results are cached in `~/.cache/openmeteoutil/cache.json`
(current: 10 minutes, forecast: 4 hours).

To run the demo from a clone: `npm start <city>`.

## Library
```ts
import { getCoordsFromCity, getWeather, getForecast } from "openmeteoutil";

const coords = await getCoordsFromCity({ city: "Oslo" });
const now = await getWeather(coords);
const week = await getForecast(coords);
```

### Exports: 
functions: `cacheFirst`, `putCache`, `getCoordsFromCity`, `getWeather`, `getForecast` 
types: `Coords`, `Scope`, `WeatherData`,`WeatherDayData`, `WeatherWeekData`

### TODO:
Implement zod validation.

## License

Copyright (C) 2026 Sofus Højberg Lind

This program is free software: you can redistribute it and/or modify it under the terms of the [GNU Lesser General Public License](./LICENSE) as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

SPDX-License-Identifier: LGPL-3.0-or-later
