const updateSitemap = require('./updateImageSitemap');

const tasks = [
  // 第一篇：Personality Balance
  { module: 'bazi', slug: 'en/wisdom/bazi/how-do-five-elements-influence-personality-balance', img: 'how-do-five-elements-influence-personality-balance-1.webp', title: 'Five Elements Balance', alt: 'Balancing five elements in Bazi' },
  { module: 'bazi', slug: 'es/wisdom/bazi/como-influyen-los-cinco-elementos-en-el-equilibrio-de-la-personalidad', img: 'how-do-five-elements-influence-personality-balance-1.webp', title: 'Equilibrio de los Cinco Elementos', alt: 'Equilibrio de los cinco elementos en Bazi' },
  
  // 第二篇：Birth Season
  { module: 'bazi', slug: 'en/wisdom/bazi/why-is-birth-season-important-in-bazi-analysis', img: 'why-is-birth-season-important-in-bazi-analysis-1.webp', title: 'Birth Season Importance', alt: 'Why birth season matters in Bazi' },
  { module: 'bazi', slug: 'es/wisdom/bazi/por-que-es-importante-la-temporada-de-nacimiento-en-el-analisis-bazi', img: 'why-is-birth-season-important-in-bazi-analysis-1.webp', title: 'Importancia de la Estación de Nacimiento', alt: 'Por qué la estación de nacimiento importa en Bazi' },

  // 第三篇：Element Cycles
  { module: 'bazi', slug: 'en/wisdom/bazi/how-can-element-cycles-affect-life-direction', img: 'how-can-element-cycles-affect-life-direction-1.webp', title: 'Element Cycles Life Direction', alt: 'How cycles affect life path' },
  { module: 'bazi', slug: 'es/wisdom/bazi/como-pueden-los-ciclos-elementales-afectar-la-direccion-de-la-vida', img: 'how-can-element-cycles-affect-life-direction-1.webp', title: 'Ciclos Elementales Dirección de Vida', alt: 'Cómo los ciclos afectan el camino de la vida' }
];

tasks.forEach(task => {
  updateSitemap(task.module, task.slug, task.img, task.title, task.alt);
});

console.log("✅ 所有 Sitemap 已重新生成，且移除了所有重复和错误后缀！");