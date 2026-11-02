// components/InstitutionLogos.js
import React from "react";
import Image from "next/image";
import Link from "next/link";

const logos = [
  {
    src: "/images/partners/unili.png",
    alt: "University of Liechtenstein Logo",
    url: "https://www.uni.li/en/",
  },
  {
    src: "/images/partners/LAB.png",
    alt: "LAB University of Applied Sciences Logo",
    url: "https://www.lab.fi/en/",
  },
  {
    src: "/images/partners/unidu.png",
    alt: "University of Dubrovnik Logo",
    url: "https://www.unidu.hr/eng/",
  },
  {
    src: "/images/partners/formatio.png",
    alt: "Formatio Private School Logo",
    url: "https://formatio.li/en/",
  },
];

export default function InstitutionLogos() {
  return (
    <div className="mx-auto max-w-screen-xl">
      <div className="flex flex-wrap justify-center items-center gap-6">
        {logos.map((logo, index) => (
          <Link
            key={index}
            href={logo.url}
            target="_blank"
            rel="noopener noreferrer">
            <div className="flex items-center justify-center w-32 sm:w-40 md:w-48 lg:w-56 p-4">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={300}
                height={200}
                className="object-contain"
                loading="lazy"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
