"use client";

import { useState, useEffect, useRef } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { NAMING_PROMPT_TEMPLATE } from "@/config/prompts";
import {
  TIME_ZONE_NOTICE,
  NAV_MENU,
  PAGE_SPECIFIC_CONTENT,
  COMMON_FOOTER,
  DISCLAIMER_TEXT
} from "@/config/site-content";
import { ADMIN_CONFIG, isAdminEmail } from "@/config/admin";
import RecoveryModal from "@/components/RecoveryModal";
import { openPaddleCheckout } from "@/lib/paddle";

export default function NamingPage() {
  const locale = useLocale() as "en" | "es";
  const disclaimer = DISCLAIMER_TEXT[locale] || DISCLAIMER_TEXT.en;
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState("");
  const [isPrePaid, setIsPrePaid] = useState(false);

  const pollingRef = useRef(false); // ✅ FIX：防止多重轮询

  // 🚫 防止重复生成（非常关键）
  const generatingRef = useRef(false);

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

  useEffect(() => {
    const pendingEmail = localStorage.getItem("pending_payment_email");
    const pendingModule = localStorage.getItem("pending_payment_module");

    if (!pendingEmail || pendingModule !== "naming") return;

    const savedForm = localStorage.getItem("pending_payment_form");
    if (savedForm) {
      setFormDataState(JSON.parse(savedForm));
    }

    setShowResult(true);
    setLoading(true);

    pollPaymentStatus(pendingEmail);
  }, []);

  useEffect(() => {
    const onFocus = () => {
      const pendingEmail = localStorage.getItem("pending_payment_email");
      const pendingModule = localStorage.getItem("pending_payment_module");
      if (pendingEmail && pendingModule === "naming") {
        pollPaymentStatus(pendingEmail);
      }
    };

    const onVisibilityChange = () => {
      if (!document.hidden) onFocus();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const currentLangName = locale === "es" ? "Spanish" : "English";
  const notice = TIME_ZONE_NOTICE[locale] || TIME_ZONE_NOTICE.en;
  const mid =
    PAGE_SPECIFIC_CONTENT.naming[locale] ||
    PAGE_SPECIFIC_CONTENT.naming.en;
  const foot = COMMON_FOOTER[locale] || COMMON_FOOTER.en;
  const menuItems = NAV_MENU[locale] || NAV_MENU.en;

  const processAiGeneration = async (
    formData: FormData,
    source: string
  ) => { 
    const email = formDataState.email.toLowerCase().trim();

    if (generatingRef.current) {
      console.warn("⚠️ Generation already in progress");
      return;
    }
    generatingRef.current = true;

    setLoading(true);
    setResult("");
    setShowResult(true);

    let fullResult = "";

    try {
      const finalPrompt = NAMING_PROMPT_TEMPLATE
        .replace("${outputLanguage}", currentLangName)
        .replace(
          "${languageMode}",
          source === "vip_debug" ? "VIP" : "REGULAR"
        )
        .replace("${gender}", formDataState.gender)
        .replace(
          "${birthTime}",
          `${formDataState.year}-${formDataState.month}-${formDataState.day} ${formDataState.hour}:${formDataState.min}`
        )
        .replace(
          "${userDescription}",
          `Surname: ${formDataState.surname}. Expectations: ${formDataState.description}`
        );

      const generationToken =
        localStorage.getItem("generation_token");

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: finalPrompt,
          email,
          moduleType: "naming",
          inputSnapshot: formDataState,
          generationToken
        })
      });

      if (response.status === 403) {
        const data = await response.json();
        if (data?.error === "INVALID_TOKEN") {
          alert(
            locale === "es"
              ? "El pago se está confirmando. Por favor espere."
              : "Payment is being confirmed. Please wait."
          );
          setLoading(false);
          setShowResult(false);
          return;
        }
      }

      if (!response.ok) throw new Error("Fetch failed");

      const orderId = response.headers.get("X-Order-Id"); // ✅ FIX

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader");

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
              const json = JSON.parse(trimmed.substring(6));
              const text =
                json.choices?.[0]?.delta?.content || "";
              if (text) {
                fullResult += text;
                setResult(prev => prev + text);
              }
            } catch {}
          }
        }
      }

      if (fullResult.length > 500 && orderId) {
        await fetch("/api/orders/save-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            content: fullResult
          })
        });

        localStorage.removeItem("generation_token"); // ✅ FIX
        localStorage.removeItem("naming_backup_content");
      }
    } catch (err) {
      alert(
        locale === "es"
          ? "La generación falló. Inténtelo de nuevo más tarde."
          : "Generation failed. Please try again later."
      );
    } finally {
      setLoading(false);
      setIsPrePaid(false);
      generatingRef.current = false;
    }
  };

  const pollPaymentStatus = (email: string) => {
    if (pollingRef.current) return; // ✅ FIX
    pollingRef.current = true;

    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      const res = await fetch("/api/orders/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, moduleType: "naming" })
      });

      const data = await res.json();

      if (data.isPaid && data.generationToken) {
        clearInterval(interval);
        pollingRef.current = false;

        localStorage.removeItem("pending_payment_email");
        localStorage.removeItem("pending_payment_module");
        localStorage.removeItem("pending_payment_form");

        localStorage.setItem(
          "generation_token",
          data.generationToken
        );

        processAiGeneration(new FormData(), "auto_after_pay");
      }

      if (attempts > 90) {
        clearInterval(interval);
        pollingRef.current = false;
      }
    }, 2000);
  };

  const validateInput = (name: string, value: string) => {
    const val = parseInt(value);
    if (isNaN(val)) return;
    const limits: Record<string, [number, number]> = { 
      Year: [1900, 2100], Month: [1, 12], Day: [1, 31], Hour: [0, 23], Min: [0, 59] 
    };
    if (limits[name] && (val < limits[name][0] || val > limits[name][1])) {
      alert(`${name} must be ${limits[name][0]}-${limits[name][1]}`);
    }
  };

  // 在 NamingPage 组建内部定义
  const handleInvalid = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    
    // 使用 ?. 安全訪問，如果找不到就顯示英文預設值
    const tip = (mid as any).fields?.requiredTip || "Please fill out this field.";
    
    target.setCustomValidity(tip);
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    target.setCustomValidity("");
  };
  // 3. 优化：表单提交逻辑（改用 formDataState 进行校验）
  // 3. 优化：表单提交逻辑（改用 formDataState 进行校验）
  const handleSubmit = async (e: React.FormEvent, mode: 'NORMAL' | 'VIP') => {
    if (e) e.preventDefault();
  
    const email = formDataState.email.trim().toLowerCase();
  
    // 1. 先做所有必要的驗證
    if (!email || !formDataState.surname || !formDataState.description) {
      alert(mid.fields.requiredTip);
      return;
    }
  
    // 2. 分流：特殊權限 vs 普通支付
    if (mode === 'VIP' || isPrePaid || isAdminEmail(email)) {
      if (mode === 'VIP') {
        const pwd = prompt("Enter VIP Password:");
        if (pwd !== ADMIN_CONFIG.vipPassword) return alert("Incorrect password.");
      }
      // 進入生成
      processAiGeneration(new FormData(), isPrePaid ? "recovered_order" : (mode === 'VIP' ? "vip_debug" : "admin_test"));
    } else {
      // 進入支付
      localStorage.setItem("pending_payment_email", email);
      localStorage.setItem("pending_payment_module", "naming");
      localStorage.setItem("pending_payment_form", JSON.stringify(formDataState));
      openPaddleCheckout(email, "naming", formDataState);

    }
  };// <--- 確保這裡有大括號

  /* ===== 以下 JSX 原样保持，不再重复解释 ===== */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dff3ee] to-[#eaf7f2] text-[#0f3d2e]">
    <nav className="flex justify-center border-b border-gray-100 bg-transparent backdrop-blur-md sticky top-0 z-50">
    <div className="w-full max-w-5xl flex flex-col md:flex-row justify-between items-center px-6 py-4 gap-y-3">
              <div className="flex items-center space-x-2">
                <img src="/logo.png" className="w-8 h-8" alt="Logo" />
                <span className="font-bold text-lg">Zanpath AI</span>
              </div>
    {/* 🟢 關鍵修改：將所有導航項與下拉框放在同一個容器內，並使用 flex-wrap */}
    <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 md:space-x-6">
          
          {/* 直接循環導航項 */}
          {menuItems.map((item) => {
            const isActive = item.href === "/" || item.href === ""
              ? pathname === "/" || pathname === ""
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-[13px] md:text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[#0f3d2e] border-b-2 border-[#0f3d2e] pb-1"
                    : "text-[#356f5b] hover:text-[#0f3d2e]"
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          {/* 🟢 語言下拉框：現在它是導航隊列的「最後一個元素」 */}
          <div className="relative inline-flex items-center ml-1">
            <select
              value={locale}
              onChange={(e) => router.push(pathname, { locale: e.target.value as 'en' | 'es' })}
              className="appearance-none bg-white/40 border border-[#356f5b]/20 text-[#0f3d2e] text-[11px] font-bold rounded-md px-2 py-0.5 pr-6 cursor-pointer focus:outline-none transition-all hover:bg-white/60"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
            {/* 箭頭圖標稍微縮小一點以配合文字 */}
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-[#0f3d2e]">
              <svg className="fill-current h-3 w-3" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

        </div>
      </div>
    </nav>

      <main className="max-w-5xl mx-auto px-4 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 order-1">
          <div className="mb-6 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight mb-3">{mid.title}</h1>
            <p className="text-[#356f5b]">{mid.desc}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-white">
            {!showResult && !loading ? (
              <form onSubmit={(e) => handleSubmit(e, 'NORMAL')} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">{mid.fields.surname}</label>
                    <input name="surname" value={formDataState.surname} onChange={(e) => setFormDataState({...formDataState, surname: e.target.value})} required onInvalid={handleInvalid}
  onInput={handleInput} placeholder={mid.fields.surnamePh} className="p-4 rounded-xl bg-gray-50 border border-red-50 focus:border-[#0f3d2e] outline-none" />
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
                  <input name="email" type="email" value={formDataState.email} onChange={(e) => setFormDataState({...formDataState, email: e.target.value})} required onInvalid={handleInvalid}
  onInput={handleInput} placeholder="your@email.com" className="p-4 rounded-xl bg-gray-50 border-none outline-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 ml-1">{mid.fields.birthTime}</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[{ p: 'Year', min: 1900, max: 2100 }, { p: 'Month', min: 1, max: 12 }, { p: 'Day', min: 1, max: 31 }, { p: 'Hour', min: 0, max: 23 }, { p: 'Min', min: 0, max: 59 }].map(({ p, min, max }) => (
                      <input key={p} name={p.toLowerCase()} value={(formDataState as any)[p.toLowerCase()]} onChange={(e) => setFormDataState({...formDataState, [p.toLowerCase()]: e.target.value})} required onInvalid={handleInvalid} onInput={handleInput} type="number" min={min} max={max} placeholder={p} onBlur={(e) => validateInput(p, e.target.value)} className="p-3 rounded-xl bg-gray-50 border-none text-center text-sm" />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-gray-500 ml-1">{mid.fields.pref}</label>
                  <textarea name="description" value={formDataState.description} onChange={(e) => setFormDataState({...formDataState, description: e.target.value})} required onInvalid={handleInvalid}
  onInput={handleInput} rows={3} placeholder={mid.fields.prefPh} className="p-4 rounded-xl bg-gray-50 border-none outline-none text-sm" />
                </div>

                <div className="space-y-4">
                  <button type="submit" className="w-full py-5 rounded-2xl bg-[#0f3d2e] text-white font-bold text-lg hover:opacity-90 transition-all">
                    {isPrePaid ? mid.fields.btnPaid : mid.fields.btnNormal}
                  </button>

                  {/* --- 插入支付測試中開始 --- */}
{!isPrePaid && (
  <div className="mt-4 px-2 text-center space-y-1">
    <p className="text-[15px] text-[#0f3d2e] font-medium leading-tight">
      Payments are currently being finalized. All features are available for exploration during this period.
    </p>
    {/* 🟢 隱藏西班牙語提示 */}
    {/*<p className="text-[15px] text-[#0f3d2e] font-medium leading-tight">
      Los pagos se están finalizando actualmente. Todas las funciones están disponibles para exploración durante este período.
    </p>*/}
  </div>
)}
{/* --- 插入結束 --- */}
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
                      <p className="text-sm text-[#356f5b] animate-pulse">⚡ {mid.fields.thinking}</p>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold mb-6 pb-2 border-b">{mid.fields.reportTitle}</h2>
                      <div className="whitespace-pre-wrap text-[#0f3d2e] leading-relaxed text-sm bg-gray-50 p-6 rounded-2xl">
                        {result}
                        {loading && <span className="inline-block w-2 h-4 ml-1 bg-[#0f3d2e] animate-pulse" />}
                      </div>
                      
                      {!loading && result && (
                        <div className="mt-6 p-4 bg-gray-100/50 rounded-xl border border-gray-200/50">
                          <p className="text-[12px] text-gray-500 leading-relaxed italic">
                          {disclaimer} {/* 修改後：直接調用配置文件裡的內容 */}
                          </p>
                        </div>
                      )}

                      {!loading && (
                        <button 
                          onClick={() => { setShowResult(false); setResult(""); }} 
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

        <div className="space-y-6 lg:space-y-8 order-2">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-white space-y-4">
            <h3 className="font-bold text-sm flex items-center"><span className="bg-[#0f3d2e] text-white p-1 rounded mr-2">ℹ</span>{notice.title}</h3>
            <div className="text-[13px] text-[#356f5b] leading-relaxed whitespace-pre-line">{notice.content}</div>
          </div>
          
          <RecoveryModal 
            locale={locale} 
            moduleType="naming" 
            onResultFound={(content, inputData) => { 
              setResult(content); 
              setShowResult(true);
              if (inputData) setFormDataState(inputData);
              localStorage.removeItem("naming_backup_content"); 
            }}
            onNeedsReRun={(inputData) => { 
              setShowResult(false); 
              setResult(""); 
              setIsPrePaid(true); 
              if (inputData) setFormDataState(inputData);
              // 🟢 新增：自動捲動到頂部
              window.scrollTo({ top: 0, behavior: 'smooth' });
              alert(locale === "es" ? "Pago verificado. Puede generar ahora." : "Payment verified. You can generate now.");
            }}
          />
        </div>
      </main>

      <footer className="mt-20 py-10 bg-transparent">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto mb-1">
            <p className="text-sm text-gray-500/80 leading-relaxed">{foot.about}</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2">
             <p className="text-sm text-gray-400">© 2026 Zanpath AI. </p>
            {foot.links.map(link => (
              <Link key={link.name} href={link.href} className="text-sm text-[#356f5b] hover:text-[#0f3d2e] transition-colors">{link.name}</Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}