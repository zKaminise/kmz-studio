import { useEffect, useState } from "react";
import { navigation, site, whatsappUrl } from "@/data/site";
import {
  toggleMotionReduction,
  useMotionPreference,
} from "@/hooks/useMotionPreference";
import { loadAnalytics, track } from "@/lib/analytics";
import type { ReactNode } from "react";

export function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      className="arrow"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={diagonal ? "M5 19 19 5M5 5h14v14" : "M4 12h15m-6-6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function Button({
  children,
  href = "/contato",
  secondary = false,
  className = "",
  external = false,
}: {
  children: ReactNode;
  href?: string;
  secondary?: boolean;
  className?: string;
  external?: boolean;
}) {
  return (
    <a
      className={`button ${secondary ? "button-secondary" : ""} ${className}`}
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={() => {
        if (href.includes("contato") || href.includes("wa.me"))
          track("budget_click", {
            destination: href.includes("wa.me") ? "whatsapp" : "form",
          });
      }}
    >
      {children}
      <Arrow diagonal />
    </a>
  );
}
export function Header({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        document.querySelector<HTMLButtonElement>(".menu-toggle")?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return (
    <header className="header">
      <a className="brand" href="/" aria-label="KMZ Studio — início">
        <img
          src="/images/brand/logo-horizontal.webp"
          width="215"
          height="34"
          alt="KMZ Studio"
          fetchPriority="high"
        />
      </a>
      <button
        className="menu-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="main-navigation"
        onClick={() => setOpen(!open)}
      >
        {open ? "Fechar" : "Menu"}
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      <nav
        id="main-navigation"
        className={open ? "nav open" : "nav"}
        aria-label="Principal"
      >
        {navigation.map((item) => (
          <a
            key={item.href}
            href={item.href}
            aria-current={
              path === item.href ||
              (item.href === "/projetos" && path.startsWith("/projetos/"))
                ? "page"
                : undefined
            }
          >
            {item.label}
          </a>
        ))}
        <Button className="header-cta">Solicitar orçamento</Button>
      </nav>
    </header>
  );
}
export function SectionHeading({
  label,
  children,
  text,
}: {
  label: string;
  children: ReactNode;
  text?: string;
}) {
  return (
    <div className="section-heading" data-reveal>
      <p className="eyebrow">
        <span className="tiny-dot" />
        {label}
      </p>
      <h2>{children}</h2>
      {text && <p className="heading-support">{text}</p>}
    </div>
  );
}
export function ContactCTA({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`contact-cta section ${compact ? "compact" : ""}`}>
      <div className="cta-top" data-reveal>
        <p className="eyebrow">
          <span className="tiny-dot" />
          VAMOS CONSTRUIR O PRÓXIMO?
        </p>
        <span className="location">UBERLÂNDIA, MG · PARA TODO O BRASIL</span>
      </div>
      <div className="cta-content" data-reveal>
        <h2>
          Seu próximo projeto
          <br />
          começa com uma
          <br />
          <span className="accent">boa conversa.</span>
        </h2>
        <div className="cta-aside">
          <p>
            Conte o que você tem em mente.
            <br />
            Vamos encontrar a melhor forma de tirar a ideia do papel.
          </p>
          <Button href={whatsappUrl()} external>
            Solicitar orçamento
          </Button>
          <a className="text-link" href="/contato">
            Prefiro preencher o formulário <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}
export function Footer() {
  const reduced = useMotionPreference();
  return (
    <footer className="footer section">
      <div className="footer-main">
        <a className="brand" href="/" aria-label="KMZ Studio — início">
          <img
            src="/images/brand/logo-horizontal.webp"
            width="215"
            height="34"
            alt="KMZ Studio"
            loading="lazy"
          />
        </a>
        <p>
          Design com intenção.
          <br />
          Tecnologia com propósito.
        </p>
        <a
          className="text-link"
          href={site.instagram}
          target="_blank"
          rel="noopener noreferrer"
        >
          Instagram <Arrow diagonal />
        </a>
      </div>
      <div className="footer-links">
        <a href={`mailto:${site.email}`}>{site.email}</a>
        <nav aria-label="Rodapé">
          {navigation.map((n) => (
            <a key={n.href} href={n.href}>
              {n.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} KMZ Studio</span>
        <span>Feito com cuidado, em cada detalhe.</span>
        <div>
          <button
            type="button"
            className="motion-toggle"
            onClick={toggleMotionReduction}
            aria-pressed={reduced}
          >
            {reduced ? "Movimento reduzido" : "Reduzir movimento"}{" "}
            <span aria-hidden="true">{reduced ? "○" : "◉"}</span>
          </button>
          <a href="/privacidade">Privacidade</a>
        </div>
      </div>
    </footer>
  );
}
export function AnalyticsConsent() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!/^G-[A-Z0-9]+$/.test(import.meta.env.VITE_GA4_ID || "")) return;
    try {
      const consent = localStorage.getItem("kmz:analytics");
      if (consent === "granted") loadAnalytics();
      setVisible(!consent);
    } catch {
      /* Analytics remains disabled. */
    }
  }, []);
  function choose(value: string) {
    try {
      localStorage.setItem("kmz:analytics", value);
    } catch {
      /* This visit only. */
    }
    setVisible(false);
    if (value === "granted") loadAnalytics();
  }
  if (!visible) return null;
  return (
    <aside className="consent-banner" aria-label="Preferências de privacidade">
      <p>
        Podemos usar analytics para entender a navegação?{" "}
        <a href="/privacidade">Saiba mais</a>.
      </p>
      <button onClick={() => choose("denied")}>Recusar</button>
      <button onClick={() => choose("granted")}>Aceitar</button>
    </aside>
  );
}
