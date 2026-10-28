export const site = {
  name: "KMZ Studio",
  url: "https://kmzstudio.com.br",
  email: import.meta.env.VITE_CONTACT_EMAIL || "gabriel.misao08@gmail.com",
  whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER ?? "5534998275292",
  instagram: "https://www.instagram.com/kmzstudio_/",
};
export function whatsappUrl(service = "") {
  const message = `Olá! Conheci a KMZ Studio e gostaria de conversar sobre ${service || "um novo projeto"}.`;
  const number = site.whatsapp.replace(/\D/g, "");
  return number
    ? `https://wa.me/${number}?text=${encodeURIComponent(message)}`
    : "/contato";
}
export const navigation = [
  { href: "/projetos", label: "Projetos" },
  { href: "/servicos", label: "Serviços" },
  { href: "/sobre", label: "Sobre" },
  { href: "/contato", label: "Contato" },
];
export const services = [
  {
    slug: "landing-pages",
    name: "Landing pages",
    number: "01",
    subtitle: "Uma página. Um propósito.",
    description:
      "Para apresentar uma oferta, lançar um produto ou abrir uma conversa. Conteúdo direto, design com personalidade e um caminho claro até a ação.",
    deliverables: [
      "Estrutura de conteúdo",
      "Design responsivo",
      "Formulários e chamadas para ação",
    ],
  },
  {
    slug: "sites-institucionais",
    name: "Sites institucionais",
    number: "02",
    subtitle: "A sua marca, bem apresentada.",
    description:
      "Uma presença digital que organiza sua história, valoriza seus serviços e ajuda as pessoas a conhecerem o seu negócio.",
    deliverables: [
      "Páginas e navegação",
      "Apresentação dos serviços",
      "Estrutura técnica para buscas",
    ],
  },
  {
    slug: "lojas-virtuais",
    name: "Lojas virtuais",
    number: "03",
    subtitle: "Da descoberta à compra.",
    description:
      "Catálogo e navegação pensados para apresentar seus produtos com clareza. Carrinho, pagamentos e administração definidos conforme o escopo.",
    deliverables: [
      "Catálogo de produtos",
      "Jornada de compra",
      "Integrações conforme a proposta",
    ],
  },
  {
    slug: "sistemas-web",
    name: "Sistemas web",
    number: "04",
    subtitle: "O seu jeito de trabalhar, conectado.",
    description:
      "Ferramentas sob medida para agendamentos, painéis e processos. A tecnologia se adapta ao que o seu negócio precisa resolver.",
    deliverables: [
      "Mapeamento de processos",
      "Interfaces sob medida",
      "Funcionalidades e integrações",
    ],
  },
];
export const processSteps = [
  {
    title: "Conversa & briefing",
    text: "Entendemos seu negócio, o público e o que o projeto precisa resolver.",
  },
  {
    title: "Direção & estrutura",
    text: "Organizamos as prioridades, o conteúdo e o caminho de quem vai navegar.",
  },
  {
    title: "Design",
    text: "A ideia ganha forma. Você acompanha as telas e a direção visual.",
  },
  {
    title: "Desenvolvimento",
    text: "Transformamos o design em uma experiência responsiva, com as integrações combinadas.",
  },
  {
    title: "Revisão",
    text: "Refinamos os detalhes e verificamos a navegação em diferentes telas.",
  },
  {
    title: "Lançamento",
    text: "Publicação, configurações previstas e orientações para os próximos passos.",
  },
];
export const faqs = [
  [
    "Quanto custa um site?",
    "O investimento depende das páginas, do design e das funcionalidades. Depois de entender seu projeto, apresentamos uma proposta com entregas, valor e condições claras.",
  ],
  [
    "Qual é o prazo de um projeto?",
    "O prazo varia conforme o escopo e a disponibilidade do conteúdo. O cronograma é combinado antes do início, com etapas de apresentação, revisão e publicação.",
  ],
  [
    "Como funcionam domínio e hospedagem?",
    "Ajudamos na escolha e nas configurações previstas na proposta. Domínio, hospedagem e serviços de terceiros podem ter custos recorrentes, sempre informados.",
  ],
  [
    "Preciso contratar manutenção?",
    "Manutenção contínua é opcional e contratada à parte. Atualizações, novas funcionalidades e acompanhamento podem ser combinados de acordo com a sua necessidade.",
  ],
  [
    "Vocês desenvolvem sistemas de agendamento?",
    "Sim. O sistema é planejado conforme as regras do seu negócio. Agenda, serviços, acesso e integrações são definidos no briefing e detalhados na proposta.",
  ],
  [
    "Posso pedir ajustes durante o projeto?",
    "Sim. A proposta define os momentos de revisão e o que está incluído. Mudanças de escopo são conversadas e aprovadas antes de serem desenvolvidas.",
  ],
];
