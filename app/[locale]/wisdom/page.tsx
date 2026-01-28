import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { ARTICLES } from "@/content/articles";

// SEO 元數據可以根據語言動態調整 (可選)
export const metadata = {
  title: "Wisdom | Zanpath AI Cultural Insights",
  description: "Explore the scientific foundations of ancient metaphysical wisdom, celestial mechanics, and personal energy dynamics.",
};

export default function Wisdom() {
  const locale = useLocale() as "en" | "es";
  
  // 從數據文件中獲取所有文章的 ID (slugs)
  const slugs = Object.keys(ARTICLES);

  // 翻譯列表頁的靜態文案
  const t = {
    en: {
      title: "Wisdom",
      subtitle: "Exploring the bridge between ancient metaphysical wisdom and modern celestial science.",
      readMore: "Read Full Article",
      placeholder: "More cosmic insights are being transcribed from our private archives...",
      back: "← Back to Analysis Tool",
      research: "Scientific Research"
    },
    es: {
      title: "Sabiduría",
      subtitle: "Explorando el puente entre la antigua sabiduría metafísica y la ciencia celeste moderna.",
      readMore: "Leer Artículo Completo",
      placeholder: "Se están transcribiendo más conocimientos cósmicos de nuestros archivos privados...",
      back: "← Volver a la Herramienta de Análisis",
      research: "Investigación Científica"
    }
  }[locale];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dff3ee] to-[#eaf7f2] text-[#0f3d2e] flex flex-col items-center px-4 py-16 font-sans">
      
      {/* Header Area */}
      <div className="mb-10 text-center">
        <div className="text-3xl mb-2">📜</div>
        <h1 className="text-4xl font-bold tracking-wide text-[#0f3d2e]">{t.title}</h1>
        <p className="text-sm text-[#356f5b] mt-2 max-w-md mx-auto">
          {t.subtitle}
        </p>
      </div>

      {/* Article List Container */}
      <div className="w-full max-w-2xl space-y-6">
        {slugs.map((slug) => {
          const post = ARTICLES[slug][locale]; // 根據當前語言獲取文章內容
          
          return (
            <div 
              key={slug}
              className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 transition hover:translate-y-[-4px] duration-300"
            >
              <div className="text-xs text-[#356f5b] mb-3 flex justify-between">
                <span>{post.category || t.research}</span>
                <span>{post.date}</span>
              </div>
              
              <h2 className="text-2xl font-bold mb-4 leading-tight">
                {post.title}
              </h2>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {post.desc}
              </p>

              <Link 
                href={`/wisdom/${slug}`}
                className="block w-full py-3 rounded-xl bg-[#0f3d2e] text-white font-semibold text-center hover:opacity-90 transition"
              >
                {t.readMore}
              </Link>
            </div>
          );
        })}

        {/* Placeholder */}
        <div className="p-8 border border-dashed border-[#356f5b]/30 rounded-3xl text-center text-[#356f5b]/60 text-sm">
          {t.placeholder}
        </div>
      </div>

      {/* Navigation Back */}
      <div className="mt-10">
        <Link href="/" className="text-sm underline text-[#356f5b] hover:text-[#0f3d2e]">
          {t.back}
        </Link>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-[#356f5b] max-w-xl pb-10">
        <div className="flex justify-center space-x-4 underline mb-4">
          <Link href="/privacy">{locale === 'es' ? 'Privacidad' : 'Privacy Policy'}</Link>
          <Link href="/terms">{locale === 'es' ? 'Términos' : 'Terms of Service'}</Link>
          <Link href="/contact">{locale === 'es' ? 'Contacto' : 'Contact Us'}</Link>
        </div>
        <p>© 2026 Zanpath AI. All rights reserved.</p>
      </footer>
    </div>
  );
}