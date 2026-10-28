type AnalyticsWindow = Window & { gtag?: (...args: unknown[]) => void };
export function captureOrigin() {
  const params = new URLSearchParams(location.search);
  const origin = Object.fromEntries(
    ["source", "medium", "campaign"].map((key) => [
      key,
      (params.get(`utm_${key}`) || "").slice(0, 120),
    ]),
  );
  if (Object.values(origin).some(Boolean)) {
    try {
      sessionStorage.setItem("kmz:origin", JSON.stringify(origin));
    } catch {
      /* Contact still works without storage. */
    }
  }
}
export function contactOrigin() {
  captureOrigin();
  try {
    return JSON.parse(sessionStorage.getItem("kmz:origin") || "{}") as Record<
      string,
      string
    >;
  } catch {
    return {};
  }
}
export function track(event: string, detail: Record<string, string> = {}) {
  // No identifier means no analytics. Consent must be granted before GA loads.
  const id = import.meta.env.VITE_GA4_ID;
  if (!id || !/^G-[A-Z0-9]+$/.test(id)) return;
  try {
    if (localStorage.getItem("kmz:analytics") !== "granted") return;
  } catch {
    return;
  }
  (window as AnalyticsWindow).gtag?.("event", event, detail);
}
export function loadAnalytics() {
  const id = import.meta.env.VITE_GA4_ID;
  if (
    !id ||
    !/^G-[A-Z0-9]+$/.test(id) ||
    document.querySelector("#kmz-analytics")
  )
    return;
  const script = document.createElement("script");
  script.id = "kmz-analytics";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  const w = window as AnalyticsWindow & { dataLayer?: unknown[] };
  w.dataLayer = w.dataLayer || [];
  w.gtag = (...args) => w.dataLayer!.push(args);
  w.gtag("js", new Date());
  w.gtag("config", id, { send_page_view: true });
  document.head.append(script);
}
