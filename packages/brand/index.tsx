import type { ReactNode } from 'react';
import { products, type Product } from './products';
export { products, type Product } from './products';
export function ProjectHeader({ product, compact = false, children }: { product: Product; compact?: boolean; children?: ReactNode }) {
 return <header className={`pf-header no-print ${compact ? 'pf-compact' : ''}`}>
  <div className="pf-bar"><a className="pf-wordmark" href="https://ai-pathfinder.eu"><span aria-hidden="true">↗</span> Pathfinder</a>
   <nav aria-label="Pathfinder products" className="pf-products">{products.map(p => <a key={p.id} href={p.id === product ? '/' : p.url} aria-current={p.id === product ? 'true' : undefined} data-pf-product={p.id}>{p.name}</a>)}</nav>
  </div>{children && <div className="pf-local">{children}</div>}
 </header>;
}
export function ProjectFooter({ compact = false }: { compact?: boolean }) {
 return <footer className={`pf-footer no-print ${compact ? 'pf-compact' : ''}`}>
  <strong>Pathfinder · Learning to work thoughtfully with AI</strong>
  <p>Funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the European Education and Culture Executive Agency (EACEA). Neither the European Union nor EACEA can be held responsible for them.</p>
  <a href="https://erasmus-plus.ec.europa.eu/projects/search/details/2023-2-LI01-KA220-HED-000178579">Erasmus+ project 2023-2-LI01-KA220-HED-000178579</a>
  {/* eslint-disable-next-line @next/next/no-img-element -- shared static funding asset */}
  <img src="/brand/funded-by-eu.png" alt="Funded by the European Union" width="200" height="50" />
 </footer>;
}
