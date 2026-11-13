# openmeteoutil
Simple Open-Meteo interface using OpenStreetMap (Nominatim) for city lookup.
Written in TypeScript for training purposes.

## CLI
```bash
npx openmeteoutil <city> --current   # current weather (default)
npx openmeteoutil <city> --forecast  # 7-day forecast
```

### Cache

Locations fetched: `~/.cache/openmeteoutil/cities.json`
Weather reports fetched: `~/.cache/openmeteoutil/current.json`
Weather forecasts fetched: `~/.cache/openmeteoutil/forecast.json`

Default refresh times: current: 10 minutes, forecast: 4 hours.

To run the demo from a clone: `npm start <city>`.

## Library
```ts
import { OpenmeteoClient, NominatimClient } from "openmeteoutil";

const nominatim = new NominatimClient("myapp.locationfetcher");
const openmeteo = new OpenmeteoClient("myapp.forecastfetcher");

const coords = await nominatim.getCoords({ city: "Oslo" });
const now = await openmeteo.getWeather(coords);
const week = await openmeteo.getForecast(coords);
```

### Exports: 
classes: `NominatimClient`, `OpenmeteoClient`
types: `Coords`, `Location`, `Weather`, `Forecast`, `ForecastDay`, 

## Disclaimer and attribution

Unofficial community package. Not affiliated with or endorsed by Open-Meteo.

Weather data by [Open-Meteo.com](https://open-meteo.com/). If you display this data in an app or UI, keep this attribution visible. The free Open-Meteo API is for non-commercial use. See the [Open-Meteo terms](https://open-meteo.com/en/terms) before commercial use.

City lookup uses Nominatim. Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright).

## License

Copyright (C) 2026 Sofus Højberg Lind

This program is free software: you can redistribute it and/or modify it under the terms of the [GNU Lesser General Public License](./LICENSE) as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

SPDX-License-Identifier: LGPL-3.0-or-later
