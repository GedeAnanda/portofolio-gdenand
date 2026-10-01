"use client";

import { useState, type FormEvent } from "react";

const suggestions = [
  "What are you building right now?",
  "Which backend stack do you prefer?",
  "What did you build with Swift?",
];

type State =
  | { status: "idle" }
  | { status: "loading"; question: string }
  | { status: "done"; question: string; answer: string }
  | { status: "error"; question: string; message: string };

export default function AskNanda() {
  const [question, setQuestion] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });
  const loading = state.status === "loading";

  const ask = async (raw: string) => {
    const text = raw.trim();
    if (!text || loading) return;
    setState({ status: "loading", question: text });
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) throw new Error(data.error ?? "No answer came back.");
      setState({ status: "done", question: text, answer: data.reply });
      setQuestion("");
    } catch (err) {
      const message = err instanceof Error && err.message ? err.message : "Something went wrong.";
      setState({ status: "error", question: text, message });
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    ask(question);
  };

  return (
    <div className="mt-24 grid grid-cols-1 gap-8 border-t border-line pt-12 md:mt-32 lg:grid-cols-12">
      <div className="lg:col-span-4">
        <h3 className="text-2xl font-semibold tracking-[-0.02em]">Ask a quick question</h3>
        <p className="mt-3 max-w-[40ch] text-[0.9375rem] text-muted">
          An AI model answers from the facts on this page. It can get things wrong, so email me for anything that
          matters.
        </p>
      </div>

      <div className="lg:col-span-8">
        <form onSubmit={onSubmit} className="flex flex-col gap-2">
          <label htmlFor="ask" className="text-sm font-medium">
            Your question
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="ask"
              name="question"
              className="field"
              value={question}
              maxLength={400}
              autoComplete="off"
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="For example: what does Olahin do?"
            />
            <button type="submit" className="btn btn-primary shrink-0" disabled={loading || !question.trim()}>
              {loading ? "Thinking" : "Ask"}
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button key={s} type="button" className="chip" disabled={loading} onClick={() => ask(s)}>
              {s}
            </button>
          ))}
        </div>

        <div className="mt-8 min-h-24" aria-live="polite">
          {state.status === "loading" && (
            <div className="flex flex-col gap-2" aria-label="Waiting for the answer">
              <p className="t-label">{state.question}</p>
              <div className="h-4 w-4/5 animate-pulse rounded-full bg-ink/10" />
              <div className="h-4 w-3/5 animate-pulse rounded-full bg-ink/10" />
            </div>
          )}
          {state.status === "done" && (
            <div>
              <p className="t-label">{state.question}</p>
              <p className="mt-2 max-w-[62ch] text-lg leading-relaxed">{state.answer}</p>
            </div>
          )}
          {state.status === "error" && (
            <div>
              <p className="t-label">{state.question}</p>
              <p className="mt-2 text-accent-text">{state.message} Try again, or email me instead.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
