"use client";

import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Brain, Wallet, Heart, Sparkles, ChevronRight, Briefcase} from "lucide-react";
import { useParams } from "next/navigation";

export default function QuizHome() {
  const params = useParams();
  const locale = params.locale as string;

  const tests = [
    {
      id: "personality",
      title: locale === "es" ? "Prueba de Personalidad" : "Personality Pattern",
      desc: locale === "es" ? "Descubre tu arquetipo interno y energía central." : "Discover your core archetype and internal energy.",
      icon: <Brain className="w-8 h-8 text-indigo-500" />,
      color: "from-indigo-50 to-white",
      border: "hover:border-indigo-200",
      link: "/quiz/personality"
    },
    {
      id: "wealth",
      title: locale === "es" ? "Potencial de Riqueza" : "Wealth Intelligence",
      desc: locale === "es" ? "Analiza tu ADN financiero y flujo de abundancia." : "Analyze your financial DNA and abundance flow.",
      icon: <Wallet className="w-8 h-8 text-emerald-500" />,
      color: "from-emerald-50 to-white",
      border: "hover:border-emerald-200",
      link: "/quiz/wealth"
    },
    {
      id: "love",
      title: locale === "es" ? "Destino Romántico" : "Romantic Destiny",
      desc: locale === "es" ? "Revela los patrones ocultos de tu corazón." : "Unveil the hidden patterns of your heart.",
      icon: <Heart className="w-8 h-8 text-rose-500" />,
      color: "from-rose-50 to-white",
      border: "hover:border-rose-200",
      link: "/quiz/love"
    },
     {
  id: "career",
  title: locale === "es" ? "Senda Profesional" : "Career Path",
  desc: locale === "es" ? "Identifica tu vocación natural y potencial de liderazgo." : "Identify your natural vocation and leadership potential.",
  icon: <Briefcase className="w-8 h-8 text-amber-500" />, // 记得从 lucide-react 引入 Briefcase
  color: "from-amber-50 to-white",
  border: "hover:border-amber-200",
  link: "/quiz/career"
}
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f8fcfb] to-white py-20 px-6 relative overflow-hidden">
      {/* 背景装饰（Zen Minimalist Style） */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#0f3d2e]/2 to-transparent -z-10 rounded-full blur-3xl opacity-50" />

      <div className="max-w-3xl mx-auto">
        {/* 顶部标题区 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#0f3d2e] mb-6">
            {locale === "es" ? "Análisis Gratuito de tu Camino de Vida" : "Free Life Path Analysis"}
          </h1>
          <p className="text-lg text-[#356f5b]/70 max-w-xl mx-auto leading-relaxed">
            {locale === "es" 
              ? "Desbloquee el mapa oculto de su vida. Acceda a algoritmos especializados diseñados para analizar su frecuencia energética única en todos los dominios principales de la existencia." 
              : "Unlock the hidden blueprint of your life. Access specialized algorithms designed to analyze your unique energy frequency across all major life domains."}
          </p>
        </motion.div>

        {/* 测试卡片列表 */}
        <div className="grid gap-6">
          {tests.map((test, index) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <Link 
                href={test.link} 
                className={`group relative flex items-center p-8 bg-white border border-gray-100 rounded-3xl shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${test.border}`}
              >
                {/* 左侧图标 */}
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${test.color} group-hover:scale-110 transition-transform`}>
                  {test.icon}
                </div>

                {/* 中间文字 */}
                <div className="ml-6 flex-1">
                  <h3 className="text-xl font-bold text-[#0f3d2e] mb-1 group-hover:text-black transition-colors">
                    {test.title}
                  </h3>
                  <p className="text-sm text-[#356f5b]/60 leading-snug">
                    {test.desc}
                  </p>
                </div>

                {/* 右侧指示器 */}
                <div className="ml-4 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all text-[#0f3d2e]">
                  <ChevronRight size={28} strokeWidth={2.5} />
                </div>
                
                {/* 底部装饰线 */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-[#0f3d2e] rounded-full transition-all duration-500 group-hover:w-1/3 opacity-30" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* 底部信任语 - 优化后的专业版 */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-20 text-center border-t border-gray-100 pt-10" // 增加了一条浅浅的分割线
          >
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 grayscale opacity-40">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
                {locale === "es" ? "Rigor Analítico" : "Analytical Rigor"}
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
                {locale === "es" ? "Reconocimiento de Patrones" : "Pattern Recognition"}
              </span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase">
                {locale === "es" ? "100% Privado" : "100% Private"}
              </span>
            </div>
          </motion.div>
      </div>
    </main>
  );
}