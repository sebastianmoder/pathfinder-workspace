import { Header } from "@/components/layout/Header";
import { HistoryList } from "@/components/history/HistoryList";

export const metadata = {
  title: "Session History | GUARD",
};

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-guard-bg">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-2xl font-semibold text-guard-blue-900 mb-2">
          Session History
        </h1>
        <p className="text-sm text-guard-blue-500 mb-6">
          Resume an unfinished session or review completed labs.
        </p>

        {/* Storage notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 mb-8 flex gap-3">
          <svg
            className="w-5 h-5 text-amber-500 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
          <div className="text-sm text-amber-800 space-y-1.5">
            <p className="font-semibold">
              Your history is stored only in your browser
            </p>
            <p>
              Sessions are saved automatically in your browser&apos;s local
              storage — they stay on your device and are never sent to a server.
              This means:
            </p>
            <ul className="list-disc list-inside space-y-1 text-amber-700">
              <li>
                Your history is only visible in the specific browser and device
                you used to run the lab.
              </li>
              <li>
                Clearing your browser data or cache will permanently erase all
                sessions.
              </li>
              <li>
                Only the most recent <strong>20 sessions</strong> are kept.
                Older ones are automatically removed when this limit is reached.
              </li>
            </ul>
            <p className="pt-0.5">
              <strong>There is no way to recover a lost session.</strong> If an
              AI output or your notes are worth keeping, copy or export them
              before clearing your browser.
            </p>
          </div>
        </div>

        <HistoryList />
      </main>
    </div>
  );
}
