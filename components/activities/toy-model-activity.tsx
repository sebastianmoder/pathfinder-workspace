"use client";

import { useId, useMemo, useState } from "react";
import type { Step } from "@/content/types";
import { buildModel, predict } from "@/lib/toy-model";
import { t } from "@/lib/i18n/en";

type ToyStep = Extract<Step, { kind: "toyModel" }>;

export function ToyModelActivity({ step, onContinue }: { step: ToyStep; onContinue: () => void }) {
  const uid = useId(); // unique across hidden kept-alive pages, which stay in the DOM
  const [corpusId, setCorpusId] = useState(step.corpora[0].id);
  const [guess, setGuess] = useState("");
  const [ran, setRan] = useState<Record<string, { top: string; guess: string }>>({});
  const [shownId, setShownId] = useState<string | null>(null);

  const models = useMemo(
    () => Object.fromEntries(step.corpora.map((c) => [c.id, buildModel(c.sentences)])),
    [step.corpora],
  );
  const corpus = step.corpora.find((c) => c.id === corpusId)!;
  const shown = shownId ? step.corpora.find((c) => c.id === shownId)! : null;
  const result = shown ? predict(models[shown.id], step.promptText) : null;
  const runs = Object.keys(ran).length;

  function run() {
    const p = predict(models[corpusId], step.promptText);
    setRan((r) => ({ ...r, [corpusId]: { top: p.ranked[0]?.word ?? t.toy.nothingWord, guess: guess.trim() } }));
    setShownId(corpusId);
    setGuess(""); // the next run gets its own prediction, made before seeing the result
  }

  return (
    <div>
      <h2 className="text-2xl">{step.title}</h2>
      <p className="mt-1 text-sm text-muted">{t.toy.label}</p>

      <div className="mat mt-4 p-4 sm:p-6">
        <p className="sheet p-4 font-mono text-lg">
          {step.promptText} <span aria-hidden="true">▁▁▁</span>
          <span className="sr-only">{t.mission.blank}</span>
        </p>
      </div>

      <fieldset className="mt-4">
        <legend className="font-bold">{t.toy.chooseData}</legend>
        <div className="mt-2 space-y-2">
          {step.corpora.map((c) => (
            <label key={c.id} className="option">
              <input type="radio" name={`${uid}-corpus`} checked={corpusId === c.id} onChange={() => setCorpusId(c.id)} className="mt-1" />
              <span>
                <strong>{c.label}</strong>
                <br />
                <span className="text-sm">{c.description}</span>
              </span>
            </label>
          ))}
        </div>
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer">{t.toy.seeSentences(corpus.label)}</summary>
          <ul className="mt-1 list-disc pl-5 font-mono">
            {[...new Set(corpus.sentences)].map((s) => (
              <li key={s}>
                {s}
                {corpus.sentences.filter((x) => x === s).length > 1 && ` ×${corpus.sentences.filter((x) => x === s).length}`}
              </li>
            ))}
          </ul>
        </details>
      </fieldset>

      <div className="mt-4">
        <label htmlFor={`${uid}-guess`} className="font-bold">{t.toy.predictFirst}</label>
        <p className="text-sm text-muted">{t.toy.guessAgain}</p>
        <input
          id={`${uid}-guess`}
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          autoComplete="off"
          className="mt-1 block w-full max-w-xs rounded border border-border bg-surface px-3 py-2"
        />
        <button
          type="button"
          onClick={run}
          disabled={!guess.trim()}
          className="mt-3 btn btn-primary"
        >
          {t.toy.run}
        </button>
      </div>

      <div role="status" className="mt-5">
        {shown && result && (
          <div className="rounded-lg border border-border bg-surface p-4">
            <h3 className="font-bold">{t.toy.result(shown.label)}</h3>
            {result.ranked.length === 0 ? (
              <p>{t.toy.nothing}</p>
            ) : (
              <>
                <p className="text-sm text-muted">{t.toy.context(result.contextUsed!)}</p>
                <table className="mt-2 w-full text-left text-sm">
                  <caption className="sr-only">{t.toy.tableCaption}</caption>
                  <thead>
                    <tr><th className="pr-3">{t.toy.word}</th><th className="pr-3">{t.toy.count}</th><th>{t.toy.share}</th></tr>
                  </thead>
                  <tbody>
                    {result.ranked.map((r, i) => (
                      <tr key={r.word}>
                        <td className="pr-3 font-mono">{i === 0 && <span aria-hidden="true">★ </span>}{r.word}{i === 0 && <span className="sr-only"> {t.toy.chosen}</span>}</td>
                        <td className="pr-3">{r.count}</td>
                        <td>
                          <span aria-hidden="true" className="inline-block h-2 bg-accent align-middle" style={{ width: `${Math.round(r.share * 120)}px` }} />{" "}
                          {Math.round(r.share * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
            <p className="mt-3 text-sm">
              <strong>{t.toy.yourGuess}:</strong> {ran[shown.id]?.guess}
              <br />
              <strong>{t.toy.intended}:</strong> {step.intendedMeaning}
            </p>
          </div>
        )}
      </div>

      {runs > 0 && (
        <p className="mt-3 text-sm">
          {t.toy.tried(runs, step.minRuns)}
          {" "}
          {Object.entries(ran).map(([id, r]) => `${step.corpora.find((c) => c.id === id)!.label}: ${r.top}`).join("; ")}
        </p>
      )}

      {runs >= step.minRuns ? (
        <div className="mt-4">
          <p className="rounded border border-border p-3 text-sm">{step.takeaway}</p>
          <button type="button" onClick={onContinue} className="mt-4 btn btn-primary">
            {t.mission.next}
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">{t.toy.needMore(step.minRuns)}</p>
      )}
    </div>
  );
}
