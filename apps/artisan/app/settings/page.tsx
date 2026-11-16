import type { Metadata } from "next";
import { Settings } from "@/components/settings";
import { t } from "@/lib/i18n/en";

export const metadata: Metadata = { title: t.settings.title };

export default function SettingsPage() {
  return <Settings />;
}
