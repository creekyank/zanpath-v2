"use client";

import { useState, useEffect } from "react";

interface RecoveryModalProps {
  locale: string; // 修改為 string 以兼容可能的其他語言輸入
  moduleType: string;
  onResultFound: (content: string, inputData?: any) => void;
  onNeedsReRun?: (inputData?: any) => void;
}

export default function RecoveryModal({ locale, moduleType, onResultFound, onNeedsReRun }: RecoveryModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 1. 定義翻譯資源
  const translations = {
    en: {
      title: "Order Recovery",
      btn: "Already Paid? Recover Report",
      emailPh: "Enter your payment email",
      codePh: "6-Digit Verification Code",
      sendCode: "Send Code",
      verify: "Verify & Recover",
      noOrder: "No paid order found. If you just paid, please wait 1-2 mins.",
      wait: "Resend in ",
      error: "Recovery failed. Please try again.",
      close: "Close"
    },
    es: {
      title: "Recuperar Pedido",
      btn: "¿Ya pagaste? Recuperar informe",
      emailPh: "Correo electrónico de pago",
      codePh: "Código de 6 dígitos",
      sendCode: "Enviar código",
      verify: "Verificar y recuperar",
      noOrder: "No se encontró pedido. Si acaba de pagar, espere 1-2 min.",
      wait: "Reenviar en ",
      error: "Error al recuperar. Inténtelo de nuevo.",
      close: "Cerrar"
    }
  };

  // 2. 🟢 關鍵修復行：根據 locale 獲取翻譯，若無匹配則默認英文 (防止紅色波浪線)
  const t = translations[locale as keyof typeof translations] || translations.en;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = async () => {
    if (!email || !email.includes('@')) return alert("Please enter a valid email.");
    setLoading(true);
    try {
      const res = await fetch("/api/orders/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, moduleType, locale }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setCountdown(60);
      } else {
        alert(data.error || t.noOrder);
      }
    } catch (e) {
      alert(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length < 4) return;
    setLoading(true);
    try {
      const res = await fetch("/api/orders/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, moduleType, locale }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.hasResult) {
          onResultFound(data.content, data.inputData);
          handleClose();
        } else {
          onNeedsReRun?.(data.inputData);
          handleClose();
          alert(data.message);
        }
      } else {
        alert(data.error || "Invalid code");
      }
    } catch (e) {
      alert(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setStep(1);
      setCode("");
    }, 300);
  };

  return (
    <div className="mt-4">
      <button 
        onClick={() => setIsOpen(true)}
        className="w-full py-3 px-4 rounded-xl border border-dashed border-[#356f5b] text-[#356f5b] text-sm font-medium hover:bg-white/50 hover:border-[#0f3d2e] hover:text-[#0f3d2e] transition-all flex items-center justify-center gap-2"
      >
        <span className="text-lg">🔍</span> {t.btn}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4 transition-all">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#0f3d2e]">{t.title}</h3>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            {step === 1 ? (
              <div className="space-y-4">
                <p className="text-xs text-gray-500 mb-2 leading-relaxed">
                  {locale === 'es' ? 'Se enviará un código a su correo para validar su pago.' : 'A code will be sent to your email to validate your payment.'}
                </p>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPh}
                  className="w-full p-4 rounded-2xl bg-gray-50 border border-transparent focus:border-[#0f3d2e] outline-none transition-all"
                />
                <button 
                  onClick={handleSendCode}
                  disabled={loading || countdown > 0}
                  className="w-full py-4 bg-[#0f3d2e] text-white rounded-2xl font-bold shadow-lg shadow-green-900/20 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {loading ? "..." : (countdown > 0 ? `${t.wait}${countdown}s` : t.sendCode)}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-green-600 font-medium mb-2">
                   Check your email: {email}
                </p>
                <input 
                  type="text" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={t.codePh}
                  className="w-full p-4 rounded-2xl bg-gray-50 border border-transparent focus:border-[#0f3d2e] outline-none text-center text-2xl tracking-[0.5em] font-mono transition-all"
                />
                <button 
                  onClick={handleVerify}
                  disabled={loading || code.length < 4}
                  className="w-full py-4 bg-[#0f3d2e] text-white rounded-2xl font-bold shadow-lg shadow-green-900/20 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {loading ? "..." : t.verify}
                </button>
                <button 
                  onClick={() => setStep(1)} 
                  className="w-full text-xs text-gray-400 hover:text-[#356f5b] transition-colors"
                >
                  {locale === 'es' ? 'Volver a cambiar email' : 'Change email'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}