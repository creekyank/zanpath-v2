

import Link from "next/link";

// 🟢 这里可以增加列表页的 SEO 元数据
export const metadata = {
    title: "Wisdom | Zanpath AI Cultural Insights",
    description: "Explore the scientific foundations of ancient metaphysical wisdom, celestial mechanics, and personal energy dynamics.",
  };

// 建议将数据放在组件外，避免重复渲染
const articles = [
  {
    id: "celestial-mechanics",
    title: "The Celestial Mechanics of Life: Why the Moment of Your Birth Matters",
    excerpt: "Ancient Chinese masters called this BaZi, but today, we might call it Cosmic Chronobiology: the study of how celestial gravity prints a unique energy signature...",
    date: "Jan 18, 2026",
    slug: "celestial-mechanics", 
  },

  {
    id: "variable-trajectories",
    title: "Understanding Divergent Life Trajectories",
    excerpt: "Exploring the multi-dimensional variables of personal growth and timing...",
    date: "Jan 19, 2026",
    slug: "variable-trajectories",
  },

];

export default function Wisdom() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dff3ee] to-[#eaf7f2] text-[#0f3d2e] flex flex-col items-center px-4 py-16 font-sans">
      
      {/* Header Area */}
      <div className="mb-10 text-center">
        <div className="text-3xl mb-2">📜</div>
        <h1 className="text-4xl font-bold tracking-wide text-[#0f3d2e]">Wisdom</h1>
        <p className="text-sm text-[#356f5b] mt-2 max-w-md mx-auto">
          Exploring the bridge between ancient metaphysical wisdom and modern celestial science.
        </p>
      </div>

      {/* Article List Container */}
      <div className="w-full max-w-2xl space-y-6">
        {articles.map((post) => (
          <div 
            key={post.id}
            className="bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 transition hover:translate-y-[-4px] duration-300"
          >
            <div className="text-xs text-[#356f5b] mb-3 flex justify-between">
              <span>Scientific Research</span>
              <span>{post.date}</span>
            </div>
            
            <h2 className="text-2xl font-bold mb-4 leading-tight">
              {post.title}
            </h2>
            
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {post.excerpt}
            </p>

            {/* 修正：Link 内部直接包裹样式，不使用 button 标签以避免嵌套冲突 */}
            <Link 
              href={`/wisdom/${post.slug}`}
              className="block w-full py-3 rounded-xl bg-[#0f3d2e] text-white font-semibold text-center hover:opacity-90 transition"
            >
              Read Full Article
            </Link>
          </div>
        ))}

        {/* Placeholder */}
        <div className="p-8 border border-dashed border-[#356f5b]/30 rounded-3xl text-center text-[#356f5b]/60 text-sm">
          More cosmic insights are being transcribed from our private archives...
        </div>
      </div>

      {/* Navigation Back */}
      <div className="mt-10">
        <Link href="/" className="text-sm underline text-[#356f5b] hover:text-[#0f3d2e]">
          ← Back to Analysis Tool
        </Link>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-[#356f5b] max-w-xl pb-10">
        <div className="flex justify-center space-x-4 underline mb-4">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/contact">Contact Us</Link>
        </div>
        <p>© 2026 Zanpath AI. All rights reserved.</p>
      </footer>
    </div>
  );
}