"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { ArrowLeft, ArrowRight, ArrowClockwise, Check, X } from "@phosphor-icons/react";
import { unlock } from "@/lib/achievements";
import { SVM_ACCURACY } from "@/lib/projects";
import { dealRound, ROUND, type Label, type Review } from "@/lib/sentiment";

type Answer = { review: Review; guess: Label };
type Phase = "intro" | "play" | "done";

const word: Record<Label, string> = { neg: "negatif", pos: "positif" };
const THRESHOLD = 90;

export default function BeatTheModel() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [deck, setDeck] = useState<Review[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; x: number; dx: number } | null>(null);
  const busy = useRef(false);

  const index = answers.length;
  const current = deck[index];
  const last = answers[answers.length - 1];
  const yours = answers.filter((a) => a.guess === a.review.truth).length;
  const model = answers.filter((a) => a.review.model === a.review.truth).length;

  const start = () => {
    setDeck(dealRound());
    setAnswers([]);
    setPhase("play");
    requestAnimationFrame(() => areaRef.current?.focus());
  };

  const answer = (guess: Label) => {
    if (phase !== "play" || !current || busy.current) return;
    busy.current = true;
    const card = cardRef.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const commit = () => {
      busy.current = false;
      const next = [...answers, { review: current, guess }];
      setAnswers(next);
      if (next.length === ROUND) {
        setPhase("done");
        unlock("human");
        const score = (next.filter((a) => a.guess === a.review.truth).length / ROUND) * 100;
        if (score > SVM_ACCURACY) unlock("beat");
      }
    };
    if (!card || reduce) return commit();
    const dir = guess === "pos" ? 1 : -1;
    card.style.transition = "transform 0.32s cubic-bezier(0.5, 0, 0.75, 0), opacity 0.32s ease";
    card.style.transform = `translate3d(${dir * 140}%, 0, 0) rotate(${dir * 16}deg)`;
    card.style.opacity = "0";
    window.setTimeout(() => {
      card.style.transition = "none";
      card.style.transform = "";
      card.style.opacity = "";
      commit();
    }, 320);
  };

  const onKey = (e: KeyboardEvent) => {
    if (phase !== "play") return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      answer("neg");
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      answer("pos");
    }
  };

  // Drag the card sideways: past the threshold it counts as an answer.
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (busy.current) return;
    drag.current = { id: e.pointerId, x: e.clientX, dx: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.style.transition = "none";
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    d.dx = e.clientX - d.x;
    e.currentTarget.style.transform = `translate3d(${d.dx}px, 0, 0) rotate(${d.dx / 18}deg)`;
    e.currentTarget.dataset.lean = d.dx > 24 ? "pos" : d.dx < -24 ? "neg" : "";
  };
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const el = e.currentTarget;
    el.dataset.lean = "";
    if (Math.abs(d.dx) > THRESHOLD) return answer(d.dx > 0 ? "pos" : "neg");
    el.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
    el.style.transform = "";
  };

  return (
    <div
      ref={areaRef}
      tabIndex={-1}
      onKeyDown={onKey}
      className="flex h-full min-h-[460px] flex-col p-5 outline-none md:p-7"
      aria-label="Beat the Model game"
    >
      {phase === "intro" && (
        <div className="fade-in flex flex-1 flex-col justify-between gap-8">
          <div>
            <p className="t-label">Game</p>
            <h4 className="mt-3 text-[clamp(2rem,3.4vw,2.75rem)] font-bold leading-[0.95] tracking-[-0.03em]" style={{ fontStretch: "115%" }}>
              Beat the Model
            </h4>
            <p className="mt-4 max-w-[44ch] leading-relaxed text-muted">
              Twelve app reviews in Indonesian. Label each one negatif or positif. Our SVM scored {SVM_ACCURACY}% on 775
              real test reviews. Can you do better?
            </p>
            <p className="mt-3 max-w-[44ch] text-sm text-muted">
              The reviews here are written for the game in the style of the dataset.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button type="button" className="btn btn-primary" onClick={start}>
              Start
            </button>
            <p className="t-label">Drag the card, tap the buttons or use the arrow keys.</p>
          </div>
        </div>
      )}

      {phase === "play" && current && (
        <div className="flex flex-1 flex-col">
          <div className="flex items-center justify-between font-mono text-[0.75rem] text-muted">
            <span>
              {index + 1} / {ROUND}
            </span>
            <span className="flex gap-4">
              <span>
                You <b className="font-semibold text-ink">{yours}</b>
              </span>
              <span>
                SVM <b className="font-semibold text-ink">{model}</b>
              </span>
            </span>
          </div>

          <div className="relative mt-5 flex-1">
            {deck[index + 1] && (
              <div aria-hidden className="panel absolute inset-x-3 top-3 bottom-0 bg-sunken" />
            )}
            <div
              ref={cardRef}
              key={index}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              className="group panel absolute inset-0 flex cursor-grab touch-pan-y select-none flex-col justify-between bg-bg p-6 shadow-[0_24px_40px_-24px_rgb(var(--shadow)/0.5)] active:cursor-grabbing md:p-8"
            >
              <p className="t-label">{current.app}</p>
              <p lang="id" className="text-[clamp(1.2rem,1.9vw,1.6rem)] font-medium leading-snug tracking-[-0.01em]">
                &ldquo;{current.text}&rdquo;
              </p>
              <div className="flex justify-between font-mono text-[0.6875rem] text-muted">
                <span className="transition-colors group-data-[lean=neg]:text-ink">Negatif</span>
                <span className="transition-colors group-data-[lean=pos]:text-ink">Positif</span>
              </div>
            </div>
          </div>

          <div className="mt-5 min-h-12 text-sm" aria-live="polite">
            {last && (
              <p key={answers.length} className="fade-in flex gap-2">
                {last.guess === last.review.truth ? (
                  <Check size={18} weight="bold" className="mt-0.5 flex-none text-ok" aria-hidden />
                ) : (
                  <X size={18} weight="bold" className="mt-0.5 flex-none text-bad" aria-hidden />
                )}
                <span>
                  {last.guess === last.review.truth ? "Right" : "Wrong"}, it was {word[last.review.truth]}. The SVM said{" "}
                  {word[last.review.model]}
                  {last.review.why ? `. ${last.review.why}` : "."}
                </span>
              </p>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" className="btn btn-quiet" onClick={() => answer("neg")}>
              <ArrowLeft size={16} weight="bold" aria-hidden />
              Negatif
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => answer("pos")}>
              Positif
              <ArrowRight size={16} weight="bold" aria-hidden />
            </button>
          </div>
        </div>
      )}

      {phase === "done" && (
        <Result answers={answers} onAgain={start} />
      )}
    </div>
  );
}

