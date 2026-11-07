import type { ReactNode } from "react";
import type { Artefact, ComposeFrame, ComposeSpec, MarkFrame } from "@/content/types";
import { partOf, sceneOf, type Choices } from "@/lib/compose";
import { t } from "@/lib/i18n/en";
import { CastBadge } from "./cast-badge";
import { Scene, isGeneratedImage } from "./scenes";

/*
 * Case artefacts shown as the things they are, lying on the cutting mat: a chat, an email, a post, a slide.
 * Each carries a tag saying it is fictional, and all of it is real text, so a screen reader or a printout
 * gets the same content.
 */

/** The mat an artefact lies on, with its tag. */
export function Specimen({ tag, children, className = "" }: { tag: string; children: ReactNode; className?: string }) {
  return (
    <figure className={`mat specimen p-3 sm:p-5 ${className}`}>
      <figcaption className="specimen-tag">{tag}</figcaption>
      {children}
    </figure>
  );
}

export function EmailShell({ from, to, subject, children }: { from: string; to: string; subject: string; children: ReactNode }) {
  return (
    <div className="sheet email">
      <dl className="email-head">
        <div><dt>{t.artefact.from}</dt><dd>{from}</dd></div>
        <div><dt>{t.artefact.to}</dt><dd>{to}</dd></div>
        <div><dt>{t.artefact.subject}</dt><dd className="font-bold">{subject}</dd></div>
      </dl>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  );
}

export function DocumentShell({ title, meta, children }: { title: string; meta?: string; children: ReactNode }) {
  return (
    <div className="sheet document p-4 sm:p-6">
      <p className="document-title">{title}</p>
      {meta && <p className="text-sm text-muted">{meta}</p>}
      <div className="mt-3">{children}</div>
    </div>
  );
}

/** A mark or redact text in the frame of what it is. */
export function MarkShell({ frame, children }: { frame?: MarkFrame; children: ReactNode }) {
  if (frame?.kind === "email")
    return (
      <Specimen tag={t.artefact.tag.email}>
        <EmailShell from={frame.from} to={frame.to} subject={frame.subject}>{children}</EmailShell>
      </Specimen>
    );
  if (frame?.kind === "document")
    return (
      <Specimen tag={t.artefact.tag.document}>
        <DocumentShell title={frame.title} meta={frame.meta}>{children}</DocumentShell>
      </Specimen>
    );
  return (
    <div className="mat p-3 sm:p-5">
      <div className="sheet p-4 sm:p-5">{children}</div>
    </div>
  );
}

const paragraphs = (body: string[]) => body.map((p, i) => <p key={i} className="mt-2 first:mt-0">{p}</p>);

function Drawing({ scene, alt, sizes }: { scene: NonNullable<Extract<Artefact, { kind: "photo" }>["scene"]>; alt: string; sizes?: string }) {
  return (
    <div className="drawing">
      <Scene id={scene} alt={alt} sizes={sizes} />
      <p className="drawing-note">{isGeneratedImage(scene) ? t.artefact.generatedImage : t.artefact.drawing}: {alt}</p>
    </div>
  );
}

export function ArtefactFrame({ artefact, className }: { artefact: Artefact; className?: string }) {
  switch (artefact.kind) {
    case "chat":
      return (
        <Specimen tag={t.artefact.tag.chat} className={className}>
          <ol className="sheet chat space-y-3 p-3 sm:p-4">
            {artefact.messages.map((m, i) =>
              m.ai ? (
                <li key={i} className="chat-quote">
                  <p className="text-sm font-bold">{m.from}</p>
                  <p>{m.text}</p>
                </li>
              ) : (
                <li key={i} className="chat-message">
                  <CastBadge name={m.from} size="sm" />
                  <div>
                    <p className="text-sm font-bold">{m.from}</p>
                    <p className="chat-bubble">{m.text}</p>
                  </div>
                </li>
              ),
            )}
          </ol>
        </Specimen>
      );
    case "email":
      return (
        <Specimen tag={t.artefact.tag.email} className={className}>
          <EmailShell from={artefact.from} to={artefact.to} subject={artefact.subject}>{paragraphs(artefact.body)}</EmailShell>
        </Specimen>
      );
    case "post":
      return (
        <Specimen tag={t.artefact.tag.post} className={className}>
          <article className="sheet post p-4">
            <div className="flex items-center gap-2">
              <CastBadge name={artefact.account} />
              <div>
                <p className="font-bold">{artefact.account}</p>
                <p className="text-sm text-muted">{artefact.posted}</p>
              </div>
            </div>
            <p className="mt-3 text-lg">{artefact.text}</p>
            {artefact.scene && <div className="mt-3"><Drawing scene={artefact.scene} alt={artefact.alt ?? ""} /></div>}
            {artefact.reach && <p className="mt-2 text-sm text-muted">{artefact.reach}</p>}
          </article>
        </Specimen>
      );
    case "article":
      return (
        <Specimen tag={t.artefact.tag.article} className={className}>
          <article className="sheet article p-4">
            <p className="article-outlet">{artefact.outlet}</p>
            <p className="text-sm text-muted">{artefact.date}</p>
            <p className="article-headline">{artefact.headline}</p>
            {artefact.scene && <div className="mt-3"><Drawing scene={artefact.scene} alt={artefact.alt ?? ""} /></div>}
            {artefact.caption && <p className="mt-2 text-sm italic">{artefact.caption}</p>}
          </article>
        </Specimen>
      );
    case "slide":
      return (
        <Specimen tag={t.artefact.tag.slide} className={className}>
          <SlideBody title={artefact.title} body={artefact.body} number={artefact.number} />
        </Specimen>
      );
    case "worksheet":
      return (
        <Specimen tag={t.artefact.tag.worksheet} className={className}>
          <div className="sheet worksheet">
            <p className="worksheet-title">{artefact.title}</p>
            <p className="text-sm">{t.artefact.name}: <span className="handwriting">{artefact.owner}</span></p>
            <ol className="mt-3 space-y-3">
              {artefact.lines.map((line, i) => (
                <li key={i}>
                  <p>{line.question}</p>
                  <p>
                    <span className="handwriting">{line.answer}</span>
                    {line.mark && (
                      <span className={`ml-2 font-bold ${line.mark === "right" ? "mark-yes" : "mark-no"}`}>
                        {line.mark === "right" ? "✔" : "✖"}<span className="sr-only"> {t.artefact.marked[line.mark]}</span>
                      </span>
                    )}
                  </p>
                  {line.note && <p className="margin-note">{line.note}</p>}
                </li>
              ))}
            </ol>
            {artefact.teacherNote && <p className="teacher-note">{t.artefact.teacher}: {artefact.teacherNote}</p>}
          </div>
        </Specimen>
      );
    case "document":
      return (
        <Specimen tag={t.artefact.tag.document} className={className}>
          <DocumentShell title={artefact.title} meta={artefact.meta}>{paragraphs(artefact.body)}</DocumentShell>
        </Specimen>
      );
    case "photo":
      return (
        <Specimen tag={isGeneratedImage(artefact.scene) ? t.artefact.tag.generatedPhoto : t.artefact.tag.photo} className={className}>
          <div className="sheet p-2">
            <Drawing scene={artefact.scene} alt={artefact.alt} />
            <p className="mt-2 px-1 text-sm">{artefact.caption}</p>
          </div>
        </Specimen>
      );
  }
}

