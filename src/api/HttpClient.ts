/*
 * Copyright (C) 2026 Sofus Højberg Lind
 * SPDX-License-Identifier: LGPL-3.0-or-later
 */

import { z } from "zod";

export class HttpClient {
    user_agent: string;

    constructor(user_agent: string) {
        this.user_agent = user_agent
    }


    async get<T extends z.ZodType>(schema: T, url: string): Promise<z.infer<T>> {
        const res = await fetch(url, {
            headers: {
                "User-Agent": this.user_agent,
            },
        }).catch((e) => {
            throw new Error(`Could not reach endpoint ${url}: ${(e as Error).message}`);
        });

        if (!res.ok) throw new Error(`Endpoint ${url} returned status: ${res.status}: ${url}`);

        const out = await res.json();

        return schema.parse(out);
    }
}
