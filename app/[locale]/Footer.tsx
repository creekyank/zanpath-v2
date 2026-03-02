
import Link from "next/link";

export default function Footer({
  locale,
}: {
  locale: "en" | "es";
}) {
  const COMMON_FOOTER = {
    en: {
      about: "Zanpath AI provides AI-generated cultural and personal reflection content.",
      links: [
        { name: "Privacy Policy", href: `/${locale}/privacy` },
        { name: "Terms of Service", href: `/${locale}/terms` },
        { name: "Refund Policy", href: `/${locale}/refund` },
        { name: "Contact Us", href: `/${locale}/contact` },
      ],
    },
    es: {
      about: "Zanpath AI proporciona contenido de reflexión personal y cultural generado por IA.",
      links: [
        { name: "Privacidad", href: `/${locale}/privacy` },
        { name: "Términos", href: `/${locale}/terms` },
        { name: "Reembolso", href: `/${locale}/refund` },
        { name: "Contacto", href: `/${locale}/contact` },
      ],
    },
  };

  const foot = COMMON_FOOTER[locale];

  return (
    <footer className="mt-20 py-10 bg-transparent">
      <div className="max-w-5xl mx-auto px-6 text-center">

        <div className="max-w-2xl mx-auto mb-1">
          <p className="text-sm text-gray-500/80 leading-relaxed">
            {foot.about}
          </p >
        </div>

        <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2">
          <p className="text-sm text-gray-400">© 2026 Zanpath AI.</p >

          {foot.links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm text-[#356f5b] hover:text-[#0f3d2e] transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

      </div>
    </footer>
  );
}