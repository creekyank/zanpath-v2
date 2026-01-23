import Link from "next/link";

export default function SpaceReflectionComingSoon() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dff3ee] to-[#eaf7f2] text-[#0f3d2e]">
      <div className="flex justify-center">
        <nav className="w-full max-w-5xl flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Zanpath AI Logo" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg tracking-tight">Zanpath AI</span>
          </div>
          <div className="flex items-center space-x-6 text-sm font-medium text-[#356f5b]">
            <Link href="/" className="hover:text-[#0f3d2e]">Bazi AI</Link>
            <Link href="/naming" className="hover:text-[#0f3d2e]">Naming</Link>
            <Link href="/dream" className="hover:text-[#0f3d2e]">Dream</Link>
            <Link href="/fengshui" className="text-[#0f3d2e] border-b-2 border-[#0f3d2e] pb-1">Space</Link>
            <Link href="/face" className="hover:text-[#0f3d2e]">Visual</Link>
          </div>
        </nav>
      </div>

      <div className="flex justify-center px-6 py-16">
        <div className="max-w-xl w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 text-center">
          <h1 className="text-3xl font-bold mb-3">AI Space Reflection</h1>
          <p className="text-sm text-[#356f5b] mb-6">
            AI-generated lifestyle and space-related reflection content.
          </p>

          <div className="border border-dashed border-gray-300 rounded-xl p-5 bg-gray-50/60 text-sm">
            <p className="font-semibold mb-2">🚧 Under Development</p>
            <p>
              This feature explores descriptive and reflective content
              related to living and working environments.
            </p>

            <ul className="mt-4 space-y-1 text-left">
              <li>• Space-related reflection prompts</li>
              <li>• Cultural and symbolic inspiration</li>
              <li>• AI-generated descriptive text</li>
            </ul>

            <p className="mt-4 text-xs text-gray-500">
              Not included in current paid plans.
              <br />
              For entertainment and self-exploration purposes only.
              This service does not provide medical, legal, or financial advice.
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-16 text-center text-xs text-[#356f5b] max-w-xl mx-auto pb-10">
  <p className="mb-2">
    Zanpath AI provides AI-generated cultural and personal reflection content.
  </p>
  <p>
    For entertainment and self-exploration purposes only.
    This service does not provide medical, legal, or financial advice.
  </p>

  <div className="mt-4 flex justify-center space-x-4 underline">
    <Link href="/wisdom">Wisdom</Link>
    <Link href="/privacy">Privacy Policy</Link>
    <Link href="/terms">Terms of Service</Link>
    <Link href="/refund">Refund Policy</Link>
    <Link href="/contact">Contact Us</Link>
  </div>
</footer>


    </div>
  );
}
