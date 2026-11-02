import Link from "next/link";
import { t } from "@/lib/i18n/en";

export default function NotFound() {
  return (
    <div>
      <h1 className="text-4xl">{t.notFound.title}</h1>
      <p className="mt-4">
        <Link href="/map" className="underline">{t.notFound.map}</Link>
      </p>
    </div>
  );
}
