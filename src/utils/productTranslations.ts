/**
 * Motor de Localização BeautyGlam (Otimizado)
 * Traduzimos apenas Títulos e Categorias para manter a fluidez e integridade técnica.
 */

const categoryMap: Record<string, string> = {
  "lipstick": "Batom",
  "eyeliner": "Delineador",
  "mascara": "Rímel",
  "foundation": "Base",
  "bronzer": "Bronzeador",
  "blush": "Blush",
  "concealer": "Corretivo",
  "powder": "Pó Compacto",
  "eyeshadow": "Sombra",
  "eyebrow": "Sobrancelha",
  "liquid": "Líquido",
  "matte": "Matte"
};

/**
 * Traduz apenas o essencial para a vitrine e preserva a descrição original da API.
 */
export const translateProduct = (product: any) => {
  if (!product) return product;

  // Tradução simples do título
  let translatedTitle = product.title;
  Object.entries(categoryMap).forEach(([eng, pt]) => {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    translatedTitle = translatedTitle.replace(regex, pt);
  });

  return {
    ...product,
    title: translatedTitle,
    description: product.description, // Mantido original conforme solicitado
    category: categoryMap[product.category?.toLowerCase()] || product.category || "Maquiagem"
  };
};
