import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LanguagePicker } from "@/components/onboarding/LanguagePicker";
import { LOCALE_COOKIE, isLocale } from "@/lib/i18n/config";

/** "/" sends a returning user straight to their locale; a new user picks a language. */
export default async function Home() {
  const store = await cookies();
  const picked = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(picked)) redirect(`/${picked}`);
  return <LanguagePicker />;
}
