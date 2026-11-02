import Link from 'next/link';
import { DEFAULT_MODEL } from '@/lib/constants';

const items = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
      </svg>
    ),
    title: 'Powered by a free model',
    body: (
      <>
        By default, GUARD runs on <span className="font-medium text-guard-blue-800">{DEFAULT_MODEL}</span>, a free model that works without sign-up or an API key. It is intended to get you through the labs immediately; if you want stronger or more specialized models, you can switch later in Settings.
      </>
    ),
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
      </svg>
    ),
    title: 'Unlock more powerful models',
    body: (
      <>
        Want to run ChatGPT, Claude, Gemini, Llama, Mistral, or another OpenRouter model directly inside GUARD? Add your own OpenRouter API key on the{' '}
        <Link href="/settings" className="font-medium text-guard-accent underline underline-offset-2 hover:opacity-80">
          Settings page
        </Link>{' '}
        to unlock the full model catalogue and choose the endpoint that best fits your workflow.
      </>
    ),
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
      </svg>
    ),
    title: 'Use your own AI interface',
    body: (
      <>
        You don&apos;t have to use GUARD&apos;s built-in chat at all. Each lab assembles a structured prompt scaffold that you can <span className="font-medium text-guard-blue-800">copy into any AI interface</span> — ChatGPT, Claude, Gemini, Copilot, or any other tool you already use.
      </>
    ),
  },
];

export function HowItWorks() {
  return (
    <section className="pb-16 border-t border-guard-border pt-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-guard-blue-400 mb-8">
        Good to know before you start
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-8">
        {items.map((item) => (
          <div key={item.title} className="flex gap-3">
            <div className="mt-0.5 text-guard-blue-400 flex-shrink-0">
              {item.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-guard-blue-700 mb-1">{item.title}</h3>
              <p className="text-sm text-guard-blue-500 leading-relaxed">{item.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
