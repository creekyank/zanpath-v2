// lib/mailer.ts

// 1. 定义参数类型，支持多语言和多模块扩展
interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
  moduleType: string; // 'naming' | 'bazi' | 'dream' | 'face' | 'fengshui'
  lang: string;       // 'en' | 'es' (支持未来扩展)
}

export async function sendEmail({ to, subject, html, moduleType, lang }: SendEmailProps) {
  // 2. 多语言字典映射 (i18n)
  const i18n: Record<string, any> = {
    en: {
      intro: "Thank you for choosing ZanPath AI. Your request has been processed.",
      reportHeader: "Here is your professional analysis",
      footer: "This report is for reference only. Wishing you a bright future!",
      moduleLabels: {
        naming: { name: "Professional Naming", input: "naming preferences" },
        bazi: { name: "Astrology/Bazi", input: "birth details" },
        dream: { name: "Dream Interpretation", input: "dream description" },
        face: { name: "Face Reading", input: "facial features" },
        fengshui: { name: "Feng Shui", input: "environment details" }
      }
    },
    es: {
      intro: "Gracias por elegir ZanPath AI. Su solicitud ha sido procesada.",
      reportHeader: "Aquí está su análisis profesional",
      footer: "Este informe es solo para referencia. ¡Le deseamos un futuro brillante!",
      moduleLabels: {
        naming: { name: "Nombramiento Profesional", input: "preferencias de nombre" },
        bazi: { name: "Astrología/Bazi", input: "datos de nacimiento" },
        dream: { name: "Interpretación de Sueños", input: "descripción del sueño" },
        face: { name: "Lectura de Rostro", input: "rasgos faciales" },
        fengshui: { name: "Feng Shui", input: "detalles del entorno" }
      }
    }
  };

  // 获取当前语言包，如果没有匹配则默认使用英语
  const dict = i18n[lang] || i18n['en'];
  
  // 获取当前模块的翻译信息
  const moduleInfo = dict.moduleLabels[moduleType] || { name: "AI Analysis", input: "provided information" };

  // 3. 组装发送给 EmailJS 的数据 (对应你最新的模板变量)
  const data = {
    service_id: "service_8z2vdct",
    template_id: "template_he0ybxv",
    user_id: "zbTR4SBh6xMI5yDRK",
    accessToken: "0OCNt_vj_FTxvV45aq84o",
    template_params: {
      user_email: to,
      user_name: to.split('@')[0], // 自动取邮箱前缀作为临时称呼
      subject: subject,           // 动态主题
      intro_text: dict.intro,     // 对应模板 {{intro_text}}
      module_info_text: `Your ${moduleInfo.name} has been completed based on your ${moduleInfo.input}`,
      user_input: "Analyzed securely via AI", // 对应模板 {{user_input}}
      report_header: dict.reportHeader,       // 对应模板 {{report_header}}
      report_content: html,                   // 对应模板 {{report_content}}
      footer_text: dict.footer                // 对应模板 {{footer_text}}
    },
  };

  try {
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      console.log(`✅ [${lang.toUpperCase()}] Email sent successfully for ${moduleType}`);
      return { success: true };
    } else {
      const errorText = await response.text();
      console.error("❌ EmailJS error:", errorText);
      return { success: false, error: errorText };
    }
  } catch (error) {
    console.error("🚀 System error during email send:", error);
    return { success: false, error };
  }
}