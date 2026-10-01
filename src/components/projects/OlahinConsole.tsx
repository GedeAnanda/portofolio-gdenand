"use client";

import { Fragment, useMemo, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import { Key, PaperPlaneTilt, X } from "@phosphor-icons/react";
import { unlock } from "@/lib/achievements";
import {
  DEMO_LOGIN,
  endpoints,
  fridgeItems,
  handle,
  requestLine,
  type ApiResponse,
} from "@/lib/olahin";
import erd from "../../../public/work/olahin/erd.webp";

const statusText: Record<number, string> = { 200: "OK", 201: "Created", 400: "Bad Request", 401: "Unauthorized", 404: "Not Found" };

const JSON_TOKEN = /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g;

function highlight(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(JSON_TOKEN)) {
    const at = m.index ?? 0;
    if (at > last) out.push(<span key={i++} className="p">{text.slice(last, at)}</span>);
    const token = m[0];
    const cls = token.startsWith('"') ? (m[2] ? "k" : "s") : "n";
    out.push(
      <span key={i++} className={cls}>
        {token}
      </span>,
    );
    last = at + token.length;
  }
  if (last < text.length) out.push(<span key={i++} className="p">{text.slice(last)}</span>);
  return out;
}

const groups = Array.from(new Set(endpoints.map((e) => e.group)));

type Result = { response: ApiResponse; ms: number; text: string; endpoint: string };

