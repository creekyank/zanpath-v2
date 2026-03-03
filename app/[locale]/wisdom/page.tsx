
import { getAllArticles } from "@/lib/article-loader";
import Link from "next/link";

const baseUrl = "https://zanpath.com";

export async function generateMetadata({ params }: any) {
  const { locale } = await params;

  return {
    title: "Spiritual Wisdom & Destiny Insights | Zanpath",
    description:
      "Explore life path, dream meaning, naming and destiny insights powered by ancient metaphysics.",
    alternates: {
      canonical: `${baseUrl}/${locale}/wisdom`,
      languages: {
        en: `${baseUrl}/en/wisdom`,
        es: `${baseUrl}/es/wisdom`,
      },
    },
  };
}

export default async function WisdomPage({ params }: any) {
  const { locale } = await params;

  const t =
    locale === "es"
      ? {
          wisdom: "Sabiduría",
          subtitle:
            "Perspectivas espirituales, interpretación de sueños y análisis del destino basados en la metafísica antigua.",
          latest: "Artículos Recientes",
          read: "Leer Artículo",
        }
      : {
          wisdom: "Wisdom",
          subtitle:
            "Spiritual insights, dream meanings and destiny analysis powered by ancient metaphysics.",
          latest: "Latest Articles",
          read: "Read Article",
        };

  /* ✅ 只新增：模块名称双语映射 */
  const moduleNames: Record<string, string> =
    locale === "es"
      ? {
          dream: "Sueños",
          space: "Espacio",
          naming: "Nombres",
          "life-path": "Camino de Vida",
          visual: "Visual",
        }
      : {
          dream: "Dream",
          space: "Space",
          naming: "Naming",
          "life-path": "Life Path",
          visual: "Visual",
        };

  const articles = getAllArticles(locale);

  const latest = articles.slice(0, 5);
  const modules = Array.from(new Set(articles.map((a) => a.module)));

  return (
    <main className="max-w-4xl mx-auto px-6 py-16 flex flex-col items-center">
      {/* Header */}
      <div className="mb-16 text-center max-w-2xl">
        <div className="text-4xl mb-4">📜</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          {t.wisdom}
        </h1>
        <p className="text-[#4a7c6d] text-sm leading-relaxed">
          {t.subtitle}
        </p >
      </div>

      {/* Latest Articles */}
      <div className="w-full space-y-8 mb-16">
        <h2 className="text-2xl font-bold text-center mb-6">
          {t.latest}
        </h2>

        {latest.map((a) => (
          <div
            key={a.slug}
            className="bg-white rounded-3xl shadow-xl shadow-[#dff3ee]/50 p-8 border border-white transition hover:translate-y-[-4px] duration-300"
          >
            {/* ✅ 这里改成翻译后的模块名 */}
            <div className="text-xs font-bold text-[#356f5b] mb-3 uppercase tracking-wider">
              {moduleNames[a.module] ?? a.module}
            </div>

            <h3 className="text-xl font-bold mb-4 leading-tight">
              {a.title}
            </h3>

            <Link
              href={`/${a.locale}/wisdom/${a.module}/${a.slug}`}
              className="inline-block px-6 py-2 rounded-xl bg-[#0f3d2e] text-white text-sm font-semibold hover:opacity-90 transition"
            >
              {t.read}
            </Link>
          </div>
        ))}
      </div>

      {/* Module Sections */}
      <div className="w-full space-y-16">
        {modules.map((module) => (
          <div key={module}>
            {/* ✅ 这里也改成翻译后的模块名 */}
            <h2 className="text-2xl font-bold text-center mb-8 capitalize">
              {moduleNames[module] ?? module}
            </h2>

            <div className="space-y-6">
              {articles
                .filter((a) => a.module === module)
                .slice(0, 5)
                .map((a) => (
                  <div
                    key={a.slug}
                    className="bg-white rounded-2xl shadow-md p-6 border border-white transition hover:translate-y-[-3px] duration-300"
                  >
                    <h3 className="text-lg font-semibold mb-2">
                      <Link href={`/${a.locale}/wisdom/${a.module}/${a.slug}`}>
                        {a.title}
                      </Link>
                    </h3>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}