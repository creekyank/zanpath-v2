"use client";

import { useState, useEffect, useRef } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { VISUAL_PROMPT_TEMPLATE } from "@/config/prompts";
import { UPLOAD_GUIDELINES, NAV_MENU, PAGE_SPECIFIC_CONTENT, COMMON_FOOTER, DISCLAIMER_TEXT } from "@/config/site-content";
import { ADMIN_CONFIG, isAdminEmail } from "@/config/admin";
import RecoveryModal from "@/components/RecoveryModal";
import { processImageForAI } from "@/lib/utils"; // 確保路徑指向 lib/utils

export default function FaceReflectionPage() {
  const locale = useLocale() as "en" | "es";
  const disclaimer = DISCLAIMER_TEXT[locale] || DISCLAIMER_TEXT.en;
  const pathname = usePathname();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState("");
  const [isPrePaid, setIsPrePaid] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // 1. 狀態管理 (保留 Gender 原始含義)
  const [formDataState, setFormDataState] = useState({
    surname: "",      // 此處代表姓名
    gender: "Male",   // 男性 (Yang) / 女性 (Yin)
    email: "",
    preferences: "",
    imageData: ""     // 存儲處理後的 Base64
  });

  useEffect(() => {
    const backup = localStorage.getItem("face_backup_content");
    if (backup && backup.length > 500) {
      setResult(backup);
      setShowResult(true);
    }
  }, []);

  const currentLangName = locale === "es" ? "Spanish" : "English";
  const guide = UPLOAD_GUIDELINES.face[locale] || UPLOAD_GUIDELINES.face.en;
  const mid = PAGE_SPECIFIC_CONTENT.face[locale] || PAGE_SPECIFIC_CONTENT.face.en;
  const foot = COMMON_FOOTER[locale] || COMMON_FOOTER.en;
  const menuItems = NAV_MENU[locale] || NAV_MENU.en;

  // 圖片處理
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

  // 2. AI 生成邏輯
  const processAiGeneration = async (formData: FormData, source: string) => {
    const inputSnapshot = formDataState;
    const email = formDataState.email.toLowerCase().trim();

    if (!formDataState.imageData) {
      alert(mid.fields.requiredTip);
      return;
    }

    setLoading(true);
    setResult("");
    setShowResult(true);
    localStorage.removeItem("face_backup_content");

    let fullResult = "";

    try {
      // 測臉直接傳遞 Gender，因為相學中男女解讀標準不同
      const finalPrompt = VISUAL_PROMPT_TEMPLATE
        .replace("${outputLanguage}", currentLangName)
        .replace("${languageMode}", source === "vip_debug" ? "VIP" : "REGULAR")
        .replace("${visualInputData}", `Name: ${formDataState.surname}. Gender: ${formDataState.gender}. User Context: ${formDataState.preferences}`);

// ... 原有的 finalPrompt 定義 ...

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: finalPrompt, 
          source: source, 
          email: email,
          image: formDataState.imageData,
          // 🔴 新增：顯式傳遞用戶備註，讓 Groq 視覺掃描時能參考
          preferences: formDataState.preferences 
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("AI API Error:", {
          status: response.status,
          body: text,
        });
        throw new Error(text || "AI request failed");
      };

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No reader");

// --- 修改開始 ---
// 修改後
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value);
  const lines = chunk.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("data: ") && trimmed !== "data: [DONE]") {
      try {
        const json = JSON.parse(trimmed.substring(6));
        // 統一讀取標準的 content 字段
        const text = json.choices?.[0]?.delta?.content || "";
        if (text) {
          fullResult += text;
          setResult(prev => prev + text);
        }
      } catch (e) { /* 靜默處理分段數據解析錯誤 */ }
    }
  }
}
// --- 修改結束 ---

      if (fullResult.length > 500) {
        await fetch("/api/orders/save-result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            content: fullResult,
            module: "face",
            isComplete: true,
            inputData: inputSnapshot,
            locale: locale
          }),
        });
        localStorage.removeItem("face_backup_content");
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
    const tip = (mid as any).fields?.requiredTip || "Please upload a photo and fill out all fields.";
    target.setCustomValidity(tip);
  };

  const handleSubmit = async (e: React.FormEvent, mode: 'NORMAL' | 'VIP') => {
    e.preventDefault();
    const email = formDataState.email.trim().toLowerCase();

    if (!email || !formDataState.surname || !formDataState.imageData) {
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
          product: "PRI_REAL_PRODUCT_ID_FOR_FACE", // 替換為測臉產品 ID
          email: email,
          passthrough: JSON.stringify({ source: "face_module", locale: locale }),
          successCallback: () => processAiGeneration(new FormData(), "face_module")
        });
      } else {
        alert("Payment system is loading, please refresh.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dff3ee] to-[#eaf7f2] text-[#0f3d2e]">
      {/* 導航欄保持一致 */}
      <nav className="flex justify-center border-b border-gray-100 bg-transparent backdrop-blur-md sticky top-0 z-50">
        <div className="w-full max-w-5xl flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" className="w-8 h-8" alt="Logo" />
            <span className="font-bold text-lg">Zanpath AI</span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex space-x-6 text-sm font-medium text-[#356f5b]">
              {menuItems.map(item => (
                <Link key={item.href} href={item.href} className={item.href === "/face" ? "text-[#0f3d2e] border-b-2 border-[#0f3d2e] pb-1" : "hover:text-[#0f3d2e]"}>
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center bg-white/50 rounded-full px-3 py-1 border border-gray-200 text-xs">
              <button onClick={() => router.push(pathname, { locale: 'en' })} className={`px-2 py-1 rounded-full ${locale === 'en' ? 'bg-[#0f3d2e] text-white' : 'text-gray-500'}`}>EN</button>
              <button onClick={() => router.push(pathname, { locale: 'es' })} className={`px-2 py-1 rounded-full ${locale === 'es' ? 'bg-[#0f3d2e] text-white' : 'text-gray-500'}`}>ES</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 order-1">
          <div className="mb-6 text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight mb-3">{mid.title}</h1>
            <p className="text-[#4a7c6d] text-[15px] leading-relaxed">{mid.desc}</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-white">
            {!showResult && !loading ? (
              <form onSubmit={(e) => handleSubmit(e, 'NORMAL')} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1">
                    <label className="text-xs font-bold text-gray-500 ml-1">{mid.fields.surname}</label>
                    <input name="surname" value={formDataState.surname} onChange={(e) => setFormDataState({...formDataState, surname: e.target.value})} required onInvalid={handleInvalid} onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")} placeholder={mid.fields.surnamePh} className="p-4 rounded-xl bg-gray-50 border border-transparent focus:border-[#0f3d2e] outline-none" />
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
                  <input name="email" type="email" value={formDataState.email} onChange={(e) => setFormDataState({...formDataState, email: e.target.value})} required onInvalid={handleInvalid} onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")} placeholder="your@email.com" className="p-4 rounded-xl bg-gray-50 border-none outline-none" />
                </div>

                {/* 臉部照片上傳 */}
                <div className="flex flex-col space-y-2">
                  <label className="text-xs font-bold text-gray-500 ml-1">{mid.fields.uploadBtn}</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative h-48 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${selectedImage ? 'border-[#0f3d2e] bg-gray-50' : 'border-gray-200 hover:border-[#0f3d2e] bg-gray-50/50'}`}
                  >
                    {selectedImage ? (
                      <img src={selectedImage} className="h-full w-full object-contain rounded-2xl p-2" alt="Face Preview" />
                    ) : (
                      <>
                        <span className="text-3xl mb-2">👤</span>
                        <span className="text-xs text-gray-400">{mid.fields.uploadTip}</span>
                      </>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  </div>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-xs font-bold text-gray-500 ml-1">{mid.fields.pref}</label>
                  <textarea name="preferences" value={formDataState.preferences} onChange={(e) => setFormDataState({...formDataState, preferences: e.target.value})} rows={3} placeholder={mid.fields.prefPh} className="p-4 rounded-xl bg-gray-50 border-none outline-none text-sm" />
                </div>

                <div className="space-y-4">
                  <button type="submit" className="w-full py-5 rounded-2xl bg-[#0f3d2e] text-white font-bold text-lg hover:opacity-90 transition-all">
                    {isPrePaid ? mid.fields.btnPaid : mid.fields.btnNormal}
                  </button>

                    {/* --- 插入開始 --- */}
{!isPrePaid && (
  <div className="mt-4 px-2 text-center space-y-1">
    <p className="text-[15px] text-[#0f3d2e] font-medium leading-tight">
      Payments are currently being finalized. All features are available for exploration during this period.
    </p>
    <p className="text-[15px] text-[#0f3d2e] font-medium leading-tight">
      Los pagos se están finalizando actualmente. Todas las funciones están disponibles para exploración durante este período.
    </p>
  </div>
)}
{/* --- 插入結束 --- */}

                  <div className="bg-gray-50/50 rounded-2xl p-6 space-y-3 border border-gray-100/50">
                    <p className="text-[13px] text-[#0f3d2e] font-medium leading-relaxed">{mid.intro}</p>
                    <ul className="text-xs text-[#356f5b] space-y-2 list-disc ml-4 font-normal">
                      {mid.features.map(item => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                </div>

                <button type="button" onClick={(e) => handleSubmit(e as any, 'VIP')} className="w-full py-3 rounded-xl border-2 border-[#c6a355] text-[#c6a355] font-bold text-sm">
                  {mid.fields.btnVip}
                </button>
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
                        <div className="mt-6 p-4 bg-gray-100/50 rounded-xl border border-gray-200/50 text-[12px] text-gray-500 italic leading-relaxed">
                          {disclaimer}
                        </div>
                      )}
                      {!loading && (
                        <button onClick={() => { setShowResult(false); setResult(""); setSelectedImage(null); }} className="mt-8 w-full py-4 bg-[#0f3d2e] text-white rounded-xl font-bold hover:opacity-90">
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

        {/* 右側指南 */}
        <div className="space-y-6 lg:space-y-8 order-2">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-white space-y-4">
            <h3 className="font-bold text-sm flex items-center text-[#0f3d2e]"><span className="bg-[#0f3d2e] text-white p-1 rounded mr-2">👤</span>{guide.title}</h3>
            <div className="text-[13px] text-[#356f5b] leading-relaxed whitespace-pre-line">
               {guide.content}
            </div>
          </div>
          
          <RecoveryModal 
            locale={locale} 
            moduleType="face" 
            onResultFound={(content, inputData) => { 
              setResult(content); 
              setShowResult(true);
              if (inputData) setFormDataState(inputData);
              localStorage.removeItem("face_backup_content"); 
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

      {/* Footer 保持一致 */}
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