export default function OlahinConsole() {
  const [view, setView] = useState<"console" | "schema">("console");
  const [endpoint, setEndpoint] = useState("search");
  const [fridge, setFridge] = useState<string[]>(["telur", "nasi"]);
  const [body, setBody] = useState(() => JSON.stringify(DEMO_LOGIN, null, 2));
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const timer = useRef(0);

  const ep = endpoints.find((e) => e.id === endpoint)!;
  const line = requestLine({ endpoint, ingredients: fridge, body, token });

  const send = () => {
    if (loading) return;
    setLoading(true);
    const ms = 70 + Math.round(Math.random() * 190);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const response = handle({ endpoint, ingredients: fridge, body, token });
      const text = JSON.stringify(response.body, null, 2);
      setResult({ response, ms, text, endpoint });
      setLoading(false);

      const data = (response.body as { data?: unknown }).data;
      if (endpoint === "login" && response.status === 200) {
        setToken((data as { token: string }).token);
      }
      if (endpoint === "search" && Array.isArray(data) && data.length > 0) unlock("fridge");
      if (ep.auth && response.status < 300) unlock("token");
    }, ms);
  };

  const toggleItem = (item: string) =>
    setFridge((f) => (f.includes(item) ? f.filter((x) => x !== item) : [...f, item]));

  const highlighted = useMemo(() => (result ? highlight(result.text) : null), [result]);
  const recipes =
    result?.endpoint === "search" && Array.isArray((result.response.body as { data?: unknown }).data)
      ? ((result.response.body as { data: { id: string; title: string; budgetIdr: number; cookTimeMin: number }[] }).data)
      : null;

  return (
    <div
      className="panel overflow-hidden"
      onKeyDown={(e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
          e.preventDefault();
          send();
        }
      }}
    >
      {/* Window bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-edge px-4 py-3 md:px-5"
        style={{ background: "color-mix(in oklab, var(--pop-orange) 24%, var(--raised))" }}
      >
        <div className="flex items-center gap-1" role="tablist" aria-label="Olahin API views">
          {(["console", "schema"] as const).map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              className="chip min-h-8 py-1 text-[0.8125rem]"
              onClick={() => setView(v)}
            >
              {v === "console" ? "API console" : "Database schema"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 font-mono text-[0.6875rem] text-muted">
          <Key size={14} weight={token ? "fill" : "regular"} className={token ? "text-ok" : ""} aria-hidden />
          {token ? (
            <>
              <span>Bearer token set</span>
              <button
                type="button"
                className="grid size-6 place-items-center rounded-full hover:text-ink"
                onClick={() => setToken(null)}
                aria-label="Clear the token"
              >
                <X size={12} weight="bold" aria-hidden />
              </button>
            </>
          ) : (
            <span>No token</span>
          )}
        </div>
      </div>

      {view === "schema" ? (
        <figure className="fade-in p-4 md:p-6">
          <div className="overflow-x-auto rounded-2xl border-2 border-edge bg-white p-2" data-lenis-prevent>
            <Image
              src={erd}
              alt="Entity relationship diagram: users, recipes, ingredients, steps, bookmarks, challenges and challenge participants"
              sizes="(min-width: 1024px) 1100px, 900px"
              className="h-auto w-full min-w-[640px]"
            />
          </div>
          <figcaption className="t-label mt-3">
            Seven of the eleven Prisma models. Pantry items, budgets, transactions and notifications also hang off users.
          </figcaption>
        </figure>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-[220px_1fr]">
          {/* Endpoints */}
          <nav aria-label="Endpoints" className="border-b-2 border-edge md:border-b-0 md:border-r-2">
            <ul className="flex gap-1 overflow-x-auto p-3 md:flex-col md:gap-0 md:p-3" data-lenis-prevent>
              {groups.map((g) => (
                <Fragment key={g}>
                  <li className="t-label hidden px-2 pb-1 pt-3 first:pt-1 md:block">{g}</li>
                  {endpoints
                    .filter((e) => e.group === g)
                    .map((e) => (
                      <li key={e.id} className="flex-none">
                        <button
                          type="button"
                          onClick={() => setEndpoint(e.id)}
                          aria-pressed={endpoint === e.id}
                          className="flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-[0.8125rem] transition-colors hover:bg-ink/5 aria-pressed:bg-[color-mix(in_oklab,var(--pop-orange)_28%,transparent)] aria-pressed:font-semibold"
                        >
                          <span className="method" data-m={e.method}>
                            {e.method}
                          </span>
                          <span className="whitespace-nowrap">{e.name}</span>
                          {e.auth && <Key size={11} className="ml-auto flex-none text-muted" aria-label="needs a token" />}
                        </button>
                      </li>
                    ))}
                </Fragment>
              ))}
            </ul>
          </nav>

          {/* Request and response */}
          <div className="min-w-0 p-4 md:p-6">
            {endpoint === "search" && (
              <div className="mb-5">
                <p className="text-sm font-medium">What&apos;s in your fridge?</p>
                <div className="mt-3 flex flex-wrap gap-2" style={{ ["--chip-on" as string]: "var(--pop-orange)" }}>
                  {fridgeItems.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="chip min-h-8 py-1 text-[0.8125rem]"
                      aria-pressed={fridge.includes(item)}
                      onClick={() => toggleItem(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-2xl border-2 border-edge bg-sunken px-4 py-2.5">
                <span className="method" data-m={line.method}>
                  {line.method}
                </span>
                <code className="min-w-0 break-all font-mono text-[0.75rem]">{line.path}</code>
              </div>
              <button type="button" className="btn btn-primary btn-sm h-12 flex-none" onClick={send} disabled={loading}>
                <PaperPlaneTilt size={16} weight="fill" aria-hidden />
                {loading ? "Sending" : "Send"}
              </button>
            </div>

            {ep.auth && (
              <p className="mt-3 truncate font-mono text-[0.6875rem] text-muted">
                {token ? `Authorization: Bearer ${token.slice(0, 36)}...` : "No Authorization header. Log in first, or send it anyway."}
              </p>
            )}

            {endpoint === "login" && (
              <div className="mt-4 flex flex-col gap-2">
                <label htmlFor="olahin-body" className="text-sm font-medium">
                  Body (JSON)
                </label>
                <textarea
                  id="olahin-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  spellCheck={false}
                  rows={4}
                  className="code w-full resize-none rounded-2xl border-2 border-edge bg-sunken p-4 text-ink outline-none focus-visible:border-pop-blue"
                />
                <p className="text-[0.8125rem] text-muted">Break the email or empty the password to see the Zod errors.</p>
              </div>
            )}

            {/* Response */}
            <div className="mt-6" aria-live="polite" aria-busy={loading}>
              {loading ? (
                <div className="flex flex-col gap-2.5" aria-label="Waiting for the response">
                  <div className="h-4 w-40 animate-pulse rounded-full bg-ink/10" />
                  <div className="h-3 w-4/5 animate-pulse rounded-full bg-ink/8" />
                  <div className="h-3 w-3/5 animate-pulse rounded-full bg-ink/8" />
                  <div className="h-3 w-2/3 animate-pulse rounded-full bg-ink/8" />
                </div>
              ) : result ? (
                <div className="fade-in">
                  <p className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.75rem]">
                    <span className={`font-semibold ${result.response.status < 300 ? "text-ok" : "text-bad"}`}>
                      {result.response.status} {statusText[result.response.status]}
                    </span>
                    <span className="text-muted">{result.ms} ms</span>
                    <span className="text-muted">{new Blob([result.text]).size.toLocaleString("en-US")} B</span>
                    {result.endpoint === "login" && result.response.status === 200 && (
                      <span className="text-muted">Token saved for the protected routes.</span>
                    )}
                  </p>
                  {recipes && recipes.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2" aria-label="Recipes found">
                      {recipes.map((r) => (
                        <li key={r.id} className="tag text-ink">
                          {r.title} / Rp{r.budgetIdr.toLocaleString("id-ID")} / {r.cookTimeMin} min
                        </li>
                      ))}
                    </ul>
                  )}
                  <pre
                    className="code mt-3 max-h-[360px] overflow-auto overscroll-contain rounded-2xl border-2 border-edge bg-sunken p-4"
                    data-lenis-prevent
                    tabIndex={0}
                    aria-label="Response body"
                  >
                    {highlighted}
                  </pre>
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-edge/40 p-5">
                  <p className="font-medium">Press Send to call the route.</p>
                  <p className="mt-1 text-sm text-muted">
                    Runs in your browser with sample data, using the same routes, status codes and messages as the
                    Express API.
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    Try a recipe search, then call getMe without a token, log in and call it again.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
