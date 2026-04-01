export const careerQuiz = {
  en: {
    title: "Professional Vocation & Leadership Alchemy",
    description: "A deep-dive analysis into your subconscious professional archetype and optimal career resonance.",
    questions: [
      {
        q: "When a project enters a state of 'productive chaos', your immediate focus is:",
        options: [
          { text: "Architecting the logic: Identifying the systemic bottleneck.", value: "STR" },
          { text: "Mobilizing the force: Aligning individual strengths to the goal.", value: "LDR" },
          { text: "Stabilizing the core: Ensuring psychological safety and team cohesion.", value: "EMP" },
          { text: "Pivot & Innovate: Finding a non-linear path to a breakthrough.", value: "CRE" }
        ]
      },
      {
        q: "Which state of 'Flow' do you find most intellectually rewarding?",
        options: [
          { text: "The Mastery Flow: Perfecting a complex skill or technical detail.", value: "SPEC" },
          { text: "The Influence Flow: Commanding a room and shifting perspectives.", value: "LDR" },
          { text: "The Synthesis Flow: Connecting disparate ideas into a new vision.", value: "STR" },
          { text: "The Altruistic Flow: Empowering others to overcome their limitations.", value: "EMP" }
        ]
      },
      {
        q: "How do you perceive 'Failure' in a high-stakes environment?",
        options: [
          { text: "A data point: An essential lesson for future optimization.", value: "STR" },
          { text: "A strategic cost: Part of the risk of bold leadership.", value: "LDR" },
          { text: "A human moment: An opportunity to strengthen resilience and trust.", value: "EMP" },
          { text: "A creative reset: The destruction necessary for true rebirth.", value: "CRE" }
        ]
      },
      {
        q: "What is your relationship with professional authority?",
        options: [
          { text: "I respect structure, but I prioritize evidence and logic.", value: "SPEC" },
          { text: "I naturally seek the helm to navigate the ship.", value: "LDR" },
          { text: "I act as the bridge between the vision and the people.", value: "EMP" },
          { text: "I challenge established norms to foster evolution.", value: "CRE" }
        ]
      },
      {
        q: "Which professional environment maximizes your inner energy?",
        options: [
          { text: "An elite laboratory or studio for deep focus.", value: "SPEC" },
          { text: "A dynamic board room or stage with high influence.", value: "LDR" },
          { text: "A collaborative hub focused on social or community impact.", value: "EMP" },
          { text: "A fast-paced startup or creative agency with no limits.", value: "CRE" }
        ]
      }
    ],
    results: {
      STR: "The Strategic Architect. You possess a rare cognitive ability to see the 'Whole Map'. You excel in high-complexity roles like System Design or Advisory, where foresight is the ultimate currency. *Path: Mastery of logic and structure.*",
      LDR: "The Visionary Leader. You carry a natural gravitational pull. Your vocation lies in scaling impact and entrepreneurship where your decisiveness defines the future. *Path: Leading through vision and action.*",
      EMP: "The Harmonic Connector. You are the glue of any ecosystem. Your career resonance is highest in environments where emotional intelligence transforms chaos into harmony. *Path: Empowering human potential.*",
      CRE: "The Disruptive Innovator. You thrive on the edge of the unknown. You are destined for fields where the 'impossible' needs a pioneer to make it real. *Path: Constant evolution and breakthrough.*",
      SPEC: "The Master Specialist. Your path is defined by depth and precision. You find your peak in Research or Craftsmanship, where being 'The Best' is the highest honor. *Path: Deep focus and technical excellence.*"
    }
  },
  es: {
    title: "Alquimia de Vocación y Liderazgo Profesional",
    description: "Un análisis profundo de tu arquetipo profesional subconsciente y tu resonancia de carrera óptima.",
    questions: [
      {
        q: "Cuando un proyecto entra en 'caos productivo', tu enfoque inmediato es:",
        options: [
          { text: "Arquitectura de la lógica: Identificar el cuello de botella sistémico.", value: "STR" },
          { text: "Movilizar la fuerza: Alinear las fortalezas individuales hacia el objetivo.", value: "LDR" },
          { text: "Estabilizar el núcleo: Asegurar la seguridad psicológica y cohesión del equipo.", value: "EMP" },
          { text: "Pivotar e Innovar: Encontrar un camino no lineal hacia el avance.", value: "CRE" }
        ]
      },
      {
        q: "¿Qué estado de 'Flow' encuentras más gratificante intelectualmente?",
        options: [
          { text: "El Flow de Maestría: Perfeccionar una habilidad compleja o detalle técnico.", value: "SPEC" },
          { text: "El Flow de Influencia: Dominar una sala y cambiar perspectivas.", value: "LDR" },
          { text: "El Flow de Síntesis: Conectar ideas dispares en una nueva visión.", value: "STR" },
          { text: "El Flow Altruista: Empoderar a otros para superar sus limitaciones.", value: "EMP" }
        ]
      },
      {
        q: "¿Cómo percibes el 'Fracaso' en un entorno de alto riesgo?",
        options: [
          { text: "Un punto de datos: Una lección esencial para la optimización futura.", value: "STR" },
          { text: "Un costo estratégico: Parte del riesgo de un liderazgo audaz.", value: "LDR" },
          { text: "Un momento humano: Una oportunidad para fortalecer la resiliencia y confianza.", value: "EMP" },
          { text: "Un reinicio creativo: La destrucción necesaria para un renacimiento real.", value: "CRE" }
        ]
      },
      {
        q: "¿Cuál es tu relación con la autoridad profesional?",
        options: [
          { text: "Respeto la estructura, pero priorizo la evidencia y la lógica.", value: "SPEC" },
          { text: "Busco naturalmente el timón para navegar el barco.", value: "LDR" },
          { text: "Actúo como el puente entre la visión y las personas.", value: "EMP" },
          { text: "Desafío las normas establecidas para fomentar la evolución.", value: "CRE" }
        ]
      },
      {
        q: "¿Qué entorno profesional maximiza tu energía interna?",
        options: [
          { text: "Un laboratorio de élite o estudio para una concentración profunda.", value: "SPEC" },
          { text: "Una sala de juntas dinámica o escenario con gran influencia.", value: "LDR" },
          { text: "Un centro colaborativo enfocado en el impacto social o comunitario.", value: "EMP" },
          { text: "Una startup de ritmo rápido o agencia creativa sin límites.", value: "CRE" }
        ]
      }
    ],
    results: {
      STR: "El Arquitecto de Sistemas. Posees una habilidad cognitiva excepcional para ver el 'Mapa Completo'. Destacas en roles de Diseño de Sistemas o Estrategia, donde la previsión es tu mayor activo.",
      LDR: "El Líder Visionario. Posees un carisma natural. Tu vocación está en liderar grandes operaciones o en el emprendimiento donde tu decisión define el futuro.",
      EMP: "El Conector de Armonía. Eres el pegamento de cualquier ecosistema. Tu resonancia es mayor en roles donde tu inteligencia emocional transforma el caos en sinergia.",
      CRE: "El Innovador Disruptivo. Prosperas en el límite de lo desconocido. Estás destinado a la Innovación o Tecnología donde lo 'imposible' necesita un pionero.",
      SPEC: "El Maestro Especialista. Tu camino se define por la profundidad y precisión. Encuentras tu cima en la Investigación o Maestría técnica donde la excelencia es la meta."
    }
  }
};