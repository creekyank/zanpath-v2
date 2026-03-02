
"use client";

import { useState, useEffect, useRef } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { SPACE_PROMPT_TEMPLATE } from "@/config/prompts";
import { sendGAEvent } from '@next/third-parties/google';

import {
  UPLOAD_GUIDELINES,
  NAV_MENU,
  PAGE_SPECIFIC_CONTENT,
  COMMON_FOOTER,
  DISCLAIMER_TEXT
} from "@/config/site-content";

import RecoveryModal from "@/components/RecoveryModal";
import { processImageForAI } from "@/lib/utils";
import { openPaddleCheckout } from "@/lib/paddle";

const MODULE_TYPE = "fengshui";

type FlowState =
  | "IDLE"
  | "PAYING"
  | "WAITING_PAYMENT"
  | "GENERATING"
  | "DONE"
  | "ERROR";

export default function FengShuiPage() {
  const locale = useLocale() as "en" | "es";
  const pathname = usePathname();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const disclaimer = DISCLAIMER_TEXT[locale] || DISCLAIMER_TEXT.en;
  const guide = UPLOAD_GUIDELINES.space[locale] || UPLOAD_GUIDELINES.space.en;
  const mid =
    PAGE_SPECIFIC_CONTENT.space[locale] ||
    PAGE_SPECIFIC_CONTENT.space.en;
  const foot = COMMON_FOOTER[locale] || COMMON_FOOTER.en;
  const menuItems = NAV_MENU[locale] || NAV_MENU.en;

  const currentLangName = locale === "es" ? "Spanish" : "English";

  const [flowState, setFlowState] = useState<FlowState>("IDLE");
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pollingRef = useRef(false);
  const generatingRef = useRef(false);

  const [formDataState, setFormDataState] = useState({
    surname: "",
    gender: "Male", // Male -> Residential, Female -> Commercial
    email: "",
    preferences: "",
    imageData: ""
  });

  // =============================
  // 页面恢复
  // =============================
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
        console.error("Restore failed:", err);
      }
    };

    restoreSession();
  }, []);

  // =============================
  // 状态检查
  // =============================
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

  // =============================
  // 轮询
  // =============================
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

  // =============================
  // 图片处理
  // =============================
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File too large (Max 5MB)");
        return;
      }
      try {
        const compressedBase64 = await processImageForAI(file);
        setSelectedImage(compressedBase64);
        setFormDataState(prev => ({ ...prev, imageData: compressedBase64 }));
      } catch (err) {
        console.error("Face image processing error:", err);
      }
    }
  };

  // =============================
  // AI 生成
  // =============================
  const startGeneration = async (email: string) => {
    if (generatingRef.current) return;
    generatingRef.current = true;
  
    setFlowState("GENERATING");
    setLoading(true);
    setShowResult(true);
    setResult("");
  
    try {
      const spaceContext =
        formDataState.gender === "Male"
          ? "Residential (住宅)"
          : "Commercial (商業)";
  
      const finalPrompt = SPACE_PROMPT_TEMPLATE
        .replace("${outputLanguage}", locale === "es" ? "Spanish" : "English")
        .replace("${languageMode}", "REGULAR")
        .replace("${spaceContext}", spaceContext)
        .replace(
          "${spaceDescription}",
          `Target Name: ${formDataState.surname}. Context: ${spaceContext}. User Notes: ${formDataState.preferences}`
        );
  
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          email,
          moduleType: MODULE_TYPE,
          image: formDataState.imageData,
          preferences: formDataState.preferences,
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
    } catch (err) {
      console.error(err);
      setFlowState("ERROR");
    } finally {
      setLoading(false);
      generatingRef.current = false;
    }
  };

  // =============================
  // 提交逻辑
  // =============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (flowState !== "IDLE") return;

    const email = formDataState.email.trim().toLowerCase();
    if (!formDataState.imageData) {
      alert(mid.fields.requiredTip);
      return;
    }
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

    /* =============================
       ✅ 只允许恢复未完成订单
    ============================= */

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
    /* =============================
       ❌ DONE 不再恢复
       永远重新支付
    ============================= */
  
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


  return (
      <main className="max-w-5xl mx-auto px-4 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 order-1">
          <div className="mb-6 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight mb-3">{mid.title}</h1>
            <p className="text-[#4a7c6d] text-[15px] leading-relaxed">{mid.desc}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-white">
            {!showResult && !loading ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">{mid.fields.surname}</label>
                    <input name="surname" value={formDataState.surname} onChange={(e) => setFormDataState({...formDataState, surname: e.target.value})} required onInvalid={handleInvalid} onInput={handleInput} placeholder={mid.fields.surnamePh} className="p-4 rounded-xl bg-gray-50 border border-transparent focus:border-[#0f3d2e] outline-none" />
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

                {/* 圖片上傳區域 */}
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-gray-500 ml-1">{mid.fields.uploadBtn}</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${selectedImage ? 'border-[#0f3d2e] bg-gray-50' : 'border-gray-200 hover:border-[#0f3d2e] bg-gray-50/50'}`}
                  >
                    {selectedImage ? (
                      <img src={selectedImage} className="h-full w-full object-contain rounded-2xl" alt="Preview" />
                    ) : (
                      <>
                        <span className="text-2xl mb-2">📸</span>
                        <span className="text-xs text-gray-400">{mid.fields.uploadTip}</span>
                      </>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-gray-500 ml-1">{mid.fields.pref}{locale === "es" ? "(Opcional)" : "(Optional)"}</label>
                  <textarea 
                    name="preferences" 
                    value={formDataState.preferences} 
                    onChange={(e) => setFormDataState({...formDataState, preferences: e.target.value})} 
                    rows={3} 
                    placeholder={mid.fields.prefPh} 
                    className="p-4 rounded-xl bg-gray-50 border-none outline-none text-sm" 
                  />
                </div>

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
        </div>

        {/* 右側指南區域 */}
        <div className="space-y-6 lg:space-y-8 order-2">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-white space-y-4">
            <h3 className="font-bold text-sm flex items-center"><span className="bg-[#0f3d2e] text-white p-1 rounded mr-2">ℹ</span>{guide.title}</h3>
            <div className="text-[13px] text-[#356f5b] leading-relaxed whitespace-pre-line">{guide.content}</div>
          </div>
          
          <RecoveryModal 
            locale={locale} 
            moduleType="fengshui" 
            onResultFound={(content, inputData) => { 
              setResult(content); 
              setShowResult(true);
              if (inputData) setFormDataState(inputData);
              localStorage.removeItem("space_backup_content"); 
            }}
            onNeedsReRun={(inputData) => { 
              setShowResult(false); 
              setResult(""); 
              setFlowState("IDLE");
              if (inputData) setFormDataState(inputData);
            }}
          />
        </div>
      </main>
  );
}