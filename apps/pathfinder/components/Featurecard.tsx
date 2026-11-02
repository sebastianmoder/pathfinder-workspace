import React from "react";
import Link from "next/link";

type FeaturecardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  target?: string;
  status: "Live" | "Coming soon" | "Beta testing";
  audience: string;
  ctaLabel: string;
};

export default function Featurecard({
  title,
  description,
  icon,
  link,
  target = "_self",
  status,
  audience,
  ctaLabel,
}: FeaturecardProps) {
  return (
    <Link
      href={link}
      aria-label={`Learn more about ${title}`}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      className="block w-full md:w-1/2 lg:w-1/3 p-4">
      <div className="flex flex-col h-full rounded-lg p-8 group border border-gray-200 backdrop-blur-lg bg-white/30 shadow-lg transition-all hover:shadow-xl hover:scale-105 hover:bg-white/40">
        <div className="flex items-center mb-4">
          <div className="w-14 h-14 mr-4 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md transition-transform group-hover:scale-105">
            {icon}
          </div>
          <h3 className="text-2xl font-medium text-gray-900">{title}</h3>
        </div>
        <div className="flex-grow">
          <p className="text-base leading-relaxed text-gray-700">{description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                status === "Live"
                  ? "bg-emerald-100 text-emerald-800"
                  : status === "Beta testing"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-red-100 text-red-800"
              }`}>
              Status: {status}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              For: {audience}
            </span>
          </div>
          <p className="mt-4 text-blue-600 inline-flex items-center font-medium group-hover:underline">
            {ctaLabel} &rarr;
          </p>
        </div>
      </div>
    </Link>
  );
}
