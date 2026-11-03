export const consentCookie = 'pf_analytics';
export function enabled(id, production, hostname) {
 return production && /^G-[A-Z0-9]+$/.test(id || '') && /^(ai-pathfinder\.eu|(?:sage|guard|artisan)\.ai-pathfinder\.eu)$/.test(hostname);
}
export function safeLocation(href) { const url = new URL(href); return url.origin + url.pathname; }
export function readConsent(cookie) {
 const preference = cookie.split(';').map(c => c.trim()).find(c => c.startsWith(consentCookie + '='));
 // Default to enabled without recording an affirmative choice for the visitor.
 return preference === undefined || preference === consentCookie + '=yes';
}
export const eventNames = ['product_navigation','lab_start','lab_complete','mission_start','mission_complete'];
