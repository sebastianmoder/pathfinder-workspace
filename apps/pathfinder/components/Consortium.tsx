import React from "react";
import Image from "next/image";
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
    <div className="pf-partner-links">
      {links.map((link) => (
        <Link
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${partnerName} ${link.name} (opens in new tab)`}
          title={link.name}
          className="pf-partner-link"
        >
          <span aria-hidden="true">{link.icon}</span>
          <span className="text-sm font-medium">{link.name}</span>
          <span className="sr-only">opens in new tab</span>
        </Link>
      ))}
    </div>
  );
}

export default function Consortium() {
  return (
    <section
      id="consortium"
      className="pf-partners"
      aria-labelledby="consortium-heading"
    >
      <div className="pf-section">
        <div className="pf-section-heading">
          <div>
            <p className="pf-eyebrow">The project consortium</p>
            <h2
              id="consortium-heading"
              className="pf-display"
            >
              A shared effort across Europe.
            </h2>
          </div>
          <p>
            Four education partners in Liechtenstein, Finland, and Croatia combine
            academic, applied research, and school-level expertise to support practical,
            responsible AI use.
          </p>
        </div>
        <p className="pf-consortium-intro">
          Together, we build tools and guidance for educators and students, share
          knowledge across institutions, and create space for experimentation and ethical
          AI practice. Meet the organizations behind Pathfinder and connect with them
          below.
        </p>
        <div className="pf-partner-grid">
          {partners.map((partner) => (
            <article
              className="pf-partner"
              key={partner.name}
            >
              <div className="pf-partner-heading">
                <div className="pf-partner-logo">
                  <Image
                    alt={`${partner.name} logo`}
                    width={200}
                    height={200}
                    src={partner.imgSrc}
                  />
                </div>
                <div>
                  <p className="pf-eyebrow">{partner.country}</p>
                  <h3 className="pf-display">{partner.name}</h3>
                </div>
              </div>
              <p className="pf-partner-description">{partner.description}</p>
              <SocialIcons
                partnerName={partner.name}
                links={partner.socialLinks}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
