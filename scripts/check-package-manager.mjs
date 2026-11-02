if (!process.env.npm_config_user_agent?.startsWith('pnpm/')) {
  console.error('This repository uses pnpm. Enable Corepack and run "pnpm install".');
  process.exit(1);
}
