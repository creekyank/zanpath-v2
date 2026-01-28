// config/site-content.ts
export const TIME_ZONE_NOTICE = {
  en: {
    title: "Important: Birth Time & Time Zones",
    content: `Please enter your birth time in your local standard time. Our system analyzes information strictly based on the time you provide without automatic timezone conversion.

    If your birth certificate shows a local clock time, please enter that exact time.
If you know your city follows a specific U.S. time zone, please use that local time accordingly.
    
Example (United States):
• New York City uses Eastern Time (ET)
• Los Angeles uses Pacific Time (PT)
• Chicago uses Central Time (CT)
• Denver uses Mountain Time (MT)

For example:
If you were born in Los Angeles at 3:00 PM local time,
please enter 3:00 PM, not the time converted from another city.

Another example:
If you were born in New York City at 10:00 AM local time,
please enter 10:00 AM, even though it would be 7:00 AM in Los Angeles.

Please ensure the time you enter matches the local time used in your birth location.

This system is inspired by traditional Chinese time-based frameworks.

The analysis is generated using symbolic patterns derived from birth time,
seasonal cycles, and historical classification models.

Results are intended for personal reflection and cultural exploration only.
They do not differentiate between the Northern or Southern Hemisphere
and are not meant to predict or determine real-world outcomes.`, // 👈 检查这里，反引号必须闭合
    disclaimer: "Results are intended for cultural exploration only."
  },
zh: {
    title: "重要：出生时间与时区说明",
    content: `请输入您出生地的当地标准时间。系统将严格基于您提供的时间进行分析，不会自动进行时区转换。
    
例如：如果您出生在洛杉矶当地时间下午3点，请输入3:00 PM，不需要转换成其他城市的时间。
本系统分析结果仅供个人参考及文化探索。`,
    disclaimer: "结果仅供文化探索参考。"
  },
  es: {
    title: "Importante: Hora de Nacimiento y Zonas Horarias",
    content: `Por favor, introduzca su hora de nacimiento en su hora estándar local. Nuestro sistema analiza la información basándose estrictamente en la hora que usted proporcione, sin conversión automática de zona horaria.

Si su certificado de nacimiento muestra una hora de reloj local, introduzca esa hora exacta.
Si sabe que su ciudad sigue una zona horaria específica de EE. UU., utilice esa hora local en consecuencia.

Ejemplo (Estados Unidos):
• Nueva York utiliza la Hora del Este (ET)
• Los Ángeles utiliza la Hora del Pacífico (PT)
• Chicago utiliza la Hora Central (CT)
• Denver utiliza la Hora de la Montaña (MT)

Por ejemplo:
Si nació en Los Ángeles a las 3:00 PM hora local, introduzca las 3:00 PM, no la hora convertida de otra ciudad.

Otro ejemplo:
Si nació en Nueva York a las 10:00 AM hora local, introduzca las 10:00 AM, aunque sean las 7:00 AM en Los Ángeles.

Este sistema se inspira en los marcos tradicionales chinos basados en el tiempo. Los resultados están destinados únicamente a la reflexión personal y la exploración cultural.`,
    disclaimer: "Los resultados son solo para exploración cultural."
  }
};

