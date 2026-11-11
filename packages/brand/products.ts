export const products = [
 { id: 'pathfinder', name: 'Pathfinder', url: 'https://ai-pathfinder.eu', status: 'Live', description: 'The project and its partners' },
 { id: 'sage', name: 'SAGE', url: 'https://sage.ai-pathfinder.eu', status: 'Live', description: 'A knowledge base on AI in education' },
 { id: 'guard', name: 'GUARD', url: 'https://guard.ai-pathfinder.eu', status: 'Live', description: 'A web app to augment educators’ tasks' },
 { id: 'artisan', name: 'ARTISAN', url: 'https://artisan.ai-pathfinder.eu', status: 'Live', description: 'A learning journey to build AI literacy' },
] as const;
export type Product = typeof products[number]['id'];
