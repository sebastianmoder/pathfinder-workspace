import { products } from '@pathfinder/brand/products';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import Consortium from '@/components/Consortium';

const icon = (paths: ReactNode) => <svg aria-hidden="true" className="pf-pathway-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paths}</svg>;

const outputs = [
  {
    product: products[1], number: '01', mode: 'Read', audience: 'For educators',
    body: 'Practical guidance for deciding when and how to use generative AI in courses, activities, and assessments.',
    action: 'Browse the SAGE knowledge base',
    icon: icon(<path d="M3 6c3-1.5 6-1.5 9 0v13c-3-1.5-6-1.5-9 0zM12 6c3-1.5 6-1.5 9 0v13c-3-1.5-6-1.5-9 0" />),
  },
  {
    product: products[2], number: '02', mode: 'Apply', audience: 'For educators',
    body: 'Bring a real teaching task. GUARD asks guiding questions, turns your answers into a prompt, and helps you check the AI’s output before you use it.',
    action: 'Open the GUARD web app',
    icon: icon(<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 8.5h18M8 14.5l2.5 2.5 5.5-5" /></>),
  },
  {
    product: products[3], number: '03', mode: 'Learn', audience: 'For educators and students',
    body: 'Interactive missions in which you investigate evidence, test claims, and make decisions, then apply each skill to a new case. Four stages lead to a final capstone.',
    action: 'Start the ARTISAN journey',
    icon: icon(<><circle cx="5" cy="19" r="2" /><circle cx="19" cy="5" r="2" /><path d="M7 19h8.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H17" /></>),
  },
];

export default function Home() {
  return <>
    <section className="pf-hero pf-section">
      <div className="pf-hero-copy">
        <p className="pf-eyebrow">An Erasmus+ project · Higher education</p>
        <h1 className="pf-display">Find your way<br />with AI in higher education.</h1>
        <p className="pf-intro">New possibilities. Better questions. Thoughtful practice. Pathfinder helps educators and students explore AI with purpose, confidence, and critical judgment.</p>
        <div className="pf-actions"><Link className="pf-action" href="#deliverables">Explore the outputs <span aria-hidden="true">↗</span></Link><Link className="pf-action pf-action-secondary" href="#consortium">Meet the project</Link></div>
      </div>
      <div className="pf-hero-art"><span className="pf-eyebrow">Read / Apply / Learn</span><Image src="/brand/pathfinder.svg" alt="Pathfinder emblem: a winding path, wizard hat, shield, and sword" width={480} height={480} priority /><p>A shared path to thoughtful AI use.</p></div>
    </section>
    <section id="deliverables" className="pf-pathways" aria-labelledby="outputs-heading">
      <div className="pf-section">
        <div className="pf-section-heading"><div><p className="pf-eyebrow">Three project outputs</p><h2 id="outputs-heading" className="pf-display">Read. Apply. Learn.</h2></div><p>SAGE explains what educators need to know about AI in education. GUARD helps them apply it to everyday teaching tasks. ARTISAN builds the AI literacy that educators and students need to use AI well.</p></div>
        <div className="pf-pathway-grid">{outputs.map(({ product, number, mode, audience, body, action, icon }) => <article key={product.id} className={`pf-pathway pf-pathway-${product.id}`}>
          <div className="pf-pathway-top"><span className="pf-eyebrow">{number} · {mode}</span>{icon}</div>
          <h3 className="pf-display">{product.name}</h3>
          <p className="pf-pathway-lead">{product.description}.</p>
          <p className="pf-audience">{audience} <span>· {product.status}</span></p>
          <p className="pf-pathway-body">{body}</p>
          <Link href={product.url} className="pf-pathway-action">{action} <span aria-hidden="true">↗</span></Link>
        </article>)}</div>
      </div>
    </section>
    <section className="pf-section pf-mission"><div><p className="pf-eyebrow">Our purpose</p><h2 className="pf-display">Human judgment.<br />New possibilities.</h2></div><div><p>Pathfinder advances the understanding and responsible adoption of AI in higher education. We connect a knowledge base on AI in education, a web app for everyday teaching tasks, and a learning journey in AI literacy.</p><p>Our goal is to strengthen digital readiness, entrepreneurial innovation, and employability—equipping people to make purposeful choices as technology changes.</p><p className="pf-project-name">Pioneering AI Technology in Higher Education to Facilitate Innovation and Nurture the Development of Entrepreneurial Resources</p></div></section>
    <Consortium />
  </>;
}
