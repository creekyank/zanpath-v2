export const loveQuiz = {
  en: {
    title: "Love Archetype & Romantic Destiny Analysis",
    description: "Unveil the hidden patterns of your heart and the energetic resonance of your future relationships.",
    questions: [
      {
        q: "When you feel a strong attraction to someone, your first reaction is to:",
        options: [
          { text: "Dive deep into the mystery of their soul", value: "D" }, // Deep Seeker
          { text: "Ignite the spark with bold and playful energy", value: "P" }, // Passionate Fire
          { text: "Observe carefully to see if they are safe to trust", value: "S" }, // Stable Guardian
          { text: "Let fate take its course without forcing it", value: "F" }  // Flowing Spirit
        ]
      },
      {
        q: "In your ideal relationship, the most vital 'invisible' bond is:",
        options: [
          { text: "Complete mental and emotional transparency", value: "D" },
          { text: "An unquenchable physical and creative chemistry", value: "P" },
          { text: "A shared foundation of tradition and long-term security", value: "S" },
          { text: "The freedom to grow as individuals while staying together", value: "F" }
        ]
      },
      {
        q: "How do you typically handle emotional vulnerability?",
        options: [
          { text: "I embrace it; I want to share every part of my story", value: "D" },
          { text: "I show it through intense actions rather than just words", value: "P" },
          { text: "I keep it protected until I am 100% sure of the other person", value: "S" },
          { text: "I process it internally before sharing the results", value: "F" }
        ]
      },
      {
        q: "What is your unconscious 'Red Flag' in a potential partner?",
        options: [
          { text: "Surface-level conversations and lack of depth", value: "D" },
          { text: "A predictable, boring, or stagnant lifestyle", value: "P" },
          { text: "Financial or emotional instability", value: "S" },
          { text: "Possessiveness that restricts my personal space", value: "F" }
        ]
      },
      {
        q: "When a conflict arises with a loved one, you tend to:",
        options: [
          { text: "Dissect the feelings behind the argument immediately", value: "D" },
          { text: "Face it head-on with passion to clear the air", value: "P" },
          { text: "Seek a practical solution that ensures long-term peace", value: "S" },
          { text: "Step back to regain perspective and inner balance", value: "F" }
        ]
      },
      {
        q: "Which 'Love Language' resonates most with your inner energy?",
        options: [
          { text: "Deep Soul-to-Soul Conversations", value: "D" },
          { text: "Spontaneous Adventures & Physical Touch", value: "P" },
          { text: "Acts of Service & Consistent Support", value: "S" },
          { text: "Shared Silence & Respecting Boundaries", value: "F" }
        ]
      },
      {
        q: "You feel most loved when your partner:",
        options: [
          { text: "Understands your unspoken thoughts", value: "D" },
          { text: "Makes you feel alive and desired", value: "P" },
          { text: "Makes you feel safe and protected", value: "S" },
          { text: "Allows you to be your truest, independent self", value: "F" }
        ]
      },
      {
        q: "What defines 'Destiny' for you in love?",
        options: [
          { text: "Two souls finding each other across lifetimes", value: "D" },
          { text: "A powerful, magnetic attraction that cannot be ignored", value: "P" },
          { text: "Building a legacy and a family tree together", value: "S" },
          { text: "A peaceful alignment of paths and timing", value: "F" }
        ]
      }
    ],
    results: {
      D: "The Soul Alchemist. You seek a love that transcends the physical. You are a 'Deep Seeker' who craves total emotional intimacy. Your heart is an ocean, and you need a partner who isn't afraid to dive. *Note: Your destiny often involves 'Karmic' connections that require deep healing.*",
      P: "The Eternal Spark. You are the embodiment of romantic fire. You bring vitality, passion, and intensity to your relationships. You live for the 'Magnetic Moment'. *Challenge: Learning to sustain the glow after the initial explosion of energy.*",
      S: "The Sacred Guardian. You are the anchor in the storm. For you, love is a temple built on trust, loyalty, and time. You protect those you love with unmatched devotion. *Insight: Your ideal match is someone who values the 'Earth' energy of stability as much as you do.*",
      F: "The Ethereal Wanderer. You seek a love that feels like air—light, free, and expansive. You value independence and intellectual connection. You don't 'possess' partners; you walk beside them. *Wisdom: Finding the balance between your need for freedom and the beauty of commitment.*"
    }
  },

  es: {
    title: "Análisis de Arquetipo de Amor y Destino Romántico",
    description: "Revela los patrones ocultos de tu corazón y la resonancia energética de tus futuras relaciones.",
    questions: [
      {
        q: "Cuando sientes una atracción fuerte por alguien, tu primera reacción es:",
        options: [
          { text: "Sumergirte en el misterio de su alma", value: "D" },
          { text: "Encender la chispa con energía audaz y lúdica", value: "P" },
          { text: "Observar cuidadosamente para ver si es seguro confiar", value: "S" },
          { text: "Dejar que el destino siga su curso sin forzarlo", value: "F" }
        ]
      },
      {
        q: "En tu relación ideal, el vínculo 'invisible' más vital es:",
        options: [
          { text: "Transparencia mental y emocional completa", value: "D" },
          { text: "Una química física y creativa inagotable", value: "P" },
          { text: "Una base compartida de tradición y seguridad", value: "S" },
          { text: "La libertad de crecer individualmente estando juntos", value: "F" }
        ]
      },
      {
        q: "Cómo sueles manejar la vulnerabilidad emocional?",
        options: [
          { text: "La acepto; quiero compartir cada parte de mi historia", value: "D" },
          { text: "La demuestro con acciones intensas más que con palabras", value: "P" },
          { text: "La mantengo protegida hasta estar 100% seguro del otro", value: "S" },
          { text: "La proceso internamente antes de compartir los resultados", value: "F" }
        ]
      },
      {
        q: "Cuál es tu 'alerta roja' inconsciente en una pareja potencial?",
        options: [
          { text: "Conversaciones superficiales y falta de profundidad", value: "D" },
          { text: "Un estilo de vida predecible, aburrido o estancado", value: "P" },
          { text: "Inestabilidad financiera o emocional", value: "S" },
          { text: "Posesividad que restringe mi espacio personal", value: "F" }
        ]
      },
      {
        q: "Cuando surge un conflicto con un ser querido, tiendes a:",
        options: [
          { text: "Analizar los sentimientos detrás de la discusión de inmediato", value: "D" },
          { text: "Enfrentarlo de frente con pasión para aclarar el aire", value: "P" },
          { text: "Buscar una solución práctica que asegure la paz", value: "S" },
          { text: "Retroceder para recuperar la perspectiva y el equilibrio", value: "F" }
        ]
      },
      {
        q: "¿Qué 'lenguaje del amor' resuena más con tu energía interna?",
        options: [
          { text: "Conversaciones profundas de alma a alma", value: "D" },
          { text: "Aventuras espontáneas y contacto físico", value: "P" },
          { text: "Actos de servicio y apoyo constante", value: "S" },
          { text: "Silencio compartido y respeto por los límites", value: "F" }
        ]
      },
      {
        q: "Te sientes más amado cuando tu pareja:",
        options: [
          { text: "Comprende tus pensamientos no expresados", value: "D" },
          { text: "Te hace sentir vivo y deseado", value: "P" },
          { text: "Te hace sentir seguro y protegido", value: "S" },
          { text: "Te permite ser tu yo más auténtico e independiente", value: "F" }
        ]
      },
      {
        q: "¿Qué define el 'Destino' para ti en el amor?",
        options: [
          { text: "Dos almas encontrándose a través de las vidas", value: "D" },
          { text: "Una atracción poderosa y magnética imposible de ignorar", value: "P" },
          { text: "Construir un legado y un árbol familiar juntos", value: "S" },
          { text: "Una alineación pacífica de caminos y tiempos", value: "F" }
        ]
      }
    ],
    results: {
      D: "El Alquimista del Alma. Buscas un amor que trascienda lo físico. Eres un 'Buscador Profundo' que anhela intimidad emocional total. Tu corazón es un océano y necesitas una pareja que no tenga miedo de sumergirse. *Nota: Tu destino suele involucrar conexiones 'kármicas'.*",
      P: "La Chispa Eterna. Eres la encarnación del fuego romántico. Traes vitalidad, pasión e intensidad a tus relaciones. Vives para el 'Momento Magnético'. *Desafío: Aprender a mantener el brillo después de la explosión inicial de energía.*",
      S: "El Guardián Sagrado. Eres el ancla en la tormenta. Para ti, el amor es un templo construido sobre la confianza, la lealtad y el tiempo. Proteges a quienes amas con una devoción inigualable. *Tu pareja ideal valora la energía de 'Tierra'.*",
      F: "El Caminante Etéreo. Buscas un amor que se sienta como el aire: ligero, libre y expansivo. Valoras la independencia y la conexión intelectual. No 'posees' a tu pareja; caminas a su lado. *Sabiduría: Encontrar el equilibrio entre tu libertad y el compromiso.*"
    }
  }
};