// --- 5. 测脸与风水页面专用侧边栏 (取代 TIME_ZONE_NOTICE) ---
export const UPLOAD_GUIDELINES = {
  // 1. 空間/風水頁面指南 (Space Analysis)
  space: {
    en: {
      title: "Space Analysis Guidelines",
      content: `Recommended Images:
• Indoor layouts (living room, kitchen, bedroom)
• Exterior views (main entrance or garden)
• Clear floor plans or layout diagrams

For best results:
• Use clear, well-lit images at eye level
• Avoid extreme angles or heavy distortion
• One high-quality image per analysis

Supported formats:
• JPG / JPEG / PNG (Max 5MB)

Interpretation Notice:
This reflection is generated solely from visible elements in the image. The analysis is symbolic and interpretive, inspired by traditional Chinese spatial concepts and environmental aesthetics.

It does not assess structural safety, property value, or predict future outcomes. This content is for cultural interest and personal reflection only.`,
      disclaimer: "For cultural and personal reflection only."
    },
    es: {
      title: "Guía de Análisis Espacial",
      content: `Imágenes Recomendadas:
• Diseños interiores (sala, cocina, dormitorio)
• Vistas exteriores (entrada principal o jardín)
• Planos claros o diagramas de distribución

Para mejores resultados:
• Use imágenes claras, bien iluminadas y niveladas
• Evite ángulos extremos o distorsiones fuertes
• Una imagen de alta calidad por análisis

Formatos compatibles:
• JPG / JPEG / PNG (Máx. 5MB)

Aviso de interpretación:
Esta reflexión se genera únicamente a partir de los elementos visibles. El análisis es simbólico e interpretativo, inspirado en los conceptos espaciales tradicionales chinos y la estética ambiental.

No evalúa la seguridad estructural, el valor de la propiedad ni predice resultados futuros. Contenido solo para interés cultural y reflexión personal.`,
      disclaimer: "Solo para interés cultural y reflexión personal."
    }
  },

  // 2. 測臉/面相頁面指南 (Face Reflection)
  face: {
    en: {
      title: "Face Analysis Guidelines",
      content: `Please upload a clear photo of a human face.

For best results:
• One face per image
• Front-facing or slightly angled
• Neutral expression preferred
• Good lighting, no heavy filters

Supported formats:
• JPG / JPEG / PNG (Max 5MB)

Interpretation Notice:
This analysis is based only on visible facial features. The reflection is inspired by symbolic concepts in traditional Chinese culture and is generated for interpretive purposes only.

Results should not be considered a factual assessment or prediction of character, health, or fortune. This content is for cultural and personal reflection only.`,
      disclaimer: "For cultural and personal reflection only."
    },
    es: {
      title: "Guía de Análisis Facial",
      content: `Por favor, suba una foto clara de un rostro humano.

Para mejores resultados:
• Un rostro por imagen
• De frente o ligeramente de lado
• Preferiblemente con expresión neutra
• Buena iluminación, sin filtros pesados

Formatos compatibles:
• JPG / JPEG / PNG (Máx. 5MB)

Aviso de interpretación:
Este análisis se basa solo en los rasgos faciales visibles. La reflexión está inspirada en conceptos simbólicos de la cultura tradicional china y se genera solo con fines interpretativos.

Los resultados no deben considerarse una evaluación objetiva o predicción de carácter, salud o fortuna. Solo para interés cultural y reflexión personal.`,
      disclaimer: "Solo para interés cultural y reflexión personal."
    }
  }
};

// --- 2. 全站通用导航 (Bazi, Naming, Dream, Space, Visual) ---
export const NAV_MENU = {
  en: [
    { name: "Life Path", href: "/" },
    { name: "Naming", href: "/naming" },
    { name: "Dream", href: "/dream" },
    { name: "Space", href: "/fengshui" }, // 对应你提供的链接
    { name: "Visual", href: "/face" }    // 对应你提供的链接
  ],
  zh: [
    { name: "八字 AI", href: "/" },
    { name: "起名", href: "/naming" },
    { name: "解梦", href: "/dream" },
    { name: "空间风水", href: "/fengshui" },
    { name: "面相视觉", href: "/face" }
  ],
  es: [
    { name: "Camino de Vida", href: "/" },
    { name: "Nombres", href: "/naming" },
    { name: "Sueños", href: "/dream" },
    { name: "Espacio", href: "/fengshui" },
    { name: "Visual", href: "/face" }
  ]
};

// --- 3. 全站通用页脚 (底部说明与链接) ---
export const COMMON_FOOTER = {
  en: {
    about: "Zanpath AI provides AI-generated cultural and personal reflection content.",
    disclaimer: "For entertainment and self-exploration purposes only. This service does not provide medical, legal, or financial advice.",
    links: [
      { name: "Wisdom", href: "/wisdom" },
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Refund Policy", href: "/refund" },
      { name: "Contact Us", href: "/contact" }
    ]
  },
  zh: {
    about: "Zanpath AI 提供 AI 生成的文化与个人反思内容。",
    disclaimer: "仅供娱乐和自我探索参考。本服务不提供医疗、法律或财务建议。",
    copyright: "Wisdom",
    links: [
      { name: "隐私政策", href: "/privacy" },
      { name: "服务条款", href: "/terms" },
      { name: "退款政策", href: "/refund" },
      { name: "联系我们", href: "/contact" }
    ]
  },
  es: {
    about: "Zanpath AI proporciona contenido de reflexión personal y cultural generado por IA.",
    disclaimer: "Solo para fines de entretenimiento y autoexploración. Este servicio no proporciona asesoramiento médico, legal o financiero.",
    links: [
      { name: "Sabiduría", href: "/wisdom" },
      { name: "Privacidad", href: "/privacy" },
      { name: "Términos", href: "/terms" },
      { name: "Reembolsos", href: "/refund" },
      { name: "Contacto", href: "/contact" }
    ]
  }
};

