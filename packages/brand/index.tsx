import type { ReactNode } from 'react';
import { products, type Product } from './products';
export { products, type Product } from './products';
export function ProjectHeader({ product, compact = false, children }: { product: Product; compact?: boolean; children?: ReactNode }) {
 return <header className={`pf-header no-print ${compact ? 'pf-compact' : ''}`}>
  <div className="pf-bar"><a className="pf-wordmark" href="https://ai-pathfinder.eu">{/* eslint-disable-next-line @next/next/no-img-element -- shared static emblem */}
<img src="/brand/pathfinder.svg" alt="" width="44" height="44" /> <span>Pathfinder</span></a>
   <nav aria-label="Pathfinder products" className="pf-products">{products.map(p => <a key={p.id} href={p.id === product ? '/' : p.url} aria-current={p.id === product ? 'true' : undefined} data-pf-product={p.id}>{p.name}</a>)}</nav>
  </div>{children && <div className="pf-local">{children}</div>}
 </header>;
}
export function ProjectFooter({ compact = false }: { compact?: boolean }) {
 return <footer className={`pf-footer no-print ${compact ? 'pf-compact' : ''}`}>
  <strong>Pathfinder · Learning to work thoughtfully with AI</strong>
  <a className="pf-source" href="https://github.com/sebastianmoder/pathfinder-workspace"><svg aria-hidden="true" focusable="false" viewBox="0 0 16 16" width="16" height="16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>All Pathfinder apps are open source — view on GitHub</a>
  <p>Funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the European Education and Culture Executive Agency (EACEA). Neither the European Union nor EACEA can be held responsible for them.</p>
  <a href="https://erasmus-plus.ec.europa.eu/projects/search/details/2023-2-LI01-KA220-HED-000178579">Erasmus+ project 2023-2-LI01-KA220-HED-000178579</a>
  {/* eslint-disable-next-line @next/next/no-img-element -- shared static funding asset */}
  <img src="/brand/funded-by-eu.png" alt="Funded by the European Union" width="200" height="50" />
 </footer>;
}
