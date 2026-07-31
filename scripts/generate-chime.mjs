import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "public/game/vocal/chime.wav");
const sampleRate = 44_100;
const duration = 0.72;
const samples = Math.floor(sampleRate * duration);
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
  const attack = Math.min(1, time / 0.018);
  const release = Math.exp(-5.2 * time);
  const wave =
    Math.sin(2 * Math.PI * 659.255 * time) * 0.58 +
    Math.sin(2 * Math.PI * 987.767 * time) * 0.3 +
    Math.sin(2 * Math.PI * 1318.51 * time) * 0.12;
  const value = Math.max(
    -1,
    Math.min(1, wave * attack * release * 0.42),
  );
  buffer.writeInt16LE(Math.round(value * 32767), 44 + index * 2);
}

await mkdir(dirname(output), { recursive: true });
await writeFile(output, buffer);
console.log(`Wrote ${output}`);
