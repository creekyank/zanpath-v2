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
  const t = useTranslations('Naming');

  // --- 保持原有的 UI 文本配置 ---
  const mid = {
    title: t('title'),
    desc: t('desc'),
    fields: {
      surname: t('fields.surname'),
      surnamePh: t('fields.surnamePh'),
      email: t('fields.email'),
      btnNormal: t('fields.btnNormal'),
      thinking: t('fields.thinking'),
      reportTitle: t('fields.reportTitle'),
      newAnalysis: t('fields.newAnalysis')
    }
  };
  const notice = { title: t('notice.title'), content: t('notice.content') };
  const menuItems = [
    { name: "Home", href: "/" },
    { name: "Naming", href: "/naming" },
  ];

  const MODULE_TYPE = "naming";

  // --- 状态管理 ---
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
      1. 页面自动恢复机制 (ChatGPT 逻辑)
  ===================================================== */
  useEffect(() => {
    const email = localStorage.getItem("lastEmail");
    if (!email) return;
    checkOrderStatus(email);
  }, []);

  /* =====================================================
      2. 统一状态检查 (ChatGPT 逻辑)
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
      } else if (data.status === "PAID") {
        await startGeneration(email);
      } else if (data.status === "GENERATING") {
        setFlowState("GENERATING");
        setShowResult(true);
        pollOrderStatus(email);
      }
    } catch (err) {
      console.error("Status check error:", err);
    }
  };

  /* =====================================================
      3. 轮询订单状态 (ChatGPT 逻辑)
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
          // 成功后自动触发发邮件接口
          fetch("/api/orders/save-result", {
             method: "POST",
             body: JSON.stringify({ email, module: MODULE_TYPE, locale })
          }).catch(console.error);
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
      4. AI 生成流式处理 (整合逻辑)
  ===================================================== */
  const startGeneration = async (email: string) => {
    if (generatingRef.current) return;
    generatingRef.current = true;

    setFlowState("GENERATING");
    setLoading(true);
    setShowResult(true);
    setResult("");

    const prompt = NAMING_PROMPT_TEMPLATE
      .replace("${gender}", formDataState.gender)
      .replace("${birthTime}", `${formDataState.year}-${formDataState.month}-${formDataState.day} ${formDataState.hour}:${formDataState.min}`)
      .replace("${userDescription}", `Surname: ${formDataState.surname}. Expectations: ${formDataState.description}`)
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

      // 处理 ChatGPT 加入的 alreadyDone 逻辑
      const data = await res.clone().json().catch(() => null);
      if (data?.alreadyDone) {
        setResult(data.content || "");
        setFlowState("DONE");
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          const t = line.trim();
          if (!t || t === "data: [DONE]") continue;
          if (t.startsWith("data: ")) {
            try {
              const json = JSON.parse(t.slice(6));
              const text = json.choices?.[0]?.delta?.content || "";
              if (text) setResult(prev => prev + text);
            } catch (e) {}
          }
        }
      }

      // 生成结束后调用邮件发送接口
      fetch("/api/orders/save-result", {
        method: "POST",
        body: JSON.stringify({ email, module: MODULE_TYPE, locale })
      }).catch(console.error);

    } catch (err) {
      console.error("Generation error:", err);
    } finally {
      setFlowState("DONE");
      setLoading(false);
      generatingRef.current = false;
    }
  };

  /* =====================================================
      5. 提交表单 (ChatGPT 防重复支付逻辑)
  ===================================================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = formDataState.email.trim().toLowerCase();
    if (!email) return alert("Email required");

    localStorage.setItem("lastEmail", email);
    setFlowState("PAYING");

    try {
      // 支付前先查一遍，如果已付过费或生成过，直接进入后续流程
      const res = await fetch("/api/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, moduleType: MODULE_TYPE })
      });
      const data = await res.json();

      if (data.status === "DONE" || data.status === "PAID" || data.status === "GENERATING") {
        checkOrderStatus(email);
        return;
      }

      // 没支付过，去打开支付窗口
      await openPaddleCheckout(email, MODULE_TYPE, formDataState);
      setFlowState("WAITING_PAYMENT");
      pollOrderStatus(email);
    } catch (err) {
      console.error("Submit error:", err);
      setFlowState("IDLE");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dff3ee] to-[#eaf7f2] text-[#0f3d2e]">
      
      {/* ================= NAV (UI 找回) ================= */}
      <nav className="flex justify-center border-b border-gray-100 bg-transparent backdrop-blur-md sticky top-0 z-50">
        <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center px-6 py-4 gap-y-3">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" className="w-8 h-8" alt="Logo" />
            <span className="font-bold text-lg">Zanpath AI</span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 md:space-x-6">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-[13px] md:text-sm font-medium text-[#356f5b] hover:text-[#0f3d2e]">
                {item.name}
              </Link>
            ))}
            <select
              value={locale}
              onChange={(e) => router.push(pathname)}
              className="bg-white/40 border border-[#356f5b]/20 text-[#0f3d2e] text-[11px] font-bold rounded-md px-2 py-0.5"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
          </div>
        </div>
      </nav>

      {/* ================= MAIN (UI 找回) ================= */}
      <main className="max-w-5xl mx-auto px-4 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        
        <div className="lg:col-span-2 order-1">
          <div className="mb-6 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight mb-3">{mid.title}</h1>
            <p className="text-[#356f5b]">{mid.desc}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-white">
            {!showResult ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 姓氏 */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-gray-500 ml-1">{mid.fields.surname}</label>
                  <input
                    required
                    value={formDataState.surname}
                    onChange={(e) => setFormDataState({...formDataState, surname: e.target.value})}
                    placeholder={mid.fields.surnamePh}
                    className="p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 ring-[#0f3d2e]/20"
                  />
                </div>

                {/* 邮箱 */}
                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-gray-500 ml-1">{mid.fields.email}</label>
                  <input
                    type="email"
                    required
                    value={formDataState.email}
                    onChange={(e) => setFormDataState({...formDataState, email: e.target.value})}
                    placeholder="your@email.com"
                    className="p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 ring-[#0f3d2e]/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={flowState !== "IDLE"}
                  className="w-full py-5 rounded-2xl bg-[#0f3d2e] text-white font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {flowState === "IDLE" && mid.fields.btnNormal}
                  {flowState === "PAYING" && (locale === "es" ? "Procesando..." : "Processing...")}
                  {flowState === "WAITING_PAYMENT" && (locale === "es" ? "Esperando pago..." : "Waiting for payment...")}
                  {flowState === "GENERATING" && (locale === "es" ? "Generando..." : "Generating...")}
                  {flowState === "DONE" && (locale === "es" ? "Completado" : "Completed")}
                </button>
              </form>
            ) : (
              <div className="py-10">
                {loading && !result ? (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f3d2e]"></div>
                    <p className="text-sm text-[#356f5b] animate-pulse">⚡ {mid.fields.thinking}</p>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-6 pb-2 border-b">{mid.fields.reportTitle}</h2>
                    <div className="whitespace-pre-wrap text-[#0f3d2e] leading-relaxed text-sm bg-gray-50 p-6 rounded-2xl border border-gray-100">
                      {result}
                    </div>
                    <button
                      onClick={() => {
                        setShowResult(false);
                        setResult("");
                        setFlowState("IDLE");
                        localStorage.removeItem("lastEmail"); // 重置以便新测试
                      }}
                      className="mt-8 w-full py-4 bg-[#0f3d2e] text-white rounded-xl font-bold hover:opacity-90"
                    >
                      {mid.fields.newAnalysis}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 右侧说明 (UI 找回) */}
        <div className="space-y-6 lg:space-y-8 order-2">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-white space-y-4 shadow-sm">
            <h3 className="font-bold text-sm">ℹ {notice.title}</h3>
            <div className="text-[13px] text-[#356f5b] leading-relaxed whitespace-pre-line">
              {notice.content}
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 py-10 bg-transparent text-center text-sm text-gray-400">
        © 2026 Zanpath AI
      </footer>
    </div>
  );
}