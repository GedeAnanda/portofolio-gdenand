import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="container-x flex min-h-svh flex-col justify-center gap-8 py-24">
      <p className="t-label">404</p>
      <h1 className="t-section max-w-[14ch]">This page doesn&apos;t exist.</h1>
      <p className="t-lead">The link may be old, or the address has a typo.</p>
      <Link href="/" className="btn btn-primary w-fit">
        Back to the homepage
      </Link>
    </main>
  );
}
