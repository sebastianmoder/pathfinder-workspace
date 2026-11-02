import React from "react";
import Headings from "@/components/DoubleHeadings";

export default function Guard() {
  return (
    <main className="">
      <section className="py-16">
        <div className="w-5/6 md:w-1/2 lg:max-w-2xl lg:w-full mx-auto">
          <Headings
            top="GUARD"
            bottom="Generative Universal Assistant for Resourceful Development"
          />
          <div className="mb-8 flex flex-wrap gap-2">
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
              Status: Beta testing
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
              For: Educators
            </span>
          </div>
          <p className="mb-8">
            GUARD is now open for beta testing at{" "}
            <a
              href="https://guard.ai-pathfinder.eu"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-eu-blue hover:underline">
              guard.ai-pathfinder.eu
            </a>
            . Please expect errors during this testing phase. Updates will be published
            on this Pathfinder website.
          </p>
          <p className="mb-8">
            GUARD is an AI assistant for educators. It is designed to help
            translate the SAGE framework into practical lesson design, teaching support,
            and classroom adaptation workflows.
          </p>
          <p className="mb-4">
            <b>Planned capabilities:</b>
          </p>
          <ul className="mb-8">
            <li>
              Guided lesson planning flows aligned with course goals and learning outcomes
            </li>
            <li>
              AI-assisted generation of learning activities, prompts, and classroom
              resources
            </li>
            <li>
              Support for adapting material to different learner needs and teaching
              contexts
            </li>
            <li>Progress insights to help educators identify areas for intervention</li>
          </ul>
          <p className="mb-4">
            <b>At launch, educators will be able to:</b>
          </p>
          <ul className="mb-8">
            <li>Plan AI-supported lessons faster with structured guidance</li>
            <li>Generate ready-to-use classroom activities from learning objectives</li>
            <li>Review learner progress signals to refine teaching decisions</li>
          </ul>
          <p className="mb-8">
            GUARD is being built as a practical companion for day-to-day teaching, with a
            focus on usability, relevance, and responsible AI use in higher education.
          </p>
        </div>
      </section>
    </main>
  );
}
