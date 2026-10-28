import { useEffect } from "react";
import { featuredProjects, projects, projectBySlug } from "@/data/projects";
import { site, whatsappUrl } from "@/data/site";
import {
  Header,
  Footer,
  Button,
  Arrow,
  ContactCTA,
  AnalyticsConsent,
} from "@/components/UI";
import { Portfolio, ProjectCard, ProjectImage } from "@/components/Projects";
import { images } from "@/data/images";
import { About, FAQ, Process, Services } from "@/components/Sections";
import ContactForm from "@/components/ContactForm";
import { Opening, ReplayOpening } from "@/components/Opening";
import {
  isMotionReduced,
  useMotionPreference,
} from "@/hooks/useMotionPreference";
import { captureOrigin, track } from "@/lib/analytics";

function Hero() {
  return (
    <section className="hero section" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow hero-enter">
          <span className="tiny-dot" />
          DESIGN · DESENVOLVIMENTO · SOLUÇÕES WEB
        </p>
        <h1 id="hero-title">
          <span className="hero-line">
            <span>Sites e sistemas</span>
          </span>
          <span className="hero-line">
            <span>que dão forma</span>
          </span>
          <span className="hero-line">
            <span>
              às suas <em>ideias.</em>
            </span>
          </span>
        </h1>
        <p className="hero-description hero-enter">
          Design e tecnologia para negócios que querem
          <br className="desktop-break" /> uma presença digital à altura do que
          fazem.
        </p>
        <div className="hero-buttons hero-enter">
          <Button href="#projetos">Conhecer projetos</Button>
          <a
            href="/contato"
            className="text-link"
            onClick={() => track("budget_click", { destination: "form" })}
          >
            Solicitar orçamento <Arrow diagonal />
          </a>
        </div>
      </div>
      <div className="hero-art" aria-label="Projetos reais da KMZ Studio">
        <div className="hero-art-stage">
          <a
            href="/projetos/alcar-huma"
            className="hero-art-back"
            aria-label="Explorar Alçar Humà"
          >
            <ProjectImage
              slug="alcar-huma"
              hero
              sizes="(max-width: 700px) 40vw, 24vw"
            />
          </a>
          <a
            href="/projetos/acquagyn"
            className="hero-art-front"
            aria-label="Explorar Acquagyn"
          >
            <ProjectImage
              slug="acquagyn"
              hero
              sizes="(max-width: 700px) 55vw, 29vw"
            />
          </a>
        </div>
        <div className="art-note">
          <span className="tiny-dot" />
          TRABALHOS REAIS. IDEIAS ÚNICAS.
        </div>
      </div>
      <div className="hero-bottom">
        <a href="#projetos" className="scroll-hint">
          <span aria-hidden="true">↓</span> Role para explorar
        </a>
        <p>
          ESTÚDIO DIGITAL INDEPENDENTE
          <br />
          UBERLÂNDIA, MG — BRASIL
        </p>
        <ReplayOpening />
      </div>
    </section>
  );
}
function Home() {
  return (
    <>
      <Opening />
      <Hero />
      <section className="selected section" id="projetos">
        <div className="works-intro" data-reveal>
          <div>
            <p className="eyebrow">
              <span className="tiny-dot" />
              UMA SELEÇÃO DO QUE FAZEMOS
            </p>
            <h2>
              Projetos{" "}
              <span className="muted">
                selecionados<span className="accent">.</span>
              </span>
            </h2>
          </div>
          <p>
            Cada negócio tem sua história.
            <br />
            Aqui, ela ganha uma experiência digital.
            <span className="small-note">PORTFÓLIO / 01 — 05</span>
          </p>
        </div>
        <div className="selected-grid">
          {featuredProjects.map((p, i) => (
            <ProjectCard project={p} index={i} key={p.slug} />
          ))}
        </div>
        <div className="more-work-heading">
          <p className="eyebrow">OUTRAS IDEIAS QUE GANHARAM FORMA</p>
          <a href="/projetos" className="text-link">
            Todos os projetos <Arrow diagonal />
          </a>
        </div>
        <div className="mini-projects">
          {projects
            .filter((p) => !p.emDestaque)
            .map((p, i) => (
              <a key={p.slug} href={`/projetos/${p.slug}`}>
                <ProjectImage slug={p.slug} sizes="90px" />
                <span className="mini-number">0{i + 6}</span>
                <span>
                  {p.nome}
                  <small>{p.categoria}</small>
                </span>
                <Arrow diagonal />
              </a>
            ))}
        </div>
      </section>
      <Services />
      <About />
      <Process />
      <FAQ />
      <ContactCTA />
    </>
  );
}
function ProjectsPage() {
  return (
    <>
      <section className="page-intro section">
        <p className="eyebrow">
          <span className="tiny-dot" />
          PORTFÓLIO KMZ STUDIO
        </p>
        <h1>
          Projetos reais.
          <br />
          <span className="muted">Experiências únicas.</span>
        </h1>
        <p>
          Marcas, ideias e negócios traduzidos em experiências digitais.
          <br />
          Explore os projetos e conheça cada trabalho de perto.
        </p>
      </section>
      <section className="portfolio section" aria-label="Portfólio completo">
        <Portfolio />
      </section>
      <ContactCTA />
    </>
  );
}
function CasePage({ slug }: { slug: string }) {
  const project = projectBySlug(slug)!;
  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];
  const prev = projects[(index + projects.length - 1) % projects.length];
  const gallery = images[slug]?.gallery || [];
  return (
    <>
      <section className="case-intro section">
        <a className="back-link" href="/projetos">
          ← Todos os projetos
        </a>
        <div className="case-heading">
          <div>
            <p className="eyebrow">
              <span className="tiny-dot" />
              {project.field.toUpperCase()}
            </p>
            <h1>
              {project.nome}
              <span className="accent">.</span>
            </h1>
            <p>{project.descricaoCurta}</p>
          </div>
          <div className="case-meta">
            <span>{project.categoria}</span>
            <span>{project.servicos.join(" / ")}</span>
            {project.tipoDeProjeto && <span>{project.tipoDeProjeto}</span>}
            <a
              className="text-link"
              href={project.urlExterna}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => track("project_external_click", { project: slug })}
            >
              Visitar site <Arrow diagonal />
            </a>
          </div>
        </div>
      </section>
      <div
        className={`case-visual section ${slug === "bkm-tcg" ? "wide-visual" : ""}`}
      >
        <ProjectImage slug={slug} hero sizes="(max-width: 700px) 92vw, 70vw" />
      </div>
      <section className="case-story section light">
        <div>
          <p className="eyebrow">CONTEXTO & DIREÇÃO</p>
          <h2>
            Uma ideia.
            <br />
            Uma experiência
            <br />
            <span className="muted">com identidade.</span>
          </h2>
        </div>
        <div>
          <h3>O ponto de partida</h3>
          <p>{project.challenge}</p>
          <h3>O que foi desenvolvido</h3>
          <ul>
            {project.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          {slug === "bkm-tcg" && (
            <p className="case-note">
              Projeto próprio de portfólio. A seleção de produtos está em
              preparação; esta apresentação não indica estoque disponível ou
              operação comercial validada.
            </p>
          )}
        </div>
      </section>
      {gallery.length > 0 && (
        <section
          className="case-gallery section light"
          aria-label={`Galeria real de ${project.nome}`}
        >
          <p className="eyebrow">UM OLHAR MAIS PRÓXIMO</p>
          {gallery.map((g, i) => (
            <figure key={g.src}>
              <img
                src={g.src}
                srcSet={g.srcSet}
                sizes="(max-width:700px) 92vw, 85vw"
                width={g.width}
                height={g.height}
                alt={
                  g.alt ||
                  `Captura real do projeto ${project.nome}, imagem ${i + 1}`
                }
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <span>
                  0{i + 1} / {project.nome}
                </span>
                <span>{g.alt || "Captura real do projeto"}</span>
              </figcaption>
            </figure>
          ))}
        </section>
      )}
      <nav className="case-navigation section" aria-label="Mais projetos">
        <a href={`/projetos/${prev.slug}`}>
          <span>← PROJETO ANTERIOR</span>
          <strong>{prev.nome}</strong>
        </a>
        <a href={`/projetos/${next.slug}`}>
          <span>PRÓXIMO PROJETO →</span>
          <strong>{next.nome}</strong>
        </a>
      </nav>
      <ContactCTA compact />
    </>
  );
}
function ContactPage() {
  return (
    <section className="contact-page section">
      <div className="contact-heading">
        <p className="eyebrow">
          <span className="tiny-dot" />
          VAMOS CONVERSAR
        </p>
        <h1>
          O próximo passo
          <br />
          da sua ideia
          <br />
          <span className="accent">começa aqui.</span>
        </h1>
        <p>
          Conte um pouco sobre o seu negócio e o que você quer construir. Vamos
          conversar sobre possibilidades, escopo e próximos passos.
        </p>
        <div className="contact-channels">
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("budget_click", { destination: "whatsapp" })}
          >
            <span>WHATSAPP</span>
            <strong>
              Fale diretamente com a KMZ <Arrow diagonal />
            </strong>
          </a>
          <a href={`mailto:${site.email}`}>
            <span>E-MAIL</span>
            <strong>
              {site.email} <Arrow diagonal />
            </strong>
          </a>
          <div>
            <span>DE UBERLÂNDIA PARA O BRASIL</span>
            <p>Atendimento remoto, contato próximo.</p>
          </div>
        </div>
      </div>
      <div className="form-panel">
        <p className="eyebrow">SEU PROJETO, EM POUCAS PALAVRAS</p>
        <ContactForm />
      </div>
    </section>
  );
}
function Privacy() {
  return (
    <article className="legal section light">
      <p className="eyebrow">TRANSPARÊNCIA</p>
      <h1>
        Política de
        <br />
        privacidade.
      </h1>
      <p>Atualizada em 27 de outubro de 2026.</p>
      <h2>Quem cuida dos seus dados</h2>
      <p>
        A KMZ Studio, sob responsabilidade de Gabriel Misao, utiliza os dados
        deste site para responder às solicitações de contato. Para dúvidas ou
        para exercer seus direitos, escreva para{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>.
      </p>
      <h2>Informações que você compartilha</h2>
      <p>
        O formulário solicita nome, e-mail, telefone opcional, tipo de projeto e
        uma mensagem. Esses dados são usados, com o seu consentimento, para
        responder à solicitação e conversar sobre uma proposta. Se você retirar
        seu consentimento, isso não afeta tratamentos anteriores realizados de
        forma legítima. Caso o contato evolua para uma contratação, os dados
        necessários poderão ser tratados para procedimentos contratuais e
        obrigações legais.
      </p>
      <h2>Envio e armazenamento</h2>
      <p>
        O site é preparado para hospedagem na Vercel. Quando o serviço de envio
        está configurado, a mensagem é encaminhada via Resend para a caixa de
        e-mail da KMZ. Esses prestadores podem processar dados em outros países
        conforme suas políticas e mecanismos legais aplicáveis. Mensagens não
        são vendidas ou utilizadas para disparos publicitários sem uma
        autorização específica.
      </p>
      <h2>Segurança e prazo de conservação</h2>
      <p>
        São usados HTTPS, validação e proteção básica contra envios
        automatizados. Informações técnicas, como endereço IP, podem ser
        processadas temporariamente para segurança e limitação de tentativas. As
        mensagens são mantidas enquanto necessárias para responder e acompanhar
        o contato, com revisão para exclusão quando essa finalidade terminar,
        ressalvadas obrigações legais.
      </p>
      <h2>Cookies e medição</h2>
      <p>
        A preferência de movimento fica salva localmente no seu navegador. O
        site não ativa analytics de terceiros por padrão. Quando um
        identificador GA4 é configurado, a medição só é carregada após aceitar o
        aviso de consentimento. Você pode recusar sem perder acesso ao conteúdo.
        A configuração padrão desta entrega não contém identificador de
        analytics.
      </p>
      <p>
        Quando presentes na URL, parâmetros de origem de campanha podem
        acompanhar o formulário. Eles são usados para entender a origem daquele
        contato. Não incluímos conteúdo da mensagem ou dados de contato em
        eventos de analytics.
      </p>
      <button
        type="button"
        className="text-link dark-link"
        onClick={() => {
          try {
            localStorage.removeItem("kmz:analytics");
          } catch {
            /* No persistent choice exists. */
          }
          location.reload();
        }}
      >
        Rever minha escolha de analytics <Arrow />
      </button>
      <h2>Seus direitos</h2>
      <p>
        Você pode solicitar confirmação de tratamento, acesso, correção,
        exclusão quando aplicável e revogação do consentimento. Para isso, entre
        em contato pelo e-mail acima. Podemos pedir informações proporcionais
        para verificar sua identidade.
      </p>
      <h2>Links externos</h2>
      <p>
        Os sites dos projetos, o Instagram e o WhatsApp têm políticas próprias.
        Ao abrir esses serviços, o tratamento de dados passa a seguir as
        condições de cada plataforma.
      </p>
    </article>
  );
}
function NotFound() {
  return (
    <section className="not-found section">
      <p className="eyebrow">404 / PÁGINA NÃO ENCONTRADA</p>
      <h1>
        Vamos encontrar
        <br />
        um novo caminho<span className="accent">.</span>
      </h1>
      <Button href="/">Voltar ao início</Button>
      <a className="text-link" href="/projetos">
        Explorar projetos <Arrow />
      </a>
    </section>
  );
}

export default function App({
  path = typeof window === "undefined" ? "/" : window.location.pathname,
}: {
  path?: string;
}) {
  path = path.replace(/\/$/, "") || "/";
  const slug = path.match(/^\/projetos\/([^/]+)$/)?.[1];
  const project = slug ? projectBySlug(slug) : undefined;
  const reduced = useMotionPreference();
  useEffect(captureOrigin, []);
  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
    if (reduced) {
      if (isMotionReduced())
        document.documentElement.dataset.intro = "disabled";
      return;
    }
    let dispose: (() => void) | undefined;
    let cancelled = false;
    import("@/lib/animate")
      .then(({ animate }) => {
        if (!cancelled) dispose = animate();
      })
      .catch(() => {
        document.documentElement.dataset.intro = "disabled";
      });
    return () => {
      cancelled = true;
      dispose?.();
    };
  }, [reduced, path]);
  useEffect(() => {
    if (project) track("case_view", { project: project.slug });
  }, [project]);
  let content;
  if (path === "/") content = <Home />;
  else if (path === "/projetos") content = <ProjectsPage />;
  else if (project) content = <CasePage slug={project.slug} />;
  else if (path === "/servicos")
    content = (
      <>
        <section className="page-intro section">
          <p className="eyebrow">
            <span className="tiny-dot" />O QUE CONSTRUÍMOS
          </p>
          <h1>
            Seu negócio tem
            <br />
            um próximo passo<span className="accent">.</span>
          </h1>
          <p>Sites, lojas e sistemas desenhados para o que você precisa.</p>
        </section>
        <Services full />
        <Process />
        <FAQ />
        <ContactCTA />
      </>
    );
  else if (path === "/sobre")
    content = (
      <>
        <section className="page-intro section">
          <p className="eyebrow">
            <span className="tiny-dot" />
            KMZ STUDIO / ESTÚDIO DIGITAL
          </p>
          <h1>
            Um olhar criativo.
            <br />
            Uma construção
            <br />
            <span className="accent">muito próxima.</span>
          </h1>
          <p>Direção visual e desenvolvimento, conectados desde o início.</p>
        </section>
        <About full />
        <Process />
        <ContactCTA />
      </>
    );
  else if (path === "/contato") content = <ContactPage />;
  else if (path === "/privacidade") content = <Privacy />;
  else content = <NotFound />;
  return (
    <>
      <a className="skip-link" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Header path={path} />
      <main id="conteudo">{content}</main>
      <Footer />
      <AnalyticsConsent />
    </>
  );
}
