"use client";
import { useState } from 'react';

export default function Home() {
  const [report, setReport] = useState("");
  const [loading, setLoading] = useState(false);

  const startReading = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ birthData: "Selected Birth Info" }),
      });
      const data = await res.json();
      setReport(data.result);
    } catch (e) {
      alert("Error connecting to stars.");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#020617] text-[#e2e8f0] flex flex-col items-center justify-center p-6 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
      <div className="max-w-md w-full border border-[#94a3b8]/20 bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-serif text-[#fbbf24] text-center mb-4">ZenPath Astrology</h1>
        <p className="text-slate-400 text-center mb-8 italic">Your destiny is written in the stars.</p>
        
        <button 
          onClick={startReading}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-[#b45309] to-[#78350f] text-white font-bold tracking-widest hover:scale-105 transition-transform"
        >
          {loading ? "COMMUNING WITH COSMOS..." : "UNVEIL MY FATE ($7.99)"}
        </button>

        {report && (
          <div className="mt-8 p-4 border-t border-[#fbbf24]/30 animate-fade-in">
            <h2 className="text-[#fbbf24] font-bold mb-2">Divine Insight:</h2>
            <p className="text-sm leading-relaxed text-slate-200">{report}</p>
          </div>
        )}
      </div>
    </main>
  );
}