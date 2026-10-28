import { hydrateRoot, createRoot } from "react-dom/client";
import App from "./App";
import "@fontsource-variable/manrope";
import "@fontsource-variable/space-grotesk";
import "./styles/site.css";
import "./styles/intro.css";
const root = document.getElementById("root")!;
if (root.hasChildNodes()) hydrateRoot(root, <App />);
else createRoot(root).render(<App />);
