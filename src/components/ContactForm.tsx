import { useEffect, useRef, useState } from "react";
import { services, site, whatsappUrl } from "@/data/site";
import { Arrow } from "./UI";
import { contactOrigin, track } from "@/lib/analytics";
export default function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const started = useRef(Date.now());
  const [initialService, setInitialService] = useState("");
  useEffect(() => {
    started.current = Date.now();
    const slug = new URLSearchParams(location.search).get("servico");
    setInitialService(services.find((s) => s.slug === slug)?.name || "");
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "loading") return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      phone: data.get("phone"),
      service: data.get("service"),
      message: data.get("message"),
      consent: data.get("consent") === "on",
      website: data.get("website"),
      startedAt: started.current,
      utm: contactOrigin(),
    };
    setState("loading");
    setFieldErrors({});
    setMessage("Enviando sua mensagem…");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000),
      });
      const result = await response
        .json()
        .catch(() => ({
          ok: false,
          message:
            "O serviço não confirmou o envio. Tente novamente ou fale pelo WhatsApp.",
        }));
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
        const field = Object.keys(result.fieldErrors)[0];
        form.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();
      }
      if (!response.ok || result.ok !== true)
        throw new Error(
          result.error || result.message || "O envio não foi concluído.",
        );
      setState("success");
      setMessage("Mensagem enviada. Obrigado por compartilhar sua ideia!");
      track("form_submit");
      form.reset();
    } catch (error) {
      setState("error");
      setMessage(
        error instanceof Error &&
          error.name !== "TimeoutError" &&
          error.name !== "TypeError" &&
          error.name !== "AbortError"
          ? error.message
          : "Não foi possível confirmar o envio agora. Seus dados continuam no formulário.",
      );
    }
  }
  return (
    <form
      className="contact-form"
      onSubmit={submit}
      aria-label="Solicitar orçamento"
    >
      <div className="form-grid">
        <label>
          Seu nome
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={120}
            placeholder="Como podemos chamar você?"
            aria-invalid={!!fieldErrors.name}
          />
        </label>
        <label>
          E-mail
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="voce@empresa.com.br"
            aria-invalid={!!fieldErrors.email}
          />
        </label>
        <label>
          WhatsApp <span className="optional">(opcional)</span>
          <input
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={30}
            pattern={String.raw`[+0-9\s\(\)\.\-]{8,30}`}
            placeholder="(34) 99999-9999"
            aria-invalid={!!fieldErrors.phone}
          />
        </label>
        <label>
          O que você tem em mente?
          <select
            name="service"
            required
            value={initialService}
            onChange={(e) => setInitialService(e.target.value)}
            aria-invalid={!!fieldErrors.service}
          >
            <option value="" disabled>
              Selecione o tipo de projeto
            </option>
            {services.map((s) => (
              <option key={s.slug}>{s.name}</option>
            ))}
            <option>Ainda não sei</option>
          </select>
        </label>
      </div>
      <label>
        Conte um pouco sobre a sua ideia
        <textarea
          name="message"
          required
          minLength={20}
          maxLength={5000}
          rows={5}
          placeholder="Seu negócio, o que precisa e o que gostaria de construir…"
          aria-invalid={!!fieldErrors.message}
        />
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Deixe este campo vazio
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <label className="checkbox-label">
        <input
          type="checkbox"
          name="consent"
          required
          aria-invalid={!!fieldErrors.consent}
        />
        <span>
          Concordo com o uso dos meus dados para responder a esta solicitação,
          conforme a <a href="/privacidade">política de privacidade</a>.
        </span>
      </label>
      <button className="button" type="submit" disabled={state === "loading"}>
        {state === "loading" ? "Enviando…" : "Enviar solicitação"}
        <Arrow diagonal />
      </button>
      <div className={`form-status ${state}`} role="status" aria-live="polite">
        {message}
        {Object.keys(fieldErrors).length > 0 && (
          <ul>
            {Object.entries(fieldErrors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        )}
      </div>
      {state === "error" && (
        <div className="form-alternatives">
          <a href={whatsappUrl()} target="_blank" rel="noopener noreferrer">
            Conversar no WhatsApp ↗
          </a>
          <a href={`mailto:${site.email}`}>Enviar por e-mail ↗</a>
        </div>
      )}
      <noscript>
        <p>
          Para enviar o formulário, ative JavaScript ou escreva para{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </noscript>
    </form>
  );
}
