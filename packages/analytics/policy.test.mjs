import { test } from 'node:test';
import assert from 'node:assert/strict';
import { enabled, safeLocation, readConsent } from './policy.mjs';
test('collection is restricted to production canonical hosts and valid IDs', () => {
 assert.equal(enabled('G-TEST123',true,'guard.ai-pathfinder.eu'),true);
 for (const host of ['localhost','deploy-preview-12.netlify.app','evilai-pathfinder.eu']) assert.equal(enabled('G-TEST123',true,host),false);
 assert.equal(enabled('G-TEST123',false,'ai-pathfinder.eu'),false);
 assert.equal(enabled(undefined,true,'ai-pathfinder.eu'),false);
});
test('URLs exclude query strings and fragments', () => assert.equal(safeLocation('https://guard.ai-pathfinder.eu/lab/demo?key=secret#answer'),'https://guard.ai-pathfinder.eu/lab/demo'));
test('analytics defaults to enabled without a saved preference', () => {
 for (const value of ['', 'other=yes', 'not_pf_analytics=no']) assert.equal(readConsent(value),true);
});
test('saved analytics preferences are honored with exact cookie matching', () => {
 assert.equal(readConsent('other=yes; pf_analytics=yes'),true);
 for (const value of ['pf_analytics=no', 'other=yes; pf_analytics=no; another=yes', 'pf_analytics=', 'pf_analytics=invalid', 'pf_analytics=yesterday']) assert.equal(readConsent(value),false);
});
