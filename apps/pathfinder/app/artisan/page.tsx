import { products } from '@pathfinder/brand/products';
import type { Metadata } from "next";
import React from "react";
import Headings from "@/components/DoubleHeadings";

export const metadata: Metadata = { title: "ARTISAN" };

export default function Artisan() {
  return (
    <section className="py-16">
      <div className="w-5/6 md:w-1/2 lg:max-w-2xl lg:w-full mx-auto">
        <Headings
          top="ARTISAN"
          bottom="AI Readiness Training for Insightful Systematic Adaptation and
          Navigation"
        />
        <p className="mb-4"><a className="underline text-eu-blue" href={products[3].url}>Visit ARTISAN</a></p>
        <div className="mb-8 flex flex-wrap gap-2">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
            Status: {products[3].status}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
            For: Educators and Students
          </span>
        </div>
        <p className="mb-8 leading-relaxed">
          ARTISAN is currently in development. Its domain will be announced. Launch
          updates will be published on this Pathfinder website.
        </p>
        <p className="mb-8 leading-relaxed">
          ARTISAN is a coming-soon AI readiness program for educators and students. It
          combines core AI literacy, applied practice, and responsible-use principles for
          higher education settings.
        </p>
        <p className="mb-4">
          <b>Who ARTISAN is for:</b>
        </p>
        <ul className="mb-8">
          <li>
            Educators: to integrate AI literacy into courses and guide students through
            applied, ethical AI use
          </li>
          <li>
            Students: to build confidence in AI concepts, evaluate outputs critically,
            and apply AI in real project work
          </li>
        </ul>
        <p className="mb-4">
          <b>Program components:</b>
        </p>
        <ul className="mb-8">
          <li>
            Foundational modules on AI concepts, capabilities, limitations, and ethics
          </li>
          <li>
            Hands-on assignments and case-based exercises for applied learning
          </li>
          <li>
            Entrepreneurship-oriented activities focused on opportunity discovery and
            solution design
          </li>
          <li>
            Career readiness elements to support transferable digital and professional
            skills
          </li>
        </ul>
        <p className="mb-4">
          <b>Participants can:</b>
        </p>
        <ul className="mb-8">
          <li>Follow a structured AI literacy learning path</li>
          <li>Complete practical tasks using AI responsibly in context</li>
          <li>Develop portfolios of applied work for academic and career growth</li>
        </ul>
        <p className="mb-8">
          ARTISAN is designed to support long-term AI readiness through practical
          learning, critical thinking, and continuous adaptation.
        </p>
      </div>
    </section>
  );
}
