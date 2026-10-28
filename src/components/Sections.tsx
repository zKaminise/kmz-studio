import { faqs, processSteps, services } from "@/data/site";
import { Arrow, SectionHeading } from "./UI";
export function Services({ full = false }: { full?: boolean }) {
  return (
    <section className="services section light" id="servicos">
      <SectionHeading
        label="SOLUÇÕES DIGITAIS"
        text="Do primeiro contato à ferramenta que simplifica a rotina. Design e desenvolvimento na medida do seu negócio."
      >
        Cada negócio, um desafio.
        <br />
        <span className="muted">A solução é feita para você.</span>
      </SectionHeading>
      <div className="service-list">
        {services.map((s) => (
          <article className="service-row" key={s.slug} data-reveal>
            <span className="service-number">{s.number}</span>
            <div>
              <h3>{s.name}</h3>
              <p className="service-subtitle">{s.subtitle}</p>
            </div>
            <div>
              <p>{s.description}</p>
              {full && (
                <ul className="deliverables">
                  {s.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
            <a
              href={`/contato?servico=${s.slug}`}
              className="circle-link"
              aria-label={`Solicitar orçamento para ${s.name}`}
            >
              <Arrow diagonal />
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}
export function About({ full = false }: { full?: boolean }) {
  return (
    <section className="about section light">
      <div className="about-top">
        <p className="eyebrow">
          <span className="tiny-dot" />
          POR TRÁS DA KMZ
        </p>
        <span className="location">
          INDEPENDENTE NA ESSÊNCIA. PRÓXIMA EM CADA ETAPA.
        </span>
      </div>
      <div className="about-layout" data-reveal>
        <h2>
          Boas ideias merecem
          <br />
          um olhar atento.
          <span className="accent" aria-hidden="true">
            *
          </span>
        </h2>
        <div>
          <p className="large-copy">
            Design, tecnologia e uma conversa sem intermediários.
          </p>
          <p>
            A KMZ Studio é um estúdio digital de Uberlândia, fundado por Gabriel
            Misao. Cada projeto conecta direção visual e desenvolvimento para
            criar uma presença que faz sentido para o seu negócio.
          </p>
          <p>
            Você conversa diretamente com quem cuida do projeto. Do primeiro
            briefing à publicação, as escolhas são compartilhadas e o escopo é
            transparente.
          </p>
          {full ? (
            <p>
              Atendemos empresas de todo o Brasil de forma remota. Sites, lojas
              e sistemas são construídos com cuidado pela navegação, pelo
              conteúdo e pela experiência em diferentes telas. Manutenção e
              evolução podem ser contratadas conforme a necessidade.
            </p>
          ) : (
            <a className="text-link dark-link" href="/sobre">
              Conheça a KMZ Studio <Arrow diagonal />
            </a>
          )}
        </div>
      </div>
      <div className="principles" data-reveal>
        {[
          ["01", "Contato direto", "Você acompanha o projeto de perto."],
          [
            "02",
            "Feito para o seu negócio",
            "Decisões que partem da sua necessidade.",
          ],
          [
            "03",
            "Cuidado em cada tela",
            "Navegação clara, do desktop ao celular.",
          ],
        ].map(([n, t, d]) => (
          <div key={n}>
            <span>{n}</span>
            <h3>{t}</h3>
            <p>{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
export function Process() {
  return (
    <section className="process section light">
      <div className="process-intro" data-reveal>
        <p className="eyebrow">
          <span className="tiny-dot" />
          DA CONVERSA AO LANÇAMENTO
        </p>
        <h2>
          Clareza no caminho.
          <br />
          <span className="muted">Cuidado na entrega.</span>
        </h2>
        <p>
          Você traz a visão do seu negócio.
          <br />
          Nós conectamos estratégia, design e código.
        </p>
      </div>
      <ol className="process-steps">
        {processSteps.map((s, i) => (
          <li key={s.title} data-reveal>
            <span className="step-number">0{i + 1}</span>
            <div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
export function FAQ() {
  return (
    <section className="faq section light">
      <SectionHeading label="ANTES DA PRIMEIRA CONVERSA">
        Algumas respostas
        <br />
        <span className="muted">para começar.</span>
      </SectionHeading>
      <div className="faq-list">
        {faqs.map(([q, a], i) => (
          <details key={q}>
            <summary>
              <span className="faq-number">0{i + 1}</span>
              {q}
              <span className="faq-icon" aria-hidden="true" />
            </summary>
            <p>{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
