import { ArrowUp } from "@phosphor-icons/react/dist/ssr";
import { site } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="layer border-t-2 border-edge">
      <div className="container-x flex flex-col gap-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.fullName}. Designed and built by {site.name}.
        </p>
        <a href="#top" className="link-u inline-flex w-fit items-center gap-1.5 font-semibold text-ink">
          Back to top
          <ArrowUp size={14} weight="bold" aria-hidden />
        </a>
      </div>
    </footer>
  );
}