export function SlideBody({ title, body, number }: { title: string; body: string[]; number?: number }) {
  return (
    <div className="sheet slide">
      <p className="slide-title">{title}</p>
      <div className="mt-3 space-y-2">{body.map((p, i) => <p key={i}>{p}</p>)}</div>
      {number !== undefined && <p className="slide-number">{t.artefact.slideNumber(number)}</p>}
    </div>
  );
}

/** A compose workspace's output, shown as the email, notice, poster or card it would be. */
export function ComposeOutput({
  spec,
  choices,
  output,
  heading,
}: {
  spec: ComposeSpec;
  choices: Choices;
  output: string[];
  /** The version line, such as "Version 3 · 52 words". */
  heading: ReactNode;
}) {
  const frame: ComposeFrame | undefined = spec.frame;
  if (!frame) {
    return (
      <div className="mat mt-2 p-3">
        <div className="sheet p-4">
          <p className="text-sm text-muted">{heading}</p>
          {output.map((p, i) => <p key={i} className="mt-2">{p}</p>)}
        </div>
      </div>
    );
  }
  if (frame.kind === "email") {
    const [first, ...rest] = output;
    const lifted = first?.startsWith("Subject:");
    return (
      <Specimen tag={t.artefact.tag.draft} className="mt-2">
        <p className="specimen-meta">{heading}</p>
        <EmailShell from={frame.from} to={frame.to} subject={lifted ? first.replace(/^Subject:\s*/, "") : t.artefact.noSubject}>
          {paragraphs(lifted ? rest : output)}
        </EmailShell>
      </Specimen>
    );
  }
  if (frame.kind === "notice") {
    return (
      <Specimen tag={t.artefact.tag.draft} className="mt-2">
        <p className="specimen-meta">{heading}</p>
        <div className="sheet notice">
          {output.map((p, i) => <p key={i} className={i === 0 ? "notice-head" : "mt-2"}>{p}</p>)}
        </div>
      </Specimen>
    );
  }
  const image = frame.image ? sceneOf(spec, choices, frame.image) : undefined;
  const imagePart = frame.image ? partOf(spec, choices, frame.image) : undefined;
  const imageLabel = imagePart && (imagePart.alt ?? imagePart.label.replace(/\s*\([^)]*\)$/, ""));
  const footer = frame.footer ? partOf(spec, choices, frame.footer)?.output.trim() : undefined;
  const headline = frame.kind === "poster" ? partOf(spec, choices, frame.headline)?.output.trim() : undefined;
  // An image without a drawing stays in the text, so nothing the learner chose goes missing.
  const placed = new Set([frame.kind === "poster" ? frame.headline : "", image ? frame.image! : "", frame.footer ?? ""]);
  const body = (spec.outputOrder ?? spec.elements.map((e) => e.id))
    .filter((id) => !placed.has(id))
    .map((id) => partOf(spec, choices, id)?.output.trim())
    .filter((x): x is string => !!x);
  return (
    <Specimen tag={t.artefact.tag.draft} className="mt-2">
      <p className="specimen-meta">{heading}</p>
      <div className={`sheet ${frame.kind === "poster" ? "poster" : "card"}`}>
        {headline && <p className="poster-headline">{headline}</p>}
        {frame.kind === "card" && body.map((p, i) => <p key={i} className="card-message">{p}</p>)}
        {image && imageLabel && <div className="mt-3"><Drawing scene={image} alt={imageLabel} sizes="(max-width: 24rem) 100vw, 24rem" /></div>}
        {frame.kind === "poster" && body.map((p, i) => <p key={i} className="mt-3">{p}</p>)}
        {footer && <p className="poster-footer">{footer}</p>}
      </div>
    </Specimen>
  );
}
