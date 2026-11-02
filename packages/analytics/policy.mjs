export const consentCookie = 'pf_analytics';
export function enabled(id, production, hostname) {
 return production && /^G-[A-Z0-9]+$/.test(id || '') && /^(ai-pathfinder\.eu|(?:sage|guard|artisan)\.ai-pathfinder\.eu)$/.test(hostname);
}
export function safeLocation(href) { const url = new URL(href); return url.origin + url.pathname; }
export function readConsent(cookie) { return cookie.split(';').some(c => c.trim() === consentCookie + '=yes'); }
export const eventNames = ['product_navigation','lab_start','lab_complete','mission_start','mission_complete'];
