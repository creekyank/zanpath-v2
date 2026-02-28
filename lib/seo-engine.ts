import { Article } from "./article-loader";

export function buildMetadata(article: Article) {
  const url = `https://zanpath.com/${article.locale}/wisdom/${article.module}/${article.slug}`;

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: url,
      languages: {
        en: url.replace(`/${article.locale}/`, `/en/`),
        es: url.replace(`/${article.locale}/`, `/es/`),
      },
    },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      images: article.image ? [article.image] : [],
    },
  };
}
