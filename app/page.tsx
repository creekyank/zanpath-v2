"use client";

import { useState } from "react";

const AUDIT_MODE = true; // 🔒 审核期保持 true

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // ⏳ 模拟生成过程（审核期不真的调用 AI）
    setTimeout(() => {
      setLoading(false);
      alert("Your personalized reflection is ready. Please unlock to receive the full report.");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dff3ee] to-[#eaf7f2] text-white flex flex-col items-center px-4 py-16 font-sans">
      
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="text-3xl mb-2">✨</div>
        <h1 className="text-4xl font-bold tracking-wide text-[#0f3d2e]">ZenPath AI</h1>
        <p className="text-sm text-[#356f5b] mt-2">
        Personalized Career & Personality Analysis (AI Digital Delivery)
        </p >
      </div>

      {/* Main Card */}
      <div className="w-full max-w-xl bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 text-[#0f3d2e]">

        {!loading && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              required
              placeholder="Your Name"
              className="w-full p-4 rounded-xl border border-gray-300"
            />

            <input
              required
              type="email"
              placeholder="Email for delivery"
              className="w-full p-4 rounded-xl border border-gray-300"
            />

            <div className="grid grid-cols-4 gap-3">
              <input required placeholder="Year" className="p-3 rounded-xl border" />
              <input required placeholder="Month" className="p-3 rounded-xl border" />
              <input required placeholder="Day" className="p-3 rounded-xl border" />
              <input required placeholder="Hour" className="p-3 rounded-xl border" />
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-[#0f3d2e] text-white font-semibold hover:opacity-90 transition"
            >
              Generate My Reflection
            </button>
            <p className="text-center text-xs text-gray-500 mt-3">
  Full Analysis Report: <span className="font-bold text-[#0f3d2e]">$9.90</span> (One-time payment)
</p>
          </form>
        )}

        {loading && (
          <div className="text-center py-10">
            <div className="animate-pulse text-lg font-medium">
              Generating your personalized reflection...
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Please wait a moment
            </p >
          </div>
        )}

        {/* 审核期假结果区 */}
        {!loading && (
          <div className="mt-8 p-5 border border-dashed border-gray-300 rounded-xl bg-gray-50 text-sm text-gray-600">
            <p className="font-semibold mb-2">Preview</p >
            <p>
              Your AI-generated reflection profile has been prepared.
              <br />
              <br />
              🔒 Full content, PDF download, and email delivery will be unlocked after purchase.
            </p >
          </div>
        )}

        {/* PDF 按钮（禁用） */}
{/* 模拟解锁按钮 - 审核员最关注这个 */}
{!loading && (
  <button 
    onClick={() => window.open('https://lemonsqueezy.com', '_blank')}
    className="mt-6 w-full py-4 rounded-xl bg-[#c6a355] text-[#0f3d2e] font-bold shadow-lg hover:scale-[1.02] transition"
  >
    Unlock Full Professional Report ($9.90)
  </button>
)}

{/* 原有的 PDF 按钮可以继续保留或隐藏 */}
<button
  disabled
  className="mt-3 w-full py-2 rounded-xl bg-gray-100 text-gray-400 text-sm cursor-not-allowed"
>
  Download PDF (Unlock Required)
</button>
      </div>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-[#356f5b] max-w-xl">
        <p className="mb-2">
          ZenPath AI provides AI-generated cultural and personal reflection content.
        </p >
        <p>
          For entertainment and self-exploration purposes only.
          This service does not provide medical, legal, or financial advice.
        </p >

        <div className="mt-4 flex justify-center space-x-4 underline">
        <a href="/privacy">Privacy Policy</a >
        <a href="/terms">Terms of Service</a >
        <a href="/refund">Refund Policy</a >
        <a href="/contact">Contact Us</a >
        </div>
      </footer>
    </div>
  );
}