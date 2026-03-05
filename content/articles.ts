// content/articles.ts

// ------------------- 新增 CTA 类型定义 -------------------
export type CTA = {
  text: string;
  url: string;
};



export type ArticleContent = {
  title: string;
  category: string;
  date: string;
  desc: string;
  content: string;
  cta?: CTA;
};

export type ArticleEntry = {
  en: ArticleContent;
  es: ArticleContent;
};

export const ARTICLES: Record<string, ArticleEntry> = {
  "celestial-mechanics": {
    en: {
      title: "The Celestial Mechanics of Life: Why the Moment of Your Birth Matters",
      category: "Science & Spirituality",
      date: "Jan 18, 2026",
      desc: "Exploring why life flows in rhythms and how celestial gravity prints a unique 'energy signature' on every living being.",
      content: `Have you ever wondered why life flows in rhythms? Why do civilizations, economies, and even our personal moods seem to rise and fall in predictable waves?

The answer isn't written in "luck"—it is encoded in the very fabric of our solar system. Ancient Chinese masters called this BaZi, but today, we might call it **Cosmic Chronobiology**: the study of how celestial gravity prints a unique "energy signature" on every living being at the moment of their first breath.

### 1. The Gravity of Destiny: The Three-Spoon Metaphor
Imagine a vast cauldron of soup representing the energy field of Earth. Now, imagine three master chefs stirring this soup with giant spoons at different speeds:
- **The Sun:** The source of all vitality and the center of our system.
- **The Moon:** The closest driver of our tides and biological fluids.
- **Jupiter (The Grand Duke):** The largest planet, exerting a massive gravitational pull every 12 years.

As these "spoons" rotate, they create complex swirls in the energy soup. If you are born at a specific second, you emerge into a specific ripple. The direction and momentum of that wave define the trajectory of your journey.

### 2. Jupiter: The Clockwork of the 12-Year Cycle
Ancient wisdom focused heavily on Jupiter. Its 11.86-year orbital period is the scientific foundation of the 12 Zodiac signs. When we say it is the "Year of the Wood Dragon," we are describing a precise astronomical alignment that dictates the "flavor" of the year's energy.

### 3. The Precision of "True Solar Time"
This is why your exact hour of birth is critical. It represents the Earth's precise orientation toward the Sun. Our analysis uses **True Solar Time** to ensure we are mapping your life against actual celestial coordinates, not a man-made timezone.

**Ready to decode your own map?**
Understanding the celestial mechanics behind your life doesn't take away your power—it gives you the ultimate map to master it.`
    },
    es: {
      title: "La Mecánica Celeste de la Vida: Por qué es importante el momento de su nacimiento",
      category: "Ciencia y Espiritualidad",
      date: "18 de enero de 2026",
      desc: "Explorando por qué la vida fluye en ritmos y cómo la gravedad celeste imprime una 'firma energética' única en cada ser vivo.",
      content: `¿Se ha preguntado alguna vez por qué la vida fluye en ritmos? ¿Por qué las civilizaciones, las economías e incluso nuestros estados de ánimo personales parecen subir y bajar en ondas predecibles?

La respuesta no está escrita en la "suerte"; está codificada en el tejido mismo de nuestro sistema solar. Los antiguos maestros chinos llamaron a esto BaZi, pero hoy podríamos llamarlo **Cronobiología Cósmica**: el estudio de cómo la gravedad celeste imprime una "firma energética" única en cada ser vivo en el momento de su primer aliento.

### 1. La gravedad del destino: La metáfora de las tres cucharas
Imagine un vasto caldero de sopa que representa el campo energético de la Tierra. Ahora, imagine a tres maestros de cocina revolviendo esta sopa con cucharas gigantes a diferentes velocidades:
- **El Sol:** La fuente de toda vitalidad y el centro de nuestro sistema.
- **La Luna:** El impulsor más cercano de nuestras mareas y fluidos biológicos.
- **Júpiter (El Gran Duque):** El planeta más grande, que ejerce una atracción gravitatoria masiva cada 12 años.

A medida que estas "cucharas" giran, crean remolinos complejos en la sopa de energía. Si naces en un segundo específico, emerges en una onda específica. La dirección y el impulso de esa onda definen la trayectoria de su viaje.

### 2. Júpiter: El mecanismo del ciclo de 12 años
La sabiduría antigua se centró mucho en Júpiter. Su período orbital de 11,86 años es la base científica de los 12 signos del zodiaco. Cuando decimos que es el "Año del Dragón de Madera", estamos describiendo una alineación astronómica precisa que dicta el "sabor" de la energía del año.

### 3. La precisión del "Tiempo Solar Verdadero"
Es por eso que su hora exacta de nacimiento es crítica. Representa la orientación precisa de la Tierra hacia el Sol. Nuestro análisis utiliza el **Tiempo Solar Verdadero** para garantizar que estamos mapeando su vida según coordenadas celestes reales, no una zona horaria artificial.

**¿Listo para decodificar su propio mapa?**
Comprender la mecánica celeste detrás de su vida no le quita poder; le da el mapa definitivo para dominarlo.`
    }
  },
  "variable-trajectories": {
    en: {
      title: "Beyond the Starting Point: Understanding Divergent Life Trajectories",
      category: "Personal Growth Analysis",
      date: "Jan 19, 2026",
      desc: "Why do people born at the same moment lead different lives? Exploring the variables of timing, environment, and social fields.",
      content: `If two individuals are born at the exact same moment, why do their professional and personal lives unfold differently? This is a key focus of modern behavioral and environmental research.

At Zanpath AI, we view the birth moment as a **Biological Starting Point**. While this provides an initial potential, the final outcome depends on three critical variables: **Temporal Precision, Environmental Context, and Social Connectivity.**

### 1. The Science of Micro-Timing
Standard time-blocking is often too broad. In our analytical model, energy states are dynamic. Even within a short window, subtle shifts in environmental "rhythms" occur, which can influence an individual's innate inclination toward specific career types—such as leadership versus technical expertise.

### 2. The Influence of Social Connectivity
Humans operate within social fields. The people we interact with most closely, such as partners or mentors, introduce their own "energy variables." A supportive environment can amplify an individual's natural strengths, while a mismatched social field may create friction in one's career progression.

### 3. Professional Resonance
Success is often the result of alignment. When an individual's innate tendencies match their professional environment, we see high performance. Divergence in twins often occurs because one aligns their choices with their internal "rhythm," while the other operates in a dissonant field.

### Analytical Conclusion
Life path development is a **multi-variable equation**. While the initial coordinates are set at birth, variables such as environment, education, and social choices determine the ultimate trajectory.`
    },
    es: {
      title: "Más allá del punto de partida: Comprensión de las trayectorias de vida divergentes",
      category: "Análisis de Crecimiento Personal",
      date: "19 de enero de 2026",
      desc: "¿Por qué las personas nacidas en el mismo momento llevan vidas diferentes? Explorando las variables del tiempo, el entorno y los campos sociales.",
      content: `Si dos individuos nacen exactamente en el mismo momento, ¿por qué sus vidas profesionales y personales se desarrollan de manera diferente? Este es un enfoque clave de la investigación conductual y ambiental moderna.

En Zanpath AI, vemos el momento del nacimiento como un **Punto de Partida Biológico**. Si bien esto proporciona un potencial inicial, el resultado final depende de tres variables críticas: **Precisión Temporal, Contexto Ambiental y Conectividad Social.**

### 1. La ciencia del micro-tiempo
El bloqueo de tiempo estándar a menudo es demasiado amplio. En nuestro modelo analítico, los estados de energía son dinámicos. Incluso dentro de una ventana corta, ocurren cambios sutiles en los "ritmos" ambientales, que pueden influir en la inclinación innata de un individuo hacia tipos de carrera específicos, como el liderazgo frente a la experiencia técnica.

### 2. La influencia de la conectividad social
Los seres humanos operan dentro de campos sociales. Las personas con las que interactuamos más estrechamente, como parejas o mentores, introducen sus propias "variables energéticas". Un entorno de apoyo puede amplificar las fortalezas naturales de un individuo, mientras que un campo social desajustado puede crear fricción en la progresión profesional de uno.

### 3. Resonancia profesional
El éxito suele ser el resultado de la alineación. Cuando las tendencias innatas de un individuo coinciden con su entorno profesional, vemos un alto rendimiento. La divergencia en los gemelos a menudo ocurre porque uno alinea sus elecciones con su "ritmo" interno, mientras que el otro opera en un campo disonante.

### Conclusión analítica
El desarrollo del camino de la vida es una **ecuación de múltiples variables**. Si bien las coordenadas iniciales se establecen al nacer, variables como el entorno, la educación y las opciones sociales determinan la trayectoria final.`
    }
  }
};


// ------------------- 新增 Article 接口 -------------------
export interface Article {
  id: string;
  locale: string;
  module: string;
  slug: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  content: any[];
  cta?: CTA; // ✅ 可选 CTA
}

export type ArticleSlug = keyof typeof ARTICLES;
