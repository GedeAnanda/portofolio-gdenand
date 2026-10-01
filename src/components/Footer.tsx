import { ArrowUp } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="layer container-x">
      <div className="flex flex-col gap-4 border-t border-line py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.fullName}. Designed and built by {site.name}.
        </p>
        <a href="#top" className="inline-flex items-center gap-1.5 font-medium text-ink link-u w-fit">
          Back to top
          <ArrowUp size={14} weight="bold" aria-hidden />
        </a>
      </div>
    </footer>
  );
}
