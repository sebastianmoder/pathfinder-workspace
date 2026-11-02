export const consentCookie: string;
export function enabled(id: string | undefined, production: boolean, hostname: string): boolean;
export function safeLocation(href: string): string;
export function readConsent(cookie: string): boolean;
export const eventNames: string[];
