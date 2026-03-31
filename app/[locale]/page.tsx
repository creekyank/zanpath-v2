"use client";

import { useState, useEffect, useRef } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { BAZI_PROMPT_TEMPLATE } from "@/config/prompts";
import { sendGAEvent } from '@next/third-parties/google';

import {
  TIME_ZONE_NOTICE,
  NAV_MENU,
  PAGE_SPECIFIC_CONTENT,
  COMMON_FOOTER,
  DISCLAIMER_TEXT,
  SAMPLE_ANALYSIS_BLOCK
} from "@/config/site-content";
import RecoveryModal from "@/components/RecoveryModal";
import DailyReflectionSection from "@/components/DailyReflectionSection";
import { openPaddleCheckout } from "@/lib/paddle";

/* =============================
   状态机
============================= */

type FlowState =
  | "IDLE"
  | "PAYING"
  | "WAITING_PAYMENT"
  | "GENERATING"
  | "DONE"
  | "ERROR";

export default function HomePage() {
  const locale = useLocale() as "en" | "es";
  const pathname = usePathname();
  const router = useRouter();

  const disclaimer = DISCLAIMER_TEXT[locale] || DISCLAIMER_TEXT.en;
  const notice = TIME_ZONE_NOTICE[locale] || TIME_ZONE_NOTICE.en;
  const mid =
    PAGE_SPECIFIC_CONTENT.bazi[locale] ||
    PAGE_SPECIFIC_CONTENT.bazi.en;
  const foot = COMMON_FOOTER[locale] || COMMON_FOOTER.en;
  const menuItems = NAV_MENU[locale] || NAV_MENU.en;

  const MODULE_TYPE = "bazi";
  const sample =
  SAMPLE_ANALYSIS_BLOCK[MODULE_TYPE][locale] ??
  SAMPLE_ANALYSIS_BLOCK[MODULE_TYPE].en;

  const [flowState, setFlowState] = useState<FlowState>("IDLE");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState("");

  const pollingRef = useRef(false);
  const generatingRef = useRef(false);

  const [formDataState, setFormDataState] = useState({
    surname: "",
    gender: "Male",
    email: "",
    year: "",
    month: "",
    day: "",
    hour: "",
    min: ""
  });

  /* =============================
     页面恢复
  ============================= */

  useEffect(() => {
    const restoreSession = async () => {
      const email = localStorage.getItem("pending_payment_email");
      const module = localStorage.getItem("pending_payment_module");

      if (!email || module !== MODULE_TYPE) return;

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
          setFlowState("WAITING_PAYMENT");
        }

        if (data.status === "GENERATING") {
          setShowResult(true);
          setFlowState("GENERATING");
          pollOrderStatus(email);
        }

        if (data.status === "DONE") {
          localStorage.removeItem("pending_payment_email");
          localStorage.removeItem("pending_payment_module");
          localStorage.removeItem("pending_payment_form");
        }
      } catch (err) {
        console.error("Session restore failed:", err);
      }
    };

    restoreSession();
  }, []);

  /* =============================
     状态检查
  ============================= */

  const checkOrderStatus = async (email: string) => {
    const res = await fetch("/api/orders/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, moduleType: MODULE_TYPE })
    });

    const data = await res.json();

    if (data.status === "DONE") {
      localStorage.removeItem("pending_payment_email");
      localStorage.removeItem("pending_payment_module");
      localStorage.removeItem("pending_payment_form");

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
      setShowResult(true);
      setFlowState("GENERATING");
      pollOrderStatus(email);
    }
  };

  /* =============================
     轮询
  ============================= */

  const pollOrderStatus = async (email: string) => {
    if (pollingRef.current) return;
    pollingRef.current = true;

    for (let i = 0; i < 90; i++) {
      const res = await fetch("/api/orders/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, moduleType: MODULE_TYPE })
      });

      const data = await res.json();

      if (data.status === "DONE") {
        localStorage.removeItem("pending_payment_email");
        localStorage.removeItem("pending_payment_module");
        localStorage.removeItem("pending_payment_form");

        setResult(data.result || "");
        setShowResult(true);
        setFlowState("DONE");
        pollingRef.current = false;
        return;
      }

      if (data.status === "PAID") {
        pollingRef.current = false;
        await startGeneration(email);
        return;
      }

      await new Promise(r => setTimeout(r, 2000));
    }

    pollingRef.current = false;
  };

  /* =============================
     AI 生成
  ============================= */

  const startGeneration = async (email: string) => {
    if (generatingRef.current) return;
    generatingRef.current = true;

    setFlowState("GENERATING");
    setLoading(true);
    setShowResult(true);
    setResult("");

    const prompt = BAZI_PROMPT_TEMPLATE
      .replace("${gender}", formDataState.gender)
      .replace("${languageMode}", "REGULAR")
      .replace(
        "${birthTime}",
        `${formDataState.year}-${formDataState.month}-${formDataState.day} ${formDataState.hour}:${formDataState.min}`
      )
      .replace("${outputLanguage}", locale === "es" ? "Spanish" : "English");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          email,
          moduleType: MODULE_TYPE,
          locale 
        })
      });

      if (!res.body) throw new Error("No stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          const t = line.trim();
          if (!t || t === "data: [DONE]") continue;

          if (t.startsWith("data: ")) {
            const json = JSON.parse(t.slice(6));
            const text = json.choices?.[0]?.delta?.content || "";
            if (text) setResult(prev => prev + text);
          }
        }
      }

      setFlowState("DONE");
    } catch {
      setFlowState("ERROR");
    } finally {
      setLoading(false);
      generatingRef.current = false;
    }
  };

  /* =============================
     表单提交
  ============================= */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (flowState !== "IDLE") return;

    const email = formDataState.email.trim().toLowerCase();
    if (!email) return;

      // ✅ 在这里添加追踪代码
      sendGAEvent('event', 'click_pay_button', {
        module_type: MODULE_TYPE,
        locale: locale
      });

    localStorage.setItem("pending_payment_email", email);
    localStorage.setItem("pending_payment_module", MODULE_TYPE);
    localStorage.setItem(
      "pending_payment_form",
      JSON.stringify(formDataState)
    );

    setFlowState("PAYING");

    const res = await fetch("/api/orders/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, moduleType: MODULE_TYPE })
    });

    const data = await res.json();

    if (data.status === "PAID") {
      await startGeneration(email);
      return;
    }

    if (data.status === "GENERATING") {
      setShowResult(true);
      setFlowState("GENERATING");
      pollOrderStatus(email);
      return;
    }

    await openPaddleCheckout(email, MODULE_TYPE, formDataState);
    setFlowState("WAITING_PAYMENT");
    pollOrderStatus(email);
  };


  /* =============================
     表单辅助
  ============================= */

  const handleInvalid = (
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    target.setCustomValidity(
      mid.fields?.requiredTip || "Please fill out this field."
    );
  };

  const handleInput = (
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    target.setCustomValidity("");
  };

  const validateInput = (name: string, value: string) => {
    const val = parseInt(value);
    if (isNaN(val)) return;

    const limits: Record<string, [number, number]> = {
      Year: [1900, 2100],
      Month: [1, 12],
      Day: [1, 31],
      Hour: [0, 23],
      Min: [0, 59]
    };

    if (limits[name] && (val < limits[name][0] || val > limits[name][1])) {
      alert(`${name} must be ${limits[name][0]}-${limits[name][1]}`);
    }
  };

  return (

          <>
          <div className="mt-6 mb-5">
          <DailyReflectionSection locale={locale} />
        </div>

        <div className="flex justify-center mb-6">
          <Link
            href="/quiz"
            className="px-12 py-4 border-2 border-[#0f3d2e]/40 text-[#0f3d2e] rounded-full text-lg font-bold text-center hover:bg-[#0f3d2e] hover:text-white transition-all duration-300 active:scale-95"
          >
            {locale === "es"
              ? "Descubre Gratis tu Personalidad, Amor y Riqueza"
              : "Discover Your Personality, Love & Wealth — Free"}
          </Link>
        </div>

      <main id="calculator-form" className="max-w-5xl mx-auto px-4 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">


        <div className="lg:col-span-2 order-1">
          <div className="mb-6 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight mb-3">{mid.title}</h1>
            <p className="text-[#356f5b]">{mid.desc}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-white">
            {!showResult && !loading ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">{mid.fields.surname}</label>
                    <input name="surname" value={formDataState.surname} onChange={(e) => setFormDataState({...formDataState, surname: e.target.value})} required onInvalid={handleInvalid} onInput={handleInput} placeholder={mid.fields.surnamePh} className="p-4 rounded-xl bg-gray-50 border border-gray-50 focus:border-[#0f3d2e] outline-none" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">{mid.fields.gender}</label>
                    <select name="gender" value={formDataState.gender} onChange={(e) => setFormDataState({...formDataState, gender: e.target.value})} className="p-4 rounded-xl bg-gray-50 border-none outline-none appearance-none cursor-pointer">
                      <option value="Male">{mid.fields.male}</option>
                      <option value="Female">{mid.fields.female}</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-gray-500 ml-1">{mid.fields.email}</label>
                  <input name="email" type="email" value={formDataState.email} onChange={(e) => setFormDataState({...formDataState, email: e.target.value})} required onInvalid={handleInvalid} onInput={handleInput} placeholder="your@email.com" className="p-4 rounded-xl bg-gray-50 border-none outline-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 ml-1">{mid.fields.birthTime}</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[{ p: 'Year', min: 1900, max: 2100 }, { p: 'Month', min: 1, max: 12 }, { p: 'Day', min: 1, max: 31 }, { p: 'Hour', min: 0, max: 23 }, { p: 'Min', min: 0, max: 59 }].map(({ p, min, max }) => (
                      <input key={p} name={p.toLowerCase()} value={(formDataState as any)[p.toLowerCase()]} onChange={(e) => setFormDataState({...formDataState, [p.toLowerCase()]: e.target.value})} required onInvalid={handleInvalid} onInput={handleInput} type="number" min={min} max={max} placeholder={p} onBlur={(e) => validateInput(p, e.target.value)} className="p-3 rounded-xl bg-gray-50 border-none text-center text-sm" />
                    ))}
                  </div>
                </div>

                {/* 🟢 這裡移除了 Personal Preferences 文本框 */}

                <div className="space-y-4">
                <button
                    type="submit"
                    disabled={
                      flowState === "PAYING" ||
                      flowState === "WAITING_PAYMENT" ||
                      flowState === "GENERATING"
                    }
                    className="w-full py-5 rounded-2xl bg-[#0f3d2e] text-white font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {flowState === "IDLE" && mid.fields.btnNormal}

                    {flowState === "PAYING" && (
                      locale === "es" ? "Procesando pago…" : "Processing payment…"
                    )}

                    {flowState === "WAITING_PAYMENT" && mid.fields.btnPaid}

                    {flowState === "GENERATING" && (
                      locale === "es" ? "Generando…" : "Generating…"
                    )}

                    {flowState === "DONE" && mid.fields.btnPaid}
                  </button>

                  <div className="bg-gray-50/50 rounded-2xl p-6 space-y-4 border border-gray-100/50">
                    <p className="text-[13px] text-[#0f3d2e] font-medium leading-relaxed">{mid.intro}</p>
                    <ul className="text-xs text-[#356f5b] space-y-2 list-disc ml-4 font-normal">
                      {mid.features.map(item => <li key={item}>{item}</li>)}
                    </ul>
                    <p className="text-[11px] text-gray-500 border-t border-gray-200/60 pt-3 italic leading-snug">{foot.disclaimer}</p>
                  </div>
                </div>

                {/* 🟢 隱藏 VIP 按鈕 */}
                {/*<button type="button" onClick={(e) => handleSubmit(e as any, 'VIP')} className="w-full py-3 rounded-xl border-2 border-[#c6a355] text-[#c6a355] font-bold text-sm">
                  {mid.fields.btnVip}
                </button>
                */}

              </form>
            ) : (
              <div className="py-10">
                <div className="animate-in fade-in duration-700">
                  
                  {loading && !result ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0f3d2e]"></div>
                      <p className="text-sm text-[#4a7c6d] animate-pulse">⚡ {mid.fields.thinking}</p>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold mb-6 pb-2 border-b text-[#0f3d2e]">{mid.fields.reportTitle}</h2>
                      <div className="whitespace-pre-wrap text-[#0f3d2e] leading-relaxed text-sm bg-[#f8fcfb] p-6 rounded-2xl border border-[#eaf7f2]">
                        {result}
                        {loading && <span className="inline-block w-2 h-4 ml-1 bg-[#0f3d2e] animate-pulse" />}
                      </div>
                      
                      {!loading && result && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-[12px] text-gray-500 italic leading-relaxed">
                          {disclaimer}
                          </p>
                        </div>
                      )}

                      {!loading && (
                        <button 
                        onClick={() => {
                          setShowResult(false);
                          setResult("");
                          setFlowState("IDLE");
                        }} 
                        className="mt-8 w-full py-4 bg-[#0f3d2e] text-white rounded-xl font-bold hover:opacity-90 transition-all"
                      >
                        {mid.fields.newAnalysis}
                      </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

               {/* =============================
            Sample Analysis Block
                  ============================= */}

<div className="mt-12 p-6 bg-[#f8fcfb] rounded-2xl border border-[#eaf7f2] text-center">

            <h2 className="text-2xl font-bold text-[#0f3d2e] mb-3">
              {sample.title}
            </h2>

            <p className="text-sm text-[#356f5b] mb-6 max-w-xl mx-auto">
              {sample.desc}
            </p >

            <Link
              href={sample.link}
              className="inline-block mb-10 px-6 py-3 rounded-xl bg-[#0f3d2e] text-white font-semibold hover:opacity-90 transition"
            >
              {sample.button}
            </Link>

            {/* Preview */}
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm text-left max-w-2xl mx-auto">

              <p className="text-xs uppercase tracking-wide text-gray-400 mb-4">
                Example Preview
              </p >

              {sample.preview.map((p, i) => (
                <div key={i} className="mb-4">
                  <h4 className="font-semibold text-[#0f3d2e] text-sm mb-1">
                    {p.title}
                  </h4>
                  <p className="text-sm text-[#356f5b] leading-relaxed">
                    {p.text}
                  </p >
                </div>
              ))}

              <p className="text-xs text-gray-400 mt-4 italic">
                This is a simplified preview. Your personal report will be more detailed.
              </p >

            </div>

            </div>

        </div>

        

        <div className="space-y-6 lg:space-y-8 order-2">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-white space-y-4">
            <h3 className="font-bold text-sm flex items-center"><span className="bg-[#0f3d2e] text-white p-1 rounded mr-2">ℹ</span>{notice.title}</h3>
            <div className="text-[13px] text-[#356f5b] leading-relaxed whitespace-pre-line">{notice.content}</div>
          </div>


          
          <RecoveryModal 
            locale={locale} 
            moduleType="bazi" // 🟢 查詢模組設為 bazi
            onResultFound={(content, inputData) => { 
              setResult(content); 
              setShowResult(true);
              if (inputData) setFormDataState(inputData);
              localStorage.removeItem("bazi_backup_content"); 
            }}
            onNeedsReRun={(inputData) => { 
              setShowResult(false); 
              setResult(""); 
              setFlowState("IDLE");
            
              if (inputData) setFormDataState(inputData);
            
              window.scrollTo({ top: 0, behavior: 'smooth' });
            
              alert(locale === "es"
                ? "Pago verificado. Puede generar ahora."
                : "Payment verified. You can generate now."
              );
            }}
          />
        </div>

      </main> 
   
</>
  );
}