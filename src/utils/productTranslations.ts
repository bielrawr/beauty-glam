/**
 * Motor de Localização BeautyGlam
 * Mantemos as descrições originais para preservar a integridade técnica.
 */

const categoryMap: Record<string, string> = {
  "lipstick": "Batom",
  "eyeliner": "Delineador",
  "mascara": "Rímel",
  "foundation": "Base",
  "bronzer": "Bronzeador",
  "blush": "Blush",
  "concealer": "Corretivo",
  "powder": "Pó",
  "eyeshadow": "Sombra",
  "eyebrow": "Sobrancelha"
};

/**
 * Traduz apenas o essencial (título e categoria) e preserva a descrição original.
 */
export const translateProduct = (product: any) => {
  if (!product) return product;

  // Tradução simples do título para termos comuns, se necessário
  let translatedTitle = product.title;
  Object.entries(categoryMap).forEach(([eng, pt]) => {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    translatedTitle = translatedTitle.replace(regex, pt);
  });

  return {
    ...product,
    title: translatedTitle,
    description: product.description, // Voltando para a descrição original sem tradução
    category: categoryMap[product.category?.toLowerCase()] || product.category || "Maquiagem"
  };
};