function Result({ answers, onAgain }: { answers: Answer[]; onAgain: () => void }) {
  const yours = answers.filter((a) => a.guess === a.review.truth).length;
  const model = answers.filter((a) => a.review.model === a.review.truth).length;
  const pct = (yours / ROUND) * 100;
  const won = pct > SVM_ACCURACY;
  const missed = answers.filter((a) => a.guess !== a.review.truth);

  return (
    <div className="fade-in flex flex-1 flex-col">
      <p className="t-label">Result</p>
      <h4 className="mt-3 text-[clamp(1.75rem,3vw,2.5rem)] font-bold leading-none tracking-[-0.03em]" style={{ fontStretch: "115%" }}>
        {won ? "You beat the model." : "The model wins this one."}
      </h4>
      <dl className="mt-7 grid grid-cols-2 gap-6">
        <div>
          <dt className="t-label">You</dt>
          <dd className="mt-1 text-[clamp(2.5rem,4.5vw,3.5rem)] font-bold leading-none tracking-[-0.03em] text-accent-text">
            {pct.toFixed(1)}%
          </dd>
          <dd className="mt-1 text-sm text-muted">
            {yours} of {ROUND} right
          </dd>
        </div>
        <div>
          <dt className="t-label">SVM</dt>
          <dd className="mt-1 text-[clamp(2.5rem,4.5vw,3.5rem)] font-bold leading-none tracking-[-0.03em]">
            {SVM_ACCURACY}%
          </dd>
          <dd className="mt-1 text-sm text-muted">
            on the paper&apos;s test set, {model} of {ROUND} here
          </dd>
        </div>
      </dl>
      {missed.length > 0 && (
        <div className="mt-7">
          <p className="text-sm font-medium">You missed</p>
          <ul className="mt-2 flex flex-col gap-2 text-sm text-muted">
            {missed.slice(0, 2).map((a) => (
              <li key={a.review.text} lang="id">
                &ldquo;{a.review.text}&rdquo; was {word[a.review.truth]}.
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex-1" />
      <button type="button" className="btn btn-quiet mt-7 w-fit" onClick={onAgain}>
        <ArrowClockwise size={16} weight="bold" aria-hidden />
        Play again
      </button>
    </div>
  );
}
