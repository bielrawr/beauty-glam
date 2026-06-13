import { Product } from '../types';

const fallbackDescription = 'Produto selecionado pela BeautyGlam para compor uma rotina de maquiagem prática, elegante e com acabamento profissional.';

const categoryDescriptions: Record<string, string> = {
  batom: 'Batom com cor marcante, textura confortável e acabamento pensado para valorizar os lábios no dia a dia ou em produções especiais.',
  lipstick: 'Batom com cor marcante, textura confortável e acabamento pensado para valorizar os lábios no dia a dia ou em produções especiais.',
  delineador: 'Delineador de aplicação precisa para criar traços finos, gráficos ou intensos, com acabamento definido e visual sofisticado.',
  eyeliner: 'Delineador de aplicação precisa para criar traços finos, gráficos ou intensos, com acabamento definido e visual sofisticado.',
  rímel: 'Máscara para cílios desenvolvida para destacar o olhar, ajudando a entregar volume, definição e curvatura com aplicação simples.',
  rimel: 'Máscara para cílios desenvolvida para destacar o olhar, ajudando a entregar volume, definição e curvatura com aplicação simples.',
  mascara: 'Máscara para cílios desenvolvida para destacar o olhar, ajudando a entregar volume, definição e curvatura com aplicação simples.',
  base: 'Base para uniformizar o tom da pele com acabamento natural e cobertura confortável, ideal para construir uma maquiagem polida.',
  foundation: 'Base para uniformizar o tom da pele com acabamento natural e cobertura confortável, ideal para construir uma maquiagem polida.',
  corretivo: 'Corretivo para suavizar olheiras, manchas e pequenas imperfeições, criando uma pele mais uniforme sem pesar no acabamento.',
  concealer: 'Corretivo para suavizar olheiras, manchas e pequenas imperfeições, criando uma pele mais uniforme sem pesar no acabamento.',
  blush: 'Blush para devolver cor e frescor ao rosto, criando um efeito saudável e delicado com acabamento fácil de esfumar.',
  bronzeador: 'Bronzeador para aquecer a pele e realçar os contornos do rosto com um toque luminoso e natural.',
  bronzer: 'Bronzeador para aquecer a pele e realçar os contornos do rosto com um toque luminoso e natural.',
  'pó compacto': 'Pó compacto para selar a maquiagem, reduzir brilho excessivo e deixar a pele com aparência mais uniforme ao longo do dia.',
  powder: 'Pó compacto para selar a maquiagem, reduzir brilho excessivo e deixar a pele com aparência mais uniforme ao longo do dia.',
  sombra: 'Sombra para criar profundidade, luminosidade e expressão nos olhos, com acabamento versátil para looks suaves ou intensos.',
  eyeshadow: 'Sombra para criar profundidade, luminosidade e expressão nos olhos, com acabamento versátil para looks suaves ou intensos.',
  sobrancelha: 'Produto para preencher, definir e valorizar as sobrancelhas, ajudando a enquadrar o olhar com naturalidade.',
  eyebrow: 'Produto para preencher, definir e valorizar as sobrancelhas, ajudando a enquadrar o olhar com naturalidade.',
};

const lineDescriptions: Array<{ keywords: string[]; description: string }> = [
  {
    keywords: ['fit me'],
    description: 'Linha Fit Me com acabamento leve e adaptável, pensada para realçar a pele com aparência natural, textura confortável e resultado equilibrado.',
  },
  {
    keywords: ['superstay', 'super stay'],
    description: 'Linha SuperStay desenvolvida para quem busca maior duração, cor intensa e acabamento resistente para acompanhar a rotina por mais tempo.',
  },
  {
    keywords: ['color sensational'],
    description: 'Color Sensational entrega pigmentação marcante e sensação confortável, ideal para destacar os lábios com cor elegante e acabamento moderno.',
  },
  {
    keywords: ['lash sensational'],
    description: 'Lash Sensational valoriza os cílios com efeito leque, separação e definição, criando um olhar mais expressivo desde as primeiras camadas.',
  },
  {
    keywords: ['colossal'],
    description: 'The Colossal foi pensado para cílios com impacto, trazendo volume visível e presença ao olhar sem perder praticidade na aplicação.',
  },
  {
    keywords: ['great lash'],
    description: 'Great Lash é uma máscara clássica para destacar os cílios com definição e acabamento versátil para o uso diário.',
  },
  {
    keywords: ['baby lips'],
    description: 'Baby Lips combina cuidado e cor suave para hidratar os lábios e deixar um acabamento delicado, confortável e fácil de reaplicar.',
  },
  {
    keywords: ['instant age rewind'],
    description: 'Instant Age Rewind ajuda a suavizar a aparência de olheiras e sinais de cansaço, iluminando a região dos olhos com cobertura confortável.',
  },
  {
    keywords: ['dream'],
    description: 'Linha Dream oferece acabamento macio e sensação leve na pele, ideal para construir uma maquiagem uniforme com toque confortável.',
  },
  {
    keywords: ['master precise', 'master graphic', 'master drama', 'eyestudio'],
    description: 'Linha de olhos Maybelline criada para precisão, intensidade e definição, permitindo construir desde traços delicados até looks mais dramáticos.',
  },
  {
    keywords: ['brow'],
    description: 'Produto para sobrancelhas que ajuda a preencher falhas, definir o formato e criar um acabamento natural para enquadrar melhor o olhar.',
  },
];

const normalizeText = (value: string): string => (
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
);

export const getLocalProductDescription = (product: Product): string => {
  const normalizedTitle = normalizeText(product.title);
  const normalizedCategory = normalizeText(product.category || '');
  const lineMatch = lineDescriptions.find(({ keywords }) => (
    keywords.some((keyword) => normalizedTitle.includes(normalizeText(keyword)))
  ));
  const categoryMatch = Object.entries(categoryDescriptions).find(([category]) => (
    normalizeText(category) === normalizedCategory
  ));

  if (lineMatch) return lineMatch.description;

  return categoryMatch?.[1] || fallbackDescription;
};
