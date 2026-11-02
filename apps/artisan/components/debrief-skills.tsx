"use client";

import type { DebriefSkill } from "@/content/types";
import { assessSkill, type SkillAssessment } from "@/lib/evidence";
import { useSession } from "@/lib/session/session";
import { t } from "@/lib/i18n/en";
import { ChoiceQuestion } from "./choice-question";

/** Recognises what this visit's work showed (PRD §9). There is no overall score, and this is not a credential. */
export function DebriefSkills({ missionId, skills }: { missionId: string; skills: DebriefSkill[] }) {
  const session = useSession();
  const ledger = session.progress(missionId).evidence;
  const assessed = skills.map((skill) => ({ skill, result: assessSkill(skill, ledger) }));
  const having = <S extends SkillAssessment["status"]>(status: S) =>
    assessed.flatMap(({ skill, result }) =>
      result.status === status ? [{ skill, result: result as Extract<SkillAssessment, { status: S }> }] : [],
    );
  const shown = having("shown");
  const self = having("selfAssessed");
  const review = having("review");

  return (
    <div className="mt-4 space-y-4">
      {shown.length > 0 && (
        <section>
          <h3 className="font-bold">{t.debrief.shown}</h3>
          <ul className="mt-1 space-y-1">
            {shown.map(({ skill, result }) => (
              <li key={skill.id}>
                <span aria-hidden="true" className="mark-yes">✔ </span>
                {skill.label} <span className="text-sm text-muted">({t.debrief.kind[skill.kind]}{result.assisted && `, ${t.debrief.withHelp}`})</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {self.length > 0 && (
        <section>
          <h3 className="font-bold">{t.debrief.selfAssessed}</h3>
          <p className="text-sm text-muted">{t.debrief.selfAssessedNote}</p>
          <ul className="mt-1 space-y-1">
            {self.map(({ skill, result }) => (
              <li key={skill.id}>
                <span aria-hidden="true">◆ </span>
                {skill.label} <span className="text-sm text-muted">({t.debrief.criteriaTicked(result.met, result.total)})</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {review.length > 0 && (
        <section>
          <h3 className="font-bold">{t.debrief.review}</h3>
          <ul className="mt-1 space-y-3">
            {review.map(({ skill, result }) => (
              <li key={skill.id}>
                <span aria-hidden="true">○ </span>
                {skill.label} <span className="text-sm text-muted">({t.debrief.reason[result.reason]})</span>
                {skill.practice && (
                  <details className="no-print mt-2 rounded-lg border border-border bg-surface p-3">
                    <summary className="cursor-pointer font-semibold">{t.debrief.practice}<span className="sr-only">: {skill.label}</span></summary>
                    <div className="mt-3">
                      <ChoiceQuestion
                        name={`practice-${skill.id}`}
                        prompt={skill.practice.prompt}
                        choices={skill.practice.choices}
                        onCommit={() => {}}
                      />
                    </div>
                  </details>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-sm text-muted">{t.debrief.note}</p>
    </div>
  );
}
