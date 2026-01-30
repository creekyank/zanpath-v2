"use client";

import { useState, useEffect } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { DREAM_PROMPT_TEMPLATE } from "@/config/prompts";
import { NAV_MENU, PAGE_SPECIFIC_CONTENT, COMMON_FOOTER, DISCLAIMER_TEXT } from "@/config/site-content";
import { ADMIN_CONFIG, isAdminEmail } from "@/config/admin";
import RecoveryModal from "@/components/RecoveryModal";

export default function DreamPage() {
  const locale = useLocale() as "en" | "es";
  const disclaimer = DISCLAIMER_TEXT[locale] || DISCLAIMER_TEXT.en;
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState("");
  const [isPrePaid, setIsPrePaid] = useState(false);

  const [formDataState, setFormDataState] = useState({
    surname: "",
    gender: "Male",
    email: "",
    description: "" 
  });

  useEffect(() => {
    const backup = localStorage.getItem("dream_backup_content");
    if (backup && backup.length > 500) {
      setResult(backup);
      setShowResult(true);
    }
  }, []);

  const currentLangName = locale === "es" ? "Spanish" : "English";
  const mid = PAGE_SPECIFIC_CONTENT.dream[locale] || PAGE_SPECIFIC_CONTENT.dream.en;
  const foot = COMMON_FOOTER[locale] || COMMON_FOOTER.en;
  const menuItems = NAV_MENU[locale] || NAV_MENU.en;

  const processAiGeneration = async (formData: FormData, source: string) => {
    const inputSnapshot = formDataState; 
    const email = formDataState.email.toLowerCase().trim();

    setLoading(true);
    setResult(""); 
    setShowResult(true);
    localStorage.removeItem("dream_backup_content");
  
    let fullResult = "";

    try {
      const finalPrompt = DREAM_PROMPT_TEMPLATE
        .replace("${outputLanguage}", currentLangName)
        .replace("${languageMode}", source === "vip_debug" ? "VIP" : "REGULAR")
        .replace("${dreamContent}", formDataState.description)
        .replace("${userEmotions}", "Reflective");
  
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: finalPrompt, source: source, email: email }),
      });
  
      if (!response.ok) throw new Error("Fetch failed");
  
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader");