// --- 4. 各页面独有的中间文案 (独立管理) ---
export const PAGE_SPECIFIC_CONTENT = {
  naming: {
    en: {
      title: "AI Naming",
      desc: "AI-generated name inspiration for creative and cultural exploration.",
      intro: "This feature is being designed to generate creative naming ideas using AI language models and contextual analysis.",
      features: [
        "Personal and project name inspiration",
        "Language and cultural context explanations",
        "AI-generated descriptive summaries"
      ],
      // 🟢 新增表单字段翻译
    fields: {
      surname: "Surname",
      surnamePh: "Enter Surname (Required)",
      gender: "Gender",
      male: "Male",
      female: "Female",
      email: "Email for Report Delivery",
      birthTime: "Birth Timing (Solar Calendar)",
      pref: "Personal Preferences",
      prefPh: "E.g., Elegant, strong, traditional...",
      btnNormal: "Curate My Names ($12.90)",
      btnPaid: "Regenerate Report (Paid)",
      btnVip: "VIP Access (Admin Only)",
      reportTitle: "Your Naming Report",
      newAnalysis: "New Analysis",
      thinking: "Thinking... Analyzing in English...",
      requiredTip: "Please fill out this field." // 🟢 必須加在這裡
    }
    },
    zh: {
      title: "AI 起名",
      desc: "AI 生成的创意起名灵感，助力文化探索。",
      intro: "该功能旨在利用 AI 语言模型和上下文分析生成创意命名思路。",
      features: ["个人及项目起名灵感", "语言及文化背景解释", "AI 生成的描述性摘要"]
    },

    es: {
      title: "Nombres IA",
      desc: "Inspiración de nombres generada por IA para la exploración creativa y cultural.",
      intro: "Esta función está diseñada para generar ideas de nombres creativos utilizando modelos de lenguaje de IA y análisis contextual.",
      features: [
        "Inspiración de nombres para personas y proyectos",
        "Explicaciones de contexto lingüístico y cultural",
        "Resúmenes descriptivos generados por IA"
      ],
      fields: {
        surname: "Apellido",
        surnamePh: "Ingrese el apellido (Obligatorio)",
        gender: "Género",
        male: "Masculino",
        female: "Femenino",
        email: "Correo electrónico para la entrega",
        birthTime: "Fecha de nacimiento (Calendario Solar)",
        pref: "Preferencias personales",
        prefPh: "Ej: Elegante, fuerte, tradicional...",
        btnNormal: "Curar mis nombres ($12.90)",
        btnPaid: "Regenerar informe (Pagado)",
        btnVip: "Acceso VIP (Solo Admin)",
        reportTitle: "Su informe de nombres",
        newAnalysis: "Nuevo análisis",
        thinking: "Pensando... Analizando en Español...",
       requiredTip: "Por favor, complete este campo." // 🟢 必須加在這裡
      }
    }
  },
 

  bazi: { // 新增 Bazi 區塊
    en: {
      title: "Zanpath AI",
      desc: "Personalized Career & Personality Analysis (AI Digital Delivery)",
      intro: "This feature is designed to generate personalized reflection content using AI models and time-based pattern analysis.",
      features: [
        "Career and personality reflection insights",
        "Traditional cultural frameworks and symbolic interpretation",
        "AI-generated narrative summaries"
      ],
      fields: {
        surname: "Name", // 算命通常用全名或姓氏
        surnamePh: "Your Name",
        gender: "Gender",
        male: "Male",
        female: "Female",
        email: "Email Address",
        birthTime: "Birth Date & Time (Local Time)",
        btnNormal: "Generate My Reflection $9.9", // 價格改為 9.9
        btnPaid: "Generate Now",
        btnVip: "VIP Access (Admin Only)",
        thinking: "Analyzing your life path...",
        reportTitle: "Life Path Reflection Report",
        newAnalysis: "New Analysis",
        requiredTip: "Please fill out this field."
      }
    },
    es: {
      title: "Zanpath AI",
      desc: "Análisis Personalizado de Carrera y Personalidad (Entrega Digital AI)",
      intro: "Esta función está diseñada para generar contenido de reflexión personalizado utilizando modelos de IA y análisis de patrones temporales.",
      features: [
        "Perspectivas de reflexión sobre carrera y personalidad",
        "Marcos culturales tradicionales e interpretación simbólica",
        "Resúmenes narrativos generados por IA"
      ],
      fields: {
        surname: "Nombre",
        surnamePh: "Tu Nombre",
        gender: "Género",
        male: "Masculino",
        female: "Femenino",
        email: "Correo Electrónico",
        birthTime: "Fecha y Hora de Nacimiento (Hora Local)",
        btnNormal: "Generar mi reflexión $9.9",
        btnPaid: "Generar ahora",
        btnVip: "Acceso VIP (Solo Admin)",
        thinking: "Analizando tu camino de vida...",
        reportTitle: "Informe de Reflexión de Vida",
        newAnalysis: "Nuevo Análisis",
        requiredTip: "Por favor, complete este campo."
      }
    }
  },

  dream: { // 新增 Dream (解夢) 區塊
    en: {
      title: "AI Dream Reflection",
      desc: "This feature is designed to generate narrative and symbolic reflections using AI language models and contextual interpretation.",
      intro: "Explore the hidden depths of your subconscious through our AI-powered dream analysis.",
      features: [
        "Dream theme and symbolism exploration",
        "Narrative-style reflective summaries",
        "Cultural and literary perspective insights"
      ],
      fields: {
        surname: "Name",
        surnamePh: "Your Name",
        gender: "Gender",
        male: "Male",
        female: "Female",
        email: "Email for Report Delivery",
        pref: "Dream Content Description", // 將 Preferences 改為夢境描述
        prefPh: "The more detail, the deeper the insight. \n• What happened? (e.g., flying, being chased, meeting someone)\n• Specific symbols? (e.g., a golden key, a stormy sea, a white owl)\n• Sensory details? (e.g., cold wind, bright lights, loud bells)\n• Your emotions? (e.g., peaceful, anxious, nostalgic)\n• Any connection to your waking life?",
        btnNormal: "Generate My Reflection $6.9", // 價格 6.9
        btnPaid: "Generate Now",
        btnVip: "VIP Access (Admin Only)",
        thinking: "Interpreting your dream...",
        reportTitle: "Dream Reflection Report",
        newAnalysis: "Analyze Another Dream",
        requiredTip: "Please fill out this field."
      }
    },
    es: {
      title: "Reflexión de Sueños IA",
      desc: "Esta función está diseñada para generar reflexiones narrativas y simbólicas utilizando modelos de lenguaje de IA e interpretación contextual.",
      intro: "Explore las profundidades ocultas de su subconsciente a través de nuestro análisis de sueños impulsado por IA.",
      features: [
        "Exploración de temas y simbolismo de los sueños",
        "Resúmenes reflexivos de estilo narrativo",
        "Perspectivas desde ángulos culturales y literarios"
      ],
      fields: {
        surname: "Nombre",
        surnamePh: "Tu Nombre",
        gender: "Género",
        male: "Masculino",
        female: "Femenino",
        email: "Correo electrónico para la entrega",
        pref: "Descripción del Contenido del Sueño",
        prefPh: "Cuanto más detalle, más profunda será la interpretación.\n• ¿Qué sucedió? (ej: volar, ser perseguido, encontrar a alguien)\n• ¿Símbolos específicos? (ej: una llave de oro, mar tormentoso, un búho blanco)\n• ¿Detalles sensoriales? (ej: viento frío, luces brillantes, campanas)\n• ¿Tus emociones? (ej: paz, ansiedad, nostalgia)\n• ¿Alguna conexión con tu vida real?",
        btnNormal: "Generar mi reflexión $6.9",
        btnPaid: "Generar ahora",
        btnVip: "Acceso VIP (Solo Admin)",
        thinking: "Interpretando tu sueño...",
        reportTitle: "Informe de Reflexión de Sueños",
        newAnalysis: "Analizar otro sueño",
        requiredTip: "Por favor, complete este campo."
      }
    }
  },

face: {
    en: {
      title: "AI Face Reflection",
      desc: "AI-generated facial feature reflections for cultural and self-exploration purposes.",
      intro: "This feature explores facial structures and symbolic interpretations inspired by traditional texts.",
      features: [
        "Facial feature and structure observation",
        "Symbolic interpretation inspired by traditional texts",
        "AI-generated reflective summaries"
      ],
      fields: {
        surname: "Name",
        surnamePh: "Your Name",
        gender: "Gender",
        male: "Male",
        female: "Female",
        email: "Email for Report Delivery",
        uploadBtn: "Upload Photo",
        uploadTip: "Select a clear facial photo (Max 5MB)",
        btnNormal: "Generate My Reflection $12.90",
        btnPaid: "Regenerate Report",
        btnVip: "VIP Access (Admin Only)",
        thinking: "Analyzing facial features...",
        reportTitle: "Facial Reflection Report",
        newAnalysis: "Analyze Another Face",
        requiredTip: "Please fill out this field and upload an image."
      }
    },
    es: {
      title: "Reflexión Facial IA",
      desc: "Reflexiones de rasgos faciales generadas por IA para fines de exploración cultural y personal.",
      intro: "Esta función explora las estructuras faciales y las interpretaciones simbólicas inspiradas en textos tradicionales.",
      features: [
        "Observación de rasgos y estructura facial",
        "Interpretación simbólica inspirada en textos tradicionales",
        "Resúmenes reflexivos generados por IA"
      ],
      fields: {
        surname: "Nombre",
        surnamePh: "Su Nombre",
        gender: "Género",
        male: "Masculino",
        female: "Femenino",
        email: "Correo electrónico para la entrega",
        uploadBtn: "Subir Foto",
        uploadTip: "Seleccione una foto clara del rostro (Máx 5MB)",
        btnNormal: "Generar mi reflexión $12.90",
        btnPaid: "Regenerar informe",
        btnVip: "Acceso VIP (Solo Admin)",
        thinking: "Analizando rasgos faciales...",
        reportTitle: "Informe de Reflexión Facial",
        newAnalysis: "Analizar otro rostro",
        requiredTip: "Por favor, complete este campo y suba una imagen."
      }
    }
  },

  space: {
    en: {
      title: "AI Feng Shui Reflection",
      desc: "AI-generated spatial and environmental reflections inspired by traditional concepts.",
      intro: "Explore spatial layouts and environmental harmony through classical principles and AI analysis.",
      features: [
        "Spatial layout and environmental observation",
        "Symbolic interpretation inspired by classical principles",
        "AI-generated reflective summaries"
      ],
      fields: {
        surname: "Name / Property Name",
        surnamePh: "E.g., My Living Room",
        gender: "Context",
        male: "Residential",
        female: "Commercial",
        email: "Email for Report Delivery",
        uploadBtn: "Upload Layout/Photo",
        uploadTip: "Select a photo or floor plan (Max 5MB)",
        btnNormal: "Generate My Reflection $14.90",
        btnPaid: "Regenerate Report",
        btnVip: "VIP Access (Admin Only)",
        thinking: "Analyzing spatial energy...",
        reportTitle: "Spatial Reflection Report",
        newAnalysis: "Analyze Another Space",
        requiredTip: "Please fill out this field and upload an image."
      }
    },
    es: {
      title: "Reflexión Feng Shui IA",
      desc: "Reflexiones espaciales y ambientales generadas por IA inspiradas en conceptos tradicionales.",
      intro: "Explore la distribución espacial y la armonía ambiental a través de principios clásicos y análisis de IA.",
      features: [
        "Observación de la distribución espacial y el entorno",
        "Interpretación simbólica inspirada en principios clásicos",
        "Resúmenes reflexivos generados por IA"
      ],
      fields: {
        surname: "Nombre / Propiedad",
        surnamePh: "Ej: Mi Sala de Estar",
        gender: "Contexto",
        male: "Residencial",
        female: "Comercial",
        email: "Correo electrónico para la entrega",
        uploadBtn: "Subir Plano/Foto",
        uploadTip: "Seleccione una foto o plano (Máx 5MB)",
        btnNormal: "Generar mi reflexión $14.90",
        btnPaid: "Regenerar informe",
        btnVip: "Acceso VIP (Solo Admin)",
        thinking: "Analizando energía espacial...",
        reportTitle: "Informe de Reflexión Espacial",
        newAnalysis: "Analizar otro espacio",
        requiredTip: "Por favor, complete este campo y suba una imagen."
      }
    }
  }	
};



