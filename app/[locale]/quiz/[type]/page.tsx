"use client";

import { useState, useMemo, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Wallet, Heart, Sparkles, ShieldCheck, Zap, ArrowRight, BarChart3, Briefcase } from "lucide-react";
import { personalityQuiz } from "@/config/quiz/personality";
import { wealthQuiz } from "@/config/quiz/wealth";
import { loveQuiz } from "@/config/quiz/love";
import { careerQuiz } from "@/config/quiz/career";

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();

  const locale = (params.locale as "en" | "es") || "en";
  const type = params.type as string;

  const quizMap: any = {
    personality: personalityQuiz,
    wealth: wealthQuiz,
    love: loveQuiz,
    career: careerQuiz,
  };

  const currentQuizData = useMemo(() => {
    const quiz = quizMap[type] || personalityQuiz;
    return quiz[locale] || quiz["en"];
  }, [type, locale]);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [result, setResult] = useState("");
  const [score, setScore] = useState(0);

  const questions = currentQuizData.questions;

  // 根据分数获取颜色主题
  const getTheme = (s: number) => {
    if (s >= 90) return { text: "text-emerald-600", bg: "bg-emerald-600", light: "bg-emerald-50", border: "border-emerald-100" };
    if (s >= 80) return { text: "text-blue-600", bg: "bg-blue-600", light: "bg-blue-50", border: "border-blue-100" };
    return { text: "text-amber-600", bg: "bg-amber-600", light: "bg-amber-50", border: "border-amber-100" };
  };

  const handleAnswer = (val: string) => {
    const next = [...answers, val];
    setAnswers(next);

    if (step + 1 < questions.length) {
      setStep(step + 1);
    } else {
      // 模拟生成结果并随机分数
      setScore(Math.floor(72 + Math.random() * 23));
      generateResult(next);
    }
  };

  const generateResult = (ans: string[]) => {
    if (typeof window !== "undefined" && window.navigator.vibrate) {
      window.navigator.vibrate([30, 50, 30]);
    }
  
    const count: any = {};
    ans.forEach((a) => (count[a] = (count[a] || 0) + 1));
    const top = Object.keys(count).sort((a, b) => count[b] - count[a])[0];
    
    // ✅ 统一只存原始 Key (例如 "STR" 或 "P")
    setResult(top);
  };

  const theme = getTheme(score);

  // 结果页逻辑
  if (result) {
    // ✅ 定义不同测试的高级头衔显示名
    const displayTitle = (() => {
      const titles: any = {
        // 1. 事业模块：侧重领导力与职业属性
        career: {
          STR: locale === "es" ? "El Arquitecto Estratégico" : "The Strategic Architect",
          LDR: locale === "es" ? "El Comandante Visionario" : "The Visionary Commander",
          EMP: locale === "es" ? "El Guía Armónico" : "The Harmonic Guide",
          CRE: locale === "es" ? "El Alquimista Creativo" : "The Creative Alchemist",
          SPEC: locale === "es" ? "El Maestro Artesano" : "The Master Artisan",
        },
        // 2. 财富模块：侧重金钱观与丰盛模式
        wealth: {
          SAV: locale === "es" ? "El Guardián del Tesoro" : "The Treasure Guardian",
          INV: locale === "es" ? "El Alquimista del Valor" : "The Value Alchemist",
          ENT: locale === "es" ? "El Pionero de la Abundancia" : "The Abundance Pioneer",
          PHI: locale === "es" ? "El Flujo Generoso" : "The Generous Flow",
          ANA: locale === "es" ? "El Estratega de Riqueza" : "The Wealth Strategist",
        },
        // 3. 爱情/关系模块：侧重情感模式与灵魂共鸣
        love: {
          ROM: locale === "es" ? "El Buscador de Almas" : "The Soul Seeker",
          STA: locale === "es" ? "El Ancla de Devoción" : "The Anchor of Devotion",
          ADV: locale === "es" ? "El Viajero del Corazón" : "The Heart Traveler",
          INT: locale === "es" ? "El Sabio de la Intimidad" : "The Wisdom of Intimacy",
          PRO: locale === "es" ? "El Protector del Vínculo" : "The Bond Protector",
        },
        // 4. 性格模块：侧重核心本质与能量原型
        personality: {
          P1: locale === "es" ? "El Observador Profundo" : "The Deep Observer",
          P2: locale === "es" ? "El Empático Radiante" : "The Radiant Empath",
          P3: locale === "es" ? "El Forjador de Destinos" : "The Destiny Shaper",
          P4: locale === "es" ? "El Equilibrista Zen" : "The Zen Balancer",
          P5: locale === "es" ? "El Espíritu Libre" : "The Free Spirit",
        }
      };
    
      // 逻辑检查：如果 type 匹配且 result (Key) 存在，返回精修标题；否则返回原始 result
      if (titles[type] && titles[type][result]) {
        return titles[type][result];
      }
      
      return result; 
    })();

    return (
      <main className="relative max-w-2xl mx-auto px-6 py-12 min-h-screen overflow-visible">
        {/* 1. 优化后的粒子背景：确保它覆盖整个 main 区域 */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute w-1.5 h-1.5 rounded-full ${theme.bg} opacity-30`}
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: Math.random() * 100 + "%",
                scale: 0 
              }}
              animate={{ 
                y: [null, "-25%", "25%"],
                opacity: [0.1, 0.4, 0.1],
                scale: [1, 2, 1]
              }}
              transition={{ 
                duration: 4 + Math.random() * 6, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
            />
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center relative z-10" // 确保内容在粒子上方
        >
          {/* 2. 顶部徽章 */}
          {/* 顶部徽章 */}
        

          <h2 className="text-5xl font-serif font-bold text-[#0f3d2e] mb-4 tracking-tight">
          {displayTitle} 
          </h2>

          <p className="text-[#356f5b]/60 italic font-medium mb-10">
            {type === "career" 
              ? (locale === "es" ? "Mapa de Alineación Profesional" : "Professional Alignment Map")
              : (locale === "es" ? "Informe de Patrón Energético" : "Energy Pattern Report")
            }
          </p>

          {/* 动态分数环/条 */}
          <div className={`p-8 rounded-[2.5rem] ${theme.light} border ${theme.border} mb-10 relative overflow-hidden`}>
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-4">
                <div className="text-left">
                  <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-[#356f5b]/50">Destiny Alignment</span>
                  <span className={`text-4xl font-black ${theme.text}`}>{score}%</span>
                </div>
                <BarChart3 className={theme.text} size={24} />
              </div>
              
              <div className="h-4 w-full bg-white/50 rounded-full overflow-hidden p-1 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`h-full ${theme.bg} rounded-full`}
                />
              </div>
              <p className="mt-4 text-[11px] text-[#356f5b]/60 text-left leading-relaxed font-medium">
                {locale === "es" 
                  ? "* Tu resonancia es alta, pero existen bloqueos menores en tus ciclos de tiempo." 
                  : "* High resonance detected, though minor blockages exist in your timing cycles."}
              </p>
            </div>
            {/* 背景装饰球 */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 ${theme.bg} opacity-5 blur-3xl rounded-full`} />
          </div>

       {/* 核心深度分析内容 */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-50 text-left mb-10 relative"
          >
            <div className="absolute -top-4 left-8 bg-[#0f3d2e] text-white px-4 py-1 rounded-lg text-[10px] font-bold tracking-widest uppercase">
              Deep Insight
            </div>
            <p className="text-[#0f3d2e] text-xl font-serif italic leading-relaxed mb-6">
              "{currentQuizData.results[result]}"
            </p>
            <div className="h-px w-full bg-gray-100 mb-6" />
            <div className="flex gap-4 items-start text-[#356f5b]/80">
              <Zap className="shrink-0 text-amber-400" size={20} />
              <p className="text-sm leading-relaxed">
                {locale === "es" 
                  ? "Esta frecuencia sugiere una alineación única con las fuerzas elementales. Tu patrón sugiere que tus mayores éxitos provienen de la armonización interna antes de la acción externa."
                  : "This frequency suggests a unique alignment with elemental forces. Your pattern indicates your greatest successes stem from internal harmonization before external action."}
              </p>
            </div>
          </motion.div>

         {/* 转化 CTA - 强调从通用到精准的跨越 */}
<motion.div 
  whileHover={{ scale: 1.01 }}
  className="bg-[#0f3d2e] p-1 rounded-[2.2rem] shadow-2xl mt-12"
>
  <div className="bg-[#0f3d2e] border border-white/20 rounded-[2rem] p-8 text-white relative overflow-hidden">
    <h4 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2">
      <Sparkles size={24} className="text-amber-400" />
      {locale === "es" ? "Más allá de las tendencias" : "Beyond Surface Patterns"}
    </h4>
    
    <p className="text-white/80 text-sm mb-8 leading-relaxed px-4 text-center">
      {locale === "es"
        ? "Este test gratuito analiza tendencias generales. Un análisis basado en su hora exacta de nacimiento (BaZi) proporciona una alineación mucho más personalizada y una guía de tiempo precisa para su próximo gran avance."
        : "This assessment identifies general tendencies. A precise analysis based on your exact birth time (BaZi) provides a significantly more personalized alignment and a specific timing roadmap for your next breakthrough."}
    </p>

    <button
      onClick={() => router.push("/")}
      className="group w-full bg-white text-[#0f3d2e] py-5 rounded-2xl font-black text-lg shadow-xl hover:bg-[#fcfcf9] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
    >
      {locale === "es" ? "OBTENER MI MAPA PERSONALIZADO" : "GET MY TIME-BASED ANALYSIS"}
      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
    </button>

    {/* 增加专业背书标识：Analytical Rigor & 100% Private */}
    <div className="mt-6 flex items-center justify-center gap-6 opacity-40">
       <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold">
         <ShieldCheck size={10} /> {locale === "es" ? "RIGOR ANALÍTICO" : "Analytical Rigor"}
       </div>
       <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold">
         <Zap size={10} /> {locale === "es" ? "RECONOCIMIENTO DE PATRONES" : "Pattern Recognition"}
       </div>
       <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold">
         <Briefcase size={10} /> 100% PRIVATE
       </div>
    </div>
  </div>
</motion.div>
        </motion.div>
      </main>
    );
  }

  // 问题页
  return (
    <div className="max-w-xl mx-auto px-6 min-h-[80vh] flex flex-col justify-center py-12">
      {/* 进度条 */}
      <div className="mb-12">
        <div className="flex justify-between items-end mb-3">
          <span className="text-[10px] font-black tracking-widest text-[#0f3d2e]/40 uppercase">Analyzing Pattern...</span>
          <span className="text-xs font-bold text-[#0f3d2e]">{step + 1} / {questions.length}</span>
        </div>
        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden p-0.5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
            className="h-full bg-[#0f3d2e] rounded-full"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="space-y-10"
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#0f3d2e] leading-tight">
            {questions[step]?.q}
          </h2>

          <div className="grid gap-4">
            {questions[step]?.options.map((o: any, i: number) => (
              <motion.button
                key={o.text}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleAnswer(o.value)}
                className="group flex items-center justify-between w-full p-6 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm hover:border-[#0f3d2e] hover:shadow-xl hover:-translate-y-0.5 transition-all text-left"
              >
                <span className="text-[#0f3d2e] font-semibold text-lg">{o.text}</span>
                <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-[#0f3d2e] group-hover:text-white transition-colors">
                  <ArrowRight size={14} />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}