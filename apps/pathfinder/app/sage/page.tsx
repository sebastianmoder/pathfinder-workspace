import React from "react";
import Headings from "@/components/DoubleHeadings";
import Link from "next/link";

export default function Sage() {
  return (
    <section className="py-16">
      <div className="w-5/6 md:w-1/2 lg:max-w-2xl lg:w-full mx-auto">
        <Headings
          top="SAGE"
          bottom="Strategies for AI-Guided Education"
        />
        <div className="mb-8 flex flex-wrap gap-2">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
            Status: Live
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            For: Educators
          </span>
        </div>
        <p className="mb-8">
          Explore the live output at{" "}
          <Link
            href="https://sage.ai-pathfinder.eu"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-eu-blue hover:underline">
            sage.ai-pathfinder.eu
          </Link>
          .
        </p>
        <p className="mb-8">
          SAGE is a comprehensive and scalable instructional framework designed to guide
          educators in the effective and responsible integration of AI tools into higher
          education teaching.
        </p>
        <p className="mb-8">
          This strategic framework serves as a blueprint for combining artificial
          intelligence technologies with innovative pedagogical approaches, improving
          digital teaching and learning practices across various courses.
        </p>

        <p className="mb-4">
          <b>Key Features of SAGE:</b>
        </p>
        <ul className="mb-8 ">
          <li>
            Practical guidelines for incorporating AI into curriculum development and
            lesson planning
          </li>
          <li>
            Best practices for leveraging AI to personalize learning experiences and
            enhance student engagement
          </li>
          <li>
            Strategies for fostering critical thinking, problem-solving, and creativity
            through AI-assisted education
          </li>
          <li>
            Ethical considerations and responsible AI practices to ensure inclusive and
            unbiased learning environments
          </li>
        </ul>
        <p className="mb-8">
          By adopting SAGE, educators can harness the power of AI to revolutionize their
          teaching methods, creating dynamic and interactive learning experiences that
          prepare students for the digital age.
        </p>
      </div>
    </section>
  );
}
