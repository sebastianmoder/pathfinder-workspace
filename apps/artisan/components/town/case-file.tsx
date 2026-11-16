"use client";

import { modules } from "@/content/journey";
import { caseStories, chapters, opening } from "@/content/story";
import { fileOf } from "@/lib/story/story";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";
import { caseNumber } from "./town-map";

const book = { opening, chapters, cases: caseStories };

/**
 * The Riverside file: what each finished case left behind, pinned along one thread in the order of the cases.
 * A card says what it ties to once both ends are in the file. Cards not found yet show only that a case has
 * something to leave, so the board never gives a later case away.
 */
export function CaseFile() {
  const session = useSession();
  const file = fileOf(book, modules, { flags: session.flags, completed: session.completedIds });
  const found = file.filter((c) => c.found).length;
  const titleOf = (moduleId: string) => modules.find((m) => m.id === moduleId)?.title ?? "";

  return (
    <div className="case-file mat">
      <p className="case-file-count" role="status">{t.file.count(found, file.length)}</p>
      <ol className="thread">
        {file.map((clue, i) => (
          <li key={clue.moduleId} className="thread-item" data-found={clue.found} data-tilt={i % 3}>
            {clue.found ? (
              <article className="clue sheet">
                <h2 className="clue-title">{clue.title}</h2>
                <p className="mt-1">{clue.text}</p>
                <p className="clue-from">{t.file.from(caseNumber(clue.moduleId), titleOf(clue.moduleId))}</p>
                {clue.ties.length > 0 && (
                  <ul className="clue-ties" aria-label={t.file.ties}>
                    {clue.ties.map((tie) => (
                      <li key={tie.moduleId}>
                        <strong>{tie.title}.</strong> {tie.why}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ) : (
              <p className="clue-missing">{t.file.missing(caseNumber(clue.moduleId), titleOf(clue.moduleId))}</p>
            )}
          </li>
        ))}
      </ol>
      <p className="case-file-more">{t.file.more}</p>
    </div>
  );
}
