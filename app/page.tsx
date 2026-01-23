"use client";

import { useState } from "react";
import Link from "next/link"; // 🟢 引入 Link 用于页面跳转

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
    <div className="min-h-screen bg-gradient-to-br from-[#dff3ee] to-[#eaf7f2] flex flex-col items-center font-sans">
      
      {/* 🟢 新增顶部导航栏 - 保持半透明和极简风格 */}
      <nav className="w-full max-w-5xl flex justify-between items-center px-6 py-4">
      <div className="flex items-center space-x-2">
      <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
      <span className="text-[#0f3d2e] font-bold text-lg tracking-tight">Zanpath AI</span>
    </div>
        
    <div className="flex items-center space-x-6 text-sm font-medium text-[#356f5b]">
  <Link href="/" className="text-[#0f3d2e] border-b-2 border-[#0f3d2e] pb-1">
    Bazi AI
  </Link>

  <Link href="/naming" className="hover:text-[#0f3d2e] transition">
    Naming
  </Link>

  <Link href="/dream" className="hover:text-[#0f3d2e] transition">
    Dream
  </Link>

  <Link href="/fengshui" className="hover:text-[#0f3d2e] transition">
    Space
  </Link>

  <Link href="/face" className="hover:text-[#0f3d2e] transition">
    Visual
  </Link>


</div>

      </nav>

      <main className="flex flex-col items-center px-4 py-8 w-full">
        {/* Logo Section */}
      {/* Logo Section */}
      <div className="mb-10 text-center flex flex-col items-center">
      <img src="/logo.png" alt="Zanpath AI" className="w-16 h-16 mb-4 object-contain" />
      <h1 className="text-4xl font-bold tracking-wide text-[#0f3d2e]">Zanpath AI</h1>
      <p className="text-sm text-[#356f5b] mt-2">
        Personalized Career & Personality Analysis (AI Digital Delivery)
      </p>
    </div>

        {/* Main Card - 保持你原来的设计 */}
        <div className="w-full max-w-xl bg-white/90 backdrop-blur-md rounded-3xl shadow-xl p-8 text-[#0f3d2e]">
          {!loading && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                required
                placeholder="Your Name"
                className="w-full p-4 rounded-xl border border-gray-300 focus:outline-[#0f3d2e]"
              />

              <input
                required
                type="email"
                placeholder="Email for delivery"
                className="w-full p-4 rounded-xl border border-gray-300 focus:outline-[#0f3d2e]"
              />

              <div className="grid grid-cols-4 gap-3">
                <input required placeholder="Year" className="p-3 rounded-xl border focus:outline-[#0f3d2e]" />
                <input required placeholder="Month" className="p-3 rounded-xl border focus:outline-[#0f3d2e]" />
                <input required placeholder="Day" className="p-3 rounded-xl border focus:outline-[#0f3d2e]" />
                <input required placeholder="Hour" className="p-3 rounded-xl border focus:outline-[#0f3d2e]" />
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
              <div className="animate-pulse text-lg font-medium text-[#0f3d2e]">
                Generating your personalized reflection...
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Please wait a moment
              </p>
            </div>
          )}

          {/* 预览区 */}
          {!loading && (
            <div className="mt-8 p-5 border border-dashed border-gray-300 rounded-xl bg-gray-50/50 text-sm text-gray-600">
              <p className="font-semibold mb-2">Preview</p>
              <p>
                Your AI-generated reflection profile has been prepared.
                <br />
                <br />
                🔒 Full content, PDF download, and email delivery will be unlocked after purchase.
              </p>
            </div>
          )}

          {/* 解锁按钮 */}
          {!loading && (
            <button 
              type="button" 
              onClick={(e) => {
                e.preventDefault();
                alert("We are currently integrating our payment system. Please check back later!");
              }}
              className="mt-6 w-full py-4 rounded-xl bg-[#c6a355] text-[#0f3d2e] font-bold shadow-lg hover:scale-[1.02] transition"
            >
              Unlock Full Professional Report ($9.90)
            </button>
          )}

          <button
            disabled
            className="mt-3 w-full py-2 rounded-xl bg-gray-100 text-gray-400 text-sm cursor-not-allowed"
          >
            Download PDF (Unlock Required)
          </button>
        </div>

        {/* Footer - 同步增加 Wisdom 链接 */}
        <footer className="mt-16 text-center text-xs text-[#356f5b] max-w-xl pb-10">
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
      </main>
    </div>
  );
}