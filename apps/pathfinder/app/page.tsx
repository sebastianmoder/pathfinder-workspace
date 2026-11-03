import { products } from '@pathfinder/brand/products';
import Image from 'next/image';
import Link from 'next/link';
import Consortium from '@/components/Consortium';

const pathways = [
  { product: products[1], number: '01', verb: 'Find your bearings.', audience: 'For educators', body: 'Make informed decisions about AI in your teaching. Explore practical guidance on course design, assessment, and responsible use.', action: 'Explore SAGE', symbol: '✧' },
  { product: products[2], number: '02', verb: 'Learn by experimenting.', audience: 'For educators', body: 'Put ideas into practice in guided AI labs. Build prompts, examine the results, and reflect on what works for learning.', action: 'Try GUARD', symbol: '◇' },
  { product: products[3], number: '03', verb: 'Build your AI literacy.', audience: 'For educators and students', body: 'Develop the confidence to question, evaluate, and work thoughtfully with AI through a practical learning journey.', action: 'Visit ARTISAN', symbol: '↗' },
];

export default function Home() {
  return <>
    <section className="pf-hero pf-section">
      <div className="pf-hero-copy">
        <p className="pf-eyebrow">An Erasmus+ project · Higher education</p>
        <h1 className="pf-display">Find your way<br />with AI in higher education.</h1>
        <p className="pf-intro">New possibilities. Better questions. Thoughtful practice. Pathfinder helps educators and students explore AI with purpose, confidence, and critical judgment.</p>
        <div className="pf-actions"><Link className="pf-action" href="#deliverables">Explore the resources <span aria-hidden="true">↗</span></Link><Link className="pf-action pf-action-secondary" href="#consortium">Meet the project</Link></div>
      </div>
      <div className="pf-hero-art"><span className="pf-eyebrow">Guidance / Practice / Discovery</span><Image src="/brand/pathfinder.svg" alt="Pathfinder emblem: a winding path, wizard hat, shield, and sword" width={480} height={480} priority /><p>A shared path to thoughtful AI use.</p></div>
    </section>
    <section id="deliverables" className="pf-pathways">
      <div className="pf-section">
        <div className="pf-section-heading"><div><p className="pf-eyebrow">Choose your next step</p><h2 className="pf-display">Three ways forward.</h2></div><p>Start with a question, try an idea, or build a new skill. Each resource offers a different way into AI.</p></div>
        <div className="pf-pathway-grid">{pathways.map(({product,number,verb,audience,body,action,symbol}) => <Link key={product.id} href={product.url} aria-label={action} className={`pf-pathway pf-pathway-${product.id}`}>
          <div className="pf-pathway-top"><span className="pf-eyebrow">{number} / {product.name}</span><span aria-hidden="true" className="pf-pathway-symbol">{symbol}</span></div>
          <p className="pf-audience">{audience} <span>· {product.status}</span></p><h3 className="pf-display">{verb}</h3><p>{body}</p><span className="pf-pathway-action">{action} <span aria-hidden="true">↗</span></span>
        </Link>)}</div>
      </div>
    </section>
    <section className="pf-section pf-mission"><div><p className="pf-eyebrow">Our purpose</p><h2 className="pf-display">Human judgment.<br />New possibilities.</h2></div><div><p>Pathfinder advances the understanding and responsible adoption of AI in higher education. We connect practical teaching guidance with hands-on tools and learning experiences.</p><p>Our goal is to strengthen digital readiness, entrepreneurial innovation, and employability—equipping people to make purposeful choices as technology changes.</p><p className="pf-project-name">Pioneering AI Technology in Higher Education to Facilitate Innovation and Nurture the Development of Entrepreneurial Resources</p></div></section>
    <Consortium />
  </>;
}
