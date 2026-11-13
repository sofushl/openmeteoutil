import { mkdir, readFile, writeFile } from "fs/promises";
import { homedir } from "os";
import { dirname, join } from "path";

export class Cache<T> {
    filePath: string;

    constructor(file: string) {
        this.filePath = join(homedir(), ".cache", "openmeteoutil", file)
    }

    cachePromise: Promise<Record<string, T>> | undefined;
    get = () => (this.cachePromise ??= this.load());

    private async load(): Promise<Record<string, T>> {
        try {
            const content = await readFile(this.filePath, "utf-8");
            return JSON.parse(content) as Record<string, T>;
        } catch {
            return {}
        }
    }

    private async save(cache: Record<string, T>): Promise<void> {
        await mkdir(dirname(this.filePath), { recursive: true });
        await writeFile(this.filePath, JSON.stringify(cache, null, 2), "utf-8");
    }

    async put(
        key: string,
        entry: T
    ) {
        let cache: Record<string, T> = await this.get();
        cache[key] = entry;
        await this.save(cache);
    }

    async pop(key: string) {
        let cache: Record<string, T> = await this.get();
        delete cache[key]
        await this.save(cache);
    }
}
