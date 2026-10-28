import { useState } from "react";
import { projects, type Project } from "@/data/projects";
import { images } from "@/data/images";
import { Arrow } from "./UI";
export function ProjectImage({
  slug,
  hero = false,
  className = "",
  sizes,
}: {
  slug: string;
  hero?: boolean;
  className?: string;
  sizes?: string;
}) {
  const img = images[slug];
  if (!img)
    return (
      <div className="asset-pending">Imagens deste projeto em preparação.</div>
    );
  return (
    <img
      className={className}
      src={img.src}
      srcSet={img.srcSet}
      sizes={sizes || "(max-width: 700px) 92vw, 55vw"}
      width={img.width}
      height={img.height}
      alt={
        img.alt ||
        `Apresentação real do projeto ${projects.find((p) => p.slug === slug)?.nome || slug}`
      }
      loading={hero ? "eager" : "lazy"}
      fetchPriority={hero ? "high" : "auto"}
      decoding="async"
    />
  );
}
export function ProjectCard({
  project,
  index,
  compact = false,
}: {
  project: Project;
  index: number;
  compact?: boolean;
}) {
  return (
    <article
      className={`project-card project-${index + 1} ${compact ? "compact-card" : ""}`}
      data-reveal
    >
      <a
        className="project-image-link"
        href={`/projetos/${project.slug}`}
        aria-label={`Explorar case ${project.nome}`}
      >
        <ProjectImage
          slug={project.slug}
          sizes={compact ? "(max-width: 700px) 92vw, 30vw" : undefined}
        />
        <span className="project-hover">
          Explorar case <Arrow diagonal />
        </span>
      </a>
      <div className="project-info">
        <div>
          <p className="project-category">
            {project.categoria}{" "}
            {project.tipoDeProjeto ? `· ${project.tipoDeProjeto}` : ""}
          </p>
          <h3>
            <a href={`/projetos/${project.slug}`}>{project.nome}</a>
          </h3>
          <p className="project-description">{project.descricaoCurta}</p>
          <p className="project-services">{project.servicos.join(" / ")}</p>
        </div>
        <a
          className="circle-link"
          href={`/projetos/${project.slug}`}
          aria-label={`Ver projeto ${project.nome}`}
        >
          <Arrow diagonal />
        </a>
      </div>
    </article>
  );
}
const filters = [
  "Todos",
  "Site institucional",
  "Landing page",
  "E-commerce",
  "Site + sistema",
];
export function Portfolio() {
  const [filter, setFilter] = useState("Todos");
  const filtered = projects.filter(
    (p) => filter === "Todos" || p.categoria === filter,
  );
  return (
    <>
      <div
        className="project-filters"
        role="group"
        aria-label="Filtrar projetos por categoria"
      >
        {filters.map((f) => (
          <button
            type="button"
            key={f}
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
          >
            {f === "Todos" ? "Todos os projetos" : f}
            <span>
              {f === "Todos"
                ? projects.length
                : projects.filter((p) => p.categoria === f).length}
            </span>
          </button>
        ))}
      </div>
      <p className="sr-only" role="status">
        {filtered.length} projetos exibidos
      </p>
      <div className="portfolio-grid">
        {filtered.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} />
        ))}
      </div>
    </>
  );
}
