/**
 * Mapeamento das categorias originais da FakeStoreAPI para nomes em Português.
 */
export const categoryTranslations: Record<string, string> = {
  "electronics": "Eletrônicos",
  "jewelery": "Joias",
  "men's clothing": "Moda Masculina",
  "women's clothing": "Moda Feminina"
};

/**
 * Traduz campos específicos (título, descrição e categoria) de um produto com base no seu ID.
 * Caso o ID do produto não possua uma tradução manual definida, mantém os dados originais.
 * @param product Objeto do produto retornado pela API.
 * @returns Objeto do produto com campos traduzidos para Português.
 */
export const translateProduct = (product: any) => {
  if (!product) return product;

  // Dicionário de traduções manuais para os produtos da FakeStoreAPI
  const translations: Record<number, any> = {
    1: {
      title: "Mochila Foldsack No. 1, p/ Laptop de 15 pol.",
      description: "Sua mochila perfeita para o uso diário e caminhadas na floresta. Protege seu laptop (até 15 polegadas) no compartimento acolchoado."
    },
    2: {
      title: "Camisa Masculina Premium Slim Fit",
      description: "Camisas casuais premium slim fit para homens, tecido leve e macio. Estilo moderno e confortável para qualquer ocasião."
    },
    3: {
      title: "Jaqueta de Algodão Masculina",
      description: "Ótima jaqueta de agasalho para a primavera/outono/outono, adequada para muitas ocasiões, como trabalho, caminhada, acampamento ou uso diário."
    },
    4: {
      title: "Camisa Masculina Casual Slim Fit",
      description: "O corte slim fit garante um visual moderno. Ideal para combinar com jeans ou calças sociais."
    },
    5: {
      title: "Pulseira de Corrente de Ouro Feminina",
      description: "Dos nossos lendários designs clássicos. Pulseira elegante banhada a ouro, perfeita para presentear ou usar em eventos especiais."
    },
    6: {
      title: "Pulseira Solid Gold Petite Micropave",
      description: "Pulseira de ouro sólido com pedras delicadas. Um toque de luxo para o seu dia a dia."
    },
    7: {
      title: "Anel de Noivado White Gold Plated",
      description: "Anel clássico banhado a ouro branco com pedra central brilhante. Elegância eterna."
    },
    8: {
      title: "Brincos Pierced Owl Rose Gold Plated",
      description: "Brincos delicados banhados a ouro rosa. Design moderno e sofisticado."
    },
    9: {
      title: "HD Externo WD 2TB Elements",
      description: "Armazenamento rápido e confiável com interface USB 3.0. Compatível com PC e Mac."
    },
    10: {
      title: "SSD SanDisk SSD PLUS 1TB Interno",
      description: "Acelere seu computador com velocidades de leitura/gravação rápidas. Durabilidade comprovada."
    },
    11: {
      title: "SSD Silicon Power 256GB A55",
      description: "Alta performance para o seu sistema. Tecnologia 3D NAND para maior confiabilidade."
    },
    12: {
      title: "HD Externo WD 4TB Gaming Drive",
      description: "Expanda o armazenamento do seu console PS4. Design portátil e alta capacidade."
    },
    13: {
      title: "Monitor Acer SB220Q bi 21.5 Polegadas",
      description: "Monitor Ultra-fino com tecnologia IPS e resolução Full HD. Imagens nítidas de qualquer ângulo."
    },
    14: {
      title: "Monitor Gaming Samsung 49\" Ultrawide",
      description: "Experiência imersiva definitiva com tela curva de 49 polegadas e taxa de atualização de 144Hz."
    },
    15: {
      title: "Jaqueta Feminina BIYLACLESEN Snowboard",
      description: "Jaqueta de inverno impermeável e à prova de vento. Ideal para esportes na neve e dias muito frios."
    },
    16: {
      title: "Jaqueta de Couro Feminina Removível com Capuz",
      description: "Estilo e versatilidade. Jaqueta de couro sintético com capuz removível para diferentes looks."
    },
    17: {
      title: "Capa de Chuva Feminina Windbreaker",
      description: "Capa de chuva leve e funcional. Perfeita para atividades ao ar livre e dias chuvosos."
    },
    18: {
      title: "Blusa Feminina MBJ Manga 3/4",
      description: "Blusa leve e confortável com decote em V. Design versátil para o dia a dia."
    },
    19: {
      title: "Camisa Feminina Opna Curta de Verão",
      description: "Tecido respirável e secagem rápida. Ideal para atividades esportivas ou passeios casuais."
    },
    20: {
      title: "Camisa Feminina DANVOUY Manga Curta",
      description: "Casual e moderna. Tecido macio que proporciona conforto durante todo o dia."
    }
  };

  const translation = translations[product.id];
  
  return {
    ...product,
    title: translation?.title || product.title,
    description: translation?.description || product.description,
    category: categoryTranslations[product.category] || product.category
  };
};