// config/site-content.ts 示例
export const DISCLAIMER_TEXT = {
  en: "This analysis is generated by AI, intended for self-exploration and reference only. It does not guarantee any real-world effects, financial success, and should not be taken as medical, legal, or financial advice.",
  zh: "本分析由AI生成，仅供自我探索参考，不保证任何现实效果，不保证发财，不作为医疗、法律或金融建议。",
  es: "Este análisis es generado por IA, destinado únicamente a la autoexploración y referencia. No garantiza efectos en el mundo real ni éxito financiero."
};



export const RECOVERY_CONTENT = {
  en: {
    title: "Restore Report",
    emailPlaceholder: "Email Used",
    codePlaceholder: "6-Digit Code",
    sendCode: "Send Code",
    verify: "Verify & Restore",
    wait: "Please wait...",
    resendIn: "Resend in ",
    noOrder: "Order not found. If just paid, please wait 1-2 mins for sync. Your result is safe.",
    codeSent: "Code sent to your email!",
    reCalculate: "Payment confirmed, but data was lost. You can now regenerate for free.",
    sentEmail: "The report has been sent to your email.",
    systemBusy: "System busy, please try again later."
  },
  es: {
    title: "Restaurar Informe",
    emailPlaceholder: "Correo usado",
    codePlaceholder: "Código de 6 dígitos",
    sendCode: "Enviar código",
    verify: "Verificar y restaurar",
    wait: "Espere...",
    resendIn: "Reenviar en ",
    noOrder: "Orden no encontrada. Si acaba de pagar, espere 1-2 min. Su resultado está seguro.",
    codeSent: "¡Código enviado a su correo!",
    reCalculate: "Pago confirmado, pero los datos se perdieron. Puede regenerarlo gratis ahora.",
    sentEmail: "El informe ha sido enviado a su correo electrónico.",
    systemBusy: "Sistema ocupado, intente más tarde."
  }
};



