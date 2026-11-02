/**
 * A deliberately tiny, deterministic next-word predictor for M01.
 * It counts which word followed the last two words (then the last one) in the training sentences.
 * It is a teaching toy, NOT how real language models work internally.
 */
export interface Prediction {
  /** The words actually matched in the training data, or null if nothing matched. */
  contextUsed: string | null;
  ranked: { word: string; count: number; share: number }[];
}

const tokenize = (s: string) => s.toLowerCase().split(/\s+/).filter(Boolean);

type Table = Map<string, Map<string, number>>;

export function buildModel(sentences: string[]): { two: Table; one: Table } {
  const two: Table = new Map();
  const one: Table = new Map();
  const bump = (t: Table, key: string, word: string) => {
    const row = t.get(key) ?? new Map<string, number>();
    row.set(word, (row.get(word) ?? 0) + 1);
    t.set(key, row);
  };
  for (const s of sentences) {
    const w = tokenize(s);
    for (let i = 1; i < w.length; i++) {
      bump(one, w[i - 1], w[i]);
      if (i >= 2) bump(two, `${w[i - 2]} ${w[i - 1]}`, w[i]);
    }
  }
  return { two, one };
}

export function predict(model: ReturnType<typeof buildModel>, text: string): Prediction {
  const w = tokenize(text);
  const candidates: [string, Map<string, number> | undefined][] = [
    [w.slice(-2).join(" "), w.length >= 2 ? model.two.get(w.slice(-2).join(" ")) : undefined],
    [w.slice(-1).join(" "), model.one.get(w.at(-1) ?? "")],
  ];
  for (const [context, row] of candidates) {
    if (!row || row.size === 0) continue;
    const total = [...row.values()].reduce((a, b) => a + b, 0);
    const ranked = [...row.entries()]
      .map(([word, count]) => ({ word, count, share: count / total }))
      .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word));
    return { contextUsed: context, ranked };
  }
  return { contextUsed: null, ranked: [] };
}
