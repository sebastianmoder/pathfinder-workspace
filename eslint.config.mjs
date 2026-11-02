import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
export default [...nextVitals, ...nextTs, { rules: { '@next/next/no-html-link-for-pages': 'off' } }, { ignores: ['apps/**','node_modules/**'] }, { files: ['packages/analytics/index.tsx'], rules: { 'react-hooks/set-state-in-effect': 'off' } }];
