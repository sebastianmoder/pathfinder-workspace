"use client";
import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { consentCookie, enabled, safeLocation, readConsent, eventNames } from './policy.mjs';
type Product = 'pathfinder' | 'sage' | 'guard' | 'artisan';
type EventName = 'product_navigation' | 'lab_start' | 'lab_complete' | 'mission_start' | 'mission_complete';
declare global { interface Window { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void; pfAnalytics?: { product: Product; active: boolean }; } }
export function track(event: EventName, item?: string) {
 if (!window.pfAnalytics?.active || !readConsent(document.cookie) || !eventNames.includes(event)) return;
 // Only static content identifiers; never accept arbitrary payload objects.
 window.gtag?.('event', event, { product: window.pfAnalytics.product, ...(item && /^[a-z0-9_-]{1,80}$/i.test(item) ? { item_id: item } : {}) });
}
function PageViews({ active, product }: { active: boolean; product: Product }) {
 const pathname = usePathname();
 const previous = useRef('');
 useEffect(() => {
  if (!active) { previous.current = ''; return; }
  if (previous.current === pathname) return;
  previous.current = pathname || '';
  window.gtag?.('event','page_view',{ page_location: safeLocation(window.location.href), page_referrer: document.referrer ? safeLocation(document.referrer) : '', product });
 }, [pathname, active, product]);
 return null;
}
export function Analytics({ product, measurementId, production }: { product: Product; measurementId?: string; production: boolean }) {
 const [consent,setConsent] = useState<boolean | null>(null);
 const [ready,setReady] = useState(false);
 const [preferences,setPreferences] = useState(false);
 useEffect(() => {
  const sync = () => { const accepted = readConsent(document.cookie); setConsent(accepted); if (!accepted) { if (window.pfAnalytics) window.pfAnalytics.active=false; setReady(false); } };
  sync(); window.addEventListener('focus',sync); document.addEventListener('visibilitychange',sync);
  return () => { window.removeEventListener('focus',sync); document.removeEventListener('visibilitychange',sync); };
 }, []);
 useEffect(() => {
  if (!consent || !enabled(measurementId,production,window.location.hostname)) return;
  const id = measurementId!;
  const w = window as unknown as Record<string, unknown>;
  w['ga-disable-' + id] = false;
  window.dataLayer ||= [];
  // eslint-disable-next-line prefer-rest-params -- Google's command queue expects an Arguments object
  window.gtag ||= function () { window.dataLayer!.push(arguments); };
  window.gtag('js',new Date());
  window.gtag('config',id,{ send_page_view:false, cookie_domain:'ai-pathfinder.eu', page_location:safeLocation(location.href), page_referrer:document.referrer ? safeLocation(document.referrer) : '' });
  window.pfAnalytics = { product, active:true };
  let script = document.getElementById('pf-ga');
  if (!script) { script=document.createElement('script');script.id='pf-ga';(script as HTMLScriptElement).async=true;(script as HTMLScriptElement).src='https://www.googletagmanager.com/gtag/js?id='+id;document.head.append(script); }
  setReady(true);
  return () => { window.pfAnalytics = { product,active:false }; };
 }, [consent,measurementId,production,product]);
 useEffect(() => {
  const clicked = (event: MouseEvent) => { const el = event.target instanceof Element ? event.target.closest('[data-pf-product]') : null; if (el) track('product_navigation',el.getAttribute('data-pf-product') || undefined); };
  document.addEventListener('click',clicked);return () => document.removeEventListener('click',clicked);
 }, []);
 function choose(value: boolean) {
  const domain = /(^|\.)ai-pathfinder\.eu$/.test(location.hostname) ? '; Domain=ai-pathfinder.eu' : '';
  document.cookie = `${consentCookie}=${value ? 'yes' : 'no'}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}${domain}`;
  if (!value) {
   if (measurementId) (window as unknown as Record<string,unknown>)['ga-disable-'+measurementId]=true;
   if (window.pfAnalytics) window.pfAnalytics.active=false;
   for (const cookie of document.cookie.split(';')) { const name=cookie.trim().split('=')[0];if (name==='_ga' || name.startsWith('_ga_')) for (const scope of ['', '; Domain=ai-pathfinder.eu', '; Domain='+location.hostname]) document.cookie=name+'=; Max-Age=0; Path=/'+scope; }
   setReady(false);
  }
  setConsent(value);setPreferences(false);
 }
 return <><Suspense fallback={null}><PageViews active={ready && !!consent} product={product}/></Suspense><aside className="pf-consent no-print" aria-label="Analytics preferences">
 {consent === null ? null : (!document.cookie.includes(consentCookie+'=') || preferences) ? <><p>Optional analytics helps us understand how Pathfinder resources are used. Google Analytics receives page visits and activity milestones, never your answers, prompts or uploaded content. Your choice applies across Pathfinder products.</p><button onClick={() => choose(true)}>Allow analytics</button><button onClick={() => choose(false)}>Decline analytics</button></> : <button onClick={() => setPreferences(true)}>Analytics preferences</button>}
 </aside></>;
}
