

import Link from "next/link";

// 这段代码是给 Google 爬虫看的，不会显示在页面上
export const metadata = {
    title: "The Celestial Mechanics of Life | Zanpath AI Wisdom",
    description: "Discover the scientific link between planetary gravity and human destiny. Learn how Jupiter's cycle and solar tides shape your energy signature.",
  };

export default function ArticleDetail() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dff3ee] to-[#eaf7f2] text-[#0f3d2e] flex flex-col items-center px-4 py-16 font-sans">
      
      {/* Back Button */}
      <div className="w-full max-w-2xl mb-8">
        <Link href="/wisdom" className="text-sm text-[#356f5b] hover:text-[#0f3d2e] flex items-center transition">
          ← Back to Wisdom
        </Link>
      </div>

      {/* Main Content Card */}
      <article className="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 md:p-12 text-[#0f3d2e]">
        
        {/* Category & Date */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-[#c6a355] mb-4 uppercase tracking-widest">
          <span>Science & Spirituality</span>
          <span className="text-gray-300">•</span>
          <span>Jan 18, 2026</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">
          The Celestial Mechanics of Life: Why the Moment of Your Birth Matters
        </h1>

        {/* Article Body */}
        <div className="space-y-6 text-gray-700 leading-relaxed text-base md:text-lg">
          <p className="font-medium text-[#0f3d2e]">
            Have you ever wondered why life flows in rhythms? Why do civilizations, economies, and even our personal moods seem to rise and fall in predictable waves?
          </p>

          <p>
            The answer isn't written in "luck"—it is encoded in the very fabric of our solar system. Ancient Chinese masters called this <strong>BaZi</strong>, but today, we might call it <strong>Cosmic Chronobiology</strong>: the study of how celestial gravity prints a unique "energy signature" on every living being at the moment of their first breath.
          </p>

          <h2 className="text-xl font-bold text-[#0f3d2e] pt-4">1. The Gravity of Destiny: The Three-Spoon Metaphor</h2>
          <p>
            Imagine a vast cauldron of soup representing the energy field of Earth. Now, imagine three master chefs stirring this soup with giant spoons at different speeds:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>The Sun:</strong> The source of all vitality and the center of our system.</li>
            <li><strong>The Moon:</strong> The closest driver of our tides and biological fluids.</li>
            <li><strong>Jupiter (The Grand Duke):</strong> The largest planet, exerting a massive gravitational pull every 12 years.</li>
          </ul>
          <p>
            As these "spoons" rotate, they create complex swirls in the energy soup. If you are born at a specific second, you emerge into a specific ripple. The direction and momentum of that wave define the trajectory of your journey.
          </p>

          <h2 className="text-xl font-bold text-[#0f3d2e] pt-4">2. Jupiter: The Clockwork of the 12-Year Cycle</h2>
          <p>
            Ancient wisdom focused heavily on Jupiter. Its 11.86-year orbital period is the scientific foundation of the 12 Zodiac signs. When we say it is the "Year of the Wood Dragon," we are describing a precise astronomical alignment that dictates the "flavor" of the year's energy.
          </p>

          <h2 className="text-xl font-bold text-[#0f3d2e] pt-4">3. The Precision of "True Solar Time"</h2>
          <p>
            This is why your exact hour of birth is critical. It represents the Earth's precise orientation toward the Sun. Our analysis uses <strong>True Solar Time</strong> to ensure we are mapping your life against actual celestial coordinates, not a man-made timezone.
          </p>

          <div className="mt-10 p-6 bg-[#dff3ee]/50 rounded-2xl border border-[#356f5b]/20">
            <h3 className="font-bold mb-2">Ready to decode your own map?</h3>
            <p className="text-sm mb-4">
              Understanding the celestial mechanics behind your life doesn't take away your power—it gives you the ultimate map to master it.
            </p>
            <Link href="/">
              <button className="w-full py-3 rounded-xl bg-[#0f3d2e] text-white font-semibold hover:bg-[#1a5c48] transition">
                Generate My Personal Analysis
              </button>
            </Link>
          </div>
        </div>
      </article>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-[#356f5b] opacity-70">
        <p>© 2026 Zanpath AI • For educational and self-exploration purposes only.</p>
      </footer>
    </div>
  );
}