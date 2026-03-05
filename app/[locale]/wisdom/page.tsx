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
            "Perspectivas espirituales, interpretación de sueños y análisis del camino de vida basados en la metafísica antigua.",
          latest: "Artículos Recientes",
          read: "Leer Artículo",
          viewAll: "Ver Todos",
          articles: "Artículos",
        }
      : {
          wisdom: "Wisdom",
          subtitle:
            "Spiritual insights, dream meanings and life path analysis powered by ancient metaphysics.",
          latest: "Latest Articles",
          read: "Read Article",
          viewAll: "View All",
          articles: "Articles",
        };

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
    <main className="max-w-5xl mx-auto px-6 py-20">

      {/* ===== Header ===== */}
      <section className="text-center mb-24">
        <div className="text-5xl mb-6">📜</div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          {t.wisdom}
        </h1>

        <p className="text-[#4a7c6d] text-base leading-relaxed max-w-2xl mx-auto">
          {t.subtitle}
        </p >
      </section>

      {/* ===== Latest Articles ===== */}
      <section className="mb-28">
        <h2 className="text-3xl font-bold text-center mb-12">
          {t.latest}
        </h2>

        <div className="grid md:grid-cols-2 gap-10">
          {latest.map((a) => (
            <div
              key={a.slug}
              className="bg-white rounded-3xl shadow-lg p-10 border border-gray-100 transition hover:-translate-y-1 duration-300"
            >
              <div className="text-xs font-semibold text-[#356f5b] mb-4 uppercase tracking-wider">
                {moduleNames[a.module] ?? a.module}
              </div>

              <h3 className="text-2xl font-bold mb-6 leading-snug">
                {a.title}
              </h3>

              <Link
                href={`/${a.locale}/wisdom/${a.module}/${a.slug}`}
                className="inline-block px-6 py-3 rounded-full bg-[#0f3d2e] text-white text-sm font-semibold hover:opacity-90 transition"
              >
                {t.read}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Module Sections ===== */}
      <section className="space-y-28">
        {modules.map((module) => {
          const moduleArticles = articles.filter(
            (a) => a.module === module
          );
          const count = moduleArticles.length;

          return (
            <div
              key={module}
              className="bg-[#f9fbfa] rounded-3xl px-10 py-14"
            >
              {/* 模块标题区 */}
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold capitalize mb-2">
                  <Link
                    href={`/${locale}/wisdom/${module}`}
                    className="hover:underline"
                  >
                    {moduleNames[module] ?? module}
                  </Link>
                </h2>

                <p className="text-sm text-gray-500">
                  {count} {t.articles}
                </p >

                <div className="mt-6">
                  <Link
                    href={`/${locale}/wisdom/${module}`}
                    className="inline-block px-6 py-2 rounded-full border border-[#0f3d2e] text-[#0f3d2e] text-sm font-semibold hover:bg-[#0f3d2e] hover:text-white transition"
                  >
                    {t.viewAll}
                  </Link>
                </div>
              </div>

              {/* 文章预览 */}
              <div className="grid md:grid-cols-2 gap-8">
                {moduleArticles.slice(0, 4).map((a) => (
                  <div
                    key={a.slug}
                    className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 transition hover:-translate-y-1 duration-300"
                  >
                    <h3 className="text-lg font-semibold leading-snug">
                      <Link href={`/${a.locale}/wisdom/${a.module}/${a.slug}`}>
                        {a.title}
                      </Link>
                    </h3>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

    </main>
  );
}