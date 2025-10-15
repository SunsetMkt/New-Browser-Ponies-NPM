import { mkdir, rm, writeFile, readdir, rename } from "fs/promises";
import unzipper from "unzipper";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

const url =
    "https://github.com/Pony-House/New-Browser-Ponies/archive/refs/heads/gh-pages.zip";
const dist = "dist";
const tmp = "tmp.zip";

async function main() {
    await rm(dist, { recursive: true, force: true });
    await mkdir(dist, { recursive: true });

    console.log("📦 Fetching:", url);
    const res = await fetch(url);
    if (!res.ok)
        throw new Error(`Failed to download: ${res.status} ${res.statusText}`);

    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(tmp, buffer);

    console.log("📂 Extracting...");
    await pipeline(Readable.from(buffer), unzipper.Extract({ path: dist }));

    const [folderName] = await readdir(dist);
    const folderPath = `${dist}/${folderName}`;

    const files = await readdir(folderPath);
    for (const file of files) {
        await rename(`${folderPath}/${file}`, `${dist}/${file}`);
    }

    await rm(folderPath, { recursive: true, force: true });
    await rm(tmp, { force: true });

    console.log("✅ Done! Files extracted to", dist);
}

main().catch((err) => {
    console.error("❌ Build failed:", err);
    process.exit(1);
});
