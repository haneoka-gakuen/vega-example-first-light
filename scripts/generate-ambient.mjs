import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "public/game/bgm/first-light.wav");
const sampleRate = 44_100;
const duration = 8;
const samples = sampleRate * duration;
const dataBytes = samples * 2;
const buffer = Buffer.alloc(44 + dataBytes);

buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + dataBytes, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(1, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(sampleRate * 2, 28);
buffer.writeUInt16LE(2, 32);
buffer.writeUInt16LE(16, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(dataBytes, 40);

for (let index = 0; index < samples; index += 1) {
  const time = index / sampleRate;
  const pulse = 0.72 + Math.sin(2 * Math.PI * 0.125 * time) * 0.18;
  const shimmer = 0.8 + Math.sin(2 * Math.PI * 0.25 * time) * 0.2;
  const wave =
    Math.sin(2 * Math.PI * 110 * time) * 0.34 +
    Math.sin(2 * Math.PI * 165 * time) * 0.24 +
    Math.sin(2 * Math.PI * 220 * time) * 0.16 +
    Math.sin(2 * Math.PI * 277.5 * time) * 0.1 * shimmer;
  const value = Math.max(-1, Math.min(1, wave * pulse * 0.26));
  buffer.writeInt16LE(Math.round(value * 32_767), 44 + index * 2);
}

await mkdir(dirname(output), { recursive: true });
await writeFile(output, buffer);
console.log(`Wrote ${output}`);
