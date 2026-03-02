"use client";

import { useLocale } from "next-intl";
import { NAV_MENU, COMMON_FOOTER, LEGAL_CONTENT } from "@/config/site-content";

export default function PrivacyPage() {
  const locale = useLocale() as "en" | "es";

  const legal = LEGAL_CONTENT.contact[locale] || LEGAL_CONTENT.contact.en;

  return (
    <main className="max-w-4xl mx-auto px-6 py-12 lg:py-20">
      <div className="bg-white rounded-3xl shadow-xl p-8 lg:p-12 border border-white">
        <h1 className="text-3xl font-bold mb-8 border-b pb-4">
          {legal.title}
        </h1>

        <div className="whitespace-pre-line leading-loose text-[#356f5b] text-base">
          {legal.content}
        </div>
      </div>
    </main>
  );
}