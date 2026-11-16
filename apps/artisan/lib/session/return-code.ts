/**
 * A return code: a short string that carries which cases are finished and what the story remembers, so a
 * player can pick the story up on another device without a file. It does not carry the work inside a case.
 *
 * Layout, most significant bit first: 3 bits of version, one bit per mission, two bits per flag (0 for not
 * set, otherwise the value's position from 1). The bits are written in Crockford base 32, followed by two
 * check characters. The lists passed in fix the meaning of each bit, so their order must never change: a
 * test pins a known code to catch that.
 */
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const VERSION = 1;

export interface CodeShape {
  missions: readonly string[];
  flags: readonly { id: string; values: readonly string[] }[];
}

export interface CodeContent {
  completed: string[];
  flags: Record<string, string>;
}

const payloadBits = (shape: CodeShape) => 3 + shape.missions.length + shape.flags.length * 2;
const payloadChars = (shape: CodeShape) => Math.ceil(payloadBits(shape) / 5);

function check(payload: string): string {
  let hash = 2166136261;
  for (const ch of payload) {
    hash ^= ch.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return ALPHABET[(hash >>> 5) & 31] + ALPHABET[hash & 31];
}

export function encodeCode(shape: CodeShape, content: CodeContent): string {
  const bits: number[] = [(VERSION >> 2) & 1, (VERSION >> 1) & 1, VERSION & 1];
  for (const id of shape.missions) bits.push(content.completed.includes(id) ? 1 : 0);
  for (const flag of shape.flags) {
    const value = flag.values.indexOf(content.flags[flag.id] ?? "") + 1; // 0 when not set
    bits.push((value >> 1) & 1, value & 1);
  }
  while (bits.length % 5) bits.push(0);
  let payload = "";
  for (let i = 0; i < bits.length; i += 5) payload += ALPHABET[bits.slice(i, i + 5).reduce((n, b) => n * 2 + b, 0)];
  const raw = payload + check(payload);
  return raw.match(/.{1,4}/g)!.join("-");
}

export type DecodeResult = { ok: true; content: CodeContent } | { ok: false; reason: "malformed" | "mistyped" | "version" };

/** Reads a code as typed: case, spaces and dashes don't matter, and the letters O, I and L are read as 0 and 1. */
export function decodeCode(shape: CodeShape, typed: string): DecodeResult {
  const raw = typed.toUpperCase().replace(/[\s-]/g, "").replace(/O/g, "0").replace(/[IL]/g, "1");
  if (raw.length !== payloadChars(shape) + 2 || [...raw].some((ch) => !ALPHABET.includes(ch))) return { ok: false, reason: "malformed" };
  const payload = raw.slice(0, -2);
  if (check(payload) !== raw.slice(-2)) return { ok: false, reason: "mistyped" };
  const bits = [...payload].flatMap((ch) => {
    const n = ALPHABET.indexOf(ch);
    return [16, 8, 4, 2, 1].map((m) => (n & m ? 1 : 0));
  });
  if (bits[0] * 4 + bits[1] * 2 + bits[2] !== VERSION) return { ok: false, reason: "version" };
  let at = 3;
  const completed = shape.missions.filter(() => bits[at++] === 1);
  const flags: Record<string, string> = {};
  for (const flag of shape.flags) {
    const value = bits[at] * 2 + bits[at + 1];
    at += 2;
    if (value > 0 && flag.values[value - 1]) flags[flag.id] = flag.values[value - 1];
  }
  return { ok: true, content: { completed, flags } };
}
