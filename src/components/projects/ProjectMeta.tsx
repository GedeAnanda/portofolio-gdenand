import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Project } from "@/lib/projects";

export function ProjectHeader({ project: p, className = "" }: { project: Project; className?: string }) {
  return (
    <header className={className}>
      <p className="t-label">
        {p.year} / {p.role}
      </p>
      <h3 className="t-title mt-4">{p.title}</h3>
      <p className="mt-3 text-lg text-muted">{p.summary}</p>
    </header>
  );
}

export function ProjectDescription({ project: p, className = "" }: { project: Project; className?: string }) {
  return <p className={`max-w-[58ch] leading-relaxed ${className}`}>{p.description}</p>;
}

export function ProjectImpact({ project: p, className = "" }: { project: Project; className?: string }) {
  return (
    <div className={className}>
      <p className="t-label">{p.team}</p>
      <p className="mt-2 max-w-[46ch] leading-relaxed text-muted">{p.impact}</p>
    </div>
  );
}

export function ProjectStack({ project: p, className = "" }: { project: Project; className?: string }) {
  return (
    <div className={className}>
      <ul className="flex flex-wrap gap-2" aria-label={`${p.title} is built with`}>
        {p.tech.map((t) => (
          <li key={t} className="tag">
            {t}
          </li>
        ))}
      </ul>
      {p.links.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
          {p.links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="link-u inline-flex items-center gap-1.5 font-semibold"
            >
              {link.label}
              <ArrowUpRight size={16} weight="bold" aria-hidden />
              <span className="sr-only">for {p.title} (opens in a new tab)</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
