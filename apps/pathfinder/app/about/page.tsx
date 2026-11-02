import React from "react";
import Image from "next/image";
import DoubleHeadings from "@/components/DoubleHeadings";
import Link from "next/link";
import { FaGlobe, FaFacebook, FaLinkedin, FaInstagram } from "react-icons/fa";

interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactElement;
}

interface Partner {
  name: string;
  country: string;
  description: string;
  focusAreas: string[];
  imgSrc: string;
  socialLinks: SocialLink[];
}

const partners: Partner[] = [
  // Partner 1
  {
    name: "University of Liechtenstein",
    country: "Liechtenstein 🇱🇮",
    description:
      "The University of Liechtenstein specializes in architecture and business economics, offering an intimate academic environment with a strong focus on sustainability and innovation.",
    focusAreas: ["Architecture", "Business Economics", "Sustainability and innovation"],
    imgSrc: "/images/partners/unili.png",
    socialLinks: [
      { name: "Website", url: "https://www.uni.li/en/", icon: <FaGlobe size={24} /> },
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/school/universit-t-liechtenstein/",
        icon: <FaLinkedin size={24} />,
      },
      {
        name: "Facebook",
        url: "https://www.facebook.com/uni.li",
        icon: <FaFacebook size={24} />,
      },
      {
        name: "Instagram",
        url: "https://www.instagram.com/uni_li",
        icon: <FaInstagram size={24} />,
      },
    ],
  },
  // Partner 2
  {
    name: "LAB University of Applied Sciences",
    country: "Finland 🇫🇮",
    description:
      "LAB University of Applied Sciences in Finland stands out for its applied research and education in health and wellbeing, circular economy, and design, preparing students for impactful careers with a global perspective.",
    focusAreas: ["Health and wellbeing", "Circular economy", "Design and applied research"],
    imgSrc: "/images/partners/LAB.png",
    socialLinks: [
      { name: "Website", url: "https://lab.fi/en/", icon: <FaGlobe size={24} /> },
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/school/labfinland/",
        icon: <FaLinkedin size={24} />,
      },
      {
        name: "Facebook",
        url: "https://www.facebook.com/LABfinland",
        icon: <FaFacebook size={24} />,
      },
      {
        name: "Instagram",
        url: "https://www.instagram.com/labfinland/",
        icon: <FaInstagram size={24} />,
      },
    ],
  },
  // Partner 3
  {
    name: "University of Dubrovnik",
    country: "Croatia 🇭🇷",
    description:
      "The University of Dubrovnik, Croatia, renowned for its maritime studies, electrical engineering, and business courses, combines rich historical heritage with modern educational approaches.",
    focusAreas: ["Maritime studies", "Electrical engineering", "Business studies"],
    imgSrc: "/images/partners/unidu.png",
    socialLinks: [
      { name: "Website", url: "https://www.unidu.hr/eng/", icon: <FaGlobe size={24} /> },
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/school/unidu-cro/",
        icon: <FaLinkedin size={24} />,
      },
      {
        name: "Facebook",
        url: "https://www.facebook.com/UNIDUcro/",
        icon: <FaFacebook size={24} />,
      },
      {
        name: "Instagram",
        url: "https://www.instagram.com/sveucilisteudubrovniku/",
        icon: <FaInstagram size={24} />,
      },
    ],
  },
  // Partner 4
  {
    name: "Formatio Private School",
    country: "Liechtenstein 🇱🇮",
    description:
      "Formatio Private School was founded in 1995 and pioneers personalized education, fosters strengths, and cultivates digital proficiency, preparing students for the 21st-century landscape with excellence and innovation.",
    focusAreas: [
      "Personalized education",
      "Digital proficiency",
      "Student strengths and innovation",
    ],
    imgSrc: "/images/partners/formatio.png",
    socialLinks: [
      {
        name: "Website",
        url: "https://www.formatio.li/en/",
        icon: <FaGlobe size={24} />,
      },
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/company/formatio-privatschule/",
        icon: <FaLinkedin size={24} />,
      },
      {
        name: "Facebook",
        url: "https://www.facebook.com/formatioprivatschule",
        icon: <FaFacebook size={24} />,
      },
      {
        name: "Instagram",
        url: "https://www.instagram.com/formatio_privatschule/",
        icon: <FaInstagram size={24} />,
      },
    ],
  },
];

function SocialIcons({
  partnerName,
  links,
}: {
  partnerName: string;
  links: SocialLink[];
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Link
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${partnerName} ${link.name} (opens in new tab)`}
          title={link.name}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-gray-700 transition-colors hover:border-eu-blue hover:text-eu-blue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eu-blue">
          <span aria-hidden="true">{link.icon}</span>
          <span className="text-sm font-medium">{link.name}</span>
          <span className="sr-only">opens in new tab</span>
        </Link>
      ))}
    </div>
  );
}

function PartnerWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-4 xl:w-1/2">
      <article className="h-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex h-full flex-col gap-4 text-left sm:flex-row sm:items-start sm:gap-5">
          {children}
        </div>
      </article>
    </div>
  );
}

function IntroText() {
  return (
    <div className="mx-auto mb-14 w-11/12 max-w-3xl space-y-5 text-gray-700">
      <DoubleHeadings
        top="PROJECT CONSORTIUM"
        bottom="Participating Organizations"
      />
      <h1 className="text-center text-3xl font-semibold text-gray-900 sm:text-4xl">
        About the Pathfinder Consortium
      </h1>
      <p className="text-center leading-relaxed">
        Pathfinder is an Erasmus+ collaboration across European education partners focused
        on practical, responsible AI adoption in higher education.
      </p>
      <ul className="mx-auto max-w-2xl space-y-1 text-left text-base leading-relaxed text-gray-700">
        <li>Combines academic, applied research, and school-level expertise.</li>
        <li>Builds tools and guidance for educators and students.</li>
        <li>Promotes knowledge-sharing, experimentation, and ethical AI practice.</li>
      </ul>
    </div>
  );
}

export default function About() {
  return (
    <section className="container mx-auto py-16">
      <IntroText />

      <div className="flex flex-wrap -m-4">
        {partners.map((partner) => (
          <PartnerWrapper key={partner.name}>
            <Image
              alt={`${partner.name} logo`}
              className="mb-2 w-44 flex-shrink-0 object-contain object-center sm:mb-0 sm:w-40"
              width={200}
              height={200}
              src={partner.imgSrc}
            />
            <div className="flex-grow">
              <h2 className="title-font text-xl font-semibold text-gray-900">
                {partner.name}
              </h2>
              <p className="mb-3 text-base font-medium text-gray-600">{partner.country}</p>
              <p className="mb-3 text-base leading-relaxed text-gray-700">
                {partner.description}
              </p>
              <ul className="mb-4 ml-5 list-disc space-y-1 text-sm leading-relaxed text-gray-700">
                {partner.focusAreas.map((focus) => (
                  <li key={focus}>{focus}</li>
                ))}
              </ul>
              <p className="mb-2 text-xs uppercase tracking-wide text-gray-500">
                External links (open in new tab)
              </p>
              <SocialIcons
                partnerName={partner.name}
                links={partner.socialLinks}
              />
            </div>
          </PartnerWrapper>
        ))}
      </div>
    </section>
  );
}