// --- 新增：Privacy, Refund, Terms, Contact 法律文案 ---
export const LEGAL_CONTENT = {
  privacy: {
    en: {
      title: "Privacy Policy",
      content: `Zanpath AI respects your privacy and is committed to protecting your personal data. 

We collect limited information such as name, email address, and birth-related inputs solely for the purpose of generating AI-based personal reflection content. 

We do not sell, rent, or share your personal information with third parties. All data is handled securely and used only to provide the requested service. 

By using this website, you consent to this privacy policy.

Contact: alaricegaye@gmail.com`
    },
    es: {
      title: "Política de Privacidad",
      content: `Zanpath AI respeta su privacidad y se compromete a proteger sus datos personales.

Recopilamos información limitada, como nombre, dirección de correo electrónico y datos relacionados con el nacimiento, únicamente con el fin de generar contenido de reflexión personal basado en IA.

No vendemos, alquilamos ni compartimos su información personal con terceros. Todos los datos se manejan de forma segura y se utilizan únicamente para proporcionar el servicio solicitado.

Al utilizar este sitio web, usted acepta esta política de privacidad.

Contacto: alaricegaye@gmail.com`
    }
  },
  terms: {
    en: {
      title: "Terms of Service",
      content: `1. Agreement to Terms
These Terms of Service govern your use of Zanpath AI (the "Service"), which is owned and operated by Zanpath AI ("we," "us," or "our"). By accessing or using our website located at zanpath.com, you agree to be bound by these terms. If you do not agree, please do not use the Service.

2. Description of Service
Zanpath AI provides AI-generated digital content designed for personal reflection and cultural exploration. Our products consist of downloadable PDF reports generated based on user input.

3. Entertainment Purposes Only
The content provided by Zanpath AI is for entertainment and self-exploration purposes only. It does not constitute professional, medical, legal, or financial advice. We make no guarantees regarding the accuracy, outcomes, or interpretations of the AI-generated content.

4. Payments
Our order process is conducted by our online reseller Paddle.com. Paddle is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns.

5. Intellectual Property
All content, logos, and digital reports generated by Zanpath AI are the intellectual property of Zanpath AI. You are granted a personal, non-exclusive license to use the reports for private, non-commercial purposes.

6. Limitation of Liability
To the maximum extent permitted by law, Zanpath AI shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the Service.

If you have any questions about these Terms, please contact us at:
Email: alaricegaye@gmail.com
Last Updated: January 20, 2026`
    },
    es: {
      title: "Términos de Servicio",
      content: `1. Aceptación de los Términos
Estos Términos de Servicio rigen el uso de Zanpath AI (el "Servicio"), que es propiedad y está operado por Zanpath AI ("nosotros", "nos" o "nuestro"). Al acceder o utilizar nuestro sitio web ubicado en zanpath.com, usted acepta estar sujeto a estos términos. Si no está de acuerdo, no utilice el Servicio.

2. Descripción del Servicio
Zanpath AI proporciona contenido digital generado por IA diseñado para la reflexión personal y la exploración cultural. Nuestros productos consisten en informes PDF descargables generados en función de la entrada del usuario.

3. Solo para fines de entretenimiento
El contenido proporcionado por Zanpath AI es solo para fines de entretenimiento y autoexploración. No constituye asesoramiento profesional, médico, legal o financiero. No garantizamos la exactitud, los resultados o las interpretaciones del contenido generado por la IA.

4. Pagos
Nuestro proceso de pedido es realizado por nuestro revendedor en línea Paddle.com. Paddle es el Comerciante de Registro para todos nuestros pedidos. Paddle proporciona todas las consultas de servicio al cliente y gestiona las devoluciones.

5. Propiedad Intelectual
Todo el contenido, logotipos e informes digitales generados por Zanpath AI son propiedad intelectual de Zanpath AI. Se le otorga una licencia personal y no exclusiva para utilizar los informes con fines privados y no comerciales.

6. Limitación de responsabilidad
En la medida máxima permitida por la ley, Zanpath AI no será responsable de ningún daño indirecto, incidental o consecuente que surja de su uso del Servicio.

Si tiene alguna pregunta sobre estos Términos, contáctenos en:
Correo electrónico: alaricegaye@gmail.com
Última actualización: 20 de enero de 2026`
    }
  },
  refund: {
    en: {
      title: "Refund Policy",
      content: `At ZanPath, we want you to be satisfied with our digital products. Please review our refund terms below:

Refund Eligibility: You are entitled to a full refund within 14 days of your purchase if you are unsatisfied with the product or experience technical issues.

How to Request: To request a refund, please contact us at alaricegaye@gmail.com with your order details and transaction ID.

Processing: Once approved, refunds will be processed back to your original payment method via Paddle.

Please note that after 14 days of purchase, all sales are considered final.`
    },
    es: {
      title: "Política de Reembolso",
      content: `En ZanPath, queremos que esté satisfecho con nuestros productos digitales. Por favor, revise nuestros términos de reembolso a continuación:

Elegibilidad para el reembolso: Tiene derecho a un reembolso completo dentro de los 14 días posteriores a su compra si no está satisfecho con el producto o experimenta problemas técnicos.

Cómo solicitarlo: Para solicitar un reembolso, contáctenos en alaricegaye@gmail.com con los detalles de su pedido e ID de transacción.

Procesamiento: Una vez aprobados, los reembolsos se procesarán de vuelta a su método de pago original a través de Paddle.

Tenga en cuenta que después de 14 días de la compra, todas las ventas se consideran finales.`
    }
  },
  contact: {
    en: {
      title: "Contact Us",
      content: `If you have any questions, feedback, or support requests, please reach out to us.

Email: alaricegaye@gmail.com

We typically respond within 48 hours.`
    },
    es: {
      title: "Contáctenos",
      content: `Si tiene alguna pregunta, comentario o solicitud de soporte, comuníquese con nosotros.

Correo electrónico: alaricegaye@gmail.com

Normalmente respondemos en un plazo de 48 horas.`
    }
  }
};