// --- 修改開始 ---
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
        
        const text = json.choices?.[0]?.delta?.content || "";
        
        if (text) {
          fullResult += text;
          setResult((prev) => {
            const newRes = prev + text;
            // 每 50 個字符備份一次
            if (newRes.length % 50 === 0) {
              localStorage.setItem("dream_backup_content", newRes);
            }
            return newRes;
          });
        }
      } catch (e) { 
        // 忽略解析錯誤（部分流塊可能不完整）
        console.error("Parse error:", e); 
      }
    }
  }
}
// --- 修改結束 ---

      if (fullResult.length > 300) { 
        await fetch("/api/orders/save-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            email, 
            content: fullResult, 
            module: "dream",
            isComplete: true,
            inputData: inputSnapshot,
            locale: locale
          }),
        });
        localStorage.removeItem("dream_backup_content");
      }
    } catch (err: any) {
      console.error(err);
      alert(locale === "es" ? "Lo sentimos, la conexión se interrumpió." : "Sorry, connection interrupted.");
    } finally {
      setLoading(false);
      setIsPrePaid(false);
    }
  };

  const handleInvalid = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const tip = (mid as any).fields?.requiredTip || "Please fill out this field.";
    target.setCustomValidity(tip);
  };

  const handleInput = (e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    target.setCustomValidity("");
  };

  const handleSubmit = async (e: React.FormEvent, mode: 'NORMAL' | 'VIP') => {
    e.preventDefault();
    const email = formDataState.email.trim().toLowerCase();

    if (!email || !formDataState.surname || !formDataState.description) {
      alert(mid.fields.requiredTip);
      return;
    }

    if (mode === 'VIP' || isPrePaid || isAdminEmail(email)) {
      if (mode === 'VIP') {
        const pwd = prompt("Enter VIP Password:");
        if (pwd !== ADMIN_CONFIG.vipPassword) return alert("Incorrect password.");
      }
      processAiGeneration(new FormData(), isPrePaid ? "recovered_order" : (mode === 'VIP' ? "vip_debug" : "admin_test"));
    } else {
      if (window.Paddle) {
        window.Paddle.Checkout.open({
          product: "PRI_REAL_PRODUCT_ID_FOR_DREAM", 
          email: email,
          passthrough: JSON.stringify({ source: "dream_module", locale: locale }),
          successCallback: () => processAiGeneration(new FormData(), "dream_module")
        });
      } else {
        alert("Payment system is loading, please refresh.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dff3ee] to-[#eaf7f2] text-[#0f3d2e]">
      <nav className="flex justify-center border-b border-gray-100 bg-transparent backdrop-blur-md sticky top-0 z-50">
        <div className="w-full max-w-5xl flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" className="w-8 h-8" alt="Logo" />
            <span className="font-bold text-lg">Zanpath AI</span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 md:space-x-6 text-[13px] md:text-sm font-medium text-[#356f5b]">
              {menuItems.map(item => (
                <Link key={item.href} href={item.href} className={item.href === "/naming" ? "text-[#0f3d2e] border-b-2 border-[#0f3d2e] pb-1" : "hover:text-[#0f3d2e]"}>
                  {item.name}
                </Link>
              ))}
            </div>
            {/* 🟢 隱藏語言切換，但保留代碼以便未來開啟 */}
            {/*
            <div className="flex items-center bg-white/50 rounded-full px-3 py-1 border border-gray-200 text-xs">
              <button onClick={() => router.push(pathname, { locale: 'en' })} className={`px-2 py-1 rounded-full ${locale === 'en' ? 'bg-[#0f3d2e] text-white' : 'text-gray-500'}`}>EN</button>
              <button onClick={() => router.push(pathname, { locale: 'es' })} className={`px-2 py-1 rounded-full ${locale === 'es' ? 'bg-[#0f3d2e] text-white' : 'text-gray-500'}`}>ES</button>
            </div>
            */}
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 order-1">
          <div className="mb-6 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight mb-3 text-[#0f3d2e]">{mid.title}</h1>
            <p className="text-[#4a7c6d] text-[15px] leading-relaxed">{mid.desc}</p> 
            {/* 🟢 修改點：這裡從 text-lg 縮小為 text-[15px] 與起名頁一致 */}
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-white">
            {!showResult && !loading ? (
              <form onSubmit={(e) => handleSubmit(e, 'NORMAL')} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-gray-400 ml-1">{mid.fields.surname}</label>
                    <input name="surname" value={formDataState.surname} onChange={(e) => setFormDataState({...formDataState, surname: e.target.value})} required onInvalid={handleInvalid} onInput={handleInput} placeholder={mid.fields.surnamePh} className="p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#dff3ee] transition-all" />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-gray-400 ml-1">{mid.fields.gender}</label>
                    <select name="gender" value={formDataState.gender} onChange={(e) => setFormDataState({...formDataState, gender: e.target.value})} className="p-4 rounded-xl bg-gray-50 border-none outline-none appearance-none cursor-pointer">
                      <option value="Male">{mid.fields.male}</option>
                      <option value="Female">{mid.fields.female}</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-gray-400 ml-1">{mid.fields.email}</label>
                  <input name="email" type="email" value={formDataState.email} onChange={(e) => setFormDataState({...formDataState, email: e.target.value})} required onInvalid={handleInvalid} onInput={handleInput} placeholder="your@email.com" className="p-4 rounded-xl bg-gray-50 border-none outline-none focus:ring-2 focus:ring-[#dff3ee] transition-all" />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-gray-400 ml-1">{mid.fields.pref}</label>
                  <textarea name="description" value={formDataState.description} onChange={(e) => setFormDataState({...formDataState, description: e.target.value})} required onInvalid={handleInvalid} onInput={handleInput} rows={8} placeholder={mid.fields.prefPh} className="p-4 rounded-xl bg-gray-50 border-none outline-none text-sm leading-relaxed focus:ring-2 focus:ring-[#dff3ee] transition-all whitespace-pre-wrap" />
                </div>

                <div className="space-y-4">
                  <button type="submit" className="w-full py-5 rounded-2xl bg-[#0f3d2e] text-white font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-[#dff3ee]">
                    {isPrePaid ? mid.fields.btnPaid : mid.fields.btnNormal}
                  </button>

                  {/* --- 插入開始 --- */}
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

                  <div className="bg-[#f8fcfb] rounded-2xl p-6 space-y-4 border border-[#eaf7f2]">
                    {/* 🟢 修改點：補齊了 Zanpath AI provides... 全站統一聲明 */}
                    <p className="text-[13px] text-[#0f3d2e] font-semibold leading-relaxed">
                    {mid.intro} {/* 🟢 恢復簡潔，與起名頁邏輯一致 */}
                    </p>
                    <ul className="text-xs text-[#4a7c6d] space-y-2 list-disc ml-4 font-normal">
                      {mid.features.map(item => <li key={item}>{item}</li>)}
                    </ul>
                    <p className="text-[11px] text-gray-400 border-t border-gray-100 pt-3 italic leading-snug">{foot.disclaimer}</p>
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
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-white space-y-4 shadow-sm">
            <h3 className="font-bold text-sm text-[#0f3d2e] flex items-center">✨ Dream Reflection</h3>
            <p className="text-[13px] text-[#4a7c6d] leading-relaxed">
              Every dream is a letter from your subconscious. Our AI decodes cultural symbols and psychological patterns to help you find clarity.
            </p>
          </div>
          
          <RecoveryModal 
            locale={locale} 
            moduleType="dream"
            onResultFound={(content, inputData) => { 
              setResult(content); 
              setShowResult(true);
              if (inputData) setFormDataState(inputData);
              localStorage.removeItem("dream_backup_content"); 
            }}
            onNeedsReRun={(inputData) => { 
              setShowResult(false); 
              setResult(""); 
              setIsPrePaid(true); 
              if (inputData) setFormDataState(inputData);
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