export type Project = {
  slug: string;
  nome: string;
  categoria:
    "Site institucional" | "Landing page" | "E-commerce" | "Site + sistema";
  descricaoCurta: string;
  servicos: string[];
  mockup: string;
  urlExterna: string;
  emDestaque: boolean;
  tipoDeProjeto?: string;
  field: string;
  challenge: string;
  features: string[];
};
export const projects: Project[] = [
  {
    slug: "acquagyn",
    nome: "Acquagyn",
    categoria: "Site institucional",
    descricaoCurta: "Saúde e movimento, do primeiro olhar ao contato.",
    servicos: ["Web design", "Desenvolvimento"],
    mockup: "acquagyn",
    urlExterna: "https://www.acquagyn.com.br",
    emDestaque: true,
    field: "Natação & bem-estar",
    challenge:
      "Apresentar a escola e suas atividades em uma navegação que aproxima as pessoas da informação e do contato.",
    features: [
      "Apresentação das atividades e modalidades",
      "Conteúdo institucional",
      "Caminhos de contato",
    ],
  },
  {
    slug: "alcar-huma",
    nome: "Alçar Humà",
    categoria: "Site institucional",
    descricaoCurta: "Uma presença digital para quem desenvolve pessoas.",
    servicos: ["Web design", "Desenvolvimento"],
    mockup: "alcar-huma",
    urlExterna: "https://alcarhuma.com.br",
    emDestaque: true,
    field: "Desenvolvimento humano",
    challenge:
      "Organizar a apresentação da marca e de suas soluções para pessoas e empresas, com clareza e personalidade.",
    features: [
      "Apresentação da empresa",
      "Organização de soluções e serviços",
      "Contato e navegação responsiva",
    ],
  },
  {
    slug: "brasa",
    nome: "BRASA",
    categoria: "Landing page",
    descricaoCurta:
      "Personalidade em cada detalhe. Apetite por uma boa experiência.",
    servicos: ["Direção visual", "Desenvolvimento", "Motion design"],
    mockup: "brasa",
    urlExterna: "https://hamburgerlp.vercel.app",
    emDestaque: true,
    field: "Gastronomia",
    challenge:
      "Explorar a identidade de uma hamburgueria em uma página expressiva, conectando apresentação visual e navegação.",
    features: [
      "Apresentação de hambúrgueres",
      "Identidade visual marcante",
      "Animações de scroll",
    ],
  },
  {
    slug: "salon-2-beaute",
    nome: "Salon 2Beauté ADN",
    categoria: "Site + sistema",
    descricaoCurta: "Beleza, cuidado e agendamento em uma mesma experiência.",
    servicos: ["Web design", "Desenvolvimento", "Agendamento"],
    mockup: "salon-2-beaute",
    urlExterna: "https://salon2beauteadn.com.br",
    emDestaque: true,
    field: "Beleza & serviços",
    challenge:
      "Apresentar o salão e facilitar o caminho de quem procura informações sobre os serviços e deseja agendar.",
    features: [
      "Apresentação do salão e dos serviços",
      "Acesso ao agendamento online",
      "Experiência responsiva",
    ],
  },
  {
    slug: "bkm-tcg",
    nome: "BKM TCG",
    categoria: "E-commerce",
    descricaoCurta: "O universo Pokémon em uma experiência de descoberta.",
    servicos: ["Web design", "Desenvolvimento", "E-commerce"],
    mockup: "bkm-tcg",
    urlExterna: "https://lojabkm.com.br",
    emDestaque: true,
    tipoDeProjeto: "Projeto próprio",
    field: "Trading card games",
    challenge:
      "Construir uma vitrine digital com identidade própria para o universo dos cards, explorando a descoberta dos produtos.",
    features: [
      "Vitrine de produtos",
      "Experiência visual com booster em 3D",
      "Interface de catálogo e carrinho",
    ],
  },
  {
    slug: "odontologia-fl",
    nome: "Odontologia FL",
    categoria: "Site institucional",
    descricaoCurta: "Cuidado e confiança em uma apresentação acolhedora.",
    servicos: ["Web design", "Desenvolvimento"],
    mockup: "odontologia-fl",
    urlExterna: "https://www.odontologiafl.com.br",
    emDestaque: false,
    field: "Saúde & odontologia",
    challenge:
      "Apresentar o atendimento odontológico e facilitar a descoberta das informações e dos caminhos de contato.",
    features: [
      "Apresentação profissional",
      "Informações sobre tratamentos",
      "Contato acessível",
    ],
  },
  {
    slug: "leandro-kaminise",
    nome: "Leandro Kaminise",
    categoria: "Landing page",
    descricaoCurta: "Uma apresentação direta para uma solução de agendamentos.",
    servicos: ["Web design", "Desenvolvimento"],
    mockup: "leandro-kaminise",
    urlExterna: "https://curso-leandro.vercel.app",
    emDestaque: false,
    field: "Tecnologia & agendamento",
    challenge:
      "Apresentar uma solução de agendamento com uma mensagem clara e estrutura de página focada na oferta.",
    features: [
      "Apresentação da solução",
      "Estrutura de landing page",
      "Chamadas para ação",
    ],
  },
  {
    slug: "clube-das-zizas",
    nome: "Clube das Zizas",
    categoria: "Landing page",
    descricaoCurta: "Um espaço de conexão para o desenvolvimento feminino.",
    servicos: ["Web design", "Desenvolvimento"],
    mockup: "clube-das-zizas",
    urlExterna: "https://clube-zizas.vercel.app",
    emDestaque: false,
    field: "Comunidade & desenvolvimento",
    challenge:
      "Dar espaço à proposta de uma comunidade e organizar a apresentação do seu conteúdo.",
    features: [
      "Apresentação da comunidade",
      "Organização da proposta",
      "Design responsivo",
    ],
  },
  {
    slug: "saldanha-moveis",
    nome: "Saldanha Móveis",
    categoria: "Site institucional",
    descricaoCurta: "Design que valoriza cada detalhe dos espaços de beleza.",
    servicos: ["Web design", "Desenvolvimento"],
    mockup: "saldanha-moveis",
    urlExterna: "https://www.saldanhamoveis.com.br",
    emDestaque: false,
    field: "Mobiliário & beleza",
    challenge:
      "Apresentar o mobiliário com destaque visual e facilitar o conhecimento da marca e de suas peças.",
    features: [
      "Apresentação do mobiliário",
      "Conteúdo visual de produtos",
      "Caminhos de contato",
    ],
  },
  {
    slug: "ecos-da-alma",
    nome: "Ecos da Alma",
    categoria: "Landing page",
    descricaoCurta: "Uma experiência que dá espaço à mensagem.",
    servicos: ["Web design", "Desenvolvimento"],
    mockup: "ecos-da-alma",
    urlExterna: "https://ecosdaalma.app.br",
    emDestaque: false,
    field: "Conteúdo & leitura",
    challenge:
      "Organizar a apresentação do conteúdo em uma experiência de leitura e descoberta.",
    features: [
      "Apresentação do conteúdo",
      "Hierarquia de leitura",
      "Navegação responsiva",
    ],
  },
];
export const featuredProjects = projects.filter((p) => p.emDestaque);
export const projectBySlug = (slug: string) =>
  projects.find((p) => p.slug === slug);
