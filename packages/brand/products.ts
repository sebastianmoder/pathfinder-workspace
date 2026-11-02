export const products = [
 { id: 'pathfinder', name: 'Pathfinder', url: 'https://ai-pathfinder.eu', status: 'Live', description: 'The project and its partners' },
 { id: 'sage', name: 'SAGE', url: 'https://sage.ai-pathfinder.eu', status: 'Live', description: 'Guidance for teaching with AI' },
 { id: 'guard', name: 'GUARD', url: 'https://guard.ai-pathfinder.eu', status: 'Beta testing', description: 'Guided AI labs for educators' },
 { id: 'artisan', name: 'ARTISAN', url: 'https://artisan.ai-pathfinder.eu', status: 'Live', description: 'Learn to think better with AI' },
] as const;
export type Product = typeof products[number]['id'];
