
"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { openPaddleCheckout } from "@/lib/paddle";
import { NAMING_PROMPT_TEMPLATE } from "@/config/prompts";

type FlowState =
  | "IDLE"
  | "PAYING"
  | "WAITING_PAYMENT"
  | "GENERATING"
  | "DONE";

export default function NamingPage() {
  const locale = useLocale() as "en" | "es";
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("Naming");

  const MODULE_TYPE = "naming";

  const [flowState, setFlowState] = useState<FlowState>("IDLE");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [showResult, setShowResult] = useState(false);

  const [formDataState, setFormDataState] = useState({
    surname: "",
    gender: "Male",
    email: "",
    year: "",
    month: "",
    day: "",
    hour: "",
    min: "",
    description: ""
  });

  const pollingRef = useRef(false);
  const generatingRef = useRef(false);

  /* =====================================================
     🔥 页面自动恢复机制
  ===================================================== */
  useEffect(() => {
    const email = localStorage.getItem("lastEmail");
    if (!email) return;

    checkOrderStatus(email);
  }, []);

  /* =====================================================
     🔥 统一状态检查函数（唯一真相来源）
  ===================================================== */
  const checkOrderStatus = async (email: string) => {
    try {
      const res = await fetch("/api/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          moduleType: MODULE_TYPE
        })
      });

      const data = await res.json();

      if (data.status === "DONE") {
        setResult(data.result || "");
        setShowResult(true);
        setFlowState("DONE");
        return;
      }

      if (data.status === "PAID") {
        await startGeneration(email);
        return;
      }

      if (data.status === "GENERATING") {
        setFlowState("GENERATING");
        setShowResult(true);
        pollOrderStatus(email);
        return;
      }

    } catch (err) {
      console.error("Status check error:", err);
    }
  };

  /* =====================================================
     🔥 轮询订单状态（等待 webhook）
  ===================================================== */
  const pollOrderStatus = async (email: string) => {
    if (pollingRef.current) return;
    pollingRef.current = true;

    for (let i = 0; i < 120; i++) {
      try {
        const res = await fetch("/api/orders/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
            moduleType: MODULE_TYPE
          })
        });

        const data = await res.json();

        if (data.status === "PAID") {
          pollingRef.current = false;
          await startGeneration(email);
          return;
        }

        if (data.status === "GENERATING") {
          setFlowState("GENERATING");
          setShowResult(true);
        }

        if (data.status === "DONE") {
          setResult(data.result || "");
          setShowResult(true);
          setFlowState("DONE");
          pollingRef.current = false;
          return;
        }

      } catch (err) {
        console.error("Polling error:", err);
      }

      await new Promise(r => setTimeout(r, 2000));
    }

    pollingRef.current = false;
  };

  /* =====================================================
     🔥 AI 生成
  ===================================================== */
  const startGeneration = async (email: string) => {
    if (generatingRef.current) return;
    generatingRef.current = true;

    setFlowState("GENERATING");
    setShowResult(true);
    setLoading(true);
    setResult("");

    const prompt = NAMING_PROMPT_TEMPLATE
      .replace("${gender}", formDataState.gender)
      .replace(
        "${birthTime}",
        `${formDataState.year}-${formDataState.month}-${formDataState.day} ${formDataState.hour}:${formDataState.min}`
      )
      .replace(
        "${userDescription}",
        `Surname: ${formDataState.surname}. Expectations: ${formDataState.description}`
      )
      .replace("${outputLanguage}", locale === "es" ? "Spanish" : "English");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          email: email.toLowerCase().trim(),
          moduleType: MODULE_TYPE
        })
      });

      const data = await res.clone().json().catch(() => null);

      if (data?.alreadyDone) {
        setResult(data.content || "");
        setFlowState("DONE");
        setLoading(false);
        generatingRef.current = false;
        return;
      }

      if (!res.body) throw new Error("No stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "data: [DONE]") continue;

          if (trimmed.startsWith("data: ")) {
            try {
              const json = JSON.parse(trimmed.slice(6));
              const text = json.choices?.[0]?.delta?.content || "";
              if (text) {
                setResult(prev => prev + text);
              }
            } catch {}
          }
        }
      }

      setFlowState("DONE");

    } catch (err) {
      console.error("Generation error:", err);
    } finally {
      setLoading(false);
      generatingRef.current = false;
    }
  };

  /* =====================================================
     🔥 提交表单（防重复支付核心）
  ===================================================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = formDataState.email.trim().toLowerCase();
    if (!email) return alert("Email required");

    localStorage.setItem("lastEmail", email);

    setFlowState("PAYING");

    try {
      const res = await fetch("/api/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          moduleType: MODULE_TYPE
        })
      });

      const data = await res.json();

      if (data.status === "DONE") {
        setResult(data.result || "");
        setShowResult(true);
        setFlowState("DONE");
        return;
      }

      if (data.status === "PAID") {
        await startGeneration(email);
        return;
      }

      if (data.status === "GENERATING") {
        setFlowState("GENERATING");
        setShowResult(true);
        pollOrderStatus(email);
        return;
      }

      await openPaddleCheckout(email, MODULE_TYPE, formDataState);
      setFlowState("WAITING_PAYMENT");
      pollOrderStatus(email);

    } catch (err) {
      console.error("Submit error:", err);
      setFlowState("IDLE");
    }
  };

  /* =====================================================
     UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dff3ee] to-[#eaf7f2] text-[#0f3d2e]">

      <nav className="flex justify-center border-b bg-transparent sticky top-0 z-50">
        <div className="w-full max-w-5xl flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-2">
            < img src="/logo.png" className="w-8 h-8" alt="Logo" />
            <span className="font-bold text-lg">Zanpath AI</span>
          </div>

          <select
            value={locale}
            onChange={() => router.push(pathname)}
            className="border px-2 py-1 rounded"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
          </select>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto p-6">

        {!showResult ? (
          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              required
              value={formDataState.surname}
              onChange={(e) =>
                setFormDataState({ ...formDataState, surname: e.target.value })
              }
              placeholder="Surname"
              className="w-full p-3 border rounded"
            />

            <input
              required
              type="email"
              value={formDataState.email}
              onChange={(e) =>
                setFormDataState({ ...formDataState, email: e.target.value })
              }
              placeholder="Email"
              className="w-full p-3 border rounded"
            />

            <button
              type="submit"
              disabled={flowState !== "IDLE"}
              className="w-full py-4 bg-[#0f3d2e] text-white rounded disabled:opacity-50"
            >
              {flowState === "IDLE" && "Start Analysis"}
              {flowState === "PAYING" && "Processing..."}
              {flowState === "WAITING_PAYMENT" && "Waiting Payment..."}
              {flowState === "GENERATING" && "Generating..."}
              {flowState === "DONE" && "Completed"}
            </button>

          </form>
        ) : (
          <div className="space-y-6">
            {loading && !result ? (
              <p className="animate-pulse">Generating...</p >
            ) : (
              <>
                <h2 className="text-2xl font-bold">Your Report</h2>
                <div className="whitespace-pre-wrap bg-gray-50 p-6 rounded">
                  {result}
                </div>
                <button
                  onClick={() => {
                    setShowResult(false);
                    setResult("");
                    setFlowState("IDLE");
                  }}
                  className="w-full py-3 bg-[#0f3d2e] text-white rounded"
                >
                  New Analysis
                </button>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}