import { renderToString } from "react-dom/server";
import App from "./App";
import { projects, projectBySlug } from "./data/projects";
export const paths = [
  "/",
  "/projetos",
  "/servicos",
  "/sobre",
  "/contato",
  "/privacidade",
  ...projects.map((p) => `/projetos/${p.slug}`),
  "/404",
];
export const render = (path: string) => renderToString(<App path={path} />);
export function metadata(path: string) {
  const slug = path.match(/^\/projetos\/([^/]+)$/)?.[1];
  const project = slug ? projectBySlug(slug) : undefined;
  const pages: Record<string, [string, string]> = {
    "/": [
      "KMZ Studio — Criação de sites e sistemas em Uberlândia",
      "Sites profissionais, landing pages, lojas virtuais e sistemas web. Design e desenvolvimento com contato direto, de Uberlândia para todo o Brasil.",
    ],
    "/projetos": [
      "Projetos reais de sites e sistemas | KMZ Studio",
      "Conheça o portfólio da KMZ Studio: sites institucionais, landing pages, e-commerce e sistemas, com imagens reais e cases individuais.",
    ],
    "/servicos": [
      "Sites, lojas virtuais e sistemas web | KMZ Studio",
      "Landing pages, sites institucionais, lojas virtuais e sistemas personalizados. Conheça os serviços da KMZ Studio e solicite um orçamento.",
    ],
    "/sobre": [
      "Sobre o estúdio digital | KMZ Studio",
      "Conheça a KMZ Studio, estúdio digital fundado por Gabriel Misao em Uberlândia. Contato direto, design e desenvolvimento para empresas de todo o Brasil.",
    ],
    "/contato": [
      "Vamos conversar sobre seu projeto | KMZ Studio",
      "Solicite um orçamento para seu site, loja ou sistema. Fale diretamente com a KMZ Studio por formulário, WhatsApp ou e-mail.",
    ],
    "/privacidade": [
      "Política de privacidade | KMZ Studio",
      "Entenda como a KMZ Studio utiliza os dados de contato, preferências e informações de navegação neste site.",
    ],
  };
  const [title, description] = project
    ? [
        `${project.nome} — ${project.categoria} | KMZ Studio`,
        project.descricaoCurta,
      ]
    : pages[path] || [
        "Página não encontrada | KMZ Studio",
        "Explore os projetos e serviços da KMZ Studio.",
      ];
  return {
    title,
    description,
    canonical: `https://kmzstudio.com.br${path === "/" ? "" : path}`,
    notFound: !project && !pages[path],
  };
}
